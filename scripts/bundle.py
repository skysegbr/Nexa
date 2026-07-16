#!/usr/bin/env python3
"""Nexa production bundler — OPTIONAL deploy step, dev stays 100% no-build.

Bundles a Nexa app (an index.html + ES modules importing /dist/nexa*.js)
into a standalone folder: one JS file, one CSS file, a rewritten index.html
and the app's other assets. Nothing in dev changes — F5 + ESM + server.py
remain the workflow; this only shrinks the production payload (fewer
requests, no import waterfall, smaller bytes).

Engines (--engine auto|esbuild|python, default auto):
  esbuild  Standalone Go binary (NO Node/npm anywhere): real tree-shaking,
           scope hoisting and identifier mangling. Best output.
  python   Zero dependencies beyond this repo: module-level bundling (only
           modules reachable from the entry are included) + scripts/minify.py.
           Correct by construction, ~honest sizes, no mangling.
  auto     esbuild if a binary is found (PATH, $NEXA_ESBUILD, tools/bin/),
           else python.

The esbuild binary is built from source with the Go toolchain — never
downloaded from npm:
  python3 scripts/bundle.py --setup-esbuild     # go install → tools/bin/

Usage:
  python3 scripts/bundle.py examples/task-manager -o build/task-manager
  python3 scripts/bundle.py path/to/app -o out [--root REPO] [--engine X] [--smoke]

Notes / limits (python engine):
  - Top-level import/export statements only (standard Nexa style).
  - Live bindings and circular imports are not supported (cycles error out).
  - dynamic import("...") is left as-is and a warning is printed — the target
    is NOT bundled; keep lazy routes unbundled or use the esbuild engine
    with --splitting manually if you need chunked lazy loading.
"""

from __future__ import annotations

import argparse
import html.parser
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
REPO_ROOT = SCRIPTS.parent
sys.path.insert(0, str(SCRIPTS))
from minify import minify_css, minify_js, tokenize_js  # noqa: E402


def warn(msg: str) -> None:
    print(f"  ! {msg}", file=sys.stderr)


# ── HTML parsing ──────────────────────────────────────────────────────────────

class PageScan(html.parser.HTMLParser):
    """Collect <script type=module src> and <link rel=stylesheet href>."""

    def __init__(self):
        super().__init__()
        self.scripts: list[str] = []
        self.styles: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("type") == "module" and a.get("src"):
            self.scripts.append(a["src"])
        if tag == "link" and a.get("rel") == "stylesheet" and a.get("href"):
            self.styles.append(a["href"])


def is_external(spec: str) -> bool:
    return spec.startswith(("http://", "https://", "//", "data:"))


def resolve(spec: str, importer: Path, root: Path) -> Path | None:
    """Resolve an import specifier to a file, or None if external."""
    if is_external(spec):
        return None
    if spec.startswith("/"):
        return (root / spec.lstrip("/")).resolve()
    return (importer.parent / spec).resolve()


# ── JS module graph ───────────────────────────────────────────────────────────

# Top-level statement patterns (standard Nexa formatting: column 0).
IMPORT_RE = re.compile(
    r'^import\s+(?:(?P<clause>[^"\';]+?)\s+from\s+)?["\'](?P<spec>[^"\']+)["\'];?[ \t]*$',
    re.M | re.S)
EXPORT_FROM_RE = re.compile(
    r'^export\s+(?P<what>\*|\{[^}]*\})\s+from\s+["\'](?P<spec>[^"\']+)["\'];?[ \t]*$',
    re.M | re.S)
EXPORT_DECL_RE = re.compile(
    r'^export\s+(?P<kind>async\s+function|function|class|const|let|var)\s+(?P<name>\w+)',
    re.M)
EXPORT_NAMES_RE = re.compile(r'^export\s+\{(?P<names>[^}]*)\};?[ \t]*$', re.M | re.S)
EXPORT_DEFAULT_RE = re.compile(r'^export\s+default\s+', re.M)
DYNAMIC_IMPORT_RE = re.compile(r'\bimport\s*\(')


class Module:
    def __init__(self, path: Path, source: str):
        self.path = path
        self.source = source
        self.deps: list[Path] = []          # static deps, in appearance order
        self.external: list[str] = []       # external import statements, verbatim


