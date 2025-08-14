import { MemoryBackendFactory } from '../backends/factory.ts';
import { MemoryCoordinator, } from '../core/memory-coordinator.ts';
import { PerformanceOptimizer, } from '../optimization/performance-optimizer.ts';
let memoryCoordinator = null;
let performanceOptimizer = null;
const registeredBackends = new Map();
export const memoryInitTool = {
    name: 'memory_init',
    description: 'Initialize advanced memory coordination system with distributed protocols',
    inputSchema: {
        type: 'object',
        properties: {
            coordination: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean', default: true },
                    consensus: {
                        type: 'object',
                        properties: {
                            quorum: {
                                type: 'number',
                                minimum: 0.5,
                                maximum: 1.0,
                                default: 0.67,
                            },
                            timeout: { type: 'number', minimum: 1000, default: 5000 },
                            strategy: {
                                type: 'string',
                                enum: ['majority', 'unanimous', 'leader'],
                                default: 'majority',
                            },
                        },
                    },
                    distributed: {
                        type: 'object',
                        properties: {
                            replication: {
                                type: 'number',
                                minimum: 1,
                                maximum: 5,
                                default: 2,
                            },
                            consistency: {
                                type: 'string',
                                enum: ['eventual', 'strong', 'weak'],
                                default: 'eventual',
                            },
                            partitioning: {
                                type: 'string',
                                enum: ['hash', 'range', 'consistent'],
                                default: 'hash',
                            },
                        },
                    },
                },
            },
            optimization: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean', default: true },
                    strategies: {
                        type: 'object',
                        properties: {
                            caching: { type: 'boolean', default: true },
                            compression: { type: 'boolean', default: false },
                            prefetching: { type: 'boolean', default: true },
                            indexing: { type: 'boolean', default: true },
                            partitioning: { type: 'boolean', default: false },
                        },
                    },
                    adaptation: {
                        type: 'object',
                        properties: {
                            enabled: { type: 'boolean', default: true },
                            learningRate: {
                                type: 'number',
                                minimum: 0.01,
                                maximum: 1.0,
                                default: 0.1,
                            },
                            adaptationInterval: {
                                type: 'number',
                                minimum: 10000,
                                default: 60000,
                            },
                        },
                    },
                },
            },
            backends: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['sqlite', 'lancedb', 'json'] },
                        config: { type: 'object' },
                    },
                    required: ['id', 'type', 'config'],
                },
            },
        },
    },
    handler: async (params) => {
        try {
            const { coordination = {}, optimization = {}, backends = [] } = params;
            const coordinationConfig = {
                enabled: coordination.enabled ?? true,
                consensus: {
                    quorum: coordination.consensus?.quorum ?? 0.67,
                    timeout: coordination.consensus?.timeout ?? 5000,
                    strategy: coordination.consensus?.strategy ?? 'majority',
                },
                distributed: {
                    replication: coordination.distributed?.replication ?? 2,
                    consistency: coordination.distributed?.consistency ?? 'eventual',
                    partitioning: coordination.distributed?.partitioning ?? 'hash',
                },
                optimization: {
                    autoCompaction: true,
                    cacheEviction: 'adaptive',
                    memoryThreshold: 0.8,
                },
            };
            memoryCoordinator = new MemoryCoordinator(coordinationConfig);
            const optimizationConfig = {
                enabled: optimization.enabled ?? true,
                strategies: {
                    caching: optimization.strategies?.caching ?? true,
                    compression: optimization.strategies?.compression ?? false,
                    prefetching: optimization.strategies?.prefetching ?? true,
                    indexing: optimization.strategies?.indexing ?? true,
                    partitioning: optimization.strategies?.partitioning ?? false,
                },
                thresholds: {
                    latencyWarning: 100,
                    errorRateWarning: 0.05,
                    memoryUsageWarning: 0.8,
                    cacheHitRateMin: 0.7,
                },
                adaptation: {
                    enabled: optimization.adaptation?.enabled ?? true,
                    learningRate: optimization.adaptation?.learningRate ?? 0.1,
                    adaptationInterval: optimization.adaptation?.adaptationInterval ?? 60000,
                },
            };
            performanceOptimizer = new PerformanceOptimizer(optimizationConfig);
            const initializedBackends = [];
            for (const backendConfig of backends) {
                try {
                    const backend = await MemoryBackendFactory.createBackend(backendConfig?.type, backendConfig?.config);
                    await backend.initialize();
                    registeredBackends.set(backendConfig?.id, backend);
                    await memoryCoordinator.registerNode(backendConfig?.id, backend);
                    performanceOptimizer.registerBackend(backendConfig?.id, backend);
                    initializedBackends.push({
                        id: backendConfig?.id,
                        type: backendConfig?.type,
                        status: 'initialized',
                    });
                }
                catch (error) {
                    initializedBackends.push({
                        id: backendConfig?.id,
                        type: backendConfig?.type,
                        status: 'failed',
                        error: error.message,
                    });
                }
            }
            return {
                success: true,
                data: {
                    coordinator: {
                        status: 'initialized',
                        config: coordinationConfig,
                    },
                    optimizer: {
                        status: 'initialized',
                        config: optimizationConfig,
                    },
                    backends: initializedBackends,
                },
                metadata: {
                    timestamp: Date.now(),
                    version: '1.0.0',
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const memoryOptimizeTool = {
    name: 'memory_optimize',
    description: 'Optimize memory system performance using advanced algorithms',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                enum: ['latency', 'memory', 'cache', 'error_rate', 'all'],
                default: 'all',
                description: 'Optimization target',
            },
            strategy: {
                type: 'string',
                enum: ['aggressive', 'conservative', 'adaptive'],
                default: 'adaptive',
                description: 'Optimization strategy',
            },
            force: {
                type: 'boolean',
                default: false,
                description: 'Force optimization even if not needed',
            },
        },
    },
    handler: async (params) => {
        try {
            if (!performanceOptimizer) {
                throw new Error('Performance optimizer not initialized. Run memory_init first.');
            }
            const { target = 'all', strategy = 'adaptive', force = false } = params;
            const stats = performanceOptimizer.getStats();
            const recommendations = performanceOptimizer.getRecommendations();
            const results = [];
            if (target === 'all' || target === 'latency') {
                if (force || stats.metrics.averageLatency > 50) {
                    performanceOptimizer.emit('suggest', 'latency');
                    results.push({
                        type: 'latency',
                        action: 'cache_adjustment_suggested',
                    });
                }
            }
            if (target === 'all' || target === 'memory') {
                if (force || stats.metrics.memoryUsage > 0.7) {
                    performanceOptimizer.emit('suggest', 'memory');
                    results.push({ type: 'memory', action: 'compression_suggested' });
                }
            }
            if (target === 'all' || target === 'cache') {
                if (force || stats.metrics.cacheHitRate < 0.8) {
                    performanceOptimizer.emit('suggest', 'cache');
                    results.push({
                        type: 'cache',
                        action: 'prefetch_adjustment_suggested',
                    });
                }
            }
            return {
                success: true,
                data: {
                    target,
                    strategy,
                    optimizations: results,
                    currentMetrics: stats.metrics,
                    recommendations,
                },
                metadata: {
                    timestamp: Date.now(),
                    optimizerConfig: stats.config,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const memoryMonitorTool = {
    name: 'memory_monitor',
    description: 'Real-time monitoring of memory system performance and health',
    inputSchema: {
        type: 'object',
        properties: {
            duration: {
                type: 'number',
                minimum: 1000,
                maximum: 300000,
                default: 30000,
                description: 'Monitoring duration in milliseconds',
            },
            metrics: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: [
                        'latency',
                        'throughput',
                        'memory',
                        'cache',
                        'errors',
                        'coordination',
                    ],
                },
                default: ['latency', 'throughput', 'memory', 'cache'],
                description: 'Metrics to monitor',
            },
            alertThresholds: {
                type: 'object',
                properties: {
                    latency: { type: 'number', default: 100 },
                    errorRate: { type: 'number', default: 0.05 },
                    memoryUsage: { type: 'number', default: 0.8 },
                    cacheHitRate: { type: 'number', default: 0.7 },
                },
            },
        },
    },
    handler: async (params) => {
        try {
            const { duration = 30000, metrics = ['latency', 'throughput', 'memory', 'cache'], alertThresholds = {}, } = params;
            const monitoringData = {
                startTime: Date.now(),
                duration,
                metrics: {},
                alerts: [],
                systems: {},
            };
            if (memoryCoordinator) {
                const coordinatorHealth = await memoryCoordinator.healthCheck();
                (monitoringData?.systems).coordinator = coordinatorHealth;
            }
            if (performanceOptimizer) {
                const optimizerStats = performanceOptimizer.getStats();
                (monitoringData?.systems).optimizer = optimizerStats;
                const currentMetrics = optimizerStats.metrics;
                if (metrics.includes('latency') &&
                    currentMetrics?.averageLatency > (alertThresholds.latency || 100)) {
                    monitoringData?.alerts?.push({
                        type: 'latency',
                        severity: 'warning',
                        value: currentMetrics?.averageLatency,
                        threshold: alertThresholds.latency || 100,
                        message: 'Average latency exceeds threshold',
                    });
                }
                if (metrics.includes('errors') &&
                    currentMetrics?.errorRate > (alertThresholds.errorRate || 0.05)) {
                    monitoringData?.alerts?.push({
                        type: 'error_rate',
                        severity: 'warning',
                        value: currentMetrics?.errorRate,
                        threshold: alertThresholds.errorRate || 0.05,
                        message: 'Error rate exceeds threshold',
                    });
                }
                if (metrics.includes('memory') &&
                    currentMetrics?.memoryUsage > (alertThresholds.memoryUsage || 0.8)) {
                    monitoringData?.alerts?.push({
                        type: 'memory_usage',
                        severity: 'warning',
                        value: currentMetrics?.memoryUsage,
                        threshold: alertThresholds.memoryUsage || 0.8,
                        message: 'Memory usage exceeds threshold',
                    });
                }
                if (metrics.includes('cache') &&
                    currentMetrics?.cacheHitRate < (alertThresholds.cacheHitRate || 0.7)) {
                    monitoringData?.alerts?.push({
                        type: 'cache_hit_rate',
                        severity: 'warning',
                        value: currentMetrics?.cacheHitRate,
                        threshold: alertThresholds.cacheHitRate || 0.7,
                        message: 'Cache hit rate below threshold',
                    });
                }
                monitoringData.metrics = currentMetrics;
            }
            const backendStatus = [];
            for (const [id, backend] of registeredBackends) {
                try {
                    if ('retrieve' in backend && typeof backend.retrieve === 'function') {
                        await backend.retrieve('__health_check__');
                    }
                    else if ('get' in backend && typeof backend.get === 'function') {
                        await backend.get('__health_check__');
                    }
                    else {
                        throw new Error('Backend lacks required methods');
                    }
                    backendStatus.push({
                        id,
                        status: 'healthy',
                        type: backend.constructor.name,
                    });
                }
                catch {
                    backendStatus.push({
                        id,
                        status: 'degraded',
                        type: backend.constructor.name,
                    });
                }
            }
            (monitoringData?.systems).backends = backendStatus;
            return {
                success: true,
                data: monitoringData,
                metadata: {
                    timestamp: Date.now(),
                    monitoring: true,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const memoryDistributeTool = {
    name: 'memory_distribute',
    description: 'Coordinate distributed memory operations with consensus protocols',
    inputSchema: {
        type: 'object',
        properties: {
            operation: {
                type: 'string',
                enum: ['read', 'write', 'delete', 'sync', 'repair'],
                description: 'Distributed operation type',
            },
            sessionId: { type: 'string', description: 'Session identifier' },
            key: { type: 'string', description: 'Data key' },
            value: { description: 'Data value (for write operations)' },
            consistency: {
                type: 'string',
                enum: ['eventual', 'strong', 'weak'],
                default: 'eventual',
                description: 'Consistency requirement',
            },
            timeout: {
                type: 'number',
                minimum: 1000,
                maximum: 30000,
                default: 5000,
                description: 'Operation timeout in milliseconds',
            },
        },
        required: ['operation', 'sessionId', 'key'],
    },
    handler: async (params) => {
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { operation, sessionId, key, value, consistency = 'eventual', timeout = 5000, } = params;
            const coordinationParams = {
                type: operation,
                sessionId,
                target: key,
                metadata: value ? { data: value } : undefined,
            };
            const decision = await memoryCoordinator.coordinate(coordinationParams);
            return {
                success: true,
                data: {
                    operation,
                    sessionId,
                    key,
                    decision: {
                        id: decision.id,
                        status: decision.status,
                        participants: decision.participants,
                        timestamp: decision.timestamp,
                    },
                    consistency,
                    result: operation === 'read'
                        ? await memoryCoordinator.coordinate({
                            type: 'read',
                            sessionId,
                            target: key,
                        })
                        : undefined,
                },
                metadata: {
                    timestamp: Date.now(),
                    coordinatorStats: memoryCoordinator.getStats(),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const memoryHealthCheckTool = {
    name: 'memory_health_check',
    description: 'Comprehensive health check for memory system components',
    inputSchema: {
        type: 'object',
        properties: {
            components: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['coordinator', 'optimizer', 'backends', 'all'],
                },
                default: ['all'],
                description: 'Components to check',
            },
            detailed: {
                type: 'boolean',
                default: false,
                description: 'Include detailed diagnostics',
            },
        },
    },
    handler: async (params) => {
        try {
            const { components = ['all'], detailed = false } = params;
            const healthReport = {
                overall: 'healthy',
                timestamp: Date.now(),
                components: {},
                issues: [],
                recommendations: [],
            };
            const shouldCheck = (component) => components.includes('all') || components.includes(component);
            if (shouldCheck('coordinator')) {
                if (memoryCoordinator) {
                    const coordinatorHealth = await memoryCoordinator.healthCheck();
                    healthReport.components.coordinator = {
                        status: coordinatorHealth.status,
                        details: detailed ? coordinatorHealth.details : undefined,
                    };
                    if (coordinatorHealth.status !== 'healthy') {
                        healthReport.overall = 'degraded';
                        healthReport.issues.push(`Coordinator is ${coordinatorHealth.status}`);
                    }
                }
                else {
                    healthReport.components.coordinator = {
                        status: 'not_initialized',
                    };
                    healthReport.issues.push('Memory coordinator not initialized');
                }
            }
            if (shouldCheck('optimizer')) {
                if (performanceOptimizer) {
                    const optimizerStats = performanceOptimizer.getStats();
                    const recommendations = performanceOptimizer.getRecommendations();
                    healthReport.components.optimizer = {
                        status: 'healthy',
                        metrics: optimizerStats.metrics,
                        details: detailed ? optimizerStats : undefined,
                    };
                    healthReport.recommendations.push(...recommendations);
                }
                else {
                    healthReport.components.optimizer = {
                        status: 'not_initialized',
                    };
                    healthReport.issues.push('Performance optimizer not initialized');
                }
            }
            if (shouldCheck('backends')) {
                const backendHealth = {};
                let healthyBackends = 0;
                for (const [id, backend] of registeredBackends) {
                    try {
                        if ('retrieve' in backend &&
                            typeof backend.retrieve === 'function') {
                            await backend.retrieve('__health_check__');
                        }
                        else if ('get' in backend && typeof backend.get === 'function') {
                            await backend.get('__health_check__');
                        }
                        else {
                            throw new Error('Backend lacks required methods');
                        }
                        backendHealth[id] = {
                            status: 'healthy',
                            type: backend.constructor.name,
                        };
                        healthyBackends++;
                    }
                    catch (error) {
                        backendHealth[id] = {
                            status: 'unhealthy',
                            type: backend.constructor.name,
                            error: error.message,
                        };
                        healthReport.issues.push(`Backend ${id} is unhealthy: ${error.message}`);
                    }
                }
                healthReport.components.backends = {
                    total: registeredBackends.size,
                    healthy: healthyBackends,
                    details: detailed ? backendHealth : undefined,
                };
                if (healthyBackends < registeredBackends.size) {
                    healthReport.overall = 'degraded';
                }
            }
            if (healthReport.issues.length > 0) {
                healthReport.overall = healthReport.issues.some((issue) => issue.includes('not_initialized') || issue.includes('unhealthy'))
                    ? 'critical'
                    : 'degraded';
            }
            return {
                success: true,
                data: healthReport,
                metadata: {
                    timestamp: Date.now(),
                    version: '1.0.0',
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const memoryTools = [
    memoryInitTool,
    memoryOptimizeTool,
    memoryMonitorTool,
    memoryDistributeTool,
    memoryHealthCheckTool,
];
export default memoryTools;
//# sourceMappingURL=memory-tools.js.map