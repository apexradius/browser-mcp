# Local multi-session browser MCP: operator experience

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | The UI surface is the actual browser plus a text snapshot, not a separate dashboard. |
| **Where?** | src/server.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to make the human-facing contract explicit even when the interface is a CLI or MCP tool. |
| **Why this approach?** | The UI surface is the actual browser plus a text snapshot, not a separate dashboard. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Operator experience

The UI surface is the actual browser plus a text snapshot, not a separate dashboard. Labels in the latest snapshot orient clicks/type, and screenshot readback confirms layout when needed. Refresh after navigation or DOM change rather than assume old refs mean the same element. Real Safari and WebKit need separate acceptance statements. A health ok does not establish login state, correct tab or visual success.

## State and error presentation

Read the user’s named browser/target -> create an owned session or explicitly authorized attach -> inspect current URL/title/snapshot -> act on observed refs -> verify resulting UI/provider state -> close only owned context or detach adopted state. Sending, purchasing, submitting, publishing or deleting through a browser still needs exact action approval. Do not repeat an old form submission just because the browser session restarted.

## Review standard

Review the actual interface changed: schema/error/citation output for tools, and visible rendered pages where this product creates a document or browser experience. Do not invent screen designs, visual tokens or customer flows that the product does not contain. User-facing success must name what succeeded and what remains unverified.

## Supporting sources

- [src/server.js](../../src/server.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
