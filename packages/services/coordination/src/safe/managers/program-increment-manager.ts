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
import { EventBus} from '@claude-zen/foundation')import type { CapacityPlanningService, TeamCapacity} from '../services/program-increment/capacity-planning-service')import type { PICompletionService} from '../services/program-increment/pi-completion-service')import type { PIExecutionService} from '../services/program-increment/pi-execution-service')import type { PIPlanningService} from '../services/program-increment/pi-planning-service')import type {';
  AgileReleaseTrain,
  Dependency,
  Feature,
  Logger,
  MemorySystem,
  PIObjective,
  ProgramIncrement,
  Risk,
  EventBus,
} from '../types')import { PIStatus} from '../types')export type {';
  CapacityPlanningResult,
  CapacityRisk,
  TeamAllocation,
} from '../services/program-increment/capacity-planning-service')export type {';
  Achievement,
  Challenge,
  ImprovementRecommendation,
  LessonLearned,
  PICompletionReport,
} from '../services/program-increment/pi-completion-service')export type {';
  DependencyHealth,
  PIExecutionMetrics,
  PredictabilityMetrics,
  QualityMetrics,
  RiskBurndown,
  VelocityTrend,
} from '../services/program-increment/pi-execution-service')// Re-export service interfaces for API compatibility';
export type {
  ArchitecturalVision,
  BusinessContext,
  PIPlanningEventConfig,
  PlanningAdjustment,
  PlanningAgendaItem,
  PlanningParticipant,
} from '../services/program-increment/pi-planning-service')// =========================================================================== = ';
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
  constructor(
    eventBus: {}
  ) {
    super();
    this.logger = logger;
    this.eventBus = eventBus;
    this.memory = memory;
    this.config = {
      enableAGUIIntegration: this.initializeState();
}
  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================
  /**
   * Initialize the PI Manager with service delegation
   */
  async initialize():Promise<void> {
    if (this.initialized) return'; 
    this.logger.info('Initializing Program Increment Manager,{';
      config: true;')      this.logger.info('Program Increment Manager initialized successfully');')      this.emit('initialized,');')} catch (error) {';
    ')      this.logger.error('Failed to initialize PI Manager,{ error};);
      throw error;
}
}
  /**
   * Shutdown the PI Manager and all services
   */
  async shutdown():Promise<void> {
    ')    this.logger.info('Shutting down Program Increment Manager');
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
}
    // Shutdown all services
    await Promise.all([
      this.piPlanningService?.shutdown(),
      this.capacityPlanningService?.shutdown(),
      this.piExecutionService?.shutdown(),
      this.piCompletionService?.shutdown(),
]);
    await this.persistState();
    this.removeAllListeners();
    this.initialized = false;')    this.logger.info('Program Increment Manager shutdown complete');
}
  // ============================================================================
  // PI PLANNING WORKFLOW - Delegated to PIPlanningService
  // ============================================================================
  /**
   * Plan Program Increment - Orchestrates complete PI planning workflow
   */
  async planProgramIncrement(
    artId: this.startTimer('pi_planning');
    try {
      // Delegate to PI Planning Service for event orchestration
      const planningEvent =
        await this.getPIPlanningService().createPIPlanningEvent(
          artId,
          businessContext,
          architecturalVision,
          teamCapacities.map((tc) => ({
            userId: 'team-lead ',as const,';
            required: true,
})));
      // Execute planning workflow with AGUI integration
      const planningResult =
        await this.getPIPlanningService().executePIPlanningWorkflow(
          planningEvent;
        );
      // Create Program Increment structure
      const programIncrement = await this.createProgramIncrement(
        artId,
        planningResult,
        teamCapacities;
      );
      // Generate PI objectives from business context
      const piObjectives = await this.generatePIObjectives(
        programIncrement.id,
        businessContext,
        teamCapacities;
      );
      // Delegate to Capacity Planning Service for feature allocation
      const _capacityResult =
        await this.getCapacityPlanningService().implementCapacityPlanning(
          teamCapacities,
          [] // Features will be generated from objectives;
        );
      // Plan feature allocation across teams
      const features = await this.planFeatureAllocation(
        programIncrement.id,
        piObjectives,
        architecturalVision,
        teamCapacities;
      );
      // Identify dependencies and risks
      const dependencies = await this.identifyPIDependencies(
        features,
        piObjectives;
      );
      const risks = await this.assessPIRisks(
        programIncrement,
        features,
        dependencies;
      );
      // Create complete PI plan
      const completePIPlan = {
        ...programIncrement,
        objectives: features.map((feature) => ({
      featureId: feature.id,
      featureName: feature.name,
      description: feature.description,
      businessValue: feature.businessValue,
      complexity: feature.stories?.length|| 5, // Use story count as complexity')      requiredSkills: ['general'],';
      priority: medium 'as const,`;
      dependencies: [],
      acceptanceCriteria: feature.acceptanceCriteria,
      estimatedDuration: 1,
});
    return await this.getCapacityPlanningService().implementCapacityPlanning(
      teamCapacities,
      allocationRequests
    );
}
  // ============================================================================
  // PI EXECUTION AND TRACKING - Delegated to PIExecutionService
  // ============================================================================
  /**
   * Start PI execution - Delegates to PIExecutionService
   */
  async startPIExecution(piId: this.state.activePIs.get(piId);
    if (!pi) {
      throw new Error(`PI not found: PIStatus.ACTIVE;
    // Initialize PI execution tracking')    this.logger.info('PI execution initialized,{ piId, status: pi.status};);
    // Initialize metrics tracking
    const initialMetrics =;
      await this.getPIExecutionService().trackPIProgress(piId);
    this.state.piMetrics.set(piId, initialMetrics);')    this.logger.info('PI execution started successfully,{ piId};);')    this.emit('pi-execution-started, pi);
}
  /**
   * Track PI progress - Delegates to PIExecutionService
   */
  async trackPIProgress(piId: this.state.activePIs.get(piId);
    if (!pi) {
    `)      throw new Error(`PI not found: ${p}iId``);')};;
    // Delegate to Execution Service for comprehensive tracking
    const currentMetrics =;
      await this.getPIExecutionService().trackPIProgress(piId);
    // Store updated metrics
    this.state.piMetrics.set(piId, currentMetrics);')    this.logger.debug('PI progress updated,{';
      piId,
      progress: currentMetrics.progressPercentage,
      predictability: currentMetrics.predictabilityMetrics?.overallPredictability|| 0,')';
});')    this.emit(pi-progress-updated,{ piId, metrics: currentMetrics};);
    return currentMetrics;
}
  // ============================================================================
  // PI COMPLETION - Delegated to PICompletionService
  // ============================================================================
  /**
   * Complete Program Increment - Delegates to PICompletionService
   */
  async completeProgramIncrement(piId: this.state.activePIs.get(piId);
    if (!pi) {
    `)      throw new Error(`PI not found: await this.trackPIProgress(piId);
    // Create stakeholders list
    const stakeholders = [
      {
    ')        userId : 'rte-1')        name : 'Release Train Engineer')        role : 'rte 'as const,';
        responsibilities: 'po-1',)        name : 'Product Owner')        role : 'product-owner 'as const,';
        responsibilities: ['Product delivery,' Stakeholder communication'],';
        signOffRequired: true,
},
];
    // Delegate to Completion Service
    const completionReport =
      await this.getPICompletionService().completeProgramIncrement(
        piId,
        finalMetrics,
        stakeholders;
      );
    // Update PI status
    (pi as any).status = PIStatus.COMPLETED;
    this.logger.info('Program Increment completed successfully,{';
      piId,
      objectivesAchieved: completionReport.objectivesAchieved,
      overallSuccess: completionReport.overallSuccessRate,')';
});')    this.emit('pi-completed,{ pi, completionReport};);
    return completionReport;
}
  // ============================================================================
  // SERVICE ACCESS METHODS - Lazy Loading
  // ============================================================================
  /**
   * Get PI Planning Service instance with lazy loading
   */
  private getPIPlanningService():PIPlanningService {
    if (!this.piPlanningService) {
      this.piPlanningService = new PIPlanningService(this.logger);
}
    return this.piPlanningService;
}
  /**
   * Get Capacity Planning Service instance with lazy loading
   */
  private getCapacityPlanningService():CapacityPlanningService {
    if (!this.capacityPlanningService) {
      this.capacityPlanningService = new CapacityPlanningService(this.logger);
}
    return this.capacityPlanningService;
}
  /**
   * Get PI Execution Service instance with lazy loading
   */
  private getPIExecutionService():PIExecutionService {
    if (!this.piExecutionService) {
      this.piExecutionService = new PIExecutionService(this.logger);
}
    return this.piExecutionService;
}
  /**
   * Get PI Completion Service instance with lazy loading
   */
  private getPICompletionService():PICompletionService {
    if (!this.piCompletionService) {
      this.piCompletionService = new PICompletionService(this.logger);
}
    return this.piCompletionService;
}
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  private initializeState():PIManagerState {
    return {
      activeARTs: await this.memory.retrieve('pi-manager: persistedState as any;
        this.state = {
          ...this.state,
          ...state,
          activeARTs: {
        ...this.state,
        activeARTs: setInterval(async () => {
      try {
        await this.updateAllPIMetrics();
} catch (error) {
    ')        this.logger.error('PI tracking update failed,{ error};);
}
}, this.configuration.trackingUpdateInterval);
}
  private registerEventHandlers():void {
    ')    this.eventBus.registerHandler('feature-completed, async (event) => {';
      await this.handleFeatureCompletion(event.payload.featureId);')';
});
    this.eventBus.registerHandler('risk-identified, async (event) => {';
      await this.handleRiskIdentification(event.payload.risk);)`;
});
}
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  private startTimer(name: 'Core Feature',)        description : 'Main feature for this PI,'
'        piId,';
        businessValue: 'planned ',as any,';
        owner  = 'product-owner`)        team: Array.from(this.state.activePIs.keys())();
    for (const piId of activePIs) {
      try {
        await this.trackPIProgress(piId);
} catch (error) {        owner = product-owner`)        team: Array.from(this.state.activePIs.keys())();
    for (const piId of activePIs) {
      try {
        await this.trackPIProgress(piId)'; 
} catch (error) {.charAt(        owner  = 'product-owner`)        team: Array.from(this.state.activePIs.keys())();
    for (const piId of activePIs) {
      try {
        await this.trackPIProgress(piId)'; 
} catch (error) {.indexOf("'") > -1 ? "" : "");
        this.logger.error(``Failed to update metrics for PI ${piId}, { error});`)    this.logger.info(`',Feature completed,{ featureId};);
}
  private handleRiskIdentification(risk: Risk): void {
    ')    this.logger.info('Risk identified,{ riskId: risk.id};);
};)};;
// ============================================================================
// EXPORTS
// ============================================================================
export default ProgramIncrementManager;
')';