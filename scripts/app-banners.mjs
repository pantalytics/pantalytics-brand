/**
 * App banners: the first `images` entry of each Odoo module, which is the
 * only picture the Odoo app store shows on its cards (and the thumbnail on
 * the MCP Pro app store tiles). One template for every app: the painted
 * app icon, the app's name and one tagline on the brand's dark ground.
 *
 * 1120x560 (2:1, the Odoo store card). Everything sits inside the 16:9
 * centre, because the MCP Pro tile crops the banner to 16:9.
 *
 * Renders HTML with headless Chrome so the self-hosted Murecho is used.
 * Run `npm run icons` first: the banners take the icons from
 * public/images/app-icons/.
 *
 * Usage:
 *   node scripts/app-banners.mjs            # render into public/images/app-banners/
 *   node scripts/app-banners.mjs --install  # also copy into the addon repos
 *   CHROME=/path/to/chrome node scripts/app-banners.mjs
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB = resolve(ROOT, "..");
const ICONS = resolve(ROOT, "public/images/app-icons");
const FONTS = resolve(ROOT, "public/fonts");
const OUT = resolve(ROOT, "public/images/app-banners");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** banner name → icon, name, tagline, install targets (module dirs) */
const BANNERS = {
  "mail-pro": {
    icon: "outlook-pro",
    name: "Mail Pro",
    tagline: "Your own mailbox, inside Odoo",
    install: ["pan_mail_pro"],
  },
  "mcp-pro-governance": {
    icon: "mcp-pro",
    name: "MCP Pro Governance",
    tagline: "AI agents in Odoo, with a full audit trail",
    install: ["odoo-mcp-pro-governance/pan_mcp_pro_governance"],
  },
  "style-pro": {
    icon: "style-pro",
    name: "Style Pro",
    tagline: "A calm, modern Odoo backend",
    install: ["odoo-style-pro/pan_style_pro"],
  },
  "self-learning": {
    icon: "self-learning",
    name: "Odoo Self Learning",
    tagline: "See how your team really uses Odoo",
    install: ["odoo-self-learning/pan_self_learning"],
  },
};

const html = ({ icon, name, tagline }) => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: Murecho; src: url("file://${FONTS}/murecho-latin.woff2") format("woff2"); font-weight: 400 700; }
  html, body { margin: 0; width: 1120px; height: 560px; overflow: hidden; }
  body {
    background: radial-gradient(circle at 30% 50%, rgba(155,153,255,0.22), transparent 55%), #001d21;
    font-family: Murecho, sans-serif; color: #fff;
    display: flex; align-items: center; gap: 52px; padding: 0 120px; box-sizing: border-box;
  }
  img { width: 300px; height: 300px; flex: none; filter: drop-shadow(0 18px 40px rgba(0,0,0,0.45)); }
  h1 { margin: 0 0 18px; font-size: 52px; font-weight: 700; white-space: nowrap; line-height: 1.05; letter-spacing: -0.01em; }
  p { margin: 0; font-size: 30px; white-space: nowrap; line-height: 1.3; color: #c0d6e4; }
  small { display: block; margin-top: 28px; font-size: 20px; font-weight: 600; color: #9b99ff; letter-spacing: 0.04em; }
</style>
<img src="file://${ICONS}/${icon}.png">
<div><h1>${name}</h1><p>${tagline}</p><small>by Pantalytics</small></div>
`;

const install = process.argv.includes("--install");
mkdirSync(OUT, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "app-banners-"));

for (const [key, banner] of Object.entries(BANNERS)) {
  const page = join(tmp, `${key}.html`);
  writeFileSync(page, html(banner));
  const dest = `${OUT}/${key}.png`;
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    "--force-device-scale-factor=1", "--window-size=1120,560", "--virtual-time-budget=2000",
    `--screenshot=${dest}`, `file://${page}`,
  ], { stdio: "ignore" });
  console.log(`rendered ${key}`);
  if (!install) continue;
  for (const addon of banner.install) {
    const target = resolve(GITHUB, addon, "static/description/banner.png");
    if (!existsSync(dirname(target))) { console.warn(`skip ${target}: missing`); continue; }
    copyFileSync(dest, target);
    console.log(`installed ${key} -> ${addon}`);
  }
}
