/**
 * Coordination Module - Barrel Export.
 *
 * Central export point for swarm coordination functionality.
 */

// Export diagnostics
/**
 * @file Coordination module exports.
 */

export * from './diagnostics/index.js';

// Export core coordination components
export { Orchestrator } from './orchestrator.ts';
// Export public API for external access
export * from './public-api.ts';
export { ZenSwarmStrategy } from './strategies/zen-swarm.strategy.ts';
// Export SPARC methodology for swarm implementation
export * from './swarm/sparc/index.ts';
export * from './types.ts';
