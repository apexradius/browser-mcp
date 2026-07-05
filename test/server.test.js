// Hermetic tests for the MCP tool surface. No browser is launched and no
// network is touched: buildServer takes an injectable pool, and we drive it
// through an in-memory MCP client so we exercise the real tool contract.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { buildServer } from '../src/server.js';

const EXPECTED_TOOLS = [
  'browser_attach',
  'browser_click',
  'browser_close_session',
  'browser_evaluate',
  'browser_list_sessions',
  'browser_navigate',
  'browser_new_session',
  'browser_screenshot',
  'browser_snapshot',
  'browser_type',
].sort();

async function connect(pool) {
  const server = buildServer(pool, { screenshotDir: '/tmp' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    async close() {
      await client.close();
      await server.close();
    },
  };
}

test('server advertises the expected tools, each with an input schema', async () => {
  const { client, close } = await connect({});
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((t) => t.name).sort(),
      EXPECTED_TOOLS,
    );
    for (const tool of tools) {
      assert.equal(typeof tool.inputSchema, 'object', `${tool.name} input schema`);
      assert.equal(tool.inputSchema.type, 'object', `${tool.name} schema type`);
    }
  } finally {
    await close();
  }
});

test('a successful tool call passes the pool result through as text content', async () => {
  const sessions = [{ id: 's1', engine: 'chromium', url: 'about:blank' }];
  const { client, close } = await connect({ list: () => sessions });
  try {
    const res = await client.callTool({ name: 'browser_list_sessions', arguments: {} });
    assert.notEqual(res.isError, true);
    assert.deepEqual(JSON.parse(res.content[0].text), sessions);
  } finally {
    await close();
  }
});

test('a failing pool call returns a clean error result, not a crash', async () => {
  const pool = {
    navigate() {
      throw new Error('no such session "bad"');
    },
  };
  const { client, close } = await connect(pool);
  try {
    const res = await client.callTool({
      name: 'browser_navigate',
      arguments: { session: 'bad', url: 'https://example.com' },
    });
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /ERROR: no such session "bad"/);
  } finally {
    await close();
  }
});
