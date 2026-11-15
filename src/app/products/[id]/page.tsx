import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductDetail } from "@/components/products/ProductDetail";
import { getProduct, listProducts } from "@/services/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product ? `${product.name} — VELORA` : "Not found — VELORA" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = (await listProducts())
    .filter((p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-sm text-taupe" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-ink">Shop all</Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
        <ProductDetail product={product} />
        {related.length > 0 && (
          <section className="mt-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-taupe">Complete the look</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Wear it with</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
