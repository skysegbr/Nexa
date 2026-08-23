import { h } from "/dist/fluxaway.js";
import { AssemblyScene } from "./AssemblyScene.js";
import { PressureScene } from "./PressureScene.js";
import { ProtocolScene } from "./ProtocolScene.js";
import { RefractionScene } from "./RefractionScene.js";
import { ThresholdScene } from "./ThresholdScene.js";
import { VesselScene } from "./VesselScene.js";

const SCENES = {
  assembly: AssemblyScene,
  pressure: PressureScene,
  protocol: ProtocolScene,
  refraction: RefractionScene,
  threshold: ThresholdScene,
  vessel: VesselScene,
};

export function SceneContent({ scene, state, selectable = false, onSelect }) {
  const Scene = SCENES[scene.kind] || ThresholdScene;
  const onKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect?.();
  };

  return h(
    "section",
    {
      className: `vp-scene${selectable ? " vp-scene-selectable" : ""}`,
      dataset: { phase: state.phase, scene: scene.kind },
      role: selectable ? "button" : undefined,
      tabIndex: selectable ? 0 : undefined,
      ariaLabel: selectable ? `Open frame: ${scene.title}` : undefined,
      title: selectable ? `Open ${scene.title}` : undefined,
      onClick: selectable ? onSelect : undefined,
      onKeyDown: selectable ? onKeyDown : undefined,
    },
    h(Scene, { scene, active: state.settled, phase: state.phase }),
    h("div", { className: "vp-scene-flight-preview", ariaHidden: "true" },
      h("img", {
        src: scene.image,
        alt: "",
        loading: "eager",
        decoding: "async",
        draggable: false,
      }),
    ),
  );
}
