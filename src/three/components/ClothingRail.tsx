"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, type Group } from "three";
import { RAIL_Y, WALL_Z } from "../constants";
import { nearestIndex, type SceneState } from "../controls/sceneState";
import type { ClosetGarment } from "../types";
import { ClothingItem } from "./ClothingItem";

interface Props {
  garments: ClosetGarment[];
  state: SceneState;
  selectedId: string | null;
  spacing: number;
  shadows: boolean;
  onSelect: (id: string) => void;
  onFocusChange?: (index: number) => void;
}

export function ClothingRail({
  garments,
  state,
  selectedId,
  spacing,
  shadows,
  onSelect,
  onFocusChange,
}: Props) {
  const slider = useRef<Group>(null);
  const lastFocus = useRef(-1);
  const inspecting = selectedId !== null;

  const steel = useMemo(
    () => new MeshStandardMaterial({ color: "#3a3a3c", metalness: 0.85, roughness: 0.32 }),
    [],
  );
  useEffect(() => () => steel.dispose(), [steel]);

  const idsKey = garments.map((g) => g.id).join("|");
  useEffect(() => {
    lastFocus.current = -1; // re-announce focus after the list changes
  }, [idsKey]);

  useFrame(() => {
    if (slider.current) slider.current.position.x = state.railX;
    if (!inspecting && onFocusChange) {
      const idx = nearestIndex(state);
      if (idx !== lastFocus.current) {
        lastFocus.current = idx;
        onFocusChange(idx);
      }
    }
  });

  const length = Math.max(60, garments.length * spacing * 2 + 30);
  const brackets: number[] = [];
  for (let x = -Math.floor(length / 2 / 5) * 5; x <= length / 2; x += 5) brackets.push(x);

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Fixed rail + wall supports */}
      <mesh material={steel} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, length, 12]} />
      </mesh>
      {brackets.map((x) => (
        <mesh
          key={x}
          material={steel}
          position={[x, 0, (WALL_Z - 0.0) / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.014, 0.014, Math.abs(WALL_Z), 8]} />
        </mesh>
      ))}

      {/* Sliding garments */}
      <group ref={slider}>
        {garments.map((g, i) => (
          <ClothingItem
            key={g.id}
            garment={g}
            index={i}
            spacing={spacing}
            state={state}
            selected={selectedId === g.id}
            inspecting={inspecting}
            shadows={shadows}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  );
}
