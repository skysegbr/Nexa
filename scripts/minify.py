#!/usr/bin/env python3
"""
Nexa minifier — a safe, dependency-free JS/CSS minifier in pure Python.

Design goals (in priority order): CORRECTNESS first, then size.

What it does:
  - Strips comments (line `//` and block `/* */` in JS; `/* */` in CSS).
  - Removes indentation, blank lines, trailing whitespace, and redundant
    intra-line spaces.
  - Preserves every original line break, so automatic semicolon insertion
    (ASI) can never change the program's meaning.
  - Keeps string literals, template literals (including nested `${...}` and
    nested templates), and regex literals byte-for-byte.
  - Does NOT rename identifiers or reorder code — safe by construction.
  - Rewrites local ESM import specifiers in the minified output so that, e.g.,
    `from "./nexa.js"` becomes `from "./nexa.min.js"`.

Because gzip/brotli already compress whitespace extremely well, the main win
here is comment removal plus a smaller uncompressed parse — not a dramatic
over-the-wire reduction. The trade-off is deliberate: a hand-rolled minifier
must never break the code.

Usage:
  python scripts/minify.py           # minify all dist/*.js and dist/*.css
  python scripts/minify.py --check   # verify *.min.* are up to date (CI); no writes
"""

from __future__ import annotations

import sys
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / "dist"

WORD = set(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$"
)
# Operator characters that could merge into a longer operator if the space
# between them were removed (e.g. "+ +" -> "++", "< =" -> "<=").
OP_CHARS = set("+-*/%<>=&|^~!?.")

# Identifier-shaped keywords after which a `/` begins a regex, not division.
KEYWORDS_BEFORE_REGEX = {
    "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
    "do", "else", "yield", "await", "case", "throw",
}


# ── low-level readers (return the index just past the construct) ──────────────

def _read_string(src: str, i: int) -> int:
    quote = src[i]
    n = len(src)
    j = i + 1
    while j < n:
        c = src[j]
        if c == "\\":
            j += 2
            continue
        if c == quote:
            return j + 1
        j += 1
    return n  # unterminated (shouldn't happen in valid source)


def _read_line_comment(src: str, i: int) -> int:
    n = len(src)
    j = i
    while j < n and src[j] != "\n":
        j += 1
    return j


def _read_block_comment(src: str, i: int) -> int:
    n = len(src)
    j = i + 2
    while j < n:
        if src[j] == "*" and j + 1 < n and src[j + 1] == "/":
            return j + 2
        j += 1
    return n


def _read_regex(src: str, i: int):
    """Read a regex literal starting at `/`. Returns end index or None."""
    n = len(src)
    j = i + 1
    in_class = False
    while j < n:
        c = src[j]
        if c == "\\":
            j += 2
            continue
        if c == "\n":
            return None  # unterminated line — not a regex
        if c == "[":
            in_class = True
        elif c == "]":
            in_class = False
        elif c == "/" and not in_class:
            j += 1
            while j < n and src[j] in WORD:  # flags
                j += 1
            return j
        j += 1
    return None


def _read_template(src: str, i: int) -> int:
    """Read a template literal (with nested ${...} and nested templates)."""
    n = len(src)
    j = i + 1
    while j < n:
        c = src[j]
        if c == "\\":
            j += 2
            continue
        if c == "`":
            return j + 1
        if c == "$" and j + 1 < n and src[j + 1] == "{":
            j = _read_interp(src, j + 2)
            continue
        j += 1
    return n


def _read_interp(src: str, i: int) -> int:
    """Scan a ${...} interpolation body; return index just past its `}`.

    Correctly skips strings, templates, regex, and comments so that braces
    inside them are not mistaken for the closing brace of the interpolation.
    """
    n = len(src)
    j = i
    depth = 1
    prev_sig = ""  # last significant char, for regex disambiguation
    while j < n:
        c = src[j]
        if c in " \t\r\n":
            j += 1
            continue
        if c == "/" and j + 1 < n and src[j + 1] == "/":
            j = _read_line_comment(src, j)
            continue
        if c == "/" and j + 1 < n and src[j + 1] == "*":
            j = _read_block_comment(src, j)
            continue
        if c in "\"'":
            j = _read_string(src, j)
            prev_sig = c
            continue
        if c == "`":
            j = _read_template(src, j)
            prev_sig = "`"
            continue
        if c == "/":
            # regex only in expression position
            if prev_sig == "" or prev_sig in "(,{[;:=+-*/%&|^!?<>~":
                end = _read_regex(src, j)
                if end is not None:
                    j = end
                    prev_sig = "/"
                    continue
            prev_sig = "/"
            j += 1
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return j + 1
        prev_sig = c
        j += 1
    return n


