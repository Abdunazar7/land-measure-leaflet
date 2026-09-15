"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  formatCoordinates,
  parseCoordinates,
  placeIcon,
  searchPlaces,
  type GeoPlace,
} from "@/lib/geocode";

const RECENT_KEY = "land-measure:recent-searches";
const RECENT_LIMIT = 5;
const DEBOUNCE_MS = 350;
const MIN_QUERY = 2;

interface Props {
  onSelect: (place: GeoPlace) => void;
  /** Nominatim viewbox of the current map view, used to bias results. */
  getViewbox?: () => string | null;
}

interface SearchState {
  /** Query these results belong to. */
  query: string;
  status: "loading" | "done" | "error";
  results: GeoPlace[];
}

const EMPTY_SEARCH: SearchState = { query: "", status: "done", results: [] };

function loadRecent(): GeoPlace[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GeoPlace[]) : [];
  } catch {
    return [];
  }
}

function storeRecent(places: GeoPlace[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(places));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

interface DropdownRect {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  flipped: boolean;
}

export default function SearchBox({ onSelect, getViewbox }: Props) {
  const { t, i18n } = useTranslation();

  const [value, setValue] = useState("");
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  // The list is only rendered inside the (initially closed) panel, so reading
  // storage during the first client render cannot break hydration.
  const [recent, setRecent] = useState<GeoPlace[]>(loadRecent);
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [rect, setRect] = useState<DropdownRect | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = value.trim();
  const coordinateMatch = useMemo(() => parseCoordinates(value), [value]);

  const coordinatePlace = useMemo<GeoPlace | null>(() => {
    if (!coordinateMatch) return null;

    return {
      id: `coords:${coordinateMatch.lat},${coordinateMatch.lng}`,
      lat: coordinateMatch.lat,
      lng: coordinateMatch.lng,
      name: formatCoordinates(coordinateMatch),
      detail: t("search.coordinates"),
      category: "place",
    };
  }, [coordinateMatch, t]);

  const isQueryable = !coordinatePlace && trimmed.length >= MIN_QUERY;

  /* Fetch suggestions (debounced; the previous request is aborted). */
  useEffect(() => {
    if (!isQueryable) return;

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      setSearch((prev) => ({
        query: trimmed,
        status: "loading",
        // Keep showing the previous list while the new one loads.
        results: prev.results,
      }));

      searchPlaces(trimmed, {
        viewbox: getViewbox?.() ?? null,
        lang: i18n.language,
        signal: controller.signal,
      })
        .then((results) =>
          setSearch({ query: trimmed, status: "done", results }),
        )
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setSearch({ query: trimmed, status: "error", results: [] });
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, isQueryable, getViewbox, i18n.language]);

  const showRecent = trimmed.length === 0 && recent.length > 0;

  const options = useMemo<GeoPlace[]>(() => {
    if (coordinatePlace) return [coordinatePlace];
    if (showRecent) return recent;
    if (trimmed.length < MIN_QUERY) return [];
    return search.results;
  }, [coordinatePlace, showRecent, recent, trimmed, search.results]);

  const isLoading =
    isQueryable && (search.query !== trimmed || search.status === "loading");

  const hasFailed = search.status === "error" && search.query === trimmed;

  const showEmptyState =
    isQueryable &&
    search.query === trimmed &&
    search.status !== "loading" &&
    search.results.length === 0;

  const activeIndex = highlight < options.length ? highlight : -1;

  /* The panel is fixed-positioned so the sidebar cannot clip it. */
  const measure = useCallback(() => {
    const anchor = wrapperRef.current;
    if (!anchor) return;

    const box = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - box.bottom - 12;
    const spaceAbove = box.top - 12;
    const flipped = spaceBelow < 200 && spaceAbove > spaceBelow;

    setRect({
      left: box.left,
      top: flipped ? box.top : box.bottom + 6,
      width: box.width,
      maxHeight: Math.min(
        340,
        Math.max(140, flipped ? spaceAbove : spaceBelow),
      ),
      flipped,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isOpen, measure, options.length, isLoading]);

  /* Close when clicking anywhere else. */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (target.closest?.("[data-search-panel]")) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const commit = useCallback(
    (place: GeoPlace) => {
      onSelect(place);
      setValue(place.name);
      setIsOpen(false);
      setHighlight(-1);
      inputRef.current?.blur();

      setRecent((prev) => {
        const next = [
          place,
          ...prev.filter(
            (item) => item.lat !== place.lat || item.lng !== place.lng,
          ),
        ].slice(0, RECENT_LIMIT);

        storeRecent(next);
        return next;
      });
    },
    [onSelect],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (options.length === 0) return;

      event.preventDefault();
      setIsOpen(true);
      setHighlight(() => {
        const next = activeIndex + (event.key === "ArrowDown" ? 1 : -1);
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      const target = options[activeIndex] ?? options[0];
      if (target) {
        event.preventDefault();
        commit(target);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlight(-1);
    }
  };

  const clearInput = () => {
    setValue("");
    setSearch(EMPTY_SEARCH);
    setHighlight(-1);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    setRecent([]);
    storeRecent([]);
  };

  const panelVisible =
    isOpen && (options.length > 0 || isLoading || showEmptyState);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-sm text-slate-500">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setIsOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={panelVisible}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          autoComplete="off"
          spellCheck={false}
          placeholder={t("search.placeholder")}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 pl-9 pr-16 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          )}
          {value.length > 0 && (
            <button
              type="button"
              onClick={clearInput}
              aria-label={t("search.clear")}
              title={t("search.clear")}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {panelVisible && rect && (
        <div
          data-search-panel
          id="search-suggestions"
          role="listbox"
          style={{
            position: "fixed",
            left: rect.left,
            top: rect.flipped ? undefined : rect.top,
            bottom: rect.flipped
              ? window.innerHeight - rect.top + 6
              : undefined,
            width: rect.width,
            maxHeight: rect.maxHeight,
          }}
          className="z-[60] overflow-y-auto overscroll-contain rounded-xl border border-slate-700 bg-[#0f1117] p-1 shadow-2xl shadow-black/60"
        >
          {showRecent && (
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                {t("search.recent")}
              </span>
              <button
                type="button"
                onClick={clearRecent}
                className="text-[11px] text-slate-500 hover:text-red-400"
              >
                {t("search.clearRecent")}
              </button>
            </div>
          )}

          {options.map((place, index) => (
            <button
              key={`${place.id}:${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setHighlight(index)}
              onClick={() => commit(place)}
              className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left ${
                index === activeIndex ? "bg-green-500/10" : "hover:bg-white/5"
              }`}
            >
              <span className="mt-0.5 text-sm">
                {showRecent ? "🕘" : placeIcon(place)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {place.name}
                </span>
                {place.detail && (
                  <span className="block truncate text-[11px] text-slate-500">
                    {place.detail}
                  </span>
                )}
              </span>
            </button>
          ))}

          {isLoading && options.length === 0 && (
            <p className="px-3 py-3 text-xs text-slate-500">
              {t("search.searching")}
            </p>
          )}

          {showEmptyState && (
            <p className="px-3 py-3 text-xs text-slate-500">
              {hasFailed ? t("search.failed") : t("search.noResults")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
