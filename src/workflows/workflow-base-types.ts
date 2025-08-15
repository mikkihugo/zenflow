/**
 * @fileoverview Base Workflow Types - Foundation types without circular dependencies
 *
 * This file contains the core workflow types that are needed by multiple modules
 * without importing from workflow-engine.ts to avoid circular dependencies.
 *
 * These types are extracted from workflow-engine.ts to break the circular dependency:
 * workflow-gate-request.ts → domain-boundary-validator.ts → workflows/types.ts → workflows/workflow-engine.ts
 */

// Workflow gate types - unified definitions to avoid conflicts
export interface WorkflowGateRequest {
  readonly [key: string]: unknown;
  readonly id: string;
  readonly type: string;
  readonly workflowContext: unknown;
  readonly gateType: string;
  readonly context: unknown;
  readonly question?: string;
  readonly confidence?: number;
  readonly priority?: string;
  readonly validationReason?: string;
  readonly expectedImpact?: number;
}

export interface WorkflowGateResult {
  readonly [key: string]: unknown;
  readonly success: boolean;
  readonly gateId: string;
  readonly approved: boolean;
  readonly processingTime: number;
  readonly escalationLevel?: number;
  readonly decisionMaker?: string;
  readonly error?: Error;
  readonly correlationId?: string;
}

// ============================================================================
// CORE WORKFLOW TYPES
// ============================================================================

export interface WorkflowStep {
  readonly type: string;
  readonly name?: string;
  readonly params?: Record<string, unknown>;
  readonly timeout?: number;
  readonly retries?: number;
  readonly onError?: 'stop' | 'continue' | 'skip';
  readonly gateConfig?: {
    readonly enabled: boolean;
    readonly gateType?: 'approval' | 'checkpoint' | 'review' | 'decision';
    readonly businessImpact?: 'low' | 'medium' | 'high' | 'critical';
    readonly stakeholders?: string[];
    readonly autoApproval?: boolean;
  };
}

export interface WorkflowDefinition {
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly steps: readonly WorkflowStep[];
}

export interface WorkflowContext {
  readonly [key: string]: unknown;
}

export interface WorkflowState {
  readonly id: string;
  readonly definition: WorkflowDefinition;
  status:
    | 'pending'
    | 'running'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';
  readonly context: WorkflowContext;
  currentStep: number;
  readonly stepResults: Record<string, unknown>;
  readonly startTime: string;
  endTime?: string;
  error?: string;
  // Gate-aware execution state
  pendingGates?: Map<string, WorkflowGateRequest>;
  gateResults?: Map<string, WorkflowGateResult>;
  pausedForGate?: {
    stepIndex: number;
    gateId: string;
    pausedAt: string;
  };
}

export interface WorkflowEngineConfig {
  readonly maxConcurrentWorkflows?: number;
  readonly stepTimeout?: number;
  readonly persistWorkflows?: boolean;
  readonly persistencePath?: string;
  readonly retryAttempts?: number;
}

export interface DocumentContent {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
}

export interface StepExecutionResult {
  readonly success: boolean;
  readonly output?: unknown;
  readonly error?: string;
  readonly duration?: number;
}

export interface WorkflowData {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly data: Record<string, unknown>;
}
