import { EventBus } from '@claude-zen/foundation';

// Typed event map for the server. Extend with concrete events as they stabilize.
export interface AppEvents {
  [event: string]: unknown;
}

export type AppEventBus = EventBus<AppEvents>;

export function getEventBus(): AppEventBus {
  // foundationEventBus is unused
  if (typeof foundationEventBus.getInstance !== 'function') {
    throw new Error('Foundation EventBus.getInstance() is required but not available');
  }
  return foundationEventBus.getInstance() as AppEventBus;
}

export type CorrelatedPayload<T = unknown> = T & { correlationId?: string };