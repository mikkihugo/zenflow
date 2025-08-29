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
  validateGate(gateId: string, context: unknown): Promise<boolean>;
  executeGate(gateId: string, context: unknown): Promise<unknown>;
  getGateStatus(gateId: string): Promise<string>;
  listGates(): Promise<string[]>;
}
/**
 * Workflow Gate Request Interface.
 */
export interface WorkflowGateRequest {
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
  status : 'approved| rejected| pending' | ' error')  result?:unknown;';
  message?:string;
  timestamp: number;
}
/**
 * Workflow Gate Configuration.
 */
export interface WorkflowGateConfig {
  id: string;
  name: string;
  description?:string;
  type : 'validation| approval| condition' | ' transform')  rules: Array<{';
    condition: string;
    action : 'allow' | ' deny'|' require_approval')    message?:string;';
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
export function createWorkflowGateRequest(
  gateId: string,
  workflowId: string,
  stepId: string,
  context: Record<string, unknown>,
  options?:Partial<Pick<WorkflowGateRequest,'priority| metadata'>>';
):WorkflowGateRequest {
  return {
    gateId,
    workflowId,
    stepId,
    context,
    priority: options?.priority||medium,
    timestamp: Date.now(),
    metadata: options?.metadata,
};)};;
/**
 * Factory function for creating workflow gate responses.
 */
export function createWorkflowGateResponse(
  request: WorkflowGateRequest,
  status: WorkflowGateResponse['status'],';
  options?:Partial<Pick<WorkflowGateResponse,'result' | ' message'>>';
):WorkflowGateResponse {
  return {
    gateId: request.gateId,
    workflowId: request.workflowId,
    stepId: request.stepId,
    status,
    result: options?.result,
    message: options?.message,
    timestamp: Date.now(),
};)};;
