# Architecture — apex-browser-mcp

## Component map

| Component | File | Role |
|---|---|---|
| Process entry point | [`../src/index.js`](../src/index.js) | Selects stdio or HTTP mode and wires the shared pool |
| MCP server | [`../src/server.js`](../src/server.js) | Registers the browser tools and shapes responses |
| Browser manager | [`../src/manager.js`](../src/manager.js) | Routes session IDs to SessionPool or SafariLane |
| Session pool | [`../src/pool.js`](../src/pool.js) | Manages Playwright and attached Chrome sessions |
| Safari lane | [`../src/safari.js`](../src/safari.js) | Manages the real Safari.app automation lane |

## Runtime lifecycle

1. The process starts in stdio mode or as the shared HTTP daemon.
2. `buildServer()` registers the browser tool surface against a shared `BrowserManager`.
3. New non-Safari sessions go into `SessionPool`; Safari sessions go into `SafariLane`.
4. Attached Chrome sessions enter the pool through CDP and stay detachable without closing Chrome.
5. Interaction tools route by session ID and return text payloads or screenshot paths to the MCP client.
