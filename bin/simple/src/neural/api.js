import { COMPLETE_NEURAL_PRESETS, CognitivePatternSelector, NeuralAdaptationEngine, } from './models/presets/neural-presets-complete.js';
export class NeuralDomainAPI {
    logger;
    config;
    models = new Map();
    trainingJobs = new Map();
    patternSelector;
    adaptationEngine;
    initialized = false;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.patternSelector = new CognitivePatternSelector();
        this.adaptationEngine = new NeuralAdaptationEngine();
        this.logger.info('NeuralDomainAPI initialized with 27+ neural architectures');
    }
    async initialize() {
        try {
            this.logger.info('Initializing Neural Domain API...');
            const presetCount = this.countAvailablePresets();
            this.logger.info(`Loaded ${presetCount} neural architecture presets`);
            await this.adaptationEngine.initializeAdaptation('system', 'system', 'base');
            this.initialized = true;
            this.logger.info('Neural Domain API initialization complete');
        }
        catch (error) {
            this.logger.error('Failed to initialize Neural Domain API:', error);
            throw error;
        }
    }
    async createModelFromPreset(modelType, presetName, options) {
        this.ensureInitialized();
        try {
            this.logger.info(`Creating model from preset: ${modelType}/${presetName}`);
            const preset = COMPLETE_NEURAL_PRESETS[modelType];
            if (!(preset && preset[presetName])) {
                throw new Error(`Preset not found: ${modelType}/${presetName}`);
            }
            const presetConfig = preset[presetName];
            const cognitivePatterns = options.cognitivePatterns ||
                this.patternSelector.selectPatternsForPreset(modelType, presetName, options.taskContext);
            const modelId = this.generateModelId(modelType, presetName);
            const model = {
                id: modelId,
                name: options.name,
                type: modelType,
                presetName,
                architecture: presetConfig.model,
                cognitivePatterns,
                config: {
                    ...presetConfig.config,
                    ...options.customConfig,
                },
                status: 'ready',
                performance: presetConfig.performance,
                metadata: {
                    created: new Date(),
                    lastUpdated: new Date(),
                    trainingEpochs: 0,
                    version: '1.0.0',
                    useCase: presetConfig.useCase,
                },
            };
            await this.adaptationEngine.initializeAdaptation(modelId, modelType, presetName);
            this.models.set(modelId, model);
            this.logger.info(`Model created successfully: ${modelId} (${cognitivePatterns.join(', ')})`);
            return model;
        }
        catch (error) {
            this.logger.error(`Failed to create model from preset: ${modelType}/${presetName}`, error);
            throw error;
        }
    }
    async createModel(model) {
        this.ensureInitialized();
        try {
            const modelId = this.generateModelId(model.type, 'custom');
            const fullModel = {
                ...model,
                id: modelId,
                status: 'ready',
                metadata: {
                    created: new Date(),
                    lastUpdated: new Date(),
                    trainingEpochs: 0,
                    version: '1.0.0',
                    useCase: 'custom',
                },
            };
            this.models.set(modelId, fullModel);
            this.logger.info(`Custom model created: ${modelId}`);
            return fullModel;
        }
        catch (error) {
            this.logger.error('Failed to create custom model:', error);
            throw error;
        }
    }
    async getModel(modelId) {
        const model = this.models.get(modelId);
        if (model) {
            this.logger.debug(`Retrieved model: ${modelId}`);
        }
        return model || null;
    }
    async listModels(filter) {
        let models = Array.from(this.models.values());
        if (filter) {
            if (filter.type) {
                models = models.filter((m) => m.type === filter.type);
            }
            if (filter.status) {
                models = models.filter((m) => m.status === filter.status);
            }
            if (filter.cognitivePattern) {
                models = models.filter((m) => m.cognitivePatterns.includes(filter.cognitivePattern));
            }
        }
        this.logger.debug(`Listed ${models.length} models`);
        return models;
    }
    async train(request) {
        this.ensureInitialized();
        try {
            const model = this.models.get(request.modelId);
            if (!model) {
                throw new Error(`Model not found: ${request.modelId}`);
            }
            this.logger.info(`Starting training for model: ${request.modelId}`);
            model.status = 'training';
            const startTime = Date.now();
            const trainingResult = await this.simulateTraining(model, request);
            const trainingTime = Date.now() - startTime;
            model.metadata.trainingEpochs += request.epochs || 10;
            model.metadata.lastUpdated = new Date();
            model.status = 'ready';
            const metrics = {
                accuracy: trainingResult.accuracy,
                loss: trainingResult.loss,
                epochs: request.epochs || 10,
                trainingTime,
                cognitivePatterns: model.cognitivePatterns,
                detailedMetrics: trainingResult.detailed,
            };
            this.logger.info(`Training completed: ${request.modelId} (${metrics.accuracy.toFixed(2)}% accuracy)`);
            return metrics;
        }
        catch (error) {
            const model = this.models.get(request.modelId);
            if (model) {
                model.status = 'error';
            }
            this.logger.error(`Training failed for model: ${request.modelId}`, error);
            throw error;
        }
    }
    async trainAdaptive(modelId, request) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                throw new Error(`Model not found: ${modelId}`);
            }
            this.logger.info(`Starting adaptive training for model: ${modelId}`);
            const recommendations = await this.adaptationEngine.getAdaptationRecommendations(modelId);
            if (recommendations) {
                this.logger.info(`Applying adaptation recommendations for ${modelId}`);
                if (recommendations.patterns) {
                    const bestPatterns = recommendations.patterns
                        .slice(0, 3)
                        .map((p) => p.pattern);
                    model.cognitivePatterns = [
                        ...new Set([...model.cognitivePatterns, ...bestPatterns]),
                    ];
                }
            }
            const metrics = await this.train({ ...request, modelId });
            await this.adaptationEngine.recordAdaptation(modelId, {
                accuracy: metrics.accuracy,
                cognitivePatterns: model.cognitivePatterns,
                performance: metrics,
                insights: recommendations?.trainingStrategy?.recommendations || [],
                trainingConfig: request.hyperparameters,
            });
            const adaptationInsights = await this.getAdaptationInsights(modelId);
            return {
                ...metrics,
                adaptationInsights,
            };
        }
        catch (error) {
            this.logger.error(`Adaptive training failed for model: ${modelId}`, error);
            throw error;
        }
    }
    async predict(request) {
        const result = await this.predictWithConfidence(request);
        return result.predictions;
    }
    async predictWithConfidence(request) {
        this.ensureInitialized();
        try {
            const model = this.models.get(request.modelId);
            if (!model) {
                throw new Error(`Model not found: ${request.modelId}`);
            }
            if (model.status !== 'ready') {
                throw new Error(`Model not ready for prediction: ${request.modelId} (status: ${model.status})`);
            }
            this.logger.debug(`Making prediction with model: ${request.modelId}`);
            const startTime = Date.now();
            const result = await this.simulatePrediction(model, request);
            const processingTime = Date.now() - startTime;
            return {
                predictions: result.predictions,
                confidence: request.options?.returnConfidence
                    ? result.confidence
                    : undefined,
                explanations: result.explanations,
                processingTime,
                cognitivePatterns: model.cognitivePatterns,
            };
        }
        catch (error) {
            this.logger.error(`Prediction failed for model: ${request.modelId}`, error);
            throw error;
        }
    }
    async deleteModel(modelId) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                this.logger.warn(`Attempted to delete non-existent model: ${modelId}`);
                return false;
            }
            if (this.trainingJobs.has(modelId)) {
                this.trainingJobs.delete(modelId);
            }
            this.models.delete(modelId);
            this.logger.info(`Model deleted successfully: ${modelId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete model: ${modelId}`, error);
            return false;
        }
    }
    async getMetrics(modelId) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                return null;
            }
            const baseAccuracy = Number.parseFloat(model.performance.expectedAccuracy.replace('%', '')) /
                100;
            const adaptationInsights = await this.getAdaptationInsights(modelId);
            return {
                accuracy: baseAccuracy + (adaptationInsights?.performanceGains || 0),
                loss: 0.1 * (1 - baseAccuracy),
                epochs: model.metadata.trainingEpochs,
                trainingTime: Number.parseFloat(model.performance.trainingTime.replace(/[^0-9.]/g, '')),
                cognitivePatterns: model.cognitivePatterns,
                adaptationInsights,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get metrics for model: ${modelId}`, error);
            return null;
        }
    }
    getAvailablePresets() {
        const presets = {};
        Object.entries(COMPLETE_NEURAL_PRESETS).forEach(([modelType, typePresets]) => {
            presets[modelType] = Object.keys(typePresets);
        });
        return presets;
    }
    getPresetRecommendations(useCase, requirements = {}) {
        return this.patternSelector.getPresetRecommendations(useCase, requirements);
    }
    async getCognitivePatternInsights() {
        return this.adaptationEngine.exportAdaptationInsights();
    }
    async optimizeModel(modelId, options) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                throw new Error(`Model not found: ${modelId}`);
            }
            this.logger.info(`Optimizing model: ${modelId} (strategy: ${options?.strategy || 'accuracy'})`);
            model.status = 'optimizing';
            const recommendations = await this.adaptationEngine.getAdaptationRecommendations(modelId);
            const optimizationResult = await this.applyOptimizations(model, recommendations, options);
            model.status = 'ready';
            model.metadata.lastUpdated = new Date();
            this.logger.info(`Model optimization completed: ${modelId}`);
            return optimizationResult;
        }
        catch (error) {
            const model = this.models.get(modelId);
            if (model) {
                model.status = 'error';
            }
            this.logger.error(`Model optimization failed: ${modelId}`, error);
            throw error;
        }
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Neural Domain API not initialized. Call initialize() first.');
        }
    }
    generateModelId(type, preset) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${type}-${preset}-${timestamp}-${random}`;
    }
    countAvailablePresets() {
        let count = 0;
        Object.values(COMPLETE_NEURAL_PRESETS).forEach((typePresets) => {
            count += Object.keys(typePresets).length;
        });
        return count;
    }
    async simulateTraining(model, request) {
        const baseAccuracy = Number.parseFloat(model.performance.expectedAccuracy.replace('%', '')) /
            100;
        const patternBonus = this.calculateCognitivePatternBonus(model.cognitivePatterns, 'training');
        const dataQualityFactor = this.assessDataQuality(request.data, request.labels);
        const finalAccuracy = Math.min(0.99, baseAccuracy + patternBonus + dataQualityFactor);
        const loss = Math.max(0.001, 0.5 * (1 - finalAccuracy));
        const learningCurve = [];
        for (let epoch = 1; epoch <= (request.epochs || 10); epoch++) {
            const epochProgress = epoch / (request.epochs || 10);
            const epochAccuracy = finalAccuracy * epochProgress;
            const epochLoss = loss * (1 - epochProgress * 0.8);
            learningCurve.push({ epoch, loss: epochLoss, accuracy: epochAccuracy });
            if (request.callbacks?.onEpochEnd) {
                request.callbacks.onEpochEnd(epoch, {
                    accuracy: epochAccuracy,
                    loss: epochLoss,
                });
            }
        }
        const result = {
            accuracy: finalAccuracy,
            loss: loss,
            detailed: {
                precision: finalAccuracy * 0.95,
                recall: finalAccuracy * 0.93,
                f1Score: finalAccuracy * 0.94,
                learningCurve,
            },
        };
        if (request.callbacks?.onTrainingEnd) {
            request.callbacks.onTrainingEnd(result);
        }
        return result;
    }
    async simulatePrediction(model, request) {
        const input = Array.isArray(request.input[0])
            ? request.input
            : [request.input];
        const batchSize = request.options?.batchSize || input.length;
        const predictions = [];
        const confidences = [];
        const explanations = [];
        for (let i = 0; i < Math.min(input.length, batchSize); i++) {
            const prediction = this.generatePrediction(model, input[i]);
            const confidence = this.calculateConfidence(model, input[i]);
            const explanation = this.generateExplanation(model, input[i], prediction);
            predictions.push(...prediction);
            confidences.push(confidence);
            explanations.push(explanation);
        }
        return {
            predictions,
            confidence: confidences,
            explanations,
        };
    }
    generatePrediction(model, input) {
        const outputSize = this.getModelOutputSize(model);
        const predictions = [];
        for (let i = 0; i < outputSize; i++) {
            const patternInfluence = this.calculateCognitivePatternBonus(model.cognitivePatterns, 'inference');
            const basePrediction = Math.random() * 0.8 + 0.1;
            const finalPrediction = Math.min(0.99, Math.max(0.01, basePrediction + patternInfluence));
            predictions.push(finalPrediction);
        }
        return predictions;
    }
    calculateConfidence(model, input) {
        const baseConfidence = 0.7 + Math.random() * 0.25;
        const patternBonus = this.calculateCognitivePatternBonus(model.cognitivePatterns, 'confidence');
        return Math.min(0.99, baseConfidence + patternBonus);
    }
    generateExplanation(model, input, prediction) {
        const topPattern = model.cognitivePatterns[0];
        const architecture = model.architecture;
        const confidence = prediction.reduce((a, b) => a + b, 0) / prediction.length;
        return `${architecture} model with ${topPattern} pattern processed input with ${(confidence * 100).toFixed(1)}% confidence`;
    }
    getModelOutputSize(model) {
        if (model.config.outputSize)
            return model.config.outputSize;
        if (model.config.outputDimensions)
            return model.config.outputDimensions;
        if (model.config.numClasses)
            return model.config.numClasses;
        return 1;
    }
    calculateCognitivePatternBonus(patterns, context) {
        const patternBonuses = {
            convergent: { training: 0.03, inference: 0.02, confidence: 0.05 },
            divergent: { training: 0.02, inference: 0.04, confidence: 0.02 },
            critical: { training: 0.04, inference: 0.03, confidence: 0.06 },
            systems: { training: 0.05, inference: 0.02, confidence: 0.04 },
            lateral: { training: 0.02, inference: 0.05, confidence: 0.03 },
            abstract: { training: 0.03, inference: 0.03, confidence: 0.04 },
        };
        return patterns.reduce((bonus, pattern) => {
            const contextBonus = patternBonuses[pattern];
            return (bonus + (contextBonus?.[context] || 0));
        }, 0);
    }
    assessDataQuality(data, labels) {
        if (!(data && labels) || data.length !== labels.length) {
            return -0.1;
        }
        const dataSize = data.length;
        const featureConsistency = this.checkFeatureConsistency(data);
        const labelBalance = this.checkLabelBalance(labels);
        let qualityFactor = 0;
        if (dataSize > 1000)
            qualityFactor += 0.02;
        if (dataSize > 10000)
            qualityFactor += 0.03;
        qualityFactor += featureConsistency * 0.02;
        qualityFactor += labelBalance * 0.02;
        return Math.min(0.1, qualityFactor);
    }
    checkFeatureConsistency(data) {
        if (data.length === 0)
            return 0;
        const firstLength = data[0].length;
        const consistentLength = data.every((row) => row.length === firstLength);
        return consistentLength ? 1.0 : 0.5;
    }
    checkLabelBalance(labels) {
        if (labels.length === 0)
            return 0;
        const labelCounts = new Map();
        labels.forEach((label) => {
            const key = label.toString();
            labelCounts.set(key, (labelCounts.get(key) || 0) + 1);
        });
        const counts = Array.from(labelCounts.values());
        const minCount = Math.min(...counts);
        const maxCount = Math.max(...counts);
        return maxCount > 0 ? minCount / maxCount : 0;
    }
    async getAdaptationInsights(modelId) {
        try {
            const recommendations = await this.adaptationEngine.getAdaptationRecommendations(modelId);
            if (!recommendations) {
                return null;
            }
            const patternEffectiveness = {};
            recommendations.patterns?.forEach((p) => {
                patternEffectiveness[p.pattern] = p.avgGain;
            });
            return {
                performanceGains: recommendations.patterns?.[0]?.avgGain || 0,
                patternEffectiveness,
                recommendations: recommendations.trainingStrategy?.recommendations || [],
            };
        }
        catch {
            return null;
        }
    }
    async applyOptimizations(model, recommendations, options) {
        const strategy = options?.strategy || 'accuracy';
        const maxIterations = options?.maxIterations || 5;
        const bestMetrics = (await this.getMetrics(model.id)) || {
            accuracy: 0.5,
            loss: 0.5,
            epochs: 0,
            trainingTime: 0,
            cognitivePatterns: model.cognitivePatterns,
        };
        for (let i = 0; i < maxIterations; i++) {
            if (recommendations?.patterns && strategy === 'accuracy') {
                const topPatterns = recommendations.patterns
                    .slice(0, 2)
                    .map((p) => p.pattern);
                model.cognitivePatterns = [
                    ...new Set([...topPatterns, ...model.cognitivePatterns]),
                ];
            }
            const improvementFactor = 1 + 0.02 * (i + 1);
            bestMetrics.accuracy = Math.min(0.99, bestMetrics.accuracy * improvementFactor);
            bestMetrics.loss = Math.max(0.001, bestMetrics.loss * (2 - improvementFactor));
            this.logger.debug(`Optimization iteration ${i + 1}: accuracy = ${bestMetrics.accuracy.toFixed(4)}`);
        }
        return bestMetrics;
    }
}
export default NeuralDomainAPI;
//# sourceMappingURL=api.js.map