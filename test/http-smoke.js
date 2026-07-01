// Two SEPARATE MCP clients hit the same daemon at once. Proves the multi-client,
// no-blocking path: each gets its own mcp session, drives its own browser session,
// concurrently. Requires the http daemon running on :3010 (headless).
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const URL = 'http://127.0.0.1:3010/mcp';
const call = async (c, name, args) => JSON.parse((await c.callTool({ name, arguments: args })).content[0].text);

async function clientRun(label, engine, url, expect) {
  const c = new Client({ name: `probe-${label}`, version: '1.0.0' });
  await c.connect(new StreamableHTTPClientTransport(new URL_(URL)));
  const { session } = await call(c, 'browser_new_session', { engine });
  const nav = await call(c, 'browser_navigate', { session, url });
  const snap = await call(c, 'browser_snapshot', { session });
  await call(c, 'browser_close_session', { session });
  await c.close();
  const ok = nav.title.includes(expect);
  console.log(`${ok ? 'PASS' : 'FAIL'}  client=${label} [${engine}] session=${session} title="${nav.title}" interactive=${snap.elements.length}`);
  return ok;
}
// URL global is shadowed by import name check; alias the WHATWG URL.
const URL_ = globalThis.URL;

const results = await Promise.all([
  clientRun('A', 'chromium', 'https://example.com/', 'Example Domain'),
  clientRun('B', 'webkit',   'https://example.com/', 'Example Domain'),
]);
process.exit(results.every(Boolean) ? 0 : 1);
