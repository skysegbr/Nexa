import { h } from "/dist/nexa.js";
import { Badge } from "/dist/nexa-components-core.js";

// The two "how it actually works" frames — h()/render() and the context
// strait. Both are diagram-shaped (steps or a wrong/right split) rather
// than plain prose, so they share a file and a variant switch.

function ApiDiagram({ data }) {
  return h(
    "div",
    { className: "atl-diagram atl-diagram-api" },
    h("p", { className: "atl-body" }, data.intro),
    h(
      "ol",
      { className: "atl-steps" },
      data.steps.map((step, i) =>
        h(
          "li",
          { key: step.code, className: "atl-step" },
          h("span", { className: "atl-step-index" }, i + 1),
          h("div", null,
            h("code", null, step.code),
            h("p", null, step.note),
          ),
        ),
      ),
    ),
    h("p", { className: "atl-warning" }, h("i", { className: "bi-exclamation-diamond", ariaHidden: "true" }), data.warning),
  );
}

function ContextDiagram({ data }) {
  return h(
    "div",
    { className: "atl-diagram atl-diagram-context" },
    h("p", { className: "atl-body" }, data.intro),
    h(
      "div",
      { className: "atl-strait" },
      h(
        "section",
        { className: "atl-route atl-route-wrong" },
        h("strong", null, h("i", { className: "bi-x-octagon", ariaHidden: "true" }), " ", data.wrongLabel),
        h("pre", null, h("code", null, data.wrongCode)),
      ),
      h("i", { className: "bi-arrow-right-short atl-strait-arrow", ariaHidden: "true" }),
      h(
        "section",
        { className: "atl-route atl-route-right" },
        h("strong", null, h("i", { className: "bi-check2-circle", ariaHidden: "true" }), " ", data.rightLabel),
        h("pre", null, h("code", null, data.rightCode)),
      ),
    ),
  );
}

const VARIANTS = { api: ApiDiagram, context: ContextDiagram };

export function DiagramFrame({ data }) {
  const Variant = VARIANTS[data.variant];
  return h(
    "article",
    { className: `atl-frame atl-frame-diagram atl-frame-diagram-${data.variant}` },
    h("i", { className: `${data.icon} atl-icon`, ariaHidden: "true" }),
    h(Badge, { className: "atl-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    Variant ? h(Variant, { data }) : null,
  );
}
