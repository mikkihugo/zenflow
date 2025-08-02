/**
 * Workflows Domain - Index
 * Exports for workflow execution and management
 * Migrated from plugins to proper domain structure
 */

// Re-export workflow types
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
   * Create a simple workflow definition
   */
  createWorkflow: (name: string, steps: any[]): any => ({
    name,
    steps,
    version: '1.0.0',
    description: `Auto-generated workflow: ${name}`,
  }),

  /**
   * Create a delay step
   */
  createDelayStep: (duration: number, name?: string) => ({
    type: 'delay',
    name: name || `Delay ${duration}ms`,
    params: { duration },
  }),

  /**
   * Create a transform step
   */
  createTransformStep: (input: string, transformation: any, output?: string, name?: string) => ({
    type: 'transform',
    name: name || 'Transform Data',
    params: { input, transformation },
    output,
  }),

  /**
   * Create a conditional step
   */
  createConditionStep: (condition: string, thenStep: any, elseStep?: any, name?: string) => ({
    type: 'condition',
    name: name || 'Conditional Step',
    params: { condition, thenStep, elseStep },
  }),

  /**
   * Create a parallel execution step
   */
  createParallelStep: (tasks: any[], name?: string) => ({
    type: 'parallel',
    name: name || 'Parallel Execution',
    params: { tasks },
  }),

  /**
   * Create a loop step
   */
  createLoopStep: (items: string, step: any, name?: string) => ({
    type: 'loop',
    name: name || 'Loop',
    params: { items, step },
  }),

  /**
   * Validate workflow definition
   */
  validateWorkflow: (workflow: any): boolean => {
    if (!workflow.name || !workflow.steps || !Array.isArray(workflow.steps)) {
      return false;
    }

    return workflow.steps.every((step: any) => step.type && typeof step.type === 'string');
  },

  /**
   * Get workflow progress percentage
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
   * Create or get a workflow engine instance
   */
  static getInstance(config: any = {}, instanceKey = 'default'): WorkflowEngine {
    if (!WorkflowFactory.instances.has(instanceKey)) {
      const engine = new WorkflowEngine(config);
      WorkflowFactory.instances.set(instanceKey, engine);
    }

    return WorkflowFactory.instances.get(instanceKey)!;
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    for (const [, engine] of WorkflowFactory.instances) {
      engine.cleanup();
    }
    WorkflowFactory.instances.clear();
  }

  /**
   * Get all active engine instances
   */
  static getActiveInstances(): string[] {
    return Array.from(WorkflowFactory.instances.keys());
  }
}
