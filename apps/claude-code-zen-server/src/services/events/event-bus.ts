import { EventBus } from '@claude-zen/foundation';

// Typed event map for the server. Extend with concrete events as they stabilize.
export interface AppEvents {
  [event: string]: unknown;
}

export type AppEventBus = EventBus<AppEvents>;

export function getEventBus(): AppEventBus {
  // Use the foundation EventBus singleton
  return EventBus.getInstance<AppEvents>({ enableMiddleware: true, enableMetrics: true });
}

export type CorrelatedPayload<T = unknown> = T & { correlationId?: string };