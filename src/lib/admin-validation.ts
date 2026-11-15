import { z } from "zod";
import { CATEGORY_LABELS, GENDER_LABELS, SIZES } from "@/types/product";

const categorySchema = z.enum(["shirts", "t-shirts", "pants", "jackets"]);
const genderSchema = z.enum(["men", "women", "unisex"]);

const productFields = {
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(2000),
  priceCents: z.number().int().min(1).max(100_000_000),
  category: categorySchema,
  gender: genderSchema,
  brand: z.string().trim().min(1).max(100),
  material: z.string().trim().min(1).max(200),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
};

export const createProductSchema = z.object({
  ...productFields,
  sku: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
  sizes: z.array(z.enum(SIZES)).min(1).max(SIZES.length),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      }),
    )
    .min(1)
    .max(10),
  initialStock: z.number().int().min(0).max(100_000),
}).superRefine((value, ctx) => {
  if (new Set(value.sizes).size !== value.sizes.length) {
    ctx.addIssue({ code: "custom", path: ["sizes"], message: "Sizes must not be repeated." });
  }
  if (new Set(value.colors.map((color) => color.name.toLowerCase())).size !== value.colors.length) {
    ctx.addIssue({ code: "custom", path: ["colors"], message: "Color names must not be repeated." });
  }
});

export const updateProductSchema = z.object({
  ...productFields,
  variants: z.array(
    z.object({
      id: z.number().int().positive(),
      stock: z.number().int().min(0).max(100_000),
    }),
  ).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export const adminProductOptions = {
  categories: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  genders: Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label })),
  sizes: [...SIZES],
};
