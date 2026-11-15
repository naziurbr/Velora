import { NextRequest } from "next/server";
import { z } from "zod";
import { getProductsByIds, listProducts } from "@/services/products";
import { applyFilters, DEFAULT_FILTERS } from "@/utils/filters";

export const dynamic = "force-dynamic";

const num = z.coerce.number().min(0).optional();

const querySchema = z.object({
  ids: z.string().optional(),
  q: z.string().optional(),
  gender: z.enum(["men", "women", "unisex"]).optional(),
  category: z.enum(["shirts", "t-shirts", "pants", "jackets"]).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  minPrice: num,
  maxPrice: num,
  new: z.enum(["1", "true"]).optional(),
  featured: z.enum(["1", "true"]).optional(),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }
  const p = parsed.data;

  if (p.ids !== undefined) {
    const ids = p.ids.split(",").filter(Boolean).slice(0, 50);
    return Response.json({ products: await getProductsByIds(ids) });
  }

  const all = await listProducts();
  const products = applyFilters(all, {
    ...DEFAULT_FILTERS,
    q: p.q ?? "",
    gender: p.gender ?? "all",
    category: p.category ?? "all",
    size: p.size ?? null,
    color: p.color ?? null,
    brand: p.brand ?? null,
    minPrice: p.minPrice ?? null,
    maxPrice: p.maxPrice ?? null,
    onlyNew: !!p.new,
    onlyFeatured: !!p.featured,
  });
  return Response.json({ products });
}
