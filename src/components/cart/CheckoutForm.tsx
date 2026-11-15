"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation";
import { useCartStore } from "@/store/cart";
import { categoryToKind, GarmentThumb } from "@/components/products/GarmentThumb";

const fields: { name: keyof CheckoutFormValues; label: string; type?: string; autoComplete: string; span?: boolean }[] = [
  { name: "name", label: "Full name", autoComplete: "name", span: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: true },
  { name: "address", label: "Street address", autoComplete: "street-address", span: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name", span: true },
];

export function CheckoutForm() {
  const router = useRouter();
  const clear = useCartStore((s) => s.clear);
  const { lines, subtotalCents, ready, error: cartError, retry: retryCart } = useCartDetails();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", email: "", address: "", city: "", postalCode: "", country: "" },
  });

  const blocked = lines.some((l) => l.unavailable);

  const onSubmit = async (values: CheckoutFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: values,
          items: lines.map((l) => ({
            productId: l.line.productId,
            size: l.line.size,
            color: l.line.color,
            quantity: l.line.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      clear();
      router.push(`/orders/${data.order.id}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  if (!ready) return <p className="py-24 text-center text-sm text-taupe">Loading…</p>;
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-display text-3xl">Nothing to check out</p>
        <Link href="/closet" className="rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-charcoal">
          Open the closet
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <section>
          <h2 className="font-display text-2xl">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
                <label htmlFor={f.name} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  type={f.type ?? "text"}
                  autoComplete={f.autoComplete}
                  aria-invalid={!!errors[f.name]}
                  {...register(f.name)}
                  className={`h-12 w-full rounded-2xl border bg-white/70 px-4 text-sm outline-none transition-colors focus:border-ink ${
                    errors[f.name] ? "border-red-500" : "border-black/15"
                  }`}
                />
                {errors[f.name] && <p className="mt-1.5 text-xs text-red-700">{errors[f.name]?.message}</p>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment</h2>
          <div className="mt-5 rounded-2xl border border-black/15 bg-white/70 p-5 text-sm">
            <p className="font-medium">Pay on delivery</p>
            <p className="mt-1 text-charcoal/70">
              Online card payments are coming in Phase 2. For now, your order is reserved and you pay when it arrives.
            </p>
          </div>
        </section>

        {cartError && (
          <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            {cartError}{" "}
            <button type="button" onClick={retryCart} className="font-medium underline">Retry</button>
          </p>
        )}

        {serverError && (
          <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            {serverError}{" "}
            <Link href="/cart" className="underline">Review cart</Link>
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || blocked}
          className="h-13 w-full rounded-full bg-ink py-4 text-sm font-medium text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Placing order…" : `Place order · ${formatPrice(subtotalCents)}`}
        </button>
      </form>

      <aside className="h-fit rounded-[1.75rem] border border-black/10 bg-white/60 p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Order summary</h2>
        <ul className="mt-5 divide-y divide-black/10">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3 py-3">
              <div className="grid h-16 w-14 shrink-0 place-items-center rounded-xl bg-linen">
                {l.product && (
                  <GarmentThumb kind={categoryToKind(l.product.category)} color={l.variant?.colorHex ?? "#ccc"} className="h-14 w-11" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.product?.name}</p>
                <p className="text-xs text-taupe">
                  {l.line.color} · {l.line.size} · Qty {l.line.quantity}
                </p>
                {l.unavailable && <p className="text-xs text-red-700">Unavailable</p>}
              </div>
              <p className="text-sm tabular-nums">{l.unavailable ? "—" : formatPrice(l.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-charcoal/70">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt className="text-charcoal/70">Shipping</dt><dd className="text-charcoal/70">Free</dd></div>
          <div className="flex justify-between pt-2 text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(subtotalCents)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
