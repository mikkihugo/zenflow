/**
 * @fileoverview Saga Management System
 * 
 * Distributed transaction management and correlation tracking for event-driven workflows
 * across brain, document intelligence, and coordination packages.
 */

// Core saga and correlation exports
export * from './correlation-tracker.js';
export * from './workflow-sagas.js';

// Re-export key types and functions
export type {
  CorrelationContext,
  CorrelatedEvent,
  SagaWorkflow,
  SagaStep,
  SagaState
} from './correlation-tracker.js';

export {
  createCorrelationContext,
  createChildCorrelation,
  correlateEvent,
  extractCorrelationContext,
  globalSagaManager,
  SagaWorkflowManager
} from './correlation-tracker.js';