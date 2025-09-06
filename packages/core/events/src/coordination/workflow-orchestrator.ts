/**
 * @fileoverview Workflow Orchestrator
 * 
 * High-level workflow orchestration for complex multi-service operations
 * integrating brain, document intelligence, and coordination packages.
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import { globalEventCoordinator, type EventCoordinationRequest } from './event-coordinator.js';
import { 
  createCorrelationContext,
  SagaWorkflowFactory,
  type CorrelationContext 
} from '../saga/index.js';

const logger = getLogger('WorkflowOrchestrator');

// =============================================================================
// ORCHESTRATOR WORKFLOW DEFINITIONS
// =============================================================================

/**
 * Standard workflow patterns for the system
 */
export interface WorkflowPattern {
  patternId: string;
  name: string;
  description: string;
  triggerEvents: string[];
  participatingServices: string[];
  executionSteps: WorkflowStep[];
  timeout: number;
  requiresApproval: boolean;
}

/**
 * Individual workflow step
 */
export interface WorkflowStep {
  stepId: string;
  stepName: string;
  targetService: string;
  operation: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  timeoutMs: number;
  optional: boolean;
}

// =============================================================================
// PREDEFINED WORKFLOW PATTERNS
// =============================================================================

/**
 * External document import workflow pattern
 */
export const EXTERNAL_DOCUMENT_IMPORT_PATTERN: WorkflowPattern = {
  patternId: 'external-document-import',
  name: 'External Document Import',
  description: 'Import external documents into existing SAFe projects',
  triggerEvents: [
    'web-interface:document-upload',
    'api:document-import-request',
    'email:document-attachment-received'
  ],
  participatingServices: ['brain', 'document-intelligence', 'coordination'],
  executionSteps: [
    {
      stepId: 'brain-analysis',
      stepName: 'Analyze Document for Import Readiness',
      targetService: 'brain',
      operation: 'analyze-external-document',
      inputMapping: { documentData: 'request.documentData' },
      outputMapping: { analysisResult: 'brain.analysisResult' },
      retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 },
      timeoutMs: 30000,
      optional: false,
    },
    {
      stepId: 'coordination-approval',
      stepName: 'Get Import Approval',
      targetService: 'coordination',
      operation: 'approve-import-request',
      inputMapping: { 
        documentId: 'request.documentId',
        analysisResult: 'brain.analysisResult'
      },
      outputMapping: { approvalResult: 'coordination.approvalResult' },
      retryPolicy: { maxRetries: 2, retryDelay: 2000, backoffMultiplier: 1.5 },
      timeoutMs: 60000,
      optional: false,
    },
    {
      stepId: 'document-processing',
      stepName: 'Process External Document',
      targetService: 'document-intelligence',
      operation: 'process-external-import',
      inputMapping: {
        documentData: 'request.documentData',
        approvalContext: 'coordination.approvalResult'
      },
      outputMapping: { processedArtifacts: 'document-intelligence.processedArtifacts' },
      retryPolicy: { maxRetries: 3, retryDelay: 2000, backoffMultiplier: 2 },
      timeoutMs: 120000,
      optional: false,
    },
    {
      stepId: 'safe-integration',
      stepName: 'Integrate with SAFe Project',
      targetService: 'coordination',
      operation: 'integrate-with-safe-project',
      inputMapping: {
        processedArtifacts: 'document-intelligence.processedArtifacts',
        targetProjectId: 'request.targetProjectId'
      },
      outputMapping: { integrationResult: 'coordination.integrationResult' },
      retryPolicy: { maxRetries: 2, retryDelay: 3000, backoffMultiplier: 2 },
      timeoutMs: 90000,
      optional: false,
    }
  ],
  timeout: 300000, // 5 minutes total
  requiresApproval: true,
};

/**
 * Cross-package coordination workflow pattern
 */
export const CROSS_PACKAGE_COORDINATION_PATTERN: WorkflowPattern = {
  patternId: 'cross-package-coordination',
  name: 'Cross-Package Coordination',
  description: 'Coordinate complex operations across multiple packages',
  triggerEvents: [
    'brain:coordination:workflow-trigger',
    'coordination:cross-package-request',
    'system:distributed-operation-required'
  ],
  participatingServices: ['brain', 'document-intelligence', 'coordination'],
  executionSteps: [
    {
      stepId: 'coordination-validation',
      stepName: 'Validate Cross-Package Request',
      targetService: 'coordination',
      operation: 'validate-cross-package-request',
      inputMapping: { request: 'request' },
      outputMapping: { validationResult: 'coordination.validationResult' },
      retryPolicy: { maxRetries: 2, retryDelay: 1000, backoffMultiplier: 1.5 },
      timeoutMs: 15000,
      optional: false,
    },
    {
      stepId: 'resource-allocation',
      stepName: 'Allocate Resources',
      targetService: 'coordination',
      operation: 'allocate-cross-package-resources',
      inputMapping: { validationResult: 'coordination.validationResult' },
      outputMapping: { resourceAllocation: 'coordination.resourceAllocation' },
      retryPolicy: { maxRetries: 3, retryDelay: 2000, backoffMultiplier: 2 },
      timeoutMs: 30000,
      optional: false,
    },
    // Dynamic steps added based on participating services
  ],
  timeout: 180000, // 3 minutes total
  requiresApproval: false,
};

