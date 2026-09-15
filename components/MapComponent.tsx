"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AttributionControl,
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  ScaleControl,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import {
  computeAreaResult,
  formatArea,
  formatPerimeter,
  type LatLng,
} from "@/lib/geoUtils";
import { formatCoordinates, toViewbox } from "@/lib/geocode";
import {
  BASE_LAYERS,
  MAP_MAX_ZOOM,
  getBaseLayer,
  readStoredBaseLayer,
  storeBaseLayer,
  type BaseLayerId,
} from "@/lib/mapLayers";
import type { PolygonState } from "@/hooks/useAreaCalculator";
import type { GeolocationController } from "@/hooks/useGeolocation";

const DEFAULT_CENTER: LatLng = { lat: 41.2995, lng: 69.2401 };
const DEFAULT_ZOOM = 13;
const LIVE_DRAG_INTERVAL_MS = 80;

/** Where the map should look. `key` is bumped to replay the same target. */
export interface MapFocus {
  key: number;
  lat: number;
  lng: number;
  label?: string;
  detail?: string;
  /** [south, north, west, east] */
  bbox?: [number, number, number, number];
  zoom?: number;
  showMarker?: boolean;
}

/* Icons are plain DOM nodes, so no marker images have to be bundled. */
const vertexIcon = L.divIcon({
  className: "lm-vertex",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const firstVertexIcon = L.divIcon({
  className: "lm-vertex lm-vertex-first",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const midpointIcon = L.divIcon({
  className: "lm-midpoint",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const gpsIcon = L.divIcon({
  className: "lm-gps",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: '<span class="lm-gps-pulse"></span><span class="lm-gps-dot"></span>',
});

const searchPinIcon = L.divIcon({
  className: "lm-pin",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
  html: '<span class="lm-pin-body"></span>',
});

const polygonStyle = {
  color: "#4ade80",
  weight: 2.5,
  fillColor: "#22c55e",
  fillOpacity: 0.18,
};

const draftLineStyle = {
  color: "#22c55e",
  weight: 2.5,
  dashArray: "6 8",
};

const accuracyStyle = {
  color: "#60a5fa",
  weight: 1,
  fillColor: "#3b82f6",
  fillOpacity: 0.12,
};

interface Props {
  polygons: PolygonState[];
  activePolygonId: string | null;
  isDrawing: boolean;
  onPolygonComplete: (points: LatLng[]) => void;
  onPolygonChange: (id: string, points: LatLng[]) => void;
  onPolygonSelect: (id: string) => void;
  onPolygonDelete?: (id: string) => void;
  onStopDrawing: () => void;
  focus?: MapFocus | null;
  /** Nominatim viewbox of the visible area, used to bias search results. */
  onViewportChange?: (viewbox: string) => void;
  gps: GeolocationController;
}

/* ---------------------------------------------------------------- helpers */

function ViewportReporter({
  onChange,
}: {
  onChange?: (viewbox: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onChange) return;

    const report = () => {
      const bounds = map.getBounds();
      onChange(
        toViewbox({
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
          south: bounds.getSouth(),
        }),
      );
    };

    report();
    map.on("moveend zoomend", report);

    return () => {
      map.off("moveend zoomend", report);
    };
  }, [map, onChange]);

  return null;
}

function MapEvents({
  isDrawing,
  onAddPoint,
  onFinish,
  onUserDrag,
}: {
  isDrawing: boolean;
  onAddPoint: (point: LatLng) => void;
  onFinish: () => void;
  onUserDrag: () => void;
}) {
  useMapEvents({
    click(event) {
      if (!isDrawing) return;
      onAddPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    dblclick() {
      if (!isDrawing) return;
      onFinish();
    },
    dragstart() {
      onUserDrag();
    },
  });

  return null;
}

function MapController({
  isDrawing,
  focus,
  gps,
}: {
  isDrawing: boolean;
  focus?: MapFocus | null;
  gps: GeolocationController;
}) {
  const map = useMap();
  const handledFocusRef = useRef<number | null>(null);
  const handledCenterRef = useRef<number>(0);

  /* Keep the map sized correctly (layout changes, fullscreen, orientation). */
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());

    return () => observer.disconnect();
  }, [map]);

  /* While drawing, a double click must close the shape instead of zooming. */
  useEffect(() => {
    const container = map.getContainer();
    container.classList.toggle("lm-drawing", isDrawing);

    if (isDrawing) map.doubleClickZoom.disable();
    else map.doubleClickZoom.enable();

    return () => {
      container.classList.remove("lm-drawing");
      map.doubleClickZoom.enable();
    };
  }, [isDrawing, map]);

  /* Search result / saved measurement focus. */
  useEffect(() => {
    if (!focus || handledFocusRef.current === focus.key) return;
    handledFocusRef.current = focus.key;

    if (focus.bbox) {
      const [south, north, west, east] = focus.bbox;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { maxZoom: focus.zoom ?? 17, padding: [32, 32] },
      );
      return;
    }

    map.flyTo([focus.lat, focus.lng], focus.zoom ?? 17, { duration: 0.8 });
  }, [focus, map]);

  /* GPS: centre on request, then keep following until the user pans away. */
  useEffect(() => {
    const position = gps.position;
    if (!position) return;

    if (handledCenterRef.current !== gps.centerRequestId) {
      handledCenterRef.current = gps.centerRequestId;
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 17), {
        duration: 0.8,
      });
      return;
    }

    if (gps.follow) {
      map.panTo([position.lat, position.lng], { animate: true });
    }
  }, [gps.position, gps.centerRequestId, gps.follow, map]);

  return null;
}

