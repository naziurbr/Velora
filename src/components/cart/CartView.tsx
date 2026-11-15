"use client";

import Link from "next/link";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { CartLineRow } from "./CartLineRow";

export function CartView() {
  const { lines, subtotalCents, ready, itemCount, error, retry } = useCartDetails();
  const clear = useCartStore((s) => s.clear);
  const blocked = lines.some((l) => l.unavailable);

  if (!ready) return <p className="py-24 text-center text-sm text-taupe">Loading your cart…</p>;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <p className="max-w-sm text-sm text-charcoal/70">Nothing here yet. Take a walk along the rail and see what catches your eye.</p>
        <Link href="/closet" className="mt-2 rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-charcoal">
          Open the closet
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div>
        {error && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            <span>{error}</span>
            <button type="button" onClick={retry} className="font-medium underline">Retry</button>
          </div>
        )}
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {lines.map((l) => (
            <CartLineRow key={l.key} item={l} />
          ))}
        </ul>
        <button onClick={clear} className="mt-4 text-sm text-taupe underline-offset-4 hover:text-ink hover:underline">
          Clear cart
        </button>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-black/10 bg-white/60 p-7 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-charcoal/70">Items ({itemCount})</dt>
            <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal/70">Shipping</dt>
            <dd className="text-charcoal/70">Free</dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-4 text-base font-medium">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
          </div>
        </dl>
        {blocked ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
            Some items are no longer available. Remove them to continue.
          </p>
        ) : (
          <Link
            href="/checkout"
            className="mt-6 grid h-12 place-items-center rounded-full bg-ink text-sm font-medium text-cream hover:bg-charcoal"
          >
            Proceed to checkout
          </Link>
        )}
        <Link href="/closet" className="mt-3 block text-center text-sm text-taupe underline-offset-4 hover:text-ink hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
