/**
 * @file Advanced Metrics Tracker - Phase 4, Day 19 (Task 18.1-18.3)
 *
 * Implements comprehensive flow metrics collection, performance optimization engine,
 * and predictive flow analytics. Provides automated performance optimization,
 * A/B testing for flow improvements, and advanced forecasting capabilities.
 *
 * ARCHITECTURE:
 * - Comprehensive flow metrics collection and analysis
 * - Performance optimization engine with ML recommendations
 * - A/B testing framework for flow improvements
 * - Predictive flow analytics and delivery forecasting
 * - Capacity planning analytics and risk assessment
 * - Integration with Advanced Flow Manager and Bottleneck Detection
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { AdvancedFlowManager } from './flow-manager.ts';
import type { BottleneckDetectionEngine } from './bottleneck-detector.ts';
import type { FlowStage, WIPLimits } from './flow-manager.ts';
/**
 * Advanced Metrics Tracker configuration
 */
export interface AdvancedMetricsTrackerConfig {
    readonly enableRealTimeCollection: boolean;
    readonly enablePerformanceOptimization: boolean;
    readonly enableABTesting: boolean;
    readonly enablePredictiveAnalytics: boolean;
    readonly enableCapacityPlanning: boolean;
    readonly enableAnomalyDetection: boolean;
    readonly collectionInterval: number;
    readonly optimizationInterval: number;
    readonly forecastHorizon: number;
    readonly metricsRetentionPeriod: number;
    readonly abTestDuration: number;
    readonly minSampleSizeForOptimization: number;
    readonly confidenceThreshold: number;
    readonly anomalyDetectionSensitivity: number;
    readonly performanceBaselines: PerformanceBaseline[];
    readonly metricCategories: MetricCategory[];
    readonly optimizationObjectives: OptimizationObjective[];
}
/**
 * Performance baseline
 */
export interface PerformanceBaseline {
    readonly metric: string;
    readonly baseline: number;
    readonly target: number;
    readonly tolerance: number;
    readonly unit: string;
    readonly timeWindow: number;
    readonly calculationMethod: 'average' | 'median' | 'p95' | 'p99';
}
/**
 * Metric category
 */
export interface MetricCategory {
    readonly category: MetricCategoryType;
    readonly metrics: string[];
    readonly weight: number;
    readonly aggregationMethod: 'sum' | 'average' | 'weighted_average' | 'max' | 'min';
    readonly alertThresholds: AlertThreshold[];
}
/**
 * Metric category type
 */
export declare enum MetricCategoryType {
    FLOW_EFFICIENCY = "flow-efficiency",
    THROUGHPUT = "throughput",
    QUALITY = "quality",
    PREDICTABILITY = "predictability",
    CUSTOMER_VALUE = "customer-value",
    COST_EFFECTIVENESS = "cost-effectiveness",
    TEAM_HEALTH = "team-health",
    TECHNICAL_HEALTH = "technical-health"
}
/**
 * Alert threshold
 */
export interface AlertThreshold {
    readonly level: 'info' | 'warning' | 'critical';
    readonly condition: 'above' | 'below' | 'equal' | 'trend';
    readonly value: number;
    readonly duration: number;
    readonly actions: AlertAction[];
}
/**
 * Alert action
 */
export interface AlertAction {
    readonly type: 'notification' | 'optimization' | 'escalation' | 'logging';
    readonly parameters: Record<string, any>;
    readonly delay: number;
}
/**
 * Optimization objective
 */
export interface OptimizationObjective {
    readonly objectiveId: string;
    readonly name: string;
    readonly targetMetrics: string[];
    readonly optimizationDirection: 'maximize' | 'minimize' | 'target';
    readonly weight: number;
    readonly constraints: OptimizationConstraint[];
    readonly successCriteria: SuccessCriterion[];
}
/**
 * Optimization constraint
 */
export interface OptimizationConstraint {
    readonly metric: string;
    readonly operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'range';
    readonly value: number;
    readonly upperBound?: number;
    readonly priority: 'hard' | 'soft' | 'preference';
}
/**
 * Success criterion
 */
export interface SuccessCriterion {
    readonly metric: string;
    readonly target: number;
    readonly tolerance: number;
    readonly timeframe: number;
    readonly critical: boolean;
}
/**
 * Comprehensive flow metrics collection
 */
export interface ComprehensiveFlowMetrics {
    readonly timestamp: Date;
    readonly collectionId: string;
    readonly flowMetrics: DetailedFlowMetrics;
    readonly performanceMetrics: PerformanceMetrics;
    readonly qualityMetrics: QualityMetrics;
    readonly predictabilityMetrics: PredictabilityMetrics;
    readonly customerValueMetrics: CustomerValueMetrics;
    readonly costMetrics: CostMetrics;
    readonly teamHealthMetrics: TeamHealthMetrics;
    readonly technicalHealthMetrics: TechnicalHealthMetrics;
    readonly contextMetrics: ContextualMetrics;
    readonly derivedMetrics: DerivedMetrics;
}
/**
 * Detailed flow metrics
 */
export interface DetailedFlowMetrics {
    readonly cycleTime: CycleTimeAnalysis;
    readonly leadTime: LeadTimeAnalysis;
    readonly throughput: ThroughputAnalysis;
    readonly wipMetrics: WIPAnalysis;
    readonly flowEfficiency: FlowEfficiencyAnalysis;
    readonly cumulativeFlow: CumulativeFlowAnalysis;
    readonly flowDebt: FlowDebtAnalysis;
    readonly flowVelocity: FlowVelocityAnalysis;
}
/**
 * Cycle time analysis
 */
export interface CycleTimeAnalysis {
    readonly overall: StatisticalSummary;
    readonly byStage: Map<FlowStage, StatisticalSummary>;
    readonly byType: Map<string, StatisticalSummary>;
    readonly byPriority: Map<string, StatisticalSummary>;
    readonly bySize: Map<string, StatisticalSummary>;
    readonly trends: TrendAnalysis;
    readonly percentiles: PercentileAnalysis;
    readonly outlierAnalysis: OutlierAnalysis;
    readonly controlLimits: ControlLimits;
}
/**
 * Statistical summary
 */
export interface StatisticalSummary {
    readonly count: number;
    readonly mean: number;
    readonly median: number;
    readonly mode: number;
    readonly standardDeviation: number;
    readonly variance: number;
    readonly skewness: number;
    readonly kurtosis: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly range: number;
    readonly quartiles: Quartiles;
}
/**
 * Quartiles
 */
export interface Quartiles {
    readonly q1: number;
    readonly q2: number;
    readonly q3: number;
    readonly iqr: number;
}
/**
 * Trend analysis
 */
export interface TrendAnalysis {
    readonly direction: 'improving' | 'stable' | 'degrading';
    readonly slope: number;
    readonly correlation: number;
    readonly significance: number;
    readonly seasonality: SeasonalityAnalysis;
    readonly changePoints: ChangePoint[];
    readonly forecast: TrendForecast;
}
/**
 * Seasonality analysis
 */
export interface SeasonalityAnalysis {
    readonly detected: boolean;
    readonly period: number;
    readonly strength: number;
    readonly pattern: SeasonalPattern[];
}
/**
 * Seasonal pattern
 */
export interface SeasonalPattern {
    readonly period: string;
    readonly pattern: number[];
    readonly confidence: number;
}
/**
 * Change point
 */
export interface ChangePoint {
    readonly timestamp: Date;
    readonly magnitude: number;
    readonly direction: 'increase' | 'decrease';
    readonly confidence: number;
    readonly cause?: string;
}
/**
 * Trend forecast
 */
export interface TrendForecast {
    readonly timeHorizon: number;
    readonly predictions: ForecastPoint[];
    readonly confidence: number;
    readonly modelUsed: string;
    readonly accuracy: number;
}
/**
 * Forecast point
 */
export interface ForecastPoint {
    readonly timestamp: Date;
    readonly value: number;
    readonly confidenceInterval: ConfidenceInterval;
    readonly probability: number;
}
/**
 * Confidence interval
 */
export interface ConfidenceInterval {
    readonly lower: number;
    readonly upper: number;
    readonly confidence: number;
}
/**
 * Percentile analysis
 */
export interface PercentileAnalysis {
    readonly p50: number;
    readonly p75: number;
    readonly p85: number;
    readonly p95: number;
    readonly p99: number;
    readonly customPercentiles: Map<number, number>;
}
/**
 * Outlier analysis
 */
export interface OutlierAnalysis {
    readonly outliers: Outlier[];
    readonly outlierRate: number;
    readonly detectionMethod: 'iqr' | 'zscore' | 'isolation_forest' | 'lof';
    readonly threshold: number;
    readonly impact: OutlierImpact;
}
/**
 * Outlier
 */
export interface Outlier {
    readonly value: number;
    readonly timestamp: Date;
    readonly workItemId?: string;
    readonly outlierScore: number;
    readonly possibleCauses: string[];
}
/**
 * Outlier impact
 */
