// Annotated screenshots of Odoo's interface for the "Odoo UI" brand page.
// Runs read-only against a running Odoo (default: Odoo 20 Enterprise with
// demo data, see docs/odoo-ui-skill/screens/HOWTO.md). Numbers are drawn into
// the page as DOM overlays, so they sit exactly on the element they name.
//   node scripts/odoo-ui-shots.mjs [baseUrl] [outDir]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.argv[2] || "http://localhost:8020";
const OUT = process.argv[3] || "public/images/odoo-ui";

const wait = (p, ms = 1800) => p.waitForTimeout(ms);

async function mark(p, items) {
  await p.evaluate(() => {
    // Not Odoo: our own test app (pan_ui_probe) and the trial banner.
    for (const el of document.querySelectorAll(".o_app, .settings_tab .tab, .o_menu_sections a")) {
      if (el.innerText.trim() === "Agents") (el.closest(".o_draggable") || el).remove();
    }
    // Room above the navbar so its numbers are not cut off.
    if (window.innerWidth > 500) document.body.style.paddingTop = "18px";
    for (const el of document.querySelectorAll(".database_expiration_panel, .o_database_expiration_panel, .alert")) {
      if (/expire/i.test(el.textContent)) el.style.display = "none";
    }
  });
  await p.waitForTimeout(300);
  const missing = await p.evaluate((items) => {
    document.querySelectorAll(".pan-mark").forEach((e) => e.remove());
    const miss = [];
    for (const it of items) {
      const el = document.querySelectorAll(it.sel)[it.nth || 0];
      if (!el) { miss.push(it.n + " " + it.sel); continue; }
      const r = el.getBoundingClientRect();
      const pad = it.pad ?? 3;
      const box = document.createElement("div");
      box.className = "pan-mark";
      Object.assign(box.style, {
        position: "fixed", zIndex: 99999, pointerEvents: "none",
        left: r.left - pad + "px", top: r.top - pad + "px",
        width: r.width + 2 * pad + "px", height: r.height + 2 * pad + "px",
        border: "2px solid #6c69f5", borderRadius: "6px",
        boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
      });
      const b = document.createElement("div");
      b.className = "pan-mark";
      b.textContent = it.n;
      const size = 24;
      let x = r.left - pad - size / 2;
      let y = r.top - pad - size / 2;
      if (it.at === "right") x = r.right + pad - size / 2;
      if (it.at === "left") { x = r.left - pad - size - 4; y = r.top + r.height / 2 - size / 2; }
      if (it.at === "below") { y = r.bottom + pad + 2; x = r.left; }
      x = Math.max(2, Math.min(window.innerWidth - size - 2, x));
      y = Math.max(2, Math.min(window.innerHeight - size - 2, y));
      Object.assign(b.style, {
        position: "fixed", zIndex: 100000, pointerEvents: "none",
        left: x + "px", top: y + "px", width: size + "px", height: size + "px",
        borderRadius: "50%", background: "#001d21", color: "#fff",
        font: "700 13px/24px system-ui, sans-serif", textAlign: "center",
        boxShadow: "0 0 0 2px #9b99ff",
      });
      document.body.append(box, b);
    }
    return miss;
  }, items);
  if (missing.length) console.warn("  missing:", missing.join("; "));
}

async function shot(p, name) {
  await p.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 82 });
  console.log("saved", name);
}

const browser = await chromium.launch();

async function session(viewport, scale) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale,
    isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/web/login");
  await p.fill("input[name=login]", "admin");
  await p.fill("input[name=password]", "admin");
  await Promise.all([p.waitForNavigation(), p.click("button[type=submit]")]);
  await wait(p);
  return p;
}

const d = await session({ width: 1440, height: 900 }, 2);
const go = async (path) => { await d.goto(BASE + path); await wait(d, 2500); };

// 1. Home menu
await d.setViewportSize({ width: 1440, height: 470 });
await go("/odoo");
await mark(d, [
  { n: 1, sel: ".o_app", nth: 0, pad: 6 },
  { n: 2, sel: ".o_menu_systray", at: "left" },
  { n: 3, sel: ".o_user_menu" },
]);
await shot(d, "01-home-menu");

// 2. Shell and list
await d.setViewportSize({ width: 1440, height: 600 });
await go("/odoo/sales");
await mark(d, [
  { n: 1, sel: ".o_menu_toggle" },
  { n: 2, sel: ".o_menu_sections" },
  { n: 3, sel: ".o_menu_systray" },
  { n: 4, sel: ".o_user_menu", at: "right" },
  { n: 5, sel: ".o_list_button_add", at: "left" },
  { n: 6, sel: ".o_breadcrumb" },
  { n: 7, sel: ".o_cp_action_menus", at: "right" },
  { n: 8, sel: ".o_cp_searchview" },
  { n: 9, sel: ".o_pager" },
  { n: 10, sel: ".o_cp_switch_buttons" },
  { n: 11, sel: ".o_website_sale_dashboard, .o_cards_container", at: "right" },
  { n: 12, sel: ".o_list_table thead", pad: 0 },
  { n: 13, sel: ".o_field_badge", nth: 0, at: "right" },
  { n: 14, sel: ".o_optional_columns_dropdown_toggle", at: "left" },
]);
await shot(d, "02-shell-list");

