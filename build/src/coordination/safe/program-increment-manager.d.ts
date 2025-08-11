/**
 * @file Program Increment Manager - Phase 3, Day 12 (Task 11.2)
 *
 * Implements SAFe Program Increment (PI) Planning with 8-12 week cycles,
 * PI planning event orchestration with AGUI, capacity planning and team allocation.
 * Integrates with the existing multi-level orchestration architecture.
 *
 * ARCHITECTURE:
 * - PI planning workflow (8-12 week cycles)
 * - PI planning event orchestration with AGUI gates
 * - Capacity planning and team allocation
 * - PI execution tracking and management
 * - Integration with Program and Swarm orchestrators
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { ProgramOrchestrator } from '../orchestration/program-orchestrator.ts';
import type { SwarmExecutionOrchestrator } from '../orchestration/swarm-execution-orchestrator.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { AgileReleaseTrain, Dependency, Feature, PIObjective, ProgramIncrement, Risk, TeamCapacity } from './index.ts';
/**
 * PI Manager configuration
 */
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
/**
 * PI Planning Event configuration
 */
export interface PIPlanningEventConfig {
    readonly eventId: string;
    readonly piId: string;
    readonly artId: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly facilitators: string[];
    readonly participants: PlanningParticipant[];
    readonly agenda: PlanningAgendaItem[];
    readonly businessContext: BusinessContext;
    readonly architecturalVision: ArchitecturalVision;
    readonly planningAdjustments: PlanningAdjustment[];
}
/**
 * Planning participant
 */
export interface PlanningParticipant {
    readonly userId: string;
    readonly name: string;
    readonly role: 'product-owner' | 'architect' | 'team-lead' | 'scrum-master' | 'stakeholder';
    readonly teamId?: string;
    readonly artRole?: 'rte' | 'product-manager' | 'system-architect' | 'business-owner';
    readonly required: boolean;
}
/**
 * Planning agenda item
 */
export interface PlanningAgendaItem {
    readonly id: string;
    readonly activity: string;
    readonly description: string;
    readonly duration: number;
    readonly facilitator: string;
    readonly participants: string[];
    readonly deliverables: string[];
    readonly aguiGateRequired: boolean;
    readonly dependsOn?: string[];
}
/**
 * Business context for PI planning
 */
export interface BusinessContext {
    readonly visionStatement: string;
    readonly businessObjectives: string[];
    readonly strategicThemes: string[];
    readonly marketContext: string;
    readonly constraints: string[];
    readonly successCriteria: string[];
}
/**
 * Architectural vision for PI
 */
export interface ArchitecturalVision {
    readonly systemIntent: string;
    readonly architecturalRunway: RunwayItem[];
    readonly technicalConstraints: string[];
    readonly qualityAttributes: QualityAttribute[];
    readonly significantDecisions: ArchitecturalDecision[];
    readonly enablers: string[];
}
/**
 * Runway item for architectural enablers
 */
export interface RunwayItem {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'architectural' | 'infrastructure' | 'compliance';
    readonly effort: number;
    readonly priority: number;
    readonly teams: string[];
    readonly dependencies: string[];
}
/**
 * Planning adjustment during PI planning
 */
export interface PlanningAdjustment {
    readonly type: 'scope' | 'capacity' | 'dependency' | 'risk';
    readonly description: string;
    readonly impact: string;
    readonly adjustment: any;
    readonly rationale: string;
    readonly approvedBy: string;
    readonly timestamp: Date;
}
/**
 * PI execution metrics
 */
export interface PIExecutionMetrics {
    readonly piId: string;
    readonly progressPercentage: number;
    readonly velocityTrend: VelocityTrend;
    readonly predictability: PredictabilityMetrics;
    readonly qualityMetrics: QualityMetrics;
    readonly riskBurndown: RiskBurndown;
    readonly dependencyHealth: DependencyHealth;
    readonly teamMetrics: TeamMetrics[];
    readonly lastUpdated: Date;
}
/**
 * Velocity trend analysis
 */
export interface VelocityTrend {
    readonly currentIteration: number;
    readonly plannedVelocity: number;
    readonly actualVelocity: number;
    readonly velocityVariance: number;
    readonly trend: 'increasing' | 'stable' | 'decreasing';
    readonly forecast: VelocityForecast;
}
/**
 * Velocity forecast
 */
export interface VelocityForecast {
    readonly remainingIterations: number;
    readonly forecastedVelocity: number;
    readonly confidenceInterval: {
        readonly low: number;
        readonly high: number;
    };
    readonly deliveryProbability: number;
}
/**
 * Predictability metrics
 */
export interface PredictabilityMetrics {
    readonly commitmentReliability: number;
    readonly scopeStability: number;
    readonly qualityPredictability: number;
    readonly riskMitigation: number;
    readonly overallPredictability: number;
}
/**
 * Quality metrics
 */
export interface QualityMetrics {
    readonly defectDensity: number;
    readonly testCoverage: number;
    readonly codeQuality: number;
    readonly technicalDebt: number;
    readonly customerSatisfaction: number;
    readonly systemReliability: number;
}
/**
 * Risk burndown
 */
export interface RiskBurndown {
    readonly totalRisks: number;
    readonly openRisks: number;
    readonly mitigatedRisks: number;
    readonly closedRisks: number;
    readonly riskTrend: 'improving' | 'stable' | 'worsening';
    readonly highRiskItems: Risk[];
}
/**
 * Dependency health
 */
