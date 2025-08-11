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
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { AIAssistanceLevel, AIRecommendation, CrossLevelDependency, FlowMetrics, HumanOversightLevel, ProgramDependency, ProgramItem, TechnicalSpecification, WorkflowStream } from './multi-level-types.ts';
import type { WorkflowGatesManager } from './workflow-gates.ts';
/**
 * Program orchestrator configuration
 */
export interface ProgramOrchestratorConfig {
    readonly enablePIPlanningAutomation: boolean;
    readonly enableCrossTeamCoordination: boolean;
    readonly enableAIAssistance: boolean;
    readonly enablePerformanceTracking: boolean;
    readonly maxConcurrentEpics: number;
    readonly piLengthWeeks: number;
    readonly dependencyResolutionTimeout: number;
    readonly coordinationCheckInterval: number;
    readonly performanceMetricsInterval: number;
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
    readonly confidence: number;
    readonly uncommittedObjective: boolean;
    readonly dependencies: string[];
    readonly acceptanceCriteria: string[];
    readonly progress: number;
}
/**
 * Team capacity for PI planning
 */
export interface TeamCapacity {
    readonly teamName: string;
    readonly totalCapacity: number;
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
    readonly estimatedDelay: number;
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
    readonly overallScore: number;
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
/**
 * Program Level Orchestrator - AI-Human collaboration for program management
 */
export declare class ProgramOrchestrator extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly config;
    private state;
    private coordinationTimer?;
    private performanceTimer?;
    private dependencyCheckTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, config?: Partial<ProgramOrchestratorConfig>);
    /**
     * Initialize the program orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the orchestrator
     */
    shutdown(): Promise<void>;
    /**
     * Create Epic processing stream
     */
    createEpicStream(portfolioItemId: string, epicTitle: string, technicalSpecs: TechnicalSpecification, dependencies: ProgramDependency[], assignedTeams: string[]): Promise<ProgramItem>;
    /**
     * Process Epics in parallel with dependency management
     */
    processEpicsInParallel(epicIds: string[]): Promise<void>;
    /**
     * Manage cross-Epic dependencies
     */
    manageCrossEpicDependencies(epicId: string): Promise<void>;
    /**
     * Plan Program Increment (PI)
     */
    planProgramIncrement(piNumber: number, businessObjectives: string[], teamCapacities: TeamCapacity[], strategicThemes: string[]): Promise<ProgramIncrementConfig>;
    /**
     * Execute Program Increment
     */
    executeProgramIncrement(): Promise<void>;
    /**
     * Track Program Increment progress
     */
    trackPIProgress(): Promise<PIProgressReport>;
    /**
     * Coordinate team synchronization
     */
    coordinateTeamSync(epicId: string): Promise<void>;
    /**
     * Manage program-level resource allocation
     */
    manageProgramResources(): Promise<ResourceAllocationResult>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startCoordinationMonitoring;
    private startPerformanceTracking;
    private startDependencyChecking;
    private registerEventHandlers;
    private calculateEpicPriority;
    private assessComplexity;
    private assessTechnicalRisk;
    private estimateProgramTimeline;
    private createTechnicalGates;
    private createCoordinationInfo;
    private initializeProgramMetrics;
    private createProgramWorkflowStream;
    private analyzeDependencies;
    private buildDependencyGraph;
    private areDependenciesResolved;
    private processEpic;
    private processDependentEpics;
}
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
export default ProgramOrchestrator;
export type { ProgramOrchestratorConfig, ProgramIncrementConfig, PIObjective, TeamCapacity, PIRisk, PIMilestone, EpicCoordination, CoordinationNeed, DependencyAnalysis, AIAssistanceContext, ProgramHealth, ProgramOrchestratorState, PIProgressReport, ResourceAllocationResult, };
//# sourceMappingURL=program-orchestrator.d.ts.map