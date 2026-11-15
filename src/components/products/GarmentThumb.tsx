import { garmentOutline, BUTTONS, isLightColor } from "@/three/garments/shapes";
import type { CategorySlug } from "@/types/product";
import type { GarmentKind } from "@/three/types";

export function categoryToKind(category: CategorySlug): GarmentKind {
  switch (category) {
    case "shirts":
      return "shirt";
    case "t-shirts":
      return "tshirt";
    case "pants":
      return "pants";
    case "jackets":
      return "jacket";
  }
}

/** 2D silhouette generated from the same outlines as the 3D placeholders. */
export function GarmentThumb({
  kind,
  color,
  className = "",
}: {
  kind: GarmentKind;
  color: string;
  className?: string;
}) {
  const pts = garmentOutline(kind)
    .map(([x, y]) => `${x.toFixed(3)},${(-y).toFixed(3)}`)
    .join(" ");
  const light = isLightColor(color);
  const stroke = light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.12)";
  const trim = light ? "#2b2b2b" : "#f1ece2";
  const id = `g-${kind}-${color.replace("#", "")}`;
  return (
    <svg viewBox="-0.85 -0.1 1.7 1.5" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      {/* hanger */}
      <circle cx="0" cy="0.04" r="0.045" fill="none" stroke="#a88f6c" strokeWidth="0.015" />
      <path
        d={`M0 0.09 L0 0.16 M0 0.16 L-0.36 0.27 L0.36 0.27 Z`}
        fill="none"
        stroke="#a88f6c"
        strokeWidth="0.015"
        strokeLinejoin="round"
      />
      <polygon points={pts} fill={color} stroke={stroke} strokeWidth="0.012" strokeLinejoin="round" />
      <polygon points={pts} fill={`url(#${id})`} />
      {BUTTONS[kind].map((y) => (
        <circle key={y} cx="0" cy={-y} r="0.018" fill={trim} />
      ))}
    </svg>
  );
}
