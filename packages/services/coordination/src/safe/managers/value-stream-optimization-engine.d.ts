/**
 * @fileoverview Value Stream Optimization Engine - Lightweight facade for SAFe Flow Optimization
 *
 * Value stream optimization engine with advanced bottleneck detection and analysis,
 * flow optimization recommendations, continuous improvement automation, and predictive analytics.
 *
 * Delegates to:
 * - BottleneckAnalysisService: Advanced bottleneck detection and root cause analysis
 * - FlowOptimizationService: AI-powered optimization recommendations
 * - ContinuousImprovementService: Automated kaizen cycles and improvement loops
 * - PredictiveAnalyticsService: Value delivery time predictions and forecasting
 *
 * STATUS: 737 lines - Well-structured facade with comprehensive service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
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
export interface OptimizationEngineState {
    readonly isRunning: boolean;
    readonly lastOptimizationRun: Date | null;
    readonly totalOptimizationCycles: number;
    readonly learningData: Map<string, any>;
    readonly activeRecommendations: Set<string>;
    readonly performanceMetrics: PerformanceMetrics;
}
export interface PerformanceMetrics {
    readonly averageCycleTime: number;
    readonly optimizationEffectiveness: number;
    readonly learningAccuracy: number;
    readonly recommendationAcceptanceRate: number;
    readonly improvementVelocity: number;
}
/**
 * Value Stream Optimization Engine for SAFe flow optimization
 */
export declare class ValueStreamOptimizationEngine extends EventBus {
    private readonly logger;
    private bottleneckAnalysisService;
    private flowOptimizationService;
    private continuousImprovementService;
    private predictiveAnalyticsService;
    private initialized;
    private config;
    private state;
    private optimizationTimer?;
    constructor(_config?: Partial<OptimizationEngineConfig>);
    /**
     * Initialize with service delegation
     */
    initialize(): Promise<void>;
    /**
     * Perform advanced bottleneck analysis - Delegates to Bottleneck Analysis Service
     */
    performAdvancedBottleneckAnalysis(valueStreamId: string, analysisConfig: any, flowData: any): Promise<any>;
    catch(error: any): void;
}
//# sourceMappingURL=value-stream-optimization-engine.d.ts.map