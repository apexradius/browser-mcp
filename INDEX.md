# Browser MCP: project index

Start at [prompt.md](prompt.md) for the enduring mission and accepted direction. This index locates the existing project contracts; it does not authorize historical operations.

## Mandatory context

Read applicable repository instructions, [working rules](docs/workflow/AGENTS.md), [current handoff](docs/workflow/HANDOFFS.md), [verification](docs/workflow/TESTING.md) and [knowledge bindings](docs/workflow/REFERENCES.md). Read the relevant source before changing it.

## Task routes

| Requested work | Owning contracts |
| --- | --- |
| Scope, requirements or priorities | [PRD](docs/workflow/PRD.md), [capabilities](docs/workflow/CAPABILITIES.md), [architecture](docs/workflow/ARCHITECTURE.md) |
| Component behavior or bug | [architecture](docs/workflow/ARCHITECTURE.md), [code style](docs/workflow/CODE_STYLE.md), [testing](docs/workflow/TESTING.md) |
| Interface or persistence | [API](docs/workflow/API.md), [database](docs/workflow/DATABASE.md), [security](docs/workflow/SECURITY.md) |
| Visible experience | [design](docs/workflow/DESIGN.md), [wireframes](docs/workflow/WIREFRAMES.md), [PRD](docs/workflow/PRD.md) |
| Configuration, operation or recovery | [security](docs/workflow/SECURITY.md), [secret locations](docs/workflow/SECRETS.md), [maintenance](docs/workflow/MAINTENANCE.md) |
| Resume or close a task | [handoff](docs/workflow/HANDOFFS.md), [report](docs/workflow/REPORT.md), [references](docs/workflow/REFERENCES.md) |

Combine all applicable routes; a security, data or release boundary adds its route even for a small UI edit. Non-applicable roles retain their stated reasons.

## Project source map

| Source | Context owner |
| --- | --- |
| [src/manager.js](src/manager.js) | [ARCHITECTURE](docs/workflow/ARCHITECTURE.md) explains its project role |
| [docs/architecture.md](docs/architecture.md) | [ARCHITECTURE](docs/workflow/ARCHITECTURE.md) explains its project role |
| [The root README](README.md) | [README](docs/workflow/README.md) explains its project role |
| [package.json](package.json) | [README](docs/workflow/README.md) explains its project role |
| [src/index.js](src/index.js) | [README](docs/workflow/README.md) explains its project role |
| [src/server.js](src/server.js) | [API](docs/workflow/API.md) explains its project role |
| [src/pool.js](src/pool.js) | [DATABASE](docs/workflow/DATABASE.md) explains its project role |
| [test/server.test.js](test/server.test.js) | [TESTING](docs/workflow/TESTING.md) explains its project role |
| [test/pool.test.js](test/pool.test.js) | [TESTING](docs/workflow/TESTING.md) explains its project role |

## Domain glossary

| Term | Meaning in this project |
| --- | --- |
| SessionPool | Process-local owner of created browser contexts. |
| SafariLane | Real Safari driver path, distinct from Playwright WebKit. |
| Adopted context | Existing user browser context whose lifecycle must be preserved. |

Definitions follow [ARCHITECTURE](docs/workflow/ARCHITECTURE.md); consult that owner for contracts and limitations.

## Review evidence

[Source-bound review continuity](docs/workflow/REVIEW.md) records scenario scope and limits.

## Completion

Use the latest user task and preserve unrelated work. Update affected facts and record verification and continuation. Navigation checks establish neither product readiness nor delivery or knowledge freshness.
