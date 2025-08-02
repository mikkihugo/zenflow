/**
 * Memory Module - Barrel Export
 *
 * Central export point for memory management functionality
 */

// Types (re-export shared types for convenience)
export type {
  MemoryEntry,
  MemoryProvider,
  StorageProvider,
} from '../types/shared-types';
// Core memory components
export { MemoryManager } from './manager';
// Shared memory systems
export * from './shared-memory-manager';
// Memory stores
export * from './stores/lancedb-store';
export * from './stores/pg-store';
export * from './stores/redis-store';
// Tracking systems
export * from './tracking/memory-tracker';
export * from './tracking/pattern-tracker';
