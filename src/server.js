// Builds an McpServer bound to a shared SessionPool. One server instance per
// connected client; all instances share the pool so clients drive their own
// sessions concurrently without blocking each other.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const ok = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] });
const err = (e) => ({ isError: true, content: [{ type: 'text', text: `ERROR: ${e.message || e}` }] });

export function buildServer(pool, { screenshotDir = '/tmp' } = {}) {
  const server = new McpServer({ name: 'apex-browser-mcp', version: '0.1.0' });

  server.registerTool('browser_new_session',
    { title: 'New session', description: 'Open an isolated browser session. engine: chrome (real Chrome) | chromium | webkit (Safari engine, multi) | safari (real Safari.app, single-session). Returns a session id.',
      inputSchema: { engine: z.enum(['chrome', 'chromium', 'webkit', 'safari']).default('chromium') } },
    async ({ engine }) => { try { return ok({ session: await pool.create({ engine }) }); } catch (e) { return err(e); } });

  server.registerTool('browser_attach',
    { title: 'Attach to running Chrome', description: 'Attach to a Chrome already running with --remote-debugging-port. mode: default (adopt your logged-in session — real cookies) | isolated (fresh stealthed context on the same Chrome). Returns a session id usable with all other tools.',
      inputSchema: { cdpEndpoint: z.string().default('http://127.0.0.1:9222'), mode: z.enum(['default', 'isolated']).default('default') } },
    async ({ cdpEndpoint, mode }) => { try { return ok(await pool.attach({ cdpEndpoint, mode })); } catch (e) { return err(e); } });

  server.registerTool('browser_navigate',
    { title: 'Navigate', description: 'Go to a URL in a session.',
      inputSchema: { session: z.string(), url: z.string() } },
    async ({ session, url }) => { try { return ok(await pool.navigate(session, url)); } catch (e) { return err(e); } });

  server.registerTool('browser_snapshot',
    { title: 'Snapshot', description: 'Title, URL, and indexed interactive elements (ref=e1,e2,...). Use a ref with click/type.',
      inputSchema: { session: z.string() } },
    async ({ session }) => { try { return ok(await pool.snapshot(session)); } catch (e) { return err(e); } });

  server.registerTool('browser_click',
    { title: 'Click', description: 'Click an element by ref from the latest snapshot.',
      inputSchema: { session: z.string(), ref: z.string() } },
    async ({ session, ref }) => { try { return ok(await pool.click(session, ref)); } catch (e) { return err(e); } });

  server.registerTool('browser_type',
    { title: 'Type', description: 'Fill text into an element by ref; submit:true presses Enter.',
      inputSchema: { session: z.string(), ref: z.string(), text: z.string(), submit: z.boolean().default(false) } },
    async ({ session, ref, text, submit }) => { try { return ok(await pool.type(session, ref, text, submit)); } catch (e) { return err(e); } });

  server.registerTool('browser_evaluate',
    { title: 'Evaluate', description: 'Run a JS expression in the page, return the result.',
      inputSchema: { session: z.string(), expression: z.string() } },
    async ({ session, expression }) => { try { return ok(await pool.evaluate(session, expression)); } catch (e) { return err(e); } });

  server.registerTool('browser_screenshot',
    { title: 'Screenshot', description: 'Save a PNG of the current view, return its path.',
      inputSchema: { session: z.string() } },
    async ({ session }) => {
      try { const p = `${screenshotDir}/abm-${session}-${Date.now()}.png`; return ok(await pool.screenshot(session, p)); } catch (e) { return err(e); } });

  server.registerTool('browser_list_sessions',
    { title: 'List sessions', description: 'List all open sessions with engine and current URL.', inputSchema: {} },
    async () => { try { return ok(pool.list()); } catch (e) { return err(e); } });

  server.registerTool('browser_close_session',
    { title: 'Close session', description: 'Close and free a session.', inputSchema: { session: z.string() } },
    async ({ session }) => { try { return ok(await pool.close(session)); } catch (e) { return err(e); } });

  return server;
}
