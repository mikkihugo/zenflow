/**
 * @fileoverview MOVED: Workflow Engine - Now in Workflows Domain
 *
 * This file provides compatibility by re-exporting from the workflows domain.
 * All workflow functionality has been consolidated in /workflows/ for clean architecture.
 *
 * MIGRATION PATH:
 * - OLD: import {WorkflowEngine} from '../core/workflow-engine.ts';
 * - NEW: import {WorkflowEngine} from '../workflows';
 *
 * This compatibility layer will be removed in a future version.
 */

// Re-export types for backward compatibility
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from '../workflows/workflow-engine.ts';
// Re-export everything from the unified workflows domain
// Create default export for backward compatibility
export {
  WorkflowEngine,
  WorkflowEngine as default,
} from '../workflows/workflow-engine.ts';
