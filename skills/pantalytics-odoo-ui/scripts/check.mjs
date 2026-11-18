// Measures a running Odoo screen against the counts in SKILL.md, at desktop
// and phone width, and saves the screenshots the lazy user needs.
//
//   node check.mjs <url> [<url> ...] [--out dir] [--login admin] [--password admin]
//
// <url> is any Odoo backend URL (e.g. http://localhost:8020/odoo/action-my_module.action_agents).
// Prints one table per URL and writes <out>/check.json plus <out>/<n>-<width>.png.
// Exit code 1 when a check fails. The DOM classes it reads are Odoo's own
// (o_* names); see reference/ for what each part is.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const { chromium } = createRequire(import.meta.url)("playwright");

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const OUT = opt("out", "lazy-user-shots");
const LOGIN = opt("login", "admin");
const PASSWORD = opt("password", "admin");
const URLS = args;
if (!URLS.length) {
  console.error("usage: node check.mjs <url> [<url> ...] [--out dir]");
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: "1440", viewport: { width: 1440, height: 900 }, mobile: false },
  { name: "390", viewport: { width: 390, height: 844 }, mobile: true },
];

// Runs inside the page. Every check returns { value, limit, pass }.
function measure() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const all = (sel, root = document) => [...root.querySelectorAll(sel)].filter(vis);
  const fold = innerHeight;
  const out = {};
  const check = (name, value, limit, pass) => (out[name] = { value, limit, pass });

  // One filled button per screen (control panel, header, dialog footer).
  const primaries = all(".o_action_manager .btn-primary, .modal .btn-primary")
    .filter((b) => !b.closest(".dropdown-menu, .o-dropdown--menu, .o-mail-Chatter, .o-mail-Form-chatter"));
  check("btn-primary", primaries.length, "<= 1", primaries.length <= 1);

  // The main action is the first header button (the only one on a phone).
  const header = all(".o_statusbar_buttons > .btn, .o_statusbar_buttons > button");
  const firstOk = !header.length || !header.some((b) => b.classList.contains("btn-primary"))
    || header[0].classList.contains("btn-primary");
  check("primary first in header", header.length ? header[0].innerText.trim() : "-", "first", firstOk);

  // Sentences above the fold (data, chatter and free text excluded).
  const skip = ".o_data_row, .o_kanban_record, .o-mail-Chatter, .o-mail-Form-chatter, .o_field_html, .o_field_text, .o_notebook .o_list_renderer, .modal-body .o_field_widget, input, textarea";
  const sentences = [];
  const walk = document.createTreeWalker(document.querySelector(".o_action_manager") || document.body, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const t = walk.currentNode.textContent.trim();
    const el = walk.currentNode.parentElement;
    if (!t || !el || el.closest(skip) || !vis(el)) continue;
    if (el.getBoundingClientRect().top > fold) continue;
    if (t.split(/\s+/).length >= 6 && /[.!?]$/.test(t)) sentences.push(t.slice(0, 60));
  }
  const empty = !!document.querySelector(".o_view_nocontent");
  check("sentences above fold", sentences.length, empty ? "<= 1 (empty)" : "0",
    sentences.length <= (empty ? 1 : 0));
  out.sentences = sentences;

  // List: visible columns (the main list, not lines inside a form).
  const mainList = all(".o_list_table").find((t) => !t.closest(".o_form_view"));
  const cols = (mainList ? all("thead th", mainList) : []).filter((th) =>
    !th.classList.contains("o_list_record_selector") && !th.classList.contains("o_list_actions_header")
    && th.innerText.trim());
  if (mainList) check("list columns", cols.length, "<= 6", cols.length <= 6);

  // List: one status badge column.
  const badgeCols = mainList ? all("thead th.o_badge_cell", mainList) : [];
  if (mainList) check("status badge columns", badgeCols.length, "<= 1", badgeCols.length <= 1);

  // Status colours: never info or primary.
  const wrongColour = all(".o_field_badge .badge, .o_field_badge span").filter((b) =>
    /text-bg-(info|primary)|bg-info|bg-primary/.test(b.className));
  check("info/primary status colour", wrongColour.length, "0", wrongColour.length === 0);

  // Kanban: no buttons on cards (footer widgets are fine).
  const cardButtons = all(".o_kanban_record .btn, .o_kanban_record button")
    .filter((b) => !b.closest(".o_priority, .o-mail-ActivityButton, .o_dropdown_kanban, .o_field_kanban_activity"));
  if (document.querySelector(".o_kanban_record")) check("buttons on cards", cardButtons.length, "0", cardButtons.length === 0);

  // Form: fields above the tabs.
  const sheet = document.querySelector(".o_form_sheet");
  if (sheet) {
    const nb = sheet.querySelector(".o_notebook");
    const top = nb ? nb.getBoundingClientRect().top : Infinity;
    const fields = all(".o_form_sheet .o_field_widget").filter((f) =>
      f.getBoundingClientRect().top < top && !f.closest(".oe_title, .o-form-buttonbox, .o_notebook"));
    check("fields above tabs", fields.length, "<= 8", fields.length <= 8);
    const pages = all(".o_notebook_headers .nav-item").length;
    check("notebook pages", pages, "0 or 2-3", pages === 0 || (pages >= 2 && pages <= 3));
    const sub = sheet.querySelector(".oe_title");
    const under = sub ? all("p, .text-muted, small", sub).length : 0;
    check("text under title", under, "0", under === 0);
  }

  // Alerts on the page.
  const alerts = all(".o_action_manager .alert").filter((a) => !a.closest(".o_notification"));
  check("alerts", alerts.length, "<= 1", alerts.length <= 1);

  // Smart buttons.
  const stat = all(".oe_stat_button").length;
  if (stat) check("smart buttons", stat, "<= 4", stat <= 4);

  // Icons that render nothing (Font Awesome on Odoo 20).
  const broken = all("i.fa, span.fa").filter((i) => {
    const c = getComputedStyle(i, "::before").content;
    return !c || c === "none" || c === "normal" || c === '""';
  });
  check("broken icons", broken.length, "0", broken.length === 0);

  // No horizontal scroll: not the page, and not a box inside it (a list on a phone).
  const sw = document.scrollingElement.scrollWidth;
  check("horizontal scroll", sw - innerWidth, "0", sw <= innerWidth);
  const sideways = all(".o_action_manager *").filter((el) => {
    const ox = getComputedStyle(el).overflowX;
    return (ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 2
      && !el.closest(".o_notebook, .o_statusbar_status, .o_control_panel, .o-mail-Chatter");
  });
  check("boxes that scroll sideways", sideways.length, "0", sideways.length === 0);

  // Our accent or font in the backend.
  const ours = all(".o_action_manager *").filter((el) => {
    const s = getComputedStyle(el);
    return /murecho/i.test(s.fontFamily) || /155, 153, 255/.test(s.color + s.backgroundColor);
  });
  check("our accent or font", ours.length, "0", ours.length === 0);

  return out;
}

