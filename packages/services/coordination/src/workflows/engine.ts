import { getLogger as _getLogger } from '@claude-zen/foundation';
/**
 * @file Engine implementation - Battle-Tested Workflow Processing
 *
 * Professional workflow engine using battle-tested libraries for reliability.
 */

import { mkdir as _mkdir } from 'node:fs/promises';
import {
  getLogger,
  generateUUID,
  generateNanoId,
  DateFormatter,
  ObjectProcessor,
  getKVStore,
  EventEmitter,
} from '@claude-zen/foundation';
import {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowState,
  WorkflowStep,
  WorkflowEngineConfig,
  StepExecutionResult,
} from './types';

const logger = getLogger('WorkflowEngine');

/**
 * Workflow Engine
 * Sequential workflow processing engine using battle-tested libraries.
 * Replaced custom implementations with reliable, optimized solutions.
 */
export class WorkflowEngine extends EventEmitter {
  private readonly config: Required<WorkflowEngineConfig>;
  private activeWorkflows = new Map<string, WorkflowState>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private stepHandlers = new Map<
    string,
    (_context: WorkflowContext, params: unknown) => Promise<unknown>
  >();
  private isInitialized = false;
  private kvStore: unknown;
  private scheduledTasks = new Map<string, unknown>();
  private workflowStateMachines = new Map<string, unknown>();

  constructor(config: Partial<WorkflowEngineConfig> = {}) {
    super();
    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows ?? 10,
      persistWorkflows: config.persistWorkflows ?? false,
      persistencePath: config.persistencePath ?? './workflows',
      stepTimeout: config.stepTimeout ?? 30000,
      retryDelay: config.retryDelay ?? 1000,
      enableVisualization: config.enableVisualization ?? false,
      enableAdvancedOrchestration: config.enableAdvancedOrchestration ?? true,
      ...config,
    };

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

  private registerBuiltInHandlers(): void {
    // Delay step
    this.registerStepHandler(
      'delay',
      async (_context: WorkflowContext, params: unknown) => {
        const duration =
          ((params as Record<string, unknown>)?.duration as number) || 1000;
        await new Promise((resolve) => setTimeout(resolve, duration));
        return { delayed: duration };
      }
    );

    // Transform data step
    this.registerStepHandler(
      'transform',
      async (_context: WorkflowContext, params: unknown) => {
        const data = this.getContextValue(
          context,
          (params as Record<string, unknown>)?.input as string
        );
        const transformed = await this.applyTransformation(
          data,
          (params as Record<string, unknown>)?.transformation
        );
        return { output: transformed };
      }
    );

    // Parallel execution step
    this.registerStepHandler(
      'parallel',
      async (_context: WorkflowContext, params: unknown) => {
        const tasks =
          ((params as Record<string, unknown>)?.tasks as WorkflowStep[]) || [];

        const results = await Promise.all(
          tasks.map((task: WorkflowStep) => this.executeStep(task, context))
        );
        return { results };
      }
    );

    // Loop step
    this.registerStepHandler(
      'loop',
      async (_context: WorkflowContext, params: unknown) => {
        const items = this.getContextValue(
          context,
          (params as Record<string, unknown>)?.items as string
        );
        const step = (params as Record<string, unknown>)?.step as WorkflowStep;

        if (!Array.isArray(items)) {
          throw new Error('Loop items must be an array');
        }

        const results = [];
        for (const item of items) {
          const loopContext = { ...context, loopItem: item };
          const result = await this.executeStep(step, loopContext);
          results.push(result);
        }
        return { results };
      }
    );

    // Conditional step
    this.registerStepHandler(
      'condition',
      async (_context: WorkflowContext, params: unknown) => {
        const condition = this.evaluateCondition(
          context,
          (params as Record<string, unknown>)?.condition as string
        );

        if (condition) {
          return await this.executeStep(
            (params as Record<string, unknown>)?.thenStep as WorkflowStep,
            context
          );
        }

        if ((params as Record<string, unknown>)?.elseStep) {
          return await this.executeStep(
            (params as Record<string, unknown>)?.elseStep as WorkflowStep,
            context
          );
        }

        return { skipped: true };
      }
    );
  }

  registerStepHandler(
    type: string,
    handler: (_context: WorkflowContext, params: unknown) => Promise<unknown>
  ): void {
    this.stepHandlers.set(type, handler);
  }

  async executeStep(
    step: WorkflowStep,
    _context: WorkflowContext
  ): Promise<StepExecutionResult> {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}"Fixed template literal"workflow:${workflow.id}"Fixed unterminated template"(`[WorkflowEngine] Saved workflow ${workflow.id} to storage"Fixed unterminated template" `[WorkflowEngine] Failed to save workflow ${workflow.id} to storage:"Fixed unterminated template"(`Registering workflow definition: ${name}"Fixed unterminated template"(`Workflow started: ${definition.name} (${workflowId})"Fixed unterminated template"(`[WorkflowEngine] Workflow ${workflowId} failed:"Fixed unterminated template" `Workflow completed: ${workflow.definition.name} (${workflow.id})"Fixed unterminated template" `Workflow paused: ${workflow.definition.name} (${workflowId})"Fixed unterminated template" `Workflow resumed: ${workflow.definition.name} (${workflowId})"Fixed unterminated template" `[WorkflowEngine] Workflow ${workflowId} failed after resume:"Fixed unterminated template" `Workflow cancelled: ${workflow.definition.name} (${workflowId})"Fixed unterminated template"(`workflow:${workflowId}"Fixed unterminated template" `[WorkflowEngine] Scheduled workflow: ${workflowName} with ${cronExpression}"Fixed unterminated template"(`[WorkflowEngine] Started schedule: ${scheduleId}"Fixed unterminated template"(`[WorkflowEngine] Stopped schedule: ${scheduleId}"Fixed unterminated template"(`[WorkflowEngine] Removed schedule: ${scheduleId}"Fixed unterminated template" `  ${index}[${step.name || step.type}]\n"Fixed unterminated template" `  ${index} --> ${index + 1}\n"Fixed unterminated template"(`[WorkflowEngine] Destroyed scheduled task: ${id}"Fixed unterminated template"(`[WorkflowEngine] Stopped state machine: ${id}"Fixed unterminated template"