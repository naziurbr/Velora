"use client";

import { useState } from "react";
import { formatPrice, stockLabel } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { VariantSelection } from "@/hooks/useVariantSelection";
import { CATEGORY_LABELS, GENDER_LABELS, SIZES, type Product } from "@/types/product";
import { productColors } from "@/utils/filters";
import { WishlistButton } from "./WishlistButton";

const toneClass = {
  ok: "bg-emerald-600",
  low: "bg-amber-500",
  out: "bg-red-600",
};

export function ProductInfo({
  product,
  selection,
  compact = false,
}: {
  product: Product;
  selection: VariantSelection;
  compact?: boolean;
}) {
  const add = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [justAdded, setJustAdded] = useState(false);
  const { color, size, variant } = selection;

  const colors = productColors(product);
  const colorStock = product.variants.filter((v) => v.color === color);
  const totalStock = variant ? variant.stock : colorStock.reduce((s, v) => s + v.stock, 0);
  const availability = stockLabel(totalStock);

  const canAdd = !!variant && variant.stock > 0;

  const handleAdd = () => {
    if (!variant || variant.stock <= 0) return;
    add({ productId: product.id, size: variant.size, color: variant.color }, 1, variant.stock);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">
          {product.brand} · {GENDER_LABELS[product.gender]} · {CATEGORY_LABELS[product.category]}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl leading-tight text-ink sm:text-[1.75rem]">
            {product.name}
          </h2>
          <p className="shrink-0 pt-1 text-lg font-medium tabular-nums text-ink">
            {formatPrice(product.priceCents)}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-charcoal">
              Featured
            </span>
          )}
        </div>
      </div>

      {!compact && <p className="text-sm leading-relaxed text-charcoal/80">{product.description}</p>}

      {/* Color */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal">Color</span>
          <span className="text-xs text-taupe">{color}</span>
        </div>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color">
          {colors.map((c) => {
            const active = c.name === color;
            return (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${c.name}${c.inStock ? "" : " (sold out)"}`}
                title={`${c.name}${c.inStock ? "" : " — sold out"}`}
                onClick={() => selection.setColor(c.name)}
                className={`relative h-8 w-8 rounded-full border transition-all ${
                  active ? "scale-110 border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream" : "border-black/15 hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {!c.inStock && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-9 rotate-45 bg-ink/70" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal">Size</span>
          <span className="text-xs text-taupe">{size ?? "Select a size"}</span>
        </div>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Size">
          {SIZES.map((s) => {
            const v = product.variants.find((x) => x.color === color && x.size === s);
            const available = !!v && v.stock > 0;
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!available}
                onClick={() => selection.setSize(s)}
                className={`h-10 rounded-full border text-sm transition-colors ${
                  active
                    ? "border-ink bg-ink text-cream"
                    : available
                      ? "border-black/15 bg-white/60 text-ink hover:border-ink"
                      : "cursor-not-allowed border-black/10 text-taupe/60 line-through"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-black/10 pt-4 text-sm">
        <dt className="text-taupe">Material</dt>
        <dd className="text-right text-charcoal">{product.material}</dd>
        <dt className="text-taupe">SKU</dt>
        <dd className="text-right font-mono text-xs leading-5 text-charcoal">
          {variant?.sku ?? product.sku}
        </dd>
        <dt className="text-taupe">Availability</dt>
        <dd className="flex items-center justify-end gap-2 text-charcoal">
          <span className={`h-2 w-2 rounded-full ${toneClass[availability.tone]}`} />
          {availability.label}
        </dd>
      </dl>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="h-12 w-full rounded-full bg-ink text-sm font-medium tracking-wide text-cream transition-all hover:bg-charcoal active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink/30"
      >
        {justAdded ? "Added to cart ✓" : canAdd ? "Add to cart" : size ? "Sold out" : "Select a size"}
      </button>
      <div className="flex justify-center">
        <WishlistButton productId={product.id} productName={product.name} label />
      </div>
    </div>
  );
}
