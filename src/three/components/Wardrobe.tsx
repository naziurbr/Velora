"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { WALL_Z } from "../constants";

/** Static boutique-wardrobe set: back wall, floor, baseboard, lighting. */
export function Wardrobe({ shadows, length = 70 }: { shadows: boolean; length?: number }) {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3.5, WALL_Z]} receiveShadow>
        <planeGeometry args={[length, 9]} />
        <meshStandardMaterial color="#e9e2d5" roughness={0.95} />
      </mesh>
      {/* Floor */}
      <mesh position={[0, 0, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, 22]} />
        <meshStandardMaterial color="#cdbfa8" roughness={0.75} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, 0.09, WALL_Z + 0.02]}>
        <boxGeometry args={[length, 0.18, 0.04]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.6} />
      </mesh>

      <hemisphereLight args={["#fffaf0", "#d8cbb6", 1.15]} />
      <directionalLight
        position={[4, 4.5, 6]}
        intensity={1.5}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* Procedural studio environment: no network fetch needed. */}
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 2]} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-6, 2, 3]} rotation-y={Math.PI / 3} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, 3]} rotation-y={-Math.PI / 3} scale={[6, 4, 1]} />
      </Environment>
    </group>
  );
}
