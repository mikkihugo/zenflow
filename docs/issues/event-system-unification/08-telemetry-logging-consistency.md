# Telemetry & Logging Consistency

Goal
Standardize telemetry and logging across all event bridges and wired components to ensure coherent diagnostics in dev and minimal overhead in prod.

Scope
- Apply consistent EventBus configuration (enableMetrics, maxListeners)
- Use EventLogger for dev-only visibility; guard with env flag
- Ensure errors in bridges/hub/server wiring log and fail-open

Implementation Outline
- Bridges (system/agent):
  - Initialize EventBus.getInstance({ enableMetrics: true, maxListeners: 200 })
  - Use EventLogger.log/ logError around emits and invalid-name fallbacks
- WebSocket Hub wiring:
  - Wrap broadcast and inbound publish paths with EventLogger.logFlow
  - Log errors with EventLogger.logError and include connectionId
- Server sockets wiring:
  - Log subscribe/unsubscribe using EventLogger.log
  - On listener attach/detach, record logFlow('eventbus','socket',channel)
- Env flags:
  - CLAUDE_EVENT_LOGGING=true to force-enable EventLogger in all envs

Acceptance Criteria
- Dev runs emit readable logs for key bridge/hub/server wiring paths
- Prod runs show minimal/no logs unless CLAUDE_EVENT_LOGGING=true
- No unhandled exceptions in bridge/wiring code paths under load

Validation Commands
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (observe logs in dev)
- pnpm build

Notes
- Avoid noisy logs inside tight loops; log once per type or at interval
- Prefer structured payloads in logs; never log secrets