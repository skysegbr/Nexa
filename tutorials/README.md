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
| [useform](./useform/) | `useform-tutorial.webm` (46 s) | `useForm`: initialValues, `field()`, validação com `validateOnBlur`, `dirty`/`touched`, `handleSubmit` bloqueando envio inválido |
