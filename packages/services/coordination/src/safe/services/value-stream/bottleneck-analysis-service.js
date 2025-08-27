/**
 * @fileoverview Bottleneck Analysis Service
 *
 * Service for advanced bottleneck detection and root cause analysis.
 * Handles deep bottleneck identification, contributing factor analysis, and impact assessment.
 *
 * SINGLE RESPONSIBILITY: Advanced bottleneck detection and analysis
 * FOCUSES ON: Root cause analysis, contributing factors, impact assessment
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addDays, subDays, differenceInHours } = dateFns;
import { filter, groupBy, meanBy, sumBy, } from 'lodash-es';
/**
 * Bottleneck types
 */
export var BottleneckType;
(function (BottleneckType) {
    BottleneckType["CAPACITY"] = "capacity";
    BottleneckType["SKILL"] = "skill";
    BottleneckType["DEPENDENCY"] = "dependency";
    BottleneckType["PROCESS"] = "process";
    BottleneckType["TOOL"] = "tool";
    BottleneckType["QUALITY"] = "quality";
    BottleneckType["COORDINATION"] = "coordination";
    BottleneckType["EXTERNAL"] = "external";
})(BottleneckType || (BottleneckType = {}));
/**
 * Bottleneck severity levels
 */
export var BottleneckSeverity;
(function (BottleneckSeverity) {
    BottleneckSeverity["CRITICAL"] = "critical";
    BottleneckSeverity["HIGH"] = "high";
    BottleneckSeverity["MEDIUM"] = "medium";
    BottleneckSeverity["LOW"] = "low";
})(BottleneckSeverity || (BottleneckSeverity = {}));
/**
 * Cause categories
 */
export var CauseCategory;
(function (CauseCategory) {
    CauseCategory["PEOPLE"] = "people";
    CauseCategory["PROCESS"] = "process";
    CauseCategory["TECHNOLOGY"] = "technology";
    CauseCategory["ENVIRONMENT"] = "environment";
    CauseCategory["POLICY"] = "policy";
    CauseCategory["EXTERNAL"] = "external";
})(CauseCategory || (CauseCategory = {}));
/**
 * Factor types
 */
export var FactorType;
(function (FactorType) {
    FactorType["RESOURCE_CONSTRAINT"] = "resource_constraint";
    FactorType["SKILL_GAP"] = "skill_gap";
    FactorType["PROCESS_INEFFICIENCY"] = "process_inefficiency";
    FactorType["TOOL_LIMITATION"] = "tool_limitation";
    FactorType["COMMUNICATION_BREAKDOWN"] = "communication_breakdown";
    FactorType["DEPENDENCY_DELAY"] = "dependency_delay";
    FactorType["QUALITY_ISSUE"] = "quality_issue";
    FactorType["EXTERNAL_DEPENDENCY"] = "external_dependency";
})(FactorType || (FactorType = {}));
/**
 * Bottleneck Analysis Service
 */
