import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { productAssets, products } from "@/db/schema";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { finalizeProductModelUpload, ImageStorageError } from "@/services/cloudinary";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Provide the uploaded model details." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("publicId" in body) ||
    typeof body.publicId !== "string" ||
    !("version" in body) ||
    typeof body.version !== "number"
  ) {
    return Response.json({ error: "Provide the uploaded model details." }, { status: 400 });
  }

  try {
    const model = await finalizeProductModelUpload(id, body.publicId, body.version);
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
    if (!product) return Response.json({ error: "Product not found." }, { status: 404 });

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: productAssets.id })
        .from(productAssets)
        .where(and(eq(productAssets.productId, id), eq(productAssets.kind, "model")))
        .limit(1);
      if (existing) {
        await tx
          .update(productAssets)
          .set({ kind: "model", url: model.url, format: model.format, lod: "preview" })
          .where(eq(productAssets.id, existing.id));
      } else {
        await tx.insert(productAssets).values({
          productId: id,
          kind: "model",
          url: model.url,
          format: model.format,
          lod: "preview",
        });
      }
    });

    return Response.json({ ok: true, modelUrl: model.url });
  } catch (error) {
    if (error instanceof ImageStorageError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("admin product model save failed", error);
    return Response.json({ error: "Could not save this 3D model." }, { status: 500 });
  }
}
