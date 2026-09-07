# Package workspace and explicit deployment selection

Date: 2026-09-07

The runtime package moves to `packages/dsh-weather-tool` with its existing name, version, ESM source, Bundle identity, and MIT copyright. The repository root owns development scripts and intent records. Root package forwarding and implicit installation routes are absent; default operations inspect local paths, while installation/removal require explicit flags and checkout, Home, and profile selection. Existing root package links require re-registration from the package directory before activation.

This candidate changes repository layout and maintenance routes. No dependency installation, live profile operation, SSH/weather request, Host edit, service restart, or publication is part of this change. Syntax checks and existing tests establish local mechanical evidence only; deployment acceptance remains separate.

Local verification ran `node --check packages/dsh-weather-tool/index.mjs`, `node --check scripts/plugin.mjs`, `node --test` (6 passing tests), and `git diff --check`. A temporary fake CLI check verified default inspection without invocation, rejection of invalid flags/target variables, explicit add/remove arguments (including paths with spaces), and child exit-code propagation. Byte comparisons confirmed unchanged runtime source and identical root/package licenses; current README/STATE local links and JSON parsed successfully.

The selected protocol lock path in STATE is absent from this local repository. Its selection and retained historical locks remain unchanged; this candidate does not assert protocol or deployment acceptance.

Default inspection now reads the selected profile manifest, the exact root importer dependency in pnpm-lock.yaml, the installed package realpath and identity, Bundle count, and any package patch receipt summary. It reports installed, missing, inconsistent or not-inspected independently of candidate-path matching. The YAML reader reuses the selected checkout CLI's existing js-yaml dependency. Only Node syntax checks were run for this follow-up; no runtime artifacts or deployment records changed.
