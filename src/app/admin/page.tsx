import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminSession } from "@/lib/admin-auth";
import { listAdminOrders, listAdminProducts } from "@/services/admin";
import { AdminPanel } from "./panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Store management — VELORA" };

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authenticated = isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  const initialData = authenticated
    ? {
        orders: await listAdminOrders(),
        products: await listAdminProducts(),
      }
    : undefined;
  return <AdminPanel authenticated={authenticated} configured={isAdminConfigured()} initialData={initialData} />;
}
