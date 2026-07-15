import { h } from "/dist/nexa.js";

export function MissionHUD({ scenes, index, auto, onAuto, controllerRef }) {
  const current = scenes[index];
  const nav = controllerRef.current;

  return h(
    "div",
    { className: "sj-hud" },
    h(
      "header",
      { className: "sj-hud-top" },
      h("a", { className: "sj-hud-brand", href: "../space-journey/", ariaLabel: "Beyond — restart journey" }, h("i"), h("span", null, "BEYOND")),
      h("div", { className: "sj-hud-status", ariaLive: "polite" }, h("span", null, "CURRENT VECTOR"), h("strong", null, current.chapter)),
      h("a", { className: "sj-hud-source", href: current.source, target: "_blank", rel: "noreferrer" }, "NASA SOURCE ↗"),
    ),
    h(
      "aside",
      { className: "sj-hud-side", ariaHidden: "true" },
      h("span", null, "NEXA / ZOOM"),
      h("i"),
      h("span", null, "MOTION / LIVE"),
    ),
    h(
      "footer",
      { className: "sj-hud-bottom" },
      h(
        "div",
        { className: "sj-hud-controls" },
        h("button", { type: "button", disabled: index === 0, ariaLabel: "Previous destination", onClick: () => nav?.prev() }, "←"),
        h("button", { type: "button", disabled: index === scenes.length - 1, ariaLabel: "Next destination", onClick: () => nav?.next() }, "→"),
      ),
      h(
        "div",
        { className: "sj-route", role: "group", ariaLabel: "Journey destinations" },
        h("span", { className: "sj-route-line" }, h("i", { style: { width: `${(index / (scenes.length - 1)) * 100}%` } })),
        scenes.map((scene, sceneIndex) =>
          h(
            "button",
            {
              key: scene.id,
              type: "button",
              className: sceneIndex === index ? "sj-route-active" : "",
              ariaLabel: `Go to ${scene.chapter}`,
              ariaPressed: sceneIndex === index ? "true" : "false",
              onClick: () => nav?.goTo(sceneIndex),
            },
            h("i"),
            h("span", null, scene.id === "deep-space" ? "DEEP" : scene.id.toUpperCase()),
          ),
        ),
      ),
      h(
        "button",
        { type: "button", className: `sj-auto${auto ? " sj-auto-live" : ""}`, ariaPressed: auto ? "true" : "false", onClick: onAuto },
        h("i"),
        auto ? "AUTO JOURNEY ON" : "AUTO JOURNEY",
      ),
    ),
  );
}
