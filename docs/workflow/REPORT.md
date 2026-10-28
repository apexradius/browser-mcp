# Local multi-session browser MCP: evidence and unresolved claims

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to show what is observed, what remains unknown and what decision follows. |
| **Why this approach?** | Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. |
| **Why it matters?** | These limits keep the next task honest and bounded. |

## Reconstruction finding

Source reconstruction: 2026-09-26; candidate `c54c7b603634b4c8c581e99f21e41d130651cb2f` on `main`; source version `1.0.0`. This is a dated source observation, not a live-service or installed-version claim.

The earlier workflow-adoption completion has been superseded by the user’s request for substantive product reconstruction. The enduring product outcome is: Let MCP clients operate local Chrome, Chromium, WebKit and real Safari, or attach to an already running debug Chrome, while supporting concurrent separate sessions without a cloud browser.

## Established from sources

src/index.js chooses stdio (own manager per process) or Express Streamable HTTP (one BrowserManager shared by client transports). src/server.js binds ten schemas/handlers to that manager. BrowserManager routes safari-prefixed IDs to SafariLane and other IDs to SessionPool. SessionPool caches a browser per engine, isolated contexts per session and separate attached-CDP handles. SafariLane uses safaridriver via Selenium and reuses one driver. June history explicitly records local portability and opt-in self-healing attachment; no cloud dependency is part of this design.

d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. July 5 added hermetic tests, September 16 c54c7b6 merged CI gate configuration. Current package is 1.0.0. No active browser-session handoff was inspected, so there is no session ID or website action to resume.

## Unresolved product claims

Proposed maintenance priorities are HTTP exposure/auth/ownership hardening beyond the implemented 127.0.0.1 loopback bind, attach capacity behavior and controlled adopted-browser lifecycle tests. These findings do not authorize starting the server or reconnecting to a private browser. The next task should name the engine and behavior; a generic startup request performs context inspection only.

## Evidence limits and value

This reconstruction makes the next task’s interfaces, boundaries and prior intent recoverable. It does not establish new customer value, provider success or a deployed fix. No current product build, account request, browser launch, private corpus read, publish or release was performed. Structural document validation and source-grounded scenario read-through are recorded separately from product acceptance. [TESTING](TESTING.md) identifies the additional proof a future implementation needs.

## Supporting sources

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.


## 2026-10-24: session allocation and dependency checks

On branch `codex/browser-session-cap-20261024` over `c0d9a0158760f4265f500b11b7d5357bb5779eca`,
regressions demonstrated that overlapping creations exceeded the configured cap, attachments
bypassed it, failed attachment metadata left a registered session, and concurrent first
launches created an untracked browser process. Reservations now cover create/attach,
registration happens after metadata succeeds, and concurrent engine launches share one promise.

The first independent GLM-5.3 review found a newly unregistered owned context on a title
failure. Two failing regressions reproduced that case; failure cleanup now closes only
contexts created by the failed operation, preserving pre-existing adopted contexts.
The final independent GLM-5.3 review (high reasoning, read-only Pi, 259 seconds)
found no actionable new regressions. Both required skill reads and an unchanged
candidate diff hash were observed. The review was static; execution evidence is below.

Verification: the original 10 tests passed; four initial regressions failed before the
capacity fix; one additional launch regression failed before launch sharing; two review
regressions failed before owned-context cleanup. All 23 final tests pass. The controlled
real-Chrome test passes and exits cleanly after checking browser identity, capacity, slot
reuse, adopted-context survival and fixture cleanup. Safari/WebKit live suites were not run.

The dependency audit initially reported nine affected packages, including high/critical
findings. Existing dependency ranges were refreshed; MCP SDK now requires >=1.32.0 within
major 1 and Zod >=4.6.7 within major 4. The final audit reports zero findings. Tool-schema
defaults and invalid-input rejection are covered explicitly after the Zod upgrade.
No new direct dependency, hosted service, private browser access or deployment was added.

Local CI-equivalent acceptance: all 23 unit/MCP tests, 25 documentation-checker
fixtures, workflow/review validators, and full-history and candidate secret scans passed.
Hosted Actions were removed in the base commit; no hosted CI or production rollout is claimed.


## 2026-10-24: concise project guidance

Project startup now routes to task-relevant documents. Product-specific constraints
remain in AGENTS; implementation, verification and release detail stays in its owning
documents. This documentation-only change preserves runtime code and existing product
acceptance limits. The owner authorized reviewed PR delivery after applicable checks
and independent review; it does not authorize production deployment.

Validation: 25 existing document-checker fixtures passed, along with tracked
navigation and applicable review-snapshot checks. Runtime source is unchanged.

Independent read-only GLM-5.3/high review checked retained project constraints and
the owning document routes. Findings relevant to this candidate were resolved and
the final navigation/review checks passed; runtime source remains unchanged.


## 2026-10-27: HTTP session routing maintenance

Over upstream base `8aa9a2a858d93d2433a68966365fba445c8dd7ab`, the HTTP transport registry now uses a Map. Missing IDs still return 400 outside initialization; supplied unknown, empty or terminated IDs return 404 and cannot initialize another transport. Known-session requests remain with the SDK. The owned daemon fixture is shared by the HTTP regression and extensive suite; NoMistakes now declares both test suites.

The initial HTTP test had an SSE decoding error. After correcting that fixture, a retrospective run against the pristine base reproduced ordinary unknown IDs returning 400, prototype keys returning 500, stale initialization issuing a new ID, and stale requests after DELETE returning 400. Valid initialization and tool listing passed on that baseline. The corrected implementation passed the same focused suite. An additional empty-header regression failed with 200 before its guard correction and passed afterwards.

Baseline verification observed 27 hermetic tests, 22 extensive checks and 25 documentation fixtures passing, zero dependency advisories and clean source secret scans. Real Safari was unavailable (connection timeout); optional CDP attach was skipped. Those results do not prove Safari, installed-daemon behavior or production readiness. Final combined verification and native NoMistakes delivery are pending in this dated candidate record. Original checkout edits and recovery worktrees are preserved; no installed daemon, client configuration or user browser was changed.
