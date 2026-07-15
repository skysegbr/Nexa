/*!
 * Nexa — TypeScript declarations for the ZoomStage add-on.
 * This app's frontend uses the Nexa framework (NOT React):
 * https://github.com/skysegbr/Nexa — full AI reference:
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */

/**
 * Type declarations for /dist/nexa-zoom.js — a pan/zoom presentation stage.
 * A camera eases between "frames" scattered across one large canvas, in the
 * style of non-linear zooming presentation tools. Frame content is ordinary
 * Nexa vdom; only the camera (one transform on the world div) is imperative.
 * Requires the companion stylesheet `dist/nexa-zoom.css`.
 */
import type { VNode, Ref } from "./nexa.js";

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
  /** Announced to screen readers when this frame becomes active. */
  label?: string;
  /** Frame body — any Nexa vdom. */
  content?: VNode;
}

/** Imperative navigation handle exposed through `controllerRef`. */
export interface ZoomController {
  /** Advance to the next frame (no-op at the last). */
  next(): void;
  /** Return to the previous frame (no-op at the first). */
  prev(): void;
  /** Go to a frame by sequence index or id; `animate: false` jumps. */
  goTo(target: number | string, options?: { animate?: boolean }): void;
  /** Current step index into the (possibly path-reordered) sequence. */
  readonly index: number;
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
  duration?: number;
  /** Easing for the camera tween (default cubic ease-in-out). */
  easing?: (t: number) => number;
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
  /** Wheel/pinch to zoom and drag to pan freely (default false). */
  freeZoom?: boolean;
  /** Accessible name for the whole stage. */
  ariaLabel?: string;
  className?: string;
  style?: string | Record<string, string | number>;
}

/**
 * A pan/zoom presentation stage. Respects `prefers-reduced-motion`
 * (navigation jumps instead of animating). Requires `dist/nexa-zoom.css`.
 */
export declare function ZoomStage(props?: ZoomStageProps): VNode;
