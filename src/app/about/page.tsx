import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Our story — VELORA" };

export default function AboutPage() {
  return (
    <>
      <main>
        <section className="border-b border-black/10 bg-linen">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">A note from VELORA</p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
                Less, but chosen with feeling.
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-charcoal/75">
              We believe getting dressed can be a small, daily pleasure. VELORA is a home for thoughtful
              clothes: pieces with good materials, considered lines, and a life beyond one season.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">Our point of view</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">A wardrobe that feels like yours.</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-charcoal/75">
            <p>
              A good wardrobe is not about having more. It is about finding the shirt that feels right
              from the first wear, the layer you reach for without thinking, and the details you notice
              each time you put it on.
            </p>
            <p>
              We bring together easy silhouettes, tactile fabrics, and enduring everyday forms. Each
              piece is selected to work on its own and live well with the things already in your closet.
            </p>
            <p>
              And because clothes are meant to be experienced, not just scrolled past, our 3D closet
              lets you turn a piece around and see it from another angle before making it yours.
            </p>
          </div>
        </section>

        <section className="border-y border-black/10 bg-white/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-3">
            {[
              ["Considered", "Thoughtful shapes and materials chosen to feel good in everyday life."],
              ["Wearable", "Versatile pieces that make getting dressed feel a little more like you."],
              ["Curious", "A different way to shop, with the details and dimensions in view."],
            ].map(([title, copy]) => (
              <div key={title} className="border-l border-sand pl-5">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-charcoal/70">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-14 sm:px-6 sm:py-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl">Find the pieces you’ll live in.</p>
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center bg-ink px-7 text-sm text-cream transition-colors hover:bg-charcoal">
            Explore the collection
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
