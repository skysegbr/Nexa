// Tests for the nexa-motion add-on: Flash-style timelines — keyframe
// interpolation, easings, labels, the play/stop/gotoAnd* quartet, loops,
// frame scripts, stagger, and the useTimeline lifecycle.

import { h, render, useState } from "../dist/nexa.js";
import { createTimeline, useTimeline, easings, stagger } from "../dist/nexa-motion.js";
import { assert, assertEqual, flush, mountPoint, test } from "./runner.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Binds a detached element to a track — enough for the interpolation tests,
// which drive the playhead with seek/gotoAndStop (no rAF, fully
// deterministic).
function boundTimeline(spec) {
  const tl = createTimeline(spec);
  const el = document.createElement("div");
  tl.track(Object.keys(spec.tracks)[0])(el);
  return { tl, el };
}

test("motion: seek interpolates position linearly between keyframes", async () => {
  const { tl, el } = boundTimeline({
    tracks: { box: [{ at: 0, x: 0, y: 0 }, { at: 1000, x: 100, y: 50 }] },
  });

  tl.seek(500);
  assertEqual(el.style.transform, "translate3d(50px, 25px, 0px)");

  tl.seek(1000);
  assertEqual(el.style.transform, "translate3d(100px, 50px, 0px)");
});

test("motion: playhead clamps before the first and after the last keyframe", async () => {
  const { tl, el } = boundTimeline({
    duration: 2000,
    tracks: { box: [{ at: 500, opacity: 0 }, { at: 1000, opacity: 1 }] },
  });

  tl.seek(0);
  assertEqual(el.style.opacity, "0", "holds the first value before the first keyframe");

  tl.seek(2000);
  assertEqual(el.style.opacity, "1", "holds the last value after the last keyframe");
});

test("motion: easing shapes the tween (destination keyframe's ease)", async () => {
  const { tl, el } = boundTimeline({
    tracks: { box: [{ at: 0, x: 0 }, { at: 1000, x: 100, ease: "outQuad" }] },
  });

  tl.seek(500);
  // outQuad(0.5) = 0.75 → 75px, clearly distinct from linear's 50px.
  assertEqual(el.style.transform, "translate3d(75px, 0px, 0px)");
  assertEqual(easings.outQuad(0.5), 0.75);
});

test("motion: a keyframe omitting a property does not interrupt its tween", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      box: [
        { at: 0, x: 0, opacity: 0 },
        { at: 1000, x: 100 }, // no opacity key here
        { at: 2000, opacity: 1 },
      ],
    },
  });

  tl.seek(1000);
  // opacity tweens 0→1 across 0..2000, so its midpoint is 0.5 — the x-only
  // keyframe at 1000 must not snap it.
  assertEqual(el.style.opacity, "0.5");
  assertEqual(el.style.transform, "translate3d(100px, 0px, 0px)");
});

test("motion: transform composes in canonical order with per-axis scale", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      box: [
        { at: 0, x: 10, rotate: 0, scale: 1 },
        { at: 1000, x: 10, rotate: 90, scaleX: 2, scale: 1 },
      ],
    },
  });

  tl.seek(1000);
  assertEqual(el.style.transform, "translate3d(10px, 0px, 0px) rotate(90deg) scale(2, 1)");
});

test("motion: duration is inferred from the last keyframe when omitted", async () => {
  const tl = createTimeline({
    tracks: { a: [{ at: 0, x: 0 }, { at: 1234, x: 10 }] },
  });
  assertEqual(tl.duration, 1234);
});

test("motion: labels drive gotoAndStop and label()", async () => {
  const { tl, el } = boundTimeline({
    labels: { meio: 500 },
    tracks: { box: [{ at: 0, x: 0 }, { at: 1000, x: 100 }] },
  });

  tl.gotoAndStop("meio");
  assertEqual(tl.time, 500);
  assertEqual(tl.label("meio"), 500);
  assertEqual(el.style.transform, "translate3d(50px, 0px, 0px)");
  assert(!tl.isPlaying, "gotoAndStop leaves the movie stopped");

  let threw = false;
  try {
    tl.gotoAndStop("inexistente");
  } catch {
    threw = true;
  }
  assert(threw, "unknown labels must throw");
});

test("motion: play advances via rAF and stop freezes the playhead", async () => {
  const { tl } = boundTimeline({
    duration: 10_000,
    tracks: { box: [{ at: 0, x: 0 }, { at: 10_000, x: 100 }] },
  });

  tl.play();
  assert(tl.isPlaying);
  await wait(120);
  assert(tl.time > 0, `playhead should advance, got ${tl.time}`);

  tl.stop();
  const frozen = tl.time;
  await wait(80);
  assertEqual(tl.time, frozen, "stop() must freeze the playhead");
});

