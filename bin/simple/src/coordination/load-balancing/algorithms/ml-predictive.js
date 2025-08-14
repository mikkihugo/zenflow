import { getLogger } from '../config/logging-config';
const logger = getLogger('coordination-load-balancing-algorithms-ml-predictive');
export class MLPredictiveAlgorithm {
    name = 'ml_predictive';
    models = new Map();
    historicalData = [];
    modelPerformance = new Map();
    predictionEngine;
    config = {
        modelTypes: ['linear', 'neural', 'ensemble'],
        maxHistorySize: 10000,
        minTrainingData: 100,
        retrainingInterval: 3600000,
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
    constructor(predictionEngine) {
        this.predictionEngine = predictionEngine || new DefaultPredictionEngine();
        this.initializeModels();
    }
    async selectAgent(task, availableAgents, metrics) {
        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }
        const predictions = await this.generatePredictions(task, availableAgents, metrics);
        const viablePredictions = predictions.filter((p) => p.confidenceScore >= this.config.predictionThreshold);
        if (viablePredictions.length === 0) {
            return this.fallbackSelection(task, availableAgents, metrics);
        }
        const scoredPredictions = viablePredictions.map((pred) => ({
            ...pred,
            compositeScore: this.calculateCompositeScore(pred, task),
        }));
        scoredPredictions.sort((a, b) => b.compositeScore - a.compositeScore);
        const bestPrediction = scoredPredictions[0];
        const selectedAgent = availableAgents.find((a) => a.id === bestPrediction.agentId);
        const alternatives = scoredPredictions
            .slice(1, 4)
            .map((p) => availableAgents.find((a) => a.id === p.agentId))
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
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        if (config?.modelEnsembleWeights || config?.adaptiveLearningRate) {
            await this.retrainModels();
        }
    }
    async getPerformanceMetrics() {
        const performances = Array.from(this.modelPerformance.values());
        const avgAccuracy = performances.length > 0
            ? performances.reduce((sum, p) => sum + p.accuracy, 0) /
                performances.length
            : 0;
        const avgPrecision = performances.length > 0
            ? performances.reduce((sum, p) => sum + p.precision, 0) /
                performances.length
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
    async onTaskComplete(agentId, task, duration, success) {
        const historicalEntry = {
            timestamp: new Date(),
            agentId,
            taskType: task.type,
            duration,
            success,
            resourceUsage: this.createResourceUsageSnapshot(agentId),
        };
        this.historicalData.push(historicalEntry);
        if (this.historicalData.length > this.config.maxHistorySize) {
            this.historicalData.shift();
        }
        if (this.shouldRetrain()) {
            await this.retrainModels();
        }
        await this.updateModelPerformance(agentId, task, duration, success);
    }
    async onAgentFailure(agentId, _error) {
        const failureData = {
            timestamp: new Date(),
            agentId,
            taskType: 'system_failure',
            duration: 0,
            success: false,
            resourceUsage: this.createEmptyResourceUsage(),
        };
        this.historicalData.push(failureData);
        await this.updateAgentReliabilityModel(agentId, false);
    }
    async initializeModels() {
        for (const modelType of this.config.modelTypes) {
            const model = {
                modelType,
                accuracy: 0.5,
                features: this.getDefaultFeatures(),
                lastTraining: new Date(),
                version: '1.0.0',
            };
            this.models.set(modelType, model);
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
    async generatePredictions(task, availableAgents, metrics) {
        const predictions = [];
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
    extractFeatures(task, agent, metrics) {
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
    async predictAgentPerformance(features) {
        const predictions = new Map();
        const weights = this.config.modelEnsembleWeights;
        for (const [modelType, _model] of this.models) {
            try {
                const prediction = await this.predictionEngine.predict(this.normalizeFeatures(features));
                predictions.set(modelType, prediction);
            }
            catch (error) {
                logger.warn(`Model ${modelType} prediction failed:`, error);
            }
        }
        if (predictions.size === 0) {
            return this.heuristicPrediction(features);
        }
        let weightedLatency = 0;
        let weightedSuccessRate = 0;
        let totalWeight = 0;
        for (const [modelType, prediction] of predictions) {
            const weight = weights[modelType] || 0;
            weightedLatency += prediction.latency * weight;
            weightedSuccessRate += prediction.successRate * weight;
            totalWeight += weight;
        }
        if (totalWeight > 0) {
            weightedLatency /= totalWeight;
            weightedSuccessRate /= totalWeight;
        }
        const confidence = this.calculatePredictionConfidence(predictions);
        const featureImportance = this.calculateFeatureImportance(features);
        return {
            latency: Math.max(100, weightedLatency),
            successRate: Math.max(0.1, Math.min(1.0, weightedSuccessRate)),
            confidence,
            featureImportance,
        };
    }
    calculateCompositeScore(prediction, task) {
        const latencyWeight = task.priority > 3 ? 0.6 : 0.4;
        const successWeight = task.priority > 3 ? 0.3 : 0.4;
        const confidenceWeight = 0.1;
        const latencyScore = Math.max(0, 1 - prediction.predictedLatency / 10000);
        return (latencyScore * latencyWeight +
            prediction.predictedSuccessRate * successWeight +
            prediction.confidenceScore * confidenceWeight);
    }
    async retrainModels() {
        if (this.historicalData.length < this.config.minTrainingData) {
            return;
        }
        const trainingData = this.prepareTrainingData();
        for (const [modelType, model] of this.models) {
            try {
                await this.predictionEngine.train(trainingData);
                model.lastTraining = new Date();
                model.version = this.generateModelVersion(model.version);
                await this.evaluateModel(modelType, trainingData);
            }
            catch (error) {
                logger.error(`Failed to retrain model ${modelType}:`, error);
            }
        }
    }
    prepareTrainingData() {
        return this.historicalData.map((entry) => ({
            features: this.extractFeaturesFromHistorical(entry),
            target: {
                latency: entry.duration,
                success: entry.success ? 1 : 0,
            },
        }));
    }
    shouldRetrain() {
        const lastRetraining = this.getLastRetrainingTime();
        const timeSinceRetraining = Date.now() - lastRetraining;
        return (timeSinceRetraining > this.config.retrainingInterval ||
            this.historicalData.length % 500 === 0);
    }
    fallbackSelection(_task, availableAgents, metrics) {
        let bestAgent = availableAgents[0];
        let bestScore = 0;
        for (const agent of availableAgents) {
            const agentMetrics = metrics.get(agent.id);
            if (!agentMetrics)
                continue;
            const score = (1 - agentMetrics.errorRate) * 0.4 +
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
            alternativeAgents: availableAgents
                .filter((a) => a.id !== bestAgent.id)
                .slice(0, 2),
            estimatedLatency: metrics.get(bestAgent.id)?.responseTime || 1000,
            expectedQuality: 0.7,
        };
    }
    getDefaultFeatures() {
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
    getHistoricalSuccessRate(agentId, taskType) {
        const relevantData = this.historicalData.filter((entry) => entry.agentId === agentId && entry.taskType === taskType);
        if (relevantData.length === 0)
            return 0.8;
        const successes = relevantData?.filter((entry) => entry.success).length;
        return successes / relevantData.length;
    }
    calculateAgentCapability(agent, task) {
        const matchingCapabilities = task.requiredCapabilities.filter((cap) => agent.capabilities.includes(cap)).length;
        return task.requiredCapabilities.length > 0
            ? matchingCapabilities / task.requiredCapabilities.length
            : 1.0;
    }
    normalizeFeatures(features) {
        return {
            taskPriority: features.taskPriority / 5,
            estimatedDuration: Math.min(1, features.estimatedDuration / 300000),
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
    heuristicPrediction(features) {
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
    calculatePredictionConfidence(predictions) {
        if (predictions.size < 2)
            return 0.5;
        const latencies = Array.from(predictions.values()).map((p) => p.latency);
        const successRates = Array.from(predictions.values()).map((p) => p.successRate);
        const latencyVariance = this.calculateVariance(latencies);
        const successVariance = this.calculateVariance(successRates);
        const confidence = Math.max(0.1, 1 - (latencyVariance + successVariance) / 2);
        return Math.min(1.0, confidence);
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
        return variance;
    }
    calculateFeatureImportance(_features) {
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
    createResourceUsageSnapshot(_agentId) {
        return {
            timestamp: new Date(),
            cpuUsage: Math.random() * 0.8,
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
    createEmptyResourceUsage() {
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
    async updateModelPerformance(_agentId, _task, _duration, _success) {
    }
    async updateAgentReliabilityModel(_agentId, _reliable) {
    }
    extractFeaturesFromHistorical(entry) {
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
    async evaluateModel(_modelType, _trainingData) {
    }
    getLastRetrainingTime() {
        let lastRetraining = 0;
        for (const model of this.models.values()) {
            lastRetraining = Math.max(lastRetraining, model.lastTraining.getTime());
        }
        return lastRetraining;
    }
    generateModelVersion(currentVersion) {
        const parts = currentVersion?.split('.');
        const patch = (Number.parseInt(parts[2]) + 1);
        return `${parts[0]}.${parts[1]}.${patch}`;
    }
    async calculateCacheHitRate() {
        return 0.85;
    }
}
class DefaultPredictionEngine {
    async predict(features) {
        const weights = {
            currentLoad: -200,
            avgResponseTime: 0.5,
            errorRate: 1000,
            cpuUsage: 300,
            memoryUsage: 200,
            taskPriority: -50,
        };
        let prediction = 1000;
        for (const [feature, value] of Object.entries(features)) {
            if (weights[feature]) {
                prediction += weights[feature] * value;
            }
        }
        return Math.max(100, prediction);
    }
    async train(data) {
        this.model = { trained: true, dataSize: data.length };
    }
    async getModel() {
        return {
            modelType: 'linear',
            accuracy: 0.85,
            features: ['currentLoad', 'avgResponseTime', 'errorRate'],
            lastTraining: new Date(),
            version: '1.0.0',
        };
    }
    async updateModel(model) {
        this.model = model;
    }
    async getAccuracy() {
        return 0.85;
    }
}
//# sourceMappingURL=ml-predictive.js.map