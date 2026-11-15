import { useFrame } from "@react-three/fiber";
import { Color, type Material } from "three";
import type { FadeRef } from "../animations/ClothingAnimations";

type TintableMaterial = Material & { color?: Color };

/**
 * Applies the cross-fade value (and an optional smoothly-lerped target color)
 * to a set of materials every frame. Materials only flip to transparent while
 * actually fading, to keep opaque sorting and depth writes cheap.
 */
export function useMaterialSync(
  materials: TintableMaterial[],
  fade: FadeRef,
  tint?: { color: Color; targets: Set<TintableMaterial> } | null,
) {
  useFrame((_, dt) => {
    const o = fade.v;
    const transparent = o < 0.995;
    for (const m of materials) {
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
      m.opacity = o;
      m.depthWrite = o > 0.6;
      if (tint && m.color && tint.targets.has(m)) {
        m.color.lerp(tint.color, 1 - Math.exp(-9 * Math.min(dt, 0.05)));
      }
    }
  });
}
