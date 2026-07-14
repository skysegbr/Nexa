// Scene controls in the movie, breadcrumb navigation inside MovieClips.

import { h } from "/dist/nexa.js";
import { SceneBar } from "./SceneBar.js";

export function EditorContextBar({ doc, sceneProps, onExitSymbol }) {
  if (!doc.editingSymbolId) return h(SceneBar, { doc, ...sceneProps });
  const ids = [...(doc.symbolEditStack || []), doc.editingSymbolId];
  const names = ids.map((id) => doc.library.find((symbol) => symbol.id === id)?.name || id);
  const scene = doc.scenes.find((entry) => entry.id === doc.activeSceneId);
  return h(
    "section",
    { className: "me-scenes me-symbol-context", ariaLabel: "Symbol editing context" },
    h("span", { className: "me-scenes-label" }, "Edit symbol"),
    h("span", { className: "me-symbol-crumb" }, [scene?.name || "Scene", ...names].join("  ›  ")),
    h("span", { className: "me-scene-count" }, `depth ${ids.length}`),
    h("button", { type: "button", className: "me-btn me-scene-btn", onClick: onExitSymbol }, "← back"),
  );
}
