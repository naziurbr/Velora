import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Your cart — VELORA" };

export default function CartPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-display text-4xl">Your cart</h1>
        <CartView />
      </main>
      <Footer />
    </>
  );
}
