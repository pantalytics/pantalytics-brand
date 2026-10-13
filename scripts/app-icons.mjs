/**
 * Pantalytics icon system — one ring, one object, one bloom.
 *
 * Every app icon is the logo ring (navy outer, light-blue inner, white
 * centre) with one recognisable object drawn as a navy line and exactly
 * one purple bloom as accent. Keep objects literal (envelope, palette,
 * owl): abstract glyphs were tried and nobody could tell the apps apart.
 *
 * Writes SVG + PNG to public/images/app-icons/, regenerates the logo
 * icon mark (public/images/logo/icon-blue.*) and the site favicons.
 *
 * Usage:
 *   node scripts/app-icons.mjs            # render everything
 *   node scripts/app-icons.mjs --install  # also copy PNGs into the addon repos
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB = resolve(ROOT, "..");
const OUT = resolve(ROOT, "public/images/app-icons");

// Colours: ring from the existing logo, bloom from the brand accent.
const NAVY = "#1a4f8c";
const LIGHT = "#c0d6e4";
const BLOOM = "#9b99ff";

const line = (w = 8) => `fill="none" stroke="${NAVY}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const LINE = line();
const dot = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${NAVY}"/>`;
const bloom = (x, y, r = 15) =>
  `<circle cx="${x}" cy="${y}" r="${r * 1.7}" fill="${BLOOM}" opacity="0.3"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${BLOOM}"/>`;

// The logo mark: the fibre wave redrawn as three crossing strokes.
const wave =
  `<path d="M 46 166 C 86 86, 132 90, 210 118" ${LINE}/>` +
  `<path d="M 46 132 C 100 106, 150 160, 210 150" ${line(6)} opacity="0.7"/>` +
  `<path d="M 50 150 C 100 124, 156 80, 208 134" ${line(4)} opacity="0.45"/>`;

/** name → { glyph, thumbnail composition it mirrors, install targets } */
const ICONS = {
  "pantalytics": {
    label: "Pantalytics",
    glyph: wave,
    install: ["odoo-pantalytics/pan_pantalytics"],
  },
  "mcp-pro": {
    label: "MCP Pro",
    // A plug: connects AI clients to Odoo.
    glyph:
      `<path d="M 98 118 H 158 V 148 C 158 170, 98 170, 98 148 Z M 112 118 V 92 M 144 118 V 92 M 128 166 V 182" ${LINE}/>` +
      bloom(128, 190, 10),
    install: ["odoo-mcp-pro-governance/pan_mcp_pro_governance"],
  },
  "audit-log": {
    label: "Audit Log",
    // A document with lines and a seal.
    glyph:
      `<rect x="84" y="70" width="88" height="116" rx="10" ${LINE}/>` +
      `<path d="M 104 100 H 152 M 104 122 H 152 M 104 144 H 130" ${LINE}/>` +
      bloom(158, 162, 11),
    install: ["odoo-mcp-pro-governance/pan_mcp_auditlog"],
  },
  "user-roles": {
    label: "User Roles",
    // A person: head is the bloom.
    glyph: `<path d="M 80 178 C 80 136, 176 136, 176 178" ${LINE}/>` + bloom(128, 106, 17),
    install: ["odoo-mcp-pro-governance/pan_mcp_user_role"],
  },
  "outlook-pro": {
    label: "Outlook Pro",
    // An envelope with an unread dot.
    glyph:
      `<rect x="68" y="92" width="120" height="78" rx="8" ${LINE}/>` +
      `<path d="M 68 102 L 128 144 L 188 102" ${LINE}/>` +
      bloom(186, 92, 12),
    install: ["pan_outlook_pro_store/pan_outlook_pro"],
  },
  "ai-pro": {
    label: "AI Pro",
    // An owl: self-learning. Beak is the bloom.
    glyph:
      `<path d="M 128 72 C 166 72, 182 104, 182 142 C 182 170, 158 186, 128 186 C 98 186, 74 170, 74 142 C 74 104, 90 72, 128 72 Z" ${LINE}/>` +
      `<path d="M 92 80 L 84 58 L 108 70 M 164 80 L 172 58 L 148 70" ${LINE}/>` +
      `<circle cx="108" cy="118" r="15" ${LINE}/><circle cx="148" cy="118" r="15" ${LINE}/>` +
      dot(108, 118, 5) + dot(148, 118, 5) +
      bloom(128, 146, 8),
    install: ["pan_ai_pro/pan_ai_pro"],
  },
  "odoo-agents": {
    label: "Odoo Agents",
    // A robot head with an antenna.
    glyph:
      `<rect x="80" y="104" width="96" height="76" rx="14" ${LINE}/>` +
      `<path d="M 128 104 V 82 M 112 160 H 144" ${LINE}/>` +
      dot(108, 136, 8) + dot(148, 136, 8) +
      bloom(128, 74, 10),
    install: [],
  },
  "style-pro": {
    label: "Style Pro",
    // A painter's palette with a thumb hole.
    glyph:
      `<circle cx="128" cy="128" r="58" ${LINE}/>` +
      `<circle cx="152" cy="154" r="11" ${LINE}/>` +
      dot(104, 110, 9) + dot(134, 94, 9) + dot(96, 142, 9) +
      bloom(162, 114, 10),
    install: ["odoo-style-pro/pan_style_pro"],
  },
  "insights-pro": {
    label: "Insights Pro",
    // A bar chart, the top bar lit.
    glyph:
      `<path d="M 72 178 H 184" ${LINE}/>` +
      `<path d="M 92 178 V 138 M 128 178 V 110 M 164 178 V 90" ${line(12)}/>` +
      bloom(164, 86, 12),
    install: ["odoo-insights-pro/insights_pro"],
  },
  "knowledge-pro": {
    label: "Knowledge Pro",
    // An open book with a highlight.
    glyph:
      `<path d="M 128 98 C 112 86, 88 86, 70 94 V 172 C 88 164, 112 164, 128 176 C 144 164, 168 164, 186 172 V 94 C 168 86, 144 86, 128 98 Z M 128 98 V 176" ${LINE}/>` +
      bloom(158, 124, 10),
    install: ["odoo-knowledge-pro/pan_knowledge_pro"],
  },
};

