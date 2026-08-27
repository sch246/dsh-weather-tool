# Agent entry

This host contains an embedded intent package at `.intent/`.

- Read `.intent/state/STATE.json` and its selected protocol before changing, installing, maintaining, or uninstalling this package.
- Runtime code and tests outside `.intent/` are the current realization, not semantic authority; no realization lock is selected yet.
- Install with `bash scripts/setup.sh`, keep all QWeather identity, credentials, key paths, and default locations in profile-local configuration, then manage Web only through `systemctl dsh-web`.
- Never commit profile patches, private keys, account-specific API hosts or identifiers, precise default locations, query fixtures, or output captured from a real deployment.