// 3. Search dropdown
await d.setViewportSize({ width: 1440, height: 640 });
await d.click(".o_searchview_dropdown_toggler");
await wait(d, 1200);
await mark(d, [
  { n: 1, sel: ".o_searchview_facet" },
  { n: 2, sel: ".o_filter_menu" },
  { n: 3, sel: ".o_group_by_menu" },
  { n: 4, sel: ".o_favorite_menu" },
]);
await shot(d, "03-search");

// 4. Form
await d.setViewportSize({ width: 1440, height: 900 });
await go("/odoo/sales");
await d.click(".o_data_row td.o_data_cell");
await wait(d, 2500);
await mark(d, [
  { n: 1, sel: ".o_breadcrumb" },
  { n: 2, sel: ".o-form-buttonbox" },
  { n: 3, sel: ".o_pager" },
  { n: 4, sel: ".o_statusbar_buttons", pad: 5 },
  { n: 5, sel: ".o_statusbar_status" },
  { n: 6, sel: ".oe_title" },
  { n: 7, sel: ".o_form_sheet .o_group", nth: 0 },
  { n: 8, sel: ".o_notebook_headers" },
  { n: 9, sel: ".o-mail-Form-chatter, .o-mail-ChatterContainer" },
]);
await shot(d, "04-form");

// 5. Kanban
await d.setViewportSize({ width: 1440, height: 820 });
await go("/odoo/crm");
await mark(d, [
  { n: 1, sel: ".o_kanban_header_title", nth: 0 },
  { n: 2, sel: ".o_column_progress", nth: 0, at: "left" },
  { n: 3, sel: ".o_kanban_quick_add", nth: 0, at: "right" },
  { n: 4, sel: ".o_kanban_record", nth: 0, at: "right" },
  { n: 5, sel: ".o_kanban_record .o_field_priority", nth: 0, at: "below" },
  { n: 6, sel: ".o_kanban_record .o-mail-ActivityButton", nth: 0, at: "right" },
  { n: 7, sel: ".o_column_quick_create" },
]);
await shot(d, "05-kanban");

// 6. Settings (Sales)
await d.setViewportSize({ width: 1440, height: 900 });
await go("/odoo/settings#sale_management");
await mark(d, [
  { n: 1, sel: ".settings_tab" },
  { n: 2, sel: ".o_cp_searchview" },
  { n: 3, sel: ".o_form_button_save" },
  { n: 4, sel: ".app_settings_block h2, .o_settings_container", nth: 0 },
  { n: 5, sel: ".o_setting_box", nth: 0, at: "right" },
  { n: 6, sel: ".o_setting_box .o_setting_left_pane", nth: 0, at: "left" },
  { n: 7, sel: ".o_setting_box .text-muted", nth: 0, at: "right" },
  { n: 8, sel: ".o_setting_box .btn-link", nth: 0, at: "right" },
]);
await shot(d, "06-settings");

// 7. Wizard
await d.setViewportSize({ width: 1440, height: 700 });
const soId = await d.evaluate(async () => {
  const r = await fetch("/web/dataset/call_kw/sale.order/search_read", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: {
      model: "sale.order", method: "search_read",
      args: [[["state", "=", "sale"], ["invoice_status", "=", "to invoice"]], ["id"]],
      kwargs: { limit: 1, order: "id desc" } } }) });
  return (await r.json()).result[0].id;
});
await go(`/odoo/action-sale.action_orders/${soId}`);
await d.locator(".o_statusbar_buttons button").filter({ hasText: /create invoice/i }).first().click();
await wait(d, 2000);
await mark(d, [
  { n: 1, sel: ".modal-header" },
  { n: 2, sel: ".modal-body" },
  { n: 3, sel: ".modal-footer .btn-primary", nth: 0 },
  { n: 4, sel: ".modal-footer .btn-secondary", nth: 0 },
]);
await shot(d, "07-wizard");
await d.keyboard.press("Escape");

// 8. Empty state
await d.setViewportSize({ width: 1440, height: 800 });
await go("/odoo/sales");
await d.fill(".o_searchview_input", "zzqx");
await d.keyboard.press("Enter");
await wait(d, 2000);
await mark(d, [
  { n: 1, sel: ".o_nocontent_help" },
  { n: 2, sel: ".o_list_button_add" },
]);
await shot(d, "08-empty");

// 9. Phone
const m = await session({ width: 390, height: 844 }, 2);
const mgo = async (path) => { await m.goto(BASE + path); await wait(m, 2500); };
await mgo("/odoo/sales");
await mark(m, [
  { n: 1, sel: ".o_menu_toggle, .o_mobile_menu_toggle" },
  { n: 2, sel: ".o_control_panel_main_buttons" },
  { n: 3, sel: ".o_control_panel button:has([data-icon=search])" },
  { n: 4, sel: ".o_cp_switch_buttons, .o_switch_view" },
  { n: 5, sel: ".o_kanban_record", nth: 0 },
]);
await m.screenshot({ path: `${OUT}/09-phone-list.jpg`, type: "jpeg", quality: 82 });
await mgo("/odoo/sales");
await m.click(".o_kanban_record");
await wait(m, 2500);
await mark(m, [
  { n: 6, sel: ".o_statusbar_buttons" },
  { n: 7, sel: ".o_statusbar_status" },
  { n: 8, sel: ".o-form-buttonbox, .o_cp_action_menus" },
]);
await m.screenshot({ path: `${OUT}/09-phone-form.jpg`, type: "jpeg", quality: 82 });
console.log("saved 09-phone");

await browser.close();
