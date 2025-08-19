/**
 * @fileoverview Memory Domain - Working Components Only
 * 
 * Minimal, working memory package exports for stable TypeScript compilation.
 */

// ===================================================================
// CORE TYPES (WORKING)
// ===================================================================

// Core memory types from types.ts
export type {
  MemoryStore,
  MemoryStats,
  StoreOptions,
  MemoryConfig,
  SessionState,
  SessionMemoryStoreOptions,
  CacheEntry,
  MemoryBackendType,
  MemoryError,
  MemoryConnectionError,
  MemoryStorageError,
  MemoryCapacityError,
} from './types';

// Core system types  
export type { JSONValue, BackendInterface } from './core/memory-system';

// ===================================================================
// BACKEND SYSTEM (WORKING)
// ===================================================================

// Base backend and capabilities
export { BaseMemoryBackend } from './backends/base-backend';
export type { BackendCapabilities, MemoryEntry } from './backends/base-backend';

// Backend factory - excluded from compilation for now
// export { MemoryBackendFactory, memoryBackendFactory } from './backends/factory';

// ===================================================================
// CORE FUNCTIONALITY (WORKING)
// ===================================================================

// Main memory classes - only export if working
export { MemoryManager, SessionMemoryStore } from './memory';

// Alias for compatibility
export { MemoryManager as MemorySystem } from './memory';

// ===================================================================
// SIMPLE FACTORY
// ===================================================================

/**
 * Simple factory for creating basic memory systems.
 */
export class SimpleMemoryFactory {
  /**
   * Create a basic memory manager.
   */
  static async createBasicMemory(config: {
    type?: 'sqlite' | 'memory';
    path?: string;
  } = {}) {
    const { MemoryManager } = await import('./memory');
    
    const manager = new MemoryManager({
      backendConfig: {
        type: config.type || 'sqlite',
        path: config.path || './memory.db',
      },
    });
    
    await manager.initialize();
    return manager;
  }
}