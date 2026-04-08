"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayersControl,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geoUtils";
import type { PolygonState } from "@/hooks/useAreaCalculator";
import { useTranslation } from "react-i18next";

const DEFAULT_CENTER: LatLng = { lat: 41.2995, lng: 69.2401 };

// Fix default marker icons under bundlers (Next).
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const DefaultIcon = L.icon({
  iconUrl:
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require("leaflet/dist/images/marker-icon.png").default ??
    require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl:
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require("leaflet/dist/images/marker-icon-2x.png").default ??
    require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl:
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require("leaflet/dist/images/marker-shadow.png").default ??
    require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const polygonPathOptions = {
  color: "#4ade80",
  weight: 2.5,
  fillColor: "#22c55e",
  fillOpacity: 0.2,
};

const draftPathOptions = {
  color: "#22c55e",
  weight: 2.5,
  dashArray: "6 8",
};

interface Props {
  polygons?: PolygonState[];
  activePolygonId?: string | null;
  onPolygonComplete: (points: LatLng[]) => void;
  onPolygonChange?: (id: string, points: LatLng[]) => void;
  onPolygonSelect?: (id: string) => void;
  isDrawing: boolean;
  onMapLoad?: (map: LeafletMap) => void;
  onStopDrawing?: () => void;
  searchTarget?: LatLng | null;
}

export default function MapComponent({
  onPolygonComplete,
  polygons = [],
  activePolygonId = null,
  onPolygonChange,
  onPolygonSelect,
  isDrawing,
  onMapLoad,
  onStopDrawing,
  searchTarget,
}: Props) {
  const { t } = useTranslation();
  const mapRef = useRef<LeafletMap | null>(null);
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);

  const setMap = useCallback(
    (map: LeafletMap) => {
      mapRef.current = map;
      onMapLoad?.(map);
    },
    [onMapLoad],
  );

  useEffect(() => {
    if (!onStopDrawing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onStopDrawing();
        setDraftPoints([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStopDrawing]);

  useEffect(() => {
    if (!searchTarget || !mapRef.current) return;
    mapRef.current.setView([searchTarget.lat, searchTarget.lng], 16, {
      animate: true,
    });
  }, [searchTarget]);

  const canFinish = draftPoints.length >= 3;

  const finishDrawing = useCallback(() => {
    if (!canFinish) return;
    onPolygonComplete(draftPoints);
    setDraftPoints([]);
  }, [canFinish, draftPoints, onPolygonComplete]);

  const cancelDrawing = useCallback(() => {
    onStopDrawing?.();
    setDraftPoints([]);
  }, [onStopDrawing]);

  const MapEvents = useMemo(() => {
    function Events() {
      useMapEvents({
        click(e) {
          if (!isDrawing) return;
          setDraftPoints((prev) => [
            ...prev,
            { lat: e.latlng.lat, lng: e.latlng.lng },
          ]);
        },
        dblclick() {
          if (!isDrawing) return;
          setDraftPoints((prev) => {
            if (prev.length >= 3) {
              onPolygonComplete(prev);
              return [];
            }
            return prev;
          });
        },
      });
      return null;
    }
    return Events;
  }, [isDrawing, onPolygonComplete]);

  return (
    <div className="relative flex h-full min-h-0 flex-1">
      <MapContainer
        className="h-full w-full"
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={13}
        scrollWheelZoom
        zoomControl
        ref={(map) => {
          if (map) setMap(map);
        }}
        style={{ cursor: isDrawing ? "crosshair" : undefined }}
      >
        <MapEvents />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={t("map.layerStreet")}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t("map.layerSatellite")}>
            <TileLayer
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {polygons.map((poly) => (
          <Polygon
            key={poly.id}
            pathOptions={{
              ...polygonPathOptions,
              weight: poly.id === activePolygonId ? 3.5 : 2.5,
              fillOpacity: poly.id === activePolygonId ? 0.25 : 0.18,
            }}
            positions={poly.points.map((p) => [p.lat, p.lng])}
            eventHandlers={{
              click: () => onPolygonSelect?.(poly.id),
            }}
          />
        ))}

        {!isDrawing &&
          polygons.map((poly) =>
            poly.points.map((p, idx) => (
              <Marker
                key={`${poly.id}:${idx}`}
                position={[p.lat, p.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    if (!onPolygonChange) return;
                    const marker = e.target as L.Marker;
                    const next = marker.getLatLng();
                    const nextPoints = poly.points.map((pt, i) =>
                      i === idx ? { lat: next.lat, lng: next.lng } : pt,
                    );
                    onPolygonChange(poly.id, nextPoints);
                  },
                  click: () => onPolygonSelect?.(poly.id),
                }}
              />
            )),
          )}

        {draftPoints.length > 0 && (
          <>
            <Polyline
              pathOptions={draftPathOptions}
              positions={draftPoints.map((p) => [p.lat, p.lng])}
            />
            {draftPoints.length >= 3 && (
              <Polygon
                pathOptions={{
                  ...polygonPathOptions,
                  fillOpacity: 0.12,
                  dashArray: "6 8",
                }}
                positions={draftPoints.map((p) => [p.lat, p.lng])}
              />
            )}
            {draftPoints.map((p, idx) => (
              <Marker key={`draft:${idx}`} position={[p.lat, p.lng]} />
            ))}
          </>
        )}
      </MapContainer>

      {isDrawing && onStopDrawing && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            onClick={finishDrawing}
            disabled={!canFinish}
            className="rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 shadow-lg backdrop-blur-sm disabled:opacity-40"
          >
            {t("map.finish")}
          </button>
          <button
            type="button"
            onClick={cancelDrawing}
            className="rounded-xl border border-amber-500/20 bg-[#0f1117]/90 px-3 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-sm"
          >
            {t("map.cancel")}
          </button>
        </div>
      )}

      {/* Mode indicator */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 sm:right-auto rounded-xl border border-slate-700 bg-[#0f1117]/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isDrawing ? "bg-green-400 pulse-dot" : "bg-slate-500"}`}
          />
          <span className="text-xs font-medium text-slate-300">
            {isDrawing ? t("map.modeDraw") : t("map.modeEdit")}
          </span>
        </div>
      </div>

      {isDrawing && (
        <div className="pointer-events-none absolute top-16 left-3 rounded-xl border border-green-500/25 bg-[#0f1117]/90 px-3 py-2 text-xs text-green-300 backdrop-blur-sm">
          {t("map.pointsAdded", { count: draftPoints.length })}{" "}
          {canFinish ? t("map.howToFinishReady") : t("map.howToFinish")}
        </div>
      )}

      {/* Tip */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-2xl border border-slate-700 bg-[#0f1117]/90 px-4 py-2 backdrop-blur-sm sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-full">
        <p className="text-center text-xs text-slate-400 sm:text-left">
          {isDrawing ? t("map.tipDraw") : t("map.tipEdit")}
        </p>
      </div>
    </div>
  );
}
