/**
 * @fileoverview Program Predictability Service
 *
 * Service for measuring and tracking program predictability metrics.
 * Handles objective completion tracking, velocity analysis, and predictability reporting.
 *
 * SINGLE RESPONSIBILITY: Program predictability measurement and analysis
 * FOCUSES ON: Predictability metrics, velocity tracking, commitment analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Feature, Logger, PIObjective } from '../../types';
/**
 * Program predictability metrics
 */
export interface ProgramPredictability {
    readonly piId: string;
    readonly artId: string;
    readonly measurementDate: Date;
    readonly objectivePredictability: number;
    readonly featurePredictability: number;
    readonly velocityPredictability: number;
    readonly overallPredictability: number;
    readonly trend: PredictabilityTrend;
    readonly risks: PredictabilityRisk[];
    readonly recommendations: string[];
}
/**
 * Predictability trend analysis
 */
export interface PredictabilityTrend {
    readonly direction: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly changeRate: number;
    readonly trendPeriod: number;
    readonly confidenceLevel: number;
    readonly seasonalFactors: string[];
}
/**
 * Predictability risk factors
 */
export interface PredictabilityRisk {
    readonly factor: string;
    readonly impact: number;
    readonly likelihood: number;
    readonly mitigation: string;
    readonly owner: string;
}
/**
 * PI objective completion tracking
 */
export interface ObjectiveCompletionTracking {
    readonly objectiveId: string;
    readonly piId: string;
    readonly teamId: string;
    readonly plannedValue: number;
    readonly actualValue: number;
    readonly completion: number;
    readonly confidence: number;
    readonly status: not_started | in_progress | completed | at_risk | 'missed;;
    readonly blockers: string[];
    readonly adjustments: ObjectiveAdjustment[];
}
/**
 * Objective adjustment tracking
 */
export interface ObjectiveAdjustment {
    readonly date: Date;
    readonly type: scope_change | priority_change | resource_change | 'timeline_change;;
    readonly description: string;
    readonly impact: number;
    readonly reason: string;
    readonly approvedBy: string;
}
/**
 * Velocity tracking and analysis
 */
export interface VelocityTracking {
    readonly teamId: string;
    readonly piId: string;
    readonly plannedVelocity: number;
    readonly actualVelocity: number;
    readonly velocityVariance: number;
    readonly historicalAverage: number;
    readonly trend: 'increasing|';
}
/**
 * Velocity influencing factors
 */
export interface VelocityFactor {
    readonly factor: string;
    readonly impact: number;
    readonly duration: number;
    readonly category: team_composition | technical_debt | dependencies | 'external;;
}
/**
 * Program synchronization metrics
 */
export interface ProgramSynchronization {
    readonly artId: string;
    readonly measurementDate: Date;
    readonly teamAlignment: number;
    readonly dependencyHealth: number;
    readonly communicationEffectiveness: number;
    readonly synchronizationScore: number;
    readonly blockers: SynchronizationBlocker[];
}
/**
 * Synchronization blockers
 */
export interface SynchronizationBlocker {
    readonly blocker: string;
    readonly affectedTeams: string[];
    readonly severity: 'low|medium|high|critical;;
    readonly duration: number;
    readonly resolution: string;
    readonly owner: string;
}
/**
 * Multi-ART coordination metrics
 */
export interface MultiARTCoordination {
    readonly valueStreamId: string;
    readonly measurementDate: Date;
    readonly artCount: number;
    readonly coordinationEffectiveness: number;
    readonly crossARTDependencies: number;
    readonly resolvedDependencies: number;
    readonly blockedDependencies: number;
    readonly coordinationChallenges: CoordinationChallenge[];
}
/**
 * Cross-ART coordination challenges
 */
export interface CoordinationChallenge {
    readonly challenge: string;
    readonly artIds: string[];
    readonly impact: 'low' | 'medium' | 'high';
    readonly resolution: string;
    readonly timeline: number;
    readonly owner: string;
}
/**
 * Business impact assessment
 */
export interface BusinessImpactAssessment {
    readonly impactId: string;
    readonly piId: string;
    readonly description: string;
    readonly category: 'customer|revenue|compliance|strategic;;
    readonly severity: 'low|medium|high|critical;;
    readonly likelihood: number;
    readonly timelineImpact: number;
    readonly financialImpact: number;
    readonly qualityImpact: QualityImpactLevel;
    readonly customerImpact: CustomerImpactLevel;
    readonly moraleImpact: MoraleImpactLevel;
    readonly mitigationPlan: string;
    readonly owner: string;
}
/**
 * Quality impact levels
 */
export declare enum QualityImpactLevel {
    NONE = "none",
    MINOR = "minor",
    MODERATE = "moderate",
    SIGNIFICANT = "significant",
    SEVERE = "severe"
}
/**
 * Customer impact levels
 */
export declare enum CustomerImpactLevel {
    NONE = "none",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Team morale impact levels
 */
export declare enum MoraleImpactLevel {
    POSITIVE = "positive",
    NEUTRAL = "neutral",
    SLIGHT_NEGATIVE = "slight_negative",
    NEGATIVE = "negative",
    SEVERELY_NEGATIVE = "severely_negative"
}
/**
 * Program Predictability Service for measuring and analyzing program predictability
 */
export declare class ProgramPredictabilityService {
    private readonly logger;
    private predictabilityRecords;
    private objectiveTracking;
    private velocityTracking;
    constructor(logger: Logger);
    /**
     * Measure program predictability for PI
     */
    measurePredictability(piId: string, artId: string, objectives: PIObjective[], features: Feature[]): Promise<ProgramPredictability>;
    /**
     * Assess business impact
     */
    assessBusinessImpact(_impact: {
        piId: string;
        description: string;
        category: 'customer|revenue|compliance|strategic;;
        severity: 'low|medium|high|critical;;
        likelihood: number;
        timelineImpact: number;
        financialImpact: number;
        qualityImpact: QualityImpactLevel;
        customerImpact: CustomerImpactLevel;
        moraleImpact: MoraleImpactLevel;
        mitigationPlan: string;
        owner: string;
    }): Promise<BusinessImpactAssessment>;
    /**
     * Get objective tracking
     */
    getObjectiveTracking(objectiveId: string): ObjectiveCompletionTracking | undefined;
    /**
     * Get velocity tracking
     */
    getVelocityTracking(teamId: string, piId: string): VelocityTracking | undefined;
}
//# sourceMappingURL=program-predictability-service.d.ts.map