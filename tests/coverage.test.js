// Incremental test coverage for hooks/components that had none: useFetch,
// useLocalStorage, Table, Dialog, Drawer, useTheme, usePalette, useDesign,
// useToast, Accordion, Stepper, Pagination, FileDropZone, Navbar
// (Nexa backlog Task 3).

import { h, render, useState } from "../dist/nexa.js";
import { useFetch, useLocalStorage, useTheme, usePalette, useDesign, useToast } from "../dist/nexa.js";
import { Table, Dialog, Drawer, Button, Accordion, Stepper, Pagination, FileDropZone, Navbar, Slider, RangeSlider } from "../dist/nexa-components.js";
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

// ── useTheme ──────────────────────────────────────────────────────────────

test("useTheme: resolves from localStorage, applies data-theme, and setTheme updates both", async () => {
  const key = "nexa-theme";
  localStorage.setItem(key, "dark");

  let captured;
  function Widget() {
    captured = useTheme();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured.theme, "dark");
  assertEqual(document.documentElement.getAttribute("data-theme"), "dark");

  captured.setTheme("light");
  await flush();

  assertEqual(captured.theme, "light");
  assertEqual(document.documentElement.getAttribute("data-theme"), "light");
  assertEqual(localStorage.getItem(key), "light");

  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem(key);
});

