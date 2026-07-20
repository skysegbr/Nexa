# Nexa — AI QA Runbook

> For an **AI assistant running QA on Nexa** (not generating app code — that's
> [AI_SPEC.md](./AI_SPEC.md)). Read §0 before running anything: Nexa's QA is
> Python + a real browser, never Node, and a wrong runtime makes every result
> meaningless.
>
> Goal of a QA pass: prove the framework, components, add-ons, examples and
> build tooling still behave correctly, over HTTP, in a real browser, on every
> supported engine — and report findings in a form a human can act on.

---

## 0. Non-negotiable environment rules

Get these wrong and your results are noise.

### 0.1 No Node. Ever.

Nexa is **no-build, zero-dependency, browser ESM**. There is no npm package, no
`node_modules`, no bundler in the dev/test loop.

- **Never** run `node <file>.js`, `node --check`, `npm test`, `npm install`,
  `npx <anything>` against Nexa code. The modules import absolute `/dist/...`
  specifiers and touch `document`/`window`; Node cannot resolve or run them.
- A Node failure proves **nothing** about the code. Do not "fix" code to satisfy
  Node, and do not install Node to "check" anything.
- All tooling is Python standard library + (for browser runs) `playwright`.

### 0.2 Pick the Python that has playwright

Two runtimes are usually in play:

- **Static / sync tooling** (`validate_nexa.py`, `minify.py`, `split_css.py`) —
  any Python 3.10+. Use the repo's default `python`.
- **Anything that drives a browser** (`run_browser_tests.py`, `bundle.py
  --smoke`, `benchmark_examples.py`) — needs the Python that has **playwright**
  installed, which is often a *different* interpreter from the project venv.

Detect it before running browser QA:

```bash
python  -c "import playwright; print('default python OK')" 2>/dev/null || \
python3 -c "import playwright; print('system python3 OK')"
```

Use whichever prints OK for browser steps (commonly `/usr/bin/python3`). If
neither has it: `pip install playwright && playwright install chromium firefox webkit`
— **pip, not npm**.

### 0.3 Served over HTTP, judged in a browser

Every automated browser check serves the repo root over HTTP and loads a page.
For manual checks, `python server.py` (dev server + live reload) and open the
URL it prints. The browser console is the source of truth, not any Node output.

### 0.4 Where things live

```
scripts/validate_nexa.py       static gate (imports, assets, guards, sync)
scripts/run_browser_tests.py    the ~300-test engine/component/add-on suite
scripts/minify.py               regenerate/verify dist/*.min.*
scripts/split_css.py            regenerate/verify dist/nexa-ui-<cat>.css
scripts/bundle.py               optional production bundler (+ --smoke)
scripts/benchmark_examples.py   payload/timing benchmark for examples
server.py                       dev server for manual QA
tests/                          the browser suite (run.js registers *.test.js)
examples/                       32 example apps to smoke visually
.github/workflows/ci.yml        the canonical gate order CI enforces
```

---

## 1. QA gates, fast → slow

Run in this order; stop and report if a **blocking** gate fails (later gates
assume earlier ones passed). CI (`.github/workflows/ci.yml`) enforces 1.1–1.4.

| # | Gate | Command | Pass signal | Blocking |
|---|---|---|---|---|
| 1.1 | Static validation | `python scripts/validate_nexa.py` | `Nexa static validation passed.` (exit 0) | yes |
| 1.2 | Category CSS in sync | `python scripts/split_css.py --check` | `All 7 category CSS files are up to date.` | yes |
| 1.3 | Minified files in sync | `python scripts/minify.py --check` | `All N minified outputs are up to date.` | yes |
| 1.4 | Engine suite × 3 engines | `python3 scripts/run_browser_tests.py --browser {chromium,firefox,webkit}` | `NNN/NNN passed (<engine>)` (exit 0) | yes |
| 1.5 | Bundle smoke (opt.) | `python3 scripts/bundle.py <app> --smoke` | renders headlessly, no page errors, no local 404s | no |
| 1.6 | Manual/visual QA | §3 | per-example checklist clean | no (but required for a release) |

**1.1 Static validation** catches: unresolved local imports, missing HTML/JS
assets, unbalanced brackets, the 250-line monolith guard, `package.json`↔
`CHANGELOG` version sync, and that every example loading the per-category CSS
loads every category it actually uses (a missing category = silent unstyled
render). Any output other than `Nexa static validation passed.` lists concrete
`path: message` issues — fix or report each.