const browser = await chromium.launch();
const report = [];
let failed = false;
for (const [n, url] of URLS.entries()) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: w.viewport, isMobile: w.mobile, hasTouch: w.mobile });
    const page = await ctx.newPage();
    const base = new URL(url).origin;
    await page.goto(base + "/web/login");
    await page.fill("input[name=login]", LOGIN);
    await page.fill("input[name=password]", PASSWORD);
    await Promise.all([page.waitForNavigation(), page.click("button[type=submit]")]);
    await page.goto(url);
    await page.waitForSelector(".o_action_manager .o_view_controller, .o_action_manager .o_action", { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const shot = `${OUT}/${n + 1}-${w.name}.png`;
    await page.screenshot({ path: shot });
    const m = await page.evaluate(measure);
    report.push({ url, width: w.name, screenshot: shot, checks: m });
    console.log(`\n${url} @ ${w.name}px  (${shot})`);
    for (const [k, v] of Object.entries(m)) {
      if (!v || typeof v.pass !== "boolean") continue;
      if (!v.pass) failed = true;
      console.log(`  ${v.pass ? "ok  " : "FAIL"} ${k}: ${v.value} (limit ${v.limit})`);
    }
    if (m.sentences?.length) console.log("       sentences:", m.sentences.join(" | "));
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${OUT}/check.json`, JSON.stringify(report, null, 2));
console.log(`\nScreenshots for the lazy user: ${OUT}/ (see agents/lazy-user.md)`);
process.exit(failed ? 1 : 0);
