import { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listAdminOrders } from "@/services/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    return Response.json({ orders: await listAdminOrders() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin order listing failed", error);
    return Response.json({ error: "Could not load orders." }, { status: 500 });
  }
}
