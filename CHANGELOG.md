# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.24.2] - 2026-08-23

### Added
- ZoomStage v2 motion language: exported Glide, Arc, Dolly, Orbit, Focus and
  Cut presets; number-or-auto duration; per-destination camera bounds and
  transition overrides; card/frameless/glass surfaces; rect/circle/pill/custom
  clip geometry; and state-aware frame renderers.
- `examples/zoom-lab/`, the canonical comparison stage for all five animated
  camera trajectories, non-card subjects and independent focus geometry.
- `examples/vitra-protocol/`, an original six-scene Inox, glass and red-signal
  material narrative combining every animated ZoomStage v2 trajectory with
  settlement-driven FluxaWay Motion, seven original photographic plates,
  closed loops, an interactive two-state seal and a clickable world overview.

### Changed
- ZoomStage now reports departing, arriving and settled flight lifecycle,
  prepares adjacent frame images by default, reveals the world only after the
  initial camera fit, and interpolates scale perceptually in logarithmic space.
- Existing ZoomStage examples now use the v2 trajectory and settlement APIs;
  the AI specification adds a measured composition contract for alignment,
  proportional geometry, shaped safe areas, fixed chrome and responsive fit.

### Fixed
- `Menu` submenus are actually reachable with the mouse. Two compounding
  bugs: the 2px visual gap between an item and its flyout fired `mouseleave`
  mid-crossing (fixed with an invisible `::before` hover bridge over the
  gap), and any sibling hovered during a diagonal move into the open flyout
  stole the opening instantly. Submenu hover now tracks recent pointer
  movement and keeps deferring a sibling while the pointer advances through
  the safe corridor toward the open flyout; stopping or turning away activates
  the sibling normally. The small list overlap is now an intentional raised
  plane, with a directional edge shadow separating each flyout level. Keyboard
  and click behavior stay immediate.
- Palate Journey keeps the animated wine inside its glass and starts dish
  motion only after the destination camera has settled.

## [0.24.1] - 2026-08-17

### Fixed
- The native `<select>` dropdown no longer falls back to browser default
  colors on dark themes. Options are tinted with the surface/text tokens in
  every engine, and on Chromium and WebKit with a fine pointer the stylesheet
  opts into the customizable select (`appearance: base-select` +
  `::picker(select)`) so the whole picker follows the design tokens — border,
  radius, shadow, hover and a `--m-primary-soft` checked row. Firefox and
  touch devices keep the native picker.

## [0.24.0] - 2026-08-15

### Added
- `Button.effect` and `BUTTON_EFFECTS` now expose Reflection, Edge, Split,
  Aperture, Charge, Corners, Pulse, Phase and Conductor as official component
  API. Every design receives token-driven motion, while Metallic supplies an
  exact Conductor contour recipe for each of its seven finishes.
- An original `examples/inox-landing/` product landing page with two generated
  and optimized stainless-steel images, a shutter reveal, inspection scanner,
  interactive three-state assembly and distinct linear motion language.

### Changed
- The Components and Metallic button catalogs now drive their interaction
  studies through the official `effect` prop instead of example-local CSS;
  the Alloy circuit study is renamed Conductor.
- The AI generation specification now requires seamless loop closure (including
  stagger-adjusted duration), shared proportional layout geometry and
  browser-measured section framing for Next-style landing navigation.

## [0.23.0] - 2026-08-15

### Added
- Experimental `fluxaway-metallic.css` design skin with seven selectable
  material finishes, cohesive metallic actions, surfaces, feedback and form
  validation in both light and dark modes.
- `useMetalTheme()` and `METAL_THEMES` in the optional
  `fluxaway-metallic.js` add-on. The selection is persisted and exposed as
  `data-metal-theme` independently from `useDesign()` and `useTheme()`.
- A multi-page-oriented metallic specimen under `examples/metallic-themes/`
  for evaluating the design system before it is considered official.
- The Components button catalog now presents all nine metallic interaction
  studies together, including the theme-exact Alloy circuit recipes, keyboard
  focus, reduced-motion behavior and a responsive one-column mobile layout.

### Changed
- The 107 descriptor-driven docs reference pages now follow a shared
  Setup → examples → API → resources → implementation-notes hierarchy.
  Technical tables use semantic column associations and stable desktop widths,
  become labelled cards on mobile, and receive the full content width before
  the page TOC can make them cramped.
- Component reference pages now place their required split CSS beside the
  JavaScript import, and Button documents a live locally scoped Cobalt group
  that leaves the surrounding page design untouched.
- The docs-site header now uses the documented compact design menu on desktop
  and mobile, revealing a separate finish menu only while Metallic is active.
- The DesignSwitcher reference now documents a compact Menu composition for
  space-constrained headers while retaining the existing chip switcher as the
  default component presentation.
- The Components example groups its mutually exclusive FluxaWay, Bootstrap and
  Metallic design choices into one compact menu that names the active design.
- FluxaWay's default typography now uses an available system-variable UI stack,
  moderate control weights and restrained heading/label tracking for clearer
  buttons, forms, tables and navigation without changing the color identity.
- Metallic typography now uses a system-variable UI stack, moderate interface
  weights and restrained tracking so material reflections do not reduce text
  clarity on buttons, badges, tables and navigation.

## [0.22.10] - 2026-08-04

### Changed
- Every item in the five add-on `Resources` sections now opens through the
  docs site's read-only FluxaWay `CodeEditor`. This includes all guides,
  framework sources, README API references and example entry points.
- The seven example-source viewers preserve a separate action for launching the
  runnable demo, keeping code inspection and interactive behavior both available.
- The docs-site browser suite now locks all 13 resource mappings, 15 available
  source documents and seven live-demo actions across Chromium, Firefox and
  WebKit.

## [0.22.9] - 2026-08-04

### Changed
- Internal docs and JavaScript source links in the docs site now open a shared,
  read-only FluxaWay `CodeEditor` route instead of navigating to raw files. The
  viewer covers `AI_SPEC`, the AI QA and Motion guides, plus the Editor, Charts
  and PipelineCanvas sources.
- CodeMirror remains lazy, loads once across the source viewer and component
  reference, adapts to the active FluxaWay theme and keeps long documents inside
  a responsive scrollable editor.
- The docs-site browser suite now verifies all six mapped source files, the
  editor's accessible read-only presentation and shared asset loading in
  Chromium, Firefox and WebKit.

## [0.22.8] - 2026-08-04

### Added
- **An AI and security guide in the docs site.** The new lazy route explains
  FluxaWay's reduced supply-chain surface, `safeUrl()` boundary and reviewable
  browser-native output, then shows how to put `docs/AI_SPEC.md` into an AI
  assistant's context.
- A copyable prompt template and complete dashboard prompt now connect product
  goals, FluxaWay architecture, trust boundaries, accessibility and real-browser
  validation. The page also includes a review checklist and direct links to the
  AI spec and QA runbook.

### Changed
- The docs home, header navigation, sidebar and Ctrl/Cmd+K search now introduce
  the framework's security and AI-assisted development focus.
- The docs-site browser suite now verifies the guide, prompt content, checklist
  and `AI_SPEC` search path in Chromium, Firefox and WebKit.

## [0.22.7] - 2026-08-04

### Changed
- The docs site's mobile shell now uses the complete responsive `Navbar`
  instead of a side Drawer. Its animated hamburger expands search, palette,
  theme controls and the full documentation tree directly below the brand,
  pushing page content down without a backdrop or scroll lock.
- The docs-site browser suite now verifies the inline expansion, Escape close,
  content displacement and route-driven collapse through the 900px breakpoint.

## [0.22.6] - 2026-08-03

### Changed
- The mobile example now uses the complete responsive `Navbar` behavior instead
  of pairing an AppBar with a side Drawer. The animated hamburger expands links
  and actions directly below the brand, pushes content down, closes after
  navigation or notification actions and still supports Escape.

## [0.22.5] - 2026-08-03

### Changed
- The mobile example now reuses the FluxaWay `Navbar` toggle animation in its
  AppBar: the three-line hamburger morphs into a close icon with the Drawer
  state, with matching `aria-expanded` and `aria-controls` attributes.

## [0.22.4] - 2026-08-03

### Fixed
- Centered the `FW` monogram in the mobile Drawer's intro card. A broader text
  rule no longer overrides the badge's grid centering in light or dark mode.

## [0.22.3] - 2026-08-03

### Added
- **A complete hamburger navigation flow in `examples/mobile`.** The AppBar now
  opens the first-party `Drawer`, with shared active state across its descriptive
  menu and the BottomNav, an activity badge, Escape handling, focus trapping and
  focus restoration.

### Changed
- The mobile example has been redesigned as a polished responsive app shell,
  with a stronger home hierarchy, gesture lab, breakpoint explorer, activity
  stream, live device profile, Bootstrap icons and mobile-aware action surfaces.
- The QA runbook now calls out drawer navigation, keyboard focus restoration and
  touch behavior for the mobile scenario.

## [0.22.2] - 2026-08-03

### Added
- **A keyboard-accessible Examples menu in the docs header.** The former single
  Components example link now exposes all 20 examples shipped in
  `build/docs-site/examples`, using real anchors with pointer, Tab, arrow,
  Home/End and Escape behavior. The scrollable panel stays usable when the full
  published catalog is taller than the viewport.

### Changed
- The docs-site browser smoke now locks the exact ordered build manifest,
  verifies all 20 hrefs and covers menu focus restoration in Chromium, Firefox
  and WebKit.

## [0.22.1] - 2026-08-03

### Added
- **A complete browsable CSS reference in `examples/docs-site`.** Eight lazy
  pages now cover installation and split bundles, design tokens/themes/palettes,
  the responsive 12-column grid, layout/flex patterns, spacing, typography,
  display utilities and public animations. Each page includes copyable examples,
  live previews where useful, class tables, sidebar navigation, previous/next
  links and Ctrl/Cmd+K search integration.
- **`examples/aurora-ops`**, a responsive polar research command center built
  from the first-party chart and dashboard components, including line, donut,
  heatmap, diverging, dumbbell and small-multiple views.

### Changed
- The shared docs reference renderer now supports stylesheet includes and
  general-purpose reference tables in addition to JavaScript imports and prop
  tables.
- The docs-site browser smoke covers all 107 lazy catalog entries and all eight
  CSS routes in Chromium, Firefox and WebKit. The AI QA runbook also documents
  the three chart-palette validation modes.

## [0.22.0] - 2026-07-29

### Added
- **Three more chart forms, chosen to match the method rather than the wishlist.**
  `Heatmap` (magnitude across a grid), `ScatterChart` (two continuous measures)
  and `SmallMultiples` (one facet per series). RadarChart and GaugeChart were
  deliberately dropped: a radar's area grows with the *square* of the value and
  its axis order is arbitrary, which is the same defect that makes dual-axis
  charts banned here, and `Meter` already covers "one ratio against a limit".
  In their place are the two forms the method actually recommends — small
  multiples, and `emphasis`, which highlights one series and greys the rest.
- **A validated sequential ramp, `--m-seq-1..7`.** Magnitude needs one hue,
  light→dark; categorical slots answer "which series" and have no reading
  order, so they are wrong for a value scale. Derived from the brand teal and
  validated (monotone lightness, worst adjacent OKLCH ΔL 0.074 against a 0.06
  floor, hue spread 8°). `--m-seq-1` is always the lowest value in both themes;
  the stylesheet flips which end is pale, so chart code never branches on the
  theme. `scripts/validate_chart_palette.py --sequential` checks it, and also
  reports which steps stay ordinal-safe.
