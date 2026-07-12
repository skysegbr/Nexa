import "./engine.test.js";
import "./new-features.test.js";
import "./hooks.test.js";
import "./ssr.test.js";
import "./a11y.test.js";
import "./coverage.test.js";
import "./components-new.test.js";
import "./addons.test.js";
import "./v02-features.test.js";
import "./motion.test.js";
import { run } from "./runner.js";

// Expose the outcome on window so a headless driver (scripts/
// run_browser_tests.py) can wait for completion and read the results
// without scraping the DOM.
run(document.getElementById("results")).then((results) => {
  window.__nexaTestResults = results.map(({ name, status, error }) => ({
    name,
    status,
    error: error ? String(error.message || error) : null,
  }));
});
