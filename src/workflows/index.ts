/**
 * Workflows Domain - Index
 * Exports for workflow execution and management.
 * Migrated from plugins to proper domain structure.
 */

// Re-export workflow types
/**
 * @file workflows module exports
 */


export type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './engine';
// Core workflow engine
export { WorkflowEngine, WorkflowEngine as default } from './engine';

// Import for factory use
import { WorkflowEngine } from './engine';

// Workflow utilities
export const WorkflowUtils = {
  /**
   * Create a simple workflow definition.
   *
   * @param name
   * @param steps
   */
  createWorkflow: (name: string, steps: any[]): any => ({
    name,
    steps,
    version: '1.0.0',
    description: `Auto-generated workflow: ${name}`,
  }),

  /**
   * Create a delay step.
   *
   * @param duration
   * @param name
   */
  createDelayStep: (duration: number, name?: string) => ({
    type: 'delay',
    name: name || `Delay ${duration}ms`,
    params: { duration },
  }),

  /**
   * Create a transform step.
   *
   * @param input
   * @param transformation
   * @param output
   * @param name
   */
  createTransformStep: (input: string, transformation: any, output?: string, name?: string) => ({
    type: 'transform',
    name: name || 'Transform Data',
    params: { input, transformation },
    output,
  }),

  /**
   * Create a conditional step.
   *
   * @param condition
   * @param thenStep
   * @param elseStep
   * @param name
   */
  createConditionStep: (condition: string, thenStep: any, elseStep?: any, name?: string) => ({
    type: 'condition',
    name: name || 'Conditional Step',
    params: { condition, thenStep, elseStep },
  }),

  /**
   * Create a parallel execution step.
   *
   * @param tasks
   * @param name
   */
  createParallelStep: (tasks: any[], name?: string) => ({
    type: 'parallel',
    name: name || 'Parallel Execution',
    params: { tasks },
  }),

  /**
   * Create a loop step.
   *
   * @param items
   * @param step
   * @param name
   */
  createLoopStep: (items: string, step: any, name?: string) => ({
    type: 'loop',
    name: name || 'Loop',
    params: { items, step },
  }),

  /**
   * Validate workflow definition.
   *
   * @param workflow
   */
  validateWorkflow: (workflow: any): boolean => {
    if (!workflow.name || !workflow.steps || !Array.isArray(workflow.steps)) {
      return false;
    }

    return workflow.steps.every((step: any) => step.type && typeof step.type === 'string');
  },

  /**
   * Get workflow progress percentage.
   *
   * @param currentStep
   * @param totalSteps
   */
  calculateProgress: (currentStep: number, totalSteps: number): number => {
    if (totalSteps === 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  },
};

// Workflow factory for creating engines
export class WorkflowFactory {
  private static instances = new Map<string, WorkflowEngine>();

  /**
   * Create or get a workflow engine instance.
   *
   * @param config
   * @param instanceKey
   */
  static getInstance(config: any = {}, instanceKey = 'default'): WorkflowEngine {
    if (!WorkflowFactory.instances.has(instanceKey)) {
      const engine = new WorkflowEngine(config);
      WorkflowFactory.instances.set(instanceKey, engine);
    }

    return WorkflowFactory.instances.get(instanceKey)!;
  }

  /**
   * Clear all cached instances.
   */
  static clearInstances(): void {
    for (const [, engine] of WorkflowFactory.instances) {
      engine.cleanup();
    }
    WorkflowFactory.instances.clear();
  }

  /**
   * Get all active engine instances.
   */
  static getActiveInstances(): string[] {
    return Array.from(WorkflowFactory.instances.keys());
  }
}
