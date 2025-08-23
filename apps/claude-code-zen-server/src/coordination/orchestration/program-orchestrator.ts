/**
 * @file Program Level Orchestrator - Phase 2, Day 9 (Tasks 8.1-8.3)
 *
 * AI-Human collaboration orchestration for program management with Epic parallel processing,
 * cross-Epic dependency management, and program increment (PI) planning. Integrates with
 * AGUI for technical decisions and coordinates between Portfolio and Swarm levels.
 *
 * ARCHITECTURE:
 * - Epic parallel processing with dependency resolution
 * - Program Increment (PI) planning and execution
 * - Cross-team coordination with resource management
 * - Program-level performance metrics and retrospectives
 * - Integration with WorkflowGatesManager for technical gates
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type { TypeSafeEventBus } from '@claude-zen/infrastructure';
import type { BrainCoordinator } from '@claude-zen/intelligence';

import type {
  AIAssistanceLevel,
  AIRecommendation,
  ComplexityLevel,
  CoordinationInfo,
  CrossLevelDependency,
  FlowMetrics,
  HumanOversightLevel,
  OrchestrationLevel,
  ProgramDependency,
  ProgramGate,
  ProgramItem,
  ProgramMetrics,
  ProgramPriority,
  ProgramTimeline,
  TechnicalSpecification,
  WorkflowStream
} from "./multi-level-types";
import { WorkflowGatesManager } from "./workflow-gates";

// ============================================================================
// PROGRAM ORCHESTRATOR CONFIGURATION
// ============================================================================

/**
 * Program orchestrator configuration
 */
export interface ProgramOrchestratorConfig {
  readonly enablePIPlanningAutomation: boolean;
  readonly enableCrossTeamCoordination: boolean;
  readonly enableAIAssistance: boolean;
  readonly enablePerformanceTracking: boolean;
  readonly maxConcurrentEpics: number;
  readonly piLengthWeeks: number; // Program Increment length
  readonly dependencyResolutionTimeout: number; // milliseconds
  readonly coordinationCheckInterval: number; // milliseconds
  readonly performanceMetricsInterval: number; // milliseconds
}

/**
 * Program Increment (PI) configuration
 */
export interface ProgramIncrementConfig {
  readonly piNumber: number;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly objectives: PIObjective[];
  readonly capacity: TeamCapacity[];
  readonly dependencies: ProgramDependency[];
  readonly risks: PIRisk[];
  readonly milestones: PIMilestone[];
}

/**
 * PI Objective
 */
export interface PIObjective {
  readonly id: string;
  readonly description: string;
  readonly businessValue: number;
  readonly assignedTo: string[];
  readonly confidence: number; // 0-10 scale
  readonly uncommittedObjective: boolean;
  readonly dependencies: string[];
  readonly acceptanceCriteria: string[];
  readonly progress: number; // 0-1
}

/**
 * Team capacity for PI planning
 */
export interface TeamCapacity {
  readonly teamName: string;
  readonly totalCapacity: number; // story points or hours
  readonly committedCapacity: number;
  readonly availableCapacity: number;
  readonly skillAreas: string[];
  readonly vacationDays: number;
  readonly trainingDays: number;
}

/**
 * PI Risk
 */
export interface PIRisk {
  readonly id: string;
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly probability: 'low' | 'medium' | 'high';
  readonly mitigation: string;
  readonly owner: string;
  readonly status: 'open' | 'mitigated' | 'closed';
}

/**
 * PI Milestone
 */
export interface PIMilestone {
  readonly id: string;
  readonly name: string;
  readonly date: Date;
  readonly description: string;
  readonly objectives: string[];
  readonly completed: boolean;
  readonly delayReason?: string;
}

/**
 * Epic coordination context
 */
export interface EpicCoordination {
  readonly epicId: string;
  readonly assignedTeams: string[];
  readonly coordinationNeeded: CoordinationNeed[];
  readonly sharedComponents: string[];
  readonly integrationPoints: string[];
  readonly lastSyncDate: Date;
  readonly nextSyncDate: Date;
}

/**
 * Coordination need
 */
