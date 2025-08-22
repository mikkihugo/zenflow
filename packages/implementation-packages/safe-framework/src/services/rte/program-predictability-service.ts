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

import { format, addDays, differenceInDays, subDays } from 'date-fns';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  groupBy,
  map,
  filter,
  orderBy,
  sumBy,
  meanBy,
  maxBy,
  minBy,
} from 'lodash-es';
import type {
  ProgramIncrement,
  PIObjective,
  Feature,
  AgileReleaseTrain,
  ARTTeam,
  Logger,
} from '../../types';

/**
 * Program predictability metrics
 */
export interface ProgramPredictability {
  readonly piId: string;
  readonly artId: string;
  readonly measurementDate: Date;
  readonly objectivePredictability: number; // 0-100%
  readonly featurePredictability: number; // 0-100%
  readonly velocityPredictability: number; // 0-100%
  readonly overallPredictability: number; // 0-100%
  readonly trend: PredictabilityTrend;
  readonly risks: PredictabilityRisk[];
  readonly recommendations: string[];
}

/**
 * Predictability trend analysis
 */
export interface PredictabilityTrend {
  readonly direction: 'improving|stable|declining';
  readonly changeRate: number; // percentage change
  readonly trendPeriod: number; // PIs analyzed
  readonly confidenceLevel: number; // 0-100%
  readonly seasonalFactors: string[];
}

/**
 * Predictability risk factors
 */
export interface PredictabilityRisk {
  readonly factor: string;
  readonly impact: number; // -100 to 100 (negative = reduces predictability)
  readonly likelihood: number; // 0-100%
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
  readonly completion: number; // 0-100%
  readonly confidence: number; // 1-5
  readonly status:|not_started|in_progress|completed|at_risk|'missed';
  readonly blockers: string[];
  readonly adjustments: ObjectiveAdjustment[];
}

/**
 * Objective adjustment tracking
 */
export interface ObjectiveAdjustment {
  readonly date: Date;
  readonly type:|scope_change|priority_change|resource_change|'timeline_change';
  readonly description: string;
  readonly impact: number; // -100 to 100 (percentage impact)
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
  readonly velocityVariance: number; // percentage
  readonly historicalAverage: number;
  readonly trend: 'increasing|stable|decreasing';
  readonly factors: VelocityFactor[];
}

/**
 * Velocity influencing factors
 */
export interface VelocityFactor {
  readonly factor: string;
  readonly impact: number; // -100 to 100
  readonly duration: number; // sprints affected
  readonly category:|team_composition|technical_debt|dependencies|'external';
}

/**
 * Program synchronization metrics
 */
export interface ProgramSynchronization {
  readonly artId: string;
  readonly measurementDate: Date;
  readonly teamAlignment: number; // 0-100%
  readonly dependencyHealth: number; // 0-100%
  readonly communicationEffectiveness: number; // 0-100%
  readonly synchronizationScore: number; // 0-100%
  readonly blockers: SynchronizationBlocker[];
}

/**
 * Synchronization blockers
 */
export interface SynchronizationBlocker {
  readonly blocker: string;
  readonly affectedTeams: string[];
  readonly severity: 'low|medium|high|critical';
  readonly duration: number; // days
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
  readonly coordinationEffectiveness: number; // 0-100%
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
  readonly impact: 'low|medium|high';
  readonly resolution: string;
  readonly timeline: number; // days
  readonly owner: string;
}

/**
 * Business impact assessment
 */
export interface BusinessImpactAssessment {
  readonly impactId: string;
  readonly piId: string;
  readonly description: string;
  readonly category: 'customer|revenue|compliance|strategic';
  readonly severity: 'low|medium|high|critical';
  readonly likelihood: number; // 0-100%
  readonly timelineImpact: number; // days delayed
  readonly financialImpact: number; // cost impact
  readonly qualityImpact: QualityImpactLevel;
  readonly customerImpact: CustomerImpactLevel;
  readonly moraleImpact: MoraleImpactLevel;
  readonly mitigationPlan: string;
  readonly owner: string;
}

/**
 * Quality impact levels
 */
export enum QualityImpactLevel {
  NONE = 'none',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe',
}

/**
 * Customer impact levels
 */
export enum CustomerImpactLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Team morale impact levels
 */
export enum MoraleImpactLevel {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  SLIGHT_NEGATIVE = 'slight_negative',
  NEGATIVE = 'negative',
  SEVERELY_NEGATIVE = 'severely_negative',
}

