/**
 * @file SAFe Integration Foundation - Phase 3, Day 12 (Task 11.1)
 *
 * Scaled Agile Framework (SAFe) integration foundation providing enterprise-scale
 * agile practices integration with the multi-level orchestration architecture.
 *
 * ARCHITECTURE:
 * - SAFe entity definitions (Themes, Capabilities, Features, Stories)
 * - Workflow mapping interfaces between SAFe and orchestration levels
 * - Configuration and settings management
 * - Integration with existing Portfolio, Program, and Swarm levels
 */
// ============================================================================
// SUPPORTING TYPES
// ============================================================================
export var ThemeStatus;
(function (ThemeStatus) {
    ThemeStatus["PROPOSED"] = "proposed";
    ThemeStatus["APPROVED"] = "approved";
    ThemeStatus["ACTIVE"] = "active";
    ThemeStatus["ON_HOLD"] = "on_hold";
    ThemeStatus["COMPLETED"] = "completed";
    ThemeStatus["CANCELLED"] = "cancelled";
})(ThemeStatus || (ThemeStatus = {}));
export var CapabilityStatus;
(function (CapabilityStatus) {
    CapabilityStatus["BACKLOG"] = "backlog";
    CapabilityStatus["ANALYSIS"] = "analysis";
    CapabilityStatus["DEVELOPMENT"] = "development";
    CapabilityStatus["TESTING"] = "testing";
    CapabilityStatus["DONE"] = "done";
})(CapabilityStatus || (CapabilityStatus = {}));
export var PIStatus;
(function (PIStatus) {
    PIStatus["PLANNING"] = "planning";
    PIStatus["ACTIVE"] = "active";
    PIStatus["COMPLETED"] = "completed";
    PIStatus["RETROSPECTIVE"] = "retrospective";
})(PIStatus || (PIStatus = {}));
export var ObjectiveStatus;
(function (ObjectiveStatus) {
    ObjectiveStatus["COMMITTED"] = "committed";
    ObjectiveStatus["UNCOMMITTED"] = "uncommitted";
    ObjectiveStatus["IN_PROGRESS"] = "in_progress";
    ObjectiveStatus["COMPLETED"] = "completed";
    ObjectiveStatus["MISSED"] = "missed";
})(ObjectiveStatus || (ObjectiveStatus = {}));
export var FeatureStatus;
(function (FeatureStatus) {
    FeatureStatus["BACKLOG"] = "backlog";
    FeatureStatus["ANALYSIS"] = "analysis";
    FeatureStatus["DEVELOPMENT"] = "development";
    FeatureStatus["TESTING"] = "testing";
    FeatureStatus["DONE"] = "done";
})(FeatureStatus || (FeatureStatus = {}));
export var StoryStatus;
(function (StoryStatus) {
    StoryStatus["BACKLOG"] = "backlog";
    StoryStatus["IN_PROGRESS"] = "in_progress";
    StoryStatus["REVIEW"] = "review";
    StoryStatus["DONE"] = "done";
})(StoryStatus || (StoryStatus = {}));
export var EnablerStatus;
(function (EnablerStatus) {
    EnablerStatus["BACKLOG"] = "backlog";
    EnablerStatus["IN_PROGRESS"] = "in_progress";
    EnablerStatus["DONE"] = "done";
})(EnablerStatus || (EnablerStatus = {}));
export var SAFeMetricType;
(function (SAFeMetricType) {
    SAFeMetricType["VELOCITY"] = "velocity";
    SAFeMetricType["PREDICTABILITY"] = "predictability";
    SAFeMetricType["QUALITY"] = "quality";
    SAFeMetricType["FLOW"] = "flow";
    SAFeMetricType["COMPETENCY"] = "competency";
})(SAFeMetricType || (SAFeMetricType = {}));
// ============================================================================
// EXPORTS
// ============================================================================
export default {
    // Core SAFe entities
    SAFePortfolio,
    StrategicTheme,
    ValueStream,
    Solution,
    Capability,
    AgileReleaseTrain,
    ProgramIncrement,
    PIObjective,
    Feature,
    ARTTeam,
    Story,
    Enabler,
    // Mapping and configuration
    SAFeWorkflowMapping,
    SAFeIntegrationConfig,
    SAFeTransformationRules,
    SAFeImplementationConfig,
    // Enums
    ThemeStatus,
    CapabilityStatus,
    PIStatus,
    ObjectiveStatus,
    FeatureStatus,
    StoryStatus,
    EnablerStatus,
    SAFeMetricType,
};
