# Documentation Updates — Bridging Local Emitters

Goal
Update docs to guide contributors on bridging local, zero-import emitters to the shared foundation EventBus while preserving domain boundaries.

Scope
- docs/EVENT_LOGGING_GUIDE.md: Add a “Bridging Local Emitters to EventBus” section with code snippet patterns
- ARCHITECTURE.md: Clarify that services with internal emitters must provide a bridge to appear in DynamicEventRegistry and the dashboard
- Optional: docs/ARCHITECTURE-FIX-ADR-WORKFLOW.md: Add ADR entry for event system unification

Implementation Outline
- Provide a minimal bridge example showing:
  - Module registration (registerEventModule)
  - addEventListener hooks from local emitter
  - isValidEventName guard and EventLogger usage
  - EventBus.getInstance().emit()
  - sendModuleHeartbeat interval
- Note on ZERO IMPORTS policy for original service files
- Add validation checklist with the core commands

Acceptance Criteria
- New sections exist with accurate code examples and cautions
- Links from related docs point to the new sections

Validation Commands
- pnpm type-check (docs only; ensure examples compile if included in ts snippets)
- pnpm --filter @claude-zen/web-dashboard dev (confirm behavior matches docs)

Notes
- Keep snippets concise and implementation-agnostic
- Emphasize fail-open error handling