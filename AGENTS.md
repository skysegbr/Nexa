# AGENTS.md — FluxaWay project memory

Shared, durable context for any AI agent working in this repository
(Claude Code, Codex, Copilot, Cursor, …). `CLAUDE.md` imports this file, so
this is the single source of truth — edit here, not in a per-tool copy.

This file is **memory**, not a tutorial. It records what is non-obvious,
easy to get wrong, and expensive to rediscover. For how to *write* FluxaWay
code, follow the routing table in §2 instead of guessing from this file.

---

## 1. The one rule that overrides everything: no Node

FluxaWay uses **no Node.js anywhere** — not as a runtime, not as a bundler,
not in CI, not for tests. This is an architectural decision (supply-chain
surface + maintenance cost), not a gap to fill. All tooling is Python 3
standard library, plus `playwright` (installed via pip) for browser tests.

Consequences an agent must internalize:

- **Never** run `node file.js`, `node --check`, `npm test`, `npx <anything>`
  against this code. FluxaWay modules are *browser* ES modules: they touch
  `document`/`window` and import absolute `/dist/...` specifiers that only
  resolve when served over HTTP. A Node failure here proves nothing — it is
  noise, and acting on it produces wrong "fixes".
- `package.json` is **private editor/TypeScript metadata**, not an npm
  manifest (`"private": true`, never published). Do not evaluate it against
  npm packaging standards or propose npm scripts, subpath export polish, or
  a `repository` field. Their absence is deliberate.
- Distribution = vendored `dist/` files or the jsDelivr CDN
  (`https://cdn.jsdelivr.net/gh/skysegbr/FluxaWay@vX.Y.Z/dist/...`).
- Validation is always: **served over HTTP, judged in a browser.**
  `python server.py` → open the page → the console is the truth.

If you think a task needs Node, the task is wrong or there is a Python path
for it. Say so; do not install Node.

---

## 2. Read the right doc before acting

| If the task is… | Read | Do NOT rely on |
|---|---|---|
| Writing/editing FluxaWay **app or framework code** | `docs/AI_SPEC.md` (esp. §3 CRITICAL RULES, §12 structure) | React knowledge |
| Running **QA / a release pass** | `docs/AI_QA.md` (gates) + `docs/AI_QA_SCENARIOS.md` (case IDs) | ad-hoc spot checks |
| Quick orientation for an LLM | `llms.txt` | — |
| Human-facing overview, component tables, CDN/SRI | `README.md` | — |
| What changed and when | `CHANGELOG.md` | git log alone |
| Charts/dashboards, motion, ZoomStage, canvas, editor | `docs/AI_SPEC.md` §10 | inventing your own |
| Brand, logo, colors | `docs/BRAND.md` | — |

`AI_SPEC.md` is for *generating* code. `AI_QA.md` is for *verifying* it.
They are not interchangeable.

**FluxaWay is not React.** The API rhymes with it and behaves differently.
The four that bite hardest:

1. `h(Component, props)` executes the component **immediately** (eager, not
   deferred). `cond && h(Spinner)` occupies no slot.
2. `render(App, container)` takes a **function reference** — never
   `render(h(App), ...)`, which throws "App can only be used during rendering".
3. Context has **no Provider component**: `ctx.provide(value, () => h(Child))`.
4. `useState` setter identity changes every render — wrap callbacks passed
   to children in `useCallback` before using them as effect dependencies.

---

## 3. Repo layout: what is source and what is generated

There is **no `src/`**. `dist/` holds hand-written source *and* generated
output side by side. Editing a generated file is silently reverted the next
time its generator runs.

| Path | Nature |
|---|---|
| `dist/fluxaway*.js` (non-`.min`) | **SOURCE** — hand-edited, ships as-is |
| `dist/fluxaway-ui.css` | **SOURCE** of the whole stylesheet |
| `dist/*.min.js`, `dist/*.min.css` | GENERATED → `python scripts/minify.py` |
| `dist/fluxaway-ui-{base,core,forms,overlay,data,nav,theme}.css` | GENERATED → `python scripts/split_css.py` |
| `dist/*.d.ts` | hand-maintained; keep in sync when the API changes |
| `examples/<name>/` | apps, each self-contained; also the QA surface |
| `examples/docs-site/` | the documentation app — **source** of the published site |
| `tests/` | browser test suite (plain ESM, no framework), entry `tests/index.html` |
| `scripts/*.py` | all maintenance tooling; stdlib + playwright only |
| `server.py` | dev server + SSE live reload (`dist/fluxaway-hmr.js` is the client) |
| `build/`, `tools/` | **gitignored** — bundler output and the locally built esbuild |

