import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    gender: text("gender").notNull(),
    brand: text("brand").notNull(),
    material: text("material").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    color: text("color").notNull(),
    colorHex: text("color_hex").notNull(),
    sku: text("sku").notNull().unique(),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

export const inventory = pgTable("inventory", {
  variantId: integer("variant_id")
    .primaryKey()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
});

/** GLB models, textures and thumbnails. `lod` lets inspection models load progressively. */
export const productAssets = pgTable(
  "product_assets",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // model | texture | thumbnail
    url: text("url").notNull(),
    format: text("format").notNull().default("glb"),
    lod: text("lod").notNull().default("preview"), // preview | inspection
  },
  (t) => [index("assets_product_idx").on(t.productId)],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    variantId: integer("variant_id").notNull(),
    name: text("name").notNull(),
    size: text("size").notNull(),
    color: text("color").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("pending"),
  amountCents: integer("amount_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
