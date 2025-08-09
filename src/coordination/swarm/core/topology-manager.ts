/**
 * Topology Manager for Swarm Core.
 * Re-exports the advanced topology manager for swarm coordination.
 */
/**
 * @file topology management system
 */



export * from '../protocols/topology/topology-manager';
// Additional re-export for direct access
export {
  TopologyManager as default,
  TopologyManager,
} from '../protocols/topology/topology-manager';
