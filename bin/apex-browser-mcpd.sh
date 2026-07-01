#!/bin/sh
# Persistent daemon launcher. Resolves node via mise AT RUNTIME so a node
# version bump never breaks the LaunchAgent (no hardcoded interpreter path).
cd /Users/apex/projects/apex-browser-mcp || exit 1
export APEX_BROWSER_TRANSPORT=http
export APEX_BROWSER_PORT=3010
export APEX_BROWSER_MAX_SESSIONS=15
export APEX_BROWSER_SHOTS=/tmp
# mise shim resolves the active node at runtime — the canonical service-safe path.
if [ -x "$HOME/.local/share/mise/shims/node" ]; then
  NODE="$HOME/.local/share/mise/shims/node"
else
  NODE="$(/opt/homebrew/bin/mise which node 2>/dev/null || command -v node)"
fi
[ -x "$NODE" ] || { echo "no node found" >&2; exit 1; }
exec "$NODE" src/index.js
