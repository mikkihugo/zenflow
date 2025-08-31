/**
 * @fileoverview Base Workflow Types - Foundation types without circular dependencies
 *
 * This file contains the core workflow types that are needed by multiple modules
 * without import.*from.* to avoid circular dependencies.
 *
 * These types are extracted from workflow-engine.ts to break the circular dependency: * workflow-gate-request.ts → domain-boundary-validator.ts → workflows/types.ts → workflows/workflow-engine.ts
 */
// Workflow gate types - unified definitions to avoid conflicts
export interface WorkflowGateRequest {
  id: string;
}
export interface WorkflowGateResult {
  readonly [key: string]: unknown;
  readonly success: boolean;
  readonly gateId: string;
  readonly approved: boolean;
  readonly processingTime: number;
  readonly escalationLevel?:number;
  readonly decisionMaker?:string;
  readonly error?:Error;
  readonly correlationId?:string;
  // Enhanced properties for workflow-engine compatibility
  readonly feedback?:string;
  readonly timestamp?:Date;
  readonly result?:any;
  readonly processor?:string;
}
// ============================================================================
// CORE WORKFLOW TYPES
// ============================================================================
export interface WorkflowStep {
  readonly id?:string;
  readonly type: string;
  readonly name?:string;
  readonly params?:Record<string, unknown>;
  readonly timeout?:number;
  readonly retries?:number;
  readonly onError?: 'stop' | 'continue' | 'skip';
  readonly gateConfig?:  {
    readonly enabled: boolean;
    readonly gateType?: 'approval' | 'checkpoint' | 'review' | 'decision';
    readonly businessImpact?: 'low' | 'medium' | 'high' | 'critical';
    readonly stakeholders?: string[];
    readonly autoApproval?:boolean;
};
}
export interface WorkflowDefinition {
  readonly name: string;
  readonly description?:string;
  readonly version?:string;
  readonly steps: readonly WorkflowStep[];
}
export interface WorkflowContext {
  readonly [key: string]: unknown;
}
export interface WorkflowState {
  id: string;
}
export interface DocumentContent {
  id: string;
}
export interface StepExecutionResult {
  readonly success: boolean;
  readonly output?:unknown;
  readonly error?:string;
  readonly duration?:number;
}
export interface WorkflowData {
  id: string;
};