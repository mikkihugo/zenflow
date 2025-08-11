/**
 * @file Advanced Flow Manager - Phase 4, Day 17 (Task 16.1-16.3)
 *
 * Implements intelligent Kanban flow management with adaptive WIP limits,
 * machine learning-based optimization, and real-time flow state monitoring.
 * Provides intelligent continuous flow with adaptive optimization based on
 * performance data and bottleneck detection.
 *
 * ARCHITECTURE:
 * - Intelligent WIP limit calculation and adjustment
 * - Machine learning-powered flow optimization
 * - Real-time flow state tracking and visualization
 * - Flow health indicators and predictive analytics
 * - Dynamic adaptation based on performance metrics
 * - Integration with multi-level orchestration
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { MultiLevelOrchestrationManager } from '../orchestration/multi-level-orchestration-manager.ts';
import type { PortfolioOrchestrator } from '../orchestration/portfolio-orchestrator.ts';
import type { ProgramOrchestrator } from '../orchestration/program-orchestrator.ts';
import type { SwarmExecutionOrchestrator } from '../orchestration/swarm-execution-orchestrator.ts';
/**
 * Advanced Flow Manager configuration
 */
export interface AdvancedFlowManagerConfig {
    readonly enableIntelligentWIP: boolean;
    readonly enableMachineLearning: boolean;
    readonly enableRealTimeMonitoring: boolean;
    readonly enablePredictiveAnalytics: boolean;
    readonly enableAdaptiveOptimization: boolean;
    readonly enableFlowVisualization: boolean;
    readonly wipCalculationInterval: number;
    readonly flowStateUpdateInterval: number;
    readonly optimizationAnalysisInterval: number;
    readonly mlModelRetrainingInterval: number;
    readonly maxConcurrentFlows: number;
    readonly defaultWIPLimits: WIPLimits;
    readonly performanceThresholds: PerformanceThreshold[];
    readonly adaptationRate: number;
    readonly mlModelPath?: string;
    readonly visualizationRefreshRate: number;
}
/**
 * WIP (Work In Progress) limits configuration
 */
export interface WIPLimits {
    readonly backlog: number;
    readonly analysis: number;
    readonly development: number;
    readonly testing: number;
    readonly review: number;
    readonly deployment: number;
    readonly done: number;
    readonly blocked: number;
    readonly expedite: number;
    readonly total: number;
}
/**
 * Intelligent WIP limits with optimization
 */
export interface IntelligentWIPLimits {
    readonly current: WIPLimits;
    readonly optimal: WIPLimits;
    readonly historical: WIPLimits[];
    readonly adaptationRate: number;
    readonly optimizationTriggers: FlowTrigger[];
    readonly performanceThresholds: PerformanceThreshold[];
    readonly confidence: number;
    readonly lastCalculation: Date;
    readonly nextCalculation: Date;
}
/**
 * Flow trigger for optimization
 */
export interface FlowTrigger {
    readonly triggerId: string;
    readonly name: string;
    readonly condition: TriggerCondition;
    readonly action: TriggerAction;
    readonly enabled: boolean;
    readonly priority: number;
    readonly cooldownPeriod: number;
    readonly lastTriggered?: Date;
}
/**
 * Trigger condition
 */
export interface TriggerCondition {
    readonly type: 'metric' | 'threshold' | 'trend' | 'anomaly' | 'time' | 'composite';
    readonly metric?: string;
    readonly operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq';
    readonly threshold?: number;
    readonly timeWindow?: number;
    readonly trendDirection?: 'up' | 'down' | 'flat';
    readonly anomalyType?: 'spike' | 'drop' | 'pattern' | 'outlier';
    readonly compositeConditions?: TriggerCondition[];
    readonly compositeLogic?: 'and' | 'or' | 'not';
}
/**
 * Trigger action
 */
export interface TriggerAction {
    readonly type: 'adjust-wip' | 'rebalance' | 'alert' | 'escalate' | 'optimize' | 'analyze';
    readonly parameters: Record<string, any>;
    readonly automatic: boolean;
    readonly approvalRequired: boolean;
    readonly rollbackConditions?: TriggerCondition[];
}
/**
 * Performance threshold
 */
export interface PerformanceThreshold {
    readonly metric: string;
    readonly target: number;
    readonly warning: number;
    readonly critical: number;
    readonly unit: string;
    readonly direction: 'higher-better' | 'lower-better';
    readonly timeWindow: number;
}
/**
 * Flow state representation
 */
