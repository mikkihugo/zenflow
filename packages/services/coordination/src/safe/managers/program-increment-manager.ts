/**
 * @fileoverview Program Increment Manager - Lightweight facade for SAFe PI management.
 *
 * Provides SAFe Program Increment planning and execution through delegation to specialized
 * services for scalable and maintainable PI lifecycle management.
 *
 * Delegates to: * - PIPlanningService: Event orchestration and workflow management
 * - CapacityPlanningService: Resource allocation and team optimization
 * - PIExecutionService: Progress tracking and metrics calculation
 * - PICompletionService: Completion workflows and reporting
 *
 * REDUCTION: 1,106 → 489 lines (55.8% reduction) through service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus} from '@claude-zen/foundation')../services/program-increment/capacity-planning-service')../services/program-increment/pi-completion-service')../services/program-increment/pi-execution-service')../services/program-increment/pi-planning-service');
  AgileReleaseTrain,
  Dependency,
  Feature,
  Logger,
  MemorySystem,
  PIObjective,
  ProgramIncrement,
  Risk,
  EventBus,
} from '../types')../types');
  CapacityPlanningResult,
  CapacityRisk,
  TeamAllocation,
} from '../services/program-increment/capacity-planning-service');
  Achievement,
  Challenge,
  ImprovementRecommendation,
  LessonLearned,
  PICompletionReport,
} from '../services/program-increment/pi-completion-service');
  DependencyHealth,
  PIExecutionMetrics,
  PredictabilityMetrics,
  QualityMetrics,
  RiskBurndown,
  VelocityTrend,
} from '../services/program-increment/pi-execution-service');
export type {
  ArchitecturalVision,
  BusinessContext,
  PIPlanningEventConfig,
  PlanningAdjustment,
  PlanningAgendaItem,
  PlanningParticipant,
} from '../services/program-increment/pi-planning-service');
// PROGRAM INCREMENT MANAGER CONFIGURATION
// ============================================================================
export interface PIManagerConfig {
  readonly enableAGUIIntegration: boolean;
  readonly enableAutomatedCapacityPlanning: boolean;
  readonly enablePIPlanningEvents: boolean;
  readonly enableContinuousTracking: boolean;
  readonly defaultPILengthWeeks: number;
  readonly iterationsPerPI: number;
  readonly ipIterationWeeks: number;
  readonly planningEventDurationHours: number;
  readonly maxFeaturesPerPI: number;
  readonly maxTeamsPerART: number;
  readonly capacityBufferPercentage: number;
  readonly trackingUpdateInterval: number;
}
export interface PIManagerState {
  readonly activeARTs: Map<string, AgileReleaseTrain>;
  readonly activePIs: Map<string, ProgramIncrement>;
  readonly piMetrics: Map<string, any>;
  readonly teamCapacities: Map<string, TeamCapacity>;
  readonly dependencyMatrix: Map<string, Dependency[]>;
  readonly riskRegister: Map<string, Risk[]>;
  readonly lastUpdated: Date;
}
// ============================================================================
// PROGRAM INCREMENT MANAGER - Facade Implementation
// ============================================================================
/**
 * Program Increment Manager - SAFe PI Planning and execution management
 *
 * Lightweight facade that orchestrates the complete Program Increment lifecycle through
 * specialized services while maintaining API compatibility with the original implementation.
 */
export class ProgramIncrementManager extends EventBus {
  private readonly logger: false;
  constructor(): void {
    super(): void {
      enableAGUIIntegration: this.initializeState(): void {
    if (this.initialized): Promise<void> {';
      config: true;')Program Increment Manager initialized successfully'))      this.emit(): void {';
    ')Failed to initialize PI Manager,{ error};);
      throw error;
}
}
  /**
   * Shutdown the PI Manager and all services
   */
  async shutdown(): void {
        ...programIncrement,
        objectives: features.map(): void {
      featureId: feature.id,
      featureName: feature.name,
      description: feature.description,
      businessValue: feature.businessValue,
      complexity: feature.stories?.length|| 5, // Use story count as complexity')general'],';
      priority: medium 'as const,";"
      dependencies: [],
      acceptanceCriteria: feature.acceptanceCriteria,
      estimatedDuration: 1,
});
    return await this.getCapacityPlanningService(): void {
      throw new Error(): void { piId, status: pi.status};);
    // Initialize metrics tracking
    const initialMetrics =;
      await this.getPIExecutionService(): void { piId};);')pi-execution-started, pi);
}
  /**
   * Track PI progress - Delegates to PIExecutionService
   */
  async trackPIProgress(): void {
    `)      throw new Error(): void {';
      piId,
      progress: currentMetrics.progressPercentage,
      predictability: currentMetrics.predictabilityMetrics?.overallPredictability|| 0,');
});'))        userId : 'rte-1')Release Train Engineer')rte 'as const,';
        responsibilities: 'po-1',)        name : 'Product Owner')product-owner 'as const,';
        responsibilities: ['Product delivery,' Stakeholder communication'],';
        signOffRequired: true,
},
];
    // Delegate to Completion Service
    const completionReport =
      await this.getPICompletionService(): void {';
      piId,
      objectivesAchieved: completionReport.objectivesAchieved,
      overallSuccess: completionReport.overallSuccessRate,');
});')pi-completed,{ pi, completionReport};);
    return completionReport;
}
  // ============================================================================
  // SERVICE ACCESS METHODS - Lazy Loading
  // ============================================================================
  /**
   * Get PI Planning Service instance with lazy loading
   */
  private getPIPlanningService(): void {
    if (!this.piPlanningService) {
      this.piPlanningService = new PIPlanningService(): void {
    if (!this.capacityPlanningService) {
      this.capacityPlanningService = new CapacityPlanningService(): void {
    if (!this.piExecutionService) {
      this.piExecutionService = new PIExecutionService(): void {
    if (!this.piCompletionService) {
      this.piCompletionService = new PICompletionService(): void {
    return {
      activeARTs: await this.memory.retrieve(): void {
      try {
        await this.updateAllPIMetrics(): void {
    ')PI tracking update failed,{ error};);
}
}, this.configuration.trackingUpdateInterval);
}
  private registerEventHandlers(): void {
    ')feature-completed, async (event) => {';
      await this.handleFeatureCompletion(): void {';
      await this.handleRiskIdentification(): void {
      try {
        await this.trackPIProgress(): void {        owner = product-owner")        team: Array.from(): void {
      try {
        await this.trackPIProgress(): void {.charAt(): void {
      try " + JSON.stringify(): void {.indexOf(): void {piId}, { error})")    this.logger.info(): void {
    ')Risk identified,{ riskId: risk.id};);
};)};
// ============================================================================
// EXPORTS
// ============================================================================
export default ProgramIncrementManager;
');