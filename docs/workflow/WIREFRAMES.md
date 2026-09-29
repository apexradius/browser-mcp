# Local multi-session browser MCP: task journeys

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Read the user’s named browser/target -> create an owned session or explicitly authorized attach -> inspect current URL/title/snapshot -> act on observed refs -> verify resulting UI/provider state -> close only owned context or detach adopted state. |
| **Where?** | README.md, src/server.js, test/server.test.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to show the order of observations and actions required for a real task. |
| **Why this approach?** | Read the user’s named browser/target -> create an owned session or explicitly authorized attach -> inspect current URL/title/snapshot -> act on observed refs -> verify resulting UI/provider state -> close only owned context or detach adopted state. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Concrete interaction flow

Read the user’s named browser/target -> create an owned session or explicitly authorized attach -> inspect current URL/title/snapshot -> act on observed refs -> verify resulting UI/provider state -> close only owned context or detach adopted state. Sending, purchasing, submitting, publishing or deleting through a browser still needs exact action approval. Do not repeat an old form submission just because the browser session restarted.

## Entry, result and failure states

The UI surface is the actual browser plus a text snapshot, not a separate dashboard. Labels in the latest snapshot orient clicks/type, and screenshot readback confirms layout when needed. Refresh after navigation or DOM change rather than assume old refs mean the same element. Real Safari and WebKit need separate acceptance statements. A health ok does not establish login state, correct tab or visual success.

The HTTP daemon binds explicitly to 127.0.0.1 and has no application authentication or per-client session ownership check, so local clients remain trusted. browser_evaluate accepts arbitrary page JavaScript and navigation accepts arbitrary strings. Do not expose the daemon remotely as a safe multi-tenant service. Attachment can act with the user’s cookies.

This is a sequence specification for the current interface. It does not introduce an unimplemented graphical application. Use the source tool/CLI contract for exact input fields.

## Supporting sources

- [README.md](../../README.md)
- [src/server.js](../../src/server.js)
- [test/server.test.js](../../test/server.test.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
