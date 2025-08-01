/**
 * Workflow Engine Plugin
 * Default sequential workflow processing engine
 */

import { EventEmitter } from 'node:events';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

// TODO: Import from BasePlugin once it's fixed
// import { BasePlugin } from '../base-plugin.js';

// Temporary minimal BasePlugin interface until BasePlugin is fixed
abstract class BasePlugin extends EventEmitter {
  protected state: string = 'uninitialized';
  protected config: any = {};

  constructor(manifest: any, config: any = {}) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.state = 'initialized';
  }

  async saveWorkflow(_workflow: any): Promise<void> {
    // Stub implementation - will be implemented when BasePlugin is fixed
  }
}

export interface WorkflowStep {
  type: string;
  name?: string;
  params?: Record<string, any>;
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
  [key: string]: any;
}

export interface WorkflowState {
  id: string;
  definition: WorkflowDefinition;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  context: WorkflowContext;
  currentStep: number;
  steps: WorkflowStep[];
  stepResults: Record<string, any>;
  completedSteps: Array<{
    index: number;
    step: WorkflowStep;
    result: any;
    duration: number;
    timestamp: string;
  }>;
  startTime: string;
  endTime?: string;
  pausedAt?: string;
  error?: string;
}

export class WorkflowEnginePlugin extends BasePlugin {
  private activeWorkflows = new Map<string, WorkflowState>();
  private workflowMetrics = new Map<string, any>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private stepHandlers = new Map<string, (context: WorkflowContext, params: any) => Promise<any>>();
  private engine: DefaultWorkflowEngine;

  constructor(config: any = {}) {
    super(
      {
        name: 'workflow-engine',
        version: '1.0.0',
        description: 'Sequential workflow processing engine',
      },
      config
    );

    this.config = {
      maxConcurrentWorkflows: 10,
      persistWorkflows: false,
      persistencePath: './workflows',
      stepTimeout: 30000,
      retryDelay: 1000,
      enableVisualization: false,
      ...config,
    };

    this.engine = new DefaultWorkflowEngine(this.config, this);
  }

  async initialize(): Promise<void> {
    if (this.state === 'initialized') return;

    console.log('[WorkflowEngine] Initializing workflow engine plugin');

    // Create persistence directory
    if (this.config.persistWorkflows) {
      await mkdir(this.config.persistencePath, { recursive: true });
    }

    await this.engine.initialize();

    // Register built-in step handlers
    this.registerBuiltInHandlers();

    // Load persisted workflows
    if (this.config.persistWorkflows) {
      await this.loadPersistedWorkflows();
    }

    await super.initialize();
    this.emit('initialized');
    console.log('[WorkflowEngine] Workflow engine plugin initialized');
  }

  registerBuiltInHandlers(): void {
    // Delay step
    this.registerStepHandler('delay', async (context: WorkflowContext, params: any) => {
      const duration = params.duration || 1000;
      await new Promise((resolve) => setTimeout(resolve, duration));
      return { delayed: duration };
    });

    // Transform data step
    this.registerStepHandler('transform', async (context: WorkflowContext, params: any) => {
      const data = this.getContextValue(context, params.input);
      const transformed = await this.applyTransformation(data, params.transformation);
      return { output: transformed };
    });

    // Parallel execution step
    this.registerStepHandler('parallel', async (context: WorkflowContext, params: any) => {
      const results = await Promise.all(
        params.tasks.map((task: WorkflowStep) => this.executeStep(task, context))
      );
      return { results };
    });

    // Loop step
    this.registerStepHandler('loop', async (context: WorkflowContext, params: any) => {
      const items = this.getContextValue(context, params.items);
      const results: any[] = [];

      for (const item of items) {
        const loopContext = { ...context, loopItem: item };
        const result = await this.executeStep(params.step, loopContext);
        results.push(result);
      }

      return { results };
    });

    // Conditional step
    this.registerStepHandler('condition', async (context: WorkflowContext, params: any) => {
      const condition = this.evaluateCondition(context, params.condition);
      if (condition) {
        return await this.executeStep(params.thenStep, context);
      } else if (params.elseStep) {
        return await this.executeStep(params.elseStep, context);
      }
      return { skipped: true };
    });
  }

  registerStepHandler(
    type: string,
    handler: (context: WorkflowContext, params: any) => Promise<any>
  ): void {
    this.stepHandlers.set(type, handler);
    console.log(`[WorkflowEngine] Registered step handler: ${type}`);
  }

