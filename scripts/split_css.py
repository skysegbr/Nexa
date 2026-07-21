#!/usr/bin/env python3
"""
Nexa CSS splitter — carve the monolithic design-system stylesheet
(dist/nexa-ui.css) into per-category files that mirror the six JS component
modules, so a page only pays for the CSS of the components it actually imports.

Why: dist/nexa-components*.js is already split into six categories
(core/forms/overlay/data/nav/theme), but dist/nexa-ui.css was a single ~114 KB
file — a page importing only `nexa-components-core.js` still had to download the
CSS for forms, overlays, tables, nav, everything. This tool closes that gap.

Design (matches minify.py's philosophy — pure stdlib, correctness first):

  - dist/nexa-ui.css stays the HAND-AUTHORED source of truth and is shipped
    unchanged, so every existing app that links it is completely unaffected.
    The category files are ADDITIVE, generated siblings.
  - The monolith is a sequence of `/* -- Name -- */` section banners. Each
    section is assigned to exactly one bucket via MANIFEST below.
  - LOSSLESS BY CONSTRUCTION: the tool asserts that concatenating every
    section back in its ORIGINAL order reproduces the monolith's body
    byte-for-byte. So `base + core + forms + overlay + data + nav + theme`
    equals the monolith exactly — no rule can be dropped, duplicated or altered.
  - A section whose name is not in MANIFEST is a hard error: adding a new
    section to nexa-ui.css forces a categorization decision here.

Load model (documented in README / AI_SPEC):
  nexa-ui.css                         — everything (unchanged default, one <link>)
  nexa-ui-base.css                    — tokens, reset, grid, utilities, animations
  nexa-ui-core.css .. -theme.css      — component CSS per category (need base+core)

Usage:
  python scripts/split_css.py            # (re)generate the dist/nexa-ui-*.css files
  python scripts/split_css.py --check    # verify they are up to date (CI); no writes
  python scripts/split_css.py --list     # print every section name + its bucket
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / "dist"
SOURCE = DIST / "nexa-ui.css"

CATEGORIES = ("base", "core", "forms", "overlay", "data", "nav", "theme")

# A section banner: /* -- <name> --------- */  (box-drawing dashes as padding).
BANNER_RE = re.compile(r"^/\*\s*─+\s*(.+?)\s*─+\s*\*/\s*$")


def norm(name: str) -> str:
    """Manifest key: drop any parenthetical description, collapse spaces."""
    name = name.split("(", 1)[0]
    return " ".join(name.split()).strip()


# Section name (normalized) -> category. Mirrors the JS component modules;
# shared foundation (tokens/reset/utilities/animations) and non-component
# primitives (List, Brand, Board, Drag & Drop) live in `base`.
MANIFEST = {
    # ── base: foundation every page needs ──────────────────────────────────
    "Tokens": "base",
    "Dark mode": "base",
    "Palettes": "base",
    "Reset": "base",
    "App wrapper": "base",
    "Container": "base",
    "Grid": "base",
    "Display utilities": "base",
    "Flex utilities": "base",
    "Spacing utilities": "base",
    "Text utilities": "base",
    "Width / height utilities": "base",
    "Position utilities": "base",
    "Overflow utilities": "base",
    "Cursor utilities": "base",
    "Misc layout": "base",
    "Typography": "base",
    "Page layout": "base",
    "List": "base",
    "Enter animations": "base",
    "Animation utilities": "base",
    "Brand": "base",
    "Drag & Drop": "base",
    "Board": "base",
    # ── core: primitives + Card family (nexa-components-core.js) ────────────
    "Card": "core",
    "Card: media": "core",
    "Card: reveal": "core",
    "Card: glow": "core",
    "Card: expand group": "core",
    "Card: pricing": "core",
    "Card: float": "core",
    "Form": "core",
    "Button": "core",
    "Chip": "core",
    "Badge": "core",
    "Alert": "core",
    "Status / empty": "core",
    "Progress": "core",
    "Spinner": "core",
    "Divider": "core",
    "Avatar": "core",
    "Skeleton": "core",
    # ── forms (nexa-components-forms.js) ───────────────────────────────────
    "Switch": "forms",
    "Combobox": "forms",
    "FileDropZone": "forms",
    "CodeEditor": "forms",
    "Slider / RangeSlider": "forms",
    "DatePicker": "forms",
    "Radio": "forms",
    "NumberInput": "forms",
    "TimePicker": "forms",
    # ── overlay (nexa-components-overlay.js) ───────────────────────────────
    "Toast": "overlay",
    "Dialog": "overlay",
    "Drawer": "overlay",
    "Dropdown": "overlay",
    "Tooltip": "overlay",
    "ContextMenu": "overlay",
    "ToastStack": "overlay",
    "Dialog size variants": "overlay",
    "Bottom Sheet": "overlay",
    "Menu": "overlay",
    "Popover": "overlay",
    "CommandPalette": "overlay",
    # ── data (nexa-components-data.js) ─────────────────────────────────────
    "Table": "data",
    "Pagination": "data",
    "Collapse": "data",
    "Accordion": "data",
    "DataTable": "data",
    "Stat / StatGrid": "data",
    "TreeView": "data",
    # ── nav (nexa-components-nav.js) ───────────────────────────────────────
    "Navbar": "nav",
    "App shell": "nav",
    "Mobile App Bar": "nav",
    "Bottom Navigation": "nav",
    "FAB": "nav",
    "SpeedDial": "nav",
    "SwipeableListItem": "nav",
    "Tabs": "nav",
    "Stepper": "nav",
    "Breadcrumb": "nav",
    "Sidebar nav": "nav",
    # ── theme (nexa-components-theme.js) ───────────────────────────────────
    "PaletteSwitcher": "theme",
    "DesignSwitcher": "theme",
}

LICENSE = (
    "/*! Nexa — {label} styles. Generated from nexa-ui.css by "
    "scripts/split_css.py. */\n"
)
NOTE = (
    "/* AUTO-GENERATED — do not edit. Edit dist/nexa-ui.css and re-run "
    "scripts/split_css.py. */\n"
)

LABELS = {
    "base": "design-system base (tokens, reset, grid, utilities)",
    "core": "core component (nexa-components-core.js)",
    "forms": "forms component (nexa-components-forms.js)",
    "overlay": "overlay component (nexa-components-overlay.js)",
    "data": "data component (nexa-components-data.js)",
    "nav": "navigation component (nexa-components-nav.js)",
    "theme": "theme component (nexa-components-theme.js)",
}


class SplitError(RuntimeError):
    pass


def parse_sections(text: str):
    """Return (header, sections) where sections is [(name, category, body)].

    `header` is everything before the first banner (license + description).
    Each `body` is the exact source text of that section, banner line included,
    ending right before the next banner. Concatenating header + every body
    reproduces `text` exactly.
    """
    lines = text.split("\n")
    banner_idx = []
    names = []
    for i, ln in enumerate(lines):
        m = BANNER_RE.match(ln)
        if m:
            banner_idx.append(i)
            names.append(m.group(1))
    if not banner_idx:
        raise SplitError("no section banners found in nexa-ui.css")

    header = "\n".join(lines[: banner_idx[0]])
    sections = []
    unmapped = []
    for k, start in enumerate(banner_idx):
        end = banner_idx[k + 1] if k + 1 < len(banner_idx) else len(lines)
        body = "\n".join(lines[start:end])
        if k + 1 < len(banner_idx):
            body += "\n"  # restore the newline consumed by the split boundary
        key = norm(names[k])
        cat = MANIFEST.get(key)
        if cat is None:
            unmapped.append(key)
        sections.append((key, cat, body))
    if unmapped:
        raise SplitError(
            "these nexa-ui.css sections are not in MANIFEST (add them to "
            "scripts/split_css.py):\n  - " + "\n  - ".join(sorted(set(unmapped)))
        )

    # Losslessness: header + all bodies (original order) == original file.
    rebuilt = header + "\n" + "".join(b for _, _, b in sections)
    if rebuilt != text:
        raise SplitError(
            "internal error: section parse is not byte-exact "
            f"(rebuilt {len(rebuilt)} chars vs source {len(text)})"
        )
    return header, sections


def build_outputs(text: str) -> dict[str, str]:
    header, sections = parse_sections(text)
    # The descriptive preamble (everything in the header after the /*! banner)
    # is design-system-wide context, so it rides along with base.
    out = {}
    for cat in CATEGORIES:
        bodies = [b for _, c, b in sections if c == cat]
        chunk = LICENSE.format(label=cat) + NOTE
        if cat == "base":
            chunk += header + "\n"
        chunk += "".join(bodies)
        out[cat] = chunk
    return out


def target_path(cat: str) -> Path:
    return DIST / f"nexa-ui-{cat}.css"


def main(argv) -> int:
    text = SOURCE.read_text(encoding="utf-8")

    if "--list" in argv:
        _, sections = parse_sections(text)
        width = max(len(n) for n, _, _ in sections)
        for name, cat, _ in sections:
            print(f"  {name:<{width}}  ->  {cat}")
        by = {c: 0 for c in CATEGORIES}
        for _, c, b in sections:
            by[c] += len(b.encode())
        print()
        for c in CATEGORIES:
            print(f"  {c:<7} {by[c] / 1024:6.1f} KB")
        return 0

    outputs = build_outputs(text)
    check = "--check" in argv

    if check:
        stale = []
        for cat, content in outputs.items():
            p = target_path(cat)
            if not p.exists() or p.read_text(encoding="utf-8") != content:
                stale.append(p.name)
        if stale:
            print("Category CSS files are stale (run: python scripts/split_css.py):")
            for name in stale:
                print(f"  - {name}")
            return 1
        print(f"All {len(outputs)} category CSS files are up to date.")
        return 0

    total = 0
    for cat, content in outputs.items():
        p = target_path(cat)
        p.write_text(content, encoding="utf-8")
        size = len(content.encode())
        total += size
        print(f"  wrote {p.name:<22} {size / 1024:6.1f} KB")
    print(f"  {'(monolith)':<28} {len(text.encode()) / 1024:6.1f} KB")
    print("Run `python scripts/minify.py` next to refresh the .min.css files.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except SplitError as e:
        print(f"split_css: {e}", file=sys.stderr)
        raise SystemExit(2)