export interface CoordinationNeed {
  readonly type: 'technical' | 'business' | 'resource' | 'timeline';
  readonly description: string;
  readonly urgency: 'low' | 'medium' | 'high' | 'critical';
  readonly involvedTeams: string[];
  readonly resolution: string;
  readonly status: 'open' | 'in_progress' | 'resolved';
}

/**
 * Cross-Epic dependency analysis
 */
export interface DependencyAnalysis {
  readonly epicId: string;
  readonly dependencies: ProgramDependency[];
  readonly criticalPath: string[];
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly resolutionPlan: string;
  readonly estimatedDelay: number; // days
}

/**
 * AI assistance context
 */
export interface AIAssistanceContext {
  readonly level: AIAssistanceLevel;
  readonly capabilities: string[];
  readonly currentTasks: string[];
  readonly recommendations: AIRecommendation[];
  readonly confidence: number;
  readonly humanOversight: HumanOversightLevel;
}

/**
 * Program health metrics
 */
export interface ProgramHealth {
  readonly overallScore: number; // 0-100
  readonly epicProgress: number;
  readonly dependencyHealth: number;
  readonly teamVelocity: number;
  readonly qualityMetrics: number;
  readonly riskLevel: number;
  readonly lastUpdated: Date;
  readonly trends: HealthTrend[];
}

/**
 * Health trend
 */
export interface HealthTrend {
  readonly metric: string;
  readonly direction: 'up' | 'down' | 'stable';
  readonly change: number;
  readonly period: string;
}

// ============================================================================
// PROGRAM ORCHESTRATOR STATE
// ============================================================================

/**
 * Program orchestrator state
 */
export interface ProgramOrchestratorState {
  readonly programItems: Map<string, ProgramItem>;
  readonly activeStreams: Map<string, WorkflowStream<ProgramItem>>;
  readonly currentPI: ProgramIncrementConfig | null;
  readonly piHistory: ProgramIncrementConfig[];
  readonly epicCoordination: Map<string, EpicCoordination>;
  readonly dependencyMatrix: Map<string, DependencyAnalysis>;
  readonly aiAssistance: AIAssistanceContext;
  readonly programHealth: ProgramHealth;
  readonly flowMetrics: FlowMetrics;
  readonly crossLevelDependencies: CrossLevelDependency[];
  readonly lastUpdated: Date;
}

// ============================================================================
// PROGRAM ORCHESTRATOR - Main Implementation
// ============================================================================

/**
 * Program Level Orchestrator - AI-Human collaboration for program management
 */
export class ProgramOrchestrator extends TypedEventBase {
  private readonly logger: Logger;
  private readonly eventBus: TypeSafeEventBus;
  private readonly memory: BrainCoordinator;
  private readonly gatesManager: WorkflowGatesManager;
  private readonly settings: ProgramOrchestratorConfig;
  private state: ProgramOrchestratorState;
  private coordinationTimer?: NodeJS.Timeout;
  private performanceTimer?: NodeJS.Timeout;
  private dependencyCheckTimer?: NodeJS.Timeout;

