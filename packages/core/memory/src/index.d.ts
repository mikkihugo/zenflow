/**
 * @fileoverview Memory Domain - Clean TypeScript Structure
 *
 * Comprehensive memory system with proper TypeScript standards organization.
 * Follows TypeScript best practices for package structure and naming.
 */
export type { MemoryStore, MemoryStats, StoreOptions, MemoryConfig, SessionState, SessionMemoryStoreOptions, CacheEntry, MemoryBackendType, MemoryError, MemoryConnectionError, MemoryStorageError, MemoryCapacityError, CoordinationConfig, MemoryEventType, MemoryNodeInfo, CacheEvictionConfig, OptimizationConfig, OptimizationMetrics, LifecycleConfig, PerformanceConfig, TuningRecommendation, StrategyMetrics, } from './types';
interface MemorySystemInterface {
    store: (key: string, value: unknown) => Promise<void>;
    retrieve: (key: string) => Promise<unknown>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    size: () => Promise<number>;
    health: () => Promise<boolean>;
    shutdown: () => Promise<void>;
}
export { MemoryErrorCode, MemoryError, MemoryCoordinationError, MemoryBackendError, MemoryDataError, MemoryPerformanceError, MemoryErrorClassifier, } from './errors';
export { EventEmitter } from '@claude-zen/foundation';
export { BaseMemoryBackend, FoundationAdapter, DatabaseBackedAdapter, // NEW:Proper database integration
MemoryBackendFactory, } from './adapters';
export type { BackendCapabilities, MemoryEntry, DatabaseMemoryConfig, } from './adapters';
export { SessionMemoryStore, SafeMemoryStore, ContextStore } from './stores';
export { MemoryCoordinationSystem, MemoryCoordinator, MemorySystemManager, MemoryLoadBalancer, MemoryHealthMonitor, } from './coordination';
export { MemoryMonitor } from './monitoring';
export { CacheEvictionStrategy, MemoryOptimizationEngine, DataLifecycleManager, PerformanceTuningStrategy, SwarmKnowledgeExtractor, } from './strategies';
export { MemoryProviders } from './providers/memory-providers';
export { MemoryController } from './controllers/memory-controller';
/**
 * Factory for creating memory system components
 */
export declare class MemoryFactory {
    /**
     * Create a database-backed memory manager (RECOMMENDED)
     * Uses the database package following correct architecture
     */
    static createDatabaseBackedManager(config?: {
        type?: 'sqlite' | 'memory';
        database?: string;
    }): Promise<unknown>;
    /**
     * Create a basic memory manager with standard configuration
     * @deprecated ARCHITECTURAL VIOLATION:Use createDatabaseBackedManager instead.
     * This method violates architecture by using memory's internal backend implementations
     * instead of the database package. The correct pattern is memory -> database package.
     */
    static createManager(config?: {
        type?: 'sqlite' | 'memory';
        path?: string;
    }): Promise<MemorySystemInterface>;
    /**
     * Create a session store
     */
    static createSessionStore(sessionId: string, options?: unknown): Promise<unknown>;
    /**
     * Create a safe memory store
     */
    static createSafeStore(config?: unknown): Promise<unknown>;
    /**
     * Create a context store
     */
    static createContextStore(config?: unknown): Promise<unknown>;
}
/**
 * Get database-backed memory system (RECOMMENDED)
 * Uses proper architecture with database package
 */
export declare function getDatabaseBackedMemorySystem(config?: {
    type?: 'sqlite' | 'memory';
    database?: string;
}): Promise<unknown>;
/**
 * Get comprehensive memory system access
 * @deprecated ARCHITECTURAL VIOLATION:Use getDatabaseBackedMemorySystem instead.
 * This function violates architecture by using memory's internal implementations
 * instead of the database package. The correct pattern is memory -> database package.
 */
export declare function getMemorySystem(config?: unknown): Promise<unknown>;
/**
 * Get session-specific memory access
 */
export declare function getSessionMemory(sessionId: string, config?: unknown): Promise<unknown>;
/**
 * Get coordination system access
 */
export declare function getMemoryCoordination(config?: unknown): Promise<unknown>;
/**
 * Main memory system object with professional naming conventions
 */
export declare const memorySystem: {
    factory: typeof MemoryFactory;
    create: typeof MemoryFactory.createManager;
    getSystem: typeof getMemorySystem;
    getSession: typeof getSessionMemory;
    getCoordination: typeof getMemoryCoordination;
    createSessionStore: typeof MemoryFactory.createSessionStore;
    createSafeStore: typeof MemoryFactory.createSafeStore;
    createContextStore: typeof MemoryFactory.createContextStore;
};
export default memorySystem;
//# sourceMappingURL=index.d.ts.map