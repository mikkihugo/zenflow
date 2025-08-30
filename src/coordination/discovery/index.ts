/**
 * @fileoverview Domain Discovery Module
 *
 * Exports neural domain mapping functionality for domain relationship analysis.
 * Implements the GNN-based domain discovery documented in the architecture.
 */

export { NeuralDomainMapper } from './neural-domain-mapper.js';
export type * from './types.js';
export { testNeuralDomainMapper } from './test-neural-domain-mapper.js';

// Re-export for convenience
export type {
  Domain,
  DependencyGraph,
  DomainRelationshipMap,
  DomainRelationship,
  TopologyRecommendation,
} from './neural-domain-mapper.js';
