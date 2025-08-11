/**
 * @file Value Stream Optimization Engine - Phase 3, Day 13 (Task 12.3)
 *
 * Implements comprehensive value stream optimization with bottleneck detection and analysis,
 * flow optimization recommendations, value delivery time tracking, and continuous improvement
 * feedback loops. Extends the Value Stream Mapper with advanced optimization capabilities.
 *
 * ARCHITECTURE:
 * - Advanced bottleneck detection and root cause analysis
 * - AI-powered flow optimization recommendations
 * - Continuous improvement automation with kaizen loops
 * - Value delivery time tracking and prediction
 * - Integration with CD Pipeline and multi-level orchestration
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { ContinuousImprovement, DateRange, ExpectedImpact, FlowBottleneck, FlowOptimizationRecommendation, ValueStreamFlowAnalysis } from './value-stream-mapper.ts';
/**
 * Value Stream Optimization Engine configuration
 */
export interface OptimizationEngineConfig {
    readonly enableAdvancedBottleneckAnalysis: boolean;
    readonly enableAIOptimizationRecommendations: boolean;
    readonly enableAutomatedKaizen: boolean;
    readonly enablePredictiveAnalytics: boolean;
    readonly enableContinuousLearning: boolean;
    readonly bottleneckAnalysisDepth: 'shallow' | 'deep' | 'comprehensive';
    readonly optimizationFrequency: number;
    readonly kaizenCycleLength: number;
    readonly predictionHorizon: number;
    readonly learningDataRetentionDays: number;
    readonly minImpactThreshold: number;
    readonly maxRecommendationsPerCycle: number;
}
/**
 * Advanced bottleneck analysis
 */
export interface AdvancedBottleneckAnalysis {
    readonly bottleneckId: string;
    readonly rootCauseAnalysis: RootCauseAnalysis;
    readonly impactAssessment: ImpactAssessment;
    readonly dependencyAnalysis: DependencyAnalysis;
    readonly seasonalityAnalysis: SeasonalityAnalysis;
    readonly predictionModel: BottleneckPredictionModel;
    readonly resolutionComplexity: ResolutionComplexityAnalysis;
    readonly historicalPatterns: HistoricalPatternAnalysis[];
}
/**
 * Root cause analysis
 */
export interface RootCauseAnalysis {
    readonly primaryCause: string;
    readonly contributingFactors: ContributingFactor[];
    readonly systemicIssues: SystemicIssue[];
    readonly humanFactors: HumanFactor[];
    readonly technicalFactors: TechnicalFactor[];
    readonly processFactors: ProcessFactor[];
    readonly confidenceScore: number;
}
/**
 * Contributing factor
 */
export interface ContributingFactor {
    readonly factor: string;
    readonly category: 'technical' | 'process' | 'human' | 'external';
    readonly impactWeight: number;
    readonly frequency: number;
    readonly controlability: 'high' | 'medium' | 'low';
    readonly evidence: string[];
}
/**
 * Impact assessment
 */
export interface ImpactAssessment {
    readonly financialImpact: FinancialImpact;
    readonly customerImpact: CustomerImpactAnalysis;
    readonly teamImpact: TeamImpactAnalysis;
    readonly businessImpact: BusinessImpactAnalysis;
    readonly riskAssessment: RiskAssessment;
    readonly opportunityCost: OpportunityCost;
}
/**
 * Financial impact analysis
 */
export interface FinancialImpact {
    readonly directCosts: number;
    readonly indirectCosts: number;
    readonly revenueLoss: number;
    readonly efficiencyLoss: number;
    readonly totalDailyImpact: number;
    readonly projectedAnnualImpact: number;
    readonly confidenceInterval: {
        readonly low: number;
        readonly high: number;
    };
}
/**
 * Dependency analysis
 */
export interface DependencyAnalysis {
    readonly upstreamDependencies: Dependency[];
    readonly downstreamDependencies: Dependency[];
    readonly criticalPath: string[];
    readonly circularDependencies: CircularDependency[];
    readonly dependencyHealth: 'healthy' | 'at-risk' | 'critical';
    readonly cascadeRisk: number;
}
/**
 * Dependency
 */