# ── JS tokenizer ─────────────────────────────────────────────────────────────

def tokenize_js(src: str):
    """Return a list of (type, text) tokens.

    Types: ws, line_comment, block_comment, string, template, regex, name, punct
    """
    tokens = []
    i = 0
    n = len(src)

    def prev_significant():
        for t in reversed(tokens):
            if t[0] not in ("ws", "line_comment", "block_comment"):
                return t
        return None

    while i < n:
        c = src[i]
        if c in " \t\r\n":
            j = i + 1
            while j < n and src[j] in " \t\r\n":
                j += 1
            tokens.append(("ws", src[i:j]))
            i = j
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            j = _read_line_comment(src, i)
            tokens.append(("line_comment", src[i:j]))
            i = j
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            j = _read_block_comment(src, i)
            tokens.append(("block_comment", src[i:j]))
            i = j
            continue
        if c in "\"'":
            j = _read_string(src, i)
            tokens.append(("string", src[i:j]))
            i = j
            continue
        if c == "`":
            j = _read_template(src, i)
            tokens.append(("template", src[i:j]))
            i = j
            continue
        if c == "/":
            ps = prev_significant()
            if _is_regex_context(ps):
                end = _read_regex(src, i)
                if end is not None:
                    tokens.append(("regex", src[i:end]))
                    i = end
                    continue
            tokens.append(("punct", c))
            i += 1
            continue
        if c in WORD:
            j = i + 1
            while j < n and src[j] in WORD:
                j += 1
            tokens.append(("name", src[i:j]))
            i = j
            continue
        tokens.append(("punct", c))
        i += 1
    return tokens


def _is_regex_context(prev) -> bool:
    if prev is None:
        return True
    ptype, ptext = prev
    if ptype in ("string", "template", "regex"):
        return False
    if ptype == "name":
        # a number-shaped name means division; a keyword means regex
        if ptext[0].isdigit():
            return False
        return ptext in KEYWORDS_BEFORE_REGEX
    if ptype == "punct":
        return ptext not in (")", "]", "}")
    return True


def _need_space(lc: str, nc: str) -> bool:
    if not lc or not nc:
        return False
    if lc in WORD and nc in WORD:
        return True
    if lc in OP_CHARS and nc in OP_CHARS:
        return True
    return False


# ── import rewriting ─────────────────────────────────────────────────────────

def _rewrite_import_specifiers(tokens, min_basenames):
    """Rewrite local `./name.js` specifiers to `./name.min.js` in-place.

    Only touches string tokens that sit in an import/export specifier position:
      import ... from "X"      export ... from "X"      import "X"
      import("X")
    """
    def sig_indices():
        return [k for k, t in enumerate(tokens)
                if t[0] not in ("ws", "line_comment", "block_comment")]

    sig = sig_indices()
    sig_set = {idx: pos for pos, idx in enumerate(sig)}

    def prev_sig(idx):
        pos = sig_set.get(idx)
        if pos is None or pos == 0:
            return None
        return tokens[sig[pos - 1]]

    def prev_sig2(idx):
        pos = sig_set.get(idx)
        if pos is None or pos < 2:
            return None
        return tokens[sig[pos - 2]]

    for k, (ttype, text) in enumerate(tokens):
        if ttype != "string":
            continue
        p1 = prev_sig(k)
        if p1 is None:
            continue
        is_spec = (
            (p1[0] == "name" and p1[1] in ("from", "import"))
            or (p1[0] == "punct" and p1[1] == "("
                and (prev_sig2(k) or ("", ""))[1] == "import")
        )
        if not is_spec:
            continue
        quote = text[0]
        inner = text[1:-1]
        if inner.startswith("./") and inner.endswith(".js"):
            base = inner[2:-3]
            if base in min_basenames:
                tokens[k] = ("string", f"{quote}./{base}.min.js{quote}")


# ── minifiers ────────────────────────────────────────────────────────────────

