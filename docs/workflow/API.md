# Local multi-session browser MCP: executable interfaces

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | browser_new_session(engine=chromium), engines chrome/chromium/webkit/safari; browser_attach(cdpEndpoint=http://127.0.0.1:9222,mode=default / isolated); browser_navigate(session,url); browser_snapshot(session); browser_click(session,ref); browser_type(session,ref,text,submit=false); browser_evaluate(session,expression); browser_screenshot(session); browser_list_sessions(); browser_close_session(session). |
| **Where?** | src/server.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to prevent unsupported parameters or misleading success results from guiding an action. |
| **Why this approach?** | browser_new_session(engine=chromium), engines chrome/chromium/webkit/safari; browser_attach(cdpEndpoint=http://127.0.0.1:9222,mode=default / isolated); browser_navigate(session,url); browser_snapshot(session); browser_click(session,ref); browser_type(session,ref,text,submit=false); browser_evaluate(session,expression); browser_screenshot(session); browser_list_sessions(); browser_close_session(session). |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Exact current interface

browser_new_session(engine=chromium), engines chrome/chromium/webkit/safari; browser_attach(cdpEndpoint=http://127.0.0.1:9222,mode=default|isolated); browser_navigate(session,url); browser_snapshot(session); browser_click(session,ref); browser_type(session,ref,text,submit=false); browser_evaluate(session,expression); browser_screenshot(session); browser_list_sessions(); browser_close_session(session). Snapshot returns title, URL and e1/e2-style interactive refs; page elements receive data-abm-ref. Screenshot writes PNG under APEX_BROWSER_SHOTS or /tmp and returns its path. Handler failure returns isError=true with ERROR: text. HTTP POST /mcp creates an initialized transport; GET/DELETE require mcp-session-id; invalid session gives 400, POST JSON-RPC code -32000. GET /health returns ok:true and session count, not an active browser exercise.

## Authorization and error limits

The HTTP daemon binds explicitly to 127.0.0.1 and has no application authentication or per-client session ownership check, so local clients remain trusted. browser_evaluate accepts arbitrary page JavaScript and navigation accepts arbitrary strings. Do not expose the daemon remotely as a safe multi-tenant service. Attachment can act with the user’s cookies.

## Contract gaps

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

## Supporting sources

- [src/server.js](../../src/server.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
