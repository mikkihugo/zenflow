/**
 * @file Ml-integration implementation.
 */
/**
 * Machine Learning Integration.
 *
 * Provides ML capabilities including neural networks, reinforcement learning,
 * ensemble models, and online learning for the adaptive learning system.
 */
import { EventEmitter } from 'node:events';
import type { AdaptiveLearningConfig, EnsemblePrediction, EvaluationMetrics, ExecutionData, EnsembleModels as IEnsembleModels, NeuralNetworkPredictor as INeuralNetworkPredictor, OnlineLearningSystem as IOnlineLearningSystem, ReinforcementLearningEngine as IReinforcementLearningEngine, ModelInfo, Pattern, TrainingResult } from './types.ts';
export declare class ReinforcementLearningEngine extends EventEmitter implements IReinforcementLearningEngine {
    private qTable;
    private learningRate;
    private discountFactor;
    private explorationRate;
    private minExplorationRate;
    private explorationDecay;
    private episodeCount;
    constructor(config?: {
        learningRate?: number;
        discountFactor?: number;
        explorationRate?: number;
        minExplorationRate?: number;
        explorationDecay?: number;
    });
    /**
     * Select action using epsilon-greedy policy.
     *
     * @param state
     * @param availableActions
     */
    selectAction(state: string, availableActions: string[]): string;
    /**
     * Update Q-value using Q-learning algorithm.
     *
     * @param state
     * @param action
     * @param reward
     * @param nextState
     */
    updateQValue(state: string, action: string, reward: number, nextState: string): void;
    /**
     * Get Q-value for state-action pair.
     *
     * @param state
     * @param action
     */
    getQValue(state: string, action: string): number;
    /**
     * Get current policy (best action for each state).
     */
    getPolicy(): Map<string, string>;
    /**
     * Train on batch of experiences.
     *
     * @param experiences
     */
    trainBatch(experiences: Array<{
        state: string;
        action: string;
        reward: number;
        nextState: string;
        done: boolean;
    }>): void;
    /**
     * Get learning statistics.
     */
    getStats(): {
        episodeCount: number;
        explorationRate: number;
        stateCount: number;
        averageQValue: number;
        maxQValue: number;
    };
    /**
     * Reset learning state.
     */
    reset(): void;
    private setQValue;
    private getBestAction;
    private getMaxQValue;
}
export declare class NeuralNetworkPredictor extends EventEmitter implements INeuralNetworkPredictor {
    private model;
    private isTraining;
    private trainingHistory;
    private inputSize;
    private outputSize;
    private architecture;
    constructor(config: {
        inputSize: number;
        outputSize: number;
        architecture?: string;
    });
    /**
     * Predict patterns from execution data.
     *
     * @param data
     */
    predict(data: ExecutionData[]): Promise<Pattern[]>;
    /**
     * Train the neural network.
     *
     * @param data
     * @param labels
     */
    train(data: ExecutionData[], labels: any[]): Promise<TrainingResult>;
    /**
     * Evaluate model performance.
     *
     * @param testData
     */
    evaluate(testData: ExecutionData[]): Promise<EvaluationMetrics>;
    /**
     * Get model information.
     */
    getModelInfo(): ModelInfo;
    /**
     * Get training history.
     */
    getTrainingHistory(): TrainingResult[];
    private initializeModel;
    private extractFeatures;
    private processLabels;
    private simulateModelPrediction;
    private convertPredictionsToPatterns;
    private simulateTraining;
    private simulateEvaluation;
    private calculateStd;
}
export declare class EnsembleModels extends EventEmitter implements IEnsembleModels {
    private models;
    private totalWeight;
    /**
     * Add a model to the ensemble.
     *
     * @param model
     * @param weight
     */
    addModel(model: any, weight: number): void;
    /**
     * Make ensemble prediction.
     *
     * @param data
     */
    predict(data: ExecutionData[]): Promise<EnsemblePrediction>;
    /**
     * Get model weights.
     */
    getModelWeights(): Map<string, number>;
    /**
     * Update model weights based on performance.
     *
     * @param performance
     */
    updateWeights(performance: any[]): void;
    /**
     * Remove model from ensemble.
     *
     * @param modelId
     */
    removeModel(modelId: string): boolean;
    private getModelPrediction;
    private combineN;
    private calculateEnsembleConfidence;
    private calculateUncertainty;
}
export declare class OnlineLearningSystem extends EventEmitter implements IOnlineLearningSystem {
    private model;
    private accuracy;
    private streamCount;
    private adaptationThreshold;
    private windowSize;
    private recentData;
    constructor(config?: {
        adaptationThreshold?: number;
        windowSize?: number;
    });
    /**
     * Process streaming data.
     *
     * @param data
     */
    processStream(data: ExecutionData): Promise<void>;
    /**
     * Get current model.
     */
    getCurrentModel(): any;
    /**
     * Get current accuracy.
     */
    getAccuracy(): number;
    /**
     * Adapt to new data distribution.
     *
     * @param newData
     */
    adaptToDistribution(newData: ExecutionData[]): Promise<void>;
    /**
     * Reset online learning.
     */
    reset(): void;
    private initializeModel;
    private incrementalUpdate;
    private checkAndAdapt;
    private detectDistributionShift;
    private adaptModel;
    private extractFeatures;
    private predict;
    private evaluateRecentPerformance;
    private evaluateModelAccuracy;
    private calculateFeatureMeans;
}
export declare class MLModelRegistry implements MLModelRegistry {
    neuralNetwork: INeuralNetworkPredictor;
    reinforcementLearning: IReinforcementLearningEngine;
    ensemble: IEnsembleModels;
    onlineLearning: IOnlineLearningSystem;
    constructor(config: AdaptiveLearningConfig);
}
//# sourceMappingURL=ml-integration.d.ts.map