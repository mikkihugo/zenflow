/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */
/**
 * Event priority enumeration
 */
export var EventPriority;
(function (EventPriority) {
    EventPriority["LOW"] = "low";
    EventPriority["NORMAL"] = "normal";
    EventPriority["HIGH"] = "high";
    EventPriority["CRITICAL"] = "critical";
})(EventPriority || (EventPriority = {}));
/**
 * Event creation function
 */
export function createEvent(type, data, priority) {
    return {
        type,
        data,
        priority: priority || EventPriority.NORMAL,
        timestamp: Date.now(),
    };
}
export { getLogger } from '@claude-zen/foundation';
// ============================================================================
// PROGRAM INCREMENT MANAGER TYPES
// ============================================================================
/**
 * PI Status enumeration
 */
export var PIStatus;
(function (PIStatus) {
    PIStatus["PLANNING"] = "planning";
    PIStatus["ACTIVE"] = "active";
    PIStatus["COMPLETED"] = "completed";
    PIStatus["RETROSPECTIVE"] = "retrospective";
})(PIStatus || (PIStatus = {}));
/**
 * Feature Status enumeration
 */
export var FeatureStatus;
(function (FeatureStatus) {
    FeatureStatus["BACKLOG"] = "backlog";
    FeatureStatus["ANALYSIS"] = "analysis";
    FeatureStatus["DEVELOPMENT"] = "development";
    FeatureStatus["TESTING"] = "testing";
    FeatureStatus["DONE"] = "done";
})(FeatureStatus || (FeatureStatus = {}));
/**
 * Objective Status enumeration
 */
export var ObjectiveStatus;
(function (ObjectiveStatus) {
    ObjectiveStatus["COMMITTED"] = "committed";
    ObjectiveStatus["UNCOMMITTED"] = "uncommitted";
    ObjectiveStatus["IN_PROGRESS"] = "in_progress";
    ObjectiveStatus["COMPLETED"] = "completed";
    ObjectiveStatus["MISSED"] = "missed";
})(ObjectiveStatus || (ObjectiveStatus = {}));
/**
 * Story Status enumeration
 */
export var StoryStatus;
(function (StoryStatus) {
    StoryStatus["BACKLOG"] = "backlog";
    StoryStatus["IN_PROGRESS"] = "in_progress";
    StoryStatus["REVIEW"] = "review";
    StoryStatus["DONE"] = "done";
})(StoryStatus || (StoryStatus = {}));
/**
 * Enabler Status enumeration
 */
export var EnablerStatus;
(function (EnablerStatus) {
    EnablerStatus["BACKLOG"] = "backlog";
    EnablerStatus["IN_PROGRESS"] = "in_progress";
    EnablerStatus["DONE"] = "done";
})(EnablerStatus || (EnablerStatus = {}));
/**
 * Workflow Human Gate Type enumeration
 */
export var WorkflowHumanGateType;
(function (WorkflowHumanGateType) {
    WorkflowHumanGateType["APPROVAL_REQUIRED"] = "approval_required";
    WorkflowHumanGateType["REVIEW_REQUIRED"] = "review_required";
    WorkflowHumanGateType["SIGN_OFF_REQUIRED"] = "sign_off_required";
})(WorkflowHumanGateType || (WorkflowHumanGateType = {}));
/**
 * System architecture types for design coordination
 */
export var SystemArchitectureType;
(function (SystemArchitectureType) {
    SystemArchitectureType["MONOLITHIC"] = "monolithic";
    SystemArchitectureType["MICROSERVICES"] = "microservices";
    SystemArchitectureType["SERVICE_ORIENTED"] = "service_oriented";
    SystemArchitectureType["EVENT_DRIVEN"] = "event_driven";
    SystemArchitectureType["LAYERED"] = "layered";
    SystemArchitectureType["HEXAGONAL"] = "hexagonal";
    SystemArchitectureType["CLEAN_ARCHITECTURE"] = "clean_architecture";
})(SystemArchitectureType || (SystemArchitectureType = {}));
/**
 * Solution architecture patterns
 */
export var SolutionArchitecturePattern;
(function (SolutionArchitecturePattern) {
    SolutionArchitecturePattern["TRADITIONAL_3_TIER"] = "traditional_3_tier";
    SolutionArchitecturePattern["MICRO_FRONTEND"] = "micro_frontend";
    SolutionArchitecturePattern["SERVERLESS"] = "serverless";
    SolutionArchitecturePattern["CLOUD_NATIVE"] = "cloud_native";
    SolutionArchitecturePattern["HYBRID_CLOUD"] = "hybrid_cloud";
    SolutionArchitecturePattern["EDGE_COMPUTING"] = "edge_computing";
})(SolutionArchitecturePattern || (SolutionArchitecturePattern = {}));
/**
 * System design status
 */
export var SystemDesignStatus;
(function (SystemDesignStatus) {
    SystemDesignStatus["DRAFT"] = "draft";
    SystemDesignStatus["IN_REVIEW"] = "in_review";
    SystemDesignStatus["APPROVED"] = "approved";
    SystemDesignStatus["REJECTED"] = "rejected";
    SystemDesignStatus["DEPRECATED"] = "deprecated";
    SystemDesignStatus["IMPLEMENTATION_READY"] = "implementation_ready";
})(SystemDesignStatus || (SystemDesignStatus = {}));
/**
 * Component type
 */
export var ComponentType;
(function (ComponentType) {
    ComponentType["SERVICE"] = "service";
    ComponentType["DATABASE"] = "database";
    ComponentType["GATEWAY"] = "gateway";
    ComponentType["QUEUE"] = "queue";
    ComponentType["CACHE"] = "cache";
    ComponentType["EXTERNAL_SYSTEM"] = "external_system";
    ComponentType["UI_COMPONENT"] = "ui_component";
})(ComponentType || (ComponentType = {}));
