
export interface WorkflowStep {
  id?: string;
  type: string;
  name?: string;
  params?: Record<string, unknown>;
  retries?: number;
  timeout?: number;
  output?: string;
  onError?: 'stop' | 'continue' | 'skip';
}
export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
  description?: string;
  version?: string;
}
export interface WorkflowContext {
  [key: string]: unknown;
}
export interface DocumentContent {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}
export interface StepExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
}
export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  version?: string;
  data: Record<string, unknown>;
}
export interface WorkflowState {
  id: string;
  definition: WorkflowDefinition;
  status:|'pending|running|paused|completed|failed|cancelled;
  context: WorkflowContext;
  currentStep: number;
  steps: WorkflowStep[];
  stepResults: Record<string, unknown>;
  completedSteps: Array<{
    index: number;
    step: WorkflowStep;
    result: unknown;
    duration: number;
    timestamp: string;
  }>;
  startTime: string;
  endTime?: string;
  pausedAt?: string;
  error?: string;
}
export interface WorkflowEngineConfig {
  maxConcurrentWorkflows?: number;
  persistWorkflows?: boolean;
  persistencePath?: string;
  stepTimeout?: number;
  retryDelay?: number;
  enableVisualization?: boolean;
  enableAdvancedOrchestration?: boolean;
}
export declare class WorkflowEngine extends TypedEventBase3 {
  private config;
  private activeWorkflows;
  private workflowMetrics;
  private workflowDefinitions;
  private stepHandlers;
  private isInitialized;
  private kvStore;
  private workflowStateMachines;
  private scheduledTasks;
  memory?: any;
  private documentManager?;
  private documentWorkflows;
  constructor(
    config?: WorkflowEngineConfig,
    documentManager?: any,
    memoryFactory?: any
  );
  initialize(): Promise<void>;
  private createWorkflowStateMachine;
  private registerBuiltInHandlers;
  registerStepHandler(
    type: string,
    handler: (context: WorkflowContext, params: unknown) => Promise<unknown>
  ): void;
  executeStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown>;
  private evaluateCondition;
  private getContextValue;
  private applyTransformation;
  private loadPersistedWorkflows;
  private saveWorkflow;
  registerWorkflowDefinition(
    name: string,
    definition: WorkflowDefinition
  ): Promise<void>;
  createWorkflow(definition: WorkflowDefinition): Promise<string>;
  startWorkflow(
    workflowDefinitionOrName: string | WorkflowDefinition,
    context?: WorkflowContext
  ): Promise<{
    success: boolean;
    workflowId?: string;
    error?: string;
  }>;
  executeWorkflow(workflow: WorkflowState): Promise<void>;
  private executeWorkflowStep;
  getWorkflowStatus(workflowId: string): Promise<unknown>;
  pauseWorkflow(workflowId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  resumeWorkflow(workflowId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  cancelWorkflow(workflowId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  getActiveWorkflows(): Promise<any[]>;
  getWorkflowHistory(limit?: number): Promise<WorkflowState[]>;
  getWorkflowMetrics(): Promise<unknown>;
  generateWorkflowVisualization(workflow: WorkflowState): string | null;
  /**
   * Generate advanced Mermaid visualization with state transitions
   */
  generateAdvancedVisualization(_workflow: WorkflowState): string | null;
  /**
   * Schedule a workflow to run at specified times using cron syntax
   */
  scheduleWorkflow(
    cronExpression: string,
    workflowName: string,
    context?: WorkflowContext,
    scheduleId?: string
  ): string;
  /**
   * Start a scheduled task
   */
  startSchedule(scheduleId: string): boolean;
  /**
   * Stop a scheduled task
   */
  stopSchedule(scheduleId: string): boolean;
  /**
   * Remove a scheduled task completely
   */
  removeSchedule(scheduleId: string): boolean;
  /**
   * Get all active schedules
   */
  getActiveSchedules(): Array<{
    id: string;
    status: string;
  }>;
  cleanup(): Promise<void>;
  /**
   * Register document workflows for automated processing.
   */
  registerDocumentWorkflows(): Promise<void>;
  /**
   * Process document event to trigger appropriate workflows.
   */
  processDocumentEvent(eventType: string, documentData: unknown): Promise<void>;
  /**
   * Convert entity to document content.
   */
  convertEntityToDocumentContent(entity: any): DocumentContent;
  /**
   * Execute workflow step with enhanced error handling (public method).
   */
  executeWorkflowStepPublic(
    step: WorkflowStep,
    context: WorkflowContext,
    _workflowId: string
  ): Promise<StepExecutionResult>;
  /**
   * Get workflow data by ID.
   */
  getWorkflowData(workflowId: string): Promise<WorkflowData | null>;
  /**
   * Create workflow from data.
   */
  createWorkflowFromData(data: WorkflowData): Promise<string>;
  /**
   * Update workflow data.
   */
  updateWorkflowData(
    workflowId: string,
    updates: Partial<WorkflowData>
  ): Promise<void>;
  /**
   * Intelligent workflow analysis using LLM.
   * Analyzes workflow performance and suggests optimizations.
   */
  analyzeWorkflowIntelligently(workflowId: string): Promise<{
    performance: {
      averageExecutionTime: number;
      successRate: number;
      bottlenecks: string[];
    };
    suggestions: string[];
    optimizations: string[];
  }>;
  /**
   * Generate intelligent workflow documentation using LLM.
   */
  generateWorkflowDocumentation(workflowId: string): Promise<{
    overview: string;
    stepDescriptions: {
      [stepName: string]: string;
    };
    usageGuide: string;
    troubleshooting: string[];
  }>;
  /**
   * Suggest workflow optimizations based on patterns and best practices.
   */
  suggestWorkflowOptimizations(
    workflowDefinition: WorkflowDefinition
  ): Promise<{
    structuralSuggestions: string[];
    performanceSuggestions: string[];
    reliabilitySuggestions: string[];
    maintainabilitySuggestions: string[];
  }>;
  /**
   * Enhanced shutdown with cleanup.
   */
  shutdown(): Promise<void>;
}
export default WorkflowEngine;
//# sourceMappingURL=engine.d.ts.map
