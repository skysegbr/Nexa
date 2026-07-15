import { h } from "/dist/nexa.js";

export function TastingHUD({ courses, index, auto, onAuto, controllerRef }) {
  const current = courses[index];
  const nav = controllerRef.current;

  return h("div", { className: "pj-hud" },
    h("header", { className: "pj-hud-top" },
      h("a", { className: "pj-brand", href: "../palate-journey/", ariaLabel: "Palate — restart tasting" }, h("span", null, "P"), h("strong", null, "PALATE"), h("small", null, "TASTING ROOM")),
      h("div", { className: "pj-now", ariaLive: "polite" }, h("small", null, "NOW SERVING"), h("strong", null, current.course)),
      h("div", { className: "pj-time" }, h("small", null, "LOCAL TIME"), h("strong", null, current.time)),
    ),
    h("aside", { className: "pj-side-note", ariaHidden: "true" }, "A TEN-COURSE STORY", h("i"), "NEXA / LIVE"),
    h("footer", { className: "pj-hud-bottom" },
      h("div", { className: "pj-arrows" },
        h("button", { type: "button", ariaLabel: "Previous course", disabled: index === 0, onClick: () => nav?.prev() }, "←"),
        h("button", { type: "button", ariaLabel: "Next course", disabled: index === courses.length - 1, onClick: () => nav?.next() }, "→"),
      ),
      h("div", { className: "pj-menu", role: "group", ariaLabel: "Tasting courses" },
        courses.map((course, courseIndex) => h("button", {
          key: course.id,
          type: "button",
          className: courseIndex === index ? "pj-menu-active" : "",
          ariaLabel: `Go to ${course.course}`,
          ariaPressed: courseIndex === index ? "true" : "false",
          onClick: () => nav?.goTo(courseIndex),
        }, h("i"), h("span", null, course.id.toUpperCase()))),
      ),
      h("button", { type: "button", className: `pj-serve${auto ? " pj-serve-live" : ""}`, ariaPressed: auto ? "true" : "false", onClick: onAuto },
        h("i"), auto ? "SERVICE IN MOTION" : "SERVE FOR ME"),
    ),
  );
}
