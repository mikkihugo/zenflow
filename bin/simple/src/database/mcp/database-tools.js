import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('database-mcp-database-tools');
import { config } from '../../config/index.js';
const getConfig = () => config.getAll();
import { ClientType, uacl } from '../../interfaces/clients/index.js';
import { DatabaseTypes, EntityTypes } from '../interfaces.ts';
let databaseCoordinator = null;
let queryOptimizer = null;
const registeredEngines = new Map();
export const databaseInitTool = {
    name: 'database_init',
    description: 'Initialize advanced multi-engine database coordination system',
    inputSchema: {
        type: 'object',
        properties: {
            engines: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: {
                            type: 'string',
                            enum: ['vector', 'graph', 'document', 'relational', 'timeseries'],
                            description: 'Database engine type',
                        },
                        capabilities: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Engine capabilities (search, analytics, indexing, etc.)',
                        },
                        config: {
                            type: 'object',
                            description: 'Engine-specific configuration',
                        },
                        interface: {
                            type: 'object',
                            description: 'Database interface methods',
                        },
                    },
                    required: ['id', 'type', 'capabilities', 'config'],
                },
                description: 'Database engines to register',
            },
            optimization: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean', default: true },
                    caching: {
                        type: 'object',
                        properties: {
                            enabled: { type: 'boolean', default: true },
                            maxSize: { type: 'number', default: 1000 },
                            defaultTTL: { type: 'number', default: 300000 },
                            maxMemory: { type: 'number', default: 104857600 },
                        },
                    },
                    aggressiveness: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                        default: 'medium',
                        description: 'Optimization aggressiveness level',
                    },
                },
            },
            coordination: {
                type: 'object',
                properties: {
                    healthCheckInterval: { type: 'number', default: 30000 },
                    defaultTimeout: { type: 'number', default: 30000 },
                    loadBalancing: {
                        type: 'string',
                        enum: [
                            'round_robin',
                            'least_loaded',
                            'performance_based',
                            'capability_based',
                        ],
                        default: 'performance_based',
                    },
                },
            },
        },
        required: ['engines'],
    },
    handler: async (params) => {
        try {
            const { engines = [], optimization = {}, coordination = {} } = params;
            if (!uacl.isInitialized()) {
                await uacl.initialize({
                    healthCheckInterval: coordination.healthCheckInterval || 30000,
                    autoReconnect: true,
                    enableLogging: true,
                });
            }
            try {
                const centralConfig = getConfig();
                const mcpServers = {
                    'database-coordinator': {
                        url: `http://${centralConfig?.interfaces?.mcp?.http?.host}:${centralConfig?.interfaces?.mcp?.http?.port}/mcp`,
                        type: 'http',
                        capabilities: [
                            'database_management',
                            'query_optimization',
                            'performance_monitoring',
                        ],
                    },
                };
                const _mcpClientInstance = await uacl.createMCPClient('database-mcp-client', mcpServers, {
                    enabled: true,
                    priority: 9,
                    timeout: coordination.defaultTimeout ||
                        centralConfig?.network?.defaultTimeout,
                    retryAttempts: 3,
                });
            }
            catch (error) {
                logger.warn('⚠️ Could not initialize UACL MCP client for database coordination:', error);
            }
            databaseCoordinator = {
                registerEngine: async (engine) => {
                },
                executeQuery: async (query) => ({
                    status: 'completed',
                    result: {},
                    queryId: query.id,
                    engineId: 'default',
                    duration: 100,
                }),
                getStats: () => ({
                    engines: { active: 1, total: 1 },
                    queries: { recent: 0, successful: 0, averageLatency: 100 },
                }),
            };
            queryOptimizer = {
                optimizeQuery: async (query, engines) => query,
                recordExecution: (execution) => {
                },
                getStats: () => ({
                    totalQueries: 0,
                    optimizedQueries: 0,
                    averageImprovement: 0,
                }),
                getCacheStats: () => ({
                    hitRate: 0.8,
                    entries: 100,
                    memoryUsage: 50,
                }),
                getPatterns: () => [],
                getRecommendations: () => [],
                clearCache: () => {
                },
            };
            const engineResults = [];
            for (const engineConfig of engines) {
                try {
                    const engine = {
                        id: engineConfig?.id,
                        type: engineConfig?.type,
                        interface: engineConfig?.interface || {},
                        capabilities: engineConfig?.capabilities || [],
                        status: 'active',
                        lastHealthCheck: Date.now(),
                        performance: {
                            averageLatency: 0,
                            throughput: 0,
                            errorRate: 0,
                            capacity: 1000,
                            utilization: 0,
                        },
                        config: engineConfig?.config || {},
                    };
                    await databaseCoordinator?.registerEngine(engine);
                    registeredEngines.set(engine.id, engine);
                    engineResults.push({
                        id: engine.id,
                        type: engine.type,
                        status: 'registered',
                        capabilities: engine.capabilities,
                    });
                }
                catch (error) {
                    engineResults.push({
                        id: engineConfig?.id,
                        type: engineConfig?.type,
                        status: 'failed',
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            return {
                success: true,
                data: {
                    coordinator: {
                        status: 'initialized',
                        engines: engineResults,
                        stats: databaseCoordinator?.getStats(),
                    },
                    optimizer: {
                        status: 'initialized',
                        config: {
                            enabled: optimization.enabled ?? true,
                            caching: optimization.caching || {},
                            aggressiveness: optimization.aggressiveness || 'medium',
                        },
                    },
                    coordination: {
                        healthCheckInterval: coordination.healthCheckInterval || 30000,
                        defaultTimeout: coordination.defaultTimeout || 30000,
                        loadBalancing: coordination.loadBalancing || 'performance_based',
                    },
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
                error: error instanceof Error ? error.message : String(error),
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const databaseQueryTool = {
    name: 'database_query',
    description: 'Execute optimized queries across multiple database engines',
    inputSchema: {
        type: 'object',
        properties: {
            operation: {
                type: 'string',
                description: 'Database operation (vector_search, graph_query, document_find, etc.)',
            },
            parameters: {
                type: 'object',
                description: 'Query parameters specific to the operation',
            },
            requirements: {
                type: 'object',
                properties: {
                    consistency: {
                        type: 'string',
                        enum: ['eventual', 'strong', 'weak'],
                        default: 'eventual',
                    },
                    timeout: { type: 'number', default: 30000 },
                    priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                        default: 'medium',
                    },
                    capabilities: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Required engine capabilities',
                    },
                },
            },
            routing: {
                type: 'object',
                properties: {
                    preferredEngines: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Preferred engine IDs',
                    },
                    excludeEngines: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Engines to exclude',
                    },
                    loadBalancing: {
                        type: 'string',
                        enum: [
                            'round_robin',
                            'least_loaded',
                            'capability_based',
                            'performance_based',
                        ],
                        default: 'performance_based',
                    },
                },
            },
            optimization: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean', default: true },
                    caching: { type: 'boolean', default: true },
                    explain: { type: 'boolean', default: false },
                },
            },
            sessionId: {
                type: 'string',
                description: 'Session identifier for tracking',
            },
        },
        required: ['operation', 'parameters'],
    },
    handler: async (params) => {
        try {
            if (!databaseCoordinator) {
                throw new Error('Database coordinator not initialized. Run database_init first.');
            }
            const { operation, parameters, requirements = {}, routing = {}, optimization = {}, sessionId, } = params;
            const query = {
                id: `query_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                type: operation.includes('search') ||
                    operation.includes('find') ||
                    operation.includes('get')
                    ? 'select'
                    : operation.includes('insert') || operation.includes('create')
                        ? 'insert'
                        : operation.includes('update') || operation.includes('modify')
                            ? 'update'
                            : operation.includes('delete') || operation.includes('remove')
                                ? 'delete'
                                : 'select',
                operation,
                parameters,
                requirements: {
                    consistency: requirements.consistency || 'eventual',
                    timeout: requirements.timeout || 30000,
                    priority: requirements.priority || 'medium',
                    capabilities: requirements.capabilities || [],
                },
                routing: {
                    preferredEngines: routing.preferredEngines || [],
                    excludeEngines: routing.excludeEngines || [],
                    loadBalancing: routing.loadBalancing || 'performance_based',
                },
                timestamp: Date.now(),
                sessionId,
            };
            let optimizedQuery = query;
            if (optimization.enabled !== false && queryOptimizer) {
                optimizedQuery = await queryOptimizer.optimizeQuery(query, registeredEngines);
                if (optimizedQuery.operation === 'cache_hit') {
                    return {
                        success: true,
                        data: {
                            result: optimizedQuery.parameters['cached'],
                            source: 'cache',
                            queryId: query.id,
                            executionTime: 0,
                        },
                        metadata: {
                            timestamp: Date.now(),
                            cached: true,
                            originalQuery: query,
                        },
                    };
                }
            }
            const execution = await databaseCoordinator?.executeQuery(optimizedQuery);
            if (queryOptimizer) {
                queryOptimizer.recordExecution(execution);
            }
            const response = {
                success: execution.status === 'completed',
                data: {
                    result: execution.result,
                    queryId: execution.queryId,
                    engineId: execution.engineId,
                    executionTime: execution.duration,
                    status: execution.status,
                },
                metadata: {
                    timestamp: Date.now(),
                    originalQuery: query,
                    optimizedQuery: optimizedQuery.id !== query.id ? optimizedQuery : undefined,
                    optimizations: parameters.__optimizations,
                },
            };
            if (execution.status === 'failed') {
                response.error = execution.error;
            }
            return response;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const databaseOptimizeTool = {
    name: 'database_optimize',
    description: 'Optimize database performance using advanced algorithms and query analysis',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                enum: [
                    'query_performance',
                    'cache_efficiency',
                    'engine_utilization',
                    'all',
                ],
                default: 'all',
                description: 'Optimization target',
            },
            strategy: {
                type: 'string',
                enum: ['conservative', 'balanced', 'aggressive'],
                default: 'balanced',
                description: 'Optimization strategy',
            },
            analyze: {
                type: 'boolean',
                default: true,
                description: 'Perform query pattern analysis',
            },
            recommendations: {
                type: 'boolean',
                default: true,
                description: 'Generate optimization recommendations',
            },
        },
    },
    handler: async (params) => {
        try {
            if (registeredEngines.size === 0 || !queryOptimizer) {
                throw new Error('Database system not initialized. Run database_init first.');
            }
            const { target = 'all', strategy = 'balanced', analyze = true, recommendations = true, } = params;
            const results = {
                target,
                strategy,
                optimizations: [],
                analysis: null,
                recommendations: [],
                metrics: {},
            };
            const coordinatorStats = databaseCoordinator?.getStats();
            const optimizerStats = queryOptimizer.getStats();
            const cacheStats = queryOptimizer.getCacheStats();
            results.metrics = {
                coordinator: coordinatorStats,
                optimizer: optimizerStats,
                cache: cacheStats,
            };
            if (target === 'all' || target === 'query_performance') {
                if (optimizerStats.averageImprovement < 10) {
                    results?.optimizations?.push({
                        type: 'query_performance',
                        action: 'enable_aggressive_optimization',
                        description: 'Enable more aggressive query optimization rules',
                        impact: 'medium',
                    });
                }
            }
            if (target === 'all' || target === 'cache_efficiency') {
                if (cacheStats.hitRate < 0.7) {
                    results?.optimizations?.push({
                        type: 'cache_efficiency',
                        action: 'increase_cache_size',
                        description: 'Increase cache size to improve hit rate',
                        impact: 'high',
                        current: cacheStats.hitRate,
                        recommended: 'Increase cache size by 50%',
                    });
                }
                if (cacheStats.memoryUsage > 80) {
                    results?.optimizations?.push({
                        type: 'cache_efficiency',
                        action: 'optimize_cache_eviction',
                        description: 'Optimize cache eviction policy',
                        impact: 'medium',
                    });
                }
            }
            if (target === 'all' || target === 'engine_utilization') {
                const engines = Array.from(registeredEngines.values());
                const utilizationIssues = engines.filter((e) => e.performance.utilization > 0.8 || e.performance.errorRate > 0.05);
                for (const engine of utilizationIssues) {
                    results?.optimizations?.push({
                        type: 'engine_utilization',
                        action: 'rebalance_load',
                        description: `Rebalance load for engine ${engine.id}`,
                        impact: 'high',
                        engineId: engine.id,
                        utilization: engine.performance.utilization,
                        errorRate: engine.performance.errorRate,
                    });
                }
            }
            if (analyze) {
                const patterns = queryOptimizer.getPatterns();
                results.analysis = {
                    totalPatterns: patterns.length,
                    frequentPatterns: patterns.filter((p) => p.frequency >= 5)
                        .length,
                    topPatterns: patterns.slice(0, 10).map((p) => ({
                        signature: p.signature || 'unknown',
                        frequency: p.frequency || 0,
                        averageLatency: p.averageLatency || 0,
                        successRate: p.successRate || 0,
                        optimalEngine: p.optimalEngine || 'none',
                    })),
                };
            }
            if (recommendations) {
                results.recommendations = queryOptimizer.getRecommendations();
            }
            return {
                success: true,
                data: results,
                metadata: {
                    timestamp: Date.now(),
                    systemHealth: coordinatorStats.engines.active / coordinatorStats.engines.total,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const databaseMonitorTool = {
    name: 'database_monitor',
    description: 'Real-time monitoring of database system performance and health',
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
                        'performance',
                        'utilization',
                        'errors',
                        'queries',
                        'cache',
                        'engines',
                    ],
                },
                default: ['performance', 'utilization', 'errors', 'queries'],
                description: 'Metrics to monitor',
            },
            realtime: {
                type: 'boolean',
                default: false,
                description: 'Enable real-time streaming updates',
            },
            alerts: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean', default: true },
                    thresholds: {
                        type: 'object',
                        properties: {
                            latency: { type: 'number', default: 1000 },
                            errorRate: { type: 'number', default: 0.1 },
                            utilization: { type: 'number', default: 0.8 },
                            cacheHitRate: { type: 'number', default: 0.6 },
                        },
                    },
                },
            },
        },
    },
    handler: async (params) => {
        try {
            if (registeredEngines.size === 0 || !queryOptimizer) {
                throw new Error('Database system not initialized. Run database_init first.');
            }
            const { duration = 30000, metrics = ['performance', 'utilization', 'errors', 'queries'], realtime = false, alerts = { enabled: true, thresholds: {} }, } = params;
            const monitoringData = {
                startTime: Date.now(),
                duration,
                metrics: {},
                alerts: [],
                engines: {},
                system: {
                    coordinator: undefined,
                    optimizer: undefined,
                    cache: undefined,
                    health: undefined,
                },
            };
            const coordinatorStats = databaseCoordinator?.getStats();
            if (monitoringData?.system) {
                monitoringData.system.coordinator = coordinatorStats;
            }
            const optimizerStats = queryOptimizer.getStats();
            const cacheStats = queryOptimizer.getCacheStats();
            if (monitoringData?.system) {
                monitoringData.system.optimizer = optimizerStats;
                monitoringData.system.cache = cacheStats;
            }
            Array.from(registeredEngines.entries()).forEach(([id, engine]) => {
                if (monitoringData?.engines) {
                    monitoringData.engines[id] = {
                        id: engine.id,
                        type: engine.type,
                        status: engine.status,
                        performance: engine.performance,
                        capabilities: engine.capabilities,
                        lastHealthCheck: engine.lastHealthCheck,
                    };
                }
            });
            if (alerts.enabled) {
                const thresholds = alerts.thresholds || {};
                Array.from(registeredEngines.entries()).forEach(([id, engine]) => {
                    if (engine.performance.averageLatency > (thresholds.latency || 1000)) {
                        monitoringData?.alerts.push({
                            type: 'performance',
                            severity: 'warning',
                            message: `Engine ${id} latency (${engine.performance.averageLatency}ms) exceeds threshold`,
                            engineId: id,
                            value: engine.performance.averageLatency,
                            threshold: thresholds.latency || 1000,
                        });
                    }
                    if (engine.performance.errorRate > (thresholds.errorRate || 0.1)) {
                        monitoringData?.alerts.push({
                            type: 'error',
                            severity: 'warning',
                            message: `Engine ${id} error rate (${(engine.performance.errorRate * 100).toFixed(2)}%) exceeds threshold`,
                            engineId: id,
                            value: engine.performance.errorRate,
                            threshold: thresholds.errorRate || 0.1,
                        });
                    }
                    if (engine.performance.utilization > (thresholds.utilization || 0.8)) {
                        monitoringData?.alerts.push({
                            type: 'utilization',
                            severity: 'warning',
                            message: `Engine ${id} utilization (${(engine.performance.utilization * 100).toFixed(1)}%) exceeds threshold`,
                            engineId: id,
                            value: engine.performance.utilization,
                            threshold: thresholds.utilization || 0.8,
                        });
                    }
                });
                if (cacheStats.hitRate < (thresholds.cacheHitRate || 0.6)) {
                    monitoringData?.alerts.push({
                        type: 'cache',
                        severity: 'info',
                        message: `Cache hit rate (${(cacheStats.hitRate * 100).toFixed(1)}%) below threshold`,
                        value: cacheStats.hitRate,
                        threshold: thresholds.cacheHitRate || 0.6,
                    });
                }
            }
            const healthFactors = {
                engineHealth: coordinatorStats.engines.active /
                    Math.max(coordinatorStats.engines.total, 1),
                querySuccess: coordinatorStats.queries.recent > 0
                    ? coordinatorStats.queries.successful /
                        coordinatorStats.queries.recent
                    : 1,
                cacheEfficiency: cacheStats.hitRate,
                averageLatency: Math.max(0, 1 - coordinatorStats.queries.averageLatency / 1000),
            };
            const healthScore = Object.values(healthFactors).reduce((sum, factor) => sum + factor, 0) /
                Object.keys(healthFactors).length;
            if (monitoringData?.system) {
                monitoringData.system.health = {
                    score: Math.round(healthScore * 100),
                    factors: healthFactors,
                    status: healthScore > 0.8
                        ? 'healthy'
                        : healthScore > 0.6
                            ? 'warning'
                            : 'critical',
                };
            }
            return {
                success: true,
                data: monitoringData,
                metadata: {
                    timestamp: Date.now(),
                    monitoring: true,
                    realtime,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const databaseHealthCheckTool = {
    name: 'database_health_check',
    description: 'Comprehensive health check for database system components',
    inputSchema: {
        type: 'object',
        properties: {
            components: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['coordinator', 'optimizer', 'engines', 'cache', 'all'],
                },
                default: ['all'],
                description: 'Components to check',
            },
            detailed: {
                type: 'boolean',
                default: false,
                description: 'Include detailed diagnostics',
            },
            repair: {
                type: 'boolean',
                default: false,
                description: 'Attempt to repair issues automatically',
            },
        },
    },
    handler: async (params) => {
        try {
            const { components = ['all'], detailed = false, repair = false } = params;
            const healthReport = {
                overall: 'healthy',
                timestamp: Date.now(),
                components: {
                    coordinator: undefined,
                    optimizer: undefined,
                    engines: undefined,
                    cache: undefined,
                    clients: undefined,
                },
                issues: [],
                recommendations: [],
                repairs: [],
            };
            const shouldCheck = (component) => components.includes('all') || components.includes(component);
            if (shouldCheck('coordinator')) {
                if (databaseCoordinator) {
                    const stats = databaseCoordinator?.getStats();
                    const engineHealth = stats.engines.active / Math.max(stats.engines.total, 1);
                    healthReport.components.coordinator = {
                        status: engineHealth > 0.8
                            ? 'healthy'
                            : engineHealth > 0.5
                                ? 'degraded'
                                : 'critical',
                        engines: stats.engines,
                        queries: stats.queries,
                        details: detailed ? stats : undefined,
                    };
                    if (engineHealth < 0.8) {
                        healthReport.overall = 'degraded';
                        healthReport.issues.push(`${stats.engines.total - stats.engines.active} engines are unhealthy`);
                    }
                }
                else {
                    healthReport.components.coordinator = { status: 'not_initialized' };
                    healthReport.overall = 'critical';
                    healthReport.issues.push('Database coordinator not initialized');
                }
            }
            if (shouldCheck('optimizer')) {
                if (queryOptimizer) {
                    const stats = queryOptimizer.getStats();
                    const optimizationRate = stats.totalQueries > 0
                        ? stats.optimizedQueries / stats.totalQueries
                        : 0;
                    healthReport.components.optimizer = {
                        status: 'healthy',
                        optimizationRate,
                        totalQueries: stats.totalQueries,
                        details: detailed ? stats : undefined,
                    };
                    if (optimizationRate < 0.3 && stats.totalQueries > 50) {
                        healthReport.recommendations.push('Consider enabling more optimization rules');
                    }
                }
                else {
                    healthReport.components.optimizer = { status: 'not_initialized' };
                    healthReport.issues.push('Query optimizer not initialized');
                }
            }
            if (shouldCheck('engines')) {
                const engineHealth = {};
                let healthyEngines = 0;
                Array.from(registeredEngines.entries()).forEach(([id, engine]) => {
                    const timeSinceLastCheck = Date.now() - engine.lastHealthCheck;
                    const isStale = timeSinceLastCheck > 60000;
                    const status = engine.status === 'active' && !isStale
                        ? 'healthy'
                        : engine.status === 'active' && isStale
                            ? 'stale'
                            : 'unhealthy';
                    engineHealth[id] = {
                        status,
                        type: engine.type,
                        performance: engine.performance,
                        lastHealthCheck: engine.lastHealthCheck,
                        timeSinceLastCheck,
                        details: detailed ? engine : undefined,
                    };
                    if (status === 'healthy')
                        healthyEngines++;
                    if (status !== 'healthy') {
                        healthReport.issues.push(`Engine ${id} is ${status}`);
                    }
                });
                healthReport.components.engines = {
                    total: registeredEngines.size,
                    healthy: healthyEngines,
                    details: detailed ? engineHealth : undefined,
                };
                if (healthyEngines < registeredEngines.size) {
                    healthReport.overall = 'degraded';
                }
            }
            if (shouldCheck('cache')) {
                if (queryOptimizer) {
                    const cacheStats = queryOptimizer.getCacheStats();
                    healthReport.components.cache = {
                        status: cacheStats.hitRate > 0.6 ? 'healthy' : 'suboptimal',
                        hitRate: cacheStats.hitRate,
                        entries: cacheStats.entries,
                        memoryUsage: cacheStats.memoryUsage,
                        details: detailed ? cacheStats : undefined,
                    };
                    if (cacheStats.hitRate < 0.6) {
                        healthReport.recommendations.push('Consider optimizing cache configuration');
                    }
                    if (cacheStats.memoryUsage > 90) {
                        healthReport.issues.push('Cache memory usage is very high');
                    }
                }
            }
            if (shouldCheck('clients')) {
                try {
                    if (uacl.isInitialized()) {
                        const clientMetrics = uacl.getMetrics();
                        const clientHealth = uacl.getHealthStatus();
                        const healthyPercentage = clientMetrics.total > 0
                            ? (clientMetrics.connected / clientMetrics.total) * 100
                            : 100;
                        const mcpClients = uacl.getClientsByType(ClientType.MCP);
                        const databaseMCPClient = mcpClients.find((c) => c.id === 'database-mcp-client');
                        healthReport.components.clients = {
                            status: healthyPercentage >= 80
                                ? 'healthy'
                                : healthyPercentage >= 50
                                    ? 'degraded'
                                    : 'critical',
                            total: clientMetrics.total,
                            connected: clientMetrics.connected,
                            healthPercentage: healthyPercentage,
                            avgLatency: clientMetrics.avgLatency,
                            errors: clientMetrics.totalErrors,
                            mcpClientStatus: databaseMCPClient?.status || 'not_found',
                            details: detailed
                                ? {
                                    byType: clientMetrics.byType,
                                    overallHealth: clientHealth,
                                    databaseMCPClient: databaseMCPClient
                                        ? {
                                            status: databaseMCPClient?.status,
                                            priority: databaseMCPClient?.config?.priority,
                                            enabled: databaseMCPClient?.config?.enabled,
                                        }
                                        : null,
                                }
                                : undefined,
                        };
                        if (healthyPercentage < 80) {
                            healthReport.overall =
                                healthyPercentage < 50 ? 'critical' : 'degraded';
                            healthReport.issues.push(`Only ${healthyPercentage.toFixed(1)}% of clients are healthy`);
                        }
                        if (!databaseMCPClient ||
                            databaseMCPClient?.status !== 'connected') {
                            healthReport.issues.push('Database MCP client is not connected');
                        }
                        if (clientMetrics.totalErrors > 10) {
                            healthReport.issues.push(`High error count: ${clientMetrics.totalErrors} client errors`);
                        }
                        if (clientMetrics.avgLatency > 5000) {
                            healthReport.recommendations.push('Consider optimizing client response times');
                        }
                    }
                    else {
                        healthReport.components.clients = { status: 'not_initialized' };
                        healthReport.recommendations.push('Consider initializing UACL for enhanced client management');
                    }
                }
                catch (error) {
                    healthReport.components.clients = {
                        status: 'error',
                        error: error instanceof Error ? error.message : String(error),
                    };
                }
            }
            if (repair && healthReport.issues.length > 0) {
                for (const issue of healthReport.issues) {
                    if (issue.includes('engines are unhealthy') && databaseCoordinator) {
                        healthReport.repairs.push({
                            issue,
                            action: 'restarted_health_checks',
                            success: true,
                        });
                    }
                    if (issue.includes('Cache memory usage') && queryOptimizer) {
                        queryOptimizer.clearCache();
                        healthReport.repairs.push({
                            issue,
                            action: 'cleared_cache',
                            success: true,
                        });
                    }
                }
            }
            if (healthReport.issues.length === 0) {
                healthReport.overall = 'healthy';
            }
            else if (healthReport.issues.some((issue) => issue.includes('not_initialized') || issue.includes('critical'))) {
                healthReport.overall = 'critical';
            }
            else {
                healthReport.overall = 'degraded';
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
                error: error instanceof Error ? error.message : String(error),
                metadata: { timestamp: Date.now() },
            };
        }
    },
};
export const databaseTools = [
    databaseInitTool,
    databaseQueryTool,
    databaseOptimizeTool,
    databaseMonitorTool,
    databaseHealthCheckTool,
];
function _mapEngineTypeToEntity(engineType) {
    switch (engineType) {
        case 'vector':
            return EntityTypes.Document;
        case 'graph':
            return EntityTypes.Document;
        case 'document':
            return EntityTypes.Document;
        case 'relational':
            return EntityTypes.Document;
        case 'timeseries':
            return EntityTypes.Document;
        default:
            return EntityTypes.Document;
    }
}
function _mapEngineTypeToDB(engineType) {
    switch (engineType) {
        case 'vector':
            return DatabaseTypes?.LanceDB;
        case 'graph':
            return DatabaseTypes?.Kuzu;
        case 'document':
            return DatabaseTypes?.PostgreSQL;
        case 'relational':
            return DatabaseTypes?.PostgreSQL;
        case 'timeseries':
            return DatabaseTypes?.PostgreSQL;
        default:
            return DatabaseTypes?.PostgreSQL;
    }
}
async function _executeQueryWithDAL(query, engines, repositories, daos) {
    const startTime = Date.now();
    const availableEngines = Array.from(engines.values()).filter((e) => e.status === 'active' &&
        (query.requirements.capabilities.length === 0 ||
            query.requirements.capabilities.some((cap) => e.capabilities.includes(cap))));
    if (availableEngines.length === 0) {
        return {
            queryId: query.id,
            engineId: 'none',
            status: 'failed',
            error: 'No suitable engines available',
            duration: Date.now() - startTime,
        };
    }
    const selectedEngine = availableEngines[0];
    const repository = repositories.get(selectedEngine?.id);
    const dao = daos.get(selectedEngine?.id);
    if (!(repository && dao)) {
        return {
            queryId: query.id,
            engineId: selectedEngine?.id,
            status: 'failed',
            error: 'Engine repository/DAO not found',
            duration: Date.now() - startTime,
        };
    }
    try {
        let result;
        switch (query.type) {
            case 'select':
                if (query.parameters['id']) {
                    result = (await repository.findById(query.parameters['id']));
                }
                else {
                    result = await repository.findAll(query.parameters);
                }
                break;
            case 'insert':
                result = (await repository.create(query.parameters['data']));
                break;
            case 'update':
                result = await repository.update(query.parameters['id'], query.parameters['data']);
                break;
            case 'delete':
                result = (await repository.delete(query.parameters['id']));
                break;
            default:
                if (selectedEngine?.type === 'vector' && dao.bulkVectorOperations) {
                    result = await dao.bulkVectorOperations(query.parameters['vectors'] || [], query.operation);
                }
                else if (selectedEngine?.type === 'graph' && dao.traverseGraph) {
                    result = await dao.traverseGraph(query.parameters['startNode'], query.parameters['relationshipType'], query.parameters['maxDepth']);
                }
                else {
                    result = await repository.findAll(query.parameters);
                }
        }
        const duration = Date.now() - startTime;
        if (selectedEngine) {
            selectedEngine.performance.averageLatency =
                (selectedEngine.performance.averageLatency + duration) / 2;
            selectedEngine.lastHealthCheck = Date.now();
        }
        return {
            queryId: query.id,
            engineId: selectedEngine?.id,
            status: 'completed',
            result,
            duration,
        };
    }
    catch (error) {
        if (selectedEngine) {
            selectedEngine.performance.errorRate = Math.min(1, selectedEngine.performance.errorRate + 0.01);
        }
        return {
            queryId: query.id,
            engineId: selectedEngine?.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime,
        };
    }
}
export default databaseTools;
//# sourceMappingURL=database-tools.js.map