export interface OutlierImpact {
    readonly impactOnMean: number;
    readonly impactOnMedian: number;
    readonly impactOnStandardDeviation: number;
    readonly recommendedAction: string;
}
/**
 * Control limits
 */
export interface ControlLimits {
    readonly centerLine: number;
    readonly upperControlLimit: number;
    readonly lowerControlLimit: number;
    readonly upperWarningLimit: number;
    readonly lowerWarningLimit: number;
    readonly outOfControlPoints: ControlViolation[];
}
/**
 * Control violation
 */
export interface ControlViolation {
    readonly timestamp: Date;
    readonly value: number;
    readonly type: 'ucl' | 'lcl' | 'trend' | 'shift' | 'run';
    readonly severity: 'warning' | 'violation';
    readonly description: string;
}
/**
 * Lead time analysis
 */
export interface LeadTimeAnalysis {
    readonly overall: StatisticalSummary;
    readonly customerLeadTime: StatisticalSummary;
    readonly systemLeadTime: StatisticalSummary;
    readonly leadTimeBreakdown: LeadTimeBreakdown;
    readonly trends: TrendAnalysis;
    readonly serviceClassAnalysis: Map<string, StatisticalSummary>;
}
/**
 * Lead time breakdown
 */
export interface LeadTimeBreakdown {
    readonly committedTime: number;
    readonly waitingTime: number;
    readonly activeTime: number;
    readonly reviewTime: number;
    readonly deploymentTime: number;
    readonly breakdown: Map<FlowStage, number>;
}
/**
 * Throughput analysis
 */
export interface ThroughputAnalysis {
    readonly current: ThroughputMeasurement;
    readonly historical: ThroughputMeasurement[];
    readonly trends: TrendAnalysis;
    readonly capacity: CapacityAnalysis;
    readonly variability: VariabilityAnalysis;
    readonly bottleneckImpact: BottleneckThroughputImpact;
}
/**
 * Throughput measurement
 */
export interface ThroughputMeasurement {
    readonly timestamp: Date;
    readonly itemsPerHour: number;
    readonly itemsPerDay: number;
    readonly itemsPerWeek: number;
    readonly itemsPerMonth: number;
    readonly valuePerHour: number;
    readonly valuePerDay: number;
    readonly valuePerWeek: number;
    readonly valuePerMonth: number;
    readonly byServiceClass: Map<string, number>;
}
/**
 * Capacity analysis
 */
export interface CapacityAnalysis {
    readonly theoreticalCapacity: number;
    readonly actualCapacity: number;
    readonly utilization: number;
    readonly efficiency: number;
    readonly bottlenecks: CapacityBottleneck[];
    readonly recommendations: CapacityRecommendation[];
}
/**
 * Capacity bottleneck
 */
export interface CapacityBottleneck {
    readonly stage: FlowStage;
    readonly capacity: number;
    readonly demand: number;
    readonly utilizationRate: number;
    readonly impact: number;
}
/**
 * Capacity recommendation
 */
export interface CapacityRecommendation {
    readonly type: 'increase' | 'rebalance' | 'optimize';
    readonly stage: FlowStage;
    readonly recommendation: string;
    readonly expectedImpact: number;
    readonly cost: number;
    readonly priority: number;
}
/**
 * Variability analysis
 */
export interface VariabilityAnalysis {
    readonly coefficientOfVariation: number;
    readonly variabilitySources: VariabilitySource[];
    readonly impactOnPredictability: number;
    readonly reductionOpportunities: VariabilityReduction[];
}
/**
 * Variability source
 */
export interface VariabilitySource {
    readonly source: string;
    readonly contribution: number;
    readonly controllable: boolean;
    readonly mitigation: string[];
}
/**
 * Variability reduction
 */
export interface VariabilityReduction {
    readonly opportunity: string;
    readonly potential_reduction: number;
    readonly effort: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high';
}
/**
 * Bottleneck throughput impact
 */
export interface BottleneckThroughputImpact {
    readonly currentBottlenecks: string[];
    readonly throughputLoss: number;
    readonly recoveryTime: number;
    readonly mitigationStrategies: string[];
}
/**
 * WIP analysis
 */
export interface WIPAnalysis {
    readonly currentWIP: WIPSnapshot;
    readonly wipUtilization: WIPUtilization;
    readonly wipEfficiency: WIPEfficiency;
    readonly wipPredictability: WIPPredictability;
    readonly wipOptimization: WIPOptimization;
}
/**
 * WIP snapshot
 */
export interface WIPSnapshot {
    readonly timestamp: Date;
    readonly byStage: Map<FlowStage, number>;
    readonly byType: Map<string, number>;
    readonly byPriority: Map<string, number>;
    readonly byAge: AgeDistribution;
    readonly blockedItems: number;
    readonly expeditedItems: number;
}
/**
 * Age distribution
 */
export interface AgeDistribution {
    readonly buckets: AgeBucket[];
    readonly averageAge: number;
    readonly medianAge: number;
    readonly oldestItem: number;
}
/**
 * Age bucket
 */
export interface AgeBucket {
    readonly minAge: number;
    readonly maxAge: number;
    readonly count: number;
    readonly percentage: number;
}
/**
 * WIP utilization
 */
export interface WIPUtilization {
    readonly overallUtilization: number;
    readonly byStage: Map<FlowStage, number>;
    readonly utilisationTrend: TrendAnalysis;
    readonly optimalUtilization: number;
    readonly utilizationGap: number;
}
/**
 * WIP efficiency
 */
export interface WIPEfficiency {
    readonly wipTurnover: number;
    readonly wipAge: StatisticalSummary;
    readonly stagnantItems: StagnantItem[];
    readonly flowDebt: number;
}
/**
 * Stagnant item
 */
export interface StagnantItem {
    readonly workItemId: string;
    readonly stage: FlowStage;
    readonly age: number;
    readonly stagnationReason: string;
    readonly recommendedAction: string;
}
/**
 * WIP predictability
 */
export interface WIPPredictability {
    readonly wipVariability: number;
    readonly arrivalRateVariability: number;
    readonly departureRateVariability: number;
    readonly wipForecast: WIPForecast;
}
/**
 * WIP forecast
 */
export interface WIPForecast {
    readonly timeHorizon: number;
    readonly predictedWIP: ForecastPoint[];
    readonly wipGrowthRate: number;
    readonly capacityConstraints: string[];
}
/**
 * WIP optimization
 */
export interface WIPOptimization {
    readonly currentLimits: WIPLimits;
    readonly recommendedLimits: WIPLimits;
    readonly optimizationRationale: string;
    readonly expectedImpact: OptimizationImpact;
}
/**
 * Optimization impact
 */
export interface OptimizationImpact {
    readonly cycleTimeImprovement: number;
    readonly throughputImprovement: number;
    readonly qualityImprovement: number;
    readonly predictabilityImprovement: number;
    readonly confidenceLevel: number;
}
/**
 * Flow efficiency analysis
 */
export interface FlowEfficiencyAnalysis {
    readonly overall: FlowEfficiencyMeasurement;
    readonly byStage: Map<FlowStage, FlowEfficiencyMeasurement>;
    readonly trends: TrendAnalysis;
    readonly benchmarking: BenchmarkingAnalysis;
    readonly improvementOpportunities: ImprovementOpportunity[];
}
/**
 * Flow efficiency measurement
 */
export interface FlowEfficiencyMeasurement {
    readonly efficiency: number;
    readonly touchTime: number;
    readonly waitTime: number;
    readonly processTime: number;
    readonly valueAddTime: number;
    readonly wasteTime: number;
    readonly efficiencyTrend: 'improving' | 'stable' | 'degrading';
}
/**
 * Benchmarking analysis
 */
export interface BenchmarkingAnalysis {
    readonly industryBenchmark: number;
    readonly internalBenchmark: number;
    readonly gap: number;
    readonly ranking: 'top-quartile' | 'above-average' | 'below-average' | 'bottom-quartile';
    readonly improvementPotential: number;
}
/**
 * Improvement opportunity
 */
export interface ImprovementOpportunity {
    readonly opportunityId: string;
    readonly area: string;
    readonly currentState: number;
    readonly targetState: number;
    readonly improvementPotential: number;
    readonly effort: 'low' | 'medium' | 'high' | 'very-high';
    readonly priority: number;
    readonly actions: string[];
}
/**
 * Cumulative flow analysis
 */
export interface CumulativeFlowAnalysis {
    readonly wipTrend: DataPoint[];
    readonly arrivalTrend: DataPoint[];
    readonly departureTrend: DataPoint[];
    readonly throughputTrend: DataPoint[];
    readonly flowBalance: FlowBalance;
    readonly flowStability: FlowStability;
}
/**
 * Data point
 */
export interface DataPoint {
    readonly timestamp: Date;
    readonly value: number;
}
/**
 * Flow balance
 */
