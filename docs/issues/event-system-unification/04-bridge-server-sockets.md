# Bridge Server Sockets to/from EventBus

Goal
Bridge apps/claude-code-zen-server/src/index.ts Socket.IO channels to the foundation EventBus for publish/subscribe parity with the rest of the platform.

Scope
- Update setupSocketSubscriptions():
  - On subscribe: attach EventBus listeners by channel; forward to socket rooms
  - On unsubscribe/disconnect: remove listeners
  - Optional: accept client publishes; validate and emit to EventBus
- Avoid memory leaks and respect domain boundaries

Implementation Outline
- Imports: EventBus, isValidEventName, EventLogger from @claude-zen/foundation
- Maintain a Map<socketId, Map<channel, listener>> to track attached listeners per client
- For server-initiated initial emits, keep current behavior; add live forwarding from EventBus
- Validate inbound publish payloads; only allow whitelisted prefixes ('system:', 'registry:', 'agent:', 'llm:')

Acceptance Criteria
- Subscribing to 'system' streams system:* EventBus events to that client
- Unsubscribing/disconnect removes listeners (no leaks)
- Errors are logged with EventLogger, server remains stable

Validation Commands
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (connect client, verify events)
- pnpm build

Notes
- Keep changes localized to setupSocketSubscriptions to minimize risk
- Feature flag optional: ZEN_EVENT_SERVER_SOCKET_BRIDGE=on/off