// Keyboard, focus-management, and ARIA tests for the interactive components
// audited for accessibility: BottomSheet, Dropdown, ContextMenu, Combobox,
// Tooltip, Tabs/TabPanel, Dialog, Drawer.

import { h, render, useState } from "../dist/nexa.js";
import {
  BottomSheet,
  Dropdown,
  ContextMenu,
  Combobox,
  Tooltip,
  Tabs,
  TabPanel,
  Dialog,
  Drawer,
  Button,
} from "../dist/nexa-components.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

function keydown(target, key) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

// ── BottomSheet ─────────────────────────────────────────────────────────────

test("BottomSheet: focuses first element on open, traps Tab, restores focus on close", async () => {
  let setOpenFn;
  const container = mountPoint();

  function Wrapper() {
    const [open, setOpen] = useState(false);
    setOpenFn = setOpen;
    return h(
      "div",
      null,
      h("button", { id: "opener" }, "Open"),
      h(
        BottomSheet,
        { open, title: "Sheet", onClose: () => setOpen(false) },
        h("button", null, "First"),
        h("button", null, "Second"),
      ),
    );
  }

  render(Wrapper, container);
  await flush();

  const opener = container.querySelector("#opener");
  opener.focus();

  setOpenFn(true);
  await flush();

  const buttons = Array.from(container.querySelectorAll(".m-bottom-sheet button"));
  assertEqual(buttons.length, 3, "close button + First + Second");
  assertEqual(document.activeElement, buttons[0], "initial focus lands on the first focusable element");

  buttons[buttons.length - 1].focus();
  keydown(document, "Tab");
  assertEqual(document.activeElement, buttons[0], "Tab from the last element wraps to the first");

  keydown(document, "Escape");
  await flush();
  assertEqual(document.activeElement, opener, "Escape closes the sheet and restores focus to the opener");
});

// ── Dropdown ────────────────────────────────────────────────────────────────

test("Dropdown: arrow keys navigate items, Tab closes the menu", async () => {
  const container = mountPoint();

  function Wrapper() {
    return h(Dropdown, {
      id: "menu",
      trigger: "Menu",
      items: [
        { key: "a", label: "Alpha", onClick: () => {} },
        { key: "b", label: "Beta", onClick: () => {} },
      ],
    });
  }

  render(Wrapper, container);
  await flush();

  container.querySelector(".m-dropdown-trigger").click();
  await flush();

  let items = Array.from(container.querySelectorAll(".m-dropdown-menu button"));
  assertEqual(document.activeElement, items[0], "opening focuses the first menu item");

  keydown(document, "ArrowDown");
  items = Array.from(container.querySelectorAll(".m-dropdown-menu button"));
  assertEqual(document.activeElement, items[1], "ArrowDown moves focus to the next item");

  keydown(document, "Tab");
  await flush();
  assertEqual(container.querySelector(".m-dropdown-menu"), null, "Tab closes the dropdown menu");
});

// ── ContextMenu ─────────────────────────────────────────────────────────────

test("ContextMenu: arrow keys navigate items, Escape restores focus to the invoker", async () => {
  let openFn;
  const container = mountPoint();

  function Wrapper() {
    const [state, setState] = useState({ open: false, x: 0, y: 0 });
    openFn = () => setState({ open: true, x: 0, y: 0 });

    return h(
      "div",
      null,
      h("button", { id: "trigger" }, "Trigger"),
      h(ContextMenu, {
        open: state.open,
        x: state.x,
        y: state.y,
        onClose: () => setState((s) => ({ ...s, open: false })),
        items: [
          { key: "a", label: "Alpha", onClick: () => {} },
          { key: "b", label: "Beta", onClick: () => {} },
        ],
      }),
    );
  }

  render(Wrapper, container);
  await flush();

  const trigger = container.querySelector("#trigger");
  trigger.focus();

  openFn();
  await flush();

  let items = Array.from(container.querySelectorAll(".m-context-menu button"));
  assertEqual(document.activeElement, items[0], "opening focuses the first menu item");
  assertEqual(
    container.querySelector(".m-context-menu").getAttribute("aria-label"),
    "Context menu",
    "menu has a default accessible name",
  );

  keydown(document, "ArrowDown");
  items = Array.from(container.querySelectorAll(".m-context-menu button"));
  assertEqual(document.activeElement, items[1], "ArrowDown moves focus to the next item");

  keydown(document, "Escape");
  await flush();
  assertEqual(document.activeElement, trigger, "Escape closes the menu and restores focus to the invoker");
});

// ── Combobox ────────────────────────────────────────────────────────────────

test("Combobox: arrow keys move aria-activedescendant, Enter selects, focus returns to the trigger", async () => {
  const container = mountPoint();

  function Wrapper() {
    const [value, setValue] = useState(undefined);
    return h(Combobox, {
      id: "fruit",
      label: "Fruit",
      value,
      onChange: setValue,
      options: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "cherry", label: "Cherry" },
      ],
    });
  }

  render(Wrapper, container);
  await flush();

  const trigger = container.querySelector("#fruit");
  trigger.click();
  await flush();

  const input = container.querySelector(".m-combobox-search");
  assertEqual(document.activeElement, input, "opening focuses the search input");
  assertEqual(
    input.getAttribute("aria-activedescendant"),
    "fruit-option-apple",
    "the first option is active by default",
  );

  keydown(document, "ArrowDown");
  await flush();
  assertEqual(
    input.getAttribute("aria-activedescendant"),
    "fruit-option-banana",
    "ArrowDown moves the active option",
  );

  keydown(document, "Enter");
  await flush();

  assertEqual(container.querySelector(".m-combobox-dropdown"), null, "Enter closes the dropdown");
  assertEqual(document.activeElement, trigger, "selecting restores focus to the trigger");
  assertEqual(
    container.querySelector(".m-combobox-value").textContent,
    "Banana",
    "Enter selected the active option",
  );
});