def parse_graph(entry: Path, root: Path) -> dict[Path, Module]:
    """Walk static imports from `entry`; return {path: Module} (post-order)."""
    modules: dict[Path, Module] = {}
    visiting: set[Path] = set()

    def visit(path: Path, chain: list[Path]):
        if path in modules:
            return
        if path in visiting:
            cycle = " -> ".join(p.name for p in chain + [path])
            sys.exit(f"error: circular import not supported: {cycle}")
        if not path.exists():
            sys.exit(f"error: cannot resolve import: {path}")
        visiting.add(path)
        mod = Module(path, path.read_text(encoding="utf-8"))
        if DYNAMIC_IMPORT_RE.search(strip_comments(mod.source)):
            warn(f"{path.name}: dynamic import() found — its target is NOT bundled")
        for m in list(IMPORT_RE.finditer(mod.source)) + list(EXPORT_FROM_RE.finditer(mod.source)):
            dep = resolve(m.group("spec"), path, root)
            if dep is None:
                if m.re is IMPORT_RE:
                    mod.external.append(m.group(0).strip())
                else:
                    sys.exit(f"error: export-from an external URL is not supported ({path.name})")
                continue
            mod.deps.append(dep)
            visit(dep, chain + [path])
        visiting.discard(path)
        modules[path] = mod  # post-order: deps registered before dependents

    visit(entry, [])
    return modules


def strip_comments(src: str) -> str:
    return "".join(t for k, t in tokenize_js(src)
                   if k not in ("line_comment", "block_comment"))


# ── python engine: module-registry bundling ──────────────────────────────────

def split_clause(clause: str):
    """'Def, { a as b, c }' → (default_name, [(imported, local)], ns_name)."""
    default = ns = None
    named: list[tuple[str, str]] = []
    clause = clause.strip()
    m = re.match(r"\*\s+as\s+(\w+)$", clause)
    if m:
        return None, [], m.group(1)
    if "{" in clause:
        head, braces = clause.split("{", 1)
        head = head.strip().rstrip(",").strip()
        if head:
            default = head
        for item in braces.rstrip("} \t\n").split(","):
            item = item.strip()
            if not item:
                continue
            if " as " in item:
                imported, local = [s.strip() for s in item.split(" as ")]
            else:
                imported = local = item
            named.append((imported, local))
    elif clause:
        default = clause
    return default, named, ns


def transform_module(mod: Module, mod_var: dict[Path, str], root: Path) -> tuple[str, str]:
    """Return (body_js, exports_object_literal) for one module."""
    src = mod.source
    imports_prelude: list[str] = []
    exports: list[str] = []          # entries of the returned object literal
    star_sources: list[str] = []

    def import_repl(m):
        spec = m.group("spec")
        dep = resolve(spec, mod.path, root)
        if dep is None:
            return ""  # externals are hoisted to the bundle top separately
        var = mod_var[dep]
        clause = m.group("clause")
        if clause is None:
            return ""  # bare import — module already executed
        default, named, ns = split_clause(clause)
        if ns:
            imports_prelude.append(f"const {ns} = {var};")
        if default:
            imports_prelude.append(f"const {default} = {var}.default;")
        if named:
            pairs = ", ".join(i if i == l else f"{i}: {l}" for i, l in named)
            imports_prelude.append(f"const {{ {pairs} }} = {var};")
        return ""

    def export_from_repl(m):
        dep = resolve(m.group("spec"), mod.path, root)
        var = mod_var[dep]
        what = m.group("what")
        if what == "*":
            star_sources.append(var)
        else:
            for item in what.strip("{} \t\n").split(","):
                item = item.strip()
                if not item:
                    continue
                if " as " in item:
                    imported, exported = [s.strip() for s in item.split(" as ")]
                else:
                    imported = exported = item
                exports.append(f"{exported}: {var}.{imported}")
        return ""

    def export_names_repl(m):
        for item in m.group("names").split(","):
            item = item.strip()
            if not item:
                continue
            if " as " in item:
                local, exported = [s.strip() for s in item.split(" as ")]
            else:
                local = exported = item
            exports.append(f"{exported}: {local}" if exported != local else exported)
        return ""

    src = IMPORT_RE.sub(import_repl, src)
    src = EXPORT_FROM_RE.sub(export_from_repl, src)
    src = EXPORT_NAMES_RE.sub(export_names_repl, src)

    for m in EXPORT_DECL_RE.finditer(src):
        exports.append(m.group("name"))
    src = EXPORT_DECL_RE.sub(lambda m: f'{m.group("kind")} {m.group("name")}', src)

    if EXPORT_DEFAULT_RE.search(src):
        src = EXPORT_DEFAULT_RE.sub("const __default = ", src)
        exports.append("default: __default")

    leftover = re.search(r"^(?:import|export)\b", src, re.M)
    if leftover:
        line = src[leftover.start():src.find("\n", leftover.start())]
        sys.exit(f"error: unsupported import/export form in {mod.path.name}: {line!r}")

    body = "\n".join(imports_prelude) + "\n" + src
    parts = [f"...{v}" for v in star_sources] + exports
    return body, "{ " + ", ".join(parts) + " }"


