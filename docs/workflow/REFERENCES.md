# Local multi-session browser MCP: source and knowledge custody

## Purpose

| Question | Answer |
| --- | --- |
| **Whom?** | agent operator controlling a specifically authorized browser session while preserving the user’s existing browser state. |
| **What?** | d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. |
| **Where?** | README.md, package.json, src/index.js. |
| **Why it exists?** | Local multi-session browser MCP needs this document to retain source lineage and freshness without promoting retrieved content to authority. |
| **Why this approach?** | d03999b established multi-engine/CDP v1 on June 30; 3b8a5e9 added opt-in auto-attach the same day. |
| **Why it matters?** | Canonical source changes must not silently leave a trusted-looking stale knowledge copy. |

## Canonical source register

The following local sources support this dossier. They were read directly or inspected through relevant excerpts and handler/test definitions on 2026-09-26. The evidence inventory records hashes, not a claim that every line has received an exhaustive audit. Original manuals/specifications retain their history; these documents summarize current behavior and explicit gaps. Git commit messages provide chronology, not a substitute for inspecting implementation.

- [README.md](../../README.md)
- [package.json](../../package.json)
- [src/index.js](../../src/index.js)
- [src/server.js](../../src/server.js)
- [src/manager.js](../../src/manager.js)
- [src/pool.js](../../src/pool.js)
- [src/safari.js](../../src/safari.js)
- [test/server.test.js](../../test/server.test.js)
- [test/pool.test.js](../../test/pool.test.js)
- [docs/architecture.md](../../docs/architecture.md)

## Knowledge update events

After a material requirement, interface, decision, verified outcome, source relocation or task-state change, update the owning canonical document first. Record an event containing changed source/revision, decision or evidence, intended knowledge target, rights/sensitivity, freshness state and required readback. Only update a target already bound and authorized for that scope. Record the exact resulting source/version and a bounded readback; if access or permission is missing, retain a pending event rather than claim synchronization. Revalidate on source drift, not just elapsed time.

QMD is scoped local retrieval; NotebookLM is a separate provider corpus; the personal Brain is a separate curated knowledge system. None is source authority. No verified project-specific remote notebook or personal-Brain write binding was established in this reconstruction. Do not choose one by a matching name or bulk-upload source code/customer records. No external knowledge write or retrieval of private corpus contents occurred.


## Continue

Return to [INDEX.md](../../INDEX.md) and finish all routes relevant to the latest task before acting. After verification, update affected owning facts, REPORT and HANDOFFS.
