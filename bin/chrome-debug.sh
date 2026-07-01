#!/bin/sh
# Launch Chrome with a CDP debug port so apex-browser can attach to it.
#
#   chrome-debug.sh            -> dedicated automation profile (SAFE; default)
#   chrome-debug.sh real       -> YOUR real logged-in profile (must quit normal Chrome first)
#
# Port defaults 9222 (override: PORT=9333 chrome-debug.sh).
PORT="${PORT:-9222}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
MODE="${1:-apex}"

if [ "$MODE" = "real" ]; then
  PROFILE="$HOME/Library/Application Support/Google/Chrome"
  if pgrep -x "Google Chrome" >/dev/null 2>&1; then
    echo "Chrome is running on your real profile WITHOUT a debug port." >&2
    echo "Quit Chrome fully (Cmd-Q), then re-run: chrome-debug.sh real" >&2
    exit 1
  fi
  echo "Launching your REAL Chrome profile with debug port $PORT (has your logins)."
else
  PROFILE="$HOME/.apex-chrome-automation"
  mkdir -p "$PROFILE"
  echo "Launching dedicated automation profile ($PROFILE) with debug port $PORT."
  echo "Log into sites once here; logins persist across runs. Does not touch your main Chrome."
fi

exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE" \
  --no-first-run --no-default-browser-check
