// Hermetic tests for SessionPool guard logic. Every case here returns/throws
// before any browser is launched, so no Playwright binary or display is needed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SessionPool } from '../src/pool.js';

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
