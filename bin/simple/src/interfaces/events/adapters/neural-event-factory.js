import { BaseEventManager } from '../core/base-event-manager.ts';
class NeuralEventManager extends BaseEventManager {
    neuralMetrics = {
        trainingJobs: 0,
        inferenceRequests: 0,
        modelsLoaded: 0,
        totalTrainingTime: 0,
        totalInferenceTime: 0,
        averageAccuracy: 0,
        errorCount: 0,
        activeModels: new Set(),
        resourceUsage: {
            gpuUtilization: 0,
            memoryUsage: 0,
            computeHours: 0,
        },
    };
    subscriptions = {
        training: new Map(),
        inference: new Map(),
        model: new Map(),
        performance: new Map(),
        resource: new Map(),
    };
    constructor(config, logger) {
        super(config, logger);
        this.initializeNeuralHandlers();
    }
    async emitNeuralEvent(event) {
        try {
            this.updateNeuralMetrics(event);
            const enrichedEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    timestamp: new Date(),
                    processingTime: Date.now(),
                    modelVersion: event.data?.modelVersion || 'unknown',
                    computeResource: event.data?.computeResource || 'cpu',
                },
            };
            await this.emit(enrichedEvent);
            await this.routeNeuralEvent(enrichedEvent);
            this.logger.debug(`Neural event emitted: ${event.operation} for model ${event.modelId}`);
        }
        catch (error) {
            this.neuralMetrics.errorCount++;
            this.logger.error('Failed to emit neural event:', error);
            throw error;
        }
    }
    subscribeTrainingEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.training.set(subscriptionId, listener);
        this.logger.debug(`Training event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeInferenceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.inference.set(subscriptionId, listener);
        this.logger.debug(`Inference event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeModelEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.model.set(subscriptionId, listener);
        this.logger.debug(`Model event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribePerformanceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.performance.set(subscriptionId, listener);
        this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeResourceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.resource.set(subscriptionId, listener);
        this.logger.debug(`Resource event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async getNeuralMetrics() {
        const totalOperations = this.neuralMetrics.trainingJobs + this.neuralMetrics.inferenceRequests;
        const errorRate = totalOperations > 0 ? this.neuralMetrics.errorCount / totalOperations : 0;
        return {
            activeModels: this.neuralMetrics.activeModels.size,
            trainingJobs: this.neuralMetrics.trainingJobs,
            inferenceRequests: this.neuralMetrics.inferenceRequests,
            averageAccuracy: this.neuralMetrics.averageAccuracy,
            resourceUtilization: {
                gpu: this.neuralMetrics.resourceUsage.gpuUtilization,
                memory: this.neuralMetrics.resourceUsage.memoryUsage,
                computeHours: this.neuralMetrics.resourceUsage.computeHours,
            },
            performance: {
                trainingTime: this.neuralMetrics.totalTrainingTime,
                inferenceTime: this.neuralMetrics.totalInferenceTime,
                errorRate,
            },
        };
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        const neuralMetrics = await this.getNeuralMetrics();
        return {
            ...baseMetrics,
            customMetrics: {
                neural: neuralMetrics,
            },
        };
    }
    async healthCheck() {
        const baseStatus = await super.healthCheck();
        const neuralMetrics = await this.getNeuralMetrics();
        const highErrorRate = neuralMetrics.performance.errorRate > 0.05;
        const lowAccuracy = neuralMetrics.averageAccuracy < 0.5;
        const highResourceUsage = neuralMetrics.resourceUtilization.gpu > 0.95;
        const isHealthy = baseStatus.status === 'healthy' &&
            !highErrorRate &&
            !lowAccuracy &&
            !highResourceUsage;
        return {
            ...baseStatus,
            status: isHealthy ? 'healthy' : 'degraded',
            metadata: {
                ...baseStatus.metadata,
                neural: {
                    activeModels: neuralMetrics.activeModels,
                    averageAccuracy: neuralMetrics.averageAccuracy,
                    errorRate: neuralMetrics.performance.errorRate,
                    resourceUtilization: neuralMetrics.resourceUtilization,
                },
            },
        };
    }
    initializeNeuralHandlers() {
        this.logger.debug('Initializing neural event handlers');
        this.subscribe([
            'neural:training',
            'neural:inference',
            'neural:model',
            'neural:performance',
            'neural:resource',
        ], this.handleNeuralEvent.bind(this));
    }
    async handleNeuralEvent(event) {
        const startTime = Date.now();
        try {
            const operationType = event.type.split(':')[1];
            switch (operationType) {
                case 'training':
                    await this.notifySubscribers(this.subscriptions.training, event);
                    break;
                case 'inference':
                    await this.notifySubscribers(this.subscriptions.inference, event);
                    break;
                case 'model':
                    await this.notifySubscribers(this.subscriptions.model, event);
                    break;
                case 'performance':
                    await this.notifySubscribers(this.subscriptions.performance, event);
                    break;
                case 'resource':
                    await this.notifySubscribers(this.subscriptions.resource, event);
                    break;
                default:
                    this.logger.warn(`Unknown neural operation type: ${operationType}`);
            }
            const processingTime = Date.now() - startTime;
            if (operationType === 'training') {
                this.neuralMetrics.totalTrainingTime += processingTime;
            }
            else if (operationType === 'inference') {
                this.neuralMetrics.totalInferenceTime += processingTime;
            }
        }
        catch (error) {
            this.neuralMetrics.errorCount++;
            this.logger.error('Neural event handling failed:', error);
            throw error;
        }
    }
    async routeNeuralEvent(event) {
        if (event.modelId) {
            this.neuralMetrics.activeModels.add(event.modelId);
        }
        switch (event.operation) {
            case 'training-start':
                this.logger.info(`Training started for model: ${event.modelId}`);
                break;
            case 'training-complete':
                this.logger.info(`Training completed for model: ${event.modelId}`);
                if (event.data?.accuracy) {
                    this.updateAverageAccuracy(event.data.accuracy);
                }
                break;
            case 'model-load':
                this.neuralMetrics.modelsLoaded++;
                this.logger.info(`Model loaded: ${event.modelId}`);
                break;
            case 'model-unload':
                if (event.modelId) {
                    this.neuralMetrics.activeModels.delete(event.modelId);
                }
                this.logger.info(`Model unloaded: ${event.modelId}`);
                break;
            case 'inference-batch':
                this.logger.debug(`Batch inference completed: ${event.data?.batchSize} samples`);
                break;
            case 'resource-allocated':
                if (event.data?.resourceType === 'gpu') {
                    this.neuralMetrics.resourceUsage.gpuUtilization =
                        event.data.utilization || 0;
                }
                break;
            case 'error':
                this.logger.error(`Neural operation error: ${event.data?.error}`);
                break;
        }
    }
    updateNeuralMetrics(event) {
        const operationType = event.type.split(':')[1];
        switch (operationType) {
            case 'training':
                this.neuralMetrics.trainingJobs++;
                break;
            case 'inference':
                this.neuralMetrics.inferenceRequests++;
                break;
        }
        if (event.data?.resourceUsage) {
            this.neuralMetrics.resourceUsage = {
                ...this.neuralMetrics.resourceUsage,
                ...event.data.resourceUsage,
            };
        }
    }
    updateAverageAccuracy(newAccuracy) {
        if (this.neuralMetrics.trainingJobs === 0) {
            this.neuralMetrics.averageAccuracy = newAccuracy;
        }
        else {
            const totalWeight = this.neuralMetrics.trainingJobs;
            this.neuralMetrics.averageAccuracy =
                (this.neuralMetrics.averageAccuracy * (totalWeight - 1) + newAccuracy) /
                    totalWeight;
        }
    }
    async notifySubscribers(subscribers, event) {
        const notifications = Array.from(subscribers.values()).map(async (listener) => {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Neural event listener failed:', error);
            }
        });
        await Promise.allSettled(notifications);
    }
    generateSubscriptionId() {
        return `neural-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
export class NeuralEventManagerFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.logger.debug('NeuralEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating neural event manager: ${config.name}`);
        this.validateConfig(config);
        const optimizedConfig = this.applyNeuralDefaults(config);
        const manager = new NeuralEventManager(optimizedConfig, this.logger);
        await this.configureNeuralManager(manager, optimizedConfig);
        this.logger.info(`Neural event manager created successfully: ${config.name}`);
        return manager;
    }
    validateConfig(config) {
        if (!config.name) {
            throw new Error('Neural event manager name is required');
        }
        if (config.type !== 'neural') {
            throw new Error('Manager type must be "neural"');
        }
        if (config.processing?.timeout && config.processing.timeout < 1000) {
            this.logger.warn('Neural processing timeout < 1000ms may be too short for ML operations');
        }
        if (config.maxListeners && config.maxListeners < 50) {
            this.logger.warn('Neural managers should support at least 50 listeners for ML workflows');
        }
    }
    applyNeuralDefaults(config) {
        return {
            ...config,
            maxListeners: config.maxListeners || 200,
            processing: {
                strategy: 'queued',
                timeout: 30000,
                retries: 3,
                batchSize: 50,
                ...config.processing,
            },
            persistence: {
                enabled: true,
                maxAge: 86400000,
                ...config.persistence,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 60000,
                healthCheckInterval: 300000,
                ...config.monitoring,
            },
        };
    }
    async configureNeuralManager(manager, config) {
        if (config.monitoring?.enabled) {
            await manager.start();
            this.logger.debug(`Neural event manager monitoring started: ${config.name}`);
        }
        if (config.monitoring?.healthCheckInterval) {
            setInterval(async () => {
                try {
                    const status = await manager.healthCheck();
                    if (status.status !== 'healthy') {
                        this.logger.warn(`Neural manager health degraded: ${config.name}`, status.metadata);
                    }
                }
                catch (error) {
                    this.logger.error(`Neural manager health check failed: ${config.name}`, error);
                }
            }, config.monitoring.healthCheckInterval);
        }
    }
}
export default NeuralEventManagerFactory;
//# sourceMappingURL=neural-event-factory.js.map