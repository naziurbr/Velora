"use client";

import { useWishlistStore } from "@/store/wishlist";

export function WishlistButton({
  productId,
  productName,
  label = false,
}: {
  productId: string;
  productName: string;
  label?: boolean;
}) {
  const hydrated = useWishlistStore((state) => state.hydrated);
  const saved = useWishlistStore((state) => state.productIds.includes(productId));
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-pressed={hydrated && saved}
      aria-label={`${hydrated && saved ? "Remove" : "Save"} ${productName} ${hydrated && saved ? "from" : "to"} wishlist`}
      onClick={() => toggle(productId)}
      className={label
        ? "inline-flex min-h-10 items-center gap-2 px-3 text-sm text-charcoal transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        : "grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-cream/95 text-ink shadow-soft transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"}
      title={hydrated && saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <svg
        width={label ? "17" : "18"}
        height={label ? "17" : "18"}
        viewBox="0 0 24 24"
        fill={hydrated && saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
      >
        <path d="M20.8 8.8c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" strokeLinejoin="round" />
      </svg>
      {label && (hydrated && saved ? "Saved to wishlist" : "Save to wishlist")}
    </button>
  );
}
