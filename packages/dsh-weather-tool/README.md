# dsh-weather-tool

Host-only ESM Bundle registering `get_weather` with QWeather current conditions and an optional three-day forecast. Its entry is `index.mjs` and its Bundle is `cordis.patch.yml`; no build or runtime dependencies are required.

Register this directory with the selected DSH profile. Set the `weather-tool` row's complete `config` in the profile-local patch: required `apiHost` (hostname), `keyId`, `projectId`, `privateKeyFile` (Ed25519), and `defaultLocation`; optional `timeoutMs` defaults to 15000 and must be at least 1000. Keep credentials and deployment locations outside this package. Invalid configuration fails at load; a forecast failure preserves successful current conditions.

Source workspace setup, removal, migration, and acceptance routes live in the repository root README and `.intent/state/STATE.md`.

MIT; see LICENSE.
