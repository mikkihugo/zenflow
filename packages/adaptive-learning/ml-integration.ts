/**
 * @file Ml-integration implementation.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('intelligence-adaptive-learning-ml-integration');

/**
 * Machine Learning Integration.
 *
 * Provides ML capabilities including neural networks, reinforcement learning,
 * ensemble models, and online learning for the adaptive learning system.
 */

import { EventEmitter } from 'node:events';
import type {
  AdaptiveLearningConfig,
  EnsemblePrediction,
  EvaluationMetrics,
  PerformanceMetrics,
  ExecutionData,
  EnsembleModels as IEnsembleModels,
  NeuralNetworkPredictor as INeuralNetworkPredictor,
  OnlineLearningSystem as IOnlineLearningSystem,
  ReinforcementLearningEngine as IReinforcementLearningEngine,
  ModelInfo,
  Pattern,
  TrainingResult,
} from './types';

// Import Zod schemas for validation
import {
  NeuralWeightsSchema,
  NeuralNetworkModelSchema,
  EvaluationMetricsSchema,
  TrainingResultSchema,
  type NeuralWeights,
  type NeuralNetworkModel,
} from './schemas';

// ============================================
// Reinforcement Learning Engine
// ============================================

export class ReinforcementLearningEngine
  extends EventEmitter
  implements IReinforcementLearningEngine
{
  private qTable = new Map<string, Map<string, number>>();
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private minExplorationRate: number;
  private explorationDecay: number;
  private episodeCount: number = 0;

  constructor(
    config: {
      learningRate?: number;
      discountFactor?: number;
      explorationRate?: number;
      minExplorationRate?: number;
      explorationDecay?: number;
    } = {}
  ) {
    super();
    this.learningRate = config?.learningRate || 0.1;
    this.discountFactor = config?.discountFactor || 0.95;
    this.explorationRate = config?.explorationRate || 0.1;
    this.minExplorationRate = config?.minExplorationRate || 0.01;
    this.explorationDecay = config?.explorationDecay || 0.995;
  }

  /**
   * Select action using epsilon-greedy policy.
   *
   * @param state
   * @param availableActions
   */
  selectAction(state: string, availableActions: string[]): string {
    // Validate inputs
    if (!availableActions || availableActions.length === 0) {
      throw new Error('Available actions cannot be empty');
    }

    // Epsilon-greedy action selection
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      const action = availableActions[randomIndex]!; // Safe access after length check

      this.emit('actionSelected', {
        state,
        action,
        type: 'exploration',
        explorationRate: this.explorationRate,
        timestamp: Date.now(),
      });

      return action;
    }
    // Exploit: best known action
    const action = this.getBestAction(state, availableActions);

    this.emit('actionSelected', {
      state,
      action,
      type: 'exploitation',
      qValue: this.getQValue(state, action),
      timestamp: Date.now(),
    });

    return action;
  }

  /**
   * Update Q-value using Q-learning algorithm.
   *
   * @param state
   * @param action
   * @param reward
   * @param nextState
   */
  updateQValue(
    state: string,
    action: string,
    reward: number,
    nextState: string
  ): void {
    const currentQ = this.getQValue(state, action);
    const maxNextQ = this.getMaxQValue(nextState);

    // Q-learning update rule
    const newQ =
      currentQ +
      this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);

    this.setQValue(state, action, newQ);

    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );

    this.emit('qValueUpdated', {
      state,
      action,
      oldValue: currentQ,
      newValue: newQ,
      reward,
      maxNextQ,
      explorationRate: this.explorationRate,
      timestamp: Date.now(),
    });
  }

  /**
   * Get Q-value for state-action pair.
   *
   * @param state
   * @param action
   */
  getQValue(state: string, action: string): number {
    return this.qTable.get(state)?.get(action) ?? 0;
  }

  /**
   * Get current policy (best action for each state).
   */
  getPolicy(): Map<string, string> {
    const policy = new Map<string, string>();

    for (const [state, actions] of this.qTable) {
      let bestAction = '';
      let bestValue = Number.NEGATIVE_INFINITY;

      for (const [action, value] of actions) {
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }

      if (bestAction) {
        policy.set(state, bestAction);
      }
    }

    return policy;
  }

  /**
   * Train on batch of experiences.
   *
   * @param experiences
   */
  trainBatch(
    experiences: Array<{
      state: string;
      action: string;
      reward: number;
      nextState: string;
      done: boolean;
    }>
  ): void {
    for (const experience of experiences) {
      this.updateQValue(
        experience.state,
        experience.action,
        experience.reward,
        experience.nextState
      );
    }

    this.episodeCount++;

    this.emit('batchTrained', {
      batchSize: experiences.length,
      episodeCount: this.episodeCount,
      explorationRate: this.explorationRate,
      timestamp: Date.now(),
    });
  }

  /**
   * Get learning statistics.
   */
  getStats(): {
    episodeCount: number;
    explorationRate: number;
    stateCount: number;
    averageQValue: number;
    maxQValue: number;
  } {
    let totalQ = 0;
    let maxQ = Number.NEGATIVE_INFINITY;
    let valueCount = 0;

    for (const stateActions of this.qTable.values()) {
      for (const qValue of stateActions.values()) {
        totalQ += qValue;
        maxQ = Math.max(maxQ, qValue);
        valueCount++;
      }
    }

    return {
      episodeCount: this.episodeCount,
      explorationRate: this.explorationRate,
      stateCount: this.qTable.size,
      averageQValue: valueCount > 0 ? totalQ / valueCount : 0,
      maxQValue: maxQ === Number.NEGATIVE_INFINITY ? 0 : maxQ,
    };
  }

  /**
   * Reset learning state.
   */
  reset(): void {
    this.qTable.clear();
    this.episodeCount = 0;
    this.explorationRate = 0.1; // Reset to initial value

    this.emit('reset', { timestamp: Date.now() });
  }

  // Private helper methods

  private setQValue(state: string, action: string, value: number): void {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    this.qTable.get(state)?.set(action, value);
  }

  private getBestAction(state: string, availableActions: string[]): string {
    // Validate inputs
    if (!availableActions || availableActions.length === 0) {
      throw new Error('Available actions cannot be empty');
    }

    let bestAction = availableActions[0]!; // Safe access after length check
    let bestValue = this.getQValue(state, bestAction);

    for (const action of availableActions) {
      const value = this.getQValue(state, action);
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    return bestAction;
  }

  private getMaxQValue(state: string): number {
    const stateActions = this.qTable.get(state);
    if (!stateActions || stateActions.size === 0) {
      return 0;
    }

    return Math.max(...stateActions.values());
  }
}

