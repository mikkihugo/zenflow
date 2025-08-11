/**
 * @file Coordination system: ml-predictive
 */
/**
 * Machine Learning Predictive Load Balancing Algorithm.
 * Uses ML models to predict optimal agent selection and performance.
 */
import type { LoadBalancingAlgorithm, PredictionEngine } from '../interfaces.ts';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types.ts';
export declare class MLPredictiveAlgorithm implements LoadBalancingAlgorithm {
    readonly name = "ml_predictive";
    private models;
    private historicalData;
    private modelPerformance;
    private predictionEngine;
    private config;
    constructor(predictionEngine?: PredictionEngine);
    /**
     * Select agent using ML predictions.
     *
     * @param task
     * @param availableAgents
     * @param metrics
     */
    selectAgent(task: Task, availableAgents: Agent[], metrics: Map<string, LoadMetrics>): Promise<RoutingResult>;
    /**
     * Update algorithm configuration.
     *
     * @param config
     */
    updateConfiguration(config: Record<string, any>): Promise<void>;
    /**
     * Get performance metrics.
     */
    getPerformanceMetrics(): Promise<Record<string, number>>;
    /**
     * Handle task completion for ML learning.
     *
     * @param agentId
     * @param task
     * @param duration
     * @param success
     */
    onTaskComplete(agentId: string, task: Task, duration: number, success: boolean): Promise<void>;
    /**
     * Handle agent failure.
     *
     * @param agentId
     * @param _error
     */
    onAgentFailure(agentId: string, _error: Error): Promise<void>;
    /**
     * Initialize ML models.
     */
    private initializeModels;
    /**
     * Generate predictions for all available agents.
     *
     * @param task
     * @param availableAgents
     * @param metrics
     */
    private generatePredictions;
    /**
     * Extract features for ML prediction.
     *
     * @param task
     * @param agent
     * @param metrics
     */
    private extractFeatures;
    /**
     * Predict agent performance using ensemble of models.
     *
     * @param features
     */
    private predictAgentPerformance;
    /**
     * Calculate composite score for agent selection.
     *
     * @param prediction
     * @param task
     */
    private calculateCompositeScore;
    /**
     * Retrain all models with current historical data.
     */
    private retrainModels;
    /**
     * Prepare training data from historical records.
     */
    private prepareTrainingData;
    /**
     * Check if models should be retrained.
     */
    private shouldRetrain;
    /**
     * Fallback selection when ML predictions are not available.
     *
     * @param _task
     * @param availableAgents
     * @param metrics
     */
    private fallbackSelection;
    private getDefaultFeatures;
    private getHistoricalSuccessRate;
    private calculateAgentCapability;
    private normalizeFeatures;
    private heuristicPrediction;
    private calculatePredictionConfidence;
    private calculateVariance;
    private calculateFeatureImportance;
    private createResourceUsageSnapshot;
    private createEmptyResourceUsage;
    private updateModelPerformance;
    private updateAgentReliabilityModel;
    private extractFeaturesFromHistorical;
    private evaluateModel;
    private getLastRetrainingTime;
    private generateModelVersion;
    private calculateCacheHitRate;
}
//# sourceMappingURL=ml-predictive.d.ts.map