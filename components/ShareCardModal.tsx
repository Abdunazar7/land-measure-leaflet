"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SavedAreaResult,
  formatArea,
  formatPerimeter,
  groupThousands,
} from "@/lib/geoUtils";
import { reverseGeocode } from "@/lib/geocode";
import { outlineCenter, renderAreaCard } from "@/lib/shareCard";

interface Props {
  entry: SavedAreaResult;
  onClose: () => void;
}

type CardState =
  | { status: "loading" }
  | { status: "ready"; blob: Blob; url: string }
  | { status: "error" };

const LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  uz: "uz-UZ",
};

/** Drops postcodes and keeps the address short enough for two lines. */
function tidyAddress(parts: (string | undefined)[]): string {
  return parts
    .flatMap((part) => (part ?? "").split(","))
    .map((part) => part.trim())
    .filter((part) => part && !/^\d{4,}$/.test(part))
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(", ");
}

function fileNameFor(entry: SavedAreaResult) {
  const date = new Date(entry.updatedAt).toISOString().slice(0, 10);
  const label = entry.label.replace(/[^\p{L}\p{N}]+/gu, "") || "area";
  return `landmeasure-${label}-${date}.png`;
}

export default function ShareCardModal({ entry, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<CardState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const canShare = useMemo(() => {
    if (typeof navigator === "undefined" || !navigator.canShare) return false;
    try {
      const probe = new File([""], "probe.png", { type: "image/png" });
      return navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const points = entry.points ?? [];
    if (points.length < 3) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    const controller = new AbortController();
    const language = i18n.language;

    const build = async () => {
      const place = await reverseGeocode(outlineCenter(points), {
        lang: language,
        signal: controller.signal,
      }).catch(() => null);

      const main = formatArea(entry);
      const unit =
        main.unit === "sotka"
          ? t("card.unitSotka")
          : main.unit === "ga"
            ? t("card.unitHa")
            : main.unit;

      const blob = await renderAreaCard({
        points,
        areaLabel: t("card.area"),
        areaValue: groupThousands(main.value),
        areaUnit: unit,
        stats: [
          {
            label: t("card.sqMeters"),
            value: `${groupThousands(entry.sqMeters.toFixed(1))} m²`,
          },
          {
            label: t("card.hectares"),
            value: `${entry.hectares.toFixed(4)} ${t("card.unitHa")}`,
          },
          {
            label: t("card.perimeter"),
            value: formatPerimeter(entry.perimeter),
            accent: true,
          },
        ],
        address: place
          ? tidyAddress([place.name, place.detail])
          : t("card.addressUnknown"),
        dateText: new Intl.DateTimeFormat(LOCALES[language] ?? "en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(entry.updatedAt)),
        pointsText: t("card.points", { count: points.length }),
        tagline: t("card.tagline"),
      });

      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setState({ status: "ready", blob, url: objectUrl });
    };

    build().catch(() => {
      if (!cancelled) setState({ status: "error" });
    });

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // Rebuild only for a new entry, language or an explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id, entry.updatedAt, i18n.language, attempt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasOutline = (entry.points?.length ?? 0) >= 3;

  const download = () => {
    if (state.status !== "ready") return;
    const link = document.createElement("a");
    link.href = state.url;
    link.download = fileNameFor(entry);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const share = async () => {
    if (state.status !== "ready") return;
    const file = new File([state.blob], fileNameFor(entry), {
      type: "image/png",
    });
    try {
      await navigator.share({ files: [file], title: "LandMeasure" });
    } catch {
      // The user closed the share sheet.
    }
  };

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("card.title")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0f1117] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              🖼️ {t("card.title")}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {t("sidebar.measurement")} {entry.label}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("card.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!hasOutline ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
              {t("card.noOutline")}
            </p>
          ) : state.status === "loading" ? (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-800/30">
              <span className="h-9 w-9 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
              <p className="text-xs text-slate-400">{t("card.generating")}</p>
            </div>
          ) : state.status === "error" ? (
            <div className="space-y-3">
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                {t("card.failed")}
              </p>
              <button
                type="button"
                onClick={retry}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
              >
                ↻
              </button>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- local blob URL
            <img
              src={state.url}
              alt={t("card.title")}
              className="w-full rounded-xl border border-slate-800"
            />
          )}
        </div>

        {hasOutline && (
          <div className="grid grid-cols-1 gap-2 border-t border-slate-800 p-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={download}
              disabled={state.status !== "ready"}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-40"
            >
              ⬇ {t("card.download")}
            </button>
            {canShare ? (
              <button
                type="button"
                onClick={share}
                disabled={state.status !== "ready"}
                className="flex items-center justify-center gap-2 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-2.5 text-sm font-medium text-green-300 hover:bg-green-500/20 disabled:opacity-40"
              >
                ↗ {t("card.share")}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                {t("card.close")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
