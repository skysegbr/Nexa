// Tests for the components added in the "component gaps" batch: Radio/
// RadioGroup, Avatar/AvatarGroup, Breadcrumb, Skeleton, Divider, Stat,
// NumberInput, TimePicker, Popover, TreeView, CommandPalette.

import { h, render, useState } from "../dist/nexa.js";
import {
  Radio,
  RadioGroup,
  Avatar,
  AvatarGroup,
  Breadcrumb,
  Skeleton,
  Divider,
  Stat,
  NumberInput,
  TimePicker,
  Popover,
  TreeView,
  CommandPalette,
  Button,
} from "../dist/nexa-components.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

function keydown(target, key) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

function typeInto(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// ── Radio / RadioGroup ──────────────────────────────────────────────────────

test("Radio: renders a native radio input wired to label/help/error", async () => {
  const container = mountPoint();
  render(() => h(Radio, { id: "r1", label: "Option A", help: "hint" }), container);
  await flush();

  const input = container.querySelector("input[type=radio]");
  assert(input, "renders an <input type=radio>");
  assertEqual(container.querySelector(".m-radio span").textContent, "Option A");
  assertEqual(input.getAttribute("aria-describedby"), "r1-help");
});

test("RadioGroup: checked follows value, clicking fires onChange, disabled options don't", async () => {
  const container = mountPoint();
  const events = [];

  function Wrapper() {
    const [value, setValue] = useState("b");
    return h(RadioGroup, {
      id: "size",
      label: "Size",
      value,
      onChange: (v) => { events.push(v); setValue(v); },
      options: [
        { value: "a", label: "Small" },
        { value: "b", label: "Medium" },
        { value: "c", label: "Large", disabled: true },
      ],
    });
  }

  render(Wrapper, container);
  await flush();

  const group = container.querySelector('[role="radiogroup"]');
  assert(group, "renders role=radiogroup");
  const inputs = Array.from(container.querySelectorAll("input[type=radio]"));
  assertEqual(inputs.length, 3);
  assertEqual(inputs.every((i) => i.name === "size"), true, "options share the group name");
  assertEqual(inputs[1].checked, true, "checked follows the controlled value");

  inputs[0].click();
  await flush();
  assertEqual(events.join(","), "a");
  assertEqual(inputs[0].checked, true);

  assert(inputs[2].disabled, "disabled option renders disabled");
});

// ── Avatar / AvatarGroup ────────────────────────────────────────────────────

test("Avatar: initials fallback from name, img when src is given", async () => {
  const container = mountPoint();
  render(
    () =>
      h(
        "div",
        null,
        h(Avatar, { name: "Ada Lovelace" }),
        h(Avatar, { name: "Solo" }),
        h(Avatar, { src: "x.png", name: "Pic" }),
      ),
    container,
  );
  await flush();

  const avatars = Array.from(container.querySelectorAll(".m-avatar"));
  assertEqual(avatars[0].textContent, "AL");
  assertEqual(avatars[1].textContent, "S");
  assert(avatars[2].querySelector("img"), "src renders an <img>");
});

test("AvatarGroup: shows at most `max` avatars plus a +N overflow counter", async () => {
  const container = mountPoint();
  const avatars = ["A", "B", "C", "D", "E"].map((n) => ({ name: n }));
  render(() => h(AvatarGroup, { avatars, max: 3 }), container);
  await flush();

  const rendered = Array.from(container.querySelectorAll(".m-avatar"));
  assertEqual(rendered.length, 4, "3 visible + 1 overflow");
  assertEqual(container.querySelector(".m-avatar-overflow").textContent, "+2");
});

// ── Breadcrumb ──────────────────────────────────────────────────────────────

test("Breadcrumb: links for ancestors, aria-current=page on the last item", async () => {
  const container = mountPoint();
  render(
    () =>
      h(Breadcrumb, {
        items: [
          { label: "Home", href: "/" },
          { label: "Docs", href: "/docs" },
          { label: "Current" },
        ],
      }),
    container,
  );
  await flush();

  const links = Array.from(container.querySelectorAll("a.m-breadcrumb-link"));
  assertEqual(links.length, 2, "only ancestors are links");
  const current = container.querySelector('[aria-current="page"]');
  assertEqual(current.textContent, "Current");
  assertEqual(container.querySelectorAll(".m-breadcrumb-sep").length, 2);
});

// ── Skeleton / Divider / Stat ───────────────────────────────────────────────

test("Skeleton: multi-line text variant renders N aria-hidden lines", async () => {
  const container = mountPoint();
  render(() => h(Skeleton, { variant: "text", lines: 3 }), container);
  await flush();

  const lines = Array.from(container.querySelectorAll(".m-skeleton-lines .m-skeleton-text"));
  assertEqual(lines.length, 3);
  assertEqual(container.querySelector(".m-skeleton-lines").getAttribute("aria-hidden"), "true");
  assertEqual(lines[2].style.width, "60%", "last line is shorter");
});

test("Divider: hr by default, vertical span with role=separator", async () => {
  const container = mountPoint();
  render(() => h("div", null, h(Divider), h(Divider, { vertical: true })), container);
  await flush();

  assert(container.querySelector("hr.m-divider"), "horizontal divider is an <hr>");
  const vertical = container.querySelector(".m-divider-vertical");
  assertEqual(vertical.getAttribute("role"), "separator");
  assertEqual(vertical.getAttribute("aria-orientation"), "vertical");
});

test("Stat: delta colors by leading sign", async () => {
  const container = mountPoint();
  render(
    () =>
      h(
        "div",
        null,
        h(Stat, { value: "1.2k", label: "Users", delta: "+12%" }),
        h(Stat, { value: "37", label: "Churn", delta: "-3%" }),
      ),
    container,
  );
  await flush();

  const deltas = Array.from(container.querySelectorAll(".m-stat-delta"));
  assert(deltas[0].classList.contains("m-stat-delta-up"));
  assert(deltas[1].classList.contains("m-stat-delta-down"));
});

// ── NumberInput ─────────────────────────────────────────────────────────────

test("NumberInput: steppers nudge by step, clamp at min/max, typing emits numbers", async () => {
  const container = mountPoint();
  let currentValue;

  function Wrapper() {
    const [value, setValue] = useState(9);
    currentValue = value;
    return h(NumberInput, { id: "qty", label: "Qty", min: 0, max: 10, value, onChange: setValue });
  }

  render(Wrapper, container);
  await flush();

  // Re-query buttons after every state change — re-renders may replace nodes.
  const btn = (i) => container.querySelectorAll(".m-number-input-btn")[i];

  btn(1).click();
  await flush();
  assertEqual(currentValue, 10);

  assert(btn(1).disabled, "increment disables at max");

  typeInto(container.querySelector("input[type=number]"), "3");
  await flush();
  assertEqual(currentValue, 3);

  typeInto(container.querySelector("input[type=number]"), "");
  await flush();
  assertEqual(currentValue, null, "clearing the field emits null");

  btn(0).click();
  await flush();
  assertEqual(currentValue, 0, "stepping from empty starts at min");
});

test("NumberInput: fractional steps don't accumulate float drift", async () => {
  const container = mountPoint();
  let currentValue;

  function Wrapper() {
    const [value, setValue] = useState(0.2);
    currentValue = value;
    return h(NumberInput, { id: "frac", value, step: 0.1, onChange: setValue });
  }

  render(Wrapper, container);
  await flush();

  container.querySelectorAll(".m-number-input-btn")[1].click();
  await flush();
  assertEqual(currentValue, 0.3, "0.2 + 0.1 rounds to the step precision");
});

// ── TimePicker ──────────────────────────────────────────────────────────────

test("TimePicker: opens a listbox of stepped times, selecting fires onChange and closes", async () => {
  const container = mountPoint();
  const events = [];

  function Wrapper() {
    const [value, setValue] = useState("09:30");
    return h(TimePicker, {
      id: "time",
      label: "Time",
      value,
      min: "09:00",
      max: "10:00",
      step: 30,
      onChange: (v) => { events.push(v); setValue(v); },
    });
  }

  render(Wrapper, container);
  await flush();

  const trigger = container.querySelector(".m-timepicker-trigger");
  assertEqual(trigger.textContent, "09:30");

  trigger.click();
  await flush();

  const options = Array.from(container.querySelectorAll(".m-timepicker-option"));
  assertEqual(options.map((o) => o.textContent).join(","), "09:00,09:30,10:00");
  assertEqual(document.activeElement, options[1], "opening focuses the selected option");

  options[2].click();
  await flush();
  assertEqual(events.join(","), "10:00");
  assertEqual(container.querySelector(".m-timepicker-list"), null, "selecting closes the list");
  assertEqual(trigger.textContent, "10:00");
});

test("TimePicker: Escape closes and refocuses the trigger", async () => {
  const container = mountPoint();
  render(() => h(TimePicker, { id: "t2", label: "T", value: "12:00" }), container);
  await flush();

  const trigger = container.querySelector(".m-timepicker-trigger");
  trigger.click();
  await flush();
  assert(container.querySelector(".m-timepicker-list"), "list is open");

  keydown(document, "Escape");
  await flush();
  assertEqual(container.querySelector(".m-timepicker-list"), null);
  assertEqual(document.activeElement, trigger, "focus returns to the trigger");
});

// ── Popover ─────────────────────────────────────────────────────────────────

test("Popover: trigger toggles the panel, Escape closes and restores focus", async () => {
  const container = mountPoint();
  render(
    () =>
      h(
        Popover,
        { id: "pop", trigger: h(Button, null, "Info"), title: "Details" },
        h("button", null, "Inside"),
      ),
    container,
  );
  await flush();

  const trigger = container.querySelector(".m-popover-trigger button");
  trigger.click();
  await flush();

  const panel = container.querySelector(".m-popover-panel");
  assert(panel, "click opens the panel");
  assertEqual(panel.getAttribute("role"), "dialog");
  assertEqual(document.activeElement.textContent, "Inside", "focus moves into the panel");

  keydown(document, "Escape");
  await flush();
  assertEqual(container.querySelector(".m-popover-panel"), null, "Escape closes");
  assertEqual(document.activeElement, trigger, "focus returns to the trigger");
});

// ── TreeView ────────────────────────────────────────────────────────────────

const TREE_ITEMS = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "app.js" },
      { id: "data", label: "data.js" },
    ],
  },
  { id: "readme", label: "README.md" },
];

