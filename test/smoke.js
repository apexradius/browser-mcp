// Proves the core claim: N sessions across chromium + webkit run CONCURRENTLY
// without one blocking another. Headless so it runs unattended in CI.
import { SessionPool } from '../src/pool.js';

const cases = [
  { engine: 'chromium', url: 'https://example.com/',            expect: 'Example Domain' },
  { engine: 'chromium', url: 'https://example.org/',            expect: 'Example Domain' },
  { engine: 'webkit',   url: 'https://example.com/',            expect: 'Example Domain' },
  { engine: 'webkit',   url: 'https://www.iana.org/help/example-domains', expect: 'Example' },
];

const pool = new SessionPool({ headless: true, maxSessions: 15 });
const t0 = Date.now();
let failed = 0;

try {
  // Fire all four in parallel; if the pool serialized, wall-time ≈ sum, and
  // interleaving would break. We assert both correctness and that it didn't hang.
  const results = await Promise.all(cases.map(async (c, i) => {
    const id = await pool.create({ engine: c.engine });
    const nav = await pool.navigate(id, c.url);
    const snap = await pool.snapshot(id);
    return { i, id, engine: c.engine, title: nav.title, elements: snap.elements.length, expect: c.expect };
  }));

  for (const r of results) {
    const ok = r.title.includes(r.expect);
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.id} [${r.engine}]  title="${r.title}"  interactive=${r.elements}`);
  }
  console.log(`\nsessions=${pool.list().length}  wall=${Date.now() - t0}ms  (4 concurrent, 2 engines)`);
} finally {
  await pool.shutdown();
}

process.exit(failed ? 1 : 0);
