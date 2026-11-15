import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartHydrator } from "@/components/layout/CartHydrator";
import { Header } from "@/components/layout/Header";
import { WishlistHydrator } from "@/components/layout/WishlistHydrator";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELORA — considered pieces, a more thoughtful way to shop",
  description:
    "Discover considered fashion, thoughtfully made. Browse the collection or explore every piece on our interactive 3D rail.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ec",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Header />
        {children}
        <CartDrawer />
        <CartHydrator />
        <WishlistHydrator />
      </body>
    </html>
  );
}
