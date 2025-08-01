/**
 * Memory Manager - System memory management
 *
 * Uses the existing memory.ts as the implementation.
 */

import { EnhancedMemory } from './memory';

export class MemoryManager extends EnhancedMemory {
  constructor(config?: any, logger?: any, eventBus?: any) {
    super(config || {});
  }

  async initialize(): Promise<void> {
    // Initialize the enhanced memory system
    return Promise.resolve();
  }

  async store(key: string, data: any): Promise<void> {
    return super.store('default', key, data);
  }

  async retrieve(key: string): Promise<any> {
    return super.retrieve('default', key);
  }
}