**1.2 / 1.3 sync gates** fail when someone edited a source file
(`dist/nexa-ui.css`, a `dist/*.js`) but didn't regenerate its derived outputs.
The fix is to run the generator without `--check` (`python scripts/split_css.py`
then `python scripts/minify.py`) and commit the result — **do not** hand-edit a
`.min.*` or `nexa-ui-<cat>.css` file (they're generated; edit the source).

**1.4 must pass on all three engines** (chromium, firefox, webkit) — Nexa
targets each. A test that passes on chromium but fails on webkit is a real bug,
not flake; report the engine.

---

## 2. The automated suite (§1.4) in detail

`tests/index.html` imports `dist/nexa.js` and asserts against the real DOM — no
test framework, no build. `tests/run.js` imports every `*.test.js` and exposes
the outcome on `window.__nexaTestResults`, which `run_browser_tests.py` reads.

Coverage (~300 tests across 13 files):

| File | Area |
|---|---|
| `engine.test.js` | `h()`, `render()`, reconciler, keys, fragments, portals, subtree re-render |
| `hooks.test.js` | `useState/Effect/Ref/Memo/Callback/Reducer`, error boundary, form, router |
| `new-features.test.js` / `v02-features.test.js` | later hooks/components (routes, presence, virtual list, i18n, mobile hooks…) |
| `coverage.test.js` | broad component behavior sweep |
| `components-new.test.js` | newer UI components |
| `categories.test.js` | barrel ↔ category-module export parity |
| `ssr.test.js` | `renderToString`, `hydrate`, head, escaping, text-node quirks |
| `a11y.test.js` | keyboard nav, focus trap/restore, ARIA (Dialog, Drawer, Combobox, Tabs…) |
| `addons.test.js` | PipelineCanvas (`nexa-canvas`), ZoomStage (`nexa-zoom`) |
| `motion.test.js` / `motion-editor.test.js` | `nexa-motion` runtime + the visual editor |
| `security.test.js` | `safeUrl()` scheme guard (client + SSR) |

Running:

```bash
# one engine (fastest feedback)
python3 scripts/run_browser_tests.py --browser chromium
# all three before declaring green
for e in chromium firefox webkit; do python3 scripts/run_browser_tests.py --browser $e || break; done
```

Reading failures: each `✗ <name> — <error>` names the test and the assertion
message. Open the test file, read the assertion, reproduce in the browser via
`python server.py` → `http://localhost:<port>/tests/`. Report the test name, the
error, and the engine(s) it fails on. **Do not** edit tests to make them pass
unless the test itself is provably wrong (say so, with the reasoning).

---

## 3. Manual / visual QA — what the suite does NOT cover

The suite tests engine and component *behavior*. It does not prove the 32
example apps *render correctly* (styled, no console errors, interactions work).
These are AI-executable with playwright — you don't need a human to "look".

Discover the apps: `ls examples/`. Prioritize the broad ones and the add-on
demos: `task-manager`, `complete-page`, `components`, `storefront`, `form`,
`mobile`, `ssr`, `nexa-deck`/`zoom-stage` (ZoomStage), `nexa-motion`/
`motion-editor` (motion), `mindmap` (canvas), `designer` (editor), `charts`,
`gallery`.

### 3.1 Per-example checklist

Serve once (`python server.py`), then for each example load
`http://localhost:<port>/examples/<name>/` and verify:

- [ ] **Console is clean** — capture `pageerror` and `console` (type `error`).
      Any uncaught error or failed import is a fail.
- [ ] **No unstyled components** — nothing renders as raw browser default
      (see 3.2 for the rigorous check). Watch especially examples that use the
      **per-category CSS** (their `index.html` links `nexa-ui-<cat>.css`, not
      `nexa-ui.css`).
- [ ] **Primary interactions work** — click the main buttons, open a dialog/
      drawer/menu, submit a form, paginate a table, toggle tabs.
- [ ] **Theme + palette** — toggle dark mode and switch palette (where the app
      exposes them); colors update, contrast stays readable.
- [ ] **Responsive** — at ~375px and ~1280px viewport the layout adapts (no
      horizontal scroll, mobile shell where applicable).
- [ ] **No 404s** — no request for a local asset returns 404.

Executable skeleton (adapt paths; use the playwright Python):

```python
# for each example: goto, collect errors, screenshot for your own inspection
page.on("pageerror", lambda e: errors.append(str(e)))
page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
page.goto(url, wait_until="load"); page.wait_for_timeout(500)
page.screenshot(path=f"/tmp/qa/{name}.png", full_page=True)   # then view it
```

### 3.2 Category-CSS visual-identity check (rigorous, no eyeballing)

An example on the per-category CSS must render **identically** to the monolith.
Prove it without screenshots: same DOM, swap the stylesheets, diff computed
styles. In one `page.evaluate`:

1. Freeze animations: inject `*{animation:none!important;transition:none!important}`.
2. Snapshot: for every `document.body.querySelectorAll('*')`, record the full
   `getComputedStyle` as `prop:value;…`.
3. Insert `<link href="/dist/nexa-ui.css">` **at the position of the first
   `nexa-ui-<cat>` link** (before the app's `styles.css`, preserving cascade
   order), await its `onload`, then remove the category links.
4. Snapshot again; diff element-by-element.

Zero diffs = the subset is complete. Any diff points at the exact element +
property; if it's a real missing rule, the category set is wrong (also caught
statically by `validate_nexa.py`). **Pitfall:** appending the monolith at the
*end* of `<head>` (after `styles.css`) flips the cascade and yields false
diffs — insert it where the category links were.

