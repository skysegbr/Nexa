/*!
 * Nexa — TypeScript declarations for the Motion add-on.
 * This app's frontend uses the Nexa framework (NOT React):
 * https://github.com/skysegbr/Nexa — full AI reference:
 * https://raw.githubusercontent.com/skysegbr/Nexa/main/docs/AI_SPEC.md
 */

/**
 * Type declarations for /dist/nexa-motion.js — Flash-style timeline
 * animation: keyframe tracks tweening transform/opacity/colors, Penner
 * easings, labels, frame scripts and the classic quartet
 * play/stop/gotoAndPlay/gotoAndStop. Elements join a timeline through
 * `tl.track(name)` callback refs.
 */

/** The classic Penner set shipped in `easings`. */
export type EasingName =
  | "linear"
  | "inQuad"
  | "outQuad"
  | "inOutQuad"
  | "inCubic"
  | "outCubic"
  | "inOutCubic"
  | "inBack"
  | "outBack"
  | "inOutBack"
  | "outElastic"
  | "outBounce";

/**
 * One keyframe of a track. A property absent from a keyframe simply isn't
 * a key for it — the property tweens between the keyframes that DO define
 * it. `ease` names how the playhead ARRIVES at this keyframe.
 */
export interface MotionKeyframe {
  /** Keyframe time in milliseconds. */
  at: number;
  /** Translation in px (rendered as translate3d). */
  x?: number;
  y?: number;
  /** Uniform scale factor; scaleX/scaleY override per axis. */
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  /** Degrees. */
  rotate?: number;
  skewX?: number;
  skewY?: number;
  opacity?: number;
  /** Color tweens, per RGBA channel — hex (#rgb/#rrggbb/#rrggbbaa) or rgb()/rgba(). */
  color?: string;
  backgroundColor?: string;
  fill?: string;
  stroke?: string;
  /**
   * Flash's motion guide: an SVG path string ("M 0 0 C …") the element
   * follows from the PREVIOUS keyframe to this one; the path's endpoints
   * become x/y keyframes for continuity.
   */
  path?: string;
  /** Rotate along the guide's tangent — Flash's "orient to path". */
  orient?: boolean;
  /**
   * Frame-by-frame animation: styles applied DISCRETELY at this keyframe
   * and held until the next `set` (no tween) — e.g. sprite sheets.
   */
  set?: Record<string, string | number>;
  /** Easing for the tween arriving at this keyframe. */
  ease?: EasingName | (string & {});
}

export interface TimelineSpec {
  /** Milliseconds; inferred from the last keyframe/script when omitted. */
  duration?: number;
  /** false (default) | true (forever) | n (extra passes). */
  loop?: boolean | number;
  /** Playback rate, default 1 (use reverse() for backwards). */
  speed?: number;
  /** Default easing name for tweens without their own (linear). */
  ease?: EasingName | (string & {});
  /** useTimeline only: autoplay after mount (default true). createTimeline: start immediately. */
  autoplay?: boolean;
  /** Named times for gotoAndPlay/gotoAndStop/seek. */
  labels?: Record<string, number>;
  /** trackName → keyframes. Bind elements with `tl.track(trackName)`. */
  tracks?: Record<string, MotionKeyframe[]>;
  /**
   * Frame scripts, keyed by ms or label name — fired when the playhead
   * CROSSES the frame while playing (direction-aware); gotoAndPlay fires
   * the script sitting exactly on the target, as Flash did.
   */
  onFrame?: Record<string, () => void>;
  /** After each applied frame. */
  onUpdate?: (timeMs: number) => void;
  /** At each loop wrap. */
  onLoop?: () => void;
  /** When the playhead finishes with no loops left. */
  onComplete?: () => void;
}

/** Stable callback ref binding an element to a named track. */
export type TrackRef = (node: Element | null) => void;

export interface TimelineController {
  readonly time: number;
  readonly duration: number;
  readonly isPlaying: boolean;
  readonly direction: number;
  /** Resolve a label (or number) to milliseconds; throws on unknown labels. */
  label(name: string | number): number;
  play(): void;
  stop(): void;
  gotoAndPlay(target: number | string): void;
  gotoAndStop(target: number | string): void;
  seek(target: number | string): void;
  reverse(): void;
  setSpeed(speed: number): void;
  /** Ref for h(): `h("div", { ref: tl.track("logo") })`. */
  track(name: string): TrackRef;
  destroy(): void;
}

/** Robert Penner's classic easing functions, t ∈ [0, 1]. */
export declare const easings: Record<EasingName, (t: number) => number>;

/**
 * Shifts every keyframe of a track by `index * eachMs` — the classic
 * cascade where each list item enters a beat after the previous one.
 */
export declare function stagger(
  keyframes: MotionKeyframe[],
  eachMs: number,
  index: number,
): MotionKeyframe[];

/**
 * Imperative, framework-free constructor. You own the lifecycle — call
 * `destroy()` yourself.
 */
export declare function createTimeline(spec?: TimelineSpec): TimelineController;

/**
 * Component-lifecycle wrapper: creates the timeline on first render (the
 * spec is captured then — treat it as static), autoplays after mount
 * unless `autoplay: false`, and destroys on unmount.
 */
export declare function useTimeline(spec?: TimelineSpec): TimelineController;
