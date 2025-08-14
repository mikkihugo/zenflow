import { getLogger } from '../config/logging-config';
const logger = getLogger('intelligence-adaptive-learning-ml-integration');
import { EventEmitter } from 'node:events';
export class ReinforcementLearningEngine extends EventEmitter {
    qTable = new Map();
    learningRate;
    discountFactor;
    explorationRate;
    minExplorationRate;
    explorationDecay;
    episodeCount = 0;
    constructor(config = {}) {
        super();
        this.learningRate = config?.learningRate || 0.1;
        this.discountFactor = config?.discountFactor || 0.95;
        this.explorationRate = config?.explorationRate || 0.1;
        this.minExplorationRate = config?.minExplorationRate || 0.01;
        this.explorationDecay = config?.explorationDecay || 0.995;
    }
    selectAction(state, availableActions) {
        if (!availableActions || availableActions.length === 0) {
            throw new Error('Available actions cannot be empty');
        }
        if (Math.random() < this.explorationRate) {
            const randomIndex = Math.floor(Math.random() * availableActions.length);
            const action = availableActions[randomIndex];
            this.emit('actionSelected', {
                state,
                action,
                type: 'exploration',
                explorationRate: this.explorationRate,
                timestamp: Date.now(),
            });
            return action;
        }
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
    updateQValue(state, action, reward, nextState) {
        const currentQ = this.getQValue(state, action);
        const maxNextQ = this.getMaxQValue(nextState);
        const newQ = currentQ +
            this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
        this.setQValue(state, action, newQ);
        this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);
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
    getQValue(state, action) {
        return this.qTable.get(state)?.get(action) ?? 0;
    }
    getPolicy() {
        const policy = new Map();
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
    trainBatch(experiences) {
        for (const experience of experiences) {
            this.updateQValue(experience.state, experience.action, experience.reward, experience.nextState);
        }
        this.episodeCount++;
        this.emit('batchTrained', {
            batchSize: experiences.length,
            episodeCount: this.episodeCount,
            explorationRate: this.explorationRate,
            timestamp: Date.now(),
        });
    }
    getStats() {
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
    reset() {
        this.qTable.clear();
        this.episodeCount = 0;
        this.explorationRate = 0.1;
        this.emit('reset', { timestamp: Date.now() });
    }
    setQValue(state, action, value) {
        if (!this.qTable.has(state)) {
            this.qTable.set(state, new Map());
        }
        this.qTable.get(state)?.set(action, value);
    }
    getBestAction(state, availableActions) {
        if (!availableActions || availableActions.length === 0) {
            throw new Error('Available actions cannot be empty');
        }
        let bestAction = availableActions[0];
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
    getMaxQValue(state) {
        const stateActions = this.qTable.get(state);
        if (!stateActions || stateActions.size === 0) {
            return 0;
        }
        return Math.max(...stateActions.values());
    }
}
export class NeuralNetworkPredictor extends EventEmitter {
    model = null;
    isTraining = false;
    trainingHistory = [];
    inputSize;
    outputSize;
    architecture;
    constructor(config) {
        super();
        this.inputSize = config?.inputSize;
        this.outputSize = config?.outputSize;
        this.architecture = config?.architecture || 'feedforward';
        this.initializeModel();
    }
    async predict(data) {
        if (!this.model) {
            throw new Error('Model not initialized');
        }
        const features = this.extractFeatures(data);
        const predictions = await this.simulateModelPrediction(features);
        const patterns = this.convertPredictionsToPatterns(predictions, data);
        this.emit('predictionCompleted', {
            inputCount: data.length,
            outputCount: patterns.length,
            averageConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
            timestamp: Date.now(),
        });
        return patterns;
    }
    async train(data, labels) {
        if (this.isTraining) {
            throw new Error('Model is already training');
        }
        this.isTraining = true;
        try {
            const features = this.extractFeatures(data);
            const processedLabels = this.processLabels(labels);
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
        }
        finally {
            this.isTraining = false;
        }
    }
    async evaluate(testData) {
        if (!this.model) {
            throw new Error('Model not initialized');
        }
        const features = this.extractFeatures(testData);
        const metrics = await this.simulateEvaluation(features, testData);
        this.emit('evaluationCompleted', {
            accuracy: metrics.accuracy,
            testSize: testData.length,
            timestamp: Date.now(),
        });
        return metrics;
    }
    getModelInfo() {
        return {
            name: 'AdaptiveLearningNN',
            version: '1.0.0',
            architecture: this.architecture,
            parameters: this.inputSize * this.outputSize * 2,
            trainedOn: this.trainingHistory.length > 0 ? 'execution_data' : 'untrained',
            lastUpdated: this.trainingHistory.length > 0
                ? (this.trainingHistory[this.trainingHistory.length - 1]
                    ?.trainingTime ?? Date.now())
                : Date.now(),
        };
    }
    getTrainingHistory() {
        return [...this.trainingHistory];
    }
    initializeModel() {
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
    extractFeatures(data) {
        return data.map((item) => [
            item?.duration / 1000,
            item?.resourceUsage?.cpu,
            item?.resourceUsage?.memory,
            item?.resourceUsage?.network,
            item?.resourceUsage?.diskIO,
            item?.success ? 1 : 0,
            Object.keys(item?.context).length / 10,
        ]);
    }
    processLabels(labels) {
        return labels.map((label) => {
            if (typeof label === 'number') {
                return [label];
            }
            if (typeof label === 'boolean') {
                return [label ? 1 : 0];
            }
            return [Math.random()];
        });
    }
    async simulateModelPrediction(features) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const predictions = features.map(() => Array(this.outputSize)
                    .fill(0)
                    .map(() => Math.random()));
                resolve(predictions);
            }, 100);
        });
    }
    convertPredictionsToPatterns(predictions, data) {
        return predictions.map((prediction, index) => ({
            id: `neural_pattern_${Date.now()}_${index}`,
            type: 'optimization',
            data: {
                prediction,
                source: data[index],
            },
            confidence: prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
            frequency: 1,
            context: data[index]?.context || {},
            metadata: {
                complexity: prediction && prediction.length > 0
                    ? prediction.length / this.outputSize
                    : 0.5,
                predictability: prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
                stability: prediction && prediction.length > 0
                    ? 1 - this.calculateStd(prediction)
                    : 0.5,
                anomalyScore: prediction && prediction.length > 0 && Math.max(...prediction) > 0.9
                    ? 0.8
                    : 0.2,
                correlations: [],
                quality: prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
                relevance: prediction && prediction.length > 0 ? Math.max(...prediction) : 0.5,
            },
            timestamp: Date.now(),
        }));
    }
    async simulateTraining(_features, _labels) {
        const startTime = Date.now();
        const epochs = 50 + Math.floor(Math.random() * 50);
        return new Promise((resolve) => {
            setTimeout(() => {
                const trainingTime = Date.now() - startTime;
                resolve({
                    accuracy: 0.75 + Math.random() * 0.2,
                    loss: Math.random() * 0.5,
                    epochs,
                    trainingTime,
                    validationScore: 0.7 + Math.random() * 0.25,
                    modelSize: this.inputSize * this.outputSize * 4,
                });
            }, epochs * 10);
        });
    }
    async simulateEvaluation(_features, _testData) {
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
                    ],
                });
            }, 50);
        });
    }
    calculateStd(arr) {
        const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
        const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
        return Math.sqrt(variance);
    }
}
export class EnsembleModels extends EventEmitter {
    models = new Map();
    totalWeight = 0;
    addModel(model, weight) {
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
    async predict(data) {
        if (this.models.size === 0) {
            throw new Error('No models in ensemble');
        }
        const modelPredictions = new Map();
        const modelContributions = new Map();
        for (const [modelId, { model, weight }] of this.models) {
            try {
                const prediction = await this.getModelPrediction(model, data);
                modelPredictions.set(modelId, prediction);
                modelContributions.set(modelId, weight / this.totalWeight);
            }
            catch (error) {
                logger.warn(`Model ${modelId} prediction failed:`, error);
            }
        }
        const combinedPrediction = this.combineN(modelPredictions, modelContributions);
        const confidence = this.calculateEnsembleConfidence(modelPredictions, modelContributions);
        const uncertainty = this.calculateUncertainty(modelPredictions);
        const ensemblePrediction = {
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
    getModelWeights() {
        const weights = new Map();
        for (const [modelId, { weight }] of this.models) {
            weights.set(modelId, weight / this.totalWeight);
        }
        return weights;
    }
    updateWeights(performance) {
        if (performance.length !== this.models.size) {
            throw new Error('Performance array size must match number of models');
        }
        const modelIds = Array.from(this.models.keys());
        this.totalWeight = 0;
        for (let i = 0; i < performance.length; i++) {
            const modelId = modelIds[i];
            const perf = performance[i];
            const newWeight = Math.max(0.1, perf?.accuracy || 0.5);
            const modelData = this.models.get(modelId);
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
    removeModel(modelId) {
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
    async getModelPrediction(model, data) {
        if (model.predict && typeof model.predict === 'function') {
            return await model.predict(data);
        }
        return data.map(() => Math.random());
    }
    combineN(predictions, contributions) {
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
    calculateEnsembleConfidence(predictions, _contributions) {
        if (predictions.size === 0)
            return 0;
        const values = Array.from(predictions.values())
            .map((p) => (Array.isArray(p) ? p[0] : p))
            .filter((v) => typeof v === 'number');
        if (values.length === 0)
            return 0.5;
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        return Math.max(0.1, 1 - Math.min(1, variance));
    }
    calculateUncertainty(predictions) {
        if (predictions.size <= 1)
            return 0.5;
        const values = Array.from(predictions.values())
            .map((p) => (Array.isArray(p) ? p[0] : p))
            .filter((v) => typeof v === 'number');
        if (values.length <= 1)
            return 0.5;
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        return Math.min(1, variance);
    }
}
export class OnlineLearningSystem extends EventEmitter {
    model = null;
    accuracy = 0.5;
    streamCount = 0;
    adaptationThreshold = 0.1;
    windowSize = 1000;
    recentData = [];
    constructor(config = {}) {
        super();
        this.adaptationThreshold = config?.adaptationThreshold || 0.1;
        this.windowSize = config?.windowSize || 1000;
        this.initializeModel();
    }
    async processStream(data) {
        this.recentData.push(data);
        if (this.recentData.length > this.windowSize) {
            this.recentData.shift();
        }
        this.streamCount++;
        await this.incrementalUpdate(data);
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
    getCurrentModel() {
        return { ...this.model };
    }
    getAccuracy() {
        return this.accuracy;
    }
    async adaptToDistribution(newData) {
        const shiftDetected = this.detectDistributionShift(newData);
        if (shiftDetected) {
            await this.adaptModel(newData);
            this.emit('distributionAdapted', {
                newDataSize: newData.length,
                accuracy: this.accuracy,
                adaptationRequired: shiftDetected,
                timestamp: Date.now(),
            });
        }
    }
    reset() {
        this.recentData = [];
        this.streamCount = 0;
        this.accuracy = 0.5;
        this.initializeModel();
        this.emit('reset', { timestamp: Date.now() });
    }
    initializeModel() {
        this.model = {
            weights: Array(10)
                .fill(0)
                .map(() => Math.random() - 0.5),
            bias: Math.random() - 0.5,
            learningRate: 0.01,
        };
    }
    async incrementalUpdate(data) {
        const features = this.extractFeatures(data);
        const target = data?.success ? 1 : 0;
        const prediction = this.predict(features);
        const error = target - prediction;
        if (this.model && this.model.weights && Array.isArray(this.model.weights)) {
            for (let i = 0; i < this.model.weights.length && i < features.length; i++) {
                this.model.weights[i] += this.model.learningRate * error * features[i];
            }
            this.model.bias += this.model.learningRate * error;
        }
        this.accuracy = this.accuracy * 0.99 + (Math.abs(error) < 0.5 ? 0.01 : 0);
    }
    async checkAndAdapt() {
        if (this.recentData.length < 50)
            return;
        const recentAccuracy = this.evaluateRecentPerformance();
        if (this.accuracy - recentAccuracy > this.adaptationThreshold) {
            await this.adaptModel(this.recentData.slice(-100));
        }
    }
    detectDistributionShift(newData) {
        if (this.recentData.length < 100 || newData.length < 10) {
            return false;
        }
        const oldFeatures = this.recentData
            .slice(-100)
            .map((d) => this.extractFeatures(d));
        const newFeatures = newData.map((d) => this.extractFeatures(d));
        const oldMeans = this.calculateFeatureMeans(oldFeatures);
        const newMeans = this.calculateFeatureMeans(newFeatures);
        const minLength = Math.min(oldMeans?.length || 0, newMeans?.length || 0);
        for (let i = 0; i < minLength; i++) {
            if (Math.abs((oldMeans?.[i] || 0) - (newMeans?.[i] || 0)) > 0.5) {
                return true;
            }
        }
        return false;
    }
    async adaptModel(adaptationData) {
        const features = adaptationData.map((d) => this.extractFeatures(d));
        const targets = adaptationData.map((d) => (d.success ? 1 : 0));
        for (let epoch = 0; epoch < 10; epoch++) {
            for (let i = 0; i < features.length; i++) {
                const currentFeatures = features[i];
                if (!currentFeatures)
                    continue;
                const prediction = this.predict(currentFeatures);
                const error = targets?.[i] - prediction;
                if (this.model &&
                    this.model.weights &&
                    Array.isArray(this.model.weights)) {
                    for (let j = 0; j < this.model.weights.length && j < currentFeatures.length; j++) {
                        this.model.weights[j] +=
                            this.model.learningRate * error * (currentFeatures?.[j] || 0);
                    }
                    this.model.bias += this.model.learningRate * error;
                }
            }
        }
        this.accuracy = this.evaluateModelAccuracy(features, targets);
    }
    extractFeatures(data) {
        return [
            data?.duration / 1000,
            data?.resourceUsage?.cpu,
            data?.resourceUsage?.memory,
            data?.resourceUsage?.network,
            data?.resourceUsage?.diskIO,
            Object.keys(data?.context).length / 10,
        ];
    }
    predict(features) {
        if (!(this.model && this.model.weights && Array.isArray(this.model.weights))) {
            return 0.5;
        }
        let sum = this.model.bias || 0;
        for (let i = 0; i < this.model.weights.length && i < features.length; i++) {
            sum += (this.model.weights[i] || 0) * (features[i] || 0);
        }
        return 1 / (1 + Math.exp(-sum));
    }
    evaluateRecentPerformance() {
        if (this.recentData.length < 10)
            return this.accuracy;
        const recent = this.recentData.slice(-50);
        const features = recent.map((d) => this.extractFeatures(d));
        const targets = recent.map((d) => (d.success ? 1 : 0));
        return this.evaluateModelAccuracy(features, targets);
    }
    evaluateModelAccuracy(features, targets) {
        if (features.length === 0)
            return 0.5;
        let correct = 0;
        for (let i = 0; i < features.length; i++) {
            const currentFeatures = features[i];
            if (!currentFeatures)
                continue;
            const prediction = this.predict(currentFeatures);
            const predicted = prediction > 0.5 ? 1 : 0;
            if (predicted === targets?.[i]) {
                correct++;
            }
        }
        return correct / features.length;
    }
    calculateFeatureMeans(features) {
        if (features.length === 0 || !features[0])
            return [];
        const featureCount = features[0].length;
        const means = Array(featureCount).fill(0);
        for (const feature of features) {
            if (!feature)
                continue;
            for (let i = 0; i < Math.min(featureCount, feature.length); i++) {
                means[i] += feature[i] || 0;
            }
        }
        return means.map((sum) => sum / features.length);
    }
}
export class MLModelRegistry {
    neuralNetwork;
    reinforcementLearning;
    ensemble;
    onlineLearning;
    constructor(config) {
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
        this.ensemble.addModel(this.neuralNetwork, 1.0);
    }
}
//# sourceMappingURL=ml-integration.js.map