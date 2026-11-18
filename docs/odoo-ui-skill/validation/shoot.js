// Phase 6 screenshots for pan_ui_probe. Usage: node shoot.js [19,20] [1440,390]
const fs = require('fs');
const { chromium, newContext, login, rpc, settle, box } = require('./shoot-lib');

const OUT = '/home/user/pantalytics-brand/docs/odoo-ui-skill/validation/screens';
const VERS = (process.argv[2] || '19,20').split(',');
const WIDTHS = (process.argv[3] || '1440,390').split(',').map(Number);
const ACT = 'pan_ui_probe.action_pan_probe_agent';
const targetsPath = `${OUT}/targets.json`;
const targets = fs.existsSync(targetsPath) ? JSON.parse(fs.readFileSync(targetsPath)) : {};
const log = [];

function union(a, b, label) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { label, x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}

async function shot(page, ver, name, target) {
  const file = `${OUT}/${ver}/${name}.png`;
  await page.screenshot({ path: file });
  if (target && target.x !== null) {
    // clip to the viewport: a wide list row scrolls inside its own container on a phone
    const vw = page.viewportSize().width, vh = page.viewportSize().height;
    const x2 = Math.min(target.x + target.width, vw), y2 = Math.min(target.y + target.height, vh);
    target = { ...target, x: Math.max(0, target.x), y: Math.max(0, target.y) };
    target.width = x2 - target.x; target.height = y2 - target.y;
  }
  if (target) targets[`${ver}/${name}.png`] = target;
  const sw = await page.evaluate(() => document.scrollingElement.scrollWidth);
  log.push(`${ver}/${name}: ${target ? `${target.label} @${target.x},${target.y} ${target.width}x${target.height}` : 'after'}; scrollWidth=${sw}`);
}

async function openAgents(page, base) {
  await page.goto(`${base}/odoo/action-${ACT}`);
  await page.waitForSelector('.o_view_controller');
  await settle(page);
}

async function ensureList(page) {
  if (await page.locator('.o_list_view').count()) return;
  // phone: the view switcher is one dropdown button opening a bottom sheet
  await page.locator('.o_cp_switch_buttons .dropdown-toggle').first().click();
  await page.locator('.o_bottom_sheet .dropdown-item, .o-dropdown--menu .dropdown-item').filter({ hasText: /^\s*List\s*$/ }).first().click();
  await page.waitForSelector('.o_list_view', { timeout: 10000 });
  await settle(page);
}

