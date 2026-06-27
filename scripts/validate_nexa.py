#!/usr/bin/env python3
"""Static validation for Nexa examples and distributable files.

The project intentionally avoids Node and build tools, so this script uses only
Python's standard library. It validates the no-build surface: local imports,
HTML assets, and a small syntax sanity check for JavaScript files.

Extra checks added later:
- Required example directories must exist.
- Dist files referenced in README.md must exist.
- Example component files must not exceed a line-count threshold (monolith guard).
"""

from __future__ import annotations

import argparse
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
    issues.extend(validate_no_monoliths(root))

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

    if path.startswith("/"):
        return root / path.lstrip("/")

    return (base / path).resolve()
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
