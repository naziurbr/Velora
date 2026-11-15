import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/format";
import { getOrder } from "@/services/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order confirmation — VELORA",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data) notFound();
  const { order, items, payment } = data;

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-cream">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="mt-6 font-display text-4xl">Thank you, {order.name.split(" ")[0]}.</h1>
          <p className="mt-3 text-sm text-charcoal/70">
            Your order <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span> is confirmed. Keep this page for your order details.
          </p>
        </div>

        <section className="mt-10 rounded-[1.75rem] border border-black/10 bg-white/60 p-7 shadow-soft">
          <ul className="divide-y divide-black/10">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-taupe">{i.color} · {i.size} · Qty {i.quantity}</p>
                </div>
                <p className="tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-taupe">Delivering to</p>
              <p className="mt-1.5 leading-relaxed">
                {order.name}<br />{order.address}<br />{order.postalCode} {order.city}<br />{order.country}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-taupe">Payment</p>
              <p className="mt-1.5">
                {payment?.provider === "pay_on_delivery" ? "Pay on delivery" : payment?.provider}
                <br />
                <span className="text-taupe capitalize">{payment?.status}</span>
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/closet" className="inline-flex h-12 items-center rounded-full bg-ink px-8 text-sm text-cream hover:bg-charcoal">
            Keep browsing
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
