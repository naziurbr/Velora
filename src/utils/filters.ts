import type { CategorySlug, Gender, Product } from "@/types/product";

export interface ProductFilters {
  q: string;
  gender: Gender | "all";
  category: CategorySlug | "all";
  size: string | null;
  color: string | null;
  brand: string | null;
  /** Whole currency units. */
  minPrice: number | null;
  maxPrice: number | null;
  onlyNew: boolean;
  onlyFeatured: boolean;
}

export const DEFAULT_FILTERS: ProductFilters = {
  q: "",
  gender: "all",
  category: "all",
  size: null,
  color: null,
  brand: null,
  minPrice: null,
  maxPrice: null,
  onlyNew: false,
  onlyFeatured: false,
};

export function countActiveFilters(f: ProductFilters): number {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.gender !== "all") n++;
  if (f.category !== "all") n++;
  if (f.size) n++;
  if (f.color) n++;
  if (f.brand) n++;
  if (f.minPrice !== null) n++;
  if (f.maxPrice !== null) n++;
  if (f.onlyNew) n++;
  if (f.onlyFeatured) n++;
  return n;
}

/** Pure filtering shared by the closet, search API and any list view. */
export function applyFilters(list: Product[], f: ProductFilters): Product[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (f.gender !== "all" && p.gender !== f.gender) return false;
    if (f.category !== "all" && p.category !== f.category) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.minPrice !== null && p.priceCents < f.minPrice * 100) return false;
    if (f.maxPrice !== null && p.priceCents > f.maxPrice * 100) return false;
    if (f.onlyNew && !p.isNew) return false;
    if (f.onlyFeatured && !p.isFeatured) return false;
    if (f.size && !p.variants.some((v) => v.size === f.size && v.stock > 0)) return false;
    if (f.color && !p.variants.some((v) => v.color === f.color)) return false;
    if (q) {
      const hay = `${p.name} ${p.brand} ${p.material} ${p.category} ${p.gender} ${p.variants
        .map((v) => v.color)
        .join(" ")}`.toLowerCase();
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    return true;
  });
}

export function uniqueColors(list: Product[]): { name: string; hex: string }[] {
  const map = new Map<string, string>();
  for (const p of list) for (const v of p.variants) if (!map.has(v.color)) map.set(v.color, v.colorHex);
  return [...map].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name));
}

export function uniqueBrands(list: Product[]): string[] {
  return [...new Set(list.map((p) => p.brand))].sort();
}

export function productColors(p: Product): { name: string; hex: string; inStock: boolean }[] {
  const out = new Map<string, { name: string; hex: string; inStock: boolean }>();
  for (const v of p.variants) {
    const cur = out.get(v.color);
    if (!cur) out.set(v.color, { name: v.color, hex: v.colorHex, inStock: v.stock > 0 });
    else if (v.stock > 0) cur.inStock = true;
  }
  return [...out.values()];
}
