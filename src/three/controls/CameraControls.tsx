"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import {
  browseRigTarget,
  tweenCameraRig,
  type CameraRigState,
} from "../animations/ClothingAnimations";
import {
  BROWSE_CAM_Y,
  BROWSE_LOOK_Y,
  CAMERA_FOV,
  FRONT_SCALE,
  FRONT_Z,
  INSPECT_LOOK_Y,
  fitDistance,
} from "../constants";
import type { SceneState } from "./sceneState";

interface Props {
  state: SceneState;
  inspecting: boolean;
  parallax: boolean;
  /** Pixels of the viewport covered by UI panels (garment is re-centered in the rest). */
  insetRight: number;
  insetBottom: number;
}

/**
 * Perspective camera rig: smooth GSAP transitions between browsing and
 * inspection, damped zoom, responsive distance and a subtle pointer parallax.
 */
export function CameraRig({ state, inspecting, parallax, insetRight, insetBottom }: Props) {
  const size = useThree((s) => s.size);
  const rig = useMemo<CameraRigState>(
    () => ({ cy: BROWSE_CAM_Y, ly: BROWSE_LOOK_Y, lz: 0, dist: 7, ix: 0, iy: 0 }),
    [],
  );
  const zoomSmooth = useRef(1);
  const px = useRef(0);
  const first = useRef(true);
  const appliedView = useRef({ ix: NaN, iy: NaN, w: 0, h: 0 });

  useEffect(() => {
    const aspect = size.width / size.height;
    const availW = Math.max(120, size.width - insetRight);
    const availH = Math.max(120, size.height - insetBottom);
    // Responsive framing: keep a minimum amount of the scene visible on narrow screens.
    const browseDist = fitDistance(aspect, 3.0, 3.6);
    // The garment must fit in the part of the frustum not covered by UI panels.
    const t = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360);
    const visibleH = Math.max(
      (1.75 * FRONT_SCALE * size.height) / availH,
      (1.6 * FRONT_SCALE * size.height) / availW,
    );
    const inspectDist = visibleH / t;
    const target: CameraRigState = inspecting
      ? {
          cy: INSPECT_LOOK_Y + 0.12,
          ly: INSPECT_LOOK_Y,
          lz: FRONT_Z,
          dist: inspectDist,
          ix: insetRight / 2,
          iy: insetBottom / 2,
        }
      : browseRigTarget(browseDist);
    tweenCameraRig(rig, target, first.current);
    first.current = false;
  }, [inspecting, size.width, size.height, insetRight, insetBottom, rig]);

  useFrame((frame, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const cam = frame.camera as PerspectiveCamera;

    zoomSmooth.current += (state.zoom - zoomSmooth.current) * (1 - Math.exp(-10 * dt));
    const wantParallax = parallax && !inspecting && !state.railDragging ? frame.pointer.x * 0.22 : 0;
    px.current += (wantParallax - px.current) * (1 - Math.exp(-3 * dt));

    cam.position.set(px.current, rig.cy, rig.lz + rig.dist / zoomSmooth.current);
    cam.lookAt(px.current * 0.4, rig.ly, rig.lz);

    // Off-center the projection so the subject sits in the area not covered by UI panels.
    const v = appliedView.current;
    const w = frame.size.width;
    const h = frame.size.height;
    if (v.ix !== rig.ix || v.iy !== rig.iy || v.w !== w || v.h !== h) {
      if (Math.abs(rig.ix) < 0.5 && Math.abs(rig.iy) < 0.5) cam.clearViewOffset();
      else cam.setViewOffset(w, h, rig.ix, rig.iy, w, h);
      cam.updateProjectionMatrix();
      appliedView.current = { ix: rig.ix, iy: rig.iy, w, h };
    }
  });

  return null;
}
