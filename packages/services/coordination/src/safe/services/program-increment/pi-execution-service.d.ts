export interface PIExecutionMetrics {
    readonly piId: string;
    readonly timestamp: Date;
    readonly overallHealth: 'healthy' | 'at-risk' | 'critical';
    readonly progressPercentage: number;
    readonly burnupData: BurnupDataPoint[];
    readonly velocityTrend: VelocityTrend;
    readonly predictabilityMetrics: PredictabilityMetrics;
    readonly qualityMetrics: QualityMetrics;
    readonly riskBurndown: RiskBurndown;
    readonly dependencyHealth: DependencyHealth;
    readonly teamMetrics: TeamExecutionMetrics[];
    readonly alerts: ExecutionAlert[];
    readonly forecastToCompletion: ExecutionForecast;

}
export interface BurnupDataPoint {
readonly iterationNumber: number;
readonly date: Date;
readonly plannedScope: number;
readonly completedScope: number;
readonly scopeChange: number;
readonly qualityDebt: number;
readonly cumulativeVelocity: number;
readonly teamCount: number;

}
export interface VelocityTrend {
readonly currentVelocity: number;
readonly averageVelocity: number;
readonly velocityHistory: VelocityDataPoint[];
readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
readonly confidence: number;
readonly stabilityIndex: number;

}
export interface VelocityDataPoint {
readonly iteration: number;
readonly date: Date;
readonly velocity: number;
readonly capacity: number;
readonly utilization: number;
readonly qualityScore: number;

}
export interface PredictabilityMetrics {
readonly commitmentReliability: number;
readonly scopeStability: number;
readonly qualityPredictability: number;
readonly riskMitigation: number;
readonly overallPredictability: number;
readonly predictabilityTrend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
readonly benchmarkComparison: BenchmarkComparison;

}
export interface BenchmarkComparison {
readonly industryAverage: number;
readonly organizationAverage: number;
readonly artAverage: number;
readonly relativePerformance: 'above' | ' at' | ' below';
readonly improvementOpportunity: number;

}
export interface QualityMetrics {
readonly defectDensity: number;
readonly testCoverage: number;
readonly codeQuality: number;
readonly technicalDebt: number;
readonly customerSatisfaction: number;
readonly systemReliability: number;
readonly qualityTrend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
readonly qualityGates: QualityGateStatus[];

}
export interface QualityGateStatus {
readonly gateId: string;
readonly name: string;
readonly criteria: QualityGateCriteria[];
readonly status: 'passed| warning| failed' | ' not_evaluated';
readonly lastEvaluated: Date;
readonly nextEvaluation: Date;

}
export interface QualityGateCriteria {
readonly criteriaId: string;
readonly metric: string;
readonly threshold: number;
readonly actual: number;
readonly status: 'passed' | ' warning' | ' failed';
readonly weight: number;

}
export interface RiskBurndown {
readonly totalRisks: number;
readonly openRisks: number;
readonly mitigatedRisks: number;
readonly closedRisks: number;
readonly riskTrend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' worsening';
readonly highRiskItems: RiskItem[];
readonly riskVelocity: number;
readonly projectedBurndown: RiskProjection[];

}
export interface RiskItem {
readonly riskId: string;
readonly description: string;
readonly category: string;
readonly probability: number;
readonly impact: 'low| medium| high' | ' critical';
readonly severity: number;
readonly owner: string;
readonly status: 'open' | ' mitigating' | ' closed';
readonly dueDate: Date;
readonly mitigationProgress: number;

}
export interface RiskProjection {
readonly iteration: number;
readonly projectedOpen: number;
readonly projectedClosed: number;
readonly confidence: number;

}
export interface DependencyHealth {
readonly totalDependencies: number;
readonly resolvedDependencies: number;
readonly blockedDependencies: number;
readonly atRiskDependencies: number;
readonly dependencyHealth: 'healthy| at-risk' | ' critical';
readonly criticalPath: string[];
readonly dependencyBurndown: DependencyBurndownPoint[];
readonly blockageImpact: BlockageImpact[];

}
export interface DependencyBurndownPoint {
readonly iteration: number;
readonly date: Date;
readonly totalDependencies: number;
readonly resolvedDependencies: number;
readonly blockedDependencies: number;

}
export interface BlockageImpact {
readonly dependencyId: string;
readonly blockedFeatures: string[];
readonly blockedTeams: string[];
readonly estimatedDelay: number;
readonly businessImpact: 'low| medium| high' | ' critical';

}
export interface TeamExecutionMetrics {
readonly teamId: string;
readonly teamName: string;
readonly velocity: number;
readonly capacity: number;
readonly utilization: number;
readonly commitmentReliability: number;
readonly qualityScore: number;
readonly satisfactionScore: number;
readonly riskLevel: 'low| medium| high' | ' critical';
readonly completedFeatures: number;
readonly inProgressFeatures: number;
readonly blockedFeatures: number;
readonly technicalDebt: number;
readonly innovationWork: number;

}
export interface ExecutionAlert {
readonly alertId: string;
readonly severity: info | warning | error;

}
export interface ExecutionForecast {
readonly completionProbability: ProbabilityDistribution;
readonly scopeProjection: ScopeProjection;
readonly qualityProjection: QualityProjection;
readonly riskProjection: RiskProjection[];
readonly recommendedActions: ForecastRecommendation[];
readonly confidenceLevel: number;
readonly lastUpdated: Date;

}
export interface ProbabilityDistribution {
readonly p10: Date;
readonly p50: Date;
readonly p90: Date;
readonly mostLikely: Date;
readonly factors: CompletionFactor[];

}
export interface CompletionFactor {
readonly factor: string;
readonly impact: 'positive' | ' negative' | ' neutral';
readonly magnitude: number;
readonly confidence: number;

}
export interface ScopeProjection {
readonly originalScope: number;
readonly currentScope: number;
readonly projectedScope: number;
readonly scopeChangeVelocity: number;
readonly scopeStabilityDate: Date;

}
export interface QualityProjection {
readonly currentQuality: number;
readonly projectedQuality: number;
readonly qualityDebtTrend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' worsening';
readonly qualityRisk: number;

}
export interface ForecastRecommendation {
readonly recommendationId: string;
readonly type: 'scope| capacity| quality| timeline' | ' risk';
readonly title: string;
readonly description: string;
readonly expectedBenefit: string;
readonly effort: 'low' | ' medium' | ' high';
readonly priority: critical | high | medium;

}
export interface PIExecutionConfiguration {
readonly enableRealTimeTracking: boolean;
readonly enablePredictiveAnalytics: boolean;
readonly enableQualityGates: boolean;
readonly enableAutomatedAlerts: boolean;
readonly metricsUpdateInterval: number;
readonly alertThresholds: AlertThresholds;
readonly forecastUpdateFrequency: 'daily' | ' iteration' | ' weekly';
readonly qualityGateFrequency: 'iteration' | ' weekly' | ' continuous';

}
export interface AlertThresholds {
readonly velocityDecline: number;
readonly qualityDrop: number;
readonly scopeIncrease: number;
readonly riskIncrease: number;
readonly dependencyBlockage: number;
readonly teamUtilizationLow: number;
readonly teamUtilizationHigh: number;

}
/**
* PI Execution Service for Program Increment execution tracking and management
*/
export declare class PIExecutionService extends EventBus {
private readonly logger;
private readonly executionTimers;
private brainCoordinator;
constructor(logger: {});
/**
* Initialize the service with dependencies
*/
initialize(): void;
/**
* Track comprehensive PI progress with intelligent analytics
*/
trackPIProgress(piId: this, performanceTracker: any, startTimer: any): any;

}
//# sourceMappingURL=pi-execution-service.d.ts.map