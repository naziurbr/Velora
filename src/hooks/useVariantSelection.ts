"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/types/product";

interface Raw {
  pid: string | null;
  color: string | null;
  size: string | null;
}

/** Color / size choice for one product. Automatically resets when the product changes. */
export function useVariantSelection(product: Product | null) {
  const pid = product?.id ?? null;
  const defaultColor =
    product?.variants.find((v) => v.stock > 0)?.color ?? product?.variants[0]?.color ?? null;

  const [raw, setRaw] = useState<Raw>({ pid, color: null, size: null });
  const cur: Raw = raw.pid === pid ? raw : { pid, color: null, size: null };

  const color = cur.color ?? defaultColor;
  const size = cur.size;
  const variant: ProductVariant | null =
    product?.variants.find((v) => v.color === color && v.size === size) ?? null;
  const colorHex =
    product?.variants.find((v) => v.color === color)?.colorHex ??
    product?.variants[0]?.colorHex ??
    "#cccccc";

  const setColor = (c: string) => {
    // Drop the size if it is sold out in the newly chosen color.
    const keep = product?.variants.some((v) => v.color === c && v.size === size && v.stock > 0);
    setRaw({ pid, color: c, size: keep ? size : null });
  };
  const setSize = (s: string) => setRaw({ pid, color: cur.color, size: s });

  return { color, size, variant, colorHex, setColor, setSize };
}

export type VariantSelection = ReturnType<typeof useVariantSelection>;
