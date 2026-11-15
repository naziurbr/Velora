"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { liftToFront, pushBack, returnToRail, type FadeRef } from "../animations/ClothingAnimations";
import type { SceneState } from "../controls/sceneState";
import type { ClosetGarment } from "../types";
import { GarmentVisual } from "./GarmentVisual";
import { Hanger } from "./Hanger";

interface Props {
  garment: ClosetGarment;
  index: number;
  spacing: number;
  state: SceneState;
  selected: boolean;
  inspecting: boolean;
  shadows: boolean;
  onSelect: (id: string) => void;
}

const TAU = Math.PI * 2;

export function ClothingItem({
  garment,
  index,
  spacing,
  state,
  selected,
  inspecting,
  shadows,
  onSelect,
}: Props) {
  const root = useRef<Group>(null);
  const swingG = useRef<Group>(null);
  const spinG = useRef<Group>(null);
  const gl = useThree((s) => s.gl);
  const fade = useMemo<FadeRef>(() => ({ v: 1 }), []);
  const hover = useRef(false);
  const motion = useRef({ swing: 0, swingV: 0, spin: 0, lift: 0 });

  useLayoutEffect(() => {
    root.current?.position.set(index * spacing, 0, 0);
  }, [index, spacing]);

  // Selection / inspection transitions.
  const first = useRef(true);
  useEffect(() => {
    const obj = root.current;
    if (!obj) return;
    if (first.current) {
      first.current = false;
      if (!inspecting) return;
    }
    if (selected) liftToFront(obj, fade);
    else if (inspecting) pushBack(obj, fade);
    else returnToRail(obj, fade);
  }, [selected, inspecting, fade]);

  useFrame((frame, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = motion.current;
    const g = root.current;
    if (!g || !swingG.current || !spinG.current) return;

    g.visible = fade.v > 0.01;
    if (!g.visible) return;

    // Pendulum swing driven by rail velocity (spring: k=60, c=4.5).
    const idle = Math.sin(frame.clock.elapsedTime * 0.9 + index * 1.7) * 0.012;
    const target = selected ? 0 : Math.max(-0.32, Math.min(0.32, -state.railV * 0.085)) + idle;
    m.swingV += ((target - m.swing) * 60 - m.swingV * 4.5) * dt;
    m.swing += m.swingV * dt;
    swingG.current.rotation.z = m.swing;

    // Inspection rotation follows shared state; released items settle back to front.
    if (selected) {
      m.spin = state.yaw;
      spinG.current.rotation.x += (state.pitch - spinG.current.rotation.x) * (1 - Math.exp(-14 * dt));
    } else {
      const rest = Math.round(m.spin / TAU) * TAU;
      m.spin += (rest - m.spin) * (1 - Math.exp(-8 * dt));
      spinG.current.rotation.x *= Math.exp(-8 * dt);
    }
    spinG.current.rotation.y = m.spin;

    const liftTarget = hover.current && !inspecting ? 0.05 : 0;
    m.lift += (liftTarget - m.lift) * (1 - Math.exp(-10 * dt));
    spinG.current.position.y = m.lift;
  });

  return (
    <group ref={root}>
      <group ref={swingG}>
        <group
          ref={spinG}
          onClick={(e) => {
            // `delta` is the pointer travel in px: ignore drags, only taps select.
            if (e.delta > 6 || inspecting) return;
            e.stopPropagation();
            onSelect(garment.id);
          }}
          onPointerOver={(e) => {
            if (inspecting) return;
            e.stopPropagation();
            hover.current = true;
            gl.domElement.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            hover.current = false;
            gl.domElement.style.cursor = "grab";
          }}
        >
          <Hanger kind={garment.kind} fade={fade} />
          <GarmentVisual
            kind={garment.kind}
            color={garment.color}
            modelUrl={garment.modelUrl}
            fade={fade}
            castShadow={shadows}
          />
        </group>
      </group>
    </group>
  );
}