const ring = `
  <circle cx="128" cy="128" r="112" fill="#ffffff"/>
  <path fill="${NAVY}" fill-rule="evenodd" d="M 0,128 A 128,128 0 1,0 256,128 A 128,128 0 1,0 0,128 Z M 15.5,128 A 112.5,112.5 0 1,0 240.5,128 A 112.5,112.5 0 1,0 15.5,128 Z"/>
  <path fill="${LIGHT}" fill-rule="evenodd" d="M 16,128 A 112,112 0 1,0 240,128 A 112,112 0 1,0 16,128 Z M 32,128 A 96,96 0 1,0 224,128 A 96,96 0 1,0 32,128 Z"/>`;

const svg = (glyph) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">${ring}\n  ${glyph}\n</svg>\n`;

async function png(svgText, size, dest) {
  await sharp(Buffer.from(svgText), { density: 300 }).resize(size, size).png().toFile(dest);
}

/**
 * Painted interior: a Flux ink-and-wash rendering of the glyph on cream
 * paper (flux-output/icons/<name>.png, square, object centred) is cut
 * to a disc and set inside the vector ring. The vector glyph remains the
 * reference Flux draws from and the fallback when no painting exists.
 */
const PAINTED = resolve(ROOT, "flux-output/icons");
async function paintedPng(name, size, dest) {
  const src = `${PAINTED}/${name}.png`;
  if (!existsSync(src)) return false;
  const d = Math.round((size * 192) / 256); // interior diameter
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#fff"/></svg>`);
  // Flux draws the object off-centre and sometimes adds a page edge. Drop
  // the outer 6%, find the drawing's bounding box against the paper, and
  // take a square around its centre with 40% paper margin, clamped to the
  // image so the margin stays real paper rather than a flat fill.
  const meta = await sharp(src).metadata();
  const inset = Math.round(Math.min(meta.width, meta.height) * 0.06);
  const W = meta.width - 2 * inset, H = meta.height - 2 * inset;
  const page = await sharp(src).extract({ left: inset, top: inset, width: W, height: H }).png().toBuffer();
  const { info } = await sharp(page).trim({ threshold: 45 }).toBuffer({ resolveWithObject: true });
  const bx = -info.trimOffsetLeft, by = -info.trimOffsetTop, bw = info.width, bh = info.height;
  const side = Math.min(W, H, Math.round(Math.max(bw, bh) * 1.4));
  const clamp = (v, max) => Math.max(0, Math.min(max, Math.round(v)));
  const left = clamp(bx + bw / 2 - side / 2, W - side), top = clamp(by + bh / 2 - side / 2, H - side);
  const disc = await sharp(page)
    .extract({ left, top, width: side, height: side })
    .resize(d, d, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const ringOnly = Buffer.from(svg("").replace(/<circle cx="128" cy="128" r="112" fill="#ffffff"\/>/, ""));
  const ringPng = await sharp(ringOnly, { density: 300 }).resize(size, size).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: disc, left: (size - d) / 2, top: (size - d) / 2 }, { input: ringPng }])
    .png()
    .toFile(dest);
  return true;
}

const install = process.argv.includes("--install");
mkdirSync(OUT, { recursive: true });

for (const [name, icon] of Object.entries(ICONS)) {
  const text = svg(icon.glyph);
  writeFileSync(`${OUT}/${name}.svg`, text);
  if (!(await paintedPng(name, 512, `${OUT}/${name}.png`))) await png(text, 512, `${OUT}/${name}.png`);
  if (!install) continue;
  for (const addon of icon.install) {
    const dest = resolve(GITHUB, addon, "static/description/icon.png");
    if (!existsSync(dirname(dest))) { console.warn(`skip ${dest}: missing`); continue; }
    copyFileSync(`${OUT}/${name}.png`, dest);
    console.log(`installed ${name} -> ${addon}`);
  }
}

// Logo icon mark and site favicons share the Pantalytics icon.
const logo = svg(wave);
writeFileSync(resolve(ROOT, "public/images/logo/icon-blue.svg"), logo);
await png(logo, 2560, resolve(ROOT, "public/images/logo/icon-blue.png"));
writeFileSync(resolve(ROOT, "public/favicon.svg"), logo);
await png(logo, 32, resolve(ROOT, "public/favicon.png"));
await png(logo, 256, resolve(ROOT, "public/apple-touch-icon.png"));
await png(logo, 100, resolve(ROOT, "public/images/logo.png"));

// Contact sheet at Odoo app-menu size, to check legibility by eye.
const names = Object.keys(ICONS);
const cell = 72, pad = 12;
const sheet = await sharp({
  create: { width: names.length * (cell + pad) + pad, height: cell + 2 * pad, channels: 4, background: "#f4f5f7" },
})
  .composite(
    await Promise.all(
      names.map(async (n, i) => ({
        input: await sharp(`${OUT}/${n}.png`).resize(cell, cell).png().toBuffer(),
        left: pad + i * (cell + pad),
        top: pad,
      }))
    )
  )
  .png()
  .toFile(`${OUT}/_contact-sheet.png`);
console.log(`rendered ${names.length} icons + logo mark + favicons`);
