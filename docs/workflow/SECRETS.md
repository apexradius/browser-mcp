# Local multi-session browser MCP: configuration and private inputs

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | No cloud API key is required, but attached Chrome cookies, logged-in pages, screenshots and evaluated page data are sensitive. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to resolve configuration responsibility without exposing values. |
| **Why this approach?** | No cloud API key is required, but attached Chrome cookies, logged-in pages, screenshots and evaluated page data are sensitive. |
| **Why it matters?** | Private input access is not necessary to understand the product contract. |

## Metadata-only configuration map

No cloud API key is required, but attached Chrome cookies, logged-in pages, screenshots and evaluated page data are sensitive. Do not dump profiles, cookies, tokens or full page payloads into reports. CDP endpoint and screenshot directory are configuration references; preserve existing user session state.

## Access discipline

This document carries configuration names, purpose and responsibility only. Never paste values, tokens, private prompts, unrestricted provider output or account exports. For a real credential failure, identify the approved storage/rotation path without printing its contents; verify the authorized replacement in the actual runtime and retain a redacted receipt. Secret presence, file readability and connector access are not approval to perform the task.

## Supporting sources

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
