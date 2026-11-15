"use client";

import Link from "next/link";
import type { DetailedLine } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { categoryToKind, GarmentThumb } from "@/components/products/GarmentThumb";

export function CartLineRow({ item, onNavigate }: { item: DetailedLine; onNavigate?: () => void }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const { product, variant, line } = item;
  const max = Math.max(1, Math.min(20, item.stock || 20));

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={product ? `/products/${product.id}` : "#"}
        onClick={onNavigate}
        className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-linen"
      >
        {product && (
          <GarmentThumb
            kind={categoryToKind(product.category)}
            color={variant?.colorHex ?? "#ccc"}
            className="h-20 w-16"
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{product?.name ?? "Loading…"}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-taupe">
              <span
                className="inline-block h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: variant?.colorHex ?? "#ddd" }}
              />
              {line.color} · Size {line.size}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium tabular-nums">
            {item.unavailable ? "—" : formatPrice(item.lineTotalCents)}
          </p>
        </div>
        {item.unavailable && (
          <p className="mt-1 text-xs text-red-700">No longer available. Remove it to continue.</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex h-8 items-center rounded-full border border-black/15">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="grid h-8 w-8 place-items-center text-charcoal hover:text-ink"
              onClick={() => setQuantity(item.key, line.quantity - 1)}
            >
              −
            </button>
            <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={line.quantity >= max}
              className="grid h-8 w-8 place-items-center text-charcoal hover:text-ink disabled:opacity-30"
              onClick={() => setQuantity(item.key, Math.min(max, line.quantity + 1))}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            className="text-xs text-taupe underline-offset-4 hover:text-ink hover:underline"
          >
            Remove
          </button>
        </div>
        {product && line.quantity >= max && item.stock > 0 && (
          <p className="mt-1 text-[11px] text-amber-700">Maximum available quantity</p>
        )}
      </div>
    </li>
  );
}
