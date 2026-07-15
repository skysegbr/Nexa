// Editor keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y for history,
// Ctrl+C / Ctrl+V for keyframes, Ctrl+D to duplicate the selected actor,
// Delete/Backspace for the selection, Esc to cancel guide drawing. Events
// originating in form fields are ignored — inside an input, Ctrl+Z/C/V are
// the browser's native text editing. Copy is also left alone while real
// text is selected on the page.

import { useEffect } from "/dist/nexa.js";

export function useEditorShortcuts({ undo, redo, onCopy, onPaste, onDuplicate, onDelete, onEscape, onTool, onFrames }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.matches?.("input, select, textarea")) return;

      const combo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase();
      const toolKeys = { v: "select", q: "transform", n: "line", y: "pencil", r: "rect", o: "ellipse", t: "text" };

      if (combo === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (combo === "y") {
        event.preventDefault();
        redo();
      } else if (combo === "c") {
        if (String(window.getSelection?.() ?? "") !== "") return; // native copy wins
        event.preventDefault();
        onCopy();
      } else if (combo === "v") {
        event.preventDefault();
        onPaste();
      } else if (combo === "d") {
        event.preventDefault(); // the browser would bookmark the page
        onDuplicate();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete();
      } else if (event.key === "Escape") {
        onEscape();
      } else if (event.key === "F5") {
        event.preventDefault();
        onFrames.insertFrame();
      } else if (event.key === "F6") {
        event.preventDefault();
        if (event.shiftKey) onFrames.clearKeyframe();
        else onFrames.insertKeyframe();
      } else if (event.key === "F7") {
        event.preventDefault();
        onFrames.insertBlankKeyframe();
      } else if (!event.ctrlKey && !event.metaKey && !event.altKey && toolKeys[event.key.toLowerCase()]) {
        event.preventDefault();
        onTool(toolKeys[event.key.toLowerCase()]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
