"use client";

import { useLanguage } from "./LanguageContext";
import { Locale } from "@/lib/translations";

/**
 * Selector de idioma con banderas
 * Español 🇪🇸 | English 🇺🇸
 */
export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  const languages: { code: Locale; flag: string; label: string; name: string }[] = [
    { code: "es", flag: "🇪🇸", label: "ES", name: "Español" },
    { code: "en", flag: "🇺🇸", label: "EN", name: "English" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 backdrop-blur-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLocale(lang.code)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            locale === lang.code
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
          aria-label={locale === "es" ? `Cambiar idioma a ${lang.name}` : `Switch language to ${lang.name}`}
          aria-pressed={locale === lang.code}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