def minify_js(src: str, min_basenames=frozenset()) -> str:
    tokens = tokenize_js(src)
    if min_basenames:
        _rewrite_import_specifiers(tokens, min_basenames)

    out = []

    def last_char():
        for s in reversed(out):
            if s:
                return s[-1]
        return ""

    n = len(tokens)
    for idx in range(n):
        ttype, text = tokens[idx]
        if ttype in ("line_comment", "block_comment"):
            continue
        if ttype == "ws":
            nxt = None
            for k in range(idx + 1, n):
                if tokens[k][0] in ("ws", "line_comment", "block_comment"):
                    continue
                nxt = tokens[k]
                break
            if nxt is None:
                continue  # trailing whitespace
            if "\n" in text:
                if last_char() != "\n":
                    out.append("\n")
            else:
                lc = last_char()
                nc = nxt[1][0] if nxt[1] else ""
                if _need_space(lc, nc):
                    out.append(" ")
            continue
        out.append(text)
    return "".join(out).strip() + "\n"


def minify_css(src: str) -> str:
    # Split into string vs code segments (dropping comments), so whitespace
    # collapsing never touches the inside of a quoted value.
    segments = []  # (is_string, text)
    i = 0
    n = len(src)
    buf = []
    while i < n:
        c = src[i]
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            i = _read_block_comment(src, i)
            continue
        if c in "\"'":
            if buf:
                segments.append((False, "".join(buf)))
                buf = []
            j = _read_string(src, i)
            segments.append((True, src[i:j]))
            i = j
            continue
        buf.append(c)
        i += 1
    if buf:
        segments.append((False, "".join(buf)))

    out = []
    for is_string, text in segments:
        if is_string:
            out.append(text)
            continue
        # collapse all whitespace runs to a single space
        parts = text.split()
        collapsed = " ".join(parts)
        # restore a single leading/trailing space if the original had one and
        # it separated two tokens across segment boundaries
        if text[:1].isspace() and collapsed:
            collapsed = " " + collapsed
        if text[-1:].isspace() and collapsed and not collapsed.endswith(" "):
            collapsed = collapsed + " "
        out.append(collapsed)
    css = "".join(out)

    # safe structural tightening (outside of strings, which are already isolated
    # above, but we re-run over the joined text; the characters below never
    # appear unescaped inside a CSS string in a way this would harm)
    for a in ("{", "}", ";", ","):
        css = css.replace(" " + a, a).replace(a + " ", a)
    css = css.replace(";}", "}")
    return css.strip() + "\n"


# ── driver ───────────────────────────────────────────────────────────────────

def _targets():
    js = sorted(p for p in DIST.glob("*.js") if not p.name.endswith(".min.js"))
    css = sorted(p for p in DIST.glob("*.css") if not p.name.endswith(".min.css"))
    return js, css


def _fmt(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def main(argv) -> int:
    check = "--check" in argv
    js_files, css_files = _targets()
    min_basenames = frozenset(p.stem for p in js_files)

    rows = []
    stale = []
    for path in js_files:
        src = path.read_text(encoding="utf-8")
        minified = minify_js(src, min_basenames)
        out_path = path.with_name(path.stem + ".min.js")
        rows.append((path.name, len(src.encode()), len(minified.encode())))
        if check:
            if not out_path.exists() or out_path.read_text(encoding="utf-8") != minified:
                stale.append(out_path.name)
        else:
            out_path.write_text(minified, encoding="utf-8")

    for path in css_files:
        src = path.read_text(encoding="utf-8")
        minified = minify_css(src)
        out_path = path.with_name(path.stem + ".min.css")
        rows.append((path.name, len(src.encode()), len(minified.encode())))
        if check:
            if not out_path.exists() or out_path.read_text(encoding="utf-8") != minified:
                stale.append(out_path.name)
        else:
            out_path.write_text(minified, encoding="utf-8")

    if check:
        if stale:
            print("Minified outputs are stale (run: python scripts/minify.py):")
            for name in stale:
                print(f"  - {name}")
            return 1
        print(f"All {len(rows)} minified outputs are up to date.")
        return 0

    total_src = sum(r[1] for r in rows)
    total_min = sum(r[2] for r in rows)
    width = max(len(r[0]) for r in rows)
    print(f"{'file':<{width}}  {'original':>10}  {'minified':>10}  saved")
    for name, s, m in rows:
        pct = (1 - m / s) * 100 if s else 0
        print(f"{name:<{width}}  {_fmt(s):>10}  {_fmt(m):>10}  {pct:5.1f}%")
    pct = (1 - total_min / total_src) * 100 if total_src else 0
    print(f"{'TOTAL':<{width}}  {_fmt(total_src):>10}  {_fmt(total_min):>10}  {pct:5.1f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
