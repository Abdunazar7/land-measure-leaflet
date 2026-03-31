export interface AreaResult {
  sqMeters: number;
  sotka: number;
  hectares: number;
  sqKm: number;
  acres: number;
  perimeter: number;
  perimeterKm: number;
  pointCount: number;
}

export interface SavedAreaResult extends AreaResult {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export function computeAreaResult(
  path: google.maps.LatLng[],
  pointCount: number,
): AreaResult {
  if (path.length < 3) {
    return {
      sqMeters: 0,
      sotka: 0,
      hectares: 0,
      sqKm: 0,
      acres: 0,
      perimeter: 0,
      perimeterKm: 0,
      pointCount,
    };
  }

  const areaSqM = google.maps.geometry.spherical.computeArea(path);
  const closedPath = path[0] ? [...path, path[0]] : path;
  const perimeterM = google.maps.geometry.spherical.computeLength(closedPath);

  return {
    sqMeters: areaSqM,
    sotka: areaSqM / 100,
    hectares: areaSqM / 10_000,
    sqKm: areaSqM / 1_000_000,
    acres: areaSqM / 4046.86,
    perimeter: perimeterM,
    perimeterKm: perimeterM / 1000,
    pointCount,
  };
}

export function formatArea(result: AreaResult): {
  value: string;
  unit: string;
  label: string;
} {
  const { sqMeters, sotka, hectares, sqKm } = result;

  if (sqMeters < 1000) {
    return { value: sqMeters.toFixed(1), unit: "m²", label: "Kvadrat metr" };
  } else if (sqMeters < 10_000) {
    return { value: sotka.toFixed(2), unit: "sotka", label: "Sotka" };
  } else if (sqMeters < 1_000_000) {
    return { value: hectares.toFixed(3), unit: "ga", label: "Gektar" };
  }

  return { value: sqKm.toFixed(4), unit: "km²", label: "Kvadrat km" };
}

export function formatPerimeter(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(1)} m`;
  return `${(meters / 1000).toFixed(3)} km`;
}
