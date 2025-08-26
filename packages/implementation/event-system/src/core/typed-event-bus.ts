/**
 * @file Typed Event Bus
 * 
 * Simple typed event bus implementation.
 */

import { EventEmitter } from '@claude-zen/foundation';

export interface TypedEventBusConfig {
  maxListeners?: number;
  enableLogging?: boolean;
}

/**
 * Typed event bus with type safety.
 */
export class TypedEventBus extends EventEmitter {
  private busConfig: TypedEventBusConfig;

  constructor(config: TypedEventBusConfig = {}) {
    super();
    this.busConfig = {
      maxListeners: 100,
      enableLogging: false,
      ...config,
    };
  }

  getConfig(): TypedEventBusConfig {
    return { ...this.busConfig };
  }
}

export default TypedEventBus;