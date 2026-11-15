import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { createProductModelUploadIntent, ImageStorageError } from "@/services/cloudinary";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });

  const { id } = await ctx.params;
  if (!/^[a-z0-9-]{1,100}$/i.test(id)) return Response.json({ error: "Product not found." }, { status: 404 });
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Provide the model filename and file size." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("filename" in body) ||
    typeof body.filename !== "string" ||
    !("size" in body) ||
    typeof body.size !== "number"
  ) {
    return Response.json({ error: "Provide the model filename and file size." }, { status: 400 });
  }

  try {
    const intent = createProductModelUploadIntent(id, body.filename, body.size);
    return Response.json(intent, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ImageStorageError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("admin model upload signing failed", error);
    return Response.json({ error: "Could not prepare the 3D model upload." }, { status: 500 });
  }
}
