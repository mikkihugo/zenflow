/**
 * @fileoverview Memory Domain - Clean TypeScript Structure
 * 
 * Comprehensive memory system with proper TypeScript standards organization.
 * Follows TypeScript best practices for package structure and naming.
 */

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================

export type {
  // Core memory interfaces
  MemoryStore,
  MemoryStats,
  StoreOptions,
  MemoryConfig,
  SessionState,
  SessionMemoryStoreOptions,
  CacheEntry,
  MemoryBackendType,
  
  // Error types
  MemoryError,
  MemoryConnectionError,
  MemoryStorageError,
  MemoryCapacityError,
  
  // Coordination types
  CoordinationConfig,
  MemoryEventType,
  MemoryNodeInfo,
  
  // Strategy types
  CacheEvictionConfig,
  OptimizationConfig,
  OptimizationMetrics,
  LifecycleConfig,
  PerformanceConfig,
  TuningRecommendation,
  StrategyMetrics,
} from './types';

// Define proper return types for memory system functions
interface MemorySystemInterface {
  store:(key: string, value:unknown) => Promise<void>;
  retrieve:(key: string) => Promise<unknown>;
  delete:(key: string) => Promise<boolean>;
  clear:() => Promise<void>;
  size:() => Promise<number>;
  health:() => Promise<boolean>;
  shutdown:() => Promise<void>;
}

// ===================================================================
// ERROR HANDLING
// ===================================================================

export {
  // Error classes and enums
  MemoryErrorCode,
  MemoryError,
  MemoryCoordinationError,
  MemoryBackendError,
  MemoryDataError,
  MemoryPerformanceError,
  MemoryErrorClassifier,
} from './errors';

// ===================================================================
// EVENT SYSTEM - Using foundation EventEmitter
// ===================================================================

// Re-export EventEmitter from foundation instead of local events
export { EventEmitter } from '@claude-zen/foundation';

// ===================================================================
// ADAPTERS (Backend Implementations)
// ===================================================================

export {
  BaseMemoryBackend,
  FoundationAdapter,
  DatabaseBackedAdapter,  // NEW:Proper database integration
  MemoryBackendFactory,
} from './adapters';

export type {
  BackendCapabilities,
  MemoryEntry,
  DatabaseMemoryConfig,  // NEW:Database-backed config
} from './adapters';

// ===================================================================
// STORES (Data Management)
// ===================================================================

export {
  SessionMemoryStore,
  SafeMemoryStore,
  ContextStore,
} from './stores';

// ===================================================================
// COORDINATION SYSTEM
// ===================================================================

export {
  MemoryCoordinationSystem,
  MemoryCoordinator,
  MemorySystemManager,
  MemoryLoadBalancer,
  MemoryHealthMonitor,
} from './coordination';

// ===================================================================
// MONITORING
// ===================================================================

export {
  MemoryMonitor,
} from './monitoring';

// ===================================================================
// STRATEGIES (Optimization)
// ===================================================================

export {
  CacheEvictionStrategy,
  MemoryOptimizationEngine,
  DataLifecycleManager,
  PerformanceTuningStrategy,
  SwarmKnowledgeExtractor,
} from './strategies';

// ===================================================================
// PROVIDERS (Integration)
// ===================================================================

export {
  MemoryProviders,
} from './providers/memory-providers';

// ===================================================================
// CONTROLLERS (API)
// ===================================================================

export {
  MemoryController,
} from './controllers/memory-controller';

// ===================================================================
// FACTORY AND UTILITIES
// ===================================================================

const DEFAULT_DATABASE_TYPE = 'sqlite';
const DEFAULT_DATABASE_PATH = DEFAULT_DATABASE_PATH;

/**
 * Factory for creating memory system components
 */
export class MemoryFactory {
  /**
   * Create a database-backed memory manager (RECOMMENDED)
   * Uses the database package following correct architecture
   */
  static async createDatabaseBackedManager(config:{
    type?:'sqlite' | 'memory';
    database?:string;
} = {}):Promise<unknown> {
    const { MemoryBackendFactory: memoryBackendFactory } = await import('./adapters');
    const factory = memoryBackendFactory.getInstance();
    
    return factory.createDatabaseBackend({
      type:config.type || DEFAULT_DATABASE_TYPE,      database:config.database || DEFAULT_DATABASE_PATH,});
}

  /**
   * Create a basic memory manager with standard configuration
   * @deprecated ARCHITECTURAL VIOLATION:Use createDatabaseBackedManager instead. 
   * This method violates architecture by using memory's internal backend implementations
   * instead of the database package. The correct pattern is memory -> database package.
   */
  static async createManager(config:{
    type?:'sqlite' | 'memory';
    path?:string;
} = {}):Promise<MemorySystemInterface> {
    const { MemoryCoordinationSystem: memoryCoordinationSystem } = await import('./coordination');

    const system = new memoryCoordinationSystem({
      backendConfig:{
        type:config.type || DEFAULT_DATABASE_TYPE,        path:config.path || DEFAULT_DATABASE_PATH,},
});

    await system.initialize();
    return system;
}

