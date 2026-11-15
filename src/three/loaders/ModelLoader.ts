import {
  BufferGeometry,
  CanvasTexture,
  ExtrudeGeometry,
  Float32BufferAttribute,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
} from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BUTTONS, DETAILS, garmentOutline, ZIPPERS } from "../garments/shapes";
import type { GarmentKind } from "../types";

type Pt = [number, number];

const CURVE = 0.22;
/** The garment bows slightly around the body; details follow the same curve. */
export function curveZ(x: number) {
  return -CURVE * x * x;
}

function buildExtruded(
  pts: Pt[],
  depth: number,
  bevel: number,
  edge: number,
  zOffset: number,
  wrinkle: number,
): BufferGeometry {
  const shape = new Shape();
  pts.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();

  let geo: BufferGeometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 3,
    curveSegments: 6,
    steps: 1,
  });
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  // Subdivide long edges so the drape / wrinkle displacement has vertices to move.
  geo = new TessellateModifier(edge, 8).modify(geo);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const w = wrinkle * Math.sin(x * 13 + y * 5) * Math.sin(y * 7 - x * 3);
    pos.setZ(i, z - depth / 2 + zOffset + curveZ(x) + w);
  }
  geo = mergeVertices(geo, 1e-4);

  const p = geo.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i);
    uv[i * 2 + 1] = p.getY(i);
  }
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

export interface GarmentGeometry {
  body: BufferGeometry;
  details: BufferGeometry[];
  buttons: { x: number; y: number; z: number }[];
  zipper: { y: number; h: number; z: number } | null;
}

const BODY_DEPTH = 0.07;
const cache = new Map<GarmentKind, GarmentGeometry>();

/** Geometry is built once per garment kind and reused by every instance. */
export function getGarmentGeometry(kind: GarmentKind): GarmentGeometry {
  const hit = cache.get(kind);
  if (hit) return hit;

  const body = buildExtruded(garmentOutline(kind), BODY_DEPTH, 0.018, 0.1, 0, 0.012);
  const front = BODY_DEPTH / 2 + 0.018;

  const details = DETAILS[kind].flatMap((d) => {
    const shapes: Pt[][] = [d.pts];
    if (d.mirror) shapes.push(d.pts.map(([x, y]): Pt => [-x, y]).reverse());
    return shapes.map((pts) => buildExtruded(pts, d.depth, 0.006, 0.09, front, 0.004));
  });

  const buttons = BUTTONS[kind].map((y) => ({ x: 0, y, z: front + 0.02 + curveZ(0) }));
  const zip = ZIPPERS[kind];
  const zipper = zip
    ? { y: (zip[0] + zip[1]) / 2, h: Math.abs(zip[1] - zip[0]), z: front + 0.012 }
    : null;

  const out = { body, details, buttons, zipper };
  cache.set(kind, out);
  return out;
}

let fabric: CanvasTexture | null = null;

/** Procedural woven-fabric texture used as both albedo detail and bump map. */
export function getFabricTexture(): CanvasTexture {
  if (fabric) return fabric;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e6e6e6";
  ctx.fillRect(0, 0, size, size);
  const cell = 4;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const over = ((x / cell) + (y / cell)) % 2 === 0;
      const jitter = Math.floor(Math.random() * 18);
      const base = over ? 246 : 206;
      const v = base - jitter;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, cell - 1, cell - 1);
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  fabric = tex;
  return tex;
}

/** Release GPU resources held by shared geometry / textures (scene unmount). */
export function disposeModelCache() {
  for (const g of cache.values()) {
    g.body.dispose();
    g.details.forEach((d) => d.dispose());
  }
  cache.clear();
  fabric?.dispose();
  fabric = null;
}