/**
 * Program Predictability Service for measuring and analyzing program predictability
 */
export class ProgramPredictabilityService {
  private readonly logger: Logger;
  private predictabilityRecords = new Map<string, ProgramPredictability>();
  private objectiveTracking = new Map<string, ObjectiveCompletionTracking>();
  private velocityTracking = new Map<string, VelocityTracking>();
  private synchronizationMetrics = new Map<string, ProgramSynchronization>();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Measure program predictability for PI
   */
  async measurePredictability(
    piId: string,
    artId: string,
    objectives: PIObjective[],
    features: Feature[]
  ): Promise<ProgramPredictability> {
    this.logger.info('Measuring program predictability', { piId, artId });

    const objectivePredictability =
      this.calculateObjectivePredictability(objectives);
    const featurePredictability = this.calculateFeaturePredictability(features);
    const velocityPredictability = this.calculateVelocityPredictability(artId);

    const overallPredictability =
      objectivePredictability * 0.4 +
      featurePredictability * 0.35 +
      velocityPredictability * 0.25;

    const predictability: ProgramPredictability = {
      piId,
      artId,
      measurementDate: new Date(),
      objectivePredictability,
      featurePredictability,
      velocityPredictability,
      overallPredictability,
      trend: this.analyzeTrend(artId, overallPredictability),
      risks: this.identifyPredictabilityRisks(objectives, features),
      recommendations: this.generateRecommendations(overallPredictability),
    };

    this.predictabilityRecords.set(`${piId}-${artId}`, predictability);

    this.logger.info('Program predictability measured', {
      piId,
      artId,
      overallScore: Math.round(overallPredictability),
      trend: predictability.trend.direction,
    });

    return predictability;
  }

  /**
   * Track objective completion
   */
  async trackObjectiveCompletion(
    objectiveId: string,
    piId: string,
    teamId: string,
    completion: {
      plannedValue: number;
      actualValue: number;
      completion: number;
      confidence: number;
      status:|not_started|in_progress|completed|at_risk|'missed';
      blockers?: string[];
    }
  ): Promise<ObjectiveCompletionTracking> {
    const tracking: ObjectiveCompletionTracking = {
      objectiveId,
      piId,
      teamId,
      plannedValue: completion.plannedValue,
      actualValue: completion.actualValue,
      completion: completion.completion,
      confidence: completion.confidence,
      status: completion.status,
      blockers: completion.blockers || [],
      adjustments: [],
    };

    this.objectiveTracking.set(objectiveId, tracking);

    this.logger.info('Objective completion tracked', {
      objectiveId,
      completion: completion.completion,
      status: completion.status,
    });

    return tracking;
  }

  /**
   * Track team velocity
   */
  async trackVelocity(
    teamId: string,
    piId: string,
    velocity: {
      plannedVelocity: number;
      actualVelocity: number;
      historicalAverage: number;
      factors?: VelocityFactor[];
    }
  ): Promise<VelocityTracking> {
    const velocityVariance =
      ((velocity.actualVelocity - velocity.plannedVelocity) /
        velocity.plannedVelocity) *
      100;
    const trend = this.determineTrend(
      velocity.actualVelocity,
      velocity.historicalAverage
    );

    const tracking: VelocityTracking = {
      teamId,
      piId,
      plannedVelocity: velocity.plannedVelocity,
      actualVelocity: velocity.actualVelocity,
      velocityVariance,
      historicalAverage: velocity.historicalAverage,
      trend,
      factors: velocity.factors || [],
    };

    this.velocityTracking.set(`${teamId}-${piId}`, tracking);

    this.logger.info('Velocity tracked', {
      teamId,
      piId,
      variance: Math.round(velocityVariance),
      trend,
    });

    return tracking;
  }

  /**
   * Assess business impact
   */
  async assessBusinessImpact(impact: {
    piId: string;
    description: string;
    category: 'customer|revenue|compliance|strategic';
    severity: 'low|medium|high|critical';
    likelihood: number;
    timelineImpact: number;
    financialImpact: number;
    qualityImpact: QualityImpactLevel;
    customerImpact: CustomerImpactLevel;
    moraleImpact: MoraleImpactLevel;
    mitigationPlan: string;
    owner: string;
  }): Promise<BusinessImpactAssessment> {
    const impactId = `impact-${nanoid(12)}`;

    const assessment: BusinessImpactAssessment = {
      impactId,
      ...impact,
    };

    this.logger.info('Business impact assessed', {
      impactId,
      category: impact.category,
      severity: impact.severity,
      likelihood: impact.likelihood,
    });

    return assessment;
  }