test("useTheme: toggleTheme flips the value and stays in sync across instances", async () => {
  localStorage.setItem("nexa-theme", "light");

  let a, b;
  function Widget() {
    a = useTheme();
    b = useTheme();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(a.theme, "light");
  a.toggleTheme();
  await flush();

  assertEqual(a.theme, "dark", "toggling flips from light to dark");
  assertEqual(b.theme, "dark", "the other instance picks up the change via the nexa:themechange event");

  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem("nexa-theme");
});

// ── usePalette ────────────────────────────────────────────────────────────

test('usePalette: defaults to "default", setPalette persists and applies data-palette, unknown values ignored', async () => {
  localStorage.removeItem("nexa-palette");
  localStorage.removeItem("nexa-palette-custom-color");

  let captured;
  function Widget() {
    captured = usePalette();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured.palette, "default");
  assertEqual(captured.palettes.length, 7);

  captured.setPalette("violet");
  await flush();

  assertEqual(captured.palette, "violet");
  assertEqual(document.documentElement.getAttribute("data-palette"), "violet");
  assertEqual(localStorage.getItem("nexa-palette"), "violet");

  captured.setPalette("not-a-real-palette");
  await flush();
  assertEqual(captured.palette, "violet", "unknown palettes are ignored");

  document.documentElement.removeAttribute("data-palette");
  localStorage.removeItem("nexa-palette");
});

test('usePalette: setCustomColor switches to the "custom" palette and sets --m-primary; invalid hex is ignored', async () => {
  localStorage.removeItem("nexa-palette");
  localStorage.removeItem("nexa-palette-custom-color");

  let captured;
  function Widget() {
    captured = usePalette();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  captured.setCustomColor("#7c3aed");
  await flush();

  assertEqual(captured.palette, "custom");
  assertEqual(captured.customColor, "#7c3aed");
  assertEqual(document.documentElement.style.getPropertyValue("--m-primary").trim(), "#7c3aed");

  captured.setCustomColor("not-a-hex");
  await flush();
  assertEqual(captured.customColor, "#7c3aed", "invalid hex values are ignored");

  document.documentElement.removeAttribute("data-palette");
  document.documentElement.style.removeProperty("--m-primary");
  localStorage.removeItem("nexa-palette");
  localStorage.removeItem("nexa-palette-custom-color");
});

// ── useDesign ─────────────────────────────────────────────────────────────

test('useDesign: defaults to "nexa", setDesign persists and applies data-design, unknown values ignored', async () => {
  localStorage.removeItem("nexa-design");

  let captured;
  function Widget() {
    captured = useDesign();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured.design, "nexa");
  assertEqual(captured.designs.length, 2);

  captured.setDesign("bootstrap");
  await flush();

  assertEqual(captured.design, "bootstrap");
  assertEqual(document.documentElement.getAttribute("data-design"), "bootstrap");
  assertEqual(localStorage.getItem("nexa-design"), "bootstrap");

  captured.setDesign("not-a-real-design");
  await flush();
  assertEqual(captured.design, "bootstrap", "unknown designs are ignored");

  document.documentElement.removeAttribute("data-design");
  localStorage.removeItem("nexa-design");
});

// ── useToast ──────────────────────────────────────────────────────────────

test('useToast: push adds a toast per variant (error maps to "danger"), dismiss removes it', async () => {
  let captured;
  function Widget() {
    captured = useToast();
    return h("div", null);
  }

  render(Widget, mountPoint());
  await flush();

  assertEqual(captured.toasts.length, 0);

  const id = captured.toast.success("Saved!", { title: "Done" });
  await flush();

  assertEqual(captured.toasts.length, 1);
  assertEqual(captured.toasts[0].id, id);
  assertEqual(captured.toasts[0].variant, "success");
  assertEqual(captured.toasts[0].message, "Saved!");
  assertEqual(captured.toasts[0].title, "Done");
  assertEqual(captured.toasts[0].duration, 3500, "defaults to a 3500ms duration");

  captured.toast.error("Broken", { duration: 1000 });
  await flush();
  assertEqual(captured.toasts.length, 2);
  assertEqual(captured.toasts[1].variant, "danger", 'error() maps to the "danger" variant');
  assertEqual(captured.toasts[1].duration, 1000);

  captured.dismiss(id);
  await flush();
  assertEqual(captured.toasts.length, 1);
  assertEqual(captured.toasts[0].variant, "danger");
});

// ── Accordion ─────────────────────────────────────────────────────────────

test("Accordion: single-open mode closes the previous item; disabled items don't toggle", async () => {
  const container = mountPoint();
  let lastToggle;

  function Widget() {
    return h(Accordion, {
      items: [
        { key: "a", title: "A", children: h("p", null, "A body") },
        { key: "b", title: "B", children: h("p", null, "B body") },
        { key: "c", title: "C", children: h("p", null, "C body"), disabled: true },
      ],
      onToggle: (key, next) => { lastToggle = { key, next }; },
    });
  }

  render(Widget, container);
  await flush();

  const headers = container.querySelectorAll(".m-accordion-header");
  assertEqual(headers.length, 3);
  assertEqual(headers[0].getAttribute("aria-expanded"), "false");

  headers[0].click();
  await flush();
  assertEqual(headers[0].getAttribute("aria-expanded"), "true");
  assertEqual(lastToggle.key, "a");
  assertEqual(lastToggle.next.length, 1);

  headers[1].click();
  await flush();
  assertEqual(headers[0].getAttribute("aria-expanded"), "false", "opening b closes a in single-open mode");
  assertEqual(headers[1].getAttribute("aria-expanded"), "true");

  assert(headers[2].disabled, "disabled item's button is disabled");
  headers[2].click();
  await flush();
  assertEqual(headers[2].getAttribute("aria-expanded"), "false", "disabled items never toggle");
});

test("Accordion: multiple=true allows several panels open independently", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Accordion, {
      multiple: true,
      items: [
        { key: "a", title: "A", children: "A body" },
        { key: "b", title: "B", children: "B body" },
      ],
    });
  }

  render(Widget, container);
  await flush();

  const headers = container.querySelectorAll(".m-accordion-header");
  headers[0].click();
  await flush();
  headers[1].click();
  await flush();

  assertEqual(headers[0].getAttribute("aria-expanded"), "true");
  assertEqual(headers[1].getAttribute("aria-expanded"), "true", "both stay open in multiple mode");
});

// ── Stepper ───────────────────────────────────────────────────────────────

test("Stepper: marks completed steps with a check, the current step, and omits the trailing connector line", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Stepper, {
      activeStep: 1,
      steps: [
        { label: "Account" },
        { label: "Profile", description: "Add your details" },
        { label: "Done" },
      ],
    });
  }

  render(Widget, container);
  await flush();

  const steps = container.querySelectorAll(".m-step");
  assertEqual(steps.length, 3);
  assert(steps[0].className.includes("m-step-done"), "step before activeStep is done");
  assert(steps[1].className.includes("m-step-current"), "activeStep is current");
  assert(!steps[2].className.includes("m-step-done") && !steps[2].className.includes("m-step-current"));

  assertEqual(steps[0].querySelector(".m-step-check").textContent, "✓");
  assertEqual(steps[1].querySelector(".m-step-number").textContent, "2");
  assertEqual(steps[1].querySelector(".m-step-desc").textContent, "Add your details");

  assertEqual(
    container.querySelectorAll(".m-step-line").length,
    2,
    "one connector line between each pair of steps, none trailing the last",
  );
});

