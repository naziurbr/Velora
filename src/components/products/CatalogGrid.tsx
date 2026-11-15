"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { CATEGORY_LABELS, GENDER_LABELS, type CategorySlug, type Gender, type Product } from "@/types/product";

const categories: ("all" | CategorySlug)[] = ["all", "shirts", "t-shirts", "pants", "jackets"];
const colorOptions = [
  { name: "Black", hex: "#1c1c1c" },
  { name: "Ivory", hex: "#efe8d8" },
  { name: "Sand", hex: "#b59a72" },
  { name: "Slate", hex: "#7d8eab" },
  { name: "Forest", hex: "#4d5d46" },
  { name: "Moss", hex: "#7b8069" },
  { name: "Stone", hex: "#d4d0c4" },
  { name: "Navy", hex: "#27364d" },
];
const sizes = ["S", "M", "L", "XL"];

export function CatalogGrid({
  products,
  initialGender = "all",
  initialCategory = "all",
  initialQuery = "",
}: {
  products: Product[];
  initialGender?: Gender | "all";
  initialCategory?: CategorySlug | "all";
  initialQuery?: string;
}) {
  const [gender, setGender] = useState<Gender | "all">(initialGender);
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      if (gender !== "all" && product.gender !== gender) return false;
      if (category !== "all" && product.category !== category) return false;
      if (selectedColor && !product.variants.some((variant) => variant.color.toLowerCase() === selectedColor.toLowerCase())) return false;
      if (selectedSize && !product.variants.some((variant) => variant.size === selectedSize && variant.stock > 0)) return false;
      const searchable = `${product.name} ${product.brand} ${product.material} ${product.category} ${product.gender}`.toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [products, gender, category, query, selectedColor, selectedSize]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Home / Shop all</p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.04em]">All pieces</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-charcoal/70">Sort</span>
          <button type="button" className="flex items-center gap-2 rounded-full border border-black/20 bg-transparent px-3 py-2 text-sm text-charcoal/80">
            Featured
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="m8 10 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:max-w-[210px]">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-taupe">Category</p>
              <ul className="mt-3 space-y-2 text-[15px] text-charcoal/80">
                {categories.map((value) => (
                  <li key={value}>
                    <button
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`text-left transition-colors ${category === value ? "font-medium text-ink" : "hover:text-ink"}`}
                    >
                      {value === "all" ? "All" : CATEGORY_LABELS[value]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-taupe">Color</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {colorOptions.map((color) => {
                  const active = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={color.name}
                      aria-pressed={active}
                      onClick={() => setSelectedColor(active ? null : color.name)}
                      className={`h-6 w-6 rounded-full border transition-transform ${active ? "scale-110 border-2 border-ink" : "border-black/20"}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-taupe">Size</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(active ? null : size)}
                      className={`flex h-8 items-center justify-center rounded-full border text-xs transition-colors ${
                        active ? "border-ink bg-ink text-cream" : "border-black/15 bg-white/50 text-charcoal/80 hover:border-ink"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-taupe">Price</p>
              <div className="mt-3 flex items-center justify-between text-sm text-charcoal/80">
                <span>$40</span>
                <span className="text-charcoal/60">—</span>
                <span>$150</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-black/10">
                <div className="h-full w-1/2 rounded-full bg-ink" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/10 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "women", "men", "unisex"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={gender === value}
                  onClick={() => setGender(value)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    gender === value ? "border-ink bg-ink text-cream" : "border-black/15 hover:border-ink"
                  }`}
                >
                  {value === "all" ? "Everyone" : GENDER_LABELS[value]}
                </button>
              ))}
            </div>
            <label className="flex w-full max-w-[260px] items-center gap-2 rounded-full border border-black/15 bg-white/40 px-3 py-2 text-sm text-charcoal/80">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the collection..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-taupe"
              />
            </label>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center py-16 text-center">
              <p className="font-display text-3xl">No pieces found</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal/70">
                Try a different search or clear the filters to see the full collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGender("all");
                  setCategory("all");
                  setQuery("");
                  setSelectedColor(null);
                  setSelectedSize(null);
                }}
                className="mt-6 border-b border-ink pb-1 text-sm hover:text-taupe"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
