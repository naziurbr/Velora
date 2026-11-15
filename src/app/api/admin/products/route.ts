import { NextRequest } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { createProductSchema } from "@/lib/admin-validation";
import { createAdminProduct, listAdminProducts } from "@/services/admin";
import { ImageStorageError, uploadProductImage } from "@/services/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    return Response.json({ products: await listAdminProducts() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin product listing failed", error);
    return Response.json({ error: "Could not load products." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 4 * 1024 * 1024 + 64 * 1024) {
    return Response.json({ error: "Choose an image smaller than 4 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Upload product details and an image." }, { status: 400 });
  }
  const rawProduct = form.get("product");
  const imageFile = form.get("image");
  if (typeof rawProduct !== "string" || !(imageFile instanceof File)) {
    return Response.json({ error: "Upload product details and an image." }, { status: 400 });
  }
  let body: unknown;
  try {
    body = JSON.parse(rawProduct);
  } catch {
    return Response.json({ error: "Product details must be valid JSON." }, { status: 400 });
  }
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Product details are invalid." }, { status: 400 });
  }
  try {
    const image = await uploadProductImage(imageFile);
    const id = await createAdminProduct(parsed.data, image);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageStorageError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (isUniqueViolation(error)) return Response.json({ error: "That product or variant SKU is already in use." }, { status: 409 });
    console.error("admin product creation failed", error);
    return Response.json({ error: "Could not create the product." }, { status: 500 });
  }
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
