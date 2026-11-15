"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS, GENDER_LABELS, SIZES } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { validateProductModelBytes } from "@/lib/product-model";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/upload-limits";
import type { AdminOrder } from "@/services/admin";

type AdminProduct = Product;
type Tab = "orders" | "products" | "inventory";
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const inputClass = "mt-1 h-10 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-medium text-charcoal/70";

export function AdminPanel({
  authenticated,
  configured,
  initialData,
}: {
  authenticated: boolean;
  configured: boolean;
  initialData?: { orders: AdminOrder[]; products: AdminProduct[] };
}) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>(initialData?.orders ?? []);
  const [products, setProducts] = useState<AdminProduct[]>(initialData?.products ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderResponse, productResponse] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);
      if (orderResponse.status === 401 || productResponse.status === 401) {
        setSignedIn(false);
        return;
      }
      const [orderData, productData] = await Promise.all([orderResponse.json(), productResponse.json()]);
      if (!orderResponse.ok) throw new Error(orderData.error ?? "Could not load orders.");
      if (!productResponse.ok) throw new Error(productData.error ?? "Could not load products.");
      setOrders(orderData.orders);
      setProducts(productData.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load store data.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (!signedIn) {
    return <AdminLogin configured={configured} onSignedIn={() => { setSignedIn(true); void loadData(); }} />;
  }

  const signOut = async () => {
    const response = await fetch("/api/admin/logout", { method: "POST" });
    if (!response.ok) {
      setError("Could not sign out. Please try again.");
      return;
    }
    setSignedIn(false);
    setOrders([]);
    setProducts([]);
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-taupe">VELORA</p>
          <h1 className="mt-2 font-display text-4xl">Store management</h1>
          <p className="mt-2 text-sm text-charcoal/65">Manage customer orders, products, and stock.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void loadData()} className="rounded-full border border-black/15 px-4 py-2 text-sm hover:bg-white">Refresh</button>
          <button onClick={() => void signOut()} className="rounded-full bg-ink px-4 py-2 text-sm text-cream hover:bg-charcoal">Sign out</button>
        </div>
      </header>

      <nav className="mt-8 flex gap-2 border-b border-black/10" aria-label="Store management">
        {(["orders", "products", "inventory"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 px-4 py-3 text-sm capitalize ${tab === value ? "border-ink font-medium" : "border-transparent text-charcoal/60"}`}
          >
            {value}
          </button>
        ))}
      </nav>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {loading && <p className="py-10 text-center text-sm text-taupe">Loading store data…</p>}
      {!loading && tab === "orders" && (
        <OrderList orders={orders} onUpdated={loadData} onError={setError} />
      )}
      {!loading && tab === "products" && (
        <ProductList products={products} onUpdated={loadData} onError={setError} />
      )}
      {!loading && tab === "inventory" && (
        <InventoryList products={products} onUpdated={loadData} onError={setError} />
      )}
      <p className="mt-10 text-xs text-charcoal/50">Showing the latest 100 orders. Customer data is private—sign out on shared devices.</p>
    </main>
  );
}

function AdminLogin({ configured, onSignedIn }: { configured: boolean; onSignedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not sign in.");
      setPassword("");
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-[1.75rem] border border-black/10 bg-white/70 p-7 shadow-soft sm:p-9">
        <p className="text-xs uppercase tracking-[0.18em] text-taupe">Private area</p>
        <h1 className="mt-3 font-display text-4xl">Store owner sign in</h1>
        <p className="mt-3 text-sm text-charcoal/65">Use your administrator account to manage the store.</p>
        {!configured ? (
          <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Admin access is not configured yet. Follow the setup steps in <code>ADMIN_SETUP.md</code>.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className={labelClass}>Username<input autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button disabled={busy} className="w-full rounded-full bg-ink px-5 py-3 text-sm text-cream disabled:opacity-50">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-charcoal/65 underline">Back to the store</Link>
      </section>
    </main>
  );
}

function OrderList({ orders, onUpdated, onError }: { orders: AdminOrder[]; onUpdated: () => Promise<void>; onError: (message: string | null) => void }) {
  const updateStatus = async (id: string, status: string) => {
    onError(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update the order.");
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not update the order.");
    }
  };

  if (orders.length === 0) return <p className="py-16 text-center text-sm text-charcoal/60">No orders have been placed yet.</p>;
  return (
    <section className="mt-6 space-y-4">
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-medium">{order.name} <span className="font-mono text-xs text-taupe">#{order.id.slice(0, 8).toUpperCase()}</span></p>
              <a className="mt-1 block text-sm underline" href={`mailto:${encodeURIComponent(order.email)}`}>{order.email}</a>
              <p className="mt-1 text-sm text-charcoal/65">{order.address}, {order.city}, {order.postalCode}, {order.country}</p>
              <p className="mt-1 text-xs text-taupe">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="min-w-40">
              <p className="text-right font-medium">{formatPrice(order.subtotalCents)}</p>
              <label className="sr-only" htmlFor={`status-${order.id}`}>Order status</label>
              <select id={`status-${order.id}`} value={ORDER_STATUSES.includes(order.status as typeof ORDER_STATUSES[number]) ? order.status : "pending"} onChange={(e) => void updateStatus(order.id, e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-black/15 bg-white px-3 text-sm capitalize">
                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-black/10 border-t border-black/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-2 text-sm">
                <span>{item.name} · {item.color} · {item.size} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-charcoal/55">Payment: pay on delivery (not processed online)</p>
        </article>
      ))}
    </section>
  );
}

function ProductList({ products, onUpdated, onError }: { products: AdminProduct[]; onUpdated: () => Promise<void>; onError: (message: string | null) => void }) {
  const [creating, setCreating] = useState(false);
  return (
    <section className="mt-6 space-y-6">
      <button onClick={() => setCreating((value) => !value)} className="rounded-full bg-ink px-5 py-3 text-sm text-cream">{creating ? "Close new product form" : "Add a product"}</button>
      {creating && <NewProductForm onCreated={async () => { setCreating(false); await onUpdated(); }} onError={onError} />}
      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => <ProductEditor key={product.id} product={product} onUpdated={onUpdated} onError={onError} />)}
      </div>
    </section>
  );
}

function ProductEditor({ product, onUpdated, onError }: { product: AdminProduct; onUpdated: () => Promise<void>; onError: (message: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [modelBusy, setModelBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.priceCents / 100));
  const [brand, setBrand] = useState(product.brand);
  const [material, setMaterial] = useState(product.material);
  const [category, setCategory] = useState(product.category);
  const [gender, setGender] = useState(product.gender);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [isNew, setIsNew] = useState(product.isNew);
  const [stocks, setStocks] = useState<Record<number, string>>(
    Object.fromEntries(product.variants.map((variant) => [variant.id, String(variant.stock)])),
  );

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, priceCents: Math.round(Number(price) * 100), brand, material, category, gender, isFeatured, isNew,
          variants: product.variants.map((variant) => ({ id: variant.id, stock: Number(stocks[variant.id]) })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save product.");
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async () => {
    if (!window.confirm(`Permanently delete "${product.name}"? Products with order history cannot be deleted.`)) return;
    onError(null);
    setDeleteBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete the product.");
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not delete the product.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    onError(null);
    setImageBusy(true);
    try {
      await uploadProductImage(product.id, imageFile);
      setImageFile(null);
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not upload this product image.");
    } finally {
      setImageBusy(false);
    }
  };

  const uploadModel = async () => {
    if (!modelFile) return;
    onError(null);
    setModelBusy(true);
    try {
      await uploadProductModel(product.id, modelFile);
      setModelFile(null);
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not upload this 3D model.");
    } finally {
      setModelBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-black/10 bg-white/65 p-5">
      <div className="flex justify-between gap-4">
        <div className="flex items-center gap-3">
          {product.thumbnailUrl && <Image src={product.thumbnailUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-xl bg-linen object-cover" />}
          <div><h2 className="font-display text-2xl">{product.name}</h2><p className="text-xs text-taupe">{product.sku} · {product.variants.length} variants</p></div>
        </div>
        <p className="shrink-0 text-sm font-medium">{formatPrice(product.priceCents)}</p>
      </div>
      <div className="mt-4 rounded-xl border border-black/10 bg-white/60 p-3">
        <label className={labelClass}>Product photo (JPG, PNG, WebP; max 4 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-linen file:px-4 file:py-2" />
        </label>
        <button type="button" onClick={() => void uploadImage()} disabled={!imageFile || imageBusy} className="mt-3 rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-50">
          {imageBusy ? "Uploading…" : product.thumbnailUrl ? "Replace photo" : "Upload photo"}
        </button>
      </div>
      <div className="mt-3 rounded-xl border border-black/10 bg-white/60 p-3">
        <p className={labelClass}>3D model (GLB or self-contained glTF; max 25 MB)</p>
        {product.modelUrl && (
          <a href={product.modelUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-charcoal/65 underline">
            Current model: {product.modelUrl.split("/").pop()}
          </a>
        )}
        <input
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          onChange={(event) => setModelFile(event.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-linen file:px-4 file:py-2"
        />
        <button type="button" onClick={() => void uploadModel()} disabled={!modelFile || modelBusy} className="mt-3 rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-50">
          {modelBusy ? "Uploading model…" : product.modelUrl ? "Replace 3D model" : "Upload 3D model"}
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>Name<input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Price (USD)<input type="number" step="0.01" min="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Brand<input required value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Material<input required value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Category<select value={category} onChange={(e) => setCategory(e.target.value as Product["category"])} className={inputClass}>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className={labelClass}>Audience<select value={gender} onChange={(e) => setGender(e.target.value as Product["gender"])} className={inputClass}>{Object.entries(GENDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <label className={`${labelClass} mt-3`}>Description<textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-3 text-sm outline-none focus:border-ink" /></label>
      <div className="mt-3 flex gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />New</label>
      </div>
      <VariantStock variants={product.variants} stocks={stocks} setStocks={setStocks} />
      <button disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm text-cream disabled:opacity-50">{busy ? "Saving…" : "Save product and stock"}</button>
      <button
        type="button"
        onClick={() => void deleteProduct()}
        disabled={busy || deleteBusy || imageBusy || modelBusy}
        className="ml-3 mt-4 rounded-full border border-red-300 px-5 py-2.5 text-sm text-red-800 disabled:opacity-50"
      >
        {deleteBusy ? "Deleting…" : "Delete product"}
      </button>
    </form>
  );
}

function VariantStock({ variants, stocks, setStocks }: { variants: Product["variants"]; stocks: Record<number, string>; setStocks: (value: Record<number, string>) => void }) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium">Stock by size and color</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {variants.map((variant) => (
          <label key={variant.id} className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm">
            <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: variant.colorHex }} />{variant.color} · {variant.size}</span>
            <input aria-label={`${variant.color} ${variant.size} stock`} type="number" min="0" max="100000" required value={stocks[variant.id] ?? "0"} onChange={(e) => setStocks({ ...stocks, [variant.id]: e.target.value })} className="h-9 w-20 rounded-lg border border-black/15 px-2 text-right" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function InventoryList({ products, onUpdated, onError }: { products: AdminProduct[]; onUpdated: () => Promise<void>; onError: (message: string | null) => void }) {
  return (
    <section className="mt-6">
      <p className="mb-4 text-sm text-charcoal/65">Adjust quantities and save each product. Stock is reduced automatically when a customer places an order.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => (
          <InventoryEditor key={product.id} product={product} onUpdated={onUpdated} onError={onError} />
        ))}
      </div>
    </section>
  );
}

function InventoryEditor({ product, onUpdated, onError }: { product: AdminProduct; onUpdated: () => Promise<void>; onError: (message: string | null) => void }) {
  const [stocks, setStocks] = useState<Record<number, string>>(
    Object.fromEntries(product.variants.map((variant) => [variant.id, String(variant.stock)])),
  );
  const [busy, setBusy] = useState(false);
  const save = async () => {
    onError(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name, description: product.description, priceCents: product.priceCents,
          brand: product.brand, material: product.material, category: product.category, gender: product.gender,
          isFeatured: product.isFeatured, isNew: product.isNew,
          variants: product.variants.map((variant) => ({ id: variant.id, stock: Number(stocks[variant.id]) })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update stock.");
      await onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not update stock.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-black/10 bg-white/65 p-5">
      <div className="flex justify-between"><div><h2 className="font-medium">{product.name}</h2><p className="text-xs text-taupe">{product.sku}</p></div><span className="text-xs text-charcoal/60">{product.variants.reduce((total, variant) => total + variant.stock, 0)} in stock</span></div>
      <VariantStock variants={product.variants} stocks={stocks} setStocks={setStocks} />
      <button onClick={() => void save()} disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm text-cream disabled:opacity-50">{busy ? "Saving…" : "Save stock"}</button>
    </article>
  );
}

function NewProductForm({ onCreated, onError }: { onCreated: () => Promise<void>; onError: (message: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [colorsText, setColorsText] = useState("Black | #1c1c1c");
  const [sizeValues, setSizeValues] = useState<string[]>([...SIZES]);
  const [form, setForm] = useState({
    name: "", sku: "", description: "", price: "", category: "shirts", gender: "unisex",
    brand: "", material: "", initialStock: "8", isFeatured: false, isNew: true,
  });
  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);
    const colors = colorsText.split(/\r?\n/).map((line) => {
      const [name, hex] = line.split("|").map((part) => part.trim());
      return { name, hex };
    });
    if (!imageFile) {
      onError("Choose a product photo before creating this product.");
      return;
    }
    if (!isProductImageSizeValid(imageFile)) {
      onError("Choose an image no larger than 4 MB.");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.set("product", JSON.stringify({
        ...form,
        priceCents: Math.round(Number(form.price) * 100),
        initialStock: Number(form.initialStock),
        sizes: sizeValues,
        colors,
      }));
      body.set("image", imageFile);
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body,
      });
      const data = await readImageUploadResponse(response, "Could not add product.");
      if (typeof data.id !== "string") throw new Error("The server returned an invalid response. Please try again.");
      let modelError: string | null = null;
      if (modelFile) {
        try {
          await uploadProductModel(data.id, modelFile);
        } catch (err) {
          modelError = err instanceof Error ? err.message : "Could not upload the 3D model.";
        }
      }
      await onCreated();
      if (modelError) {
        onError(`Product and photo were saved, but the 3D model was not: ${modelError} You can retry from the product editor.`);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not add product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white/70 p-5 sm:p-6">
      <h2 className="font-display text-2xl">Add a product</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Product name<input required minLength={2} value={form.name} onChange={(e) => change("name", e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>SKU (unique)<input required value={form.sku} onChange={(e) => change("sku", e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Price (USD)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => change("price", e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Brand<input required value={form.brand} onChange={(e) => change("brand", e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Material<input required value={form.material} onChange={(e) => change("material", e.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Category<select value={form.category} onChange={(e) => change("category", e.target.value)} className={inputClass}>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className={labelClass}>Audience<select value={form.gender} onChange={(e) => change("gender", e.target.value)} className={inputClass}>{Object.entries(GENDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className={labelClass}>Initial stock per variant<input required type="number" min="0" max="100000" value={form.initialStock} onChange={(e) => change("initialStock", e.target.value)} className={inputClass} /></label>
      </div>
      <label className={`${labelClass} mt-3`}>Description<textarea required rows={3} value={form.description} onChange={(e) => change("description", e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-3 text-sm" /></label>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Sizes</legend>
        <div className="mt-2 flex flex-wrap gap-4">{SIZES.map((size) => <label key={size} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sizeValues.includes(size)} onChange={(e) => setSizeValues((values) => e.target.checked ? [...values, size] : values.filter((value) => value !== size))} />{size}</label>)}</div>
      </fieldset>
      <label className={`${labelClass} mt-4`}>Colors (one per line: name | #hex)<textarea required rows={3} value={colorsText} onChange={(e) => setColorsText(e.target.value)} className="mt-1 w-full rounded-xl border border-black/15 bg-white p-3 font-mono text-sm" /></label>
      <label className={`${labelClass} mt-4`}>Product photo (JPG, PNG, WebP; max 4 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-linen file:px-4 file:py-2" />
      </label>
      <label className={`${labelClass} mt-4`}>Optional 3D model (GLB or self-contained glTF; max 25 MB)
        <input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" onChange={(event) => setModelFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-linen file:px-4 file:py-2" />
      </label>
      <div className="mt-4 flex gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => change("isFeatured", e.target.checked)} />Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => change("isNew", e.target.checked)} />New</label></div>
      <button disabled={busy || !imageFile} className="mt-5 rounded-full bg-ink px-5 py-3 text-sm text-cream disabled:opacity-50">{busy ? "Saving product and photo…" : "Create product"}</button>
    </form>
  );
}

async function uploadProductImage(productId: string, file: File) {
  if (!isProductImageSizeValid(file)) {
    throw new Error("Choose an image no larger than 4 MB.");
  }
  const body = new FormData();
  body.set("image", file);
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/image`, {
    method: "POST",
    body,
  });
  await readImageUploadResponse(response, "Could not upload this product image.");
}

function isProductImageSizeValid(file: File) {
  return file.size > 0 && file.size <= MAX_PRODUCT_IMAGE_BYTES;
}

async function readImageUploadResponse(response: Response, fallbackError: string) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("json")) {
    const body = await response.text();
    if (response.status === 413 || /request entity too large|payload too large/i.test(body)) {
      throw new Error("The upload is too large for the server. Choose an image no larger than 4 MB.");
    }
    throw new Error(response.ok
      ? "The upload service returned an unexpected response. Please try again."
      : `Image upload failed (HTTP ${response.status}). Please try again.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The upload service returned an invalid response. Please try again.");
  }
  if (!isRecord(data)) {
    throw new Error("The upload service returned an invalid response. Please try again.");
  }
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : fallbackError);
  }
  return data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function uploadProductModel(productId: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "glb" && extension !== "gltf") {
    throw new Error("Choose a .glb model or a self-contained .gltf model.");
  }
  if (file.size < 1 || file.size > 25 * 1024 * 1024) {
    throw new Error("Choose a 3D model smaller than 25 MB.");
  }
  await validateProductModelFile(file, extension);

  const intentResponse = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/model-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size }),
  });
  const intent = await intentResponse.json();
  if (!intentResponse.ok) throw new Error(intent.error ?? "Could not prepare the 3D model upload.");
  if (
    typeof intent.cloudName !== "string" ||
    typeof intent.apiKey !== "string" ||
    typeof intent.timestamp !== "string" ||
    typeof intent.assetFolder !== "string" ||
    typeof intent.publicId !== "string" ||
    typeof intent.signature !== "string"
  ) {
    throw new Error("The server returned an invalid upload request.");
  }

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", intent.apiKey);
  body.set("timestamp", intent.timestamp);
  body.set("asset_folder", intent.assetFolder);
  body.set("public_id", intent.publicId);
  body.set("signature", intent.signature);
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${intent.cloudName}/raw/upload`,
    { method: "POST", body },
  );
  const upload = await uploadResponse.json();
  if (
    !uploadResponse.ok ||
    typeof upload !== "object" ||
    upload === null ||
    !("public_id" in upload) ||
    upload.public_id !== intent.publicId ||
    !("version" in upload) ||
    typeof upload.version !== "number"
  ) {
    const message =
      typeof upload === "object" &&
      upload !== null &&
      "error" in upload &&
      typeof upload.error === "object" &&
      upload.error !== null &&
      "message" in upload.error &&
      typeof upload.error.message === "string"
        ? upload.error.message
        : "Cloudinary could not store the model. Check your account limits and try again.";
    throw new Error(message);
  }

  const saveResponse = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId: upload.public_id, version: upload.version }),
  });
  const saved = await saveResponse.json();
  if (!saveResponse.ok) throw new Error(saved.error ?? "Could not attach the uploaded 3D model to this product.");
}

async function validateProductModelFile(file: File, extension: "glb" | "gltf") {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const error = validateProductModelBytes(bytes, extension);
  if (error) throw new Error(error);
}
