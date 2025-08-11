/**
 * @fileoverview Workflows Domain - Clean Architecture
 *
 * Single source of truth for all workflow functionality.
 * Google TypeScript style with unified, focused implementation.
 */
export type { DocumentContent, StepExecutionResult, WorkflowContext, WorkflowData, WorkflowDefinition, WorkflowEngineConfig, WorkflowState, WorkflowStep, } from './workflow-engine.ts';
export { WorkflowEngine, WorkflowEngine as default } from './workflow-engine.ts';
import { WorkflowEngine } from './workflow-engine.ts';
export declare const WorkflowUtils: {
    /**
     * Create a simple workflow definition.
     *
     * @param name
     * @param steps
     */
    createWorkflow: (name: string, steps: any[]) => any;
    /**
     * Create a delay step.
     *
     * @param duration
     * @param name
     */
    createDelayStep: (duration: number, name?: string) => {
        type: string;
        name: string;
        params: {
            duration: number;
        };
    };
    /**
     * Create a transform step.
     *
     * @param input
     * @param transformation
     * @param output
     * @param name
     */
    createTransformStep: (input: string, transformation: any, output?: string, name?: string) => {
        type: string;
        name: string;
        params: {
            input: string;
            transformation: any;
        };
        output: string | undefined;
    };
    /**
     * Create a conditional step.
     *
     * @param condition
     * @param thenStep
     * @param elseStep
     * @param name
     */
    createConditionStep: (condition: string, thenStep: any, elseStep?: any, name?: string) => {
        type: string;
        name: string;
        params: {
            condition: string;
            thenStep: any;
            elseStep: any;
        };
    };
    /**
     * Create a parallel execution step.
     *
     * @param tasks
     * @param name
     */
    createParallelStep: (tasks: any[], name?: string) => {
        type: string;
        name: string;
        params: {
            tasks: any[];
        };
    };
    /**
     * Create a loop step.
     *
     * @param items
     * @param step
     * @param name
     */
    createLoopStep: (items: string, step: any, name?: string) => {
        type: string;
        name: string;
        params: {
            items: string;
            step: any;
        };
    };
    /**
     * Validate workflow definition.
     *
     * @param workflow
     */
    validateWorkflow: (workflow: any) => boolean;
    /**
     * Get workflow progress percentage.
     *
     * @param currentStep
     * @param totalSteps
     */
    calculateProgress: (currentStep: number, totalSteps: number) => number;
};
export declare class WorkflowFactory {
    private static instances;
    /**
     * Create or get a workflow engine instance.
     *
     * @param config
     * @param instanceKey
     */
    static getInstance(config?: any, instanceKey?: string): WorkflowEngine;
    /**
     * Clear all cached instances.
     */
    static clearInstances(): void;
    /**
     * Get all active engine instances.
     */
    static getActiveInstances(): string[];
}
//# sourceMappingURL=index.d.ts.map