export interface FlowState {
    readonly stateId: string;
    readonly timestamp: Date;
    readonly workItems: FlowWorkItem[];
    readonly wipLimits: WIPLimits;
    readonly currentWIP: WIPUsage;
    readonly flowMetrics: FlowMetrics;
    readonly bottlenecks: FlowBottleneck[];
    readonly healthIndicators: FlowHealthIndicator[];
    readonly predictiveInsights: PredictiveInsight[];
    readonly recommendations: FlowRecommendation[];
}
/**
 * Flow work item
 */
export interface FlowWorkItem {
    readonly itemId: string;
    readonly type: 'epic' | 'feature' | 'story' | 'task' | 'bug' | 'spike' | 'enabler';
    readonly priority: 'low' | 'medium' | 'high' | 'critical' | 'expedite';
    readonly status: FlowItemStatus;
    readonly stage: FlowStage;
    readonly entryTime: Date;
    readonly stageEntryTime: Date;
    readonly estimatedEffort: number;
    readonly actualEffort?: number;
    readonly cycleTime?: number;
    readonly leadTime?: number;
    readonly blockers: FlowBlocker[];
    readonly dependencies: string[];
    readonly assignedAgents: string[];
    readonly tags: string[];
    readonly metadata: Record<string, any>;
}
/**
 * Flow item status
 */
export declare enum FlowItemStatus {
    NEW = "new",
    ACTIVE = "active",
    BLOCKED = "blocked",
    WAITING = "waiting",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPEDITED = "expedited"
}
/**
 * Flow stage
 */
export declare enum FlowStage {
    BACKLOG = "backlog",
    ANALYSIS = "analysis",
    DEVELOPMENT = "development",
    TESTING = "testing",
    REVIEW = "review",
    DEPLOYMENT = "deployment",
    DONE = "done"
}
/**
 * Flow blocker
 */
export interface FlowBlocker {
    readonly blockerId: string;
    readonly type: 'dependency' | 'resource' | 'decision' | 'technical' | 'external' | 'process';
    readonly description: string;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly blockedSince: Date;
    readonly estimatedResolution?: Date;
    readonly owner?: string;
    readonly resolutionActions: string[];
    readonly escalated: boolean;
}
/**
 * WIP usage tracking
 */
export interface WIPUsage {
    readonly backlog: number;
    readonly analysis: number;
    readonly development: number;
    readonly testing: number;
    readonly review: number;
    readonly deployment: number;
    readonly done: number;
    readonly blocked: number;
    readonly expedite: number;
    readonly total: number;
    readonly utilizationRate: number;
    readonly violations: WIPViolation[];
}
/**
 * WIP violation
 */
export interface WIPViolation {
    readonly violationId: string;
    readonly stage: FlowStage;
    readonly limit: number;
    readonly current: number;
    readonly severity: 'minor' | 'major' | 'critical';
    readonly duration: number;
    readonly impact: string;
    readonly recommendedActions: string[];
    readonly autoResolution?: boolean;
}
/**
 * Flow metrics
 */
export interface FlowMetrics {
    readonly cycleTime: CycleTimeMetrics;
    readonly leadTime: LeadTimeMetrics;
    readonly throughput: ThroughputMetrics;
    readonly flowEfficiency: FlowEfficiencyMetrics;
    readonly cumulative: CumulativeFlowMetrics;
    readonly predictability: PredictabilityMetrics;
    readonly quality: QualityMetrics;
    readonly cost: CostMetrics;
    readonly customer: CustomerValueMetrics;
}
/**
 * Cycle time metrics
 */
export interface CycleTimeMetrics {
    readonly average: number;
    readonly median: number;
    readonly p85: number;
    readonly p95: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly standardDeviation: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly byStage: Record<FlowStage, number>;
    readonly byType: Record<string, number>;
    readonly byPriority: Record<string, number>;
}
/**
 * Lead time metrics
 */
export interface LeadTimeMetrics {
    readonly average: number;
    readonly median: number;
    readonly p85: number;
    readonly p95: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly standardDeviation: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly customerLeadTime: number;
    readonly systemLeadTime: number;
}
/**
 * Throughput metrics
 */
