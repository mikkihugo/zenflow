# Rollout & Feature Flags

Goal
Deploy event-system unification changes safely with phased rollout and feature flags for quick backout.

Scope
- Introduce environment flags to control bridges and wiring
- Document rollout phases and owner checks
- Provide backout instructions

Implementation Outline
- Feature flags (env):
  - ZEN_EVENT_HUB_BRIDGE=on|off (default: on)
  - ZEN_EVENT_SERVER_SOCKET_BRIDGE=on|off (default: on)
  - CLAUDE_EVENT_LOGGING=true|false (default: false)
- Phase plan:
  - Phase 1: Enable bridges (system/agent) + catalog updates in staging
  - Phase 2: Enable hub/server wiring in staging, then production
  - Phase 3: Optional refactor of internal emitters to use EventBus directly
- Backout:
  - Set flags off; redeploy
  - Revert last PRs if needed (no schema changes involved)

Acceptance Criteria
- Flags present in config and honored by bridges/hub/server wiring
- Disabling flags removes EventBus<->websocket coupling without service crashes

Validation Commands
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (toggle flags and observe)
- pnpm build

Notes
- Keep defaults conservative for production
- Ensure flags are read once at init and cached (avoid per-event env checks)