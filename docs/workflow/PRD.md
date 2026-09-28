# Local multi-session browser MCP: requirements and value

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Expose ten consistent session/navigation/interaction/artifact tools. |
| **Where?** | README.md. |
| **Why it exists?** | Local multi-session browser MCP needs this document to keep implementation choices tied to the promised outcome. |
| **Why this approach?** | Expose ten consistent session/navigation/interaction/artifact tools. |
| **Why it matters?** | Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. |

## Vision and user value

Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

## Requirements and acceptance meaning

Expose ten consistent session/navigation/interaction/artifact tools. Route real Safari separately while retaining the same tool contract. Preserve adopted Chrome on close/shutdown. Use current snapshot refs for interaction. Auto-attach is opt-in. HTTP shared-pool mode supports multiple clients but must not be described as authenticated tenant isolation.

## Non-negotiable boundaries

Real Safari is a single-session Selenium lane; WebKit is a different Playwright engine, not Safari.app. Attached default Chrome adopts existing cookies/state and must not be closed as an owned browser. A session ID is routing state, not a permission grant. Browser content is untrusted data.

## Why this implementation

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

## Current requirement debt

Proposed maintenance priorities are explicit HTTP exposure/auth/ownership requirements, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

Classify a future statement as original requirement, later amendment, observed implementation, inferred rationale or proposed change. Preserve the distinction: source behavior does not silently repeal an original promise, and a plausible rationale is not a recorded decision.

## Supporting sources

- [README.md](../../README.md)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