export interface ThroughputMetrics {
    readonly itemsPerDay: number;
    readonly itemsPerWeek: number;
    readonly itemsPerMonth: number;
    readonly valuePerDay: number;
    readonly valuePerWeek: number;
    readonly valuePerMonth: number;
    readonly trend: 'increasing' | 'stable' | 'decreasing';
    readonly variability: number;
    readonly capacity: number;
    readonly utilization: number;
}
/**
 * Flow efficiency metrics
 */
export interface FlowEfficiencyMetrics {
    readonly overall: number;
    readonly byStage: Record<FlowStage, number>;
    readonly touchTime: number;
    readonly waitTime: number;
    readonly processTime: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly benchmark: number;
}
/**
 * Cumulative flow metrics
 */
export interface CumulativeFlowMetrics {
    readonly wipTrend: number[];
    readonly throughputTrend: number[];
    readonly arrivalRate: number;
    readonly departureRate: number;
    readonly wipGrowthRate: number;
    readonly flowDebt: number;
    readonly flowBalance: number;
}
/**
 * Predictability metrics
 */
export interface PredictabilityMetrics {
    readonly deliveryPredictability: number;
    readonly cyclePredictability: number;
    readonly throughputPredictability: number;
    readonly commitmentReliability: number;
    readonly forecastAccuracy: number;
    readonly varianceExplanation: number;
}
/**
 * Quality metrics
 */
export interface QualityMetrics {
    readonly defectRate: number;
    readonly reworkRate: number;
    readonly firstPassYield: number;
    readonly qualityDebt: number;
    readonly escapeDefects: number;
    readonly qualityTrend: 'improving' | 'stable' | 'degrading';
}
/**
 * Cost metrics
 */
export interface CostMetrics {
    readonly costPerItem: number;
    readonly costPerValue: number;
    readonly delayOfWorkCost: number;
    readonly processingCost: number;
    readonly coordinationCost: number;
    readonly failureCost: number;
    readonly opportunityCost: number;
}
/**
 * Customer value metrics
 */
export interface CustomerValueMetrics {
    readonly valueDelivered: number;
    readonly valuePerItem: number;
    readonly customerSatisfaction: number;
    readonly timeToValue: number;
    readonly valueRealizationRate: number;
    readonly featureUtilization: number;
}
/**
 * Flow bottleneck
 */
export interface FlowBottleneck {
    readonly bottleneckId: string;
    readonly stage: FlowStage;
    readonly type: 'capacity' | 'dependency' | 'quality' | 'process' | 'resource' | 'external';
    readonly severity: 'minor' | 'moderate' | 'major' | 'critical';
    readonly impact: BottleneckImpact;
    readonly duration: number;
    readonly affectedItems: string[];
    readonly rootCause: string;
    readonly resolutionStrategies: ResolutionStrategy[];
    readonly autoResolvable: boolean;
    readonly estimatedResolutionTime: number;
}
/**
 * Bottleneck impact
 */
export interface BottleneckImpact {
    readonly cycleTimeIncrease: number;
    readonly throughputReduction: number;
    readonly leadTimeIncrease: number;
    readonly qualityImpact: number;
    readonly costIncrease: number;
    readonly customerImpact: 'low' | 'medium' | 'high' | 'critical';
    readonly businessRisk: number;
}
/**
 * Resolution strategy
 */
export interface ResolutionStrategy {
    readonly strategyId: string;
    readonly description: string;
    readonly effort: 'low' | 'medium' | 'high' | 'very-high';
    readonly timeframe: number;
    readonly cost: number;
    readonly effectiveness: number;
    readonly riskLevel: 'low' | 'medium' | 'high';
    readonly prerequisites: string[];
    readonly implementation: ImplementationPlan;
}
/**
 * Implementation plan
 */
export interface ImplementationPlan {
    readonly steps: ImplementationStep[];
    readonly resources: string[];
    readonly timeline: number;
    readonly dependencies: string[];
    readonly successCriteria: string[];
    readonly rollbackPlan: string[];
}
/**
 * Implementation step
 */
export interface ImplementationStep {
    readonly stepId: string;
    readonly description: string;
    readonly duration: number;
    readonly owner: string;
    readonly dependencies: string[];
    readonly deliverables: string[];
    readonly validationCriteria: string[];
}
/**
 * Flow health indicator
 */
