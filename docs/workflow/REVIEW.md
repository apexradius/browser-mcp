# Browser MCP: documentation review continuity

Observed 2026-09-28 against source baseline `c54c7b603634b4c8c581e99f21e41d130651cb2f`. This is a bounded continuity check of the earlier independent source review, not a new runtime or product acceptance test.

The 10 primary-source hashes recorded in the prior review still match this candidate baseline. The project-specific role bodies are retained; this change adds portable navigation, an actual-source map, a domain glossary and executable document checks. Historical/local-only references remain explicitly unavailable rather than being invented or silently imported.

## Previously source-challenged scenarios

### Close an attached logged-in browser after a task

Reader recovery: Default attach adopts first context/page; close deletes map entry and skips context.close for adopted sessions. Created isolated attached contexts have different ownership. Dossier preserves user browser, and no browser was accessed for review.

Source and dossier evidence: ["src/pool.js:attach", "src/pool.js:close", "docs/workflow/ARCHITECTURE.md", "docs/workflow/DATABASE.md"]

Result: pass

Evidence level: inspected

### Expose browser HTTP remotely and verify Safari with WebKit

Reader recovery: app.listen(PORT) lacks explicit loopback binding, shared pool lacks per-client ownership/auth, and arbitrary evaluation can act with cookies. Dossier names this gap and does not authorize daemon launch. Manager routes real Safari to Selenium singleton, distinct from Playwright WebKit; one engine’s test is not the other’s acceptance.

Source and dossier evidence: ["src/index.js:httpMain", "src/manager.js", "src/safari.js", "src/server.js", "docs/workflow/API.md", "docs/workflow/ARCHITECTURE.md"]

Result: pass

Evidence level: inspected

## Source binding

| Source | SHA256 |
| --- | --- |
| `README.md` | `2bbf8e400aa8d9bea8239a220b104749d0bc62ca9089ac0c860d196f37f99aa2` |
| `package.json` | `1c3097f2af5e510d3c79257029e9b019d125321f90ba8c2f4c6e376af9996635` |
| `src/index.js` | `c4cdabe75a6f24dec6585d94641a4df59a429bded41b45f9d891a8788ba2bcf2` |
| `src/server.js` | `fd451694c112f0e01c0a2b8cf6d58b59690f42d0252c46fba1592b3626109d37` |
| `src/manager.js` | `39a181c27e13a38d0a4b5e24b5130e4b54564e9005154112c0dbac521a3bbecc` |
| `src/pool.js` | `ebbb9c0119b7111d1bd110b6a82314a52b22e3db2557651dfa0531feb4595efb` |
| `src/safari.js` | `39511d2b4ac8df1c184d87a12b51f5262649bfd5161fc2fad95524e56b22abdc` |
| `test/server.test.js` | `80c7ffca96e6dc640f5e288f7e50250867dc66bac20d645963786a515068f01f` |
| `test/pool.test.js` | `160b018c012000b694e3dbb9e782fe9fb81c9a924fcd24bdfaf8776ea117bb6c` |
| `docs/architecture.md` | `e370cbae9d471483651894bdb11d42bbae02acec63754b038616e083cab785dc` |

Prior review artifact names: `tooling-independent-review.json`. The owner retains these in the dated 2026-09-26 reconstruction evidence directory. A fresh clone can inspect the above source and scenarios without that private directory.

## Limits

No new fresh-runtime comprehension, deployed behavior, provider operation or release is claimed. The current user request selects work; these scenarios are examples, not standing tasks. Local/CI/merge/knowledge status is recorded separately in review.json.