test("motion: movie completes at duration and onComplete fires once", async () => {
  let completions = 0;
  const { tl, el } = boundTimeline({
    duration: 60,
    tracks: { box: [{ at: 0, opacity: 0 }, { at: 60, opacity: 1 }] },
    onComplete: () => {
      completions += 1;
    },
  });

  tl.play();
  await wait(200);
  assert(!tl.isPlaying, "movie must stop at the end");
  assertEqual(tl.time, 60);
  assertEqual(el.style.opacity, "1");
  assertEqual(completions, 1);
});

test("motion: loop wraps the playhead and fires onLoop", async () => {
  let loops = 0;
  const { tl } = boundTimeline({
    duration: 50,
    loop: true,
    tracks: { box: [{ at: 0, x: 0 }, { at: 50, x: 10 }] },
    onLoop: () => {
      loops += 1;
    },
  });

  tl.play();
  await wait(180);
  tl.stop();
  assert(loops >= 2, `expected at least 2 wraps, got ${loops}`);
  assert(tl.time >= 0 && tl.time <= 50, "playhead stays inside the movie");
});

test("motion: frame scripts fire once per crossing, and gotoAndPlay fires the target's script", async () => {
  const fired = [];
  const { tl } = boundTimeline({
    duration: 5000,
    labels: { marco: 100 },
    tracks: { box: [{ at: 0, x: 0 }, { at: 5000, x: 10 }] },
    onFrame: {
      marco: () => fired.push("marco"),
      3000: () => fired.push("tres"),
    },
  });

  tl.play();
  await wait(200); // crosses 100ms, nowhere near 3000ms
  tl.stop();
  assertEqual(fired.join(","), "marco", "only the crossed script fires, once");

  tl.gotoAndPlay("marco");
  tl.stop();
  assertEqual(fired.join(","), "marco,marco", "gotoAndPlay executes the target frame's script");

  tl.gotoAndStop(4000);
  assertEqual(fired.join(","), "marco,marco", "gotoAndStop fires no scripts");
});

test("motion: reverse plays the movie backwards", async () => {
  const { tl } = boundTimeline({
    duration: 10_000,
    tracks: { box: [{ at: 0, x: 0 }, { at: 10_000, x: 100 }] },
  });

  tl.gotoAndStop(5000);
  tl.reverse();
  tl.play();
  await wait(120);
  tl.stop();
  assert(tl.time < 5000, `expected the playhead to move backwards, got ${tl.time}`);
});

test("motion: setSpeed scales playback rate", async () => {
  const slow = boundTimeline({
    duration: 100_000,
    tracks: { box: [{ at: 0, x: 0 }, { at: 100_000, x: 1 }] },
  }).tl;
  const fast = boundTimeline({
    duration: 100_000,
    tracks: { box: [{ at: 0, x: 0 }, { at: 100_000, x: 1 }] },
  }).tl;

  slow.setSpeed(0.5);
  fast.setSpeed(4);
  slow.play();
  fast.play();
  await wait(150);
  slow.stop();
  fast.stop();
  assert(fast.time > slow.time * 3, `fast (${fast.time}) should be far ahead of slow (${slow.time})`);
});

test("motion: stagger shifts keyframes by index", async () => {
  const base = [{ at: 0, y: 20 }, { at: 300, y: 0 }];
  assertEqual(stagger(base, 100, 0)[0].at, 0);
  assertEqual(stagger(base, 100, 3)[0].at, 300);
  assertEqual(stagger(base, 100, 3)[1].at, 600);
  assertEqual(base[0].at, 0, "the source keyframes are not mutated");
});

test("motion: color tweens interpolate per RGBA channel", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      box: [
        { at: 0, backgroundColor: "rgb(0, 0, 0)", color: "#ff0000" },
        { at: 1000, backgroundColor: "rgb(255, 255, 255)", color: "#0000ff" },
      ],
    },
  });

  tl.seek(500);
  // Browsers normalize rgba(x, y, z, 1) to rgb(x, y, z) on readback.
  assertEqual(el.style.backgroundColor, "rgb(128, 128, 128)");
  assertEqual(el.style.color, "rgb(128, 0, 128)");

  tl.seek(1000);
  assertEqual(el.style.backgroundColor, "rgb(255, 255, 255)");
});