export interface FlowBalance {
    readonly inflow: number;
    readonly outflow: number;
    readonly balance: number;
    readonly trend: 'accumulating' | 'balanced' | 'draining';
    readonly balanceProjection: ForecastPoint[];
}
/**
 * Flow stability
 */
export interface FlowStability {
    readonly stabilityScore: number;
    readonly volatility: number;
    readonly disruptions: FlowDisruption[];
    readonly recoveryMetrics: RecoveryMetrics;
}
/**
 * Flow disruption
 */
export interface FlowDisruption {
    readonly timestamp: Date;
    readonly type: string;
    readonly severity: 'minor' | 'moderate' | 'major' | 'critical';
    readonly duration: number;
    readonly impact: DisruptionImpact;
    readonly recovery: RecoveryInfo;
}
/**
 * Disruption impact
 */
export interface DisruptionImpact {
    readonly throughputLoss: number;
    readonly cycleTimeIncrease: number;
    readonly qualityImpact: number;
    readonly customerImpact: string;
}
/**
 * Recovery info
 */
export interface RecoveryInfo {
    readonly recoveryTime: number;
    readonly recoveryStrategy: string;
    readonly effectiveness: number;
    readonly lessonsLearned: string[];
}
/**
 * Recovery metrics
 */
export interface RecoveryMetrics {
    readonly averageRecoveryTime: number;
    readonly recoveryEfficiency: number;
    readonly resilienceScore: number;
    readonly adaptabilityScore: number;
}
/**
 * Flow debt analysis
 */
export interface FlowDebtAnalysis {
    readonly totalFlowDebt: number;
    readonly debtAccumulation: DebtAccumulation;
    readonly debtComposition: DebtComposition;
    readonly debtImpact: DebtImpact;
    readonly debtReduction: DebtReduction;
}
/**
 * Debt accumulation
 */
export interface DebtAccumulation {
    readonly currentRate: number;
    readonly historicalRate: DataPoint[];
    readonly projectedDebt: ForecastPoint[];
    readonly triggers: DebtTrigger[];
}
/**
 * Debt trigger
 */
export interface DebtTrigger {
    readonly trigger: string;
    readonly contribution: number;
    readonly mitigation: string;
}
/**
 * Debt composition
 */
export interface DebtComposition {
    readonly byCategory: Map<string, number>;
    readonly byStage: Map<FlowStage, number>;
    readonly byAge: AgeDistribution;
    readonly criticalDebt: number;
}
/**
 * Debt impact
 */
export interface DebtImpact {
    readonly cycleTimeImpact: number;
    readonly throughputImpact: number;
    readonly qualityImpact: number;
    readonly customerSatisfactionImpact: number;
    readonly teamMoraleImpact: number;
}
/**
 * Debt reduction
 */
export interface DebtReduction {
    readonly reductionPlan: DebtReductionPlan;
    readonly prioritizedDebt: PrioritizedDebt[];
    readonly reductionStrategies: DebtReductionStrategy[];
}
/**
 * Debt reduction plan
 */
export interface DebtReductionPlan {
    readonly targetReduction: number;
    readonly timeframe: number;
    readonly phases: ReductionPhase[];
    readonly resourceRequirements: ResourceRequirement[];
}
/**
 * Prioritized debt
 */
export interface PrioritizedDebt {
    readonly debtId: string;
    readonly amount: number;
    readonly priority: number;
    readonly impact: number;
    readonly effort: number;
    readonly roi: number;
}
/**
 * Debt reduction strategy
 */
export interface DebtReductionStrategy {
    readonly strategy: string;
    readonly applicability: number;
    readonly effectiveness: number;
    readonly cost: number;
    readonly timeframe: number;
}
/**
 * Reduction phase
 */
export interface ReductionPhase {
    readonly phase: string;
    readonly duration: number;
    readonly targetReduction: number;
    readonly activities: string[];
    readonly milestones: string[];
}
/**
 * Resource requirement
 */
export interface ResourceRequirement {
    readonly resource: string;
    readonly quantity: number;
    readonly duration: number;
    readonly cost: number;
}
/**
 * Flow velocity analysis
 */
export interface FlowVelocityAnalysis {
    readonly currentVelocity: VelocityMeasurement;
    readonly velocityTrend: TrendAnalysis;
    readonly velocityPredictability: VelocityPredictability;
    readonly accelerationOpportunities: AccelerationOpportunity[];
}
/**
 * Velocity measurement
 */
export interface VelocityMeasurement {
    readonly itemVelocity: number;
    readonly valueVelocity: number;
    readonly storyPointVelocity: number;
    readonly featureVelocity: number;
    readonly byTeam: Map<string, number>;
}
/**
 * Velocity predictability
 */
export interface VelocityPredictability {
    readonly variability: number;
    readonly reliability: number;
    readonly forecast: VelocityForecast;
    readonly confidenceInterval: ConfidenceInterval;
}
/**
 * Velocity forecast
 */
export interface VelocityForecast {
    readonly timeHorizon: number;
    readonly predictedVelocity: ForecastPoint[];
    readonly seasonalAdjustments: SeasonalPattern[];
    readonly riskFactors: RiskFactor[];
}
/**
 * Risk factor
 */
export interface RiskFactor {
    readonly factor: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
}
/**
 * Acceleration opportunity
 */
export interface AccelerationOpportunity {
    readonly opportunityId: string;
    readonly description: string;
    readonly velocityIncrease: number;
    readonly implementation: ImplementationPlan;
    readonly riskAssessment: RiskAssessment;
}
/**
 * Implementation plan
 */
export interface ImplementationPlan {
    readonly steps: string[];
    readonly duration: number;
    readonly resources: string[];
    readonly cost: number;
    readonly successMetrics: string[];
}
/**
 * Risk assessment
 */
export interface RiskAssessment {
    readonly overallRisk: 'low' | 'medium' | 'high';
    readonly risks: RiskFactor[];
    readonly mitigation: string[];
    readonly contingency: string[];
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    readonly systemPerformance: SystemPerformance;
    readonly processPerformance: ProcessPerformance;
    readonly teamPerformance: TeamPerformance;
    readonly toolPerformance: ToolPerformance;
}
/**
 * System performance
 */
export interface SystemPerformance {
    readonly responseTime: StatisticalSummary;
    readonly uptime: number;
    readonly errorRate: number;
    readonly throughputCapacity: number;
    readonly resourceUtilization: ResourceUtilization;
}
/**
 * Resource utilization
 */
export interface ResourceUtilization {
    readonly cpu: number;
    readonly memory: number;
    readonly network: number;
    readonly storage: number;
    readonly agents: number;
}
/**
 * Process performance
 */
export interface ProcessPerformance {
    readonly processEfficiency: number;
    readonly processMaturity: ProcessMaturity;
    readonly automationLevel: number;
    readonly standardization: number;
    readonly continuousImprovement: ContinuousImprovement;
}
/**
 * Process maturity
 */
export interface ProcessMaturity {
    readonly maturityLevel: 'initial' | 'managed' | 'defined' | 'quantitatively_managed' | 'optimizing';
    readonly maturityScore: number;
    readonly strengths: string[];
    readonly improvements: string[];
    readonly nextLevel: string;
}
/**
 * Continuous improvement
 */
export interface ContinuousImprovement {
    readonly improvementRate: number;
    readonly implementationRate: number;
    readonly impactRealization: number;
    readonly cultureScore: number;
}
/**
 * Team performance
 */
export interface TeamPerformance {
    readonly productivity: ProductivityMetrics;
    readonly collaboration: CollaborationMetrics;
    readonly satisfaction: SatisfactionMetrics;
    readonly development: DevelopmentMetrics;
}
/**
 * Productivity metrics
 */
export interface ProductivityMetrics {
    readonly outputPerAgent: number;
    readonly valuePerAgent: number;
    readonly focusTime: number;
    readonly contextSwitching: number;
    readonly multitaskingLevel: number;
}
/**
 * Collaboration metrics
 */
export interface CollaborationMetrics {
    readonly communicationFrequency: number;
    readonly knowledgeSharing: number;
    readonly decisionSpeed: number;
    readonly consensusBuilding: number;
    readonly conflictResolution: number;
}
/**
 * Satisfaction metrics
 */
export interface SatisfactionMetrics {
    readonly jobSatisfaction: number;
    readonly workLifeBalance: number;
    readonly autonomy: number;
    readonly purpose: number;
    readonly mastery: number;
}
/**
 * Development metrics
 */
export interface DevelopmentMetrics {
    readonly skillGrowth: number;
    readonly learningTime: number;
    readonly mentoring: number;
    readonly careerProgression: number;
}
/**
 * Tool performance
 */
export interface ToolPerformance {
    readonly toolEffectiveness: ToolEffectiveness;
    readonly adoptionRates: Map<string, number>;
    readonly usagePatterns: UsagePattern[];
    readonly integrationHealth: IntegrationHealth;
}
/**
 * Tool effectiveness
 */
