import { h, useEffect, useRef } from "/dist/nexa.js";
import { useTimeline } from "/dist/nexa-motion.js";

const HERO_ART = new URL("../assets/kinetic-hero.png", import.meta.url).href;

function LivePulse() {
  const tl = useTimeline({
    duration: 1800,
    loop: true,
    tracks: {
      core: [
        { at: 0, scale: 0.8, opacity: 0.7 },
        { at: 900, scale: 1.15, opacity: 1, ease: "inOutCubic" },
        { at: 1800, scale: 0.8, opacity: 0.7, ease: "inOutCubic" },
      ],
      ring: [
        { at: 0, scale: 0.6, opacity: 0.8 },
        { at: 1800, scale: 2.5, opacity: 0, ease: "outCubic" },
      ],
    },
  });

  return h(
    "span",
    { className: "ml-live-pulse", ariaHidden: "true" },
    h("span", { className: "ml-live-ring", ref: tl.track("ring") }),
    h("span", { className: "ml-live-core", ref: tl.track("core") }),
  );
}

export function Hero() {
  const heroRef = useRef(null);
  const intro = useTimeline({
    duration: 2400,
    labels: { copy: 180, visual: 620 },
    tracks: {
      eyebrow: [{ at: 0, y: 24, opacity: 0 }, { at: 700, y: 0, opacity: 1, ease: "outCubic" }],
      lineOne: [{ at: 120, y: 100, rotate: 3, opacity: 0 }, { at: 1000, y: 0, rotate: 0, opacity: 1, ease: "outBack" }],
      lineTwo: [{ at: 260, y: 110, rotate: -2, opacity: 0 }, { at: 1160, y: 0, rotate: 0, opacity: 1, ease: "outBack" }],
      lead: [{ at: 520, y: 28, opacity: 0 }, { at: 1200, y: 0, opacity: 1, ease: "outCubic" }],
      actions: [{ at: 680, y: 20, opacity: 0 }, { at: 1360, y: 0, opacity: 1, ease: "outCubic" }],
      visual: [{ at: 450, x: 120, scale: 0.92, opacity: 0 }, { at: 1550, x: 0, scale: 1, opacity: 1, ease: "outCubic" }],
      metricA: [{ at: 1100, x: 40, opacity: 0 }, { at: 1800, x: 0, opacity: 1, ease: "outBack" }],
      metricB: [{ at: 1280, x: -40, opacity: 0 }, { at: 1980, x: 0, opacity: 1, ease: "outBack" }],
    },
  });
  const scrollTl = useTimeline({
    duration: 1000,
    autoplay: false,
    tracks: {
      art: [{ at: 0, y: 0, scale: 1 }, { at: 1000, y: 90, scale: 1.08, ease: "linear" }],
      glow: [{ at: 0, y: 0, opacity: 0.65 }, { at: 1000, y: -80, opacity: 0.15, ease: "linear" }],
    },
  });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const height = heroRef.current?.offsetHeight || innerHeight;
      scrollTl.seek(Math.max(0, Math.min(1000, (scrollY / height) * 1000)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    };
  }, [scrollTl]);

  const replay = () => {
    scrollTo({ top: 0, behavior: "smooth" });
    intro.gotoAndPlay(0);
  };

  return h(
    "section",
    { className: "ml-hero", id: "top", ref: heroRef },
    h("div", { className: "ml-hero-grid", ariaHidden: "true" }),
    h("div", { className: "ml-hero-glow", ref: scrollTl.track("glow"), ariaHidden: "true" }),
    h(
      "div",
      { className: "ml-hero-inner" },
      h(
        "div",
        { className: "ml-hero-copy" },
        h("p", { className: "ml-kicker", ref: intro.track("eyebrow") }, "NEXA MOTION / 001"),
        h(
          "h1",
          null,
          h("span", { ref: intro.track("lineOne") }, "Give motion to"),
          h("span", { className: "ml-hero-accent", ref: intro.track("lineTwo") }, "what does not exist yet."),
        ),
        h(
          "p",
          { className: "ml-hero-lead", ref: intro.track("lead") },
          "A digital experience crafted frame by frame — components, timelines, and creativity running directly in the browser.",
        ),
        h(
          "div",
          { className: "ml-hero-actions", ref: intro.track("actions") },
          h("button", { type: "button", className: "ml-btn ml-btn-primary", onClick: replay }, h("span", null, "Replay timeline"), h("span", null, "↻")),
          h("a", { className: "ml-btn ml-btn-ghost", href: "#manifesto" }, "Explore the system", h("span", null, "↓")),
        ),
      ),
      h(
        "div",
        { className: "ml-hero-visual", ref: intro.track("visual") },
        h(
          "div",
          { className: "ml-hero-art", ref: scrollTl.track("art") },
          h("img", { src: HERO_ART, alt: "Kinetic blue-glass sculpture surrounding a glowing coral sphere" }),
          h("span", { className: "ml-art-index" }, "PLAY / 00:05.20"),
        ),
        h(
          "div",
          { className: "ml-metric ml-metric-left", ref: intro.track("metricA") },
          h(LivePulse, null),
          h("span", null, "Timeline live"),
          h("strong", null, "60 FPS"),
        ),
        h(
          "div",
          { className: "ml-metric ml-metric-right", ref: intro.track("metricB") },
          h("span", null, "Runtime"),
          h("strong", null, "0 build"),
          h("small", null, "native ESM"),
        ),
      ),
    ),
    h("a", { className: "ml-scroll-cue", href: "#manifesto" }, h("span", null, "SCROLL TO PLAY"), h("i")),
  );
}