  constructor(
    eventBus: TypeSafeEventBus,
    memory: BrainCoordinator,
    gatesManager: WorkflowGatesManager,
    config: Partial<ProgramOrchestratorConfig> = {}
  ) {
    super();
    this.logger = getLogger('program-orchestrator');
    this.eventBus = eventBus;
    this.memory = memory;
    this.gatesManager = gatesManager;
    this.settings = {
      enablePIPlanningAutomation: true,
      enableCrossTeamCoordination: true,
      enableAIAssistance: true,
      enablePerformanceTracking: true,
      maxConcurrentEpics: 20,
      piLengthWeeks: 10, // Standard SAFe PI length
      dependencyResolutionTimeout: 3600000, // 1 hour
      coordinationCheckInterval: 1800000, // 30 minutes
      performanceMetricsInterval: 3600000, // 1 hour
      ...config,
    };
    this.state = this.initializeState();
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Initialize the program orchestrator
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Program Orchestrator', {
      config: this.settings,
    });

    try {
      // Load persisted state
      await this.loadPersistedState();

      // Initialize AI assistance if not present
      if (!this.state.aiAssistance.level) {
        await this.initializeAIAssistance();
      }

      // Start background processes
      this.startCoordinationMonitoring();
      this.startPerformanceTracking();
      this.startDependencyChecking();

      // Register event handlers
      this.registerEventHandlers();

      this.logger.info('Program Orchestrator initialized successfully');
      this.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('Failed to initialize program orchestrator', {
        error,
      });
      throw error;
    }
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Program Orchestrator');

    if (this.coordinationTimer) clearInterval(this.coordinationTimer);
    if (this.performanceTimer) clearInterval(this.performanceTimer);
    if (this.dependencyCheckTimer) clearInterval(this.dependencyCheckTimer);

    await this.persistState();
    this.removeAllListeners();

    this.logger.info('Program Orchestrator shutdown complete');
  }

  // ============================================================================
  // EPIC PARALLEL PROCESSING - Task 8.1
  // ============================================================================

  /**
   * Create Epic processing stream
   */
  async createEpicStream(
    portfolioItemId: string,
    epicTitle: string,
    technicalSpecs: TechnicalSpecification,
    dependencies: ProgramDependency[],
    assignedTeams: string[]
  ): Promise<ProgramItem> {
    const epic: ProgramItem = {
      id: `epic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      portfolioItemId,
      title: epicTitle,
      type: 'epic',
      status: 'planned',
      priority: this.calculateEpicPriority(technicalSpecs, dependencies),
      complexity: this.assessComplexity(technicalSpecs),
      technicalRisk: this.assessTechnicalRisk(technicalSpecs, dependencies),
      dependencies,
      features: [], // Will be populated as features are defined
      timeline: this.estimateProgramTimeline(technicalSpecs, dependencies),
      technicalSpecs,
      gates: await this.createTechnicalGates(technicalSpecs),
      coordination: this.createCoordinationInfo(assignedTeams),
      metrics: this.initializeProgramMetrics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to state
    this.state.programItems.set(epic.id, epic);

    // Create workflow stream for parallel processing
    const stream = await this.createProgramWorkflowStream(epic);
    this.state.activeStreams.set(stream.id, stream);

    // Set up coordination if multiple teams
    if (assignedTeams.length > 1) {
      await this.setupCrossTeamCoordination(epic.id, assignedTeams);
    }

    // Analyze and track dependencies
    await this.analyzeDependencies(epic.id, dependencies);

    this.logger.info('Epic stream created', {
      epicId: epic.id,
      title: epicTitle,
      portfolioItemId,
      assignedTeams,
    });

    this.emit('epic-created', epic);
    return epic;
  }

  /**
   * Process Epics in parallel with dependency management
   */
  async processEpicsInParallel(epicIds: string[]): Promise<void> {
    const processingEpics = epicIds.slice(
      0,
      this.settings.maxConcurrentEpics
    );

    // Build dependency graph
    const dependencyGraph = await this.buildDependencyGraph(processingEpics);

    // Find Epics ready to start (no unresolved dependencies)
    const readyEpics = processingEpics.filter((epicId) =>
      this.areDependenciesResolved(epicId, dependencyGraph)
    );

    // Start processing ready Epics
    const processingPromises = readyEpics.map((epicId) =>
      this.processEpic(epicId)
    );

    this.logger.info('Starting parallel Epic processing', {
      totalEpics: processingEpics.length,
      readyEpics: readyEpics.length,
    });

    // Wait for first batch to complete, then process dependent Epics
    try {
      await Promise.allSettled(processingPromises);

      // Process dependent Epics as dependencies resolve
      await this.processDependentEpics(processingEpics, dependencyGraph);
    } catch (error) {
      this.logger.error('Epic parallel processing failed', { error });
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private initializeState(): ProgramOrchestratorState {
    return {
      programItems: new Map(),
      activeStreams: new Map(),
      currentPI: null,
      piHistory: [],
      epicCoordination: new Map(),
      dependencyMatrix: new Map(),
      aiAssistance: {
        level: AIAssistanceLevel.COLLABORATIVE,
        capabilities: ['analysis', 'planning', 'recommendation'],
        currentTasks: [],
        recommendations: [],
        confidence: 0.8,
        humanOversight: HumanOversightLevel.PERIODIC,
      },
      programHealth: {
        overallScore: 0,
        epicProgress: 0,
        dependencyHealth: 0,
        teamVelocity: 0,
        qualityMetrics: 0,
        riskLevel: 0,
        lastUpdated: new Date(),
        trends: [],
      },
      flowMetrics: {
        throughput: 0,
        cycleTime: 0,
        leadTime: 0,
        wipUtilization: 0,
        bottlenecks: [],
        flowEfficiency: 0,
      },
      crossLevelDependencies: [],
      lastUpdated: new Date(),
    };
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.memory.retrieve('program-orchestrator:state');
      if (persistedState) {
        this.state = {
          ...this.state,
          ...persistedState,
          programItems: new Map(persistedState.programItems || []),
          activeStreams: new Map(persistedState.activeStreams || []),
          epicCoordination: new Map(persistedState.epicCoordination || []),
          dependencyMatrix: new Map(persistedState.dependencyMatrix || []),
        };
        this.logger.info('Program orchestrator state loaded');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state', { error });
    }
  }

  private async persistState(): Promise<void> {
    try {
      const stateToSerialize = {
        ...this.state,
        programItems: Array.from(this.state.programItems.entries()),
        activeStreams: Array.from(this.state.activeStreams.entries()),
        epicCoordination: Array.from(this.state.epicCoordination.entries()),
        dependencyMatrix: Array.from(this.state.dependencyMatrix.entries()),
      };
      await this.memory.store('program-orchestrator:state', stateToSerialize);
    } catch (error) {
      this.logger.error('Failed to persist state', { error });
    }
  }

  private startCoordinationMonitoring(): void {
    this.coordinationTimer = setInterval(async () => {
      try {
        await this.monitorCoordination();
      } catch (error) {
        this.logger.error('Coordination monitoring failed', { error });
      }
    }, this.settings.coordinationCheckInterval);
  }

  private startPerformanceTracking(): void {
    this.performanceTimer = setInterval(async () => {
      try {
        await this.trackProgramPerformance();
      } catch (error) {
        this.logger.error('Performance tracking failed', { error });
      }
    }, this.settings.performanceMetricsInterval);
  }

  private startDependencyChecking(): void {
    this.dependencyCheckTimer = setInterval(async () => {
      try {
        await this.checkDependencyHealth();
      } catch (error) {
        this.logger.error('Dependency checking failed', { error });
      }
    }, this.settings.dependencyResolutionTimeout);
  }

  private registerEventHandlers(): void {
    this.eventBus.registerHandler('epic-completed', async (event) => {
      await this.handleEpicCompletion(event.payload.epicId);
    });

    this.eventBus.registerHandler('dependency-resolved', async (event) => {
      await this.handleDependencyResolution(event.payload.dependencyId);
    });
  }

  // Placeholder implementations for complex methods
  private calculateEpicPriority(
    specs: TechnicalSpecification,
    deps: ProgramDependency[]
  ): ProgramPriority {
    // Placeholder implementation
    return ProgramPriority.HIGH;
  }

  private assessComplexity(specs: TechnicalSpecification): ComplexityLevel {
    // Placeholder implementation based on architecture complexity
    return ComplexityLevel.MODERATE;
  }

  private assessTechnicalRisk(
    specs: TechnicalSpecification,
    deps: ProgramDependency[]
  ): number {
    // Placeholder implementation
    return 45; // Medium risk score
  }

  private estimateProgramTimeline(
    specs: TechnicalSpecification,
    deps: ProgramDependency[]
  ): ProgramTimeline {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return {
      startDate,
      endDate,
      phases: [], // Would be generated based on specs
      checkpoints: [], // Would be generated based on milestones
    };
  }

  private async createTechnicalGates(
    specs: TechnicalSpecification
  ): Promise<ProgramGate[]> {
    // Placeholder - would create appropriate technical gates
    return [];
  }

  private createCoordinationInfo(teams: string[]): CoordinationInfo {
    return {
      assignedAgents: [],
      swarmId: undefined,
      aiAssistance: AIAssistanceLevel.COLLABORATIVE,
      humanOversight: HumanOversightLevel.PERIODIC,
      decisionPoints: [],
    };
  }

  private initializeProgramMetrics(): ProgramMetrics {
    return {
      velocityPoints: 0,
      burndownRate: 0,
      defectDensity: 0,
      codeQuality: 0,
      testCoverage: 0,
      cycleTime: 0,
    };
  }

  private async createProgramWorkflowStream(
    epic: ProgramItem
  ): Promise<WorkflowStream<ProgramItem>> {
    const streamId = `program-stream-${epic.id}`;
    return {
      id: streamId,
      name: `Program Stream: ${epic.title}`,
      level: OrchestrationLevel.PROGRAM,
      status: 'idle',
      workItems: [epic],
      inProgress: [],
      completed: [],
      wipLimit: 3, // Allow multiple features per epic
      dependencies: epic.dependencies.map((d) => d.dependsOn),
      metrics: {
        itemsProcessed: 0,
        averageProcessingTime: 0,
        successRate: 1.0,
        utilizationRate: 0,
        blockedTime: 0,
        lastUpdated: new Date(),
      },
      configuration: {
        parallelProcessing: true,
        batchSize: 3,
        timeout: 172800000, // 48 hours
        retryAttempts: 3,
        enableGates: true,
        gateConfiguration: {
          enableBusinessGates: false,
          enableTechnicalGates: true,
          enableQualityGates: true,
          approvalThresholds: {
            low: 0.6,
            medium: 0.7,
            high: 0.8,
            critical: 0.9,
          },
          escalationRules: [],
        },
        autoScaling: {
          enabled: true,
          minCapacity: 1,
          maxCapacity: 5,
          scaleUpThreshold: 0.8,
          scaleDownThreshold: 0.3,
          scalingCooldown: 300000,
        },
      },
    };
  }

  // Additional placeholder methods
  private async setupCrossTeamCoordination(
    epicId: string,
    teams: string[]
  ): Promise<void> {
    // Placeholder implementation
  }

  private async analyzeDependencies(
    epicId: string,
    dependencies: ProgramDependency[]
  ): Promise<void> {
    // Placeholder implementation
  }

  private async buildDependencyGraph(
    epicIds: string[]
  ): Promise<Map<string, string[]>> {
    return new Map();
  }

  private areDependenciesResolved(
    epicId: string,
    graph: Map<string, string[]>
  ): boolean {
    return true;
  }

  private async processEpic(epicId: string): Promise<void> {
    // Placeholder implementation
  }

  private async processDependentEpics(
    epicIds: string[],
    graph: Map<string, string[]>
  ): Promise<void> {
    // Placeholder implementation
  }

  private async initializeAIAssistance(): Promise<void> {
    // Placeholder implementation
  }

  private async monitorCoordination(): Promise<void> {
    // Placeholder implementation
  }

  private async trackProgramPerformance(): Promise<void> {
    // Placeholder implementation
  }

  private async checkDependencyHealth(): Promise<void> {
    // Placeholder implementation
  }

  private async handleEpicCompletion(epicId: string): Promise<void> {
    // Placeholder implementation
  }

  private async handleDependencyResolution(dependencyId: string): Promise<void> {
    // Placeholder implementation
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface PIProgressReport {
  readonly piNumber: number;
  readonly daysElapsed: number;
  readonly daysRemaining: number;
  readonly objectiveProgress: {
    readonly overall: number;
    readonly byTeam: Record<string, number>;
    readonly uncommitted: number;
  };
  readonly teamProgress: Record<string, number>;
  readonly riskStatus: PIRisk[];
  readonly milestoneStatus: PIMilestone[];
  readonly overallHealth: number;
  readonly recommendations: string[];
  readonly lastUpdated: Date;
}

export interface ResourceAllocationResult {
  readonly totalDemand: number;
  readonly totalAvailable: number;
  readonly utilizationRate: number;
  readonly assignments: ResourceAssignment[];
  readonly conflicts: ResourceConflict[];
  readonly recommendations: string[];
  readonly timestamp: Date;
}

export interface ResourceAssignment {
  readonly epicId: string;
  readonly resources: any;
}

export interface ResourceConflict {
  readonly type: string;
  readonly description: string;
  readonly affectedEpics: string[];
  readonly resolution: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ProgramOrchestrator;

export type {
  ProgramOrchestratorConfig,
  ProgramIncrementConfig,
  PIObjective,
  TeamCapacity,
  PIRisk,
  PIMilestone,
  EpicCoordination,
  CoordinationNeed,
  DependencyAnalysis,
  AIAssistanceContext,
  ProgramHealth,
  ProgramOrchestratorState,
  PIProgressReport,
  ResourceAllocationResult,
};