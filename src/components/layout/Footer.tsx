import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-linen">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-display text-xl tracking-[0.18em]">VELORA</Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal/70">
            Considered pieces for the everyday. Discover a more thoughtful way to find what you love.
          </p>
        </div>
        <nav className="flex flex-col items-start gap-3 text-sm text-charcoal/80" aria-label="Shop">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-taupe">Shop</p>
          <Link href="/shop" className="hover:text-ink">All products</Link>
          <Link href="/category/women" className="hover:text-ink">Women</Link>
          <Link href="/category/men" className="hover:text-ink">Men</Link>
          <Link href="/category/unisex" className="hover:text-ink">Unisex</Link>
          <Link href="/closet" className="hover:text-ink">Explore the 3D closet</Link>
        </nav>
        <nav className="flex flex-col items-start gap-3 text-sm text-charcoal/80" aria-label="Your account">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-taupe">Your order</p>
          <Link href="/cart" className="hover:text-ink">Cart</Link>
          <Link href="/checkout" className="hover:text-ink">Checkout</Link>
          <Link href="/wishlist" className="hover:text-ink">Wishlist</Link>
        </nav>
        <nav className="flex flex-col items-start gap-3 text-sm text-charcoal/80" aria-label="About VELORA">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-taupe">VELORA</p>
          <Link href="/about" className="hover:text-ink">Our story</Link>
          <Link href="/faq" className="hover:text-ink">Frequently asked questions</Link>
          <Link href="/contact" className="hover:text-ink">Contact & support</Link>
        </nav>
      </div>
      <div className="border-t border-black/10">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-taupe">© {new Date().getFullYear()} VELORA. Made to be worn, and worn again.</p>
      </div>
    </footer>
  );
}