- **Brush-to-zoom on `LineChart`** (`brush`, `onBrush`). Dragging selects a
  range and the plot narrows to it; Escape or the reset control restores it.
  The table view keeps listing the full series, because zooming is a view of
  the chart and not a filter on the data.
- **`exportCSV` / `chartToCSV` / `exportPNG`.** PNG export inlines every
  computed colour onto the clone before serialising — a detached SVG carries no
  stylesheet, so `var(--m-chart-N)` would otherwise rasterise black.
- **`yDomain`** on the cartesian charts, so facets can share one scale.
- **The diverging palette, and the three forms it unlocks.** Charts encode four
  colour jobs: identity, magnitude, polarity and status. Identity and magnitude
  shipped; **polarity** — values measured against a baseline — had no ramp, so
  anything above/below a target had to borrow colours that meant something else.
  `--m-div-1..7` is two opposite hues meeting at a NEUTRAL GREY middle, derived
  and validated the same way as the others: each arm monotone in lightness
  (worst adjacent ΔL 0.123 light / 0.074 dark), arms mirrored within ΔL 0.014,
  both poles clearing 3:1, and the midpoint the least saturated slot in the
  ramp. `validate_chart_palette.py --diverging` checks it. The midpoint's own
  contrast is deliberately low and deliberately ungated: a value sitting on the
  baseline should recede.
- **`BarChart`'s `diverging`** colours by distance from the baseline instead of
  series identity, and swaps the series legend for a scale key — with series
  names the hues would be mislabelled. `{ invert: true }` flips the poles,
  because red means loss in finance and heat on a map.
- **`LikertChart`** — an ordered-scale share as a diverging stacked bar centred
  on the neutral response, so rows compare by LEAN rather than by total width.
  The scale spans both poles (otherwise "strongly agree" reads no stronger than
  "agree"), and the neutral segment uses the visible de-emphasis grey rather
  than the recessive midpoint token: "Neutral" is an answer someone gave, not an
  absent value, and a segment nobody can see under-reports it.
- **`DumbbellChart`** — before → after per item, where the connector *is* the
  change. Two grouped bars would make the reader compute the gap. One hue in two
  shades, since it is the same measure at two times.
- **Charts are now covered by the a11y and SSR suites.** The non-visual path is
  what a chart lives or dies by: every form ships a table twin, marks take focus
  and announce themselves, the plot is keyboard-navigable, the tooltip is a live
  region, and decorative chrome is hidden. SSR asserts the server render carries
  real geometry and MetricCard's value, since `countUp` runs from an effect that
  never fires there.

### Changed
- `ScatterChart` caps coloured groups at three (`ALL_PAIRS_SLOTS`) and folds the
  rest into one neutral "Other" legend row. In bar and line charts only
  neighbouring colours touch, but in a scatter any two dots can, and the palette
  is only validated to that depth.
- `tests/index.html` now loads `dist/fluxaway-charts.css`. The PNG-export test
  reads colours back through `getComputedStyle`, which needs the palette tokens
  present exactly as an app would load them.

### Fixed
- **Brush-to-zoom was dead in Firefox.** `setPointerCapture` throws there for a
  pointerId it does not consider active, and the call sat before the state
  update, so the exception killed the interaction before it began. Capture is a
  convenience — it lets a release outside the plot still commit — so it is now
  best-effort. Found by running the suite on all three browsers for the first
  time; charts now pass 3/3.

## [0.21.0] - 2026-07-29

### Added
- **Charts and dashboards: the `fluxaway-charts` add-on.** Charts were the one
  common app surface FluxaWay had no first-party answer for. The routing table
  in AI_SPEC §1 covered presentations, animation, diagrams and code editors, but
  "dashboard" fell through — so every app reinvented SVG arc math, picked its own
  colors, and nothing stopped an agent from pulling Chart.js off a CDN and
  breaking the zero-dependency rule. `dist/fluxaway-charts.js` +
  `dist/fluxaway-charts.css` ship `LineChart`, `AreaChart`, `BarChart` (grouped,
  stacked, horizontal, negatives), `DonutChart`, `PieChart` and `Sparkline`,
  plus the dashboard layer — `DashboardGrid`, `ChartCard`, `MetricRow`,
  `MetricCard` and `Meter` — and the scale/format helpers (`scaleLinear`,
  `scaleBand`, `niceTicks`, `formatCompact`, `seriesColor`). Plain SVG through
  the normal vdom, so charts are reactive like any other component.
- **A validated, colorblind-safe categorical palette.** `--m-chart-1..8` (slot 1
  is the brand teal) plus `--m-chart-other`. The slot ORDER is a safety
  mechanism, not a style choice: orderings and steps were enumerated and scored
  against the computable gates, then validated against the real chart surfaces
  (`#ffffff` light, `#1e293b` dark). Both modes clear adjacent CVD ΔE 8.8
  (target 8), normal-vision ΔE 20.1 (floor 15), and 3:1 contrast on **every**
  slot. A ninth series folds into "Other" rather than cycling, because a
  generated hue is indistinguishable from an existing one under simulated
  colorblindness.
- **`scripts/validate_chart_palette.py`** — pure-stdlib checker (OKLCH bands,
  chroma floor, Machado-2009 CVD simulation, WCAG contrast) that reads the
  tokens straight out of the stylesheet, so the documented guarantees can never
  drift from the shipped hexes. Run it after touching any `--m-chart-*` value.
- **Chart animation built on fluxaway-motion.** `animate` wipes lines in via a
  clip rect, grows bars from the baseline and pops donut arcs, staggered;
  `MetricCard`'s `countUp` rides the same ticker. `animate.key` replays it.
  It honours `prefers-reduced-motion`, and the resting render is the
  untransformed chart — animation never changes what a mark reports. This makes
  charts the only add-on that depends on another add-on.
- **`examples/dashboard`** — a full analytics dashboard: KPI row, filter row
  scoping every chart, refetch that holds the previous render instead of
  flashing a skeleton, and a replay control.

### Changed
- **`examples/drug-recalls` now uses the add-on.** Its hand-rolled
  `stroke-dasharray` donut and `<div>` bar chart (plus ~90 lines of app-local
  chart CSS) are gone, replaced by `DonutChart` and a horizontal `BarChart`
  inside `ChartCard`s. The classification donut keeps its status colors through
  the new `sliceColor` prop — recall classes are a severity scale, so hue means
  state there, not identity. The charts gained a value axis, per-mark tooltips,
  keyboard focus and a table view they never had.

### Fixed
- **The docs-site could only be served from `/examples/docs-site/`.** Its five
  route `css:` declarations used absolute `/examples/docs-site/...` hrefs, so
  hosting the app anywhere else — a domain root, a subfolder — silently 404'd
  every route stylesheet and rendered the pages unstyled. They are now relative
  to the document, which resolves correctly both in the repo and at a site root.
- **The docs-site listed the motion add-on under its hook name.** Add-ons read
  `ZoomStage`, `PipelineCanvas`, `FullCodeEditor` and `useTimeline`, so scanning
  the sidebar for "Motion" found nothing even though the page was at
  `#/addons/fluxaway-motion`. It is now `FluxaWay Motion`, and catalog entries
  gained optional search aliases so `useTimeline`, `createTimeline`, `stagger`
  and friends still resolve to it.

## [0.20.1] - 2026-07-26

### Fixed
- **Theme, palette and design events now validate their payload.**
  `fluxaway:themechange`, `:palettechange` and `:designchange` are plain window
  CustomEvents used to keep multiple hook instances in sync, and their
  listeners trusted whatever arrived — the one path that skipped the checks the
  setters already performed. A `designchange` carrying an arbitrary string
  reached both the `data-design` attribute and `localStorage`; a
  `palettechange` carrying a non-hex `customColor` reached the inline
  `--m-primary`, making the documented "invalid hex strings are ignored"
  guarantee false for that route; and a `palettechange` with no `detail` threw
  inside the listener. Each listener now applies its setter's rule, and
  `setTheme` gained the validation `setPalette`/`setDesign` already had.
  Cross-instance sync is unchanged — a valid event still propagates.

  This was never remotely exploitable: dispatching a window event requires
  already running JavaScript on the page. It matters as defense in depth, for
  pages that host semi-trusted third-party scripts. The behavior predates the
  v0.20.0 rename; that release only renamed the event strings.
- **The motion tutorial recorder targeted a dead selector.** Its Motion Editor
  step looked for `.me-row`, which stopped existing when the editor gained
  layer lanes (`.me-row-lane`), so recording timed out. Both tutorial videos
  were re-recorded.

### Added
- **`scripts/check_tutorial_selectors.py`** — a static gate asserting every
  selector the tutorial recorders drive still exists in the source. Nothing
  executed `tutorials/*/record.py`, so a dead selector could survive releases
  unnoticed. Runs in ~280ms, wired into CI and documented as AI_QA gate 1.4.

## [0.20.0] - 2026-07-26

### Removed
- **Every Nexa compatibility surface is gone.** The 67 `dist/nexa*` forwarding
  aliases, their generator (`scripts/sync_legacy_aliases.py`) and its CI gate,
  the `docs/NEXA_UI.md` and `scripts/validate_nexa.py` forwarding entry points,
  and the orphaned `assets/nexa-logo-*.png` files were all deleted. `fluxaway*`
  is now the only public surface. **Breaking:** any application loading a
  `dist/nexa*` path — vendored or through jsDelivr on `@main` — stops
  resolving. Pinning a released tag such as `@v0.19.2` keeps serving the
  aliases; migrating means renaming the import to its `fluxaway*` equivalent,
  which is a pure rename with no API change.
- **`useDesign()` no longer accepts the pre-rename `"nexa"` value.** The hook
  takes `"fluxaway"` or `"bootstrap"`; the normalization path and the
  `LegacyDesign` type were dropped.

### Changed
- **Runtime integration keys and events now carry the FluxaWay name.**
  `localStorage` moved from `nexa-theme` / `nexa-palette` /
  `nexa-palette-custom-color` / `nexa-design` to their `fluxaway-*` spellings,
  the `nexa:themechange` / `:palettechange` / `:designchange` events became
  `fluxaway:*`, and the `useHead` marker attribute became `data-fluxaway-head`.
  **Breaking:** these keys were previously documented as stable contracts, and
  no migration shim reads the old ones — every visitor's saved theme, palette
  and design preference resets to the default once, then persists normally.
- Internal identifiers followed: portal placeholder comments, the `useId`
  prefix, the default `id` of Dialog/Drawer/Tooltip/CommandPalette, the
  exported `NexaContext` type (now `FluxaWayContext`), and the test harness
  globals.
- The motion editor exports projects as `.fluxaway-motion.json`. This also
  fixes a round-trip bug: export wrote `.nexa-motion.json` while import only
  stripped `.fluxaway-motion.json`, so re-importing a project renamed it to
  `<name>.nexa-motion`.
- Example and tutorial directories are `fluxaway-architecture`,
  `fluxaway-atlas` and `fluxaway-motion`, with their recorded tutorial videos
  renamed to match. The docs-site route `#/addons/nexa-motion` no longer
  redirects.
- `docs/AI_QA.md` gate `1.4` and `docs/AI_QA_SCENARIOS.md` `SC-BUILD-06`
  covered the deleted alias generator and were removed; both tables were
  renumbered, which also closed a pre-existing duplicate `SC-BUILD-09`.

### Fixed
- **`scripts/run_priority_flows.py` pointed at the pre-rename example URLs**,
  which would have 404'd on the next QA run.
