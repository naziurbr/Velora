import { NextRequest } from "next/server";
import { getProduct } from "@/services/products";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = await getProduct(id);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ product });
}
