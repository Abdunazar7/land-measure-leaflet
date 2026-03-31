"use client";
import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAreaCalculator } from "@/hooks/useAreaCalculator";

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
    clearAll,
    startDrawing,
    stopDrawing,
    deleteSavedResult,
    clearSavedResults,
  } = useAreaCalculator();

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!geocoderRef.current || !mapRef.current) return;

    geocoderRef.current.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        mapRef.current?.setCenter(results[0].geometry.location);
        mapRef.current?.setZoom(16);
      }
    });
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
          />
        </div>
      </main>
    </div>
  );
}
