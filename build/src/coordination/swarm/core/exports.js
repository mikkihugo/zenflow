/**
 * @file Swarm Core Exports.
 *
 * Re-exports for swarm core components to break circular dependencies.
 * This file should only contain re-exports, no implementations.
 */
export * from './base-swarm.ts';
export * from './daa-service.ts';
export * from './logger.ts';
export { PerformanceTracker } from './performance.ts';
// Re-export performance components separately to break cycles
export { PerformanceBenchmarks } from './performance-benchmarks.ts';
export * from './recovery-integration.ts';
export * from './schemas.ts';
export * from './session-integration.ts';
export * from './session-manager.ts';
export * from './session-utils.ts';
export * from './singleton-container.ts';
// Re-export core components (non-circular)
export * from './swarm-coordinator.ts';
export * from './topology-manager.ts';
// Re-export types and utilities
export * from './types.ts';
export * from './utils.ts';
// Note: performance-benchmarks and performance are exported by name
// to avoid circular dependencies with index.ts imports
