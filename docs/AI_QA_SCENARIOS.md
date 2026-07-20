# Nexa — QA Test-Scenario Catalog

> Companion to [AI_QA.md](./AI_QA.md) (the *process*). This is the *what to
> test*: a comprehensive, ID'd scenario catalog for an AI (or human) exercising
> every part of Nexa. Read AI_QA.md §0 first — **no Node, HTTP + browser, pick
> the Python with playwright.**
>
> The suite in `tests/` already automates a large share of these; this catalog
> is the full map (automated + the manual/visual gaps), so nothing is forgotten.

## How to use this catalog

- **IDs** (`SC-<area>-NN`) are stable — cite them in reports (`SC-OVL-03 fails on
  webkit`).
- **Verify column** — how to check it:
  - `suite` — the behavior is asserted by `tests/*.test.js`; run
    `run_browser_tests.py` and it's covered. Spot-check by reading the named file.
  - `browser` — load a page (an example or a scratch page) and drive it.
  - `visual` — rendering/appearance; screenshot or computed-style diff.
  - `static` — a Python/grep check, no browser.
- **Reusable baselines** (§B) are applied to many components; a component's own
  row lists only what's *beyond* the baseline.
- **Expected** is the pass condition. Anything else is a finding — file it per
  the AI_QA.md §6 format.
- A scenario that can't run (feature absent, needs a device sensor, etc.) →
  report **SKIPPED + reason**, never a silent pass.

---

## §B. Reusable baselines

Apply the relevant baseline to every component, then its specific rows.

### B-COMP — every component

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| B-COMP-1 | Renders with minimal/required props | correct root element + classes, no console error | browser |
| B-COMP-2 | Renders with `className` added | app class merges with `m-*` classes, none dropped | visual |
| B-COMP-3 | Passes through unknown DOM props (`id`, `dataset`, `aria*`, `style`) | reflected on the DOM node | browser |
| B-COMP-4 | `disabled` (where supported) | not interactive, `disabled`/`aria-disabled`, muted style | browser |
| B-COMP-5 | Long / empty / unicode / RTL text content | no overflow break, no crash, wraps/ellipsizes as designed | visual |
| B-COMP-6 | Dark mode + each palette + bootstrap skin | restyles live, contrast stays readable | visual |
| B-COMP-7 | Renders under `renderToString` without throwing | HTML string emitted, event handlers/refs omitted, values escaped | suite (ssr) |
| B-COMP-8 | Unmount runs cleanup | no leaked timers/listeners/portals after `unmount` | suite (engine) |
| B-COMP-9 | Re-render with changed props updates in place | DOM patched, not recreated; unrelated DOM/state preserved | suite (engine) |

### B-FIELD — every form field (TextField, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, Combobox, Date/TimePicker, FileDropZone…)

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| B-FIELD-1 | `label` renders and is associated | `<label for>`↔`id` (or wraps), click label focuses control | browser |
| B-FIELD-2 | Controlled value | UI reflects `value`/`checked`; typing calls `onInput`/`onChange` | suite/browser |
| B-FIELD-3 | `error` prop | error text shown, `aria-invalid`/`aria-describedby` set, error styling | browser |
| B-FIELD-4 | `help` prop | help text shown and associated via `aria-describedby` | browser |
| B-FIELD-5 | `required` / `disabled` | attribute reflected; disabled not focusable/editable | browser |
| B-FIELD-6 | Keyboard only | reachable by Tab, operable by the control's native keys | browser |

### B-OVERLAY — every overlay (Dialog, Drawer, Dropdown, Popover, Menu, ContextMenu, BottomSheet, CommandPalette, Tooltip)

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| B-OVL-1 | Open via trigger / `open` prop | overlay appears (portal where applicable), positioned correctly | browser |
| B-OVL-2 | Initial focus | moves into the overlay (first focusable / named element) | suite (a11y) |
| B-OVL-3 | Focus trap | Tab / Shift+Tab cycle inside; focus can't escape | suite (a11y) |
| B-OVL-4 | Escape closes | closes and **returns focus to the trigger** | suite (a11y) |
| B-OVL-5 | Outside click / backdrop closes (where designed) | closes; inside click doesn't | browser |
| B-OVL-6 | Scroll/resize while open | stays anchored; body scroll locked where designed | visual |
| B-OVL-7 | `ariaModal`/`role`/`aria-label(ledby)` | correct roles and labels | suite (a11y) |
| B-OVL-8 | Exit transition (usePresence) | element stays mounted through its exit animation, then removed | suite |

