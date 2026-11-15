"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { ClosetSceneProps } from "@/three/scenes/ClosetScene";
import { ErrorBoundary } from "@/utils/ErrorBoundary";
import { GarmentThumb } from "@/components/products/GarmentThumb";

function CanvasLoading({ label = "Hanging the garments…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linen">
      <div className="flex flex-col items-center gap-3 text-taupe">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-taupe/40 border-t-ink" />
        <span className="text-sm tracking-wide">{label}</span>
      </div>
    </div>
  );
}

// The 3D engine is code-split and never rendered on the server.
const ClosetScene = dynamic(() => import("@/three/scenes/ClosetScene"), {
  ssr: false,
  loading: () => <CanvasLoading />,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribeToWebGL = () => () => {};
let webGLSnapshot: boolean | null = null;
const getWebGLSnapshot = () => {
  webGLSnapshot ??= hasWebGL();
  return webGLSnapshot;
};
const getWebGLServerSnapshot = () => null;

/** 2D fallback for devices without WebGL (or if the 3D scene crashes). */
function Closet2DFallback({
  garments,
  labels,
  selectedId,
  onSelect,
}: Pick<ClosetSceneProps, "garments" | "selectedId" | "onSelect"> & { labels: Record<string, string> }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-linen px-4 pb-40 pt-28 lg:pr-[440px]">
      <p className="mx-auto mb-6 max-w-xl text-center text-sm text-taupe">
        3D view isn’t available on this device, so here’s the closet as a simple rail of garments.
      </p>
      <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {garments.map((g) => (
          <li key={g.id}>
            <button
              onClick={() => onSelect(g.id)}
              className={`w-full rounded-3xl border bg-cream p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft ${
                selectedId === g.id ? "border-ink" : "border-black/10"
              }`}
            >
              <GarmentThumb kind={g.kind} color={g.color} className="mx-auto h-36 w-full" />
              <span className="mt-2 block truncate text-sm">{labels[g.id]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClosetCanvas({
  labels,
  ...scene
}: ClosetSceneProps & { labels: Record<string, string> }) {
  const supported = useSyncExternalStore(
    subscribeToWebGL,
    getWebGLSnapshot,
    getWebGLServerSnapshot,
  );

  const fallback = (
    <Closet2DFallback
      garments={scene.garments}
      labels={labels}
      selectedId={scene.selectedId}
      onSelect={scene.onSelect}
    />
  );

  if (supported === null) return <CanvasLoading />;
  if (!supported) return fallback;
  return (
    <ErrorBoundary fallback={fallback} onError={(e) => console.error("3D scene crashed", e)}>
      <ClosetScene {...scene} />
    </ErrorBoundary>
  );
}
