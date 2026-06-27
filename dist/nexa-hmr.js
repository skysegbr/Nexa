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
