# Pantalytics Brand Identity — Developer Guide

Brand identity guide website: Astro 5 static site, deployed via GitHub Pages.

## Commands

```bash
npm run dev          # Astro dev server (localhost:4321)
npm run build        # Production build (static)
npm run preview      # Preview production build
npm run check        # TypeScript/Astro type checker
```

## Conventions

### Code
- TypeScript strict mode
- Astro components: PascalCase (`ColorSwatch.astro`)
- Files and folders: kebab-case
- Variables and functions: camelCase
- CSS: scoped styles in Astro components + `src/styles/global.css` for tokens
- No external CSS frameworks

### Design
- Mobile-first responsive (breakpoints: 991px, 767px, 479px)
- Self-hosted fonts: Lexend 500, Instrument Sans 400-700 (woff2 in `public/fonts/`)
- Colors: `#9b99ff` (accent), `#001d21` (bg primary), `#002328` (bg secondary)
- No Google Fonts, no external tracking

### i18n
- NL is default locale (no prefix)
- EN pages under `/en/` prefix
- All content in `src/i18n/nl.json` and `src/i18n/en.json`
- Route mapping in `src/i18n/config.ts`

## Deployment
- GitHub push to `main` → GitHub Actions → GitHub Pages
- Custom domain: `brand.pantalytics.com` (CNAME in `public/`)
- DNS: CNAME `brand.pantalytics.com` → `pantalytics.github.io`

## Licensing
- Code: MIT (`LICENSE-CODE`)
- Brand assets: CC BY-ND 4.0 (`LICENSE-BRAND`)
