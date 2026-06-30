# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
