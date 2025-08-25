/**
 * @fileoverview SAFe Framework DI Tokens
 *
 * Dependency injection tokens for the SAFe framework package using @claude-zen/foundation DI system.
 * Defines clean interfaces for optional AI integration and core SAFe services.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import { TokenFactory, InjectionToken } from '@claude-zen/foundation';

/**
 * Core SAFe service tokens
 */
export const SAFE_TOKENS = {
  // Core SAFe services
  Logger: TokenFactory.create<any>('SAFe.Logger'),
  Config: TokenFactory.create<any>('SAFe.Config'),
  MemorySystem: TokenFactory.create<any>('SAFe.MemorySystem'),
  EventBus: TokenFactory.create<any>('SAFe.EventBus'),

  // Portfolio level services
  EpicLifecycleService: TokenFactory.create<any>('SAFe.EpicLifecycleService'),
  BusinessCaseService: TokenFactory.create<any>('SAFe.BusinessCaseService'),
  PortfolioKanbanService: TokenFactory.create<any>(
    'SAFe.PortfolioKanbanService''
  ),

  // Program level services
  ProgramIncrementService: TokenFactory.create<any>(
    'SAFe.ProgramIncrementService''
  ),
  FeatureManagementService: TokenFactory.create<any>(
    'SAFe.FeatureManagementService''
  ),
  ARTCoordinationService: TokenFactory.create<any>(
    'SAFe.ARTCoordinationService''
  ),

  // Team level services
  IterationPlanningService: TokenFactory.create<any>(
    'SAFe.IterationPlanningService''
  ),
  StoryManagementService: TokenFactory.create<any>(
    'SAFe.StoryManagementService''
  ),
  TeamKanbanService: TokenFactory.create<any>('SAFe.TeamKanbanService'),

  // Architecture services
  RunwayItemService: TokenFactory.create<any>('SAFe.RunwayItemService'),
  TechnicalDebtService: TokenFactory.create<any>('SAFe.TechnicalDebtService'),
  ArchitectureDecisionService: TokenFactory.create<any>(
    'SAFe.ArchitectureDecisionService''
  ),
  CapabilityService: TokenFactory.create<any>('SAFe.CapabilityService'),

  // DevSecOps services
  SecurityScanningService: TokenFactory.create<any>(
    'SAFe.SecurityScanningService''
  ),
  ComplianceMonitoringService: TokenFactory.create<any>(
    'SAFe.ComplianceMonitoringService''
  ),
  IncidentResponseService: TokenFactory.create<any>(
    'SAFe.IncidentResponseService''
  ),

  // Value Stream services
  ValueStreamMappingService: TokenFactory.create<any>(
    'SAFe.ValueStreamMappingService''
  ),
  FlowAnalyticsService: TokenFactory.create<any>('SAFe.FlowAnalyticsService'),
  ValueDeliveryService: TokenFactory.create<any>('SAFe.ValueDeliveryService'),

  // Solution Train services
  MultiARTCoordinationService: TokenFactory.create<any>(
    'SAFe.MultiARTCoordinationService''
  ),
  SolutionPlanningService: TokenFactory.create<any>(
    'SAFe.SolutionPlanningService''
  ),
  CapabilityRoadmapService: TokenFactory.create<any>(
    'SAFe.CapabilityRoadmapService''
  ),

  // Continuous Delivery services
  DeploymentPipelineService: TokenFactory.create<any>(
    'SAFe.DeploymentPipelineService''
  ),
  ReleaseManagementService: TokenFactory.create<any>(
    'SAFe.ReleaseManagementService''
  ),
  QualityAssuranceService: TokenFactory.create<any>(
    'SAFe.QualityAssuranceService''
  ),
} as const;

/**
 * Optional AI enhancement tokens - these are injected only if available
 */
