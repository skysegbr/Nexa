# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-07-01

### Added
- `usePalette()` — switches the accent color palette (`default`, `violet`, `rose`, `blue`) independently of light/dark theme, following the same `data-*` attribute + `localStorage` pattern as `useTheme()`. Each palette pairs a light and a dark variant of `--m-primary`, `--m-primary-hover`, `--m-primary-soft`, `--m-secondary`, and `--m-focus` in `nexa-ui.css`.
- `usePalette().setCustomColor(hex)` — a `"custom"` free-form palette: writes `--m-primary` inline from any hex color, and `nexa-ui.css` derives `--m-primary-hover`/`-soft`/`-secondary`/`-focus` from it via `color-mix()`.
- `PaletteSwitcher` — companion component to `ThemeToggle`: a row of preset color swatch buttons plus a native color-picker swatch for `setCustomColor()`.
- `dist/nexa-bootstrap.css` — optional Bootstrap 5 visual skin, opt-in and fully scoped under `[data-design="bootstrap"]`. Not loading this file, or leaving the design at its default, changes nothing about the existing Nexa look.
- `useDesign()` — switches `data-design` on `<html>` (`"nexa"` default, `"bootstrap"`), same `data-*` attribute + `localStorage` pattern as `useTheme()`/`usePalette()`. Composes freely with both.
- `DesignSwitcher` — companion component to `ThemeToggle`/`PaletteSwitcher`: a chip toggle between designs.
- `Navbar` — hamburger menu for narrow viewports (below 768px): `items`/`actions` collapse behind a `.m-navbar-toggle` button, animated open/close (same grid-rows technique as `Collapse`), closes on link click, outside click, or Escape. New optional `defaultOpen`/`open`/`onToggle` props for controlled usage, following the `Collapse` pattern.

### Changed
- `--m-shadow-1` deepened to a two-layer shadow (light and dark, in both `nexa-ui.css` and `nexa-bootstrap.css`) for more visible depth on `Card`, `List item`, `Table`, `Toast`, and `Navbar`. `.m-topbar` (desktop app shell) now also has a shadow — it previously had none.

## [0.2.1] - 2026-07-01

### Fixed
- `Dialog`, `Drawer` — the focus-trap `useEffect` depended on `[open, onClose]`. Since Nexa re-renders the whole tree on any `setState`, an inline `onClose` (e.g. `() => setOpen(false)`) gets a new reference on every render, re-running the effect on every keystroke inside the dialog/drawer and stealing focus back to the close button. Now depends only on `[open]`, reading `onClose` through a ref.

## [0.2.0] - 2026-06-30

### Added
- `.claude/skills/nexa-expert` — a Claude Code skill that points AI assistants at `docs/AI_SPEC.md` before generating Nexa code, with the most failure-prone rules inlined.
- `examples/mindmap` — draggable mind-map cards with inline text editing and SVG connectors that track card position live during drag.
- `examples/drug-recalls` — live dashboard over the openFDA drug recall API (debounced search, classification/status filters, donut + bar charts, recall detail dialog).
- `examples/storefront` — domain-componentized architecture demo: `catalog/`, `cart/`, and `auth/` domains each own a `createContext` + state hook, composed once in `app.js` and integrated through `Shell.js`; product data fetched live from fakestoreapi.com.
- `docs/AI_SPEC.md` §11 "Domain-owned context" — documents where a domain's context + state hook should live, and how to compose multiple contexts at the root.


### Fixed
- `docs/AI_SPEC.md` §7 — the documented `ThemeProvider({ children })` pattern never worked: `children` is evaluated before `ctx.provide()` ever runs, so descendants always saw the context's default value. Replaced with the correct pattern (provider constructs its subtree inside the `provide()` thunk) and added a "Composing multiple contexts" example.
- `docs/AI_SPEC.md` §6 — `useToast()` was documented with a `show()` method that doesn't exist; corrected to the real `{ toasts, toast }` API (`toast.success/error/warning/info`, `toast.dismiss`).
- `examples/complete-page`, `examples/designer`, `examples/new-components` — split centralized `styles.css` into per-component paired `.css` files, matching the domain-componentized convention described in the docs.

## [0.1.0] - 2026-06-27

Initial public release: core framework (`h`, `render`, hooks, context), the
`nexa-components` UI library, design tokens, and the original set of
examples (intro, basic, core, form, complete-page, new-components,
task-manager, mobile, charts, landing, gallery, designer).
