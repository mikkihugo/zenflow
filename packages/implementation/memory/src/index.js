/**
 * @fileoverview Memory Domain - Working Components Only
 *
 * Minimal, working memory package exports for stable TypeScript compilation.
 */
// ===================================================================
// BACKEND SYSTEM (WORKING)
// ===================================================================
// Base backend and capabilities
export { BaseMemoryBackend } from './backends/base-backend';
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
    static async createBasicMemory(config = {}) {
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
// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================
export async function getMemorySystemAccess(config) {
    const manager = await SimpleMemoryFactory.createBasicMemory({
        type: config?.backendConfig?.type || 'sqlite',
        path: config?.backendConfig?.path || './memory.db'
    });
    return {
        createManager: (managerConfig) => SimpleMemoryFactory.createBasicMemory({
            type: managerConfig?.backendConfig?.type,
            path: managerConfig?.backendConfig?.path
        }),
        createStore: (storeId, options) => manager.createStore(storeId, options),
        getStore: (storeId) => manager.getStore(storeId),
        getAllStores: () => manager.getAllStores(),
        removeStore: (storeId) => manager.removeStore(storeId),
        getGlobalStats: () => manager.getGlobalStats(),
        shutdown: () => manager.shutdown(),
        isHealthy: () => manager.isHealthy()
    };
}
export async function getMemoryManager(config) {
    const { MemoryManager } = await import('./memory');
    const manager = new MemoryManager(config || {
        backendConfig: { type: 'sqlite', path: './memory.db' }
    });
    await manager.initialize();
    return manager;
}
export async function getMemoryStorage(storeId, config) {
    const system = await getMemorySystemAccess(config);
    const store = await system.createStore(storeId);
    return {
        store: (key, value, options) => store.store(key, value, options),
        retrieve: (key) => store.retrieve(key),
        delete: (key) => store.delete(key),
        clear: () => store.clear(),
        keys: () => store.keys(),
        getStats: () => store.getStats(),
        close: () => store.close()
    };
}
export async function getSessionMemory(sessionId, config) {
    const system = await getMemorySystemAccess(config);
    const sessionStore = await system.createStore(`session:${sessionId}`);
    return {
        save: (key, value) => sessionStore.store(key, value),
        load: (key) => sessionStore.retrieve(key),
        remove: (key) => sessionStore.delete(key),
        clearSession: () => sessionStore.clear(),
        listKeys: () => sessionStore.keys(),
        getSessionStats: () => sessionStore.getStats()
    };
}
export async function getMemoryCoordination(config) {
    const system = await getMemorySystemAccess(config);
    return {
        coordinate: (storeId) => system.getStore(storeId),
        orchestrate: (operation, ...args) => {
            switch (operation) {
                case 'createStore': return system.createStore(args[0], args[1]);
                case 'removeStore': return system.removeStore(args[0]);
                default: throw new Error(`Unknown operation: ${operation}`);
            }
        },
        monitor: () => system.getGlobalStats(),
        health: () => system.isHealthy()
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
    createManager: (config) => getMemoryManager(config)
};
