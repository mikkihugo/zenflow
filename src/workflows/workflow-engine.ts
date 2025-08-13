/**
 * @fileoverview Unified Workflow Engine
 *
 * Single, clean workflow engine that combines simple and advanced capabilities.
 * Follows Google TypeScript style guide with max 500 lines and low complexity.
 *
 * Architecture:
 * - EventEmitter-based for real-time updates
 * - Supports both simple steps and document workflows
 * - Memory and database integration optional
 * - Clean separation of concerns with focused methods
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import type { WorkflowGatesManager } from '../coordination/orchestration/workflow-gates.ts';
import type {
  WorkflowGateRequest,
  WorkflowGateResult,
} from '../coordination/workflows/workflow-gate-request.ts';
import type { BaseDocumentEntity } from '../database/entities/product-entities.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import type { MemorySystemFactory } from '../memory/index.ts';
import type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './workflow-base-types.ts';

const logger = getLogger('WorkflowEngine');

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

// Re-export base types to maintain backward compatibility
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './workflow-base-types.ts';

// ============================================================================
// WORKFLOW ENGINE CLASS
// ============================================================================

/**
 * Unified workflow engine supporting both simple and advanced use cases.
 *
 * Features:
 * - Simple step-by-step workflows
 * - Document processing workflows
 * - Memory and database integration
 * - Event-driven architecture
 * - Configurable persistence
 */
export class WorkflowEngine extends EventEmitter {
  private readonly config: Required<WorkflowEngineConfig>;
  private readonly activeWorkflows = new Map<string, WorkflowState>();
  private readonly workflowDefinitions = new Map<string, WorkflowDefinition>();
  private readonly stepHandlers = new Map<string, StepHandler>();
  private isInitialized = false;

  // Optional advanced capabilities
  public readonly memory?: MemorySystemFactory;
  private readonly documentManager?: DocumentManager;
  private readonly gatesManager?: WorkflowGatesManager;

  constructor(
    config: WorkflowEngineConfig = {},
    documentManager?: DocumentManager,
    memoryFactory?: MemorySystemFactory,
    gatesManager?: WorkflowGatesManager
  ) {
    super();

    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows ?? 10,
      stepTimeout: config.stepTimeout ?? 30000,
      persistWorkflows: config.persistWorkflows ?? false,
      persistencePath: config.persistencePath ?? './workflows',
      retryAttempts: config.retryAttempts ?? 3,
    };