export interface ToolEffectiveness {
    readonly productivity_impact: number;
    readonly userSatisfaction: number;
    readonly learningCurve: number;
    readonly maintenanceCost: number;
    readonly roi: number;
}
/**
 * Usage pattern
 */
export interface UsagePattern {
    readonly tool: string;
    readonly usageFrequency: number;
    readonly usageIntensity: number;
    readonly featureUtilization: Map<string, number>;
    readonly userFeedback: string[];
}
/**
 * Integration health
 */
export interface IntegrationHealth {
    readonly integrationCount: number;
    readonly healthScore: number;
    readonly dataFlow: DataFlowMetrics;
    readonly syncQuality: number;
    readonly errorRate: number;
}
/**
 * Data flow metrics
 */
export interface DataFlowMetrics {
    readonly dataVolume: number;
    readonly dataQuality: number;
    readonly latency: number;
    readonly completeness: number;
    readonly consistency: number;
}
/**
 * Quality metrics
 */
export interface QualityMetrics {
    readonly defectMetrics: DefectMetrics;
    readonly testMetrics: TestMetrics;
    readonly reviewMetrics: ReviewMetrics;
    readonly complianceMetrics: ComplianceMetrics;
}
/**
 * Defect metrics
 */
export interface DefectMetrics {
    readonly defectDensity: number;
    readonly defectRate: number;
    readonly escapeRate: number;
    readonly fixTime: StatisticalSummary;
    readonly rootCauseAnalysis: RootCauseAnalysis;
}
/**
 * Root cause analysis
 */
export interface RootCauseAnalysis {
    readonly categories: Map<string, number>;
    readonly trends: Map<string, TrendAnalysis>;
    readonly preventionOpportunities: PreventionOpportunity[];
}
/**
 * Prevention opportunity
 */
export interface PreventionOpportunity {
    readonly opportunity: string;
    readonly impact: number;
    readonly effort: 'low' | 'medium' | 'high';
    readonly cost: number;
    readonly timeframe: number;
}
/**
 * Test metrics
 */
export interface TestMetrics {
    readonly testCoverage: TestCoverage;
    readonly testEffectiveness: TestEffectiveness;
    readonly testAutomation: TestAutomation;
    readonly testPerformance: TestPerformance;
}
/**
 * Test coverage
 */
export interface TestCoverage {
    readonly codeCoverage: number;
    readonly branchCoverage: number;
    readonly pathCoverage: number;
    readonly requirementCoverage: number;
    readonly riskCoverage: number;
}
/**
 * Test effectiveness
 */
export interface TestEffectiveness {
    readonly defectDetectionRate: number;
    readonly falsePositiveRate: number;
    readonly testReliability: number;
    readonly testMaintainability: number;
}
/**
 * Test automation
 */
export interface TestAutomation {
    readonly automationRate: number;
    readonly automationROI: number;
    readonly maintenanceCost: number;
    readonly executionTime: StatisticalSummary;
}
/**
 * Test performance
 */
export interface TestPerformance {
    readonly executionSpeed: number;
    readonly parallelization: number;
    readonly resourceUsage: ResourceUtilization;
    readonly scalability: number;
}
/**
 * Review metrics
 */
export interface ReviewMetrics {
    readonly reviewCoverage: number;
    readonly reviewEffectiveness: ReviewEffectiveness;
    readonly reviewEfficiency: ReviewEfficiency;
    readonly reviewQuality: ReviewQuality;
}
/**
 * Review effectiveness
 */
export interface ReviewEffectiveness {
    readonly defectFindingRate: number;
    readonly improvementSuggestions: number;
    readonly knowledgeTransfer: number;
    readonly standardsCompliance: number;
}
/**
 * Review efficiency
 */
export interface ReviewEfficiency {
    readonly reviewTime: StatisticalSummary;
    readonly preparationTime: StatisticalSummary;
    readonly reworkTime: StatisticalSummary;
    readonly reviewVelocity: number;
}
/**
 * Review quality
 */
export interface ReviewQuality {
    readonly thoroughness: number;
    readonly consistency: number;
    readonly actionability: number;
    readonly timeliness: number;
}
/**
 * Compliance metrics
 */
export interface ComplianceMetrics {
    readonly regulatoryCompliance: RegulatoryCompliance;
    readonly standardsCompliance: StandardsCompliance;
    readonly policyCompliance: PolicyCompliance;
    readonly auditReadiness: AuditReadiness;
}
/**
 * Regulatory compliance
 */
export interface RegulatoryCompliance {
    readonly complianceRate: number;
    readonly violations: ComplianceViolation[];
    readonly remediation: RemediationMetrics;
    readonly monitoring: ComplianceMonitoring;
}
/**
 * Compliance violation
 */
export interface ComplianceViolation {
    readonly violationId: string;
    readonly regulation: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly detectedAt: Date;
    readonly status: 'open' | 'in-progress' | 'resolved';
    readonly remediation: string;
}
/**
 * Remediation metrics
 */
export interface RemediationMetrics {
    readonly remediationTime: StatisticalSummary;
    readonly remediationCost: number;
    readonly recurrenceRate: number;
    readonly preventionEffectiveness: number;
}
/**
 * Compliance monitoring
 */
export interface ComplianceMonitoring {
    readonly monitoringCoverage: number;
    readonly alertResponseTime: StatisticalSummary;
    readonly falsePositiveRate: number;
    readonly detectionAccuracy: number;
}
/**
 * Standards compliance
 */
export interface StandardsCompliance {
    readonly codingStandards: number;
    readonly architecturalStandards: number;
    readonly securityStandards: number;
    readonly qualityStandards: number;
}
/**
 * Policy compliance
 */
export interface PolicyCompliance {
    readonly policyAdherence: number;
    readonly policyViolations: PolicyViolation[];
    readonly policyEffectiveness: number;
    readonly policyUpdates: PolicyUpdate[];
}
/**
 * Policy violation
 */
export interface PolicyViolation {
    readonly policy: string;
    readonly violation: string;
    readonly frequency: number;
    readonly impact: 'low' | 'medium' | 'high';
    readonly trend: 'increasing' | 'stable' | 'decreasing';
}
/**
 * Policy update
 */
export interface PolicyUpdate {
    readonly policy: string;
    readonly changeType: 'addition' | 'modification' | 'removal';
    readonly rationale: string;
    readonly implementationDate: Date;
    readonly adoptionRate: number;
}
/**
 * Audit readiness
 */
export interface AuditReadiness {
    readonly readinessScore: number;
    readonly documentationCompleteness: number;
    readonly processMaturity: number;
    readonly evidenceAvailability: number;
    readonly riskAreas: AuditRiskArea[];
}
/**
 * Audit risk area
 */
export interface AuditRiskArea {
    readonly area: string;
    readonly risk_level: 'low' | 'medium' | 'high';
    readonly gaps: string[];
    readonly remediation: string[];
    readonly timeline: number;
}
/**
 * Predictability metrics
 */
export interface PredictabilityMetrics {
    readonly deliveryPredictability: DeliveryPredictability;
    readonly forecastAccuracy: ForecastAccuracy;
    readonly commitmentReliability: CommitmentReliability;
    readonly planningEffectiveness: PlanningEffectiveness;
}
/**
 * Delivery predictability
 */
export interface DeliveryPredictability {
    readonly onTimeDelivery: number;
    readonly deliveryVariance: StatisticalSummary;
    readonly predictionAccuracy: number;
    readonly factors: PredictabilityFactor[];
}
/**
 * Predictability factor
 */
export interface PredictabilityFactor {
    readonly factor: string;
    readonly impact: number;
    readonly controllable: boolean;
    readonly improvement: string[];
}
/**
 * Forecast accuracy
 */
export interface ForecastAccuracy {
    readonly shortTermAccuracy: number;
    readonly mediumTermAccuracy: number;
    readonly longTermAccuracy: number;
    readonly modelPerformance: ModelPerformance[];
    readonly calibration: CalibrationMetrics;
}
/**
 * Model performance
 */
export interface ModelPerformance {
    readonly model: string;
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly f1Score: number;
    readonly calibrationScore: number;
}
/**
 * Calibration metrics
 */
export interface CalibrationMetrics {
    readonly calibrationError: number;
    readonly overconfidence: number;
    readonly underconfidence: number;
    readonly reliability: number;
}
/**
 * Commitment reliability
 */
export interface CommitmentReliability {
    readonly commitmentMet: number;
    readonly scopeStability: number;
    readonly capacityPrediction: number;
    readonly riskMitigation: number;
}
/**
 * Planning effectiveness
 */
export interface PlanningEffectiveness {
    readonly planAccuracy: number;
    readonly planStability: number;
    readonly planAdaptability: number;
    readonly planUtility: number;
}
/**
 * Customer value metrics
 */
