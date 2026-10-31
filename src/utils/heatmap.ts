import type { PublicSpot } from "@/types/spot";

export function toHeatmapPoints(spots: Pick<PublicSpot, "lat" | "lng" | "weight">[]): [number, number, number][] {
  return spots.filter(({lat, lng, weight}) =>
    Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    Number.isFinite(lng) && Math.abs(lng) <= 180 &&
    Number.isFinite(weight) && weight > 0
  ).map(({lat, lng, weight}) => [lat, lng, weight]);
}

// Scale the kernel with map zoom so zooming out does not enlarge its footprint on the ground.
export function heatmapStyleForZoom(zoom: number) {
  const scale = 2 ** (zoom - 12);
  return { radius: Math.max(3, Math.min(96, 22 * scale)), blur: Math.max(2, Math.min(72, 16 * scale)) };
}

export function hasDrawableMapSize(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width >= 1 && height >= 1;
}
