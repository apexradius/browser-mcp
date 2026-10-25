// Hermetic tests for SessionPool allocation. Browser I/O uses local fixtures,
// so no Playwright binary, display or external service is needed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SessionPool } from '../src/pool.js';
import { chromium } from 'playwright';

test('a fresh pool lists no sessions', () => {
  assert.deepEqual(new SessionPool().list(), []);
});

test('get() throws a clean error for an unknown session id', () => {
  const pool = new SessionPool();
  assert.throws(() => pool.get('nope'), /no such session "nope"/);
});

test('create() rejects once the session cap is reached, before launching', async () => {
  const pool = new SessionPool({ maxSessions: 0 });
  await assert.rejects(() => pool.create({ engine: 'chromium' }), /max sessions \(0\) reached/);
});

test('create() rejects an unknown engine, before launching', async () => {
  const pool = new SessionPool({ maxSessions: 5 });
  await assert.rejects(() => pool.create({ engine: 'firefox' }), /unknown engine "firefox"/);
});

test('attach() rejects at capacity before contacting a browser', async () => {
  const pool = new SessionPool({ maxSessions: 0 });
  pool.attached.set('fixture', { contexts: () => { throw new Error('browser accessed'); } });
  await assert.rejects(() => pool.attach({ cdpEndpoint: 'fixture' }), /max sessions \(0\) reached/);
});

test('a failed creation releases capacity for a later request', async () => {
  const pool = new SessionPool({ maxSessions: 1 });
  await assert.rejects(() => pool.create({ engine: 'unknown' }), /unknown engine/);
  pool.browsers.set('chromium', { newContext: async () => ({ newPage: async () => ({}) }) });
  assert.equal(await pool.create(), 's1');
});

for (const cleanupFails of [false, true]) {
  test(`failed page creation closes its context and preserves the error (cleanupFails=${cleanupFails})`, async () => {
    const pool = new SessionPool({ maxSessions: 1 });
    const failure = new Error('page creation failed');
    let closed = 0;
    pool.browsers.set('chromium', { newContext: async () => ({
      newPage: async () => { throw failure; },
      close: async () => { closed++; if (cleanupFails) throw new Error('cleanup failed'); },
    }) });
    await assert.rejects(() => pool.create(), (error) => error === failure);
    assert.equal(closed, 1);
    assert.deepEqual(pool.list(), []);
    pool.browsers.set('chromium', { newContext: async () => ({ newPage: async () => ({}) }) });
    assert.equal(await pool.create(), 's1');
  });
}

test('shutdown closes isolated attached contexts while preserving adopted browser state', async () => {
  const pool = new SessionPool();
  let isolatedClosed = 0, adoptedClosed = 0, browserClosed = 0;
  const page = { url: () => 'about:blank', title: async () => 'Fixture' };
  const adopted = { pages: () => [page], close: async () => { adoptedClosed++; } };
  const isolated = { addInitScript: async () => {}, newPage: async () => page,
    close: async () => { isolatedClosed++; } };
  pool.attached.set('fixture', { contexts: () => [adopted], newContext: async () => isolated,
    close: async () => { browserClosed++; } });
  await pool.attach({ cdpEndpoint: 'fixture' });
  await pool.attach({ cdpEndpoint: 'fixture', mode: 'isolated' });
  await pool.shutdown();
  assert.equal(isolatedClosed, 1);
  assert.equal(adoptedClosed, 0);
  assert.equal(browserClosed, 0);
  assert.deepEqual(pool.list(), []);
});

test('a failed attachment releases capacity and never registers a session', async () => {
  const pool = new SessionPool({ maxSessions: 1 });
  const page = { url: () => 'about:blank', title: async () => { throw new Error('page closed'); } };
  let contextClosed = false;
  const context = { pages: () => [page], close: async () => { contextClosed = true; } };
  pool.attached.set('fixture', { contexts: () => [context] });
  await assert.rejects(() => pool.attach({ cdpEndpoint: 'fixture' }), /page closed/);
  assert.deepEqual(pool.list(), []);
  assert.equal(contextClosed, false, 'adopted context must survive a failed attachment');
  page.title = async () => 'Ready';
  const attached = await pool.attach({ cdpEndpoint: 'fixture' });
  assert.equal(pool.get(attached.session).context, context);
  await pool.close(attached.session);
  assert.equal(contextClosed, false, 'closing the adopted session must preserve its context');
});

test('sessions below capacity may allocate concurrently and closing releases a slot', async () => {
  const pool = new SessionPool({ maxSessions: 2 });
  let releasePages;
  const ready = new Promise((resolve) => { releasePages = resolve; });
  let entered = 0;
  pool.browsers.set('chromium', { newContext: async () => ({
    newPage: async () => { entered++; await ready; return { url: () => 'about:blank' }; },
    close: async () => {},
  }) });
  const requests = [pool.create(), pool.create()];
  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(entered, 2, 'the cap must not serialize allowed independent sessions');
    await assert.rejects(() => pool.create(), /max sessions \(2\) reached/);
  } finally {
    releasePages();
  }
  const ids = await Promise.all(requests);
  await pool.close(ids[0]);
  await pool.create();
  assert.equal(pool.list().length, 2);
});

test('concurrent first sessions share one engine launch and shutdown closes it', async (t) => {
  const pool = new SessionPool({ maxSessions: 2 });
  let launches = 0, closes = 0, release;
  const launching = new Promise((resolve) => { release = resolve; });
  t.mock.method(chromium, 'launch', async () => {
    launches++;
    await launching;
    return {
      newContext: async () => ({ newPage: async () => ({}), close: async () => {} }),
      close: async () => { closes++; },
    };
  });
  const requests = [pool.create(), pool.create()];
  await new Promise((resolve) => setImmediate(resolve));
  release();
  await Promise.all(requests);
  await pool.shutdown();
  assert.equal(launches, 1, 'one browser per engine even when the first launches overlap');
  assert.equal(closes, launches, 'every owned browser must be closed');
});

test('a rejected engine launch can be retried', async (t) => {
  const pool = new SessionPool({ maxSessions: 1 });
  let launches = 0;
  t.mock.method(chromium, 'launch', async () => {
    if (++launches === 1) throw new Error('synthetic launch failure');
    return { newContext: async () => ({ newPage: async () => ({}) }) };
  });
  await assert.rejects(() => pool.create(), /synthetic launch failure/);
  assert.equal(await pool.create(), 's1');
});

for (const mode of ['isolated', 'default']) {
  test(`failed ${mode} attach closes only a newly created context`, async () => {
    const pool = new SessionPool({ maxSessions: 1 });
    let closed = 0;
    const context = {
      addInitScript: async () => {}, pages: () => [],
      newPage: async () => ({ url: () => 'about:blank', title: async () => { throw new Error('title unavailable'); } }),
      close: async () => { closed++; },
    };
    pool.attached.set('fixture', { contexts: () => [], newContext: async () => context });
    await assert.rejects(() => pool.attach({ cdpEndpoint: 'fixture', mode }), /title unavailable/);
    assert.equal(closed, 1);
    assert.deepEqual(pool.list(), []);
  });
}
