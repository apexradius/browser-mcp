// Real Safari.app lane via safaridriver (W3C WebDriver). SINGLE SESSION by OS
// design — safaridriver permits one automation session per host. Not headless
// (Safari has no headless mode). Same method surface as the Playwright pool so
// the manager can route to it transparently.
import selenium from 'selenium-webdriver';
const { Builder, By, Key } = selenium;

const INDEX_JS = function () {
  const sel = 'a,button,input,textarea,select,[role="button"],[role="link"],[onclick]';
  const out = []; let n = 0;
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const ref = 'e' + (++n);
    el.setAttribute('data-abm-ref', ref);
    const label = (el.getAttribute('aria-label') || el.value || el.innerText || el.placeholder || '').trim().slice(0, 80);
    out.push({ ref, tag: el.tagName.toLowerCase(), type: el.type || '', label });
  }
  return out;
};

export class SafariLane {
  constructor() { this.driver = null; this.id = 'safari-1'; }

  active() { return this.driver !== null; }

  async create() {
    if (this.driver) return this.id; // single-session: reuse
    this.driver = await new Builder().forBrowser('safari').build();
    return this.id;
  }

  _d() { if (!this.driver) throw new Error('no active safari session'); return this.driver; }

  async navigate(_id, url) {
    const d = this._d();
    await d.get(url);
    return { url: await d.getCurrentUrl(), title: await d.getTitle() };
  }

  async snapshot(_id) {
    const d = this._d();
    const elements = await d.executeScript(INDEX_JS);
    return { url: await d.getCurrentUrl(), title: await d.getTitle(), elements };
  }

  async click(_id, ref) {
    const d = this._d();
    await d.findElement(By.css(`[data-abm-ref="${ref}"]`)).click();
    return { url: await d.getCurrentUrl() };
  }

  async type(_id, ref, text, submit = false) {
    const d = this._d();
    const el = d.findElement(By.css(`[data-abm-ref="${ref}"]`));
    await el.clear();
    await el.sendKeys(text);
    if (submit) await el.sendKeys(Key.ENTER);
    return { url: await d.getCurrentUrl() };
  }

  async evaluate(_id, expression) {
    return await this._d().executeScript(`return (${expression});`);
  }

  async screenshot(_id, path) {
    const { writeFile } = await import('node:fs/promises');
    const b64 = await this._d().takeScreenshot();
    await writeFile(path, Buffer.from(b64, 'base64'));
    return { path };
  }

  async close(_id) {
    if (this.driver) { try { await this.driver.quit(); } catch {} this.driver = null; }
    return { closed: this.id };
  }

  list() { return this.driver ? [{ id: this.id, engine: 'safari', url: 'safari-app' }] : []; }

  async shutdown() { await this.close(); }
}