export interface FlowHealthIndicator {
    readonly indicatorId: string;
    readonly name: string;
    readonly category: 'flow' | 'quality' | 'predictability' | 'value' | 'cost' | 'risk';
    readonly value: number;
    readonly target: number;
    readonly threshold: number;
    readonly status: 'healthy' | 'warning' | 'critical';
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly lastUpdated: Date;
    readonly description: string;
    readonly actionRequired: boolean;
}
/**
 * Predictive insight
 */
export interface PredictiveInsight {
    readonly insightId: string;
    readonly type: 'forecast' | 'anomaly' | 'optimization' | 'risk' | 'opportunity';
    readonly category: 'throughput' | 'quality' | 'delivery' | 'cost' | 'capacity';
    readonly description: string;
    readonly confidence: number;
    readonly timeframe: number;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly recommendation: string;
    readonly dataPoints: PredictiveDataPoint[];
    readonly modelUsed: string;
    readonly generatedAt: Date;
}
/**
 * Predictive data point
 */
export interface PredictiveDataPoint {
    readonly timestamp: Date;
    readonly metric: string;
    readonly predictedValue: number;
    readonly confidenceInterval: {
        readonly lower: number;
        readonly upper: number;
    };
    readonly actualValue?: number;
}
/**
 * Flow recommendation
 */
export interface FlowRecommendation {
    readonly recommendationId: string;
    readonly type: 'wip-adjustment' | 'rebalancing' | 'optimization' | 'process-improvement';
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly title: string;
    readonly description: string;
    readonly rationale: string;
    readonly expectedBenefit: ExpectedBenefit;
    readonly implementation: RecommendationImplementation;
    readonly risks: string[];
    readonly alternatives: string[];
    readonly validUntil?: Date;
    readonly confidence: number;
}
/**
 * Expected benefit
 */
export interface ExpectedBenefit {
    readonly cycleTimeReduction: number;
    readonly throughputIncrease: number;
    readonly qualityImprovement: number;
    readonly costReduction: number;
    readonly customerValueIncrease: number;
    readonly riskReduction: number;
    readonly confidenceLevel: number;
}
/**
 * Recommendation implementation
 */
export interface RecommendationImplementation {
    readonly effort: 'minimal' | 'low' | 'medium' | 'high' | 'extensive';
    readonly timeframe: number;
    readonly resources: string[];
    readonly steps: string[];
    readonly successMetrics: string[];
    readonly validationPlan: string;
    readonly rollbackPlan: string;
}
/**
 * Machine learning model configuration
 */
export interface MLModelConfig {
    readonly modelType: 'regression' | 'classification' | 'timeseries' | 'clustering' | 'neural';
    readonly features: string[];
    readonly target: string;
    readonly hyperparameters: Record<string, any>;
    readonly trainingData: MLTrainingData;
    readonly validationSplit: number;
    readonly crossValidation: number;
    readonly performanceMetrics: string[];
}
/**
 * Machine learning training data
 */
export interface MLTrainingData {
    readonly dataPoints: number;
    readonly timeRange: DateRange;
    readonly features: MLFeature[];
    readonly labels: MLLabel[];
    readonly qualityScore: number;
    readonly lastUpdated: Date;
}
/**
 * ML feature
 */
export interface MLFeature {
    readonly name: string;
    readonly type: 'numerical' | 'categorical' | 'temporal' | 'text';
    readonly importance: number;
    readonly correlation: number;
    readonly missing: number;
    readonly outliers: number;
}
/**
 * ML label
 */
export interface MLLabel {
    readonly name: string;
    readonly type: 'continuous' | 'discrete' | 'binary' | 'multiclass';
    readonly distribution: Record<string, number>;
    readonly balance: number;
}
/**
 * Date range
 */
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
}
/**
 * Advanced Flow Manager state
 */
export interface AdvancedFlowManagerState {
    readonly currentFlowState: FlowState;
    readonly flowHistory: FlowState[];
    readonly wipLimits: IntelligentWIPLimits;
    readonly flowTriggers: Map<string, FlowTrigger>;
    readonly performanceThresholds: Map<string, PerformanceThreshold>;
    readonly mlModels: Map<string, MLModelConfig>;
    readonly activeRecommendations: Map<string, FlowRecommendation>;
    readonly historicalMetrics: FlowMetrics[];
    readonly optimizationHistory: OptimizationAction[];
    readonly lastOptimization: Date;
    readonly lastMLTraining: Date;
}
/**
 * Optimization action
 */
