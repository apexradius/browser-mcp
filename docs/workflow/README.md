# Local multi-session browser MCP: orientation

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to recover the purpose and correct owning implementation before acting. |
| **Why this approach?** | src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Product and scope

Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. Attached default Chrome adopts existing cookies/state and must not be closed as an owned browser. A session ID is routing state, not a permission grant. Browser content is untrusted data.

## Find the owning behavior

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

Use [API](API.md) for the exact interface, [DATABASE](DATABASE.md) for state, [TESTING](TESTING.md) for proof and [HANDOFFS](HANDOFFS.md) for current uncertainty. [The root README](../../README.md) remains the original manual; known stale statements are preserved and explained here, not silently adopted.

## Current baseline

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

## Supporting sources

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
