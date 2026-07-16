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

## bundle (2026-07-16)

`bundle-python.json` / `bundle-esbuild.json` measure the same eight apps
after `scripts/bundle.py` (optional production step — dev stays no-build),
vs the unbundled category-split baseline in `components-split-after.json`:

| app | unbundled (req / KB) | bundle python | bundle esbuild | Δ esbuild |
|---|---|---|---|---|
| basic | 9 req / 122.7 | 1 req / 68.6 | 1 req / 15.6 | −87% |
| form | 11 req / 189.5 | 1 req / 113.5 | 1 req / 23.3 | −88% |
| complete-page | 15 req / 228.6 | 1 req / 138.6 | 1 req / 29.0 | −87% |
| mobile | 12 req / 172.4 | 1 req / 102.7 | 1 req / 25.6 | −85% |
| task-manager | 15 req / 228.3 | 1 req / 137.2 | 1 req / 39.1 | −83% |
| storefront | 18 req / 198.1 | 1 req / 119.1 | 1 req / 30.2 | −85% |
| burger-shop | 19 req / 224.4 | 1 req / 136.2 | 1 req / 38.5 | −83% |
| drug-recalls | 18 req / 221.0 | 1 req / 134.0 | 1 req / 29.5 | −87% |
| **TOTAL JS** | 1 585 KB | 950 KB (−40%) | 231 KB (−85%) | |

Every build is a single JS request + a single CSS request (the import
waterfall disappears entirely). The python engine does module-level
bundling + `minify.py`; the esbuild engine (Go binary built from source —
still no Node anywhere) adds real tree-shaking and identifier mangling.
