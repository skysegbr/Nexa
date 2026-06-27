import { h } from "/dist/nexa.js";
import { ReverseButton } from "./ReverseButton.js";

export function CoreToolbar({ inputRef, query, setQuery, reverse, setReverse, clearSearch }) {
  return h(
    "form",
    { className: "core-toolbar", onSubmit: (e) => e.preventDefault() },
    h("input", {
      className: "m-field",
      ref: inputRef,
      value: query,
      onInput: (e) => setQuery(e.target.value),
      placeholder: "Filter feature…",
    }),
    h(ReverseButton, { reverse, setReverse }),
    h("button", {
      className: "m-button m-button-contained",
      type: "button",
      disabled: query.length === 0,
      onClick: clearSearch,
    }, "Clear"),
  );
}
