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
// ============================================================================
// TYPES - SAFe framework type definitions
// ============================================================================
// Core SAFe types
export type {
  // SAFe Framework entities
  AgileReleaseTrain,
  ARTTeam,
  Dependency,
  Feature,
  InvestmentHorizon,
  PIConfiguration,
  PIObjective,
  PortfolioConfiguration,
  // Portfolio types
  PortfolioEpic,
  // Program types
  ProgramIncrement,
  Risk,
  // Integration types
  SAFeIntegrationConfig,
  // Configuration types
  SafeConfiguration,
  Story,
  TeamCapacity,
  TeamMember,
  ValueStream,
} from './types');
export type {
  EpicBlocker,
  EpicBusinessCase,
  EpicLifecycleStage,
  EpicOwnerManagerConfig,
  GateCriterion,
  QualityGate as EpicQualityGate,
  WSJFScore,
} from './types/epic-management');
export type {
  QualityGate as IntegrationQualityGate,
  QualityGateSettings,
} from './types/integration-bridge');
export type * from './types/product-management')'; 
// COORDINATORS - SAFe 6.0 Essential Event-Driven Coordinators
// ============================================================================
// Strategic Solution Management - The Main SAFe Brain
export { default as SolutionManager} from './coordinators/solution-manager')./coordinators/solution-manager'; // Legacy compatibility';
// Portfolio Level Coordinators
export { default as EpicOwnerCoordinator} from './coordinators/portfolio/epic-owner-coordinator');
export { default as ReleaseTrainEngineerCoordinator} from './coordinators/program/release-train-engineer-coordinator')./coordinators/program/product-manager-coordinator')'; 
// MANAGERS - SAFe framework managers and coordinators (Legacy)
// ============================================================================
// Core Portfolio Management - Now Enabled for Production
export { default as SafePortfolioManager } from './managers/safe-portfolio-manager';

// Architecture Management
export { default as ArchitectureRunwayManager } from './managers/architecture-runway-manager';// Continuous Delivery Pipeline';
export { default as ContinuousDeliveryPipeline} from './managers/continuous-delivery-pipeline');
export { default as DevSecOpsManager} from './managers/devsecops-manager');
export { default as EnterpriseArchitectureManager} from './managers/enterprise-architecture-manager');
export { default as EpicOwnerManager} from './managers/epic-owner-manager');
export { default as ProductManagementManager} from './managers/product-management-manager');
export { default as ProgramIncrementManager} from './managers/program-increment-manager');
export { default as ReleaseTrainEngineerManager} from './managers/release-train-engineer-manager');
export { default as SAFeEventsManager} from './managers/safe-events-manager');
export { default as SolutionTrainEngineerManager} from './managers/solution-train-engineer-manager');
export { default as SystemSolutionArchitectureManager} from './managers/system-solution-architecture-manager');
export { default as ValueStreamMapper} from './managers/value-stream-mapper')./managers/value-stream-optimization-engine')./services/continuous-delivery/deployment-automation-service')./services/continuous-delivery/pipeline-performance-service')./services/continuous-delivery/quality-gate-service');
export { SPARCCDMappingService} from './services/continuous-delivery/sparc-cd-mapping-service')'; 
// SERVICES - Specialized SAFe services
// ============================================================================
export { BusinessCaseService} from './services/business-case-service')./services/customer-research-service')./services/devsecops/compliance-monitoring-service')./services/devsecops/security-incident-response-service');
export { SecurityScanningService} from './services/devsecops/security-scanning-service')./services/enterprise-architecture/architecture-health-service');
export { ArchitecturePrincipleService} from './services/enterprise-architecture/architecture-principle-service')./services/enterprise-architecture/governance-decision-service')./services/enterprise-architecture/technology-standards-service');
export { EpicLifecycleService} from './services/epic-lifecycle-service')./services/market-analysis-service');
export { ProductVisionService} from './services/product-vision-service');
export { PIPlanningFacilitationService} from './services/rte/pi-planning-facilitation-service')./services/rte/program-predictability-service')./services/rte/scrum-of-scrums-service');
export { MultiARTCoordinationService} from './services/solution-train/multi-art-coordination-service')./services/solution-train/solution-architecture-management-service')./services/solution-train/solution-planning-service');
export { BottleneckAnalysisService} from './services/value-stream/bottleneck-analysis-service')./services/value-stream/continuous-improvement-service')./services/value-stream/flow-optimization-service')./services/value-stream/predictive-analytics-service')'; 
// INTEGRATIONS - SAFe framework integrations
// ============================================================================
// Database-SPARC integration now handled via event system - no direct bridge needed
export type {
  SafePortfolioKanbanState,
  SafeProgramKanbanState,
  SafeSolutionKanbanState,
  SafeTeamKanbanState,
} from './integrations/kanban-integration');
export {
  createSafePortfolioKanban,
  createSafeProgramKanban,
  createSafeTeamKanban,
  featureToKanbanTask,
  portfolioEpicToKanbanTask,
  storyToKanbanTask,
} from './integrations/kanban-integration')'; 
// UTILITIES - SAFe framework utilities
// ============================================================================
export { SafeCollectionUtils} from './utilities/collections/safe-collections')./utilities/date/safe-date-utils')./utilities/validation/safe-validation');
// FACTORY FUNCTIONS
// ============================================================================
/**
 * Create a SAFe framework integration - Production Ready
 */
export function createSafeFramework(): void {
  return new SafePortfolioManager(): void { epicKanbanMachine} from './state-machines/epic-kanban-machine')./state-machines/pi-planning-machine')./state-machines/value-stream-machine')./state-machines/portfolio-kanban-machine')./state-machines/continuous-delivery-machine')'; 
// EVENTS - SAFe framework events (placeholder - needs implementation)
// ============================================================================
// export { default as SafeEventHandlers} from './events/safe-event-handlers');