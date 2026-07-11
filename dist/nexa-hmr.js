/*!
 * Nexa — development-time hot reload client.
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
 * Full AI-oriented reference: docs/AI_SPEC.md in that repository.
 */
// Nexa live-reload client — add to HTML ONLY in development.
// Connects to the SSE endpoint of server.py and reloads the page when
// any monitored file changes.
//
// Usage:
//   <script src="/dist/nexa-hmr.js"></script>
//
// Automatically reconnects if the server goes down (e.g.: during restart).
(function () {
  var ENDPOINT = "/_hmr";
  var RECONNECT_DELAY = 3000;

  function connect() {
    var es = new EventSource(ENDPOINT);

    es.onopen = function () {
      console.log("[Nexa HMR] connected");
    };

    es.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === "reload") {
          console.log("[Nexa HMR] reloading due to: " + msg.path);
          window.location.reload();
        }
      } catch (_) {}
    };

    es.onerror = function () {
      es.close();
      setTimeout(connect, RECONNECT_DELAY);
    };
  }

  connect();
})();
