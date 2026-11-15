import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { GarmentThumb } from "@/components/products/GarmentThumb";
import { ProductCard } from "@/components/products/ProductCard";
import { listProducts } from "@/services/products";

export const dynamic = "force-dynamic";

/**
 * PHOTO SLOTS
 * Files live in /public/images. Set a path to show a photo, or null to keep the garment drawing.
 * Hero: landscape is fine. Category tiles and edit: use portrait photos (about 1200 x 1500).
 */
const IMAGES: Record<"hero" | "women" | "men" | "unisex" | "edit", string | null> = {
  hero: "/images/hero.jpg",
  women: "/images/women.jpg",
  men: "/images/men.jpg",
  unisex: "/images/unisex.jpg",
  edit: "/images/edit.jpg",
};

const HERO_RAIL = [
  { kind: "jacket", color: "#b59a72", delay: "0s" },
  { kind: "shirt", color: "#a9c1d9", delay: "-1.4s" },
  { kind: "tshirt", color: "#1c1c1c", delay: "-2.6s" },
  { kind: "pants", color: "#33353a", delay: "-0.8s" },
] as const;

// Same three destinations as before.
const CATEGORY_TILES = [
  { href: "/category/women", label: "Women", kind: "shirt", color: "#a9c1d9", bg: "bg-[#e6dccb]", image: IMAGES.women },
  { href: "/category/men", label: "Men", kind: "jacket", color: "#b59a72", bg: "bg-[#ddd3c1]", image: IMAGES.men },
  { href: "/category/unisex", label: "Unisex", kind: "pants", color: "#33353a", bg: "bg-[#d4cbb9]", image: IMAGES.unisex },
] as const;

