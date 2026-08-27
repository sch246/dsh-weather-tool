# Extract the weather tool without deployment identity

Record ID: `SRC-2026-08-27-WEATHER-TOOL-EXTRACTION-AND-PRIVACY`

Status: user-authorized repository extraction and publication boundary. This record does not accept a realization lock.

The user requested extracting the working profile-local weather query into a small plugin repository and explicitly required that personal information not be committed. Investigation confirmed that the existing implementation queried QWeather current conditions and a three-day forecast, accepted an optional location, used a configured default, and loaded an Ed25519 private key at startup.

The existing profile combined reusable code with account-specific API identity, a private-key path, and a precise default location. The reusable behavior may move into the repository; all deployment values, real query locations, credentials, captured responses, and profile patch bytes remain outside Git. Examples use non-runnable placeholders and synthetic test data.

The extracted package should install as a Host-only DSH bundle without modifying Harness source. Registration must follow the plugin lifecycle, missing configuration must fail at load, and the profile-local single-file execution path should be removed after the linked package passes tests and a real deployment check.
