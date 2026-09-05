# dsh-weather-tool

Installation and maintenance start at [STATE](.intent/state/STATE.md), including target drift, ownership, removal and evidence limits.

A small, Host-only DeepSeek Harness plugin that registers `get_weather` using the QWeather API. It returns current conditions and, when available, a three-day forecast.

The repository contains no deployment credentials or default location. QWeather account identifiers, the account-specific API host, private-key path, and default location belong only in the target profile's local patch layer.

## Install

Clone the repository and register its bundle in the target profile:

```sh
bash scripts/setup.sh
```

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

Restart the systemd-managed Web service:

```sh
systemctl restart dsh-web
```

These commands target the default `web` profile. `DSH_PROFILE` selects another profile and `DSH_CHECKOUT` locates a source checkout when no installed `dsh` command is available; restart that profile's own managed service instead of `dsh-web`.

## Use

The model can call `get_weather` with a city name, coordinates, or QWeather LocationID. Omitting `location` uses the locally configured default.

The plugin fails during load when required configuration or the private key is unavailable. A failed three-day forecast does not discard successfully retrieved current conditions.

## Uninstall

Remove the local config override, then run:

```sh
bash scripts/uninstall.sh
systemctl restart dsh-web
```

The uninstall command removes only the bundle registration. It does not delete credentials or edit profile-local configuration.

## Development

```sh
npm test
```

The runtime entry is import-free so a linked external package does not depend on unpublished Harness workspace packages. Tool registration is scoped to the plugin lifecycle through `ctx.effect()`.