async function run(browser, ver, width) {
  const base = `http://localhost:80${ver}`, db = `odoo${ver}`;
  const ctx = await newContext(browser, width); const page = await ctx.newPage();
  await login(page, base, db);
  const recs = await rpc(page, 'pan.probe.agent', 'search_read', [[['active', 'in', [true, false]]]],
    { fields: ['name', 'state', 'active', 'run_count', 'last_run'] });
  const by = Object.fromEntries(recs.map(r => [r.name, r]));
  const sales = by['Sales Agent'], inv = by['Inventory Agent'];
  const w = width;

  // Task 1: home menu, target = Agents tile
  await page.goto(`${base}/odoo`); await page.waitForSelector('.o_home_menu'); await settle(page);
  await shot(page, ver, `task1-${w}`, await box(page, page.locator('.o_home_menu .o_app').filter({ hasText: /^\s*Agents\s*$/ }), 'Agents app tile'));

  // Tasks 2 and 3: Agents list, target = Lead Scorer row (the red Failing badge)
  await openAgents(page, base); await ensureList(page);
  const failRow = page.locator('.o_data_row').filter({ hasText: 'Lead Scorer' });
  await shot(page, ver, `task2-${w}`, await box(page, failRow, 'Lead Scorer row (Failing badge)'));
  await shot(page, ver, `task3-${w}`, await box(page, failRow, 'Lead Scorer row (opens the form with the error)'));

  // Task 4: Sales Agent form, target = Run Now
  await page.goto(`${base}/odoo/action-${ACT}/${sales.id}`); await page.waitForSelector('.o_form_view'); await settle(page);
  await shot(page, ver, `task4-${w}`, await box(page, 'button[name=action_run]', 'Run Now'));
  await page.locator('button[name=action_run]').first().click();
  await page.waitForSelector('.o_notification', { timeout: 10000 }).catch(() => log.push(`${ver}/task4-after-${w}: no notification`));
  await page.waitForTimeout(1500);
  await shot(page, ver, `task4-after-${w}`);
  // restore
  await rpc(page, 'pan.probe.agent', 'write', [[sales.id], { run_count: sales.run_count, last_run: sales.last_run }]);
  const msgs = await rpc(page, 'mail.message', 'search', [[['model', '=', 'pan.probe.agent'], ['res_id', '=', sales.id], ['body', 'ilike', 'Run finished']]]);
  if (msgs.length) await rpc(page, 'mail.message', 'unlink', [msgs]);

  // Task 5: default view (list on desktop, kanban on phone), target = Inventory Agent switch
  await openAgents(page, base);
  const isKanban = await page.locator('.o_kanban_view').count() > 0;
  const holder = isKanban ? page.locator('.o_kanban_record').filter({ hasText: 'Inventory Agent' })
                          : page.locator('.o_data_row').filter({ hasText: 'Inventory Agent' });
  const sw = holder.locator('.o_field_boolean_toggle .form-check').first();
  await shot(page, ver, `task5-${w}`, await box(page, sw, `Inventory Agent on/off switch (${isKanban ? 'kanban card' : 'list row'})`));
  await holder.locator('.o_field_boolean_toggle input').first().click({ force: true });
  await page.waitForTimeout(2000); await settle(page, 500);
  await shot(page, ver, `task5-after-${w}`);
  await rpc(page, 'pan.probe.agent', 'write', [[inv.id], { active: true, state: 'running' }]);

  // Task 6: Settings opened at our app, target = Agents May Write checkbox (+ its label)
  await page.goto(`${base}/odoo/action-pan_ui_probe.action_pan_probe_settings`);
  await page.waitForSelector('.o_setting_container, .settings'); await settle(page);
  const cb = page.locator('.o_field_widget[name=pan_probe_may_write] input').first();
  const lbl = page.locator('#pan_probe_may_write .o_form_label, #pan_probe_may_write label').filter({ hasText: 'Agents May Write' }).first();
  const b1 = await box(page, cb, 'checkbox'); const b2 = await box(page, lbl, 'label');
  await shot(page, ver, `task6-${w}`, b1.x !== null && b2.x !== null ? union(b1, b2, 'Agents May Write checkbox') : { ...b1, label: 'Agents May Write checkbox' });
  await cb.click({ force: true }); await page.waitForTimeout(1000);
  await shot(page, ver, `task6-after-${w}`);
  const discard = page.locator('.o_control_panel button').filter({ hasText: /^\s*Discard\s*$/ }).filter({ visible: true });
  if (await discard.count()) { await discard.first().click(); await page.waitForTimeout(800); }
  else { await cb.click({ force: true }); }

  // Task 7: Sales Agent form, target = Test (desktop) or the header overflow (phone)
  await page.goto(`${base}/odoo/action-${ACT}/${sales.id}`); await page.waitForSelector('.o_form_view'); await settle(page);
  const testBtn = page.locator('button[name=action_open_test]').filter({ visible: true });
  if (await testBtn.count()) {
    await shot(page, ver, `task7-${w}`, await box(page, testBtn, 'Test'));
  } else {
    const more = page.locator('.o_statusbar_buttons .dropdown-toggle, .o_statusbar_buttons .o-dropdown-caret, .o_statusbar_buttons button.dropdown-toggle-split').filter({ visible: true });
    await shot(page, ver, `task7-${w}`, await box(page, more, 'Header overflow next to Run Now (holds Test)'));
  }

  await ctx.close();

  // Task 8: empty database, target = New
  const ebase = `http://localhost:80${Number(ver) + 10}`;
  const ectx = await newContext(browser, width); const ep = await ectx.newPage();
  await login(ep, ebase, `odoo${ver}_empty`);
  await openAgents(ep, ebase);
  const nb = ep.locator('.o_control_panel_main_buttons .btn-primary').filter({ visible: true });
  await shot(ep, ver, `task8-${w}`, await box(ep, nb, 'New'));
  await ectx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const ver of VERS) {
    fs.mkdirSync(`${OUT}/${ver}`, { recursive: true });
    for (const w of WIDTHS) {
      try { await run(browser, ver, w); } catch (e) { log.push(`${ver}/${w}: FAILED ${e.message.split('\n')[0]}`); }
    }
  }
  await browser.close();
  const sorted = Object.fromEntries(Object.keys(targets).sort().map(k => [k, targets[k]]));
  fs.writeFileSync(targetsPath, JSON.stringify(sorted, null, 2) + '\n');
  console.log(log.join('\n'));
})();
