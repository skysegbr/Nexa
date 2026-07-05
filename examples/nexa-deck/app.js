import { h, render, useRef, useState } from "/dist/nexa.js";
import { Badge, Button, IconButton } from "/dist/nexa-components.js";
import { ZoomStage } from "/dist/nexa-zoom.js";
import { FRAMES } from "./data.js";

function SplitList({ title, items }) {
  return h(
    "section",
    { className: "nx-split-list" },
    h("h3", null, title),
    h(
      "ul",
      null,
      items.map((item) => h("li", { key: item }, item)),
    ),
  );
}

function TitleFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-title" },
    h("img", { className: "nx-logo", src: "/assets/nexa-logo-transparent.png", alt: "Nexa" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h1", null, data.heading),
    h("p", null, data.body),
    h("div", { className: "nx-title-meta" }, data.meta.map((item) => h("span", { key: item }, item))),
  );
}

function PointFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-point" },
    h("i", { className: `${data.icon} nx-icon`, ariaHidden: "true" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", null, data.body),
    data.items && h(
      "ul",
      { className: "nx-list" },
      data.items.map((item) => h("li", { key: item }, item)),
    ),
  );
}

function RuleFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-rules" },
    h("i", { className: `${data.icon} nx-icon`, ariaHidden: "true" }),
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("div", { className: "nx-rule-grid" },
      data.rules.map((rule) =>
        h("section", { key: rule.title, className: `nx-rule nx-rule-${rule.tone}` },
          h("strong", null, rule.title),
          h("p", null, rule.body),
        ),
      ),
    ),
  );
}

function CodeFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-code" },
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("p", null, data.body),
    h("pre", null, h("code", null, data.code)),
  );
}

function OverviewFrame({ data }) {
  return h(
    "article",
    { className: "nx-frame nx-frame-overview" },
    h(Badge, { className: "nx-badge" }, data.eyebrow),
    h("h2", null, data.heading),
    h("div", { className: "nx-overview-grid" },
      data.columns.map((column) => h(SplitList, { key: column.title, ...column })),
    ),
  );
}

const FRAME_COMPONENTS = {
  title: TitleFrame,
  point: PointFrame,
  rules: RuleFrame,
  code: CodeFrame,
  overview: OverviewFrame,
};

function FrameContent({ data }) {
  const Component = FRAME_COMPONENTS[data.kind];
  return Component ? h(Component, { data }) : null;
}

function PresentationToolbar({ index, total, controllerRef }) {
  const nav = controllerRef.current;

  return h(
    "footer",
    { className: "nx-toolbar" },
    h(IconButton, {
      label: "Previous frame",
      variant: "tonal",
      disabled: index === 0,
      onClick: () => nav?.prev(),
    }, h("i", { className: "bi-chevron-left", ariaHidden: "true" })),
    h(
      "nav",
      { className: "nx-dots", ariaLabel: "Presentation frames" },
      Array.from({ length: total }, (_, i) =>
        h("button", {
          key: i,
          type: "button",
          className: `nx-dot${i === index ? " nx-dot-active" : ""}`,
          ariaLabel: `Go to frame ${i + 1}`,
          title: `Frame ${i + 1}`,
          onClick: () => nav?.goTo(i),
        }),
      ),
    ),
    h("span", { className: "nx-counter" }, `${index + 1}/${total}`),
    h(Button, {
      variant: "contained",
      disabled: index === total - 1,
      onClick: () => nav?.next(),
    }, "Next", h("i", { className: "bi-arrow-right-short", ariaHidden: "true" })),
  );
}

function App() {
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);
  const frames = FRAMES.map((frame) => ({
    ...frame,
    content: h(FrameContent, { data: frame.data }),
  }));

  return h(
    "main",
    { className: "nx-app" },
    h(ZoomStage, {
      frames,
      index,
      onIndexChange: setIndex,
      controllerRef,
      className: "nx-stage",
      duration: 850,
    }),
    h(PresentationToolbar, { index, total: frames.length, controllerRef }),
  );
}

render(App, document.getElementById("app"));