function midpoint(a: LatLng, b: LatLng): LatLng {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

/* ------------------------------------------------------------- component */

export default function MapComponent({
  polygons,
  activePolygonId,
  isDrawing,
  onPolygonComplete,
  onPolygonChange,
  onPolygonSelect,
  onPolygonDelete,
  onStopDrawing,
  focus,
  onViewportChange,
  gps,
}: Props) {
  const { t } = useTranslation();

  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  // The map only renders on the client, so reading storage here is safe.
  const [baseLayerId, setBaseLayerId] =
    useState<BaseLayerId>(readStoredBaseLayer);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchMarkerRef = useRef<LeafletMarker | null>(null);
  const dragThrottleRef = useRef(0);

  const baseLayer = getBaseLayer(baseLayerId);

  const selectBaseLayer = (id: BaseLayerId) => {
    setBaseLayerId(id);
    storeBaseLayer(id);
    setIsLayerMenuOpen(false);
  };

  /* --------------------------------------------------------- drawing */

  const canFinish = draftPoints.length >= 3;

  const addPoint = useCallback((point: LatLng) => {
    setDraftPoints((prev) => {
      const last = prev[prev.length - 1];
      // Ignore an accidental double hit on the very same spot.
      if (last && last.lat === point.lat && last.lng === point.lng) return prev;
      return [...prev, point];
    });
  }, []);

  const undoPoint = useCallback(() => {
    setDraftPoints((prev) => prev.slice(0, -1));
  }, []);

  const finishDrawing = useCallback(() => {
    setDraftPoints((prev) => {
      if (prev.length < 3) return prev;
      onPolygonComplete(prev);
      return [];
    });
  }, [onPolygonComplete]);

  const cancelDrawing = useCallback(() => {
    setDraftPoints([]);
    onStopDrawing();
  }, [onStopDrawing]);

  // Drawing mode is owned by the parent (sidebar buttons can turn it off),
  // so the local draft has to follow it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isDrawing) setDraftPoints([]);
  }, [isDrawing]);

  useEffect(() => {
    if (!isDrawing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelDrawing();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        finishDrawing();
        return;
      }

      const isUndo =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";

      if (isUndo || event.key === "Backspace") {
        event.preventDefault();
        undoPoint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawing, cancelDrawing, finishDrawing, undoPoint]);

  /* Live readout of the shape being drawn. */
  const draftMeasure = useMemo(() => {
    if (draftPoints.length < 3) return null;
    return computeAreaResult(draftPoints);
  }, [draftPoints]);

  /* --------------------------------------------------------- editing */

  const moveVertex = useCallback(
    (poly: PolygonState, index: number, next: LatLng, isFinal: boolean) => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      if (!isFinal && now - dragThrottleRef.current < LIVE_DRAG_INTERVAL_MS) {
        return;
      }
      dragThrottleRef.current = now;

      onPolygonChange(
        poly.id,
        poly.points.map((point, i) => (i === index ? next : point)),
      );
    },
    [onPolygonChange],
  );

  const removeVertex = useCallback(
    (poly: PolygonState, index: number) => {
      if (poly.points.length <= 3) return;
      onPolygonChange(
        poly.id,
        poly.points.filter((_, i) => i !== index),
      );
    },
    [onPolygonChange],
  );

  const insertVertex = useCallback(
    (poly: PolygonState, index: number, point: LatLng) => {
      const next = [...poly.points];
      next.splice(index + 1, 0, point);
      onPolygonChange(poly.id, next);
    },
    [onPolygonChange],
  );

  /* ------------------------------------------------------- fullscreen */

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void wrapperRef.current?.requestFullscreen?.();
  };

  /* ------------------------------------------------------ search pin */

  useEffect(() => {
    if (!focus?.showMarker) return;

    const timer = window.setTimeout(
      () => searchMarkerRef.current?.openPopup(),
      600,
    );

    return () => window.clearTimeout(timer);
  }, [focus]);

  /* ------------------------------------------------------------- GPS */

  const gpsError = gps.errorCode ? t(`gps.errors.${gps.errorCode}`) : null;

  const locateTitle =
    gps.status === "locating"
      ? t("gps.locating")
      : gps.status === "error"
        ? (gpsError ?? t("gps.locate"))
        : gps.follow && gps.status === "active"
          ? t("gps.following")
          : t("gps.locate");

  const locateStateClass =
    gps.status === "error"
      ? "border-red-500/40 text-red-300"
      : gps.status === "active"
        ? gps.follow
          ? "border-blue-400/60 text-blue-300"
          : "border-slate-600 text-blue-200"
        : "border-slate-600 text-slate-200";

  return (
    <div ref={wrapperRef} className="relative flex h-full min-h-0 flex-1">
      <MapContainer
        className="h-full w-full"
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <MapEvents
          isDrawing={isDrawing}
          onAddPoint={addPoint}
          onFinish={finishDrawing}
          onUserDrag={() => {
            if (gps.follow) gps.setFollow(false);
          }}
        />
        <MapController isDrawing={isDrawing} focus={focus} gps={gps} />
        <ViewportReporter onChange={onViewportChange} />

        <TileLayer
          key={`${baseLayer.id}-base`}
          url={baseLayer.base.url}
          attribution={baseLayer.base.attribution}
          subdomains={baseLayer.base.subdomains ?? "abc"}
          maxNativeZoom={baseLayer.base.maxNativeZoom}
          maxZoom={MAP_MAX_ZOOM}
          detectRetina
        />
        {baseLayer.overlay && (
          <TileLayer
            key={`${baseLayer.id}-overlay`}
            url={baseLayer.overlay.url}
            attribution={baseLayer.overlay.attribution}
            maxNativeZoom={baseLayer.overlay.maxNativeZoom}
            maxZoom={MAP_MAX_ZOOM}
            zIndex={2}
          />
        )}

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" metric imperial={false} />
        <AttributionControl position="bottomleft" prefix={false} />

        {/* Saved shapes ------------------------------------------------ */}
        {polygons.map((poly) => {
          const isActive = poly.id === activePolygonId;
          const measure = computeAreaResult(poly.points);
          const area = formatArea(measure);

          return (
            <Polygon
              key={poly.id}
              positions={poly.points.map((point) => [point.lat, point.lng])}
              pathOptions={{
                ...polygonStyle,
                weight: isActive ? 3.5 : 2.5,
                fillOpacity: isActive ? 0.25 : 0.15,
              }}
              eventHandlers={{
                click: () => {
                  if (isDrawing) return;
                  onPolygonSelect(poly.id);
                },
              }}
            >
              <Tooltip permanent direction="center" className="lm-area-label">
                {area.value} {area.unit}
              </Tooltip>

              {!isDrawing && (
                <Popup>
                  <div className="lm-popup">
                    <p className="lm-popup-title">
                      {area.value} {area.unit}
                    </p>
                    <p className="lm-popup-row">
                      {t("sidebar.perimeter")}:{" "}
                      {formatPerimeter(measure.perimeter)}
                    </p>
                    <p className="lm-popup-row">
                      {t("map.pointsAdded", { count: poly.points.length })}
                    </p>
                    {onPolygonDelete && (
                      <button
                        type="button"
                        className="lm-popup-danger"
                        onClick={() => onPolygonDelete(poly.id)}
                      >
                        {t("map.deletePolygon")}
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </Polygon>
          );
        })}

        {/* Vertex handles -------------------------------------------- */}
        {!isDrawing &&
          polygons.map((poly) =>
            poly.points.map((point, index) => (
              <Marker
                key={`${poly.id}:v${index}`}
                position={[point.lat, point.lng]}
                icon={vertexIcon}
                draggable
                keyboard={false}
                title={t("map.vertexHint")}
                zIndexOffset={400}
                eventHandlers={{
                  drag: (event) => {
                    const next = (event.target as LeafletMarker).getLatLng();
                    moveVertex(
                      poly,
                      index,
                      { lat: next.lat, lng: next.lng },
                      false,
                    );
                  },
                  dragend: (event) => {
                    const next = (event.target as LeafletMarker).getLatLng();
                    moveVertex(
                      poly,
                      index,
                      { lat: next.lat, lng: next.lng },
                      true,
                    );
                  },
                  click: () => onPolygonSelect(poly.id),
                  dblclick: () => removeVertex(poly, index),
                  contextmenu: () => removeVertex(poly, index),
                }}
              />
            )),
          )}

        {/* Midpoint handles for the selected shape -------------------- */}
        {!isDrawing &&
          polygons
            .filter((poly) => poly.id === activePolygonId)
            .map((poly) =>
              poly.points.map((point, index) => {
                const next = poly.points[(index + 1) % poly.points.length]!;
                const center = midpoint(point, next);

                return (
                  <Marker
                    key={`${poly.id}:m${index}`}
                    position={[center.lat, center.lng]}
                    icon={midpointIcon}
                    keyboard={false}
                    title={t("map.insertPoint")}
                    zIndexOffset={300}
                    eventHandlers={{
                      click: () => insertVertex(poly, index, center),
                    }}
                  />
                );
              }),
            )}

        {/* Shape being drawn ----------------------------------------- */}
        {draftPoints.length > 0 && (
          <>
            {canFinish ? (
              <Polygon
                positions={draftPoints.map((point) => [point.lat, point.lng])}
                pathOptions={{ ...polygonStyle, fillOpacity: 0.12 }}
                interactive={false}
              />
            ) : (
              <Polyline
                positions={draftPoints.map((point) => [point.lat, point.lng])}
                pathOptions={draftLineStyle}
                interactive={false}
              />
            )}

            {draftPoints.map((point, index) => (
              <Marker
                key={`draft:${index}`}
                position={[point.lat, point.lng]}
                icon={index === 0 ? firstVertexIcon : vertexIcon}
                keyboard={false}
                title={index === 0 ? t("map.closeRing") : undefined}
                zIndexOffset={500}
                eventHandlers={{
                  click: () => {
                    if (index === 0 && canFinish) finishDrawing();
                  },
                }}
              />
            ))}
          </>
        )}

        {/* Search result pin ----------------------------------------- */}
        {focus?.showMarker && (
          <Marker
            key={`focus:${focus.key}`}
            ref={searchMarkerRef}
            position={[focus.lat, focus.lng]}
            icon={searchPinIcon}
            zIndexOffset={600}
          >
            <Popup>
              <div className="lm-popup">
                <p className="lm-popup-title">{focus.label ?? t("map.place")}</p>
                {focus.detail && <p className="lm-popup-row">{focus.detail}</p>}
                <p className="lm-popup-row lm-popup-mono">
                  {formatCoordinates({ lat: focus.lat, lng: focus.lng })}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live location --------------------------------------------- */}
        {gps.position && (
          <>
            <Circle
              center={[gps.position.lat, gps.position.lng]}
              radius={Math.max(gps.position.accuracy, 8)}
              pathOptions={accuracyStyle}
              interactive={false}
            />
            <Marker
              position={[gps.position.lat, gps.position.lng]}
              icon={gpsIcon}
              zIndexOffset={700}
              keyboard={false}
            >
              <Popup>
                <div className="lm-popup">
                  <p className="lm-popup-title">{t("gps.youAreHere")}</p>
                  {gps.address && (
                    <p className="lm-popup-row">{gps.address.name}</p>
                  )}
                  <p className="lm-popup-row lm-popup-mono">
                    {formatCoordinates(gps.position)}
                  </p>
                  <p className="lm-popup-row">
                    {t("gps.accuracy", {
                      metres: Math.round(gps.position.accuracy),
                    })}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Mode chip ---------------------------------------------------- */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1100] max-w-[calc(100%-7rem)] space-y-2">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0f1117]/90 px-3 py-2 backdrop-blur-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              isDrawing ? "pulse-dot bg-green-400" : "bg-slate-500"
            }`}
          />
          <span className="text-xs font-medium text-slate-300">
            {isDrawing ? t("map.modeDraw") : t("map.modeEdit")}
          </span>
        </div>

        {isDrawing && (
          <div className="rounded-xl border border-green-500/25 bg-[#0f1117]/90 px-3 py-2 text-xs text-green-300 backdrop-blur-sm">
            <p>
              {t("map.pointsAdded", { count: draftPoints.length })} ·{" "}
              {canFinish ? t("map.readyToFinish") : t("map.needMorePoints")}
            </p>
            {draftMeasure && (
              <p className="mt-1 font-mono text-[11px] text-white">
                {formatArea(draftMeasure).value} {formatArea(draftMeasure).unit}{" "}
                · {formatPerimeter(draftMeasure.perimeter)}
              </p>
            )}
          </div>
        )}

        {gpsError && (
          <div className="rounded-xl border border-red-500/30 bg-[#0f1117]/90 px-3 py-2 text-xs text-red-300 backdrop-blur-sm">
            {gpsError}
          </div>
        )}
      </div>

      {/* Map type switcher ------------------------------------------- */}
      <div className="absolute right-3 top-3 z-[1100] flex flex-col items-end gap-2">
        <div
          className="overflow-hidden rounded-xl border border-slate-700 bg-[#0f1117]/92 backdrop-blur-sm"
          onMouseLeave={() => setIsLayerMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen((open) => !open)}
            aria-expanded={isLayerMenuOpen}
            title={t("map.layerTitle")}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5"
          >
            <span aria-hidden="true">{baseLayer.icon}</span>
            <span className="hidden sm:inline">{t(baseLayer.labelKey)}</span>
            <span className="text-[10px] text-slate-500">
              {isLayerMenuOpen ? "▲" : "▼"}
            </span>
          </button>

          {isLayerMenuOpen && (
            <div className="border-t border-slate-700/70 p-1">
              {BASE_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => selectBaseLayer(layer.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                    layer.id === baseLayerId
                      ? "bg-green-500/15 text-green-300"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span aria-hidden="true">{layer.icon}</span>
                  <span className="whitespace-nowrap">{t(layer.labelKey)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? t("map.exitFullscreen") : t("map.fullscreen")}
          aria-label={
            isFullscreen ? t("map.exitFullscreen") : t("map.fullscreen")
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-[#0f1117]/92 text-sm text-slate-200 backdrop-blur-sm hover:bg-white/5"
        >
          {isFullscreen ? "🗗" : "⛶"}
        </button>
      </div>

      {/* Locate button ---------------------------------------------- */}
      <button
        type="button"
        onClick={() => gps.locate()}
        title={locateTitle}
        aria-label={locateTitle}
        className={`absolute bottom-24 right-3 z-[1100] flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0f1117]/92 text-base backdrop-blur-sm hover:bg-white/5 ${locateStateClass}`}
      >
        {gps.status === "locating" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span aria-hidden="true">◎</span>
        )}
      </button>

      {/* Bottom bar -------------------------------------------------- */}
      {isDrawing ? (
        <div className="absolute bottom-3 left-1/2 z-[1100] flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-slate-700 bg-[#0f1117]/95 p-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={undoPoint}
            disabled={draftPoints.length === 0}
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-35"
          >
            ↶ {t("map.undo")}
          </button>
          <button
            type="button"
            onClick={finishDrawing}
            disabled={!canFinish}
            className="rounded-xl bg-green-500 px-3.5 py-2 text-xs font-bold text-black disabled:opacity-35"
          >
            {t("map.finish")}
          </button>
          <button
            type="button"
            onClick={cancelDrawing}
            className="rounded-xl border border-amber-500/25 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10"
          >
            {t("map.cancel")}
          </button>
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1100] hidden -translate-x-1/2 rounded-full border border-slate-700 bg-[#0f1117]/90 px-4 py-2 backdrop-blur-sm sm:block">
          <p className="whitespace-nowrap text-xs text-slate-400">
            💡 {t("map.tipEdit")}
          </p>
        </div>
      )}
    </div>
  );
}