### B-LIST — collection components (Table, DataTable, TreeView, Accordion, lists)

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| B-LIST-1 | Empty data | renders empty/placeholder state, no crash | browser |
| B-LIST-2 | 1 item / many items (1k+) | correct render; no O(n²) jank at 1k | visual/perf |
| B-LIST-3 | Keyed reorder / insert / remove | rows keep identity + state (no state bleed), correct DOM moves | suite (engine) |
| B-LIST-4 | Missing `key` | warns / documented degradation, no silent state corruption | suite |

---

## §1. Core rendering & reconciler — `SC-CORE`

| ID | Scenario | Steps / input | Expected | Verify |
|---|---|---|---|---|
| SC-CORE-01 | `h(tag, props, ...children)` | element, mixed children (string/number/vnode/array) | correct DOM tree, numbers stringified | suite |
| SC-CORE-02 | `h(Component, props)` runs eagerly | component fn with a side-effect log | executes immediately at `h()` time, not deferred | suite |
| SC-CORE-03 | `render(App, container)` | function reference | mounts; `render(h(App),…)` throws the documented error | suite |
| SC-CORE-04 | `Fragment` | multiple roots, no wrapper | children flattened, no extra element | suite |
| SC-CORE-05 | Conditional child `cond && h(...)` | toggle cond | falsey occupies no slot; sibling positions stable | suite |
| SC-CORE-06 | List `map` with `key` | reorder/insert/remove | DOM nodes reused by key, state preserved (B-LIST-3) | suite |
| SC-CORE-07 | List without `key` | reorder | documented degraded behavior, no crash | suite |
| SC-CORE-08 | Event props `onX` | click/input/keydown/custom `onFooBar` | listener attached as `foobar`; removed on prop change/unmount | suite |
| SC-CORE-09 | `style` object + CSS string + `--var` | both forms + custom property | applied correctly; camelCase→kebab | suite |
| SC-CORE-10 | `dataset` / `aria*` / boolean props | set true/false/null | `data-*`, `aria-*` strings; boolean attr add/remove | suite |
| SC-CORE-11 | `ref` object + callback ref | attach/detach | `.current` set; callback called with node then null on unmount | suite |
| SC-CORE-12 | `innerHTML` prop | set string / null / with children | injects raw; clears on null; warns + drops children if both | suite |
| SC-CORE-13 | `createPortal` | into `document.body` | children mount at target; events bubble logically; cleaned on unmount | suite |
| SC-CORE-14 | Subtree re-render scope | `setState` in a child | only owner + subtree re-run; ancestors/siblings don't | suite |
| SC-CORE-15 | Root/fragment-output component | state at root | falls back to root pass, still correct | suite |
| SC-CORE-16 | SVG namespace | `<svg><path>` | elements created in SVG namespace | suite |
| SC-CORE-17 | `unmount(container)` | mounted app | DOM removed, all effect cleanups run | suite |

## §2. Context — `SC-CTX`

| ID | Scenario | Steps | Expected | Verify |
|---|---|---|---|---|
| SC-CTX-01 | `ctx.provide(value, () => h(Child))` | consumer reads value | consumer gets provided value (not default) | suite |
| SC-CTX-02 | Provider-component antipattern | `h(Provider, null, h(App))` | consumer sees **default** (documented eager-eval trap) | suite |
| SC-CTX-03 | Nested `.provide()` composition | 2+ contexts | each consumer resolves its own context | suite |
| SC-CTX-04 | Value change re-renders consumers | update provided object | memo boundaries below re-render when value changes (Object.is) | suite |
| SC-CTX-05 | `useContext` outside a provider | no provider | returns `createContext` default | suite |

