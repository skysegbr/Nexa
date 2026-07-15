# Nexa Motion — Landing Page

An animated product landing page for the `nexa-motion` add-on, built on the
add-on itself: the hero plays a real `useTimeline` intro (replayable from the
"Replay timeline" button), the capability strip scrolls on a looping tween,
and each section below the fold starts its own timeline as it enters the
viewport.

Run `python server.py` at the repository root and open
`http://localhost:8000/examples/motion-landing/`.

## What to look at

- `components/Hero.js` — the hero intro timeline (staggered headline, badge,
  orbiting artwork) and the replay control.
- `components/useInViewTimeline.js` — a small hook that plays a timeline once
  when its section scrolls into view.
- `components/MotionLab.js` — live feature demos: a motion-guide dot riding
  an SVG path (with a pulsing halo) and staggered cascades, all looping on
  their own timelines.
- `components/SignalStrip.js` — the looping marquee tween.

The hero artwork (`assets/kinetic-hero.png`) is generated imagery shipped
with the example.
