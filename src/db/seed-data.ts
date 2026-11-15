import type { CategorySlug, Gender } from "@/types/product";

export const SEED_CATEGORIES: { slug: CategorySlug; name: string; sortOrder: number }[] = [
  { slug: "shirts", name: "Shirts", sortOrder: 1 },
  { slug: "t-shirts", name: "T-shirts", sortOrder: 2 },
  { slug: "pants", name: "Pants", sortOrder: 3 },
  { slug: "jackets", name: "Jackets", sortOrder: 4 },
];

export interface SeedProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number; // whole currency units
  category: CategorySlug;
  gender: Gender;
  brand: string;
  material: string;
  featured?: boolean;
  isNew?: boolean;
  colors: [string, string][]; // [name, hex]
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "oxford-linen-shirt",
    sku: "DC-SH-001",
    name: "Oxford Linen Shirt",
    description:
      "A relaxed, softly structured button-down woven from washed European linen. Breathable, lightly textured and made to look better with every wear.",
    price: 89,
    category: "shirts",
    gender: "men",
    brand: "Maison Oren",
    material: "100% European linen",
    featured: true,
    colors: [["Ivory", "#efe8d8"], ["Sky", "#a9c1d9"], ["Sage", "#a3b18a"]],
  },
  {
    id: "poplin-button-up",
    sku: "DC-SH-002",
    name: "Poplin Button-Up",
    description:
      "Crisp cotton poplin with a clean collar and mother-of-pearl style buttons. An everyday shirt with an effortlessly tailored line.",
    price: 74,
    category: "shirts",
    gender: "women",
    brand: "Atelier Nord",
    material: "100% cotton poplin",
    isNew: true,
    colors: [["White", "#f7f5f0"], ["Blush", "#e5c1b8"], ["Navy", "#2f3e5c"]],
  },
  {
    id: "silk-blend-camp-shirt",
    sku: "DC-SH-003",
    name: "Silk-Blend Camp Shirt",
    description:
      "A drapey, open-collar camp shirt with a subtle sheen. Cut boxy for warm evenings and slow weekends.",
    price: 94,
    category: "shirts",
    gender: "men",
    brand: "Maison Oren",
    material: "55% viscose, 45% silk",
    colors: [["Terracotta", "#b4694a"], ["Ivory", "#efe8d8"]],
  },
  {
    id: "flannel-overshirt",
    sku: "DC-SH-004",
    name: "Brushed Flannel Overshirt",
    description:
      "Heavy brushed flannel with a soft hand and a slightly oversized fit. Wear it buttoned, open or as a light layer.",
    price: 98,
    category: "shirts",
    gender: "unisex",
    brand: "Kinfolk & Co",
    material: "100% brushed cotton",
    colors: [["Brick", "#8a3b3b"], ["Ash", "#8d8d8d"], ["Cream", "#eee6d4"]],
  },
  {
    id: "essential-crew-tee",
    sku: "DC-TS-001",
    name: "Essential Crew Tee",
    description:
      "The everyday tee, perfected: dense organic cotton jersey, a clean neckline and a cut that sits just right.",
    price: 38,
    category: "t-shirts",
    gender: "unisex",
    brand: "Sable Studio",
    material: "100% organic cotton",
    featured: true,
    colors: [["Black", "#1c1c1c"], ["Oat", "#d9cdb4"], ["Slate", "#6b7280"], ["Rust", "#a65a3a"]],
  },
  {
    id: "heavyweight-pocket-tee",
    sku: "DC-TS-002",
    name: "Heavyweight Pocket Tee",
    description:
      "A substantial 240gsm tee with a boxy shape and a reinforced collar. Built to be worn hard.",
    price: 46,
    category: "t-shirts",
    gender: "men",
    brand: "Kinfolk & Co",
    material: "100% heavyweight cotton",
    isNew: true,
    colors: [["Charcoal", "#3b3b3b"], ["Cream", "#f0e8d6"], ["Forest", "#3d5a45"]],
  },
  {
    id: "relaxed-ribbed-tee",
    sku: "DC-TS-003",
    name: "Relaxed Ribbed Tee",
    description:
      "A fine-rib tee with a soft stretch and a slightly cropped, relaxed body. Pairs with everything in the closet.",
    price: 42,
    category: "t-shirts",
    gender: "women",
    brand: "Atelier Nord",
    material: "92% cotton, 8% modal",
    colors: [["Mocha", "#8b6b55"], ["Stone", "#cfc6b8"], ["Rose", "#c98f93"]],
  },
  {
    id: "tailored-wool-trousers",
    sku: "DC-PN-001",
    name: "Tailored Wool Trousers",
    description:
      "Mid-rise trousers in a fluid wool blend with a sharp crease and a tapered leg. Smart enough for the office, easy enough for dinner.",
    price: 128,
    category: "pants",
    gender: "men",
    brand: "Maison Oren",
    material: "70% wool, 30% polyester",
    featured: true,
    colors: [["Charcoal", "#33353a"], ["Camel", "#b08d63"]],
  },
  {
    id: "wide-leg-pleat-trousers",
    sku: "DC-PN-002",
    name: "Wide-Leg Pleat Trousers",
    description:
      "High-waisted, double-pleated and generously cut through the leg. Fluid fabric that moves beautifully.",
    price: 112,
    category: "pants",
    gender: "women",
    brand: "Atelier Nord",
    material: "100% viscose twill",
    isNew: true,
    colors: [["Black", "#1c1c1c"], ["Ecru", "#e6dccb"], ["Olive", "#6b6b3c"]],
  },
  {
    id: "straight-selvedge-denim",
    sku: "DC-PN-003",
    name: "Straight Selvedge Denim",
    description:
      "Classic straight-leg jeans in 12oz Japanese selvedge denim. Raw, rigid and ready to fade your way.",
    price: 118,
    category: "pants",
    gender: "unisex",
    brand: "Kinfolk & Co",
    material: "100% cotton selvedge denim",
    colors: [["Indigo", "#2c3e63"], ["Washed", "#7d93b5"], ["Black", "#1c1c1c"]],
  },
  {
    id: "utility-cargo-pants",
    sku: "DC-PN-004",
    name: "Utility Cargo Pants",
    description:
      "Durable cotton twill with a tapered leg and articulated knees. Practical pockets, polished proportions.",
    price: 96,
    category: "pants",
    gender: "men",
    brand: "Sable Studio",
    material: "100% cotton twill",
    colors: [["Khaki", "#a89c7a"], ["Black", "#1c1c1c"], ["Moss", "#4f5b3d"]],
  },
  {
    id: "boxy-chore-jacket",
    sku: "DC-JK-001",
    name: "Boxy Chore Jacket",
    description:
      "A workwear classic in washed cotton canvas. Roomy through the body with a simple collar and deep patch pockets.",
    price: 148,
    category: "jackets",
    gender: "men",
    brand: "Kinfolk & Co",
    material: "100% cotton canvas",
    featured: true,
    colors: [["Tan", "#b59a72"], ["Navy", "#263248"]],
  },
  {
    id: "quilted-liner-jacket",
    sku: "DC-JK-002",
    name: "Quilted Liner Jacket",
    description:
      "Lightweight diamond-quilted jacket with recycled fill. Wear it alone or layer it under a coat.",
    price: 164,
    category: "jackets",
    gender: "women",
    brand: "Atelier Nord",
    material: "100% recycled polyester",
    colors: [["Cream", "#efe7d6"], ["Olive", "#59603a"], ["Black", "#1c1c1c"]],
  },
  {
    id: "coach-bomber",
    sku: "DC-JK-003",
    name: "Coach Bomber",
    description:
      "A sleek, water-resistant bomber with a ribbed collar and a matte finish. Light, sharp and made to travel.",
    price: 138,
    category: "jackets",
    gender: "unisex",
    brand: "Sable Studio",
    material: "100% recycled nylon",
    featured: true,
    isNew: true,
    colors: [["Black", "#1c1c1c"], ["Sand", "#cdbf9f"], ["Burgundy", "#6e2a35"]],
  },
];
