/**
 * @fileoverview Program Increment Manager - Lightweight facade for SAFe PI management.
 *
 * Provides SAFe Program Increment planning and execution through delegation to specialized
 * services for scalable and maintainable PI lifecycle management.
 *
 * Delegates to:
 * - PIPlanningService: Event orchestration and workflow management
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

import { EventBus } from '@claude-zen/foundation';
import type { CapacityPlanningService, TeamCapacity } from '../services/program-increment/capacity-planning-service';
import type { PICompletionService } from '../services/program-increment/pi-completion-service';
import type { PIExecutionService } from '../services/program-increment/pi-execution-service';
import type { PIPlanningService } from '../services/program-increment/pi-planning-service';
import type {
  AgileReleaseTrain,
  Dependency,
  Feature,
  Logger,
  MemorySystem,
  PIObjective,
  ProgramIncrement,
  Risk,
  TypeSafeEventBus,
} from '../types';
import { PIStatus } from '../types';
export type {
  CapacityPlanningResult,
  CapacityRisk,
  TeamAllocation,
} from '../services/program-increment/capacity-planning-service';
export type {
  Achievement,
  Challenge,
  ImprovementRecommendation,
  LessonLearned,
  PICompletionReport,
} from '../services/program-increment/pi-completion-service';
export type {
  DependencyHealth,
  PIExecutionMetrics,
  PredictabilityMetrics,
  QualityMetrics,
  RiskBurndown,
  VelocityTrend,
} from '../services/program-increment/pi-execution-service';
// Re-export service interfaces for API compatibility
export type {
  ArchitecturalVision,
  BusinessContext,
  PIPlanningEventConfig,
  PlanningAdjustment,
  PlanningAgendaItem,
  PlanningParticipant,
} from '../services/program-increment/pi-planning-service';
// ============================================================================
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
  private readonly logger: Logger;
  private readonly config: PIManagerConfig;

  private state: PIManagerState;
  private trackingTimer?: NodeJS.Timeout;

  // Service delegation instances - lazy loaded
  private piPlanningService?: PIPlanningService;
  private capacityPlanningService?: CapacityPlanningService;
  private piExecutionService?: PIExecutionService;
  private piCompletionService?: PICompletionService;
  private initialized = false;

  constructor(
    eventBus: TypeSafeEventBus,
    memory: MemorySystem,
    logger: Logger,
    config: Partial<PIManagerConfig> = {}
  ) {
    super();

    this.logger = logger;
    this.eventBus = eventBus;
    this.memory = memory;

    this.config = {
      enableAGUIIntegration: true,
      enableAutomatedCapacityPlanning: true,
      enablePIPlanningEvents: true,
      enableContinuousTracking: true,
      defaultPILengthWeeks: 10,
      iterationsPerPI: 5,
      ipIterationWeeks: 2,
      planningEventDurationHours: 16,
      maxFeaturesPerPI: 50,
      maxTeamsPerART: 12,
      capacityBufferPercentage: 20,
      trackingUpdateInterval: 3600000,
      ...config,
    };

    this.state = this.initializeState();
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Initialize the PI Manager with service delegation
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing Program Increment Manager,{
      config: this.config,
    });

    try {
      // Initialize specialized services with lazy loading
      await this.initializeServices();

      // Load persisted state
      await this.loadPersistedState();

      // Start tracking if enabled
      if (this.configuration.enableContinuousTracking) {
        this.startContinuousTracking();
      }

      // Register event handlers
      this.registerEventHandlers();

      this.initialized = true;
      this.logger.info('Program Increment Manager initialized successfully'');
      this.emit('initialized,');
    } catch (error) {
      this.logger.error('Failed to initialize PI Manager,{ error }');
      throw error;
    }
  }

  /**
   * Shutdown the PI Manager and all services
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Program Increment Manager'');

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
    this.initialized = false;

    this.logger.info('Program Increment Manager shutdown complete'');
  }

  // ============================================================================
  // PI PLANNING WORKFLOW - Delegated to PIPlanningService
  // ============================================================================

  /**
   * Plan Program Increment - Orchestrates complete PI planning workflow
   */
  async planProgramIncrement(
    artId: string,
    businessContext: any,
    architecturalVision: any,
    teamCapacities: TeamCapacity[]
  ): Promise<ProgramIncrement> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Starting comprehensive PI Planning,{ artId }');

    const _timer = this.startTimer('pi_planning'');

    try {
      // Delegate to PI Planning Service for event orchestration
      const planningEvent =
        await this.getPIPlanningService().createPIPlanningEvent(
          artId,
          businessContext,
          architecturalVision,
          teamCapacities.map((tc) => ({
            userId: tc.teamId,
            name: tc.teamId,
            role:'team-lead 'as const,
            required: true,
          }))
        );

      // Execute planning workflow with AGUI integration
      const planningResult =
        await this.getPIPlanningService().executePIPlanningWorkflow(
          planningEvent
        );

      // Create Program Increment structure
      const programIncrement = await this.createProgramIncrement(
        artId,
        planningResult,
        teamCapacities
      );

      // Generate PI objectives from business context
      const piObjectives = await this.generatePIObjectives(
        programIncrement.id,
        businessContext,
        teamCapacities
      );

      // Delegate to Capacity Planning Service for feature allocation
      const _capacityResult =
        await this.getCapacityPlanningService().implementCapacityPlanning(
          teamCapacities,
          [] // Features will be generated from objectives
        );

      // Plan feature allocation across teams
      const features = await this.planFeatureAllocation(
        programIncrement.id,
        piObjectives,
        architecturalVision,
        teamCapacities
      );

      // Identify dependencies and risks
      const dependencies = await this.identifyPIDependencies(
        features,
        piObjectives
      );
      const risks = await this.assessPIRisks(
        programIncrement,
        features,
        dependencies
      );

      // Create complete PI plan
      const completePIPlan = {
        ...programIncrement,
        objectives: piObjectives,
        features,
        dependencies,
        risks,
        status: PIStatus.PLANNING,
      };

      // Store in state
      this.state.activePIs.set(completePIPlan.id, completePIPlan);

      this.endTimer('pi_planning'');

      this.logger.info('PI Planning completed successfully,
        piId: completePIPlan.id,
        objectiveCount: piObjectives.length,
        featureCount: features.length,
        capacityUtilization:
          capacityResult.allocatedCapacity / capacityResult.totalCapacity,);

      this.emit('pi-planned,completePIPlan');
      return completePIPlan;
    } catch (error) {
      this.endTimer('pi_planning'');
      this.logger.error('PI Planning failed:,error');
      throw error;
    }
  }

  /**
   * Execute PI planning workflow - Delegates to PIPlanningService
   */
  async executePIPlanningWorkflow(planningEvent: any): Promise<any> {
    if (!this.initialized) await this.initialize();

    return await this.getPIPlanningService().executePIPlanningWorkflow(
      planningEvent
    );
  }

  /**
   * Implement capacity planning - Delegates to CapacityPlanningService
   */
  async implementCapacityPlanning(
    teamCapacities: TeamCapacity[],
    _piObjectives: PIObjective[],
    features: Feature[]
  ): Promise<any> {
    if (!this.initialized) await this.initialize();

    // Convert features to allocation requests
    const allocationRequests = features.map((feature) => ({
      featureId: feature.id,
      featureName: feature.name,
      description: feature.description,
      businessValue: feature.businessValue,
      complexity: feature.stories?.length|| 5, // Use story count as complexity
      requiredSkills: ['general'],
      priority: medium 'as const,
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
  async startPIExecution(piId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    const pi = this.state.activePIs.get(piId);
    if (!pi) {
      throw new Error(`PI not found: ${piId}`);`
    }

    this.logger.info('Starting PI execution,{ piId }');

    // Update PI status
    (pi as any).status = PIStatus.ACTIVE;

    // Initialize PI execution tracking
    this.logger.info('PI execution initialized,{ piId, status: pi.status }');

    // Initialize metrics tracking
    const initialMetrics =
      await this.getPIExecutionService().trackPIProgress(piId);
    this.state.piMetrics.set(piId, initialMetrics);

    this.logger.info('PI execution started successfully,{ piId }');
    this.emit('pi-execution-started,pi');
  }

  /**
   * Track PI progress - Delegates to PIExecutionService
   */
  async trackPIProgress(piId: string): Promise<any> {
    if (!this.initialized) await this.initialize();

    const pi = this.state.activePIs.get(piId);
    if (!pi) {
      throw new Error(`PI not found: $piId`);`
    }

    // Delegate to Execution Service for comprehensive tracking
    const currentMetrics =
      await this.getPIExecutionService().trackPIProgress(piId);

    // Store updated metrics
    this.state.piMetrics.set(piId, currentMetrics);

    this.logger.debug('PI progress updated,{
      piId,
      progress: currentMetrics.progressPercentage,
      predictability:
        currentMetrics.predictabilityMetrics?.overallPredictability|| 0,
    });

    this.emit('pi-progress-updated,{ piId, metrics: currentMetrics }');
    return currentMetrics;
  }

  // ============================================================================
  // PI COMPLETION - Delegated to PICompletionService
  // ============================================================================

  /**
   * Complete Program Increment - Delegates to PICompletionService
   */
  async completeProgramIncrement(piId: string): Promise<any> {
    if (!this.initialized) await this.initialize();

    const pi = this.state.activePIs.get(piId);
    if (!pi) {
      throw new Error(`PI not found: ${piId}`);`
    }

    this.logger.info('Completing Program Increment,{ piId }');

    // Get final metrics
    const finalMetrics = await this.trackPIProgress(piId);

    // Create stakeholders list
    const stakeholders = [
      {
        userId:'rte-1,
        name:'Release Train Engineer,
        role:'rte 'as const,
        responsibilities: ['PI coordination,'Process facilitation'],
        signOffRequired: true,
      },
      {
        userId:'po-1,
        name:'Product Owner,
        role:'product-owner 'as const,
        responsibilities: ['Product delivery,'Stakeholder communication'],
        signOffRequired: true,
      },
    ];

    // Delegate to Completion Service
    const completionReport =
      await this.getPICompletionService().completeProgramIncrement(
        piId,
        finalMetrics,
        stakeholders
      );

    // Update PI status
    (pi as any).status = PIStatus.COMPLETED;

    this.logger.info('Program Increment completed successfully,{
      piId,
      objectivesAchieved: completionReport.objectivesAchieved,
      overallSuccess: completionReport.overallSuccessRate,
    });

    this.emit('pi-completed,{ pi, completionReport }');
    return completionReport;
  }

  // ============================================================================
  // SERVICE ACCESS METHODS - Lazy Loading
  // ============================================================================

  /**
   * Get PI Planning Service instance with lazy loading
   */
  private getPIPlanningService(): PIPlanningService {
    if (!this.piPlanningService) {
      this.piPlanningService = new PIPlanningService(this.logger);
    }
    return this.piPlanningService;
  }

  /**
   * Get Capacity Planning Service instance with lazy loading
   */
  private getCapacityPlanningService(): CapacityPlanningService {
    if (!this.capacityPlanningService) {
      this.capacityPlanningService = new CapacityPlanningService(this.logger);
    }
    return this.capacityPlanningService;
  }

  /**
   * Get PI Execution Service instance with lazy loading
   */
  private getPIExecutionService(): PIExecutionService {
    if (!this.piExecutionService) {
      this.piExecutionService = new PIExecutionService(this.logger);
    }
    return this.piExecutionService;
  }

  /**
   * Get PI Completion Service instance with lazy loading
   */
  private getPICompletionService(): PICompletionService {
    if (!this.piCompletionService) {
      this.piCompletionService = new PICompletionService(this.logger);
    }
    return this.piCompletionService;
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  private initializeState(): PIManagerState {
    return {
      activeARTs: new Map(),
      activePIs: new Map(),
      piMetrics: new Map(),
      teamCapacities: new Map(),
      dependencyMatrix: new Map(),
      riskRegister: new Map(),
      lastUpdated: new Date(),
    };
  }

  private initializeServices(): void {
    // Services are initialized lazily when first accessed
    this.logger.debug('PI Manager services configured for lazy loading'');
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.memory.retrieve('pi-manager:state'');
      if (persistedState) {
        const state = persistedState as any;
        this.state = {
          ...this.state,
          ...state,
          activeARTs: new Map(state.activeARTs|| []),
          activePIs: new Map(state.activePIs|| []),
          piMetrics: new Map(state.piMetrics|| []),
          teamCapacities: new Map(state.teamCapacities|| []),
          dependencyMatrix: new Map(state.dependencyMatrix|| []),
          riskRegister: new Map(state.riskRegister|| []),
        };
        this.logger.info('PI Manager state loaded'');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state,{ error }');
    }
  }

  private async persistState(): Promise<void> {
    try {
      const stateToSerialize = {
        ...this.state,
        activeARTs: Array.from(this.state.activeARTs.entries()),
        activePIs: Array.from(this.state.activePIs.entries()),
        piMetrics: Array.from(this.state.piMetrics.entries()),
        teamCapacities: Array.from(this.state.teamCapacities.entries()),
        dependencyMatrix: Array.from(this.state.dependencyMatrix.entries()),
        riskRegister: Array.from(this.state.riskRegister.entries()),
      };

      await this.memory.store('pi-manager:state,stateToSerialize');
    } catch (error) {
      this.logger.error('Failed to persist state,{ error }');
    }
  }

  private startContinuousTracking(): void {
    this.trackingTimer = setInterval(async () => {
      try {
        await this.updateAllPIMetrics();
      } catch (error) {
        this.logger.error('PI tracking update failed,{ error }');
      }
    }, this.configuration.trackingUpdateInterval);
  }

  private registerEventHandlers(): void {
    this.eventBus.registerHandler('feature-completed,async (event) => {
      await this.handleFeatureCompletion(event.payload.featureId);
    });

    this.eventBus.registerHandler('risk-identified,async (event) => {
      await this.handleRiskIdentification(event.payload.risk);
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private startTimer(name: string): any {
    return { name, start: Date.now() };
  }

  private endTimer(name: string): void {
    this.logger.debug(`Timer $namecompleted`);`
  }

  private createProgramIncrement(
    artId: string,
    piPlan: any,
    teamCapacities: TeamCapacity[]
  ): ProgramIncrement 
    return {
      id: `pi-${artId}-${Date.now()}`,`
      name: `Program Increment for ART ${artId}`,`
      startDate: new Date(),
      endDate: new Date(
        Date.now() +
          this.configuration.defaultPILengthWeeks * 7 * 24 * 60 * 60 * 1000
      ),
      status: PIStatus.PLANNING,
      objectives: [],
      features: [],
      dependencies: [],
      risks: [],
    };

  private generatePIObjectives(
    piId: string,
    businessContext: any,
    teamCapacities: TeamCapacity[]
  ): PIObjective[] 
    // Simplified objective generation
    return [
      {
        id: `obj-${piId}-1`,`
        description:'Main objective for this PI,
        businessValue: 20,
        confidence: 8,
      },
    ];

  private planFeatureAllocation(
    piId: string,
    piObjectives: PIObjective[],
    architecturalVision: any,
    teamCapacities: TeamCapacity[]
  ): Feature[] 
    // Simplified feature allocation
    return [
      {
        id: `feature-${piId}-1`,`
        name:'Core Feature,
        description:'Main feature for this PI,
        piId,
        businessValue: 10,
        acceptanceCriteria: [
         'Feature must be testable,
         'Feature must add business value,
        ],
        stories: [],
        enablers: [],
        status:'planned 'as any,
        owner:'product-owner,
        team: teamCapacities[0]?.teamId||'team-1,
      },
    ];

  private identifyPIDependencies(
    features: Feature[],
    objectives: PIObjective[]
  ): Dependency[] 
    return [];

  private assessPIRisks(
    pi: ProgramIncrement,
    features: Feature[],
    deps: Dependency[]
  ): Risk[] 
    return [];

  private async updateAllPIMetrics(): Promise<void> {
    const activePIs = Array.from(this.state.activePIs.keys())();
    for (const piId of activePIs) {
      try {
        await this.trackPIProgress(piId);
      } catch (error) {
        this.logger.error(`Failed to update metrics for PI ${piId}`, { error });`
      }
    }
  }

  private handleFeatureCompletion(featureId: string): void {
    this.logger.info('Feature completed,{ featureId }');
  }

  private handleRiskIdentification(risk: Risk): void {
    this.logger.info('Risk identified,{ riskId: risk.id }');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ProgramIncrementManager;
