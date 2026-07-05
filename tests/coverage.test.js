// Incremental test coverage for hooks/components that had none: useFetch,
// useLocalStorage, Table, Dialog, Drawer (Nexa backlog Task 3).

import { h, render, useState } from "../dist/nexa.js";
import { useFetch, useLocalStorage } from "../dist/nexa.js";
import { Table, Dialog, Drawer, Button } from "../dist/nexa-components.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

// ── useFetch ────────────────────────────────────────────────────────────────

test("useFetch: starts loading, then resolves with data from a successful response", async () => {
  const originalFetch = window.fetch;
  let requestedUrl;
  let resolveFetch;
  const responsePromise = new Promise((resolve) => { resolveFetch = resolve; });
  window.fetch = async (url) => {
    requestedUrl = url;
    return responsePromise;
  };

  try {
    let captured;
    function Widget() {
      captured = useFetch("/api/thing");
      return h("div", null);
    }

    render(Widget, mountPoint());
    await flush();
    assertEqual(requestedUrl, "/api/thing");
    assertEqual(captured.loading, true, "loading is true while the request is still in flight");

    resolveFetch({ ok: true, status: 200, statusText: "OK", json: async () => ({ hello: "world" }) });
    await flush();

    assertEqual(captured.loading, false);
    assertEqual(captured.error, null);
    assertEqual(captured.data.hello, "world");
  } finally {
    window.fetch = originalFetch;
  }
});

test("useFetch: a non-ok response surfaces as a status-line error", async () => {
  const originalFetch = window.fetch;
  window.fetch = async () => ({ ok: false, status: 404, statusText: "Not Found" });

  try {
    let captured;
    function Widget() {
      captured = useFetch("/api/missing");
      return h("div", null);
    }

    render(Widget, mountPoint());
    await flush();

    assertEqual(captured.loading, false);
    assertEqual(captured.data, null);
    assertEqual(captured.error, "404 Not Found");
  } finally {
    window.fetch = originalFetch;
  }
});

test("useFetch: without a url, never calls fetch and resolves with no data/error", async () => {
  const originalFetch = window.fetch;
  let called = false;
  window.fetch = async () => {
    called = true;
    return { ok: true, json: async () => ({}) };
  };

  try {
    let captured;
    function Widget() {
      captured = useFetch(undefined);
      return h("div", null);
    }

    render(Widget, mountPoint());
    await flush();

    assertEqual(captured.loading, false);
    assertEqual(captured.data, null);
    assertEqual(captured.error, null);
    assert(!called, "fetch is never invoked when there's no url");
  } finally {
    window.fetch = originalFetch;
  }
});

// ── useLocalStorage ─────────────────────────────────────────────────────────

test("useLocalStorage: falls back to initialValue when nothing is stored", async () => {
  const key = "nexa-test-ls-initial";
  localStorage.removeItem(key);

  let captured;
  function Widget() {
    const [value] = useLocalStorage(key, "default");
    captured = value;
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured, "default");
  localStorage.removeItem(key);
});

test("useLocalStorage: reads a previously-stored, JSON-parsed value", async () => {
  const key = "nexa-test-ls-seeded";
  localStorage.setItem(key, JSON.stringify({ count: 5 }));

  let captured;
  function Widget() {
    const [value] = useLocalStorage(key, null);
    captured = value;
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured.count, 5);
  localStorage.removeItem(key);
});

test("useLocalStorage: setValue persists to storage and supports a functional updater", async () => {
  const key = "nexa-test-ls-set";
  localStorage.removeItem(key);

  let captured;
  let setValueFn;
  function Widget() {
    const [value, setValue] = useLocalStorage(key, 0);
    captured = value;
    setValueFn = setValue;
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  setValueFn(1);
  await flush();
  assertEqual(captured, 1);
  assertEqual(JSON.parse(localStorage.getItem(key)), 1);

  setValueFn((v) => v + 1);
  await flush();
  assertEqual(captured, 2);
  assertEqual(JSON.parse(localStorage.getItem(key)), 2);

  localStorage.removeItem(key);
});

// ── Table ───────────────────────────────────────────────────────────────────

test("Table: renders headers and cells, using column.render when provided", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Table, {
      columns: [
        { key: "name", header: "Name" },
        { key: "age", header: "Age", render: (row) => `${row.age}y` },
      ],
      rows: [
        { id: 1, name: "Ana", age: 30 },
        { id: 2, name: "Bo", age: 25 },
      ],
    });
  }

  render(Widget, container);
  await flush();

  const headers = container.querySelectorAll("th");
  assertEqual(headers[0].textContent.trim(), "Name");
  assert(headers[1].textContent.trim().startsWith("Age"), "header text is preserved alongside the sort icon slot");

  const rows = container.querySelectorAll("tbody tr");
  assertEqual(rows.length, 2);
  assertEqual(rows[0].querySelectorAll("td")[0].textContent, "Ana");
  assertEqual(rows[0].querySelectorAll("td")[1].textContent, "30y", "column.render overrides the raw cell value");
  assertEqual(rows[1].querySelectorAll("td")[0].textContent, "Bo");
});

