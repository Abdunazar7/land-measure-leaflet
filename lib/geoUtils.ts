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
  /** Outline of the measured shape, so it can be shown on the map again. */
  points?: LatLng[];
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

export interface FormattedArea {
  value: string;
  unit: string;
  label: string;
  /** i18n key for the unit name */
  labelKey: string;
}

export function formatArea(result: AreaResult): FormattedArea {
  const { sqMeters, sotka, hectares, sqKm } = result;

  if (sqMeters < 1000) {
    return {
      value: sqMeters.toFixed(1),
      unit: "m²",
      label: "Kvadrat metr",
      labelKey: "units.sqMeters",
    };
  } else if (sqMeters < 10_000) {
    return {
      value: sotka.toFixed(2),
      unit: "sotka",
      label: "Sotka",
      labelKey: "units.sotka",
    };
  } else if (sqMeters < 1_000_000) {
    return {
      value: hectares.toFixed(3),
      unit: "ga",
      label: "Gektar",
      labelKey: "units.hectares",
    };
  }

  return {
    value: sqKm.toFixed(4),
    unit: "km²",
    label: "Kvadrat km",
    labelKey: "units.sqKm",
  };
}

/** [south, north, west, east] bounds of a shape, matching MapFocus.bbox. */
export function boundsOf(
  points: LatLng[],
): [number, number, number, number] | null {
  if (points.length === 0) return null;

  let south = points[0]!.lat;
  let north = points[0]!.lat;
  let west = points[0]!.lng;
  let east = points[0]!.lng;

  for (const point of points) {
    south = Math.min(south, point.lat);
    north = Math.max(north, point.lat);
    west = Math.min(west, point.lng);
    east = Math.max(east, point.lng);
  }

  return [south, north, west, east];
}

/** "4974484.8" -> "4 974 484.8"; only the integer part is grouped. */
export function groupThousands(value: string, separator = " "): string {
  const [integer = "", fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

export function formatPerimeter(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(1)} m`;
  return `${(meters / 1000).toFixed(3)} km`;
}
