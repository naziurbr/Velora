import { NextRequest } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { updateProductSchema } from "@/lib/admin-validation";
import { deleteAdminProduct, updateAdminProduct } from "@/services/admin";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const { id } = await ctx.params;
  if (!/^admin-[0-9a-f-]{36}$/i.test(id) && !/^[a-z0-9-]{1,100}$/i.test(id)) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Product details are invalid." }, { status: 400 });
  }
  try {
    const updated = await updateAdminProduct(id, parsed.data);
    if (!updated) return Response.json({ error: "Product or variants not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("admin product update failed", error);
    return Response.json({ error: "Could not update the product." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const { id } = await ctx.params;
  if (!/^[a-z0-9-]{1,100}$/i.test(id)) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    const result = await deleteAdminProduct(id);
    if (result === "not-found") return Response.json({ error: "Product not found." }, { status: 404 });
    if (result === "has-orders") {
      return Response.json({ error: "Products with order history cannot be deleted." }, { status: 409 });
    }
    if (result === "last-product") {
      return Response.json({ error: "The last product cannot be deleted." }, { status: 409 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("admin product deletion failed", error);
    return Response.json({ error: "Could not delete the product." }, { status: 500 });
  }
}
