# Motion Editor

A Flash-8-style visual editor for [nexa-motion](../../dist/nexa-motion.js) timelines. Everything you build exports as ready-to-paste `useTimeline()` code — the preview IS the real runtime, seeked and played.

Run `python server.py` at the repo root and open `http://localhost:8000/examples/motion-editor/`.

## The core workflow (place → scrub → drag → play)

1. **Create an actor**: pick ▭ / ◯ / T or draw with the Line/Pencil tools. Vector strokes are stored as portable SVG paths, and every actor gets a layer row plus a starter keyframe at frame 1.
2. **Move the playhead**: click/drag on the timeline ruler, or press ▶ play.
3. **Drag the actor** with the ➤ select tool: its position is recorded as a keyframe **at the playhead** (auto-key). A plain click never records anything — only a real drag does.
4. **Press ▶ play**: the actor tweens between its keyframes.

Rotation and scale work the same way with the ⤾ Free Transform tool: the lollipop above the selection rotates (Shift snaps to 15°), the corner diamonds scale, and releasing records `rotate` / `scale` keyframes at the playhead.

## Selecting things

- **Click an actor on stage** (select tool) — it gets a selection rect, a name tag and resize handles, its layer row and lane light up on the timeline, and the inspector shows its box, fill and **Behavior** (all of its keyframes).
- **Click a layer's name** on the timeline — same thing, and it's the reliable way to grab an actor that is *invisible at the current playhead* (opacity 0, scale 0). The selection rect still shows where it is.
- **Click a keyframe dot** on a lane (or a row in the actor's Behavior list) — the inspector flips to that keyframe: time, tweened properties, easing (with the curve), motion guide. Shift-click for multi-selection.

An actor selection and a keyframe selection are mutually exclusive — the inspector shows one at a time, like Flash's Properties panel following what you last clicked.

## Editing behavior as code

- **Per actor**: with an actor selected, *Behavior → ✎ edit track code* opens just that actor's keyframe array; ✓ apply replaces its track (one undo step).
- **Whole document**: *Export → ✎ edit* opens the full `useTimeline()` source; apply parses it back — new track names spawn starter actors on stage.

## The timeline

Frames at the document's fps (default 24, editable in the transport — the readout shows `f41 · 24 fps · 1.7s`). Dots are keyframes; shaded spans with arrows are tweens (gold when the span ends on a motion guide). Everything snaps to the frame grid.

- **Layers column**: 👁 hide · 🔒 lock (blocks stage editing) · colored square = outline mode · click name selects · double-click renames · ↑↓ reorder (rows top→bottom paint back→front) · `+` keyframe at playhead · ✕ delete.
- **Transport**: play/stop/rewind · ◉ onion skin (ghosts per frame; drag the ❲ ❳ brackets on the ruler to widen) · ∞ loop (exported) · spd (preview only) · zoom · 🏷 label at the playhead (exported for `gotoAndPlay`; double-click a marker removes it).

## Keyboard

`Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y` undo/redo · `Ctrl+C / Ctrl+V` copy/paste keyframes to the playhead · `Ctrl+D` duplicate actor · `Del` delete selection · `Esc` cancel guide drawing · `V/Q/N/Y/R/O/T` select Transform/Line/Pencil/Rectangle/Oval/Text tools.

## More

- **Motion guides**: select a keyframe → *draw guide on stage* → click points → finish. Drag the anchors to reshape; *orient* rotates along the path.
- **Library**: with an actor selected, *☆ convert to symbol* creates a real linked symbol. Every placed instance shares its artwork, so editing the fill/text through one instance updates all of them; removing a symbol safely detaches its instances as independent artwork.
- **Projects** save/load in localStorage from the header; *stage* picks the stage color. The Export pane always holds the current `useTimeline()` code — copy and paste it into any Nexa app.

Project files carry a versioned editor schema. Legacy JSON is normalized on import, and session-only keyframe IDs are never written to saved/downloaded files.

## Road to the Flash authoring model

The runtime stays browser-native and small; Flash-like authoring belongs here in the editor. The next structural milestones are independent layers that can hold multiple actors, layer folders/masks/guides, scene navigation, a symbol-editing stage for nested MovieClips, and explicit frame/keyframe/blank-keyframe operations. That order avoids baking editor-only complexity into `nexa-motion.js`.
