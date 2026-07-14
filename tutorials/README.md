# Tutorials

Video tutorials generated from the framework itself: each folder contains a
tutorial "player" page (a real Nexa app: code pane + live demo + captions), a
`record.py` that drives the page with real typing/clicks and captures the
Playwright screen recording, and the resulting `.webm`.

Regenerating a video after the framework or the script changes is one command
(same Python-only dependency as the test suite — no Node):

```bash
python3 tutorials/useform/record.py
```

To preview a tutorial page interactively, serve the repo root
(`python server.py`) and open `/tutorials/<name>/index.html` — advance the
steps from the console with `__setStep(n)`.

| Tutorial | Video | Covers |
|---|---|---|
| [basic](./basic/) | `basic-tutorial.webm` (~40 s) | Your first Nexa app (`examples/basic` live in an iframe): the no-build entry point, components as plain functions, `useState` + props, `useTheme`/`ThemeToggle` |
| [useform](./useform/) | `useform-tutorial.webm` (46 s) | `useForm`: initialValues, `field()`, validation with `validateOnBlur`, `dirty`/`touched`, `handleSubmit` blocking invalid submits |
| [nexa-architecture](./nexa-architecture/) | `nexa-architecture-tutorial.webm` (~44 s) | ZoomStage (`examples/nexa-architecture` live in an iframe): frames as data on one world canvas, controlled index, `controllerRef` navigation with the camera gliding on camera, clickable frames |
| [ssr](./ssr/) | `ssr-tutorial.webm` (~45 s) | SSR (`examples/ssr` live in an iframe): `renderToString` producing the raw HTML string (shown on camera), `useHead` + `renderHeadToString` emitting the `<title>`/`<meta>` head markup (shown on camera), one component on both sides, `hydrate` adopting the server DOM with the node-reuse proof, and the hydrated buttons clicked live |
| [nexa-motion](./nexa-motion/) | `nexa-motion-tutorial.webm` (~40 s) | Flash-style animation (`examples/nexa-motion` live in an iframe): the timeline replayed on camera, easing + `stagger` letter cascade, `gotoAndPlay` scene jumps with frame scripts driving the deck, the nested movie clip still looping after the movie ends — and a finale inside `examples/motion-editor`, playing the doc and dragging a keyframe live |
| [motion-editor](./motion-editor/) | `motion-editor-tutorial.webm` (~33 s) | Create & animate step by step in the Motion Editor (live in an iframe, driven for real): draw a rectangle on an empty stage, scrub to f37 and drag it (auto-key), rotate it at the last frame with Free Transform, play the looping movie, then the Behavior keyframe list and the live `useTimeline()` export |
