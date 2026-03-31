"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DrawingManager,
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";

const LIBRARIES: ("drawing" | "geometry" | "places")[] = [
  "drawing",
  "geometry",
  "places",
];

const DEFAULT_CENTER = { lat: 41.2995, lng: 69.2401 };

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: "hybrid",
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0c12" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8896a5" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d1b2a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#253444" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a2535" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#2a3548" }],
  },
];

const POLYGON_OPTIONS: google.maps.PolygonOptions = {
  fillColor: "#22c55e",
  fillOpacity: 0.2,
  strokeWeight: 2.5,
  strokeColor: "#4ade80",
  clickable: true,
  editable: true,
  geodesic: true,
  zIndex: 1,
};

interface Props {
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  isDrawing: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  onStopDrawing?: () => void;
}

export default function MapComponent({
  onPolygonComplete,
  isDrawing,
  onMapLoad,
  onStopDrawing,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const mapOptions = useMemo(
    () => ({
      ...MAP_OPTIONS,
      draggableCursor: isDrawing ? "crosshair" : undefined,
    }),
    [isDrawing],
  );

  const applyThemeToMap = useCallback((map?: google.maps.Map | null) => {
    const currentMap = map ?? mapRef.current;
    if (!currentMap) return;

    const isDark = document.documentElement.classList.contains("dark");
    currentMap.setOptions({ styles: isDark ? DARK_STYLE : [] });
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: LIBRARIES,
  });

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      applyThemeToMap(map);
      onMapLoad?.(map);
    },
    [applyThemeToMap, onMapLoad],
  );

  useEffect(() => {
    const syncTheme = () => applyThemeToMap();

    syncTheme();
    window.addEventListener("themechange", syncTheme);

    return () => window.removeEventListener("themechange", syncTheme);
  }, [applyThemeToMap]);

  useEffect(() => {
    if (!onStopDrawing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onStopDrawing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStopDrawing]);

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0f1117]">
        <div className="max-w-sm px-6 text-center">
          <div className="mb-4 text-5xl">⚠️</div>
          <h3 className="mb-2 text-lg font-semibold text-white">API Xato</h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Google Maps yuklanmadi.{" "}
            <code className="rounded bg-slate-800 px-1 text-green-400">
              .env.local
            </code>{" "}
            faylda API kalitni tekshiring.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Xarita yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1">
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={DEFAULT_CENTER}
        zoom={13}
        onLoad={onLoad}
        options={mapOptions}
      >
        <DrawingManager
          drawingMode={
            isDrawing ? google.maps.drawing.OverlayType.POLYGON : null
          }
          options={{
            drawingControl: false,
            polygonOptions: POLYGON_OPTIONS,
          }}
          onPolygonComplete={onPolygonComplete}
        />
      </GoogleMap>

      {isDrawing && onStopDrawing && (
        <button
          type="button"
          onClick={onStopDrawing}
          className="absolute right-3 top-3 rounded-xl border border-amber-500/20 bg-[#0f1117]/90 px-3 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-sm"
        >
          Bekor qilish ✕
        </button>
      )}

      {/* Mode indicator */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 sm:right-auto rounded-xl border border-slate-700 bg-[#0f1117]/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isDrawing ? "bg-green-400 pulse-dot" : "bg-slate-500"}`}
          />
          <span className="text-xs font-medium text-slate-300">
            {isDrawing
              ? "Chizish rejimi — xaritada bosing"
              : "Tahrirlash rejimi — nuqtalarni sudrang"}
          </span>
        </div>
      </div>

      {/* Tip */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-2xl border border-slate-700 bg-[#0f1117]/90 px-4 py-2 backdrop-blur-sm sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-full">
        <p className="text-center text-xs text-slate-400 sm:text-left">
          {isDrawing
            ? "💡 Maydon chegarasini bosib belgilang, xato bo‘lsa ESC bosing"
            : "💡 Nuqtalarni sudrab maydonni bemalol tahrirlashingiz mumkin"}
        </p>
      </div>
    </div>
  );
}
