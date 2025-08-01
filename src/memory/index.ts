/**
 * Memory System - Index
 * Exports for memory management components
 */

// Core memory system (renamed from enhanced-memory)
export { EnhancedMemory as Memory, EnhancedMemory } from './memory';

// Memory manager (wrapper for existing systems)
export { MemoryManager } from './manager';

// Re-export types
export type {
  SessionState,
  CacheEntry,
  VectorSearchResult,
  QueryOptions,
  MemoryStats
} from './memory';

// Default export is the main Memory class
export { EnhancedMemory as default } from './memory';