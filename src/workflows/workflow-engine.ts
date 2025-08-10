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

import {EventEmitter} from 'node:events';
import {getLogger} from '../config/logging-config';
import type {BaseDocumentEntity} from '../database/entities/product-entities';
import type {DocumentManager} from '../database/managers/document-manager';
import type {MemorySystemFactory} from '../memory/index';

const logger = getLogger('WorkflowEngine');

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface WorkflowStep {
  readonly type: string;
  readonly name?: string;
  readonly params?: Record<string, unknown>;
  readonly timeout?: number;
  readonly retries?: number;
  readonly onError?: 'stop' | 'continue' | 'skip';
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
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  readonly context: WorkflowContext;
  currentStep: number;
  readonly stepResults: Record<string, unknown>;
  readonly startTime: string;
  endTime?: string;
  error?: string;
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

  constructor(
    config: WorkflowEngineConfig = {},
    documentManager?: DocumentManager,
    memoryFactory?: MemorySystemFactory
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
    const cancelPromises = Array.from(this.activeWorkflows.keys())
      .map(id => this.cancelWorkflow(id).catch(err => 
        logger.error(`Error cancelling workflow ${id}:`, err)));
    
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
  ): Promise<{success: boolean; workflowId?: string; error?: string}> {
    await this.ensureInitialized();

    const definition = this.resolveDefinition(definitionOrName);
    if (!definition) {
      return {success: false, error: 'Workflow definition not found'};
    }

    if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
      return {success: false, error: 'Maximum concurrent workflows reached'};
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
    this.emit('workflow:started', {workflowId, definition: definition.name});

    // Start execution in background
    this.executeWorkflowAsync(workflow).catch(error => {
      logger.error(`Workflow ${workflowId} execution failed:`, error);
    });

    return {success: true, workflowId};
  }

  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = 'cancelled';
    workflow.endTime = new Date().toISOString();
    
    this.activeWorkflows.delete(workflowId);
    this.emit('workflow:cancelled', {workflowId});
    
    return true;
  }

  getWorkflowStatus(workflowId: string): WorkflowState | null {
    return this.activeWorkflows.get(workflowId) ?? null;
  }

  // --------------------------------------------------------------------------
  // WORKFLOW REGISTRATION
  // --------------------------------------------------------------------------

  async registerWorkflowDefinition(name: string, definition: WorkflowDefinition): Promise<void> {
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
          {type: 'extract-requirements', name: 'Extract requirements'},
          {type: 'generate-prds', name: 'Generate PRD documents'},
          {type: 'save-documents', name: 'Save to database'},
        ],
      },
      {
        name: 'prd-to-epics',
        description: 'Break down PRDs into epics',
        version: '1.0.0',
        steps: [
          {type: 'analyze-prd', name: 'Analyze PRD structure'},
          {type: 'create-epics', name: 'Create epic documents'},
          {type: 'estimate-effort', name: 'Estimate development effort'},
        ],
      },
    ];

    const registrationPromises = documentWorkflows.map(workflow =>
      this.registerWorkflowDefinition(workflow.name, workflow));
    
    await Promise.all(registrationPromises);
    logger.info(`Registered ${documentWorkflows.length} document workflows`);
  }

  async processDocumentEvent(eventType: string, documentData: unknown): Promise<void> {
    const docData = documentData as {type?: string};
    const triggerWorkflows = this.getWorkflowsForDocumentType(docData.type);

    if (triggerWorkflows.length === 0) {
      logger.debug(`No workflows for document type: ${docData.type}`);
      return;
    }

    const triggerPromises = triggerWorkflows.map(workflowName =>
      this.startWorkflow(workflowName, {documentData, eventType}));
    
    const results = await Promise.all(triggerPromises);
    
    results.forEach((result, index) => {
      const workflowName = triggerWorkflows[index];
      logger.info(`Workflow ${workflowName}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
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

  async getWorkflowData(workflowId: string): Promise<WorkflowData | null> {
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
    if (!result.success || !result.workflowId) {
      throw new Error(`Failed to create workflow: ${result.error}`);
    }

    return result.workflowId;
  }

  async updateWorkflowData(workflowId: string, updates: Partial<WorkflowData>): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (updates.data) {
      Object.assign(workflow.context as Record<string, unknown>, updates.data);
    }

    this.emit('workflow:updated', {workflowId, updates});
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

  private async executeStep(step: WorkflowStep, workflow: WorkflowState): Promise<StepExecutionResult> {
    const startTime = Date.now();
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
      const duration = (params as {duration?: number}).duration || 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
      return {delayed: duration};
    });

    this.registerStepHandler('log', async (context, params) => {
      const message = (params as {message?: string}).message || 'Step executed';
      logger.info(message);
      return {logged: message};
    });

    this.registerStepHandler('transform', async (context, params) => {
      const {input, transformation} = params as {input?: string; transformation?: unknown};
      const inputValue = this.getNestedValue(context, input || '');
      return {transformed: this.applyTransformation(inputValue, transformation)};
    });
  }

  private resolveDefinition(definitionOrName: string | WorkflowDefinition): WorkflowDefinition | null {
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
      'vision': ['vision-to-prds'],
      'prd': ['prd-to-epics'],
      'epic': ['epic-to-features'],
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
      setTimeout(() => reject(new Error(`Step timeout after ${timeout}ms`)), timeout));
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => 
      (current as Record<string, unknown>)?.[key], obj);
  }

  private applyTransformation(data: unknown, transformation: unknown): unknown {
    if (typeof transformation === 'function') {
      return transformation(data);
    }
    return data;
  }
}

// ============================================================================
// TYPES
// ============================================================================

type StepHandler = (context: WorkflowContext, params: Record<string, unknown>) => Promise<unknown>;