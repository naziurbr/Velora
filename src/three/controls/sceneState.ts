import { ITEM_SPACING } from "../constants";

/**
 * Mutable interaction state shared between the React UI and the render loop.
 * Kept outside React state on purpose: it changes every frame.
 */
export interface SceneState {
  railX: number;
  railV: number;
  railDragging: boolean;
  /** True while a tween owns railX (e.g. centering a selected garment). */
  railLocked: boolean;
  yaw: number;
  pitch: number;
  yawV: number;
  zoom: number;
  inspectDragging: boolean;
  autoRotate: boolean;
  count: number;
  spacing: number;
}

export function createSceneState(): SceneState {
  return {
    railX: 0,
    railV: 0,
    railDragging: false,
    railLocked: false,
    yaw: 0,
    pitch: 0,
    yawV: 0,
    zoom: 1,
    inspectDragging: false,
    autoRotate: false,
    count: 0,
    spacing: ITEM_SPACING,
  };
}

export function updateSceneAutoRotate(state: SceneState, enabled: boolean) {
  state.autoRotate = enabled;
}

export function railBounds(s: SceneState) {
  return { min: -Math.max(0, s.count - 1) * s.spacing, max: 0 };
}

export function indexToRailX(s: SceneState, index: number) {
  return -index * s.spacing;
}

export function nearestIndex(s: SceneState) {
  const i = Math.round(-s.railX / s.spacing);
  return Math.min(Math.max(i, 0), Math.max(0, s.count - 1));
}
