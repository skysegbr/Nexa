// Minimal browser-based test runner for the Nexa engine.
//
// No dependencies, no build step — open tests/index.html (served from the
// repo root) and read the results, same as any other Nexa example.

import { unmount } from "../dist/nexa.js";

const tests = [];
let activeContainers = [];

const sandbox = document.createElement("div");
sandbox.id = "nexa-test-sandbox";
sandbox.style.position = "absolute";
sandbox.style.left = "-99999px";
sandbox.style.top = "0";
document.body.appendChild(sandbox);

export function test(name, fn) {
  tests.push({ name, fn });
}

export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    throw new Error(message || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Mounts components into a sandboxed container that gets unmounted and
// removed automatically once the test finishes (pass or fail).
export function mountPoint() {
  const container = document.createElement("div");
  sandbox.appendChild(container);
  activeContainers.push(container);
  return container;
}

// Renders are scheduled with `queueMicrotask`. Awaiting a macrotask lets the
// whole chain — including effects that themselves trigger re-renders — settle
// before assertions run.
export function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function run(target) {
  const results = [];

  for (const { name, fn } of tests) {
    activeContainers = [];

    try {
      await fn();
      results.push({ name, status: "pass" });
    } catch (error) {
      results.push({ name, status: "fail", error });
    } finally {
      for (const container of activeContainers) {
        unmount(container);
        container.remove();
      }
    }
  }

  renderResults(target, results);
  return results;
}

function renderResults(target, results) {
  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.length - passed;

  target.innerHTML = "";

  const summary = document.createElement("p");
  summary.className = `t-summary ${failed ? "t-summary-fail" : "t-summary-pass"}`;
  summary.textContent = failed
    ? `${passed}/${results.length} passed — ${failed} failing`
    : `${passed}/${results.length} passed`;
  target.appendChild(summary);

  const list = document.createElement("ul");
  list.className = "t-list";

  for (const result of results) {
    const item = document.createElement("li");
    item.className = `t-item t-${result.status}`;
    item.textContent =
      result.status === "pass" ? `✓ ${result.name}` : `✗ ${result.name} — ${result.error.message}`;
    list.appendChild(item);
  }

  target.appendChild(list);

  const log = failed ? console.error : console.log;
  log(`Nexa engine tests: ${passed}/${results.length} passed`);

  for (const result of results.filter((result) => result.status === "fail")) {
    console.error(`✗ ${result.name}`, result.error);
  }
}
