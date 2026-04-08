import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: "LandMeasure — Yer Maydoni O'lchagich",
  description:
    "Xaritada istalgan yer maydonini onlayn o'lchang. Gektar, sotka, m² va boshqa o'lchovlarda natija oling. Bepul va qulay vosita.",
  keywords:
    "yer maydoni olchash, maydon kalkulyator, gektar sotka, uzbekistan",
  authors: [{ name: "LandMeasure" }],
  openGraph: {
    title: "LandMeasure — Yer Maydoni O'lchagich",
    description:
      "Xaritada istalgan yer maydonini onlayn o'lchang.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
