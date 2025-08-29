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
import { EventBus } from '@claude-zen/foundation';
import type { TeamCapacity } from '../services/program-increment/capacity-planning-service';
import type { AgileReleaseTrain, Dependency, ProgramIncrement, Risk } from '../types';
export type { ';, CapacityPlanningResult, CapacityRisk, TeamAllocation, } from '../services/program-increment/capacity-planning-service';
export type { ';, Achievement, Challenge, ImprovementRecommendation, LessonLearned, PICompletionReport, } from '../services/program-increment/pi-completion-service';
export type { ';, DependencyHealth, PIExecutionMetrics, PredictabilityMetrics, QualityMetrics, RiskBurndown, VelocityTrend, } from '../services/program-increment/pi-execution-service';
export type { ArchitecturalVision, BusinessContext, PIPlanningEventConfig, PlanningAdjustment, PlanningAgendaItem, PlanningParticipant, } from '../services/program-increment/pi-planning-service';
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
/**
 * Program Increment Manager - SAFe PI Planning and execution management
 *
 * Lightweight facade that orchestrates the complete Program Increment lifecycle through
 * specialized services while maintaining API compatibility with the original implementation.
 */
export declare class ProgramIncrementManager extends EventBus {
    private readonly logger;
    constructor(eventBus:  {});
}
//# sourceMappingURL=program-increment-manager.d.ts.map