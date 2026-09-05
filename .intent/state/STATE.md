# Weather tool intent

Status: user-grounded draft with an alpha.2 installation route and pending acceptance evidence. Earlier candidate and deployment evidence is historical; the retained records do not establish an installed and verified realization against `dsh-v0.1.2-alpha.2`.

## Using and maintaining this map

Use this STATE as the installation and maintenance prompt. Its first map is incomplete: investigate the selected Host and learn while realizing the desired effects. Update the map when actual user feedback or checked environmental facts change a route, requirement or evidence limit; do not promote an old Agent claim into a user preference. LOG preserves consequential reasons selectively. A realization LOCK is optional exact-recovery evidence, not a prerequisite for useful work or acceptance. The selected protocol remains 0.2; the current user's 2026-09-06 direction supersedes a mandatory LOG → STATE → LOCK choreography without rewriting that immutable protocol.

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
- `WEATHER-003`: Missing or invalid required configuration fails visibly before a working tool is exposed. Disable, reload, and uninstall release the registration so no stale `get_weather` tool remains.
- `WEATHER-004`: The package installs through a DSH bundle link without modifying Harness source; composed config contains the package entry and profile-local override, and uninstall removes the bundle registration without deleting credentials.
- `WEATHER-005`: Repository history contains no real API host, account identifier, private key or key path, precise deployment location, real query fixture, or captured deployment response.

## Installation and maintenance route

Select the real Home/profile and CLI before registration. The current route is a Host-only bundle: [package manifest](../../package.json), [Bundle](../../cordis.patch.yml), [runtime](../../index.mjs). It has no generated client catalog or browser build. Check that no old profile-local weather executable or second `get_weather` owner remains in the composed profile. Retire the old registration only after the linked entry works; keep deployment data outside this repository.

From the repository root, use:

```sh
DSH_CHECKOUT=/root/deepseek-harness DSH_PROFILE=web bash scripts/setup.sh
```

[Setup](../../scripts/setup.sh) prefers the installed `dsh`, otherwise the selected checkout CLI, and adds this repository as package `dsh-weather-tool`. It does not provision QWeather, supply configuration, query weather or restart Web. Set `DSH_HOME` when operating a different Home; ensure an installed CLI addresses that same deployment.

Supply an id-targeted `weather-tool` override in that profile's local `cordis.patch.yml` using the [configuration example](../../README.md#install). Required fields are `apiHost` (hostname without scheme/path), `keyId`, `projectId`, `privateKeyFile` (Ed25519) and `defaultLocation`; optional `timeoutMs` defaults to 15000 and must be at least 1000. Use an absolute private-key path readable by the service account. Configure before the next load because the shipped empty config deliberately fails at load. Retain the real values only in the profile and private evidence.

Check dependency, profile lockfile, resolved link, Bundle membership and composed override together. A registered package with missing configuration is not an installed working tool. If CLI or tool-definition APIs change upstream, inspect current bundle loading, tool output and disposer APIs and adapt this small Host entry. Do not introduce a source patch or browser bundle merely to preserve old implementation details.

For runtime changes, `npm test` exercises the synthetic mechanical checks already supplied; select additional checks for the changed behavior rather than treating that suite as semantic authority. Through the composed real profile, observe explicit/default location success, optional-forecast degradation, visible bad-config failure and disable/reload cleanup against WEATHER-001–005. Avoid publishing real query/output fixtures. A documentation-only map update is verified with JSON and link checks and does not require a real query.

## Removal route

Remove only the local override for row `weather-tool`, then run:

```sh
DSH_CHECKOUT=/root/deepseek-harness DSH_PROFILE=web bash scripts/uninstall.sh
```

[Uninstall](../../scripts/uninstall.sh) removes package `dsh-weather-tool` through the same CLI selection and refuses a partial manual fallback when no CLI is available. It does not edit the override or delete credentials. Confirm the package is absent from profile resolution and Bundle membership and that a newly loaded profile exposes no stale `get_weather`. Preserve private keys and unrelated local configuration. On this deployment, an authorized activation uses `systemctl restart dsh-web`; a different profile uses its own managed service.

## Constraints and permissions

- QWeather account identity, credentials, private-key bytes and paths, default locations, queries, and captured results remain profile-local and outside Git.
- Missing or invalid required configuration fails during plugin load; do not silently register a non-working tool.
- Installation, restart, publication, and remote repository creation require user authority. The user authorized extraction and repository creation in the source record.
- Do not introduce a Harness source patch or a client bundle for this Host-only tool.
- STATE and real profile observations own behavior acceptance. Type checking, builds, and focused implementation checks are mechanical evidence only and do not independently accept the tool behavior.

## Non-goals

This package is not a general weather-provider abstraction, a browser weather panel, a credential manager, or a QWeather account provisioning tool. It does not persist query history or infer the user's location.

## Implementation hints

An import-free ESM entry can register a plain DSH tool definition and avoid unpublished Harness workspace dependencies. A profile bundle supplies the plugin identity while an id-targeted profile override supplies deployment configuration.

## Current reality and open tensions

The next target is DeepSeek Harness `dsh-v0.1.2-alpha.2` at revision `0a53fb55bea101816fa226bb964ae2bed71c343b`. The Host-only contribution still requires no Harness source patch or browser client. Candidate 1 binds historical source and deployment evidence for an earlier target and is not selected for this state. Alpha.2 linked-package resolution, profile-local override, composed configuration, explicit and default real queries, forecast degradation, lifecycle-owned registration, and credential-preserving uninstall remain unestablished by the retained evidence.
