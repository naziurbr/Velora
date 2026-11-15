export type Gender = "men" | "women" | "unisex";
export type CategorySlug = "shirts" | "t-shirts" | "pants" | "jackets";

export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
}

/**
 * Commerce-side product. The 3D layer never imports this: it only receives
 * the minimal `ClosetGarment` projection (see src/three/types.ts).
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  /** Price in minor units (cents). */
  priceCents: number;
  category: CategorySlug;
  gender: Gender;
  brand: string;
  material: string;
  modelUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  isNew: boolean;
  variants: ProductVariant[];
}

export const SIZES = ["S", "M", "L", "XL"] as const;

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  shirts: "Shirts",
  "t-shirts": "T-shirts",
  pants: "Pants",
  jackets: "Jackets",
};

export const GENDER_LABELS: Record<Gender, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};
