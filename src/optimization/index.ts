/**
 * Optimization Domain - Main Export Module
 *
 * @file Central export point for all optimization functionality including types,
 * performance optimization, neural optimization, and WASM acceleration. This module 
 * serves as the single source of truth for all optimization operations and type definitions.
 * 
 * Following domain architecture standard with consolidated types.
 */

// Export all optimization types (Single Source of Truth)
export * from './types';

/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Optimization module legacy exports.
 */

export * from './benchmarks/performance-benchmarks';
export * from './core/performance-optimizer';
export * from './data/data-optimizer';
export * from './interfaces/optimization-interfaces';
export * from './monitoring/optimization-monitor';
export * from './neural/neural-optimizer';
export * from './swarm/swarm-optimizer';
export * from './wasm/wasm-optimizer';
