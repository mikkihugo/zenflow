# Normalize and Extend EVENT_CATALOG

Goal
Ensure all bridge-emitted events are represented in packages/core/foundation/src/events/event-catalog.ts and validated with helpers, enabling registry metrics and IDE typings.

Scope
- Add missing entries for system and agent monitoring bridges
- Verify existing coordination/dspy events are covered
- Export updated types if needed and keep backward compatibility

Implementation Outline
- Update EVENT_CATALOG with:
  - 'system-monitoring:tracking-started'
  - 'system-monitoring:error'
  - 'agent-monitoring:health-update'
  - Any additional names used by bridges (01/02)
- Add corresponding TypeScript interfaces if they carry structured payloads
- Use isValidEventName in bridges to guard emissions; log invalid via EventLogger

Acceptance Criteria
- getAllEventNames() returns new entries
- DynamicEventRegistry.getDynamicEventCatalog() shows flows/types for new events
- Type-check succeeds for updated catalog exports

Validation Commands
- pnpm install
- pnpm --filter @claude-zen/foundation type-check
- pnpm --filter @claude-zen/web-dashboard dev (confirm catalog visible if surfaced)
- pnpm build

Notes
- Keep payload interfaces minimal but explicit (no any)
- Avoid breaking existing event keys