export const AI_ENHANCEMENT_TOKENS = {
  // Optional AI coordinators (from @claude-zen/brain)
  BrainCoordinator: TokenFactory.create<any>('AI.BrainCoordinator'),
  NeuralOptimizer: TokenFactory.create<any>('AI.NeuralOptimizer'),
  PredictionEngine: TokenFactory.create<any>('AI.PredictionEngine'),
  LearningSystem: TokenFactory.create<any>('AI.LearningSystem'),

  // Optional optimization services (from @claude-zen/optimization)
  LoadBalancer: TokenFactory.create<any>('AI.LoadBalancer'),
  PerformanceOptimizer: TokenFactory.create<any>('AI.PerformanceOptimizer'),
  ResourceManager: TokenFactory.create<any>('AI.ResourceManager'),

  // Optional monitoring services (from @claude-zen/agent-monitoring)
  PerformanceTracker: TokenFactory.create<any>('AI.PerformanceTracker'),
  TelemetryManager: TokenFactory.create<any>('AI.TelemetryManager'),
  HealthMonitor: TokenFactory.create<any>('AI.HealthMonitor'),

  // Optional workflow services (from @claude-zen/workflows)
  WorkflowEngine: TokenFactory.create<any>('AI.WorkflowEngine'),
  ProcessOptimizer: TokenFactory.create<any>('AI.ProcessOptimizer'),
  AutomationEngine: TokenFactory.create<any>('AI.AutomationEngine'),

  // Optional collaboration services (from @claude-zen/teamwork)
  ConversationOrchestrator: TokenFactory.create<any>(
    'AI.ConversationOrchestrator''
  ),
  CollaborationEngine: TokenFactory.create<any>('AI.CollaborationEngine'),
  StakeholderCoordinator: TokenFactory.create<any>('AI.StakeholderCoordinator'),

  // Note: AGUI services removed - use event-driven architecture for UI interactions
  // UI components should not be dependency-injected into business logic
} as const;

/**
 * Core interface tokens for SAFe operations
 */
export const INTERFACE_TOKENS = {
  // Data persistence
  MemoryRepository: TokenFactory.create<any>('Interface.MemoryRepository'),
  StateManager: TokenFactory.create<any>('Interface.StateManager'),
  EventPublisher: TokenFactory.create<any>('Interface.EventPublisher'),

  // External integrations
  JiraIntegration: TokenFactory.create<any>('Interface.JiraIntegration'),
  AzureDevOpsIntegration: TokenFactory.create<any>(
    'Interface.AzureDevOpsIntegration''
  ),
  GitHubIntegration: TokenFactory.create<any>('Interface.GitHubIntegration'),

  // Notification services
  EmailService: TokenFactory.create<any>('Interface.EmailService'),
  SlackService: TokenFactory.create<any>('Interface.SlackService'),
  TeamsService: TokenFactory.create<any>('Interface.TeamsService'),

  // Reporting services
  ReportGenerator: TokenFactory.create<any>('Interface.ReportGenerator'),
  DashboardService: TokenFactory.create<any>('Interface.DashboardService'),
  MetricsCollector: TokenFactory.create<any>('Interface.MetricsCollector'),
} as const;

/**
 * All tokens combined for convenience
 */
export const ALL_TOKENS = {
  ...SAFE_TOKENS,
  ...AI_ENHANCEMENT_TOKENS,
  ...INTERFACE_TOKENS,
} as const;

/**
 * Token groups for batch registration
 */
export const TOKEN_GROUPS = {
  CORE_SAFE: Object.values(SAFE_TOKENS),
  AI_ENHANCEMENTS: Object.values(AI_ENHANCEMENT_TOKENS),
  INTERFACES: Object.values(INTERFACE_TOKENS),
} as const;

// Type helpers for dependency injection
export type SafeServiceToken = keyof typeof SAFE_TOKENS;
export type AIEnhancementToken = keyof typeof AI_ENHANCEMENT_TOKENS;
export type InterfaceToken = keyof typeof INTERFACE_TOKENS;