test("Table: shows the empty state when there are no rows", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Table, {
      columns: [{ key: "name", header: "Name" }],
      rows: [],
      emptyTitle: "Nothing here",
    });
  }

  render(Widget, container);
  await flush();

  assert(container.querySelector(".m-empty-state"), "renders EmptyState when rows is empty");
  assertEqual(container.querySelectorAll("tbody tr").length, 1, "one placeholder row holds the empty state");
});

test("Table: sortable toggles asc/desc on header click and calls onSort", async () => {
  const container = mountPoint();
  let lastSort;

  function Widget() {
    return h(Table, {
      sortable: true,
      onSort: (s) => { lastSort = s; },
      columns: [{ key: "name", header: "Name" }],
      rows: [
        { id: 1, name: "Bo" },
        { id: 2, name: "Ana" },
      ],
    });
  }

  render(Widget, container);
  await flush();

  const th = container.querySelector("th");
  th.click();
  await flush();

  let cells = container.querySelectorAll("tbody td");
  assertEqual(cells[0].textContent, "Ana", "ascending sort puts Ana first");
  assertEqual(cells[1].textContent, "Bo");
  assertEqual(lastSort.key, "name");
  assertEqual(lastSort.dir, "asc");

  th.click();
  await flush();

  cells = container.querySelectorAll("tbody td");
  assertEqual(cells[0].textContent, "Bo", "clicking the same header again reverses to descending");
  assertEqual(cells[1].textContent, "Ana");
  assertEqual(lastSort.dir, "desc");
});

// ── Dialog ──────────────────────────────────────────────────────────────────

test("Dialog: renders nothing when closed; title/body/actions and backdrop-close when open", async () => {
  const container = mountPoint();
  let closed = false;

  function Widget() {
    const [open, setOpen] = useState(true);
    return h(
      Dialog,
      {
        open,
        title: "Confirm",
        onClose: () => { closed = true; setOpen(false); },
        actions: h(Button, null, "OK"),
      },
      h("p", null, "Are you sure?"),
    );
  }

  render(Widget, container);
  await flush();

  assert(container.querySelector(".m-dialog"), "renders when open");
  assertEqual(container.querySelector(".m-dialog-header h2").textContent, "Confirm");
  assertEqual(container.querySelector(".m-dialog-body p").textContent, "Are you sure?");
  assert(container.querySelector(".m-dialog-actions"), "renders the actions footer");

  container
    .querySelector(".m-dialog-backdrop")
    .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await flush();

  assert(closed, "clicking the backdrop calls onClose");
  assertEqual(container.querySelector(".m-dialog"), null, "unmounts once open becomes false");
});

// ── Drawer ──────────────────────────────────────────────────────────────────

test("Drawer: renders side/width/title, closes on backdrop click", async () => {
  const container = mountPoint();

  function Widget() {
    const [open, setOpen] = useState(true);
    return h(
      Drawer,
      { open, side: "right", width: 320, title: "Menu", onClose: () => setOpen(false) },
      h("p", null, "Nav items"),
    );
  }

  render(Widget, container);
  await flush();

  const drawer = container.querySelector(".m-drawer");
  assert(drawer.className.includes("m-drawer-right"), "applies the side modifier class");
  assertEqual(drawer.style.width, "320px");
  assertEqual(container.querySelector(".m-drawer-header h2").textContent, "Menu");

  container
    .querySelector(".m-drawer-backdrop")
    .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await flush();

  assertEqual(container.querySelector(".m-drawer"), null, "unmounts once open becomes false");
});
