# Event System Unification — Task Checklist

Purpose: unify event-driven behavior across services, bridge legacy/local emitters into the shared foundation EventBus, and expose flows to the DynamicEventRegistry and Web Dashboard.

Owner: TBD  |  Status: In progress  |  Target: next minor release

## 0) Validation and guardrails (run for each PR)
- [ ] pnpm install
- [ ] pnpm type-check (accepts pre-existing repo errors; focus on touched files)
- [ ] pnpm --filter @claude-zen/web-dashboard dev (dashboard boots in ~1s)
- [ ] pnpm build (NEVER CANCEL; completes in 5–6 minutes)

## 1) Bridge local-only emitters to the foundation EventBus
Context: Some services implement their own Map-based event systems and thus are invisible to DynamicEventRegistry metrics/flows.

- [ ] Create a small "bridge" module in each package that listens to local events and re-emits them on EventBus. Keep ZERO IMPORTS in the original files intact.
  - System Monitoring
    - Source: packages/services/system-monitoring/src/monitoring-event-driven.ts
    - [ ] New file: packages/services/system-monitoring/src/monitoring-event-bridge.ts
      - Subscribes to EventDrivenSystemMonitor.addEventListener
      - Re-emits on EventBus.getInstance() with cataloged names
      - Registers module via registerEventModule({ moduleId: 'system-monitoring', ... })
      - Sends periodic sendModuleHeartbeat('system-monitoring')
  - Agent Monitoring
    - Source: packages/services/agent-monitoring/src/intelligence-system-event-driven.ts
    - [ ] New file: packages/services/agent-monitoring/src/intelligence-system-bridge.ts
      - Same bridging responsibilities as above with moduleId: 'agent-monitoring'

Acceptance:
- [ ] DynamicEventRegistry.getActiveModules() lists both modules
- [ ] getEventFlows() shows system/agent monitoring events within 60s window

## 2) Wire Central WebSocket Hub to the EventBus
- Source: packages/services/coordination/src/events/websocket-hub.ts
- [ ] Implement setupEventSystemIntegration():
  - Subscribe to a bounded set of EventBus events (whitelist by prefix: 'registry:', 'system:', 'agent:', 'llm:') and broadcast via the hub to clients who subscribed to those messageTypes
  - Publish inbound hub messages (from services) back onto the EventBus with type-safe mapping
- [ ] Ensure broadcast() includes a unique id, timestamp, and type; keep existing filtering by connection subscriptions

Acceptance:
- [ ] When EventBus emits a whitelisted event, connected hub clients receive a matching message if subscribed

## 3) Bridge server sockets to/from EventBus
- Source: apps/claude-code-zen-server/src/index.ts (setupSocketSubscriptions)
- [ ] On subscribe: attach EventBus listeners for requested channels; forward events to the socket room
- [ ] On unsubscribe/disconnect: remove attached listeners
- [ ] Inbound client actions (optional, scoped): validate and emit to EventBus for internal consumers

Acceptance:
- [ ] Subscribing to 'system' causes live system:* EventBus events to appear to that client
- [ ] No listener leaks when clients disconnect

## 4) Normalize and extend EVENT_CATALOG
- Source: packages/core/foundation/src/events/event-catalog.ts
- [ ] Add/validate entries for:
  - 'system-monitoring:tracking-started'
  - 'system-monitoring:error'
  - 'agent-monitoring:health-update'
  - Any bridge-emitted event names from §1
- [ ] Use isValidEventName in bridges before emit; log via EventLogger on invalid

Acceptance:
- [ ] getAllEventNames() includes new names; DynamicEventRegistry.getDynamicEventCatalog() reflects flows

## 5) Repair TaskMaster event manager (broken file)
- Source: packages/services/coordination/src/taskmaster/safe/events/task-master-events.ts
- Issues: malformed code (string literals, commas, parentheses), incomplete lifecycle, inconsistent API
- [ ] Rewrite minimal viable event manager using foundation EventBus
  - Clean initialize/shutdown
  - Typed emit/handle
  - Optional persistence hooks behind flags
  - Robust error handling; no stray quotes/brackets

Acceptance:
- [ ] pnpm --filter @claude-zen/coordination type-check passes for this file

## 6) Documentation updates
- [ ] docs/EVENT_LOGGING_GUIDE.md: add a section on “Bridging Local Emitters to EventBus” with a small snippet and caveats about ZERO IMPORTS
- [ ] ARCHITECTURE.md: add note that services with internal emitters must provide an EventBus bridge to appear in metrics/dashboard

## 7) Telemetry and logging consistency
- [ ] Use EventLogger.log/ logFlow/ logError in bridges for dev visibility
- [ ] Ensure EventBus config (enableMetrics, maxListeners) is consistent in bridges

## 8) Rollout plan
- [ ] Phase 1: Bridges + catalog updates (no breaking changes)
- [ ] Phase 2: Hub + server wiring (feature flagged by env)
- [ ] Phase 3: Refactor internal emitters to optionally use EventBus directly (post-bridge stabilization)

## 9) Backout/Failure modes
- [ ] Feature flags to disable hub/server bridging if needed (ENV: ZEN_EVENT_HUB_BRIDGE=off)
- [ ] Bridges should fail-open: log errors, do not crash services

---

Notes:
- Respect domain boundaries; do not introduce cross-package tight coupling. Bridges should be thin adapters.
- Heavy compute must continue to route via WASM gateways; this effort only changes event plumbing.
- Prefer small PRs per package, each independently type-checked and validated against the web dashboard.