def bundle_js_python(entry: Path, root: Path) -> str:
    modules = parse_graph(entry, root)
    order = list(modules)  # post-order: dependencies first
    mod_var = {p: f"__nexa_m{i}" for i, p in enumerate(order)}

    externals: list[str] = []
    chunks: list[str] = []
    for path in order:
        mod = modules[path]
        externals += [e for e in mod.external if e not in externals]
        body, exports_obj = transform_module(mod, mod_var, root)
        rel = path.relative_to(root) if path.is_relative_to(root) else path.name
        if path == entry:
            chunks.append(f"// ── entry: {rel} ──\n(() => {{\n{body}\n}})();")
        else:
            chunks.append(f"// ── module: {rel} ──\nconst {mod_var[path]} = (() => {{\n"
                          f"{body}\nreturn {exports_obj};\n}})();")
    header = ("/*! Bundled by Nexa scripts/bundle.py (python engine) — "
              "generated file, edit the source modules instead. */\n")
    return header + "\n".join(externals) + ("\n" if externals else "") + "\n".join(chunks) + "\n"


# ── esbuild engine ────────────────────────────────────────────────────────────

def find_esbuild() -> str | None:
    cand = [os.environ.get("NEXA_ESBUILD"), shutil.which("esbuild"),
            str(REPO_ROOT / "tools/bin/esbuild")]
    for c in cand:
        if c and Path(c).exists():
            return c
    return None


def setup_esbuild() -> int:
    go = shutil.which("go") or "/usr/local/go/bin/go"
    if not Path(go).exists():
        print("Go toolchain not found — install Go (golang.org) first.", file=sys.stderr)
        return 1
    dest = REPO_ROOT / "tools/bin"
    dest.mkdir(parents=True, exist_ok=True)
    print(f"building esbuild from source into {dest} ...")
    r = subprocess.run([go, "install", "github.com/evanw/esbuild/cmd/esbuild@latest"],
                       env={**os.environ, "GOBIN": str(dest)})
    if r.returncode == 0:
        v = subprocess.run([str(dest / "esbuild"), "--version"],
                           capture_output=True, text=True).stdout.strip()
        print(f"esbuild {v} ready at tools/bin/esbuild")
    return r.returncode


def bundle_js_esbuild(entry: Path, root: Path, esbuild: str, out_file: Path) -> None:
    """Materialize the graph in a shadow tree (rewriting '/x' specifiers to
    relative paths) and let esbuild tree-shake/bundle/minify it."""
    modules = parse_graph(entry, root)
    with tempfile.TemporaryDirectory(prefix="nexa-bundle-") as td:
        shadow = Path(td)

        def shadow_path(p: Path) -> Path:
            rel = p.relative_to(root) if p.is_relative_to(root) else Path("__ext__") / p.name
            return shadow / rel

        for path, mod in modules.items():
            src = mod.source

            def repl(m):
                spec = m.group("spec")
                dep = resolve(spec, path, root)
                if dep is None:
                    return m.group(0)
                rel = os.path.relpath(shadow_path(dep), shadow_path(path).parent)
                if not rel.startswith("."):
                    rel = "./" + rel
                return m.group(0).replace(f'"{spec}"', f'"{rel}"').replace(f"'{spec}'", f"'{rel}'")

            src = IMPORT_RE.sub(repl, src)
            src = EXPORT_FROM_RE.sub(repl, src)
            sp = shadow_path(path)
            sp.parent.mkdir(parents=True, exist_ok=True)
            sp.write_text(src, encoding="utf-8")

        r = subprocess.run(
            [esbuild, str(shadow_path(entry)), "--bundle", "--minify", "--format=esm",
             f"--outfile={out_file}", "--log-level=warning"])
        if r.returncode != 0:
            sys.exit("error: esbuild failed")


# ── CSS bundling ──────────────────────────────────────────────────────────────

