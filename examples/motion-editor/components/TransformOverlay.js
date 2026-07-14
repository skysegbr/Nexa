// Flash's Free Transform tool: a measured overlay around the selected
// actor with corner SCALE handles and a rotation lollipop above it. Both
// gestures preview by writing the element's transform directly (the
// controller is parked while editing) and commit ONE auto-key at the
// playhead on release — rotate/scale become keyframes, exactly like the
// position drag.
//
// The overlay tracks the element's VISUAL box (getBoundingClientRect), so
// the handles follow the actor wherever the tween has translated it —
// unlike the base-box resize handles of the selection tool.

import { h, useEffect, useRef, useState } from "/dist/nexa.js";
import { capturePointer, tweenRotation, tweenScale } from "./editorUtils.js";

// new RegExp(string): the repo's lightweight validator trips on literals.
const TRANSLATE_PART_RE = new RegExp("translate3d\\([^)]*\\)");

const CORNERS = ["nw", "ne", "sw", "se"];

export function TransformOverlay({ stageRef, actorId, onCommit }) {
  const [box, setBox] = useState(null); // visual box in stage coords
  const gestureRef = useRef(null);

  const elementOf = () =>
    stageRef.current && stageRef.current.querySelector(`.me-actor-${CSS.escape(actorId)}`);

  // Follow the element: scrubbing, playback and committed edits all move
  // it, so the box is re-measured on a light interval (and the setState
  // no-ops while nothing changed).
  useEffect(() => {
    const measure = () => {
      const element = elementOf();
      const stage = stageRef.current;
      if (!element || !stage) {
        setBox((previous) => (previous === null ? previous : null));
        return;
      }
      const er = element.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const next = { x: er.left - sr.left, y: er.top - sr.top, w: er.width, h: er.height };
      setBox((previous) =>
        previous &&
        Math.abs(previous.x - next.x) < 0.5 &&
        Math.abs(previous.y - next.y) < 0.5 &&
        Math.abs(previous.w - next.w) < 0.5 &&
        Math.abs(previous.h - next.h) < 0.5
          ? previous
          : next,
      );
    };
    measure();
    const id = setInterval(measure, 120);
    return () => clearInterval(id);
  }, [actorId]);

  const startGesture = (event, type) => {
    event.stopPropagation();
    const element = elementOf();
    if (!element || !box) return;
    capturePointer(event);
    const sr = stageRef.current.getBoundingClientRect();
    const center = { x: sr.left + box.x + box.w / 2, y: sr.top + box.y + box.h / 2 };
    const translateMatch = TRANSLATE_PART_RE.exec(element.style.transform || "");
    gestureRef.current = {
      type,
      element,
      center,
      translatePart: translateMatch ? translateMatch[0] : "",
      startRotate: tweenRotation(element),
      startScale: tweenScale(element),
      startAngle: Math.atan2(event.clientY - center.y, event.clientX - center.x),
      startDist: Math.max(1, Math.hypot(event.clientX - center.x, event.clientY - center.y)),
      value: null,
    };
  };

  const moveGesture = (event) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    if (gesture.type === "rotate") {
      const angle = Math.atan2(event.clientY - gesture.center.y, event.clientX - gesture.center.x);
      let deg = gesture.startRotate + ((angle - gesture.startAngle) * 180) / Math.PI;
      // Shift snaps to 15° stops, like Flash.
      deg = event.shiftKey ? Math.round(deg / 15) * 15 : Math.round(deg);
      gesture.value = { rotate: deg };
    } else {
      const dist = Math.hypot(event.clientX - gesture.center.x, event.clientY - gesture.center.y);
      const scale = Math.max(0.05, Math.round(gesture.startScale * (dist / gesture.startDist) * 100) / 100);
      gesture.value = { scale };
    }
    const rotate = gesture.value.rotate ?? gesture.startRotate;
    const scale = gesture.value.scale ?? gesture.startScale;
    gesture.element.style.transform =
      `${gesture.translatePart} rotate(${rotate}deg) scale(${scale}, ${scale})`.trim();
  };

  const endGesture = () => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture && gesture.value) onCommit(gesture.value);
  };

  if (!box) return null;

  const handleProps = (type) => ({
    onPointerDown: (event) => startGesture(event, type),
    onPointerMove: moveGesture,
    onPointerUp: endGesture,
  });

  return h(
    "div",
    { className: "me-transform" },
    h("div", {
      className: "me-transform-outline",
      style: { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` },
    }),
    h("div", {
      className: "me-rotate-stick",
      style: { left: `${box.x + box.w / 2}px`, top: `${box.y - 22}px` },
    }),
    h("div", {
      className: "me-rotate-handle",
      title: "Rotate (Shift snaps to 15°) — keys `rotate` at the playhead",
      style: { left: `${box.x + box.w / 2}px`, top: `${box.y - 26}px` },
      ...handleProps("rotate"),
    }),
    CORNERS.map((corner) =>
      h("div", {
        key: corner,
        className: `me-thandle me-thandle-${corner}`,
        title: "Scale — keys `scale` at the playhead",
        style: {
          left: `${corner.includes("w") ? box.x : box.x + box.w}px`,
          top: `${corner.includes("n") ? box.y : box.y + box.h}px`,
        },
        ...handleProps("scale"),
      }),
    ),
  );
}
