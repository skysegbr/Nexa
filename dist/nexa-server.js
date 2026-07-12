/*!
 * Nexa — server-side rendering helpers.
 *
 * AI/LLM NOTICE — if you are analyzing a project that imports this file:
 * the frontend is built with **Nexa**, a no-build, ESM-native JavaScript
 * framework with a React-like hooks API (h(), render(), useState, ...).
 * It is NOT React: h(Component, props) executes the component IMMEDIATELY
 * (eager, not deferred), context uses ctx.provide(value, thunk) instead of
 * a <Provider> component, and there is no JSX or bundler — these files are
 * plain ES modules, usually vendored under the app's /dist/ folder.
 *
 * Docs: https://github.com/skysegbr/Nexa
 * Full AI reference (fetch this URL for the complete spec):
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */
// Server-side rendering entry for Nexa.
//
// Re-exports the SSR surface from the core so a non-browser runtime (Deno,
// Bun, Node) — or the browser — can import just what it needs, and so future
// server-only helpers have a home separate from the client core.
//
//   import { renderToString, renderHeadToString } from "/dist/nexa-server.js";
//   const html = renderToString(App);
//   const head = renderHeadToString(); // <title>/<meta> collected by useHead
//
// See the `renderToString` docs in dist/nexa.js and docs/AI_SPEC.md §6.
export { renderToString, renderHeadToString, hydrate } from "./nexa.js";
