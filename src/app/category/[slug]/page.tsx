import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { listProducts } from "@/services/products";
import { CATEGORY_LABELS, GENDER_LABELS, type CategorySlug, type Gender } from "@/types/product";

export const dynamic = "force-dynamic";
const genderSlugs = Object.keys(GENDER_LABELS) as Gender[];
const categorySlugs = Object.keys(CATEGORY_LABELS) as CategorySlug[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = genderSlugs.includes(slug as Gender)
    ? GENDER_LABELS[slug as Gender]
    : categorySlugs.includes(slug as CategorySlug)
      ? CATEGORY_LABELS[slug as CategorySlug]
      : null;
  return { title: title ? `${title} — VELORA` : "Collection — VELORA" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await listProducts();
  const isGender = genderSlugs.includes(slug as Gender);
  const isCategory = categorySlugs.includes(slug as CategorySlug);
  if (!isGender && !isCategory) notFound();

  const title = isGender
    ? GENDER_LABELS[slug as Gender]
    : CATEGORY_LABELS[slug as CategorySlug];
  const description = isGender
    ? `A considered edit for ${title.toLowerCase()}. Find the pieces you’ll reach for again and again.`
    : `Explore our ${title.toLowerCase()} edit: considered shapes, tactile fabrics, and easy-to-wear pieces.`;

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-taupe">A VELORA edit</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
          <p className="max-w-sm text-sm leading-relaxed text-charcoal/70">{description}</p>
        </div>
        <div className="mt-8">
          <CatalogGrid
            products={products}
            initialGender={isGender ? slug as Gender : "all"}
            initialCategory={isCategory ? slug as CategorySlug : "all"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
