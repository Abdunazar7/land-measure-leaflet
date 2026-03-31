import type { Metadata } from "next";
import "./globals.css";

import { Outfit, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LandMeasure — Yer Maydoni O'lchagich",
  description:
    "Google Maps yordamida istalgan yer maydonini onlayn o'lchang. Gektar, sotka, m² va boshqa o'lchovlarda natija oling. Bepul va qulay vosita.",
  keywords:
    "yer maydoni olchash, maydon kalkulyator, gektar sotka, google maps olchash, uzbekistan",
  authors: [{ name: "LandMeasure" }],
  openGraph: {
    title: "LandMeasure — Yer Maydoni O'lchagich",
    description:
      "Google Maps yordamida istalgan yer maydonini onlayn o'lchang.",
    type: "website",
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
    <html lang="uz" suppressHydrationWarning>
      <body className={`${outfit.variable} ${mono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
