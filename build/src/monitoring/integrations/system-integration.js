/**
 * System Integration Hub.
 * Connects monitoring system with existing Claude-Zen components.
 */
/**
 * @file System-integration implementation.
 */
import { EventEmitter } from 'node:events';
import { PerformanceAnalyzer, } from '../analytics/performance-analyzer.ts';
import { MetricsCollector } from '../core/metrics-collector.ts';
import { DashboardServer } from '../dashboard/dashboard-server.ts';
import { OptimizationEngine, } from '../optimization/optimization-engine.ts';
export class SystemIntegration extends EventEmitter {
    metricsCollector;
    performanceAnalyzer;
    optimizationEngine;
    dashboardServer;
    config;
    hooks = {};
    isRunning = false;
    // Integration metrics tracking
    factMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        totalQueries: 0,
        queryTimes: [],
        errorCount: 0,
        storageOperations: 0,
    };
    ragMetrics = {
        vectorQueries: 0,
        queryLatencies: [],
        embeddingOperations: 0,
        embeddingLatencies: [],
        retrievalOperations: 0,
        relevanceScores: [],
    };
    swarmMetrics = {
        agentSpawns: 0,
        agentTerminations: 0,
        consensusOperations: 0,
        consensusTimes: [],
        taskAssignments: 0,
        taskCompletions: 0,
        taskFailures: 0,
    };
    mcpMetrics = {
        toolInvocations: new Map(),
        toolSuccesses: new Map(),
        toolLatencies: new Map(),
        toolErrors: new Map(),
        timeoutCount: 0,
    };
    constructor(config) {
        super();
        this.config = config;
        // Initialize components
        this.metricsCollector = new MetricsCollector({
            collectionInterval: config?.metricsInterval,
            maxHistorySize: 3600,
        });
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.optimizationEngine = new OptimizationEngine();
        this.dashboardServer = new DashboardServer({
            port: config?.dashboardPort,
            updateInterval: config?.metricsInterval,
            corsOrigins: ['http://localhost:3000', 'http://localhost:8080'],
        });
        this.setupEventHandlers();
        this.setupSystemHooks();
    }
    /**
     * Setup event handlers between components.
     */
    setupEventHandlers() {
        // Metrics collector events
        this.metricsCollector.on('metrics:collected', (metrics) => {
            this.handleMetricsCollected(metrics);
        });
        this.metricsCollector.on('metrics:error', (error) => {
            this.log('error', 'Metrics collection error:', error);
        });
        // Performance analyzer events
        this.performanceAnalyzer.on('insights:generated', (insights) => {
            this.handleInsightsGenerated(insights);
        });
        this.performanceAnalyzer.on('baselines:updated', () => {
            this.log('info', 'Performance baselines updated');
        });
        // Optimization engine events
        this.optimizationEngine.on('action:started', (action) => {
            this.log('info', `Optimization action started: ${action.id}`);
        });
        this.optimizationEngine.on('action:completed', (result) => {
            this.handleOptimizationCompleted(result);
        });
        this.optimizationEngine.on('action:failed', (result) => {
            this.log('warn', `Optimization failed: ${result?.actionId} - ${result?.error}`);
            this.dashboardServer.updateOptimizations([result]);
        });
        // Dashboard server events
        this.dashboardServer.on('client:connected', (clientId) => {
            this.log('info', `Dashboard client connected: ${clientId}`);
        });
        this.dashboardServer.on('client:disconnected', (clientId) => {
            this.log('info', `Dashboard client disconnected: ${clientId}`);
        });
    }
    /**
     * Setup system integration hooks.
     */
    setupSystemHooks() {
        // FACT system hooks
        this.hooks.onFactCacheHit = (key, latency) => {
            this.factMetrics.cacheHits++;
            this.emit('fact:cache-hit', { key, latency });
        };
        this.hooks.onFactCacheMiss = (key) => {
            this.factMetrics.cacheMisses++;
            this.emit('fact:cache-miss', { key });
        };
        this.hooks.onFactQuery = (query, duration, success) => {
            this.factMetrics.totalQueries++;
            this.factMetrics.queryTimes.push(duration);
            if (!success)
                this.factMetrics.errorCount++;
            // Keep only recent query times
            if (this.factMetrics.queryTimes.length > 100) {
                this.factMetrics.queryTimes.shift();
            }
            this.emit('fact:query', { query: query.substring(0, 100), duration, success });
        };
        this.hooks.onFactStorage = (operation, size, duration) => {
            this.factMetrics.storageOperations++;
            this.emit('fact:storage', { operation, size, duration });
        };
        // RAG system hooks
        this.hooks.onRagVectorQuery = (query, latency, results) => {
            this.ragMetrics.vectorQueries++;
            this.ragMetrics.queryLatencies.push(latency);
            if (this.ragMetrics.queryLatencies.length > 100) {
                this.ragMetrics.queryLatencies.shift();
            }
            this.emit('rag:vector-query', { query, latency, results });
        };
        this.hooks.onRagEmbedding = (text, duration, dimensions) => {
            this.ragMetrics.embeddingOperations++;
            this.ragMetrics.embeddingLatencies.push(duration);
            if (this.ragMetrics.embeddingLatencies.length > 100) {
                this.ragMetrics.embeddingLatencies.shift();
            }
            this.emit('rag:embedding', { text: text.substring(0, 50), duration, dimensions });
        };
        this.hooks.onRagRetrieval = (query, chunks, relevance) => {
            this.ragMetrics.retrievalOperations++;
            this.ragMetrics.relevanceScores.push(relevance);
            if (this.ragMetrics.relevanceScores.length > 100) {
                this.ragMetrics.relevanceScores.shift();
            }
            this.emit('rag:retrieval', { query: query.substring(0, 100), chunks, relevance });
        };
        // Swarm coordination hooks
        this.hooks.onSwarmAgentSpawn = (agentId, type) => {
            this.swarmMetrics.agentSpawns++;
            this.emit('swarm:agent-spawn', { agentId, type });
        };
        this.hooks.onSwarmAgentTerminate = (agentId, reason) => {
            this.swarmMetrics.agentTerminations++;
            this.emit('swarm:agent-terminate', { agentId, reason });
        };
        this.hooks.onSwarmConsensus = (proposal, duration, result) => {
            this.swarmMetrics.consensusOperations++;
            this.swarmMetrics.consensusTimes.push(duration);
            if (this.swarmMetrics.consensusTimes.length > 100) {
                this.swarmMetrics.consensusTimes.shift();
            }
            this.emit('swarm:consensus', { proposal, duration, result });
        };
        this.hooks.onSwarmTaskAssign = (taskId, agentId) => {
            this.swarmMetrics.taskAssignments++;
            this.emit('swarm:task-assign', { taskId, agentId });
        };
        this.hooks.onSwarmTaskComplete = (taskId, duration, success) => {
            if (success) {
                this.swarmMetrics.taskCompletions++;
            }
            else {
                this.swarmMetrics.taskFailures++;
            }
            this.emit('swarm:task-complete', { taskId, duration, success });
        };
        // MCP tool hooks
        this.hooks.onMcpToolInvoke = (toolName, parameters) => {
            const count = this.mcpMetrics.toolInvocations.get(toolName) || 0;
            this.mcpMetrics.toolInvocations.set(toolName, count + 1);
            this.emit('mcp:tool-invoke', { toolName, parameters });
        };
        this.hooks.onMcpToolComplete = (toolName, duration, success, error) => {
            if (success) {
                const count = this.mcpMetrics.toolSuccesses.get(toolName) || 0;
                this.mcpMetrics.toolSuccesses.set(toolName, count + 1);
            }
            else if (error) {
                const errors = this.mcpMetrics.toolErrors.get(toolName) || [];
                errors.push(error);
                this.mcpMetrics.toolErrors.set(toolName, errors.slice(-10)); // Keep last 10 errors
            }
            const latencies = this.mcpMetrics.toolLatencies.get(toolName) || [];
            latencies.push(duration);
            this.mcpMetrics.toolLatencies.set(toolName, latencies.slice(-100)); // Keep last 100
            this.emit('mcp:tool-complete', { toolName, duration, success, error });
        };
        this.hooks.onMcpToolTimeout = (toolName, duration) => {
            this.mcpMetrics.timeoutCount++;
            this.emit('mcp:tool-timeout', { toolName, duration });
        };
    }
    /**
     * Start the monitoring system.
     */
    async start() {
        if (this.isRunning) {
            throw new Error('System integration is already running');
        }
        try {
            // Start all components
            this.metricsCollector.startCollection();
            this.performanceAnalyzer.startAnalysis();
            if (this.config.enableOptimization) {
                this.optimizationEngine.startOptimization();
            }
            await this.dashboardServer.start();
            this.isRunning = true;
            this.log('info', 'System integration started successfully');
            this.emit('system:started');
        }
        catch (error) {
            this.log('error', 'Failed to start system integration:', error);
            throw error;
        }
    }
    /**
     * Stop the monitoring system.
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        try {
            // Stop all components
            this.metricsCollector.stopCollection();
            this.performanceAnalyzer.stopAnalysis();
            this.optimizationEngine.stopOptimization();
            await this.dashboardServer.stop();
            this.isRunning = false;
            this.log('info', 'System integration stopped');
            this.emit('system:stopped');
        }
        catch (error) {
            this.log('error', 'Error stopping system integration:', error);
            throw error;
        }
    }
    /**
     * Handle collected metrics.
     *
     * @param metrics
     */
    handleMetricsCollected(metrics) {
        // Enhance metrics with integration data
        const enhancedMetrics = this.enhanceMetrics(metrics);
        // Update dashboard
        this.dashboardServer.updateMetrics(enhancedMetrics);
        // Generate performance insights
        const insights = this.performanceAnalyzer.analyzeMetrics(enhancedMetrics);
        // Handle the generated insights
        if (insights) {
            this.handleInsightsGenerated(insights);
        }
        this.emit('metrics:enhanced', enhancedMetrics);
    }
    /**
     * Handle generated insights.
     *
     * @param insights
     */
    handleInsightsGenerated(insights) {
        // Update dashboard
        this.dashboardServer.updateInsights(insights);
        // Trigger optimizations if enabled
        if (this.config.enableOptimization) {
            const metrics = this.metricsCollector.getLatestMetrics();
            if (metrics) {
                this.optimizationEngine.optimizeFromInsights(insights, metrics);
            }
        }
        // Generate alerts for critical issues
        if (this.config.enableAlerts) {
            this.generateAlerts(insights);
        }
        this.emit('insights:processed', insights);
    }
    /**
     * Handle completed optimizations.
     *
     * @param result
     */
    handleOptimizationCompleted(result) {
        this.log('info', `Optimization completed: ${result?.actionId} (${result?.success ? 'success' : 'failed'})`);
        if (result?.success) {
            const impact = result?.impact?.performance * 100;
            this.log('info', `Performance improvement: ${impact.toFixed(1)}%`);
        }
        this.dashboardServer.updateOptimizations([result]);
        this.emit('optimization:processed', result);
    }
    /**
     * Enhance metrics with integration data.
     *
     * @param metrics
     */
    enhanceMetrics(metrics) {
        // Enhance FACT metrics
        if (this.factMetrics.queryTimes.length > 0) {
            const avgQueryTime = this.factMetrics.queryTimes.reduce((a, b) => a + b, 0) / this.factMetrics.queryTimes.length;
            const hitRate = this.factMetrics.cacheHits / (this.factMetrics.cacheHits + this.factMetrics.cacheMisses);
            const errorRate = this.factMetrics.errorCount / this.factMetrics.totalQueries;
            metrics.fact = {
                ...metrics.fact,
                cache: {
                    ...metrics.fact.cache,
                    hitRate: Number.isNaN(hitRate) ? metrics.fact.cache.hitRate : hitRate,
                    totalRequests: this.factMetrics.cacheHits + this.factMetrics.cacheMisses,
                },
                queries: {
                    ...metrics.fact.queries,
                    averageQueryTime: avgQueryTime,
                    totalQueries: this.factMetrics.totalQueries,
                    errorRate: Number.isNaN(errorRate) ? metrics.fact.queries.errorRate : errorRate,
                },
            };
        }
        // Enhance RAG metrics
        if (this.ragMetrics.queryLatencies.length > 0) {
            const avgQueryLatency = this.ragMetrics.queryLatencies.reduce((a, b) => a + b, 0) /
                this.ragMetrics.queryLatencies.length;
            const avgEmbeddingLatency = this.ragMetrics.embeddingLatencies.length > 0
                ? this.ragMetrics.embeddingLatencies.reduce((a, b) => a + b, 0) /
                    this.ragMetrics.embeddingLatencies.length
                : metrics.rag.embedding.embeddingLatency;
            const avgRelevance = this.ragMetrics.relevanceScores.length > 0
                ? this.ragMetrics.relevanceScores.reduce((a, b) => a + b, 0) /
                    this.ragMetrics.relevanceScores.length
                : metrics.rag.retrieval.contextRelevance;
            metrics.rag = {
                ...metrics.rag,
                vectors: {
                    ...metrics.rag.vectors,
                    queryLatency: avgQueryLatency,
                },
                embedding: {
                    ...metrics.rag.embedding,
                    embeddingLatency: avgEmbeddingLatency,
                },
                retrieval: {
                    ...metrics.rag.retrieval,
                    contextRelevance: avgRelevance,
                },
            };
        }
        // Enhance Swarm metrics
        if (this.swarmMetrics.consensusTimes.length > 0) {
            const avgConsensusTime = this.swarmMetrics.consensusTimes.reduce((a, b) => a + b, 0) /
                this.swarmMetrics.consensusTimes.length;
            const totalTasks = this.swarmMetrics.taskCompletions + this.swarmMetrics.taskFailures;
            const avgTaskTime = totalTasks > 0 ? 5000 : metrics.swarm.tasks.averageTaskTime; // Simplified
            metrics.swarm = {
                ...metrics.swarm,
                coordination: {
                    ...metrics.swarm.coordination,
                    consensusTime: avgConsensusTime,
                },
                tasks: {
                    ...metrics.swarm.tasks,
                    totalTasks: totalTasks,
                    completedTasks: this.swarmMetrics.taskCompletions,
                    failedTasks: this.swarmMetrics.taskFailures,
                    averageTaskTime: avgTaskTime,
                },
            };
        }
        // Enhance MCP metrics
        const mcpTools = {};
        for (const [toolName, invocations] of this.mcpMetrics.toolInvocations) {
            const successes = this.mcpMetrics.toolSuccesses.get(toolName) || 0;
            const latencies = this.mcpMetrics.toolLatencies.get(toolName) || [];
            const errors = this.mcpMetrics.toolErrors.get(toolName) || [];
            const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
            const successRate = invocations > 0 ? successes / invocations : 0;
            const errorTypes = {};
            errors.forEach((error) => {
                const errorType = error.split(':')[0] || 'unknown';
                errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
            });
            mcpTools[toolName] = {
                invocations,
                successRate,
                averageLatency: avgLatency,
                errorTypes,
            };
        }
        const totalInvocations = Array.from(this.mcpMetrics.toolInvocations.values()).reduce((a, b) => a + b, 0);
        const totalSuccesses = Array.from(this.mcpMetrics.toolSuccesses.values()).reduce((a, b) => a + b, 0);
        const overallSuccessRate = totalInvocations > 0 ? totalSuccesses / totalInvocations : 0;
        const allLatencies = Array.from(this.mcpMetrics.toolLatencies.values()).flat();
        const avgResponseTime = allLatencies.length > 0 ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length : 0;
        metrics.mcp = {
            ...metrics.mcp,
            tools: mcpTools,
            performance: {
                totalInvocations,
                overallSuccessRate,
                averageResponseTime: avgResponseTime,
                timeoutRate: this.mcpMetrics.timeoutCount / Math.max(totalInvocations, 1),
            },
        };
        return metrics;
    }
    /**
     * Generate alerts based on insights.
     *
     * @param insights
     */
    generateAlerts(insights) {
        // Critical anomalies
        const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
        for (const anomaly of criticalAnomalies) {
            this.dashboardServer.addAlert('error', `Critical anomaly: ${anomaly.description}`);
        }
        // Resource exhaustion predictions
        if (insights.predictions.resourceExhaustion.length > 0) {
            const resources = insights.predictions.resourceExhaustion.join(', ');
            this.dashboardServer.addAlert('warning', `Resource exhaustion predicted: ${resources}`);
        }
        // Low health score
        if (insights.healthScore < 50) {
            this.dashboardServer.addAlert('error', `System health critical: ${insights.healthScore.toFixed(1)}%`);
        }
        else if (insights.healthScore < 70) {
            this.dashboardServer.addAlert('warning', `System health low: ${insights.healthScore.toFixed(1)}%`);
        }
        // Bottlenecks with high impact
        const highImpactBottlenecks = insights.bottlenecks.filter((b) => b.impact > 0.7);
        for (const bottleneck of highImpactBottlenecks) {
            this.dashboardServer.addAlert('warning', `Performance bottleneck: ${bottleneck.component} ${bottleneck.metric}`);
        }
    }
    /**
     * Get system hooks for external integration.
     */
    getSystemHooks() {
        return { ...this.hooks };
    }
    /**
     * Get current system status.
     */
    getSystemStatus() {
        const dashboardStatus = this.dashboardServer.getStatus();
        return {
            isRunning: this.isRunning,
            components: {
                metricsCollector: this.metricsCollector.getLatestMetrics() !== null,
                performanceAnalyzer: true, // Simplified status check
                optimizationEngine: true,
                dashboardServer: dashboardStatus.isRunning,
            },
            statistics: {
                totalMetricsCollected: this.metricsCollector.getHistory().length,
                totalInsightsGenerated: 0, // Would track this in real implementation
                totalOptimizationsRun: this.optimizationEngine.getOptimizationStats().totalActions,
                dashboardClients: dashboardStatus.connectedClients,
            },
        };
    }
    /**
     * Reset integration metrics.
     */
    resetMetrics() {
        this.factMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            totalQueries: 0,
            queryTimes: [],
            errorCount: 0,
            storageOperations: 0,
        };
        this.ragMetrics = {
            vectorQueries: 0,
            queryLatencies: [],
            embeddingOperations: 0,
            embeddingLatencies: [],
            retrievalOperations: 0,
            relevanceScores: [],
        };
        this.swarmMetrics = {
            agentSpawns: 0,
            agentTerminations: 0,
            consensusOperations: 0,
            consensusTimes: [],
            taskAssignments: 0,
            taskCompletions: 0,
            taskFailures: 0,
        };
        this.mcpMetrics = {
            toolInvocations: new Map(),
            toolSuccesses: new Map(),
            toolLatencies: new Map(),
            toolErrors: new Map(),
            timeoutCount: 0,
        };
        this.emit('metrics:reset');
    }
    /**
     * Logging utility.
     *
     * @param level
     * @param _message
     * @param {...any} _args
     */
    log(level, _message, ..._args) {
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        const configLevels = { error: 0, warn: 1, info: 2, debug: 3 };
        if (levels[level] <= configLevels?.[this.config.logLevel]) {
        }
    }
}
