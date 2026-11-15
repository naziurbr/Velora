"use client";

import { useEffect, useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial, TorusGeometry } from "three";
import { HANGERS } from "../garments/shapes";
import type { GarmentKind } from "../types";
import type { FadeRef } from "../animations/ClothingAnimations";
import { useMaterialSync } from "./useMaterialSync";

// Shared geometries: unit cylinders are scaled per instance.
let rod: CylinderGeometry | null = null;
let ring: TorusGeometry | null = null;
const getRod = () => (rod ??= new CylinderGeometry(0.0075, 0.0075, 1, 8));
const getRing = () => (ring ??= new TorusGeometry(0.045, 0.007, 8, 24));

export function disposeHangerGeometry() {
  rod?.dispose();
  ring?.dispose();
  rod = null;
  ring = null;
}

export function Hanger({ kind, fade }: { kind: GarmentKind; fade: FadeRef }) {
  const { halfWidth: w, endY } = HANGERS[kind];
  const material = useMemo(
    () => new MeshStandardMaterial({ color: "#b79a73", roughness: 0.55, metalness: 0.15 }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useMaterialSync([material], fade);

  const apexY = -0.16;
  const dx = w;
  const dy = endY - apexY;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(-dx, dy);

  return (
    <group>
      <mesh geometry={getRing()} material={material} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={getRod()} material={material} position={[0, -0.1, 0]} scale={[1, 0.12, 1]} />
      <mesh
        geometry={getRod()}
        material={material}
        position={[w / 2, (apexY + endY) / 2, 0]}
        rotation={[0, 0, angle]}
        scale={[1.2, len, 1.2]}
      />
      <mesh
        geometry={getRod()}
        material={material}
        position={[-w / 2, (apexY + endY) / 2, 0]}
        rotation={[0, 0, -angle]}
        scale={[1.2, len, 1.2]}
      />
      <mesh
        geometry={getRod()}
        material={material}
        position={[0, endY, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1.2, w * 2, 1.2]}
      />
    </group>
  );
}
