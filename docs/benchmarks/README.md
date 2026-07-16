# Benchmarks

Payload/timing snapshots of the example pages, produced by
`python3 scripts/benchmark_examples.py -o <out.json>` (headless chromium,
cold cache per run, external requests blocked, 3 runs — payload from run 1,
timings are the median).

## components-split (2026-07-16)

`components-split-before.json` / `components-split-after.json` measure the
split of `dist/nexa-components.js` into six category modules
(`nexa-components-{core,forms,overlay,data,nav,theme}.js` + internal
`nexa-components-util.js`), with every example migrated from barrel imports
to category imports.

Result across the 17 examples that use nexa-components: **components payload
−45% (1 856 KB → 1 015 KB)**, total JS −20%. Pages that use a narrow slice
(basic, core, ssr, zoom-stage, nexa-deck) dropped ~86–90%; pages that use
every category (complete-page, the components gallery) pay +2.8% for the
extra module headers — the expected worst case of the trade-off.
