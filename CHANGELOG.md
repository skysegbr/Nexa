# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-07-02

### Fixed
- `memo` — a memoized subtree no longer freezes stale context values. The skip check compared props and state dirty flags but never context: when a provider above changed its value, `useContext` consumers under an unchanged-props `memo` kept rendering the old value. `useContext` now records what each component read, and `memo` re-renders when any read in the subtree would return a different value (`Object.is`). Note: a provider that rebuilds its value object every render defeats `memo` below it — wrap the provided value in `useMemo`.
- `<select value>` now selects the correct `<option>` on first mount, and when a patch adds new options alongside a new value. Both `createDom` and `patch` applied `value` to the `<select>` element before its `<option>` children existed in the DOM, so the browser silently ignored it and fell back to whichever option ended up first — this made every freshly-mounted `<select>` whose bound value wasn't its first option display the wrong choice (`examples/designer`'s Properties panel was the reported symptom, but any app is affected).
- `useSwipe`, `useLongPress`, `useVirtualList` — the listener-attaching effect no longer silently fails to reconnect when its `ref`'s target mounts on a later render (conditional rendering) or gets replaced (tag/key change). A `[ref.current]` dependency looks like it detects that, but doesn't: the array is evaluated during the same render's tree-building phase, before that render's patch updates `ref.current` — so it always compares the old value against itself. Fixed by dropping the dependency array so the effect re-runs after every render instead (cheap: it's just an addEventListener/removeEventListener pair).
- `patch()` — when an element's tag changes (e.g. `div` → `span`) and the *same* `ref` object is bound to both the old and new vnode, the ref is no longer incorrectly cleared back to `null` right after being set to the new DOM node. The "type changed" branch called `createDom` (which sets the ref to the new element) and then unconditionally cleared the old vnode's ref — clobbering it when both vnodes share the same ref object.

### Added
- `useRouter({ mode })` — new `"history"` mode alongside the existing (default) `"hash"` mode: clean URLs via `pushState`/`popstate` instead of `#/path`. Same-origin `<a href>` clicks are intercepted automatically (matching the ergonomics hash mode gets for free), skipping modified clicks, `target != "_self"`, `download` links, cross-origin links, and same-page fragment links (`#section` keeps native scroll behavior). Requires the server to serve `index.html` for every app route — see the `useRouter` docs in `docs/AI_SPEC.md` §6.
- `scripts/run_browser_tests.py` — headless runner for the browser test suite: serves the repo root, opens `tests/` in headless Chromium via playwright-python, and reports pass/fail with a proper exit code. The suite itself is unchanged (no test framework, no Node); `tests/run.js` now also exposes the results on `window.__nexaTestResults` for the driver.
- `.github/workflows/ci.yml` — GitHub Actions running `validate_nexa.py` and the headless test suite on every push to `main` and every pull request.
- `scripts/validate_nexa.py` — three new checks: local markdown links in README.md (e.g. `](./examples/foo)`), not just backtick-fenced `dist/...` mentions; `src: "..."` asset references inside .js files (`h("img", { src })` and similar, which the existing HTML asset check never sees since it only parses `.html`); and that `package.json`'s version has a matching `## [x.y.z]` heading in `CHANGELOG.md`.

## [0.4.0] - 2026-07-02

### Added
- `PreziStage` (`dist/nexa-prezi.js` + `dist/nexa-prezi.css`) — Prezi-style zooming presentation add-on. Frame content is plain Nexa vdom positioned on one large shared canvas (every frame stays mounted); only the camera — a single transform tweened with `requestAnimationFrame` — is imperative. Supports controlled/uncontrolled `index`, a `path` navigation order, `controllerRef` (`{ next, prev, goTo, index, frames }`), keyboard navigation, click-to-advance, a viewport `padding` fraction, and automatic paint ordering (larger frames render behind smaller ones, so an overview frame never covers its nested frames).
- `examples/prezi` — minimal `PreziStage` deck: per-kind frame components behind a `FrameContent` dispatcher, plus a toolbar with progress dots.
- `examples/nexa-prezi` — full presentation about Nexa built with `PreziStage` and `nexa-components`, with rotated frames and a zoomed-out overview frame.
- `examples/nexa-atlas` — atlas-themed `PreziStage` tour of Nexa: clicking any background frame zooms straight to it (overriding the default click-to-advance), and a live demo frame runs real `useState`/`useTheme` mid-presentation.
- `docs/AI_SPEC.md` §10 "Canvas & Editor Add-ons" — documents `PipelineCanvas` and `PreziStage`. This renumbers the later sections: CSS tokens is now §11, component patterns §12, single-file demo §13, multi-file app §14, gotcha checklist §15.

### Fixed
- `examples/charts` — smart quotes inside a string literal broke module parsing.

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
