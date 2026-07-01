// Routes the unified tool surface across two backends by session id:
//   'safari-*'  -> SafariLane (real Safari.app, single session)
//   everything else -> SessionPool (Playwright chrome/chromium/webkit, multi)
// Exposes the same methods the MCP tools call, so buildServer stays backend-agnostic.
import { SessionPool } from './pool.js';
import { SafariLane } from './safari.js';

export class BrowserManager {
  constructor(opts = {}) {
    this.pool = new SessionPool(opts);
    this.safari = new SafariLane();
  }

  _route(id) { return String(id).startsWith('safari') ? this.safari : this.pool; }

  async create({ engine = 'chromium' } = {}) {
    return engine === 'safari' ? this.safari.create() : this.pool.create({ engine });
  }

  attach(opts) { return this.pool.attach(opts); } // attached sessions live in the pool

  navigate(id, url)              { return this._route(id).navigate(id, url); }
  snapshot(id)                   { return this._route(id).snapshot(id); }
  click(id, ref)                 { return this._route(id).click(id, ref); }
  type(id, ref, text, submit)    { return this._route(id).type(id, ref, text, submit); }
  evaluate(id, expr)             { return this._route(id).evaluate(id, expr); }
  screenshot(id, path)           { return this._route(id).screenshot(id, path); }
  close(id)                      { return this._route(id).close(id); }

  list() { return [...this.pool.list(), ...this.safari.list()]; }

  async shutdown() { await this.pool.shutdown(); await this.safari.shutdown(); }
}