// ── Tooltip ─────────────────────────────────────────────────────────────────

test("Tooltip: trigger is described by a real, referenceable bubble; Escape dismisses it", async () => {
  const container = mountPoint();

  function Wrapper() {
    return h(Tooltip, { id: "info", content: "More info" }, h(Button, { id: "trigger" }, "Hover me"));
  }

  render(Wrapper, container);
  await flush();

  const trigger = container.querySelector("#trigger");
  const bubble = container.querySelector(".m-tooltip-bubble");

  assertEqual(bubble.id, "info-bubble");
  assertEqual(bubble.getAttribute("role"), "tooltip");
  assertEqual(bubble.textContent, "More info");
  assertEqual(
    trigger.getAttribute("aria-describedby"),
    "info-bubble",
    "the wrapped trigger is described by the tooltip bubble",
  );

  const wrap = container.querySelector(".m-tooltip-wrap");
  keydown(wrap, "Escape");
  await flush();
  assert(wrap.className.includes("m-tooltip-dismissed"), "Escape marks the tooltip dismissed");
});

// ── Tabs / TabPanel ─────────────────────────────────────────────────────────

test("Tabs: roving tabindex, arrow keys move focus and selection, aria linkage matches panels", async () => {
  const container = mountPoint();

  function Wrapper() {
    const [value, setValue] = useState("a");
    return h(
      "div",
      null,
      h(Tabs, {
        value,
        onChange: setValue,
        items: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
        ],
      }),
      h(TabPanel, { id: "a", activeId: value }, "Panel A"),
      h(TabPanel, { id: "b", activeId: value }, "Panel B"),
      h(TabPanel, { id: "c", activeId: value }, "Panel C"),
    );
  }

  render(Wrapper, container);
  await flush();

  const tabA = container.querySelector("#tab-a");
  const tabB = container.querySelector("#tab-b");

  assertEqual(tabA.getAttribute("tabindex"), "0", "the selected tab is in the tab order");
  assertEqual(tabB.getAttribute("tabindex"), "-1", "unselected tabs are removed from the tab order");
  assertEqual(tabA.getAttribute("aria-controls"), "panel-a");
  assertEqual(container.querySelector("#panel-a").getAttribute("aria-labelledby"), "tab-a");

  tabA.focus();
  keydown(tabA, "ArrowRight");
  await flush();

  assertEqual(document.activeElement.id, "tab-b", "ArrowRight moves focus to the next tab");
  assertEqual(
    container.querySelector("#tab-b").getAttribute("tabindex"),
    "0",
    "moving focus also selects it (automatic activation)",
  );
  assert(container.querySelector("#panel-b"), "the newly selected tab's panel is now rendered");
  assertEqual(container.querySelector("#panel-a"), null, "the previous panel is no longer rendered");
});

// ── Dialog ──────────────────────────────────────────────────────────────────

test("Dialog: focuses first element on open, traps Tab, restores focus on close", async () => {
  let setOpenFn;
  const container = mountPoint();

  function Wrapper() {
    const [open, setOpen] = useState(false);
    setOpenFn = setOpen;
    return h(
      "div",
      null,
      h("button", { id: "opener" }, "Open"),
      h(
        Dialog,
        { open, title: "Confirm", onClose: () => setOpen(false) },
        h("button", null, "First"),
        h("button", null, "Second"),
      ),
    );
  }

  render(Wrapper, container);
  await flush();

  const opener = container.querySelector("#opener");
  opener.focus();

  setOpenFn(true);
  await flush();

  const buttons = Array.from(container.querySelectorAll(".m-dialog button"));
  assertEqual(buttons.length, 3, "close button + First + Second");
  assertEqual(document.activeElement, buttons[0], "initial focus lands on the first focusable element");

  buttons[buttons.length - 1].focus();
  keydown(document, "Tab");
  assertEqual(document.activeElement, buttons[0], "Tab from the last element wraps to the first");

  keydown(document, "Escape");
  await flush();
  assertEqual(document.activeElement, opener, "Escape closes the dialog and restores focus to the opener");
});

// ── Drawer ──────────────────────────────────────────────────────────────────

test("Drawer: focuses first element on open, traps Tab, restores focus on close", async () => {
  let setOpenFn;
  const container = mountPoint();

  function Wrapper() {
    const [open, setOpen] = useState(false);
    setOpenFn = setOpen;
    return h(
      "div",
      null,
      h("button", { id: "opener" }, "Open"),
      h(
        Drawer,
        { open, title: "Menu", onClose: () => setOpen(false) },
        h("button", null, "First"),
        h("button", null, "Second"),
      ),
    );
  }

  render(Wrapper, container);
  await flush();

  const opener = container.querySelector("#opener");
  opener.focus();

  setOpenFn(true);
  await flush();

  const buttons = Array.from(container.querySelectorAll(".m-drawer button"));
  assertEqual(buttons.length, 3, "close button + First + Second");
  assertEqual(document.activeElement, buttons[0], "initial focus lands on the first focusable element");

  buttons[buttons.length - 1].focus();
  keydown(document, "Tab");
  assertEqual(document.activeElement, buttons[0], "Tab from the last element wraps to the first");

  keydown(document, "Escape");
  await flush();
  assertEqual(document.activeElement, opener, "Escape closes the drawer and restores focus to the opener");
});