export interface CustomerValueMetrics {
    readonly valueDelivered: ValueDelivered;
    readonly customerSatisfaction: CustomerSatisfactionMetrics;
    readonly valueRealization: ValueRealization;
    readonly marketImpact: MarketImpact;
}
/**
 * Value delivered
 */
export interface ValueDelivered {
    readonly businessValue: number;
    readonly customerValue: number;
    readonly financialImpact: FinancialImpact;
    readonly strategicAlignment: number;
    readonly valuePerItem: number;
}
/**
 * Financial impact
 */
export interface FinancialImpact {
    readonly revenue: number;
    readonly costSavings: number;
    readonly roi: number;
    readonly paybackPeriod: number;
    readonly npv: number;
}
/**
 * Customer satisfaction metrics
 */
export interface CustomerSatisfactionMetrics {
    readonly nps: number;
    readonly csat: number;
    readonly ces: number;
    readonly churnRate: number;
    readonly retentionRate: number;
}
/**
 * Value realization
 */
export interface ValueRealization {
    readonly realizationRate: number;
    readonly timeToValue: StatisticalSummary;
    readonly valueLeakage: ValueLeakage;
    readonly adoptionMetrics: AdoptionMetrics;
}
/**
 * Value leakage
 */
export interface ValueLeakage {
    readonly leakageRate: number;
    readonly leakageSources: LeakageSource[];
    readonly preventionOpportunities: PreventionOpportunity[];
}
/**
 * Leakage source
 */
export interface LeakageSource {
    readonly source: string;
    readonly impact: number;
    readonly frequency: number;
    readonly prevention: string[];
}
/**
 * Adoption metrics
 */
export interface AdoptionMetrics {
    readonly adoptionRate: number;
    readonly usageFrequency: number;
    readonly featureUtilization: Map<string, number>;
    readonly userEngagement: number;
}
/**
 * Market impact
 */
export interface MarketImpact {
    readonly marketShare: number;
    readonly competitiveAdvantage: CompetitiveAdvantage;
    readonly brandImpact: BrandImpact;
    readonly growthMetrics: GrowthMetrics;
}
/**
 * Competitive advantage
 */
export interface CompetitiveAdvantage {
    readonly differentiationScore: number;
    readonly featureParity: number;
    readonly timeToMarketAdvantage: number;
    readonly costAdvantage: number;
}
/**
 * Brand impact
 */
export interface BrandImpact {
    readonly brandPerception: number;
    readonly brandAwareness: number;
    readonly brandLoyalty: number;
    readonly reputationScore: number;
}
/**
 * Growth metrics
 */
export interface GrowthMetrics {
    readonly userGrowth: number;
    readonly revenueGrowth: number;
    readonly marketExpansion: number;
    readonly scalabilityIndex: number;
}
/**
 * Cost metrics
 */
export interface CostMetrics {
    readonly developmentCost: DevelopmentCost;
    readonly operationalCost: OperationalCost;
    readonly qualityCost: QualityCost;
    readonly delayCost: DelayCost;
}
/**
 * Development cost
 */
export interface DevelopmentCost {
    readonly costPerItem: number;
    readonly costPerStoryPoint: number;
    readonly costPerFeature: number;
    readonly resourceCost: ResourceCost;
    readonly efficiencyRatio: number;
}
/**
 * Resource cost
 */
export interface ResourceCost {
    readonly humanCost: number;
    readonly toolCost: number;
    readonly infrastructureCost: number;
    readonly externalCost: number;
    readonly totalCost: number;
}
/**
 * Operational cost
 */
export interface OperationalCost {
    readonly runningCost: number;
    readonly maintenanceCost: number;
    readonly supportCost: number;
    readonly scalingCost: number;
}
/**
 * Quality cost
 */
export interface QualityCost {
    readonly preventionCost: number;
    readonly appraisalCost: number;
    readonly internalFailureCost: number;
    readonly externalFailureCost: number;
    readonly totalQualityCost: number;
}
/**
 * Delay cost
 */
export interface DelayCost {
    readonly opportunityCost: number;
    readonly marketTimingCost: number;
    readonly competitiveCost: number;
    readonly customerImpactCost: number;
    readonly totalDelayCost: number;
}
/**
 * Team health metrics
 */
export interface TeamHealthMetrics {
    readonly morale: MoraleMetrics;
    readonly engagement: EngagementMetrics;
    readonly burnout: BurnoutMetrics;
    readonly retention: RetentionMetrics;
}
/**
 * Morale metrics
 */
export interface MoraleMetrics {
    readonly moraleScore: number;
    readonly confidenceLevel: number;
    readonly optimism: number;
    readonly teamCohesion: number;
}
/**
 * Engagement metrics
 */
export interface EngagementMetrics {
    readonly engagementScore: number;
    readonly participationRate: number;
    readonly initiativeRate: number;
    readonly ownershipLevel: number;
}
/**
 * Burnout metrics
 */
export interface BurnoutMetrics {
    readonly burnoutRisk: number;
    readonly stressLevel: number;
    readonly workloadBalance: number;
    readonly recoveryTime: number;
}
/**
 * Retention metrics
 */
export interface RetentionMetrics {
    readonly retentionRate: number;
    readonly turnoverRisk: number;
    readonly careerSatisfaction: number;
    readonly loyaltyScore: number;
}
/**
 * Technical health metrics
 */
export interface TechnicalHealthMetrics {
    readonly codeHealth: CodeHealth;
    readonly architectureHealth: ArchitectureHealth;
    readonly performanceHealth: PerformanceHealth;
    readonly securityHealth: SecurityHealth;
}
/**
 * Code health
 */
export interface CodeHealth {
    readonly codeQuality: number;
    readonly technicalDebt: TechnicalDebt;
    readonly maintainability: number;
    readonly readability: number;
}
/**
 * Technical debt
 */
export interface TechnicalDebt {
    readonly debtRatio: number;
    readonly debtIndex: number;
    readonly debtTrend: 'increasing' | 'stable' | 'decreasing';
    readonly remediationCost: number;
    readonly paybackTime: number;
}
/**
 * Architecture health
 */
export interface ArchitectureHealth {
    readonly architecturalFitness: number;
    readonly coupling: CouplingMetrics;
    readonly cohesion: CohesionMetrics;
    readonly complexity: ComplexityMetrics;
}
/**
 * Coupling metrics
 */
export interface CouplingMetrics {
    readonly afferentCoupling: number;
    readonly efferentCoupling: number;
    readonly instability: number;
    readonly couplingTrend: 'improving' | 'stable' | 'degrading';
}
/**
 * Cohesion metrics
 */
export interface CohesionMetrics {
    readonly cohesionScore: number;
    readonly functionalCohesion: number;
    readonly cohesionTrend: 'improving' | 'stable' | 'degrading';
}
/**
 * Complexity metrics
 */
export interface ComplexityMetrics {
    readonly cyclomaticComplexity: number;
    readonly cognitiveComplexity: number;
    readonly maintainabilityIndex: number;
    readonly complexityTrend: 'improving' | 'stable' | 'degrading';
}
/**
 * Performance health
 */
export interface PerformanceHealth {
    readonly responseTime: StatisticalSummary;
    readonly throughput: number;
    readonly resourceUtilization: ResourceUtilization;
    readonly scalability: ScalabilityMetrics;
}
/**
 * Scalability metrics
 */
export interface ScalabilityMetrics {
    readonly scalabilityIndex: number;
    readonly maxCapacity: number;
    readonly capacityGrowth: number;
    readonly bottlenecks: string[];
}
/**
 * Security health
 */
export interface SecurityHealth {
    readonly securityScore: number;
    readonly vulnerabilities: VulnerabilityMetrics;
    readonly compliance: SecurityCompliance;
    readonly incidents: SecurityIncidentMetrics;
}
/**
 * Vulnerability metrics
 */
export interface VulnerabilityMetrics {
    readonly totalVulnerabilities: number;
    readonly criticalVulnerabilities: number;
    readonly vulnerabilityTrend: 'improving' | 'stable' | 'degrading';
    readonly remediationTime: StatisticalSummary;
}
/**
 * Security compliance
 */
export interface SecurityCompliance {
    readonly complianceScore: number;
    readonly certifications: string[];
    readonly auditFindings: number;
    readonly remediationProgress: number;
}
/**
 * Security incident metrics
 */
export interface SecurityIncidentMetrics {
    readonly incidentCount: number;
    readonly incidentSeverity: Map<string, number>;
    readonly responseTime: StatisticalSummary;
    readonly resolutionTime: StatisticalSummary;
}
/**
 * Contextual metrics
 */
export interface ContextualMetrics {
    readonly environmentMetrics: EnvironmentMetrics;
    readonly seasonalMetrics: SeasonalMetrics;
    readonly externalFactors: ExternalFactor[];
    readonly businessContext: BusinessContextMetrics;
}
/**
 * Environment metrics
 */
