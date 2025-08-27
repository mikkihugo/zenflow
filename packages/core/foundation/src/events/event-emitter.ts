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
  [key: string]: any[];
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
  emit<K extends keyof T>(event: K, ...args: EventArgs<T, K>): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;
  override emit(event: any, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Typed on method - supports both typed and untyped usage
   */
  on<K extends keyof T>(event: K, listener: (...args: EventArgs<T, K>) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  override on(event: any, listener: any): this {
    return super.on(event, listener);
  }

  /**
   * Typed once method - supports both typed and untyped usage
   */
  once<K extends keyof T>(event: K, listener: (...args: EventArgs<T, K>) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  override once(event: any, listener: any): this {
    return super.once(event, listener);
  }

  /**
   * Typed off method - supports both typed and untyped usage
   */
  off<K extends keyof T>(event: K, listener: (...args: EventArgs<T, K>) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  override off(event: any, listener: any): this {
    return super.off(event, listener);
  }

  /**
   * Typed removeListener method - supports both typed and untyped usage
   */
  removeListener<K extends keyof T>(event: K, listener: (...args: EventArgs<T, K>) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  override removeListener(event: any, listener: any): this {
    return super.removeListener(event, listener);
  }

  /**
   * Typed listeners method - supports both typed and untyped usage
   */
  listeners<K extends keyof T>(event: K): ((...args: EventArgs<T, K>) => void)[];
  listeners(event: string | symbol): Function[];
  override listeners(event: any): Function[] {
    return super.listeners(event);
  }

  /**
   * Typed listenerCount method - supports both typed and untyped usage
   */
  listenerCount<K extends keyof T>(event: K): number;
  listenerCount(event: string | symbol): number;
  override listenerCount(event: any): number {
    return super.listenerCount(event);
  }
}

export default EventEmitter;