import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WishlistView } from "@/components/products/WishlistView";
import { listProducts } from "@/services/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your wishlist — VELORA" };

export default async function WishlistPage() {
  const products = await listProducts();

  return (
    <>
      <main className="mx-auto min-h-[55vh] max-w-6xl px-5 pb-12 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">A little inspiration</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Your wishlist</h1>
        <div className="mt-8">
          <WishlistView products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
