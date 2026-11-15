"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Color, Material, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { ErrorBoundary } from "@/utils/ErrorBoundary";
import type { FadeRef } from "../animations/ClothingAnimations";
import { isLightColor } from "../garments/shapes";
import { getFabricTexture, getGarmentGeometry } from "../loaders/ModelLoader";
import type { GarmentKind } from "../types";
import { useMaterialSync } from "./useMaterialSync";

interface VisualProps {
  kind: GarmentKind;
  color: string;
  modelUrl?: string | null;
  fade: FadeRef;
  castShadow: boolean;
}

/** Procedural placeholder garment. Swapped for a GLB as soon as one exists. */
function ProceduralGarment({ kind, color, fade, castShadow }: VisualProps) {
  const geo = useMemo(() => getGarmentGeometry(kind), [kind]);
  const fabric = useMemo(() => getFabricTexture(), []);
  const body = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        map: fabric,
        bumpMap: fabric,
        bumpScale: 1.5,
        roughness: 0.9,
        metalness: 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fabric],
  );
  const trim = useMemo(
    () => new MeshStandardMaterial({ color: "#f1ece2", roughness: 0.4, metalness: 0.05 }),
    [],
  );
  const target = useMemo(() => new Color(color), [color]);
  const tint = useMemo(() => ({ color: target, targets: new Set<Material>([body]) }), [target, body]);

  useEffect(() => {
    trim.color.set(isLightColor(color) ? "#2b2b2b" : "#f1ece2");
  }, [color, trim]);
  useEffect(
    () => () => {
      body.dispose();
      trim.dispose();
    },
    [body, trim],
  );

  useMaterialSync([body, trim], fade, tint);

  return (
    <group>
      <mesh geometry={geo.body} material={body} castShadow={castShadow} receiveShadow />
      {geo.details.map((d, i) => (
        <mesh key={i} geometry={d} material={body} castShadow={castShadow} />
      ))}
      {geo.buttons.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
          <cylinderGeometry args={[0.016, 0.016, 0.012, 12]} />
        </mesh>
      ))}
      {geo.zipper && (
        <mesh position={[0, geo.zipper.y, geo.zipper.z]} material={trim}>
          <boxGeometry args={[0.012, geo.zipper.h, 0.01]} />
        </mesh>
      )}
    </group>
  );
}

/** GLB garment (Draco / Meshopt compressed). Materials are cloned per instance. */
function GlbGarment({ url, color, fade, castShadow }: VisualProps & { url: string }) {
  const { scene } = useGLTF(url, true, true);

  const { root, mats } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 1.1 / (size.y || 1);
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -0.2 - box.max.y * s, -center.z * s);

    const mats: Material[] = [];
    clone.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = castShadow;
      const own = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.clone())
        : mesh.material.clone();
      mesh.material = own;
      (Array.isArray(own) ? own : [own]).forEach((m) => mats.push(m));
    });
    return { root: clone, mats };
  }, [scene, castShadow]);

  const tint = useMemo(
    () => ({ color: new Color(color), targets: new Set<Material>(mats) }),
    [color, mats],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  useMaterialSync(mats, fade, tint);

  return <primitive object={root} />;
}

export function GarmentVisual(props: VisualProps) {
  const fallback = <ProceduralGarment {...props} />;
  if (!props.modelUrl) return fallback;
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(e) => console.warn(`Model failed to load (${props.modelUrl}); using placeholder.`, e)}
    >
      <Suspense fallback={fallback}>
        <GlbGarment {...props} url={props.modelUrl} />
      </Suspense>
    </ErrorBoundary>
  );
}
