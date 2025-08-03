/**
 * Topology Manager for Swarm Core
 * Re-exports the advanced topology manager for swarm coordination
 */

export { TopologyManager as default } from '../../protocols/topology/topology-manager.ts';
export * from '../../protocols/topology/topology-manager.ts';

// Additional re-export for direct access
export { TopologyManager } from '../../protocols/topology/topology-manager.ts';