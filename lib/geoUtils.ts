import * as turf from "@turf/turf";

export interface AreaResult {
  sqMeters: number;
  sotka: number;
  hectares: number;
  sqKm: number;
  acres: number;
  perimeter: number;
  perimeterKm: number;
  pointCount: number;
}

export interface SavedAreaResult extends AreaResult {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export type LatLng = { lat: number; lng: number };

function toClosedRing(path: LatLng[]): [number, number][] {
  const ring: [number, number][] = path.map((p) => [p.lng, p.lat]);
  if (ring.length === 0) return ring;

  const first = ring[0]!;
  const last = ring[ring.length - 1]!;

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first);
  }

  return ring;
}

export function computeAreaResult(
  path: LatLng[],
  pointCount: number = path.length,
): AreaResult {
  if (path.length < 3) {
    return {
      sqMeters: 0,
      sotka: 0,
      hectares: 0,
      sqKm: 0,
      acres: 0,
      perimeter: 0,
      perimeterKm: 0,
      pointCount,
    };
  }

  // Turf expects [lng, lat] and a closed ring for polygons.
  // It computes geodesic area on WGS84 (spherical approximation).
  const ring = toClosedRing(path);
  const polygon = turf.polygon([ring]);
  const areaSqM = turf.area(polygon);

  // Perimeter: length of the outer ring line in kilometers -> meters.
  const line = turf.lineString(ring);
  const perimeterKm = turf.length(line, { units: "kilometers" });
  const perimeterM = perimeterKm * 1000;

  return {
    sqMeters: areaSqM,
    sotka: areaSqM / 100,
    hectares: areaSqM / 10_000,
    sqKm: areaSqM / 1_000_000,
    acres: areaSqM / 4046.86,
    perimeter: perimeterM,
    perimeterKm,
    pointCount,
  };
}

export function formatArea(result: AreaResult): {
  value: string;
  unit: string;
  label: string;
} {
  const { sqMeters, sotka, hectares, sqKm } = result;

  if (sqMeters < 1000) {
    return { value: sqMeters.toFixed(1), unit: "m²", label: "Kvadrat metr" };
  } else if (sqMeters < 10_000) {
    return { value: sotka.toFixed(2), unit: "sotka", label: "Sotka" };
  } else if (sqMeters < 1_000_000) {
    return { value: hectares.toFixed(3), unit: "ga", label: "Gektar" };
  }

  return { value: sqKm.toFixed(4), unit: "km²", label: "Kvadrat km" };
}

export function formatPerimeter(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(1)} m`;
  return `${(meters / 1000).toFixed(3)} km`;
}
