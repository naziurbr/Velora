import { NextRequest } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/upload-limits";
import { updateAdminProductImage } from "@/services/admin";
import { ImageStorageError, uploadProductImage } from "@/services/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PRODUCT_IMAGE_BYTES + 64 * 1024) {
    return Response.json({ error: "Choose an image smaller than 4 MB." }, { status: 413 });
  }

  const { id } = await ctx.params;
  if (!/^[a-z0-9-]{1,100}$/i.test(id)) return Response.json({ error: "Product not found." }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Upload an image file." }, { status: 400 });
  }
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Upload an image file." }, { status: 400 });

  try {
    const image = await uploadProductImage(file);
    const updated = await updateAdminProductImage(id, image);
    if (!updated) return Response.json({ error: "Product not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ImageStorageError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("admin product image update failed", error);
    return Response.json({ error: "Could not save this product image." }, { status: 500 });
  }
}
