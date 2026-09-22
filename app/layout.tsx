import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import { Outfit, JetBrains_Mono } from "next/font/google";
import I18nProvider from "@/components/I18nProvider";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.land-measure.uz"),

  title: {
    default:
      "LandMeasure — Yer Maydoni O'lchagich | Онлайн Площадь | Area Calculator",
    template: "%s | LandMeasure",
  },

  description:
    "Sun'iy yo'ldosh xaritasida yer maydonini onlayn o'lchang — gektar, sotka, m². " +
    "Измерьте площадь участка онлайн по спутниковой карте — га, соток, м². " +
    "Measure land area online on a satellite map — hectares, acres, m². Free tool.",

  keywords: [
    // O'zbek
    "yer maydoni olchash",
    "maydon kalkulyator",
    "gektar sotka hisoblash",
    "yer uchastkasi olchash",
    "xaritada maydon olchash",
    "sotka kalkulyator",
    "gektar kalkulyator",
    "m2 hisoblash",
    "onlayn olchov",
    "sun'iy yo'ldosh xaritasi",
    // Rus
    "измерить площадь участка онлайн",
    "калькулятор площади земли",
    "площадь на карте онлайн",
    "измерение площади по спутнику",
    "перевод гектар в сотки",
    "онлайн рулетка для земли",
    "площадь огорода онлайн",
    "земельный участок площадь",
    "гектар калькулятор",
    "сотка калькулятор",
    // Ingliz
    "land area calculator",
    "measure land online",
    "satellite map area calculator",
    "hectare calculator",
    "acre calculator online",
    "polygon area calculator",
    "land measurement tool",
    "map area tool",
    "parcel area calculator",
    "free land area tool",
  ],

  authors: [{ name: "LandMeasure", url: "https://www.land-measure.uz" }],
  creator: "LandMeasure",
  publisher: "LandMeasure",

  alternates: {
    canonical: "https://www.land-measure.uz",
  },

  openGraph: {
    type: "website",
    url: "https://www.land-measure.uz",
    siteName: "LandMeasure",
    title: "LandMeasure — Yer Maydoni O'lchagich",
    description:
      "Sun'iy yo'ldosh xaritasida yer maydonini onlayn o'lchang. Gektar, sotka, m², acres. Bepul va tez.",
    locale: "uz_UZ",
    alternateLocale: ["ru_RU", "en_US"],
  },

  twitter: {
    card: "summary_large_image",
    title: "LandMeasure — Yer Maydoni O'lchagich",
    description:
      "Sun'iy yo'ldosh xaritasida yer maydonini onlayn o'lchang. Bepul, tez, aniq.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "tools",

  other: {
    "geo.region": "UZ",
    "geo.placename": "Uzbekistan",
    "geo.position": "41.2995;69.2401",
    ICBM: "41.2995, 69.2401",
    language: "uz, ru, en",
  },
};

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.dataset.theme = theme;
    } catch {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${mono.variable} antialiased`}>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
