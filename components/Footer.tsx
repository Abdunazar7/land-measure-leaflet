"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-slate-800 bg-[#0a0c12] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-black font-bold text-sm">L</div>
            <span className="font-semibold text-white">Land<span className="text-green-400">Measure</span></span>
          </div>
          <p className="text-sm text-slate-500">
            {t("footer.tech")}
          </p>
          <Link
            href="/tool"
            className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            {t("footer.tool")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