export interface EnvironmentMetrics {
    readonly environment: string;
    readonly stability: number;
    readonly resourceAvailability: number;
    readonly configuration: ConfigurationMetrics;
}
/**
 * Configuration metrics
 */
export interface ConfigurationMetrics {
    readonly configurationDrift: number;
    readonly standardization: number;
    readonly automation: number;
    readonly consistency: number;
}
/**
 * Seasonal metrics
 */
export interface SeasonalMetrics {
    readonly seasonality: number;
    readonly patterns: SeasonalPattern[];
    readonly adjustments: SeasonalAdjustment[];
}
/**
 * Seasonal adjustment
 */
export interface SeasonalAdjustment {
    readonly period: string;
    readonly adjustment: number;
    readonly rationale: string;
}
/**
 * External factor
 */
export interface ExternalFactor {
    readonly factor: string;
    readonly impact: number;
    readonly controllable: boolean;
    readonly monitoring: boolean;
}
/**
 * Business context metrics
 */
export interface BusinessContextMetrics {
    readonly marketConditions: number;
    readonly competitivePressure: number;
    readonly regulatoryChanges: number;
    readonly strategicPriorities: StrategicPriority[];
}
/**
 * Strategic priority
 */
export interface StrategicPriority {
    readonly priority: string;
    readonly weight: number;
    readonly alignment: number;
    readonly impact: number;
}
/**
 * Derived metrics
 */
export interface DerivedMetrics {
    readonly compositeScores: CompositeScore[];
    readonly ratios: MetricRatio[];
    readonly indices: MetricIndex[];
    readonly correlations: MetricCorrelation[];
}
/**
 * Composite score
 */
export interface CompositeScore {
    readonly name: string;
    readonly value: number;
    readonly components: ComponentScore[];
    readonly weights: number[];
    readonly calculation: string;
}
/**
 * Component score
 */
export interface ComponentScore {
    readonly component: string;
    readonly value: number;
    readonly weight: number;
    readonly contribution: number;
}
/**
 * Metric ratio
 */
export interface MetricRatio {
    readonly name: string;
    readonly numerator: string;
    readonly denominator: string;
    readonly value: number;
    readonly benchmark: number;
    readonly interpretation: string;
}
/**
 * Metric index
 */
export interface MetricIndex {
    readonly name: string;
    readonly value: number;
    readonly baseline: number;
    readonly change: number;
    readonly trend: 'up' | 'down' | 'stable';
}
/**
 * Metric correlation
 */
export interface MetricCorrelation {
    readonly metric1: string;
    readonly metric2: string;
    readonly correlation: number;
    readonly significance: number;
    readonly causality: 'none' | 'weak' | 'moderate' | 'strong';
}
/**
 * Performance optimization result
 */
export interface PerformanceOptimizationResult {
    readonly optimizationId: string;
    readonly timestamp: Date;
    readonly currentState: PerformanceState;
    readonly targetState: PerformanceState;
    readonly optimizations: OptimizationRecommendation[];
    readonly abTests: ABTest[];
    readonly implementation: OptimizationImplementation;
    readonly expectedImpact: OptimizationImpact;
    readonly confidence: number;
}
/**
 * Performance state
 */
export interface PerformanceState {
    readonly metrics: ComprehensiveFlowMetrics;
    readonly bottlenecks: string[];
    readonly efficiency: number;
    readonly predictability: number;
    readonly quality: number;
    readonly customerValue: number;
}
/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
    readonly recommendationId: string;
    readonly type: OptimizationType;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly title: string;
    readonly description: string;
    readonly rationale: string;
    readonly targetMetrics: string[];
    readonly implementation: RecommendationImplementation;
    readonly expectedBenefit: OptimizationBenefit;
    readonly risks: OptimizationRisk[];
    readonly prerequisites: string[];
    readonly alternatives: OptimizationAlternative[];
}
/**
 * Optimization type
 */
export declare enum OptimizationType {
    WIP_OPTIMIZATION = "wip-optimization",
    BOTTLENECK_REMOVAL = "bottleneck-removal",
    PROCESS_IMPROVEMENT = "process-improvement",
    RESOURCE_ALLOCATION = "resource-allocation",
    QUALITY_ENHANCEMENT = "quality-enhancement",
    AUTOMATION = "automation",
    STANDARDIZATION = "standardization",
    MEASUREMENT = "measurement"
}
/**
 * Recommendation implementation
 */
export interface RecommendationImplementation {
    readonly approach: 'immediate' | 'phased' | 'pilot' | 'gradual';
    readonly phases: ImplementationPhase[];
    readonly timeline: number;
    readonly resources: ResourceRequirement[];
    readonly dependencies: string[];
    readonly risks: ImplementationRisk[];
}
/**
 * Implementation phase
 */
export interface ImplementationPhase {
    readonly phase: string;
    readonly duration: number;
    readonly activities: string[];
    readonly deliverables: string[];
    readonly success_criteria: string[];
    readonly rollback_plan: string;
}
/**
 * Implementation risk
 */
export interface ImplementationRisk {
    readonly risk: string;
    readonly probability: number;
    readonly impact: 'low' | 'medium' | 'high';
    readonly mitigation: string;
}
/**
 * Optimization benefit
 */
export interface OptimizationBenefit {
    readonly primaryBenefit: string;
    readonly quantifiedBenefits: QuantifiedBenefit[];
    readonly qualitativeBenefits: string[];
    readonly timeframe: number;
    readonly sustainability: number;
}
/**
 * Quantified benefit
 */
export interface QuantifiedBenefit {
    readonly metric: string;
    readonly improvement: number;
    readonly unit: string;
    readonly confidence: number;
    readonly measurement: string;
}
/**
 * Optimization risk
 */
export interface OptimizationRisk {
    readonly risk: string;
    readonly probability: number;
    readonly impact: string;
    readonly severity: 'low' | 'medium' | 'high';
    readonly mitigation: string;
}
/**
 * Optimization alternative
 */
export interface OptimizationAlternative {
    readonly alternative: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly effort: 'low' | 'medium' | 'high';
    readonly risk: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high';
}
/**
 * A/B test configuration
 */
export interface ABTest {
    readonly testId: string;
    readonly name: string;
    readonly hypothesis: string;
    readonly variants: TestVariant[];
    readonly metrics: string[];
    readonly sampleSize: number;
    readonly duration: number;
    readonly significanceLevel: number;
    readonly power: number;
    readonly status: ABTestStatus;
    readonly results?: ABTestResults;
}
/**
 * A/B test status
 */
export declare enum ABTestStatus {
    DESIGNED = "designed",
    RUNNING = "running",
    COMPLETED = "completed",
    STOPPED = "stopped",
    ANALYZED = "analyzed"
}
/**
 * Test variant
 */
export interface TestVariant {
    readonly variantId: string;
    readonly name: string;
    readonly description: string;
    readonly configuration: Record<string, any>;
    readonly trafficAllocation: number;
    readonly expectedImpact: number;
}
/**
 * A/B test results
 */
export interface ABTestResults {
    readonly testId: string;
    readonly duration: number;
    readonly sampleSizes: Map<string, number>;
    readonly results: Map<string, VariantResults>;
    readonly statisticalSignificance: StatisticalSignificance;
    readonly recommendations: TestRecommendation[];
    readonly confidence: number;
}
/**
 * Variant results
 */
export interface VariantResults {
    readonly variantId: string;
    readonly metrics: Map<string, MetricResult>;
    readonly conversionRate: number;
    readonly confidence: ConfidenceInterval;
    readonly sampleSize: number;
}
/**
 * Metric result
 */
export interface MetricResult {
    readonly metric: string;
    readonly value: number;
    readonly standardError: number;
    readonly confidence: ConfidenceInterval;
    readonly improvement: number;
}
/**
 * Statistical significance
 */
export interface StatisticalSignificance {
    readonly significant: boolean;
    readonly pValue: number;
    readonly effectSize: number;
    readonly confidenceLevel: number;
    readonly winner?: string;
}
/**
 * Test recommendation
 */
export interface TestRecommendation {
    readonly recommendation: 'deploy' | 'iterate' | 'abandon';
    readonly rationale: string;
    readonly confidence: number;
    readonly nextSteps: string[];
    readonly risks: string[];
}
/**
 * Optimization implementation
 */
export interface OptimizationImplementation {
    readonly implementation_id: string;
    readonly selectedRecommendations: string[];
    readonly abTests: string[];
    readonly rolloutPlan: RolloutPlan;
    readonly monitoring: OptimizationMonitoring;
    readonly rollback: RollbackStrategy;
}
/**
 * Rollout plan
 */
export interface RolloutPlan {
    readonly strategy: 'big_bang' | 'phased' | 'canary' | 'blue_green';
    readonly phases: RolloutPhase[];
    readonly timeline: number;
    readonly criteria: RolloutCriteria[];
}
/**
 * Rollout phase
 */
export interface RolloutPhase {
    readonly phase: string;
    readonly percentage: number;
    readonly duration: number;
    readonly criteria: string[];
    readonly monitoring: string[];
}
/**
 * Rollout criteria
 */