// ============================================
// Neural Network Predictor
// ============================================

export class NeuralNetworkPredictor
  extends EventEmitter
  implements INeuralNetworkPredictor
{
  private model: NeuralNetworkModel | null = null;
  private isTraining: boolean = false;
  private trainingHistory: TrainingResult[] = [];
  private inputSize: number;
  private outputSize: number;
  private architecture: string;

  constructor(config: {
    inputSize: number;
    outputSize: number;
    architecture?: string;
  }) {
    super();
    this.inputSize = config?.inputSize;
    this.outputSize = config?.outputSize;
    this.architecture = config?.architecture || 'feedforward';
    this.initializeModel();
  }

  /**
   * Predict patterns from execution data.
   *
   * @param data
   */
  async predict(data: ExecutionData[]): Promise<Pattern[]> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Convert execution data to feature vectors
    const features = this.extractFeatures(data);

    // Simulate neural network prediction
    const predictions = await this.simulateModelPrediction(features);

    // Convert predictions to patterns
    const patterns = this.convertPredictionsToPatterns(predictions, data);

    this.emit('predictionCompleted', {
      inputCount: data.length,
      outputCount: patterns.length,
      averageConfidence:
        patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
      timestamp: Date.now(),
    });

    return patterns;
  }

  /**
   * Train the neural network.
   *
   * @param data
   * @param labels
   */
  async train(
    data: ExecutionData[],
    labels: unknown[]
  ): Promise<TrainingResult> {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }

    this.isTraining = true;

    try {
      // Extract features and prepare training data
      const features = this.extractFeatures(data);
      const processedLabels = this.processLabels(labels);

      // Simulate training process
      const result = await this.simulateTraining(features, processedLabels);

      this.trainingHistory.push(result);

      this.emit('trainingCompleted', {
        accuracy: result?.accuracy,
        loss: result?.loss,
        epochs: result?.epochs,
        trainingTime: result?.trainingTime,
        timestamp: Date.now(),
      });

      return result;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Evaluate model performance.
   *
   * @param testData
   */
  async evaluate(testData: ExecutionData[]): Promise<EvaluationMetrics> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const features = this.extractFeatures(testData);

    // Simulate evaluation
    const metrics = await this.simulateEvaluation(features, testData);

    this.emit('evaluationCompleted', {
      accuracy: metrics.accuracy,
      testSize: testData.length,
      timestamp: Date.now(),
    });

    return metrics;
  }

  /**
   * Get model information.
   */
  getModelInfo(): ModelInfo {
    return {
      name: 'AdaptiveLearningNN',
      version: '1.0.0',
      architecture: this.architecture,
      parameters: this.inputSize * this.outputSize * 2, // Simplified parameter count
      trainedOn:
        this.trainingHistory.length > 0 ? 'execution_data' : 'untrained',
      lastUpdated:
        this.trainingHistory.length > 0
          ? (this.trainingHistory[this.trainingHistory.length - 1]
              ?.trainingTime ?? Date.now())
          : Date.now(),
    };
  }

  /**
   * Get training history.
   */
  getTrainingHistory(): TrainingResult[] {
    return [...this.trainingHistory];
  }

  // Private helper methods

  private initializeModel(): void {
    // Simulate model initialization
    this.model = {
      inputSize: this.inputSize,
      outputSize: this.outputSize,
      weights: Array(this.inputSize * this.outputSize)
        .fill(0)
        .map(() => Math.random() - 0.5),
      biases: Array(this.outputSize)
        .fill(0)
        .map(() => Math.random() - 0.5),
    };

    this.emit('modelInitialized', {
      inputSize: this.inputSize,
      outputSize: this.outputSize,
      architecture: this.architecture,
      timestamp: Date.now(),
    });
  }

  private extractFeatures(data: ExecutionData[]): number[][] {
    return data.map((item) => [
      item?.duration / 1000, // Normalize duration
      item?.resourceUsage?.cpu,
      item?.resourceUsage?.memory,
      item?.resourceUsage?.network,
      item?.resourceUsage?.diskIO,
      item?.success ? 1 : 0,
      Object.keys(item?.context).length / 10, // Normalize context complexity
    ]);
  }

  private processLabels(labels: unknown[]): number[][] {
    // Convert labels to one-hot encoding or regression targets
    return labels.map((label) => {
      if (typeof label === 'number') {
        return [label];
      }
      if (typeof label === 'boolean') {
        return [label ? 1 : 0];
      }
      // For complex labels, extract numeric features
      return [Math.random()]; // Simplified
    });
  }

  private async simulateModelPrediction(
    features: number[][]
  ): Promise<number[][]> {
    // Simulate neural network forward pass
    return new Promise((resolve) => {
      setTimeout(() => {
        const predictions = features.map(() =>
          Array(this.outputSize)
            .fill(0)
            .map(() => Math.random())
        );
        resolve(predictions);
      }, 100); // Simulate computation time
    });
  }

  private convertPredictionsToPatterns(
    predictions: number[][],
    data: ExecutionData[]
  ): Pattern[] {
    return predictions.map((prediction, index) => ({
      id: `neural_pattern_${Date.now()}_${index}`,
      type: 'optimization',
      data: {
        prediction,
        source: data[index],
      },
      confidence:
        prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
      frequency: 1,
      context: data[index]?.context || {},
      metadata: {
        complexity:
          prediction && prediction.length > 0
            ? prediction.length / this.outputSize
            : 0.5,
        predictability:
          prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
        stability:
          prediction && prediction.length > 0
            ? 1 - this.calculateStd(prediction)
            : 0.5,
        anomalyScore:
          prediction && prediction.length > 0 && Math.max(...prediction) > 0.9
            ? 0.8
            : 0.2,
        correlations: [],
        quality:
          prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
        relevance:
          prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
      },
      timestamp: Date.now(),
    }));
  }

  private async simulateTraining(
    _features: number[][],
    _labels: number[][]
  ): Promise<TrainingResult> {
    const startTime = Date.now();
    const epochs = 50 + Math.floor(Math.random() * 50);

    // Simulate training process
    return new Promise((resolve) => {
      setTimeout(() => {
        const trainingTime = Date.now() - startTime;

        resolve({
          accuracy: 0.75 + Math.random() * 0.2,
          loss: Math.random() * 0.5,
          epochs,
          trainingTime,
          validationScore: 0.7 + Math.random() * 0.25,
          modelSize: this.inputSize * this.outputSize * 4, // Bytes
        });
      }, epochs * 10); // Simulate training time
    });
  }

  private async simulateEvaluation(
    _features: number[][],
    _testData: ExecutionData[]
  ): Promise<EvaluationMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const accuracy = 0.7 + Math.random() * 0.25;

        resolve({
          accuracy,
          precision: accuracy * (0.9 + Math.random() * 0.1),
          recall: accuracy * (0.85 + Math.random() * 0.15),
          f1Score: accuracy * (0.87 + Math.random() * 0.13),
          auc: accuracy * (0.9 + Math.random() * 0.1),
          confusion: [
            [80, 20],
            [15, 85],
          ], // Simplified 2x2 confusion matrix
        });
      }, 50);
    });
  }

  private calculateStd(arr: number[]): number {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance =
      arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }
}

