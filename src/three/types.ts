/**
 * The only contract between the 3D engine and the rest of the app.
 * The wardrobe is a presentation layer: it never sees prices, stock or carts.
 */
export type GarmentKind = "shirt" | "tshirt" | "pants" | "jacket";

export interface ClosetGarment {
  id: string;
  kind: GarmentKind;
  /** Current display color (hex). Changing it re-tints the garment live. */
  color: string;
  /** Optional GLB. When missing or failing to load, a procedural garment is used. */
  modelUrl?: string | null;
}
