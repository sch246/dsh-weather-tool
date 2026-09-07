# Weather tool intent

Status: user-grounded draft with an alpha.2 installation route and pending acceptance evidence. Earlier candidate and deployment evidence is historical; the retained records do not establish an installed and verified realization against `dsh-v0.1.2-alpha.2`.

## Map entry

Use the [installation and maintenance route](#installation-and-maintenance-route) and [removal route](#removal-route) for the selected deployment. The existing protocol 0.2 selection remains unchanged.

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

The Host-only runtime package is [`packages/dsh-weather-tool`](../../packages/dsh-weather-tool/package.json), with its [Bundle](../../packages/dsh-weather-tool/cordis.patch.yml) and [runtime](../../packages/dsh-weather-tool/index.mjs). The root is a private development workspace; `.intent/`, AGENTS, scripts, and tests remain there. It has no generated client catalog, browser build, or Harness source patch.

From the repository root, `node scripts/plugin.mjs setup` and `node scripts/plugin.mjs inspect` report local paths and missing environment values without invoking DSH or mutating a profile. For an authorized install, select all three target values explicitly:

```sh
export DSH_CHECKOUT=/absolute/path/to/deepseek-harness
export DSH_HOME=/absolute/path/to/dsh-home
export DSH_PROFILE=web
node scripts/plugin.mjs setup --install
```

The checkout must contain `apps/cli/lib/bin.js`; Home must be an existing absolute directory. [Setup](../../scripts/plugin.mjs) calls this built CLI directly with `plugin --profile "$DSH_PROFILE" add <absolute-repository>/packages/dsh-weather-tool`. It does not provision QWeather, supply configuration, query weather, build Harness, or restart a service. `bash scripts/setup.sh --install` is an equivalent wrapper; Windows can use the Node entry after setting the same environment variables.

Existing profile dependencies linked to the repository root must be re-registered from `packages/dsh-weather-tool` before this revision is activated. Preserve the local override and credentials. Verify the profile dependency, lockfile, resolved package link and Bundle membership together; ensure no second `get_weather` owner remains. No root forwarding runtime is provided.

Supply an id-targeted `weather-tool` override in that profile's local `cordis.patch.yml` using the [configuration example](../../README.md#install). Required fields are `apiHost` (hostname without scheme/path), `keyId`, `projectId`, `privateKeyFile` (Ed25519) and `defaultLocation`; optional `timeoutMs` defaults to 15000 and must be at least 1000. Use an absolute private-key path readable by the service account. Configure before the next load because the shipped empty config deliberately fails at load. Retain the real values only in the profile and private evidence.

Check dependency, profile lockfile, resolved link, Bundle membership and composed override together. A registered package with missing configuration is not an installed working tool. If CLI or tool-definition APIs change upstream, inspect current bundle loading, tool output and disposer APIs and adapt this small Host entry. Do not introduce a source patch or browser bundle merely to preserve old implementation details.

For runtime changes, `node --test` exercises the synthetic mechanical checks already supplied; select additional checks for the changed behavior rather than treating that suite as semantic authority. Through the composed real profile, observe explicit/default location success, optional-forecast degradation, visible bad-config failure and disable/reload cleanup against WEATHER-001–005. Avoid publishing real query/output fixtures. A documentation-only map update is verified with JSON and link checks and does not require a real query.

## Removal route

Remove only the local override for row `weather-tool`, then use the same explicit `DSH_CHECKOUT`, `DSH_HOME`, and `DSH_PROFILE` values:

```sh
node scripts/plugin.mjs remove --remove
```

The operation calls the selected built CLI with `plugin --profile "$DSH_PROFILE" remove dsh-weather-tool`. Without `--remove`, the command only inspects. [Remove](../../scripts/remove.sh) and the retained [uninstall alias](../../scripts/uninstall.sh) require the same flag. The CLI owns package and Bundle removal; scripts do not edit overrides or delete credentials. Confirm the package is absent from profile resolution and Bundle membership and that a newly loaded profile exposes no stale `get_weather`. Preserve private keys and unrelated local configuration. Activate through the selected profile's managed service only when separately authorized.

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

Default inspection compares the selected profile dependency with its exact root lock importer, checks the installed package realpath and identity and the Bundle count, and reports any patch receipt summary. Installation consistency and matching this candidate package path are separate observations. Missing target variables report not-inspected; the lock reader uses the selected checkout CLI's installed js-yaml dependency.
