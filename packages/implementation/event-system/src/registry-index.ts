/**
 * @file Registry Index
 * 
 * Simple registry index for the event system.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('RegistryIndex');

/**
 * Simple registry for managing indexed items.
 */
export class RegistryIndex<T = unknown> {
  private items = new Map<string, T>();

  register(key: string, item: T): void {
    this.items.set(key, item);
    logger.debug(`Item registered: ${key}`);
  }

  unregister(key: string): boolean {
    const result = this.items.delete(key);
    if (result) {
      logger.debug(`Item unregistered: ${key}`);
    }
    return result;
  }

  get(key: string): T | undefined {
    return this.items.get(key);
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  keys(): IterableIterator<string> {
    return this.items.keys();
  }

  values(): IterableIterator<T> {
    return this.items.values();
  }

  clear(): void {
    this.items.clear();
    logger.debug('Registry cleared');
  }
}