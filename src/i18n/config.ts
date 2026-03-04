export type Locale = "nl" | "en";
export const defaultLocale: Locale = "nl";
export const locales: Locale[] = ["nl", "en"];

/** Mapping from NL paths to EN paths */
const nlToEn: Record<string, string> = {
  "/": "/en/",
  "/logo": "/en/logo",
  "/kleuren": "/en/colors",
  "/typografie": "/en/typography",
  "/tone-of-voice": "/en/tone-of-voice",
  "/downloads": "/en/downloads",
};

/** Reverse mapping: EN paths to NL paths */
const enToNl: Record<string, string> = Object.fromEntries(
  Object.entries(nlToEn).map(([nl, en]) => [en.replace(/\/$/, "") || "/", nl])
);

/**
 * Get the alternate-language URL for a given path.
 */
export function getAlternateUrl(currentPath: string): string {
  const normalized = currentPath.replace(/\/$/, "") || "/";

  if (nlToEn[normalized]) return nlToEn[normalized];
  if (enToNl[normalized]) return enToNl[normalized];

  // Fallback: toggle /en/ prefix
  if (normalized.startsWith("/en/")) {
    return normalized.replace("/en/", "/") || "/";
  }
  return "/en" + normalized;
}

/**
 * Detect locale from URL path.
 */
export function getLangFromUrl(pathname: string): Locale {
  return pathname.startsWith("/en/") || pathname === "/en" ? "en" : "nl";
}