export class BottleneckAnalysisService {
    logger;
    analysisResults = new Map();
    rootCauseCache = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Perform advanced bottleneck analysis
     */
    async performAdvancedBottleneckAnalysis(config, flowData) {
        this.logger.info('Performing advanced bottleneck analysis', { ': analysisId, config, : .analysisId,
            valueStreamId: config.valueStreamId,
            depth: config.analysisDepth,
        });
        // Detect bottlenecks
        const detectedBottlenecks = await this.detectBottlenecks(config, flowData);
        // Perform root cause analysis
        const rootCauseAnalysis = await this.performRootCauseAnalysis(detectedBottlenecks, config, flowData);
        // Assess impact
        const impactAssessment = await this.assessBottleneckImpact(detectedBottlenecks, config);
        // Identify contributing factors
        const contributingFactors = await this.identifyContributingFactors(detectedBottlenecks, config);
        // Generate recommendations
        const recommendations = await this.generateBottleneckRecommendations(detectedBottlenecks, rootCauseAnalysis, impactAssessment);
        // Calculate overall confidence
        const confidence = this.calculateAnalysisConfidence(detectedBottlenecks, rootCauseAnalysis, contributingFactors);
        const analysis = {
            analysisId: config.analysisId,
            valueStreamId: config.valueStreamId,
            timestamp: new Date(),
            analysisDepth: config.analysisDepth,
            detectedBottlenecks,
            rootCauseAnalysis,
            impactAssessment,
            contributingFactors,
            recommendations,
            confidence,
        };
        this.analysisResults.set(config.analysisId, analysis);
        this.rootCauseCache.set(config.analysisId, rootCauseAnalysis);
        this.logger.info('Bottleneck analysis completed', { ': analysisId, config, : .analysisId,
            bottleneckCount: detectedBottlenecks.length,
            confidence: Math.round(confidence),
            primaryCause: rootCauseAnalysis.primaryCause.description,
        });
        return analysis;
    }
    /**
     * Get analysis result
     */
    getAnalysisResult(analysisId) {
        return this.analysisResults.get(analysisId);
    }
    /**
     * Get root cause analysis
     */
    getRootCauseAnalysis(analysisId) {
        return this.rootCauseCache.get(analysisId);
    }
    /**
     * Private helper methods
     */
    async detectBottlenecks(config, flowData) {
        const bottlenecks = [];
        // Analyze cycle times by stage
        const stageAnalysis = groupBy(flowData.stages, 'name');
        ';
        for (const [stageName, stageData] of Object.entries(stageAnalysis)) {
            const cycleTimeMetrics = this.calculateCycleTimeMetrics(stageData);
            const queueMetrics = this.calculateQueueMetrics(stageData);
            const utilizationMetrics = this.calculateUtilizationMetrics(stageData);
            const errorMetrics = this.calculateErrorMetrics(stageData);
            // Check if stage exceeds thresholds
            if (this.isBottleneck(cycleTimeMetrics, queueMetrics, utilizationMetrics, config.detectionThresholds)) {
                bottlenecks.push({
                    bottleneckId: `bottleneck-${generateNanoId(8)}`,
                } `
          stage: stageName,
          type: this.determineBottleneckType(
            cycleTimeMetrics,
            queueMetrics,
            utilizationMetrics
          ),
          severity: this.calculateSeverity(
            cycleTimeMetrics,
            queueMetrics,
            utilizationMetrics
          ),
          cycleTime: cycleTimeMetrics,
          queueMetrics,
          utilizationMetrics,
          errorMetrics,
          trendAnalysis: this.analyzeTrends(stageData as any[]),
          seasonalityPatterns: this.analyzeSeasonality(stageData as any[]),
        });
      }
    }

    return orderBy(bottlenecks, 'severity', 'desc');'
  }

  private async performRootCauseAnalysis(
    bottlenecks: DetectedBottleneck[],
    config: BottleneckAnalysisConfig,
    flowData: any
  ): Promise<RootCauseAnalysis> {
    if (bottlenecks.length === 0) {
      return this.createEmptyRootCauseAnalysis();
    }

    const primaryBottleneck = bottlenecks[0]; // Most severe

    // Analyze potential causes
    const potentialCauses = await this.identifyPotentialCauses(
      primaryBottleneck,
      config,
      flowData
    );

    // Evaluate evidence for each cause
    const evaluatedCauses = await this.evaluateCauses(
      potentialCauses,
      primaryBottleneck,
      flowData
    );

    // Build causal chain
    const causalChain = this.buildCausalChain(evaluatedCauses);

    const primaryCause = maxBy(evaluatedCauses, 'confidence')!;'
    const secondaryCauses = filter(
      evaluatedCauses,
      (cause) => cause.causeId !== primaryCause.causeId
    );

    return {
      analysisId: `, root - cause - $, {} `,`, primaryCause, secondaryCauses, causalChain, confidence, meanBy(evaluatedCauses, 'confidence'), analysisMethod, config.rootCauseAnalysis.enableAutomated
                    ? 'automated' : , ', 'manual');
            }
            ;
        }
    }
    async assessBottleneckImpact(bottlenecks, _config) {
        const totalCycleTime = sumBy(bottlenecks, (b) => b.cycleTime.average);
        const totalQueueLength = sumBy(bottlenecks, (b) => b.queueMetrics.averageLength);
        return {
            assessmentId: `impact-${generateNanoId(8)}`,
        } `
      financialImpact: {
        delayedRevenue: totalCycleTime * 1000, // Simplified calculation
        additionalCosts: totalQueueLength * 500,
        opportunityCost: totalCycleTime * 750,
        totalImpact:
          totalCycleTime * 1000 + totalQueueLength * 500 + totalCycleTime * 750,
        currency: 'USD',
        confidence: 75,
      },
      timeImpact: {
        delayHours: totalCycleTime,
        delayDays: totalCycleTime / 24,
        cumulativeDelay: totalCycleTime * 1.5,
      },
      qualityImpact: {
        defectRate: meanBy(bottlenecks, (b) => b.errorMetrics.errorRate),
        reworkRate: meanBy(bottlenecks, (b) => b.errorMetrics.reworkRate),
        customerSatisfactionImpact: this.estimateCustomerImpact(bottlenecks),
      },
      customerImpact: {
        affectedCustomers: bottlenecks.length * 100, // Estimated
        satisfactionScore: Math.max(1, 5 - bottlenecks.length * 0.5),
        churnRisk: bottlenecks.length > 3 ? 'high' : 'medium',
      },
      teamImpact: {
        moralImpact: this.estimateTeamMorale(bottlenecks),
        stressLevel: bottlenecks.length > 2 ? 'high' : 'medium',
        burnoutRisk: bottlenecks.length > 4 ? 'high' : 'low',
      },
      overallSeverity: this.calculateOverallSeverity(bottlenecks),
    };
  }

  private async identifyContributingFactors(
    bottlenecks: DetectedBottleneck[],
    _config: BottleneckAnalysisConfig
  ): Promise<ContributingFactor[]> {
    const factors: ContributingFactor[] = [];

    for (const bottleneck of bottlenecks) {
      // Resource constraint factors
      if (bottleneck.utilizationMetrics.utilization > 90) {
        factors.push({
          factorId: `;
        factor - $;
        {
            generateNanoId(8);
        }
        `,`;
        description: `High utilization in ${bottleneck.stage}`, `
          type: FactorType.RESOURCE_CONSTRAINT,
          weight: 85,
          correlation: 0.8,
          frequency: this.calculateFactorFrequency(bottleneck),
          impact: this.calculateFactorImpact(bottleneck),
          mitigation: [
            'Add capacity',
            'Load balancing',
            'Process optimization',
          ],
        });
      }

      // Process inefficiency factors
      if (bottleneck.cycleTime.variance > bottleneck.cycleTime.average * 0.5) {
        factors.push({
          factorId: `;
        factor - $;
        {
            generateNanoId(8);
        }
        `,`;
        description: `High cycle time variance in ${bottleneck.stage}`, `
          type: FactorType.PROCESS_INEFFICIENCY,
          weight: 70,
          correlation: 0.6,
          frequency: this.calculateFactorFrequency(bottleneck),
          impact: this.calculateFactorImpact(bottleneck),
          mitigation: ['Standardize process', 'Reduce variability', 'Training'],
        });
      }
    }

    return orderBy(factors, 'weight', 'desc');'
  }

  private async generateBottleneckRecommendations(
    bottlenecks: DetectedBottleneck[],
    _rootCause: RootCauseAnalysis,
    _impact: ImpactAssessment
  ): Promise<BottleneckRecommendation[]> {
    const recommendations: BottleneckRecommendation[] = [];

    for (const bottleneck of bottlenecks) {
      switch (bottleneck.type) {
        case BottleneckType.CAPACITY:
          recommendations.push({
            recommendationId: `;
        rec - $;
        {
            generateNanoId(8);
        }
        `,`;
        title: `Increase capacity in ${bottleneck.stage}`, `
            description:
              'Add additional resources or optimize resource allocation',
            priority: this.mapSeverityToPriority(bottleneck.severity),
            estimatedEffort: 'medium',
            estimatedImpact: 'high',
            implementation: [
              'Hire additional team members',
              'Cross-train existing staff',
              'Automate repetitive tasks',
            ],
          });
          break;

        case BottleneckType.PROCESS:
          recommendations.push({
            recommendationId: `;
        rec - $;
        {
            generateNanoId(8);
        }
        `,`;
        title: `Optimize process in ${bottleneck.stage}`, `
            description: 'Streamline and standardize the current process',
            priority: this.mapSeverityToPriority(bottleneck.severity),
            estimatedEffort: 'low',
            estimatedImpact: 'medium',
            implementation: [
              'Process mapping workshop',
              'Eliminate non-value-added steps',
              'Standardize procedures',
            ],
          });
          break;

        case BottleneckType.DEPENDENCY:
          recommendations.push({
            recommendationId: `;
        rec - $;
        {
            generateNanoId(8);
        }
        `,`;
        title: `Resolve dependencies for ${bottleneck.stage}`, `
            description:
              'Address external dependencies and coordination issues',
            priority: this.mapSeverityToPriority(bottleneck.severity),
            estimatedEffort: 'high',
            estimatedImpact: 'high',
            implementation: [
              'Dependency mapping',
              'Service level agreements',
              'Parallel processing',
            ],
          });
          break;
      }
    }

    return recommendations;
  }

  // Additional helper methods...
  private calculateCycleTimeMetrics(stageData: any[]): CycleTimeMetrics {
    const cycleTimes = map(stageData, 'cycleTime').filter((ct) => ct != null);'

    return {
      average: meanBy(cycleTimes, Number) || 0,
      median: this.calculateMedian(cycleTimes),
      p95: this.calculatePercentile(cycleTimes, 95),
      variance: this.calculateVariance(cycleTimes),
      min: Math.min(...cycleTimes) || 0,
      max: Math.max(...cycleTimes) || 0,
    };
  }

  private calculateQueueMetrics(stageData: any[]): QueueMetrics {
    const queueLengths = map(stageData,'queueLength').filter('
      (ql) => ql != null
    );

    return {
      averageLength: meanBy(queueLengths, Number) || 0,
      maxLength: Math.max(...queueLengths) || 0,
      averageWaitTime: meanBy(stageData,'waitTime') || 0,
      throughput: stageData.length / 24, // items per hour
    };
  }

  private calculateUtilizationMetrics(_stageData: any[]): UtilizationMetrics {
    return {
      utilization: Math.random() * 40 + 60, // 60-100% simulation
      efficiency: Math.random() * 30 + 70, // 70-100% simulation
      activeTime: Math.random() * 8 + 16, // 16-24 hours simulation
      idleTime: Math.random() * 8, // 0-8 hours simulation
    };
  }

  private calculateErrorMetrics(_stageData: any[]): ErrorMetrics {
    return {
      errorRate: Math.random() * 10, // 0-10% error rate
      reworkRate: Math.random() * 15, // 0-15% rework rate
      defectEscapeeRate: Math.random() * 5, // 0-5% escape rate
    };
  }

  // More helper methods omitted for brevity...
  private isBottleneck(
    cycle: CycleTimeMetrics,
    queue: QueueMetrics,
    util: UtilizationMetrics,
    thresholds: DetectionThresholds
  ): boolean {
    return (
      cycle.average > thresholds.cycleTimeThreshold || queue.averageWaitTime > thresholds.waitTimeThreshold || queue.averageLength > thresholds.queueLengthThreshold || util.utilization > thresholds.utilizationThreshold
    );
  }

  private determineBottleneckType(
    cycle: CycleTimeMetrics,
    queue: QueueMetrics,
    util: UtilizationMetrics
  ): BottleneckType {
    if (util.utilization > 95) return BottleneckType.CAPACITY;
    if (cycle.variance > cycle.average) return BottleneckType.PROCESS;
    if (queue.averageWaitTime > cycle.average) return BottleneckType.DEPENDENCY;
    return BottleneckType.PROCESS;
  }

  private calculateSeverity(
    cycle: CycleTimeMetrics,
    queue: QueueMetrics,
    util: UtilizationMetrics
  ): BottleneckSeverity {
    const severityScore =
      cycle.average / 24 + queue.averageLength / 10 + util.utilization / 100;

    if (severityScore > 2.5) return BottleneckSeverity.CRITICAL;
    if (severityScore > 2.0) return BottleneckSeverity.HIGH;
    if (severityScore > 1.5) return BottleneckSeverity.MEDIUM;
    return BottleneckSeverity.LOW;
  }

  private analyzeTrends(_stageData: any[]): TrendAnalysis {
    return {
      direction:'increasing',
      magnitude: 0.15,
      confidence: 0.8,
      seasonality: false,
    };
  }

  private analyzeSeasonality(_stageData: any[]): SeasonalityPattern[] {
    return [
      {
        patternId: `;
        pattern - $;
        {
            generateNanoId(6);
        }
        `,`;
        type: 'weekly',
            strength;
        0.3,
            phase;
        'monday',
            description;
        'Higher volume on Mondays',
        ;
    }
    ;
}
calculateMedian(values, number[]);
number;
{
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}
calculatePercentile(values, number[], percentile, number);
number;
{
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    return sorted[Math.ceil(index)] || 0;
}
calculateVariance(values, number[]);
number;
{
    const mean = meanBy(values, Number) || 0;
    const squaredDiffs = values.map((value) => (value - mean) ** 2);
    return meanBy(squaredDiffs, Number) || 0;
}
calculateAnalysisConfidence(bottlenecks, DetectedBottleneck[], rootCause, RootCauseAnalysis, factors, ContributingFactor[]);
number;
{
    if (bottlenecks.length === 0)
        return 0;
    const bottleneckConfidence = meanBy(bottlenecks, () => 0.8); // Simplified
    const rootCauseConfidence = rootCause.confidence / 100;
    const factorConfidence = meanBy(factors, (f) => f.correlation);
    return (((bottleneckConfidence + rootCauseConfidence + factorConfidence) / 3) *
        100);
}
createEmptyRootCauseAnalysis();
RootCauseAnalysis;
{
    return {
        analysisId: `empty-${generateNanoId(8)}`,
    } `
      primaryCause: {
        causeId: `;
    cause - $;
    {
        generateNanoId(8);
    }
    `,`;
    description: 'No significant root cause identified',
        category;
    CauseCategory.PROCESS,
        evidence;
    [],
        confidence;
    0,
        impact;
    {
        severity: 'low', scope;
        'limited', timeframe;
        'short';
    }
    addressability: {
        difficulty: 'easy', cost;
        'low', timeline;
        'short';
    }
}
secondaryCauses: [],
    causalChain;
[],
    confidence;
0,
    analysisMethod;
'automated',
;
;
async;
identifyPotentialCauses(_bottleneck, DetectedBottleneck, _config, BottleneckAnalysisConfig, _flowData, any);
Promise < RootCause[] > {
    return: []
};
async;
evaluateCauses(causes, RootCause[], _bottleneck, DetectedBottleneck, _flowData, any);
Promise < RootCause[] > {
    return: causes
};
buildCausalChain(_causes, RootCause[]);
CausalLink[];
{
    return [];
}
estimateCustomerImpact(bottlenecks, DetectedBottleneck[]);
number;
{
    return Math.max(0, 5 - bottlenecks.length * 0.3);
}
estimateTeamMorale(bottlenecks, DetectedBottleneck[]);
number;
{
    return Math.max(1, 5 - bottlenecks.length * 0.4);
}
calculateOverallSeverity(bottlenecks, DetectedBottleneck[]);
ImpactSeverity;
{
    const criticalCount = filter(bottlenecks, (b) => b.severity === BottleneckSeverity.CRITICAL).length;
    const highCount = filter(bottlenecks, (b) => b.severity === BottleneckSeverity.HIGH).length;
    if (criticalCount > 0)
        return ImpactSeverity.CRITICAL;
    if (highCount > 1)
        return ImpactSeverity.HIGH;
    if (bottlenecks.length > 2)
        return ImpactSeverity.MEDIUM;
    return ImpactSeverity.LOW;
}
calculateFactorFrequency(bottleneck, DetectedBottleneck);
FactorFrequency;
{
    // Simple classification based on bottleneck severity
    if (bottleneck.severity === 'critical') {
        ';
        return FactorFrequency.CONSTANT;
    }
    else if (bottleneck.severity === 'high') {
        ';
        return FactorFrequency.FREQUENT;
    }
    else if (bottleneck.severity === 'medium') {
        ';
        return FactorFrequency.OCCASIONAL;
    }
    else {
        return FactorFrequency.RARE;
    }
}
calculateFactorImpact(bottleneck, DetectedBottleneck);
FactorImpact;
{
    return {
        magnitude: bottleneck.severity === BottleneckSeverity.CRITICAL ? 'high' : 'medium',
        scope: 'local',
        duration: 'temporary',
        cascading: false,
    };
}
mapSeverityToPriority(severity, BottleneckSeverity);
'critical|high|medium|low';
{
    ';
    switch (severity) {
        case BottleneckSeverity.CRITICAL:
            return 'critical;;
        case BottleneckSeverity.HIGH:
            return 'high;;
        case BottleneckSeverity.MEDIUM:
            return 'medium;;
        case BottleneckSeverity.LOW:
            return 'low;;
        default:
            return 'medium;;
    }
}
var ImpactSeverity;
(function (ImpactSeverity) {
    ImpactSeverity["LOW"] = "low";
    ImpactSeverity["MEDIUM"] = "medium";
    ImpactSeverity["HIGH"] = "high";
    ImpactSeverity["CRITICAL"] = "critical";
})(ImpactSeverity || (ImpactSeverity = {}));
var FactorFrequency;
(function (FactorFrequency) {
    FactorFrequency["RARE"] = "rare";
    FactorFrequency["OCCASIONAL"] = "occasional";
    FactorFrequency["FREQUENT"] = "frequent";
    FactorFrequency["CONSTANT"] = "constant";
})(FactorFrequency || (FactorFrequency = {}));
