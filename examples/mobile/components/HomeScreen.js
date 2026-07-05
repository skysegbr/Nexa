import { h, useRef, useState, useSwipe, useLongPress, useVibrate } from "/dist/nexa.js";
import { Button, Card } from "/dist/nexa-components.js";

import { FEATURES } from "../data.js";

export function HomeScreen({ onOpenSheet }) {
  const swipeRef = useRef(null);
  const longRef  = useRef(null);
  const vibrate  = useVibrate();
  const [swipeMsg, setSwipeMsg] = useState("");

  useSwipe(swipeRef, {
    onSwipeLeft:  () => setSwipeMsg("← swiped left"),
    onSwipeRight: () => setSwipeMsg("→ swiped right"),
    onSwipeUp:    () => setSwipeMsg("↑ swiped up"),
    onSwipeDown:  () => setSwipeMsg("↓ swiped down"),
    threshold: 40,
  });

  useLongPress(longRef, {
    onLongPress: () => {
      vibrate(20);
      setSwipeMsg("Long press detected!");
    },
    delay: 600,
  });

  return h(
    "div",
    null,
    h(
      Card,
      { ref: swipeRef, padded: true, className: "mob-swipe-area m-mb-4" },
      h("p", { className: "mob-swipe-hint m-text-muted" }, "Swipe area"),
      swipeMsg
        ? h("strong", { className: "mob-swipe-result" }, swipeMsg)
        : h("span", { className: "m-text-muted" }, "Swipe in any direction"),
    ),
    h(
      Button,
      {
        ref: longRef,
        variant: "tonal",
        className: "m-button-full m-mb-4",
        style: { touchAction: "none" },
      },
      "Press and hold (600ms)",
    ),
    h("h2", { className: "mob-features-title" }, "Features"),
    h(
      "div",
      { className: "m-row" },
      FEATURES.map((f) =>
        h(
          "div",
          { key: f.id, className: "m-col-12 m-col-sm-6 m-mb-4" },
          h(
            Card,
            { padded: true },
            h("span", { className: "mob-feature-name" }, f.title),
            h("p", { className: "mob-feature-body" }, f.body),
          ),
        ),
      ),
    ),
    h(Button, { variant: "contained", className: "m-button-full", onClick: onOpenSheet }, "Open Bottom Sheet"),
  );
}
