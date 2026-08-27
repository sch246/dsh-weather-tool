#!/usr/bin/env bash
set -euo pipefail

PROFILE="${DSH_PROFILE:-web}"
CHECKOUT="${DSH_CHECKOUT:-$HOME/deepseek-harness}"

if command -v dsh >/dev/null 2>&1; then
  dsh plugin --profile "$PROFILE" remove dsh-weather-tool
elif [ -f "$CHECKOUT/apps/cli/lib/bin.js" ]; then
  node "$CHECKOUT/apps/cli/lib/bin.js" plugin --profile "$PROFILE" remove dsh-weather-tool
elif command -v pnpm >/dev/null 2>&1 && [ -f "$CHECKOUT/apps/cli/src/bin.ts" ]; then
  (cd "$CHECKOUT" && pnpm dsh plugin --profile "$PROFILE" remove dsh-weather-tool)
else
  echo "cannot locate dsh; refusing a partial uninstall" >&2
  exit 1
fi

echo "dsh-weather-tool removed from profile '$PROFILE'; remove any local weather-tool config override before restarting Web."
