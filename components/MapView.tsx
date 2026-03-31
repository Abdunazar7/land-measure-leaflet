"use client";

import { useCallback, useEffect, useRef } from "react";
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

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: "hybrid",
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 4, // RIGHT_TOP
  },
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: "greedy",
  styles: [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#c8d8e8" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a2332", lightness: -80 }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [{ color: "#000000" }, { lightness: 20 }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0a1929" }],
    },
  ],
};

interface MapViewProps {
  isDrawing: boolean;
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  onDrawingEnd: () => void;
  searchTarget: google.maps.LatLngLiteral | null;
  apiKey: string;
}

export default function MapView({
  isDrawing,
  onPolygonComplete,
  onDrawingEnd,
  searchTarget,
  apiKey,
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      onPolygonComplete(polygon);
      onDrawingEnd();
    },
    [onPolygonComplete, onDrawingEnd],
  );

  useEffect(() => {
    if (!searchTarget || !mapRef.current) return;

    mapRef.current.panTo(searchTarget);
    mapRef.current.setZoom(16);
  }, [searchTarget]);

  if (loadError) {
    return (
      <div
        className="flex-1 flex items-center justify-center flex-col gap-4"
        style={{ background: "var(--bg)" }}
      >
        <div className="text-5xl">⚠️</div>
        <div className="text-center max-w-sm">
          <h2
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Xarita yuklanmadi
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Google Maps API kalitini tekshiring.{" "}
            <code className="text-green-400">.env.local</code> faylida
            <code className="text-green-400">
              {" "}
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{" "}
            ni to‘g‘ri kiriting.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex-1 flex items-center justify-center flex-col gap-3"
        style={{ background: "var(--bg)" }}
      >
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm" style={{ color: "var(--text-dim)" }}>
          Xarita yuklanmoqda...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <GoogleMap
        mapContainerClassName="map-container"
        center={{ lat: 41.2995, lng: 69.2401 }}
        zoom={13}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {isDrawing && (
          <DrawingManager
            drawingMode={window.google.maps.drawing.OverlayType.POLYGON}
            options={{
              drawingControl: false,
              polygonOptions: {
                fillColor: "#4ade80",
                fillOpacity: 0.15,
                strokeColor: "#4ade80",
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1,
              },
            }}
            onPolygonComplete={handlePolygonComplete}
          />
        )}
      </GoogleMap>

      {/* Status overlay */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs pointer-events-none"
        style={{
          background: "rgba(8,12,15,0.85)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}
      >
        {isDrawing
          ? "✏️ Nuqtalar qo'ying — oxirida birinchi nuqtaga bosing"
          : "📍 Chizish uchun asbobni tanlang"}
      </div>

      {/* Drawing indicator */}
      {isDrawing && (
        <div
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-xs font-medium"
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-display)",
            }}
          >
            Chizish rejimi
          </span>
        </div>
      )}
    </div>
  );
}
