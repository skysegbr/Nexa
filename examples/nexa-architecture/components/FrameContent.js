import { h } from "/dist/nexa.js";
import { CoverFrame } from "./CoverFrame.js";
import { LensFrame } from "./LensFrame.js";
import { MapFrame } from "./MapFrame.js";
import { DecisionFrame } from "./DecisionFrame.js";
import { AdoptionFrame } from "./AdoptionFrame.js";
import { CodeFrame } from "./CodeFrame.js";
import { OverviewFrame } from "./OverviewFrame.js";

const FRAME_COMPONENTS = {
  cover: CoverFrame,
  lens: LensFrame,
  map: MapFrame,
  decision: DecisionFrame,
  adoption: AdoptionFrame,
  code: CodeFrame,
  overview: OverviewFrame,
};

export function FrameContent({ data }) {
  const Component = FRAME_COMPONENTS[data.kind];
  return Component ? h(Component, { data }) : null;
}
