"use strict";
/**
 * @fileoverview Core Types for TaskMaster - GOLD STANDARD Enterprise Implementation
 *
 * Comprehensive type system for enterprise task flow management with:
 * - Complete domain modeling
 * - Production-grade error handling
 * - Advanced performance tracking
 * - Security and audit types
 * - Real-time monitoring types
 * - WASM integration types
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIPViolationSeverity = exports.TaskComplexity = exports.TransitionDirection = exports.TaskState = exports.PRIORITY_WEIGHTS = exports.TaskPriority = void 0;
exports.isTaskId = isTaskId;
exports.isUserId = isUserId;
exports.isAPIResponse = isAPIResponse;
exports.createTaskId = createTaskId;
exports.createUserId = createUserId;
exports.createApprovalGateId = createApprovalGateId;
exports.createWorkflowId = createWorkflowId;
/**
 * Task priority levels with numerical weights for algorithms
 */
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["CRITICAL"] = "critical";
    TaskPriority["HIGH"] = "high";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["LOW"] = "low";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
/**
 * Numerical priority weights for WASM performance calculations
 */
exports.PRIORITY_WEIGHTS = (_a = {},
    _a[TaskPriority.CRITICAL] = 1000,
    _a[TaskPriority.HIGH] = 100,
    _a[TaskPriority.MEDIUM] = 10,
    _a[TaskPriority.LOW] = 1,
    _a);
/**
 * Comprehensive task states with enterprise workflow support
 */
var TaskState;
(function (TaskState) {
    // Core workflow states
    TaskState["BACKLOG"] = "backlog";
    TaskState["PLANNING"] = "planning";
    TaskState["READY"] = "ready";
    TaskState["IN_PROGRESS"] = "in_progress";
    TaskState["REVIEW"] = "review";
    TaskState["TESTING"] = "testing";
    TaskState["APPROVAL"] = "approval";
    TaskState["DEPLOYMENT"] = "deployment";
    TaskState["DONE"] = "done";
    // Special states
    TaskState["BLOCKED"] = "blocked";
    TaskState["ON_HOLD"] = "on_hold";
    TaskState["CANCELLED"] = "cancelled";
    TaskState["FAILED"] = "failed";
    // Approval gate states
    TaskState["PENDING_APPROVAL"] = "pending_approval";
    TaskState["APPROVED"] = "approved";
    TaskState["REJECTED"] = "rejected";
    TaskState["ESCALATED"] = "escalated";
})(TaskState || (exports.TaskState = TaskState = {}));
/**
 * State transition directions for flow analysis
 */
var TransitionDirection;
(function (TransitionDirection) {
    TransitionDirection["FORWARD"] = "forward";
    TransitionDirection["BACKWARD"] = "backward";
    TransitionDirection["LATERAL"] = "lateral";
    TransitionDirection["EXCEPTION"] = "exception";
})(TransitionDirection || (exports.TransitionDirection = TransitionDirection = {}));
/**
 * Task complexity estimation for WASM performance prediction
 */
var TaskComplexity;
(function (TaskComplexity) {
    TaskComplexity["TRIVIAL"] = "trivial";
    TaskComplexity["SIMPLE"] = "simple";
    TaskComplexity["MODERATE"] = "moderate";
    TaskComplexity["COMPLEX"] = "complex";
    TaskComplexity["EPIC"] = "epic"; // > 40 hours
})(TaskComplexity || (exports.TaskComplexity = TaskComplexity = {}));
/**
 * WIP limit violation severity levels
 */
var WIPViolationSeverity;
(function (WIPViolationSeverity) {
    WIPViolationSeverity["INFO"] = "info";
    WIPViolationSeverity["WARNING"] = "warning";
    WIPViolationSeverity["CRITICAL"] = "critical";
    WIPViolationSeverity["EMERGENCY"] = "emergency";
})(WIPViolationSeverity || (exports.WIPViolationSeverity = WIPViolationSeverity = {}));
/**
 * Type guard for TaskId
 */
function isTaskId(value) {
    return typeof value === 'string' && value.length > 0;
}
/**
 * Type guard for UserId
 */
function isUserId(value) {
    return typeof value === 'string' && value.length > 0;
}
/**
 * Type guard for API response
 */
function isAPIResponse(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        'metadata' in value &&
        typeof value.success === 'boolean');
}
/**
 * Helper to create TaskId from string
 */
function createTaskId(value) {
    if (!value || value.trim().length === 0) {
        throw new Error('TaskId cannot be empty');
    }
    return value.trim();
}
/**
 * Helper to create UserId from string
 */
function createUserId(value) {
    if (!value || value.trim().length === 0) {
        throw new Error('UserId cannot be empty');
    }
    return value.trim();
}
/**
 * Helper to create ApprovalGateId from string
 */
function createApprovalGateId(value) {
    if (!value || value.trim().length === 0) {
        throw new Error('ApprovalGateId cannot be empty');
    }
    return value.trim();
}
/**
 * Helper to create WorkflowId from string
 */
function createWorkflowId(value) {
    if (!value || value.trim().length === 0) {
        throw new Error('WorkflowId cannot be empty');
    }
    return value.trim();
}
