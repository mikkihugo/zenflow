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
import type { Logger } from '../../types';
/**
 * Advanced bottleneck analysis configuration
 */
export interface BottleneckAnalysisConfig {
    readonly analysisId: string;
    readonly valueStreamId: string;
    readonly analysisDepth: 'shallow' | 'deep' | 'comprehensive';
    readonly timeWindow: TimeWindow;
    readonly analysisScope: AnalysisScope;
    readonly detectionThresholds: DetectionThresholds;
    readonly rootCauseAnalysis: RootCauseConfig;
}
/**
 * Time window for analysis
 */
export interface TimeWindow {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly granularity: 'hourly' | 'daily' | 'weekly';
    readonly includeSeasonality: boolean;
}
/**
 * Analysis scope configuration
 */
export interface AnalysisScope {
    readonly includeStages: string[];
    readonly excludeStages: string[];
    readonly includeTeams: string[];
    readonly excludeTeams: string[];
    readonly includeWorkTypes: string[];
    readonly minimumVolumeThreshold: number;
}
/**
 * Detection thresholds
 */
export interface DetectionThresholds {
    readonly cycleTimeThreshold: number;
    readonly waitTimeThreshold: number;
    readonly queueLengthThreshold: number;
    readonly utilizationThreshold: number;
    readonly errorRateThreshold: number;
}
/**
 * Root cause analysis configuration
 */
export interface RootCauseConfig {
    readonly enableAutomated: boolean;
    readonly analysisDepth: number;
    readonly confidenceThreshold: number;
    readonly includeExternalFactors: boolean;
    readonly includeDependencies: boolean;
    readonly includeSeasonality: boolean;
}
/**
 * Advanced bottleneck analysis result
 */
export interface AdvancedBottleneckAnalysis {
    readonly analysisId: string;
    readonly valueStreamId: string;
    readonly timestamp: Date;
    readonly analysisDepth: string;
    readonly detectedBottlenecks: DetectedBottleneck[];
    readonly rootCauseAnalysis: RootCauseAnalysis;
    readonly impactAssessment: ImpactAssessment;
    readonly contributingFactors: ContributingFactor[];
    readonly recommendations: BottleneckRecommendation[];
    readonly confidence: number;
}
/**
 * Detected bottleneck
 */
export interface DetectedBottleneck {
    readonly bottleneckId: string;
    readonly stage: string;
    readonly type: BottleneckType;
    readonly severity: BottleneckSeverity;
    readonly cycleTime: CycleTimeMetrics;
    readonly queueMetrics: QueueMetrics;
    readonly utilizationMetrics: UtilizationMetrics;
    readonly errorMetrics: ErrorMetrics;
    readonly trendAnalysis: TrendAnalysis;
    readonly seasonalityPatterns: SeasonalityPattern[];
}
/**
 * Bottleneck types
 */
export declare enum BottleneckType {
    CAPACITY = "capacity",
    SKILL = "skill",
    DEPENDENCY = "dependency",
    PROCESS = "process",
    TOOL = "tool",
    QUALITY = "quality",
    COORDINATION = "coordination",
    EXTERNAL = "external"
}
/**
 * Bottleneck severity levels
 */
export declare enum BottleneckSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Root cause analysis result
 */
export interface RootCauseAnalysis {
    readonly analysisId: string;
    readonly primaryCause: RootCause;
    readonly secondaryCauses: RootCause[];
    readonly causalChain: CausalLink[];
    readonly confidence: number;
    readonly analysisMethod: string;
}
/**
 * Root cause
 */
export interface RootCause {
    readonly causeId: string;
    readonly description: string;
    readonly category: CauseCategory;
    readonly evidence: Evidence[];
    readonly confidence: number;
    readonly impact: CauseImpact;
    readonly addressability: Addressability;
}
/**
 * Cause categories
 */
export declare enum CauseCategory {
    PEOPLE = "people",
    PROCESS = "process",
    TECHNOLOGY = "technology",
    ENVIRONMENT = "environment",
    POLICY = "policy",
    EXTERNAL = "external"
}
/**
 * Contributing factor
 */
export interface ContributingFactor {
    readonly factorId: string;
    readonly description: string;
    readonly type: FactorType;
    readonly weight: number;
    readonly correlation: number;
    readonly frequency: FactorFrequency;
    readonly impact: FactorImpact;
    readonly mitigation: string[];
}
/**
 * Factor types
 */
export declare enum FactorType {
    RESOURCE_CONSTRAINT = "resource_constraint",
    SKILL_GAP = "skill_gap",
    PROCESS_INEFFICIENCY = "process_inefficiency",
    TOOL_LIMITATION = "tool_limitation",
    COMMUNICATION_BREAKDOWN = "communication_breakdown",
    DEPENDENCY_DELAY = "dependency_delay",
    QUALITY_ISSUE = "quality_issue",
    EXTERNAL_DEPENDENCY = "external_dependency"
}
/**
 * Impact assessment
 */
