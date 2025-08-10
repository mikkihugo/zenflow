/**
 * @file Swarm Core Exports.
 * 
 * Re-exports for swarm core components to break circular dependencies.
 * This file should only contain re-exports, no implementations.
 */

// Re-export core components (non-circular)
export * from './swarm-coordinator';
export * from './session-manager';
export * from './session-integration';
export * from './schemas';
export * from './logger';
export * from './singleton-container';
export * from './base-swarm';
export * from './recovery-integration';
export * from './topology-manager';
export * from './session-utils';
export * from './daa-service';

// Re-export performance components separately to break cycles
export { PerformanceBenchmarks } from './performance-benchmarks';
export { PerformanceTracker } from './performance';

// Re-export types and utilities
export * from './types';
export * from './utils';

// Note: performance-benchmarks and performance are exported by name
// to avoid circular dependencies with index.ts imports