"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { MathUtils } from "three";
import { ZOOM_MAX, ZOOM_MIN } from "../constants";
import type { SceneState } from "./sceneState";

interface Props {
  state: SceneState;
  enabled: boolean;
  /** Closet allows limited vertical tilt; the embedded product viewer only rotates. */
  allowPitch: boolean;
}

/**
 * 360° rotation (drag), pinch / wheel zoom and optional auto-rotate for the
 * isolated garment. Pitch is clamped so the garment can't be flipped over.
 */
export function InspectControls({ state, enabled, allowPitch }: Props) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    el.style.touchAction = allowPitch ? "none" : "pan-y";
    el.style.cursor = "grab";

    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    let lastT = 0;
    const dist = () => {
      const [a, b] = [...pts.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      gsap.killTweensOf(state, "yaw,pitch");
      state.autoRotate = false;
      if (pts.size === 1) {
        state.inspectDragging = true;
        state.yawV = 0;
        lastT = performance.now();
        el.style.cursor = "grabbing";
      } else if (pts.size === 2) {
        pinch = dist();
      }
    };

    const onMove = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pts.size === 1) {
        const now = performance.now();
        const dt = Math.max(1, now - lastT) / 1000;
        lastT = now;
        const d = dx * 0.011;
        state.yaw += d;
        state.yawV = MathUtils.clamp(state.yawV * 0.6 + (d / dt) * 0.4, -12, 12);
        if (allowPitch) state.pitch = MathUtils.clamp(state.pitch + dy * 0.005, -0.32, 0.32);
      } else if (pts.size === 2) {
        const d = dist();
        if (pinch > 0) {
          gsap.killTweensOf(state, "zoom");
          state.zoom = MathUtils.clamp((state.zoom * d) / pinch, ZOOM_MIN, ZOOM_MAX);
        }
        pinch = d;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!pts.delete(e.pointerId)) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (pts.size < 2) pinch = 0;
      if (pts.size === 0) {
        state.inspectDragging = false;
        if (performance.now() - lastT > 90) state.yawV = 0;
        el.style.cursor = "grab";
      }
    };

    const onWheel = (e: WheelEvent) => {
      // In the embedded viewer let the page scroll unless ctrl/pinch-zoom is used.
      if (!allowPitch && !e.ctrlKey) return;
      e.preventDefault();
      gsap.killTweensOf(state, "zoom");
      state.zoom = MathUtils.clamp(state.zoom * Math.exp(-e.deltaY * 0.0014), ZOOM_MIN, ZOOM_MAX);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      state.inspectDragging = false;
    };
  }, [enabled, allowPitch, gl, state]);

  useFrame((_, rawDt) => {
    if (!enabled || state.inspectDragging) return;
    const dt = Math.min(rawDt, 0.05);
    if (Math.abs(state.yawV) > 0.001) {
      state.yaw += state.yawV * dt;
      state.yawV *= Math.exp(-3 * dt);
    }
    if (state.autoRotate) state.yaw += 0.7 * dt;
    if (!gsap.isTweening(state)) state.pitch += (0 - state.pitch) * (1 - Math.exp(-1.2 * dt));
  });

  return null;
}
