// Extensive suite. Self-contained: spins a local HTTP fixture, exercises every
// tool/engine, concurrency, isolation, errors, interaction, screenshots, the
// live MCP daemon (:3010), and CDP-attach (when ABM_CDP=1). Zero test deps.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { BrowserManager } from '../src/manager.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };
const section = (t) => console.log(`\n=== ${t} ===`);

// ---- fixture server ----
const PAGE = (title, body) => `<!doctype html><html><head><title>${title}</title></head><body>${body}</body></html>`;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/page2')) { res.end(PAGE('Page Two', '<h1>second</h1>')); return; }
  res.end(PAGE('ABM Fixture',
    `<input id="q" placeholder="type here">
     <button id="go" onclick="document.getElementById('out').textContent='clicked:'+document.getElementById('q').value">Go</button>
     <div id="out">idle</div>
     <a id="lnk" href="/page2">link</a>`));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const m = new BrowserManager({ headless: true, maxSessions: 30 });
const CDP = process.env.ABM_CDP === '1' ? 'http://127.0.0.1:9222' : null;

try {
  // ---------- G1: engine lifecycle ----------
  section('G1 engine full lifecycle (chromium / chrome / webkit)');
  for (const engine of ['chromium', 'chrome', 'webkit']) {
    try {
      const session = await m.create({ engine });
      const nav = await m.navigate(session, BASE + '/');
      const snap = await m.snapshot(session);
      const hasInput = snap.elements.some(e => e.tag === 'input');
      const ev = await m.evaluate(session, '1+2');
      const shotPath = `/tmp/abm-ext-${engine}.png`;
      await m.screenshot(session, shotPath);
      const png = await readFile(shotPath);
      const isPng = png[0] === 0x89 && png[1] === 0x50 && png[2] === 0x4e && png[3] === 0x47;
      await m.close(session);
      ok(`${engine}: navigate`, nav.title === 'ABM Fixture', nav.title);
      ok(`${engine}: snapshot has input`, hasInput, `${snap.elements.length} els`);
      ok(`${engine}: evaluate 1+2`, ev === 3, String(ev));
      ok(`${engine}: screenshot PNG`, isPng, `${png.length}b`);
    } catch (e) { ok(`${engine}: lifecycle`, false, e.message); }
  }

  // ---------- G2: safari + single-session guard ----------
  section('G2 real Safari.app lifecycle + single-session guard');
  try {
    const sf = await m.create({ engine: 'safari' });
    const nav = await m.navigate(sf, BASE + '/');
    const snap = await m.snapshot(sf);
    const ev = await m.evaluate(sf, '6*7');
    const sf2 = await m.create({ engine: 'safari' });
    ok('safari: navigate', nav.title === 'ABM Fixture', nav.title);
    ok('safari: snapshot els', snap.elements.length >= 3, `${snap.elements.length}`);
    ok('safari: evaluate 6*7', ev === 42, String(ev));
    ok('safari: single-session reuse', sf2 === sf, `${sf} vs ${sf2}`);
    await m.close(sf);
  } catch (e) { ok('safari: lifecycle', false, e.message); }

  // ---------- G3: interaction (type / click / link-nav) ----------
  section('G3 interaction correctness (chromium)');
  try {
    const session = await m.create({ engine: 'chromium' });
    await m.navigate(session, BASE + '/');
    let snap = await m.snapshot(session);
    const inputRef = snap.elements.find(e => e.tag === 'input').ref;
    const goRef = snap.elements.find(e => e.tag === 'button').ref;
    await m.type(session, inputRef, 'hello', false);
    await m.click(session, goRef);
    const out = await m.evaluate(session, "document.getElementById('out').textContent");
    ok('type+click updates DOM', out === 'clicked:hello', out);
    snap = await m.snapshot(session);
    const linkRef = snap.elements.find(e => e.tag === 'a').ref;
    const beforeClick = await m.click(session, linkRef);
    const title = await m.evaluate(session, 'document.title');
    ok('link click navigates', title === 'Page Two', title);
    await m.close(session);
  } catch (e) { ok('interaction', false, e.message); }

  // ---------- G4: context isolation ----------
  section('G4 storage/cookie isolation between sessions');
  try {
    const a = await m.create({ engine: 'chromium' });
    const b = await m.create({ engine: 'chromium' });
    await m.navigate(a, BASE + '/');
    await m.navigate(b, BASE + '/');
    await m.evaluate(a, "(()=>{localStorage.setItem('mark','AAA');document.cookie='c=A';return 1})()");
    const bMark = await m.evaluate(b, "localStorage.getItem('mark')");
    const bCookie = await m.evaluate(b, "document.cookie.includes('c=A')");
    ok('localStorage isolated', bMark === null, `B saw ${bMark}`);
    ok('cookie isolated', bCookie === false, `B cookie=${bCookie}`);
    await m.close(a); await m.close(b);
  } catch (e) { ok('isolation', false, e.message); }

  // ---------- G5: error handling (must reject cleanly, not crash) ----------
  section('G5 error handling');
  const rejects = async (name, fn) => { try { await fn(); ok(name, false, 'did not throw'); } catch { ok(name, true); } };
  await rejects('bad session id', () => m.navigate('nope', BASE));
  await rejects('unknown engine', () => m.create({ engine: 'ferrari' }));
  await rejects('attach dead endpoint', () => m.attach({ cdpEndpoint: 'http://127.0.0.1:9', mode: 'default' }));
  try {
    const session = await m.create({ engine: 'chromium' });
    await m.navigate(session, BASE + '/');
    await rejects('click missing ref', () => m.click(session, 'e999'));
    await m.close(session);
  } catch (e) { ok('error setup', false, e.message); }

  // ---------- G6: concurrency at scale ----------
  section('G6 concurrency — 10 simultaneous sessions, no blocking');
  try {
    const t0 = Date.now();
    const specs = Array.from({ length: 10 }, (_, i) => ({ engine: i % 5 === 0 ? 'webkit' : 'chromium', n: i }));
    const results = await Promise.all(specs.map(async (s) => {
      const session = await m.create({ engine: s.engine });
      await m.navigate(session, `${BASE}/?n=${s.n}`);
      const seen = await m.evaluate(session, 'new URLSearchParams(location.search).get("n")');
      await m.close(session);
      return Number(seen) === s.n;
    }));
    const wall = Date.now() - t0;
    ok('10 concurrent correct+isolated', results.every(Boolean), `${results.filter(Boolean).length}/10 in ${wall}ms`);
  } catch (e) { ok('concurrency', false, e.message); }

  // ---------- G7: MCP daemon, multi-client through :3010 ----------
  section('G7 live MCP daemon — 4 concurrent clients through :3010');
  const clientCycle = async (label, engine) => {
    const c = new Client({ name: `ext-${label}`, version: '1' });
    await c.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3010/mcp')));
    const call = async (n, a) => JSON.parse((await c.callTool({ name: n, arguments: a })).content[0].text);
    const { session } = await call('browser_new_session', { engine });
    const nav = await call('browser_navigate', { session, url: 'https://example.com/' });
    const snap = await call('browser_snapshot', { session });
    await call('browser_close_session', { session });
    await c.close();
    return nav.title.includes('Example') && Array.isArray(snap.elements);
  };
  try {
    const r = await Promise.all([
      clientCycle('A', 'chromium'), clientCycle('B', 'webkit'),
      clientCycle('C', 'chromium'), clientCycle('D', 'chrome'),
    ]);
    ok('4 MCP clients concurrent', r.every(Boolean), `${r.filter(Boolean).length}/4`);
  } catch (e) { ok('mcp daemon multi-client', false, e.message); }

  // ---------- G8: CDP attach (only if a debug Chrome is up) ----------
  section('G8 CDP attach' + (CDP ? '' : ' — SKIPPED (no ABM_CDP)'));
  if (CDP) {
    try {
      const def = await m.attach({ cdpEndpoint: CDP, mode: 'default' });
      const iso = await m.attach({ cdpEndpoint: CDP, mode: 'isolated' });
      await m.navigate(def.session, BASE + '/');
      await m.navigate(iso.session, BASE + '/');
      const wd = await m.evaluate(iso.session, 'navigator.webdriver');
      ok('attach default adopts session', def.mode === 'default' && !!def.session);
      ok('attach isolated stealth', wd === undefined, `webdriver=${wd}`);
      await m.close(def.session); await m.close(iso.session);
      // Chrome must survive: re-attach succeeds
      const re = await m.attach({ cdpEndpoint: CDP, mode: 'default' });
      ok('Chrome survives session close', !!re.session);
      await m.close(re.session);
    } catch (e) { ok('attach', false, e.message); }
  }

} finally {
  await m.shutdown();
  server.close();
}

console.log(`\n──────── ${pass} passed, ${fail} failed ────────`);
process.exit(fail ? 1 : 0);
