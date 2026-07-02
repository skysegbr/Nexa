---
name: nexa-expert
description: "Generate or review code for Nexa, the no-build ESM-native JS frontend framework in this repo (h(), render, hooks, /dist/nexa-components.js). USE FOR: writing any .js file that imports from '/dist/nexa.js' or '/dist/nexa-components.js', building a Nexa app/page/component, using Nexa hooks (useState, useEffect, useForm, useRouter, useTheme, etc.), using Nexa UI components (Button, Card, Dialog, Table, Tabs, etc.), structuring a Nexa project (domain-componentized layout), styling with --m-* CSS tokens, or debugging Nexa-specific errors like 'X can only be used during rendering'. DO NOT USE FOR: React, Vue, Svelte, or other framework code — Nexa's h()/render/context APIs look similar to React but behave differently (eager child evaluation, no Provider component) and following React patterns will produce broken code."
---

# Nexa Expert

Full reference lives in [docs/AI_SPEC.md](../../../docs/AI_SPEC.md) in this repo — **read it before writing or reviewing any Nexa code**, especially before generating a new component, hook, or app.

## Non-negotiable rules (memorize before reading further)

1. **`render(App, container)`** — pass the function reference, never `h(App)`. Calling `h(App)` before mount throws "App can only be used during rendering."
2. **No `<Context.Provider>` component, ever — not even one that takes `children` as a prop.** `h(type, props, ...children)` evaluates `...children` as normal JS arguments, so `h(App)` inside `h(ThemeProvider, null, h(App))` already ran *before* `ThemeProvider`'s body starts — wrapping that already-evaluated `children` in `() => children` does not defer it. A provider must construct what it wraps *inside* the `ctx.provide(value, () => h(...))` thunk it returns. To combine several contexts, nest `.provide()` calls directly in the root component passed to `render()` — see "Composing multiple contexts" / "Domain-owned context" in AI_SPEC §7 and §12.
3. **Every list item needs a stable `key` prop**, or re-renders lose state.
4. **Hooks are called unconditionally** at the top of the component — same rule as React.
5. Real apps (more than a quick demo) use the **domain-componentized layout**: `app.js` (orchestrator only), `data.js` (UPPER_CASE exports), `components/<Name>.js` + paired `<Name>.css`, CSS collected centrally in `styles.css` via `@import` — components never import their own CSS. Group by feature/domain, not by type (no `forms/`, `ui/`, `shared/`). A domain whose components share state owns its own `createContext` + state hook in its own folder (`cart/CartContext.js` exporting `CartContext` + `useCartState()`); `app.js` is the only place that composes domain providers together.
6. Single-file `app.js` with everything inline is only for throwaway demos — never for a real multi-section UI.

## Workflow

- Before generating Nexa code: open `docs/AI_SPEC.md` (this repo) and check the relevant section — §6 hooks, §9 components, §10 canvas/editor add-ons, §11 CSS tokens, §12 patterns, §14 multi-file structure.
- When reviewing Nexa code: check it against the 6 rules above first; they catch the most common breakages.
- If asked to scaffold a new app, default to the domain-componentized structure (§12/§14), not the single-file demo (§13).
