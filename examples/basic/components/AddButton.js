import { h } from "/dist/nexa.js";
import { Button } from "/dist/nexa-components-core.js";

export function AddButton({ setCount }) {
  return h(Button, {
    className: "add-button",
    variant: "contained",
    onClick: () => setCount((v) => v + 1),
  }, "Add");
}
