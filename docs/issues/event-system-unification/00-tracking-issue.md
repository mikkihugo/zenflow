# Event System Unification — Tracking Issue

Goal
Track end-to-end unification of event systems across Zenflow. This issue aggregates sub-issues and acceptance criteria.

Sub-Issues
- [ ] 01 — Bridge System Monitoring to EventBus (docs/issues/event-system-unification/01-bridge-system-monitoring.md)
- [ ] 02 — Bridge Agent Monitoring to EventBus (docs/issues/event-system-unification/02-bridge-agent-monitoring.md)
- [ ] 03 — Wire Central WebSocket Hub to EventBus (docs/issues/event-system-unification/03-wire-websocket-hub.md)
- [ ] 04 — Bridge Server Sockets to/from EventBus (docs/issues/event-system-unification/04-bridge-server-sockets.md)
- [ ] 05 — Normalize and Extend EVENT_CATALOG (docs/issues/event-system-unification/05-update-event-catalog.md)
- [ ] 06 — Repair TaskMaster Event Manager (docs/issues/event-system-unification/06-repair-taskmaster-event-manager.md)
- [ ] 07 — Documentation Updates (docs/issues/event-system-unification/07-docs-update-bridging.md)
- [ ] 08 — Telemetry & Logging Consistency (docs/issues/event-system-unification/08-telemetry-logging-consistency.md)
- [ ] 09 — Rollout & Feature Flags (docs/issues/event-system-unification/09-rollout-feature-flags.md)

Milestones
- Phase 1: Bridges + Catalog (01, 02, 05)
- Phase 2: Hub + Server Wiring (03, 04)
- Phase 3: Docs/Telemetry/Flags + follow-ups (07, 08, 09)

Validation (apply per merged PR)
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (confirm real-time events)
- pnpm build (never cancel)
