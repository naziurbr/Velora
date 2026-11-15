"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const hydrated = useCartStore((s) => s.hydrated);
  const itemCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  const navLink = (active: boolean) =>
    `text-sm tracking-wide transition-colors ${active ? "text-ink" : "text-charcoal/70 hover:text-ink"}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-cream/95">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center text-ink md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="text-xl" aria-hidden>{menuOpen ? "×" : "☰"}</span>
        </button>
        <Link href="/" className="flex items-center gap-2.5" aria-label="VELORA home">
          <span className="font-display text-xl tracking-[0.18em]">VELORA</span>
        </Link>

        <nav className="ml-7 hidden items-center gap-6 md:flex" aria-label="Primary">
          <Link className={navLink(pathname === "/shop")} href="/shop">Shop all</Link>
          <Link className={navLink(pathname === "/category/men")} href="/category/men">Men</Link>
          <Link className={navLink(pathname === "/category/women")} href="/category/women">Women</Link>
          <Link className={navLink(pathname === "/category/unisex")} href="/category/unisex">Unisex</Link>
          <Link className={navLink(pathname === "/closet")} href="/closet">3D closet</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <form
            onSubmit={submit}
            className={`items-center overflow-hidden rounded-full border border-black/10 bg-white/60 transition-all ${
              searchOpen
                ? "absolute left-4 right-4 top-[calc(100%+0.5rem)] z-50 flex h-11 w-auto shadow-soft lg:static lg:left-auto lg:right-auto lg:top-auto lg:z-auto lg:h-9 lg:w-64 lg:shadow-none"
                : "hidden w-64 lg:flex"
            }`}
            role="search"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection…"
              aria-label="Search"
              className="h-9 w-full bg-transparent pl-4 pr-1 text-sm outline-none placeholder:text-taupe"
            />
            <button type="submit" aria-label="Search" className="grid h-9 w-9 shrink-0 place-items-center text-charcoal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <button
            type="button"
            className={`${searchOpen ? "hidden" : "grid"} h-9 w-9 place-items-center rounded-full text-charcoal hover:bg-black/5 lg:hidden`}
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Toggle search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href="/wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-full text-charcoal hover:bg-black/5"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <path d="M20.8 8.8c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" strokeLinejoin="round" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] text-cream">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            className="relative flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm text-cream transition-colors hover:bg-charcoal"
            aria-label={`Open cart${hydrated ? `, ${itemCount} items` : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            <span className="min-w-4 text-center text-xs tabular-nums">{hydrated ? itemCount : 0}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-black/10 bg-cream px-5 py-5 md:hidden" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              ["/shop", "Shop all"],
              ["/category/men", "Men"],
              ["/category/women", "Women"],
              ["/category/unisex", "Unisex"],
              ["/closet", "Explore the 3D closet"],
              ["/wishlist", "Wishlist"],
              ["/about", "Our story"],
              ["/faq", "FAQs"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={closeMenu} className={navLink(pathname === href)}>
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
