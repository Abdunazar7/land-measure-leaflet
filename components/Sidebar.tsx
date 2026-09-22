"use client";
import { useState } from "react";
import ResultCard from "./ResultCard";
import SearchBox from "./SearchBox";
import ShareCardModal from "./ShareCardModal";
import { useTranslation } from "react-i18next";
import {
  AreaResult,
  SavedAreaResult,
  formatArea,
  formatPerimeter,
} from "@/lib/geoUtils";
import { formatCoordinates, type GeoPlace } from "@/lib/geocode";
import type { GeolocationController } from "@/hooks/useGeolocation";

interface Props {
  result: AreaResult | null;
  savedResults: SavedAreaResult[];
  isDrawing: boolean;
  polygonCount: number;
  gps: GeolocationController;
  onSelectPlace: (place: GeoPlace) => void;
  getViewbox?: () => string | null;
  onClear: () => void;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onDeleteSavedResult: (id: string) => void;
  onClearSavedResults: () => void;
  onShowSavedResult: (id: string) => void;
}

const LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

export default function Sidebar({
  result,
  savedResults,
  isDrawing,
  polygonCount,
  gps,
  onSelectPlace,
  getViewbox,
  onClear,
  onStartDrawing,
  onStopDrawing,
  onDeleteSavedResult,
  onClearSavedResults,
  onShowSavedResult,
}: Props) {
  const { t, i18n } = useTranslation();
  const [cardEntryId, setCardEntryId] = useState<string | null>(null);
  const cardEntry = savedResults.find((item) => item.id === cardEntryId);

  const formatSavedAt = (value: string) =>
    new Intl.DateTimeFormat(LOCALES[i18n.language] ?? "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const gpsError = gps.errorCode ? t(`gps.errors.${gps.errorCode}`) : null;

  return (
    <aside className="flex w-full flex-col border-b border-slate-800 bg-[#0f1117] lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r">
      {/* Header */}
      <div className="border-b border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500 font-bold text-black shadow-lg shadow-green-500/30">
              L
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-white">LandMeasure</h2>
              <p className="truncate text-[11px] text-slate-500">
                {t("sidebar.subtitle")}
              </p>
            </div>
          </div>
          <div className="whitespace-nowrap rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] text-green-400 sm:text-[11px]">
            {t("sidebar.areasCount", { count: polygonCount })}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-800 p-3 sm:p-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
          {t("sidebar.searchTitle")}
        </p>
        <SearchBox onSelect={onSelectPlace} getViewbox={getViewbox} />
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {t("search.hint")}
        </p>
      </div>

      {/* Live location */}
      <div className="border-b border-slate-800 p-3 sm:p-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
          {t("gps.title")}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={gps.locate}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
              gps.status === "active"
                ? "border border-blue-400/30 bg-blue-500/15 text-blue-200"
                : "border border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {gps.status === "locating" ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <span aria-hidden="true">◎</span>
            )}
            <span className="truncate">
              {gps.status === "locating"
                ? t("gps.locating")
                : gps.status === "active"
                  ? t("gps.recenter")
                  : t("gps.myLocation")}
            </span>
          </button>

          {gps.status === "active" && (
            <button
              type="button"
              onClick={gps.stop}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              {t("gps.stop")}
            </button>
          )}
        </div>

        {gps.position && (
          <div className="mt-2.5 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
            {gps.address ? (
              <p className="truncate text-xs font-medium text-white">
                {gps.address.name}
              </p>
            ) : (
              <p className="text-xs text-slate-400">{t("gps.resolving")}</p>
            )}
            {gps.address?.detail && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {gps.address.detail}
              </p>
            )}
            <p className="mt-1.5 font-mono text-[11px] text-slate-400">
              {formatCoordinates(gps.position)}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500">
                {t("gps.accuracy", {
                  metres: Math.round(gps.position.accuracy),
                })}
              </span>
              {gps.follow && (
                <span className="rounded-md bg-blue-500/15 px-1.5 py-0.5 text-blue-300">
                  {t("gps.followingShort")}
                </span>
              )}
            </div>
          </div>
        )}

        {gpsError && (
          <p className="mt-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] leading-relaxed text-red-300">
            {gpsError}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="border-b border-slate-800 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            {t("sidebar.controlsTitle")}
          </p>
          <span className="text-[11px] text-slate-500">
            {isDrawing ? t("sidebar.escHintOn") : t("sidebar.drawingOff")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            onClick={onStartDrawing}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              isDrawing
                ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
                : "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <span className="text-base">✏️</span>
            {isDrawing ? t("sidebar.drawing") : t("sidebar.drawNew")}
          </button>

          <button
            onClick={isDrawing ? onStopDrawing : onClear}
            disabled={!isDrawing && polygonCount === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
              isDrawing
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <span className="text-base">{isDrawing ? "⨯" : "🗑️"}</span>
            {isDrawing ? t("sidebar.cancelDrawing") : t("sidebar.clearAll")}
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs leading-relaxed text-slate-400">
          {isDrawing ? t("sidebar.drawHelp") : t("sidebar.drawHelpOff")}
        </div>
      </div>

      <div className="flex-1 space-y-4 p-3 sm:p-4">
        {/* Current result or instructions */}
        {result ? (
          <section>
            <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
              {t("sidebar.currentResult")}
            </p>
            <ResultCard result={result} />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
              {t("sidebar.guide")}
            </p>
            <div className="space-y-2.5">
              {["1", "2", "3", "4"].map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[10px] text-slate-400">
                    {step}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {t(`sidebar.step${step}`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saved results */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              {t("sidebar.saved")}
            </p>
            {savedResults.length > 0 && (
              <button
                type="button"
                onClick={onClearSavedResults}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                {t("sidebar.deleteAll")}
              </button>
            )}
          </div>

          {savedResults.length > 0 ? (
            <div className="space-y-2">
              {savedResults.map((item) => {
                const main = formatArea(item);
                const canShow = (item.points?.length ?? 0) >= 3;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {t("sidebar.measurement")} {item.label}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatSavedAt(item.updatedAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteSavedResult(item.id)}
                        className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/20"
                      >
                        {t("sidebar.delete")}
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-900/40 px-2.5 py-2">
                        <p className="mb-1 text-slate-500">
                          {t("sidebar.area")}
                        </p>
                        <p className="font-medium text-white">
                          {main.value} {main.unit}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-900/40 px-2.5 py-2">
                        <p className="mb-1 text-slate-500">
                          {t("sidebar.perimeter")}
                        </p>
                        <p className="font-medium text-blue-400">
                          {formatPerimeter(item.perimeter)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onShowSavedResult(item.id)}
                        disabled={!canShow}
                        title={canShow ? undefined : t("card.noOutline")}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-600/60 bg-slate-900/40 px-2 py-2 text-[11px] font-medium text-slate-300 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        🗺️ {t("sidebar.showOnMap")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardEntryId(item.id)}
                        disabled={!canShow}
                        title={canShow ? undefined : t("card.noOutline")}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-green-500/25 bg-green-500/10 px-2 py-2 text-[11px] font-semibold text-green-400 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        🖼️ {t("card.button")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-800/20 px-4 py-5 text-center text-sm text-slate-500">
              {t("sidebar.emptySaved")}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        <p className="text-center text-[10px] text-slate-600">
          {t("sidebar.footer")}
        </p>
      </div>

      {cardEntry && (
        <ShareCardModal
          key={cardEntry.id}
          entry={cardEntry}
          onClose={() => setCardEntryId(null)}
        />
      )}
    </aside>
  );
}