export interface RolloutCriteria {
    readonly criterion: string;
    readonly threshold: number;
    readonly action: 'continue' | 'pause' | 'rollback';
}
/**
 * Optimization monitoring
 */
export interface OptimizationMonitoring {
    readonly metrics: string[];
    readonly frequency: number;
    readonly alerts: MonitoringAlert[];
    readonly dashboard: string;
}
/**
 * Monitoring alert
 */
export interface MonitoringAlert {
    readonly condition: string;
    readonly threshold: number;
    readonly action: 'notify' | 'pause' | 'rollback';
    readonly recipients: string[];
}
/**
 * Rollback strategy
 */
export interface RollbackStrategy {
    readonly triggers: RollbackTrigger[];
    readonly procedure: string[];
    readonly timeframe: number;
    readonly validation: string[];
}
/**
 * Rollback trigger
 */
export interface RollbackTrigger {
    readonly condition: string;
    readonly threshold: number;
    readonly automatic: boolean;
}
/**
 * Flow forecast
 */
export interface FlowForecast {
    readonly forecastId: string;
    readonly timestamp: Date;
    readonly horizon: number;
    readonly forecasts: MetricForecast[];
    readonly scenarios: ForecastScenario[];
    readonly confidence: number;
    readonly accuracy: number;
}
/**
 * Metric forecast
 */
export interface MetricForecast {
    readonly metric: string;
    readonly predictions: ForecastPoint[];
    readonly trend: TrendForecast;
    readonly seasonality: SeasonalityAnalysis;
    readonly anomalies: AnomalyForecast[];
}
/**
 * Forecast scenario
 */
export interface ForecastScenario {
    readonly scenario: string;
    readonly probability: number;
    readonly assumptions: string[];
    readonly forecasts: MetricForecast[];
    readonly impact: ScenarioImpact;
}
/**
 * Scenario impact
 */
export interface ScenarioImpact {
    readonly primaryImpact: string;
    readonly secondaryImpacts: string[];
    readonly magnitude: number;
    readonly duration: number;
    readonly mitigation: string[];
}
/**
 * Anomaly forecast
 */
export interface AnomalyForecast {
    readonly type: string;
    readonly probability: number;
    readonly timeframe: number;
    readonly impact: AnomalyImpact;
    readonly prevention: string[];
}
/**
 * Anomaly impact
 */
export interface AnomalyImpact {
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly duration: number;
    readonly affectedMetrics: string[];
    readonly businessImpact: string;
}
/**
 * Delivery prediction
 */
export interface DeliveryPrediction {
    readonly predictionId: string;
    readonly workItemId: string;
    readonly predictedDelivery: Date;
    readonly confidence: ConfidenceInterval;
    readonly factors: PredictionFactor[];
    readonly risks: DeliveryRisk[];
    readonly scenarios: DeliveryScenario[];
}
/**
 * Prediction factor
 */
export interface PredictionFactor {
    readonly factor: string;
    readonly impact: number;
    readonly probability: number;
    readonly controllable: boolean;
}
/**
 * Delivery risk
 */
export interface DeliveryRisk {
    readonly risk: string;
    readonly probability: number;
    readonly delay: number;
    readonly mitigation: string;
}
/**
 * Delivery scenario
 */
export interface DeliveryScenario {
    readonly scenario: 'best_case' | 'most_likely' | 'worst_case';
    readonly probability: number;
    readonly delivery_date: Date;
    readonly assumptions: string[];
}
/**
 * Capacity planning analytics
 */
export interface CapacityPlanningAnalytics {
    readonly currentCapacity: CapacitySnapshot;
    readonly demandForecast: DemandForecast;
    readonly capacityGaps: CapacityGap[];
    readonly recommendations: CapacityPlanningRecommendation[];
    readonly scenarios: CapacityScenario[];
}
/**
 * Capacity snapshot
 */
export interface CapacitySnapshot {
    readonly timestamp: Date;
    readonly totalCapacity: number;
    readonly availableCapacity: number;
    readonly utilization: number;
    readonly bySkill: Map<string, number>;
    readonly byTeam: Map<string, number>;
}
/**
 * Demand forecast
 */
export interface DemandForecast {
    readonly timeHorizon: number;
    readonly predictions: DemandPrediction[];
    readonly seasonality: SeasonalDemand[];
    readonly growthRate: number;
}
/**
 * Demand prediction
 */
export interface DemandPrediction {
    readonly timestamp: Date;
    readonly totalDemand: number;
    readonly byType: Map<string, number>;
    readonly byPriority: Map<string, number>;
    readonly confidence: ConfidenceInterval;
}
/**
 * Seasonal demand
 */
export interface SeasonalDemand {
    readonly period: string;
    readonly multiplier: number;
    readonly confidence: number;
}
/**
 * Capacity gap
 */
export interface CapacityGap {
    readonly timeframe: DateRange;
    readonly gapSize: number;
    readonly gapType: 'overall' | 'skill' | 'team';
    readonly impact: CapacityGapImpact;
    readonly solutions: CapacitySolution[];
}
/**
 * Capacity gap impact
 */
export interface CapacityGapImpact {
    readonly delayDays: number;
    readonly affectedItems: number;
    readonly businessImpact: number;
    readonly customerImpact: string;
}
/**
 * Capacity solution
 */
export interface CapacitySolution {
    readonly solution: string;
    readonly cost: number;
    readonly timeframe: number;
    readonly effectiveness: number;
    readonly feasibility: number;
}
/**
 * Capacity planning recommendation
 */
export interface CapacityPlanningRecommendation {
    readonly recommendationId: string;
    readonly type: 'hire' | 'train' | 'reallocate' | 'outsource' | 'optimize';
    readonly description: string;
    readonly urgency: 'low' | 'medium' | 'high' | 'critical';
    readonly cost: number;
    readonly benefit: number;
    readonly roi: number;
    readonly timeline: number;
}
/**
 * Capacity scenario
 */
export interface CapacityScenario {
    readonly scenario: string;
    readonly assumptions: string[];
    readonly capacity: CapacitySnapshot;
    readonly outcomes: ScenarioOutcome[];
    readonly probability: number;
}
/**
 * Scenario outcome
 */
export interface ScenarioOutcome {
    readonly metric: string;
    readonly value: number;
    readonly variance: number;
    readonly impact: string;
}
/**
 * Risk assessment for flow disruption
 */
export interface FlowDisruptionRisk {
    readonly riskId: string;
    readonly category: 'capacity' | 'quality' | 'dependency' | 'external' | 'technical';
    readonly description: string;
    readonly probability: number;
    readonly impact: DisruptionImpact;
    readonly timeframe: number;
    readonly indicators: RiskIndicator[];
    readonly mitigation: RiskMitigation[];
}
/**
 * Risk indicator
 */
export interface RiskIndicator {
    readonly indicator: string;
    readonly currentValue: number;
    readonly threshold: number;
    readonly trend: 'improving' | 'stable' | 'worsening';
}
/**
 * Risk mitigation
 */
export interface RiskMitigation {
    readonly strategy: string;
    readonly effectiveness: number;
    readonly cost: number;
    readonly timeframe: number;
}
/**
 * Advanced Metrics Tracker state
 */
export interface AdvancedMetricsTrackerState {
    readonly currentMetrics: ComprehensiveFlowMetrics;
    readonly historicalMetrics: ComprehensiveFlowMetrics[];
    readonly performanceBaselines: Map<string, PerformanceBaseline>;
    readonly optimizationHistory: PerformanceOptimizationResult[];
    readonly activeABTests: Map<string, ABTest>;
    readonly completedABTests: Map<string, ABTest>;
    readonly forecasts: Map<string, FlowForecast>;
    readonly predictions: Map<string, DeliveryPrediction>;
    readonly alerts: Map<string, MetricAlert>;
    readonly dashboards: Map<string, MetricDashboard>;
    readonly lastCollection: Date;
    readonly lastOptimization: Date;
    readonly lastForecast: Date;
}
/**
 * Metric alert
 */
export interface MetricAlert {
    readonly alertId: string;
    readonly metric: string;
    readonly condition: string;
    readonly severity: 'info' | 'warning' | 'critical';
    readonly message: string;
    readonly timestamp: Date;
    readonly acknowledged: boolean;
    readonly actions: string[];
}
/**
 * Metric dashboard
 */
export interface MetricDashboard {
    readonly dashboardId: string;
    readonly name: string;
    readonly widgets: DashboardWidget[];
    readonly layout: DashboardLayout;
    readonly permissions: DashboardPermissions;
    readonly refreshRate: number;
}
/**
 * Dashboard widget
 */
export interface DashboardWidget {
    readonly widgetId: string;
    readonly type: 'chart' | 'table' | 'metric' | 'gauge' | 'text';
    readonly title: string;
    readonly data: WidgetData;
    readonly configuration: WidgetConfiguration;
    readonly position: WidgetPosition;
}
/**
 * Widget data
 */