Order matters when both are stale: **split CSS first, then minify** (the
minifier reads the category files the splitter writes).

Example app conventions (enforced by review and partly by the validator):
one component per file under `components/`, its CSS as a **sibling file with
the same base name** in the same folder, static data in `data.js`, root
`styles.css` that only `@import`s the component CSS, `app.js` orchestrates
and nothing else. No `src/` wrapper, no parallel `styles/` tree. A single
monolithic `app.js` is acceptable only for throwaway demos; the validator
warns past a 250-line-per-component-file monolith guard.

The docs-site reference is descriptor-driven, not one page per API. Its 107
entries flow through `components/reference/ReferencePage.js`; shared API tables
flow through `PropsTable.js`. Preserve the reference sequence **Setup → live
examples → API tables → resources → implementation notes**. Component Setup
must show `fluxaway-ui-base.css` plus its category CSS beside the JavaScript
import. `PropsTable` owns semantic column headers, stable desktop widths and
labelled mobile cards — do not duplicate that layout inside a content entry.
The desktop TOC intentionally becomes the compact disclosure at 1320px so it
does not crush technical tables. Any change to these contracts must update
`scripts/check_docs_site.py` and pass it in Chromium, Firefox and WebKit.

---

## 4. Commands (Python 3, from repo root)

```bash
# dev
python server.py                 # http://localhost:8000, live reload, localhost-only
python server.py --host 0.0.0.0  # exposes the WHOLE repo on the LAN — deliberate use only

# blocking gates, fast → slow (CI runs 1.1–1.6; see docs/AI_QA.md §1)
python3 scripts/validate_fluxaway.py            # imports, assets, brackets, version sync
python3 scripts/split_css.py --check            # category CSS up to date
python3 scripts/minify.py --check               # .min.* up to date
python3 scripts/check_tutorial_selectors.py     # tutorial recorders hit live selectors
python3 scripts/validate_chart_palette.py       # + --sequential, --diverging
python3 scripts/run_browser_tests.py --browser chromium   # then firefox, then webkit
python3 scripts/check_docs_site.py  --browser chromium    # then firefox, then webkit

# regenerate derived files after editing a source, then re-run the --check
python3 scripts/split_css.py && python3 scripts/minify.py

# optional
python3 scripts/bundle.py <app> --smoke   # production bundle + headless self-check
python3 scripts/benchmark_examples.py     # payload/timing vs docs/benchmarks
```

The browser suite **must pass on all three engines**. A chromium-green /
webkit-red result is a real bug, not flake — report the engine.

Local env note: playwright lives under `python3` (3.12) here. If a script
reports a missing playwright, you picked the wrong interpreter, not a
missing gate.

---

## 5. Release process

Releases are cut on a branch, never straight on `main`:

