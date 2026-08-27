# Candidate 1 lifecycle boundary

`scripts/setup.sh` registers the repository as the `dsh-weather-tool` bundle in a selected profile. The bundle owns the `weather-tool` row and runtime registration; an id-targeted profile patch owns all deployment configuration.

`scripts/uninstall.sh` removes only the bundle registration. The operator removes or retains the unmatched local configuration separately, and neither lifecycle script reads, copies, rewrites, prints, or deletes the private key.

The original profile-local executable left the active configuration graph and was moved to recoverable trash after the linked row appeared in composed config. Harness source is not modified.
