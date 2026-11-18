const { chromium } = require('playwright');

const PHONE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

async function newContext(browser, width) {
  if (width === 390) {
    return browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: PHONE_UA });
  }
  return browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
}

async function login(page, base, db) {
  await page.goto(`${base}/web/login?db=${db}`);
  await page.fill('#login', 'admin');
  await page.fill('#password', 'admin');
  await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
  await page.waitForSelector('.o_web_client', { timeout: 60000 });
}

async function rpc(page, model, method, args, kwargs = {}) {
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

async function settle(page, ms = 1200) {
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch (e) {}
  await page.waitForTimeout(ms);
}

async function box(page, locator, label) {
  const l = typeof locator === 'string' ? page.locator(locator).first() : locator.first();
  const b = await l.boundingBox();
  if (!b) return { label, x: null, y: null, width: null, height: null, note: 'not visible' };
  return { label, x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) };
}

module.exports = { chromium, newContext, login, rpc, settle, box };