## §3. Hooks — state & lifecycle — `SC-HOOK`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-HOOK-01 | `useState` initial + set + functional update | value updates; `setCount(p=>p+1)` batches correctly | suite |
| SC-HOOK-02 | Multiple `setState` in one tick | coalesced into one render (queueMicrotask) | suite |
| SC-HOOK-03 | `useReducer` dispatch + lazy `init` | state transitions; init runs once | suite |
| SC-HOOK-04 | `useEffect` deps change / `[]` / no-deps | runs on change / once / every render | suite |
| SC-HOOK-05 | `useEffect` cleanup | prior cleanup runs before next effect + on unmount | suite |
| SC-HOOK-06 | `useEffect` does NOT run in SSR | `renderToString` | effect body skipped | suite (ssr) |
| SC-HOOK-07 | `useRef` DOM + mutable box | `.current` persists; box change → no re-render | suite |
| SC-HOOK-08 | `useMemo` / `useCallback` deps | recompute only when deps change; stable identity otherwise | suite |
| SC-HOOK-09 | `useErrorBoundary.guard` | child throws in render | error captured, fallback shown, `reset()` recovers | suite |
| SC-HOOK-10 | Hook order rule | hook inside `if` | documented breakage — must fail loudly, not corrupt | suite |
| SC-HOOK-11 | `useId` stable across re-renders | same id every render; unique per instance; SSR-stable | suite |
| SC-HOOK-12 | `memo(Comp)` + custom compare | skips re-render on shallow-equal props; re-renders on context/subtree change | suite |

## §4. Hooks — async & storage — `SC-HAS`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-HAS-01 | `useFetch(url)` happy path | `loading→data`; `error` null | suite/browser |
| SC-HAS-02 | `useFetch(null)` | skips; no request | suite |
| SC-HAS-03 | `useFetch` error (404/network) | `error` set, `data` null | browser |
| SC-HAS-04 | `refetch()` | re-runs same request | suite |
| SC-HAS-05 | Options change without url change | does NOT refetch until `refetch()`/url change | suite |
| SC-HAS-06 | Unmount mid-flight | internal AbortController aborts; no setState-after-unmount | suite |
| SC-HAS-07 | User `options.signal` | either user signal or internal abort cancels | suite |
| SC-HAS-08 | `useLocalStorage` | persists across reload; multi-instance sync; JSON round-trip; corrupt value tolerated | browser |
| SC-HAS-09 | `useWebSocket` | `connecting→open`; `send(obj)` JSON-serializes; auto-reconnect on drop; `closed`/`error` states | browser |

## §5. Hooks — routing — `SC-RTE`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-RTE-01 | `useRouter()` hash mode | `#/path` navigates; `path`/`params` update; back/forward work | suite/browser |
| SC-RTE-02 | Plain `<a href="#/x">` | navigates without full reload | browser |
| SC-RTE-03 | `useRouter({mode:'history'})` | pushState nav; same-origin `<a>` intercepted; modified/download/`#frag` clicks pass through | browser |
| SC-RTE-04 | History mode deep-load | direct load of `/x` needs SPA fallback (documented); 404 on plain static server | browser |
| SC-RTE-05 | `matchPath` cases | `:param`, trailing `*`, `{end:false}` remainder, no-match → null | suite |
| SC-RTE-06 | `useRoutes` nested + `outlet` | parent renders child via outlet; params merge parent+child | suite/browser |
| SC-RTE-07 | `index` route | matches parent exact path | suite |
| SC-RTE-08 | catch-all `*` order | first match wins; specific-before-catchall | suite |
| SC-RTE-09 | `lazy` route + `fallback` | fallback until module loads; load state cached across re-render; error → boundary | browser |
| SC-RTE-10 | `css` route field | fallback holds until CSS (+ lazy JS) ready; no unstyled flash | browser |

## §6. Hooks — theme / palette / design — `SC-THM`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-THM-01 | `useTheme` toggle | `data-theme` on `<html>`; `localStorage('nexa-theme')`; no provider needed | browser |
| SC-THM-02 | Multiple `useTheme` in sync | all instances update via `nexa:themechange` event | browser |
| SC-THM-03 | `usePalette` set/custom | `data-palette`; `setCustomColor(hex)` writes `--m-primary`, derives shades; invalid hex ignored | browser |
| SC-THM-04 | `usePalette` invalid name | `setPalette('x')` no-op | suite |
| SC-THM-05 | `useDesign` bootstrap | `data-design="bootstrap"` only skins when `nexa-bootstrap.css` loaded; composes with theme/palette | visual |

