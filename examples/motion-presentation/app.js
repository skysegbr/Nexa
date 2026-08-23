import { h, render, useCallback, useEffect, useRef, useState } from "/dist/fluxaway.js";
import { useTimeline } from "/dist/fluxaway-motion.js";
import { PlaybackDeck } from "./components/PlaybackDeck.js";
import { PresentationStage } from "./components/PresentationStage.js";
import { LABELS, PRESENTATION_DURATION, SCENES } from "./data.js";
import { buildPresentationTracks } from "./timeline.js";

function sceneIndexAt(time) {
  for (let index = SCENES.length - 1; index >= 0; index -= 1) {
    if (time >= SCENES[index].at) return index;
  }
  return 0;
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const timeline = useTimeline({
    duration: PRESENTATION_DURATION,
    labels: LABELS,
    tracks: buildPresentationTracks(),
    onFrame: Object.fromEntries(
      SCENES.map((scene, index) => [scene.id, () => setActiveIndex(index)]),
    ),
  });

  const goTo = useCallback((index) => {
    const bounded = Math.max(0, Math.min(SCENES.length - 1, index));
    activeIndexRef.current = bounded;
    setActiveIndex(bounded);
    timeline.gotoAndPlay(SCENES[bounded].id);
  }, [timeline]);

  const next = useCallback(() => goTo(activeIndexRef.current + 1), [goTo]);
  const previous = useCallback(() => goTo(activeIndexRef.current - 1), [goTo]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") next();
      if (event.key === "ArrowLeft" || event.key === "PageUp") previous();
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(SCENES.length - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, next, previous]);

  const seek = useCallback((time) => {
    timeline.stop();
    timeline.seek(time);
    const index = sceneIndexAt(time);
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, [timeline]);

  return h(
    "main",
    { className: "mp-app" },
    h(PresentationStage, { timeline, activeIndex }),
    h(PlaybackDeck, {
      timeline,
      scenes: SCENES,
      activeIndex,
      onSelect: goTo,
      onPrevious: previous,
      onNext: next,
      onSeek: seek,
    }),
  );
}

render(App, document.getElementById("app"));
