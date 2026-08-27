# Weather tool intent

Status: user-grounded draft with an unsealed realization.

## Intent

Provide a small DeepSeek Harness plugin that lets the model query QWeather for current conditions and a three-day forecast without placing deployment identity or personal information in the repository.

## Desired effects

- Register one model-facing `get_weather` tool in the selected DSH profile.
- Accept an optional city name, coordinates, or QWeather LocationID; use a locally configured default when omitted.
- Return current conditions and include the three-day forecast when it is available.
- Preserve a successful current observation when only the forecast request fails.
- Own registration for exactly the plugin lifecycle so disable, reload, and uninstall do not leave a stale tool.

## Observable acceptance

- `WEATHER-001`: With valid profile-local configuration, `get_weather` returns current conditions for an explicit location and for the configured default.
- `WEATHER-002`: A forecast failure still returns the successful current conditions; a city lookup or current-weather failure returns a bounded Chinese error result.
- `WEATHER-003`: Package tests verify config validation, Ed25519 JWT claims/signature, authenticated request construction, response formatting, default selection, and registration disposal.
- `WEATHER-004`: The package installs through a DSH bundle link without modifying Harness source; composed config contains the package entry and profile-local override, and uninstall removes the bundle registration without deleting credentials.
- `WEATHER-005`: Repository history contains no real API host, account identifier, private key or key path, precise deployment location, real query fixture, or captured deployment response.

## Constraints and permissions

- QWeather account identity, credentials, private-key bytes and paths, default locations, queries, and captured results remain profile-local and outside Git.
- Missing or invalid required configuration fails during plugin load; do not silently register a non-working tool.
- Installation, restart, publication, and remote repository creation require user authority. The user authorized extraction and repository creation in the source record.
- Do not introduce a Harness source patch or a client bundle for this Host-only tool.

## Non-goals

This package is not a general weather-provider abstraction, a browser weather panel, a credential manager, or a QWeather account provisioning tool. It does not persist query history or infer the user's location.

## Implementation hints

An import-free ESM entry can register a plain DSH tool definition and avoid unpublished Harness workspace dependencies. A profile bundle supplies the plugin identity while an id-targeted profile override supplies deployment configuration.

## Current reality and open tensions

The local Web profile now loads the linked package and has completed a successful real query after the old profile-local executable left the configuration graph. Candidate 1 binds the first public source commit and the observed install/runtime evidence; acceptance remains incomplete until the linked-package uninstall boundary is exercised.