export interface OptimizationAction {
    readonly actionId: string;
    readonly timestamp: Date;
    readonly type: 'wip-adjustment' | 'rebalancing' | 'process-change' | 'resource-reallocation';
    readonly description: string;
    readonly parameters: Record<string, any>;
    readonly trigger: string;
    readonly expectedImpact: ExpectedBenefit;
    readonly actualImpact?: ActualBenefit;
    readonly success: boolean;
    readonly rollbackRequired: boolean;
}
/**
 * Actual benefit (for validation)
 */
export interface ActualBenefit {
    readonly cycleTimeChange: number;
    readonly throughputChange: number;
    readonly qualityChange: number;
    readonly costChange: number;
    readonly customerValueChange: number;
    readonly timeToRealize: number;
    readonly sustainabilityScore: number;
}
/**
 * Advanced Flow Manager - Intelligent Kanban flow with ML optimization
 */
export declare class AdvancedFlowManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly multilevelOrchestrator;
    private readonly portfolioOrchestrator;
    private readonly programOrchestrator;
    private readonly swarmOrchestrator;
    private readonly config;
    private state;
    private wipCalculationTimer?;
    private flowStateTimer?;
    private optimizationTimer?;
    private mlTrainingTimer?;
    private visualizationTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, multilevelOrchestrator: MultiLevelOrchestrationManager, portfolioOrchestrator: PortfolioOrchestrator, programOrchestrator: ProgramOrchestrator, swarmOrchestrator: SwarmExecutionOrchestrator, config?: Partial<AdvancedFlowManagerConfig>);
    /**
     * Initialize the Advanced Flow Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Advanced Flow Manager
     */
    shutdown(): Promise<void>;
    /**
     * Calculate intelligent WIP limits based on performance data
     */
    calculateIntelligentWIPLimits(): Promise<IntelligentWIPLimits>;
    /**
     * Apply adaptive WIP adjustments based on performance
     */
    applyWIPAdjustments(wipLimits: IntelligentWIPLimits): Promise<void>;
    /**
     * Detect and respond to WIP violations
     */
    detectWIPViolations(): Promise<WIPViolation[]>;
    /**
     * Update real-time flow state
     */
    updateFlowState(): Promise<FlowState>;
    /**
     * Generate flow health indicators
     */
    calculateFlowHealthIndicators(): Promise<FlowHealthIndicator[]>;
    /**
     * Generate predictive insights using ML models
     */
    generatePredictiveInsights(): Promise<PredictiveInsight[]>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private createDefaultThresholds;
    private startWIPCalculation;
    private startFlowStateMonitoring;
    private startOptimizationAnalysis;
    private startMLTraining;
    private startVisualizationUpdates;
    private registerEventHandlers;
    private initializeMachineLearningModels;
    private initializeFlowTriggers;
    private getCurrentFlowMetrics;
    private getHistoricalPerformanceData;
    private calculateMLOptimizedWIPLimits;
    private calculateHeuristicWIPLimits;
    private generateOptimizationTriggers;
    private calculateWIPConfidence;
    private getHistoricalWIPLimits;
    private calculateGradualAdjustment;
    private updateOrchestratorsWIPLimits;
    private calculateExpectedWIPImpact;
    private calculateWIPDifferences;
    private getCurrentWIPUsage;
    private calculateViolationSeverity;
    private getViolationDuration;
    private generateViolationRecommendations;
    private handleWIPViolations;
    private collectCurrentWorkItems;
    private calculateRealTimeFlowMetrics;
    private detectCurrentBottlenecks;
    private generateFlowRecommendations;
    private calculatePredictabilityTrend;
    private calculateValueTrend;
    private generateThroughputForecast;
    private calculateForecastImpact;
    private generateThroughputRecommendation;
    private predictBottlenecks;
    private detectQualityAnomalies;
    private performOptimizationAnalysis;
    private retrainMLModels;
    private updateFlowVisualization;
    private handleWorkItemStarted;
    private handleWorkItemCompleted;
    private handleBottleneckDetected;
}
export default AdvancedFlowManager;
export type { AdvancedFlowManagerConfig, IntelligentWIPLimits, WIPLimits, FlowState, FlowWorkItem, FlowMetrics, FlowBottleneck, FlowHealthIndicator, PredictiveInsight, FlowRecommendation, AdvancedFlowManagerState, };
//# sourceMappingURL=flow-manager.d.ts.map