CSS_IMPORT_RE = re.compile(r'@import\s+(?:url\()?["\']([^"\']+)["\']\)?\s*;')
CSS_URL_RE = re.compile(r'url\(\s*(["\']?)([^"\')]+)\1\s*\)')


def bundle_css(entries: list[Path], root: Path, out_dir: Path) -> str:
    """Inline local @import chains into one sheet. Files referenced through
    url(...) (fonts, images) are copied into out_dir/assets/ and the URLs
    rewritten, so the output folder stays standalone."""
    seen: set[Path] = set()
    copied: dict[Path, str] = {}

    def rewrite_url(m, css_path: Path) -> str:
        target = m.group(2)
        # skip externals, fragment-only refs and urls this pass already rewrote
        if is_external(target) or target.startswith(("#", "./assets/")):
            return m.group(0)
        mm = re.match(r"([^?#]*)([?#].*)?$", target)
        bare, sep = mm.group(1), mm.group(2) or ""
        src = resolve(bare, css_path, root)
        if src is None or not src.exists():
            warn(f"{css_path.name}: url({target}) does not resolve — left as-is")
            return m.group(0)
        if src not in copied:
            rel = f"assets/{src.name}"
            dest = out_dir / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            copied[src] = rel
        return f'url("./{copied[src]}{sep}")'

    def inline(path: Path) -> str:
        if path in seen:
            return ""
        seen.add(path)
        if not path.exists():
            sys.exit(f"error: cannot resolve CSS import: {path}")
        css = path.read_text(encoding="utf-8")
        css = CSS_IMPORT_RE.sub(
            lambda m: inline(resolve(m.group(1), path, root)) if not is_external(m.group(1))
            else m.group(0), css)
        return CSS_URL_RE.sub(lambda m: rewrite_url(m, path), css)

    out = "\n".join(inline(p) for p in entries)
    return minify_css(out)


ABS_ASSET_RE = re.compile(r'["\'](/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]{2,5})["\']')


def copy_absolute_assets(texts: list[str], root: Path, out_dir: Path,
                         skip: set[Path]) -> None:
    """Copy files referenced by absolute-path strings (e.g. src: "/assets/x.png")
    into the output, preserving the path — the standalone folder must serve them
    from its own root, exactly like the repo root did in dev."""
    for text in texts:
        for m in ABS_ASSET_RE.finditer(text):
            src = (root / m.group(1).lstrip("/")).resolve()
            if not src.is_file() or src in skip or src.suffix in (".js", ".css"):
                continue
            dest = out_dir / m.group(1).lstrip("/")
            if dest.exists():
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)


# ── driver ────────────────────────────────────────────────────────────────────

def rewrite_html(src: str, scripts: list[str], styles: list[str],
                 js_name: str, css_name: str) -> str:
    first_style = True
    for href in styles:
        tag_re = re.compile(r'[ \t]*<link[^>]*href=["\']' + re.escape(href) + r'["\'][^>]*>\n?')
        src = tag_re.sub(f'    <link rel="stylesheet" href="./{css_name}" />\n'
                         if first_style else "", src, count=1)
        first_style = False
    first_script = True
    for s in scripts:
        tag_re = re.compile(r'[ \t]*<script[^>]*src=["\']' + re.escape(s) + r'["\'][^>]*>\s*</script>\n?')
        src = tag_re.sub(f'    <script type="module" src="./{js_name}"></script>\n'
                         if first_script else "", src, count=1)
        first_script = False
    return src


