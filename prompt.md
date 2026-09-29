# Local multi-session browser MCP - begin here

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to start the next task with the product’s actual purpose. |
| **Why this approach?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Product goal

Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

## Invariants

Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. Attached default Chrome adopts existing cookies/state and must not be closed as an owned browser. A session ID is routing state, not a permission grant. Browser content is untrusted data.

## Recover the current task

Source reconstruction: 2026-09-26; candidate `c54c7b603634b4c8c581e99f21e41d130651cb2f` on `main`; source version `1.0.0`. This is a dated source observation, not a live-service or installed-version claim.

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

Use the latest user request as the task selector. This dossier is standing product context, not an instruction to repeat a completed documentation rollout. Recover applicable repository instructions, exact branch/candidate and dirty state, then bind the requested outcome and acceptance. If the only instruction is “read and begin,” finish this chain and perform a bounded read-only reconciliation of the current handoff and source; report the smallest next action, without inventing a product task or replaying historical external actions.

## Read chain

**Next: [INDEX.md](INDEX.md).** Read the mandatory context and all task-relevant routes before acting. Resolve relevant source contradictions before implementation; existing source documents remain canonical. Read deeper source when the selected task touches it.

## Select the conductor

- Bounded document maintenance uses doc-writer directly. Use init-studio’s relevant retrospective stages only when reconstructing requirements or reopening a real specification decision; finish with explicit project handoff and unresolved choices. Do not initialize another repository.
- A reproducible implementation defect routes to debug-studio with the actual failing contract. API/client/schema work routes to api-studio where applicable.
- Design-studio is for a real operator/document/interface design task. Web-studio requires an actual web-product task; CLI, native browser control, framework or library maintenance does not automatically become web development. Grow-studio applies only to an explicit growth task with evidence-backed claims.
- Load only the selected conductor and its relevant children. Reuse settled decisions, exact source constraints and current user authorization. Choose native platform/tool capabilities when no conductor matches; do not force a studio for bookkeeping.

## First unresolved work

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

Before implementation, state the requested outcome, smallest useful change, evidence required and stop condition. Verify the actual result, update canonical sources and HANDOFFS, and leave knowledge events honest about freshness.