## §7. Hooks — utility & mobile — `SC-UTL`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-UTL-01 | `useDebounce(value, ms)` | updates only after ms of silence | suite |
| SC-UTL-02 | `useThrottle(fn, ms)` | fires at most once per ms | suite |
| SC-UTL-03 | `useMediaQuery(q)` | reactive boolean; updates on viewport change | browser |
| SC-UTL-04 | `useIntersectionObserver(ref, {threshold, once})` | entry updates; `once` stops after first intersect | browser |
| SC-UTL-05 | `useVirtualList(rows, {itemHeight})` | only visible rows in DOM; `totalHeight` spacer; scroll reveals rows | browser/perf |
| SC-UTL-06 | `useTranslation(dict)` | `t('k',{name})` interpolates; missing key fallback | suite |
| SC-UTL-07 | `useHistory` | undo/redo; `canUndo/canRedo`; `limit` caps stack | suite |
| SC-UTL-08 | `usePresence` boolean | mounted through exit anim; re-add mid-exit cancels | suite |
| SC-UTL-09 | `usePresence` list + `getKey` | exiting items keep position; keys via `key`/`id`/item | suite |
| SC-UTL-10 | `useContextMenu` | `openMenu(e)` sets `{open,x,y}`; `closeMenu` | browser |
| SC-UTL-11 | `useSwipe` (touch) | left/right/up/down callbacks past `threshold` | browser (touch) |
| SC-UTL-12 | `useLongPress` | fires after `delay`; cancels on early release/move | browser (touch) |
| SC-UTL-13 | `useNetworkStatus` / `useOrientation` / `useVibrate` | reflect `navigator`/events; `vibrate()` calls API (no-op where unsupported) | browser |
| SC-UTL-14 | `loadCSS(href)` | injects `<link>` once, dedupes by URL; resolves on load; rejects+evicts on error; no-op in DOM-less runtime | suite |
| SC-UTL-15 | `createLazy(loader, fallback)` | shows fallback then component; module-scope only; error throws → boundary | browser |

## §8. Component utilities & security — `SC-UTILC`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-UTILC-01 | `safeUrl` safe inputs | http(s), relative, `#`, `mailto:`, `tel:`, `//host`, `data:image/*` → returned unchanged | suite (security) |
| SC-UTILC-02 | `safeUrl` blocked schemes | `javascript:`, `vbscript:`, non-image `data:`, with whitespace/`\t`/`\n`/case tricks → fallback (`""`) | suite (security) |
| SC-UTILC-03 | `safeUrl` custom fallback + nullish | `safeUrl(x,'#')`; `null`/`undefined`/`false`→fallback | suite (security) |
| SC-UTILC-04 | `safeUrl` in DOM + SSR | blocked href never yields `javascript:` protocol; SSR html omits the scheme | suite (security) |

## §9. UI components — apply baselines + these specifics

### §9.1 Core — `SC-C-CORE`
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-CORE-01 | Button | all 5 variants (text/contained/tonal/danger/outline); `type` submit/reset in a form; loading/disabled; click fires once | browser |
| SC-C-CORE-02 | IconButton | required `label`→`aria-label`; icon-only a11y name | browser |
| SC-C-CORE-03 | Card | `padded`; `m-card-hover`; media/reveal/glow/expand/pricing/float variants render + hover reveal | visual |
| SC-C-CORE-04 | Alert | 4 variants; `title`; dismissible if provided | browser |
| SC-C-CORE-05 | Badge/Chip | Chip `active` toggle + `onClick`; Badge status classes | browser |
| SC-C-CORE-06 | Avatar/AvatarGroup | initials from `name`; `src` image; sizes xs–xl; group `max`→"+N" overflow | visual |
| SC-C-CORE-07 | Progress/Spinner | Progress value 0/50/100 + indeterminate; Spinner `label` a11y | browser |
| SC-C-CORE-08 | Skeleton/EmptyState/Divider | Skeleton variants; EmptyState title/description; Divider horizontal + vertical `role=separator` | visual |
| SC-C-CORE-09 | FormField | wraps label+control+help/error; associates ids | browser |

