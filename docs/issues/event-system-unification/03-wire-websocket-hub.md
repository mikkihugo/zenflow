# Wire Central WebSocket Hub to EventBus

Goal
Integrate packages/services/coordination/src/events/websocket-hub.ts with the foundation EventBus so events can be broadcast to websocket clients and inbound messages can be published into the event system.

Scope
- Implement setupEventSystemIntegration()
- Subscribe to a safe whitelist of EventBus event prefixes and broadcast to subscribed connections
- Publish validated inbound messages to EventBus
- Add optional feature flag ZEN_EVENT_HUB_BRIDGE to enable/disable bridging at runtime

Implementation Outline
- Imports from @claude-zen/foundation: EventBus, isValidEventName, EventLogger
- In initialize(): call setupEventSystemIntegration() when flag is on (default on)
- setupEventSystemIntegration():
  - Get EventBus.getInstance()
  - Define whitelist prefixes: ['registry:', 'system:', 'agent:', 'llm:']
  - eventBus.on('*', (payload) => { if name startsWith any prefix -> this.broadcast('eventbus', { type: name, data: payload }) })
  - Guard broadcast with per-connection subscriptions (existing logic)
- In handleMessage(): for messages of type 'publish', validate message.event and forward to eventBus.emitSafe(message.event, message.payload)
- Ensure broadcast messages carry id, timestamp, source, and type

Acceptance Criteria
- With ZEN_EVENT_HUB_BRIDGE not set or set to 'on', hub clients that subscribed to messageTypes receive EventBus events matching the whitelist
- Inbound 'publish' messages from a client/service result in an EventBus emission when event name is valid
- No runtime errors with no clients connected

Validation Commands
- pnpm install
- pnpm type-check
- pnpm --filter @claude-zen/web-dashboard dev (connect a client; observe events)
- pnpm build

Notes
- Fail-open: log and continue on bridge errors
- Do not broadcast non-whitelisted events
- Rate-limit or debounce if message volume becomes high (future work)
