// Editor keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y for history,
// Delete/Backspace for the selection, Esc to cancel guide drawing. Events
// originating in form fields are ignored — inside an input, Ctrl+Z is the
// browser's native text undo.

import { useEffect } from "/dist/nexa.js";

export function useEditorShortcuts({ undo, redo, onDelete, onEscape }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.matches?.("input, select, textarea")) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete();
      } else if (event.key === "Escape") {
        onEscape();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
