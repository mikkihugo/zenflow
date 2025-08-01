/**
 * Memory System - Index
 * Exports for memory management components and storage backends
 */

// Core memory components
export { MemoryManager } from './manager';
export { EnhancedMemory as Memory, EnhancedMemory, EnhancedMemory as default } from './memory';

// Storage backends (migrated from plugins)
export { 
  BackendFactory,
  LanceDBBackend,
  SQLiteBackend,
  JSONBackend 
} from './backends';

// ✅ NEW: Memory System Consolidation - Phase 1 Complete
// Consolidated memory configuration system
export { 
  PATTERN_MEMORY_CONFIG,
  MemoryConfigUtils,
  getPatternMemoryConfig,
  calculateTotalMemoryUsage,
  getSharedMemoryPoolSize
} from './config';

// Consolidated WASM memory optimization
export {
  WasmMemoryPool,
  ProgressiveWasmLoader,
  WasmCompatibilityManager
} from './wasm-optimizer';

// Consolidated memory hooks system
export {
  MemoryHooks,
  createMemoryHooks
} from './hooks';

// Consolidated hive-mind memory system
export {
  HiveMindMemory,
  createHiveMindMemory
} from './hive-mind-memory';

// Re-export memory types
export type {
  CacheEntry,
  MemoryStats,
  QueryOptions,
  SessionState,
  VectorSearchResult,
} from './memory';

// Re-export backend types
export type {
  JSONValue,
  StorageResult,
  BackendStats,
  BackendConfig,
  BackendInterface
} from './backends';

// ✅ NEW: Re-export consolidated types
export type {
  PatternMemoryConfig,
  MemoryConfigOptions
} from './config';

export type {
  MemoryAllocation,
  MemoryPool,
  WasmModuleConfig,
  WasmCapabilities,
  LoaderStats
} from './wasm-optimizer';

export type {
  MemoryOperation,
  AgenticHookContext,
  HookHandlerResult,
  MemoryHookPayload,
  MemoryMetrics
} from './hooks';

export type {
  MemoryEntry,
  MemoryNamespace,
  MemoryPattern,
  MemorySearchOptions
} from './hive-mind-memory';

// Memory utilities
export const MemoryUtils = {
  /**
   * Create a memory backend by type
   */
  createBackend: (type: 'lancedb' | 'sqlite' | 'json', config: any) => {
    return BackendFactory.create({ type, ...config });
  },

  /**
   * Validate memory configuration
   */
  validateConfig: (config: any): boolean => {
    return Boolean(config && config.path);
  },

  /**
   * Get available backend types
   */
  getAvailableBackends: () => ['lancedb', 'sqlite', 'json']
};