- **`scripts/run_example_qa.py`'s CSS assertions were passing vacuously.** The
  probes matched `/dist/nexa-ui*`, which no example loads any more, so
  `fluxaway_css_loaded`, `theme_tokens` and `palette_tokens` returned true
  without testing anything and the category-CSS parity check never ran.
- Brand text still reading `NEXA` on screen in the motion-landing and
  palate-journey examples — in the motion-landing header the accessible name
  already said FluxaWay while the visible label did not.

## [0.19.2] - 2026-07-26

### Fixed
- **PipelineCanvas cancels deferred viewport fitting when it unmounts.** Fast
  route changes can no longer let a stale animation frame measure a detached
  zero-size canvas, collapse its scale to zero and write `NaN` geometry into
  the minimap SVG. `fitView()` also ignores containers that do not yet have a
  usable layout, and browser coverage protects the teardown race.

## [0.19.1] - 2026-07-26

### Changed
- **The public repository is now `skysegbr/FluxaWay`.** GitHub, raw AI spec,
  jsDelivr CDN, distribution banners, documentation, examples and tutorials
  now use the final repository path. The local `origin` follows the renamed
  repository, while deprecated `nexa*` artifacts and runtime identifiers
  remain unchanged compatibility contracts.

## [0.19.0] - 2026-07-26

### Added
- **FluxaWay is now the official framework identity.** The approved name,
  “Code flows. Your way.” story, F/W visual system, light/dark logos, app icons,
  favicons and brand guidance now cover the repository, documentation,
  examples, test UI and distributable banners.
- **Compatibility aliases for every previous Nexa artifact.** The 67
  `dist/nexa*` JS, CSS and declaration files are generated as small forwarding
  aliases to their canonical `dist/fluxaway*` equivalents. Existing
  applications keep working while new code loads FluxaWay directly. A
  Python-only sync gate and browser regression test prevent the two public
  surfaces from drifting.

### Changed
- **The full no-build distribution now uses canonical `fluxaway*` filenames.**
  Source modules, minified files, declarations, category CSS, add-ons, package
  metadata, generators, validators, CI, docs, tests and examples all consume
  the new paths directly. Runtime compatibility contracts (`nexa-theme`,
  `nexa-palette`, `nexa-design`, `data-nexa-head`, `nexa:*` events and the
  `"nexa"` design key) remain intentionally stable.
- **Canonical maintenance and guide entry points are now
  `scripts/validate_fluxaway.py` and `docs/FLUXAWAY_UI.md`.** Their previous
  names remain as forwarding compatibility files.
- **The docs-site presents the approved FluxaWay identity.** Its public copy,
  metadata, favicon, manifest and social cards use the new brand. The
  header switches between dedicated light- and dark-theme logo variants,
  including the saved/system theme on first render, and the browser smoke now
  protects that behavior alongside the existing desktop and mobile checks.
- **FluxaWay Motion has a canonical docs route.**
  `#/addons/fluxaway-motion` replaces the former public slug, while the old
  route redirects so saved links continue to work.

## [0.18.0] - 2026-07-26

### Added
- **Responsive “On this page” navigation for the docs-site.** Reference and
  getting-started pages now expose the same scroll-spy as a compact native
  disclosure at widths up to 1200 px, including the tablet layout where the
  main sidebar remains visible. Selecting a section collapses the disclosure
  and moves focus to its heading.

### Changed
- **Docs-site route navigation now moves focus to the new page heading.** The
  shell waits for lazy content to replace the previous heading before focusing
  it, so sidebar, search, previous/next and mobile Drawer navigation announce
  the destination consistently. The existing sidebar auto-scroll behavior is
  now protected by browser regression coverage, and the docs smoke expands to
  13 checks across desktop, tablet and mobile.

## [0.17.2] - 2026-07-26

### Fixed
- **Docs-site “On this page” scroll-spy now activates the final section at the
  bottom of the document.** Short final sections often cannot cross the
  viewport's 25% activation line, leaving the penultimate link highlighted
  even after the reader reaches the end. The shared `PageToc` now treats the
  scroll boundary as the final section and the browser smoke suite locks the
  behavior with an `aria-current="location"` regression check.

## [0.17.1] - 2026-07-26

### Added
- **`examples/docs-site` — a Bootstrap-style documentation site for the design
  system, written in Nexa itself.** Fixed header with Ctrl/Cmd+K search (the
  `CommandPalette` component), sticky category sidebar, scroll-spy "on this
  page" rail, per-example live preview + copyable snippet, props tables, and
  light/dark + palette switching that restyles the docs and every demo at once.
  Two pieces make it cheap to grow: the snippet under each demo is derived from
  the demo component's own `Function.prototype.toString()`, so the code shown
  and the thing rendered above it cannot drift; and every page is generated by
  one `ReferencePage` from a content descriptor, so documenting a component
  means adding an entry to a module under `content/` and nothing else. Ships a
  dependency-free ~90-line syntax highlighter
  (`components/reference/highlight.js`) that
  tokenizes JS/HTML/CSS with one combined regex per language and emits vdom
  spans (never an HTML string), colored from the same `--m-*` tokens as the
  rest of the system. Covers **all six component categories (61 components)
  and 33 hooks**, plus live references for all four add-ons — **98 pages** in
  total. Components get live demos and a props table; hooks get a call
  signature plus Parameters and Returns tables, and their demos run the real
  hook (the useVirtualList page reports how many of its 5,000 rows are actually
  in the DOM). `DesignSwitcher` reskins the entire site to Bootstrap 5 live.
  Priority flow `SC-APP-12` exercises lazy loading, sidebar/drawer navigation,
  the code toggle, the palette and the add-on reference pages.

### Changed
- **The docs-site now follows the `AI_SPEC.md` large-app architecture.** Its
  route tree, reference entries, category CSS and add-on runtimes are loaded on
  demand; the home route no longer fetches the 98 content descriptors,
  CodeMirror or the monolithic stylesheet. A lightweight catalog preserves
  instant search without executing page modules, and the shell/reference code
  is organized by domain. Reference pages also gain breadcrumbs, a copyable
  import, previous/next navigation and curated resources.
- **Docs-site QA is now a release gate in Chromium, Firefox and WebKit.**
  `scripts/check_docs_site.py` verifies the lazy home payload, command search,
  category CSS, deferred CodeMirror, every add-on demo, catalog/source parity,
  clean browser diagnostics and the accessible mobile drawer. CI runs this
  smoke suite alongside the framework browser matrix, and `docs/AI_QA.md`
  documents the gate.

### Removed
- **Examples pruned 32 → 21.** The gallery had grown redundant rather than
  non-compliant (`validate_nexa.py` passed on all 32 and every one followed the
  §12 domain-componentized layout), so the cut targeted duplicates: `synth-panel`
  / `transit-map` / `spacecraft` were structural clones of each other (same
  `app.js`, same `Controls.js`/`InfoCard.js`, only the SVG art differed — `star-atlas`
  remains as the `freeZoom` reference); `space-journey` cloned `palate-journey`;
  `burger-shop` duplicated `burger-shop-fastapi`'s frontend byte-for-byte
  (13 files) with only the backend differing; `intro` duplicated `basic`
  (`basic` kept — `tutorials/basic` embeds it); `nexa-deck` and `zoom-stage`
  overlapped `nexa-architecture`/`nexa-atlas`, which take over as the ZoomStage
  references; `core` and `charts` were covered by the surviving apps; and
  `task-manager` duplicated the CRUD story while opening on a connection error
  without its backend. ZoomStage examples go 10 → 3, and the tracked
  `examples/` tree drops from 15.9 MB to 11.8 MB.

### Fixed
- **The docs-site shell is responsive and keyboard accessible.** The fixed
  header now fits narrow viewports, the mobile menu uses Nexa's focus-trapped
  `Drawer` with scroll lock, Escape and focus restoration, sidebar categories
  collapse natively, the page has a skip link and landmarks, and code/TOC
  controls expose focus, state and reduced-motion behavior.
- **AI_SPEC §6 documented three mobile hooks with the wrong return type** —
  found by writing each docs page against the actual `dist/nexa.js` signature
  instead of the spec. `useNetworkStatus()` returns the **boolean** itself (not
  `{ online, type }`), `useOrientation()` returns the **string**
  `"portrait" | "landscape"` (not `{ angle, type }`), and `useVibrate()`
  returns the **vibrate function** (not `{ vibrate }`). Following the old text
  gave you `undefined` for the first two and a TypeError on the third. Also
  documents `useVirtualList`'s real item shape (`{ item, index, offsetTop }` —
  there is no ready-made `style`, so rows must be positioned by the caller) and
  `useToast`'s top-level `dismiss`.
- **Docs claimed example coverage that never existed**: AI_SPEC §10 and AI_QA
  §3.3 pointed at `examples/mindmap` as the **PipelineCanvas** reference and
  `examples/designer` as the **FullCodeEditor** reference — mindmap is
  hand-rolled SVG and designer uses the `CodeEditor` form component; neither
  add-on has ever had an example app. Both docs now say so explicitly.
- `scripts/run_priority_flows.py` ZoomStage flows rewritten against
  `nexa-architecture` and `nexa-atlas` (13/13 flows pass); the two stdlib API
  servers it used to boot are gone, with `--fastapi-url` remaining for the
  burger-shop backend flow. `validate_nexa.py`'s `REQUIRED_EXAMPLES`,
  `run_example_qa.py`'s backend list, `bundle.py`'s usage example and the
  README bundle figures (`complete-page`: 229 KB / 15 requests → 29 KB / 1,
  re-measured) updated to match.

## [0.17.0] - 2026-07-25

### Added
- **`Button` `outline` variant** — the existing token-based `m-button-outline` visual is now available through the public `Button` API (with the legacy `outlined` spelling kept as an alias). `Button` also accepts a leading `icon` (`"close"` built in, or any VNode/text icon), an `accent` modifier for a theme-colored leading border/icon, enforces an accessible name for icon-only usage, and documents/tests native click, keyboard, disabled, light/dark-theme, focus-ring and contrast behavior. The components showcase now has a dedicated Buttons catalog, and the designer exposes the official variant and modifier.

## [0.16.0] - 2026-07-20

