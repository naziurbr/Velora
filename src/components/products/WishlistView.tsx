"use client";

import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/types/product";

export function WishlistView({ products }: { products: Product[] }) {
  const hydrated = useWishlistStore((state) => state.hydrated);
  const productIds = useWishlistStore((state) => state.productIds);
  const savedProducts = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-taupe" role="status">Loading your saved pieces…</p>;
  }

  if (savedProducts.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center py-16 text-center">
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M20.8 8.8c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" strokeLinejoin="round" />
        </svg>
        <p className="mt-5 font-display text-3xl">Keep the pieces you love close</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal/70">
          Save a piece to your wishlist and it will be waiting here when you return.
        </p>
        <Link href="/shop" className="mt-6 border-b border-ink pb-1 text-sm hover:text-taupe">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-sm text-charcoal/70" aria-live="polite">
        {savedProducts.length} {savedProducts.length === 1 ? "saved piece" : "saved pieces"}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {savedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
