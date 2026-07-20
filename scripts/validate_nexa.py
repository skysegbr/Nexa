#!/usr/bin/env python3
"""Static validation for Nexa examples and distributable files.

The project intentionally avoids Node and build tools, so this script uses only
Python's standard library. It validates the no-build surface: local imports,
HTML assets, and a small syntax sanity check for JavaScript files.

Extra checks added later:
- Required example directories must exist.
- Dist files referenced in README.md must exist.
- Example component files must not exceed a line-count threshold (monolith guard).
- Local markdown links in README.md (e.g. `](./examples/foo)`) must resolve.
- `src:`-keyed asset references inside .js source (e.g. `h("img", { src: "..." })`)
  must resolve, same as the existing HTML asset check.
- package.json's version must have a matching `## [x.y.z]` heading in CHANGELOG.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


IMPORT_RE = re.compile(
    r"""
    (?:
      \bimport\s*(?:\([^)]*?\)|(?:[^;]*?\s+from\s*)?["']([^"']+)["'])
      |
      \bexport\s+[^;]*?\s+from\s+["']([^"']+)["']
    )
    """,
    re.VERBOSE | re.DOTALL,
)

# Directories that must exist under examples/
REQUIRED_EXAMPLES: list[str] = [
    "basic",
    "core",
    "form",
    "intro",
    "complete-page",
]

# Warn when an example component file exceeds this many lines.
MONOLITH_LINE_LIMIT = 250

# Markdown inline-code fence pattern to find dist/ paths in README.
README_PATH_RE = re.compile(r"`(dist/[^`]+)`")

# Markdown link targets: `[text](target)`. Filtered to local paths afterward —
# this also matches external URLs and pure `#anchor` fragments, which
# is_local_ref() correctly excludes.
MARKDOWN_LINK_RE = re.compile(r"\]\(([^)\s]+)\)")

# `src: "..."` / `src: '...'` inside .js source — how h("img", { src }) and
# similar asset references look in Nexa's no-JSX call syntax. Deliberately
# narrow (string literals only) to avoid false positives on dynamic values.
JS_SRC_RE = re.compile(r"""\bsrc\s*:\s*["']([^"']+)["']""")

# `## [x.y.z]` release headings in CHANGELOG.md.
CHANGELOG_VERSION_RE = re.compile(r"^## \[(\d+\.\d+\.\d+)\]", re.MULTILINE)

# Per-category nexa-ui CSS (mirrors the JS component modules). An example that
# opts into the split must load base + every category it uses, or those
# components render unstyled — a silent failure the monolith never had.
CSS_CATEGORIES = ("core", "forms", "overlay", "data", "nav", "theme")
CSS_LOAD_ORDER = ("base",) + CSS_CATEGORIES
# Captures the category from a nexa-ui link href; the group is empty ("") for
# the monolith nexa-ui.css / nexa-ui.min.css.
NEXA_UI_LINK_RE = re.compile(r'href="/dist/nexa-ui(?:-([a-z]+))?(?:\.min)?\.css"')
NEXA_COMPONENT_IMPORT_RE = re.compile(
    r"import\s*(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*"
    r"['\"][^'\"]*nexa-components[^'\"]*['\"]",
    re.DOTALL,
)
CSS_CLASS_SELECTOR_RE = re.compile(r"\.(m-[A-Za-z0-9_-]+)")
JS_EXPORT_BLOCK_RE = re.compile(r"\bexport\s*\{([^}]*)\}")
JS_EXPORT_DECL_RE = re.compile(r"\bexport\s+(?:function|const|class)\s+([A-Za-z0-9_$]+)")
MCLASS_TOKEN_RE = re.compile(r"\bm-[A-Za-z0-9_-]+")


@dataclass(frozen=True)
class Issue:
    path: Path
    message: str


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)

        if tag == "script" and values.get("src"):
            self.refs.append(("src", values["src"] or ""))

        if tag == "link" and values.get("href"):
            self.refs.append(("href", values["href"] or ""))

        if tag in {"img", "source"} and values.get("src"):
            self.refs.append(("src", values["src"] or ""))


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Nexa static files.")
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Repository root. Defaults to the current directory.",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    issues: list[Issue] = []

    for js_file in find_files(root, "*.js"):
        issues.extend(validate_js_file(root, js_file))

    for html_file in find_files(root, "*.html"):
        issues.extend(validate_html_file(root, html_file))

    issues.extend(validate_required_examples(root))
    issues.extend(validate_readme_dist_files(root))
    issues.extend(validate_readme_local_links(root))
    issues.extend(validate_no_monoliths(root))
    issues.extend(validate_js_asset_srcs(root))
    issues.extend(validate_version_sync(root))
    issues.extend(validate_example_css_categories(root))

    if issues:
        print("Nexa static validation failed:\n")
        for issue in issues:
            print(f"- {issue.path.relative_to(root)}: {issue.message}")
        return 1

    print("Nexa static validation passed.")
    return 0


def find_files(root: Path, pattern: str) -> list[Path]:
    # "codemirror" holds vendored, minified third-party bundles. Their regex
    # literals (e.g. `/Trident\/(?:[7-9]|\d{2,})\../`) defeat the naive
    # bracket-balance lexer below, which has no notion of regex literals.
    ignored = {".git", ".agents", ".codex", "codemirror"}
    files: list[Path] = []

    for path in root.rglob(pattern):
        if any(part in ignored for part in path.parts):
            continue
        files.append(path)

    return sorted(files)


def validate_js_file(root: Path, path: Path) -> list[Issue]:
    source = path.read_text(encoding="utf-8")
    issues: list[Issue] = []

    for specifier in import_specifiers(source):
        if is_local_ref(specifier):
            resolved = resolve_ref(root, path.parent, specifier)

            if not resolved.exists():
                issues.append(Issue(path, f"missing local import {specifier!r}"))

    bracket_error = balanced_brackets_error(source)

    if bracket_error:
        issues.append(Issue(path, bracket_error))

    return issues


def validate_html_file(root: Path, path: Path) -> list[Issue]:
    parser = AssetParser()
    parser.feed(path.read_text(encoding="utf-8"))
    issues: list[Issue] = []

    for attr, value in parser.refs:
        if not is_local_ref(value):
            continue

        resolved = resolve_ref(root, path.parent, value)

        if not resolved.exists():
            issues.append(Issue(path, f"missing local {attr} {value!r}"))

    return issues


def validate_required_examples(root: Path) -> list[Issue]:
    """Check that every required example directory exists."""
    issues: list[Issue] = []
    examples_dir = root / "examples"

    for name in REQUIRED_EXAMPLES:
        target = examples_dir / name
        if not target.is_dir():
            issues.append(Issue(root, f"missing required example directory examples/{name}/"))

    return issues


def validate_readme_dist_files(root: Path) -> list[Issue]:
    """Check that dist/ paths mentioned in README.md actually exist."""
    issues: list[Issue] = []
    readme = root / "README.md"

    if not readme.exists():
        issues.append(Issue(root, "README.md not found"))
        return issues

    text = readme.read_text(encoding="utf-8")

    for match in README_PATH_RE.finditer(text):
        rel_path = match.group(1)
        target = root / rel_path

        if not target.exists():
            issues.append(Issue(readme, f"referenced file not found: {rel_path}"))

    return issues


def validate_readme_local_links(root: Path) -> list[Issue]:
    """Check that local markdown links in README.md (e.g. `](./examples/foo)`) resolve.

    Complements validate_readme_dist_files, which only looks at backtick-fenced
    `dist/...` mentions (prose, not necessarily a link). This instead walks
    every `[text](target)` link and resolves the ones that look local —
    external URLs and `#anchor` fragments are filtered out by is_local_ref.
    """
    issues: list[Issue] = []
    readme = root / "README.md"

    if not readme.exists():
        return issues

    text = readme.read_text(encoding="utf-8")

    for match in MARKDOWN_LINK_RE.finditer(text):
        target = match.group(1)

        if not is_local_ref(target):
            continue

        resolved = resolve_ref(root, readme.parent, target)

        if not resolved.exists():
            issues.append(Issue(readme, f"broken link target: {target!r}"))

    return issues


def validate_js_asset_srcs(root: Path) -> list[Issue]:
    """Check that `src: "..."` asset references inside .js files resolve.

    HTML's <img src> etc. are already covered by validate_html_file, but Nexa
    apps build markup via h("img", { src }) calls in plain JS, which the HTML
    parser never sees.
    """
    issues: list[Issue] = []

    for js_file in find_files(root, "*.js"):
        source = js_file.read_text(encoding="utf-8")

        for match in JS_SRC_RE.finditer(source):
            value = match.group(1)

            if not is_local_ref(value):
                continue

            resolved = resolve_ref(root, js_file.parent, value)

            if not resolved.exists():
                issues.append(Issue(js_file, f"missing local src {value!r}"))

    return issues


def validate_version_sync(root: Path) -> list[Issue]:
    """Check that package.json's version has a matching CHANGELOG.md heading.

    Doesn't require it to be the *top* heading — an "[Unreleased]" section
    documenting in-progress work above the last released version is normal.
    It only catches the version being bumped (or the changelog entry added)
    without the other half following along.
    """
    issues: list[Issue] = []
    package_json = root / "package.json"
    changelog = root / "CHANGELOG.md"

    if not package_json.exists() or not changelog.exists():
        return issues

    version = json.loads(package_json.read_text(encoding="utf-8")).get("version")

    if not version:
        return issues

    changelog_versions = CHANGELOG_VERSION_RE.findall(changelog.read_text(encoding="utf-8"))

    if version not in changelog_versions:
        issues.append(
            Issue(
                package_json,
                f"version {version!r} has no matching \"## [{version}]\" heading in CHANGELOG.md",
            )
        )

    return issues


def validate_no_monoliths(root: Path) -> list[Issue]:
    """Warn when an example component file exceeds MONOLITH_LINE_LIMIT lines."""
    issues: list[Issue] = []
    examples_dir = root / "examples"

    if not examples_dir.is_dir():
        return issues

    for js_file in sorted(examples_dir.rglob("*.js")):
        lines = js_file.read_text(encoding="utf-8").count("\n")

        if lines > MONOLITH_LINE_LIMIT:
            issues.append(
                Issue(
                    js_file,
                    f"component has {lines} lines (limit {MONOLITH_LINE_LIMIT}); "
                    "consider splitting it.",
                )
            )

    return issues


def _component_category_map(dist: Path) -> dict[str, str]:
    """component name -> its category module, read from the category JS exports."""
    mapping: dict[str, str] = {}
    for cat in CSS_CATEGORIES:
        path = dist / f"nexa-components-{cat}.js"
        if not path.is_file():
            continue
        src = path.read_text(encoding="utf-8")
        names: set[str] = set()
        for match in JS_EXPORT_BLOCK_RE.finditer(src):
            for part in match.group(1).split(","):
                name = part.strip().split(" as ")[-1].strip()
                if re.fullmatch(r"[A-Za-z0-9_$]+", name):
                    names.add(name)
        for match in JS_EXPORT_DECL_RE.finditer(src):
            names.add(match.group(1))
        for name in names:
            mapping.setdefault(name, cat)
    return mapping


def _class_category_map(dist: Path) -> dict[str, set[str]]:
    """m-* class -> the category CSS file(s) that define it."""
    mapping: dict[str, set[str]] = {}
    for cat in CSS_LOAD_ORDER:
        path = dist / f"nexa-ui-{cat}.css"
        if not path.is_file():
            continue
        for match in CSS_CLASS_SELECTOR_RE.finditer(path.read_text(encoding="utf-8")):
            mapping.setdefault(match.group(1), set()).add(cat)
    return mapping


def validate_example_css_categories(root: Path) -> list[Issue]:
    """An example that links the per-category nexa-ui CSS must load base plus
    every category it actually uses. A JS component renders its own m-* classes
    internally, so an imported component is the reliable signal; classes written
    directly in the example source are mapped too. A missing category renders
    those components unstyled with no error, so it is a hard failure. Examples on
    the monolith (nexa-ui.css) already contain everything and are skipped."""
    dist = root / "dist"
    examples_dir = root / "examples"
    if not (dist / "nexa-ui-base.css").is_file() or not examples_dir.is_dir():
        return []

    comp_cat = _component_category_map(dist)
    class_cat = _class_category_map(dist)
    issues: list[Issue] = []

    for index in sorted(examples_dir.glob("*/index.html")):
        linked = NEXA_UI_LINK_RE.findall(index.read_text(encoding="utf-8"))
        if not linked or any(token == "" for token in linked):
            continue  # no design-system CSS, or the (complete) monolith
        linked_set = {token for token in linked if token}

        source = "\n".join(
            f.read_text(encoding="utf-8", errors="ignore")
            for f in list(index.parent.rglob("*.js")) + list(index.parent.rglob("*.html"))
        )
        needed = {"base"}
        for match in NEXA_COMPONENT_IMPORT_RE.finditer(source):
            blob = (match.group(2) or "") + "," + (match.group(1) or "")
            for raw in blob.split(","):
                name = raw.strip().split(" as ")[0].strip()
                if name in comp_cat:
                    needed.add(comp_cat[name])
        for token in MCLASS_TOKEN_RE.findall(source):
            needed |= class_cat.get(token, set())
        if needed & set(CSS_CATEGORIES):
            needed.add("core")  # every component category builds on core

        missing = [c for c in CSS_LOAD_ORDER if c in needed and c not in linked_set]
        if missing:
            issues.append(
                Issue(
                    index,
                    "uses but does not load "
                    + ", ".join(f"nexa-ui-{c}.css" for c in missing)
                    + " (those components would render unstyled); add the link(s) "
                    "or switch to the nexa-ui.css monolith.",
                )
            )
    return issues


def import_specifiers(source: str) -> list[str]:
    specifiers: list[str] = []

    for match in IMPORT_RE.finditer(source):
        specifier = next((group for group in match.groups() if group), None)

        if specifier:
            specifiers.append(specifier)

    return specifiers


def is_local_ref(value: str) -> bool:
    parsed = urlparse(value)

    if parsed.scheme or parsed.netloc:
        return False

    return value.startswith(("/", "./", "../"))


def resolve_ref(root: Path, base: Path, value: str) -> Path:
    path = urlparse(value).path

    if path.startswith("/static/"):
        # FastAPI examples mount a `static/` directory at the `/static` URL
        # prefix, and the served index.html lives inside that same directory —
        # so root-relative refs like `/static/app.js` resolve there, not from
        # the repo root.
        static_dir = find_ancestor_dir(base, "static")
        if static_dir is not None:
            return static_dir / path[len("/static/"):]

    if path.startswith("/"):
        return root / path.lstrip("/")

    return (base / path).resolve()


def find_ancestor_dir(start: Path, name: str) -> Path | None:
    for candidate in (start, *start.parents):
        if candidate.name == name:
            return candidate

    return None
def balanced_brackets_error(source: str) -> str | None:
    stack: list[tuple[str, int, int]] = []
    pairs = {"(": ")", "[": "]", "{": "}"}
    closers = {value: key for key, value in pairs.items()}
    index = 0
    line = 1
    column = 0
    state = "code"

    while index < len(source):
        char = source[index]
        next_char = source[index + 1] if index + 1 < len(source) else ""

        if char == "\n":
            line += 1
            column = 0
        else:
            column += 1

        if state == "code":
            if char == "/" and next_char == "/":
                state = "line-comment"
                index += 2
                column += 1
                continue

            if char == "/" and next_char == "*":
                state = "block-comment"
                index += 2
                column += 1
                continue

            if char == '"':
                state = "double-string"
                index += 1
                continue

            if char == "'":
                state = "single-string"
                index += 1
                continue

            if char == "`":
                state = "template-string"
                index += 1
                continue

            if char in pairs:
                stack.append((char, line, column))
            elif char in closers:
                if not stack or stack[-1][0] != closers[char]:
                    return f"unexpected {char!r} at {line}:{column}"
                stack.pop()

        elif state == "line-comment":
            if char == "\n":
                state = "code"

        elif state == "block-comment":
            if char == "*" and next_char == "/":
                state = "code"
                index += 2
                column += 1
                continue

        elif state in {"double-string", "single-string", "template-string"}:
            quote = {"double-string": '"', "single-string": "'", "template-string": "`"}[
                state
            ]

            if char == "\\":
                index += 2
                column += 1
                continue

            if char == quote:
                state = "code"

        index += 1

    if state in {"double-string", "single-string", "template-string", "block-comment"}:
        return f"unterminated {state.replace('-', ' ')}"

    if stack:
        opener, opener_line, opener_column = stack[-1]
        return f"unclosed {opener!r} opened at {opener_line}:{opener_column}"

    return None


if __name__ == "__main__":
    sys.exit(main())
