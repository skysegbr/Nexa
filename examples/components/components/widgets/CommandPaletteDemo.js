import { h, useState, useEffect } from "/dist/nexa.js";
import { CommandPalette, Button } from "/dist/nexa-components.js";
import { PALETTE_COMMANDS } from "../../data.js";

export function CommandPaletteDemo({ toast }) {
  const [open, setOpen] = useState(false);

  // The palette is controlled like Dialog — the global shortcut belongs to
  // the app, not the component.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = PALETTE_COMMANDS.map((cmd) => ({
    ...cmd,
    onSelect: () => toast.info(`Command: ${cmd.label}`),
  }));

  return h(
    "div",
    { className: "demo-section" },
    h("p", { className: "demo-label" }, "CommandPalette"),
    h(
      "div",
      { className: "demo-row" },
      h(Button, { variant: "contained", onClick: () => setOpen(true) }, "Open palette"),
      h("span", { className: "m-text-sm m-text-muted" }, "or press Ctrl/Cmd+K — type to filter, Enter runs"),
    ),
    h(CommandPalette, {
      open,
      onClose: () => setOpen(false),
      commands,
    }),
  );
}
