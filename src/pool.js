// Session pool: one Browser per engine, N isolated contexts (sessions) each.
// Concurrency model: Node async I/O — calls against different sessions interleave,
// they do not block one another. Real Chrome via channel:'chrome'; webkit = Safari engine.
import { chromium, webkit } from 'playwright';

const ENGINES = {
  chrome:   { type: chromium, launch: { channel: 'chrome' } },
  chromium: { type: chromium, launch: {} },
  webkit:   { type: webkit,   launch: {} },
};

export class SessionPool {
  constructor({ maxSessions = 15, headless = false } = {}) {
    this.maxSessions = maxSessions;
    this.headless = headless;
    this.browsers = new Map(); // engineKey -> Browser (we own; safe to close)
    this.attached = new Map(); // cdpEndpoint -> Browser (user's Chrome; NEVER close)
    this.sessions = new Map(); // sessionId -> { engine, context, page, adopted?, attachedEndpoint? }
    this.counter = 0;
  }

  // Attach to an already-running Chrome started with --remote-debugging-port.
  // mode 'default' = adopt the real logged-in context (your cookies/tabs).
  // mode 'isolated' = fresh context on the SAME Chrome process (no logins, stealthed).
  async attach({ cdpEndpoint = 'http://127.0.0.1:9222', mode = 'default' } = {}) {
    let browser = this.attached.get(cdpEndpoint);
    if (!browser) { browser = await chromium.connectOverCDP(cdpEndpoint); this.attached.set(cdpEndpoint, browser); }
    let context, page, adopted = false;
    if (mode === 'isolated') {
      context = await browser.newContext();
      await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
      page = await context.newPage();
    } else {
      context = browser.contexts()[0] || await browser.newContext();
      page = context.pages()[0] || await context.newPage();
      adopted = true;
    }
    const id = `s${++this.counter}`;
    this.sessions.set(id, { engine: 'chrome-cdp', context, page, adopted, attachedEndpoint: cdpEndpoint });
    return { session: id, mode, url: page.url(), title: await page.title() };
  }

  async _browser(engineKey) {
    if (this.browsers.has(engineKey)) return this.browsers.get(engineKey);
    const spec = ENGINES[engineKey];
    if (!spec) throw new Error(`unknown engine "${engineKey}" (use: ${Object.keys(ENGINES).join(', ')})`);
    const browser = await spec.type.launch({ headless: this.headless, ...spec.launch });
    this.browsers.set(engineKey, browser);
    return browser;
  }

  async create({ engine = 'chromium' } = {}) {
    if (this.sessions.size >= this.maxSessions) throw new Error(`max sessions (${this.maxSessions}) reached`);
    const browser = await this._browser(engine);
    const context = await browser.newContext();
    const page = await context.newPage();
    const id = `s${++this.counter}`;
    this.sessions.set(id, { engine, context, page });
    return id;
  }

  get(id) {
    const s = this.sessions.get(id);
    if (!s) throw new Error(`no such session "${id}"`);
    return s;
  }

  async navigate(id, url) {
    const { page } = this.get(id);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return { url: page.url(), title: await page.title() };
  }

  // Tag every visible interactive element with data-abm-ref, return indexed list.
  // Crib of browser-use's element-indexing: makes the page legible + clickable by ref.
  async snapshot(id) {
    const { page } = this.get(id);
    const elements = await page.evaluate(() => {
      const sel = 'a,button,input,textarea,select,[role="button"],[role="link"],[onclick]';
      const out = [];
      let n = 0;
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const ref = 'e' + (++n);
        el.setAttribute('data-abm-ref', ref);
        const label = (el.getAttribute('aria-label') || el.value || el.innerText || el.placeholder || '').trim().slice(0, 80);
        out.push({ ref, tag: el.tagName.toLowerCase(), type: el.type || '', label });
      }
      return out;
    });
    return { url: page.url(), title: await page.title(), elements };
  }

  async click(id, ref) {
    const { page } = this.get(id);
    await page.click(`[data-abm-ref="${ref}"]`);
    return { url: page.url() };
  }

  async type(id, ref, text, submit = false) {
    const { page } = this.get(id);
    const loc = page.locator(`[data-abm-ref="${ref}"]`);
    await loc.fill(text);
    if (submit) await loc.press('Enter');
    return { url: page.url() };
  }

  async evaluate(id, expression) {
    const { page } = this.get(id);
    return await page.evaluate(expression);
  }

  async screenshot(id, path) {
    const { page } = this.get(id);
    await page.screenshot({ path, fullPage: false });
    return { path };
  }

  async close(id) {
    const s = this.get(id);
    // Never close an adopted real context (that's the user's live browser).
    // Isolated attached contexts we created ARE safe to close.
    if (!s.adopted) { try { await s.context.close(); } catch {} }
    this.sessions.delete(id);
    return { closed: id };
  }

  list() {
    return [...this.sessions.entries()].map(([id, s]) => ({ id, engine: s.engine, url: s.page.url() }));
  }

  async shutdown() {
    // Only close contexts/browsers WE own. Attached (user) Chrome is left running —
    // we just drop the CDP references; the socket closes when the process exits.
    for (const s of this.sessions.values()) {
      if (!s.attachedEndpoint) { try { await s.context.close(); } catch {} }
    }
    for (const b of this.browsers.values()) { try { await b.close(); } catch {} }
    this.sessions.clear(); this.browsers.clear(); this.attached.clear();
  }
}