// ── Pagination ────────────────────────────────────────────────────────────

test("Pagination: renders ellipsis ranges, marks the current page, and reports clicks via onChange", async () => {
  const container = mountPoint();
  let lastPage;

  function Widget() {
    return h(Pagination, { page: 5, total: 10, onChange: (p) => { lastPage = p; } });
  }

  render(Widget, container);
  await flush();

  const ellipses = container.querySelectorAll(".m-pagination-ellipsis");
  assertEqual(ellipses.length, 2, "both left and right ellipsis show up when page 5 of 10 has room on both sides");

  const current = container.querySelector(".m-pagination-item-active");
  assertEqual(current.textContent, "5");
  assertEqual(current.getAttribute("aria-current"), "page");

  const prev = container.querySelector('[aria-label="Previous page"]');
  const next = container.querySelector('[aria-label="Next page"]');
  assert(!prev.disabled && !next.disabled, "neither edge button is disabled mid-range");

  next.click();
  await flush();
  assertEqual(lastPage, 6);

  prev.click();
  await flush();
  assertEqual(lastPage, 4);

  current.click();
  await flush();
  assertEqual(lastPage, 5);
});

test("Pagination: disables Previous on page 1 and Next on the last page", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Pagination, { page: 1, total: 3 });
  }

  render(Widget, container);
  await flush();

  assert(container.querySelector('[aria-label="Previous page"]').disabled);
  assert(!container.querySelector('[aria-label="Next page"]').disabled);
});

// ── FileDropZone ──────────────────────────────────────────────────────────

test("FileDropZone: drag state toggles the active class, and dropping files calls onFiles", async () => {
  const container = mountPoint();
  let received;

  function Widget() {
    return h(FileDropZone, { onFiles: (files) => { received = files; } });
  }

  render(Widget, container);
  await flush();

  const zone = container.querySelector(".m-file-dropzone");

  zone.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
  await flush();
  assert(zone.className.includes("m-dropzone-active"), "dragover marks the zone active");

  zone.dispatchEvent(new Event("dragleave", { bubbles: true }));
  await flush();
  assert(!zone.className.includes("m-dropzone-active"), "dragleave clears the active state");

  const file = new File(["hello"], "hello.txt", { type: "text/plain" });
  const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
  dropEvent.dataTransfer = { files: [file] };
  zone.dispatchEvent(dropEvent);
  await flush();

  assertEqual(received.length, 1);
  assertEqual(received[0].name, "hello.txt");
});

test("FileDropZone: a disabled zone ignores drag state and never calls onFiles", async () => {
  const container = mountPoint();
  let called = false;

  function Widget() {
    return h(FileDropZone, { disabled: true, onFiles: () => { called = true; } });
  }

  render(Widget, container);
  await flush();

  const zone = container.querySelector(".m-file-dropzone");
  assert(zone.className.includes("m-file-dropzone-disabled"));

  zone.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
  await flush();
  assert(!zone.className.includes("m-dropzone-active"), "disabled zone never shows the active drag state");

  const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
  dropEvent.dataTransfer = { files: [new File(["x"], "x.txt")] };
  zone.dispatchEvent(dropEvent);
  await flush();
  assert(!called, "disabled zone drops nothing");
});

// ── Navbar ────────────────────────────────────────────────────────────────

test("Navbar: the toggle button opens/closes the menu with correct aria-expanded/aria-label", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Navbar, { brand: "Nexa", items: [{ key: "home", label: "Home", href: "#/" }] });
  }

  render(Widget, container);
  await flush();

  const toggle = container.querySelector(".m-navbar-toggle");
  assertEqual(toggle.getAttribute("aria-expanded"), "false");
  assertEqual(toggle.getAttribute("aria-label"), "Open menu");

  toggle.click();
  await flush();

  assertEqual(toggle.getAttribute("aria-expanded"), "true");
  assertEqual(toggle.getAttribute("aria-label"), "Close menu");
  assert(container.querySelector(".m-navbar").className.includes("m-navbar-open"));

  toggle.click();
  await flush();
  assertEqual(toggle.getAttribute("aria-expanded"), "false");
});

