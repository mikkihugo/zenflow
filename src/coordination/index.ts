/**
 * Coordination Module - Barrel Export.
 *
 * Central export point for swarm coordination functionality.
 */

// Export diagnostics
/**
 * @file coordination module exports
 */


export * from './diagnostics';

// Export core coordination components
export { Orchestrator } from './orchestrator';
// Export public API for external access
export * from './public-api';
export { ZenSwarmStrategy } from './strategies/ruv-swarm.strategy';
// Export SPARC methodology for swarm implementation
export * from './swarm/sparc/index';
export * from './types';
