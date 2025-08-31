# Bridge System Monitoring to EventBus

Goal
Bridge packages/services/system-monitoring/src/monitoring-event-driven.ts (local Map-based emitter) to the shared foundation EventBus so events appear in DynamicEventRegistry and the Web Dashboard.

Scope
- New file: packages/services/system-monitoring/src/monitoring-event-bridge.ts
- No changes to monitoring-event-driven.ts (ZERO IMPORTS rule maintained)
- Module registration + heartbeat
- Re-emit relevant system-monitoring:* events onto EventBus

Implementation Outline
- Import from @claude-zen/foundation: EventBus, registerEventModule, sendModuleHeartbeat, EventLogger, isValidEventName (EVENT_CATALOG helpers)
- Create EventDrivenSystemMonitorBridge that:
  - Accepts an EventDrivenSystemMonitor instance
  - Registers moduleId: system-monitoring
  - Subscribes to monitor.addEventListener for:
    - 'system-monitoring:tracking-started'
    - 'system-monitoring:error'
    - Any other emitted events found in file
  - Validates event names via isValidEventName; if invalid, log and prefix with 'system-monitoring:'
  - Emits via EventBus.getInstance().emit(eventName, payload)
  - Starts a heartbeat interval sending sendModuleHeartbeat('system-monitoring', { uptime, ... })
  - Provides stop() to clear intervals and remove listeners

Acceptance Criteria
- DynamicEventRegistry.getActiveModules() includes system-monitoring within 5s of start
- getEventFlows('system-monitoring:*') shows flows within 60s
- Web Dashboard receives real-time updates when subscribed

Validation Commands
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (verify events visible)
- pnpm build (do not cancel)

Notes
- Use EventLogger.log/ logError for visibility in dev
- Do not import foundation inside monitoring-event-driven.ts
- Keep bridge minimal and resilient (fail-open)
