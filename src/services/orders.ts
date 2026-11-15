import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventory, orderItems, orders, payments, productVariants, products } from "@/db/schema";
import type { OrderPayload } from "@/lib/validation";
import { ensureSeeded } from "@/services/products";

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Creates an order. Prices and stock are always resolved on the server from
 * the database: the client only sends product / size / color / quantity.
 */
export async function createOrder(payload: OrderPayload) {
  await ensureSeeded();

  // Merge duplicate lines.
  const merged = new Map<string, OrderPayload["items"][number]>();
  for (const item of payload.items) {
    const key = `${item.productId}|${item.size}|${item.color}`;
    const cur = merged.get(key);
    if (cur) {
      cur.quantity += item.quantity;
      if (cur.quantity > 20) {
        throw new OrderError("A maximum of 20 of each item can be ordered at once.");
      }
    }
    else merged.set(key, { ...item });
  }

  return db.transaction(async (tx) => {
    const lines: {
      productId: string;
      variantId: number;
      name: string;
      size: string;
      color: string;
      unitPriceCents: number;
      quantity: number;
    }[] = [];

    for (const item of merged.values()) {
      const [row] = await tx
        .select({
          variantId: productVariants.id,
          name: products.name,
          priceCents: products.priceCents,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(
          and(
            eq(productVariants.productId, item.productId),
            eq(productVariants.size, item.size),
            eq(productVariants.color, item.color),
          ),
        );
      if (!row) throw new OrderError(`An item in your cart is no longer available.`, 404);

      const updated = await tx
        .update(inventory)
        .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
        .where(and(eq(inventory.variantId, row.variantId), gte(inventory.quantity, item.quantity)))
        .returning({ quantity: inventory.quantity });
      if (updated.length === 0) {
        throw new OrderError(
          `Sorry, “${row.name}” (${item.color}, ${item.size}) doesn't have enough stock for that quantity.`,
          409,
        );
      }

      lines.push({
        productId: item.productId,
        variantId: row.variantId,
        name: row.name,
        size: item.size,
        color: item.color,
        unitPriceCents: row.priceCents,
        quantity: item.quantity,
      });
    }

    const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents > 2_147_483_647) {
      throw new OrderError("Your order total is too high to process.");
    }
    const [order] = await tx
      .insert(orders)
      .values({ ...payload.customer, subtotalCents })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
    // Card processing is Phase 2: record a pending "pay on delivery" payment.
    await tx.insert(payments).values({
      orderId: order.id,
      provider: "pay_on_delivery",
      status: "pending",
      amountCents: subtotalCents,
    });

    return { id: order.id, subtotalCents };
  });
}

export async function getOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, id));
  return { order, items, payment: payment ?? null };
}
