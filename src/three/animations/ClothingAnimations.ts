import gsap from "gsap";
import type { Object3D } from "three";
import {
  BROWSE_CAM_Y,
  BROWSE_LOOK_Y,
  FRONT_SCALE,
  FRONT_Y,
  FRONT_Z,
  ZOOM_MAX,
  ZOOM_MIN,
} from "../constants";
import { indexToRailX, type SceneState } from "../controls/sceneState";

/** Cross-fade value read by every garment part each frame. */
export interface FadeRef {
  v: number;
}

export interface CameraRigState {
  cy: number;
  ly: number;
  lz: number;
  dist: number;
  ix: number;
  iy: number;
}

const EASE = "power3.inOut";

export function liftToFront(obj: Object3D, fade: FadeRef) {
  gsap.to(obj.position, { y: FRONT_Y, z: FRONT_Z, duration: 0.95, ease: EASE, overwrite: "auto" });
  gsap.to(obj.scale, { x: FRONT_SCALE, y: FRONT_SCALE, z: FRONT_SCALE, duration: 0.95, ease: EASE, overwrite: "auto" });
  gsap.to(fade, { v: 1, duration: 0.3, overwrite: "auto" });
}

export function returnToRail(obj: Object3D, fade: FadeRef) {
  gsap.to(obj.position, { y: 0, z: 0, duration: 0.8, ease: EASE, overwrite: "auto" });
  gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: EASE, overwrite: "auto" });
  gsap.to(fade, { v: 1, duration: 0.6, delay: 0.1, overwrite: "auto" });
}

/** Isolate the selected garment: everything else steps back and fades out. */
export function pushBack(obj: Object3D, fade: FadeRef) {
  gsap.to(obj.position, { y: 0, z: -0.5, duration: 0.7, ease: EASE, overwrite: "auto" });
  gsap.to(obj.scale, { x: 0.92, y: 0.92, z: 0.92, duration: 0.7, ease: EASE, overwrite: "auto" });
  gsap.to(fade, { v: 0, duration: 0.5, overwrite: "auto" });
}

export function tweenCameraRig(rig: CameraRigState, target: CameraRigState, instant: boolean) {
  gsap.killTweensOf(rig);
  if (instant) Object.assign(rig, target);
  else gsap.to(rig, { ...target, duration: 1, ease: EASE });
}

export function browseRigTarget(dist: number, ix = 0, iy = 0): CameraRigState {
  return { cy: BROWSE_CAM_Y, ly: BROWSE_LOOK_Y, lz: 0, dist, ix, iy };
}

/** Center the rail on a garment, then hand control back to physics when asked. */
export function scrollRailTo(state: SceneState, index: number, lock: boolean) {
  gsap.killTweensOf(state, "railX");
  state.railV = 0;
  state.railLocked = lock;
  gsap.to(state, {
    railX: indexToRailX(state, index),
    duration: 0.7,
    ease: "power3.out",
    onComplete: () => {
      if (!lock) state.railLocked = false;
    },
    onInterrupt: () => {
      if (!lock) state.railLocked = false;
    },
  });
}

/** Turn the inspected garment to the nearest equivalent of `angle` (front=0, side=PI/2, back=PI). */
export function turnTo(state: SceneState, angle: number) {
  const full = Math.PI * 2;
  const target = Math.round((state.yaw - angle) / full) * full + angle;
  state.autoRotate = false;
  state.yawV = 0;
  gsap.killTweensOf(state, "yaw,pitch");
  gsap.to(state, { yaw: target, pitch: 0, duration: 0.8, ease: "power3.inOut" });
}

export function zoomBy(state: SceneState, factor: number) {
  const target = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, state.zoom * factor));
  gsap.killTweensOf(state, "zoom");
  gsap.to(state, { zoom: target, duration: 0.35, ease: "power2.out" });
}

export function resetInspect(state: SceneState) {
  gsap.killTweensOf(state, "yaw,pitch,zoom");
  state.yaw = 0;
  state.pitch = 0;
  state.yawV = 0;
  state.zoom = 1;
  state.autoRotate = false;
}