test("TreeView: ArrowRight expands, ArrowDown walks visible nodes, Enter selects", async () => {
  const container = mountPoint();
  const selections = [];
  const expansions = [];

  function Wrapper() {
    const [selected, setSelected] = useState();
    return h(TreeView, {
      items: TREE_ITEMS,
      selected,
      onSelect: (id) => { selections.push(id); setSelected(id); },
      onExpandedChange: (ids) => expansions.push(ids.join(",")),
    });
  }

  render(Wrapper, container);
  await flush();

  const root = container.querySelector('[data-id="src"]');
  assertEqual(root.getAttribute("aria-expanded"), "false");

  root.focus();
  keydown(root, "ArrowRight");
  await flush();
  assertEqual(expansions.join("|"), "src");
  assertEqual(
    container.querySelector('[data-id="src"]').getAttribute("aria-expanded"),
    "true",
    "ArrowRight expands a collapsed branch",
  );

  keydown(container.querySelector('[data-id="src"]'), "ArrowDown");
  await flush();
  assertEqual(document.activeElement.dataset.id, "app", "ArrowDown moves to the first child");

  keydown(document.activeElement, "Enter");
  await flush();
  assertEqual(selections.join(","), "app");
  assert(
    container.querySelector('[data-id="app"]').classList.contains("m-tree-item-selected"),
    "selected node gets the selected class",
  );
});

