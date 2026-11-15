import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import { productColors } from "@/utils/filters";
import { categoryToKind, GarmentThumb } from "./GarmentThumb";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  const colors = productColors(product);
  const first = colors.find((c) => c.inStock) ?? colors[0];
  return (
    <article className="group relative">
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-linen">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`}>
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <GarmentThumb
            kind={categoryToKind(product.category)}
            color={first?.hex ?? "#ccc"}
            className="h-[82%] w-auto transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">New</span>
          )}
        </div>
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>
      </div>
      <Link href={`/products/${product.id}`} className="block border-b border-black/10 py-4 transition-colors hover:border-ink">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="mt-0.5 text-xs text-taupe">{product.brand}</p>
          </div>
          <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.priceCents)}</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {colors.map((c) => (
            <span key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
          ))}
        </div>
      </Link>
    </article>
  );
}
