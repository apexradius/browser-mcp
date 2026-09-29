# Local multi-session browser MCP: implementation conventions

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | ES-module JavaScript, centralized MCP schemas, manager routing and separate pool/Safari backends. |
| **Where?** | package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to preserve the implementation’s existing conventions at the change boundary. |
| **Why this approach?** | ES-module JavaScript, centralized MCP schemas, manager routing and separate pool/Safari backends. |
| **Why it matters?** | Small compatible changes remain easier to review and recover. |

## Existing conventions

ES-module JavaScript, centralized MCP schemas, manager routing and separate pool/Safari backends. Preserve async independent-session operations and ownership flags. Return normalized text/error envelopes from server.js. Do not bypass BrowserManager or duplicate session ownership in a transport-specific registry.

## Change boundary

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

Prefer the smallest change in the component that already owns the behavior. Preserve generated artifacts and original requirements. Test a changed contract at its actual boundary; do not add scaffolding, services or broad refactors only to satisfy a documentation layout.

## Supporting sources

- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
