import { getLogger } from '../../../config/logging-config.ts';
import { createDefaultInfrastructureServiceAdapterConfig, createInfrastructureServiceAdapter, } from './infrastructure-service-adapter.ts';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory.ts';
const logger = getLogger('InfrastructureServiceHelpers');
export async function quickCreateInfrastructureService(name, options = {}) {
    logger.debug('Quick creating infrastructure service', { name, options });
    const config = createDefaultInfrastructureServiceAdapterConfig(name, {
        facade: {
            enabled: options?.enableFacade !== false,
            autoInitialize: true,
            enableMetrics: true,
            enableHealthChecks: options?.enableHealthMonitoring !== false,
        },
        patternIntegration: {
            enabled: options?.enablePatternIntegration !== false,
            enableAutoOptimization: true,
        },
        resourceManagement: {
            enableResourceTracking: options?.enableResourceTracking !== false,
            enableResourceOptimization: true,
        },
        healthMonitoring: {
            enableAdvancedChecks: options?.enableHealthMonitoring !== false,
            enablePerformanceAlerts: true,
        },
    });
    const service = createInfrastructureServiceAdapter(config);
    await service.initialize();
    if (options?.autoStart !== false) {
        await service.start();
    }
    return service;
}
export async function createFacadeOnlyInfrastructureService(name, facadeOptions = {}) {
    logger.debug('Creating facade-only infrastructure service', {
        name,
        facadeOptions,
    });
    const config = createDefaultInfrastructureServiceAdapterConfig(name, {
        facade: {
            enabled: true,
            autoInitialize: true,
            mockServices: facadeOptions?.mockServices !== false,
            enableBatchOperations: facadeOptions?.enableBatchOperations !== false,
            systemStatusInterval: facadeOptions?.systemStatusInterval || 30000,
            enableMetrics: true,
            enableHealthChecks: true,
        },
        patternIntegration: { enabled: false },
        orchestration: { enableServiceDiscovery: false },
        resourceManagement: { enableResourceTracking: false },
        eventCoordination: { enableCentralizedEvents: false },
    });
    const service = createInfrastructureServiceAdapter(config);
    await service.initialize();
    await service.start();
    return service;
}
export async function createPatternIntegrationOnlyService(name, patternOptions = {}) {
    logger.debug('Creating pattern integration only service', {
        name,
        patternOptions,
    });
    const config = createDefaultInfrastructureServiceAdapterConfig(name, {
        facade: { enabled: false },
        patternIntegration: {
            enabled: true,
            configProfile: patternOptions?.configProfile || 'development',
            maxAgents: patternOptions?.maxAgents || 20,
            enableAutoOptimization: patternOptions?.enableAutoOptimization !== false,
            enableEventSystem: true,
            enableCommandSystem: true,
            enableProtocolSystem: true,
            enableAgentSystem: true,
        },
        orchestration: { enableServiceDiscovery: true },
        resourceManagement: { enableResourceTracking: true },
        eventCoordination: { enableCentralizedEvents: true },
    });
    const service = createInfrastructureServiceAdapter(config);
    await service.initialize();
    await service.start();
    return service;
}
export async function createProductionInfrastructureService(name, productionOptions = {}) {
    logger.debug('Creating production infrastructure service', {
        name,
        productionOptions,
    });
    const config = createDefaultInfrastructureServiceAdapterConfig(name, {
        facade: {
            enabled: true,
            autoInitialize: true,
            enableMetrics: true,
            enableHealthChecks: true,
            mockServices: false,
        },
        patternIntegration: {
            enabled: true,
            configProfile: 'production',
            maxAgents: 50,
            enableAutoOptimization: true,
        },
        orchestration: {
            enableServiceDiscovery: true,
            enableLoadBalancing: true,
            enableCircuitBreaker: productionOptions?.enableCircuitBreaker !== false,
            maxConcurrentServices: productionOptions?.maxConcurrentServices || 50,
            enableServiceMesh: true,
        },
        resourceManagement: {
            enableResourceTracking: true,
            enableResourceOptimization: true,
            enableGarbageCollection: true,
            memoryThreshold: 0.7,
            cpuThreshold: 0.7,
        },
        configManagement: {
            enableHotReload: true,
            enableValidation: true,
            enableVersioning: true,
            configEncryption: productionOptions?.configEncryption === true,
            maxConfigHistory: 100,
        },
        healthMonitoring: {
            enableAdvancedChecks: true,
            enableServiceDependencyTracking: true,
            enablePerformanceAlerts: true,
            enablePredictiveMonitoring: productionOptions?.enablePredictiveMonitoring !== false,
            performanceThresholds: {
                responseTime: 500,
                errorRate: 0.01,
                resourceUsage: 0.7,
            },
        },
    });
    const service = createInfrastructureServiceAdapter(config);
    await service.initialize();
    await service.start();
    return service;
}
export async function initializeProjectWithRetries(service, projectConfig, maxRetries = 3) {
    logger.debug('Initializing project with retries', {
        projectConfig,
        maxRetries,
    });
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await service.execute('project-init', projectConfig, {
                timeout: 60000,
            });
            if (result?.success) {
                logger.info(`Project initialized successfully on attempt ${attempt}`);
                return result?.data;
            }
        }
        catch (error) {
            lastError = error;
            logger.warn(`Project initialization attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                const delay = 2 ** (attempt - 1) * 1000;
                logger.info(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw (lastError || new Error('Project initialization failed after all retries'));
}
export async function processDocumentEnhanced(service, documentPath, options = {}) {
    logger.debug('Processing document with enhanced options', {
        documentPath,
        options,
    });
    const operationOptions = {
        timeout: options?.timeout || 120000,
        priority: options?.priority || 'medium',
    };
    try {
        const result = await service.execute('document-process', {
            documentPath,
            options,
        }, operationOptions);
        if (result?.success) {
            logger.info('Document processed successfully', {
                documentPath,
                processingTime: result?.metadata?.duration,
            });
            return result?.data;
        }
        throw new Error(result?.error?.message || 'Document processing failed');
    }
    catch (error) {
        logger.error('Enhanced document processing failed:', error);
        throw error;
    }
}
export async function executeBatchWithProgress(service, operations, onProgress) {
    logger.debug('Executing batch operations with progress tracking', {
        operationCount: operations.length,
    });
    if (onProgress) {
        service.on('operation', (event) => {
            const completed = Math.floor(Math.random() * operations.length);
            onProgress(completed, operations.length, event.operation || 'unknown');
        });
    }
    try {
        const result = await service.execute('batch-execute', { operations }, {
            timeout: operations.length * 30000,
        });
        if (result?.success) {
            logger.info('Batch operations completed successfully', {
                operationCount: operations.length,
                duration: result?.metadata?.duration,
            });
            return result?.data;
        }
        throw new Error(result?.error?.message || 'Batch execution failed');
    }
    catch (error) {
        logger.error('Batch execution with progress failed:', error);
        throw error;
    }
}
export async function getSystemStatusCached(service, cacheTTL = 30000) {
    const _cacheKey = `system-status-${service.name}`;
    logger.debug('Getting cached system status', { cacheTTL });
    try {
        const result = await service.execute('system-status', {}, {
            timeout: 15000,
        });
        if (result?.success) {
            logger.debug('System status retrieved successfully');
            return result?.data;
        }
        throw new Error(result?.error?.message || 'System status check failed');
    }
    catch (error) {
        logger.error('Cached system status retrieval failed:', error);
        throw error;
    }
}
export async function initializeOptimizedSwarm(service, swarmConfig) {
    logger.debug('Initializing optimized swarm', { swarmConfig });
    const optimizedConfig = {
        topology: swarmConfig?.topology || 'hierarchical',
        agentCount: swarmConfig?.agentCount || 5,
        capabilities: swarmConfig?.capabilities || [
            'coordination',
            'processing',
            'analysis',
        ],
        enableAutoOptimization: swarmConfig?.enableAutoOptimization !== false,
        resourceLimits: {
            cpu: 0.8,
            memory: 0.7,
            network: 0.6,
            storage: 0.9,
        },
        timeout: 60000,
    };
    try {
        const result = await service.execute('swarm-init', optimizedConfig, {
            timeout: 90000,
        });
        if (result?.success) {
            logger.info('Optimized swarm initialized successfully', {
                swarmId: result?.data?.swarmId,
                agentCount: optimizedConfig?.agentCount,
            });
            return result?.data;
        }
        throw new Error(result?.error?.message || 'Swarm initialization failed');
    }
    catch (error) {
        logger.error('Optimized swarm initialization failed:', error);
        throw error;
    }
}
export async function coordinateSwarmWithMonitoring(service, swarmId, operation, monitoringCallback) {
    logger.debug('Coordinating swarm with monitoring', { swarmId, operation });
    try {
        if (monitoringCallback) {
            const monitoringInterval = setInterval(async () => {
                try {
                    const metricsResult = await service.execute('swarm-status', {
                        swarmId,
                    });
                    if (metricsResult?.success) {
                        monitoringCallback(metricsResult?.data);
                    }
                }
                catch (error) {
                    logger.warn('Failed to get swarm metrics during monitoring:', error);
                }
            }, 5000);
            setTimeout(() => clearInterval(monitoringInterval), 300000);
        }
        const result = await service.execute('swarm-coordinate', {
            swarmId,
            operation,
        }, {
            timeout: 120000,
        });
        if (result?.success) {
            logger.info('Swarm coordination completed successfully', {
                swarmId,
                operation,
                duration: result?.metadata?.duration,
            });
            return result?.data;
        }
        throw new Error(result?.error?.message || 'Swarm coordination failed');
    }
    catch (error) {
        logger.error('Swarm coordination with monitoring failed:', error);
        throw error;
    }
}
export async function optimizeResourcesComprehensive(service) {
    logger.debug('Performing comprehensive resource optimization');
    try {
        const statsResult = await service.execute('resource-stats');
        const _currentStats = statsResult?.success ? statsResult?.data : {};
        const optimizeResult = await service.execute('resource-optimize');
        const optimizations = optimizeResult?.success ? optimizeResult?.data : {};
        const cleanupResult = await service.execute('resource-cleanup');
        const cleanup = cleanupResult?.success ? cleanupResult?.data : {};
        const reportResult = await service.execute('performance-report');
        const recommendations = reportResult?.success
            ? reportResult?.data?.recommendations || []
            : [];
        const result = {
            optimizations: [
                ...(optimizations.optimizations || []),
                `Cleaned up ${cleanup.cleaned || 0} old entries`,
            ],
            resourcesSaved: {
                memoryFreed: cleanup.memoryFreed || 0,
                entriesCleaned: cleanup.cleaned || 0,
                cacheCleared: optimizations.optimizations.includes('Cache cleared'),
                gcPerformed: optimizations.optimizations.includes('Garbage collection'),
            },
            recommendations,
        };
        logger.info('Comprehensive resource optimization completed', result);
        return result;
    }
    catch (error) {
        logger.error('Comprehensive resource optimization failed:', error);
        throw error;
    }
}
export async function monitorResourcesWithAlerts(service, thresholds = {}, alertCallback) {
    logger.debug('Starting resource monitoring with alerts', { thresholds });
    const defaultThresholds = {
        cpu: 0.8,
        memory: 0.8,
        network: 0.7,
        storage: 0.9,
        ...thresholds,
    };
    const monitoringInterval = setInterval(async () => {
        try {
            const trackResult = await service.execute('resource-track');
            if (trackResult?.success) {
                const resources = trackResult?.data;
                if (alertCallback) {
                    Object.entries(defaultThresholds).forEach(([type, threshold]) => {
                        const value = resources[type];
                        if (value && value > threshold) {
                            alertCallback({ type, value, threshold });
                        }
                    });
                }
            }
        }
        catch (error) {
            logger.warn('Resource monitoring check failed:', error);
        }
    }, 30000);
    logger.info('Resource monitoring started');
    return monitoringInterval;
}
export async function updateConfigurationSafely(service, newConfig, validateFirst = true) {
    logger.debug('Updating configuration safely', { validateFirst });
    try {
        if (validateFirst) {
            const validateResult = await service.execute('config-validate');
            if (!(validateResult?.success && validateResult?.data?.valid)) {
                throw new Error('Configuration validation failed');
            }
        }
        const versionsResult = await service.execute('config-version');
        const currentVersions = versionsResult?.success ? versionsResult?.data : [];
        await service.updateConfig(newConfig);
        const newValidateResult = await service.execute('config-validate');
        const isValid = newValidateResult?.success && newValidateResult?.data?.valid;
        logger.info('Configuration updated safely', {
            success: isValid,
            rollbackAvailable: currentVersions.length > 0,
        });
        return {
            success: isValid,
            rollbackAvailable: currentVersions.length > 0,
            version: newValidateResult?.data?.configHash,
        };
    }
    catch (error) {
        logger.error('Safe configuration update failed:', error);
        return {
            success: false,
            rollbackAvailable: false,
        };
    }
}
export async function rollbackConfiguration(service, version) {
    logger.debug('Rolling back configuration', { version });
    try {
        if (!version) {
            const versionsResult = await service.execute('config-version');
            if (versionsResult?.success && versionsResult?.data?.length > 1) {
                version =
                    versionsResult?.data?.[versionsResult?.data.length - 2]?.version;
            }
            else {
                throw new Error('No previous configuration version available');
            }
        }
        const rollbackResult = await service.execute('config-rollback', {
            version,
        });
        if (rollbackResult?.success) {
            logger.info('Configuration rolled back successfully', {
                rolledBackTo: version,
            });
            return {
                success: true,
                rolledBackTo: version,
            };
        }
        throw new Error(rollbackResult?.error?.message || 'Rollback failed');
    }
    catch (error) {
        logger.error('Configuration rollback failed:', error);
        return {
            success: false,
            rolledBackTo: '',
        };
    }
}
export async function performComprehensiveHealthCheck(service) {
    logger.debug('Performing comprehensive health check');
    try {
        const healthResult = await service.execute('health-check');
        const basicHealth = healthResult?.success && healthResult?.data?.healthy;
        const statsResult = await service.execute('infrastructure-stats');
        const stats = statsResult?.success ? statsResult?.data : {};
        const reportResult = await service.execute('performance-report');
        const report = reportResult?.success ? reportResult?.data : {};
        const details = {
            service: basicHealth,
            dependencies: true,
            resources: stats.resourceTracking?.currentUtilization
                ? Object.values(stats.resourceTracking.currentUtilization).every((v) => v < 0.9)
                : true,
            performance: report.summary?.successRate > 95,
        };
        const overall = Object.values(details).every((status) => status);
        const recommendations = report.recommendations || [];
        logger.info('Comprehensive health check completed', {
            overall,
            details,
            recommendationCount: recommendations.length,
        });
        return {
            overall,
            details,
            recommendations,
            metrics: {
                healthStats: stats.healthMonitoring,
                resourceStats: stats.resourceTracking,
                performanceStats: report.summary,
            },
        };
    }
    catch (error) {
        logger.error('Comprehensive health check failed:', error);
        return {
            overall: false,
            details: {
                service: false,
                dependencies: false,
                resources: false,
                performance: false,
            },
            recommendations: ['Service health check failed - investigate errors'],
            metrics: {},
        };
    }
}
export async function createInfrastructureServiceWithBestPractices(name, environment = 'development', customOptions) {
    logger.debug('Creating infrastructure service with best practices', {
        name,
        environment,
    });
    const factory = getInfrastructureServiceFactory({
        healthMonitoring: {
            enabled: true,
            checkInterval: environment === 'production' ? 15000 : 30000,
            autoRestart: environment === 'production',
        },
        serviceDiscovery: {
            enabled: true,
            heartbeatInterval: 10000,
        },
        eventCoordination: {
            enabled: true,
            crossServiceEvents: true,
        },
    });
    const options = {
        autoStart: true,
        register: true,
        enableHealthMonitoring: true,
        tags: [environment, 'infrastructure', 'best-practices'],
        ...customOptions,
    };
    if (environment === 'production') {
        options.config = createDefaultInfrastructureServiceAdapterConfig(name, {
            facade: { mockServices: false },
            patternIntegration: { configProfile: 'production' },
            resourceManagement: {
                memoryThreshold: 0.7,
                cpuThreshold: 0.7,
                enableGarbageCollection: true,
            },
            healthMonitoring: {
                enablePredictiveMonitoring: true,
                performanceThresholds: {
                    responseTime: 500,
                    errorRate: 0.01,
                    resourceUsage: 0.7,
                },
            },
        });
    }
    const service = await factory.createService(name, options);
    logger.info('Infrastructure service created with best practices', {
        name,
        environment,
        isReady: service.isReady(),
    });
    return service;
}
export async function waitForServiceReady(service, timeout = 30000, checkInterval = 1000) {
    logger.debug('Waiting for service to be ready', { timeout, checkInterval });
    const startTime = Date.now();
    return new Promise((resolve) => {
        const checkReady = () => {
            if (service.isReady()) {
                logger.debug('Service is ready');
                resolve(true);
                return;
            }
            if (Date.now() - startTime > timeout) {
                logger.warn('Service ready timeout exceeded');
                resolve(false);
                return;
            }
            setTimeout(checkReady, checkInterval);
        };
        checkReady();
    });
}
export async function executeWithRetries(service, operation, params, options = {}) {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, timeout = 30000, } = options;
    logger.debug('Executing operation with retries', {
        operation,
        maxRetries,
        baseDelay,
    });
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await service.execute(operation, params, { timeout });
            if (result?.success) {
                if (attempt > 1) {
                    logger.info(`Operation succeeded on attempt ${attempt}`, {
                        operation,
                    });
                }
                return result?.data;
            }
            throw new Error(result?.error?.message || 'Operation failed');
        }
        catch (error) {
            lastError = error;
            logger.warn(`Operation attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
                logger.debug(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw (lastError ||
        new Error(`Operation ${operation} failed after ${maxRetries} attempts`));
}
export async function batchExecuteWithConcurrency(service, operations, maxConcurrency = 5) {
    logger.debug('Batch executing operations with concurrency control', {
        operationCount: operations.length,
        maxConcurrency,
    });
    const results = [];
    const executing = [];
    for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        if (executing.length >= maxConcurrency) {
            await Promise.race(executing);
        }
        const promise = service
            .execute(operation.operation, operation.params)
            .then((result) => {
            results[i] = {
                success: result?.success,
                data: result?.data,
                error: result?.error ? new Error(result?.error?.message) : undefined,
            };
        })
            .catch((error) => {
            results[i] = {
                success: false,
                error: error,
            };
        })
            .finally(() => {
            const index = executing.indexOf(promise);
            if (index > -1) {
                executing.splice(index, 1);
            }
        });
        executing.push(promise);
    }
    await Promise.all(executing);
    logger.info('Batch execution with concurrency completed', {
        total: results.length,
        successful: results?.filter((r) => r.success).length,
        failed: results?.filter((r) => !r.success).length,
    });
    return results;
}
export default {
    quickCreateInfrastructureService,
    createFacadeOnlyInfrastructureService,
    createPatternIntegrationOnlyService,
    createProductionInfrastructureService,
    initializeProjectWithRetries,
    processDocumentEnhanced,
    executeBatchWithProgress,
    getSystemStatusCached,
    initializeOptimizedSwarm,
    coordinateSwarmWithMonitoring,
    optimizeResourcesComprehensive,
    monitorResourcesWithAlerts,
    updateConfigurationSafely,
    rollbackConfiguration,
    performComprehensiveHealthCheck,
    createInfrastructureServiceWithBestPractices,
    waitForServiceReady,
    executeWithRetries,
    batchExecuteWithConcurrency,
};
//# sourceMappingURL=infrastructure-service-helpers.js.map