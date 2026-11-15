"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { PerformanceMonitor } from "@react-three/drei";
import { resetInspect, scrollRailTo } from "../animations/ClothingAnimations";
import { ClothingRail } from "../components/ClothingRail";
import { disposeHangerGeometry } from "../components/Hanger";
import { Wardrobe } from "../components/Wardrobe";
import { CAMERA_FOV, ITEM_SPACING } from "../constants";
import { CameraRig } from "../controls/CameraControls";
import { DragControls } from "../controls/DragControls";
import { InspectControls } from "../controls/InspectControls";
import type { SceneState } from "../controls/sceneState";
import { disposeModelCache } from "../loaders/ModelLoader";
import type { ClosetGarment } from "../types";

export interface ClosetSceneProps {
  garments: ClosetGarment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Index of the garment currently centered on the rail. */
  onFocusChange?: (index: number) => void;
  sceneState: SceneState;
  /** "rail" = full wardrobe browsing, "viewer" = single garment inspection. */
  variant?: "rail" | "viewer";
  allowPitch?: boolean;
  insetRight?: number;
  insetBottom?: number;
}

function SceneContent({
  garments,
  selectedId,
  onSelect,
  onFocusChange,
  sceneState: state,
  variant = "rail",
  allowPitch = true,
  insetRight = 0,
  insetBottom = 0,
  shadows,
}: ClosetSceneProps & { shadows: boolean }) {
  const inspecting = selectedId !== null;
  const idsKey = garments.map((g) => g.id).join("|");

  // Keep the shared state in sync with the garment list; restart the rail on list change.
  useEffect(() => {
    state.count = garments.length;
    state.spacing = ITEM_SPACING;
    state.railX = 0;
    state.railV = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, state]);

  // Selecting centers the rail on the garment and resets the inspection view.
  const selectedIndex = selectedId ? garments.findIndex((g) => g.id === selectedId) : -1;
  useEffect(() => {
    resetInspect(state);
    if (selectedId && selectedIndex >= 0) {
      scrollRailTo(state, selectedIndex, true);
    } else {
      state.railLocked = false;
      state.railV = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, state]);

  // Release shared GPU resources and stop tweens when the scene unmounts.
  useEffect(
    () => () => {
      gsap.killTweensOf(state);
      disposeModelCache();
      disposeHangerGeometry();
    },
    [state],
  );

  const wallLength = Math.max(70, garments.length * ITEM_SPACING * 2 + 40);

  return (
    <>
      <color attach="background" args={["#e9e2d5"]} />
      <Wardrobe shadows={shadows} length={wallLength} />
      <ClothingRail
        garments={garments}
        state={state}
        selectedId={selectedId}
        spacing={ITEM_SPACING}
        shadows={shadows}
        onSelect={onSelect}
        onFocusChange={onFocusChange}
      />
      <CameraRig
        state={state}
        inspecting={inspecting}
        parallax={variant === "rail"}
        insetRight={insetRight}
        insetBottom={insetBottom}
      />
      <DragControls state={state} enabled={variant === "rail" && !inspecting} />
      <InspectControls state={state} enabled={inspecting} allowPitch={allowPitch} />
    </>
  );
}

export default function ClosetScene(props: ClosetSceneProps) {
  const [lowPower, setLowPower] = useState(false);
  // Real-time shadows only on fine-pointer (desktop-class) devices.
  const shadows = useMemo(
    () => typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  return (
    <Canvas
      shadows={shadows ? "percentage" : false}
      dpr={lowPower ? 1 : [1, 1.75]}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 80, position: [0, 1.35, 7] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor onDecline={() => setLowPower(true)} />
      <SceneContent {...props} shadows={shadows} />
    </Canvas>
  );
}
