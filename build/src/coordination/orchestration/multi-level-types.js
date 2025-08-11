/**
 * @file Multi-Level Orchestration Types - Phase 2 Architecture Foundation
 *
 * Defines the type system for the multi-level parallel flow architecture:
 * - Portfolio Level (Strategic - Human Controlled)
 * - Program Level (AI-Human Collaboration)
 * - Swarm Execution Level (AI Autonomous with SPARC)
 *
 * ARCHITECTURE TRANSFORMATION:
 * BEFORE: Vision→PRD→Epic→Feature→Task→Code (Linear)
 * AFTER: Multi-level parallel streams with AGUI gates and coordination
 */
// ============================================================================
// ORCHESTRATION LEVELS - Three-tier architecture
// ============================================================================
/**
 * Orchestration levels in the multi-level architecture
 */
export var OrchestrationLevel;
(function (OrchestrationLevel) {
    OrchestrationLevel["PORTFOLIO"] = "portfolio";
    OrchestrationLevel["PROGRAM"] = "program";
    OrchestrationLevel["SWARM_EXECUTION"] = "execution";
})(OrchestrationLevel || (OrchestrationLevel = {}));
/**
 * Portfolio priority levels
 */
export var PortfolioPriority;
(function (PortfolioPriority) {
    PortfolioPriority["STRATEGIC"] = "strategic";
    PortfolioPriority["HIGH"] = "high";
    PortfolioPriority["MEDIUM"] = "medium";
    PortfolioPriority["LOW"] = "low";
    PortfolioPriority["EXPERIMENTAL"] = "experimental";
})(PortfolioPriority || (PortfolioPriority = {}));
/**
 * Portfolio gate types
 */
export var PortfolioGateType;
(function (PortfolioGateType) {
    PortfolioGateType["INVESTMENT_DECISION"] = "investment_decision";
    PortfolioGateType["STRATEGIC_REVIEW"] = "strategic_review";
    PortfolioGateType["MARKET_VALIDATION"] = "market_validation";
    PortfolioGateType["RESOURCE_ALLOCATION"] = "resource_allocation";
    PortfolioGateType["GO_NO_GO"] = "go_no_go";
})(PortfolioGateType || (PortfolioGateType = {}));
/**
 * Program priority levels
 */
export var ProgramPriority;
(function (ProgramPriority) {
    ProgramPriority["CRITICAL_PATH"] = "critical_path";
    ProgramPriority["HIGH"] = "high";
    ProgramPriority["MEDIUM"] = "medium";
    ProgramPriority["LOW"] = "low";
})(ProgramPriority || (ProgramPriority = {}));
/**
 * Complexity levels
 */
export var ComplexityLevel;
(function (ComplexityLevel) {
    ComplexityLevel["SIMPLE"] = "simple";
    ComplexityLevel["MODERATE"] = "moderate";
    ComplexityLevel["COMPLEX"] = "complex";
    ComplexityLevel["HIGHLY_COMPLEX"] = "highly_complex";
})(ComplexityLevel || (ComplexityLevel = {}));
/**
 * Program gate types
 */
export var ProgramGateType;
(function (ProgramGateType) {
    ProgramGateType["ARCHITECTURE_REVIEW"] = "architecture_review";
    ProgramGateType["DESIGN_APPROVAL"] = "design_approval";
    ProgramGateType["IMPLEMENTATION_READINESS"] = "implementation_readiness";
    ProgramGateType["INTEGRATION_CHECKPOINT"] = "integration_checkpoint";
    ProgramGateType["QUALITY_GATE"] = "quality_gate";
})(ProgramGateType || (ProgramGateType = {}));
/**
 * AI assistance levels
 */
export var AIAssistanceLevel;
(function (AIAssistanceLevel) {
    AIAssistanceLevel["NONE"] = "none";
    AIAssistanceLevel["ADVISORY"] = "advisory";
    AIAssistanceLevel["COLLABORATIVE"] = "collaborative";
    AIAssistanceLevel["AUTONOMOUS"] = "autonomous";
})(AIAssistanceLevel || (AIAssistanceLevel = {}));
/**
 * Human oversight levels
 */
export var HumanOversightLevel;
(function (HumanOversightLevel) {
    HumanOversightLevel["MINIMAL"] = "minimal";
    HumanOversightLevel["PERIODIC"] = "periodic";
    HumanOversightLevel["CONTINUOUS"] = "continuous";
    HumanOversightLevel["INTENSIVE"] = "intensive";
})(HumanOversightLevel || (HumanOversightLevel = {}));
/**
 * Swarm execution priority
 */
export var SwarmExecutionPriority;
(function (SwarmExecutionPriority) {
    SwarmExecutionPriority["URGENT"] = "urgent";
    SwarmExecutionPriority["HIGH"] = "high";
    SwarmExecutionPriority["NORMAL"] = "normal";
    SwarmExecutionPriority["LOW"] = "low";
})(SwarmExecutionPriority || (SwarmExecutionPriority = {}));
/**
 * Quality gate types
 */
export var QualityGateType;
(function (QualityGateType) {
    QualityGateType["CODE_QUALITY"] = "code_quality";
    QualityGateType["TEST_COVERAGE"] = "test_coverage";
    QualityGateType["PERFORMANCE"] = "performance";
    QualityGateType["SECURITY"] = "security";
    QualityGateType["ACCESSIBILITY"] = "accessibility";
})(QualityGateType || (QualityGateType = {}));