### 3.3 Add-on smoke

- **ZoomStage** (`nexa-deck`, `zoom-stage`): frames render; clicking a
  thumbnail/next flies the camera; keyboard (arrows) advances; no error on the
  last→first wrap.
- **nexa-motion** (`nexa-motion`, `motion-landing`): the intro timeline plays;
  `motion-editor` — drag a keyframe, scrub the ruler, undo/redo (Ctrl+Z), export
  code pane updates.
- **PipelineCanvas** (`mindmap`): drag a node, draw a connection, pan/zoom.
- **FullCodeEditor** (`designer`): type in the editor, highlighting + line
  numbers work.

### 3.4 SSR round-trip (`examples/ssr`)

Confirm the server-rendered HTML hydrates without a mismatch: load the page,
check console for any hydration warning/error, confirm interactions work after
hydration (state is live, not dead server HTML). `ssr.test.js` covers the API;
this proves the full round-trip in a browser.

---

## 4. Cross-cutting guarantees to spot-check

- **Security — `safeUrl`**: covered by `security.test.js`. If reviewing a change
  near attribute/URL handling, re-confirm `javascript:`/`vbscript:`/non-image
  `data:` are neutralized on client and in `renderToString`.
- **SSR escaping**: all text/attribute values HTML-escaped (no injection);
  `innerHTML` and `safeUrl`-cleared values behave. In `ssr.test.js`.
- **No-build integrity** (supply-chain — Nexa's core promise): `dist/*.js` must
  import nothing external and contain no `eval`/`new Function`/`document.write`.
  Quick audit:
  ```bash
  grep -REn "from ['\"](https?:|[a-z@])" dist/*.js | grep -v '\.min\.'      # → empty
  grep -REn "\beval\(|new Function\(|document\.write" dist/*.js | grep -v '\.min\.'  # → only innerHTML="" clears, if any
  ```
- **Themes/palettes/design**: `data-theme`, `data-palette`, `data-design`
  attributes on `<html>` drive the look; toggling them (via the hooks or
  manually) must restyle live and compose (dark × palette × bootstrap skin).
- **Accessibility**: beyond `a11y.test.js`, tab through a complex example — focus
  is visible, order is logical, overlays trap and restore focus, Escape closes.

---

## 5. Release / regression checklist

Before signing off a branch or release:

1. Gates 1.1–1.4 green on **all three** engines.
2. `python scripts/split_css.py --check` and `python scripts/minify.py --check`
   green (derived files committed, not stale).
3. If `package.json` version changed, `CHANGELOG.md` has a matching
   `## [x.y.z]` heading (validate_nexa.py enforces this).
4. §3 per-example checklist clean on the priority examples; category-CSS
   examples pass §3.2.
5. (Optional) `python3 scripts/benchmark_examples.py` — payload/timing hasn't
   regressed vs the numbers in `docs/benchmarks`.
6. (Optional) `python3 scripts/bundle.py <app> --smoke` for any app intended to
   ship bundled.

---

## 6. Reporting format

Report so a human can act without re-deriving anything. Per finding:

```
[SEVERITY] <area> — <one-line summary>
  Gate/step : 1.4 browser suite (webkit)   |  3.1 examples/storefront  | ...
  Command   : python3 scripts/run_browser_tests.py --browser webkit
  Expected  : 300/300 passed (webkit)
  Actual    : 299/300 — ✗ Combobox: Escape returns focus to trigger
  Repro     : python server.py → http://localhost:<port>/tests/ (webkit)
  Evidence  : <assertion message / screenshot path / console error>
```

Severity:

- **BLOCKER** — a §1 gate fails, or an example throws / renders unstyled.
- **MAJOR** — wrong behavior on one engine, a11y break, visual regression on a
  priority example.
- **MINOR** — cosmetic-only, non-priority example, or a flaky-looking result
  (re-run to confirm; report the flake, don't hide it).

End with a one-line verdict per engine and an overall PASS/FAIL. Never report
"done" for a gate you skipped — say it was skipped and why. If a step failed,
show the real output; if a run is still in progress, say so.

---

## 7. Command cheat-sheet

```bash
# gates (fast → slow)
python  scripts/validate_nexa.py
python  scripts/split_css.py --check
python  scripts/minify.py --check
python3 scripts/run_browser_tests.py --browser chromium      # then firefox, webkit

# regenerate derived files after editing a source (then re-run --check)
python  scripts/split_css.py        # dist/nexa-ui.css → nexa-ui-<cat>.css
python  scripts/minify.py           # dist/*.js|*.css → *.min.*

# manual + optional
python  server.py                   # dev server for browser QA
python3 scripts/bundle.py <app> --smoke
python3 scripts/benchmark_examples.py
```
