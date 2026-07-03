# Architecture

`browser-mcp` exposes local browser automation as MCP tools. The process can run over stdio for a
single client or HTTP for a daemon-style multi-client setup.

## Components

```mermaid
flowchart TD
    Entry[src/index.js] --> Server[src/server.js]
    Server --> Manager[src/manager.js]
    Manager --> Pool[src/pool.js]
    Manager --> Safari[src/safari.js]

    Pool --> Playwright[Playwright engines]
    Safari --> SafariDriver[safaridriver]
    Manager --> CDP[Chrome CDP attach]

    Server --> Tools[MCP browser tools]
    Tools --> Manager
```

## Session Sequence

```mermaid
sequenceDiagram
    actor User
    participant MCP as MCP client
    participant Server as src/server.js
    participant Manager as src/manager.js
    participant Browser as Browser engine

    User->>MCP: Request browser action
    MCP->>Server: Call browser tool
    Server->>Manager: Create or find session
    Manager->>Browser: Launch, attach, or reuse context
    Browser-->>Manager: Page/session handle
    Manager-->>Server: Session result
    Server-->>MCP: Snapshot or action result
```

## Engine Boundaries

| Engine | Backend | Notes |
|---|---|---|
| `chrome` | Playwright Chrome channel | Real Chrome binary. |
| `chromium` | Playwright bundled Chromium | Good for headless and CI. |
| `webkit` | Playwright WebKit | Safari engine coverage. |
| `safari` | Apple `safaridriver` | Single-session OS limit. |
| attach | Chrome DevTools Protocol | Uses an already-running Chrome profile. |

## Safety Rules

- Attached Chrome sessions detach; they do not close the user's browser.
- Safari.app is single-session because that is an Apple WebDriver limit.
- Screenshots go to `APEX_BROWSER_SHOTS`, defaulting to a temporary path.
- The daemon stays local unless the host/port are changed by the operator.