### Added
- **`safeUrl(url, fallback = "")`** (exported from `dist/nexa.js`) — a URL-scheme XSS guard for values bound to `href`/`src`. HTML-escaping (already applied to every SSR attribute) stops attribute breakout but not `href="javascript:alert(1)"`, whose scheme still runs on click. `safeUrl` blocks `javascript:`, `vbscript:` and non-image `data:` URLs (control chars/whitespace stripped before the scheme test, so `"java\tscript:"` can't slip through), returns safe URLs unchanged and unsafe ones as `fallback`. Pure string logic — identical on the client and in `renderToString`. Opt-in by design (Nexa never rewrites URLs automatically); it's the URL counterpart of the existing `innerHTML` sanitizing rule. Documented in AI_SPEC §8 and the README; 6 tests in the new `tests/security.test.js`. `.d.ts` updated.
- **Category CSS**, mirroring the JS component modules: `dist/nexa-ui.css` (~114 KB, unchanged and still the one-`<link>` default) now also ships pre-split into `nexa-ui-base.css` (tokens, reset, grid, utilities, animations) + `nexa-ui-{core,forms,overlay,data,nav,theme}.css`, so a page loads only the CSS it uses (a core-only page: ~114 KB → ~52 KB before minify/gzip). Generated from the monolith by the new **`scripts/split_css.py`** (pure stdlib), which asserts the split is byte-for-byte lossless — `base + core + forms + overlay + data + nav + theme` reconstructs `nexa-ui.css` exactly. An unmapped section is a hard error, so adding a section to the monolith forces a categorization decision. `minify.py` picks the new files up automatically; CI runs `split_css.py --check` before `minify.py --check`. Documented in AI_SPEC §9 and the README CSS Framework section.
- **Docs — supply-chain & production serving**: a Subresource Integrity (SRI) guide for CDN use (`integrity` + `crossorigin`, a stdlib-only hash generator, the ES-module transitive-import caveat, and the commit-SHA pinning alternative) and a "Production Serving" section (compression + when `Cache-Control: immutable` is safe vs a footgun) in the README.

- **`docs/AI_QA.md` — AI QA runbook**: a QA counterpart to AI_SPEC.md, written for an AI (or human) to run a full quality pass. Covers the non-negotiable environment rules (no Node; pick the Python that has playwright; HTTP + browser), the ordered gates (`validate_nexa.py`, `split_css.py --check`, `minify.py --check`, the ~300-test suite across chromium/firefox/webkit, optional bundle `--smoke`), the suite's coverage map, AI-executable manual/visual checks (per-example console/render/interaction/theme/responsive checklist, the same-DOM computed-style diff that proves a category-CSS example renders identically to the monolith, add-on and SSR-hydration smokes), no-build supply-chain spot-checks, a release checklist, and a structured reporting format. Linked from the README and llms.txt.
- **`docs/AI_QA_SCENARIOS.md` — QA scenario catalog**: the companion *what-to-test* to AI_QA.md's *how*. An ID'd, reportable catalog (`SC-<area>-NN`) spanning core rendering/reconciler, context, every hook (state/async/router/theme/utility/mobile), component utilities + `safeUrl`, all ~60 UI components (via reusable component/field/overlay/list baselines + per-component specifics), forms, SSR/hydration, the four add-ons (ZoomStage, nexa-motion, PipelineCanvas, FullCodeEditor), the CSS framework, accessibility, security, build/tooling, all 32 example apps, and cross-browser/performance — each with expected result and a verify method (suite/browser/visual/static). Flags which rows the automated suite already covers vs the manual/visual gaps.

### Changed
- **Examples adopt the category CSS**: the 15 example pages that use only part of the component library now link `nexa-ui-base.css` + only the categories they use (the 3 full-library showcases — `complete-page`, `components`, `drug-recalls` — keep the monolith). The conversion was driven by an audit that maps each page's imported components and directly-used `m-*` classes to categories, then **verified in a headless browser** to render byte-for-byte identically to the monolith (every element's full computed style compared under a stylesheet swap on the same DOM). `scripts/validate_nexa.py` gained a guard that fails if any example loads the category CSS but omits a category it uses (a JS component renders its own classes internally, so a missing category is otherwise a silent unstyled render) — keeps the split honest as examples evolve.

### Fixed
- **Form controls now associate their `<label>` even without an explicit `id`** (accessibility). `FormField` renders `<label htmlFor={id}>` and the control renders `id={id}`, so passing no `id` left both `undefined` and broke the programmatic label↔control relationship for assistive tech. The labelled controls (`TextField`, `Textarea`, `Select`, `Combobox`, `Slider`, `RangeSlider`, `DatePicker`, `NumberInput`, `TimePicker`, `RadioGroup`) now resolve their id via the existing `useId` hook — an explicit `id` still wins, otherwise a stable unique one is generated. Fixes two knock-on defects found by the same gap: `Combobox` had a hardcoded default `id="nexa-combobox"` that collided across instances, and a `RadioGroup` with neither `name` nor `id` produced ungrouped radios. Behaviour is unchanged when an `id` is supplied.
- **`examples/motion-editor`**: the project and scene action bars (`.me-projects`, `.me-scenes`) overflowed horizontally ~200 px on a 375 px viewport — single-line flex rows of fixed-width children that couldn't shrink. They now `flex-wrap`, so the bars stay within the viewport on mobile (no change on desktop, where there's room). Reproduced and verified fixed in Chromium, Firefox and WebKit.

## [0.15.0] - 2026-07-16

### Added
- **Component category modules**: `dist/nexa-components.js` is now a barrel over six category files — `nexa-components-core.js` (shared primitives), `-forms.js`, `-overlay.js`, `-data.js`, `-nav.js`, `-theme.js` — plus an internal `nexa-components-util.js` (shared helpers, not public API). Importing the barrel keeps working unchanged (same 61 exports, same references); importing only the categories a page uses cuts the components payload by up to ~85% (e.g. core+theme ≈ 13 KB vs 112 KB). Category `.d.ts` files re-export from `nexa-components.d.ts`; minified twins ship for every module. All examples now import by category; the designer's code export generates category imports. New `tests/categories.test.js` guards barrel↔category parity.
- `scripts/benchmark_examples.py` — headless payload/timing benchmark for the example pages (per-page JS request count, bytes and load timings; external requests blocked for determinism). Also accepts repo-relative paths (e.g. `build/task-manager`) to measure bundled outputs.
- **`scripts/bundle.py` — optional production bundler** (dev stays 100% no-build). Collapses an app into a standalone deploy folder: one JS file, one CSS file (`@import` chains inlined, `url()` assets copied and rewritten), rewritten `index.html`, absolute-path assets (`/assets/...`) copied along. Two engines: `python` (module-level bundling + minify.py, zero deps — JS −40%, 1 request) and `esbuild` (standalone Go binary built from source via `--setup-esbuild`, no Node/npm — real tree-shaking + mangling, JS −85%, e.g. task-manager 228 KB/15 req → 39 KB/1 req). `--smoke` self-verifies the output headlessly (renders, no page errors, no local 404s). Benchmarks in `docs/benchmarks/bundle-{python,esbuild}.json`.

## [0.14.0] - 2026-07-14

