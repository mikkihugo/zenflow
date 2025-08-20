/**
 * @fileoverview Workflows Domain Types - Process Orchestration Domain
 *
 * Comprehensive type definitions for workflow execution, orchestration, and
 * process management. These types define the core domain model for all
 * workflow operations, execution engines, and process coordination.
 *
 * Dependencies: Only imports from @claude-zen/foundation for shared primitives.
 * Domain Independence: Self-contained workflow domain types.
 *
 * @package @claude-zen/workflows
 * @since 2.1.0
 * @version 1.0.0
 */
// =============================================================================
// WORKFLOW CORE TYPES
// =============================================================================
/**
 * Workflow execution states
 */
export var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAFT"] = "draft";
    WorkflowStatus["QUEUED"] = "queued";
    WorkflowStatus["RUNNING"] = "running";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
    WorkflowStatus["TIMEOUT"] = "timeout";
    WorkflowStatus["RETRYING"] = "retrying";
})(WorkflowStatus || (WorkflowStatus = {}));
/**
 * Step execution states
 */
export var StepStatus;
(function (StepStatus) {
    StepStatus["PENDING"] = "pending";
    StepStatus["RUNNING"] = "running";
    StepStatus["COMPLETED"] = "completed";
    StepStatus["FAILED"] = "failed";
    StepStatus["SKIPPED"] = "skipped";
    StepStatus["CANCELLED"] = "cancelled";
    StepStatus["TIMEOUT"] = "timeout";
    StepStatus["RETRYING"] = "retrying";
})(StepStatus || (StepStatus = {}));
/**
 * Workflow execution strategies
 */
export var ExecutionStrategy;
(function (ExecutionStrategy) {
    ExecutionStrategy["SEQUENTIAL"] = "sequential";
    ExecutionStrategy["PARALLEL"] = "parallel";
    ExecutionStrategy["MIXED"] = "mixed";
    ExecutionStrategy["BATCH"] = "batch";
    ExecutionStrategy["STREAMING"] = "streaming";
})(ExecutionStrategy || (ExecutionStrategy = {}));
/**
 * Workflow trigger types
 */
export var TriggerType;
(function (TriggerType) {
    TriggerType["MANUAL"] = "manual";
    TriggerType["SCHEDULED"] = "scheduled";
    TriggerType["EVENT_DRIVEN"] = "event_driven";
    TriggerType["WEBHOOK"] = "webhook";
    TriggerType["API"] = "api";
    TriggerType["DEPENDENCY"] = "dependency";
    TriggerType["CONDITIONAL"] = "conditional";
})(TriggerType || (TriggerType = {}));
/**
 * Workflow categories for organization
 */
export var WorkflowCategory;
(function (WorkflowCategory) {
    WorkflowCategory["DATA_PROCESSING"] = "data_processing";
    WorkflowCategory["COORDINATION"] = "coordination";
    WorkflowCategory["NOTIFICATION"] = "notification";
    WorkflowCategory["DEPLOYMENT"] = "deployment";
    WorkflowCategory["TESTING"] = "testing";
    WorkflowCategory["MONITORING"] = "monitoring";
    WorkflowCategory["BACKUP"] = "backup";
    WorkflowCategory["SECURITY"] = "security";
    WorkflowCategory["ANALYTICS"] = "analytics";
    WorkflowCategory["INTEGRATION"] = "integration";
    WorkflowCategory["CUSTOM"] = "custom";
})(WorkflowCategory || (WorkflowCategory = {}));
/**
 * Step types for categorization
 */
export var StepType;
(function (StepType) {
    StepType["ACTION"] = "action";
    StepType["CONDITION"] = "condition";
    StepType["LOOP"] = "loop";
    StepType["PARALLEL"] = "parallel";
    StepType["WAIT"] = "wait";
    StepType["APPROVAL"] = "approval";
    StepType["NOTIFICATION"] = "notification";
    StepType["SCRIPT"] = "script";
    StepType["API_CALL"] = "api_call";
    StepType["DATABASE"] = "database";
    StepType["FILE_OPERATION"] = "file_operation";
    StepType["CUSTOM"] = "custom";
})(StepType || (StepType = {}));
/**
 * Backoff strategies for retries
 */
