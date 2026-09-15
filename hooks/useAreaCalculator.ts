"use client";
import { useCallback, useEffect, useState } from "react";
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

    const parsedValue: unknown = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as SavedAreaResult[]) : [];
  } catch {
    return [];
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAreaCalculator() {
  const [result, setResult] = useState<AreaResult | null>(null);
  const [polygons, setPolygons] = useState<PolygonState[]>([]);
  const [activePolygonId, setActivePolygonId] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedAreaResult[]>(() =>
    loadSavedResults(),
  );
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedResults));
    } catch {
      // Storage may be full or unavailable; measuring still works.
    }
  }, [savedResults]);

  /** Recomputes the area of a shape and mirrors it into the saved list. */
  const commitMeasurement = useCallback((id: string, points: LatLng[]) => {
    const nextResult = computeAreaResult(points);
    if (nextResult.pointCount < 3 || nextResult.sqMeters <= 0) return;

    setResult(nextResult);

    const timestamp = new Date().toISOString();
    setSavedResults((prev) => {
      const existing = prev.find((item) => item.id === id);
      const others = prev.filter((item) => item.id !== id);

      const nextEntry: SavedAreaResult = {
        ...nextResult,
        id,
        label: existing?.label ?? `#${others.length + 1}`,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        points,
      };

      return [nextEntry, ...others];
    });
  }, []);

  const handlePolygonComplete = useCallback(
    (points: LatLng[]) => {
      if (points.length < 3) return;

      const id = createId();

      setPolygons((prev) => [{ id, points }, ...prev]);
      setActivePolygonId(id);
      setIsDrawing(false);
      commitMeasurement(id, points);
    },
    [commitMeasurement],
  );

  const updatePolygon = useCallback(
    (id: string, points: LatLng[]) => {
      setPolygons((prev) =>
        prev.map((polygon) =>
          polygon.id === id ? { ...polygon, points } : polygon,
        ),
      );
      setActivePolygonId(id);
      commitMeasurement(id, points);
    },
    [commitMeasurement],
  );

  const selectPolygon = useCallback(
    (id: string) => {
      const polygon = polygons.find((item) => item.id === id);
      if (!polygon) return;

      setActivePolygonId(id);
      commitMeasurement(id, polygon.points);
    },
    [polygons, commitMeasurement],
  );

  const deletePolygon = useCallback(
    (id: string) => {
      setPolygons((prev) => prev.filter((polygon) => polygon.id !== id));

      if (activePolygonId === id) {
        setActivePolygonId(null);
        setResult(null);
      }
    },
    [activePolygonId],
  );

  /**
   * Brings a saved measurement back onto the map (it survives a page reload)
   * and returns its outline so the caller can zoom to it.
   */
  const showSavedResult = useCallback(
    (id: string): LatLng[] | null => {
      const onMap = polygons.find((polygon) => polygon.id === id);
      if (onMap) {
        setActivePolygonId(id);
        setResult(computeAreaResult(onMap.points));
        return onMap.points;
      }

      const saved = savedResults.find((item) => item.id === id);
      const points = saved?.points;
      if (!points || points.length < 3) return null;

      setPolygons((prev) => [{ id, points }, ...prev]);
      setActivePolygonId(id);
      setResult(computeAreaResult(points));
      return points;
    },
    [polygons, savedResults],
  );

  const clearAll = useCallback(() => {
    setPolygons([]);
    setResult(null);
    setIsDrawing(false);
    setActivePolygonId(null);
  }, []);

  const startDrawing = useCallback(() => {
    setActivePolygonId(null);
    setIsDrawing(true);
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const deleteSavedResult = useCallback((id: string) => {
    setSavedResults((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearSavedResults = useCallback(() => {
    setSavedResults([]);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to do if storage is unavailable.
      }
    }
  }, []);

  return {
    result,
    savedResults,
    isDrawing,
    polygons,
    activePolygonId,
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
    polygonCount: polygons.length,
  };
}