### §9.2 Forms — `SC-C-FORM` (+ B-FIELD)
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-FORM-01 | TextField | types text/email/password/number/search/tel; error/help | browser |
| SC-C-FORM-02 | Textarea | rows; grows/scrolls with content | browser |
| SC-C-FORM-03 | Select | options; controlled `value`; `onChange` | browser |
| SC-C-FORM-04 | Checkbox/Switch | `checked`/`onChange(e.target.checked)`; indeterminate if supported | browser |
| SC-C-FORM-05 | Radio/RadioGroup | single-select; Arrow-key roving; shared `name`; `inline`; disabled option | suite/browser |
| SC-C-FORM-06 | Slider | native range; keyboard; `showValue` | browser |
| SC-C-FORM-07 | RangeSlider | dual thumb `[lo,hi]`; thumbs clamp against each other; per-thumb aria-label | browser |
| SC-C-FORM-08 | NumberInput | −/+ steppers clamp min/max; step precision (no float drift); Arrow keys; `null` cleared | suite/browser |
| SC-C-FORM-09 | Combobox | search filters; Arrow/Home/End/Enter via `aria-activedescendant`; Esc closes + refocus trigger | suite (a11y) |
| SC-C-FORM-10 | DatePicker | calendar popover; roving grid Arrows cross months; Home/End week; min/max bounds; Enter selects; Esc refocus | suite (a11y) |
| SC-C-FORM-11 | TimePicker | option listbox every `step` min; min/max; Arrow/Home/End; Enter; Esc refocus | suite (a11y) |
| SC-C-FORM-12 | FileDropZone | drag-drop + click browse; `accept` filter; `multiple`; `progress` bar; disabled | browser |
| SC-C-FORM-13 | CodeEditor | wraps CodeMirror/Monaco if on `window`; `value`/`onChange`/`mode`; graceful if none present | browser |

### §9.3 Overlay — `SC-C-OVL` (+ B-OVERLAY)
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-OVL-01 | Dialog | size variants; backdrop; `ariaModal`; nested dialog | suite (a11y) |
| SC-C-OVL-02 | Drawer | side (left/right/top/bottom); swipe/backdrop close | browser |
| SC-C-OVL-03 | Dropdown/Menu | keyboard open + Arrow nav; select closes; outside-click | suite (a11y) |
| SC-C-OVL-04 | Tooltip | hover + focus show; Esc/blur dismiss; `usePresence` exit; not trapping focus | suite (a11y) |
| SC-C-OVL-05 | Popover | anchored; toggle; outside-click close; flips at viewport edge | browser |
| SC-C-OVL-06 | ContextMenu | `onContextMenu` opens at cursor; keyboard nav; Esc | suite (a11y) |
| SC-C-OVL-07 | BottomSheet | opens; focus first; Tab trap; restore focus; drag-to-dismiss | suite (a11y) |
| SC-C-OVL-08 | CommandPalette | open shortcut; type filters; Arrow/Enter runs; Esc closes | browser |
| SC-C-OVL-09 | Toast/ToastStack | `toast.success/error/warning/info`; auto-dismiss; `dismiss(id)`; stack order; `ariaLive` | browser |

### §9.4 Data — `SC-C-DATA` (+ B-LIST)
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-DATA-01 | Table | columns/rows; `align`; `sortable` toggles asc/desc; `getRowKey` | suite/browser |
| SC-C-DATA-02 | DataTable | sorts full set then paginates; footer only when rows>pageSize; controlled/uncontrolled page; `onSort`/`onPageChange` | browser |
| SC-C-DATA-03 | Pagination | prev/next/jump; disabled at bounds; current highlighted | browser |
| SC-C-DATA-04 | Stat/StatGrid | value/label/delta; grid layout | visual |
| SC-C-DATA-05 | TreeView | expand/collapse; keyboard nav; nested depth | browser |
| SC-C-DATA-06 | Accordion | single vs `multiple`; `defaultOpen`; controlled `open`/`onToggle`; disabled panel; grid-rows animation | suite/browser |
| SC-C-DATA-07 | Collapse | toggle; `defaultOpen`; animates height | browser |

