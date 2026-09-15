import type { GeoPlace } from "@/lib/geocode";

/** Nominatim asks every app to identify itself. */
export const NOMINATIM_HEADERS = {
  "User-Agent": "LandMeasure/1.0 (Leaflet land area tool)",
  Accept: "application/json",
} as const;

export const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export interface NominatimPlace {
  place_id?: number | string;
  osm_type?: string;
  osm_id?: number | string;
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
  category?: string;
  class?: string;
  type?: string;
  addresstype?: string;
  boundingbox?: [string, string, string, string];
}

const LANGUAGE_HEADERS: Record<string, string> = {
  uz: "uz,ru;q=0.8,en;q=0.6",
  ru: "ru,en;q=0.7",
  en: "en",
};

export function acceptLanguage(lang: string | null | undefined): string {
  if (!lang) return LANGUAGE_HEADERS.en!;
  return LANGUAGE_HEADERS[lang] ?? LANGUAGE_HEADERS.en!;
}

function splitDisplayName(displayName: string, name?: string) {
  const parts = displayName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const head = name?.trim() || parts[0] || displayName;
  const rest = parts[0] === head ? parts.slice(1) : parts;

  return { name: head, detail: rest.join(", ") };
}

export function toGeoPlace(raw: NominatimPlace, index = 0): GeoPlace | null {
  const lat = Number(raw.lat);
  const lng = Number(raw.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const display = raw.display_name ?? raw.name ?? `${lat}, ${lng}`;
  const { name, detail } = splitDisplayName(display, raw.name);

  const bbox = raw.boundingbox?.map(Number) as
    | [number, number, number, number]
    | undefined;

  return {
    id: String(raw.place_id ?? `${raw.osm_type ?? "p"}-${raw.osm_id ?? index}`),
    lat,
    lng,
    name,
    detail,
    category: raw.category ?? raw.class,
    type: raw.type ?? raw.addresstype,
    bbox:
      bbox && bbox.length === 4 && bbox.every((value) => Number.isFinite(value))
        ? bbox
        : undefined,
  };
}