def smoke_test(out_dir: Path) -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        warn("smoke test skipped: playwright not installed")
        return 0
    import http.server
    import threading
    from functools import partial
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(out_dir))
    handler.log_message = lambda *a: None
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]
    errors, requests = [], []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("response", lambda r: requests.append((r.url, r.status)))
            page.goto(f"http://127.0.0.1:{port}/", wait_until="load", timeout=30_000)
            page.wait_for_timeout(800)
            rendered = page.evaluate(
                "() => document.body && document.body.children.length > 0"
                " && document.body.innerText.trim().length > 0")
            browser.close()
    finally:
        server.shutdown()
    # An app's own API calls legitimately fail when served statically
    # (e.g. examples with a Python backend) — that's not a bundling defect.
    fetch_errors = [e for e in errors if "Failed to fetch" in e or "NetworkError" in e]
    hard_errors = [e for e in errors if e not in fetch_errors]
    broken = [u for u, s in requests
              if s >= 400 and not u.endswith("/favicon.ico") and "/api" not in u]
    if hard_errors or broken or not rendered:
        print(f"SMOKE FAILED: rendered={rendered} errors={hard_errors} broken={broken}",
              file=sys.stderr)
        return 1
    note = f" ({len(fetch_errors)} app fetch failure(s) ignored)" if fetch_errors else ""
    print(f"smoke ok: page rendered, {len(requests)} requests, no bundle errors{note}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("app", nargs="?", help="app directory containing index.html")
    ap.add_argument("-o", "--out", help="output directory (default: build/<app-name>)")
    ap.add_argument("--root", default=str(REPO_ROOT),
                    help="serve root that '/...' specifiers resolve against "
                         "(default: this repo)")
    ap.add_argument("--engine", choices=("auto", "esbuild", "python"), default="auto")
    ap.add_argument("--smoke", action="store_true",
                    help="after bundling, serve the output and load it headlessly")
    ap.add_argument("--setup-esbuild", action="store_true",
                    help="build the esbuild binary from source with Go and exit")
    args = ap.parse_args()

    if args.setup_esbuild:
        return setup_esbuild()
    if not args.app:
        ap.error("app directory required (or --setup-esbuild)")

    app_dir = Path(args.app).resolve()
    root = Path(args.root).resolve()
    index = app_dir / "index.html"
    if not index.exists():
        sys.exit(f"error: {index} not found")

    esbuild = find_esbuild() if args.engine in ("auto", "esbuild") else None
    if args.engine == "esbuild" and not esbuild:
        sys.exit("error: esbuild binary not found — run: "
                 "python3 scripts/bundle.py --setup-esbuild")
    engine = "esbuild" if esbuild else "python"

    out_dir = Path(args.out) if args.out else REPO_ROOT / "build" / app_dir.name
    out_dir.mkdir(parents=True, exist_ok=True)

    scan = PageScan()
    scan.feed(index.read_text(encoding="utf-8"))
    local_scripts = [s for s in scan.scripts if not is_external(s)]
    local_styles = [s for s in scan.styles if not is_external(s)]
    if len(local_scripts) != 1:
        sys.exit(f"error: expected exactly one local module script in index.html, "
                 f"found {len(local_scripts)}: {local_scripts}")
    entry = resolve(local_scripts[0], index, root)

    js_name, css_name = "app.bundle.js", "app.bundle.css"

    # JS
    if engine == "esbuild":
        bundle_js_esbuild(entry, root, esbuild, out_dir / js_name)
    else:
        bundled = bundle_js_python(entry, root)
        (out_dir / js_name).write_text(minify_js(bundled), encoding="utf-8")

    # CSS (single file, in link order — framework CSS first by convention)
    css_entries = [resolve(hrf, index, root) for hrf in local_styles]
    (out_dir / css_name).write_text(bundle_css(css_entries, root, out_dir), encoding="utf-8")

    # HTML + remaining assets
    (out_dir / "index.html").write_text(
        rewrite_html(index.read_text(encoding="utf-8"), local_scripts, local_styles,
                     js_name, css_name), encoding="utf-8")
    graph = parse_graph(entry, root)
    copy_absolute_assets(
        [index.read_text(encoding="utf-8")] + [m.source for m in graph.values()],
        root, out_dir, skip=set(graph))
    bundled_files = {entry} | set(graph) | set(css_entries)
    css_graph_extra = set()
    for c in css_entries:  # component CSS pulled via @import lives in app dir too
        for m in CSS_IMPORT_RE.finditer(c.read_text(encoding="utf-8")) if c.exists() else []:
            dep = resolve(m.group(1), c, root)
            if dep:
                css_graph_extra.add(dep)
    bundled_files |= css_graph_extra
    for item in app_dir.rglob("*"):
        if item.is_dir() or item.resolve() in bundled_files or item.name == "index.html":
            continue
        if item.suffix in (".js", ".css") and item.resolve() in bundled_files:
            continue
        dest = out_dir / item.relative_to(app_dir)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, dest)

    js_kb = (out_dir / js_name).stat().st_size / 1024
    css_kb = (out_dir / css_name).stat().st_size / 1024
    print(f"bundled {app_dir.name} [{engine}] → {out_dir}")
    print(f"  {js_name}   {js_kb:7.1f} KB")
    print(f"  {css_name}  {css_kb:7.1f} KB")

    if args.smoke:
        return smoke_test(out_dir)
    return 0


if __name__ == "__main__":
    sys.exit(main())
