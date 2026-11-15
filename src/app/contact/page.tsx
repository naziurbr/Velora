import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Contact us — VELORA" };

const SUPPORT_EMAIL = "hello@velora.store";

export default function ContactPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">We’re here to help</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:gap-20">
          <div>
            <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">A question, a thought, a hello.</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/75">
              For help with an order, a piece, or anything else, get in touch with our customer-care team.
              We’ll be glad to hear from you.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("A note for VELORA")}`}
              className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-ink pr-1 text-sm font-medium hover:text-taupe focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Email customer care
              <span aria-hidden>↗</span>
            </a>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-taupe">
              This opens your email app; no message is sent until you review and send it. Replace this
              sample mailbox with your live support address before launch: {SUPPORT_EMAIL}.
            </p>
          </div>
          <aside className="h-fit border-t border-black/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">A few quick answers</p>
            <div className="mt-6 space-y-5">
              <div>
                <h2 className="font-display text-xl">An order question?</h2>
                <p className="mt-1 text-sm leading-relaxed text-charcoal/70">Include your order number in your email so we can help more quickly.</p>
              </div>
              <div>
                <h2 className="font-display text-xl">Looking for a size?</h2>
                <p className="mt-1 text-sm leading-relaxed text-charcoal/70">Product pages show the available sizes and fabric details for each piece.</p>
              </div>
            </div>
            <Link href="/faq" className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-taupe">
              Visit frequently asked questions
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
