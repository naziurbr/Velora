"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ProductInfo } from "@/components/products/ProductInfo";
import { categoryToKind } from "@/components/products/GarmentThumb";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useVariantSelection } from "@/hooks/useVariantSelection";
import { formatPrice } from "@/lib/format";
import { useClosetStore } from "@/store/closet";
import { resetInspect, scrollRailTo, turnTo, zoomBy } from "@/three/animations/ClothingAnimations";
import { createSceneState, updateSceneAutoRotate } from "@/three/controls/sceneState";
import type { ClosetGarment } from "@/three/types";
import { CATEGORY_LABELS, GENDER_LABELS, type CategorySlug, type Gender, type Product } from "@/types/product";
import { applyFilters, countActiveFilters } from "@/utils/filters";
import { ClosetCanvas } from "./ClosetCanvas";
import { FilterPanel } from "./FilterPanel";

const PANEL_WIDTH = 440;

function useViewportHeight() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => window.innerHeight,
    () => 800,
  );
}

const defaultHex = (p: Product) =>
  (p.variants.find((v) => v.stock > 0) ?? p.variants[0])?.colorHex ?? "#cccccc";

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-cream/90 text-ink shadow-soft backdrop-blur transition-all hover:bg-white active:scale-95 disabled:opacity-30";

