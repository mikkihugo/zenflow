/**
 * @file Coordination system:ml-predictive
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

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
import { taskPriorityToNumber as _taskPriorityToNumber } from '../types';

// Direct brain.js import for practical neural networks
const brain = require('brain.js');

// Foundation-optimized logging
const logger = getLogger('MLPredictiveAlgorithm');

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

interface BrainJsNetworkConfig {
  latencyNetwork: any;
  successNetwork: any;
  initialized: boolean;
  lastTrainingSize: number;
}

interface BrainJsTrainingData {
  input: number[];
  output: number[];
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
  private brainJsConfig: BrainJsNetworkConfig;
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
    this.brainJsConfig = {
      latencyNetwork: null,
      successNetwork: null,
      initialized: false,
      lastTrainingSize: 0,
    };
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
    const predictions = await this.generatePredictions(
      task,
      availableAgents,
      metrics
    );

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
    const selectedAgent = availableAgents.find(
      (a) => a.id === bestPrediction.agentId
    )!;

    const alternatives = scoredPredictions
      .slice(1, 4)
      .map((p) => availableAgents.find((a) => a.id === p.agentId)!)
      .filter(Boolean);

    return {
      selectedAgent,
      confidence: bestPrediction.confidenceScore,
      reasoning: `ML prediction: ${bestPrediction.predictedLatency.toFixed(0)}ms latency, ${(bestPrediction.predictedSuccessRate * 100).toFixed(1)}% success rate"Fixed unterminated template"(`Model ${modelType} prediction failed:"Fixed unterminated template"(`Failed to retrain model ${modelType}:"Fixed unterminated template" `${parts[0]}.${parts[1]}.${patch}"Fixed unterminated template"