export interface Dependency {
    readonly dependencyId: string;
    readonly type: 'hard' | 'soft' | 'preferred';
    readonly strength: number;
    readonly stability: number;
    readonly reliability: number;
    readonly alternatives: Alternative[];
}
/**
 * Seasonality analysis
 */
export interface SeasonalityAnalysis {
    readonly hasSeasonality: boolean;
    readonly seasonalPatterns: SeasonalPattern[];
    readonly cycleLength: number;
    readonly amplitudeFactor: number;
    readonly predictedNextPeak: Date;
    readonly predictedNextTrough: Date;
}
/**
 * Seasonal pattern
 */
export interface SeasonalPattern {
    readonly pattern: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    readonly strength: number;
    readonly phase: number;
    readonly description: string;
}
/**
 * Bottleneck prediction model
 */
export interface BottleneckPredictionModel {
    readonly modelType: 'linear' | 'polynomial' | 'exponential' | 'neural';
    readonly accuracy: number;
    readonly predictionHorizon: number;
    readonly confidenceInterval: number;
    readonly features: PredictionFeature[];
    readonly predictions: BottleneckPrediction[];
    readonly lastTrainedAt: Date;
}
/**
 * Prediction feature
 */
export interface PredictionFeature {
    readonly name: string;
    readonly importance: number;
    readonly type: 'numerical' | 'categorical' | 'temporal';
    readonly correlation: number;
}
/**
 * Bottleneck prediction
 */
export interface BottleneckPrediction {
    readonly date: Date;
    readonly probability: number;
    readonly severity: 'minor' | 'moderate' | 'severe' | 'critical';
    readonly duration: number;
    readonly confidence: number;
    readonly triggeringFactors: string[];
}
/**
 * AI-powered optimization recommendation
 */
export interface AIOptimizationRecommendation extends FlowOptimizationRecommendation {
    readonly aiConfidence: number;
    readonly learningSource: 'historical' | 'simulation' | 'best-practice' | 'external';
    readonly similarCases: SimilarCase[];
    readonly successProbability: number;
    readonly riskFactors: RiskFactor[];
    readonly adaptations: RecommendationAdaptation[];
    readonly feedback: RecommendationFeedback[];
}
/**
 * Similar case
 */
export interface SimilarCase {
    readonly caseId: string;
    readonly similarity: number;
    readonly context: string;
    readonly outcome: 'success' | 'partial' | 'failure';
    readonly actualImpact: ExpectedImpact;
    readonly lessonsLearned: string[];
}
/**
 * Automated Kaizen cycle
 */
export interface AutomatedKaizenCycle {
    readonly cycleId: string;
    readonly valueStreamId: string;
    readonly cycleNumber: number;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly phase: KaizenPhase;
    readonly observations: KaizenObservation[];
    readonly experiments: KaizenExperiment[];
    readonly improvements: ContinuousImprovement[];
    readonly metrics: KaizenMetrics;
    readonly learnings: KaizenLearning[];
    readonly nextCycleRecommendations: string[];
}
/**
 * Kaizen phase
 */
export declare enum KaizenPhase {
    OBSERVE = "observe",
    ORIENT = "orient",
    DECIDE = "decide",
    ACT = "act",
    STUDY = "study"
}
/**
 * Kaizen observation
 */
export interface KaizenObservation {
    readonly id: string;
    readonly timestamp: Date;
    readonly observer: 'system' | 'human';
    readonly category: 'flow' | 'quality' | 'waste' | 'variation' | 'constraint';
    readonly description: string;
    readonly severity: 'low' | 'medium' | 'high';
    readonly frequency: number;
    readonly impact: string;
    readonly evidence: any[];
}
/**
 * Kaizen experiment
 */
export interface KaizenExperiment {
    readonly id: string;
    readonly hypothesis: string;
    readonly intervention: string;
    readonly measurementPlan: MeasurementPlan;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly status: 'planned' | 'running' | 'completed' | 'cancelled';
    readonly results: ExperimentResults;
    readonly decision: 'adopt' | 'adapt' | 'abandon';
    readonly reasoning: string;
}
/**
 * Value delivery prediction
 */
