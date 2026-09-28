# Local multi-session browser MCP: evidence and unresolved claims

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Proposed maintenance priorities are explicit HTTP exposure/auth/ownership requirements, attach capacity behavior and controlled adopted-browser lifecycle tests. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to show what is observed, what remains unknown and what decision follows. |
| **Why this approach?** | Proposed maintenance priorities are explicit HTTP exposure/auth/ownership requirements, attach capacity behavior and controlled adopted-browser lifecycle tests. |
| **Why it matters?** | These limits keep the next task honest and bounded. |

## Reconstruction finding

Source reconstruction: 2026-09-26; candidate `c54c7b603634b4c8c581e99f21e41d130651cb2f` on `main`; source version `1.0.0`. This is a dated source observation, not a live-service or installed-version claim.

The earlier workflow-adoption completion has been superseded by the user’s request for substantive product reconstruction. The enduring product outcome is: Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

## Established from sources

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

## Unresolved product claims

Proposed maintenance priorities are explicit HTTP exposure/auth/ownership requirements, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

## Evidence limits and value

This reconstruction makes the next task’s interfaces, boundaries and prior intent recoverable. It does not establish new customer value, provider success or a deployed fix. No current product build, account request, browser launch, private corpus read, publish or release was performed. Structural document validation and source-grounded scenario read-through are recorded separately from product acceptance. [TESTING](TESTING.md) identifies the additional proof a future implementation needs.

## Supporting sources

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