### Added
- **`nexa-motion` add-on** (`dist/nexa-motion.js`) — Flash-style timeline animation: keyframe tracks tweening `transform`/`opacity` (x/y, rotate, skew, scale, per-axis scale), the classic Penner easing set (`outBack`, `outElastic`, `outBounce`, …), labels, frame scripts (crossing-aware, direction-aware; `gotoAndPlay` executes the target frame's script as Flash did), `loop`/`reverse()`/`setSpeed()`, and the quartet: `play() / stop() / gotoAndPlay() / gotoAndStop()`. Elements bind through `tl.track(name)` callback refs (late binders sync to the playhead instantly); one `requestAnimationFrame` ticker per timeline; SSR-safe (no rAF → stays parked). `useTimeline(spec)` wraps the imperative `createTimeline` with mount/unmount lifecycle and autoplay; a component with its own `useTimeline` is a movie clip — nest freely. `stagger(keyframes, eachMs, index)` builds cascade entrances. 18 tests in `tests/motion.test.js`.
- `examples/nexa-motion` — the 2003 intro, reborn: fake preloader, logo flying in with `outBack`, staggered "MOTION" letter cascade, tagline, `outElastic` badge, a nested looping movie clip (pulsing ring), SKIP INTRO, and a control deck with scrubber, reverse, playback speed, and `gotoAndPlay` scene jumps driven by frame scripts.
- Docs: `nexa-motion` quick reference in `docs/AI_SPEC.md` §10 and a "Canvas, Editor & Motion" section in the README.
- `nexa-motion` power-ups: **motion guides** (`path: "M ..."` on a keyframe follows the SVG curve from the previous keyframe, endpoints injected as x/y keyframes for continuity, `orient: true` rotates along the tangent — Flash's "orient to path"; guides share one hidden `<svg>` and are removed on `destroy()`), **color tweens** (`color`/`backgroundColor`/`fill`/`stroke`, per-RGBA-channel lerp, hex/rgb parsed at compile time), and **frame-by-frame animation** (`set: {...}` — discrete style steps held until the next `set`, e.g. sprite sheets via `backgroundPosition`). Duration inference now accounts for color/step/guide-only tracks. 5 new tests.
- `examples/motion-editor` — a visual timeline editor in the spirit of the Flash IDE, built entirely with Nexa + nexa-motion: stage preview bound to the real runtime (every edit rebuilds the controller and reseeks), timeline rows with draggable keyframe diamonds (pointer-captured, 25 ms snap), ruler scrubbing with playhead, per-keyframe inspector (tween fields, easing picker, un-key by clearing a field, delete), add-keyframe-at-playhead, editable duration, and live `useTimeline` code export with copy.
- Motion-editor v2: **undo/redo** on the core's `useHistory` (drags edit a draft document and commit one history step per gesture — not per pixel; no-op edits are skipped so a blur re-firing `change` can't push phantom steps), **multi-selection** (shift-click; dragging any selected diamond moves the group; Delete removes it), and **motion-guide drawing on the stage**: with a keyframe selected, click points on the stage, finish in the inspector — points become a Catmull-Rom-smoothed SVG path on the keyframe, shown as a dashed guide overlay (with an orient toggle), exactly like drawing a Flash guide layer. Keyboard: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y / Delete / Esc. Full-viewport IDE layout: the stage flexes to fill the screen, the timeline docks below it, and the inspector/export sidebar scrolls independently (small screens fall back to a scrolling stack).
- Motion-editor copy/paste: Ctrl+C copies the selected keyframes, Ctrl+V pastes them into their tracks at the playhead keeping relative spacing — one history step, pasted keyframes become the selection. Native copy still wins while page text is selected, and shortcuts stay out of form fields.
- `tutorials/nexa-motion` (~40 s): the timeline replayed on camera, easing + `stagger` cascade, `gotoAndPlay` scene jumps with frame scripts driving the deck, the nested movie clip outliving the movie — and a finale inside the Motion Editor (iframe swaps mid-tutorial), playing the doc and dragging a keyframe live.
- Motion-editor guide editing: selecting a keyframe that carries a motion guide shows the curve's anchor points as draggable handles on the stage — the drag previews live and commits one history step on release. Anchors are recovered from the path string itself (`pathAnchors`), so no editor metadata leaks into the exported code.
- Motion-editor projects: save the current document under a name, load it back (undoable, like any edit) or reset to the starter movie — persistence on the core's `useLocalStorage` (`ProjectBar.js`).
- Branch code review (8-angle, pre-merge) fixes — runtime: a typo'd `onFrame` key now throws at construction instead of silently becoming NaN and poisoning the inferred duration (NaN transforms, never-ending timeline); frame-by-frame `set` styles clear when the playhead moves back before the step (they leaked across reverse/loop wraps/backward seeks); `play()` after a finite-loop movie completes restores the loop budget (it silently ignored `loop` while `gotoAndPlay(0)` honored it); `orient: true` holds the guide's boundary tangent outside the span instead of snapping to 0deg; `gotoAndStop` now delegates to `stop()+seek()`; frame-script scans early-break on the sorted list; late-bound elements sync through the one canonical apply path; binding an unknown track warns once (the silent-nothing trap of useTimeline's first-render spec capture). Editor: exported code quotes non-identifier track names (`"rect-1":` — the ready-to-paste export was a SyntaxError for every editor-created actor); imported documents get a tracks entry per actor (the `+` button crashed on sparse JSON) and keyframe mutations no-op on missing entries; stale actor selections can no longer mis-route the Delete key, push phantom history entries, or resurrect handles after a project load; drag origins are plain objects (a `:` in an imported track name corrupted the gesture); typed w/h values clamp to the same 12px floor as drag-resize; the timeline controller rebuilds only on COMMITTED document changes (drag drafts no longer recompile the runtime per pointermove) and is destroyed on unmount; snap grid and selection identity live in one module (`editorUtils.js`); `CodePane` memoizes the generated code. Docs: the README add-on inventory and AI_SPEC file map now include `nexa-motion`, and the motion-guide contract (curve owns x/y inside the span; join back-to-back guides) is documented. 4 new runtime regression tests; 242/242 on chromium and firefox.
- Motion-editor arrange (z-order) and project files: the actor inspector gained Flash's Arrange (bring to front / forward / backward / send to back — paint order is the actors' document order, so timeline rows follow), and the project bar exports the document as a `.nexa-motion.json` download and imports one back (validated, undoable, no server involved).
- Motion-editor selection tool: click an actor to select it (dashed outline + four corner handles), drag to move, drag a handle to resize — live preview, one history step per gesture. The sidebar switches to an actor inspector (label, text content, x/y/w/h, fill swatches + custom color picker, delete). Actor and keyframe selections are mutually exclusive; Delete removes whichever is active, Escape clears it. Motion guides follow the actor while it moves (bases derive from the document box).
- Motion-editor actor creation, Flash-style (toolbox adapted from the drawEasyNexa vector editor): actors are now part of the document — a vertical tool strip (select / rectangle / ellipse / text + fill swatches) sits beside the stage; shape tools rubber-band-drag new actors into place (dashed preview), the text tool places editable text, every new actor gets its own track with a starter keyframe, rows gained a ✕ that deletes actor + track, and everything is undoable and saved with the project. Legacy saved projects inherit the starter cast on load.
- Motion-editor, the Flash-IDE round: **frame-based timeline** (document `fps`, default 24 — the ruler numbers frames, lanes draw frame cells, every edit snaps to the frame grid, and the transport shows the classic `f41 · 24 fps · 1.7s` readout with editable frame rate), keyframes as dots with shaded **tween spans** (arrowed; gold when the span ends on a motion guide), **auto-key** (dragging an actor on the stage records its position at the playhead — a plain click never records; the value compensates the live tween `translate3d` so nothing jumps on release), **Free Transform** (rotate lollipop with 15° Shift snap + corner scaling on a measured overlay that follows the tween; commits `rotate`/`scale` keyframes at the playhead), layers-panel chrome on the label column (eye / padlock / per-layer outline color square, double-click rename, sibling reorder), onion skinning as real ghost controllers per frame with draggable range brackets on the ruler, timeline zoom on one scrollable strip, named ruler labels (exported for `gotoAndPlay`), loop toggle (exported) and preview speed, stage color as a document property, a fill mixer (free CSS value + alpha), keyframe `_id`s (selection, drags and clipboard target ids — undo/redo can never re-aim them; export strips `_`-keys), and **two-way code editing**: the Export pane and the per-actor Behavior panel both parse edited `useTimeline()` / track source back into the document as one undo step.
- Motion-editor authoring model, schema v3→v8: **independent multi-actor layers** with Flash paint order (top row in front), **nested layer folders** (collapse, indent/outdent, flags propagate to descendants), **animated mask layers** (SVG clipPath geometry driven by the mask's own track) and editor-only **guide layers** (excluded from export), **multi-scene movies** (create/duplicate/rename/reorder/delete; each scene owns duration, actors, layers, tracks and labels; fps, stage color and the Library are shared), **linked symbols and nested MovieClip editing** (convert an actor to a symbol, shared artwork across instances, enter the symbol's own stage/timeline with breadcrumbs, cycle-safe nesting, instances slaved to the parent playhead), **vector drawing tools** (Line/Pencil storing portable SVG paths, tool shortcuts V/Q/N/Y/R/O/T), and **frame commands** F5/F6/F7/Shift+F6 (insert frame / content keyframe / blank keyframe / clear). Documents carry a versioned schema; legacy saves are normalized on load and session ids never reach saved files. 32 editor tests in `tests/motion-editor.test.js`.
- `examples/motion-landing` — animated product landing page for Nexa Motion built on the add-on itself (hero timeline, scroll-driven scenes).
- `examples/palate-journey` — a ten-course food & drink tasting journey: full-screen course cards with staggered timelines, a dot rail, and a "serve for me" autopilot.
- `examples/space-journey` — "Beyond", a guided tour through real NASA/Webb imagery: `ZoomStage` camera glides between destination frames, each running its own independent `nexa-motion` timeline, with a mission HUD and per-scene effects.
- `tutorials/motion-editor` (~33 s): create & animate step by step in the real editor — draw a rectangle on an empty stage, scrub and drag (auto-key), rotate at the last frame with Free Transform, play the looping movie, then the Behavior keyframe list and the live export.
- Motion-editor UX hardening after first real dogfooding: a 4px drag threshold (selecting never auto-keys by accident), selection chrome on the measured visual box (rect + name tag + handles follow the tween and reveal actors that are invisible at the playhead), the selected actor's lane lights up, and a per-example README documenting the place→scrub→drag→play workflow.

### Changed
- `nexa-motion` pre-samples motion guides at compile time (~4px per sample, clamped 16–256, coordinates rounded to 1/1000 px): the per-frame hot path lerps a point array instead of calling `getPointAtLength`, and the temporary `<path>` leaves the shared hidden `<svg>` immediately (nothing left for `destroy()` to clean up).

### Fixed (branch code review, before merge)
- Motion-editor two-way editing no longer loses data: `load()` now syncs the root projection into the active scene before re-normalizing — previously `normalizeMotionDocument` rebuilt the document from the STALE `scenes` snapshot, so pressing ✓ apply in the Export pane silently discarded both the applied code and every edit made since the last scene operation, as one "undoable" step. Starter actors spawned for unknown track names in applied code are also registered on a layer now (the stage and timeline paint exclusively from `layer.actorIds` — a layerless actor was invisible and unselectable).
- The layer padlock locks again, everywhere: the transparent-wrapper hit-testing rule (`.me-stage-layer .me-actor { pointer-events: auto }`) out-ranked the `.me-actor-locked` class, so locked actors were still draggable (and auto-keyed); the gate is now an INLINE `pointer-events` set at the flag's single resolution point (`stageActorStyle`), immune to selector-specificity fights. Locked mask layers reject stage gestures too (the mask `<use>` overlay only checked `hidden`), and Library placement respects the active layer's padlock/eye like the stage tools already did.
- `+ scene` no longer names the new scene "[object PointerEvent]": button click events were forwarded into the action as the `name` argument (and serialized into saved projects). Scene/symbol navigation also resets the playhead only AFTER the action really navigated — a rejected enter/exit or a no-op scene select used to zero the parked playhead, so the next auto-key landed on frame 1.
- Flash frame-command semantics: F5 extends the exposure under the playhead (the key at the playhead keeps its frame; only strictly-later keys shift) instead of pushing the current keyframe right, and F6 copies the POSE only — `path`/`orient`/`ease` no longer ride along, which made the actor re-travel the entire motion guide between the copied keys.
- Non-looping MovieClip instances park on their final pose instead of rewinding every parent cycle (the sync wrapped the parent playhead with `% duration` unconditionally), and instance sync skips the seek entirely while the parent clock hasn't moved. Each instance also no longer builds a throwaway second controller on mount.
- Editor-side layer flags self-heal: layer ids are reused after deletion, so a stale eye/padlock entry from a deleted layer could be reborn as an invisibly locked/hidden new layer; the flag store now prunes to the ids that exist. `updateActor`/`updateLayer` drop keys patched to `undefined` (they used to survive as literal `undefined` properties into saved JSON), and Library rows key by the schema's unique symbol id (names repeat across scenes).

## [0.13.0] - 2026-07-12

### Changed
- **Targeted subtree re-renders**: `setState`/`dispatch` now re-render only the component that owns the state (and its subtree) instead of re-running the whole tree from the root. Each component owner tracks what a re-run needs — its function, last props, a snapshot of the provider environment (so `useContext` reads see provided values, not defaults), and the live vnode its last output occupies — and the scheduler patches that vnode in place, batching multiple dirty owners per microtask and skipping owners whose ancestor is also dirty. Automatic fallback to a full root pass covers the cases in-place swapping can't: fragment/portal output, primitive returns, the first update after `hydrate`, and renders that throw (so a `useErrorBoundary` guard above still catches — a targeted run executes outside the guard's try/catch). Queued effects are carried across the fallback so a deps-change effect is never lost. Root-level state (the `render()` component) still renders from the root. 11 new engine tests in `tests/v02-features.test.js`; the 186 pre-existing tests pass unchanged.
- `createLazy` resolution no longer re-renders every live root: each pending instance records its owner while showing the fallback, and module load (or failure) re-renders exactly those subtrees.

