# Repair TaskMaster Event Manager (Safe)

Goal
Fix packages/services/coordination/src/taskmaster/safe/events/task-master-events.ts so it compiles, uses the foundation EventBus cleanly, and exposes a minimal, typed API.

Scope
- Clean up malformed code (quotes, commas, parentheses)
- Implement initialize()/shutdown() lifecycle with proper resource cleanup
- Provide typed emit()/on()/off() wrappers around EventBus
- Keep optional persistence/telemetry behind feature flags

Implementation Outline
- Replace ad-hoc EventEmitter usage with foundation EventBus.getInstance()
- Define TaskMasterEventMap (minimal set for current needs)
- API:
  - async initialize(config): create store/telemetry if enabled
  - async shutdown(): close subsystems and remove listeners
  - async emit(type, data): validate -> persist (if enabled) -> eventBus.emitSafe
  - on(type, handler) / off(type, handler): delegate to EventBus
- Error handling: use EventLogger.logError, never throw across boundaries

Acceptance Criteria
- pnpm --filter @claude-zen/coordination type-check passes for the file
- Core event paths (emit/on) operate via EventBus
- No dangling listeners on shutdown

Validation Commands
- pnpm install
- pnpm --filter @claude-zen/coordination type-check
- pnpm build

Notes
- Keep the surface area minimal; expand event map incrementally as needed
- Add TODOs for persistence adapter and telemetry manager integration