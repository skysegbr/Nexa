// Server-side rendering entry for Nexa.
//
// Re-exports the SSR surface from the core so a non-browser runtime (Deno,
// Bun, Node) — or the browser — can import just what it needs, and so future
// server-only helpers have a home separate from the client core.
//
//   import { renderToString } from "/dist/nexa-server.js";
//   const html = renderToString(App);
//
// See the `renderToString` docs in dist/nexa.js and docs/AI_SPEC.md §6.
export { renderToString, hydrate } from "./nexa.js";
