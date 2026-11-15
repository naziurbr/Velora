"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ClosetCanvas } from "@/components/closet/ClosetCanvas";
import { useVariantSelection } from "@/hooks/useVariantSelection";
import { turnTo, zoomBy } from "@/three/animations/ClothingAnimations";
import { createSceneState } from "@/three/controls/sceneState";
import type { ClosetGarment } from "@/three/types";
import type { Product } from "@/types/product";
import { categoryToKind } from "./GarmentThumb";
import { ProductInfo } from "./ProductInfo";

/** Single-garment 3D viewer + product info. Uses the same scene as the closet. */
export function ProductDetail({ product }: { product: Product }) {
  const selection = useVariantSelection(product);
  const [sceneState] = useState(createSceneState);
  const [view, setView] = useState<"photo" | "3d">(product.thumbnailUrl ? "photo" : "3d");
  const noop = useCallback(() => {}, []);

  const garments = useMemo<ClosetGarment[]>(
    () => [
      {
        id: product.id,
        kind: categoryToKind(product.category),
        color: selection.colorHex,
        modelUrl: product.modelUrl,
      },
    ],
    [product, selection.colorHex],
  );
  const labels = useMemo(() => ({ [product.id]: product.name }), [product]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10 bg-linen shadow-soft lg:aspect-auto lg:h-[calc(100dvh-8rem)]">
          {view === "photo" && product.thumbnailUrl ? (
            <Image src={product.thumbnailUrl} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain p-6 sm:p-10" />
          ) : (
            <>
              <div className="absolute inset-0">
                <ClosetCanvas
                  garments={garments}
                  labels={labels}
                  selectedId={product.id}
                  onSelect={noop}
                  sceneState={sceneState}
                  variant="viewer"
                  allowPitch={false}
                />
              </div>
              <p className="pointer-events-none absolute left-0 right-0 top-16 text-center text-[11px] uppercase tracking-[0.2em] text-charcoal/50">
                Drag to rotate
              </p>
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <div className="flex items-center gap-1 rounded-full border border-black/10 bg-cream/95 p-1 shadow-soft backdrop-blur">
                  {([
                    ["Front", 0],
                    ["Side", Math.PI / 2],
                    ["Back", Math.PI],
                  ] as const).map(([label, angle]) => (
                    <button key={label} onClick={() => turnTo(sceneState, angle)} className="rounded-full px-3.5 py-2 text-sm hover:bg-black/5">
                      {label}
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-black/10" />
                  <button onClick={() => zoomBy(sceneState, 1 / 1.3)} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">−</button>
                  <button onClick={() => zoomBy(sceneState, 1.3)} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">+</button>
                </div>
              </div>
            </>
          )}
          {product.thumbnailUrl && (
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 rounded-full border border-black/10 bg-cream/95 p-1 shadow-soft backdrop-blur">
              <button onClick={() => setView("photo")} aria-pressed={view === "photo"} className={`rounded-full px-4 py-2 text-sm ${view === "photo" ? "bg-ink text-cream" : "hover:bg-black/5"}`}>Photo</button>
              <button onClick={() => setView("3d")} aria-pressed={view === "3d"} className={`rounded-full px-4 py-2 text-sm ${view === "3d" ? "bg-ink text-cream" : "hover:bg-black/5"}`}>3D view</button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:py-4">
        <ProductInfo product={product} selection={selection} />
      </div>
    </div>
  );
}
