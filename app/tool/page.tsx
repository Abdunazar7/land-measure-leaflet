"use client";
import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAreaCalculator } from "@/hooks/useAreaCalculator";
import type { LatLng } from "@/lib/geoUtils";
import type { Map as LeafletMap } from "leaflet";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

export default function ToolPage() {
  const {
    result,
    savedResults,
    isDrawing,
    polygonCount,
    handlePolygonComplete,
    polygons,
    activePolygonId,
    updatePolygon,
    selectPolygon,
    clearAll,
    startDrawing,
    stopDrawing,
    deleteSavedResult,
    clearSavedResults,
  } = useAreaCalculator();

  const mapRef = useRef<LeafletMap | null>(null);
  const [searchTarget, setSearchTarget] = useState<LatLng | null>(null);

  const handleMapLoad = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { lat: number; lng: number };

      setSearchTarget({ lat: data.lat, lng: data.lng });
      mapRef.current?.setView([data.lat, data.lng], 16, { animate: true });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="h-svh overflow-hidden bg-[#0a0c12]">
      <Navbar />

      <main className="mt-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden lg:flex-row">
        <div className="order-2 h-[44%] min-h-0 lg:order-1 lg:h-full lg:min-w-90 lg:w-90 xl:min-w-96 xl:w-96">
          <Sidebar
            result={result}
            savedResults={savedResults}
            isDrawing={isDrawing}
            polygonCount={polygonCount}
            onSearch={handleSearch}
            onClear={clearAll}
            onStartDrawing={startDrawing}
            onStopDrawing={stopDrawing}
            onDeleteSavedResult={deleteSavedResult}
            onClearSavedResults={clearSavedResults}
          />
        </div>

        <div className="order-1 h-[56%] min-h-80 min-w-0 lg:order-2 lg:h-full lg:flex-1">
          <MapComponent
            onPolygonComplete={handlePolygonComplete}
            isDrawing={isDrawing}
            onMapLoad={handleMapLoad}
            onStopDrawing={stopDrawing}
            polygons={polygons}
            activePolygonId={activePolygonId}
            onPolygonChange={updatePolygon}
            onPolygonSelect={selectPolygon}
            searchTarget={searchTarget}
          />
        </div>
      </main>
    </div>
  );
}