export interface WidgetData {
    readonly source: string;
    readonly metrics: string[];
    readonly filters: DataFilter[];
    readonly aggregation: string;
    readonly timeRange: DateRange;
}
/**
 * Data filter
 */
export interface DataFilter {
    readonly field: string;
    readonly operator: string;
    readonly value: any;
}
/**
 * Widget configuration
 */
export interface WidgetConfiguration {
    readonly visualization: VisualizationConfig;
    readonly interaction: InteractionConfig;
    readonly styling: StylingConfig;
}
/**
 * Visualization config
 */
export interface VisualizationConfig {
    readonly chartType: string;
    readonly axes: AxisConfig[];
    readonly series: SeriesConfig[];
    readonly thresholds: ThresholdConfig[];
}
/**
 * Axis config
 */
export interface AxisConfig {
    readonly axis: 'x' | 'y' | 'y2';
    readonly scale: 'linear' | 'log' | 'time';
    readonly min?: number;
    readonly max?: number;
    readonly label: string;
}
/**
 * Series config
 */
export interface SeriesConfig {
    readonly name: string;
    readonly type: 'line' | 'bar' | 'area' | 'scatter';
    readonly color: string;
    readonly axis: 'y' | 'y2';
}
/**
 * Threshold config
 */
export interface ThresholdConfig {
    readonly value: number;
    readonly label: string;
    readonly color: string;
    readonly style: 'solid' | 'dashed' | 'dotted';
}
/**
 * Interaction config
 */
export interface InteractionConfig {
    readonly zoomable: boolean;
    readonly pannable: boolean;
    readonly drilldown: boolean;
    readonly tooltip: TooltipConfig;
}
/**
 * Tooltip config
 */
export interface TooltipConfig {
    readonly enabled: boolean;
    readonly format: string;
    readonly fields: string[];
}
/**
 * Styling config
 */
export interface StylingConfig {
    readonly theme: string;
    readonly colors: string[];
    readonly fonts: FontConfig;
    readonly grid: GridConfig;
}
/**
 * Font config
 */
export interface FontConfig {
    readonly family: string;
    readonly size: number;
    readonly weight: string;
}
/**
 * Grid config
 */
export interface GridConfig {
    readonly show: boolean;
    readonly color: string;
    readonly opacity: number;
}
/**
 * Widget position
 */
export interface WidgetPosition {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly zIndex: number;
}
/**
 * Dashboard layout
 */
export interface DashboardLayout {
    readonly type: 'grid' | 'free';
    readonly columns: number;
    readonly rowHeight: number;
    readonly margin: number;
    readonly responsive: boolean;
}
/**
 * Dashboard permissions
 */
export interface DashboardPermissions {
    readonly owner: string;
    readonly viewers: string[];
    readonly editors: string[];
    readonly public: boolean;
    readonly sharing: SharingSettings;
}
/**
 * Sharing settings
 */
export interface SharingSettings {
    readonly enabled: boolean;
    readonly link: string;
    readonly expiration?: Date;
    readonly permissions: string[];
}
/**
 * Date range
 */
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
}
/**
 * Advanced Metrics Tracker - Comprehensive flow metrics and optimization
 */
export declare class AdvancedMetricsTracker extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly flowManager;
    private readonly bottleneckDetector;
    private readonly config;
    private state;
    private collectionTimer?;
    private optimizationTimer?;
    private forecastTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, flowManager: AdvancedFlowManager, bottleneckDetector: BottleneckDetectionEngine, config?: Partial<AdvancedMetricsTrackerConfig>);
    /**
     * Initialize the Advanced Metrics Tracker
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Advanced Metrics Tracker
     */
    shutdown(): Promise<void>;
    /**
     * Collect comprehensive flow metrics
     */
    collectComprehensiveMetrics(): Promise<ComprehensiveFlowMetrics>;
    /**
     * Track cycle time, lead time, and throughput
     */
    trackFlowTimingMetrics(): Promise<DetailedFlowMetrics>;
    /**
     * Create flow efficiency measurements
     */
    createFlowEfficiencyMeasurements(): Promise<FlowEfficiencyAnalysis>;
    /**
     * Run automated performance optimization
     */
    runPerformanceOptimization(): Promise<PerformanceOptimizationResult>;
    /**
     * Implement optimization recommendation engine
     */
    generateOptimizationRecommendations(currentState: PerformanceState, targetState: PerformanceState): Promise<OptimizationRecommendation[]>;
    /**
     * Create A/B testing for flow improvements
     */
    createOptimizationABTests(recommendations: OptimizationRecommendation[]): Promise<ABTest[]>;
    /**
     * Add optimization impact measurement
     */
    measureOptimizationImpact(optimizationId: string, baseline: PerformanceState, timeframe: number): Promise<OptimizationImpactMeasurement>;
    /**
     * Add flow forecasting and prediction
     */
    generateFlowForecast(): Promise<FlowForecast>;
    /**
     * Implement delivery date prediction
     */
    predictDeliveryDate(workItemId: string): Promise<DeliveryPrediction>;
    /**
     * Create capacity planning analytics
     */
    performCapacityPlanningAnalytics(): Promise<CapacityPlanningAnalytics>;
    /**
     * Add risk assessment for flow disruption
     */
    assessFlowDisruptionRisks(): Promise<FlowDisruptionRisk[]>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private createDefaultBaselines;
    private createDefaultCategories;
    private createDefaultObjectives;
    private startMetricsCollection;
    private startPerformanceOptimization;
    private startPredictiveForecasting;
    private registerEventHandlers;
    private getImpactScore;
    private initializeBaselines;
    private collectDetailedFlowMetrics;
    private collectPerformanceMetrics;
    private collectQualityMetrics;
    private collectPredictabilityMetrics;
    private collectCustomerValueMetrics;
    private collectCostMetrics;
    private collectTeamHealthMetrics;
    private collectTechnicalHealthMetrics;
    private collectContextualMetrics;
    private calculateDerivedMetrics;
    private cleanupOldMetrics;
    private checkMetricAlerts;
    private getHistoricalFlowData;
    private analyzeCycleTime;
    private analyzeLeadTime;
    private analyzeThroughput;
    private analyzeWIP;
    private analyzeFlowEfficiency;
    private analyzeCumulativeFlow;
    private analyzeFlowDebt;
    private analyzeFlowVelocity;
    private analyzeCurrentPerformanceState;
    private defineTargetPerformanceState;
    private identifyPerformanceGaps;
    private generateGapRecommendations;
    private generateBottleneckOptimizations;
    private generateProcessImprovements;
    private prioritizeRecommendations;
    private createABTestForRecommendation;
    private startABTests;
    private completeActiveABTests;
    private forecastThroughput;
    private forecastCycleTime;
    private forecastQualityMetrics;
    private generateForecastScenarios;
    private calculateForecastConfidence;
    private calculateHistoricalForecastAccuracy;
    private getWorkItem;
    private getHistoricalDeliveryData;
    private calculateBaseDeliveryPrediction;
    private identifyDeliveryFactors;
    private assessDeliveryRisks;
    private generateDeliveryScenarios;
    private calculateDeliveryConfidence;
    private captureCapacitySnapshot;
    private generateDemandForecast;
    private identifyCapacityGaps;
    private generateCapacityRecommendations;
    private generateCapacityScenarios;
    private assessCapacityDisruptionRisks;
    private assessQualityDisruptionRisks;
    private assessDependencyDisruptionRisks;
    private assessExternalDisruptionRisks;
    private assessTechnicalDisruptionRisks;
    private calculateFlowEfficiencyMeasurement;
    private calculateStageFlowEfficiency;
    private analyzeFlowEfficiencyTrends;
    private performFlowEfficiencyBenchmarking;
    private identifyFlowImprovementOpportunities;
    private createOptimizationImplementation;
    private calculateOptimizationImpact;
    private calculateOptimizationConfidence;
    private calculateActualImpact;
    private handleFlowStateUpdate;
    private handleBottleneckDetected;
    private handlePerformanceDegradation;
}
export interface OptimizationImpactMeasurement {
    readonly optimizationId: string;
    readonly measurementPeriod: DateRange;
    readonly baselineMetrics: PerformanceState;
    readonly currentMetrics: PerformanceState;
    readonly improvement: OptimizationImpact;
    readonly sustainability: number;
    readonly unintendedConsequences: string[];
}
export default AdvancedMetricsTracker;
export type { AdvancedMetricsTrackerConfig, ComprehensiveFlowMetrics, DetailedFlowMetrics, PerformanceOptimizationResult, OptimizationRecommendation, ABTest, FlowForecast, DeliveryPrediction, CapacityPlanningAnalytics, FlowDisruptionRisk, AdvancedMetricsTrackerState, };
//# sourceMappingURL=metrics-tracker.d.ts.map