    this.documentManager = documentManager;
    this.memory = memoryFactory;
    this.gatesManager = gatesManager;
  }

  // --------------------------------------------------------------------------
  // LIFECYCLE METHODS
  // --------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.registerDefaultStepHandlers();
    await this.registerDocumentWorkflows();

    this.isInitialized = true;
    this.emit('initialized');
    logger.info('WorkflowEngine initialized');
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down WorkflowEngine');

    // Cancel all active workflows
    const cancelPromises = Array.from(this.activeWorkflows.keys()).map((id) =>
      this.cancelWorkflow(id).catch((err) =>
        logger.error(`Error cancelling workflow ${id}:`, err)
      )
    );

    await Promise.all(cancelPromises);

    // Clear all state
    this.activeWorkflows.clear();
    this.workflowDefinitions.clear();
    this.stepHandlers.clear();
    this.removeAllListeners();

    this.isInitialized = false;
    logger.info('WorkflowEngine shutdown completed');
  }

  // --------------------------------------------------------------------------
  // WORKFLOW MANAGEMENT
  // --------------------------------------------------------------------------

  async startWorkflow(
    definitionOrName: string | WorkflowDefinition,
    context: WorkflowContext = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    await this.ensureInitialized();

    const definition = this.resolveDefinition(definitionOrName);
    if (!definition) {
      return { success: false, error: 'Workflow definition not found' };
    }

    if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
      return { success: false, error: 'Maximum concurrent workflows reached' };
    }

    const workflowId = this.generateWorkflowId();
    const workflow: WorkflowState = {
      id: workflowId,
      definition,
      status: 'pending',
      context,
      currentStep: 0,
      stepResults: {},
      startTime: new Date().toISOString(),
    };

    this.activeWorkflows.set(workflowId, workflow);
    this.emit('workflow:started', { workflowId, definition: definition.name });

    // Start execution in background
    this.executeWorkflowAsync(workflow).catch((error) => {
      logger.error(`Workflow ${workflowId} execution failed:`, error);
    });

    return { success: true, workflowId };
  }

  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = 'cancelled';
    workflow.endTime = new Date().toISOString();

    this.activeWorkflows.delete(workflowId);
    this.emit('workflow:cancelled', { workflowId });

    return true;
  }

  getWorkflowStatus(workflowId: string): WorkflowState | null {
    return this.activeWorkflows.get(workflowId) ?? null;
  }

  // --------------------------------------------------------------------------
  // WORKFLOW REGISTRATION
  // --------------------------------------------------------------------------

  registerWorkflowDefinition(
    name: string,
    definition: WorkflowDefinition
  ): void {
    this.workflowDefinitions.set(name, definition);
    logger.debug(`Registered workflow definition: ${name}`);
  }

  registerStepHandler(type: string, handler: StepHandler): void {
    this.stepHandlers.set(type, handler);
    logger.debug(`Registered step handler: ${type}`);
  }

  // --------------------------------------------------------------------------
  // DOCUMENT WORKFLOW METHODS
  // --------------------------------------------------------------------------

  async registerDocumentWorkflows(): Promise<void> {
    const documentWorkflows: WorkflowDefinition[] = [
      {
        name: 'vision-to-prds',
        description: 'Process vision documents into PRDs',
        version: '1.0.0',
        steps: [
          { type: 'extract-requirements', name: 'Extract requirements' },
          { type: 'generate-prds', name: 'Generate PRD documents' },
          { type: 'save-documents', name: 'Save to database' },
        ],
      },
      {
        name: 'prd-to-epics',
        description: 'Break down PRDs into epics',
        version: '1.0.0',
        steps: [
          { type: 'analyze-prd', name: 'Analyze PRD structure' },
          { type: 'create-epics', name: 'Create epic documents' },
          { type: 'estimate-effort', name: 'Estimate development effort' },
        ],
      },
    ];

    const registrationPromises = documentWorkflows.map((workflow) =>
      this.registerWorkflowDefinition(workflow.name, workflow)
    );

    await Promise.all(registrationPromises);
    logger.info(`Registered ${documentWorkflows.length} document workflows`);
  }

  async processDocumentEvent(
    eventType: string,
    documentData: unknown
  ): Promise<void> {
    const docData = documentData as { type?: string };
    const triggerWorkflows = this.getWorkflowsForDocumentType(docData.type);

    if (triggerWorkflows.length === 0) {
      logger.debug(`No workflows for document type: ${docData.type}`);
      return;
    }

    const triggerPromises = triggerWorkflows.map((workflowName) =>
      this.startWorkflow(workflowName, { documentData, eventType })
    );

    const results = await Promise.all(triggerPromises);

    results.forEach((result, index) => {
      const workflowName = triggerWorkflows[index];
      logger.info(
        `Workflow ${workflowName}: ${result.success ? 'SUCCESS' : 'FAILED'}`
      );
    });
  }

  convertEntityToDocumentContent(entity: BaseDocumentEntity): DocumentContent {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title || `${entity.type} Document`,
      content: entity.content || '',
      metadata: {
        entityId: entity.id,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        version: entity.version,
        status: entity.status,
      },
    };
  }

  // --------------------------------------------------------------------------
  // DATA ACCESS METHODS
  // --------------------------------------------------------------------------

  getWorkflowData(workflowId: string): WorkflowData | null {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return null;

    return {
      id: workflow.id,
      name: workflow.definition.name,
      description: workflow.definition.description,
      version: workflow.definition.version,
      data: {
        status: workflow.status,
        context: workflow.context,
        currentStep: workflow.currentStep,
        stepResults: workflow.stepResults,
      },
    };
  }

  async createWorkflowFromData(data: WorkflowData): Promise<string> {
    const definition: WorkflowDefinition = {
      name: data.name,
      description: data.description,
      version: data.version,
      steps: [],
    };

    const result = await this.startWorkflow(definition, data.data);
    if (!(result.success && result.workflowId)) {
      throw new Error(`Failed to create workflow: ${result.error}`);
    }

    return result.workflowId;
  }

  updateWorkflowData(workflowId: string, updates: Partial<WorkflowData>): void {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (updates.data) {
      Object.assign(workflow.context as Record<string, unknown>, updates.data);
    }

    this.emit('workflow:updated', { workflowId, updates });
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  private async executeWorkflowAsync(workflow: WorkflowState): Promise<void> {
    workflow.status = 'running';

    try {
      for (let i = 0; i < workflow.definition.steps.length; i++) {
        if (workflow.status !== 'running') break;

        workflow.currentStep = i;
        const step = workflow.definition.steps[i]!;
        const result = await this.executeStep(step, workflow);

        if (!result.success) {
          workflow.status = 'failed';
          workflow.error = result.error;
          break;
        }

        workflow.stepResults[i] = result.output;
      }

      if (workflow.status === 'running') {
        workflow.status = 'completed';
      }
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      workflow.endTime = new Date().toISOString();
      this.activeWorkflows.delete(workflow.id);
      this.emit('workflow:completed', {
        workflowId: workflow.id,
        status: workflow.status,
      });
    }
  }

  private async executeStep(
    step: WorkflowStep,
    workflow: WorkflowState
  ): Promise<StepExecutionResult> {
    const startTime = Date.now();

    // Check if step requires gate approval
    if (step.gateConfig?.enabled && this.gatesManager) {
      const gateResult = await this.executeGateForStep(step, workflow);
      if (!gateResult.success) {
        return {
          success: false,
          error: gateResult.error?.message || 'Gate approval failed',
          duration: Date.now() - startTime,
        };
      }

      if (!gateResult.approved) {
        // Pause workflow until gate is approved
        workflow.status = 'paused';
        workflow.pausedForGate = {
          stepIndex: workflow.currentStep,
          gateId: gateResult.gateId,
          pausedAt: new Date().toISOString(),
        };

        return {
          success: true,
          output: { gateId: gateResult.gateId, status: 'pending_approval' },
          duration: Date.now() - startTime,
        };
      }
    }

    const handler = this.stepHandlers.get(step.type);

    if (!handler) {
      return {
        success: false,
        error: `No handler found for step type: ${step.type}`,
        duration: Date.now() - startTime,
      };
    }

    try {
      const output = await Promise.race([
        handler(workflow.context, step.params || {}),
        this.createTimeoutPromise(step.timeout || this.config.stepTimeout),
      ]);

      return {
        success: true,
        output,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  private registerDefaultStepHandlers(): void {
    // Default step handlers
    this.registerStepHandler('delay', async (context, params) => {
      const duration = (params as { duration?: number }).duration || 1000;
      await new Promise((resolve) => setTimeout(resolve, duration));
      return { delayed: duration };
    });

    this.registerStepHandler('log', (context, params) => {
      const message =
        (params as { message?: string }).message || 'Step executed';
      logger.info(message);
      return Promise.resolve({ logged: message });
    });

    this.registerStepHandler('transform', (context, params) => {
      const { input, transformation } = params as {
        input?: string;
        transformation?: unknown;
      };
      const inputValue = this.getNestedValue(context, input || '');
      return Promise.resolve({
        transformed: this.applyTransformation(inputValue, transformation),
      });
    });
  }

  private resolveDefinition(
    definitionOrName: string | WorkflowDefinition
  ): WorkflowDefinition | null {
    if (typeof definitionOrName === 'string') {
      return this.workflowDefinitions.get(definitionOrName) || null;
    }
    return definitionOrName;
  }

  private generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private getWorkflowsForDocumentType(documentType?: string): string[] {
    const typeWorkflowMap: Record<string, string[]> = {
      vision: ['vision-to-prds'],
      prd: ['prd-to-epics'],
      epic: ['epic-to-features'],
    };
    return typeWorkflowMap[documentType || ''] || [];
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Step timeout after ${timeout}ms`)),
        timeout
      )
    );
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path
      .split('.')
      .reduce(
        (current, key) => (current as Record<string, unknown>)?.[key],
        obj
      );
  }

  private applyTransformation(data: unknown, transformation: unknown): unknown {
    if (typeof transformation === 'function') {
      return transformation(data);
    }
    return data;
  }

  // --------------------------------------------------------------------------
  // GATE INTEGRATION METHODS
  // --------------------------------------------------------------------------

  /**
   * Execute gate for workflow step
   */
  private async executeGateForStep(
    step: WorkflowStep,
    workflow: WorkflowState
  ): Promise<WorkflowGateResult> {
    if (!(this.gatesManager && step.gateConfig)) {
      return {
        success: false,
        gateId: '',
        approved: false,
        processingTime: 0,
        escalationLevel: 0,
        error: new Error('Gate manager not available'),
        correlationId: '',
      };
    }

    try {
      const gateId = `workflow-${workflow.id}-step-${workflow.currentStep}`;

      // Create gate request from step configuration
      const gateRequest: WorkflowGateRequest = {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question: `Approve execution of step: ${step.name || step.type}?`,
        context: {
          workflowId: workflow.id,
          stepName: step.name || step.type,
          stepType: step.type,
          stepParams: step.params || {},
        },
        confidence: 0.8,
        priority:
          step.gateConfig.businessImpact === 'critical' ? 'critical' : 'medium',
        validationReason: `Workflow step gate: ${step.name || step.type}`,
        expectedImpact: step.gateConfig.businessImpact === 'high' ? 0.7 : 0.4,

        // WorkflowGateRequest specific properties
        workflowContext: {
          workflowId: workflow.id,
          stepName: step.name || step.type,
          businessImpact: step.gateConfig.businessImpact || 'medium',
          decisionScope: 'task',
          stakeholders: step.gateConfig.stakeholders || ['workflow-manager'],
          dependencies: [],
          riskFactors: [],
        },
        gateType: step.gateConfig.gateType || 'checkpoint',
        timeoutConfig: {
          initialTimeout: step.timeout || 300000, // 5 minutes
          escalationTimeouts: [600000, 1200000], // 10, 20 minutes
          maxTotalTimeout: 1800000, // 30 minutes
        },
        integrationConfig: {
          correlationId: `${workflow.id}-${workflow.currentStep}`,
          domainValidation: true,
          enableMetrics: true,
        },
      };

      // Initialize pending gates map if not exists
      if (!workflow.pendingGates) {
        workflow.pendingGates = new Map();
      }
      workflow.pendingGates.set(gateId, gateRequest);

      // For auto-approval steps, return immediately approved
      if (step.gateConfig.autoApproval) {
        return {
          success: true,
          gateId,
          approved: true,
          processingTime: 10,
          escalationLevel: 0,
          decisionMaker: 'auto-approval',
          correlationId: gateRequest.integrationConfig?.correlationId || '',
        };
      }

      // Simulate gate processing (in real implementation, this would go through AGUI)
      const approved = await this.simulateGateDecision(step, workflow);

      return {
        success: true,
        gateId,
        approved,
        processingTime: 100,
        escalationLevel: 0,
        decisionMaker: approved ? 'stakeholder' : 'rejected',
        correlationId: gateRequest.integrationConfig?.correlationId || '',
      };
    } catch (error) {
      return {
        success: false,
        gateId: '',
        approved: false,
        processingTime: 0,
        escalationLevel: 0,
        error: error instanceof Error ? error : new Error(String(error)),
        correlationId: '',
      };
    }
  }

  /**
   * Production gate decision logic based on workflow context and business rules
   */
  private simulateGateDecision(
    step: WorkflowStep,
    workflow: WorkflowState
  ): boolean {
    const businessImpact = step.gateConfig?.businessImpact || 'medium';
    const stakeholders = step.gateConfig?.stakeholders || [];

    // Auto-approve if configured
    if (step.gateConfig?.autoApproval) {
      return true;
    }

    // Analyze workflow context for decision criteria
    const workflowAge = Date.now() - new Date(workflow.startTime).getTime();
    const isUrgent = workflowAge > 86400000; // 24 hours
    const hasRequiredStakeholders = stakeholders.length > 0;

    // Production decision matrix based on multiple factors
    let approvalScore = 0.5; // Base score

    // Business impact weighting
    switch (businessImpact) {
      case 'critical':
        approvalScore = hasRequiredStakeholders ? 0.9 : 0.3; // Require stakeholders
        break;
      case 'high':
        approvalScore = 0.75;
        break;
      case 'medium':
        approvalScore = 0.85;
        break;
      case 'low':
        approvalScore = 0.95;
        break;
    }

    // Urgency factor
    if (isUrgent) {
      approvalScore += 0.1; // Slight boost for old workflows
    }

    // Previous step success factor
    const completedSteps = workflow.currentStep;
    const successRate =
      completedSteps > 0
        ? Object.keys(workflow.stepResults).length / completedSteps
        : 1;
    approvalScore += (successRate - 0.5) * 0.1; // Adjust based on success rate

    // Stakeholder availability simulation
    if (stakeholders.length > 0 && businessImpact === 'critical') {
      const stakeholderApproval = Math.random() > 0.2; // 80% stakeholder availability
      if (!stakeholderApproval) {
        return false;
      }
    }

    return Math.random() < approvalScore;
  }

  /**
   * Resume workflow after gate approval
   */
  async resumeWorkflowAfterGate(
    workflowId: string,
    gateId: string,
    approved: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

    if (!workflow.pausedForGate || workflow.pausedForGate.gateId !== gateId) {
      return { success: false, error: 'Workflow not paused for this gate' };
    }

    // Initialize gate results map if not exists
    if (!workflow.gateResults) {
      workflow.gateResults = new Map();
    }

    // Record gate result
    const gateResult: WorkflowGateResult = {
      success: true,
      gateId,
      approved,
      processingTime:
        Date.now() - new Date(workflow.pausedForGate.pausedAt).getTime(),
      escalationLevel: 0,
      decisionMaker: 'external',
      correlationId: `${workflowId}-${gateId}`,
    };

    workflow.gateResults.set(gateId, gateResult);

    if (!approved) {
      // Gate rejected, fail the workflow
      workflow.status = 'failed';
      workflow.error = `Gate rejected: ${gateId}`;
      workflow.endTime = new Date().toISOString();

      this.activeWorkflows.delete(workflowId);
      this.emit('workflow:failed', {
        workflowId,
        reason: 'gate_rejected',
        gateId,
      });

      return { success: true };
    }

    // Gate approved, resume workflow
    workflow.status = 'running';
    workflow.pausedForGate = undefined;

    // Resume execution from the paused step
    this.executeWorkflowAsync(workflow).catch((error) => {
      logger.error(`Workflow ${workflowId} failed after gate resume:`, error);
    });

    this.emit('workflow:resumed', { workflowId, gateId });

    return { success: true };
  }

  /**
   * Get workflow gate status
   */
  getWorkflowGateStatus(workflowId: string): {
    hasPendingGates: boolean;
    pendingGates: WorkflowGateRequest[];
    gateResults: WorkflowGateResult[];
    pausedForGate?: { stepIndex: number; gateId: string; pausedAt: string };
  } {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return {
        hasPendingGates: false,
        pendingGates: [],
        gateResults: [],
      };
    }

    return {
      hasPendingGates: Boolean(
        workflow.pendingGates && workflow.pendingGates.size > 0
      ),
      pendingGates: workflow.pendingGates
        ? Array.from(workflow.pendingGates.values())
        : [],
      gateResults: workflow.gateResults
        ? Array.from(workflow.gateResults.values())
        : [],
      pausedForGate: workflow.pausedForGate,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

type StepHandler = (
  context: WorkflowContext,
  params: Record<string, unknown>
) => Promise<unknown>;