export var BackoffStrategy;
(function (BackoffStrategy) {
    BackoffStrategy["FIXED"] = "fixed";
    BackoffStrategy["LINEAR"] = "linear";
    BackoffStrategy["EXPONENTIAL"] = "exponential";
    BackoffStrategy["FIBONACCI"] = "fibonacci";
    BackoffStrategy["CUSTOM"] = "custom";
})(BackoffStrategy || (BackoffStrategy = {}));
/**
 * Error handling strategies
 */
export var ErrorStrategy;
(function (ErrorStrategy) {
    ErrorStrategy["FAIL_FAST"] = "fail_fast";
    ErrorStrategy["CONTINUE"] = "continue";
    ErrorStrategy["ROLLBACK"] = "rollback";
    ErrorStrategy["RETRY"] = "retry";
    ErrorStrategy["ESCALATE"] = "escalate";
    ErrorStrategy["IGNORE"] = "ignore";
})(ErrorStrategy || (ErrorStrategy = {}));
/**
 * Dependency types
 */
export var DependencyType;
(function (DependencyType) {
    DependencyType["SUCCESS"] = "success";
    DependencyType["COMPLETION"] = "completion";
    DependencyType["FAILURE"] = "failure";
    DependencyType["DATA"] = "data";
    DependencyType["RESOURCE"] = "resource";
    DependencyType["TIME"] = "time";
    DependencyType["EVENT"] = "event";
})(DependencyType || (DependencyType = {}));
/**
 * Log levels
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
/**
 * Artifact types
 */
export var ArtifactType;
(function (ArtifactType) {
    ArtifactType["FILE"] = "file";
    ArtifactType["DATA"] = "data";
    ArtifactType["LOG"] = "log";
    ArtifactType["REPORT"] = "report";
    ArtifactType["CONFIGURATION"] = "configuration";
    ArtifactType["BINARY"] = "binary";
    ArtifactType["ARCHIVE"] = "archive";
    ArtifactType["DATABASE"] = "database";
})(ArtifactType || (ArtifactType = {}));
/**
 * Parameter types
 */
export var ParameterType;
(function (ParameterType) {
    ParameterType["STRING"] = "string";
    ParameterType["NUMBER"] = "number";
    ParameterType["BOOLEAN"] = "boolean";
    ParameterType["ARRAY"] = "array";
    ParameterType["OBJECT"] = "object";
    ParameterType["FILE"] = "file";
    ParameterType["SECRET"] = "secret";
})(ParameterType || (ParameterType = {}));
/**
 * Rollback strategies
 */
export var RollbackStrategy;
(function (RollbackStrategy) {
    RollbackStrategy["COMPENSATE"] = "compensate";
    RollbackStrategy["RESTORE"] = "restore";
    RollbackStrategy["MANUAL"] = "manual";
    RollbackStrategy["IGNORE"] = "ignore";
})(RollbackStrategy || (RollbackStrategy = {}));
/**
 * Lock types
 */
export var LockType;
(function (LockType) {
    LockType["READ"] = "read";
    LockType["WRITE"] = "write";
    LockType["EXCLUSIVE"] = "exclusive";
})(LockType || (LockType = {}));
// Export default for convenience
export default {
    // Enums
    WorkflowStatus,
    StepStatus,
    ExecutionStrategy,
    TriggerType,
    WorkflowCategory,
    StepType,
    BackoffStrategy,
    ErrorStrategy,
    DependencyType,
    LogLevel,
    ArtifactType,
    ParameterType,
    RollbackStrategy,
    LockType,
};