test("Navbar: clicking a nav link closes the menu and invokes the item's own onClick", async () => {
  const container = mountPoint();
  let clicked = false;

  function Widget() {
    return h(Navbar, {
      items: [{ key: "home", label: "Home", href: "#/", onClick: () => { clicked = true; } }],
    });
  }

  render(Widget, container);
  await flush();

  container.querySelector(".m-navbar-toggle").click();
  await flush();
  assert(container.querySelector(".m-navbar").className.includes("m-navbar-open"));

  container.querySelector(".m-navbar-link").click();
  await flush();

  assert(clicked, "the link's own onClick fires");
  assert(
    !container.querySelector(".m-navbar").className.includes("m-navbar-open"),
    "clicking a link closes the mobile menu",
  );
});

test("Navbar: Escape and an outside click both close the open menu", async () => {
  const container = mountPoint();

  function Widget() {
    return h(Navbar, { items: [{ key: "home", label: "Home" }] });
  }

  render(Widget, container);
  await flush();

  const toggle = container.querySelector(".m-navbar-toggle");

  toggle.click();
  await flush();
  assert(container.querySelector(".m-navbar").className.includes("m-navbar-open"));

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await flush();
  assert(
    !container.querySelector(".m-navbar").className.includes("m-navbar-open"),
    "Escape closes the menu",
  );

  toggle.click();
  await flush();
  assert(container.querySelector(".m-navbar").className.includes("m-navbar-open"));

  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await flush();
  assert(
    !container.querySelector(".m-navbar").className.includes("m-navbar-open"),
    "clicking outside the nav closes the menu",
  );
});

// ── Slider ────────────────────────────────────────────────────────────────

test("Slider: renders a native range input wired to min/max/step/value and shows the value when asked", async () => {
  const container = mountPoint();
  let received;

  function Widget() {
    const [value, setValue] = useState(40);
    return h(Slider, {
      label: "Volume",
      min: 0,
      max: 100,
      step: 5,
      value,
      showValue: true,
      onInput: (e) => { received = Number(e.target.value); setValue(Number(e.target.value)); },
    });
  }

  render(Widget, container);
  await flush();

  const input = container.querySelector(".m-slider-input");
  assertEqual(input.type, "range");
  assertEqual(input.min, "0");
  assertEqual(input.max, "100");
  assertEqual(input.step, "5");
  assertEqual(input.value, "40");
  assertEqual(container.querySelector(".m-slider-value").textContent, "40");

  input.value = "65";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await flush();

  assertEqual(received, 65);
  assertEqual(container.querySelector(".m-slider-value").textContent, "65");
});

// ── RangeSlider ───────────────────────────────────────────────────────────

test("RangeSlider: renders two thumbs and clamps each against the other", async () => {
  const container = mountPoint();
  let received;

  function Widget() {
    const [value, setValue] = useState([20, 80]);
    return h(RangeSlider, {
      label: "Price range",
      min: 0,
      max: 100,
      value,
      showValue: true,
      onChange: (next) => { received = next; setValue(next); },
    });
  }

  render(Widget, container);
  await flush();

  const inputs = container.querySelectorAll(".m-slider-input");
  assertEqual(inputs.length, 2);
  assertEqual(inputs[0].value, "20");
  assertEqual(inputs[1].value, "80");
  assertEqual(inputs[0].ariaLabel, "Minimum");
  assertEqual(inputs[1].ariaLabel, "Maximum");
  assertEqual(container.querySelector(".m-slider-value").textContent, "20 – 80");

  inputs[0].value = "50";
  inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
  await flush();
  assertEqual(received[0], 50);
  assertEqual(received[1], 80);

  inputs[1].value = "30";
  inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  await flush();
  assertEqual(received[0], 50, "the lower thumb clamps the upper thumb's new value");
  assertEqual(received[1], 50, "upper can't go below the current lower value");
});