test("TreeView: caret click toggles expansion without selecting", async () => {
  const container = mountPoint();
  const selections = [];

  render(
    () => h(TreeView, { items: TREE_ITEMS, onSelect: (id) => selections.push(id) }),
    container,
  );
  await flush();

  container.querySelector('[data-id="src"] .m-tree-caret').click();
  await flush();

  assertEqual(container.querySelectorAll(".m-tree-group li").length, 2, "children are visible");
  assertEqual(selections.length, 0, "caret click does not select");
});

// ── CommandPalette ──────────────────────────────────────────────────────────

test("CommandPalette: focuses input, filters, Enter runs the active command and closes", async () => {
  const container = mountPoint();
  const ran = [];
  let setOpenFn;

  function Wrapper() {
    const [open, setOpen] = useState(false);
    setOpenFn = setOpen;
    return h(CommandPalette, {
      open,
      onClose: () => setOpen(false),
      commands: [
        { id: "new", label: "New file", section: "Files", onSelect: () => ran.push("new") },
        { id: "open", label: "Open file", section: "Files", onSelect: () => ran.push("open") },
        { id: "theme", label: "Toggle theme", section: "View", onSelect: () => ran.push("theme") },
      ],
    });
  }

  render(Wrapper, container);
  await flush();

  setOpenFn(true);
  await flush();

  const input = container.querySelector(".m-command-input");
  assertEqual(document.activeElement, input, "opening focuses the search input");
  assertEqual(container.querySelectorAll(".m-command-option").length, 3);
  assertEqual(container.querySelectorAll(".m-command-section").length, 2, "section headers render");

  typeInto(input, "file");
  await flush();
  assertEqual(container.querySelectorAll(".m-command-option").length, 2, "query filters commands");

  keydown(input, "ArrowDown");
  await flush();
  keydown(input, "Enter");
  await flush();

  assertEqual(ran.join(","), "open", "Enter runs the active command");
  assertEqual(container.querySelector(".m-command"), null, "running a command closes the palette");
});

test("CommandPalette: Escape closes without running anything", async () => {
  const container = mountPoint();
  const ran = [];
  let setOpenFn;

  function Wrapper() {
    const [open, setOpen] = useState(true);
    setOpenFn = setOpen;
    return h(CommandPalette, {
      open,
      onClose: () => setOpen(false),
      commands: [{ id: "x", label: "X", onSelect: () => ran.push("x") }],
    });
  }

  render(Wrapper, container);
  await flush();

  keydown(document, "Escape");
  await flush();
  assertEqual(container.querySelector(".m-command"), null);
  assertEqual(ran.length, 0);
});