export interface ImpactAssessment {
    readonly assessmentId: string;
    readonly financialImpact: FinancialImpact;
    readonly timeImpact: TimeImpact;
    readonly qualityImpact: QualityImpact;
    readonly customerImpact: CustomerImpact;
    readonly teamImpact: TeamImpact;
    readonly overallSeverity: ImpactSeverity;
}
/**
 * Financial impact
 */
export interface FinancialImpact {
    readonly delayedRevenue: number;
    readonly additionalCosts: number;
    readonly opportunityCost: number;
    readonly totalImpact: number;
    readonly currency: string;
    readonly confidence: number;
}
/**
 * Bottleneck Analysis Service
 */
export declare class BottleneckAnalysisService {
    private readonly logger;
    private analysisResults;
    private rootCauseCache;
    constructor(logger: Logger);
    /**
     * Perform advanced bottleneck analysis
     */
    performAdvancedBottleneckAnalysis(config: BottleneckAnalysisConfig, flowData: any): Promise<AdvancedBottleneckAnalysis>;
    /**
     * Get analysis result
     */
    getAnalysisResult(analysisId: string): AdvancedBottleneckAnalysis | undefined;
    /**
     * Get root cause analysis
     */
    getRootCauseAnalysis(analysisId: string): RootCauseAnalysis | undefined;
    /**
     * Private helper methods
     */
    private detectBottlenecks;
    private assessBottleneckImpact;
}
interface CycleTimeMetrics {
    readonly average: number;
    readonly median: number;
    readonly p95: number;
    readonly variance: number;
    readonly min: number;
    readonly max: number;
}
interface QueueMetrics {
    readonly averageLength: number;
    readonly maxLength: number;
    readonly averageWaitTime: number;
    readonly throughput: number;
}
interface UtilizationMetrics {
    readonly utilization: number;
    readonly efficiency: number;
    readonly activeTime: number;
    readonly idleTime: number;
}
interface ErrorMetrics {
    readonly errorRate: number;
    readonly reworkRate: number;
    readonly defectEscapeeRate: number;
}
interface TrendAnalysis {
    readonly direction: 'increasing' | 'decreasing' | 'stable';
    readonly magnitude: number;
    readonly confidence: number;
    readonly seasonality: boolean;
}
interface SeasonalityPattern {
    readonly patternId: string;
    readonly type: 'daily|weekly|monthly|quarterly;;
    readonly strength: number;
    readonly phase: string;
    readonly description: string;
}
interface Evidence {
    readonly evidenceId: string;
    readonly type: 'statistical' | 'observational' | 'historical';
    readonly description: string;
    readonly confidence: number;
    readonly source: string;
}
interface CauseImpact {
    readonly severity: 'low|medium|high|critical;;
    readonly scope: 'limited' | 'moderate' | 'widespread';
    readonly timeframe: 'short' | 'medium' | 'long';
}
interface Addressability {
    readonly difficulty: 'easy|medium|hard|very_hard;;
    readonly cost: 'low|medium|high|very_high;;
    readonly timeline: 'short|medium|long|very_long;;
}
interface CausalLink {
    readonly fromCause: string;
    readonly toCause: string;
    readonly relationship: 'direct' | 'indirect' | 'contributory';
    readonly strength: number;
}
interface TimeImpact {
    readonly delayHours: number;
    readonly delayDays: number;
    readonly cumulativeDelay: number;
}
interface QualityImpact {
    readonly defectRate: number;
    readonly reworkRate: number;
    readonly customerSatisfactionImpact: number;
}
interface CustomerImpact {
    readonly affectedCustomers: number;
    readonly satisfactionScore: number;
    readonly churnRisk: 'low' | 'medium' | 'high';
}
interface TeamImpact {
    readonly moralImpact: number;
    readonly stressLevel: 'low' | 'medium' | 'high';
    readonly burnoutRisk: 'low' | 'medium' | 'high';
}
declare enum ImpactSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum FactorFrequency {
    RARE = "rare",
    OCCASIONAL = "occasional",
    FREQUENT = "frequent",
    CONSTANT = "constant"
}
interface FactorImpact {
    readonly magnitude: 'low|medium|high|critical;;
    readonly scope: 'local' | 'regional' | 'global';
    readonly duration: 'temporary' | 'persistent' | 'permanent';
    readonly cascading: boolean;
}
interface BottleneckRecommendation {
    readonly recommendationId: string;
    readonly title: string;
    readonly description: string;
    readonly priority: 'low|medium|high|critical;;
    readonly estimatedEffort: 'low' | 'medium' | 'high';
    readonly estimatedImpact: 'low' | 'medium' | 'high';
    readonly implementation: string[];
}
export {};
//# sourceMappingURL=bottleneck-analysis-service.d.ts.map