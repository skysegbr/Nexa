import { h, useEffect, useState } from "/dist/fluxaway.js";

export function PlaybackDeck({ timeline, scenes, activeIndex, onSelect, onPrevious, onNext, onSeek }) {
  const [snapshot, setSnapshot] = useState({ time: 0, playing: true });

  useEffect(() => {
    const id = setInterval(() => {
      const next = { time: Math.round(timeline.time), playing: timeline.isPlaying };
      setSnapshot((current) => current.time === next.time && current.playing === next.playing ? current : next);
    }, 80);
    return () => clearInterval(id);
  }, [timeline]);

  const percent = Math.min(100, (snapshot.time / timeline.duration) * 100);

  return h(
    "section",
    { className: "mp-deck", ariaLabel: "Presentation playback" },
    h("div", { className: "mp-deck-transport" },
      h("button", { type: "button", onClick: onPrevious, disabled: activeIndex === 0, ariaLabel: "Previous scene" }, "←"),
      h("button", {
        type: "button",
        className: "mp-deck-play",
        onClick: () => {
          if (snapshot.playing) timeline.stop();
          else if (snapshot.time >= timeline.duration) onSelect(0);
          else timeline.play();
        },
        ariaLabel: snapshot.playing ? "Pause presentation" : "Play presentation",
      }, snapshot.playing ? "Ⅱ" : "▶"),
      h("button", { type: "button", onClick: onNext, disabled: activeIndex === scenes.length - 1, ariaLabel: "Next scene" }, "→"),
    ),
    h("div", { className: "mp-deck-timeline" },
      h("div", { className: "mp-deck-labels" },
        scenes.map((scene, index) => h("button", {
          key: scene.id,
          type: "button",
          className: index === activeIndex ? "mp-deck-label-active" : "",
          onClick: () => onSelect(index),
        }, h("span", null, scene.number), scene.label)),
      ),
      h("div", { className: "mp-deck-scrub-wrap" },
        h("span", { className: "mp-deck-progress", style: { width: `${percent}%` }, ariaHidden: "true" }),
        h("input", {
          type: "range",
          min: 0,
          max: timeline.duration,
          step: 20,
          value: snapshot.time,
          ariaLabel: "Presentation timeline",
          onInput: (event) => onSeek(Number(event.target.value)),
        }),
      ),
    ),
    h("output", { className: "mp-deck-clock" }, `${(snapshot.time / 1000).toFixed(1)}s`),
  );
}