  /**
   * Create a session store
   */
  static async createSessionStore(sessionId:string, options?:unknown): Promise<unknown> {
    const { SessionMemoryStore: sessionMemoryStore } = await import('./stores/session-store');
    return new sessionMemoryStore(sessionId, options);
}

  /**
   * Create a safe memory store
   */
  static async createSafeStore(config?:unknown): Promise<unknown> {
    const { SafeMemoryStore: safeMemoryStore } = await import('./stores/safe-store');
    return new safeMemoryStore(config);
}

  /**
   * Create a context store
   */
  static async createContextStore(config?:unknown): Promise<unknown> {
    const { ContextStore: contextStore } = await import('./stores/context-store');
    return new contextStore(config);
}
}

// ===================================================================
// PROFESSIONAL API ACCESS
// ===================================================================

/**
 * Get database-backed memory system (RECOMMENDED)
 * Uses proper architecture with database package
 */
export async function getDatabaseBackedMemorySystem(config?:{
  type?:'sqlite' | 'memory';
  database?:string;
}):Promise<unknown> {
  const adapter = await MemoryFactory.createDatabaseBackedManager({
    type:config?.type || DEFAULT_DATABASE_TYPE,    database:config?.database || DEFAULT_DATABASE_PATH,});

  return {
    store:(key: string, value:unknown) => adapter.store(key, value),
    retrieve:(key: string) => adapter.retrieve(key),
    delete:(key: string) => adapter.delete(key),
    clear:() => adapter.clear(),
    size:() => adapter.size(),
    health:() => adapter.health(),
    shutdown:() => adapter.shutdown(),
    getCapabilities:() => adapter.getCapabilities(),
    getConfig:() => adapter.getConfig(),
};
}

/**
 * Get comprehensive memory system access
 * @deprecated ARCHITECTURAL VIOLATION:Use getDatabaseBackedMemorySystem instead.
 * This function violates architecture by using memory's internal implementations
 * instead of the database package. The correct pattern is memory -> database package.
 */
export async function getMemorySystem(config?:unknown): Promise<unknown> {
  const manager = await MemoryFactory.createManager({
    type:config?.backendConfig?.type as 'sqlite' | 'memory',    path:config?.backendConfig?.path,
});

  return {
    createSessionStore:(sessionId: string, options?:unknown) =>
      MemoryFactory.createSessionStore(sessionId, options),
    createSafeStore:(config?: unknown) =>
      MemoryFactory.createSafeStore(config),
    createContextStore:(config?: unknown) =>
      MemoryFactory.createContextStore(config),
    getCoordination:() => manager,
    getMonitoring:async () => {
      const { MemoryMonitor: memoryMonitor } = await import('./monitoring/monitor');
      return new memoryMonitor();
},
    getStrategies:async () => await import('./strategies'),
    shutdown:() => manager.shutdown?.(),
    health:() => manager.isHealthy?.(),
};
}

/**
 * Get session-specific memory access
 */
export async function getSessionMemory(
  sessionId:string,
  config?:unknown
):Promise<unknown> {
  const sessionStore = await MemoryFactory.createSessionStore(sessionId, config);
  
  return {
    store:(key: string, value:unknown) => sessionStore.store?.(key, value),
    retrieve:(key: string) => sessionStore.retrieve?.(key),
    delete:(key: string) => sessionStore.delete?.(key),
    clear:() => sessionStore.clear?.(),
    keys:() => sessionStore.keys?.(),
    stats:() => sessionStore.getStats?.(),
};
}

/**
 * Get coordination system access
 */
export async function getMemoryCoordination(config?:unknown): Promise<unknown> {
  const { MemoryCoordinationSystem: memoryCoordinationSystem } = await import('./coordination');
  const coordination = new memoryCoordinationSystem(config);
  
  await coordination.initialize?.();
  
  return {
    coordinate:(operation: string, ...args:unknown[]) => 
      coordination.coordinate?.(operation, ...args),
    monitor:() => coordination.getHealth?.(),
    events:() => coordination.getEventSystem?.(),
    loadBalance:() => coordination.getLoadBalancer?.(),
};
}

// ===================================================================
// MAIN EXPORT OBJECT
// ===================================================================

/**
 * Main memory system object with professional naming conventions
 */
export const memorySystem = {
  // Factory methods
  factory:MemoryFactory,
  create:MemoryFactory.createManager,
  
  // System access
  getSystem:getMemorySystem,
  getSession:getSessionMemory,
  getCoordination:getMemoryCoordination,
  
  // Component creation
  createSessionStore:MemoryFactory.createSessionStore,
  createSafeStore:MemoryFactory.createSafeStore,
  createContextStore:MemoryFactory.createContextStore,
};

// ===================================================================
// DEFAULT EXPORT
// ===================================================================

export default memorySystem;