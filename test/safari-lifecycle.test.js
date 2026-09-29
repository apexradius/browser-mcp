import assert from 'node:assert/strict';
import test from 'node:test';
import { safariLifecycle } from './safari-lifecycle.js';

const unavailable = 'Could not create a session: The session timed out while connecting to a Safari instance';

test('Safari connection timeout is reported as an environment skip', async () => {
  const skips = [];
  const failures = [];
  await safariLifecycle({ create: async () => { throw new Error(unavailable); } }, 'http://127.0.0.1/',
    (...args) => failures.push(args), (message) => skips.push(message));

  assert.deepEqual(failures, []);
  assert.equal(skips.length, 1);
  assert.match(skips[0], /^SKIP  safari: environment unavailable/);
  assert.ok(skips[0].includes(unavailable));
});

test('other Safari session creation failures remain failures', async () => {
  const skips = [];
  const failures = [];
  await safariLifecycle({ create: async () => { throw new Error('Safari driver executable missing'); } }, 'http://127.0.0.1/',
    (...args) => failures.push(args), (message) => skips.push(message));

  assert.deepEqual(skips, []);
  assert.deepEqual(failures, [['safari: lifecycle', false, 'Safari driver executable missing']]);
});

test('Safari failures after session connection remain failures', async () => {
  const skips = [];
  const failures = [];
  const manager = {
    create: async () => 'safari-1',
    navigate: async () => { throw new Error(unavailable); },
  };
  await safariLifecycle(manager, 'http://127.0.0.1/', (...args) => failures.push(args), (message) => skips.push(message));

  assert.deepEqual(skips, []);
  assert.deepEqual(failures, [['safari: lifecycle', false, unavailable]]);
});
