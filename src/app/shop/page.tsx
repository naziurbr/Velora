import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { listProducts } from "@/services/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop all — VELORA" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, products] = await Promise.all([searchParams, listProducts()]);

  return (
    <>
      <main className="mx-auto max-w-[1180px] px-5 pb-14 pt-8 sm:px-6 sm:pt-10">
        <CatalogGrid products={products} initialQuery={q ?? ""} />
      </main>
      <Footer />
    </>
  );
}