### §9.5 Nav — `SC-C-NAV`
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-NAV-01 | Tabs/TabPanel | select by click + Arrow keys; `aria-selected`/`role=tab`/`tabpanel`; panel swaps | suite (a11y) |
| SC-C-NAV-02 | Navbar/AppBar | brand + actions; responsive collapse | visual |
| SC-C-NAV-03 | BottomNav | active item; `aria-current`; mobile shell offset | browser |
| SC-C-NAV-04 | Breadcrumb | trail; separators; last item current, not a link | browser |
| SC-C-NAV-05 | Stepper | steps; active/complete; horizontal/vertical | visual |
| SC-C-NAV-06 | FAB | `label` a11y; `extended` shows text; positioned | browser |
| SC-C-NAV-07 | SpeedDial | expands IconButton row; `orbit`; closes on outside/select; own state | browser |
| SC-C-NAV-08 | SwipeableListItem | swipe reveals actions; snaps back; keyboard alternative | browser (touch) |

### §9.6 Theme — `SC-C-THM`
| ID | Component | Specific scenarios | Verify |
|---|---|---|---|
| SC-C-THM-01 | ThemeToggle | toggles theme, reflects current, a11y label | browser |
| SC-C-THM-02 | PaletteSwitcher | lists palettes; selects; custom color input (squared vs round presets) | browser |
| SC-C-THM-03 | DesignSwitcher | switches nexa↔bootstrap; inert without bootstrap.css | browser |

## §10. Forms integration — `SC-FORM`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-FORM-01 | `useForm` field spread | `{...field('email')}` wires name/value/error/onBlur/onInput/onChange | suite |
| SC-FORM-02 | `validate` on submit | errors block submit, surface per field | suite |
| SC-FORM-03 | `handleSubmit` async | `isSubmitting` true during, false after; success/failure paths | suite/browser |
| SC-FORM-04 | Validate on blur vs submit | error appears per configured timing | browser |
| SC-FORM-05 | Native submit (Enter) | submits form; `type=submit` Button triggers | browser |

## §11. SSR & hydration — `SC-SSR`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-SSR-01 | `renderToString(App/props/vnode)` | correct HTML; `className`→`class`, `htmlFor`→`for`, `aria*`, style objects, dataset mapped | suite |
| SC-SSR-02 | Escaping | all text + attr values HTML-escaped (`<`,`>`,`&`,`"`); no injection | suite |
| SC-SSR-03 | Handlers/refs omitted; portals inline | no `onX`/ref in output; portal children inline | suite |
| SC-SSR-04 | `renderToString` hooks | useState/Reducer → initial; useMemo/Ref/Context work; useId stable; effects skipped | suite |
| SC-SSR-05 | `hydrate(App, container)` | reuses server DOM, attaches handlers/refs, patches only mismatches | suite |
| SC-SSR-06 | Hydration text-node quirks | adjacent merged text split; empty falsey text handled → identical to client render | suite |
| SC-SSR-07 | Hydration mismatch fallback | throws → clean client render fallback | suite |
| SC-SSR-08 | `useHead` + `renderHeadToString` | title/meta collected, escaped, deduped by name/property; last-writer-wins | suite |
| SC-SSR-09 | Full round-trip in browser | `examples/ssr`: server HTML hydrates, interactions live, no console mismatch | browser |

## §12. Add-ons — `SC-ADDON`

### ZoomStage (`SC-ZOOM`) — examples: nexa-deck, zoom-stage, nexa-architecture, nexa-atlas
| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-ZOOM-01 | Frames render on canvas | all frames present, positioned | browser |
| SC-ZOOM-02 | Navigate next/prev/click frame | camera flies to target; smooth; correct frame active | browser |
| SC-ZOOM-03 | Keyboard (arrows/space) | advances/retreats | browser |
| SC-ZOOM-04 | Wrap last→first | no error, wraps | suite (addons) |
| SC-ZOOM-05 | `controllerRef` API | imperative goto works | suite (addons) |
| SC-ZOOM-06 | Live content in a frame | interactive Nexa UI inside a frame still works | browser |

### nexa-motion (`SC-MOTION`) — examples: nexa-motion, motion-landing, motion-editor
| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-MOTION-01 | `createTimeline`/`useTimeline` play | tweens transform/opacity over time | suite (motion) |
| SC-MOTION-02 | play/stop/gotoAndPlay/gotoAndStop | correct playhead + frame-script execution | suite |
| SC-MOTION-03 | Easings + `stagger` | Penner easings applied; cascade offsets | suite |
| SC-MOTION-04 | Motion guide (`path`, `orient`) | follows SVG curve; rotates to tangent; holds boundary outside span | suite |
| SC-MOTION-05 | Color tween + discrete `set` | RGBA lerp; step styles hold + clear on backward seek | suite |
| SC-MOTION-06 | loop/reverse/setSpeed | finite loop budget restored on replay | suite |
| SC-MOTION-07 | Nested movie clip | child timeline runs independently | suite |
| SC-MOTION-08 | Bad track/`onFrame` | throws at construction, not NaN poisoning | suite |
| SC-MOTION-09 | Motion-editor flows | drag keyframe (25ms snap), ruler scrub, undo/redo, multi-select, copy/paste, guide draw, code export round-trip, scenes/symbols | suite (motion-editor) |
| SC-MOTION-10 | SSR-safe | no rAF in DOM-less runtime; stays parked | suite |