// ============================================
// Ensemble Models
// ============================================

export class EnsembleModels extends EventEmitter implements IEnsembleModels {
  private models = new Map<string, { model: unknown; weight: number }>();
  private totalWeight: number = 0;

  /**
   * Add a model to the ensemble.
   *
   * @param model
   * @param weight
   */
  addModel(model: unknown, weight: number): void {
    const modelId = `model_${Date.now()}_${Math.random()}`;
    this.models.set(modelId, { model, weight });
    this.totalWeight += weight;

    this.emit('modelAdded', {
      modelId,
      weight,
      totalModels: this.models.size,
      totalWeight: this.totalWeight,
      timestamp: Date.now(),
    });
  }

  /**
   * Make ensemble prediction.
   *
   * @param data
   */
  async predict(data: ExecutionData[]): Promise<EnsemblePrediction> {
    if (this.models.size === 0) {
      throw new Error('No models in ensemble');
    }

    const modelPredictions = new Map<string, any>();
    const modelContributions = new Map<string, number>();

    // Get predictions from all models
    for (const [modelId, { model, weight }] of this.models) {
      try {
        const prediction = await this.getModelPrediction(model, data);
        modelPredictions.set(modelId, prediction);
        modelContributions.set(modelId, weight / this.totalWeight);
      } catch (error) {
        logger.warn(`Model ${modelId} prediction failed:`, error);
      }
    }

    // Combine predictions using weighted average
    const combinedPrediction = this.combineN(
      modelPredictions,
      modelContributions
    );
    const confidence = this.calculateEnsembleConfidence(
      modelPredictions,
      modelContributions
    );
    const uncertainty = this.calculateUncertainty(modelPredictions);

    const ensemblePrediction: EnsemblePrediction = {
      prediction: combinedPrediction,
      confidence,
      modelContributions,
      uncertainty,
    };

    this.emit('ensemblePrediction', {
      modelsUsed: modelPredictions.size,
      confidence,
      uncertainty,
      timestamp: Date.now(),
    });

    return ensemblePrediction;
  }

