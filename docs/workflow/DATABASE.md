# Local multi-session browser MCP: state and persistence

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | All session/browser/ref maps are process-local. |
| **Where?** | src/pool.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to identify what persists, what is transient and what requires recovery. |
| **Why this approach?** | All session/browser/ref maps are process-local. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Actual state model

All session/browser/ref maps are process-local. Default maxSessions is 15 for created SessionPool contexts; attach follows a separate path and must not be assumed bounded by that create guard. Screenshots are disk artifacts, not embedded proof that a page action succeeded. Default attachment adopts the existing first page/context; isolated mode creates a context on the attached browser. Closing an adopted session drops its map entry without closing the user context. Restart loses routing IDs; rediscover rather than replay stale IDs.

## State transition and recovery

Node >=20. APEX_BROWSER_TRANSPORT=http selects daemon; APEX_BROWSER_PORT defaults 3010, MAX_SESSIONS 15, HEADLESS only when 1, SHOTS defaults /tmp. Auto-attach is off unless APEX_BROWSER_AUTOATTACH=1; it polls configured CDP at default 5 seconds with 1.5-second probe timeout and repairs stale handles. It is hook-shaped automation requiring a declared surface/enable decision under host law, not implicit setup. No daemon/watcher was activated here.

## Private-input boundary

No cloud API key is required, but attached Chrome cookies, logged-in pages, screenshots and evaluated page data are sensitive. Do not dump profiles, cookies, tokens or full page payloads into reports. CDP endpoint and screenshot directory are configuration references; preserve existing user session state.

## Supporting sources

- [src/pool.js](../../src/pool.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
