# Start Here

`browser-mcp` runs local browser sessions behind MCP. It can launch fresh browser contexts or
attach to an already-running Chrome instance.

## First Run

```bash
npm install
npx playwright install chromium webkit
APEX_BROWSER_TRANSPORT=http node src/index.js
```

The HTTP endpoint is `http://127.0.0.1:3010/mcp` unless `APEX_BROWSER_PORT` changes it.

## Common Paths

| Need | Command or file |
|---|---|
| Start stdio mode | `node src/index.js` |
| Start HTTP daemon | `APEX_BROWSER_TRANSPORT=http node src/index.js` |
| Launch debug Chrome | `bin/chrome-debug.sh real` |
| Run full checks | `npm test` |
| Test attached Chrome | `npm run test:attach` |

## Development Loop

```bash
npm install
npm test
```

Core routing is in `src/server.js`; session lifecycle is in `src/manager.js`; engine pooling is in
`src/pool.js`; Safari-specific handling is in `src/safari.js`.
