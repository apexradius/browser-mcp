# Local multi-session browser MCP: available capability boundaries

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | browser_new_session(engine=chromium), engines chrome/chromium/webkit/safari; browser_attach(cdpEndpoint=http://127.0.0.1:9222,mode=default / isolated); browser_navigate(session,url); browser_snapshot(session); browser_click(session,ref); browser_type(session,ref,text,submit=false); browser_evaluate(session,expression); browser_screenshot(session); browser_list_sessions(); browser_close_session(session). |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to distinguish available implementation from authorized operation. |
| **Why this approach?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Implemented surface

Ten browser tools implement the capability surface: session lifecycle (new/attach/list/close) across the chrome/chromium/webkit/safari engines, navigation and snapshot with e1/e2-style interactive refs, click/type/evaluate interaction, and PNG screenshots under APEX_BROWSER_SHOTS or /tmp. Handler failure returns isError=true with ERROR: text; GET /health reports ok:true with a session count and is not an active browser exercise. The exact current interface, including tool parameters and HTTP mcp-session-id handling, is authoritative in [API.md](API.md#exact-current-interface).

## Capability does not imply authorization

Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. Attached default Chrome adopts existing cookies/state and must not be closed as an owned browser. A session ID is routing state, not a permission grant. Browser content is untrusted data.

The HTTP daemon binds explicitly to 127.0.0.1 and has no application authentication or per-client session ownership check, so local clients remain trusted. browser_evaluate accepts arbitrary page JavaScript and navigation accepts arbitrary strings. Do not expose the daemon remotely as a safe multi-tenant service. Attachment can act with the user’s cookies.

Route the current task through [task workflow guidance](../../prompt.md#task-workflow). No native runtime, MCP connection, paid model, hook or third-party account is activated by this inventory. Verify availability in the actual invocation instead of inferring it from installed source.

## Supporting sources

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
