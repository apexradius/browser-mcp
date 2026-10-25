// Optional live regression: only task-owned headless Chrome and a temporary profile.
// Run with: node test/session-cap-live.js (requires installed Google Chrome).
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { BrowserManager } from '../src/manager.js';
import { buildServer } from '../src/server.js';

const profile = await mkdtemp(join(tmpdir(), 'abm-cap-test-'));
const manager = new BrowserManager({ maxSessions: 2, headless: true });
const server = buildServer(manager);
const client = new Client({ name: 'session-cap-live', version: '1' });
let owned, attachedBrowser;
try {
  owned = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: true, args: ['--remote-debugging-port=0'],
  });
  console.log('Owned Chrome fixture ready');
  const page = owned.pages()[0];
  await page.goto('data:text/html,<title>Owned capacity fixture</title>');
  const port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
  const endpoint = `http://127.0.0.1:${port}`;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const create = () => client.callTool({ name: 'browser_new_session', arguments: { engine: 'chrome' } });
  const attach = (mode = 'default') => client.callTool({
    name: 'browser_attach', arguments: { cdpEndpoint: endpoint, mode },
  });
  const cold = await Promise.all([create(), create()]);
  assert.ok(cold.every((r) => !r.isError));
  const coldIds = cold.map((r) => JSON.parse(r.content[0].text).session);
  assert.equal(new Set(coldIds.map((id) => manager.pool.get(id).context.browser())).size, 1);
  for (const id of coldIds) await manager.close(id);

  const adopted = await attach();
  assert.notEqual(adopted.isError, true);
  attachedBrowser = manager.pool.attached.get(endpoint);
  const results = await Promise.all([create(), attach(), create(), attach(), create(), attach()]);
  console.log('Concurrent MCP requests completed');
  assert.equal(results.filter((r) => !r.isError).length, 1);
  assert.equal(results.filter((r) => r.isError && /max sessions \(2\) reached/.test(r.content[0].text)).length, 5);
  assert.equal(manager.list().length, 2);
  const created = JSON.parse(results.find((r) => !r.isError).content[0].text).session;
  await manager.close(created);
  const isolated = await attach('isolated');
  assert.notEqual(isolated.isError, true);
  const isolatedContext = manager.pool.get(JSON.parse(isolated.content[0].text).session).context;
  let isolatedClosed = false;
  isolatedContext.on('close', () => { isolatedClosed = true; });
  await manager.shutdown();
  assert.equal(isolatedClosed, true, 'shutdown must close the isolated context it created');
  assert.equal(page.isClosed(), false);
  assert.equal(await page.title(), 'Owned capacity fixture');
  assert.deepEqual(manager.list(), []);
  console.log('PASS: cold sessions share one browser; six MCP requests respect remaining capacity; closing restores capacity; adopted Chrome survives shutdown');
} finally {
  await client.close();
  await server.close();
  await manager.shutdown();
  // This fixture owns the attached browser too; dispose its test connection.
  await attachedBrowser?.close();
  await owned?.close();
  await rm(profile, { recursive: true, force: true });
  console.log('Owned browser and profile cleaned up');
}
