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
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addDays, differenceInDays, subDays } = dateFns;
improving;
' | ';
stable;
' | ';
declining;
'|decreasing;;
factors: VelocityFactor[];
/**
 * Quality impact levels
 */
export var QualityImpactLevel;
(function (QualityImpactLevel) {
    QualityImpactLevel["NONE"] = "none";
    QualityImpactLevel["MINOR"] = "minor";
    QualityImpactLevel["MODERATE"] = "moderate";
    QualityImpactLevel["SIGNIFICANT"] = "significant";
    QualityImpactLevel["SEVERE"] = "severe";
})(QualityImpactLevel || (QualityImpactLevel = {}));
/**
 * Customer impact levels
 */
export var CustomerImpactLevel;
(function (CustomerImpactLevel) {
    CustomerImpactLevel["NONE"] = "none";
    CustomerImpactLevel["LOW"] = "low";
    CustomerImpactLevel["MODERATE"] = "moderate";
    CustomerImpactLevel["HIGH"] = "high";
    CustomerImpactLevel["CRITICAL"] = "critical";
})(CustomerImpactLevel || (CustomerImpactLevel = {}));
/**
 * Team morale impact levels
 */
export var MoraleImpactLevel;
(function (MoraleImpactLevel) {
    MoraleImpactLevel["POSITIVE"] = "positive";
    MoraleImpactLevel["NEUTRAL"] = "neutral";
    MoraleImpactLevel["SLIGHT_NEGATIVE"] = "slight_negative";
    MoraleImpactLevel["NEGATIVE"] = "negative";
    MoraleImpactLevel["SEVERELY_NEGATIVE"] = "severely_negative";
})(MoraleImpactLevel || (MoraleImpactLevel = {}));
/**
 * Program Predictability Service for measuring and analyzing program predictability
 */
export class ProgramPredictabilityService {
    logger;
    predictabilityRecords = new Map();
    objectiveTracking = new Map();
    velocityTracking = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Measure program predictability for PI
     */
    async measurePredictability(piId, artId, objectives, features) {
        this.logger.info('Measuring program predictability', { piId, artId });
        ';
        const objectivePredictability = this.calculateObjectivePredictability(objectives);
        const featurePredictability = this.calculateFeaturePredictability(features);
        const velocityPredictability = this.calculateVelocityPredictability(artId);
        const overallPredictability = objectivePredictability * 0.4 +
            featurePredictability * 0.35 +
            velocityPredictability * 0.25;
        const predictability = {
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
        `

    this.logger.info('Program predictability measured', {'
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
      status:|not_started|in_progress|completed|at_risk|'missed;
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

    this.logger.info('Objective completion tracked', {'
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

    this.velocityTracking.set(`;
        $teamId - $piId `, tracking);`;
        this.logger.info('Velocity tracked', { ': teamId,
            piId,
            variance: Math.round(velocityVariance),
            trend,
        });
        return tracking;
    }
    /**
     * Assess business impact
     */
    async assessBusinessImpact(_impact) {
        const _impactId = `impact-${generateNanoId(12)}`;
        `

    const assessment: BusinessImpactAssessment = {
      impactId,
      ...impact,
    };

    this.logger.info('Business impact assessed', {'
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

    const totalBusinessValue = sumBy(objectives, 'businessValue');'
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
      (f) => f.status === 'done''
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
        'Improve planning accuracy and team commitment process''
      );
      recommendations.push('Increase focus on dependency management');'
      recommendations.push('Enhance risk identification and mitigation');'
    } else if (overallPredictability < 80) {
      recommendations.push('Fine-tune capacity planning');'
      recommendations.push('Strengthen cross-team coordination');'
    } else {
      recommendations.push('Maintain current practices');'
      recommendations.push('Share best practices with other ARTs');'
    }

    return recommendations;
  }

  /**
   * Determine velocity trend
   */
  private determineTrend(
    actualVelocity: number,
    historicalAverage: number
  ): 'increasing|'improving' | 'stable' | 'declining'|decreasing' {'
    const variance = (actualVelocity - historicalAverage) / historicalAverage;

    if (variance > 0.1) return 'increasing;
    if (variance < -0.1) return 'decreasing;
    return 'stable';
  }

  /**
   * Get predictability record
   */
  getPredictability(
    piId: string,
    artId: string
  ): ProgramPredictability | undefined {
    return this.predictabilityRecords.get(`;
        $piId - $artId `);`;
    }
    /**
     * Get objective tracking
     */
    getObjectiveTracking(objectiveId) {
        return this.objectiveTracking.get(objectiveId);
    }
    /**
     * Get velocity tracking
     */
    getVelocityTracking(teamId, piId) {
        return this.velocityTracking.get(`${teamId}-${piId}`);
        `
  }
}
        ;
    }
}
