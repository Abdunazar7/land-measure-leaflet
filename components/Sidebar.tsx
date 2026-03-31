"use client";
import { useState } from "react";
import ResultCard from "./ResultCard";
import {
  AreaResult,
  SavedAreaResult,
  formatArea,
  formatPerimeter,
} from "@/lib/geoUtils";

interface Props {
  result: AreaResult | null;
  savedResults: SavedAreaResult[];
  isDrawing: boolean;
  polygonCount: number;
  onSearch: (query: string) => void;
  onClear: () => void;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onDeleteSavedResult: (id: string) => void;
  onClearSavedResults: () => void;
}

const formatSavedAt = (value: string) =>
  new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function Sidebar({
  result,
  savedResults,
  isDrawing,
  polygonCount,
  onSearch,
  onClear,
  onStartDrawing,
  onStopDrawing,
  onDeleteSavedResult,
  onClearSavedResults,
}: Props) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) onSearch(searchValue.trim());
  };

  return (
    <aside className="h-full w-full bg-[#0f1117] border-b border-slate-800 lg:border-b-0 lg:border-r flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-black font-bold shadow-lg shadow-green-500/30 shrink-0">
              L
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-[15px]">LandMeasure</h2>
              <p className="text-[11px] text-slate-500 truncate">
                Yer maydoni o‘lchagich
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] sm:text-[11px] text-green-400 whitespace-nowrap">
            {polygonCount} ta maydon
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4 border-b border-slate-800">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
          📍 Joylashuv qidirish
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Shahar, ko'cha, hudud..."
            className="min-w-0 flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
          />
          <button
            onClick={handleSearch}
            className="shrink-0 px-3 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-sm"
          >
            ↗
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            🔧 Boshqaruv
          </p>
          <span className="text-[11px] text-slate-500">
            {isDrawing ? "ESC bilan chiqish mumkin" : "Chizish o‘chiq"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          <button
            onClick={onStartDrawing}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
              isDrawing
                ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
                : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
            }`}
          >
            <span className="text-base">✏️</span>
            {isDrawing ? "Chizilmoqda..." : "Yangi maydon chizish"}
          </button>

          <button
            onClick={isDrawing ? onStopDrawing : onClear}
            disabled={!isDrawing && polygonCount === 0}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isDrawing
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            <span className="text-base">{isDrawing ? "⨯" : "🗑️"}</span>
            {isDrawing ? "Chizishni bekor qilish" : "Hammasini tozalash"}
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
          {isDrawing
            ? "Xaritada nuqtalarni bosing. Adashsangiz “Chizishni bekor qilish” yoki ESC dan foydalaning."
            : "Xaritaga tasodifan chizilmasligi uchun chizish rejimi faqat tugma orqali yoqiladi."}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* Current result or instructions */}
        {result ? (
          <section>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
              📊 Joriy natija
            </p>
            <ResultCard result={result} />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
              📖 Yo‘riqnoma
            </p>
            <div className="space-y-2.5">
              {[
                { n: "1", t: "“Yangi maydon chizish” tugmasini bosing" },
                { n: "2", t: "Xaritada chegarani nuqtama-nuqta belgilang" },
                { n: "3", t: "Xato bosilsa ESC yoki bekor qilishni bosing" },
                {
                  n: "4",
                  t: "Natija avtomatik saqlanadi va ro‘yxatga qo‘shiladi",
                },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[10px] text-slate-400">
                    {step.n}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.t}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saved results */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              💾 Saqlangan o‘lchovlar
            </p>
            {savedResults.length > 0 && (
              <button
                type="button"
                onClick={onClearSavedResults}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Hammasini o‘chirish
              </button>
            )}
          </div>

          {savedResults.length > 0 ? (
            <div className="space-y-2">
              {savedResults.map((item) => {
                const main = formatArea(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {item.label}
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
                        O‘chirish
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-900/40 px-2.5 py-2">
                        <p className="text-slate-500 mb-1">Maydon</p>
                        <p className="text-white font-medium">
                          {main.value} {main.unit}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-900/40 px-2.5 py-2">
                        <p className="text-slate-500 mb-1">Perimetr</p>
                        <p className="text-blue-400 font-medium">
                          {formatPerimeter(item.perimeter)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-800/20 px-4 py-5 text-center text-sm text-slate-500">
              Hozircha saqlangan natija yo‘q. Hisoblaganingizdan keyin bu yerda
              avtomatik ko‘rinadi.
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          Google Maps Geometry API • WGS84
        </p>
      </div>
    </aside>
  );
}