test("motion: set steps apply discretely and hold until the next step", async () => {
  const { tl, el } = boundTimeline({
    duration: 400,
    tracks: {
      sprite: [
        { at: 0, set: { backgroundPosition: "0px 0px" } },
        { at: 100, set: { backgroundPosition: "-64px 0px" } },
        { at: 200, set: { backgroundPosition: "-128px 0px" } },
      ],
    },
  });

  tl.seek(50);
  assertEqual(el.style.backgroundPosition, "0px 0px", "first frame holds until the next step");

  tl.seek(100);
  assertEqual(el.style.backgroundPosition, "-64px 0px");

  tl.seek(150);
  assertEqual(el.style.backgroundPosition, "-64px 0px", "no interpolation between steps");

  tl.seek(350);
  assertEqual(el.style.backgroundPosition, "-128px 0px", "last step holds to the end");
});

test("motion: a path keyframe follows the motion guide", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      comet: [
        { at: 0 },
        { at: 1000, path: "M 0 0 L 100 0" },
      ],
    },
  });

  tl.seek(500);
  assertEqual(el.style.transform, "translate3d(50px, 0px, 0px)");

  tl.seek(1000);
  assertEqual(el.style.transform, "translate3d(100px, 0px, 0px)");
});

test("motion: guide endpoints become x/y keyframes so later tweens continue from them", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      comet: [
        { at: 0 },
        { at: 1000, path: "M 0 0 L 100 0" },
        { at: 2000, x: 200, y: 50 },
      ],
    },
  });

  tl.seek(1500);
  // From the guide's end (100, 0) halfway to (200, 50).
  assertEqual(el.style.transform, "translate3d(150px, 25px, 0px)");
});

test("motion: orient rotates the element along the guide's tangent", async () => {
  const { tl, el } = boundTimeline({
    tracks: {
      comet: [
        { at: 0 },
        { at: 1000, path: "M 0 0 L 0 100", orient: true },
      ],
    },
  });

  tl.seek(500);
  const transform = el.style.transform;
  assert(transform.includes("rotate(90deg)"), `expected tangent rotation of 90deg, got: ${transform}`);
});

test("motion: late-bound elements sync to the playhead immediately", async () => {
  const tl = createTimeline({
    tracks: { box: [{ at: 0, opacity: 0 }, { at: 1000, opacity: 1 }] },
  });
  tl.seek(1000);

  const el = document.createElement("div");
  tl.track("box")(el);
  assertEqual(el.style.opacity, "1", "binding must apply the current frame at once");
});

test("motion: useTimeline autoplays after mount and destroys on unmount", async () => {
  const mp = mountPoint();
  let captured;

  function Movie() {
    const tl = useTimeline({
      duration: 10_000,
      tracks: { hero: [{ at: 0, x: 0 }, { at: 10_000, x: 100 }] },
    });
    captured = tl;
    return h("div", { ref: tl.track("hero"), className: "hero" }, "fly");
  }

  render(Movie, mp);
  await flush();
  await wait(120);
  assert(captured.isPlaying, "autoplay starts after mount");
  assert(captured.time > 0, "playhead advances");
  assert(mp.querySelector(".hero").style.transform.startsWith("translate3d("), "bound element is animated");

  const before = captured.time;
  render(() => h("p", null, "gone"), mp);
  await flush();
  await wait(80);
  assertEqual(captured.time, before, "destroy() on unmount halts the ticker");
  assert(!captured.isPlaying);
});

test("motion: useTimeline with autoplay:false stays parked until told otherwise", async () => {
  const mp = mountPoint();
  let captured;
  let show;

  function Movie() {
    const [on, set] = useState(true);
    show = set;
    const tl = useTimeline({
      autoplay: false,
      duration: 1000,
      tracks: { hero: [{ at: 0, x: 0 }, { at: 1000, x: 100 }] },
    });
    captured = tl;
    return h("div", null, on && h("span", { ref: tl.track("hero") }, "x"));
  }

  render(Movie, mp);
  await flush();
  await wait(60);
  assert(!captured.isPlaying, "no autoplay");
  assertEqual(captured.time, 0);

  captured.gotoAndStop(500);
  assertEqual(mp.querySelector("span").style.transform, "translate3d(50px, 0px, 0px)");

  // Unmounting the bound element prunes it from the track.
  show(false);
  await flush();
  captured.gotoAndStop(1000); // must not throw with the element gone
  assertEqual(captured.time, 1000);
});
