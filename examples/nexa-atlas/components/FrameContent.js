import { h } from "/dist/nexa.js";
import {
  CoverFrame, TerritoryFrame, RulesFrame, CodeFrame, StatsFrame, OverviewFrame, CtaFrame,
} from "./CoreFrames.js";
import { DiagramFrame } from "./DiagramFrame.js";
import { HookCloudFrame } from "./HookCloudFrame.js";
import { LiveDemoFrame } from "./LiveDemoFrame.js";
import { TokensFrame } from "./TokensFrame.js";
import { AddonsFrame } from "./AddonsFrame.js";
import { FileTreeFrame } from "./FileTreeFrame.js";

const KIND_COMPONENTS = {
  cover: CoverFrame,
  territory: TerritoryFrame,
  diagram: DiagramFrame,
  rules: RulesFrame,
  hooks: HookCloudFrame,
  live: LiveDemoFrame,
  tokens: TokensFrame,
  addons: AddonsFrame,
  filetree: FileTreeFrame,
  code: CodeFrame,
  stats: StatsFrame,
  overview: OverviewFrame,
  cta: CtaFrame,
};

export function FrameContent({ data }) {
  const Kind = KIND_COMPONENTS[data.kind];
  return Kind ? h(Kind, { data }) : null;
}
