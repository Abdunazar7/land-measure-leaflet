import { useCallback, useEffect, useRef, useState } from "react";
import { computeAreaResult, AreaResult, SavedAreaResult } from "@/lib/geoUtils";

const STORAGE_KEY = "land-measure:saved-results";

function loadSavedResults(): SavedAreaResult[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function useAreaCalculator() {
  const [result, setResult] = useState<AreaResult | null>(null);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const [savedResults, setSavedResults] = useState<SavedAreaResult[]>(() =>
    loadSavedResults(),
  );
  const [isDrawing, setIsDrawing] = useState(false);

  const activeResultIdRef = useRef<string | null>(null);
  const polygonListenersRef = useRef<google.maps.MapsEventListener[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedResults));
  }, [savedResults]);

  const upsertSavedResult = useCallback((nextResult: AreaResult) => {
    const activeId = activeResultIdRef.current ?? crypto.randomUUID();
    const timestamp = new Date().toISOString();

    activeResultIdRef.current = activeId;

    setSavedResults((prev) => {
      const existing = prev.find((item) => item.id === activeId);

      const nextEntry: SavedAreaResult = {
        ...nextResult,
        id: activeId,
        label:
          existing?.label ??
          `O'lchov ${prev.filter((item) => item.id !== activeId).length + 1}`,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };

      return [nextEntry, ...prev.filter((item) => item.id !== activeId)];
    });
  }, []);

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      activeResultIdRef.current = crypto.randomUUID();
      setPolygons((prev) => [...prev, polygon]);
      setIsDrawing(false);

      const update = () => {
        const path = polygon.getPath();
        const coords: google.maps.LatLng[] = [];

        for (let i = 0; i < path.getLength(); i += 1) {
          coords.push(path.getAt(i));
        }

        const nextResult = computeAreaResult(coords, path.getLength());
        if (nextResult.pointCount < 3 || nextResult.sqMeters <= 0) return;

        setResult(nextResult);
        upsertSavedResult(nextResult);
      };

      update();

      polygonListenersRef.current.push(
        polygon.getPath().addListener("set_at", update),
        polygon.getPath().addListener("insert_at", update),
        polygon.getPath().addListener("remove_at", update),
      );
    },
    [upsertSavedResult],
  );

  const clearAll = useCallback(() => {
    polygonListenersRef.current.forEach((listener) => listener.remove());
    polygonListenersRef.current = [];

    polygons.forEach((polygon) => polygon.setMap(null));
    setPolygons([]);
    setResult(null);
    setIsDrawing(false);
    activeResultIdRef.current = null;
  }, [polygons]);

  const startDrawing = useCallback(() => {
    activeResultIdRef.current = null;
    setIsDrawing(true);
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const deleteSavedResult = useCallback((id: string) => {
    setSavedResults((prev) => prev.filter((item) => item.id !== id));

    if (activeResultIdRef.current === id) {
      activeResultIdRef.current = null;
    }
  }, []);

  const clearSavedResults = useCallback(() => {
    setSavedResults([]);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    result,
    savedResults,
    isDrawing,
    handlePolygonComplete,
    clearAll,
    startDrawing,
    stopDrawing,
    deleteSavedResult,
    clearSavedResults,
    polygonCount: polygons.length,
  };
}
