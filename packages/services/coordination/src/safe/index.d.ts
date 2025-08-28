/**
 * @fileoverview SAFe Framework Integration
 *
 * Scaled Agile Framework (SAFe) integration providing: * - Portfolio management with lean portfolio management
 * - Program Increment (PI) planning and execution
 * - Value stream mapping and optimization
 * - Epic lifecycle management
 * - Product management coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
export type { AgileReleaseTrain, ARTTeam, Dependency, Feature, InvestmentHorizon, PIConfiguration, PIObjective, PortfolioConfiguration, PortfolioEpic, ProgramIncrement, Risk, SAFeIntegrationConfig, SafeConfiguration, Story, TeamCapacity, TeamMember, ValueStream, } from './types';
export type { EpicBlocker, EpicBusinessCase, EpicLifecycleStage, EpicOwnerManagerConfig, GateCriterion, QualityGate as EpicQualityGate, WSJFScore, } from './types/epic-management';
export type { QualityGate as IntegrationQualityGate, QualityGateSettings, } from './types/integration-bridge';
export type * from './types/product-management';
export { default as SolutionManager } from './coordinators/solution-manager';
export { DocumentTaskVisionCoordinator } from './coordinators/solution-manager';
export { default as EpicOwnerCoordinator } from './coordinators/portfolio/epic-owner-coordinator';
export { default as ReleaseTrainEngineerCoordinator } from './coordinators/program/release-train-engineer-coordinator';
export { default as ProductManagerCoordinator } from './coordinators/program/product-manager-coordinator';
export { default as ArchitectureRunwayManager } from './managers/architecture-runway-manager';
export { default as ContinuousDeliveryPipeline } from './managers/continuous-delivery-pipeline';
export { default as DevSecOpsManager } from './managers/devsecops-manager';
export { default as EnterpriseArchitectureManager } from './managers/enterprise-architecture-manager';
export { default as EpicOwnerManager } from './managers/epic-owner-manager';
export { default as ProductManagementManager } from './managers/product-management-manager';
export { default as ProgramIncrementManager } from './managers/program-increment-manager';
export { default as ReleaseTrainEngineerManager } from './managers/release-train-engineer-manager';
export { default as SAFeEventsManager } from './managers/safe-events-manager';
export { default as SolutionTrainEngineerManager } from './managers/solution-train-engineer-manager';
export { default as SystemSolutionArchitectureManager } from './managers/system-solution-architecture-manager';
export { default as ValueStreamMapper } from './managers/value-stream-mapper';
export { default as ValueStreamOptimizationEngine } from './managers/value-stream-optimization-engine';
export { DeploymentAutomationService } from './services/continuous-delivery/deployment-automation-service';
export { PipelinePerformanceService } from './services/continuous-delivery/pipeline-performance-service';
export { QualityGateService } from './services/continuous-delivery/quality-gate-service';
export { SPARCCDMappingService } from './services/continuous-delivery/sparc-cd-mapping-service';
export { BusinessCaseService } from './services/business-case-service';
export { CustomerResearchService } from './services/customer-research-service';
export { ComplianceMonitoringService } from './services/devsecops/compliance-monitoring-service';
export { SecurityIncidentResponseService } from './services/devsecops/security-incident-response-service';
export { SecurityScanningService } from './services/devsecops/security-scanning-service';
export { ArchitectureHealthService } from './services/enterprise-architecture/architecture-health-service';
export { ArchitecturePrincipleService } from './services/enterprise-architecture/architecture-principle-service';
export { GovernanceDecisionService } from './services/enterprise-architecture/governance-decision-service';
export { TechnologyStandardsService } from './services/enterprise-architecture/technology-standards-service';
export { EpicLifecycleService } from './services/epic-lifecycle-service';
export { MarketAnalysisService } from './services/market-analysis-service';
export { ProductVisionService } from './services/product-vision-service';
export { PIPlanningFacilitationService } from './services/rte/pi-planning-facilitation-service';
export { ProgramPredictabilityService } from './services/rte/program-predictability-service';
export { ScrumOfScrumsService } from './services/rte/scrum-of-scrums-service';
export { MultiARTCoordinationService } from './services/solution-train/multi-art-coordination-service';
export { SolutionArchitectureManagementService } from './services/solution-train/solution-architecture-management-service';
export { SolutionPlanningService } from './services/solution-train/solution-planning-service';
export { BottleneckAnalysisService } from './services/value-stream/bottleneck-analysis-service';
export { ContinuousImprovementService } from './services/value-stream/continuous-improvement-service';
export { FlowOptimizationService } from './services/value-stream/flow-optimization-service';
export { PredictiveAnalyticsService } from './services/value-stream/predictive-analytics-service';
export type { SafePortfolioKanbanState, SafeProgramKanbanState, SafeSolutionKanbanState, SafeTeamKanbanState, } from './integrations/kanban-integration';
export { createSafePortfolioKanban, createSafeProgramKanban, createSafeTeamKanban, featureToKanbanTask, portfolioEpicToKanbanTask, storyToKanbanTask, } from './integrations/kanban-integration';
export { SafeCollectionUtils } from './utilities/collections/safe-collections';
export { SafeDateUtils } from './utilities/date/safe-date-utils';
export { SafeValidationUtils } from './utilities/validation/safe-validation';
/**
 * Create a SAFe framework integration (placeholder - needs implementation)
 */
export { epicKanbanMachine } from './state-machines/epic-kanban-machine';
export { piPlanningMachine } from './state-machines/pi-planning-machine';
//# sourceMappingURL=index.d.ts.map