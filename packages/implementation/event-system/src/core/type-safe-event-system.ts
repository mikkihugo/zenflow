/**
 * @file Type-Safe Event System
 * 
 * Simple type-safe event system implementation.
 */

import { EventEmitter } from '@claude-zen/foundation';


export interface TypedEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  id: string;
}

/**
 * Type-safe event system.
 */
export class TypeSafeEventSystem<TEventMap extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
  
  emitTyped<K extends keyof TEventMap>(eventType: K, payload: TEventMap[K]): boolean {
    return this.emit(String(eventType), payload);
  }

  onTyped<K extends keyof TEventMap>(eventType: K, listener: (payload: TEventMap[K]) => void): this {
    return this.on(String(eventType), listener as (data: unknown) => void);
  }

  offTyped<K extends keyof TEventMap>(eventType: K, listener: (payload: TEventMap[K]) => void): this {
    return this.off(String(eventType), listener as (data: unknown) => void);
  }
}