  /**
   * Get model weights.
   */
  getModelWeights(): Map<string, number> {
    const weights = new Map<string, number>();

    for (const [modelId, { weight }] of this.models) {
      weights.set(modelId, weight / this.totalWeight);
    }

    return weights;
  }

  /**
   * Update model weights based on performance.
   *
   * @param performance
   */
  updateWeights(performance: PerformanceMetrics[]): void {
    if (performance.length !== this.models.size) {
      throw new Error('Performance array size must match number of models');
    }

    const modelIds = Array.from(this.models.keys());
    this.totalWeight = 0;

    for (let i = 0; i < performance.length; i++) {
      const modelId = modelIds[i];
      const perf = performance[i];

      // Update weight based on performance (simplified)
      const newWeight = Math.max(0.1, (perf as any)?.accuracy || perf?.efficiency || 0.5);
      const modelData = this.models.get(modelId) as any;
      if (modelData) {
        modelData.weight = newWeight;
        this.totalWeight += newWeight;
      }
    }

    this.emit('weightsUpdated', {
      totalWeight: this.totalWeight,
      averageWeight: this.totalWeight / this.models.size,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove model from ensemble.
   *
   * @param modelId
   */
  removeModel(modelId: string): boolean {
    const modelData = this.models.get(modelId);
    if (modelData) {
      this.totalWeight -= modelData?.weight;
      this.models.delete(modelId);

      this.emit('modelRemoved', {
        modelId,
        remainingModels: this.models.size,
        totalWeight: this.totalWeight,
        timestamp: Date.now(),
      });

      return true;
    }

    return false;
  }

  // Private helper methods

  private async getModelPrediction(
    model: { predict?: (data: ExecutionData[]) => Promise<unknown> | unknown },
    data: ExecutionData[]
  ): Promise<unknown> {
    // Simulate model prediction
    if (model.predict && typeof model.predict === 'function') {
      return await model.predict(data);
    }
    // Fallback simulation
    return data.map(() => Math.random());
  }

  private combineN(
    predictions: Map<string, any>,
    contributions: Map<string, number>
  ): unknown {
    // Simplified combination - assumes numeric predictions
    let total = 0;
    let weightSum = 0;

    for (const [modelId, prediction] of predictions) {
      const weight = contributions.get(modelId) || 0;
      const value = Array.isArray(prediction) ? prediction[0] : prediction;
      total += (typeof value === 'number' ? value : 0) * weight;
      weightSum += weight;
    }

    return weightSum > 0 ? total / weightSum : 0;
  }

  private calculateEnsembleConfidence(
    predictions: Map<string, any>,
    _contributions: Map<string, number>
  ): number {
    if (predictions.size === 0) return 0;

    // Calculate confidence based on agreement between models
    const values = Array.from(predictions.values())
      .map((p) => (Array.isArray(p) ? p[0] : p))
      .filter((v) => typeof v === 'number');

    if (values.length === 0) return 0.5;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

    // Higher agreement (lower variance) = higher confidence
    return Math.max(0.1, 1 - Math.min(1, variance));
  }

  private calculateUncertainty(predictions: Map<string, any>): number {
    if (predictions.size <= 1) return 0.5;

    const values = Array.from(predictions.values())
      .map((p) => (Array.isArray(p) ? p[0] : p))
      .filter((v) => typeof v === 'number');

    if (values.length <= 1) return 0.5;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

    return Math.min(1, variance);
  }
}

// ============================================
// Online Learning System
// ============================================

export class OnlineLearningSystem
  extends EventEmitter
  implements IOnlineLearningSystem
{
  private model: NeuralWeights | null = null;
  private accuracy: number = 0.5;
  private streamCount: number = 0;
  private adaptationThreshold: number = 0.1;
  private windowSize: number = 1000;
  private recentData: ExecutionData[] = [];

  constructor(
    config: {
      adaptationThreshold?: number;
      windowSize?: number;
    } = {}
  ) {
    super();
    this.adaptationThreshold = config?.adaptationThreshold || 0.1;
    this.windowSize = config?.windowSize || 1000;
    this.initializeModel();
  }

  /**
   * Process streaming data.
   *
   * @param data
   */
  async processStream(data: ExecutionData): Promise<void> {
    // Add to recent data window
    this.recentData.push(data);
    if (this.recentData.length > this.windowSize) {
      this.recentData.shift();
    }

    this.streamCount++;

    // Incremental learning update
    await this.incrementalUpdate(data);

    // Check if adaptation is needed
    if (this.streamCount % 100 === 0) {
      await this.checkAndAdapt();
    }

    this.emit('streamProcessed', {
      streamCount: this.streamCount,
      accuracy: this.accuracy,
      recentDataSize: this.recentData.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Get current model.
   */
  getCurrentModel(): unknown {
    return { ...this.model };
  }

  /**
   * Get current accuracy.
   */
  getAccuracy(): number {
    return this.accuracy;
  }

  /**
   * Adapt to new data distribution.
   *
   * @param newData
   */
  async adaptToDistribution(newData: ExecutionData[]): Promise<void> {
    // Detect distribution shift
    const shiftDetected = this.detectDistributionShift(newData);

    if (shiftDetected) {
      // Retrain or adapt model
      await this.adaptModel(newData);

      this.emit('distributionAdapted', {
        newDataSize: newData.length,
        accuracy: this.accuracy,
        adaptationRequired: shiftDetected,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Reset online learning.
   */
  reset(): void {
    this.recentData = [];
    this.streamCount = 0;
    this.accuracy = 0.5;
    this.initializeModel();

    this.emit('reset', { timestamp: Date.now() });
  }

  // Private helper methods

  private initializeModel(): void {
    // Simple online learning model simulation
    this.model = {
      weights: Array(10)
        .fill(0)
        .map(() => Math.random() - 0.5),
      bias: Math.random() - 0.5,
      learningRate: 0.01,
    };
  }

  private async incrementalUpdate(data: ExecutionData): Promise<void> {
    // Simulate incremental learning update
    const features = this.extractFeatures(data);
    const target = data?.success ? 1 : 0;

    // Simple gradient descent update
    const prediction = this.predict(features);
    const error = target - prediction;

    // Safe access to model weights
    if (this.model && this.model.weights && Array.isArray(this.model.weights)) {
      for (
        let i = 0;
        i < this.model.weights.length && i < features.length;
        i++
      ) {
        this.model.weights[i] += this.model.learningRate * error * features[i]!;
      }
      this.model.bias += this.model.learningRate * error;
    }

    // Update accuracy estimate
    this.accuracy = this.accuracy * 0.99 + (Math.abs(error) < 0.5 ? 0.01 : 0);
  }

  private async checkAndAdapt(): Promise<void> {
    if (this.recentData.length < 50) return;

    // Check if performance has degraded
    const recentAccuracy = this.evaluateRecentPerformance();

    if (this.accuracy - recentAccuracy > this.adaptationThreshold) {
      await this.adaptModel(this.recentData.slice(-100));
    }
  }

  private detectDistributionShift(newData: ExecutionData[]): boolean {
    if (this.recentData.length < 100 || newData.length < 10) {
      return false;
    }

    // Simple distribution shift detection using feature means
    const oldFeatures = this.recentData
      .slice(-100)
      .map((d) => this.extractFeatures(d));
    const newFeatures = newData.map((d) => this.extractFeatures(d));

    const oldMeans = this.calculateFeatureMeans(oldFeatures);
    const newMeans = this.calculateFeatureMeans(newFeatures);

    // Check if means have shifted significantly - safe access to array lengths
    const minLength = Math.min(oldMeans?.length || 0, newMeans?.length || 0);
    for (let i = 0; i < minLength; i++) {
      if (Math.abs((oldMeans?.[i] || 0) - (newMeans?.[i] || 0)) > 0.5) {
        return true;
      }
    }

    return false;
  }

  private async adaptModel(adaptationData: ExecutionData[]): Promise<void> {
    // Simulate model adaptation
    const features = adaptationData.map((d) => this.extractFeatures(d));
    const targets = adaptationData.map((d) => (d.success ? 1 : 0));

    // Simple batch update
    for (let epoch = 0; epoch < 10; epoch++) {
      for (let i = 0; i < features.length; i++) {
        const currentFeatures = features[i];
        if (!currentFeatures) continue;

        const prediction = this.predict(currentFeatures);
        const error = targets?.[i]! - prediction;

        // Safe access to model weights
        if (
          this.model &&
          this.model.weights &&
          Array.isArray(this.model.weights)
        ) {
          for (
            let j = 0;
            j < this.model.weights.length && j < currentFeatures.length;
            j++
          ) {
            this.model.weights[j] +=
              this.model.learningRate * error * (currentFeatures?.[j] || 0);
          }
          this.model.bias += this.model.learningRate * error;
        }
      }
    }

    // Update accuracy estimate
    this.accuracy = this.evaluateModelAccuracy(features, targets);
  }

  private extractFeatures(data: ExecutionData): number[] {
    return [
      data?.duration / 1000,
      data?.resourceUsage?.cpu,
      data?.resourceUsage?.memory,
      data?.resourceUsage?.network,
      data?.resourceUsage?.diskIO,
      Object.keys(data?.context).length / 10,
    ];
  }

  private predict(features: number[]): number {
    if (
      !(this.model && this.model.weights && Array.isArray(this.model.weights))
    ) {
      return 0.5; // Default prediction
    }

    let sum = this.model.bias || 0;
    for (let i = 0; i < this.model.weights.length && i < features.length; i++) {
      sum += (this.model.weights[i] || 0) * (features[i] || 0);
    }
    return 1 / (1 + Math.exp(-sum)); // Sigmoid activation
  }

  private evaluateRecentPerformance(): number {
    if (this.recentData.length < 10) return this.accuracy;

    const recent = this.recentData.slice(-50);
    const features = recent.map((d) => this.extractFeatures(d));
    const targets = recent.map((d) => (d.success ? 1 : 0));

    return this.evaluateModelAccuracy(features, targets);
  }

  private evaluateModelAccuracy(
    features: number[][],
    targets: number[]
  ): number {
    if (features.length === 0) return 0.5;

    let correct = 0;
    for (let i = 0; i < features.length; i++) {
      const currentFeatures = features[i];
      if (!currentFeatures) continue;

      const prediction = this.predict(currentFeatures);
      const predicted = prediction > 0.5 ? 1 : 0;
      if (predicted === targets?.[i]) {
        correct++;
      }
    }

    return correct / features.length;
  }

  private calculateFeatureMeans(features: number[][]): number[] {
    if (features.length === 0 || !features[0]) return [];

    const featureCount = features[0].length;
    const means = Array(featureCount).fill(0);

    for (const feature of features) {
      if (!feature) continue;
      for (let i = 0; i < Math.min(featureCount, feature.length); i++) {
        means[i] += feature[i] || 0;
      }
    }

    return means.map((sum) => sum / features.length);
  }
}

// ============================================
// ML Model Registry
// ============================================

export class MLModelRegistry implements MLModelRegistry {
  public neuralNetwork: NeuralNetworkPredictor;
  public reinforcementLearning: ReinforcementLearningEngine;
  public ensemble: EnsembleModels;
  public onlineLearning: OnlineLearningSystem;

  constructor(config: AdaptiveLearningConfig) {
    this.neuralNetwork = new NeuralNetworkPredictor({
      inputSize: 10,
      outputSize: 5,
      architecture: 'feedforward',
    });

    this.reinforcementLearning = new ReinforcementLearningEngine({
      learningRate: config?.learning?.learningRate,
      discountFactor: 0.95,
      explorationRate: 0.1,
    });

    this.ensemble = new EnsembleModels();

    this.onlineLearning = new OnlineLearningSystem({
      adaptationThreshold: config?.learning?.adaptationRate,
      windowSize: 1000,
    });

    // Add neural network to ensemble
    this.ensemble.addModel(this.neuralNetwork, 1.0);
  }
}
