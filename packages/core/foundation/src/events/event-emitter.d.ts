/**
 * @file Fully Typed Event Emitter
 *
 * Complete EventEmitter replacement with full TypeScript typing.
 * Drop-in replacement for eventemitter3 with better performance and typing.
 */
import { EventEmitter as NodeEventEmitter } from 'events';
/**
 * Fully typed event map interface
 */
export interface EventMap {
  [key: string]: unknown[];
}
/**
 * Extract argument types from event map
 */
export type EventArgs<T extends EventMap, K extends keyof T> = T[K];
/**
 * Fully typed EventEmitter that's a complete drop-in replacement for eventemitter3.
 * Provides superior TypeScript typing and performance optimizations.
 *
 * Compatible with Node.js EventEmitter but with better typing.
 */
export declare class EventEmitter<
  T extends EventMap = EventMap,
> extends NodeEventEmitter {
  constructor(options?: { captureRejections?: boolean });
  /**
   * Typed emit method - supports both typed and untyped usage
   */
  emit<K extends keyof T>(event: K, ...args: EventArgs<T, K>): boolean;
  emit(event: string | symbol, ...args: unknown[]): boolean;
  /**
   * Typed on method - supports both typed and untyped usage
   */
  on(event: string | symbol, listener: (...args: unknown[]) => void): this;
  /**
   * Typed once method - supports both typed and untyped usage
   */
  once(event: string | symbol, listener: (...args: unknown[]) => void): this;
  /**
   * Typed off method - supports both typed and untyped usage
   */
  off(event: string | symbol, listener: (...args: unknown[]) => void): this;
  /**
   * Typed removeListener method - supports both typed and untyped usage
   */
  removeListener(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): this;
  /**
   * Typed listeners method - supports both typed and untyped usage
   */
  listeners(event: string | symbol): ((...args: unknown[]) => void)[];
  /**
   * Typed listenerCount method - supports both typed and untyped usage
   */
  listenerCount(event: string | symbol): number;
}
export default EventEmitter;
//# sourceMappingURL=event-emitter.d.ts.map
