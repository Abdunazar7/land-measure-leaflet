import type { LatLng } from "@/lib/geoUtils";

export interface GeoPlace {
  id: string;
  lat: number;
  lng: number;
  /** Short name, e.g. "Chilonzor" */
  name: string;
  /** Rest of the address, e.g. "Toshkent, Uzbekistan" */
  detail: string;
  /** Nominatim category/type, used for the row icon */
  category?: string;
  type?: string;
  /** [south, north, west, east] — Nominatim boundingbox order */
  bbox?: [number, number, number, number];
}

export interface GeocodeResponse {
  results: GeoPlace[];
}

const COORD_PATTERN =
  /^\s*([NSns])?\s*(-?\d{1,3}(?:[.,]\d+)?)\s*°?\s*([NSns])?\s*[,;\s]\s*([EWew])?\s*(-?\d{1,3}(?:[.,]\d+)?)\s*°?\s*([EWew])?\s*$/;

function applyHemisphere(value: number, ...markers: (string | undefined)[]) {
  const marker = markers.find(Boolean)?.toUpperCase();
  if (marker === "S" || marker === "W") return -Math.abs(value);
  return value;
}

/**
 * Accepts "41.2995, 69.2401", "41.2995 69.2401", "41.2995N 69.2401E" etc.
 * Returns null when the text is not a coordinate pair.
 */
export function parseCoordinates(input: string): LatLng | null {
  const match = COORD_PATTERN.exec(input);
  if (!match) return null;

  const [, latPrefix, rawLat, latSuffix, lngPrefix, rawLng, lngSuffix] = match;

  const lat = applyHemisphere(
    Number(rawLat!.replace(",", ".")),
    latPrefix,
    latSuffix,
  );
  const lng = applyHemisphere(
    Number(rawLng!.replace(",", ".")),
    lngPrefix,
    lngSuffix,
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng };
}

export function formatCoordinates({ lat, lng }: LatLng, digits = 5): string {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}

const CATEGORY_ICONS: Record<string, string> = {
  place: "📍",
  boundary: "🏙️",
  highway: "🛣️",
  building: "🏢",
  amenity: "🏬",
  shop: "🛒",
  tourism: "🏞️",
  natural: "🌲",
  waterway: "💧",
  landuse: "🌾",
  railway: "🚉",
  aeroway: "✈️",
  office: "🏛️",
  leisure: "⚽",
};

export function placeIcon(place: GeoPlace): string {
  return CATEGORY_ICONS[place.category ?? ""] ?? "📍";
}

/** Nominatim viewbox string (west,north,east,south) used to bias results. */
export function toViewbox(bounds: {
  west: number;
  north: number;
  east: number;
  south: number;
}): string {
  const { west, north, east, south } = bounds;
  return `${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)},${south.toFixed(6)}`;
}

export interface SearchOptions {
  limit?: number;
  viewbox?: string | null;
  lang?: string;
  signal?: AbortSignal;
}

export async function searchPlaces(
  query: string,
  { limit = 6, viewbox, lang, signal }: SearchOptions = {},
): Promise<GeoPlace[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (viewbox) params.set("viewbox", viewbox);
  if (lang) params.set("lang", lang);

  const res = await fetch(`/api/geocode?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

  const data = (await res.json()) as GeocodeResponse;
  return data.results ?? [];
}

export async function reverseGeocode(
  { lat, lng }: LatLng,
  { lang, signal }: { lang?: string; signal?: AbortSignal } = {},
): Promise<GeoPlace | null> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (lang) params.set("lang", lang);

  const res = await fetch(`/api/reverse?${params.toString()}`, { signal });
  if (!res.ok) return null;

  const data = (await res.json()) as { result: GeoPlace | null };
  return data.result ?? null;
}
