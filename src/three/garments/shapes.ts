import type { GarmentKind } from "../types";

/**
 * Pure-data garment silhouettes (no three.js import) so the same outlines
 * drive the 3D placeholders, 2D thumbnails and the no-WebGL fallback.
 * Coordinates: x across, y downward-negative, hook at (0, 0).
 * Each half profile runs from the top-center to the bottom-center.
 */
type Pt = [number, number];

const HALF: Record<GarmentKind, Pt[]> = {
  shirt: [
    [0, -0.31], [0.07, -0.28], [0.12, -0.21], [0.34, -0.27],
    [0.5, -0.4], [0.64, -0.95], [0.64, -1.02], [0.5, -1.04],
    [0.36, -0.62], [0.35, -1.26], [0, -1.26],
  ],
  tshirt: [
    [0, -0.3], [0.08, -0.27], [0.12, -0.21], [0.34, -0.27],
    [0.55, -0.48], [0.46, -0.66], [0.35, -0.54], [0.35, -1.16], [0, -1.16],
  ],
  jacket: [
    [0, -0.64], [0.04, -0.5], [0.1, -0.23], [0.13, -0.2], [0.4, -0.28],
    [0.56, -0.42], [0.7, -1.08], [0.7, -1.16], [0.55, -1.17],
    [0.41, -0.68], [0.42, -1.3], [0, -1.3],
  ],
  pants: [
    [0, -0.34], [0.31, -0.34], [0.35, -1.4], [0.07, -1.4],
    [0.03, -0.84], [0, -0.8],
  ],
};

export function garmentOutline(kind: GarmentKind): Pt[] {
  const right = HALF[kind];
  const left = right
    .slice(1, -1)
    .reverse()
    .map(([x, y]): Pt => [-x, y]);
  return [...right, ...left];
}

export interface DetailShape {
  pts: Pt[];
  mirror: boolean;
  depth: number;
}

/** Raised details (collars, lapels, waistbands) drawn on the front face. */
export const DETAILS: Record<GarmentKind, DetailShape[]> = {
  shirt: [
    { pts: [[0.005, -0.32], [0.12, -0.19], [0.2, -0.3], [0.04, -0.4]], mirror: true, depth: 0.02 },
  ],
  tshirt: [],
  jacket: [
    { pts: [[0.01, -0.64], [0.1, -0.2], [0.2, -0.3], [0.12, -0.5]], mirror: true, depth: 0.025 },
  ],
  pants: [{ pts: [[-0.31, -0.33], [0.31, -0.33], [0.315, -0.4], [-0.315, -0.4]], mirror: false, depth: 0.02 }],
};

export const BUTTONS: Record<GarmentKind, number[]> = {
  shirt: [-0.46, -0.62, -0.78, -0.94, -1.1, -1.2],
  tshirt: [],
  jacket: [],
  pants: [-0.37],
};

/** Zipper / placket line [y0, y1]. */
export const ZIPPERS: Partial<Record<GarmentKind, [number, number]>> = {
  jacket: [-0.66, -1.29],
};

/** Hanger half-width and the y at which the hanger arms end. */
export const HANGERS: Record<GarmentKind, { halfWidth: number; endY: number }> = {
  shirt: { halfWidth: 0.36, endY: -0.27 },
  tshirt: { halfWidth: 0.34, endY: -0.27 },
  jacket: { halfWidth: 0.4, endY: -0.28 },
  pants: { halfWidth: 0.3, endY: -0.36 },
};

export function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}
