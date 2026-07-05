import { h } from "/dist/nexa.js";
import { TitleFrame, PointFrame, RuleFrame, CodeFrame, OverviewFrame } from "./Frames.js";

// Maps data.kind to the matching frame component — data.js stays free of
// h() calls and app.js stays free of per-kind knowledge.
const FRAME_COMPONENTS = {
  title: TitleFrame,
  point: PointFrame,
  rules: RuleFrame,
  code: CodeFrame,
  overview: OverviewFrame,
};

export function FrameContent({ data }) {
  const Component = FRAME_COMPONENTS[data.kind];
  return Component ? h(Component, { data }) : null;
}
