/**
 * @fileoverview Temporary stub for @claude-zen/intelligence/types
 *
 * This file provides fallback types for @claude-zen/intelligence/types submodule.
 */

// Workflow types stub
export interface WorkflowExecutionContext {
  workflowId: string;
  stepId?: string;
  data?: Record<string, any>;
}

export interface WorkflowStepResult {
  stepId: string;
  success: boolean;
  output?: any;
  error?: string;
  timestamp: number;
}

export interface WorkflowMetadata {
  workflowId: string;
  name: string;
  version: string;
  status: 'pending | running' | 'completed | failed' | 'paused';
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  version?: string;
  timeout?: number;
}

export interface WorkflowGateConfig {
  gateId: string;
  workflowId: string;
  stepId: string;
  approvalRequired?: boolean;
  timeout?: number;
}

// Re-export common types
export type {
  WorkflowExecutionContext,
  WorkflowStepResult,
  WorkflowMetadata,
  WorkflowConfig,
  WorkflowGateConfig,
};
