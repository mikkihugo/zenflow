/**
 * @fileoverview Memory Domain - Working Components Only
 *
 * Minimal, working memory package exports for stable TypeScript compilation.
 */
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
export type { JSONValue, BackendInterface } from './core/memory-system';
export { BaseMemoryBackend } from './backends/base-backend';
export type { BackendCapabilities, MemoryEntry } from './backends/base-backend';
export { MemoryManager, SessionMemoryStore } from './memory';
export { MemoryManager as MemorySystem } from './memory';
/**
 * Simple factory for creating basic memory systems.
 */
export declare class SimpleMemoryFactory {
  /**
   * Create a basic memory manager.
   */
  static createBasicMemory(config?: {
    type?: 'sqlite' | 'memory';
    path?: string;
  }): Promise<import('./memory').MemoryManager>;
}
export declare function getMemorySystemAccess(
  config?: MemoryConfig
): Promise<any>;
export declare function getMemoryManager(
  config?: MemoryConfig
): Promise<MemoryManager>;
export declare function getMemoryStorage(
  storeId: string,
  config?: MemoryConfig
): Promise<any>;
export declare function getSessionMemory(
  sessionId: string,
  config?: MemoryConfig
): Promise<any>;
export declare function getMemoryCoordination(
  config?: MemoryConfig
): Promise<any>;
export declare const memorySystem: {
  getAccess: typeof getMemorySystemAccess;
  getManager: typeof getMemoryManager;
  getStorage: typeof getMemoryStorage;
  getSession: typeof getSessionMemory;
  getCoordination: typeof getMemoryCoordination;
  createFactory: () => typeof SimpleMemoryFactory;
  createManager: (config?: MemoryConfig) => Promise<MemoryManager>;
};
//# sourceMappingURL=index.d.ts.map
