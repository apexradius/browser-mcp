#!/usr/bin/env node
// Transport selector.
//   default (stdio):  each client spawns its own server+browser pool.
//   APEX_BROWSER_TRANSPORT=http:  one daemon, many clients share the pool,
//   each driving its own sessions concurrently — this is the no-blocking path.
//
// Env: APEX_BROWSER_PORT (3010), APEX_BROWSER_MAX_SESSIONS (15),
//      APEX_BROWSER_HEADLESS (1=headless), APEX_BROWSER_SHOTS (/tmp).
import { randomUUID } from 'node:crypto';
import { BrowserManager } from './manager.js';
import { buildServer } from './server.js';

const MAX = Number(process.env.APEX_BROWSER_MAX_SESSIONS || 15);
const HEADLESS = process.env.APEX_BROWSER_HEADLESS === '1';
const SHOTS = process.env.APEX_BROWSER_SHOTS || '/tmp';
const pool = new BrowserManager({ maxSessions: MAX, headless: HEADLESS });

async function stdioMain() {
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const server = buildServer(pool, { screenshotDir: SHOTS });
  await server.connect(new StdioServerTransport());
  process.stderr.write('apex-browser-mcp: stdio ready\n');
}

async function httpMain() {
  const express = (await import('express')).default;
  const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const { isInitializeRequest } = await import('@modelcontextprotocol/sdk/types.js');
  const PORT = Number(process.env.APEX_BROWSER_PORT || 3010);

  const app = express();
  app.use(express.json());
  const transports = {}; // mcp-session-id -> transport (one MCP client each)

  app.post('/mcp', async (req, res) => {
    const sid = req.headers['mcp-session-id'];
    let transport = sid && transports[sid];
    if (!transport && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => { transports[id] = transport; },
      });
      transport.onclose = () => { if (transport.sessionId) delete transports[transport.sessionId]; };
      await buildServer(pool, { screenshotDir: SHOTS }).connect(transport);
    } else if (!transport) {
      return res.status(400).json({ jsonrpc: '2.0', error: { code: -32000, message: 'No valid session' }, id: null });
    }
    await transport.handleRequest(req, res, req.body);
  });

  const sessionReq = async (req, res) => {
    const sid = req.headers['mcp-session-id'];
    if (!sid || !transports[sid]) return res.status(400).send('No valid session');
    await transports[sid].handleRequest(req, res);
  };
  app.get('/mcp', sessionReq);    // SSE stream
  app.delete('/mcp', sessionReq); // session teardown
  app.get('/health', (_req, res) => res.json({ ok: true, sessions: pool.list().length }));

  app.listen(PORT, () => process.stderr.write(`apex-browser-mcp: http daemon on :${PORT}\n`));
}

const shutdown = async () => { await pool.shutdown(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

(process.env.APEX_BROWSER_TRANSPORT === 'http' ? httpMain() : stdioMain())
  .catch((e) => { process.stderr.write(`fatal: ${e.stack || e}\n`); process.exit(1); });
