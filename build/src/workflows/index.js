/**
 * @fileoverview Workflows Domain - Clean Architecture
 *
 * Single source of truth for all workflow functionality.
 * Google TypeScript style with unified, focused implementation.
 */
// Primary exports from unified engine
export { WorkflowEngine, WorkflowEngine as default } from './workflow-engine.ts';
// Import for factory use
import { WorkflowEngine } from './workflow-engine.ts';
// Workflow utilities
export const WorkflowUtils = {
    /**
     * Create a simple workflow definition.
     *
     * @param name
     * @param steps
     */
    createWorkflow: (name, steps) => ({
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
    createDelayStep: (duration, name) => ({
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
    createTransformStep: (input, transformation, output, name) => ({
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
    createConditionStep: (condition, thenStep, elseStep, name) => ({
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
    createParallelStep: (tasks, name) => ({
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
    createLoopStep: (items, step, name) => ({
        type: 'loop',
        name: name || 'Loop',
        params: { items, step },
    }),
    /**
     * Validate workflow definition.
     *
     * @param workflow
     */
    validateWorkflow: (workflow) => {
        if (!workflow.name || !workflow.steps || !Array.isArray(workflow.steps)) {
            return false;
        }
        return workflow.steps.every((step) => step.type && typeof step.type === 'string');
    },
    /**
     * Get workflow progress percentage.
     *
     * @param currentStep
     * @param totalSteps
     */
    calculateProgress: (currentStep, totalSteps) => {
        if (totalSteps === 0)
            return 0;
        return Math.round((currentStep / totalSteps) * 100);
    },
};
// Workflow factory for creating engines
export class WorkflowFactory {
    static instances = new Map();
    /**
     * Create or get a workflow engine instance.
     *
     * @param config
     * @param instanceKey
     */
    static getInstance(config = {}, instanceKey = 'default') {
        if (!WorkflowFactory.instances.has(instanceKey)) {
            const engine = new WorkflowEngine(config);
            WorkflowFactory.instances.set(instanceKey, engine);
        }
        return WorkflowFactory.instances.get(instanceKey);
    }
    /**
     * Clear all cached instances.
     */
    static clearInstances() {
        for (const [, engine] of WorkflowFactory.instances) {
            engine.cleanup();
        }
        WorkflowFactory.instances.clear();
    }
    /**
     * Get all active engine instances.
     */
    static getActiveInstances() {
        return Array.from(WorkflowFactory.instances.keys());
    }
}
