// THE question: attach to ONE running Chrome, open several sessions on it,
// and drive them ALL AT THE SAME TIME. Proves concurrent multi-session on a
// single attached browser (not separate launched browsers).
import http from 'node:http';
import { BrowserManager } from '../src/manager.js';

const EP = 'http://127.0.0.1:9222';
const server = http.createServer((_q, res) =>
  res.end('<!doctype html><title>t</title><body>ok</body>'));
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const m = new BrowserManager({ headless: true });
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`); };

try {
  // 1 adopted (real existing context) + 4 isolated = 5 sessions on ONE Chrome
  const sessions = [];
  sessions.push((await m.attach({ cdpEndpoint: EP, mode: 'default' })).session);
  for (let i = 0; i < 4; i++) sessions.push((await m.attach({ cdpEndpoint: EP, mode: 'isolated' })).session);
  ok('5 sessions attached to ONE Chrome', m.pool.attached.size === 1 && sessions.length === 5,
     `endpoints=${m.pool.attached.size} sessions=${sessions.length}`);

  // Drive all 5 SIMULTANEOUSLY — interleaved ops per session, fired together.
  const t0 = Date.now();
  const results = await Promise.all(sessions.map(async (s, i) => {
    await m.navigate(s, `${BASE}/?n=${i}`);
    const readN = await m.evaluate(s, 'new URLSearchParams(location.search).get("n")');
    await m.evaluate(s, `document.title='S${i}'`);           // mutate each independently
    const title = await m.evaluate(s, 'document.title');
    return Number(readN) === i && title === `S${i}`;         // each kept its own state
  }));
  const wall = Date.now() - t0;
  ok('5 sessions driven concurrently, each isolated+correct', results.every(Boolean),
     `${results.filter(Boolean).length}/5 in ${wall}ms`);

  // Overlap check: hammer 2 sessions with alternating ops; if the pool serialized
  // per-browser, interleaving would corrupt each other's title. It must not.
  const [x, y] = sessions;
  await Promise.all([
    (async () => { for (let k = 0; k < 5; k++) { await m.evaluate(x, `document.title='X${k}'`); } })(),
    (async () => { for (let k = 0; k < 5; k++) { await m.evaluate(y, `document.title='Y${k}'`); } })(),
  ]);
  const xt = await m.evaluate(x, 'document.title');
  const yt = await m.evaluate(y, 'document.title');
  ok('interleaved drive keeps sessions independent', xt === 'X4' && yt === 'Y4', `x=${xt} y=${yt}`);

  for (const s of sessions) await m.close(s);
  // Chrome survives all closes
  const re = await m.attach({ cdpEndpoint: EP, mode: 'default' });
  ok('Chrome alive after closing all sessions', !!re.session);
  await m.close(re.session);
} catch (e) { ok('attach-concurrent', false, e.message); }
finally { await m.shutdown(); server.close(); }

console.log(`\n──── ${pass} passed, ${fail} failed ────`);
process.exit(fail ? 1 : 0);
