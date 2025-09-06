/**
 * @fileoverview Coordination Helpers and Utilities
 * 
 * Event coordination helpers for seamless integration between brain, document intelligence,
 * and coordination packages using foundation's event registry system.
 */

// Event coordination utilities
export * from './event-coordinator.js';
export * from './workflow-orchestrator.js';

// Re-export key coordination types and functions
export type {
  EventCoordinationRequest,
  EventCoordinationResponse,
  WorkflowOrchestratorConfig,
  CrossPackageWorkflow
} from './event-coordinator.js';