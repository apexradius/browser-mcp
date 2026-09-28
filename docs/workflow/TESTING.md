# Local multi-session browser MCP: acceptance evidence

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap and unsupported engine before launch. |
| **Where?** | test/server.test.js, test/pool.test.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to choose a check that proves the changed behavior without claiming broader evidence. |
| **Why this approach?** | npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap and unsupported engine before launch. |
| **Why it matters?** | A registration or document check cannot prove live authentication, provider state or the installed user path. |

## Required proof by behavior

npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap and unsupported engine before launch. npm test runs test/extensive.js and real browsers; attach/Safari/HTTP scripts exercise live local state and have different side effects. No browser was launched here. Changes to adopted-context ownership need a controlled browser regression, not only the hermetic schema test.

## Product acceptance baseline

Expose ten consistent session/navigation/interaction/artifact tools. Route real Safari separately while retaining the same tool contract. Preserve adopted Chrome on close/shutdown. Use current snapshot refs for interaction. Auto-attach is opt-in. HTTP shared-pool mode supports multiple clients but must not be described as authenticated tenant isolation.

## Evidence custody

Inspected means source/test definitions were read. Locally verified means the named executable check actually ran and its result was observed. Live verified requires the deployed, installed or user-facing path. Historical checkmarks and CI configuration are not fresh results. Use the exact candidate, environment, test input class, observed result and limitations in a receipt. Read [AGENTS](AGENTS.md) for conditional AXI/crew custody; do not create a pipeline merely because this file exists.

## Supporting sources

- [test/server.test.js](../../test/server.test.js)
- [test/pool.test.js](../../test/pool.test.js)

## Document checker dependency

Install the pinned CommonMark parser with `python -m pip install -r tools/requirements-workflow.txt` before running the document checkers and their fixtures. `markdown-it-py` parses actual navigation tokens; it does not render pages, fetch links or establish reader comprehension. CI uses Python 3.12 and the same pinned dependency.

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
