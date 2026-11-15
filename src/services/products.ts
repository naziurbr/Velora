import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  inventory,
  productAssets,
  productVariants,
  products,
} from "@/db/schema";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/db/seed-data";
import type { CategorySlug, Gender, Product, ProductVariant } from "@/types/product";
import { SIZES } from "@/types/product";

let seedPromise: Promise<void> | null = null;

/** Seeds the catalog on first use so a fresh database is immediately browsable. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function seed() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (count > 0) return;

  await db.insert(categories).values(SEED_CATEGORIES).onConflictDoNothing();
  const cats = await db.select().from(categories);
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  for (const [pi, p] of SEED_PRODUCTS.entries()) {
    await db
      .insert(products)
      .values({
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description,
        priceCents: p.price * 100,
        categoryId: catId.get(p.category)!,
        gender: p.gender,
        brand: p.brand,
        material: p.material,
        isFeatured: !!p.featured,
        isNew: !!p.isNew,
      })
      .onConflictDoNothing();

    for (const [ci, [color, hex]] of p.colors.entries()) {
      for (const [si, size] of SIZES.entries()) {
        const [variant] = await db
          .insert(productVariants)
          .values({
            productId: p.id,
            size,
            color,
            colorHex: hex,
            sku: `${p.sku}-${color.slice(0, 3).toUpperCase()}-${size}`,
          })
          .onConflictDoNothing()
          .returning({ id: productVariants.id });
        if (!variant) continue;
        const stock = [0, 2, 5, 8, 12][(pi * 7 + ci * 3 + si * 5) % 5];
        await db.insert(inventory).values({ variantId: variant.id, quantity: stock });
      }
    }
  }
}

async function loadProducts(ids?: string[]): Promise<Product[]> {
  await ensureSeeded();
  if (ids && ids.length === 0) return [];

  const rows = await db
    .select({ p: products, categorySlug: categories.slug })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(ids ? inArray(products.id, ids) : undefined)
    .orderBy(asc(products.sku));
  if (rows.length === 0) return [];
  const productIds = rows.map((r) => r.p.id);

  const [variantRows, assetRows] = await Promise.all([
    db
      .select({ v: productVariants, quantity: inventory.quantity })
      .from(productVariants)
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(inArray(productVariants.productId, productIds))
      .orderBy(asc(productVariants.id)),
    db.select().from(productAssets).where(inArray(productAssets.productId, productIds)),
  ]);

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const { v, quantity } of variantRows) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      sku: v.sku,
      stock: quantity ?? 0,
    });
    variantsByProduct.set(v.productId, list);
  }

  return rows.map(({ p, categorySlug }) => {
    const assets = assetRows.filter((a) => a.productId === p.id);
    const model =
      assets.find((a) => a.kind === "model" && a.lod === "preview") ??
      assets.find((a) => a.kind === "model");
    const thumb = assets.find((a) => a.kind === "thumbnail");
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      category: categorySlug as CategorySlug,
      gender: p.gender as Gender,
      brand: p.brand,
      material: p.material,
      modelUrl: model?.url ?? null,
      thumbnailUrl: thumb?.url ?? null,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      variants: variantsByProduct.get(p.id) ?? [],
    };
  });
}

export function listProducts(): Promise<Product[]> {
  return loadProducts();
}

export function getProductsByIds(ids: string[]): Promise<Product[]> {
  return loadProducts(ids);
}

export async function getProduct(id: string): Promise<Product | null> {
  const [p] = await loadProducts([id]);
  return p ?? null;
}
