import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { DaaService } from '../../../coordination/swarm/core/daa-service.ts';
import { SessionEnabledSwarm } from '../../../coordination/swarm/core/session-integration.ts';
import { SwarmCoordinator } from '../../../coordination/swarm/core/swarm-coordinator.ts';
import { ServiceDependencyError, ServiceOperationError, ServiceTimeoutError, } from '../core/interfaces.ts';
import { ServiceType } from '../types.ts';
export class CoordinationServiceAdapter {
    name;
    type;
    config;
    lifecycleStatus = 'uninitialized';
    eventEmitter = new EventEmitter();
    logger;
    startTime;
    operationCount = 0;
    successCount = 0;
    errorCount = 0;
    totalLatency = 0;
    dependencies = new Map();
    adapterConfig;
    daaService;
    sessionEnabledSwarm;
    sessionRecoveryService;
    swarmCoordinator;
    cache = new Map();
    pendingRequests = new Map();
    metrics = [];
    agentMetrics = new Map();
    sessionMetrics = new Map();
    healthStats = {
        lastHealthCheck: new Date(),
        consecutiveFailures: 0,
        totalHealthChecks: 0,
        healthCheckFailures: 0,
    };
    constructor(config) {
        this.name = config?.service?.name;
        this.type = config?.service?.type;
        this.config = config?.service;
        this.adapterConfig = {
            ...config,
            daaService: {
                enabled: true,
                autoInitialize: true,
                enableLearning: true,
                enableCognitive: true,
                enableMetaLearning: true,
                ...config?.daaService,
            },
            sessionService: {
                enabled: true,
                autoRecovery: true,
                healthCheckInterval: 30000,
                maxSessions: 100,
                checkpointInterval: 300000,
                ...config?.sessionService,
            },
            swarmCoordinator: {
                enabled: true,
                defaultTopology: 'mesh',
                maxAgents: 50,
                coordinationTimeout: 10000,
                performanceThreshold: 0.8,
                ...config?.swarmCoordinator,
            },
            performance: {
                enableRequestDeduplication: true,
                maxConcurrency: 20,
                requestTimeout: 30000,
                enableMetricsCollection: true,
                agentPooling: true,
                sessionCaching: true,
                ...config?.performance,
            },
            retry: {
                enabled: true,
                maxAttempts: 3,
                backoffMultiplier: 2,
                retryableOperations: [
                    'agent-create',
                    'agent-adapt',
                    'workflow-execute',
                    'session-create',
                    'session-save',
                    'session-restore',
                    'swarm-coordinate',
                    'swarm-assign-task',
                    'knowledge-share',
                ],
                ...config?.retry,
            },
            cache: {
                enabled: true,
                strategy: 'memory',
                defaultTTL: 600000,
                maxSize: 500,
                keyPrefix: 'coord-adapter:',
                ...config?.cache,
            },
            agentManagement: {
                autoSpawn: false,
                maxLifetime: 3600000,
                healthCheckInterval: 60000,
                performanceTracking: true,
                ...config?.agentManagement,
            },
            learning: {
                enableContinuousLearning: true,
                knowledgeSharing: true,
                patternAnalysis: true,
                metaLearningInterval: 1800000,
                ...config?.learning,
            },
            ...config,
        };
        this.logger = getLogger(`CoordinationServiceAdapter:${this.name}`);
        this.logger.info(`Creating coordination service adapter: ${this.name}`);
    }
    async initialize(config) {
        this.logger.info(`Initializing coordination service adapter: ${this.name}`);
        this.lifecycleStatus = 'initializing';
        this.emit('initializing');
        try {
            if (config) {
                Object.assign(this.config, config);
            }
            const isValidConfig = await this.validateConfig(this.config);
            if (!isValidConfig) {
                throw new Error('Invalid coordination service adapter configuration');
            }
            if (this.adapterConfig.daaService?.enabled) {
                this.logger.debug('Initializing DaaService integration');
                this.daaService = new DaaService();
                if (this.adapterConfig.daaService.autoInitialize) {
                    await this.daaService.initialize();
                }
                await this.addDependency({
                    serviceName: 'daa-service',
                    required: true,
                    healthCheck: true,
                    timeout: 5000,
                    retries: 2,
                });
            }
            if (this.adapterConfig.sessionService?.enabled) {
                this.logger.debug('Initializing SessionEnabledSwarm integration');
                const swarmOptions = {
                    topology: this.adapterConfig.swarmCoordinator?.defaultTopology || 'mesh',
                    maxAgents: this.adapterConfig.swarmCoordinator?.maxAgents || 50,
                };
                const sessionConfig = {
                    autoCheckpoint: true,
                    checkpointInterval: this.adapterConfig.sessionService.checkpointInterval || 300000,
                    maxCheckpoints: this.adapterConfig.sessionService.maxSessions || 100,
                };
                this.sessionEnabledSwarm = new SessionEnabledSwarm(swarmOptions, sessionConfig);
                if (this.adapterConfig.sessionService.autoRecovery) {
                    this.logger.debug('Session recovery service would be initialized here');
                }
                await this.addDependency({
                    serviceName: 'session-enabled-swarm',
                    required: true,
                    healthCheck: true,
                    timeout: 10000,
                    retries: 3,
                });
            }
            if (this.adapterConfig.swarmCoordinator?.enabled) {
                this.logger.debug('Initializing SwarmCoordinator integration');
                this.swarmCoordinator = new SwarmCoordinator();
                await this.swarmCoordinator.initialize({
                    maxAgents: this.adapterConfig.swarmCoordinator.maxAgents,
                    topology: this.adapterConfig.swarmCoordinator.defaultTopology,
                    timeout: this.adapterConfig.swarmCoordinator.coordinationTimeout,
                });
                await this.addDependency({
                    serviceName: 'swarm-coordinator',
                    required: true,
                    healthCheck: true,
                    timeout: 5000,
                    retries: 2,
                });
            }
            if (this.adapterConfig.cache?.enabled) {
                this.logger.debug('Cache system initialized');
                this.startCacheCleanupTimer();
            }
            if (this.adapterConfig.performance?.enableMetricsCollection) {
                this.logger.debug('Metrics collection initialized');
                this.startMetricsCleanupTimer();
            }
            if (this.adapterConfig.agentManagement?.performanceTracking) {
                this.logger.debug('Agent performance tracking initialized');
                this.startAgentMetricsTimer();
            }
            if (this.adapterConfig.learning?.enableContinuousLearning) {
                this.logger.debug('Continuous learning system initialized');
                this.startLearningTimer();
            }
            this.lifecycleStatus = 'initialized';
            this.emit('initialized');
            this.logger.info(`Coordination service adapter initialized successfully: ${this.name}`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', error);
            this.logger.error(`Failed to initialize coordination service adapter ${this.name}:`, error);
            throw error;
        }
    }
    async start() {
        this.logger.info(`Starting coordination service adapter: ${this.name}`);
        if (this.lifecycleStatus !== 'initialized') {
            throw new Error(`Cannot start service in ${this.lifecycleStatus} state`);
        }
        this.lifecycleStatus = 'starting';
        this.emit('starting');
        try {
            const dependenciesOk = await this.checkDependencies();
            if (!dependenciesOk) {
                throw new ServiceDependencyError(this.name, 'One or more dependencies failed');
            }
            this.startTime = new Date();
            this.lifecycleStatus = 'running';
            this.emit('started');
            this.logger.info(`Coordination service adapter started successfully: ${this.name}`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', error);
            this.logger.error(`Failed to start coordination service adapter ${this.name}:`, error);
            throw error;
        }
    }
    async stop() {
        this.logger.info(`Stopping coordination service adapter: ${this.name}`);
        this.lifecycleStatus = 'stopping';
        this.emit('stopping');
        try {
            this.pendingRequests.clear();
            if (this.swarmCoordinator) {
                await this.swarmCoordinator.shutdown();
            }
            if (this.sessionEnabledSwarm) {
                await this.sessionEnabledSwarm.destroy();
            }
            if (this.adapterConfig.cache?.enabled) {
                this.cache.clear();
            }
            this.lifecycleStatus = 'stopped';
            this.emit('stopped');
            this.logger.info(`Coordination service adapter stopped successfully: ${this.name}`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', error);
            this.logger.error(`Failed to stop coordination service adapter ${this.name}:`, error);
            throw error;
        }
    }
    async destroy() {
        this.logger.info(`Destroying coordination service adapter: ${this.name}`);
        try {
            if (this.lifecycleStatus === 'running') {
                await this.stop();
            }
            this.cache.clear();
            this.pendingRequests.clear();
            this.metrics.length = 0;
            this.agentMetrics.clear();
            this.sessionMetrics.clear();
            this.dependencies.clear();
            this.daaService = null;
            this.sessionEnabledSwarm = null;
            this.sessionRecoveryService = null;
            this.swarmCoordinator = null;
            this.eventEmitter.removeAllListeners();
            this.lifecycleStatus = 'destroyed';
            this.logger.info(`Coordination service adapter destroyed successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to destroy coordination service adapter ${this.name}:`, error);
            throw error;
        }
    }
    async getStatus() {
        const now = new Date();
        const uptime = this.startTime
            ? now.getTime() - this.startTime.getTime()
            : 0;
        const errorRate = this.operationCount > 0
            ? (this.errorCount / this.operationCount) * 100
            : 0;
        const dependencyStatuses = {};
        if (this.daaService && this.adapterConfig.daaService?.enabled) {
            dependencyStatuses['daa-service'] = {
                status: 'healthy',
                lastCheck: now,
            };
        }
        if (this.swarmCoordinator && this.adapterConfig.swarmCoordinator?.enabled) {
            dependencyStatuses['swarm-coordinator'] = {
                status: 'healthy',
                lastCheck: now,
            };
        }
        if (this.sessionEnabledSwarm &&
            this.adapterConfig.sessionService?.enabled) {
            dependencyStatuses['session-enabled-swarm'] = {
                status: 'healthy',
                lastCheck: now,
            };
        }
        return {
            name: this.name,
            type: this.type,
            lifecycle: this.lifecycleStatus,
            health: this.determineHealthStatus(errorRate),
            lastCheck: now,
            uptime,
            errorCount: this.errorCount,
            errorRate,
            dependencies: dependencyStatuses,
            metadata: {
                operationCount: this.operationCount,
                successCount: this.successCount,
                cacheSize: this.cache.size,
                pendingRequests: this.pendingRequests.size,
                activeAgents: this.agentMetrics.size,
                activeSessions: this.sessionMetrics.size,
                daaServiceEnabled: this.adapterConfig.daaService?.enabled,
                sessionServiceEnabled: this.adapterConfig.sessionService?.enabled,
                swarmCoordinatorEnabled: this.adapterConfig.swarmCoordinator?.enabled,
            },
        };
    }
    async getMetrics() {
        const now = new Date();
        const recentMetrics = this.metrics.filter((m) => now.getTime() - m.timestamp.getTime() < 300000);
        const avgLatency = this.operationCount > 0 ? this.totalLatency / this.operationCount : 0;
        const throughput = recentMetrics.length > 0 ? recentMetrics.length / 300 : 0;
        const latencies = recentMetrics
            .map((m) => m.executionTime)
            .sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p99Index = Math.floor(latencies.length * 0.99);
        const coordinationMetrics = recentMetrics.filter((m) => m.coordinationLatency !== undefined);
        const avgCoordinationLatency = coordinationMetrics.length > 0
            ? coordinationMetrics.reduce((sum, m) => sum + (m.coordinationLatency || 0), 0) / coordinationMetrics.length
            : 0;
        return {
            name: this.name,
            type: this.type,
            operationCount: this.operationCount,
            successCount: this.successCount,
            errorCount: this.errorCount,
            averageLatency: avgLatency,
            p95Latency: latencies[p95Index] || 0,
            p99Latency: latencies[p99Index] || 0,
            throughput,
            memoryUsage: {
                used: this.estimateMemoryUsage(),
                total: this.adapterConfig.cache?.maxSize || 500,
                percentage: (this.cache.size / (this.adapterConfig.cache?.maxSize || 500)) * 100,
            },
            customMetrics: {
                cacheHitRate: this.calculateCacheHitRate(),
                pendingRequestsCount: this.pendingRequests.size,
                avgRequestDeduplicationRate: this.calculateDeduplicationRate(),
                activeAgentsCount: this.agentMetrics.size,
                activeSessionsCount: this.sessionMetrics.size,
                avgCoordinationLatency,
                learningOperationsRate: this.calculateLearningOperationsRate(),
            },
            timestamp: now,
        };
    }
    async healthCheck() {
        this.healthStats.totalHealthChecks++;
        this.healthStats.lastHealthCheck = new Date();
        try {
            if (this.lifecycleStatus !== 'running') {
                this.healthStats.consecutiveFailures++;
                this.healthStats.healthCheckFailures++;
                return false;
            }
            const dependenciesHealthy = await this.checkDependencies();
            if (!dependenciesHealthy) {
                this.healthStats.consecutiveFailures++;
                this.healthStats.healthCheckFailures++;
                return false;
            }
            if (this.daaService && this.adapterConfig.daaService?.enabled) {
            }
            if (this.swarmCoordinator &&
                this.adapterConfig.swarmCoordinator?.enabled) {
            }
            if (this.adapterConfig.cache?.enabled) {
                const maxSize = this.adapterConfig.cache?.maxSize || 500;
                if (this.cache.size > maxSize * 1.2) {
                    this.logger.warn(`Cache size (${this.cache.size}) significantly exceeds limit (${maxSize})`);
                    this.healthStats.consecutiveFailures++;
                    this.healthStats.healthCheckFailures++;
                    return false;
                }
            }
            this.healthStats.consecutiveFailures = 0;
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed for ${this.name}:`, error);
            this.healthStats.consecutiveFailures++;
            this.healthStats.healthCheckFailures++;
            return false;
        }
    }
    async updateConfig(config) {
        this.logger.info(`Updating configuration for coordination service adapter: ${this.name}`);
        try {
            const newConfig = { ...this.config, ...config };
            const isValid = await this.validateConfig(newConfig);
            if (!isValid) {
                throw new Error('Invalid configuration update');
            }
            Object.assign(this.config, config);
            this.logger.info(`Configuration updated successfully for: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to update configuration for ${this.name}:`, error);
            throw error;
        }
    }
    async validateConfig(config) {
        try {
            if (!(config?.name && config?.type)) {
                this.logger.error('Configuration missing required fields: name or type');
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Configuration validation error: ${error}`);
            return false;
        }
    }
    isReady() {
        return this.lifecycleStatus === 'running';
    }
    getCapabilities() {
        const capabilities = ['coordination-operations'];
        if (this.adapterConfig.daaService?.enabled) {
            capabilities.push('agent-management', 'workflow-execution', 'knowledge-sharing', 'learning-operations', 'cognitive-analysis', 'performance-metrics');
        }
        if (this.adapterConfig.sessionService?.enabled) {
            capabilities.push('session-management', 'state-persistence', 'checkpoint-creation', 'session-recovery', 'cross-session-continuity');
        }
        if (this.adapterConfig.swarmCoordinator?.enabled) {
            capabilities.push('swarm-coordination', 'task-assignment', 'agent-orchestration', 'topology-management', 'load-balancing');
        }
        if (this.adapterConfig.cache?.enabled) {
            capabilities.push('caching', 'performance-optimization');
        }
        if (this.adapterConfig.retry?.enabled) {
            capabilities.push('retry-logic', 'fault-tolerance');
        }
        if (this.adapterConfig.learning?.enableContinuousLearning) {
            capabilities.push('continuous-learning', 'adaptation', 'pattern-analysis');
        }
        return capabilities;
    }
    async execute(operation, params, options) {
        const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const startTime = Date.now();
        this.logger.debug(`Executing operation: ${operation}`, {
            operationId,
            params,
        });
        try {
            if (!this.isReady()) {
                throw new ServiceOperationError(this.name, operation, new Error('Service not ready'));
            }
            const timeout = options?.timeout ||
                this.adapterConfig.performance?.requestTimeout ||
                30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new ServiceTimeoutError(this.name, operation, timeout)), timeout);
            });
            const operationPromise = this.executeOperationInternal(operation, params, options);
            const result = await Promise.race([operationPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            this.recordOperationMetrics({
                operationName: operation,
                executionTime: duration,
                success: true,
                agentCount: this.estimateAgentCount(params),
                sessionId: this.extractSessionId(params),
                coordinationLatency: this.calculateCoordinationLatency(result),
                timestamp: new Date(),
            });
            this.operationCount++;
            this.successCount++;
            this.totalLatency += duration;
            this.emit('operation', {
                operationId,
                operation,
                success: true,
                duration,
            });
            return {
                success: true,
                data: result,
                metadata: {
                    duration,
                    timestamp: new Date(),
                    operationId,
                },
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordOperationMetrics({
                operationName: operation,
                executionTime: duration,
                success: false,
                timestamp: new Date(),
            });
            this.operationCount++;
            this.errorCount++;
            this.totalLatency += duration;
            this.emit('operation', {
                operationId,
                operation,
                success: false,
                duration,
                error,
            });
            this.emit('error', error);
            this.logger.error(`Operation ${operation} failed:`, error);
            return {
                success: false,
                error: {
                    code: error instanceof Error && 'code' in error
                        ? error.code
                        : 'OPERATION_ERROR',
                    message: error.message,
                    details: params,
                    stack: error.stack,
                },
                metadata: {
                    duration,
                    timestamp: new Date(),
                    operationId,
                },
            };
        }
    }
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            this.eventEmitter.off(event, handler);
        }
        else {
            this.eventEmitter.removeAllListeners(event);
        }
    }
    emit(event, data, error) {
        const serviceEvent = {
            type: event,
            serviceName: this.name,
            timestamp: new Date(),
            data,
            ...(error && { error }),
        };
        this.eventEmitter.emit(event, serviceEvent);
    }
    async addDependency(dependency) {
        this.logger.debug(`Adding dependency ${dependency.serviceName} for ${this.name}`);
        this.dependencies.set(dependency.serviceName, dependency);
    }
    async removeDependency(serviceName) {
        this.logger.debug(`Removing dependency ${serviceName} for ${this.name}`);
        this.dependencies.delete(serviceName);
    }
    async checkDependencies() {
        if (this.dependencies.size === 0) {
            return true;
        }
        try {
            const dependencyChecks = Array.from(this.dependencies.entries()).map(async ([name, config]) => {
                if (!config?.healthCheck) {
                    return true;
                }
                try {
                    return true;
                }
                catch (error) {
                    this.logger.warn(`Dependency ${name} health check failed:`, error);
                    return !config?.required;
                }
            });
            const results = await Promise.all(dependencyChecks);
            return results?.every((result) => result === true);
        }
        catch (error) {
            this.logger.error(`Error checking dependencies for ${this.name}:`, error);
            return false;
        }
    }
    async executeOperationInternal(operation, params, options) {
        const cacheKey = this.generateCacheKey(operation, params);
        if (this.adapterConfig.cache?.enabled &&
            this.isCacheableOperation(operation)) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.logger.debug(`Cache hit for operation: ${operation}`);
                this.recordOperationMetrics({
                    operationName: operation,
                    executionTime: 0,
                    success: true,
                    cacheHit: true,
                    timestamp: new Date(),
                });
                return cached;
            }
        }
        if (this.adapterConfig.performance?.enableRequestDeduplication) {
            const pending = this.pendingRequests.get(cacheKey);
            if (pending) {
                this.logger.debug(`Request deduplication for operation: ${operation}`);
                pending.requestCount++;
                return await pending.promise;
            }
        }
        const executionPromise = this.executeWithRetry(operation, params, options);
        if (this.adapterConfig.performance?.enableRequestDeduplication) {
            this.pendingRequests.set(cacheKey, {
                promise: executionPromise,
                timestamp: new Date(),
                requestCount: 1,
            });
        }
        try {
            const result = await executionPromise;
            if (this.adapterConfig.cache?.enabled &&
                this.isCacheableOperation(operation)) {
                this.setInCache(cacheKey, result);
            }
            return result;
        }
        finally {
            if (this.adapterConfig.performance?.enableRequestDeduplication) {
                this.pendingRequests.delete(cacheKey);
            }
        }
    }
    async executeWithRetry(operation, params, options, attempt = 1) {
        try {
            return await this.performOperation(operation, params, options);
        }
        catch (error) {
            const shouldRetry = this.shouldRetryOperation(operation, error, attempt);
            if (shouldRetry &&
                attempt <
                    (this.adapterConfig.retry?.maxAttempts ||
                        this.adapterConfig.retry?.attempts ||
                        3)) {
                const delay = (this.adapterConfig.retry?.backoffMultiplier || 2) ** (attempt - 1) *
                    1000;
                this.logger.warn(`Operation ${operation} failed (attempt ${attempt}), retrying in ${delay}ms:`, error);
                await new Promise((resolve) => setTimeout(resolve, delay));
                this.recordOperationMetrics({
                    operationName: operation,
                    executionTime: 0,
                    success: false,
                    retryCount: attempt,
                    timestamp: new Date(),
                });
                return await this.executeWithRetry(operation, params, options, attempt + 1);
            }
            throw error;
        }
    }
    async performOperation(operation, params, _options) {
        switch (operation) {
            case 'agent-create':
                return (await this.createAgent(params?.config));
            case 'agent-adapt':
                return (await this.adaptAgent(params?.agentId, params?.adaptation));
            case 'agent-learning-status':
                return (await this.getAgentLearningStatus(params?.agentId));
            case 'workflow-create':
                return (await this.createWorkflow(params?.workflow));
            case 'workflow-execute':
                return (await this.executeWorkflow(params?.workflowId, params?.params));
            case 'knowledge-share':
                return (await this.shareKnowledge(params?.knowledge));
            case 'cognitive-analyze':
                return (await this.analyzeCognitivePatterns(params?.agentId));
            case 'cognitive-set':
                return (await this.setCognitivePattern(params?.agentId, params?.pattern));
            case 'meta-learning':
                return (await this.performMetaLearning(params));
            case 'performance-metrics':
                return (await this.getPerformanceMetrics(params?.agentId));
            case 'session-create':
                return (await this.createSession(params?.name));
            case 'session-load':
                return (await this.loadSession(params?.sessionId));
            case 'session-save':
                return (await this.saveSession(params?.sessionId));
            case 'session-checkpoint':
                return (await this.createCheckpoint(params?.sessionId, params?.description));
            case 'session-restore':
                return (await this.restoreFromCheckpoint(params?.sessionId, params?.checkpointId));
            case 'session-list':
                return (await this.listSessions(params?.filter));
            case 'session-stats':
                return (await this.getSessionStats(params?.sessionId));
            case 'swarm-coordinate':
                return (await this.coordinateSwarm(params?.agents, params?.topology));
            case 'swarm-add-agent':
                return (await this.addAgentToSwarm(params?.agent));
            case 'swarm-remove-agent':
                return (await this.removeAgentFromSwarm(params?.agentId));
            case 'swarm-assign-task':
                return (await this.assignTask(params?.task));
            case 'swarm-complete-task':
                return (await this.completeTask(params?.taskId, params?.result));
            case 'swarm-metrics':
                return (await this.getSwarmMetrics());
            case 'swarm-agents':
                return (await this.getSwarmAgents());
            case 'cache-stats':
                return this.getCacheStats();
            case 'clear-cache':
                return (await this.clearCache());
            case 'service-stats':
                return (await this.getServiceStats());
            case 'agent-metrics':
                return this.getAgentMetrics();
            case 'session-metrics':
                return this.getSessionMetrics();
            default:
                throw new ServiceOperationError(this.name, operation, new Error(`Unknown operation: ${operation}`));
        }
    }
    async createAgent(config) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        const result = await this.daaService.createAgent(config);
        if (this.adapterConfig.agentManagement?.performanceTracking) {
            this.agentMetrics.set(result?.id, {
                agentId: result?.id,
                type: result?.type || 'unknown',
                tasksCompleted: 0,
                averageResponseTime: 0,
                errorRate: 0,
                learningProgress: 0,
                lastActivity: new Date(),
            });
        }
        return result;
    }
    async adaptAgent(agentId, adaptation) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        const result = await this.daaService.adaptAgent(agentId, adaptation);
        const metrics = this.agentMetrics.get(agentId);
        if (metrics) {
            metrics.lastActivity = new Date();
            metrics.learningProgress = Math.min(metrics.learningProgress + 0.1, 1.0);
        }
        return result;
    }
    async getAgentLearningStatus(agentId) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.getAgentLearningStatus(agentId);
    }
    async createWorkflow(workflow) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.createWorkflow(workflow);
    }
    async executeWorkflow(workflowId, params) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.executeWorkflow(workflowId, params);
    }
    async shareKnowledge(knowledge) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.shareKnowledge(knowledge);
    }
    async analyzeCognitivePatterns(agentId) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.analyzeCognitivePatterns(agentId);
    }
    async setCognitivePattern(agentId, pattern) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.setCognitivePattern(agentId, pattern);
    }
    async performMetaLearning(params) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.performMetaLearning(params);
    }
    async getPerformanceMetrics(agentId) {
        if (!this.daaService) {
            throw new Error('DaaService not available');
        }
        return await this.daaService.getPerformanceMetrics(agentId);
    }
    async createSession(name) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        const sessionId = await this.sessionEnabledSwarm.createSession(name);
        this.sessionMetrics.set(sessionId, {
            sessionId,
            uptime: 0,
            operationsCount: 0,
            checkpointsCreated: 0,
            recoveryAttempts: 0,
            lastAccessed: new Date(),
        });
        return sessionId;
    }
    async loadSession(sessionId) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        await this.sessionEnabledSwarm.loadSession(sessionId);
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            metrics.lastAccessed = new Date();
        }
    }
    async saveSession(sessionId) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        await this.sessionEnabledSwarm.saveSession();
        if (sessionId) {
            const metrics = this.sessionMetrics.get(sessionId);
            if (metrics) {
                metrics.operationsCount++;
                metrics.lastAccessed = new Date();
            }
        }
    }
    async createCheckpoint(sessionId, description) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        const checkpointId = await this.sessionEnabledSwarm.createCheckpoint(description);
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            metrics.checkpointsCreated++;
            metrics.lastAccessed = new Date();
        }
        return checkpointId;
    }
    async restoreFromCheckpoint(sessionId, checkpointId) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        await this.sessionEnabledSwarm.restoreFromCheckpoint(checkpointId);
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            metrics.recoveryAttempts++;
            metrics.lastAccessed = new Date();
        }
    }
    async listSessions(filter) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        return await this.sessionEnabledSwarm.listSessions(filter);
    }
    async getSessionStats(sessionId) {
        if (!this.sessionEnabledSwarm) {
            throw new Error('SessionEnabledSwarm not available');
        }
        return await this.sessionEnabledSwarm.getSessionStats(sessionId);
    }
    async coordinateSwarm(agents, topology) {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return await this.swarmCoordinator.coordinateSwarm(agents, topology);
    }
    async addAgentToSwarm(agent) {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return await this.swarmCoordinator.addAgent(agent);
    }
    async removeAgentFromSwarm(agentId) {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        await this.swarmCoordinator.removeAgent(agentId);
        this.agentMetrics.delete(agentId);
    }
    async assignTask(task) {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return await this.swarmCoordinator.assignTask(task);
    }
    async completeTask(taskId, result) {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return await this.swarmCoordinator.completeTask(taskId, result);
    }
    async getSwarmMetrics() {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return this.swarmCoordinator.getMetrics();
    }
    async getSwarmAgents() {
        if (!this.swarmCoordinator) {
            throw new Error('SwarmCoordinator not available');
        }
        return this.swarmCoordinator.getAgents();
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.adapterConfig.cache?.maxSize || 500,
            hitRate: this.calculateCacheHitRate(),
            memoryUsage: this.estimateMemoryUsage(),
        };
    }
    async clearCache() {
        const cleared = this.cache.size;
        this.cache.clear();
        this.logger.info(`Cleared ${cleared} items from cache`);
        return { cleared };
    }
    async getServiceStats() {
        return {
            operationCount: this.operationCount,
            successCount: this.successCount,
            errorCount: this.errorCount,
            avgLatency: this.operationCount > 0 ? this.totalLatency / this.operationCount : 0,
            cacheHitRate: this.calculateCacheHitRate(),
            pendingRequests: this.pendingRequests.size,
            activeAgents: this.agentMetrics.size,
            activeSessions: this.sessionMetrics.size,
            healthStats: { ...this.healthStats },
        };
    }
    getAgentMetrics() {
        return Array.from(this.agentMetrics.values());
    }
    getSessionMetrics() {
        return Array.from(this.sessionMetrics.values());
    }
    generateCacheKey(operation, params) {
        const prefix = this.adapterConfig.cache?.keyPrefix || 'coord-adapter:';
        const paramsHash = params ? JSON.stringify(params) : '';
        return `${prefix}${operation}:${Buffer.from(paramsHash).toString('base64')}`;
    }
    isCacheableOperation(operation) {
        const cacheableOps = [
            'agent-learning-status',
            'performance-metrics',
            'cognitive-analyze',
            'session-stats',
            'session-list',
            'swarm-metrics',
            'swarm-agents',
        ];
        return cacheableOps.includes(operation);
    }
    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        const now = new Date();
        if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        entry.accessed = now;
        entry.accessCount++;
        return entry.data;
    }
    setInCache(key, data) {
        const now = new Date();
        const ttl = this.adapterConfig.cache?.defaultTTL || 600000;
        this.cache.set(key, {
            data,
            timestamp: now,
            ttl,
            accessed: now,
            accessCount: 1,
        });
        if (this.cache.size > (this.adapterConfig.cache?.maxSize || 500)) {
            this.cleanupCache();
        }
    }
    cleanupCache() {
        const maxSize = this.adapterConfig.cache?.maxSize || 500;
        const targetSize = Math.floor(maxSize * 0.8);
        if (this.cache.size <= targetSize) {
            return;
        }
        const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
            const aScore = a.accessed.getTime() + a.accessCount * 1000;
            const bScore = b.accessed.getTime() + b.accessCount * 1000;
            return aScore - bScore;
        });
        const toRemove = this.cache.size - targetSize;
        for (let i = 0; i < toRemove; i++) {
            const entryKey = entries[i]?.[0];
            if (entryKey) {
                this.cache.delete(entryKey);
            }
        }
        this.logger.debug(`Cache cleanup: removed ${toRemove} entries`);
    }
    shouldRetryOperation(operation, error, attempt) {
        if (!this.adapterConfig.retry?.enabled) {
            return false;
        }
        if (!this.adapterConfig.retry.retryableOperations?.includes(operation)) {
            return false;
        }
        if (attempt >= (this.adapterConfig.retry.maxAttempts || 3)) {
            return false;
        }
        if (error instanceof ServiceTimeoutError &&
            'timeout' in error &&
            error.timeout < 5000) {
            return false;
        }
        return true;
    }
    recordOperationMetrics(metrics) {
        if (!this.adapterConfig.performance?.enableMetricsCollection) {
            return;
        }
        this.metrics.push(metrics);
        const cutoff = new Date(Date.now() - 3600000);
        this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }
    calculateCacheHitRate() {
        const recentMetrics = this.metrics.filter((m) => Date.now() - m.timestamp.getTime() < 300000);
        if (recentMetrics.length === 0) {
            return 0;
        }
        const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
        return (cacheHits / recentMetrics.length) * 100;
    }
    calculateDeduplicationRate() {
        const deduplicatedRequests = Array.from(this.pendingRequests.values()).reduce((sum, req) => sum + (req.requestCount - 1), 0);
        const totalRequests = this.operationCount + deduplicatedRequests;
        return totalRequests > 0 ? (deduplicatedRequests / totalRequests) * 100 : 0;
    }
    calculateLearningOperationsRate() {
        const recentMetrics = this.metrics.filter((m) => Date.now() - m.timestamp.getTime() < 300000);
        if (recentMetrics.length === 0) {
            return 0;
        }
        const learningOps = recentMetrics.filter((m) => m.operationName.includes('learning') ||
            m.operationName.includes('cognitive') ||
            m.operationName.includes('adapt')).length;
        return (learningOps / recentMetrics.length) * 100;
    }
    estimateMemoryUsage() {
        let size = 0;
        for (const entry of this.cache.values()) {
            size += this.estimateDataSize(entry.data) + 200;
        }
        size += this.pendingRequests.size * 100;
        size += this.metrics.length * 200;
        size += this.agentMetrics.size * 150;
        size += this.sessionMetrics.size * 150;
        return size;
    }
    estimateDataSize(data) {
        if (!data)
            return 0;
        try {
            return JSON.stringify(data).length * 2;
        }
        catch {
            return 1000;
        }
    }
    estimateAgentCount(params) {
        if (!params)
            return undefined;
        if (params?.agents && Array.isArray(params?.agents)) {
            return params?.agents.length;
        }
        if (params?.agentId || params?.agent) {
            return 1;
        }
        return undefined;
    }
    extractSessionId(params) {
        return params?.sessionId;
    }
    calculateCoordinationLatency(result) {
        if (result && typeof result === 'object' && result?.averageLatency) {
            return result?.averageLatency;
        }
        return undefined;
    }
    determineHealthStatus(errorRate) {
        if (this.healthStats.consecutiveFailures > 5) {
            return 'unhealthy';
        }
        if (errorRate > 10 || this.healthStats.consecutiveFailures > 2) {
            return 'degraded';
        }
        if (this.operationCount > 0) {
            return 'healthy';
        }
        return 'unknown';
    }
    startCacheCleanupTimer() {
        setInterval(() => {
            this.cleanupCache();
            const now = new Date();
            for (const [key, entry] of this.cache.entries()) {
                if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }
    startMetricsCleanupTimer() {
        setInterval(() => {
            const cutoff = new Date(Date.now() - 3600000);
            this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
        }, 300000);
    }
    startAgentMetricsTimer() {
        if (!this.adapterConfig.agentManagement?.performanceTracking)
            return;
        setInterval(() => {
            const now = new Date();
            const maxLifetime = this.adapterConfig.agentManagement?.maxLifetime || 3600000;
            for (const [agentId, metrics] of this.agentMetrics.entries()) {
                if (now.getTime() - metrics.lastActivity.getTime() > maxLifetime) {
                    this.agentMetrics.delete(agentId);
                    this.logger.debug(`Cleaned up stale agent metrics for: ${agentId}`);
                }
            }
        }, this.adapterConfig.agentManagement?.healthCheckInterval || 60000);
    }
    startLearningTimer() {
        if (!this.adapterConfig.learning?.enableContinuousLearning)
            return;
        setInterval(() => {
            if (this.adapterConfig.learning?.patternAnalysis && this.daaService) {
                this.performMetaLearning({
                    analysisType: 'automated',
                    timestamp: new Date(),
                }).catch((error) => {
                    this.logger.warn('Automated meta-learning failed:', error);
                });
            }
        }, this.adapterConfig.learning?.metaLearningInterval || 1800000);
    }
}
export function createCoordinationServiceAdapter(config) {
    return new CoordinationServiceAdapter(config);
}
export function createDefaultCoordinationServiceAdapterConfig(name, overrides) {
    return {
        service: {
            name,
            type: ServiceType.COORDINATION,
            enabled: true,
            timeout: 30000,
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
        },
        name,
        type: ServiceType.COORDINATION,
        daaService: {
            enabled: true,
            autoInitialize: true,
            enableLearning: true,
            enableCognitive: true,
            enableMetaLearning: true,
        },
        sessionService: {
            enabled: true,
            autoRecovery: true,
            healthCheckInterval: 30000,
            maxSessions: 100,
            checkpointInterval: 300000,
        },
        swarmCoordinator: {
            enabled: true,
            defaultTopology: 'mesh',
            maxAgents: 50,
            coordinationTimeout: 10000,
            performanceThreshold: 0.8,
        },
        performance: {
            enableRequestDeduplication: true,
            maxConcurrency: 20,
            requestTimeout: 30000,
            enableMetricsCollection: true,
            agentPooling: true,
            sessionCaching: true,
        },
        retry: {
            enabled: true,
            maxAttempts: 3,
            backoffMultiplier: 2,
            retryableOperations: [
                'agent-create',
                'agent-adapt',
                'workflow-execute',
                'session-create',
                'session-save',
                'session-restore',
                'swarm-coordinate',
                'swarm-assign-task',
                'knowledge-share',
            ],
        },
        cache: {
            enabled: true,
            strategy: 'memory',
            defaultTTL: 600000,
            maxSize: 500,
            keyPrefix: 'coord-adapter:',
        },
        agentManagement: {
            autoSpawn: false,
            maxLifetime: 3600000,
            healthCheckInterval: 60000,
            performanceTracking: true,
        },
        learning: {
            enableContinuousLearning: true,
            knowledgeSharing: true,
            patternAnalysis: true,
            metaLearningInterval: 1800000,
        },
        ...overrides,
    };
}
export default CoordinationServiceAdapter;
//# sourceMappingURL=coordination-service-adapter.js.map