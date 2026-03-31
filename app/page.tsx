import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "🗺️",
    title: "Interaktiv xarita",
    desc: "Google Maps da istalgan joyni toping va maydon chegarasini chizing. Yo'ldosh tasvirlari bilan aniq belgilang.",
  },
  {
    icon: "📐",
    title: "Ko'p formatda natija",
    desc: "m², sotka, gektar, acres va km² — barcha o'lchovlarda bir vaqtda natija ko'ring.",
  },
  {
    icon: "✏️",
    title: "Tahrirlash imkoni",
    desc: "Chizilgan maydon nuqtalarini sudrab o'zgartiring. Har bir o'zgarishda natija avtomatik yangilanadi.",
  },
  {
    icon: "🎯",
    title: "Aniq hisoblash",
    desc: "Google'ning Spherical Geometry algoritmidan foydalanadi. Yer yuzasining egriligini hisobga oladi.",
  },
  {
    icon: "⚡",
    title: "Tez va bepul",
    desc: "Hech qanday ro'yxatdan o'tish shart emas. Sahifani oching va darhol ishlatishni boshlang.",
  },
  {
    icon: "📏",
    title: "Perimetr ham chiqadi",
    desc: "Maydon yuzasi bilan birga to'liq perimetrni ham metr va kilometrda ko'ring.",
  },
];

const useCases = [
  {
    emoji: "🏗️",
    title: "Qurilish",
    desc: "Qurilish uchun ajratilgan yer maydonini o'lchash",
  },
  {
    emoji: "🌾",
    title: "Qishloq xo'jaligi",
    desc: "Dala va bog'lar maydonini aniqlash",
  },
  {
    emoji: "🏘️",
    title: "Ko'chmas mulk",
    desc: "Arazi va uy-joy maydonini baholash",
  },
  {
    emoji: "📋",
    title: "Loyihalash",
    desc: "Arxitektura va shahar loyihalashtirish",
  },
];

const steps = [
  {
    n: "01",
    title: "Joylashuvni toping",
    desc: "Qidiruv qatoriga shahar yoki manzil yozing",
  },
  {
    n: "02",
    title: "Maydon chizing",
    desc: "Xaritada chegarani nuqtama-nuqta belgilang",
  },
  {
    n: "03",
    title: "Natijani oling",
    desc: "Maydon va perimetr avtomatik hisoblanadi",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0c12] grid-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
            Google Maps bilan ishlaydi
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up delay-100">
            Yer maydonini{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              onlayn o‘lchang
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Xaritada maydon chegarasini chizing — m², sotka, gektar va boshqa
            o‘lchovlarda natijani darhol oling. Bepul, tez va aniq.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/tool"
              className="px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-base transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              Hoziroq boshlash →
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-base transition-all border border-slate-700"
            >
              Qanday ishlaydi?
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in-up delay-400">
            {[
              { v: "6", u: "o‘lchov", l: "formati" },
              { v: "±0.1%", u: "", l: "aniqlik" },
              { v: "100%", u: "", l: "bepul" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4"
              >
                <p className="text-2xl font-bold text-white">
                  {s.v}
                  <span className="text-green-400 text-lg">{s.u}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
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
              Qanday ishlaydi
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              3 ta oddiy qadam
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-colors group"
              >
                <p className="text-5xl font-extrabold text-slate-800 group-hover:text-green-500/20 transition-colors mb-4 font-mono">
                  {s.n}
                </p>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {s.desc}
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
              Imkoniyatlar
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Nima qila olasiz?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.desc}
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
              Qo‘llanilishi
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Kim foydalanishi mumkin?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {useCases.map((u, i) => (
              <div
                key={i}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center hover:border-green-500/20 transition-colors"
              >
                <div className="text-4xl mb-3">{u.emoji}</div>
                <h3 className="text-white font-semibold mb-1">{u.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {u.desc}
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
              Hoziroq sinab ko‘ring
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Ro‘yxatdan o‘tish shart emas. Tool ni oching va darhol yer
              maydoningizni o‘lchashni boshlang.
            </p>
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-base transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              Tool ni ochish
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