export interface ValueDeliveryPrediction {
    readonly valueStreamId: string;
    readonly predictionDate: Date;
    readonly timeHorizon: number;
    readonly predictedMetrics: PredictedMetrics;
    readonly scenarios: DeliveryScenario[];
    readonly riskFactors: DeliveryRiskFactor[];
    readonly recommendations: PredictiveRecommendation[];
    readonly confidence: number;
    readonly modelAccuracy: number;
}
/**
 * Predicted metrics
 */
export interface PredictedMetrics {
    readonly throughput: MetricPrediction;
    readonly leadTime: MetricPrediction;
    readonly qualityScore: MetricPrediction;
    readonly customerSatisfaction: MetricPrediction;
    readonly flowEfficiency: MetricPrediction;
    readonly costPerDelivery: MetricPrediction;
}
/**
 * Metric prediction
 */
export interface MetricPrediction {
    readonly current: number;
    readonly predicted: number;
    readonly trend: 'improving' | 'stable' | 'declining';
    readonly changeRate: number;
    readonly confidence: number;
    readonly influencingFactors: string[];
}
/**
 * Delivery scenario
 */
export interface DeliveryScenario {
    readonly name: string;
    readonly probability: number;
    readonly description: string;
    readonly conditions: string[];
    readonly outcomes: PredictedMetrics;
    readonly requiredActions: string[];
}
/**
 * Learning system integration
 */
export interface LearningSystem {
    readonly knowledgeBase: KnowledgeBase;
    readonly patterns: LearnedPattern[];
    readonly models: PredictiveModel[];
    readonly feedback: FeedbackLoop[];
    readonly adaptations: SystemAdaptation[];
    readonly performance: LearningPerformance;
}
/**
 * Knowledge base
 */
export interface KnowledgeBase {
    readonly facts: Fact[];
    readonly rules: Rule[];
    readonly cases: Case[];
    readonly bestPractices: BestPractice[];
    readonly antiPatterns: AntiPattern[];
    readonly lastUpdated: Date;
}
/**
 * Optimization Engine state
 */
export interface OptimizationEngineState {
    readonly advancedAnalyses: Map<string, AdvancedBottleneckAnalysis>;
    readonly aiRecommendations: Map<string, AIOptimizationRecommendation[]>;
    readonly kaizenCycles: Map<string, AutomatedKaizenCycle>;
    readonly predictions: Map<string, ValueDeliveryPrediction>;
    readonly learningSystem: LearningSystem;
    readonly optimizationHistory: OptimizationHistory[];
    readonly lastOptimizationRun: Date;
    readonly performanceMetrics: OptimizationPerformanceMetrics;
}
/**
 * Value Stream Optimization Engine - Advanced optimization with AI and continuous learning
 */
