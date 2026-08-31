# State authority and runtime acceptance

Record ID: `SRC-2026-09-01-WEATHER-STATE-AUTHORITY`

Status: user-authorized acceptance clarification. It changes how the package distinguishes semantic acceptance from mechanical evidence; it does not change the desired weather capability.

The user established STATE as the behavior authority and rejected code tests as an independent statement of intended behavior. Weather acceptance must therefore be observed through the composed profile, real tool results, visible configuration failures, and plugin lifecycle. Type checking, builds, and focused implementation checks may still detect mechanical defects, but they do not accept the product behavior or become a second semantic authority.
