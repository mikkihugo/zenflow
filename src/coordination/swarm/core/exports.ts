/**
 * @file Swarm Core Exports.
 *
 * Re-exports for swarm core components to break circular dependencies.
 * This file should only contain re-exports, no implementations.
 */

export * from './base-swarm';
export * from './daa-service';
export * from './logger';
export { PerformanceTracker } from './performance';
// Re-export performance components separately to break cycles
export { PerformanceBenchmarks } from './performance-benchmarks';
export * from './recovery-integration';
export * from './schemas';
export * from './session-integration';
export * from './session-manager';
export * from './session-utils';
export * from './singleton-container';
// Re-export core components (non-circular)
export * from './swarm-coordinator';
export * from './topology-manager';

// Re-export types and utilities
export * from './types';
export * from './utils';

// Note: performance-benchmarks and performance are exported by name
// to avoid circular dependencies with index.ts imports