// =============================================================================
// WORKFLOW ORCHESTRATOR CLASS
// =============================================================================

/**
 * Main workflow orchestrator for complex multi-service workflows
 */
export class WorkflowOrchestrator {
  private eventBus: EventBus;
  private workflowPatterns = new Map<string, WorkflowPattern>();
  private activeOrchestrations = new Map<string, OrchestratedWorkflow>();

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || EventBus.getInstance();
    this.initializeStandardPatterns();
    this.setupEventListeners();
    logger.info('WorkflowOrchestrator initialized with standard patterns');
  }

  /**
   * Initialize standard workflow patterns
   */
  private initializeStandardPatterns(): void {
    this.registerWorkflowPattern(EXTERNAL_DOCUMENT_IMPORT_PATTERN);
    this.registerWorkflowPattern(CROSS_PACKAGE_COORDINATION_PATTERN);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for workflow orchestration requests
    this.eventBus.on('orchestrator:execute-workflow', this.executeWorkflowPattern.bind(this));
    
    // Listen for workflow trigger events
    EXTERNAL_DOCUMENT_IMPORT_PATTERN.triggerEvents.forEach(triggerEvent => {
      this.eventBus.on(triggerEvent, (eventData) => {
        this.triggerWorkflowPattern('external-document-import', eventData);
      });
    });

    CROSS_PACKAGE_COORDINATION_PATTERN.triggerEvents.forEach(triggerEvent => {
      this.eventBus.on(triggerEvent, (eventData) => {
        this.triggerWorkflowPattern('cross-package-coordination', eventData);
      });
    });
  }

  /**
   * Register a new workflow pattern
   */
  registerWorkflowPattern(pattern: WorkflowPattern): void {
    this.workflowPatterns.set(pattern.patternId, pattern);
    logger.info('Registered workflow pattern', { patternId: pattern.patternId });
  }

  /**
   * Trigger workflow pattern execution
   */
  private async triggerWorkflowPattern(
    patternId: string, 
    triggerData: any
  ): Promise<void> {
    const pattern = this.workflowPatterns.get(patternId);
    if (!pattern) {
      logger.warn('Unknown workflow pattern triggered', { patternId });
      return;
    }

    logger.info('Triggering workflow pattern', { patternId, triggerData });

    // Create orchestrated workflow instance
    await this.executeWorkflowPattern({
      requestId: `orchestration_${Date.now()}`,
      timestamp: Date.now(),
      patternId,
      workflowData: triggerData,
    });
  }

  /**
   * Execute workflow pattern
   */
  private async executeWorkflowPattern(request: {
    requestId: string;
    timestamp: number;
    patternId: string;
    workflowData: any;
  }): Promise<void> {
    const pattern = this.workflowPatterns.get(request.patternId);
    if (!pattern) {
      throw new Error(`Unknown workflow pattern: ${request.patternId}`);
    }

    // Create correlation context
    const correlationContext = createCorrelationContext({
      initiatedBy: 'orchestrator',
      metadata: {
        patternId: request.patternId,
        workflowName: pattern.name,
      },
    });

    // Create orchestrated workflow instance
    const orchestratedWorkflow: OrchestratedWorkflow = {
      orchestrationId: `orch_${Date.now()}_${correlationContext.correlationId}`,
      patternId: request.patternId,
      correlationId: correlationContext.correlationId,
      state: 'initiated',
      currentStepIndex: 0,
      stepResults: {},
      startTime: Date.now(),
      workflowData: request.workflowData,
      pattern,
    };

    this.activeOrchestrations.set(orchestratedWorkflow.orchestrationId, orchestratedWorkflow);

    try {
      if (pattern.requiresApproval) {
        // Request approval before execution
        await this.requestWorkflowApproval(orchestratedWorkflow);
      } else {
        // Execute immediately
        await this.executeWorkflowSteps(orchestratedWorkflow, correlationContext);
      }
    } catch (error) {
      logger.error('Workflow orchestration failed', { 
        orchestrationId: orchestratedWorkflow.orchestrationId,
        error 
      });
      orchestratedWorkflow.state = 'failed';
      orchestratedWorkflow.error = error instanceof Error ? error.message : String(error);
    }
  }

  /**
   * Request workflow approval
   */
  private async requestWorkflowApproval(workflow: OrchestratedWorkflow): Promise<void> {
    workflow.state = 'pending-approval';
    
    // Emit approval request
    this.eventBus.emit('orchestrator:approval-required', {
      orchestrationId: workflow.orchestrationId,
      patternId: workflow.patternId,
      workflowName: workflow.pattern.name,
      description: workflow.pattern.description,
      participatingServices: workflow.pattern.participatingServices,
      estimatedDuration: workflow.pattern.timeout,
      workflowData: workflow.workflowData,
    });

    // For now, auto-approve (in production, this would wait for approval)
    setTimeout(() => {
      workflow.state = 'approved';
      const correlationContext = createCorrelationContext({
        initiatedBy: 'orchestrator',
        metadata: { approved: true },
      });
      this.executeWorkflowSteps(workflow, correlationContext);
    }, 1000);
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(
    workflow: OrchestratedWorkflow,
    correlationContext: CorrelationContext
  ): Promise<void> {
    workflow.state = 'executing';

    for (let i = 0; i < workflow.pattern.executionSteps.length; i++) {
      const step = workflow.pattern.executionSteps[i];
      workflow.currentStepIndex = i;

      try {
        logger.info('Executing workflow step', {
          orchestrationId: workflow.orchestrationId,
          stepId: step.stepId,
          stepName: step.stepName,
        });

        // Map input data
        const stepInput = this.mapStepInput(step, workflow);

        // Create coordination request for this step
        const coordinationRequest: EventCoordinationRequest = {
          requestId: `coord_${workflow.orchestrationId}_${step.stepId}`,
          timestamp: Date.now(),
          requestType: 'workflow-orchestration',
          sourceService: 'orchestrator' as any,
          targetServices: [step.targetService],
          workflowContext: {
            operation: step.operation,
            input: stepInput,
            orchestrationId: workflow.orchestrationId,
            stepId: step.stepId,
          },
          priority: 'medium',
          timeout: step.timeoutMs,
          requiresApproval: false,
        };

        // Execute step via event coordinator
        await this.executeStepViaCoordinator(coordinationRequest, step, workflow);

      } catch (error) {
        if (step.optional) {
          logger.warn('Optional workflow step failed, continuing', {
            orchestrationId: workflow.orchestrationId,
            stepId: step.stepId,
            error,
          });
          workflow.stepResults[step.stepId] = { error: String(error), optional: true };
        } else {
          throw error;
        }
      }
    }

    workflow.state = 'completed';
    workflow.endTime = Date.now();
    logger.info('Workflow orchestration completed', {
      orchestrationId: workflow.orchestrationId,
      duration: workflow.endTime - workflow.startTime,
    });

    // Emit completion event
    this.eventBus.emit('orchestrator:workflow-completed', {
      orchestrationId: workflow.orchestrationId,
      patternId: workflow.patternId,
      results: workflow.stepResults,
      duration: workflow.endTime - workflow.startTime,
    });
  }

  /**
   * Map step input from workflow data and previous results
   */
  private mapStepInput(step: WorkflowStep, workflow: OrchestratedWorkflow): Record<string, unknown> {
    const input: Record<string, unknown> = {};

    for (const [inputKey, mappingExpression] of Object.entries(step.inputMapping)) {
      // Simple mapping implementation
      if (mappingExpression.startsWith('request.')) {
        const requestKey = mappingExpression.substring(8);
        input[inputKey] = workflow.workflowData[requestKey];
      } else if (mappingExpression.includes('.')) {
        const [stepId, resultKey] = mappingExpression.split('.');
        const stepResult = workflow.stepResults[stepId];
        if (stepResult && !stepResult.error) {
          input[inputKey] = stepResult[resultKey];
        }
      } else {
        input[inputKey] = workflow.workflowData[mappingExpression];
      }
    }

    return input;
  }

  /**
   * Execute step via event coordinator
   */
  private async executeStepViaCoordinator(
    coordinationRequest: EventCoordinationRequest,
    step: WorkflowStep,
    workflow: OrchestratedWorkflow
  ): Promise<void> {
    // This would integrate with the actual event coordinator
    // For now, simulate step execution
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate successful step result
    workflow.stepResults[step.stepId] = {
      success: true,
      output: `Step ${step.stepId} completed successfully`,
      executionTime: 100,
    };
  }

  /**
   * Get active orchestrations
   */
  getActiveOrchestrations(): OrchestratedWorkflow[] {
    return Array.from(this.activeOrchestrations.values());
  }

  /**
   * Get orchestration by ID
   */
  getOrchestration(orchestrationId: string): OrchestratedWorkflow | undefined {
    return this.activeOrchestrations.get(orchestrationId);
  }
}

// =============================================================================
// ORCHESTRATED WORKFLOW INTERFACE
// =============================================================================

/**
 * Runtime orchestrated workflow instance
 */
export interface OrchestratedWorkflow {
  orchestrationId: string;
  patternId: string;
  correlationId: string;
  state: 'initiated' | 'pending-approval' | 'approved' | 'executing' | 'completed' | 'failed';
  currentStepIndex: number;
  stepResults: Record<string, any>;
  startTime: number;
  endTime?: number;
  error?: string;
  workflowData: any;
  pattern: WorkflowPattern;
}

// =============================================================================
// GLOBAL WORKFLOW ORCHESTRATOR
// =============================================================================

/**
 * Global workflow orchestrator instance
 */
export const globalWorkflowOrchestrator = new WorkflowOrchestrator();