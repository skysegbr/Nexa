import { h, useEffect } from "/dist/nexa.js";
import { stagger, useTimeline } from "/dist/nexa-motion.js";
import { FlavorFX } from "./FlavorFX.js";

export function DishFrame({ course, active, courseIndex }) {
  const reveal = [{ at: 0, y: 55, opacity: 0 }, { at: 980, y: 0, opacity: 1, ease: "outCubic" }];
  const tl = useTimeline({
    duration: 4200,
    autoplay: false,
    tracks: {
      photo: [
        { at: 0, scale: 1.15, opacity: 0.4 },
        { at: 1400, scale: 1, opacity: 1, ease: "outCubic" },
        { at: 4200, scale: 1.04, ease: "inOutCubic" },
      ],
      paper: [{ at: 0, opacity: 0 }, { at: 600, opacity: 1, ease: "outCubic" }],
      course: reveal,
      title: stagger(reveal, 120, 1),
      body: stagger(reveal, 120, 2),
      note: stagger(reveal, 120, 3),
      tags: [{ at: 900, x: -24, opacity: 0 }, { at: 1600, x: 0, opacity: 1, ease: "outCubic" }],
      credit: [{ at: 1200, opacity: 0 }, { at: 1900, opacity: 1 }],
    },
  });

  useEffect(() => {
    if (active) tl.gotoAndPlay(0);
    else tl.gotoAndStop(0);
  }, [active, tl]);

  return h(
    "article",
    { className: `pj-dish pj-dish-${course.id} pj-copy-${course.side}${active ? " pj-dish-live" : ""}` },
    h("div", { className: "pj-photo-wrap" }, h("img", { className: "pj-photo", src: course.image, alt: course.alt, ref: tl.track("photo") })),
    h("section", { className: "pj-paper", ref: tl.track("paper") },
      h("div", { className: "pj-course", ref: tl.track("course") }, h("span"), course.course),
      h("h1", { ref: tl.track("title") }, course.title),
      h("p", { className: "pj-body", ref: tl.track("body") }, course.body),
      h("div", { className: "pj-note", ref: tl.track("note") }, h("small", null, "CHEF'S NOTE"), h("strong", null, course.note)),
      h("div", { className: "pj-tags", ref: tl.track("tags") }, course.tags.map((tag) => h("span", { key: tag }, tag))),
    ),
    h(FlavorFX, { kind: course.id, active }),
    h("a", { className: "pj-credit", href: course.source, target: "_blank", rel: "noreferrer", ref: tl.track("credit") },
      h("span", null, `PLATE ${String(courseIndex + 1).padStart(2, "0")} / 10`),
      h("span", null, course.credit),
      h("b", null, "↗"),
    ),
    h("span", { className: "pj-frame-mark pj-frame-mark-a", ariaHidden: "true" }),
    h("span", { className: "pj-frame-mark pj-frame-mark-b", ariaHidden: "true" }),
  );
}