export declare class ValueStreamOptimizationEngine extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly config;
    private state;
    private optimizationTimer?;
    private learningTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, config?: Partial<OptimizationEngineConfig>);
    /**
     * Initialize the Optimization Engine
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Optimization Engine
     */
    shutdown(): Promise<void>;
    /**
     * Perform advanced bottleneck analysis
     */
    performAdvancedBottleneckAnalysis(bottleneck: FlowBottleneck, flowAnalysis: ValueStreamFlowAnalysis): Promise<AdvancedBottleneckAnalysis>;
    /**
     * Generate AI-powered flow optimization recommendations
     */
    generateAIOptimizationRecommendations(valueStreamId: string, flowAnalysis: ValueStreamFlowAnalysis, advancedAnalyses: AdvancedBottleneckAnalysis[]): Promise<AIOptimizationRecommendation[]>;
    /**
     * Execute automated Kaizen cycle
     */
    executeAutomatedKaizenCycle(valueStreamId: string): Promise<AutomatedKaizenCycle>;
    /**
     * Predict value delivery times
     */
    predictValueDeliveryTimes(valueStreamId: string): Promise<ValueDeliveryPrediction>;
    /**
     * Execute continuous improvement feedback loop
     */
    executeContinuousImprovementLoop(valueStreamId: string): Promise<void>;
    private initializeState;
    private initializeLearningSystemState;
    private initializePerformanceMetrics;
    private loadPersistedState;
    private persistState;
    private startOptimizationCycle;
    private startLearningCycle;
    private registerEventHandlers;
    private initializeLearningSystem;
    private performRootCauseAnalysis;
    private assessBottleneckImpact;
    private analyzeDependencies;
    private analyzeSeasonality;
    private buildBottleneckPredictionModel;
    private analyzeResolutionComplexity;
    private analyzeHistoricalPatterns;
    private generateBottleneckRecommendations;
    private generateSystemOptimizationRecommendations;
    private optimizeRecommendationsWithAI;
    private getNextCycleNumber;
    private initializeKaizenMetrics;
    private executeObservePhase;
    private executeOrientPhase;
    private executeDecidePhase;
    private executeActPhase;
    private executeStudyPhase;
    private predictValueMetrics;
    private generateDeliveryScenarios;
    private identifyDeliveryRiskFactors;
    private generatePredictiveRecommendations;
    private calculatePredictionConfidence;
    private getModelAccuracy;
    private collectPerformanceData;
    private analyzeImprovementEffectiveness;
    private updateLearningModels;
    private generateLearningBasedImprovements;
    private adaptOptimizationStrategies;
    private planNextOptimizationCycle;
    private runOptimizationCycle;
    private runLearningCycle;
    private handleBottleneckDetection;
    private handleImprovementImplemented;
}
export interface SystemicIssue {
    readonly issue: string;
    readonly scope: 'local' | 'departmental' | 'organizational' | 'industry';
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly changeComplexity: 'simple' | 'complicated' | 'complex' | 'chaotic';
}
export interface HumanFactor {
    readonly factor: string;
    readonly category: 'skill' | 'motivation' | 'process' | 'communication' | 'workload';
    readonly impact: number;
    readonly addressability: 'training' | 'process' | 'organizational' | 'cultural';
}
export interface TechnicalFactor {
    readonly factor: string;
    readonly category: 'infrastructure' | 'tooling' | 'architecture' | 'integration' | 'performance';
    readonly impact: number;
    readonly resolutionApproach: 'upgrade' | 'replace' | 'optimize' | 'redesign';
}
export interface ProcessFactor {
    readonly factor: string;
    readonly category: 'workflow' | 'approval' | 'communication' | 'handoff' | 'feedback';
    readonly impact: number;
    readonly improvementType: 'eliminate' | 'simplify' | 'automate' | 'parallelize';
}
export interface CustomerImpactAnalysis {
    readonly affectedCustomers: number;
    readonly satisfactionImpact: number;
    readonly retentionRisk: number;
    readonly revenueAtRisk: number;
    readonly brandImpact: 'positive' | 'neutral' | 'negative';
}
export interface TeamImpactAnalysis {
    readonly affectedTeams: string[];
    readonly moralImpact: number;
    readonly productivityImpact: number;
    readonly burnoutRisk: number;
    readonly skillGapWidening: boolean;
}
export interface BusinessImpactAnalysis {
    readonly competitiveAdvantage: number;
    readonly marketPosition: 'leader' | 'follower' | 'laggard';
    readonly innovationCapacity: number;
    readonly strategicAlignment: number;
}
export interface RiskAssessment {
    readonly operationalRisk: number;
    readonly financialRisk: number;
    readonly reputationalRisk: number;
    readonly complianceRisk: number;
    readonly overallRisk: number;
}
export interface OpportunityCost {
    readonly missedOpportunities: string[];
    readonly delayedInnovation: number;
    readonly competitorAdvantage: string[];
    readonly marketShareLoss: number;
}
export interface CircularDependency {
    readonly cycle: string[];
    readonly strength: number;
    readonly breakability: 'easy' | 'medium' | 'hard' | 'impossible';
    readonly recommendedBreakPoint: string;
}
export interface Alternative {
    readonly name: string;
    readonly viability: number;
    readonly cost: number;
    readonly timeToImplement: number;
    readonly risks: string[];
}
export interface RiskFactor {
    readonly risk: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
    readonly contingency: string;
}
export interface RecommendationAdaptation {
    readonly originalRecommendation: string;
    readonly adaptation: string;
    readonly reason: string;
    readonly confidence: number;
}
export interface RecommendationFeedback {
    readonly implementationId: string;
    readonly outcome: 'exceeded' | 'met' | 'partial' | 'failed';
    readonly actualImpact: ExpectedImpact;
    readonly lessons: string[];
    readonly improvements: string[];
}
export interface MeasurementPlan {
    readonly metrics: string[];
    readonly baseline: Record<string, number>;
    readonly targets: Record<string, number>;
    readonly measurementFrequency: 'continuous' | 'daily' | 'weekly';
    readonly dataCollection: string[];
}
export interface ExperimentResults {
    readonly metrics: Record<string, number>;
    readonly statisticalSignificance: number;
    readonly effectSize: number;
    readonly confidence: number;
    readonly observations: string[];
}
export interface DeliveryRiskFactor {
    readonly factor: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
    readonly earlyWarningSignals: string[];
}
export interface PredictiveRecommendation {
    readonly recommendation: string;
    readonly targetRisk: string;
    readonly expectedBenefit: number;
    readonly implementation: string;
    readonly timeline: number;
}
export interface KaizenMetrics {
    readonly baselineMetrics: Record<string, number>;
    readonly currentMetrics: Record<string, number>;
    readonly targetMetrics: Record<string, number>;
    readonly improvement: Record<string, number>;
}
export interface KaizenLearning {
    readonly insight: string;
    readonly evidence: string[];
    readonly applicability: 'specific' | 'general';
    readonly confidence: number;
}
export interface ResolutionComplexityAnalysis {
    readonly complexity: 'simple' | 'complicated' | 'complex' | 'chaotic';
    readonly requiredExpertise: string[];
    readonly estimatedEffort: number;
    readonly riskOfFailure: number;
    readonly successFactors: string[];
}
export interface HistoricalPatternAnalysis {
    readonly pattern: string;
    readonly frequency: number;
    readonly seasonality: boolean;
    readonly triggers: string[];
    readonly resolutions: string[];
    readonly lessons: string[];
}
export interface OptimizationHistory {
    readonly timestamp: Date;
    readonly valueStreamId: string;
    readonly recommendationsGenerated: number;
    readonly recommendationsImplemented: number;
    readonly measuredImpact: any;
    readonly lessons: string[];
}
export interface OptimizationPerformanceMetrics {
    readonly recommendationsGenerated: number;
    readonly recommendationsImplemented: number;
    readonly averageImplementationTime: number;
    readonly averageImpactRealized: number;
    readonly optimizationCycles: number;
    readonly learningCycles: number;
    readonly predictionAccuracy: number;
    readonly userSatisfaction: number;
}
export interface Fact {
    readonly statement: string;
    readonly confidence: number;
    readonly source: string;
    readonly validityPeriod: DateRange;
}
export interface Rule {
    readonly condition: string;
    readonly action: string;
    readonly confidence: number;
    readonly applicability: string[];
}
export interface Case {
    readonly situation: string;
    readonly solution: string;
    readonly outcome: string;
    readonly similarity: (otherCase: Case) => number;
}
export interface BestPractice {
    readonly practice: string;
    readonly domain: string;
    readonly effectiveness: number;
    readonly applicabilityConditions: string[];
}
export interface AntiPattern {
    readonly pattern: string;
    readonly warning: string;
    readonly consequences: string[];
    readonly alternatives: string[];
}
export interface LearnedPattern {
    readonly pattern: string;
    readonly frequency: number;
    readonly confidence: number;
    readonly context: string[];
}
export interface PredictiveModel {
    readonly name: string;
    readonly type: string;
    readonly accuracy: number;
    readonly features: string[];
    readonly lastTrained: Date;
}
export interface FeedbackLoop {
    readonly input: string;
    readonly output: string;
    readonly delay: number;
    readonly strength: number;
}
export interface SystemAdaptation {
    readonly adaptation: string;
    readonly trigger: string;
    readonly effectiveness: number;
    readonly timestamp: Date;
}
export interface LearningPerformance {
    readonly accuracyTrend: 'improving' | 'stable' | 'degrading';
    readonly learningRate: number;
    readonly adaptationRate: number;
    readonly predictionAccuracy: number;
    readonly recommendationEffectiveness: number;
}
export default ValueStreamOptimizationEngine;
export type { OptimizationEngineConfig, AdvancedBottleneckAnalysis, AIOptimizationRecommendation, AutomatedKaizenCycle, ValueDeliveryPrediction, OptimizationEngineState, };
//# sourceMappingURL=value-stream-optimization-engine.d.ts.map