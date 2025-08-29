/**
 * @fileoverview Program Predictability Service
 *
 * Service for measuring and tracking program predictability metrics.
 * Handles objective completion tracking, velocity analysis, and predictability reporting.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import type {
  Feature,
  Logger,
  PIObjective,
} from '../../types')/**';
 * Program predictability metrics
 */
export interface ProgramPredictability {
  readonly piId: reduces predictability)
  readonly likelihood: 'increasing|',improving' | ' stable'| ' declining' | ' decreasing')  readonly factors: 'none')  MINOR = 'minor')  MODERATE = 'moderate')  SIGNIFICANT = 'significant')  SEVERE = 'severe')};;
/**
 * Customer impact levels
 */
export enum CustomerImpactLevel {
    ')  NONE = 'none')  LOW = 'low')  MODERATE = 'moderate')  HIGH = 'high')  CRITICAL = 'critical')};;
/**
 * Team morale impact levels
 */
export enum MoraleImpactLevel {
    ')  POSITIVE = 'positive')  NEUTRAL = 'neutral')  SLIGHT_NEGATIVE = 'slight_negative')  NEGATIVE = 'negative')  SEVERELY_NEGATIVE = 'severely_negative')};;
/**
 * Program Predictability Service for measuring and analyzing program predictability
 */
export class ProgramPredictabilityService {
  private readonly logger: new Map<string, ProgramPredictability>();
  private objectiveTracking = new Map<string, ObjectiveCompletionTracking>();
  private velocityTracking = new Map<string, VelocityTracking>();
  constructor(logger: logger;
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
    ')    this.logger.info('Measuring program predictability,{ piId, artId};);`;
    const objectivePredictability =;
      this.calculateObjectivePredictability(objectives);
    const featurePredictability = this.calculateFeaturePredictability(features);
    const velocityPredictability = this.calculateVelocityPredictability(artId);
    const overallPredictability =
      objectivePredictability * 0.4 +
      featurePredictability * 0.35 +;
      velocityPredictability * 0.25;
    const predictability:  {
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
};`Measuring program predictability,{ piId, artId};);`;
    const objectivePredictability =;
      this.calculateObjectivePredictability(objectives);
    const featurePredictability = this.calculateFeaturePredictability(features);
    const velocityPredictability = this.calculateVelocityPredictability(artId);
    const overallPredictability =
      objectivePredictability * 0.4 +
      featurePredictability * 0.35 +;
      velocityPredictability * 0.25;
    const predictability:  {
      piId,
      artId,
      measurementDate:  {
      objectiveId,
      piId,
      teamId,
      plannedValue: completion.plannedValue,
      actualValue: completion.actualValue,
      completion: completion.completion,
      confidence: completion.confidence,
      status: completion.status,
      blockers: completion.blockers|| [],
      adjustments: [],
};
    this.objectiveTracking.set(objectiveId, tracking);
    this.logger.info('Objective completion tracked,{';
      objectiveId,
      completion: completion.completion,
      status: completion.status,');
});
    return tracking;
}
  /**
   * Track team velocity
   */
  async trackVelocity(
    teamId: string,
    piId: string,
    velocity:  {
      plannedVelocity: number;
      actualVelocity: number;
      historicalAverage: number;
      factors?:VelocityFactor[];
}
  ): Promise<VelocityTracking> {
    const velocityVariance =
      ((velocity.actualVelocity - velocity.plannedVelocity) /
        velocity.plannedVelocity) *;
      100;
    const trend = this.determineTrend(
      velocity.actualVelocity,
      velocity.historicalAverage;
    );
    const tracking:  {
      teamId,
      piId,
      plannedVelocity: `impact-${generateNanoId(12)})    const assessment:  {``;
      impactId,
      ...impact,
};
    this.logger.info('Business impact assessed,{';
      impactId,
      category: impact.category,
      severity: impact.severity,
      likelihood: impact.likelihood,')';
});
    return assessment;
}
  /**
   * Calculate objective predictability
   */
  private calculateObjectivePredictability(objectives: PIObjective[]): number {
    if (objectives.length === 0) return 0;)    const totalBusinessValue = sumBy(objectives, 'businessValue');
    const confidenceWeightedValue = sumBy(
      objectives,
      (obj) => obj.businessValue * (obj.confidence / 5);
    );
    return (confidenceWeightedValue / totalBusinessValue) * 100;
}
  /**
   * Calculate feature predictability
   */
  private calculateFeaturePredictability(features: Feature[]): number {
    if (features.length === 0) return 0;
    const completedFeatures = filter(
      features,')      (f) => f.status ==='done')    ).length;';
    return (completedFeatures / features.length) * 100;
}
  /**
   * Calculate velocity predictability
   */
  private calculateVelocityPredictability(artId: filter(
      Array.from(this.velocityTracking.values()),
      (v) => v.teamId.startsWith(artId);
    );
    if (velocityRecords.length === 0) return 75; // Default assumption
    const averageVariance = meanBy(velocityRecords, (v) =>
      Math.abs(v.velocityVariance);
    );
    return Math.max(0, 100 - averageVariance);
}
  /**
   * Analyze predictability trend
   */
  private analyzeTrend(
    artId: 'stable,',
'      changeRate: [];
    // Check for low confidence objectives
    const lowConfidenceObjectives = filter(
      objectives,
      (obj) => obj.confidence <= 2;
    );
    if (lowConfidenceObjectives.length > 0) {
      risks.push({
    ')        factor : 'Low confidence objectives,'
'        impact: 'Increase planning depth and stakeholder alignment',)        owner,});
}
    // Check for high-risk features
    const highValueFeatures = filter(features, (f) => f.businessValue > 50);
    if (highValueFeatures.length > objectives.length * 0.3) {
    ')      risks.push({';
    ')        factor : 'High concentration of high-value features,'
'        impact: 'Distribute risk across multiple PIs',)        owner,});
}
    return risks;
}
  /**
   * Generate predictability recommendations
   */
  private generateRecommendations(overallPredictability: [];
    if (overallPredictability < 60) {
      recommendations.push(';)';
       'Improve planning accuracy and team commitment process')      );')      recommendations.push('Increase focus on dependency management');')      recommendations.push('Enhance risk identification and mitigation');
} else if (overallPredictability < 80) {
    ')      recommendations.push('Fine-tune capacity planning');')      recommendations.push('Strengthen cross-team coordination');
} else {
    ')      recommendations.push('Maintain current practices');')      recommendations.push('Share best practices with other ARTs');
}
    return recommendations;
}
  /**
   * Determine velocity trend
   */
  private determineTrend(
    actualVelocity: (actualVelocity - historicalAverage) / historicalAverage;
    if (variance > 0.1) return'increasing')    if (variance < -0.1) return'decreasing')    returnstable`)};;
  /**
   * Get predictability record
   */
  getPredictability(
    piId: string,
    artId: string
  ):ProgramPredictability| undefined {
    return this.predictabilityRecords.get(`${piId-${a}rtId};);``)};;
  /**
   * Get objective tracking
   */
  getObjectiveTracking(
    objectiveId: string
  ):ObjectiveCompletionTracking| undefined {
    return this.objectiveTracking.get(objectiveId);
}
  /**
   * Get velocity tracking
   */
  getVelocityTracking(
    teamId: string,
    piId: string
  ):VelocityTracking| undefined {
    return this.velocityTracking.get(`${{teamId}-${piId}};);`)};;
};`