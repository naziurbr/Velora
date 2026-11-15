import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Frequently asked questions — VELORA" };

const questions = [
  {
    group: "Orders",
    items: [
      ["How do I place an order?", "Choose a piece, select an available color and size, and add it to your cart. When you’re ready, continue to checkout and enter your delivery details. An on-screen order confirmation appears when your order is placed."],
      ["Can I change or cancel my order?", "Please contact customer care as soon as possible with your order number. Changes may not be possible once an order is being prepared."],
    ],
  },
  {
    group: "Shipping & returns",
    items: [
      ["How much does shipping cost?", "Shipping is currently shown as free at checkout. Any delivery details available for your order will be provided with its confirmation."],
      ["What is your return policy?", "Return eligibility and timing depend on the store’s published policy, which is not yet configured on this site. Please contact customer care before returning an item so we can advise you."],
      ["How can I ask about a delivery?", "Email customer care with your order number and we’ll help with the information available for your order."],
    ],
  },
  {
    group: "Pieces & fit",
    items: [
      ["How do I choose a size?", "Each product page lists its available sizes. If you’re between sizes or need more fit information, contact customer care before ordering."],
      ["Can I see a piece from different angles?", "Yes. Where available, choose the 3D view on a product page or visit the 3D closet to turn pieces around and explore the collection."],
      ["What are the materials?", "Fabric information is listed on each product page under the product details."],
    ],
  },
  {
    group: "Payment & support",
    items: [
      ["What payment methods can I use?", "At this time, checkout offers pay on delivery. Online card payments are not currently available."],
      ["How do I contact VELORA?", "Email our customer-care team at hello@velora.store. This is a sample contact address and should be replaced with your live support mailbox before launch."],
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">Here if you need us</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl">Frequently asked questions</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/70">
          A few helpful details about shopping with VELORA. Still wondering?{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-ink">Talk to us</Link>.
        </p>
        <div className="mt-12 space-y-10">
          {questions.map(({ group, items }) => (
            <section key={group} aria-labelledby={`faq-${group.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <h2 id={`faq-${group.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="border-b border-black/15 pb-3 font-display text-2xl">{group}</h2>
              <div>
                {items.map(([question, answer]) => (
                  <details key={question} className="group border-b border-black/10">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-sm font-medium marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                      {question}
                      <span className="font-normal text-taupe transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-charcoal/70">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-14 border-t border-black/10 pt-7">
          <p className="font-display text-2xl">Need a hand?</p>
          <p className="mt-2 text-sm text-charcoal/70">We’re happy to help with a product or an order.</p>
          <Link href="/contact" className="mt-4 inline-block border-b border-ink pb-1 text-sm hover:text-taupe">Contact customer care</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
