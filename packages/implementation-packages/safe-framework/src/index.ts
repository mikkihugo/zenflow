/**
 * @fileoverview SAFe Framework Integration
 *
 * Scaled Agile Framework (SAFe) integration providing:
 * - Portfolio management with lean portfolio management
 * - Program Increment (PI) planning and execution
 * - Value stream mapping and optimization
 * - Epic lifecycle management
 * - Product management coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// ============================================================================
// TYPES - SAFe framework type definitions
// ============================================================================

// Epic management types (only export types that actually exist)
export type {
  WSJFScore,
  EpicLifecycleStage,
  GateCriterion,
  EpicBlocker,
  EpicBusinessCase,
  EpicOwnerManagerConfig,
  QualityGate as EpicQualityGate,
} from './types/epic-management';

// Product management types
export type * from './types/product-management';

// SAFe-SPARC Integration Bridge types (only export types that actually exist)
export type {
  QualityGate as IntegrationQualityGate,
  QualityGateSettings,
} from './types/integration-bridge';

// Core SAFe types
export type {
  // Portfolio types
  PortfolioEpic,
  InvestmentHorizon,
  ValueStream,

  // Program types
  ProgramIncrement,
  PIObjective,

  // Configuration types
  SafeConfiguration,
  PIConfiguration,
  PortfolioConfiguration,

  // SAFe Framework entities
  AgileReleaseTrain,
  ARTTeam,
  TeamMember,
  TeamCapacity,
  Feature,
  Story,
  Dependency,
  Risk,

  // Integration types
  SAFeIntegrationConfig,
} from './types';

// ============================================================================
// MANAGERS - SAFe framework managers and coordinators
// ============================================================================

// Core Portfolio Management (placeholder - needs implementation)
// export { default as SafePortfolioManager } from './managers/safe-portfolio-manager';

// Program Increment Management
export { default as ProgramIncrementManager } from './managers/program-increment-manager';

// Value Stream Management
export { default as ValueStreamMapper } from './managers/value-stream-mapper';
export { default as ValueStreamOptimizationEngine } from './managers/value-stream-optimization-engine';

// Events Management
export { default as SAFeEventsManager } from './managers/safe-events-manager';

// Architecture Management
export { default as ArchitectureRunwayManager } from './managers/architecture-runway-manager';

// Epic Owner Management
export { default as EpicOwnerManager } from './managers/epic-owner-manager';

// Product Management
export { default as ProductManagementManager } from './managers/product-management-manager';

// Release Train Engineer Management
export { default as ReleaseTrainEngineerManager } from './managers/release-train-engineer-manager';

// Solution Train Engineer Management
export { default as SolutionTrainEngineerManager } from './managers/solution-train-engineer-manager';

// Enterprise Architecture Management
export { default as EnterpriseArchitectureManager } from './managers/enterprise-architecture-manager';

// System Solution Architecture Management
export { default as SystemSolutionArchitectureManager } from './managers/system-solution-architecture-manager';

// DevSecOps Management
export { default as DevSecOpsManager } from './managers/devsecops-manager';

// Continuous Delivery Pipeline
export { default as ContinuousDeliveryPipeline } from './managers/continuous-delivery-pipeline';

// Continuous Delivery services
export { SPARCCDMappingService } from './services/continuous-delivery/sparc-cd-mapping-service';
export { QualityGateService } from './services/continuous-delivery/quality-gate-service';
export { DeploymentAutomationService } from './services/continuous-delivery/deployment-automation-service';
export { PipelinePerformanceService } from './services/continuous-delivery/pipeline-performance-service';

// ============================================================================
// SERVICES - Specialized SAFe services
// ============================================================================

// Epic lifecycle services
export { EpicLifecycleService } from './services/epic-lifecycle-service';
export { BusinessCaseService } from './services/business-case-service';

// Product management services
export { ProductVisionService } from './services/product-vision-service';
export { CustomerResearchService } from './services/customer-research-service';
export { MarketAnalysisService } from './services/market-analysis-service';

// RTE services
export { PIPlanningFacilitationService } from './services/rte/pi-planning-facilitation-service';
export { ScrumOfScrumsService } from './services/rte/scrum-of-scrums-service';
export { ProgramPredictabilityService } from './services/rte/program-predictability-service';

// DevSecOps services
export { SecurityScanningService } from './services/devsecops/security-scanning-service';
export { ComplianceMonitoringService } from './services/devsecops/compliance-monitoring-service';
export { SecurityIncidentResponseService } from './services/devsecops/security-incident-response-service';

// Solution Train services
export { MultiARTCoordinationService } from './services/solution-train/multi-art-coordination-service';
export { SolutionPlanningService } from './services/solution-train/solution-planning-service';
export { SolutionArchitectureManagementService } from './services/solution-train/solution-architecture-management-service';

// Value Stream services
export { BottleneckAnalysisService } from './services/value-stream/bottleneck-analysis-service';
export { FlowOptimizationService } from './services/value-stream/flow-optimization-service';
export { ContinuousImprovementService } from './services/value-stream/continuous-improvement-service';
export { PredictiveAnalyticsService } from './services/value-stream/predictive-analytics-service';

// Enterprise Architecture services
export { ArchitecturePrincipleService } from './services/enterprise-architecture/architecture-principle-service';
export { TechnologyStandardsService } from './services/enterprise-architecture/technology-standards-service';
export { GovernanceDecisionService } from './services/enterprise-architecture/governance-decision-service';
export { ArchitectureHealthService } from './services/enterprise-architecture/architecture-health-service';

// ============================================================================
// INTEGRATIONS - SAFe framework integrations
// ============================================================================

// Kanban integration with @claude-zen/kanban
export {
  createSafePortfolioKanban,
  createSafeProgramKanban,
  createSafeTeamKanban,
  portfolioEpicToKanbanTask,
  featureToKanbanTask,
  storyToKanbanTask,
} from './integrations/kanban-integration';

export type {
  SafePortfolioKanbanState,
  SafeProgramKanbanState,
  SafeTeamKanbanState,
  SafeSolutionKanbanState,
} from './integrations/kanban-integration';

// Database-SPARC Bridge integration
export { DatabaseSPARCBridge } from './integrations/database-sparc-bridge';
export type {
  WorkAssignment,
  ImplementationResult,
} from './integrations/database-sparc-bridge';

// ============================================================================
// UTILITIES - SAFe framework utilities
// ============================================================================

export { SafeCollectionUtils } from './utilities/collections/safe-collections';
export { SafeDateUtils } from './utilities/date/safe-date-utils';
export { SafeValidationUtils } from './utilities/validation/safe-validation';

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a SAFe framework integration (placeholder - needs implementation)
 */
// export function createSafeFramework(config: SafeConfiguration) {
//   return new SafePortfolioManager(config);
// }

// ============================================================================
// STATE MACHINES - XState integration for SAFe workflows (need proper exports)
// ============================================================================

export { epicKanbanMachine } from './state-machines/epic-kanban-machine';
export { piPlanningMachine } from './state-machines/pi-planning-machine';
// export { default as valueStreamMachine } from './state-machines/value-stream-machine';
// export { default as portfolioKanbanMachine } from './state-machines/portfolio-kanban-machine';
// export { default as continuousDeliveryMachine } from './state-machines/continuous-delivery-machine';

// ============================================================================
// EVENTS - SAFe framework events (placeholder - needs implementation)
// ============================================================================

// export { default as SafeEventHandlers } from './events/safe-event-handlers';