### PipelineCanvas (`SC-CANVAS`) — example: mindmap
| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-CANVAS-01 | Nodes render + drag | pointer-captured drag moves node | suite (addons) |
| SC-CANVAS-02 | Connections | draw/attach edges between ports | suite/browser |
| SC-CANVAS-03 | Pan / zoom / minimap | canvas transforms; minimap reflects | browser |
| SC-CANVAS-04 | `controllerRef` | imperative add/remove nodes | suite |

### FullCodeEditor (`SC-EDITOR`) — example: designer
| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-EDITOR-01 | Renders + edits | typing updates value; highlighting + line numbers | browser |
| SC-EDITOR-02 | Snippet catalog (`BOILERPLATE`) | insert snippet works | browser |
| SC-EDITOR-03 | Vendored CodeMirror | loads from `assets/` (not a registry) | static |

## §13. CSS framework — `SC-CSS`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-CSS-01 | 12-col grid + breakpoints | `m-col-*`/`-sm/-md/-lg/-xl` reflow at sm/md/lg/xl | visual |
| SC-CSS-02 | Utilities | display/spacing/text/flex/gap/position utilities apply (and win via `!important` by design) | visual |
| SC-CSS-03 | Dark mode | `data-theme=dark` recolors tokens; contrast OK | visual |
| SC-CSS-04 | Palettes (6 + custom) | each preset light+dark; custom color derives shades | visual |
| SC-CSS-05 | Bootstrap skin | `data-design=bootstrap` + bootstrap.css restyles; inert without it | visual |
| SC-CSS-06 | Category CSS = monolith | base+all categories renders byte-identical to `nexa-ui.css` (AI_QA.md §3.2) | visual |
| SC-CSS-07 | Category subset completeness | each example loads exactly the categories it uses (no unstyled) | static (validate) |
| SC-CSS-08 | Mobile shell classes | app-bar/bottom-nav offsets; safe-area insets | visual |

## §14. Accessibility (cross-cutting) — `SC-A11Y`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-A11Y-01 | Keyboard-only traversal of a full example | every control reachable + operable; logical order | browser |
| SC-A11Y-02 | Visible focus ring | focus always visible on interactive elements | visual |
| SC-A11Y-03 | Overlays trap+restore focus | (B-OVL-3/4) across Dialog/Drawer/Sheet/Menu | suite (a11y) |
| SC-A11Y-04 | ARIA roles/names | landmarks, buttons, inputs, listboxes correctly labeled | browser |
| SC-A11Y-05 | `aria*` string values | passed as `"true"`/`"false"` strings, not booleans (documented) | suite |
| SC-A11Y-06 | Reduced motion | animations respect `prefers-reduced-motion` where applicable | visual |
| SC-A11Y-07 | Color contrast | text/UI meets WCAG AA in light + dark + each palette | visual |

## §15. Security — `SC-SEC`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-SEC-01 | `safeUrl` matrix | SC-UTILC-01..04 | suite |
| SC-SEC-02 | `innerHTML` unsanitized | documented; app must sanitize; combining with children warns+drops | suite |
| SC-SEC-03 | SSR escaping blocks injection | crafted `<script>`/`"` in text/attr stays escaped | suite (ssr) |
| SC-SEC-04 | No-build supply-chain | `dist/*.js` import nothing external; no `eval`/`new Function`/`document.write` | static (grep) |
| SC-SEC-05 | Dev server scope | `server.py` binds 127.0.0.1 by default; warns on `--host 0.0.0.0` | static/browser |

