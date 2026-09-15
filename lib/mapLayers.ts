export type BaseLayerId = "hybrid" | "satellite" | "street" | "dark";

export interface TileDef {
  url: string;
  attribution: string;
  subdomains?: string;
  maxNativeZoom: number;
}

export interface BaseLayerDef {
  id: BaseLayerId;
  /** i18n key for the human label */
  labelKey: string;
  /** Emoji shown in the compact map-type switcher */
  icon: string;
  base: TileDef;
  /** Transparent reference tiles drawn on top of the imagery (hybrid). */
  overlay?: TileDef;
}

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ESRI_ATTR =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';
const CARTO_ATTR = `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`;

const ESRI_IMAGERY: TileDef = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: ESRI_ATTR,
  maxNativeZoom: 19,
};

const ESRI_REFERENCE: TileDef = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  attribution: ESRI_ATTR,
  maxNativeZoom: 19,
};

/** Zoom further than the imagery provides; Leaflet upscales the last real tile. */
export const MAP_MAX_ZOOM = 21;

export const BASE_LAYERS: BaseLayerDef[] = [
  {
    id: "hybrid",
    labelKey: "map.layers.hybrid",
    icon: "🛰️",
    base: ESRI_IMAGERY,
    overlay: ESRI_REFERENCE,
  },
  {
    id: "satellite",
    labelKey: "map.layers.satellite",
    icon: "🌍",
    base: ESRI_IMAGERY,
  },
  {
    id: "street",
    labelKey: "map.layers.street",
    icon: "🗺️",
    base: {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: OSM_ATTR,
      maxNativeZoom: 19,
    },
  },
  {
    id: "dark",
    labelKey: "map.layers.dark",
    icon: "🌙",
    base: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      attribution: CARTO_ATTR,
      subdomains: "abcd",
      maxNativeZoom: 20,
    },
  },
];

export const DEFAULT_BASE_LAYER: BaseLayerId = "hybrid";

export const BASE_LAYER_STORAGE_KEY = "land-measure:basemap";

export function getBaseLayer(id: BaseLayerId): BaseLayerDef {
  return BASE_LAYERS.find((layer) => layer.id === id) ?? BASE_LAYERS[0]!;
}

export function readStoredBaseLayer(): BaseLayerId {
  if (typeof window === "undefined") return DEFAULT_BASE_LAYER;

  try {
    const stored = window.localStorage.getItem(BASE_LAYER_STORAGE_KEY);
    const match = BASE_LAYERS.find((layer) => layer.id === stored);
    return match ? match.id : DEFAULT_BASE_LAYER;
  } catch {
    return DEFAULT_BASE_LAYER;
  }
}

export function storeBaseLayer(id: BaseLayerId): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BASE_LAYER_STORAGE_KEY, id);
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist.
  }
}
