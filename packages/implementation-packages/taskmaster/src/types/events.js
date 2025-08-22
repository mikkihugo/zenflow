"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEventUtils = void 0;
// =============================================================================
// EVENT UTILITIES
// =============================================================================
/**
 * Event creation utilities for type-safe event construction
 */
var WorkflowEventUtils = /** @class */ (function () {
    function WorkflowEventUtils() {
    }
    /**
     * Create task created event
     */
    WorkflowEventUtils.createTaskCreated = function (task) {
        return {
            type: 'TASK_CREATED',
            task: task,
        };
    };
    /**
     * Create task moved event
     */
    WorkflowEventUtils.createTaskMoved = function (taskId, fromState, toState, reason) {
        return {
            type: 'TASK_MOVED',
            taskId: taskId,
            fromState: fromState,
            toState: toState,
            reason: reason,
        };
    };
    /**
     * Create bottleneck detected event
     */
    WorkflowEventUtils.createBottleneckDetected = function (bottleneck) {
        return {
            type: 'BOTTLENECK_DETECTED',
            bottleneck: bottleneck,
        };
    };
    /**
     * Create system health updated event
     */
    WorkflowEventUtils.createSystemHealthUpdated = function (health, previousHealth) {
        return {
            type: 'SYSTEM_HEALTH_UPDATED',
            health: health,
            previousHealth: previousHealth,
            timestamp: new Date(),
        };
    };
    /**
     * Create error occurred event
     */
    WorkflowEventUtils.createErrorOccurred = function (error, errorContext, severity) {
        if (severity === void 0) { severity = 'medium'; }
        return {
            type: 'ERROR_OCCURRED',
            error: error,
            errorContext: errorContext,
            severity: severity,
            timestamp: new Date(),
        };
    };
    /**
     * Create configuration updated event
     */
    WorkflowEventUtils.createConfigurationUpdated = function (config, updatedBy) {
        return {
            type: 'CONFIGURATION_UPDATED',
            config: config,
            updatedBy: updatedBy,
            timestamp: new Date(),
        };
    };
    return WorkflowEventUtils;
}());
exports.WorkflowEventUtils = WorkflowEventUtils;
