import { h, memo, useEffect, useRef, useState } from "/dist/nexa.js";
import { IconButton } from "/dist/nexa-components-core.js";
import { Tooltip } from "/dist/nexa-components-overlay.js";

function MindmapNodeImpl({ node, isRoot, onTextChange, onPositionChange, onAddChild, onDelete, onMeasure }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const textareaRef = useRef(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      onMeasure(node.id, Math.round(width), Math.round(height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [node.id]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  function commitEdit() {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    const value = textareaRef.current.value.trim();
    onTextChange(node.id, value || node.text);
    setIsEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRef.current = true;
      setIsEditing(false);
    }
  }

  // Drag updates node.x/y on every mousemove (not just on drop) so the SVG
  // connector in MindmapCanvas — which reads position from this same state —
  // redraws in lockstep with the card instead of snapping into place on release.
  function onDragStart(e) {
    if (e.button !== 0) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = node.x;
    const origY = node.y;
    let dragging = false;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < 4) return;
      if (!dragging) { dragging = true; setIsDragging(true); }
      onPositionChange(node.id, Math.max(0, origX + dx), Math.max(0, origY + dy));
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (dragging) setIsDragging(false);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return h(
    "div",
    {
      ref: cardRef,
      className: `mm-node${isRoot ? " mm-node-root" : ""}${isDragging ? " is-dragging" : ""}`,
      style: { left: `${node.x}px`, top: `${node.y}px`, "--mm-node-color": node.color },
      onMouseDown: onDragStart,
    },
    h("span", { className: "mm-node-dot" }),
    isEditing
      ? h("textarea", {
          ref: textareaRef,
          className: "mm-node-input",
          defaultValue: node.text,
          rows: 2,
          onMouseDown: (e) => e.stopPropagation(),
          onKeyDown,
          onBlur: commitEdit,
        })
      : h(
          "p",
          {
            className: "mm-node-text",
            onDblclick: (e) => { e.stopPropagation(); setIsEditing(true); },
          },
          node.text,
        ),
    h(
      "div",
      { className: "mm-node-actions", onMouseDown: (e) => e.stopPropagation() },
      h(
        Tooltip,
        { content: "Edit text" },
        h(IconButton, { label: "Edit text", variant: "text", onClick: () => setIsEditing(true) }, h("i", { className: "bi-pencil" })),
      ),
      h(
        Tooltip,
        { content: "Add idea" },
        h(IconButton, { label: "Add child idea", variant: "text", onClick: () => onAddChild(node.id) }, h("i", { className: "bi-plus-lg" })),
      ),
      !isRoot && h(
        Tooltip,
        { content: "Delete" },
        h(IconButton, { label: "Delete idea", variant: "text", onClick: () => onDelete(node.id) }, h("i", { className: "bi-trash" })),
      ),
    ),
  );
}

// Unaffected siblings keep the same `node` object reference when one card's
// position changes (see updatePosition in useMindmap.js), so memo skips
// re-rendering every other card on each mousemove of a drag.
export const MindmapNode = memo(MindmapNodeImpl);