export function ClosetExperience({ products }: { products: Product[] }) {
  const filters = useClosetStore((s) => s.filters);
  const setFilters = useClosetStore((s) => s.setFilters);
  const resetFilters = useClosetStore((s) => s.resetFilters);
  const setFiltersOpen = useClosetStore((s) => s.setFiltersOpen);

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);
  const activeFilters = countActiveFilters(filters);

  const [selectedRaw, setSelectedRaw] = useState<string | null>(null);
  const [showProductPhoto, setShowProductPhoto] = useState(false);
  const selectedProduct = useMemo(
    () => filtered.find((p) => p.id === selectedRaw) ?? null,
    [filtered, selectedRaw],
  );
  const selectedId = selectedProduct?.id ?? null;
  const selection = useVariantSelection(selectedProduct);

  const [sceneState] = useState(createSceneState);
  const [focus, setFocus] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const vh = useViewportHeight();

  const focusIdx = Math.min(focus, Math.max(0, filtered.length - 1));
  const focused = filtered[focusIdx] ?? null;

  const garments = useMemo<ClosetGarment[]>(
    () =>
      filtered.map((p) => ({
        id: p.id,
        kind: categoryToKind(p.category),
        color: p.id === selectedId ? selection.colorHex : defaultHex(p),
        modelUrl: p.modelUrl,
      })),
    [filtered, selectedId, selection.colorHex],
  );
  const labels = useMemo(() => Object.fromEntries(filtered.map((p) => [p.id, p.name])), [filtered]);

  const select = useCallback(
    (id: string) => {
      setSelectedRaw(id);
      setShowProductPhoto(!!filtered.find((product) => product.id === id)?.thumbnailUrl);
      setAutoRotate(false);
      setFiltersOpen(false);
    },
    [filtered, setFiltersOpen],
  );
  const closeInspect = useCallback(() => {
    setSelectedRaw(null);
    setShowProductPhoto(false);
    setAutoRotate(false);
  }, []);

  const step = useCallback(
    (dir: number) => {
      const next = Math.min(Math.max(focusIdx + dir, 0), filtered.length - 1);
      scrollRailTo(sceneState, next, false);
    },
    [focusIdx, filtered.length, sceneState],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (selectedId) closeInspect();
        else setFiltersOpen(false);
      } else if (!selectedId && e.key === "ArrowRight") step(1);
      else if (!selectedId && e.key === "ArrowLeft") step(-1);
      else if (!selectedId && e.key === "Enter" && focused) select(focused.id);
      else if (selectedId && e.key === "ArrowLeft") turnTo(sceneState, 0);
      else if (selectedId && e.key === "ArrowRight") turnTo(sceneState, Math.PI);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, closeInspect, step, focused, select, sceneState, setFiltersOpen]);

  const toggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    updateSceneAutoRotate(sceneState, next);
  };

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${
      active ? "bg-ink text-cream" : "text-charcoal hover:bg-black/5"
    }`;

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-linen">
      <div className="absolute inset-0">
        <ClosetCanvas
          garments={garments}
          labels={labels}
          selectedId={selectedId}
          onSelect={select}
          onFocusChange={setFocus}
          sceneState={sceneState}
          variant="rail"
          allowPitch
          insetRight={isDesktop ? PANEL_WIDTH : 0}
          insetBottom={isDesktop ? 0 : Math.round(vh * 0.5)}
        />
      </div>

      {selectedProduct?.thumbnailUrl && showProductPhoto && (
        <div className="absolute inset-0 z-10 bg-linen">
          <Image
            src={selectedProduct.thumbnailUrl}
            alt={selectedProduct.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, calc(100vw - 440px)"
            className="object-contain p-8 sm:p-14"
          />
        </div>
      )}

      {/* Browse: category navigation + filters */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 transition-all duration-500 sm:p-4 ${
          selectedId ? "-translate-y-6 opacity-0" : "opacity-100"
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-black/10 bg-cream/90 p-1 shadow-soft backdrop-blur">
            <button className={tab(filters.gender === "all")} onClick={() => setFilters({ gender: "all" })}>All</button>
            {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
              <button key={g} className={tab(filters.gender === g)} onClick={() => setFilters({ gender: g })}>
                {GENDER_LABELS[g]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="ml-auto flex h-11 items-center gap-2 rounded-full border border-black/10 bg-cream/90 px-4 text-sm shadow-soft backdrop-blur hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            Filters
            {activeFilters > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-cream">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        <div className="no-scrollbar pointer-events-auto -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
          {(["all", ...Object.keys(CATEGORY_LABELS)] as (CategorySlug | "all")[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilters({ category: c })}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm backdrop-blur transition-colors ${
                filters.category === c
                  ? "border-ink bg-ink text-cream"
                  : "border-black/10 bg-cream/80 hover:border-ink"
              }`}
            >
              {c === "all" ? "All pieces" : CATEGORY_LABELS[c]}
            </button>
          ))}
          <span className="ml-1 shrink-0 self-center text-xs text-taupe">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="absolute inset-0 z-10 grid place-items-center p-6">
          <div className="max-w-sm rounded-3xl bg-cream p-8 text-center shadow-panel">
            <p className="font-display text-2xl">Nothing on the rail</p>
            <p className="mt-2 text-sm text-charcoal/70">No garments match your filters. Try widening your search.</p>
            <button onClick={resetFilters} className="mt-5 h-11 rounded-full bg-ink px-6 text-sm text-cream hover:bg-charcoal">
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Browse: bottom controls */}
      {!selectedId && focused && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 p-4 pb-5">
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            <button className={iconBtn} aria-label="Previous garment" disabled={focusIdx <= 0} onClick={() => step(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => select(focused.id)}
              className="group flex min-w-0 max-w-[75vw] items-center justify-center gap-3 rounded-full border border-black/10 bg-cream/95 px-4 py-2 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white sm:min-w-72 sm:px-6"
            >
              {focused.thumbnailUrl && (
                <Image
                  src={focused.thumbnailUrl}
                  alt=""
                  width={40}
                  height={48}
                  className="h-12 w-10 shrink-0 rounded-lg bg-linen object-cover"
                />
              )}
              <span className="flex min-w-0 flex-col items-start">
                <span className="max-w-full truncate text-sm font-medium">{focused.name}</span>
                <span className="text-xs text-taupe">
                  {formatPrice(focused.priceCents)} · <span className="underline-offset-4 group-hover:underline">Inspect</span>
                </span>
              </span>
            </button>
            <button className={iconBtn} aria-label="Next garment" disabled={focusIdx >= filtered.length - 1} onClick={() => step(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/55">
            {focusIdx + 1} / {filtered.length} · Drag to browse · Tap to inspect
          </p>
        </div>
      )}

      {/* Inspect: back button */}
      {selectedProduct && (
        <button
          onClick={closeInspect}
          className="animate-rise absolute left-3 top-3 z-30 flex h-11 items-center gap-2 rounded-full border border-black/10 bg-cream/95 px-5 text-sm shadow-soft backdrop-blur hover:bg-white sm:left-4 sm:top-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to the rail
        </button>
      )}

      {/* Inspect: view controls */}
      {selectedProduct && (
        <div
          className="animate-rise pointer-events-none absolute inset-x-0 top-[3.75rem] z-20 flex justify-center px-3 lg:top-auto lg:bottom-6"
          style={isDesktop ? { right: PANEL_WIDTH } : undefined}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/10 bg-cream/95 p-1 shadow-soft backdrop-blur">
            {selectedProduct.thumbnailUrl && (
              <>
                <button
                  onClick={() => { setShowProductPhoto(true); setAutoRotate(false); }}
                  aria-pressed={showProductPhoto}
                  className={`rounded-full px-3 py-2 text-sm ${showProductPhoto ? "bg-ink text-cream" : "hover:bg-black/5"}`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setShowProductPhoto(false)}
                  aria-pressed={!showProductPhoto}
                  className={`rounded-full px-3 py-2 text-sm ${!showProductPhoto ? "bg-ink text-cream" : "hover:bg-black/5"}`}
                >
                  3D
                </button>
                <span className="mx-1 h-5 w-px bg-black/10" />
              </>
            )}
            {!showProductPhoto && ([
              ["Front", 0],
              ["Side", Math.PI / 2],
              ["Back", Math.PI],
            ] as const).map(([label, angle]) => (
              <button
                key={label}
                onClick={() => {
                  setAutoRotate(false);
                  turnTo(sceneState, angle);
                }}
                className="rounded-full px-3.5 py-2 text-sm hover:bg-black/5"
              >
                {label}
              </button>
            ))}
            {!showProductPhoto && (
              <>
                <span className="mx-1 h-5 w-px bg-black/10" />
                <button
                  onClick={toggleAutoRotate}
                  aria-pressed={autoRotate}
                  aria-label="Auto-rotate"
                  title="Auto-rotate"
                  className={`grid h-9 w-9 place-items-center rounded-full ${autoRotate ? "bg-ink text-cream" : "hover:bg-black/5"}`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button onClick={() => zoomBy(sceneState, 1 / 1.3)} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" strokeLinecap="round" /></svg>
                </button>
                <button onClick={() => zoomBy(sceneState, 1.3)} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                </button>
                <button
                  onClick={() => {
                    resetInspect(sceneState);
                    setAutoRotate(false);
                  }}
                  className="rounded-full px-3 py-2 text-sm text-taupe hover:bg-black/5 hover:text-ink"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Inspect: product panel (side panel on desktop, bottom sheet on mobile) */}
      {selectedProduct && (
        <aside
          key={selectedProduct.id}
          aria-label="Product details"
          className="animate-panel absolute z-30 overflow-y-auto bg-cream/95 p-6 shadow-panel backdrop-blur-xl max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[52dvh] max-lg:rounded-t-[1.75rem] max-lg:px-5 max-lg:pb-6 lg:bottom-4 lg:right-4 lg:top-4 lg:w-[408px] lg:rounded-[1.75rem]"
        >
          <ProductInfo product={selectedProduct} selection={selection} />
          <Link
            href={`/products/${selectedProduct.id}`}
            className="mt-4 block text-center text-sm text-taupe underline-offset-4 hover:text-ink hover:underline"
          >
            View full product page →
          </Link>
        </aside>
      )}

      <FilterPanel products={products} resultCount={filtered.length} />
    </div>
  );
}
