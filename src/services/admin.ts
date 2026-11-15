import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  inventory,
  orderItems,
  orders,
  productAssets,
  productVariants,
  products,
} from "@/db/schema";
import type { Product } from "@/types/product";
import { ensureSeeded, listProducts } from "@/services/products";
import type { z } from "zod";
import {
  createProductSchema,
  updateOrderStatusSchema,
  updateProductSchema,
} from "@/lib/admin-validation";
import type { UploadedProductImage } from "@/services/cloudinary";

export type AdminOrderStatus = z.infer<typeof updateOrderStatusSchema>["status"];
export type NewAdminProduct = z.infer<typeof createProductSchema>;
export type AdminProductUpdate = z.infer<typeof updateProductSchema>;

export async function listAdminOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  if (rows.length === 0) return [];
  const orderIds = rows.map((order) => order.id);
  const lines = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const byOrder = new Map<string, typeof lines>();
  for (const line of lines) {
    const list = byOrder.get(line.orderId) ?? [];
    list.push(line);
    byOrder.set(line.orderId, list);
  }
  return rows.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
}

export type AdminOrder = Awaited<ReturnType<typeof listAdminOrders>>[number];

export async function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!order || (order.status === "cancelled" && status !== "cancelled")) return null;

    if (order.status !== "cancelled" && status === "cancelled") {
      const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const line of lines) {
        await tx
          .insert(inventory)
          .values({ variantId: line.variantId, quantity: line.quantity })
          .onConflictDoUpdate({
            target: inventory.variantId,
            set: { quantity: sql`${inventory.quantity} + ${line.quantity}` },
          });
      }
    }

    await tx.update(orders).set({ status }).where(eq(orders.id, id));
    return { id: order.id };
  });
}

export async function listAdminProducts(): Promise<Product[]> {
  return listProducts();
}

export async function createAdminProduct(input: NewAdminProduct, image: UploadedProductImage) {
  await ensureSeeded();
  return db.transaction(async (tx) => {
    const [category] = await tx.select().from(categories).where(eq(categories.slug, input.category));
    if (!category) throw new Error("Product category is not available.");

    const id = `admin-${randomUUID()}`;
    await tx.insert(products).values({
      id,
      sku: input.sku,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      categoryId: category.id,
      gender: input.gender,
      brand: input.brand,
      material: input.material,
      isFeatured: input.isFeatured,
      isNew: input.isNew,
    });

    const variants = input.colors.flatMap((color, colorIndex) =>
      input.sizes.map((size) => ({
        productId: id,
        size,
        color: color.name,
        colorHex: color.hex,
        sku: `${input.sku}-C${String(colorIndex + 1).padStart(2, "0")}-${size}`,
      })),
    );
    const inserted = await tx.insert(productVariants).values(variants).returning({ id: productVariants.id });
    await tx.insert(inventory).values(
      inserted.map((variant) => ({ variantId: variant.id, quantity: input.initialStock })),
    );
    await tx.insert(productAssets).values({
      productId: id,
      kind: "thumbnail",
      url: image.url,
      format: image.format,
      lod: "preview",
    });
    return id;
  });
}

export async function updateAdminProductImage(id: string, image: UploadedProductImage) {
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  if (!product) return false;

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: productAssets.id })
      .from(productAssets)
      .where(and(eq(productAssets.productId, id), eq(productAssets.kind, "thumbnail")))
      .limit(1);
    if (existing) {
      await tx
        .update(productAssets)
        .set({ kind: "thumbnail", url: image.url, format: image.format, lod: "preview" })
        .where(eq(productAssets.id, existing.id));
    } else {
      await tx.insert(productAssets).values({
        productId: id,
        kind: "thumbnail",
        url: image.url,
        format: image.format,
        lod: "preview",
      });
    }
  });
  return true;
}

export async function updateAdminProduct(id: string, input: AdminProductUpdate) {
  return db.transaction(async (tx) => {
    const [category] = await tx.select().from(categories).where(eq(categories.slug, input.category));
    if (!category) return false;

    const variantIds = input.variants.map((variant) => variant.id);
    if (new Set(variantIds).size !== variantIds.length) return false;
    const matchingVariants = variantIds.length
      ? await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.productId, id))
      : [];
    if (matchingVariants.length !== variantIds.length || !variantIds.every((variantId) => matchingVariants.some((variant) => variant.id === variantId))) {
      return false;
    }

    const updated = await tx
      .update(products)
      .set({
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        categoryId: category.id,
        gender: input.gender,
        brand: input.brand,
        material: input.material,
        isFeatured: input.isFeatured,
        isNew: input.isNew,
      })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    if (updated.length === 0) return false;

    for (const variant of input.variants) {
      await tx
        .insert(inventory)
        .values({ variantId: variant.id, quantity: variant.stock })
        .onConflictDoUpdate({
          target: inventory.variantId,
          set: { quantity: variant.stock },
        });
    }
    return true;
  });
}

export async function deleteAdminProduct(
  id: string,
): Promise<"deleted" | "not-found" | "has-orders" | "last-product"> {
  return db.transaction(async (tx) => {
    const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, id)).for("update");
    if (!product) return "not-found";

    const [orderItem] = await tx
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(eq(orderItems.productId, id))
      .limit(1);
    if (orderItem) return "has-orders";

    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(products);
    if (count <= 1) return "last-product";

    await tx.delete(products).where(eq(products.id, id));
    return "deleted";
  });
}
