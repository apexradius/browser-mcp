# Local multi-session browser MCP: components and decisions

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). |
| **Where?** | src/manager.js, docs/architecture.md. |
| **Why it exists?** | Local multi-session browser MCP needs this document to locate the component that owns the requested behavior. |
| **Why this approach?** | src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Components, flow and rationale

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

## State boundary

All session/browser/ref maps are process-local. Default maxSessions is 15 for created SessionPool contexts; attach follows a separate path and must not be assumed bounded by that create guard. Screenshots are disk artifacts, not embedded proof that a page action succeeded. Default attachment adopts the existing first page/context; isolated mode creates a context on the attached browser. Closing an adopted session drops its map entry without closing the user context. Restart loses routing IDs; rediscover rather than replay stale IDs.

## Evolution and current mismatch

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

## Supporting sources

- [src/manager.js](../../src/manager.js)
- [docs/architecture.md](../../docs/architecture.md)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
