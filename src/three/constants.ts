export const RAIL_Y = 2.0;
export const WALL_Z = -1.6;
export const ITEM_SPACING = 1.5;

/** Pose of the inspected garment (relative to the rail group). */
export const FRONT_Z = 1.9;
export const FRONT_Y = -0.25;
export const FRONT_SCALE = 1.35;

export const CAMERA_FOV = 38;
export const BROWSE_CAM_Y = 1.35;
export const BROWSE_LOOK_Y = 1.2;

export const ZOOM_MIN = 0.8;
export const ZOOM_MAX = 3;

/** Distance at which a camera sees at least minW x minH world units. */
export function fitDistance(aspect: number, minW: number, minH: number, fovDeg = CAMERA_FOV) {
  const t = 2 * Math.tan((fovDeg * Math.PI) / 360);
  return Math.max(minH / t, minW / (t * aspect));
}

/** Height (world y) of the inspected garment's visual center. */
export const INSPECT_LOOK_Y = RAIL_Y + FRONT_Y - 0.68 * FRONT_SCALE;
