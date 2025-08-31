/**
 * Workflow Coordination Types - Break Circular Dependencies
 *
 * Shared types between workflows and coordination domains to eliminate
 * the circular import chain.
 */
/**
 * Workflow Gates Manager Interface.
 */
export interface WorkflowGatesManager {
  validateGate(): void {
  gateId: string;
  workflowId: string;
  stepId: string;
  context: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  metadata?:Record<string, unknown>;
}
/**
 * Workflow Gate Response Interface.
 */
export interface WorkflowGateResponse {
  gateId: string;
  workflowId: string;
  stepId: string;
  status : 'approved| rejected| pending' | ' error');
  message?:string;
  timestamp: number;
}
/**
 * Workflow Gate Configuration.
 */
export interface WorkflowGateConfig {
  id: string;
}>;
  timeout?:number;
  retryPolicy?:  {
    maxRetries: number;
    backoffMs: number;
};
}
/**
 * Workflow Coordination Context.
 */
export interface WorkflowCoordinationContext {
  workflowId: string;
  currentStep: string;
  previousSteps: string[];
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
  timestamp: number;
}
/**
 * Factory function for creating workflow gate requests.
 */
export function createWorkflowGateRequest(): void {
  return {
    gateId,
    workflowId,
    stepId,
    context,
    priority: options?.priority||medium,
    timestamp: Date.now(): void {
  return {
    gateId: request.gateId,
    workflowId: request.workflowId,
    stepId: request.stepId,
    status,
    result: options?.result,
    message: options?.message,
    timestamp: Date.now(),
};)};
