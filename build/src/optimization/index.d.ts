/**
 * Optimization Domain - Main Export Module
 *
 * @file Central export point for all optimization functionality including types,
 * performance optimization, neural optimization, and WASM acceleration. This module
 * serves as the single source of truth for all optimization operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
export * from './types.ts';
/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Optimization module legacy exports.
 */
export * from './benchmarks/performance-benchmarks.ts';
export * from './core/performance-optimizer.ts';
export * from './data/data-optimizer.ts';
export * from './interfaces/optimization-interfaces.ts';
export * from './monitoring/optimization-monitor.ts';
export * from './neural/neural-optimizer.ts';
export * from './swarm/swarm-optimizer.ts';
export * from './wasm/wasm-optimizer.ts';
//# sourceMappingURL=index.d.ts.map