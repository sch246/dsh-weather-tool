# Agent entry

This host contains an embedded intent package at `.intent/`.

- Read `.intent/state/STATE.json` and its selected protocol before changing, installing, maintaining, or uninstalling this package.
- Runtime code and tests outside `.intent/` are the current realization, not semantic authority; no realization lock is selected yet.
- Runtime package: `packages/dsh-weather-tool/`. Root scripts and intent records own maintenance. `node scripts/plugin.mjs setup` inspects by default; installation requires `setup --install` and explicit `DSH_CHECKOUT`, `DSH_HOME`, and `DSH_PROFILE`. Removal requires `remove --remove` with the same target values. Follow STATE for root-link migration and activation.
- Keep all QWeather identity, credentials, key paths, and default locations in profile-local configuration.
- Never commit profile patches, private keys, account-specific API hosts or identifiers, precise default locations, query fixtures, or output captured from a real deployment.
