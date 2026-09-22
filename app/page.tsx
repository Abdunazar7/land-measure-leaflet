"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    { icon: "🛰️", title: t("landing.f1t"), desc: t("landing.f1d") },
    { icon: "📐", title: t("landing.f2t"), desc: t("landing.f2d") },
    { icon: "✏️", title: t("landing.f3t"), desc: t("landing.f3d") },
    { icon: "🎯", title: t("landing.f4t"), desc: t("landing.f4d") },
    { icon: "⚡", title: t("landing.f5t"), desc: t("landing.f5d") },
    { icon: "📏", title: t("landing.f6t"), desc: t("landing.f6d") },
    { icon: "📡", title: t("landing.f7t"), desc: t("landing.f7d") },
    { icon: "🖼️", title: t("landing.f8t"), desc: t("landing.f8d") },
    { icon: "🔍", title: t("landing.f9t"), desc: t("landing.f9d") },
  ];
  const useCases = [
    { emoji: "🏗️", title: t("landing.u1t"), desc: t("landing.u1d") },
    { emoji: "🌾", title: t("landing.u2t"), desc: t("landing.u2d") },
    { emoji: "🏘️", title: t("landing.u3t"), desc: t("landing.u3d") },
    { emoji: "📋", title: t("landing.u4t"), desc: t("landing.u4d") },
  ];
  const steps = [
    { n: "01", title: t("landing.s1t"), desc: t("landing.s1d") },
    { n: "02", title: t("landing.s2t"), desc: t("landing.s2d") },
    { n: "03", title: t("landing.s3t"), desc: t("landing.s3d") },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c12] grid-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 sm:pt-32 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
            {t("hero.badge")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up delay-100">
            {t("hero.title.prefix")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              {t("hero.title.highlight")}
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            {t("hero.desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/tool"
              className="px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-base transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              {t("hero.ctaStart")} →
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-base transition-all border border-slate-700"
            >
              {t("hero.ctaHow")}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in-up delay-400">
            {[
              { v: "6", l: t("stats.format") },
              { v: "±0.1%", l: t("stats.accuracy") },
              { v: "100%", l: t("stats.free") },
            ].map((stat) => (
              <div
                key={stat.l}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4"
              >
                <p className="text-2xl font-bold text-white">{stat.v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 border-t border-slate-800/50"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-3">
              {t("how.label")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t("how.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.n}
                className="relative bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-colors group"
              >
                <p className="text-5xl font-extrabold text-slate-800 group-hover:text-green-500/20 transition-colors mb-4 font-mono">
                  {step.n}
                </p>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-3">
              {t("features.label")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t("features.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.icon}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-3">
              {t("cases.label")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t("cases.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {useCases.map((useCase) => (
              <div
                key={useCase.emoji}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center hover:border-green-500/20 transition-colors"
              >
                <div className="text-4xl mb-3">{useCase.emoji}</div>
                <h3 className="text-white font-semibold mb-1">
                  {useCase.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {useCase.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {t("cta.desc")}
            </p>
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-base transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              {t("cta.openTool")}
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
