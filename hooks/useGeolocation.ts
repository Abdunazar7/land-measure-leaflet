"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { reverseGeocode, type GeoPlace } from "@/lib/geocode";

export type GeoStatus = "idle" | "locating" | "active" | "error";

export type GeoErrorCode =
  | "unsupported"
  | "insecure"
  | "denied"
  | "unavailable"
  | "timeout";

export interface GeoPositionInfo {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GeolocationController {
  status: GeoStatus;
  position: GeoPositionInfo | null;
  address: GeoPlace | null;
  errorCode: GeoErrorCode | null;
  follow: boolean;
  /** Bumped every time the user asks the map to centre on them. */
  centerRequestId: number;
  locate: () => void;
  stop: () => void;
  setFollow: (value: boolean) => void;
}

const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20_000,
  maximumAge: 5_000,
};

/** Metres between two points — good enough to decide when to re-resolve the address. */
function roughDistance(a: GeoPositionInfo, b: GeoPositionInfo): number {
  const latMetres = (a.lat - b.lat) * 111_320;
  const lngMetres =
    (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(latMetres, lngMetres);
}

function mapErrorCode(code: number): GeoErrorCode {
  if (code === 1) return "denied";
  if (code === 3) return "timeout";
  return "unavailable";
}

export function useGeolocation({
  lang,
  resolveAddress = true,
}: { lang?: string; resolveAddress?: boolean } = {}): GeolocationController {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<GeoPositionInfo | null>(null);
  const [address, setAddress] = useState<GeoPlace | null>(null);
  const [errorCode, setErrorCode] = useState<GeoErrorCode | null>(null);
  const [follow, setFollow] = useState(false);
  const [centerRequestId, setCenterRequestId] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const addressAnchorRef = useRef<GeoPositionInfo | null>(null);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => clearWatch, [clearWatch]);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setErrorCode("unsupported");
      return;
    }

    // Browsers only expose geolocation over https:// (localhost counts as secure).
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setStatus("error");
      setErrorCode("insecure");
      return;
    }

    setErrorCode(null);
    setFollow(true);
    setCenterRequestId((id) => id + 1);

    if (watchIdRef.current !== null) {
      // Already watching — the centre request above is enough.
      return;
    }

    setStatus("locating");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          timestamp: pos.timestamp,
        });
        setStatus("active");
        setErrorCode(null);
      },
      (err) => {
        clearWatch();
        setStatus("error");
        setErrorCode(mapErrorCode(err.code));
      },
      WATCH_OPTIONS,
    );
  }, [clearWatch]);

  const stop = useCallback(() => {
    clearWatch();
    setStatus("idle");
    setPosition(null);
    setAddress(null);
    setErrorCode(null);
    setFollow(false);
    addressAnchorRef.current = null;
  }, [clearWatch]);

  // Resolve a human-readable address, refreshed only when the user really moved.
  useEffect(() => {
    if (!resolveAddress || !position) return;

    const anchor = addressAnchorRef.current;
    if (anchor && roughDistance(anchor, position) < 60) return;

    addressAnchorRef.current = position;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void reverseGeocode(position, { lang, signal: controller.signal })
        .then((place) => {
          if (place) setAddress(place);
        })
        .catch(() => {
          // A missing address is not worth surfacing.
        });
    }, 600);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [position, lang, resolveAddress]);

  return {
    status,
    position,
    address,
    errorCode,
    follow,
    centerRequestId,
    locate,
    stop,
    setFollow,
  };
}
