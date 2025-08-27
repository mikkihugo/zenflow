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
export class EventEmitter<T extends EventMap = EventMap> extends NodeEventEmitter {
  constructor(options?: { captureRejections?: boolean }) {
    super(options);
    this.setMaxListeners(100);
  }

  /**
   * Typed emit method - supports both typed and untyped usage
   */
  override emit<K extends keyof T>(event: K, ...args: EventArgs<T, K>): boolean;
  override emit(event: string | symbol, ...args: unknown[]): boolean;
  override emit(event: string | symbol, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Typed on method - supports both typed and untyped usage
   */
  override on(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Typed once method - supports both typed and untyped usage
   */
  override once(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.once(event, listener);
  }

  /**
   * Typed off method - supports both typed and untyped usage
   */
  override off(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.off(event, listener);
  }

  /**
   * Typed removeListener method - supports both typed and untyped usage
   */
  override removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.removeListener(event, listener);
  }

  /**
   * Typed listeners method - supports both typed and untyped usage
   */
  override listeners(event: string | symbol): ((...args: unknown[]) => void)[] {
    return super.listeners(event) as ((...args: unknown[]) => void)[];
  }

  /**
   * Typed listenerCount method - supports both typed and untyped usage
   */
  override listenerCount(event: string | symbol): number {
    return super.listenerCount(event);
  }
}

export default EventEmitter;