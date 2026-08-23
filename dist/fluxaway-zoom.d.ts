/*!
 * FluxaWay — TypeScript declarations for the ZoomStage add-on.
 * This app's frontend uses the FluxaWay framework (NOT React):
 * https://github.com/skysegbr/FluxaWay — full AI reference:
 * https://raw.githubusercontent.com/skysegbr/FluxaWay/main/docs/AI_SPEC.md
 */

/**
 * Type declarations for /dist/fluxaway-zoom.js — a pan/zoom presentation stage.
 * A camera eases between "frames" scattered across one large canvas, in the
 * style of non-linear zooming presentation tools. Frame content is ordinary
 * FluxaWay vdom; only the camera (one transform on the world div) is imperative.
 * Requires the companion stylesheet `dist/fluxaway-zoom.css`.
 */
import type { VNode, Ref } from "./fluxaway.js";

export declare const ZOOM_TRANSITIONS: readonly ["glide", "arc", "dolly", "orbit", "focus", "cut"];
export declare const ZOOM_SURFACES: readonly ["card", "none", "glass"];
export declare const ZOOM_SHAPES: readonly ["rect", "circle", "pill"];

export type ZoomTransitionPreset = (typeof ZOOM_TRANSITIONS)[number];
export type ZoomSurface = (typeof ZOOM_SURFACES)[number];
export type ZoomShape = (typeof ZOOM_SHAPES)[number];

export interface ZoomCameraTarget {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  cx?: number;
  cy?: number;
  scale?: number;
  rotate?: number;
  padding?: number;
  anchorX?: number;
  anchorY?: number;
  zoom?: number;
}

export interface ZoomTransition {
  preset?: ZoomTransitionPreset;
  duration?: number | "auto";
  easing?: (t: number) => number;
  curve?: number;
  lift?: number;
  roll?: number;
}

export type ZoomTransitionInput = ZoomTransitionPreset | ZoomTransition;

export interface ZoomFrameState {
  phase: "idle" | "departing" | "arriving" | "settled";
  selected: boolean;
  settled: boolean;
  moving: boolean;
}

export interface ZoomTransitionEvent {
  from: ZoomFrame;
  to: ZoomFrame;
  preset: ZoomTransitionPreset;
  duration: number;
}

/** One frame on the zoom canvas, positioned in world-pixel coordinates. */
export interface ZoomFrame {
  /** Stable identity — also the `path` reference and the vdom key. */
  id: string;
  /** World-space position/size in pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Rotation in degrees (default 0). */
  rotate?: number;
  /** Camera bounds or an explicit cx/cy/scale, independent from the surface. */
  camera?: ZoomCameraTarget;
  /** Camera movement used when this frame is the destination. */
  transition?: ZoomTransitionInput | ((context: { from: ZoomFrame; to: ZoomFrame }) => ZoomTransitionInput);
  /** Visible material; `none` makes the camera target frameless. */
  surface?: ZoomSurface;
  /** Optional visible geometry without changing the rectangular camera target. */
  shape?: ZoomShape;
  clipPath?: string;
  frameClassName?: string;
  frameStyle?: Record<string, string | number>;
  /** Announced to screen readers when this frame becomes active. */
  label?: string;
  /** Frame body — any FluxaWay vdom. */
  content?: VNode;
  /** State-aware content factory, evaluated on flight start and settlement. */
  render?: (state: ZoomFrameState) => VNode;
}

/** Imperative navigation handle exposed through `controllerRef`. */
export interface ZoomController {
  /** Advance to the next frame (no-op at the last). */
  next(): void;
  /** Return to the previous frame (no-op at the first). */
  prev(): void;
  /** Go to a frame by sequence index or id; `animate: false` jumps. */
  goTo(target: number | string, options?: { animate?: boolean; transition?: ZoomTransitionInput }): void;
  /** Ease back to the current frame's fit, undoing any free exploration. */
  reset(): void;
  /** Zoom out to frame every frame at once (a whole-canvas overview). */
  fitAll(): void;
  /** Zoom the camera toward the viewport centre (for toolbar buttons). */
  zoomIn(): void;
  zoomOut(): void;
  /** Decode images inside a mounted frame before navigating to it. */
  prepare(target: number | string): Promise<PromiseSettledResult<void>[]>;
  /** Current step index into the (possibly path-reordered) sequence. */
  readonly index: number;
  /** Frame where the camera has completed its flight. */
  readonly settledIndex: number;
  readonly moving: boolean;
  /** The active navigation sequence (frames in `path` order). */
  readonly frames: ZoomFrame[];
}

export interface ZoomStageProps {
  frames?: ZoomFrame[];
  /** Navigation order by frame id; defaults to the `frames` order. */
  path?: string[];
  /** Controlled current step. */
  index?: number;
  /** Uncontrolled initial step (default 0). */
  defaultIndex?: number;
  /** Fired with the new step index on every navigation. */
  onIndexChange?: (index: number) => void;
  /** Milliseconds per camera animation (default 900). */
  duration?: number | "auto";
  /** Easing for the camera tween (default cubic ease-in-out). */
  easing?: (t: number) => number;
  /** Stage default; a function can choose a transition for each route. */
  transition?: ZoomTransitionInput | ((context: { from: ZoomFrame; to: ZoomFrame }) => ZoomTransitionInput);
  /** Viewport margin fraction 0–0.45 around each frame (default 0.06). */
  padding?: number;
  /** Set to the imperative controller on every render. */
  controllerRef?: Ref<ZoomController | null>;
  /** Arrow/Space step, Home/End first/last (default true). */
  keyboardNav?: boolean;
  /** Tap the stage background to advance (default true). */
  advanceOnClick?: boolean;
  /** Horizontal swipe steps on touch/pen (default true; off while `freeZoom`). */
  swipeNav?: boolean;
  /** Wheel/pinch to zoom and drag to pan freely, with flick momentum
   * (default false). Double-click zooms toward the point when `advanceOnClick`
   * is off; with `keyboardNav`, +/- zoom and 0/Esc recenter the frame. */
  freeZoom?: boolean;
  /** `freeZoom` scale bounds as multiples of the frame fit (defaults 0.2 / 12). */
  minZoom?: number;
  maxZoom?: number;
  /** Auto-advance through the frames; a number sets the interval ms
   * (default 4000), looping back to the first frame. */
  autoplay?: boolean | number;
  /** Sync the current frame id to `location.hash` (deep-linking; default false). */
  hashNav?: boolean;
  /** Fired when the user first grabs the camera (wheel/pinch/drag) — e.g. to
   * pause an autoplay tour. */
  onInteract?: () => void;
  onTransitionStart?: (event: ZoomTransitionEvent) => void;
  onTransitionEnd?: (event: ZoomTransitionEvent) => void;
  onSettledIndexChange?: (index: number) => void;
  /** Images prepared around the active frame (default `adjacent`). */
  preload?: false | "adjacent" | "all";
  /** Accessible name for the whole stage. */
  ariaLabel?: string;
  className?: string;
  style?: string | Record<string, string | number>;
}

/**
 * A pan/zoom presentation stage. Respects `prefers-reduced-motion`
 * (navigation jumps instead of animating). Requires `dist/fluxaway-zoom.css`.
 */
export declare function ZoomStage(props?: ZoomStageProps): VNode;
