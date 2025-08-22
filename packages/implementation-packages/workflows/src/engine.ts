/**
 * @file Engine implementation - Battle-Tested Workflow Processing
 *
 * Professional workflow engine using battle-tested libraries for reliability:
 * - lodash-es: Data manipulation and collection operations
 * - date-fns: Professional date/time handling
 * - nanoid: Secure ID generation
 * - zod: Runtime validation and type safety
 * - rxjs: Reactive programming and async coordination
 * - immer: Immutable state management
 */

import {
  getLogger,
  getKVStore,
  getGlobalLLM,
  injectable,
  singleton,
} from '@claude-zen/foundation';

// Professional utility imports
import {
  DateFormatter,
  DateCalculator,
  ArrayProcessor,
  ObjectProcessor,
  SecureIdGenerator,
  SchemaValidator,
  WorkflowStepSchema,
  WorkflowDefinitionSchema,
  WorkflowContextSchema,
  ObservableUtils,
  AsyncUtils,
  ImmutableOps,
  type WorkflowStep as ValidatedWorkflowStep,
  type WorkflowDefinition as ValidatedWorkflowDefinition,
  type WorkflowContext as ValidatedWorkflowContext,
} from './utilities/index';

const logger = getLogger('WorkflowEngine');

/**
 * Workflow Engine
 * Sequential workflow processing engine using battle-tested libraries.
 * Replaced custom implementations with reliable, optimized solutions.
 */

import { mkdir } from 'node:fs/promises';
import { Parser } from 'expr-eval';
import * as async from 'async';
import pLimit from 'p-limit';
import EventEmitter3 from 'eventemitter3';
import { createMachine, createActor, type ActorRef } from 'xstate';
// Mermaid will be imported dynamically when needed
import * as cron from 'node-cron';

export interface WorkflowStep {
  id?: string;
  type: string;
  name?: string;
  params?: Record<string, unknown>;
  retries?: number;
  timeout?: number;
  output?: string;
  onError?: 'stop|continue|skip';
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
  status:|'pending|running|paused|completed|failed|cancelled';
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

@injectable()
@singleton()
export class WorkflowEngine extends TypedEventBase3 {
  private config: Required<WorkflowEngineConfig>;
  private activeWorkflows = new Map<string, WorkflowState>();
  private workflowMetrics = new Map<string, any>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private stepHandlers = new Map<
    string,
    (context: WorkflowContext, params: unknown) => Promise<unknown>
  >();
  private isInitialized = false;
  private kvStore: any; // Battle-tested foundation storage
  private workflowStateMachines = new Map<string, ActorRef<any, any>>(); // XState state machines
  private scheduledTasks = new Map<string, cron.ScheduledTask>(); // node-cron scheduled tasks

  // Enhanced capabilities to match core WorkflowEngine
  public memory?: any;
  private documentManager?: any;
  private documentWorkflows = new Map<string, WorkflowDefinition>();

