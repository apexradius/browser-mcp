# Local multi-session browser MCP: operation and recovery

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Node >=20. |
| **Where?** | README.md, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to recover safely from the actual failure modes rather than repeat old operations. |
| **Why this approach?** | Node >=20. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Runtime and recovery

Node >=20. APEX_BROWSER_TRANSPORT=http selects daemon; APEX_BROWSER_PORT defaults 3010, MAX_SESSIONS 15, HEADLESS only when 1, SHOTS defaults /tmp. Auto-attach is off unless APEX_BROWSER_AUTOATTACH=1; it polls configured CDP at default 5 seconds with 1.5-second probe timeout and repairs stale handles. It is hook-shaped automation requiring a declared surface/enable decision under host law, not implicit setup. No daemon/watcher was activated here.

## Prioritized uncertainty

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

## Closeout

Verify the requested result at the correct layer, reconcile the owning manual/interface and update [HANDOFFS](HANDOFFS.md). Record a [knowledge event](REFERENCES.md) for material source/decision/freshness changes. Do not run package publishing, provider writes, private index sync or browser automation just to refresh a document.

## Supporting sources

- [README.md](../../README.md)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