### Fixed (branch code review, before merge)
- Targeted-render fallbacks no longer consume the dirty flag: a component whose output changed shape (or whose render threw) under a `memo` parent used to be skipped by the fallback root pass — freezing the UI permanently (later identical setStates were `Object.is` no-ops) and swallowing errors before any `useErrorBoundary` could latch. The fallback contract is now unified: `targetedRender` restores `owner.dirty`, hands its queued effects back, and returns false; `flushRender` performs one root pass and abandons the batch (previously the loop kept targeted-rendering owners the full pass had just covered — double component execution and double effects per flush).
- Effects are deferred until every owner in a batch has patched (an effect could observe a sibling's not-yet-committed DOM), `runEffects` dedupes hooks queued twice across a fallback (dep-less effects fired twice per commit) and skips owners unmounted after queueing, and a targeted-render throw is logged before the root retry (a non-deterministic throw used to vanish without a trace).
- `memo` skips are now also blocked when a provider **above** changed its value (`contextEnvChanged`, pairwise `Object.is` over the frame chain): previously a descendant that read the context for the first time during a targeted re-render saw the stale snapshot. Memoized provider values keep skipping as before.
- `innerHTML` + children is now resolved at `h()` time — the children are dropped with a one-time console warning. Previously the combination corrupted the tree in two confirmed ways: a falsy conditional child under `innerHTML` broke hydration (`replaceChild` on a detached vnode wedged the app permanently), and removing the `innerHTML` prop wiped the framework's own child nodes before the patch, throwing `NotFoundError` forever after.
- `hydrate` now adopts server-rendered `innerHTML` regions instead of reassigning the string (which recreated the nodes — iframes reloaded, media restarted); node identity inside the region is preserved when the markup matches.
- `setState` on an unmounted component now logs a one-time diagnostic (it is ignored by design; the old engine's full-tree re-render silently masked missing effect cleanups). `flushRender` uses `liveRoots` for its dead-root guard, so a setState fired during `renderToString` is dropped cleanly instead of attempting a DOM render.
- Housekeeping from the same review: unmount marking folded into `cleanupEffects` (one traversal, no call-site pairing), `createLazy` prunes unmounted pending owners (a never-settling loader no longer pins dead subtrees), `applyHead` scans `<head>` once per call instead of once per meta entry, and `usePresence` reuses exit entries instead of reallocating per render.

### Added
- `useHead({ title, meta })` — per-route document metadata. Client: applied after commit, meta tags upserted in place (keyed by `name`/`property`, marked `data-nexa-head`, no duplicates). Server: `renderToString()` collects the calls and the new `renderHeadToString()` (also re-exported from `nexa-server.js`) returns escaped, deduped `<title>`/`<meta>` markup for the document head. Last writer wins; nothing is removed on unmount.
- `usePresence(visibleOrItems, { duration, getKey })` — exit transitions. Nexa removes a DOM node the instant its vnode disappears, so CSS exit animations never played. The boolean form returns `{ mounted, exiting }` for single elements (dialogs, banners); the list form returns `[{ key, item, exiting }]` where exiting items keep their position for `duration` ms and re-adding an item mid-exit cancels it.
- Raw HTML is now an official, documented API: the `innerHTML` prop injects a string as raw HTML on the client (removal clears the content — previously it silently stuck), `renderToString` emits it verbatim in place of children, `hydrate` skips the injected subtree instead of stripping it, and passing `innerHTML` together with children logs a console warning. Documented in `docs/AI_SPEC.md` §8 with the sanitization caveat.
- `examples/ssr` now demonstrates `useHead` + `renderHeadToString`: the demo shows the collected `<title>`/`<meta>` head markup in a second panel next to the body HTML string. The `tutorials/ssr` video gained a matching "useHead — real SEO" step (now 5 steps, ~45 s) and was re-recorded; its `record.py` scrolls each opened panel into camera view and uses per-panel locators.
- `examples/task-manager` deleting a task now plays a fade-out via `usePresence` (list form) before the row leaves the DOM — `TaskList.js` + `.tm-task-row-exit` animation in `TaskList.css`.
- `tutorials/`: auto-generated video tutorials. Each folder is a tutorial "player" page (a real Nexa app: code pane, live demo, live form-state inspector, captions) plus a `record.py` that drives the page with real typing/clicks via Playwright and saves the screen recording — regenerating the video after any change is one command, with the same Python-only dependency as the test suite. First tutorials: `useform` (46 s, English captions) covering initialValues, `field()`, `validateOnBlur`, `dirty`/`touched` and `handleSubmit`; `basic` (~40 s), a first-app walkthrough that embeds `examples/basic` live in an iframe — no-build entry point, components as plain functions, `useState` + props, and `useTheme`/`ThemeToggle` flipping dark mode on camera; `nexa-architecture` (~44 s), a ZoomStage walkthrough driving the real 11-frame deck — frames as data, controlled index, and `controllerRef` navigation with the camera gliding between rotated frames on camera; and `ssr` (~38 s), the full SSR cycle on the real `examples/ssr` — the raw `renderToString` output opened on camera, `hydrate` adopting the server DOM with the node-reuse proof, and the hydrated buttons clicked live.

## [0.12.1] - 2026-07-11

### Fixed
- `useWebSocket` had a reconnect race: the old socket's `close` event arrives asynchronously, after a `url` change had already re-armed the shared "active" flag — so the stale handler scheduled a reconnect to the OLD url, leaving two live sockets and letting the old one clobber `status`. Each connection generation now carries its own effect-scoped flag, so a late close from a previous generation is ignored. Handlers also read callbacks and reconnect options from a per-render ref, so `onMessage`/`onOpen`/`onClose`/`onError` no longer see stale props and `reconnect`/`reconnectDelay` changes take effect. Five regression tests drive a fake `WebSocket` through connect/reconnect/url-change/unmount.
- `useIntersectionObserver` keyed its effect off `[ref.current]`, which can never detect the target changing (deps are evaluated before the render's patch updates the ref — the same anti-pattern fixed in `useSwipe`/`useLongPress`/`useVirtualList` in 0.8.0, missed in this hook). A conditionally-rendered target now gets observed when it mounts. The fix tracks the observed element's identity instead of dropping the deps array, because re-creating the observer every render would re-fire the initial observation → `setEntry` → re-render → infinite loop. Regression test with a fake `IntersectionObserver` asserts attach-on-later-mount and no observer churn.
- `useThrottle` never cancelled a pending trailing call, so `fn` (usually a setState) could fire after the component unmounted. The timer is now cleared on unmount. Regression test added.

### Added
- Test suite for the canvas add-ons (`tests/addons.test.js`, 15 tests — they previously had none): PipelineCanvas node/connection rendering and prop-driven sync, edit/delete buttons, select + Delete key, port-drag connecting (including self-connection rejection), connection delete via double-click, `controllerRef`/`zoomStep` transforms, and unmount cleanup; ZoomStage frame layout and paint order, camera fit math on mount and after `goTo`, `controllerRef` navigation with `onIndexChange`, bounds no-ops, keyboard navigation (including the form-field guard), `advanceOnClick`, and the `path` prop.

### Changed
- Example backends (task-manager, burger-shop, burger-shop-fastapi) now bind `127.0.0.1` instead of `0.0.0.0` and carry an explicit "DEMO ONLY — NOT FOR PRODUCTION" notice (in-memory store, no auth).

## [0.12.0] - 2026-07-11

### Fixed
- `useFetch` no longer round-trips `options` through `JSON.stringify`: `Headers`, `FormData`, and functions now reach `fetch()` untouched, circular objects no longer crash the render, and a user-supplied `options.signal` is chained into the internal `AbortController` (either can cancel) instead of replacing it and breaking unmount cancellation. Each request reads the latest render's options; changing options alone still does not refetch — `refetch()` or a `url` change does (now documented). Three regression tests in `tests/coverage.test.js`.
- `useForm`'s `dirty` now compares the union of initial and current value keys, so a field added dynamically via `setValue` on a form started with empty `initialValues` marks the form dirty. Regression test in `tests/hooks.test.js`.

### Changed
- `server.py` (dev server) binds `127.0.0.1` by default instead of all interfaces, so the served directory — including Git metadata when run from the repo root — is no longer exposed to the local network by accident. Pass `--host 0.0.0.0` explicitly (prints a warning) to test from other devices.
- CI now runs the browser suite on Chromium, Firefox, and WebKit (matrix) with Playwright pinned to 1.61.0; `scripts/run_browser_tests.py` gained a `--browser chromium|firefox|webkit` flag. The swipe test helper falls back to plain `Event` objects on browsers without `Touch`/`TouchEvent` constructors (Firefox desktop).
- The no-Node policy is now documented explicitly: new "No Node, By Design" section in the README, a policy block in `llms.txt` and `docs/AI_SPEC.md` §1, and `package.json` is marked `"private": true` with a note that it exists only as editor/TypeScript metadata, not an npm manifest.

## [0.11.1] - 2026-07-10

### Changed
- Dist banners and `llms.txt` now point to the stable, fetchable raw URL of the AI spec (`https://raw.githubusercontent.com/skysegbr/FluxaWay/main/docs/AI_SPEC.md`) instead of just naming the file — an AI tool with web access can pull the complete reference directly from a vendored copy.

## [0.11.0] - 2026-07-10

### Added
- AI-identification banners (`/*! … */`) at the top of every `dist/` file (JS, CSS and `.d.ts`): apps vendor these files, and AI tools analyzing such apps used to misread the frontend as generic JS/React. The banner names the framework, states the key "NOT React" semantics (eager `h()`, `ctx.provide`, no JSX/bundler) and points to `docs/AI_SPEC.md`. The minifier now preserves `/*!` banners in `.min.*` outputs (previously it stripped all comments). New `llms.txt` at the repo root summarizes the framework, the common analysis mistakes and the doc map for AI crawlers/assistants.
- `FullCodeEditor` autocomplete now works for every language, not just Python: the hint merges words already present in the buffer (via CodeMirror's `anyword-hint` addon, when the host page loads it) with a per-language keyword list (`python`, `javascript`, `sql`, `shell`, `go`, `rust`, `css`, `yaml`, C-like — MIME modes like `text/x-java` alias into the right list). Same autotrigger behavior as before (2+ chars, Ctrl+Space).
- `FullCodeEditor` new `onLint` prop: `async (code, language) → [{ line, col, message, severity }]` (1-based). When provided and the host page loads CodeMirror's `addon/lint`, diagnostics render as inline squiggles + gutter markers as you type (async, 600 ms debounce), and re-lint runs on language switch.

### Fixed
- `FullCodeEditor`'s toolbar language select covered only five languages (python/cython/golang/rust/kotlin — two of which aren't even real CodeMirror mode names), so any other mode ("javascript", "shell", …) rendered as a blank pill. It now defaults to a 20-language `DEFAULT_LANGUAGES` list (exported) of real CodeMirror modes/MIMEs including SQL, YAML, Shell, Dockerfile and plain text, accepts a `languages` prop to override the options, and always appends the current `language` as a raw option when it's missing from the list — the select can no longer render blank. Regression test in `tests/components-new.test.js`.

## [0.10.1] - 2026-07-10

### Fixed
- Component identity for unkeyed children now counts per component TYPE instead of using one global positional counter (`dist/nexa.js`, `renderComponent`). Because `h()` executes components eagerly, a conditional child (`loading && h(Spinner)`) occupies no slot when falsy; with the global counter, toggling it shifted the identity of every later sibling — remounting them, wiping their hook state, and re-running their effects (symptom in practice: a `Dialog` re-running its focus-trap effect and stealing focus from an input while the user typed). Same-type conditional siblings still require explicit keys, as documented. Regression tests in `tests/engine.test.js`.
- `useLocalStorage` setter now routes functional updates through the underlying `useState` updater instead of a closure over the rendered value, so a burst of updates within one render window (e.g. drag-resize `mousemove` events) accumulates instead of each applying to the same stale base. Regression test in `tests/coverage.test.js`.
- Overlays (`Dialog`, `Drawer`, `Menu`, `Dropdown`, `BottomSheet`, `ContextMenu`, `CommandPalette`, submenu) no longer steal focus to their first focusable element when focus is already inside the panel — the open-path autofocus now goes through a guarded `focusFirstElementIfOutside`. Escape-close trigger refocusing is unchanged (it intentionally moves focus while it is still inside the wrap). Regression test in `tests/a11y.test.js`.

## [0.10.0] - 2026-07-06

### Added
- CSS code splitting in the core (`dist/nexa.js`): new `loadCSS(href)` export — injects `<link rel="stylesheet">` once per resolved URL, returns a promise that settles on load, treats a `<link>` already in the document as loaded, evicts failed entries so retries work, and no-ops (resolves) in DOM-less runtimes so `renderToString` stays safe. New `css:` route field on `useRoutes` (href or array, with or without `lazy:`): the route's `fallback` holds until the stylesheet *and* the lazy module are ready — a lazily loaded page never flashes unstyled. TypeScript declarations in `dist/nexa.d.ts`, tests in `tests/new-features.test.js` (dedupe by resolved URL, computed-style assertion, 404 → reject + evict) and `tests/hooks.test.js` (css+lazy holds fallback until both; css-only route renders styled, link injected once).
- Code-splitting guidance across the docs, prompted by a real Angular 7 → Nexa migration that shipped every page eagerly: new "Code splitting in large apps (lazy routes)" section in `docs/AI_SPEC.md` §12 (route-level pages as `lazy:` routes by default, the leftover-static-import trap, `createLazy` at module scope, import direction pages → shared, preload on intent), plus a §6 note and §15 checklist items; new `docs/TUTORIAL.md` section "Splitting A Large App (Lazy Loading)"; the README `useRoutes` example and `createLazy` section carry the same warnings; the `nexa-expert` skill gained a "Code splitting (large apps / migrations)" workflow bullet.

## [0.9.0] - 2026-07-05

### Added
- 14 new components in `nexa-components.js` (47 → 61 exports), each with CSS in `nexa-ui.css` (where it didn't already exist), TypeScript declarations in `dist/nexa-components.d.ts`, docs in `docs/AI_SPEC.md` §9 + README tables, and tests in `tests/components-new.test.js`:
  - `RadioGroup`/`Radio` — the missing "choose one of N" form control. Native radios sharing a `name` (Arrow-key roving for free), one controlled `value`/`onChange` for the group, `inline` layout option, same label/help/error anatomy as the other fields. `docs/FORMS.md` documents wiring value-based controls to `useForm` via `setValue`.
  - `NumberInput` — numeric `TextField` sibling with −/+ steppers; clamps at `min`/`max` and rounds to the step's own decimal precision (no float drift with `step: 0.1`); `value` is a number or `null` for a cleared field.
  - `TimePicker` — `DatePicker`'s sibling for `"HH:MM"` strings: trigger + listbox of times generated between `min`/`max` every `step` minutes. Opening focuses the selected option; ArrowUp/Down/Home/End move, Enter selects, Escape closes and refocuses the trigger.
  - `Avatar`/`AvatarGroup`, `Breadcrumb`, `Skeleton`, `Divider` — component APIs over the previously CSS-only `m-avatar`/`m-breadcrumb`/`m-skeleton`/`m-divider` primitives: initials derived from `name`, `+N` overflow counter (DOM order reversed to match the group's `row-reverse` painting trick), `aria-current="page"` on the last crumb, multi-line text skeletons, `role="separator"` vertical divider.
  - `Stat`/`StatGrid` — KPI tiles (value + label + optional icon/help and a `delta` that colors itself by its leading sign) and their auto-fit grid wrapper.
  - `Popover` — generic anchored panel for arbitrary interactive content (the primitive `Tooltip`/`Dropdown`/`Menu` don't cover). Four placements, Escape/outside-click close, Escape restores focus to the trigger; Tab is deliberately not trapped (non-modal).
  - `TreeView` — WAI-ARIA tree over `{ id, label, icon?, children? }` nodes: roving tabindex across *visible* nodes, ArrowUp/Down walk, ArrowRight expands/enters, ArrowLeft collapses/climbs, Home/End jump, Enter/Space select; caret clicks toggle without selecting. Expansion is uncontrolled (`defaultExpanded`) or controlled (`expanded`/`onExpandedChange`); selection is controlled.
  - `CommandPalette` — Ctrl/Cmd-K launcher, controlled like `Dialog` (`open`/`onClose`; the global shortcut belongs to the app). Substring filtering over label/hint/section/keywords, section headers, `aria-activedescendant` listbox driven from the always-focused input, body scroll lock and focus restoration on close.
- `examples/components` pages for the batch: `Forms & Widgets` (`#/widgets` — RadioGroup, NumberInput, TimePicker, Stat, TreeView, Popover, CommandPalette with a real app-level Ctrl/Cmd+K binding firing toasts) and the existing `UI Primitives` page's Avatar/Breadcrumb/Skeleton demos rewritten to use the new components instead of raw `m-*` classes (plus a `Divider` demo).

### Changed
- `examples/new-components` renamed to `examples/components`, and its pages stopped being named by recency: `New UI` → `UI Primitives` (`components/primitives/`, `#/primitives`), the new batch page is `Forms & Widgets` (`components/widgets/`, `#/widgets`). Every page there is just "components" now — the folder name finally says so.
- Examples audit against the AI_SPEC philosophy (§3/§12): `examples/nexa-deck` split from a single 159-line `app.js` into the domain-componentized layout its siblings already use (`components/Frames.js`+`.css`, `components/FrameContent.js` kind-dispatcher, `components/PresentationToolbar.js`+`.css`; `styles.css` keeps page/stage rules and `@import`s the rest); static data hardcoded inside components moved to root `data.js` files — `task-manager` (STATUS/PRIORITY/SORT options; `PRIORITY_OPTIONS` was duplicated across `FilterBar` and `TaskDrawer`), `mobile` (FEATURES, ACTIVITY_ITEMS, EXPLORE_FILTERS, BREAKPOINTS) and `complete-page` (`ProjectDialog`'s copy of the status options); lowercase `data.js` exports renamed to UPPER_CASE (`complete-page`, `form`) and `form`'s `validateContactValues()` moved out of `data.js` into `app.js` (data files hold data only); relative `../../dist/...` imports normalized to the documented `/dist/...` form (`mobile`, `task-manager`, `burger-shop` — their `server.py` already serves the repo root); `nexa-deck/index.html` still said `lang="pt-BR"` / "Apresentacao" after the content was translated — now `lang="en"` / "Nexa - Deck".

### Fixed
- `NumberInput` treats a cleared field as `null` instead of `0`: `Number(null)`/`Number("")` are both `0`, which made an empty field read as 0 and wrongly disabled the decrement stepper at `min: 0` (caught by `tests/components-new.test.js`).
- `Breadcrumb` keys items by `item.key ?? index` instead of `href`/`label`: several crumbs sharing a placeholder `href` ("#") produced duplicate keys and corrupted reconciliation (trail rendered with items missing — caught while migrating the `UI Primitives` demos to the component).

## [0.8.0] - 2026-07-05

### Added
- Live demos for the four new components in `examples/new-components`: `components/PageSlider.js` (`Slider`, disabled state, `RangeSlider`), `components/PageMenu.js` (`Menu` with nested submenus, plus a right-aligned flat menu), `components/PageDataTable.js` (27-row sortable/paginated dataset), `components/PageDatePicker.js` (`DatePicker` basic/bounded/disabled). Wired into the nav in `app.js` (`#/slider`, `#/menu`, `#/datatable`, `#/datepicker`) and the README examples table.
  - Adding these on top of the existing 9 nav items overflowed `Navbar` onto a second line at common desktop widths (it wraps by design, with no built-in overflow menu). Fixed by dogfooding the new `Menu` component: `app.js`'s `Navbar` no longer uses `items` at all — all 13 example pages (with their icons) now live in one `Menu` dropdown in the navbar's `actions` slot, whose trigger label shows the current page's name (e.g. "DataTable ▾") so it doubles as a "you are here" indicator. Fits on one line down to 1024px wide.
- `DatePicker` in `nexa-components.js` — trigger button (labeled via `FormField`, like the other form controls) that opens a one-month calendar popover. Values are plain `"YYYY-MM-DD"` strings in/out, parsed to local-midnight `Date` objects internally so comparisons never drift across a timezone's DST boundary. Optional `min`/`max` (inclusive `"YYYY-MM-DD"` bounds) disable out-of-range days. Keyboard: roving `tabindex` over the day grid — `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown` move by day/week (panning the calendar across month boundaries as needed), `Home`/`End` jump to the start/end of the focused week, `Enter`/`Space` selects the focused day, `Escape` closes and returns focus to the trigger. New CSS in `nexa-ui.css` (`.m-datepicker`, `.m-datepicker-calendar`, `.m-datepicker-grid`, `.m-datepicker-day`, etc.). TypeScript declaration in `dist/nexa-components.d.ts`; documented in `docs/AI_SPEC.md` §9; tests in `tests/coverage.test.js`.
- `DataTable` in `nexa-components.js` — `Table` + `Pagination` combined: sorts the full row set, then renders only the current page. Reimplements Table's header/body markup directly (same `columns` shape and sort algorithm) rather than wrapping it, since Table's sort state is entirely internal and can't be observed to know which page-slice of the *sorted* rows to show. `pageSize` (default 10), controlled/uncontrolled `page`/`onPageChange`, `sortable` (default true, resets to page 1 on a new sort)/`defaultSort`/`onSort`. The `Pagination` footer only renders when `rows.length > pageSize`. New CSS in `nexa-ui.css` (`.m-data-table-pagination`; reuses Table's existing `.m-table-*` classes). TypeScript declarations in `dist/nexa-components.d.ts`; documented in `docs/AI_SPEC.md` §9; tests in `tests/coverage.test.js`.
- `Menu` in `nexa-components.js` — like `Dropdown`, but items may nest a `children` array to open a flyout submenu at any depth. Each level tracks which single child submenu is open (Accordion-style single-open), so hovering or arrowing into a sibling closes the previous one. Reuses Dropdown's base interaction model (opening focuses the first item, outside-click/Escape/Tab close everything); adds ArrowRight (or click) to open a submenu and focus its first item, and ArrowLeft to close it and return focus to the parent item. New CSS in `nexa-ui.css` (`.m-menu`, `.m-menu-list`, `.m-menu-list-submenu`, `.m-menu-button`, etc.). TypeScript declarations in `dist/nexa-components.d.ts`; documented in `docs/AI_SPEC.md` §9; tests in `tests/coverage.test.js`.
- `Slider` and `RangeSlider` in `nexa-components.js`. `Slider` wraps a native `<input type="range">` in `FormField`'s label/help/error chrome (free keyboard support — arrows/Home/End/PageUp/PageDown), with an optional `showValue` readout. `RangeSlider` stacks two native range inputs on one track for a dual-thumb control (`value`/`onChange` use a `[lower, upper]` tuple); each thumb clamps against the other so they can never cross, and each has its own `aria-label` (`minLabel`/`maxLabel`, default "Minimum"/"Maximum") since no single native element can label both. New CSS in `nexa-ui.css` (`.m-slider`, `.m-slider-input` incl. `-webkit`/`-moz` thumb/track pseudo-elements, `.m-slider-range-track`). TypeScript declarations in `dist/nexa-components.d.ts`; documented in `docs/AI_SPEC.md` §9; tests in `tests/coverage.test.js`.

### Fixed
- `scripts/validate_nexa.py` no longer flags `examples/burger-shop-fastapi/static/index.html`'s `/static/styles.css` and `/static/app.js` refs as missing. Root-relative `/static/...` paths now resolve against the nearest ancestor directory literally named `static/` (the FastAPI `StaticFiles` mount convention used by that example) instead of the repo root.
- `examples/ssr`'s "Server HTML string" preview box referenced `--m-surface-alt`, a CSS custom property that doesn't exist in `nexa-ui.css`, so it always fell back to a light background even in dark mode while the text inherited the theme's light `--m-text` — effectively invisible white-on-white. Now uses the real `--m-surface-muted` token (which does switch with the theme) plus an explicit `color`.
- Accessibility audit of `BottomSheet`, `Dropdown`, `ContextMenu`, `Combobox`, `Tooltip`, and `Tabs`/`TabPanel` in `nexa-components.js` (`Dialog`/`Drawer` were already fully covered and are unchanged):
  - `BottomSheet` now has the same modal focus lifecycle as `Dialog`/`Drawer`: initial focus lands inside on open, `Tab` is trapped within it (via the existing `trapFocus` helper), and focus is restored to the previously-focused element on close.
  - `Dropdown` and `ContextMenu`: pressing `Tab` while the menu is open now closes it (previously left it visually open with stale `open` state, since focus moving away wasn't observed). `ContextMenu` additionally gains the same initial-focus/arrow-key-nav/focus-restoration lifecycle `Dropdown` already had (reusing the existing `focusFirstElement`/`moveMenuFocus` helpers), plus a default `aria-label="Context menu"` (overridable via the new `ariaLabel` prop) since, unlike `Dropdown`, it has no trigger element to derive an accessible name from.
  - `Combobox` is now a real `aria-activedescendant`-driven combobox instead of a mouse-only filterable list: the search input gets `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant`; `ArrowUp`/`ArrowDown`/`Home`/`End` move the active option and `Enter` selects it; closing (via `Escape`, selection, or outside click) returns focus to the trigger button. `id` now defaults to `"nexa-combobox"` so generated ids (`${id}-list`, `${id}-option-${value}`) are deterministic without a caller-supplied `id`.
  - `Tooltip` text is now a real DOM node (`<span role="tooltip">`, previously CSS `content: attr(data-tooltip)` generated content with nothing for assistive tech to reference) linked via `aria-describedby` to the wrapped trigger — cloned onto it automatically when there's a single element child, otherwise set on the wrapper as a best-effort fallback. `Escape` dismisses the tooltip (a `dismissed` flag toggling a CSS class) without disturbing focus.
  - `Tabs`/`TabPanel` now use roving `tabindex` (only the selected tab is in the page's Tab order) with `ArrowLeft`/`ArrowRight`/`Home`/`End` moving focus and selection together ("automatic activation"), and each tab/panel pair is linked via `aria-controls`/`aria-labelledby` (`tab-${value}` / `panel-${value}`, derived from the existing `value`/`id` props — no new prop needed).
  - `nexa.js`'s DOM/SSR attribute-name whitelist (`attributeAlias`) was missing `ariaActivedescendant`/`ariaAutocomplete` mappings — added, since `Combobox` needed both and any future component setting either would have hit the same silent no-op (the prop would render as a literal camelCase attribute instead of `aria-*`).
  - New `dist/nexa-ui.css` rules: `.m-tooltip-bubble` (replaces the old `::after` positioning rules), `.m-combobox-option-active`, `.m-bottom-sheet:focus-visible`, `.m-tab-panel:focus-visible`.
  - Tests in new `tests/a11y.test.js` (registered in `tests/run.js`) cover all six components' keyboard nav, focus management, and ARIA wiring. `dist/nexa-components.d.ts` updated for `ContextMenu`'s new `ariaLabel` prop and `Tooltip`'s new `id` prop. Documented in `docs/AI_SPEC.md` §9.

### Added
- Test coverage for hooks/components that previously had none: `useFetch` (loading/success/error states, no-op when no `url` is given), `useLocalStorage` (initial-value fallback, reading a previously-stored JSON value, `setValue` incl. its functional-updater form), `Table` (cell rendering incl. `column.render`, the empty state, `sortable` asc/desc toggling + `onSort`), and `Dialog`/`Drawer` (backdrop-click close, title/body/actions rendering, plus the same focus-trap/initial-focus/restore-on-close lifecycle test already written for `BottomSheet` in `tests/a11y.test.js`). New `tests/coverage.test.js` (hook and general component behavior), registered in `tests/run.js`; the two new `Dialog`/`Drawer` focus-lifecycle tests live alongside the existing ones in `tests/a11y.test.js`.
- Further test coverage in `tests/coverage.test.js`: `useTheme`/`usePalette`/`useDesign` (localStorage resolution, DOM attribute + storage sync on change, unknown-value rejection, and cross-instance sync via their respective `nexa:*change` events), `useToast` (`push`/variant mapping incl. `error` → `"danger"`, default/custom `duration`, `dismiss`), `Accordion` (single-open closes the previous item, `multiple` allows several open at once, disabled items never toggle), `Stepper` (done/current step state, checkmark vs. number, connector line count), `Pagination` (ellipsis ranges, active-page marking, edge-button disabling, `onChange` on prev/next/page click), `FileDropZone` (drag-active class, `onFiles` on drop, disabled state ignores drag/drop), and `Navbar` (toggle `aria-expanded`/`aria-label`, nav-link click closes the mobile menu and fires its own `onClick`, Escape/outside-click close).
- `hydrate(component, container)` in `nexa.js`, re-exported from `dist/nexa-server.js` — SSR phase 2. Adopts server-rendered HTML (from `renderToString`) in place instead of recreating it: runs the component once, then walks the existing DOM in tandem with the new vdom, reusing element and text nodes while attaching event handlers, refs, and any missing attributes; only mismatches are rebuilt. Transparently handles the two SSR text-node quirks — adjacent text merged by the parser (split apart with `splitText`) and empty text nodes from falsey children (absent in the HTML, inserted here) — so the hydrated DOM ends up identical to a fresh client render and later `setState` updates patch normally. Portals are created fresh (not hydrated); on any hydration error it falls back to a clean client render. TypeScript declaration in `dist/nexa.d.ts` (+ `dist/nexa-server.d.ts`); documented in `docs/AI_SPEC.md` §6; tests in `tests/ssr.test.js`.
- `examples/ssr` — full SSR round-trip in the browser: `renderToString(App)` produces the HTML string (shown in a collapsible panel), it's injected into `#app` as a server would, then `hydrate(App, #app)` adopts that DOM and wires up the buttons (with a status line confirming the existing nodes were reused). Listed in the README examples table.
- `renderToString(input, props)` in `nexa.js`, re-exported from the new `dist/nexa-server.js` server entry — phase-1 server-side rendering (HTML generation for SEO / first paint), no DOM required and no build. Runs the same hook machinery as the client in a server mode where `useState`/`useReducer` return initial values, `useMemo`/`useCallback`/`useRef`/`useContext` work, `useId` is stable, and `useEffect` effects never run. Serializes attributes with the exact client name mapping (`className`→`class`, `htmlFor`→`for`, `aria*`→`aria-*`, `style` objects → CSS strings, `dataset` → `data-*`); HTML-escapes all text and attribute values (no injection); omits event handlers and refs; renders portal children inline. Accepts a component (with optional root props) or a prebuilt vnode. TypeScript declarations in `dist/nexa.d.ts` (+ `dist/nexa-server.d.ts`); documented in `docs/AI_SPEC.md` §2/§6; tests in `tests/ssr.test.js` (incl. an equivalence check against the client-rendered DOM). DOM hydration is intentionally out of scope for this phase.
- `tests/hooks.test.js` — test suite for `useForm` (initial values, `setValue`, `field.onChange`, validation error appear/disappear, `handleSubmit` blocking on invalid, `handleSubmit` calling `onSubmit` on valid) and `useRouter` hash mode (default `'/'` path, navigate + conditional re-render).
- `dist/nexa.d.ts` — TypeScript declarations covering all 39 exports of `nexa.js` (types, interfaces, and JSDoc comments for every hook, `h`, `render`, `unmount`, `memo`, `createPortal`, `createLazy`, `createContext`, `useContext`).
- `dist/nexa-components.d.ts` — TypeScript declarations for all 41 components in `nexa-components.js`.
- `"types": "dist/nexa.d.ts"` entry in `package.json`.
- `Accordion` component in `nexa-components.js`: multiple panels, controlled/uncontrolled, `multiple` prop for simultaneous expansion, keyboard (Enter/Space via native `<button>`) and `aria-expanded` + `aria-controls`/`role="region"`. Animated with the same `grid-template-rows: 0fr → 1fr` technique as `Collapse`. CSS in `nexa-ui.css` (`.m-accordion`, `.m-accordion-item`, `.m-accordion-item-open`, `.m-accordion-header`, `.m-accordion-body-wrap`, etc.). TypeScript declaration in `dist/nexa-components.d.ts`. Documented in `docs/AI_SPEC.md` §9. Live demo at `examples/new-components` (`#/accordion`).
- `scripts/minify.py` — safe, dependency-free JS/CSS minifier in pure Python (no Node, no bundler). Strips comments, indentation, blank lines, and redundant intra-line spaces while preserving every line break (so ASI can never change meaning); keeps string/template/regex literals byte-for-byte and does not rename identifiers. Rewrites local ESM import specifiers so minified modules import each other (`./nexa.js` → `./nexa.min.js`). Generates `dist/*.min.js` and `dist/*.min.css` (~25% smaller uncompressed overall). Supports `--check` mode to verify the committed minified outputs are up to date. Run directly with `python scripts/minify.py` (no Node).
- `useRoutes(routes, { mode, notFound })` and `matchPath(pattern, path, { end })` in `nexa.js` — nested routing with path params and lazy-per-route on top of `useRouter`. `matchPath` is a segment-based matcher (`:param` captures a URL-decoded segment; a trailing `*` captures the remainder; `{ end: false }` prefix-matches and returns the rest). `useRoutes` resolves the current router path against a nested route config (`{ path, index, component, element, lazy, fallback, children }`), rendering a parent route's matched child through its `outlet` prop and merging parent + child params. `lazy: () => import(...)` routes are resolved via `createLazy` and cached per route object (in a `WeakMap`) so their load state survives re-renders. First matching sibling wins. TypeScript declarations (`matchPath`, `useRoutes`, `RouteObject`, `RouteMatch`) in `dist/nexa.d.ts`; documented in `docs/AI_SPEC.md` §6; tests in `tests/hooks.test.js`.
- `examples/minified` — a demo that runs the minified build (`/dist/nexa.min.js`, `/dist/nexa-components.min.js`, `/dist/nexa-ui.min.css`) instead of the readable sources, showing the API is identical. Doubles as a live `useRoutes` nested-routing showcase (Home / Counter / About with a `*` catch-all). Listed in the README examples table.

### Changed
- CI (`.github/workflows/ci.yml`) now runs `python3 scripts/minify.py --check` alongside static validation, so a PR that edits `nexa.js`/`nexa-components.js`/`nexa-ui.css` without regenerating the matching `dist/*.min.*` files fails instead of silently shipping stale minified output.

## [0.7.2] - 2026-07-04

### Changed
- `examples/new-components` restructured from a flat `pages/` folder (grouping by type, explicitly disallowed by `docs/AI_SPEC.md`) into the domain-componentized layout: a root `data.js` for all static data, and `components/<domain>/<Name>.js` (one component per file; single-file domains — combobox, context menu, file drop, code editor, toasts — kept flat, multi-file ones — `switches/`, `cards/`, `new-ui/` — split by feature). No behavior change.

## [0.7.1] - 2026-07-04

### Fixed
- `m-card-expand` — flex-grow, image zoom, and text-fade timings now match the bedimcode reference exactly (0.5s `flex` transition, a 0.4s `scale(1.1)` zoom on the active strip's image on hover, and the data fade delayed 0.1s behind the flex expansion) instead of all firing at once with no delay.
- `m-card-float` — the info panel is now a frosted-glass surface at rest (`color-mix(in srgb, var(--m-surface) 88%, transparent)` + `backdrop-filter: blur(12px)`) that solidifies to opaque `var(--m-surface)` only for the 30%-50% stretch of each rise/sink keyframe, when it's actually moving — a translucent panel sliding over a photo mid-motion was hard to read.

### Changed
- `examples/new-components` card demos (`m-card-media`, `m-card-float`, `m-card-expand-group`) now use real hotlinked photos (Picsum Photos) instead of flat CSS gradients, so the showcase reads as a real product.

## [0.7.0] - 2026-07-04

### Added
- Card variants — CSS-only modifier classes on top of `.m-card`, adapted from a set of CSS-only reference card designs (bedimcode): `m-card-media`/`m-card-media-zoom` (image-backed card with gradient shadow overlay), `m-card-reveal` (clip-path circle info panel on hover/focus, goes on top of `m-card-media`), `m-card-float` (info panel parked below the image, genuinely clipped away via `overflow: hidden` at rest; defaults intentionally match the landscape reference card's exact proportions — 328px/348px image, centered 280px/316px panel, `bottom: -9rem`, overshoot to `-10rem`, settle at `-7rem` — overridable via `--m-card-float-*` CSS variables; on hover/focus-within the panel fades in while rising with a rise-then-settle bounce, using the same overflow-toggling-keyframe trick as the reference so it reads as growing out of the card's clipped base rather than popping in below it), `m-card-glow` (+ `-amber`/`-violet`/`-emerald`) (gradient-border card with a hover blur burst, driven by `--m-card-hue-1`/`--m-card-hue-2`), `m-card-expand-group`/`m-card-expand` (flex accordion of image strips — active card is `useState`-driven, not the CSS `:has()` trick the reference used), and `m-card-pricing` (price badge with a clipped-notch tail). See `docs/AI_SPEC.md` §9 and `examples/new-components/components/cards/PageCards.js` for a live showcase of all six.
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