  constructor(
    config: WorkflowEngineConfig = {},
    documentManager?: any,
    memoryFactory?: any
  ) {
    super();

    this.config = {
      maxConcurrentWorkflows:
        config.maxConcurrentWorkflows === undefined
          ? 10
          : config?.maxConcurrentWorkflows,
      persistWorkflows:
        config.persistWorkflows === undefined
          ? false
          : config?.persistWorkflows,
      persistencePath:
        config.persistencePath === undefined
          ? './workflows'
          : config?.persistencePath,
      stepTimeout:
        config.stepTimeout === undefined ? 30000 : config?.stepTimeout,
      retryDelay: config.retryDelay === undefined ? 1000 : config?.retryDelay,
      enableVisualization:
        config.enableVisualization === undefined
          ? false
          : config?.enableVisualization,
      enableAdvancedOrchestration:
        config.enableAdvancedOrchestration === undefined
          ? true
          : config?.enableAdvancedOrchestration,
    };

    // Enhanced capabilities
    this.documentManager = documentManager;
    this.memory = memoryFactory;

    // Initialize KV store
    this.kvStore = getKVStore('workflows');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create persistence directory
    if (this.config.persistWorkflows) {
      await mkdir(this.config.persistencePath, { recursive: true });
    }

    // Register built-in step handlers
    this.registerBuiltInHandlers();

    // Load persisted workflows
    if (this.config.persistWorkflows) {
      await this.loadPersistedWorkflows();
    }

    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });
  }

  private createWorkflowStateMachine(workflowId: string) {
    // XState machine for robust workflow state management
    const workflowMachine = createMachine({
      id: `workflow-${workflowId}`,
      initial: 'pending',
      context: {
        workflowId,
        currentStep: 0,
        retryCount: 0,
        errors: [],
      },
      states: {
        pending: {
          on: {
            START: 'running',
          },
        },
        running: {
          on: {
            PAUSE: 'paused',
            COMPLETE: 'completed',
            FAIL: 'failed',
            CANCEL: 'cancelled',
          },
        },
        paused: {
          on: {
            RESUME: 'running',
            CANCEL: 'cancelled',
          },
        },
        completed: {
          type: 'final',
        },
        failed: {
          on: {
            RETRY: 'running',
            CANCEL: 'cancelled',
          },
        },
        cancelled: {
          type: 'final',
        },
      },
    });

    const service = createActor(workflowMachine);

    service.subscribe((state) => {
      // Sync XState with internal workflow state
      const workflow = this.activeWorkflows.get(workflowId);
      if (workflow) {
        workflow.status = state.value as any;
        this.emit('workflow-state-changed', workflowId, state.value);
      }
    });

    service.start();
    return service;
  }

  private registerBuiltInHandlers(): void {
    // Delay step
    this.registerStepHandler(
      'delay',
      async (_context: WorkflowContext, params: unknown) => {
        const duration = (params as any)?.duration||1000;
        await ObservableUtils.delay(duration).toPromise();
        return { delayed: duration };
      }
    );

    // Transform data step
    this.registerStepHandler('transform',
      async (context: WorkflowContext, params: unknown) => {
        const data = this.getContextValue(context, (params as any)?.input);
        const transformed = await this.applyTransformation(
          data,
          (params as any)?.transformation
        );
        return { output: transformed };
      }
    );

    // Parallel execution step using async utilities
    this.registerStepHandler(
      'parallel',
      async (context: WorkflowContext, params: unknown) => {
        const tasks = (params as any)?.tasks||[];
        const concurrencyLimit = (params as any)?.concurrency||5;

        // Use p-limit for controlled concurrency
        const limit = pLimit(concurrencyLimit);
        const limitedTasks = tasks.map((task: WorkflowStep) =>
          limit(() => this.executeStep(task, context))
        );

        const results = await Promise.all(limitedTasks);
        return { results };
      }
    );

    // Loop step using async utilities
    this.registerStepHandler('loop',
      async (context: WorkflowContext, params: unknown) => {
        const items = this.getContextValue(context, (params as any)?.items);
        const concurrencyLimit = (params as any)?.concurrency||1; // Sequential by default
        const step = (params as any)?.step;

        if (!Array.isArray(items)) {
          throw new Error('Loop items must be an array');
        }

        // Use async.mapLimit for controlled iteration
        const results = await async.mapLimit(
          items,
          concurrencyLimit,
          async (item: unknown) => {
            const loopContext = { ...context, loopItem: item };
            return await this.executeStep(step, loopContext);
          }
        );

        return { results };
      }
    );

    // Conditional step
    this.registerStepHandler(
      'condition',
      async (context: WorkflowContext, params: unknown) => {
        const condition = this.evaluateCondition(
          context,
          (params as any)?.condition
        );
        if (condition) {
          return await this.executeStep((params as any)?.thenStep, context);
        }
        if ((params as any)?.elseStep) {
          return await this.executeStep((params as any)?.elseStep, context);
        }
        return { skipped: true };
      }
    );
  }

  registerStepHandler(
    type: string,
    handler: (context: WorkflowContext, params: unknown) => Promise<unknown>
  ): void {
    this.stepHandlers.set(type, handler);
  }

  async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<unknown> {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }

    return await handler(context, step.params||{});
  }

  private evaluateCondition(
    context: WorkflowContext,
    expression: string
  ): boolean {
    try {
      // Use expr-eval for safe expression evaluation (no arbitrary code execution)
      const parser = new Parser();
      const expr = parser.parse(expression);
      return expr.evaluate(context as any);
    } catch (error) {
      logger.error(
        `[WorkflowEngine] Failed to evaluate condition: ${expression}`,
        error
      );
      return false;
    }
  }

  private getContextValue(context: WorkflowContext, path: string): unknown {
    const parts = path.split('.');
    let value: any = context;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  private async applyTransformation(
    data: unknown,
    transformation: unknown
  ): Promise<unknown> {
    if (typeof transformation === 'function') {
      return transformation(data);
    }

    // Simple object transformation
    if (typeof transformation === 'object') {
      return ObjectProcessor.mapValues(
        (transformation||{}) as Record<string, unknown>,
        (value) => {
          if (typeof value ==='string' && value.startsWith('$.')) {
            return this.getContextValue({ data }, value.substring(2));
          } else {
            return value;
          }
        }
      );
    }

    return data;
  }

  private async loadPersistedWorkflows(): Promise<void> {
    try {
      // Use foundation storage instead of file system
      const kvStore = await this.kvStore;
      const workflowKeys = await kvStore.keys('workflow:*');

      for (const key of workflowKeys) {
        const workflowData = await kvStore.get(key);
        if (
          workflowData &&
          (workflowData.status === 'running'||workflowData.status ==='paused')
        ) {
          this.activeWorkflows.set(workflowData.id, workflowData);
        }
      }

      logger.info(
        `[WorkflowEngine] Loaded ${workflowKeys.length} persisted workflows from storage`
      );
    } catch (error) {
      logger.error(
        '[WorkflowEngine] Failed to load persisted workflows from storage:',
        error
      );
    }
  }

  private async saveWorkflow(workflow: WorkflowState): Promise<void> {
    if (!this.config.persistWorkflows) return;

    try {
      // Use foundation storage with structured key
      const storageKey = `workflow:${workflow.id}`;
      const kvStore = await this.kvStore;
      await kvStore.set(storageKey, workflow);
      logger.debug(`[WorkflowEngine] Saved workflow ${workflow.id} to storage`);
    } catch (error) {
      logger.error(
        `[WorkflowEngine] Failed to save workflow ${workflow.id} to storage:`,
        error
      );
    }
  }

  async registerWorkflowDefinition(
    name: string,
    definition: WorkflowDefinition
  ): Promise<void> {
    this.workflowDefinitions.set(name, definition);
  }

  async createWorkflow(definition: WorkflowDefinition): Promise<string> {
    const workflowId = SecureIdGenerator.generateWorkflowId();

    // Register the workflow definition with a unique name
    const workflowName = `${definition.name}-${workflowId}`;
    await this.registerWorkflowDefinition(workflowName, definition);

    return workflowId;
  }

  async startWorkflow(
    workflowDefinitionOrName: string|WorkflowDefinition,
    context: WorkflowContext = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    await this.initialize();

    let definition: WorkflowDefinition;

    if (typeof workflowDefinitionOrName ==='string') {
      const foundDefinition = this.workflowDefinitions.get(
        workflowDefinitionOrName
      );
      if (!foundDefinition) {
        throw new Error(
          `Workflow definition '${workflowDefinitionOrName}' not found`
        );
      }
      definition = foundDefinition;
    } else {
      definition = workflowDefinitionOrName;
    }

    // Check concurrent workflow limit
    const activeCount = ArrayProcessor.filter(
      Array.from(this.activeWorkflows.values()),
      (w) => w.status === 'running'
    ).length;

    if (activeCount >= this.config.maxConcurrentWorkflows) {
      throw new Error(
        `Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`
      );
    }

    const workflowId = SecureIdGenerator.generateWorkflowId();
    const workflow: WorkflowState = {
      id: workflowId,
      definition,
      status: 'pending',
      context,
      currentStep: 0,
      steps: definition.steps,
      stepResults: {},
      completedSteps: [],
      startTime: DateFormatter.formatISOString(),
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Create XState machine for robust state management
    const stateMachine = this.createWorkflowStateMachine(workflowId);
    this.workflowStateMachines.set(workflowId, stateMachine);

    // Start execution asynchronously
    this.executeWorkflow(workflow).catch((error) => {
      logger.error(`[WorkflowEngine] Workflow ${workflowId} failed:`, error);
      stateMachine.send({ type: 'FAIL' });
    });

    this.emit('workflow-started', workflowId);
    stateMachine.send({ type: 'START' });
    return { success: true, workflowId };
  }

  async executeWorkflow(workflow: WorkflowState): Promise<void> {
    try {
      workflow.status = 'running';
      await this.saveWorkflow(workflow);

      for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
        if (workflow.status !== 'running') {
          break; // Workflow was paused or cancelled
        }

        const step = workflow.steps[i];
        workflow.currentStep = i;
        if (step) {
          await this.executeWorkflowStep(workflow, step, i);
        }
      }

      if (workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.endTime = DateFormatter.formatISOString();
        this.emit('workflow-completed', workflow.id);
      }
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = (error as Error).message;
      workflow.endTime = DateFormatter.formatISOString();
      this.emit('workflow-failed', workflow.id, error);
    } finally {
      await this.saveWorkflow(workflow);
    }
  }

  private async executeWorkflowStep(
    workflow: WorkflowState,
    step: WorkflowStep,
    stepIndex: number
  ): Promise<void> {
    const stepId = `step-${stepIndex}`;
    let retries = 0;
    const maxRetries = step.retries !== undefined ? step.retries : 0;

    while (retries <= maxRetries) {
      try {
        this.emit('step-started', workflow.id, stepId);

        // Set up timeout
        const timeout = step.timeout||this.config.stepTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), timeout);
        });

        // Execute step
        const stepPromise = this.executeStep(step, workflow.context);
        const result = await Promise.race([stepPromise, timeoutPromise]);

        // Store result in context if specified
        if (step.output) {
          workflow.context[step.output] = result;
        }

        // Store in step results
        workflow.stepResults[stepId] = result;

        workflow.completedSteps.push({
          index: stepIndex,
          step,
          result,
          duration: 0, // Would calculate actual duration
          timestamp: DateFormatter.formatISOString(),
        });

        this.emit('step-completed', workflow.id, stepId, result);
        break;
      } catch (error) {
        retries++;

        logger.warn(
          `[WorkflowEngine] Step ${step.name} failed (attempt ${retries}/${maxRetries + 1}): ${(error as Error).message}`
        );

        if (retries > maxRetries) {
          this.emit('step-failed', workflow.id, stepId, error);

          if (step.onError === 'continue') {
            workflow.stepResults[stepId] = { error: (error as Error).message };
            break;
          }
          if (step.onError === 'skip') {
            workflow.stepResults[stepId] = { skipped: true };
            break;
          }
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) =>
          AsyncUtils.createDelay(this.config.retryDelay * retries).then(resolve)
        );
      }
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<unknown> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const duration = workflow.endTime
      ? DateCalculator.getDurationMs(
          DateFormatter.parseISO(workflow.startTime)!,
          DateFormatter.parseISO(workflow.endTime!)!
        )
      : DateCalculator.getDurationMs(
          DateFormatter.parseISO(workflow.startTime)!
        );

    return {
      id: workflow.id,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      progress:
        workflow.steps.length > 0
          ? (workflow.currentStep / workflow.steps.length) * 100
          : 0,
      startTime: workflow.startTime,
      endTime: workflow.endTime,
      duration,
      error: workflow.error,
    };
  }

  async pauseWorkflow(
    workflowId: string
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.pausedAt = DateFormatter.formatISOString();
      await this.saveWorkflow(workflow);
      this.emit('workflow-paused', workflowId);
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not running' };
  }

  async resumeWorkflow(
    workflowId: string
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      workflow.pausedAt = undefined;

      // Resume execution
      this.executeWorkflow(workflow).catch((error) => {
        logger.error(
          `[WorkflowEngine] Workflow ${workflowId} failed after resume:`,
          error
        );
      });

      this.emit('workflow-resumed', workflowId);
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not paused' };
  }

  async cancelWorkflow(
    workflowId: string
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && ['running', 'paused'].includes(workflow.status)) {
      workflow.status = 'cancelled';
      workflow.endTime = DateFormatter.formatISOString();
      await this.saveWorkflow(workflow);
      this.emit('workflow-cancelled', workflowId);
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not active' };
  }

  async getActiveWorkflows(): Promise<any[]> {
    const active = Array.from(this.activeWorkflows.values())
      .filter((w) => ['running', 'paused'].includes(w.status))
      .map((w) => ({
        id: w.id,
        name: w.definition?.name,
        status: w.status,
        currentStep: w.currentStep,
        totalSteps: w.steps.length,
        progress:
          w.steps.length > 0 ? (w.currentStep / w.steps.length) * 100 : 0,
        startTime: w.startTime,
        pausedAt: w.pausedAt,
      }));

    return active;
  }

  async getWorkflowHistory(limit: number = 100): Promise<WorkflowState[]> {
    if (!this.config.persistWorkflows) {
      return Array.from(this.activeWorkflows.values()).slice(-limit);
    }

    try {
      // Use foundation storage to get workflow history
      const kvStore = await this.kvStore;
      const workflowKeys = await kvStore.keys('workflow:*');

      // Load workflows and sort by start time
      const workflows: WorkflowState[] = [];
      for (const key of workflowKeys) {
        const workflow = await kvStore.get(key);
        if (workflow) {
          workflows.push(workflow);
        }
      }

      // Sort by start time (newest first) and limit
      const sortedWorkflows = workflows
        .sort(
          (a, b) =>
            DateFormatter.parseISO(b.startTime)!.getTime() -
            DateFormatter.parseISO(a.startTime)!.getTime()
        )
        .slice(0, limit);

      return sortedWorkflows;
    } catch (error) {
      logger.error(
        '[WorkflowEngine] Failed to get workflow history from storage:',
        error
      );
      return [];
    }
  }

  async getWorkflowMetrics(): Promise<unknown> {
    const workflows = Array.from(this.activeWorkflows.values())();
    const metrics: any = {
      total: workflows.length,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    workflows.forEach((w) => {
      metrics[w.status] = (metrics[w.status]||0) + 1;
    });

    const completed = workflows.filter((w) => w.status ==='completed');
    if (completed.length > 0) {
      const totalDuration = completed.reduce((sum, w) => {
        return (
          sum +
          DateCalculator.getDurationMs(
            DateFormatter.parseISO(w.startTime)!,
            DateFormatter.parseISO(w.endTime!)!
          )
        );
      }, 0);
      metrics.averageDuration = totalDuration / completed.length;
    }

    if (metrics.total > 0) {
      metrics.successRate = metrics.completed / metrics.total;
    }

    return metrics;
  }

  generateWorkflowVisualization(workflow: WorkflowState): string|null {
    if (!this.config.enableVisualization) return null;

    // Generate an enhanced Mermaid diagram with proper styling
    const lines = ['graph TD'];

    // Add start and end nodes
    lines.push('    start([Start])');
    lines.push('    end_node([End])');

    workflow.steps.forEach((step, index) => {
      const nodeId = `step${index}`;
      const label = (step.name||step.type).replace(/[^a-zA-Z0-9\s]/g,''); // Clean label for Mermaid
      const status =
        index < workflow.currentStep
          ? 'completed'
          : index === workflow.currentStep
            ? 'current'
            : 'pending';

      // Add different shapes based on step type
      if (step.type === 'condition') {
        lines.push(`    ${nodeId}{${label}}`); // Diamond for conditionals
      } else if (step.type === 'parallel') {
        lines.push(`    ${nodeId}[[${label}]]`); // Double square for parallel
      } else {
        lines.push(`    ${nodeId}[${label}]`); // Rectangle for normal steps
      }

      // Add styling based on status
      if (status === 'completed') {
        lines.push(
          `    style ${nodeId} fill:#90EE90,stroke:#006400,stroke-width:2px`
        );
      } else if (status === 'current') {
        lines.push(
          `    style ${nodeId} fill:#FFD700,stroke:#FF8C00,stroke-width:3px`
        );
      } else {
        lines.push(
          `    style ${nodeId} fill:#F0F0F0,stroke:#888888,stroke-width:1px`
        );
      }

      // Connect steps
      if (index === 0) {
        lines.push(`    start --> ${nodeId}`);
      } else {
        lines.push(`    step${index - 1} --> ${nodeId}`);
      }

      // Connect last step to end
      if (index === workflow.steps.length - 1) {
        lines.push(`    ${nodeId} --> end_node`);
      }
    });

    // Add status indicator
    const statusColor =
      workflow.status === 'completed'
        ? '#90EE90'
        : workflow.status === 'failed'
          ? '#FFB6C1'
          : workflow.status === 'running'
            ? '#FFD700'
            : '#F0F0F0';

    lines.push(`    style start fill:${statusColor}`);
    lines.push(`    style end_node fill:${statusColor}`);

    return lines.join('\n');
  }

  /**
   * Generate advanced Mermaid visualization with state transitions
   */
  generateAdvancedVisualization(_workflow: WorkflowState): string|null {
    if (!this.config.enableVisualization) return null;

    // Generate state diagram showing workflow states
    const lines = ['stateDiagram-v2'];

    lines.push('    [*] --> pending');
    lines.push('    pending --> running : start');
    lines.push('    running --> paused : pause');
    lines.push('    running --> completed : success');
    lines.push('    running --> failed : error');
    lines.push('    paused --> running : resume');
    lines.push('    paused --> cancelled : cancel');
    lines.push('    failed --> running : retry');
    lines.push('    failed --> cancelled : cancel');
    lines.push('    completed --> [*]');
    lines.push('    cancelled --> [*]');

    return lines.join('\n');
  }

  /**
   * Schedule a workflow to run at specified times using cron syntax
   */
  scheduleWorkflow(
    cronExpression: string,
    workflowName: string,
    context: WorkflowContext = {},
    scheduleId?: string
  ): string {
    const id =
      scheduleId||`schedule-${workflowName}-${SecureIdGenerator.generate(8)}`;

    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const task = cron.schedule(cronExpression, async () => {
      try {
        logger.info(
          `[WorkflowEngine] Starting scheduled workflow: ${workflowName}`
        );
        const result = await this.startWorkflow(workflowName, {
          ...context,
          scheduledRun: true,
          scheduleId: id,
          triggeredAt: DateFormatter.formatISOString(),
        });

        if (result.success) {
          this.emit('scheduled-workflow-started',
            workflowName,
            result.workflowId
          );
        } else {
          logger.error(
            `[WorkflowEngine] Failed to start scheduled workflow ${workflowName}: ${result.error}`
          );
        }
      } catch (error) {
        logger.error(
          `[WorkflowEngine] Error in scheduled workflow ${workflowName}:`,
          error
        );
        this.emit('scheduled-workflow-error', workflowName, error);
      }
    });

    this.scheduledTasks.set(id, task);
    logger.info(
      `[WorkflowEngine] Scheduled workflow ${workflowName} with cron: ${cronExpression}`
    );

    return id;
  }

  /**
   * Start a scheduled task
   */
  startSchedule(scheduleId: string): boolean {
    const task = this.scheduledTasks.get(scheduleId);
    if (task) {
      task.start();
      logger.info(`[WorkflowEngine] Started schedule: ${scheduleId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop a scheduled task
   */
  stopSchedule(scheduleId: string): boolean {
    const task = this.scheduledTasks.get(scheduleId);
    if (task) {
      task.stop();
      logger.info(`[WorkflowEngine] Stopped schedule: ${scheduleId}`);
      return true;
    }
    return false;
  }

  /**
   * Remove a scheduled task completely
   */
  removeSchedule(scheduleId: string): boolean {
    const task = this.scheduledTasks.get(scheduleId);
    if (task) {
      task.destroy();
      this.scheduledTasks.delete(scheduleId);
      logger.info(`[WorkflowEngine] Removed schedule: ${scheduleId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all active schedules
   */
  getActiveSchedules(): Array<{ id: string; status: string }> {
    return Array.from(this.scheduledTasks.entries()).map(([id, task]) => ({
      id,
      status: (task as any).running ? 'running' : 'stopped',
    }));
  }

  async cleanup(): Promise<void> {
    // Clean up scheduled tasks
    for (const [id, task] of this.scheduledTasks) {
      task.destroy();
      logger.info(`[WorkflowEngine] Destroyed scheduled task: ${id}`);
    }
    this.scheduledTasks.clear();

    // Clean up state machines
    for (const [id, machine] of this.workflowStateMachines) {
      machine.stop();
      logger.info(`[WorkflowEngine] Stopped state machine: ${id}`);
    }
    this.workflowStateMachines.clear();

    // Clean up other resources
    this.activeWorkflows.clear();
    this.workflowDefinitions.clear();
    this.stepHandlers.clear();
    this.workflowMetrics.clear();
    this.removeAllListeners();
  }

  // ====================================================================
  // ENHANCED METHODS TO MATCH CORE WORKFLOW ENGINE NTERFACE
  // ====================================================================

  /**
   * Register document workflows for automated processing.
   */
  async registerDocumentWorkflows(): Promise<void> {
    // Document workflow definitions
    const documentWorkflows = [
      {
        name: 'vision-to-prds',
        description:
          'Process vision document and generate product requirements documents',
        version: '1.0.0',
        steps: [
          {
            type: 'extract-product-requirements',
            name: 'Extract product requirements from vision',
            params: { outputKey: 'product_requirements' },
          },
          {
            type: 'create-prd-document',
            name: 'Create PRD document',
            params: { templateKey: 'prd_template', outputKey: 'prd_document'},
          },
        ],
      },
    ];

    // Register all document workflows
    for (const workflow of documentWorkflows) {
      await this.registerWorkflowDefinition(
        workflow.name,
        workflow as WorkflowDefinition
      );
      this.documentWorkflows.set(workflow.name, workflow as WorkflowDefinition);
    }

    logger.info(`Registered ${documentWorkflows.length} document workflows`);
  }

  /**
   * Process document event to trigger appropriate workflows.
   */
  async processDocumentEvent(
    eventType: string,
    documentData: unknown
  ): Promise<void> {
    logger.info(`Processing document event: ${eventType}`);

    // Auto-trigger workflows based on document type
    const documentType = (documentData as any)?.type||'unknown';
    const triggerWorkflows: string[] = [];

    switch (documentType) {
      case 'vision':
        triggerWorkflows.push('vision-to-prds');
        break;
      case 'prd':
        triggerWorkflows.push('prds-to-epics');
        break;
      default:
        logger.debug(
          `No automatic workflow for document type: ${documentType}`
        );
        return;
    }

    // Execute triggered workflows
    for (const workflowName of triggerWorkflows) {
      try {
        const result = await this.startWorkflow(workflowName, {
          documentData,
          eventType,
          triggeredAt: DateFormatter.formatISOString(),
        });
        logger.info(
          `Triggered workflow ${workflowName}: ${result.success ? 'SUCCESS' : 'FAILED'}`
        );
      } catch (error) {
        logger.error(`Failed to trigger workflow ${workflowName}:`, error);
      }
    }
  }

  /**
   * Convert entity to document content.
   */
  convertEntityToDocumentContent(entity: any): DocumentContent {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title||`${entity.type} Document`,
      content: entity.content||',
      metadata: {
        entityId: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        version: entity.version,
        status: entity.status,
      },
    };
  }

  /**
   * Execute workflow step with enhanced error handling (public method).
   */
  async executeWorkflowStepPublic(
    step: WorkflowStep,
    context: WorkflowContext,
    _workflowId: string
  ): Promise<StepExecutionResult> {
    const startTime = new Date();

    try {
      const handler = this.stepHandlers.get(step.type);
      if (!handler) {
        throw new Error(`No handler found for step type: ${step.type}`);
      }

      const output = await handler(context, step.params|'|{});
      const duration = DateCalculator.getDurationMs(startTime);

      return { success: true, output, duration };
    } catch (error) {
      const duration = DateCalculator.getDurationMs(startTime);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
      };
    }
  }

  /**
   * Get workflow data by ID.
   */
  async getWorkflowData(workflowId: string): Promise<WorkflowData|null> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return null;
    }

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

  /**
   * Create workflow from data.
   */
  async createWorkflowFromData(data: WorkflowData): Promise<string> {
    const definition: WorkflowDefinition = {
      name: data.name,
      description: data.description,
      version: data.version,
      steps: [],
    };

    const result = await this.startWorkflow(definition, data.data||{});
    if (!(result.success && result.workflowId)) {
      throw new Error(`Failed to create workflow: ${result.error}`);
    }

    return result.workflowId;
  }

  /**
   * Update workflow data.
   */
  async updateWorkflowData(
    workflowId: string,
    updates: Partial<WorkflowData>
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (updates.data) {
      Object.assign(workflow.context, updates.data);
    }

    await this.saveWorkflow(workflow);
  }

  /**
   * Intelligent workflow analysis using LLM.
   * Analyzes workflow performance and suggests optimizations.
   */
  async analyzeWorkflowIntelligently(workflowId: string): Promise<{
    performance: {
      averageExecutionTime: number;
      successRate: number;
      bottlenecks: string[];
    };
    suggestions: string[];
    optimizations: string[];
  }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Gather workflow performance data
    const performanceData = {
      executionHistory: workflow.steps.map((step) => ({
        name: step.name||step.type,
        avgDuration: 0, // Would be calculated from actual metrics
        errorRate: 0,
        retryCount: step.retries||0,
      })),
      totalExecutions: 1, // Would be tracked in real metrics
      successfulExecutions: workflow.status ==='completed' ? 1 : 0,
      currentStatus: workflow.status,
    };

    // Use LLM to analyze workflow performance
    const llm = getGlobalLLM();
    llm.setRole('analyst');

    const analysisPrompt = `Analyze this workflow performance data and provide optimization suggestions:

Workflow: ${workflow.definition.name}
Description: ${workflow.definition.description||'No description'}
Steps: ${workflow.definition.steps.length}
Current Status: ${workflow.status}

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Please provide:
1. Performance analysis (bottlenecks, efficiency issues)
2. Specific optimization suggestions
3. Recommended improvements

Format as JSON with keys: performance, suggestions, optimizations`;

    try {
      // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK
      const analysis = await llm.complete(analysisPrompt, {
        temperature: 0.3, // Accepted - may be ignored if not supported (lower temperature for more focused analysis)
        maxTokens: 1500, // Accepted - may be ignored if not supported
      });

      // Parse LLM response
      const parsedAnalysis = JSON.parse(analysis);

      logger.info(`Intelligent analysis completed for workflow ${workflowId}`, {
        suggestions: parsedAnalysis.suggestions?.length||0,
        optimizations: parsedAnalysis.optimizations?.length||0,
        operation:'intelligent_workflow_analysis',
      });

      return parsedAnalysis;
    } catch (error) {
      logger.error('Failed to perform intelligent workflow analysis:', error);

      if (error instanceof SyntaxError) {
        throw new Error(
          'LLM response parsing failed - invalid JSON format returned'
        );
      }

      throw new Error('Intelligent workflow analysis failed');
    }
  }

  /**
   * Generate intelligent workflow documentation using LLM.
   */
  async generateWorkflowDocumentation(workflowId: string): Promise<{
    overview: string;
    stepDescriptions: { [stepName: string]: string };
    usageGuide: string;
    troubleshooting: string[];
  }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const llm = getGlobalLLM();
    llm.setRole('architect'); // Use architect role for documentation

    const docPrompt = `Generate comprehensive documentation for this workflow:

Workflow Name: ${workflow.definition.name}
Description: ${workflow.definition.description||'No description provided'}

Steps:
${workflow.definition.steps.map((step, index) => `${index + 1}. ${step.name||step.type} (${step.type})`).join('\n')}

Please generate:
1. Overview - high-level explanation of what this workflow does
2. Step descriptions - detailed explanation of each step
3. Usage guide - how to use this workflow effectively
4. Troubleshooting - common issues and solutions

Format as JSON with keys: overview, stepDescriptions, usageGuide, troubleshooting`;

    try {
      // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK
      const documentation = await llm.complete(docPrompt, {
        temperature: 0.4, // Accepted - may be ignored if not supported
        maxTokens: 2000, // Accepted - may be ignored if not supported
      });

      const parsedDocs = JSON.parse(documentation);

      logger.info(`Documentation generated for workflow ${workflowId}`);
      return parsedDocs;
    } catch (error) {
      logger.error('Failed to generate workflow documentation:', error);

      if (error instanceof SyntaxError) {
        throw new Error(
          'LLM response parsing failed - invalid JSON format returned'
        );
      }

      throw new Error('Workflow documentation generation failed');
    }
  }

  /**
   * Suggest workflow optimizations based on patterns and best practices.
   */
  async suggestWorkflowOptimizations(
    workflowDefinition: WorkflowDefinition
  ): Promise<{
    structuralSuggestions: string[];
    performanceSuggestions: string[];
    reliabilitySuggestions: string[];
    maintainabilitySuggestions: string[];
  }> {
    const llm = getGlobalLLM();
    llm.setRole('architect');

    const optimizationPrompt = `Analyze this workflow definition and suggest optimizations:

${JSON.stringify(workflowDefinition, null, 2)}

Please analyze for:
1. Structural improvements (step organization, dependencies)
2. Performance optimizations (parallel execution, caching)
3. Reliability enhancements (error handling, retries)
4. Maintainability improvements (naming, documentation)

Provide specific, actionable suggestions for each category.
Format as JSON with keys: structuralSuggestions, performanceSuggestions, reliabilitySuggestions, maintainabilitySuggestions`;

    try {
      // Note: temperature and maxTokens are accepted but may not be supported by Claude Code SDK
      const suggestions = await llm.complete(optimizationPrompt, {
        temperature: 0.3, // Accepted - may be ignored if not supported
        maxTokens: 2000, // Accepted - may be ignored if not supported
      });

      const parsedSuggestions = JSON.parse(suggestions);

      logger.info('Workflow optimization suggestions generated', {
        workflowName: workflowDefinition.name,
        totalSuggestions: Object.values(parsedSuggestions).flat().length,
      });

      return parsedSuggestions;
    } catch (error) {
      logger.error(
        'Failed to generate workflow optimization suggestions:',
        error
      );

      if (error instanceof SyntaxError) {
        throw new Error(
          'LLM response parsing failed - invalid JSON format returned'
        );
      }

      throw new Error('Workflow optimization analysis failed');
    }
  }

  /**
   * Enhanced shutdown with cleanup.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down WorkflowEngine...');

    const activeWorkflowIds = Array.from(this.activeWorkflows.keys())();
    for (const workflowId of activeWorkflowIds) {
      try {
        await this.cancelWorkflow(workflowId);
      } catch (error) {
        logger.error(`Error cancelling workflow ${workflowId}:`, error);
      }
    }

    await this.cleanup();
    this.isInitialized = false;
  }
}

export default WorkflowEngine;
