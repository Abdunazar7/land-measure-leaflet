import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeAreaResult,
  AreaResult,
  SavedAreaResult,
  LatLng,
} from "@/lib/geoUtils";

const STORAGE_KEY = "land-measure:saved-results";

export interface PolygonState {
  id: string;
  points: LatLng[];
}

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
  const [polygons, setPolygons] = useState<PolygonState[]>([]);
  const [savedResults, setSavedResults] = useState<SavedAreaResult[]>(() =>
    loadSavedResults(),
  );
  const [isDrawing, setIsDrawing] = useState(false);

  const activeResultIdRef = useRef<string | null>(null);

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

  const selectPolygon = useCallback(
    (id: string) => {
      const polygon = polygons.find((p) => p.id === id);
      if (!polygon) return;

      activeResultIdRef.current = id;
      const nextResult = computeAreaResult(polygon.points);
      if (nextResult.pointCount < 3 || nextResult.sqMeters <= 0) return;

      setResult(nextResult);
      upsertSavedResult(nextResult);
    },
    [polygons, upsertSavedResult],
  );

  const handlePolygonComplete = useCallback(
    (points: LatLng[]) => {
      if (points.length < 3) return;

      const id = crypto.randomUUID();
      activeResultIdRef.current = id;

      setPolygons((prev) => [{ id, points }, ...prev]);
      setIsDrawing(false);

      const nextResult = computeAreaResult(points);
      if (nextResult.pointCount < 3 || nextResult.sqMeters <= 0) return;

      setResult(nextResult);
      upsertSavedResult(nextResult);
    },
    [upsertSavedResult],
  );

  const updatePolygon = useCallback(
    (id: string, points: LatLng[]) => {
      setPolygons((prev) =>
        prev.map((p) => (p.id === id ? { ...p, points } : p)),
      );

      if (activeResultIdRef.current !== id) return;

      const nextResult = computeAreaResult(points);
      if (nextResult.pointCount < 3 || nextResult.sqMeters <= 0) return;

      setResult(nextResult);
      upsertSavedResult(nextResult);
    },
    [upsertSavedResult],
  );

  const clearAll = useCallback(() => {
    setPolygons([]);
    setResult(null);
    setIsDrawing(false);
    activeResultIdRef.current = null;
  }, []);

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
    polygons,
    activePolygonId: activeResultIdRef.current,
    handlePolygonComplete,
    updatePolygon,
    selectPolygon,
    clearAll,
    startDrawing,
    stopDrawing,
    deleteSavedResult,
    clearSavedResults,
    polygonCount: polygons.length,
  };
}
