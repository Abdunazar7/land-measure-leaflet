"use client";
import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAreaCalculator } from "@/hooks/useAreaCalculator";
import { useGeolocation } from "@/hooks/useGeolocation";
import { boundsOf } from "@/lib/geoUtils";
import type { GeoPlace } from "@/lib/geocode";
import type { MapFocus } from "@/components/MapComponent";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] items-center justify-center bg-[#0f1117]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
    </div>
  ),
});

export default function ToolPage() {
  const { i18n } = useTranslation();

  const {
    result,
    savedResults,
    isDrawing,
    polygons,
    activePolygonId,
    polygonCount,
    handlePolygonComplete,
    updatePolygon,
    selectPolygon,
    deletePolygon,
    showSavedResult,
    clearAll,
    startDrawing,
    stopDrawing,
    deleteSavedResult,
    clearSavedResults,
  } = useAreaCalculator();

  const gps = useGeolocation({ lang: i18n.language });

  const [focus, setFocus] = useState<MapFocus | null>(null);
  const focusKeyRef = useRef(0);
  const viewboxRef = useRef<string | null>(null);

  const handleViewportChange = useCallback((viewbox: string) => {
    viewboxRef.current = viewbox;
  }, []);

  const getViewbox = useCallback(() => viewboxRef.current, []);

  const handleSelectPlace = useCallback((place: GeoPlace) => {
    focusKeyRef.current += 1;

    setFocus({
      key: focusKeyRef.current,
      lat: place.lat,
      lng: place.lng,
      label: place.name,
      detail: place.detail,
      bbox: place.bbox,
      showMarker: true,
    });
  }, []);

  const handleShowSavedResult = useCallback(
    (id: string) => {
      const points = showSavedResult(id);
      if (!points || points.length === 0) return;

      focusKeyRef.current += 1;

      setFocus({
        key: focusKeyRef.current,
        lat: points[0]!.lat,
        lng: points[0]!.lng,
        bbox: boundsOf(points) ?? undefined,
        zoom: 18,
        showMarker: false,
      });
    },
    [showSavedResult],
  );

  return (
    <div className="min-h-svh bg-[#0a0c12] lg:h-svh lg:overflow-hidden">
      <Navbar />

      <main className="mt-[103px] flex min-h-[calc(100svh-103px)] flex-col sm:mt-16 sm:min-h-[calc(100svh-4rem)] lg:h-[calc(100svh-4rem)] lg:flex-row lg:overflow-hidden">
        <div className="order-1 h-[52svh] min-h-[320px] min-w-0 shrink-0 lg:order-2 lg:h-full lg:flex-1">
          <MapComponent
            polygons={polygons}
            activePolygonId={activePolygonId}
            isDrawing={isDrawing}
            onPolygonComplete={handlePolygonComplete}
            onPolygonChange={updatePolygon}
            onPolygonSelect={selectPolygon}
            onPolygonDelete={deletePolygon}
            onStopDrawing={stopDrawing}
            focus={focus}
            onViewportChange={handleViewportChange}
            gps={gps}
          />
        </div>

        <div className="order-2 min-w-0 flex-1 lg:order-1 lg:h-full lg:w-90 lg:min-w-90 lg:flex-none xl:w-96 xl:min-w-96">
          <Sidebar
            result={result}
            savedResults={savedResults}
            isDrawing={isDrawing}
            polygonCount={polygonCount}
            gps={gps}
            onSelectPlace={handleSelectPlace}
            getViewbox={getViewbox}
            onClear={clearAll}
            onStartDrawing={startDrawing}
            onStopDrawing={stopDrawing}
            onDeleteSavedResult={deleteSavedResult}
            onClearSavedResults={clearSavedResults}
            onShowSavedResult={handleShowSavedResult}
          />
        </div>
      </main>
    </div>
  );
}
