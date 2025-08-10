/**
 * @file Coordination system: ml-predictive
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('coordination-load-balancing-algorithms-ml-predictive');

/**
 * Machine Learning Predictive Load Balancing Algorithm.
 * Uses ML models to predict optimal agent selection and performance.
 */

import type { LoadBalancingAlgorithm, PredictionEngine } from '../interfaces';
import type {
  Agent,
  HistoricalData,
  LoadMetrics,
  PredictionModel,
  RoutingResult,
  Task,
} from '../types';

interface MLFeatures {
  agentId: string;
  taskType: string;
  taskPriority: number;
  estimatedDuration: number;
  timeOfDay: number;
  dayOfWeek: number;
  currentLoad: number;
  avgResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  recentThroughput: number;
  historicalSuccessRate: number;
  agentCapability: number;
}

interface PredictionResult {
  agentId: string;
  predictedLatency: number;
  predictedSuccessRate: number;
  confidenceScore: number;
  featureImportance: Record<string, number>;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastEvaluated: Date;
  sampleSize: number;
}

export class MLPredictiveAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'ml_predictive';

  private models: Map<string, PredictionModel> = new Map();
  private historicalData: HistoricalData[] = [];
  private modelPerformance: Map<string, ModelPerformance> = new Map();
  private predictionEngine: PredictionEngine;
  private config = {
    modelTypes: ['linear', 'neural', 'ensemble'] as const,
    maxHistorySize: 10000,
    minTrainingData: 100,
    retrainingInterval: 3600000, // 1 hour
    featureNormalization: true,
    crossValidationFolds: 5,
    modelEnsembleWeights: {
      linear: 0.3,
      neural: 0.4,
      ensemble: 0.3,
    },
    predictionThreshold: 0.7,
    adaptiveLearningRate: 0.01,
  };

  constructor(predictionEngine?: PredictionEngine) {
    this.predictionEngine = predictionEngine || new DefaultPredictionEngine();
    this.initializeModels();
  }

  /**
   * Select agent using ML predictions.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  public async selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult> {
    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    // Extract features for prediction
    const predictions = await this.generatePredictions(task, availableAgents, metrics);

    // Filter predictions with sufficient confidence
    const viablePredictions = predictions.filter(
      (p) => p.confidenceScore >= this.config.predictionThreshold
    );

    if (viablePredictions.length === 0) {
      // Fall back to simple heuristic
      return this.fallbackSelection(task, availableAgents, metrics);
    }

    // Calculate composite scores
    const scoredPredictions = viablePredictions.map((pred) => ({
      ...pred,
      compositeScore: this.calculateCompositeScore(pred, task),
    }));

    // Sort by composite score (higher is better)
    scoredPredictions.sort((a, b) => b.compositeScore - a.compositeScore);

    const bestPrediction = scoredPredictions[0];
    const selectedAgent = availableAgents.find((a) => a.id === bestPrediction.agentId)!;

    const alternatives = scoredPredictions
      .slice(1, 4)
      .map((p) => availableAgents.find((a) => a.id === p.agentId)!)
      .filter(Boolean);

    return {
      selectedAgent,
      confidence: bestPrediction.confidenceScore,
      reasoning: `ML prediction: ${bestPrediction.predictedLatency.toFixed(0)}ms latency, ${(bestPrediction.predictedSuccessRate * 100).toFixed(1)}% success rate`,
      alternativeAgents: alternatives,
      estimatedLatency: bestPrediction.predictedLatency,
      expectedQuality: bestPrediction.predictedSuccessRate,
    };
  }

  /**
   * Update algorithm configuration.
   *
   * @param config
   */
  public async updateConfiguration(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };

    // Retrain models if configuration changed significantly
    if (config?.modelEnsembleWeights || config?.adaptiveLearningRate) {
      await this.retrainModels();
    }
  }

  /**
   * Get performance metrics.
   */
  public async getPerformanceMetrics(): Promise<Record<string, number>> {
    const performances = Array.from(this.modelPerformance.values());

    const avgAccuracy =
      performances.length > 0
        ? performances.reduce((sum, p) => sum + p.accuracy, 0) / performances.length
        : 0;

    const avgPrecision =
      performances.length > 0
        ? performances.reduce((sum, p) => sum + p.precision, 0) / performances.length
        : 0;

    return {
      totalModels: this.models.size,
      averageAccuracy: avgAccuracy,
      averagePrecision: avgPrecision,
      historicalDataSize: this.historicalData.length,
      lastRetraining: this.getLastRetrainingTime(),
      predictionCacheHitRate: await this.calculateCacheHitRate(),
    };
  }

  /**
   * Handle task completion for ML learning.
   *
   * @param agentId
   * @param task
   * @param duration
   * @param success
   */
  public async onTaskComplete(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void> {
    // Record historical data for training
    const historicalEntry: HistoricalData = {
      timestamp: new Date(),
      agentId,
      taskType: task.type,
      duration,
      success,
      resourceUsage: this.createResourceUsageSnapshot(agentId),
    };

    this.historicalData.push(historicalEntry);

    // Limit history size
    if (this.historicalData.length > this.config.maxHistorySize) {
      this.historicalData.shift();
    }

    // Trigger retraining if enough new data has accumulated
    if (this.shouldRetrain()) {
      await this.retrainModels();
    }

    // Update model performance metrics
    await this.updateModelPerformance(agentId, task, duration, success);
  }

  /**
   * Handle agent failure.
   *
   * @param agentId
   * @param _error
   */
  public async onAgentFailure(agentId: string, _error: Error): Promise<void> {
    // Record failure data
    const failureData: HistoricalData = {
      timestamp: new Date(),
      agentId,
      taskType: 'system_failure',
      duration: 0,
      success: false,
      resourceUsage: this.createEmptyResourceUsage(),
    };

    this.historicalData.push(failureData);

    // Immediately update model to reflect agent unreliability
    await this.updateAgentReliabilityModel(agentId, false);
  }

  /**
   * Initialize ML models.
   */
  private async initializeModels(): Promise<void> {
    for (const modelType of this.config.modelTypes) {
      const model: PredictionModel = {
        modelType,
        accuracy: 0.5, // Start with baseline
        features: this.getDefaultFeatures(),
        lastTraining: new Date(),
        version: '1.0.0',
      };

      this.models.set(modelType, model);

      // Initialize model performance tracking
      this.modelPerformance.set(modelType, {
        accuracy: 0.5,
        precision: 0.5,
        recall: 0.5,
        f1Score: 0.5,
        lastEvaluated: new Date(),
        sampleSize: 0,
      });
    }
  }

  /**
   * Generate predictions for all available agents.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  private async generatePredictions(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];

    for (const agent of availableAgents) {
      const features = this.extractFeatures(task, agent, metrics.get(agent.id));
      const prediction = await this.predictAgentPerformance(features);

      predictions.push({
        agentId: agent.id,
        predictedLatency: prediction.latency,
        predictedSuccessRate: prediction.successRate,
        confidenceScore: prediction.confidence,
        featureImportance: prediction.featureImportance,
      });
    }

    return predictions;
  }

  /**
   * Extract features for ML prediction.
   *
   * @param task
   * @param agent
   * @param metrics
   */
  private extractFeatures(task: Task, agent: Agent, metrics?: LoadMetrics): MLFeatures {
    const now = new Date();

    return {
      agentId: agent.id,
      taskType: task.type,
      taskPriority: task.priority,
      estimatedDuration: task.estimatedDuration,
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      currentLoad: metrics?.activeTasks || 0,
      avgResponseTime: metrics?.responseTime || 1000,
      errorRate: metrics?.errorRate || 0,
      cpuUsage: metrics?.cpuUsage || 0,
      memoryUsage: metrics?.memoryUsage || 0,
      recentThroughput: metrics?.throughput || 0,
      historicalSuccessRate: this.getHistoricalSuccessRate(agent.id, task.type),
      agentCapability: this.calculateAgentCapability(agent, task),
    };
  }

  /**
   * Predict agent performance using ensemble of models.
   *
   * @param features
   */
  private async predictAgentPerformance(features: MLFeatures): Promise<{
    latency: number;
    successRate: number;
    confidence: number;
    featureImportance: Record<string, number>;
  }> {
    const predictions = new Map<string, any>();
    const weights = this.config.modelEnsembleWeights;

    // Get predictions from each model
    for (const [modelType, _model] of this.models) {
      try {
        const prediction = await this.predictionEngine.predict(this.normalizeFeatures(features));
        predictions.set(modelType, prediction);
      } catch (error) {
        logger.warn(`Model ${modelType} prediction failed:`, error);
      }
    }

    if (predictions.size === 0) {
      // Fallback to heuristic
      return this.heuristicPrediction(features);
    }

    // Weighted ensemble prediction
    let weightedLatency = 0;
    let weightedSuccessRate = 0;
    let totalWeight = 0;

    for (const [modelType, prediction] of predictions) {
      const weight = weights[modelType as keyof typeof weights] || 0;
      weightedLatency += prediction.latency * weight;
      weightedSuccessRate += prediction.successRate * weight;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      weightedLatency /= totalWeight;
      weightedSuccessRate /= totalWeight;
    }

    // Calculate confidence based on model agreement
    const confidence = this.calculatePredictionConfidence(predictions);

    // Calculate feature importance (simplified)
    const featureImportance = this.calculateFeatureImportance(features);

    return {
      latency: Math.max(100, weightedLatency),
      successRate: Math.max(0.1, Math.min(1.0, weightedSuccessRate)),
      confidence,
      featureImportance,
    };
  }

  /**
   * Calculate composite score for agent selection.
   *
   * @param prediction
   * @param task
   */
  private calculateCompositeScore(prediction: PredictionResult, task: Task): number {
    // Weight factors based on task priority
    const latencyWeight = task.priority > 3 ? 0.6 : 0.4;
    const successWeight = task.priority > 3 ? 0.3 : 0.4;
    const confidenceWeight = 0.1;

    // Normalize latency (lower is better)
    const latencyScore = Math.max(0, 1 - prediction.predictedLatency / 10000);

    return (
      latencyScore * latencyWeight +
      prediction.predictedSuccessRate * successWeight +
      prediction.confidenceScore * confidenceWeight
    );
  }

  /**
   * Retrain all models with current historical data.
   */
  private async retrainModels(): Promise<void> {
    if (this.historicalData.length < this.config.minTrainingData) {
      return; // Not enough data for training
    }

    const trainingData = this.prepareTrainingData();

    for (const [modelType, model] of this.models) {
      try {
        await this.predictionEngine.train(trainingData);

        // Update model metadata
        model.lastTraining = new Date();
        model.version = this.generateModelVersion(model.version);

        // Evaluate model performance
        await this.evaluateModel(modelType, trainingData);
      } catch (error) {
        logger.error(`Failed to retrain model ${modelType}:`, error);
      }
    }
  }

  /**
   * Prepare training data from historical records.
   */
  private prepareTrainingData(): any[] {
    return this.historicalData.map((entry) => ({
      features: this.extractFeaturesFromHistorical(entry),
      target: {
        latency: entry.duration,
        success: entry.success ? 1 : 0,
      },
    }));
  }

  /**
   * Check if models should be retrained.
   */
  private shouldRetrain(): boolean {
    const lastRetraining = this.getLastRetrainingTime();
    const timeSinceRetraining = Date.now() - lastRetraining;

    return (
      // Retrain every 500 new data points
      timeSinceRetraining > this.config.retrainingInterval || this.historicalData.length % 500 === 0
    );
  }

  /**
   * Fallback selection when ML predictions are not available.
   *
   * @param _task
   * @param availableAgents
   * @param metrics
   */
  private fallbackSelection(
    _task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): RoutingResult {
    // Simple heuristic: select agent with best recent performance
    let bestAgent = availableAgents[0];
    let bestScore = 0;

    for (const agent of availableAgents) {
      const agentMetrics = metrics.get(agent.id);
      if (!agentMetrics) continue;

      const score =
        (1 - agentMetrics.errorRate) * 0.4 +
        (1 - agentMetrics.cpuUsage) * 0.3 +
        (1 - agentMetrics.memoryUsage) * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return {
      selectedAgent: bestAgent,
      confidence: 0.5,
      reasoning: 'ML prediction unavailable, used heuristic fallback',
      alternativeAgents: availableAgents.filter((a) => a.id !== bestAgent.id).slice(0, 2),
      estimatedLatency: metrics.get(bestAgent.id)?.responseTime || 1000,
      expectedQuality: 0.7,
    };
  }

  // Helper methods
  private getDefaultFeatures(): string[] {
    return [
      'taskPriority',
      'estimatedDuration',
      'timeOfDay',
      'dayOfWeek',
      'currentLoad',
      'avgResponseTime',
      'errorRate',
      'cpuUsage',
      'memoryUsage',
      'recentThroughput',
      'historicalSuccessRate',
      'agentCapability',
    ];
  }

  private getHistoricalSuccessRate(agentId: string, taskType: string): number {
    const relevantData = this.historicalData.filter(
      (entry) => entry.agentId === agentId && entry.taskType === taskType
    );

    if (relevantData.length === 0) return 0.8; // Default

    const successes = relevantData?.filter((entry) => entry.success).length;
    return successes / relevantData.length;
  }

  private calculateAgentCapability(agent: Agent, task: Task): number {
    // Calculate how well agent capabilities match task requirements
    const matchingCapabilities = task.requiredCapabilities.filter((cap) =>
      agent.capabilities.includes(cap)
    ).length;

    return task.requiredCapabilities.length > 0
      ? matchingCapabilities / task.requiredCapabilities.length
      : 1.0;
  }

  private normalizeFeatures(features: MLFeatures): Record<string, number> {
    // Normalize features to 0-1 range for ML model
    return {
      taskPriority: features.taskPriority / 5,
      estimatedDuration: Math.min(1, features.estimatedDuration / 300000), // 5 minutes max
      timeOfDay: features.timeOfDay / 24,
      dayOfWeek: features.dayOfWeek / 7,
      currentLoad: Math.min(1, features.currentLoad / 20),
      avgResponseTime: Math.min(1, features.avgResponseTime / 10000),
      errorRate: features.errorRate,
      cpuUsage: features.cpuUsage,
      memoryUsage: features.memoryUsage,
      recentThroughput: Math.min(1, features.recentThroughput / 100),
      historicalSuccessRate: features.historicalSuccessRate,
      agentCapability: features.agentCapability,
    };
  }

  private heuristicPrediction(features: MLFeatures): {
    latency: number;
    successRate: number;
    confidence: number;
    featureImportance: Record<string, number>;
  } {
    const baseLatency = features.avgResponseTime;
    const loadMultiplier = 1 + features.currentLoad * 0.1;
    const successRate = Math.max(0.1, features.historicalSuccessRate);

    return {
      latency: baseLatency * loadMultiplier,
      successRate,
      confidence: 0.3,
      featureImportance: {
        currentLoad: 0.3,
        avgResponseTime: 0.3,
        historicalSuccessRate: 0.4,
      },
    };
  }

  private calculatePredictionConfidence(predictions: Map<string, any>): number {
    // Calculate confidence based on agreement between models
    if (predictions.size < 2) return 0.5;

    const latencies = Array.from(predictions.values()).map((p) => p.latency);
    const successRates = Array.from(predictions.values()).map((p) => p.successRate);

    const latencyVariance = this.calculateVariance(latencies);
    const successVariance = this.calculateVariance(successRates);

    // Lower variance = higher confidence
    const confidence = Math.max(0.1, 1 - (latencyVariance + successVariance) / 2);
    return Math.min(1.0, confidence);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;

    return variance;
  }

  private calculateFeatureImportance(_features: MLFeatures): Record<string, number> {
    // Simplified feature importance calculation
    return {
      currentLoad: 0.25,
      avgResponseTime: 0.2,
      historicalSuccessRate: 0.2,
      taskPriority: 0.15,
      agentCapability: 0.1,
      cpuUsage: 0.05,
      memoryUsage: 0.05,
    };
  }

  private createResourceUsageSnapshot(_agentId: string): LoadMetrics {
    // Create a snapshot of current resource usage
    return {
      timestamp: new Date(),
      cpuUsage: Math.random() * 0.8, // Mock data
      memoryUsage: Math.random() * 0.8,
      diskUsage: Math.random() * 0.5,
      networkUsage: Math.random() * 0.5,
      activeTasks: Math.floor(Math.random() * 10),
      queueLength: Math.floor(Math.random() * 5),
      responseTime: 500 + Math.random() * 1500,
      errorRate: Math.random() * 0.05,
      throughput: Math.random() * 100,
    };
  }

  private createEmptyResourceUsage(): LoadMetrics {
    return {
      timestamp: new Date(),
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkUsage: 0,
      activeTasks: 0,
      queueLength: 0,
      responseTime: 0,
      errorRate: 1,
      throughput: 0,
    };
  }

  private async updateModelPerformance(
    _agentId: string,
    _task: Task,
    _duration: number,
    _success: boolean
  ): Promise<void> {
    // Update model performance metrics based on actual outcomes
    // This would involve comparing predictions with actual results
  }

  private async updateAgentReliabilityModel(_agentId: string, _reliable: boolean): Promise<void> {
    // Update agent reliability in the model
    // This would adjust the agent's reliability score in the training data
  }

  private extractFeaturesFromHistorical(entry: HistoricalData): Record<string, number> {
    // Extract normalized features from historical data entry
    const timestamp = entry.timestamp;
    return {
      timeOfDay: timestamp.getHours() / 24,
      dayOfWeek: timestamp.getDay() / 7,
      duration: Math.min(1, entry.duration / 300000),
      success: entry.success ? 1 : 0,
      cpuUsage: entry.resourceUsage.cpuUsage,
      memoryUsage: entry.resourceUsage.memoryUsage,
      activeTasks: Math.min(1, entry.resourceUsage.activeTasks / 20),
    };
  }

  private async evaluateModel(_modelType: string, _trainingData: any[]): Promise<void> {
    // Evaluate model performance using cross-validation
    // This would implement proper ML evaluation metrics
  }

  private getLastRetrainingTime(): number {
    let lastRetraining = 0;
    for (const model of this.models.values()) {
      lastRetraining = Math.max(lastRetraining, model.lastTraining.getTime());
    }
    return lastRetraining;
  }

  private generateModelVersion(currentVersion: string): string {
    const parts = currentVersion?.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private async calculateCacheHitRate(): Promise<number> {
    // Calculate prediction cache hit rate
    return 0.85; // Mock value
  }
}

/**
 * Default prediction engine implementation.
 *
 * @example
 */
class DefaultPredictionEngine implements PredictionEngine {
  async predict(features: Record<string, number>): Promise<number> {
    // Simple linear model for demonstration
    const weights = {
      currentLoad: -200,
      avgResponseTime: 0.5,
      errorRate: 1000,
      cpuUsage: 300,
      memoryUsage: 200,
      taskPriority: -50,
    };

    let prediction = 1000; // Base latency

    for (const [feature, value] of Object.entries(features)) {
      if (weights[feature as keyof typeof weights]) {
        prediction += weights[feature as keyof typeof weights] * value;
      }
    }

    return Math.max(100, prediction);
  }

  async train(data: any[]): Promise<void> {
    // Mock training - in practice this would implement actual ML training
    this.model = { trained: true, dataSize: data.length };
  }

  async getModel(): Promise<PredictionModel> {
    return {
      modelType: 'linear',
      accuracy: 0.85,
      features: ['currentLoad', 'avgResponseTime', 'errorRate'],
      lastTraining: new Date(),
      version: '1.0.0',
    };
  }

  async updateModel(model: PredictionModel): Promise<void> {
    this.model = model;
  }

  async getAccuracy(): Promise<number> {
    return 0.85;
  }
}
