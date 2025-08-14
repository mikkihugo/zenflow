export { WorkflowEngine, WorkflowEngine as default, } from './workflow-engine.ts';
import { WorkflowEngine } from './workflow-engine.ts';
export const WorkflowUtils = {
    createWorkflow: (name, steps) => ({
        name,
        steps,
        version: '1.0.0',
        description: `Auto-generated workflow: ${name}`,
    }),
    createDelayStep: (duration, name) => ({
        type: 'delay',
        name: name || `Delay ${duration}ms`,
        params: { duration },
    }),
    createTransformStep: (input, transformation, output, name) => ({
        type: 'transform',
        name: name || 'Transform Data',
        params: { input, transformation },
        output,
    }),
    createConditionStep: (condition, thenStep, elseStep, name) => ({
        type: 'condition',
        name: name || 'Conditional Step',
        params: { condition, thenStep, elseStep },
    }),
    createParallelStep: (tasks, name) => ({
        type: 'parallel',
        name: name || 'Parallel Execution',
        params: { tasks },
    }),
    createLoopStep: (items, step, name) => ({
        type: 'loop',
        name: name || 'Loop',
        params: { items, step },
    }),
    validateWorkflow: (workflow) => {
        if (!(workflow.name && workflow.steps && Array.isArray(workflow.steps))) {
            return false;
        }
        return workflow.steps.every((step) => step.type && typeof step.type === 'string');
    },
    calculateProgress: (currentStep, totalSteps) => {
        if (totalSteps === 0)
            return 0;
        return Math.round((currentStep / totalSteps) * 100);
    },
};
export class WorkflowFactory {
    static instances = new Map();
    static getInstance(config = {}, instanceKey = 'default') {
        if (!WorkflowFactory.instances.has(instanceKey)) {
            const engine = new WorkflowEngine(config);
            WorkflowFactory.instances.set(instanceKey, engine);
        }
        return WorkflowFactory.instances.get(instanceKey);
    }
    static clearInstances() {
        for (const [, engine] of WorkflowFactory.instances) {
            engine.cleanup();
        }
        WorkflowFactory.instances.clear();
    }
    static getActiveInstances() {
        return Array.from(WorkflowFactory.instances.keys());
    }
}
//# sourceMappingURL=index.js.map