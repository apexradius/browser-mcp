# Local multi-session browser MCP: acceptance evidence

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap, unsupported engine before launch, context cleanup on failed creation and shutdown closure of isolated attached contexts; Safari lifecycle tests classify pre-connection Safari connection timeouts and the disabled remote-automation permission gate as environment skips while other creation and post-connection failures remain failures. |
| **Where?** | test/server.test.js, test/pool.test.js, test/safari-lifecycle.test.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to choose a check that proves the changed behavior without claiming broader evidence. |
| **Why this approach?** | npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap, unsupported engine before launch, context cleanup on failed creation and shutdown closure of isolated attached contexts; Safari lifecycle tests classify pre-connection Safari connection timeouts and the disabled remote-automation permission gate as environment skips while other creation and post-connection failures remain failures. |
| **Why it matters?** | A registration or document check cannot prove live authentication, provider state or the installed user path. |

## Required proof by behavior

npm run test:ci uses node --test test/*.test.js: in-memory MCP transport tests check ten schemas, success/error envelopes; pool tests check empty state, unknown session, cap, unsupported engine before launch, context cleanup on failed creation and shutdown closure of isolated attached contexts; Safari lifecycle tests classify pre-connection Safari connection timeouts and the disabled remote-automation permission gate as environment skips while other creation and post-connection failures remain failures. npm test runs test/extensive.js and real browsers; attach/Safari/HTTP scripts exercise live local state and have different side effects. No browser was launched here. Changes to adopted-context ownership need a controlled browser regression, not only the hermetic schema test.

## Product acceptance baseline

Expose ten consistent session/navigation/interaction/artifact tools. Route real Safari separately while retaining the same tool contract. Preserve adopted Chrome on close/shutdown. Use current snapshot refs for interaction. Auto-attach is opt-in. HTTP shared-pool mode supports multiple clients but must not be described as authenticated tenant isolation.

## Evidence custody

Inspected means source/test definitions were read. Locally verified means the named executable check actually ran and its result was observed. Live verified requires the deployed, installed or user-facing path. Historical checkmarks and CI configuration are not fresh results. Use the exact candidate, environment, test input class, observed result and limitations in a receipt. Use the current task and runtime catalog to select any additional review workflow; this document does not activate a pipeline.

## Supporting sources

- [test/server.test.js](../../test/server.test.js)
- [test/pool.test.js](../../test/pool.test.js)
- [test/safari-lifecycle.test.js](../../test/safari-lifecycle.test.js)

## Document checker dependency

Install the pinned CommonMark parser with `python -m pip install -r tools/requirements-workflow.txt` before running the document checkers and their fixtures. `markdown-it-py` parses actual navigation tokens; it does not render pages, fetch links or establish reader comprehension. CI uses Python 3.12 and the same pinned dependency.

## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.


## Session allocation regression

`npm run test:ci` includes cap reservations across overlapping create/attach calls,
launch sharing/retry, attachment and page-creation failure cleanup, shutdown closure of
isolated attached contexts, and MCP schema defaults/rejections.
`node test/session-cap-live.js` additionally uses task-owned headless Google Chrome
and a temporary profile to check cold-launch sharing, the cap, slot reuse, adopted
context survival and shutdown closure of its isolated context. It does not connect to a
pre-existing user browser or port 9222.


## HTTP session identity regression

`npm run test:ci` also runs `test/http-session.test.js` against a task-owned daemon on an OS-assigned loopback port. It checks missing, unknown, prototype-shaped, empty and terminated session IDs, initialization, all ten tool schemas and fresh handshakes. It launches no browser and does not contact installed ports 3010 or 9222. The shared `test/helpers/http-daemon.js` fixture is also used by the extensive multi-client suite. The NoMistakes test command runs both `npm run test:ci` and `npm test`.
