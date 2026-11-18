// Usage: node shoot.js <version> <baseUrl> <db> [only=01,02]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [version, baseUrl, db, onlyArg] = process.argv.slice(2);
const only = onlyArg ? onlyArg.split(',') : null;
const outDir = `/home/user/pantalytics-brand/docs/odoo-ui-skill/screens/${version}`;
fs.mkdirSync(outDir, { recursive: true });

const sizes = [
  { w: 1440, h: 900, mobile: false },
  { w: 390, h: 844, mobile: true },
];
const log = [];

async function settle(page, ms = 1200) {
  try { await page.waitForLoadState('networkidle', { timeout: 4000 }); } catch (e) {}
  try {
    await page.waitForFunction(() => !document.querySelector('.o_loading_indicator, .o_blockUI, .o-main-components-container .o_loading'), null, { timeout: 15000 });
  } catch (e) {}
  await page.waitForTimeout(ms);
}

async function rpc(page, model, method, args = [], kwargs = {}) {
  return page.evaluate(async ({ model, method, args, kwargs }) => {
    const r = await fetch(`/web/dataset/call_kw/${model}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs } }),
    });
    const j = await r.json();
    if (j.error) throw new Error(JSON.stringify(j.error).slice(0, 500));
    return j.result;
  }, { model, method, args, kwargs });
}

async function go(page, url) {
  await page.goto(baseUrl + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.waitForSelector('.o_action_manager > *, .o_home_menu', { timeout: 30000 }); } catch (e) {}
  await settle(page);
}

async function shot(page, nn, name, w) {
  const file = path.join(outDir, `${nn}-${name}-${w}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 75 });
}

async function clickFirst(page, selectors, opts = {}) {
  for (const s of selectors) {
    const loc = page.locator(s).first();
    try {
      if (await loc.count() && await loc.isVisible()) { await loc.click(opts); return s; }
    } catch (e) {}
  }
  return null;
}

async function ensureList(page) {
  if (await page.locator('.o_list_renderer, .o_list_view').count()) return true;
  const t = await clickFirst(page, ['.o_cp_switch_buttons .dropdown-toggle', '.o_cp_switch_buttons button.o-dropdown']);
  await page.waitForTimeout(500);
  const it = page.locator('.dropdown-item, .o-dropdown-item').filter({ hasText: /^\s*List\s*$/ }).first();
  if (await it.count()) { await it.click(); await settle(page, 600); }
  return !!(await page.locator('.o_list_renderer, .o_list_view').count());
}

async function openSearchDropdown(page) {
  if (!(await page.locator('.o_searchview_dropdown_toggler').first().isVisible().catch(() => false))) {
    await clickFirst(page, ['.o_control_panel button:has(.fa-search)', '.o_control_panel button:has(.oi-search)', '.o_control_panel button:has(i[data-icon="search"])', '.o_control_panel button.o_enable_searchview']);
    await page.waitForTimeout(700);
  }
  return clickFirst(page, [
    '.o_searchview_dropdown_toggler',
    '.o_control_panel .o_searchview_dropdown_toggler',
    'button.o_enable_searchview',
    '.o_control_panel_navigation button.o_enable_searchview',
    '.o_filter_menu button', '.o_filter_menu .dropdown-toggle',
  ]);
}

async function main() {
  const browser = await chromium.launch();
  for (const sz of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 1,
      isMobile: sz.mobile, hasTouch: sz.mobile,
      userAgent: sz.mobile
        ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
        : undefined,
      locale: 'en-US', timezoneId: 'Europe/Amsterdam',
    });
    const page = await ctx.newPage();
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.goto(`${baseUrl}/web/login?db=${encodeURIComponent(db)}`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name=login]', 'admin');
    await page.fill('input[name=password]', 'admin');
    await Promise.all([page.waitForNavigation({ timeout: 60000 }).catch(() => {}), page.click('button[type=submit]')]);
    await settle(page, 2000);

    // Resolve record ids once per context
    const ids = {};
    const one = async (model, domain, order) => {
      const r = await rpc(page, model, 'search_read', [domain], { fields: ['id'], limit: 1, order });
      return r.length ? r[0].id : null;
    };
    ids.partner = await one('res.partner', [['is_company', '=', true], ['name', 'ilike', 'Azure']], 'id') || await one('res.partner', [['is_company', '=', true]], 'id');
    ids.lead = await one('crm.lead', [['type', '=', 'opportunity'], ['active', '=', true]], 'expected_revenue desc');
    ids.so = await one('sale.order', [['state', '=', 'sale'], ['invoice_status', '=', 'to invoice']], 'id desc') || await one('sale.order', [['state', '=', 'sale']], 'id desc');
    ids.picking = await one('stock.picking', [['picking_type_code', '=', 'outgoing'], ['state', 'in', ['assigned', 'confirmed']]], 'id') || await one('stock.picking', [], 'id');
    try { ids.scrapCount = await rpc(page, 'stock.scrap', 'search_count', [[]]); ids.scrapAction = 'stock.action_stock_scrap'; }
    catch (e) { ids.scrapAction = 'stock.stock_scrapped_moves_action'; ids.scrapCount = await rpc(page, 'stock.move', 'search_count', [[['scrapped', '=', true]]]).catch(() => -1); }
    const md = await rpc(page, 'ir.model.data', 'search_read', [[['module', '=', 'stock'], ['name', '=', 'menu_stock_root']]], { fields: ['res_id'] });
    ids.stockMenu = md.length ? md[0].res_id : '';
    const md2 = await rpc(page, 'ir.model.data', 'search_read', [[['module', '=', 'mail'], ['name', '=', 'menu_root_discuss']]], { fields: ['res_id'] });
    ids.discussMenu = md2.length ? md2[0].res_id : '';
    const apps = { crm: ['crm', 'crm_menu_root'], sale: ['sale', 'sale_menu_root'], contacts: ['contacts', 'menu_contacts'], acc: ['account', 'menu_finance'], set: ['base', 'menu_administration'] };
    const M = {};
    for (const [k, [mod, name]] of Object.entries(apps)) {
      const r = await rpc(page, 'ir.model.data', 'search_read', [[['module', '=', mod], ['name', '=', name]]], { fields: ['res_id'] });
      M[k] = r.length ? r[0].res_id : '';
    }
    ids.M = M;
    log.push(`${sz.w} ids ${JSON.stringify(ids)}`);

    const W = sz.w;
    const want = nn => !only || only.includes(nn);
    const steps = [
      ['01', 'home-menu', async () => {
        await go(page, '/odoo');
        if (!(await page.locator('.o_home_menu').count())) {
          const c = await clickFirst(page, ['.o_menu_toggle', '.o_navbar_apps_menu button', '.o_navbar_apps_menu .dropdown-toggle', 'button[title="Home Menu"]']);
          await settle(page, 800);
          if (!c) log.push(`${W} 01: no app switcher toggle found`);
        }
      }],
      ['02', 'contacts-kanban', async () => { await go(page, '/odoo/action-contacts.action_contacts?view_type=kanban'); }],
      ['03', 'contacts-list', async () => { await go(page, '/odoo/action-contacts.action_contacts?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`); }],
      ['04', 'contact-form', async () => { await go(page, `/odoo/action-contacts.action_contacts/${ids.partner}`); }],
      ['05', 'crm-pipeline', async () => { await go(page, `/odoo/action-crm.crm_lead_action_pipeline?menu_id=${M.crm}`); }],
      ['06', 'crm-lead-form', async () => { await go(page, `/odoo/action-crm.crm_lead_action_pipeline/${ids.lead}?menu_id=${M.crm}`); }],
      ['07', 'sales-quotations-list', async () => { await go(page, '/odoo/action-sale.action_quotations_with_onboarding?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`); }],
      ['08', 'sale-order-form', async () => {
        await go(page, `/odoo/action-sale.action_orders/${ids.so}`);
        if (sz.mobile) {
          await shot(page, '08', 'sale-order-form', W);
          const ch = page.locator('.o-mail-Chatter, .o_FormRenderer_chatterContainer, .oe_chatter').first();
          if (await ch.count()) { await ch.scrollIntoViewIfNeeded(); await settle(page, 600); await shot(page, '08', 'sale-order-chatter', W); }
          else log.push(`${W} 08: no chatter found`);
          await go(page, `/odoo/action-sale.action_orders/${ids.so}`);
        }
      }],
      ['09', 'create-invoice-wizard', async () => {
        await go(page, `/odoo/action-sale.action_orders/${ids.so}`);
        let btn = page.locator('.o_form_statusbar button, .o_statusbar_buttons button, .o_cp_action_menus button').filter({ hasText: /create invoice/i }).first();
        if (!(await btn.count()) || !(await btn.isVisible())) {
          // mobile: header buttons can be folded into a dropdown
          await clickFirst(page, ['.o_statusbar_buttons .dropdown-toggle', '.o_form_statusbar .o_statusbar_buttons button.dropdown-toggle', '.o_statusbar_buttons .o-dropdown button', '.o_cp_action_menus .dropdown-toggle', '.o_control_panel button:has(.fa-cog)']);
          await page.waitForTimeout(500);
          btn = page.locator('button, .dropdown-item').filter({ hasText: /create invoice/i }).first();
        }
        if (await btn.count()) { await btn.click(); await page.waitForSelector('.modal', { timeout: 15000 }).catch(() => {}); await settle(page, 800); }
        else log.push(`${W} 09: Create invoice button not found`);
      }],
      ['10', 'inventory-transfer-form', async () => { await go(page, `/odoo/action-stock.action_picking_tree_all/${ids.picking}?menu_id=${ids.stockMenu}`); }],
      ['11', 'general-settings', async () => { await go(page, '/odoo/action-base_setup.action_general_configuration'); }],
      ['12', 'sales-settings', async () => { await go(page, '/odoo/action-sale.action_sale_config_settings'); }],
      ['13', 'search-filter-dropdown', async () => {
        await go(page, '/odoo/action-sale.action_orders?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`);
        const c = await openSearchDropdown(page);
        await settle(page, 800);
        if (!c) log.push(`${W} 13: no search dropdown toggle found`);
      }],
      ['14', 'list-grouped', async () => {
        await go(page, '/odoo/action-sale.action_orders?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`);
        const c = await openSearchDropdown(page);
        await page.waitForTimeout(600);
        const opt = page.locator('.o_group_by_menu .o_menu_item, .o_group_by_menu .dropdown-item, .o_searchview_dropdown_toggler ~ * .o_menu_item, .o_dropdown_container .o_menu_item, .o-dropdown--menu .o_menu_item, .o_search_bottom_sheet .o_menu_item, .modal .o_menu_item').filter({ hasText: /^\s*Salesperson\s*$/ }).first();
        if (await opt.count()) { await opt.click(); await settle(page, 600); }
        else log.push(`${W} 14: Salesperson group-by option not found (toggle ${c})`);
        // close dropdown / sheet
        await page.keyboard.press('Escape').catch(() => {});
        await clickFirst(page, ['.modal .btn-close', '.o_mobile_search_footer button', 'button.o_mobile_search_button', '.o_search_bottom_sheet .btn-close', '.o_bottom_sheet .btn-close']);
        await settle(page, 600);
        const g = page.locator('.o_group_header').first();
        if (await g.count()) { await g.click(); await settle(page, 600); }
        else log.push(`${W} 14: no group header visible`);
      }],
      ['15', 'empty-state', async () => {
        // Quotations list (action with help text) searched for a term that matches nothing
        await go(page, '/odoo/action-sale.action_quotations_with_onboarding?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`);
        const inp = page.locator('.o_searchview_input').first();
        if (await inp.count() && await inp.isVisible()) { await inp.fill('zzqx'); await page.waitForTimeout(800); await inp.press('Enter'); }
        else {
          await clickFirst(page, ['.o_control_panel button:has(.fa-search)', '.o_control_panel button:has(.oi-search)', '.o_control_panel button:has(i[data-icon="search"])', 'button.o_enable_searchview']);
          await page.waitForTimeout(500);
          const i2 = page.locator('.o_searchview_input').first();
          if (await i2.count()) { await i2.fill('zzqx'); await page.waitForTimeout(800); await i2.press('Enter'); } else log.push(`${W} 15: no search input`);
        }
        await settle(page, 800);
      }],
      ['16', 'discuss', async () => { await go(page, `/odoo/action-mail.action_discuss?menu_id=${ids.discussMenu}`); }],
      ['17', 'invoicing-dashboard', async () => { await go(page, '/odoo/action-account.open_account_journal_dashboard_kanban'); }],
      ['18', 'list-row-selected', async () => {
        await go(page, '/odoo/action-contacts.action_contacts?view_type=list'); if (sz.mobile && !(await ensureList(page))) log.push(`${W}: list view not reached`);
        const cb = page.locator('.o_data_row .o_list_record_selector input, .o_data_row .o_list_record_selector').first();
        let done = false;
        if (await cb.count() && await cb.isVisible()) { await cb.click(); done = true; }
        if (!done) {
          // touch long-press on first row
          const row = page.locator('.o_data_row').first();
          if (await row.count()) {
            const b = await row.boundingBox();
            const pt = { x: Math.round(b.x + 100), y: Math.round(b.y + b.height / 2) };
            await page.evaluate(({ x, y }) => {
              const el = document.elementFromPoint(x, y);
              const t = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
              el.dispatchEvent(new TouchEvent('touchstart', { touches: [t], targetTouches: [t], changedTouches: [t], bubbles: true, cancelable: true }));
              window.__lpEnd = () => el.dispatchEvent(new TouchEvent('touchend', { touches: [], targetTouches: [], changedTouches: [t], bubbles: true, cancelable: true }));
            }, pt);
            await page.waitForTimeout(1500);
            await page.evaluate(() => window.__lpEnd());
            done = true; log.push(`${W} 18: used long-press`);
          }
        }
        await settle(page, 800);
        if (!(await page.locator('.o_data_row_selected, .o_data_row .o_list_record_selector input:checked').count())) log.push(`${W} 18: row not selected`);
      }],
    ];

    for (const [nn, name, fn] of steps) {
      if (!want(nn)) continue;
      try {
        await fn();
        await shot(page, nn, name, W);
      } catch (e) {
        log.push(`${W} ${nn} ERROR ${e.message.slice(0, 300)}`);
        try { await shot(page, nn, name, W); } catch (e2) {}
      }
      // Close any modal before next step
      await page.keyboard.press('Escape').catch(() => {});
    }
    await ctx.close();
  }
  await browser.close();
  console.log(log.join('\n'));
}
main().catch(e => { console.error(e); process.exit(1); });
