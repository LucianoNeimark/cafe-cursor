"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, translations, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencia del localStorage después de montar
  useEffect(() => {
    const saved = localStorage.getItem("cafe-cursor-locale");
    if (saved && (saved === "es" || saved === "en")) {
      console.log(`🌐 [LOCALE] Cargado del localStorage: ${saved}`);
      setLocaleState(saved);
    } else if (saved === "pt-BR") {
      // Migrar la preferencia del idioma anterior a la nueva opción en español.
      localStorage.setItem("cafe-cursor-locale", "es");
      setLocaleState("es");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    console.log(`🌐 [LOCALE] Cambiando idioma a: ${newLocale}`);
    setLocaleState(newLocale);
    localStorage.setItem("cafe-cursor-locale", newLocale);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key];
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
