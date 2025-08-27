/**
 * @fileoverview Workflow State Machine - XState 5.20.2 Compatible
 *
 * Simplified XState machine definition for workflow coordination.
 * Focused on essential workflow management with clean types.
 *
 * SINGLE RESPONSIBILITY: State machine definition and configuration
 * FOCUSES ON: State hierarchy, transitions, essential coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { assign, setup } from 'xstate';
import { createInitialContext } from './workflow-context';
// =============================================================================
// SIMPLIFIED WORKFLOW MACHINE FOR XSTATE 5.20.2
// =============================================================================
/**
 * Essential workflow coordination state machine
 *
 * Simplified design focused on core workflow functionality:
 * - Task state management
 * - Basic flow coordination
 * - Essential monitoring
 */
export const createWorkflowMachine = (config) => {
    return setup({
        types: {
            context: {},
            events: {},
        },
        actions: {
            // Essential actions using assign from XState 5.20.2
            addTask: assign({
                tasks: ({ context, event }) => {
                    if (event.type !== 'TASK_CREATED')
                        return context.tasks;
                    ';
                    return {
                        ...context.tasks,
                        [event.task.id]: event.task,
                    };
                },
            }),
            moveTask: assign({
                tasks: ({ context, event }) => {
                    if (event.type !== 'TASK_MOVED')
                        return context.tasks;
                    ';
                    const task = context.tasks[event.taskId];
                    if (!task)
                        return context.tasks;
                    return {
                        ...context.tasks,
                        [event.taskId]: {
                            ...task,
                            state: event.toState,
                            updatedAt: new Date(),
                        },
                    };
                },
            }),
            recordError: assign({
                errors: ({ context, event }) => {
                    if (event.type !== 'ERROR_OCCURRED')
                        return context.errors;
                    ';
                    const errorEntry = {
                        timestamp: new Date(),
                        error: event.error,
                        context: event.errorContext,
                    };
                    return [...context.errors.slice(-19), errorEntry];
                },
            }),
        },
        guards: {
            // Essential guards
            canMoveTask: ({ context, event }) => {
                if (event.type !== 'TASK_MOVED')
                    return false;
                ';
                return context.tasks[event.taskId] !== undefined;
            },
            isValidTransition: ({ context, event }) => {
                if (event.type !== 'TASK_MOVED')
                    return false;
                ';
                // Simplified validation - allow all moves for now
                return true;
            },
        },
    }).createMachine({
        id: 'workflowMachine',
        initial: 'active',
        context: createInitialContext(config),
        states: {
            active: {
                initial: 'monitoring',
                states: {
                    monitoring: {
                        on: {
                            TASK_CREATED: {
                                actions: 'addTask',
                            },
                            TASK_MOVED: [
                                {
                                    guard: 'canMoveTask',
                                    actions: 'moveTask',
                                },
                            ],
                            ERROR_OCCURRED: {
                                actions: 'recordError',
                            },
                        },
                    },
                    optimizing: {
                        on: {
                            OPTIMIZATION_COMPLETE: {
                                target: 'monitoring',
                            },
                        },
                    },
                },
                on: {
                    PAUSE_OPERATION: {
                        target: 'paused',
                    },
                },
            },
            paused: {
                on: {
                    RESUME_OPERATION: {
                        target: 'active',
                    },
                },
            },
            error: {
                on: {
                    RETRY_OPERATION: {
                        target: 'active',
                    },
                },
            },
        },
    });
};
// =============================================================================
// MACHINE FACTORY & UTILITIES
// =============================================================================
/**
 * Create configured workflow machine instance with default services
 */
export const createConfiguredWorkflowMachine = (config) => {
    return createWorkflowMachine(config);
};
/**
 * Default workflow configuration for development/testing
 */
export const createDefaultWorkflowConfig = () => ({
    enableIntelligentWIP: true,
    enableBottleneckDetection: true,
    enableFlowOptimization: true,
    enableRealTimeMonitoring: true,
    enablePredictiveAnalytics: false,
    // Learning configuration
    adaptationRate: 0.1,
    // WIP limits per state
    defaultWIPLimits: {
        backlog: 100,
        analysis: 5,
        development: 10,
        testing: 8,
        review: 5,
        deployment: 3,
        done: 1000,
        blocked: 10,
        expedite: 2,
        total: 50,
    },
    // Performance optimization
    maxConcurrentTasks: 50,
    wipCalculationInterval: 30000, // 30 seconds
    bottleneckDetectionInterval: 60000, // 1 minute
    optimizationAnalysisInterval: 300000, // 5 minutes
    // Thresholds
    performanceThresholds: [
        {
            metric: 'cycleTime',
            operator: 'gt',
            value: 168, // 1 week in hours
            severity: 'medium',
            alertMessage: 'Cycle time exceeds 1 week threshold',
            enabled: true,
        },
        {
            metric: 'cycleTime',
            operator: 'gt',
            value: 336, // 2 weeks in hours
            severity: 'high',
            alertMessage: 'Cycle time exceeds 2 week threshold',
            enabled: true,
        },
        {
            metric: 'leadTime',
            operator: 'gt',
            value: 240, // 10 days in hours
            severity: 'medium',
            alertMessage: 'Lead time exceeds 10 day threshold',
            enabled: true,
        },
        {
            metric: 'throughput',
            operator: 'lt',
            value: 1, // tasks per day
            severity: 'low',
            alertMessage: 'Throughput below minimum threshold',
            enabled: true,
        },
    ],
});
