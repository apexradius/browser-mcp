# Start Here — apex-browser-mcp

## What this repo ships

- One Node package: `@apexradius/browser-mcp`
- One MCP entry point: `src/index.js`
- One shared browser manager that routes Playwright sessions, attached Chrome sessions, and real Safari

## First run

1. Install dependencies:

```bash
npm install
```

2. Install the Playwright engines used by the pool:

```bash
npx playwright install chromium webkit
```

3. Start the server:

```bash
APEX_BROWSER_TRANSPORT=http node src/index.js
```

## Key environment

| Variable | Required | Notes |
|---|---|---|
| `APEX_BROWSER_TRANSPORT` | optional | `stdio` by default; `http` for the shared daemon |
| `APEX_BROWSER_PORT` | optional | HTTP port, default `3010` |
| `APEX_BROWSER_MAX_SESSIONS` | optional | Concurrent session cap, default `15` |
| `APEX_BROWSER_HEADLESS` | optional | Set `1` for headless Playwright sessions |
| `APEX_BROWSER_SHOTS` | optional | Directory for saved screenshots |
| `APEX_BROWSER_AUTOATTACH` | optional | Set `1` to poll and auto-attach a debug Chrome |
| `APEX_BROWSER_CDP` | optional | CDP endpoint for attach mode, default `http://127.0.0.1:9222` |

## Validation commands

```bash
npm test
node test/attach-concurrent.js
```

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| No browser launches | Playwright engines missing | Run `npx playwright install chromium webkit` |
| Attach fails | Chrome was not started with remote debugging | Relaunch with `bin/chrome-debug.sh` |
| Safari session errors | Safari automation is single-session and OS-gated | Close the existing Safari automation window and retry |
| Screenshots not saved | Target directory missing or unwritable | Set `APEX_BROWSER_SHOTS` to a writable path |
