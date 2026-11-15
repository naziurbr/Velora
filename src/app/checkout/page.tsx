import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Checkout — VELORA" };

export default function CheckoutPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-display text-4xl">Checkout</h1>
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}
