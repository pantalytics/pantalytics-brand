import type { Locale } from "./config";
import nl from "./nl.json";
import en from "./en.json";

const translations: Record<Locale, Record<string, string>> = { nl, en };

/**
 * Get a translated string by key and locale.
 * Returns the key itself if no translation is found.
 */
export function t(key: string, lang: Locale): string {
  return translations[lang]?.[key] ?? key;
}

/**
 * Create a bound translation function for a specific locale.
 */
export function useTranslations(lang: Locale) {
  return (key: string) => t(key, lang);
}