1. Branch off `main`.
2. `chore(release): prepare X.Y.Z` — one commit bumping **11 version
   occurrences** across 5 files plus the changelog entry:
   - `package.json` (1)
   - `README.md` (7 — CDN URLs, SRI example, the `@vX.Y.Z` prose mention,
     and the `?v=X.Y.Z` cache-busting note)
   - `docs/AI_SPEC.md` (1), `docs/TUTORIAL.md` (1)
   - `examples/docs-site/content/css/guides.js` (1)
   - `CHANGELOG.md` — a `## [X.Y.Z]` heading (the validator **fails** if
     `package.json`'s version has no matching heading)
3. Run the full gate set **at the merge commit**, not just on the branch.
4. `git merge --no-ff` into main with subject `merge: release FluxaWay vX.Y.Z`.
5. Annotated tag `vX.Y.Z`, message `FluxaWay vX.Y.Z`.

`grep -rn "0\.22\.10" --include='*.md' --include='*.js' --include='*.json' . | grep -v build/`
is the reliable way to find every pin before bumping.

Commit subjects follow Conventional Commits with a scope, e.g.
`feat(charts):`, `fix(server):`, `refactor(docs):`, `docs(site):`,
`chore(release):`, `merge: release FluxaWay vX.Y.Z`.

---

## 6. Traps learned the hard way

- **The validator's JS lexer has no regex-literal state.** `balanced_brackets_error()`
  in `scripts/validate_fluxaway.py` walks the source tracking strings,
  template literals and comments — but not `/.../` regexes. A regex literal
  containing a quote, a backtick, or an unbalanced bracket flips the lexer
  into a phantom string state and fails the **blocking** gate 1.1 with a
  nonsense `unexpected ')' at L:C`. Workaround: build the pattern with
  `new RegExp("...")`, or escape the offending char. (Vendored CodeMirror is
  excluded from the scan for exactly this reason.)
- **`docs/AI_QA.md` §7 references `scripts/sync_legacy_aliases.py`, which does
  not exist.** Skip that line; it is a stale cheat-sheet entry, not a missing file.
- `build/` and `tools/` are gitignored — so are `docs/qa-evidence/`,
  `docs/QA_REPORT_*.md`, and the exploratory runners `run_example_qa.py`,
  `run_hmr_test.py`, `run_priority_flows.py`. Those runners exist locally and
  are useful, but do not expect them in a fresh clone or in CI.
- CI = `.github/workflows/ci.yml`: static validation + the two `--check`
  sync gates + tutorial selectors, then the browser suite and the docs-site
  smoke across chromium/firefox/webkit.
- Optional designs are descendant-scoped. A wrapper with
  `data-design="metallic"`, `data-metal-theme="cobalt"` and the current
  `data-theme` can skin only its contained controls; it also skins *every*
  FluxaWay descendant in that wrapper. Keep a local design wrapper as narrow
  as the intended component group. `useDesign()` remains the global `<html>`
  switcher; do not call it when the requirement is “Cobalt buttons only.”
- Chart colors are validated, not decorative. `scripts/validate_chart_palette.py`
  recomputes lightness/chroma/contrast/colorblind guarantees from the tokens
  in `dist/fluxaway-charts.css`, and asserts every `:root` token exists in all
  three theme scopes. Never hand-pick a chart hex. The charts CSS is
  **required** — it carries the palette tokens.
- Prefer the first-party add-on over any third-party library: charts →
  `fluxaway-charts` (never Chart.js/D3/Recharts, never hand-rolled
  `stroke-dasharray` arcs); animation → `fluxaway-motion` (never GSAP, never a
  hand-rolled rAF loop); presentations/decks → `ZoomStage` (`fluxaway-zoom`),
  not scroll-snap sections; node graphs → `PipelineCanvas`; embedded code
  editor → `FullCodeEditor` (needs the local `assets/codemirror/`, no CDN).
- ZoomStage selection and camera settlement are different moments. Keep
  navigation UI on `onIndexChange`, but start destination content motion from
  `onSettledIndexChange` or `frame.render({ settled })`; resetting an incoming
  timeline at selection time blanks it while the camera is still travelling.
  Use the small Glide/Arc/Dolly/Orbit/Focus grammar, `duration: "auto"`, and
  `frame.camera`/non-card surfaces instead of reproducing one rotated rectangle
  layout. `examples/zoom-lab` is the canonical comparison surface.
- Button interaction studies are public component API, not example-local CSS.
  Use `Button.effect` with one of `BUTTON_EFFECTS` (`reflection`, `edge`,
  `split`, `aperture`, `charge`, `corners`, `pulse`, `phase`, `conductor`)
  instead of copying their selectors into an app. Metallic themes specialize
  the same effects through material tokens; `conductor` has an exact recipe
  for every finish.
- A repeating Motion timeline must return every animated property to its
  initial visual state before wrapping. With `stagger()`, explicit duration
  must include the last track's offset: `endMs + (count - 1) * eachMs`.
  Otherwise the loop or its final staggered items jump at the seam.
- Screen-by-screen landing navigation is a measured layout contract. Reuse a
  shared shell and proportional geometry; after a real Next/anchor navigation,
  verify the destination's primary content and following transition fit the
  intended desktop viewport. Keep natural vertical flow on mobile. See
  `docs/AI_SPEC.md` §3 and §10 and `examples/inox-landing`.

---

## 7. Working agreements with the maintainer

- The maintainer (skysegbr / Danilo) writes in Portuguese; the repository —
  code, comments, docs, commit messages — stays in **English**.
- **Do not run `git commit` or `git push` on his behalf.** Write the commit
  message, stage nothing surprising, and hand him the command.
- Reasoned pushback is welcome. If a request is a poor fit for the
  architecture, say so with the reasoning and propose the substitute; do not
  silently comply and do not silently swap.
- Finish the whole task. If part is blocked, complete the rest and say
  plainly what was left out and why.
