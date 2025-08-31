# Bridge Agent Monitoring to EventBus

Goal
Bridge packages/services/agent-monitoring/src/intelligence-system-event-driven.ts (local Map-based emitter) to the shared foundation EventBus so events appear in DynamicEventRegistry and the Web Dashboard.

Scope
- New file: packages/services/agent-monitoring/src/intelligence-system-bridge.ts
- No changes to intelligence-system-event-driven.ts (ZERO IMPORTS rule maintained)
- Module registration + heartbeat
- Re-emit relevant agent-monitoring:* events onto EventBus

Implementation Outline
- Import from @claude-zen/foundation: EventBus, registerEventModule, sendModuleHeartbeat, EventLogger, isValidEventName
- Create AgentMonitoringBridge that:
  - Accepts an EventDrivenIntelligenceSystem instance
  - Registers moduleId: agent-monitoring
  - Subscribes to addEventListener for emitted events (e.g., 'agent-monitoring:health-update', performance updates, errors)
  - Validates event names; log invalid via EventLogger and normalize with 'agent-monitoring:' prefix
  - Emits via EventBus.getInstance().emit(eventName, payload)
  - Starts heartbeat interval via sendModuleHeartbeat('agent-monitoring', metadata)
  - stop(): cleanup listeners and intervals

Acceptance Criteria
- DynamicEventRegistry shows module and recent flows within 60s
- Web Dashboard receives live agent monitoring updates

Validation Commands
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev
- pnpm build

Notes
- Fail-open on errors; avoid throwing across package boundaries
- Keep bridge minimal and dependency-light