## §16. Build & tooling — `SC-BUILD`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-BUILD-01 | `validate_nexa.py` | passes on clean tree; flags each injected defect (unresolved import, missing asset, monolith >250 lines, version desync, missing example CSS category) | static |
| SC-BUILD-02 | `minify.py --check` | green when synced; fails + names stale file when a source changed without regen | static |
| SC-BUILD-03 | `minify.py` correctness | minified JS behaves identically (suite passes on `.min` too); `/*!` banners preserved; import specifiers rewritten to `.min` | suite/static |
| SC-BUILD-04 | `split_css.py --check` / `--list` | check green when synced; `--list` maps every section; unmapped section = hard error | static |
| SC-BUILD-05 | `split_css.py` losslessness | base+categories reconstruct `nexa-ui.css` byte-for-byte | static |
| SC-BUILD-06 | `bundle.py` python engine | one JS + one CSS; `@import` inlined; assets copied/rewritten; app renders | browser (smoke) |
| SC-BUILD-07 | `bundle.py --setup-esbuild` + esbuild engine | builds esbuild from Go source (no Node/npm); tree-shaken output renders | browser (smoke) |
| SC-BUILD-08 | `bundle.py --smoke` | headless render, no page errors, no local 404 | browser |
| SC-BUILD-09 | `server.py` HMR | edit a `.js/.css/.html` → SSE reload event → browser reloads | browser |
| SC-BUILD-10 | CI parity | `.github/workflows/ci.yml` runs validate + split-check + minify-check + suite×3 | static |

## §17. Example apps — `SC-APP`

Run the §3.1 per-example checklist against **every** dir in `examples/`
(~32). Priority + notable per-app scenarios:

| ID | Example | Notable scenarios | Verify |
|---|---|---|---|
| SC-APP-01 | task-manager | CRUD tasks, filter, persistence, drag/reorder | browser |
| SC-APP-02 | complete-page / components | full component gallery renders; every component styled (monolith CSS) | visual |
| SC-APP-03 | storefront | product grid, cart, forms, overlays | browser |
| SC-APP-04 | form | validation, field types, submit states | browser |
| SC-APP-05 | mobile | app-bar/bottom-nav/bottom-sheet, swipe, safe-area | browser (touch) |
| SC-APP-06 | ssr | hydration round-trip (SC-SSR-09) | browser |
| SC-APP-07 | nexa-deck / zoom-stage | ZoomStage nav (SC-ZOOM) | browser |
| SC-APP-08 | nexa-motion / motion-editor | motion + editor (SC-MOTION) | browser |
| SC-APP-09 | mindmap | PipelineCanvas (SC-CANVAS) | browser |
| SC-APP-10 | designer | FullCodeEditor + live preview | browser |
| SC-APP-11 | charts / gallery / landing / synth-panel / transit-map / star-atlas / space(craft)/journey | domain-specific render + interaction; console clean | visual |
| SC-APP-12 | category-CSS examples | render == monolith (SC-CSS-06), links complete (SC-CSS-07) | visual/static |

## §18. Cross-browser & performance — `SC-XB`

| ID | Scenario | Expected | Verify |
|---|---|---|---|
| SC-XB-01 | Suite on chromium + firefox + webkit | all green on all three | suite |
| SC-XB-02 | Priority examples on all three | render + core interactions consistent | browser |
| SC-XB-03 | 1k-row Table / DataTable / VirtualList | no jank; virtual list keeps DOM small | perf |
| SC-XB-04 | Rapid state churn (20Hz updates) | subtree isolation holds; no dropped frames on unrelated tree | perf |
| SC-XB-05 | `benchmark_examples.py` | per-page payload/timing within expected range vs `docs/benchmarks` | perf |
| SC-XB-06 | Payload of category CSS | core-only page ≈ half the monolith (before gzip) | static |

---

## Coverage summary (where automation already lives)

`suite`-flagged rows are largely covered by: `engine`, `hooks`, `new-features`,
`v02-features`, `coverage`, `components-new`, `categories`, `ssr`, `a11y`,
`addons`, `motion`, `motion-editor`, `security` test files. `browser`/`visual`/
`perf` rows are the **manual gaps** — the highest-value place for an AI tester to
add signal, because the automated suite does not open the example apps or judge
appearance. Prioritize: §11 SSR round-trip, §9 overlay/form a11y in real apps,
§13 CSS themes/palettes, §17 example smokes, §18 cross-browser.