// Placeholder copy: replace with your real policies, or delete.
const TRUST = [
  { label: "Free shipping over $100", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01" },
  { label: "30-day returns", icon: "M4 12a8 8 0 1 0 3-6.2M4 4v4h4" },
  { label: "Secure checkout", icon: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3" },
  { label: "Considered materials", icon: "M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l7-7" },
];

// Placeholder copy: edit to match your brand.
const CRAFT = [
  ["Fabric", "Natural fibers chosen for how they drape, breathe and wear across a long working day."],
  ["Fit", "Clean, structured silhouettes that hold their shape from the first meeting to the last train home."],
  ["Finish", "Considered stitching, honest buttons and details that stay sharp wash after wash."],
];

const CAPSULE_ORDER = ["shirts", "pants", "jackets", "t-shirts"] as const;

const eyebrow = "text-[11px] font-medium uppercase tracking-[0.2em] text-taupe";
const h2 = "font-display text-4xl tracking-[-0.02em] sm:text-5xl";
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";
const textLink = `text-sm text-charcoal/70 underline-offset-4 transition-colors hover:text-ink hover:underline ${focus}`;

export default async function HomePage() {
  const products = await listProducts();
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);

  const capsule = CAPSULE_ORDER.map((slug) => products.find((p) => p.category === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const materials = Array.from(new Set(products.map((p) => p.material).filter(Boolean))).slice(0, 6);

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-black/10 bg-linen">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_38%,rgba(255,255,255,0.75),rgba(255,255,255,0)_62%)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:py-24">
            <div className="animate-rise">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-taupe sm:text-[11px]">
                VELORA · Autumn / Winter
              </p>
              <h1 className="mt-5 max-w-[11ch] font-display text-4xl leading-[0.96] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-[5.75rem]">
                A wardrobe,
                <br />
                chosen with feeling.
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-charcoal/80 sm:text-[17px]">
                Thoughtful essentials and easy layers, made for the days that make up a life. Find your
                next favorite on the collection or meet it from every angle on our 3D rail.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-x-8 sm:gap-y-4">
                <Link
                  href="/shop"
                  className={`inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-cream transition-colors hover:bg-charcoal sm:h-14 sm:w-auto sm:px-9 ${focus}`}
                >
                  Shop the collection
                </Link>
                <Link
                  href="/closet"
                  className={`border-b border-ink pb-1 text-sm font-medium transition-colors hover:text-taupe ${focus}`}
                >
                  Explore the 3D closet →
                </Link>
              </div>
            </div>

            {IMAGES.hero ? (
              <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl animate-rise overflow-hidden rounded-2xl [animation-delay:150ms]">
                <Image
                  src={IMAGES.hero}
                  alt="VELORA Autumn / Winter collection"
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-[75%_center]"
                />
              </div>
            ) : (
              /* CSS rail teaser */
              <div className="relative mx-auto h-[430px] w-full max-w-2xl animate-rise [animation-delay:150ms] lg:h-[520px]" aria-hidden>
                <div className="absolute inset-x-0 top-6 h-2 rounded-full bg-gradient-to-b from-neutral-500 to-neutral-800 shadow-[0_8px_14px_rgba(0,0,0,0.22)]" />
                <div className="absolute inset-x-0 top-9 flex justify-around px-2">
                  {HERO_RAIL.map((g) => (
                    <div key={g.kind} className="animate-sway" style={{ animationDelay: g.delay }}>
                      <GarmentThumb
                        kind={g.kind}
                        color={g.color}
                        className="h-[300px] w-[140px] drop-shadow-[0_24px_18px_rgba(0,0,0,0.22)] lg:h-[370px] lg:w-[172px]"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-6 bottom-8 h-8 rounded-[50%] bg-black/15 blur-xl" />
                <p className="absolute bottom-0 right-0 text-xs tracking-wide text-charcoal/60">← Drag to explore →</p>
              </div>
            )}
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-b border-black/10">
          <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-4 px-4 py-6 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm text-charcoal/80">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="shrink-0 text-taupe" aria-hidden>
                  <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.label}
              </li>
            ))}
          </ul>
        </section>

        {/* Shop by category */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={eyebrow}>Find your point of view</p>
              <h2 className={`mt-3 ${h2}`}>Pieces for every kind of day.</h2>
            </div>
            <Link href="/shop" className={textLink}>
              Shop all pieces →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group relative flex h-[300px] items-end overflow-hidden rounded-2xl transition-shadow hover:shadow-[0_24px_40px_-20px_rgba(0,0,0,0.35)] sm:h-[360px] md:h-[440px] ${focus} ${tile.bg}`}
              >
                {tile.image ? (
                  <>
                    <Image
                      src={tile.image}
                      alt={`${tile.label} collection`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </>
                ) : (
                  <div aria-hidden className="absolute inset-x-0 top-8 flex justify-center">
                    <GarmentThumb
                      kind={tile.kind}
                      color={tile.color}
                      className="h-[300px] w-[150px] drop-shadow-[0_20px_14px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className={`relative flex w-full items-end justify-between p-8 ${tile.image ? "text-white" : ""}`}>
                  <span className="font-display text-4xl tracking-[-0.02em]">{tile.label}</span>
                  <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New arrivals */}
        {fresh.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
            <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={eyebrow}>Just in</p>
                <h2 className={`mt-3 ${h2}`}>New arrivals</h2>
              </div>
              <Link href="/shop" className={textLink}>
                Discover the full collection →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {fresh.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Editorial */}
        <section className="border-y border-black/10 bg-linen">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-20 md:py-28">
            {IMAGES.edit ? (
              <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[420px] md:h-[560px]">
                <Image
                  src={IMAGES.edit}
                  alt="The Workweek Edit"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div aria-hidden className="relative flex h-[320px] items-end justify-center gap-2 overflow-hidden rounded-2xl bg-[#e6dccb] pb-8 sm:h-[420px] md:h-[520px]">
                <GarmentThumb kind="shirt" color="#a9c1d9" className="h-[220px] w-[110px] -rotate-3 drop-shadow-[0_20px_14px_rgba(0,0,0,0.2)] sm:h-[280px] sm:w-[140px] md:h-[300px] md:w-[150px]" />
                <GarmentThumb kind="jacket" color="#33353a" className="z-10 -mx-6 h-[280px] w-[140px] drop-shadow-[0_24px_16px_rgba(0,0,0,0.25)] sm:h-[340px] sm:w-[170px] md:h-[370px] md:w-[185px]" />
                <GarmentThumb kind="pants" color="#b59a72" className="h-[220px] w-[110px] rotate-3 drop-shadow-[0_20px_14px_rgba(0,0,0,0.2)] sm:h-[280px] sm:w-[140px] md:h-[300px] md:w-[150px]" />
              </div>
            )}
            <div>
              <p className={eyebrow}>The Workweek Edit</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.02em] sm:text-5xl md:text-6xl">
                Dressed for the room before you walk in.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal/80 sm:text-[17px]">
                Structured shirts, tailored trousers and layers that move from the desk to dinner without a change.
                Pieces chosen to work together, so getting dressed is the easiest decision of the day.
              </p>
              <Link
                href="/shop"
                className={`mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-medium text-cream transition-colors hover:bg-charcoal sm:mt-9 sm:h-14 sm:px-9 ${focus}`}
              >
                Shop the edit
              </Link>
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
            <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={eyebrow}>Most loved</p>
                <h2 className={`mt-3 ${h2}`}>Featured pieces</h2>
              </div>
              <Link href="/shop" className={textLink}>
                Shop all pieces →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Work wardrobe */}
        {capsule.length >= 2 && (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
            <div className="mb-8 max-w-xl md:mb-10">
              <p className={eyebrow}>The work wardrobe</p>
              <h2 className={`mt-3 ${h2}`}>One of each. Everything you need.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-charcoal/75">
                A shirt, trousers and a jacket that mix and match, so a week of looks starts with four pieces.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {capsule.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Craft */}
        <section className="border-y border-black/10 bg-linen">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
            <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
              <div>
                <p className={eyebrow}>Craft</p>
                <h2 className={`mt-4 ${h2}`}>Made to be worn, and worn again.</h2>
                {materials.length > 0 && (
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {materials.map((m) => (
                      <li key={m} className="rounded-full border border-black/15 px-4 py-2 text-xs text-charcoal/80">
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <dl className="grid gap-8 sm:grid-cols-3">
                {CRAFT.map(([title, text]) => (
                  <div key={title} className="border-t border-ink pt-5">
                    <dt className="font-display text-2xl">{title}</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-charcoal/75">{text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Brand story */}
        <section className="bg-ink text-cream">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-end md:py-32">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/60">A little more VELORA</p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-[1.02] tracking-[-0.02em] sm:text-5xl md:text-6xl">
                Everyday pieces. A little more considered.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-6">
              <p className="max-w-lg text-[15px] leading-relaxed text-cream/75 sm:text-[17px]">
                We bring together tactile fabrics, easy silhouettes, and thoughtful details worth keeping
                around. A wardrobe should feel like yours, not like a passing moment.
              </p>
              <Link
                href="/about"
                className="border-b border-cream pb-1 text-sm transition-colors hover:text-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                Our point of view
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}