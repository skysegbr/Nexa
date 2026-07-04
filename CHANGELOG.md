# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.7.1] - 2026-07-04

### Fixed
- `m-card-expand` — flex-grow, image zoom, and text-fade timings now match the bedimcode reference exactly (0.5s `flex` transition, a 0.4s `scale(1.1)` zoom on the active strip's image on hover, and the data fade delayed 0.1s behind the flex expansion) instead of all firing at once with no delay.
- `m-card-float` — the info panel is now a frosted-glass surface at rest (`color-mix(in srgb, var(--m-surface) 88%, transparent)` + `backdrop-filter: blur(12px)`) that solidifies to opaque `var(--m-surface)` only for the 30%-50% stretch of each rise/sink keyframe, when it's actually moving — a translucent panel sliding over a photo mid-motion was hard to read.

### Changed
- `examples/new-components` card demos (`m-card-media`, `m-card-float`, `m-card-expand-group`) now use real hotlinked photos (Picsum Photos) instead of flat CSS gradients, so the showcase reads as a real product.

## [0.7.0] - 2026-07-04

### Added
- Card variants — CSS-only modifier classes on top of `.m-card`, adapted from a set of CSS-only reference card designs (bedimcode): `m-card-media`/`m-card-media-zoom` (image-backed card with gradient shadow overlay), `m-card-reveal` (clip-path circle info panel on hover/focus, goes on top of `m-card-media`), `m-card-float` (info panel parked below the image, genuinely clipped away via `overflow: hidden` at rest; defaults intentionally match the landscape reference card's exact proportions — 328px/348px image, centered 280px/316px panel, `bottom: -9rem`, overshoot to `-10rem`, settle at `-7rem` — overridable via `--m-card-float-*` CSS variables; on hover/focus-within the panel fades in while rising with a rise-then-settle bounce, using the same overflow-toggling-keyframe trick as the reference so it reads as growing out of the card's clipped base rather than popping in below it), `m-card-glow` (+ `-amber`/`-violet`/`-emerald`) (gradient-border card with a hover blur burst, driven by `--m-card-hue-1`/`--m-card-hue-2`), `m-card-expand-group`/`m-card-expand` (flex accordion of image strips — active card is `useState`-driven, not the CSS `:has()` trick the reference used), and `m-card-pricing` (price badge with a clipped-notch tail). See `docs/AI_SPEC.md` §9 and `examples/new-components/pages/PageCards.js` for a live showcase of all six.
- `SpeedDial` — new component in `nexa-components.js`: a trigger button that expands a row of `IconButton`s (`orbit: true` stacks them upward instead of inline). Manages its own open/close state, closes on outside click or after an item is picked.
- Two new `usePalette()` presets, `amber` and `emerald`, alongside the existing `violet`/`rose`/`blue` (light + dark variants, same derivation pattern).
- `--m-transition-slow` (400ms) token for hover zoom/glow/expand effects, and two public animation utility classes: `.m-anim-fade-up` (entrance) and `.m-anim-pulse-glow` (looping glow pulse).

## [0.6.0] - 2026-07-02

### Changed — BREAKING
- Renamed the `PreziStage` add-on to `ZoomStage` to drop the reference to Prezi, a commercial presentation product's trademark — the component only ever shared the pan/zoom presentation *style*, not any code or affiliation with that product.
  - `dist/nexa-prezi.js` → `dist/nexa-zoom.js`, `dist/nexa-prezi.css` → `dist/nexa-zoom.css`
  - `PreziStage` → `ZoomStage` (same props, same behavior — import path and name only)
  - CSS classes `.m-prezi-stage`, `.m-prezi-world`, `.m-prezi-frame`, `.m-prezi-frame-active` → `.m-zoom-stage`, `.m-zoom-world`, `.m-zoom-frame`, `.m-zoom-frame-active`
  - `examples/prezi` → `examples/zoom-stage`, `examples/nexa-prezi` → `examples/nexa-deck` (its `PreziToolbar` component → `ZoomToolbar`)
  - `examples/nexa-atlas` updated to the new import and CSS classes
  - No change to `PipelineCanvas` or `FullCodeEditor` — only the Prezi-named add-on was affected.

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
