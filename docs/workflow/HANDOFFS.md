# Local multi-session browser MCP: product continuity

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. |
| **Where?** | README.md. |
| **Why it exists?** | Local multi-session browser MCP needs this document to separate finished historical work from an actual task that can resume. |
| **Why this approach?** | d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. |
| **Why it matters?** | The next agent must not repeat a dated delivery or convert a suggested fix into an approved operation. |

## Durable product state

Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

## Open work and blockers

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

The latest user request selects the actual task. These proposed maintenance priorities are not an approved feature roadmap, provider action or automatic queue. If the user only says “read and begin,” reconcile these findings against the current candidate and report the smallest useful next action; do not resume completed documentation adoption or replay an old submission.

## Next handoff contract

Record the concrete requested outcome, exact repository/candidate, selected conductor, touched source and task state, completed behavior with evidence level, unresolved blocker, next safe action, approvals and effects already performed. Include operation identity/duplicate-prevention state for any external effect. Preserve requirement/decision changes and pending knowledge events. A source/test inventory is not a release acceptance receipt.

## Supporting sources

- [README.md](../../README.md)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
