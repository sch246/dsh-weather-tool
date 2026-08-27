# Weather tool extraction cutover evidence

Record ID: `SRC-2026-08-27-WEATHER-TOOL-EXTRACTION-CUTOVER-EVIDENCE`

Status: bounded implementation and deployment evidence. It does not accept or seal a realization lock.

The extracted import-free package passes six tests covering config validation, Ed25519 JWT signing, authenticated request construction, current-weather formatting, forecast degradation, default-location selection, and lifecycle-owned registration. Protocol 0.2 structural validation and the package dry run also pass.

The Web profile now loads `weather-tool` from the linked `dsh-weather-tool` bundle and supplies deployment values through an id-targeted local override. The old profile-local executable was moved to recoverable trash after the composed configuration stopped referencing it. The managed Web service restarted without an error, returned HTTP 200, and the new repository entry completed a real current-conditions and three-day-forecast query.

No real API host, account identifier, credential, key path, default location, query location, or captured response belongs in this record or the repository. Those facts remain local deployment inputs and evidence.
