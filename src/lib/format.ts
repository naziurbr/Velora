const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(cents: number): string {
  return money.format(cents / 100);
}

export function stockLabel(stock: number): { label: string; tone: "ok" | "low" | "out" } {
  if (stock <= 0) return { label: "Sold out", tone: "out" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "low" };
  return { label: "In stock", tone: "ok" };
}