  /**
   * Calculate objective predictability
   */
  private calculateObjectivePredictability(objectives: PIObjective[]): number {
    if (objectives.length === 0) return 0;

    const totalBusinessValue = sumBy(objectives, 'businessValue');
    const confidenceWeightedValue = sumBy(
      objectives,
      (obj) => obj.businessValue * (obj.confidence / 5)
    );

    return (confidenceWeightedValue / totalBusinessValue) * 100;
  }

  /**
   * Calculate feature predictability
   */
  private calculateFeaturePredictability(features: Feature[]): number {
    if (features.length === 0) return 0;

    const completedFeatures = filter(
      features,
      (f) => f.status === 'done'
    ).length;
    return (completedFeatures / features.length) * 100;
  }

  /**
   * Calculate velocity predictability
   */
  private calculateVelocityPredictability(artId: string): number {
    const velocityRecords = filter(
      Array.from(this.velocityTracking.values()),
      (v) => v.teamId.startsWith(artId)
    );

    if (velocityRecords.length === 0) return 75; // Default assumption

    const averageVariance = meanBy(velocityRecords, (v) =>
      Math.abs(v.velocityVariance)
    );
    return Math.max(0, 100 - averageVariance);
  }

  /**
   * Analyze predictability trend
   */
  private analyzeTrend(
    artId: string,
    currentScore: number
  ): PredictabilityTrend {
    // Simplified trend analysis
    return {
      direction: 'stable',
      changeRate: 0,
      trendPeriod: 3,
      confidenceLevel: 75,
      seasonalFactors: [],
    };
  }

  /**
   * Identify predictability risks
   */
  private identifyPredictabilityRisks(
    objectives: PIObjective[],
    features: Feature[]
  ): PredictabilityRisk[] {
    const risks: PredictabilityRisk[] = [];

    // Check for low confidence objectives
    const lowConfidenceObjectives = filter(
      objectives,
      (obj) => obj.confidence <= 2
    );
    if (lowConfidenceObjectives.length > 0) {
      risks.push({
        factor: 'Low confidence objectives',
        impact: -20,
        likelihood: 80,
        mitigation: 'Increase planning depth and stakeholder alignment',
        owner: 'Product Manager',
      });
    }

    // Check for high-risk features
    const highValueFeatures = filter(features, (f) => f.businessValue > 50);
    if (highValueFeatures.length > objectives.length * 0.3) {
      risks.push({
        factor: 'High concentration of high-value features',
        impact: -15,
        likelihood: 60,
        mitigation: 'Distribute risk across multiple PIs',
        owner: 'RTE',
      });
    }

    return risks;
  }

  /**
   * Generate predictability recommendations
   */
  private generateRecommendations(overallPredictability: number): string[] {
    const recommendations: string[] = [];

    if (overallPredictability < 60) {
      recommendations.push(
        'Improve planning accuracy and team commitment process'
      );
      recommendations.push('Increase focus on dependency management');
      recommendations.push('Enhance risk identification and mitigation');
    } else if (overallPredictability < 80) {
      recommendations.push('Fine-tune capacity planning');
      recommendations.push('Strengthen cross-team coordination');
    } else {
      recommendations.push('Maintain current practices');
      recommendations.push('Share best practices with other ARTs');
    }

    return recommendations;
  }

  /**
   * Determine velocity trend
   */
  private determineTrend(
    actualVelocity: number,
    historicalAverage: number
  ): 'increasing|stable|decreasing' {
    const variance = (actualVelocity - historicalAverage) / historicalAverage;

    if (variance > 0.1) return 'increasing';
    if (variance < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Get predictability record
   */
  getPredictability(
    piId: string,
    artId: string
  ): ProgramPredictability | undefined {
    return this.predictabilityRecords.get(`${piId}-${artId}`);
  }

  /**
   * Get objective tracking
   */
  getObjectiveTracking(
    objectiveId: string
  ): ObjectiveCompletionTracking | undefined {
    return this.objectiveTracking.get(objectiveId);
  }

  /**
   * Get velocity tracking
   */
  getVelocityTracking(
    teamId: string,
    piId: string
  ): VelocityTracking | undefined {
    return this.velocityTracking.get(`${teamId}-${piId}`);
  }
}
