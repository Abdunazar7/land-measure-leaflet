"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { readStoredLanguage } from "@/lib/i18n";

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const syncDocumentLanguage = (language: string) => {
      document.documentElement.lang = language;
    };

    // The server and the first client render use the default language, so the
    // stored choice is applied only after hydration.
    const stored = readStoredLanguage();
    if (stored !== i18n.language) void i18n.changeLanguage(stored);
    syncDocumentLanguage(i18n.language);

    i18n.on("languageChanged", syncDocumentLanguage);
    return () => {
      i18n.off("languageChanged", syncDocumentLanguage);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
