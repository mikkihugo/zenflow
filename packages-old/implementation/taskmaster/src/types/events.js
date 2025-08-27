/**
 * @fileoverview Workflow Events - XState Event Definitions
 *
 * Professional type-safe event definitions for XState workflow coordination.
 * All events are strongly typed with payload validation.
 *
 * SINGLE RESPONSIBILITY: Event type definitions
 * FOCUSES ON: Type safety, event payloads, XState integration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
class WorkflowEventUtils {
    /**
     * Create task created event
     */
    static createTaskCreated(task) {
        return {
            type: 'TASK_CREATED',
            task,
        };
    }
    /**
     * Create task moved event
     */
    static createTaskMoved(taskId, fromState, toState, reason) {
        return {
            type: 'TASK_MOVED',
            taskId,
            fromState,
            toState,
            reason,
        };
    }
    /**
     * Create bottleneck detected event
     */
    static createBottleneckDetected(bottleneck) {
        return {
            type: 'BOTTLENECK_DETECTED',
            bottleneck,
        };
    }
    /**
     * Create system health updated event
     */
    static createSystemHealthUpdated(health, previousHealth) {
        return {
            type: 'SYSTEM_HEALTH_UPDATED',
            health,
            previousHealth,
            timestamp: new Date(),
        };
    }
    /**
     * Create error occurred event
     */
    static createErrorOccurred(error, errorContext, severity = 'medium', ) {
        return {
            type: 'ERROR_OCCURRED',
            error,
            errorContext,
            severity,
            timestamp: new Date(),
        };
    }
    /**
     * Create configuration updated event
     */
    static createConfigurationUpdated(config, updatedBy) {
        return {
            type: 'CONFIGURATION_UPDATED',
            config,
            updatedBy,
            timestamp: new Date(),
        };
    }
}
export {};
