"use client";

import { useEffect, useMemo, useState } from "react";
import { lineKey, useCartStore, type CartLine } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

export interface DetailedLine {
  key: string;
  line: CartLine;
  product: Product | null;
  variant: ProductVariant | null;
  stock: number;
  unitPriceCents: number;
  lineTotalCents: number;
  unavailable: boolean;
}

interface ProductLoadResult {
  ids: string;
  products: Record<string, Product>;
  error: string | null;
}

/** Joins the persisted cart with live product data so prices/stock are never stale. */
export function useCartDetails() {
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const [productLoad, setProductLoad] = useState<ProductLoadResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const ids = useMemo(() => [...new Set(lines.map((l) => l.productId))].sort().join(","), [lines]);

  useEffect(() => {
    if (!hydrated || !ids) return;
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const response = await fetch(`/api/products?ids=${encodeURIComponent(ids)}`);
        if (!response.ok) throw new Error("Could not load current product details.");
        const data = (await response.json()) as { products?: Product[] };
        if (!Array.isArray(data.products)) throw new Error("The product service returned invalid data.");
        if (cancelled) return;
        setProductLoad({
          ids,
          products: Object.fromEntries(data.products.map((product) => [product.id, product])),
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        console.error("cart product details request failed", error);
        setProductLoad({
          ids,
          products: {},
          error: error instanceof Error ? error.message : "Could not load current product details.",
        });
      }
    };
    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, [ids, hydrated, retryCount]);

  const currentLoad = productLoad?.ids === ids ? productLoad : null;
  const loaded = !ids || currentLoad !== null;

  const detailed = useMemo<DetailedLine[]>(
    () =>
      lines.map((line) => {
        const product = currentLoad?.products[line.productId] ?? null;
        const variant =
          product?.variants.find((v) => v.size === line.size && v.color === line.color) ?? null;
        const stock = variant?.stock ?? 0;
        const unitPriceCents = product?.priceCents ?? 0;
        const unavailable = loaded && (!product || !variant || stock <= 0);
        return {
          key: lineKey(line),
          line,
          product,
          variant,
          stock,
          unitPriceCents,
          lineTotalCents: unavailable ? 0 : unitPriceCents * line.quantity,
          unavailable,
        };
      }),
    [lines, currentLoad, loaded],
  );

  const subtotalCents = detailed.reduce((s, l) => s + l.lineTotalCents, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  return {
    lines: detailed,
    subtotalCents,
    itemCount,
    ready: hydrated && loaded,
    hydrated,
    error: currentLoad?.error ?? null,
    retry: () => setRetryCount((count) => count + 1),
  };
}