  async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }

    return await handler(context, step.params || {});
  }

  evaluateCondition(context: WorkflowContext, expression: string): boolean {
    try {
      const contextVars = Object.keys(context)
        .map((key) => `const ${key} = context.${key};`)
        .join('\n');
      const func = new Function('context', `${contextVars}\n return ${expression};`);
      return func(context);
    } catch (error) {
      console.error(`[WorkflowEngine] Failed to evaluate condition: ${expression}`, error);
      return false;
    }
  }

  getContextValue(context: WorkflowContext, path: string): any {
    const parts = path.split('.');
    let value = context;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  async applyTransformation(data: any, transformation: any): Promise<any> {
    if (typeof transformation === 'function') {
      return transformation(data);
    }

    // Simple object transformation
    if (typeof transformation === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(transformation)) {
        if (typeof value === 'string' && value.startsWith('$.')) {
          result[key] = this.getContextValue({ data }, value.substring(2));
        } else {
          result[key] = value;
        }
      }
      return result;
    }

    return data;
  }

  async loadPersistedWorkflows(): Promise<void> {
    try {
      const files = await readdir(this.config.persistencePath);
      const workflowFiles = files.filter((f) => f.endsWith('.workflow.json'));

      for (const file of workflowFiles) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));

        if (data.status === 'running' || data.status === 'paused') {
          this.activeWorkflows.set(data.id, data);
          console.log(`[WorkflowEngine] Loaded persisted workflow: ${data.id}`);
        }
      }
    } catch (error) {
      console.error('[WorkflowEngine] Failed to load persisted workflows:', error);
    }
  }

  async saveWorkflow(workflow: WorkflowState): Promise<void> {
    if (!this.config.persistWorkflows) return;

    try {
      const filePath = path.join(this.config.persistencePath, `${workflow.id}.workflow.json`);
      await writeFile(filePath, JSON.stringify(workflow, null, 2));
    } catch (error) {
      console.error(`[WorkflowEngine] Failed to save workflow ${workflow.id}:`, error);
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    if (!this.config.persistWorkflows) return;

    try {
      const filePath = path.join(this.config.persistencePath, `${workflowId}.workflow.json`);
      await unlink(filePath);
    } catch (error) {
      // File might not exist - this is OK
    }
  }

  async registerWorkflowDefinition(name: string, definition: WorkflowDefinition): Promise<void> {
    this.workflowDefinitions.set(name, definition);
    console.log(`[WorkflowEngine] Registered workflow definition: ${name}`);
  }

  async startWorkflow(
    workflowDefinitionOrName: string | WorkflowDefinition,
    context: WorkflowContext = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    let definition: WorkflowDefinition;

    if (typeof workflowDefinitionOrName === 'string') {
      const foundDefinition = this.workflowDefinitions.get(workflowDefinitionOrName);
      if (!foundDefinition) {
        throw new Error(`Workflow definition '${workflowDefinitionOrName}' not found`);
      }
      definition = foundDefinition;
    } else {
      definition = workflowDefinitionOrName;
    }

    // Check concurrent workflow limit
    const activeCount = Array.from(this.activeWorkflows.values()).filter(
      (w) => w.status === 'running'
    ).length;

    if (activeCount >= this.config.maxConcurrentWorkflows) {
      throw new Error(
        `Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`
      );
    }

    const result = await this.engine.startWorkflow(definition, context);

    if (result.success) {
      this.emit('workflow-started', result.workflowId);
    }

    return result;
  }

  async pauseWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.engine.pauseWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow-paused', workflowId);
    }
    return result;
  }

  async resumeWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.engine.resumeWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow-resumed', workflowId);
    }
    return result;
  }

  async cancelWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.engine.cancelWorkflow(workflowId);
    if (result.success) {
      this.emit('workflow-cancelled', workflowId);
    }
    return result;
  }

  async getWorkflowHistory(limit: number = 100): Promise<WorkflowState[]> {
    const history: WorkflowState[] = [];

    if (!this.config.persistWorkflows) {
      return Array.from(this.activeWorkflows.values()).slice(-limit);
    }

    try {
      const files = await readdir(this.config.persistencePath);
      const workflowFiles = files.filter((f) => f.endsWith('.workflow.json'));

      for (const file of workflowFiles.slice(-limit)) {
        const filePath = path.join(this.config.persistencePath, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        history.push(data);
      }

      return history.sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error('[WorkflowEngine] Failed to get workflow history:', error);
      return [];
    }
  }

  async getWorkflowMetrics(): Promise<any> {
    const workflows = Array.from(this.activeWorkflows.values());
    const metrics: any = {
      total: workflows.length,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    workflows.forEach((w) => {
      metrics[w.status] = (metrics[w.status] || 0) + 1;
    });

    const completed = workflows.filter((w) => w.status === 'completed');
    if (completed.length > 0) {
      const totalDuration = completed.reduce((sum, w) => {
        return sum + (new Date(w.endTime!).getTime() - new Date(w.startTime).getTime());
      }, 0);
      metrics.averageDuration = totalDuration / completed.length;
    }

    if (metrics.total > 0) {
      metrics.successRate = metrics.completed / metrics.total;
    }

    return metrics;
  }

  generateWorkflowVisualization(workflow: WorkflowState): string | null {
    if (!this.config.enableVisualization) return null;

    // Generate a simple Mermaid diagram
    const lines = ['graph TD'];

    workflow.steps.forEach((step, index) => {
      const nodeId = `step${index}`;
      const label = step.name || step.type;
      const status =
        index < workflow.currentStep
          ? 'completed'
          : index === workflow.currentStep
            ? 'current'
            : 'pending';

      lines.push(`    ${nodeId}[${label}]`);

      if (status === 'completed') {
        lines.push(`    style ${nodeId} fill:#90EE90`);
      } else if (status === 'current') {
        lines.push(`    style ${nodeId} fill:#FFD700`);
      }

      if (index > 0) {
        lines.push(`    step${index - 1} --> ${nodeId}`);
      }
    });

    return lines.join('\n');
  }
}

class DefaultWorkflowEngine extends EventEmitter {
  private config: any;
  private plugin: WorkflowEnginePlugin;
  private workflows = new Map<string, WorkflowState>();

  constructor(config: any, plugin: WorkflowEnginePlugin) {
    super();
    this.config = config;
    this.plugin = plugin;
  }

  async initialize(): Promise<void> {
    console.log('[DefaultWorkflowEngine] Default workflow engine ready');
  }

  async startWorkflow(
    definition: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workflow: WorkflowState = {
      id: workflowId,
      definition,
      status: 'pending',
      context,
      currentStep: 0,
      steps: definition.steps,
      stepResults: {},
      completedSteps: [],
      startTime: new Date().toISOString(),
    };

    this.workflows.set(workflowId, workflow);
    this.plugin['activeWorkflows'].set(workflowId, workflow);

    // Start execution asynchronously
    this.executeWorkflow(workflow).catch((error) => {
      console.error(`[DefaultWorkflowEngine] Workflow ${workflowId} failed:`, error);
    });

    return { success: true, workflowId };
  }

  private async executeWorkflow(workflow: WorkflowState): Promise<void> {
    try {
      workflow.status = 'running';
      await this.plugin.saveWorkflow(workflow);

      for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
        if (workflow.status !== 'running') {
          break; // Workflow was paused or cancelled
        }

        const step = workflow.steps[i];
        workflow.currentStep = i;
        await this.executeWorkflowStep(workflow, step, i);
      }

      if (workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.endTime = new Date().toISOString();
        this.emit('workflow-completed', workflow.id);
      }
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = (error as Error).message;
      workflow.endTime = new Date().toISOString();
      this.emit('workflow-failed', workflow.id, error);
    } finally {
      await this.plugin.saveWorkflow(workflow);
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
        const timeout = step.timeout || this.config.stepTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), timeout);
        });

        // Execute step
        const stepPromise = this.plugin.executeStep(step, workflow.context);
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
          timestamp: new Date().toISOString(),
        });

        this.emit('step-completed', workflow.id, stepId, result);
        break;
      } catch (error) {
        retries++;

        console.warn(
          `[DefaultWorkflowEngine] Step ${step.name} failed (attempt ${retries}/${maxRetries + 1}): ${(error as Error).message}`
        );

        if (retries > maxRetries) {
          this.emit('step-failed', workflow.id, stepId, error);

          if (step.onError === 'continue') {
            workflow.stepResults[stepId] = { error: (error as Error).message };
            break;
          } else if (step.onError === 'skip') {
            workflow.stepResults[stepId] = { skipped: true };
            break;
          } else {
            throw error;
          }
        } else {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * retries));
        }
      }
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const duration = workflow.endTime
      ? new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()
      : Date.now() - new Date(workflow.startTime).getTime();

    return {
      id: workflow.id,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      progress:
        workflow.steps.length > 0 ? (workflow.currentStep / workflow.steps.length) * 100 : 0,
      startTime: workflow.startTime,
      endTime: workflow.endTime,
      duration,
      error: workflow.error,
    };
  }

  async pauseWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.pausedAt = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not running' };
  }

  async resumeWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      delete workflow.pausedAt;

      // Resume execution
      this.executeWorkflow(workflow).catch((error) => {
        console.error(`[DefaultWorkflowEngine] Workflow ${workflowId} failed after resume:`, error);
      });

      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not paused' };
  }

  async cancelWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && ['running', 'paused'].includes(workflow.status)) {
      workflow.status = 'cancelled';
      workflow.endTime = new Date().toISOString();
      await this.plugin.saveWorkflow(workflow);
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not active' };
  }

  async getActiveWorkflows(): Promise<any[]> {
    const active = Array.from(this.workflows.values())
      .filter((w) => ['running', 'paused'].includes(w.status))
      .map((w) => ({
        id: w.id,
        name: w.definition?.name,
        status: w.status,
        currentStep: w.currentStep,
        totalSteps: w.steps.length,
        progress: w.steps.length > 0 ? (w.currentStep / w.steps.length) * 100 : 0,
        startTime: w.startTime,
        pausedAt: w.pausedAt,
      }));

    return active;
  }

  async cleanup(): Promise<void> {
    this.workflows.clear();
    this.removeAllListeners();
  }
}

export default WorkflowEnginePlugin;
