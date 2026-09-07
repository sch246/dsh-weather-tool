# dsh-weather-tool

Installation and maintenance start at [STATE](.intent/state/STATE.md), including target drift, ownership, removal and evidence limits.

A small, Host-only DeepSeek Harness plugin that registers `get_weather` using the QWeather API. It returns current conditions and, when available, a three-day forecast.

The repository contains no deployment credentials or default location. QWeather account identifiers, the account-specific API host, private-key path, and default location belong only in the target profile's local patch layer.

## Install

Run from the repository root. Inspection is the default and does not invoke DSH or change a profile:

```sh
node scripts/plugin.mjs setup
node scripts/plugin.mjs inspect
```

For installation, set `DSH_CHECKOUT` to an absolute Harness checkout with `apps/cli/lib/bin.js`, `DSH_HOME` to an existing absolute Home directory, and `DSH_PROFILE` to the target profile name. All three are required; no installed CLI or default Home/profile is selected.

```sh
export DSH_CHECKOUT=/absolute/path/to/deepseek-harness
export DSH_HOME=/absolute/path/to/dsh-home
export DSH_PROFILE=web
node scripts/plugin.mjs setup --install
```

This runs the selected checkout's built CLI directly with `plugin --profile "$DSH_PROFILE" add <absolute-repository>/packages/dsh-weather-tool`. The CLI owns dependency and Bundle registration. The script does not build Harness, supply deployment configuration, or restart services. Bash wrappers provide the same operations (`bash scripts/setup.sh --install`); the Node entry also works on Windows after setting the three environment variables in that shell.

The root is now a private development workspace. Existing links to the old repository-root package must be replaced by the package-directory route above before activating this revision. Preserve the profile-local config override and verify dependency resolution, the profile lockfile, and Bundle membership together. There is no root runtime forwarding entry.

Then add an id-targeted override to that profile's local `cordis.patch.yml`:

```yaml
- id: weather-tool
  config:
    apiHost: <QWEATHER_API_HOST>
    keyId: <QWEATHER_KEY_ID>
    projectId: <QWEATHER_PROJECT_ID>
    privateKeyFile: /path/outside/repository/qweather-ed25519-private.pem
    defaultLocation: <CITY_OR_LOCATION_ID>
```

The placeholders are deliberately non-runnable. Keep the Ed25519 private key outside this repository and restrict its filesystem permissions.

Activate the configured profile through its managed service only when authorized.

## Use

The model can call `get_weather` with a city name, coordinates, or QWeather LocationID. Omitting `location` uses the locally configured default.

The plugin fails during load when required configuration or the private key is unavailable. A failed three-day forecast does not discard successfully retrieved current conditions.

## Uninstall

Remove the plugin's id-targeted config override from `$DSH_HOME/profiles/$DSH_PROFILE/cordis.patch.yml`, then use the same three explicit environment variables:

```sh
node scripts/plugin.mjs remove --remove
```

This calls the selected built CLI with `plugin --profile "$DSH_PROFILE" remove dsh-weather-tool`. `node scripts/plugin.mjs remove` only inspects. `bash scripts/remove.sh --remove` and the legacy `bash scripts/uninstall.sh --remove` are aliases. Removal changes package/Bundle registration; it preserves credentials and unrelated local configuration. Confirm resolution and Bundle membership are absent, then activate only through the target profile's managed service when separately authorized.

## Development

The runtime package is [`packages/dsh-weather-tool`](packages/dsh-weather-tool); root `.intent/`, `AGENTS.md`, scripts, and tests support development and maintenance. Both root and package carry the same MIT license and original copyright.

```sh
node --check packages/dsh-weather-tool/index.mjs
node --check scripts/plugin.mjs
node --test
```

Root `build` and `typecheck` scripts perform these JavaScript syntax checks; they emit no artifacts and do not claim TypeScript analysis. Root `test` retains the existing `node --test` suite. The workspace pins `pnpm@10.17.1` and needs no dependency installation for these checks.
