"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { MathUtils, type PerspectiveCamera } from "three";
import { indexToRailX, nearestIndex, railBounds, type SceneState } from "./sceneState";

/**
 * Pointer-based horizontal drag with momentum, snap-to-garment settling and a
 * soft spring bounce at the ends of the rail.
 * Vertical touch panning is left to the browser (`touch-action: pan-y`) so the
 * page can still scroll.
 */
export function DragControls({ state, enabled }: { state: SceneState; enabled: boolean }) {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);

  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";

    let pointerId: number | null = null;
    let lastX = 0;
    let lastT = 0;

    const worldPerPx = () => {
      const { camera, size } = get();
      const cam = camera as PerspectiveCamera;
      const dist = Math.abs(cam.position.z);
      return (2 * dist * Math.tan(MathUtils.degToRad(cam.fov) / 2)) / size.height;
    };

    const onDown = (e: PointerEvent) => {
      if (pointerId !== null) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastT = performance.now();
      state.railDragging = true;
      state.railLocked = false; // the user takes over from any scripted scroll
      state.railV = 0;
      gsap.killTweensOf(state, "railX");
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      el.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      let dx = (e.clientX - lastX) * worldPerPx();
      lastX = e.clientX;
      lastT = now;

      const { min, max } = railBounds(state);
      const pastEnd = (state.railX > max && dx > 0) || (state.railX < min && dx < 0);
      if (pastEnd) dx *= 0.35; // rubber-band resistance
      state.railX += dx;
      state.railV = state.railV * 0.6 + (dx / dt) * 0.4;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      state.railDragging = false;
      if (performance.now() - lastT > 90) state.railV = 0; // finger rested before release
      state.railV = MathUtils.clamp(state.railV, -14, 14);
      el.style.cursor = "grab";
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      state.railDragging = false;
    };
  }, [enabled, gl, get, state]);

  useFrame((_, rawDt) => {
    if (!enabled || state.railDragging || state.railLocked) return;
    const dt = Math.min(rawDt, 0.05);
    const { min, max } = railBounds(state);

    if (state.railX > max || state.railX < min) {
      // Soft bounce: underdamped spring toward the nearest end.
      const edge = MathUtils.clamp(state.railX, min, max);
      state.railV += (edge - state.railX) * 90 * dt;
      state.railV *= Math.exp(-7 * dt);
    } else {
      state.railV *= Math.exp(-2.6 * dt); // inertia
      // Once slow, ease toward the nearest garment so the rail settles neatly.
      if (Math.abs(state.railV) < 1.1) {
        const snap = indexToRailX(state, nearestIndex(state));
        state.railX += (snap - state.railX) * (1 - Math.exp(-7 * dt));
        state.railV *= Math.exp(-6 * dt);
      }
    }
    state.railX += state.railV * dt;
    if (Math.abs(state.railV) < 0.0005) state.railV = 0;
  });

  return null;
}
