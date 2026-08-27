#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${DSH_PROFILE:-web}"
CHECKOUT="${DSH_CHECKOUT:-$HOME/deepseek-harness}"

if command -v dsh >/dev/null 2>&1; then
  dsh plugin --profile "$PROFILE" add "$REPO_DIR"
elif [ -f "$CHECKOUT/apps/cli/lib/bin.js" ]; then
  node "$CHECKOUT/apps/cli/lib/bin.js" plugin --profile "$PROFILE" add "$REPO_DIR"
elif command -v pnpm >/dev/null 2>&1 && [ -f "$CHECKOUT/apps/cli/src/bin.ts" ]; then
  (cd "$CHECKOUT" && pnpm dsh plugin --profile "$PROFILE" add "$REPO_DIR")
else
  echo "cannot locate dsh; set DSH_CHECKOUT or install the dsh CLI" >&2
  exit 1
fi

echo "dsh-weather-tool registered in profile '$PROFILE'"
echo "Add the local weather-tool config override described in README.md, then restart the managed Web service."
