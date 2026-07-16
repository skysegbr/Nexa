// Category split of nexa-components.js (core/forms/overlay/data/nav/theme):
// the barrel must re-export every category export unchanged, the categories
// must not overlap, and components imported straight from a category module
// must render — so apps can import only the categories they use.

import { h, render } from "../dist/nexa.js";
import * as barrel from "../dist/nexa-components.js";
import * as core from "../dist/nexa-components-core.js";
import * as forms from "../dist/nexa-components-forms.js";
import * as overlay from "../dist/nexa-components-overlay.js";
import * as data from "../dist/nexa-components-data.js";
import * as nav from "../dist/nexa-components-nav.js";
import * as theme from "../dist/nexa-components-theme.js";
import { test, assert, assertEqual, mountPoint, flush } from "./runner.js";

const categories = { core, forms, overlay, data, nav, theme };

test("categories: the barrel re-exports every category export as the same reference", () => {
  for (const [name, mod] of Object.entries(categories)) {
    for (const key of Object.keys(mod)) {
      assert(key in barrel, `barrel is missing ${key} (from ${name})`);
      assert(barrel[key] === mod[key], `barrel.${key} !== ${name}.${key}`);
    }
  }
});

test("categories: the barrel exports nothing beyond the categories' union", () => {
  const union = new Set(Object.values(categories).flatMap((m) => Object.keys(m)));
  const extra = Object.keys(barrel).filter((k) => !union.has(k));
  assertEqual(extra.length, 0, `barrel-only exports: ${extra.join(", ")}`);
  assertEqual(Object.keys(barrel).length, union.size);
});

test("categories: no component is exported by two categories", () => {
  const seen = new Map();
  for (const [name, mod] of Object.entries(categories)) {
    for (const key of Object.keys(mod)) {
      assert(!seen.has(key), `${key} exported by both ${seen.get(key)} and ${name}`);
      seen.set(key, name);
    }
  }
  assertEqual(seen.size, 61, `expected 61 components, found ${seen.size}`);
});

test("categories: components render when imported directly from their category", async () => {
  const container = mountPoint();
  render(
    () =>
      h("div", null,
        h(core.Button, { }, "ok"),
        h(forms.TextField, { label: "Name" }),
        h(data.Table, { columns: [{ key: "a", label: "A" }], rows: [{ a: 1 }] }),
        h(nav.Tabs, { value: "t1", onChange: () => {}, items: [{ value: "t1", label: "T1" }] }),
      ),
    container,
  );
  await flush();
  assert(container.querySelector(".m-button"), "Button from core did not render");
  assert(container.querySelector("input"), "TextField from forms did not render");
  assert(container.querySelector("table"), "Table from data did not render");
  assert(container.querySelector('[role="tablist"]'), "Tabs from nav did not render");
});
