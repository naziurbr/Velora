"use client";

import { useMemo } from "react";
import { useClosetStore } from "@/store/closet";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  SIZES,
  type CategorySlug,
  type Gender,
  type Product,
} from "@/types/product";
import { countActiveFilters, uniqueBrands, uniqueColors } from "@/utils/filters";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-black/10 py-5">
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-taupe">{title}</h3>
      {children}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-ink bg-ink text-cream" : "border-black/15 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  products,
  resultCount,
}: {
  products: Product[];
  resultCount: number;
}) {
  const open = useClosetStore((s) => s.filtersOpen);
  const setOpen = useClosetStore((s) => s.setFiltersOpen);
  const filters = useClosetStore((s) => s.filters);
  const setFilters = useClosetStore((s) => s.setFilters);
  const reset = useClosetStore((s) => s.resetFilters);

  const colors = useMemo(() => uniqueColors(products), [products]);
  const brands = useMemo(() => uniqueBrands(products), [products]);
  const maxPrice = useMemo(
    () => Math.ceil(Math.max(0, ...products.map((p) => p.priceCents)) / 100),
    [products],
  );
  const active = countActiveFilters(filters);

  return (
    <>
      <div
        className={`absolute inset-0 z-30 bg-ink/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        aria-label="Filters"
        aria-hidden={!open}
        className={`absolute inset-y-0 left-0 z-40 flex w-full max-w-sm flex-col bg-cream shadow-panel transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-black/10 px-6">
          <h2 className="font-display text-xl">Filter &amp; search</h2>
          <button onClick={() => setOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <Section title="Search">
            <input
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              placeholder="Name, brand, material, color…"
              className="h-11 w-full rounded-full border border-black/15 bg-white/60 px-4 text-sm outline-none focus:border-ink"
            />
          </Section>

          <Section title="Collection">
            <div className="flex flex-wrap gap-2">
              <Chip active={filters.gender === "all"} onClick={() => setFilters({ gender: "all" })}>All</Chip>
              {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                <Chip key={g} active={filters.gender === g} onClick={() => setFilters({ gender: g })}>
                  {GENDER_LABELS[g]}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              <Chip active={filters.category === "all"} onClick={() => setFilters({ category: "all" })}>All</Chip>
              {(Object.keys(CATEGORY_LABELS) as CategorySlug[]).map((c) => (
                <Chip key={c} active={filters.category === c} onClick={() => setFilters({ category: c })}>
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Size (in stock)">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <Chip key={s} active={filters.size === s} onClick={() => setFilters({ size: filters.size === s ? null : s })}>
                  {s}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Color">
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => {
                const on = filters.color === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={on}
                    onClick={() => setFilters({ color: on ? null : c.name })}
                    className={`h-8 w-8 rounded-full border transition-all ${
                      on ? "scale-110 border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream" : "border-black/15 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </Section>

          <Section title="Brand">
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Chip key={b} active={filters.brand === b} onClick={() => setFilters({ brand: filters.brand === b ? null : b })}>
                  {b}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Price range">
            <div className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2 rounded-full border border-black/15 bg-white/60 px-4 text-sm">
                <span className="text-taupe">$</span>
                <input
                  type="number"
                  min={0}
                  max={maxPrice}
                  inputMode="numeric"
                  placeholder="Min"
                  value={filters.minPrice ?? ""}
                  onChange={(e) => setFilters({ minPrice: e.target.value === "" ? null : Number(e.target.value) })}
                  className="h-10 w-full bg-transparent outline-none"
                  aria-label="Minimum price"
                />
              </label>
              <span className="text-taupe">–</span>
              <label className="flex flex-1 items-center gap-2 rounded-full border border-black/15 bg-white/60 px-4 text-sm">
                <span className="text-taupe">$</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={`${maxPrice}`}
                  value={filters.maxPrice ?? ""}
                  onChange={(e) => setFilters({ maxPrice: e.target.value === "" ? null : Number(e.target.value) })}
                  className="h-10 w-full bg-transparent outline-none"
                  aria-label="Maximum price"
                />
              </label>
            </div>
          </Section>

          <Section title="Highlights">
            <div className="flex flex-wrap gap-2">
              <Chip active={filters.onlyNew} onClick={() => setFilters({ onlyNew: !filters.onlyNew })}>New arrivals</Chip>
              <Chip active={filters.onlyFeatured} onClick={() => setFilters({ onlyFeatured: !filters.onlyFeatured })}>Featured</Chip>
            </div>
          </Section>
        </div>

        <div className="flex items-center gap-3 border-t border-black/10 bg-linen/60 px-6 py-4">
          <button
            type="button"
            onClick={reset}
            disabled={active === 0}
            className="h-11 rounded-full border border-black/15 px-5 text-sm hover:border-ink disabled:opacity-40"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 flex-1 rounded-full bg-ink text-sm font-medium text-cream hover:bg-charcoal"
          >
            Show {resultCount} {resultCount === 1 ? "garment" : "garments"}
          </button>
        </div>
      </aside>
    </>
  );
}
