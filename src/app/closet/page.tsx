import type { Metadata } from "next";
import { ClosetExperience } from "@/components/closet/ClosetExperience";
import { listProducts } from "@/services/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The 3D closet — VELORA" };

export default async function ClosetPage() {
  const products = await listProducts();
  return <ClosetExperience products={products} />;
}
