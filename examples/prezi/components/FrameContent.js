import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components.js";

function TitleContent({ data }) {
  return h(
    "div",
    { className: "pz-content pz-content-title" },
    h(Badge, null, data.eyebrow),
    h("h1", null, data.heading),
    h("p", { className: "pz-content-body" }, data.body),
    h("p", { className: "pz-content-cta" }, data.cta),
  );
}

function PointContent({ data }) {
  return h(
    "div",
    { className: "pz-content pz-content-point" },
    h("i", { className: `${data.icon} pz-content-icon`, ariaHidden: "true" }),
    h("h2", null, data.heading),
    h("p", { className: "pz-content-body" }, data.body),
  );
}

function CodeContent({ data }) {
  return h(
    "div",
    { className: "pz-content pz-content-code" },
    h("h2", null, data.heading),
    h("pre", null, h("code", null, data.code)),
  );
}

function OverviewContent({ data }) {
  return h(
    "div",
    { className: "pz-content pz-content-overview" },
    h("h2", null, data.heading),
    h(
      "ul",
      null,
      data.bullets.map((b) => h("li", { key: b }, b)),
    ),
  );
}

const KIND_COMPONENTS = {
  title: TitleContent,
  point: PointContent,
  code: CodeContent,
  overview: OverviewContent,
};

export function FrameContent({ data }) {
  const Kind = KIND_COMPONENTS[data.kind];
  return Kind ? h(Kind, { data }) : null;
}
