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
  static async createBasicMemory(
    config: {
      type?: 'sqlite' | 'memory';
      path?: string;
    } = {}
  ) {
    const { MemoryManager } = await import('./memory');

    const manager = new MemoryManager({
      backendConfig: {
        type: config.type||'sqlite',
        path: config.path||'./memory.db',
      },
    });

    await manager.initialize();
    return manager;
  }
}

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getMemorySystemAccess(
  config?: MemoryConfig
): Promise<any> {
  const manager = await SimpleMemoryFactory.createBasicMemory({
    type: (config?.backendConfig?.type as 'sqlite' | 'memory') || 'sqlite',
    path: config?.backendConfig?.path||'./memory.db',
  });

  return {
    createManager: (managerConfig?: MemoryConfig) =>
      SimpleMemoryFactory.createBasicMemory({
        type: managerConfig?.backendConfig?.type as 'sqlite' | 'memory',
        path: managerConfig?.backendConfig?.path,
      }),
    createStore: (storeId: string, options?: SessionMemoryStoreOptions) =>
      manager.createStore(storeId, options),
    getStore: (storeId: string) => manager.getStore(storeId),
    getAllStores: () => manager.getAllStores(),
    removeStore: (storeId: string) => manager.removeStore(storeId),
    getGlobalStats: () => manager.getGlobalStats(),
    shutdown: () => manager.shutdown(),
    isHealthy: () => manager.isHealthy(),
  };
}

export async function getMemoryManager(
  config?: MemoryConfig
): Promise<MemoryManager> {
  const { MemoryManager } = await import('./memory');
  const manager = new MemoryManager(
    config||{
      backendConfig: { type:'sqlite', path: './memory.db' },
    }
  );
  await manager.initialize();
  return manager;
}

export async function getMemoryStorage(
  storeId: string,
  config?: MemoryConfig
): Promise<any> {
  const system = await getMemorySystemAccess(config);
  const store = await system.createStore(storeId);
  return {
    store: (key: string, value: any, options?: StoreOptions) =>
      store.store(key, value, options),
    retrieve: (key: string) => store.retrieve(key),
    delete: (key: string) => store.delete(key),
    clear: () => store.clear(),
    keys: () => store.keys(),
    getStats: () => store.getStats(),
    close: () => store.close(),
  };
}

export async function getSessionMemory(
  sessionId: string,
  config?: MemoryConfig
): Promise<any> {
  const system = await getMemorySystemAccess(config);
  const sessionStore = await system.createStore(`session:${sessionId}`);
  return {
    save: (key: string, value: any) => sessionStore.store(key, value),
    load: (key: string) => sessionStore.retrieve(key),
    remove: (key: string) => sessionStore.delete(key),
    clearSession: () => sessionStore.clear(),
    listKeys: () => sessionStore.keys(),
    getSessionStats: () => sessionStore.getStats(),
  };
}

export async function getMemoryCoordination(
  config?: MemoryConfig
): Promise<any> {
  const system = await getMemorySystemAccess(config);
  return {
    coordinate: (storeId: string) => system.getStore(storeId),
    orchestrate: (operation: string, ...args: any[]) => {
      switch (operation) {
        case 'createStore':
          return system.createStore(args[0], args[1]);
        case 'removeStore':
          return system.removeStore(args[0]);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    },
    monitor: () => system.getGlobalStats(),
    health: () => system.isHealthy(),
  };
}

// Professional memory system object with proper naming (matches brainSystem pattern)
export const memorySystem = {
  getAccess: getMemorySystemAccess,
  getManager: getMemoryManager,
  getStorage: getMemoryStorage,
  getSession: getSessionMemory,
  getCoordination: getMemoryCoordination,
  createFactory: () => SimpleMemoryFactory,
  createManager: (config?: MemoryConfig) => getMemoryManager(config),
};
