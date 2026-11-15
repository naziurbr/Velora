import { NextRequest } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { updateOrderStatusSchema } from "@/lib/admin-validation";
import { updateAdminOrderStatus } from "@/services/admin";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Order not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Choose a valid order status." }, { status: 400 });
  try {
    const order = await updateAdminOrderStatus(id, parsed.data.status);
    if (!order) {
      return Response.json(
        { error: "Order not found or a cancelled order cannot be reopened." },
        { status: 404 },
      );
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("admin order update failed", error);
    return Response.json({ error: "Could not update the order." }, { status: 500 });
  }
}
