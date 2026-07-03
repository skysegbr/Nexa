import { h, useState, useTheme } from "/dist/nexa.js";
import { Badge, Button, Progress, Switch, TextField } from "/dist/nexa-components.js";

// The one frame in this deck that isn't a picture of Nexa — it IS Nexa.
// Its useState/useTheme calls are real hooks, owned by this component's own
// position in the tree (see dist/nexa.js renderComponent/componentIdentity),
// so the counter, the toggle and the typed text all survive camera moves —
// ZoomStage keeps every frame mounted, it only animates the viewport.
export function LiveDemoFrame({ data }) {
  const [flags, setFlags] = useState(0);
  const [message, setMessage] = useState("");
  const { theme, toggleTheme } = useTheme();

  return h(
    "article",
    { className: "atl-frame atl-frame-live" },
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", { className: "atl-body" }, data.body),
    h(
      "div",
      { className: "atl-live-grid" },
      h(
        "section",
        { className: "atl-live-card" },
        h("strong", null, "Button + useState"),
        h(Button, {
          variant: "contained",
          // This frame doubles as the stage's "click to advance" target
          // while it's focused — stopPropagation keeps a tap on the demo
          // itself from also skipping to the next territory.
          onClick: (e) => { e.stopPropagation(); setFlags((v) => v + 1); },
        }, "Cravar bandeira"),
        h(Badge, null, `${flags} bandeira${flags === 1 ? "" : "s"} cravada${flags === 1 ? "" : "s"}`),
      ),
      h(
        "section",
        { className: "atl-live-card" },
        h("strong", null, "Switch + useTheme"),
        h(Switch, {
          label: theme === "dark" ? "Tema escuro" : "Tema claro",
          checked: theme === "dark",
          onChange: toggleTheme,
          onClick: (e) => e.stopPropagation(),
        }),
        h("span", { className: "atl-live-note" }, "isso troca o tema de verdade, agora"),
      ),
      h(
        "section",
        { className: "atl-live-card atl-live-card-wide" },
        h("strong", null, "TextField + Progress"),
        h(TextField, {
          label: "Escreva uma legenda pro mapa",
          value: message,
          onInput: (e) => setMessage(e.target.value.slice(0, 60)),
          onClick: (e) => e.stopPropagation(),
          placeholder: "até 60 caracteres...",
        }),
        h(Progress, { value: message.length, max: 60, label: "Caracteres usados" }),
        h("span", { className: "atl-live-note" }, `${message.length} / 60`),
      ),
    ),
  );
}
