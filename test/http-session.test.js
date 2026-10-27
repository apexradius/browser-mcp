// HTTP MCP session-identity contract regression (official Streamable HTTP
// Session Management): missing id on non-initialize => 400; unknown or
// terminated id => 404, including inherited object keys (__proto__,
// constructor, toString) and initialize-with-unknown-id; initialization omits
// the id header. Exercises the real daemon subprocess on a port0 loopback
// listener. No browsers are launched; installed :3010/:9222 are never touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import { startHttpDaemon } from './helpers/http-daemon.js';

const INIT_PARAMS = {
  protocolVersion: '2025-03-26',
  capabilities: {},
  clientInfo: { name: 'http-session-test', version: '1.0.0' },
};
const TOOLS_LIST = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} };

async function rpc(url, method, body, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream')) {
    // JSON-RPC over SSE: take the last complete data frame as the response.
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        try { json = JSON.parse(line.slice(5).trim()); } catch { /* partial frame */ }
      }
    }
  } else if (text) {
    try { json = JSON.parse(text); } catch { /* non-JSON error body */ }
  }
  return { status: res.status, json, sid: res.headers.get('mcp-session-id') };
}

test('HTTP MCP session identity lookup', async (t) => {
  let daemon;
  try {
    daemon = await startHttpDaemon(process.env.ABM_TEST_ENTRY);
    const url = daemon.url;

    await t.test('missing session id on non-initialize is 400', async () => {
      const post = await rpc(url, 'POST', TOOLS_LIST);
      assert.equal(post.status, 400, `POST no-id tools/list -> ${post.status}`);
      const get = await rpc(url, 'GET', undefined);
      assert.equal(get.status, 400, `GET no-id -> ${get.status}`);
      const del = await rpc(url, 'DELETE', undefined);
      assert.equal(del.status, 400, `DELETE no-id -> ${del.status}`);
    });

    await t.test('unknown ordinary session ids are 404 across POST/GET/DELETE', async () => {
      const sid = '11111111-2222-3333-4444-555555555555';
      for (const method of ['POST', 'GET', 'DELETE']) {
        const r = await rpc(
          url, method,
          method === 'POST' ? TOOLS_LIST : undefined,
          { 'mcp-session-id': sid },
        );
        assert.equal(r.status, 404, `${method} unknown id -> ${r.status}`);
      }
    });

    await t.test('inherited object keys are unknown sessions, not prototype lookups', async () => {
      for (const key of ['__proto__', 'constructor', 'toString']) {
        for (const method of ['POST', 'GET', 'DELETE']) {
          const r = await rpc(
            url, method,
            method === 'POST' ? TOOLS_LIST : undefined,
            { 'mcp-session-id': key },
          );
          assert.equal(r.status, 404, `${method} inherited key ${key} -> ${r.status}`);
        }
      }
    });

    await t.test('initialize carrying an unknown session id is 404, not a new session', async () => {
      const r = await rpc(
        url, 'POST',
        { jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT_PARAMS },
        { 'mcp-session-id': 'deadbeef-0000-0000-0000-000000000000' },
      );
      assert.equal(r.status, 404, `initialize with unknown id -> ${r.status}`);
      assert.equal(r.sid, null, `no session id issued, got ${r.sid}`);
    });

    await t.test('an empty supplied session id is rejected rather than initialized', async () => {
      const init = await rpc(url, 'POST',
        { jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT_PARAMS },
        { 'mcp-session-id': '' });
      assert.equal(init.status, 404);
      assert.equal(init.sid, null);
      for (const method of ['POST', 'GET', 'DELETE']) {
        const result = await rpc(url, method, method === 'POST' ? TOOLS_LIST : undefined,
          { 'mcp-session-id': '' });
        assert.equal(result.status, 404, `${method} empty id`);
      }
    });

    let sid;
    await t.test('valid initialize issues a session id and serves tools/list', async (t2) => {
      const init = await rpc(url, 'POST', { jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT_PARAMS });
      assert.equal(init.status, 200, `initialize -> ${init.status}`);
      assert.ok(init.sid, 'session id header present');
      assert.ok(init.json?.result?.serverInfo, 'initialize result carries serverInfo');
      sid = init.sid;
      const ready = await rpc(url, 'POST', { jsonrpc: '2.0', method: 'notifications/initialized' }, { 'mcp-session-id': sid });
      t2.assert.ok(ready.status === 200 || ready.status === 202, `initialized notification -> ${ready.status}`);
      const tools = await rpc(url, 'POST', { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, { 'mcp-session-id': sid });
      assert.equal(tools.status, 200, `tools/list -> ${tools.status}`);
      assert.equal(tools.json?.result?.tools?.length, 10, `ten tool schemas, got ${tools.json?.result?.tools?.length}`);
    });

    await t.test('DELETE tears down; stale id then 404', async () => {
      const del = await rpc(url, 'DELETE', undefined, { 'mcp-session-id': sid });
      assert.ok(del.status === 200 || del.status === 204, `DELETE valid id -> ${del.status}`);
      const stale = await rpc(url, 'POST', { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }, { 'mcp-session-id': sid });
      assert.equal(stale.status, 404, `stale POST -> ${stale.status}`);
      const staleGet = await rpc(url, 'GET', undefined, { 'mcp-session-id': sid });
      assert.equal(staleGet.status, 404, `stale GET -> ${staleGet.status}`);
    });

    await t.test('fresh handshake still works after teardowns', async () => {
      const init = await rpc(url, 'POST', { jsonrpc: '2.0', id: 4, method: 'initialize', params: INIT_PARAMS });
      assert.equal(init.status, 200, `fresh initialize -> ${init.status}`);
      assert.ok(init.sid && init.sid !== sid, 'new distinct session id issued');
    });
  } finally {
    if (daemon) await daemon.stop();
  }
});
