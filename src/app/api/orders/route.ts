import { NextRequest } from "next/server";
import { orderPayloadSchema } from "@/lib/validation";
import { createOrder, OrderError } from "@/services/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 64 * 1024) {
    return Response.json({ error: "Your order request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = orderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 },
    );
  }
  try {
    const order = await createOrder(parsed.data);
    return Response.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("order failed", err);
    return Response.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}