export interface DependencyHealth {
    readonly totalDependencies: number;
    readonly resolvedDependencies: number;
    readonly blockedDependencies: number;
    readonly atRiskDependencies: number;
    readonly dependencyHealth: 'healthy' | 'at-risk' | 'critical';
    readonly criticalPath: string[];
}
/**
 * Team metrics
 */
export interface TeamMetrics {
    readonly teamId: string;
    readonly velocity: number;
    readonly capacity: number;
    readonly utilization: number;
    readonly qualityScore: number;
    readonly satisfactionScore: number;
    readonly riskLevel: 'low' | 'medium' | 'high';
}
/**
 * PI Manager state
 */
export interface PIManagerState {
    readonly activeARTs: Map<string, AgileReleaseTrain>;
    readonly activePIs: Map<string, ProgramIncrement>;
    readonly planningEvents: Map<string, PIPlanningEventConfig>;
    readonly piMetrics: Map<string, PIExecutionMetrics>;
    readonly teamCapacities: Map<string, TeamCapacity>;
    readonly dependencyMatrix: Map<string, Dependency[]>;
    readonly riskRegister: Map<string, Risk[]>;
    readonly lastUpdated: Date;
}
/**
 * Program Increment Manager - SAFe PI Planning and execution management
 */
export declare class ProgramIncrementManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly programOrchestrator;
    private readonly swarmOrchestrator;
    private readonly config;
    private state;
    private trackingTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, programOrchestrator: ProgramOrchestrator, swarmOrchestrator: SwarmExecutionOrchestrator, config?: Partial<PIManagerConfig>);
    /**
     * Initialize the PI Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the PI Manager
     */
    shutdown(): Promise<void>;
    /**
     * Plan Program Increment
     */
    planProgramIncrement(artId: string, businessContext: BusinessContext, architecturalVision: ArchitecturalVision, teamCapacities: TeamCapacity[]): Promise<ProgramIncrement>;
    /**
     * Execute PI planning event with AGUI orchestration
     */
    executePIPlanningWorkflow(planningEvent: PIPlanningEventConfig): Promise<PIPlanningResult>;
    /**
     * Implement capacity planning and team allocation
     */
    implementCapacityPlanning(teamCapacities: TeamCapacity[], piObjectives: PIObjective[], features: Feature[]): Promise<CapacityPlanningResult>;
    /**
     * Start PI execution
     */
    startPIExecution(piId: string): Promise<void>;
    /**
     * Track PI progress continuously
     */
    trackPIProgress(piId: string): Promise<PIExecutionMetrics>;
    /**
     * Handle PI completion
     */
    completeProgramIncrement(piId: string): Promise<PICompletionReport>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startContinuousTracking;
    private registerEventHandlers;
    private createPIPlanningEvent;
    private createProgramIncrement;
    private generatePIObjectives;
    private planFeatureAllocation;
    private identifyPIDependencies;
    private assessPIRisks;
    private executeAgendaItem;
    private createPlanningGate;
    private allocateFeatureToTeam;
    private generateCapacityRecommendations;
    private createCapacityApprovalGate;
    private initializePIMetrics;
    private coordinateEpicStreams;
    private schedulePIEvents;
    private calculatePIProgress;
    private calculateVelocityTrend;
    private calculatePredictabilityMetrics;
    private calculateQualityMetrics;
    private calculateRiskBurndown;
    private calculateDependencyHealth;
    private calculateTeamMetrics;
    private checkPIHealthAlerts;
    private generatePICompletionReport;
    private scheduleInspectAndAdapt;
    private archivePIData;
    private updateAllPIMetrics;
    private handleFeatureCompletion;
    private handleRiskIdentification;
}
export interface PIPlanningResult {
    readonly eventId: string;
    readonly outcomes: any[];
    readonly decisions: any[];
    readonly adjustments: PlanningAdjustment[];
    readonly risks: Risk[];
    readonly dependencies: Dependency[];
}
export interface CapacityPlanningResult {
    readonly totalCapacity: number;
    readonly allocatedCapacity: number;
    readonly bufferCapacity: number;
    readonly teamAllocations: any[];
    readonly capacityRisks: any[];
    readonly recommendations: string[];
}
export interface PICompletionReport {
    readonly piId: string;
    readonly objectivesAchieved: number;
    readonly overallSuccessRate: number;
    readonly lessonsLearned: string[];
    readonly improvements: string[];
    readonly nextPIRecommendations: string[];
    readonly metrics: PIExecutionMetrics;
}
export interface QualityAttribute {
    readonly name: string;
    readonly description: string;
    readonly measure: string;
    readonly target: number;
    readonly current: number;
}
export interface ArchitecturalDecision {
    readonly id: string;
    readonly title: string;
    readonly context: string;
    readonly decision: string;
    readonly consequences: string[];
    readonly status: 'proposed' | 'accepted' | 'superseded';
}
export default ProgramIncrementManager;
export type { PIManagerConfig, PIPlanningEventConfig, PlanningParticipant, BusinessContext, ArchitecturalVision, PIExecutionMetrics, PIManagerState, PIPlanningResult, CapacityPlanningResult, PICompletionReport, };
//# sourceMappingURL=program-increment-manager.d.ts.map