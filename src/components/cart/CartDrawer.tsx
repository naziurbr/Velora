"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { CartLineRow } from "./CartLineRow";

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const { lines, subtotalCents, ready, itemCount, error, retry } = useCartDetails();
  const blocked = lines.some((l) => l.unavailable);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-panel transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <h2 className="font-display text-xl">
            Your cart{itemCount > 0 && <span className="ml-2 text-sm text-taupe">({itemCount})</span>}
          </h2>
          <button onClick={close} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {!ready ? (
            <p className="py-10 text-center text-sm text-taupe">Loading…</p>
          ) : lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 pb-16 text-center">
              <p className="font-display text-2xl">Your cart is empty</p>
              <p className="max-w-[16rem] text-sm text-charcoal/70">
                Take a walk along the rail and pick something you love.
              </p>
              <Link
                href="/closet"
                onClick={close}
                className="rounded-full bg-ink px-6 py-3 text-sm text-cream hover:bg-charcoal"
              >
                Open the closet
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div role="alert" className="my-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-2 font-medium underline">Retry</button>
                </div>
              )}
              <ul className="divide-y divide-black/10">
                {lines.map((l) => (
                  <CartLineRow key={l.key} item={l} onNavigate={close} />
                ))}
              </ul>
            </>
          )}
        </div>

        {ready && lines.length > 0 && (
          <div className="border-t border-black/10 bg-linen/60 px-6 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm text-charcoal">Subtotal</span>
              <span className="text-xl font-medium tabular-nums">{formatPrice(subtotalCents)}</span>
            </div>
            <p className="mb-4 text-xs text-taupe">Shipping and taxes are calculated at checkout.</p>
            <div className="grid gap-2">
              <Link
                href={blocked ? "/cart" : "/checkout"}
                onClick={close}
                className="grid h-12 place-items-center rounded-full bg-ink text-sm font-medium text-cream hover:bg-charcoal"
              >
                {blocked ? "Review cart" : "Checkout"}
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="grid h-11 place-items-center rounded-full border border-black/15 text-sm hover:border-ink"
              >
                View full cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
