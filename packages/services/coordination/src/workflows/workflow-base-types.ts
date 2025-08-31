/**
 * @fileoverview Base Workflow Types - Foundation types without circular dependencies
 *
 * This file contains the core workflow types that are needed by multiple modules
 * without import.*from.* to avoid circular dependencies.
 *
 * These types are extracted from workflow-engine.ts to break the circular dependency: * workflow-gate-request.ts → domain-boundary-validator.ts → workflows/types.ts → workflows/workflow-engine.ts
 */
// Workflow gate types - unified definitions to avoid conflicts
export interface WorkflowGateRequest {}
export interface WorkflowGateResult {}
// ============================================================================
// CORE WORKFLOW TYPES
// ============================================================================
export interface WorkflowStep {};
}
export interface WorkflowDefinition {}
export interface WorkflowContext {}
export interface WorkflowState {};
}
export interface WorkflowEngineConfig {}
export interface DocumentContent {}
export interface StepExecutionResult {}
export interface WorkflowData {};