"use client";
import { useTranslation } from "react-i18next";
import { AreaResult, formatArea, formatPerimeter } from "@/lib/geoUtils";

interface Props {
  result: AreaResult;
}

const metrics = [
  { key: "sqMeters", labelKey: "units.sqMetersShort", decimals: 1 },
  { key: "sotka", labelKey: "units.sotkaShort", decimals: 2 },
  { key: "hectares", labelKey: "units.hectaresShort", decimals: 4 },
  { key: "acres", labelKey: "units.acresShort", decimals: 3 },
] as const;

const groupDigits = (value: string) =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function ResultCard({ result }: Props) {
  const { t } = useTranslation();
  const main = formatArea(result);

  return (
    <div className="space-y-3">
      {/* Main result */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
        <p className="mb-1 text-xs uppercase tracking-widest text-green-400/70">
          {t(main.labelKey)}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-white">
            {main.value}
          </span>
          <span className="font-semibold text-green-400">{main.unit}</span>
        </div>
      </div>

      {/* Sub metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
          >
            <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
              {t(metric.labelKey)}
            </p>
            <p className="font-mono text-sm font-semibold text-slate-200">
              {groupDigits(Number(result[metric.key]).toFixed(metric.decimals))}
            </p>
          </div>
        ))}
      </div>

      {/* Perimeter */}
      <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {t("sidebar.perimeter")}
        </span>
        <span className="font-mono text-sm font-semibold text-blue-400">
          {formatPerimeter(result.perimeter)}
        </span>
      </div>

      {/* Points */}
      <div className="flex items-center gap-2 px-1">
        <div className="pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
        <span className="text-xs text-slate-500">
          {t("sidebar.pointsUsed", { count: result.pointCount })}
        </span>
      </div>
    </div>
  );
}
