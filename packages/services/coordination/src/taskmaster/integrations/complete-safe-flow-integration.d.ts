import { SafeFrameworkIntegration } from './safe-framework-integration.js';
/**
* ALL SAFe 6.0 framework gate categories that TaskMaster orchestrates
* Official terminology from framework.scaledagile.com: 'strategic_theme') INVESTMENT_FUNDING = 'investment_funding') VALUE_STREAM = 'value_stream') PORTFOLIO_KANBAN = 'portfolio_kanban') EPIC_APPROVAL ='epic_approval,';
// ART Level Gates (Agile Release Train) - SAFe 6.0') PLANNING_INTERVAL_PLANNING ='planning_interval_planning,// Was PI_PLANNING') FEATURE_APPROVAL = 'feature_approval') CAPABILITY_APPROVAL = 'capability_approval') ENABLER_APPROVAL = 'enabler_approval') SYSTEM_DEMO = 'system_demo') INSPECT_ADAPT ='inspect_adapt,';
// Team Level Gates') STORY_APPROVAL = 'story_approval') TASK_APPROVAL = 'task_approval') CODE_REVIEW = 'code_review') DEFINITION_OF_DONE = 'definition_of_done') SPRINT_REVIEW ='sprint_review,';
// Solution Level Gates') SOLUTION_INTENT = 'solution_intent') ARCHITECTURE_REVIEW = 'architecture_review') COMPLIANCE_REVIEW = 'compliance_review') INTEGRATION_APPROVAL = 'integration_approval') DEPLOYMENT_APPROVAL ='deployment_approval,';
// Continuous Delivery Gates') BUILD_GATE = 'build_gate') TEST_GATE = 'test_gate') SECURITY_GATE = 'security_gate') PERFORMANCE_GATE = 'performance_gate') RELEASE_GATE ='release_gate,';
// Cross-Cutting Gates') RISK_ASSESSMENT = 'risk_assessment') DEPENDENCY_RESOLUTION = 'dependency_resolution') RESOURCE_ALLOCATION = 'resource_allocation') STAKEHOLDER_SIGNOFF ='stakeholder_signoff,';
// NEW SAFe Competencies Gates (July 2025)') INVESTMENT_VALIDATION ='investment_validation,// Validating Investment Opportunities') VALUE_STREAM_ORGANIZATION ='value_stream_organization,// Organizing Around Value for Large Solutions') BUSINESS_TEAM_LAUNCH ='business_team_launch,// Launching Agile Business Teams and Trains') CONTINUOUS_VALUE_DELIVERY ='continuous_value_delivery,// Continuously Delivering Value')};;
/**
* SAFE flow stage definitions
*/
export declare enum SafeFlowStage {
STRATEGIC_PLANNING = 'strategic_planning',
PORTFOLIO_BACKLOG = 'portfolio_backlog',
EPIC_DEVELOPMENT = 'epic_development,',
/**
* Complete SAFE entity types that flow through gates
*/
export,
interface,
SafeEntity,

}
/**
* Complete SAFE flow configuration
*/
export interface CompleteSafeFlowConfig {
portfolio: {
enableStrategicThemeGates: boolean;
enableInvestmentGates: boolean;
enableValueStreamGates: boolean;
enableEpicGates: boolean;
autoApprovalThresholds: Record<string, number>;
'};
art: {
enablePlanningIntervalPlanningGates: boolean;
enableFeatureGates: boolean;
enableCapabilityGates: boolean;
enableSystemDemoGates: boolean;
autoApprovalThresholds: Record<string, number>;
'};
team: {
enableStoryGates: boolean;
enableTaskGates: boolean;
enableCodeReviewGates: boolean;
enableSprintGates: boolean;
autoApprovalThresholds: Record<string, number>;
'};
solution: {
enableSolutionIntentGates: boolean;
enableArchitectureGates: boolean;
enableComplianceGates: boolean;
enableIntegrationGates: boolean;
autoApprovalThresholds: Record<string, number>;
'};
continuousDelivery: {
enableBuildGates: boolean;
enableTestGates: boolean;
enableSecurityGates: boolean;
enablePerformanceGates: boolean;
enableReleaseGates: boolean;
autoApprovalThresholds: Record<string, number>;
'};
crossCutting: {
enableRiskGates: boolean;
enableDependencyGates: boolean;
enableResourceGates: boolean;
enableStakeholderGates: boolean;
globalEscalationRules: any[];
'};
traceability: {
enableFullTraceability: boolean;
enableLearning: boolean;
enablePatternRecognition: boolean;
auditLevel: 'basic| soc2' | ' comprehensive';
retentionDays: number;
'};

}
/**
* Complete SAFE Flow Integration Service
*
* Orchestrates TaskMaster approval gates for EVERY aspect of the SAFE framework.
* Provides end-to-end traceability, learning, and AGUI visibility.
*/
export declare class CompleteSafeFlowIntegration {
private readonly logger;
private llmApprovalService;
private gateOrchestration;
constructor(
approvalGateManager: approvalGateManager,
this: any,
config: any,
this: any,
baseIntegration?: SafeFrameworkIntegration
');

}
export default CompleteSafeFlowIntegration;
//# sourceMappingURL=complete-safe-flow-integration.d.ts.map
