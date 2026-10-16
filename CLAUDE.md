# Pantalytics Brand Identity — Developer Guide

Brand identity guide website: Astro 5 static site, deployed via GitHub Pages.

## Commands

```bash
npm run dev          # Astro dev server (localhost:4321)
npm run build        # Production build (static)
npm run preview      # Preview production build
npm run check        # TypeScript/Astro type checker
npm run icons        # Render app icons, logo mark and favicons from scripts/app-icons.mjs
```

## Icon system

One ring, one object, one accent. Every app icon is the vector logo ring
with a Flux-drawn object inside: cartoon-style navy ink on cream paper
with exactly one purple watercolour accent (envelope with wax seal,
palette, owl for Self-Learning, sparkles for AI Pro, an open safe for
Vaults). No robots. MCP
Pro is the exception: it uses the official Model Context Protocol mark
painted as a sumi-e brushstroke, not a plug. Odoo Agents has no icon:
it is folded into the Pantalytics suite. Abstract glyphs and traced-vector renders were both tried
and rejected: nobody could tell the apps apart, or it looked machine-made.

Pipeline in `scripts/app-icons.mjs`: the vector glyph per icon is the
fallback and the brief; a painting in `flux-output/icons/<name>.png`
(square, object centred, cream paper edge to edge) overrides it and is
cropped to the drawing, cut to a disc and set in the ring. Flux prompt
recipe: "Charming cartoon-style ink illustration of <object>, instantly
recognisable ... navy #1b3a5c dip pen ... one soft purple #9b99ff
watercolour wash as the only colour ... cream #f3eee4 cotton watercolour
paper fills the frame edge to edge ... fills about 65% of the frame ...
no text, no letters", 1:1, 1k, no reference image. Flux allows 8
concurrent renders. `npm run icons -- --install` copies the PNGs into
the Odoo addon repos listed per icon in the script.

## Transparent torn-edge assets

Some Flux outputs (the blueprint series — `14*.png`) frame the cream
paper inside an outer wash. Those need their paper shape cut out so the
torn rim sits cleanly against any page background. Full-bleed visuals
stay opaque and are used as rectangular cards on the website.

Workflow is **manual**: run Remove Background in Adobe Express on the
torn-edge originals from `flux-output/`, save the resulting PNGs to
`public/images/brand-assets-transparent/<name>.png`. Adobe Express gives
the cleanest cutouts on tricky watercolour edges and the volume is small
enough (~4 images) that automation isn't worth it.

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
- Self-hosted font: Murecho variable (weight 400–700), subsets latin + latin-ext (woff2 in `public/fonts/`)
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
