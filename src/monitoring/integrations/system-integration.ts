/**
 * System Integration Hub
 * Connects monitoring system with existing Claude-Zen components
 */

import { EventEmitter } from 'events';
import { PerformanceAnalyzer, type PerformanceInsights } from '../analytics/performance-analyzer';
import { type CompositeMetrics, MetricsCollector } from '../core/metrics-collector';
import { DashboardServer } from '../dashboard/dashboard-server';
import { OptimizationEngine, type OptimizationResult } from '../optimization/optimization-engine';

export interface IntegrationConfig {
  metricsInterval: number;
  dashboardPort: number;
  enableOptimization: boolean;
  enableAlerts: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface SystemHooks {
  // FACT system hooks
  onFactCacheHit?: (key: string, latency: number) => void;
  onFactCacheMiss?: (key: string) => void;
  onFactQuery?: (query: string, duration: number, success: boolean) => void;
  onFactStorage?: (operation: 'store' | 'retrieve', size: number, duration: number) => void;

  // RAG system hooks
  onRagVectorQuery?: (query: any, latency: number, results: number) => void;
  onRagEmbedding?: (text: string, duration: number, dimensions: number) => void;
  onRagRetrieval?: (query: string, chunks: number, relevance: number) => void;

  // Swarm coordination hooks
  onSwarmAgentSpawn?: (agentId: string, type: string) => void;
  onSwarmAgentTerminate?: (agentId: string, reason: string) => void;
  onSwarmConsensus?: (proposal: any, duration: number, result: boolean) => void;
  onSwarmTaskAssign?: (taskId: string, agentId: string) => void;
  onSwarmTaskComplete?: (taskId: string, duration: number, success: boolean) => void;

  // MCP tool hooks
  onMcpToolInvoke?: (toolName: string, parameters: any) => void;
  onMcpToolComplete?: (
    toolName: string,
    duration: number,
    success: boolean,
    error?: string
  ) => void;
  onMcpToolTimeout?: (toolName: string, duration: number) => void;
}

export class SystemIntegration extends EventEmitter {
  private metricsCollector: MetricsCollector;
  private performanceAnalyzer: PerformanceAnalyzer;
  private optimizationEngine: OptimizationEngine;
  private dashboardServer: DashboardServer;
  private config: IntegrationConfig;
  private hooks: SystemHooks = {};
  private isRunning = false;

  // Integration metrics tracking
  private factMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalQueries: 0,
    queryTimes: [] as number[],
    errorCount: 0,
    storageOperations: 0,
  };

  private ragMetrics = {
    vectorQueries: 0,
    queryLatencies: [] as number[],
    embeddingOperations: 0,
    embeddingLatencies: [] as number[],
    retrievalOperations: 0,
    relevanceScores: [] as number[],
  };

  private swarmMetrics = {
    agentSpawns: 0,
    agentTerminations: 0,
    consensusOperations: 0,
    consensusTimes: [] as number[],
    taskAssignments: 0,
    taskCompletions: 0,
    taskFailures: 0,
  };

  private mcpMetrics = {
    toolInvocations: new Map<string, number>(),
    toolSuccesses: new Map<string, number>(),
    toolLatencies: new Map<string, number[]>(),
    toolErrors: new Map<string, string[]>(),
    timeoutCount: 0,
  };

  constructor(config: IntegrationConfig) {
    super();
    this.config = config;

    // Initialize components
    this.metricsCollector = new MetricsCollector({
      collectionInterval: config.metricsInterval,
      maxHistorySize: 3600,
    });

    this.performanceAnalyzer = new PerformanceAnalyzer();

    this.optimizationEngine = new OptimizationEngine();

    this.dashboardServer = new DashboardServer({
      port: config.dashboardPort,
      updateInterval: config.metricsInterval,
      corsOrigins: ['http://localhost:3000', 'http://localhost:8080'],
    });

    this.setupEventHandlers();
    this.setupSystemHooks();
  }

  /**
   * Setup event handlers between components
   */
  private setupEventHandlers(): void {
    // Metrics collector events
    this.metricsCollector.on('metrics:collected', (metrics: CompositeMetrics) => {
      this.handleMetricsCollected(metrics);
    });

    this.metricsCollector.on('metrics:error', (error: Error) => {
      this.log('error', 'Metrics collection error:', error);
    });

    // Performance analyzer events
    this.performanceAnalyzer.on('insights:generated', (insights: PerformanceInsights) => {
      this.handleInsightsGenerated(insights);
    });

    this.performanceAnalyzer.on('baselines:updated', () => {
      this.log('info', 'Performance baselines updated');
    });

    // Optimization engine events
    this.optimizationEngine.on('action:started', (action: any) => {
      this.log('info', `Optimization action started: ${action.id}`);
    });

    this.optimizationEngine.on('action:completed', (result: OptimizationResult) => {
      this.handleOptimizationCompleted(result);
    });

    this.optimizationEngine.on('action:failed', (result: OptimizationResult) => {
      this.log('warn', `Optimization failed: ${result.actionId} - ${result.error}`);
      this.dashboardServer.updateOptimizations([result]);
    });

    // Dashboard server events
    this.dashboardServer.on('client:connected', (clientId: string) => {
      this.log('info', `Dashboard client connected: ${clientId}`);
    });

    this.dashboardServer.on('client:disconnected', (clientId: string) => {
      this.log('info', `Dashboard client disconnected: ${clientId}`);
    });
  }

  /**
   * Setup system integration hooks
   */
  private setupSystemHooks(): void {
    // FACT system hooks
    this.hooks.onFactCacheHit = (key: string, latency: number) => {
      this.factMetrics.cacheHits++;
      this.emit('fact:cache-hit', { key, latency });
    };

    this.hooks.onFactCacheMiss = (key: string) => {
      this.factMetrics.cacheMisses++;
      this.emit('fact:cache-miss', { key });
    };

    this.hooks.onFactQuery = (query: string, duration: number, success: boolean) => {
      this.factMetrics.totalQueries++;
      this.factMetrics.queryTimes.push(duration);
      if (!success) this.factMetrics.errorCount++;

      // Keep only recent query times
      if (this.factMetrics.queryTimes.length > 100) {
        this.factMetrics.queryTimes.shift();
      }

      this.emit('fact:query', { query: query.substring(0, 100), duration, success });
    };

    this.hooks.onFactStorage = (
      operation: 'store' | 'retrieve',
      size: number,
      duration: number
    ) => {
      this.factMetrics.storageOperations++;
      this.emit('fact:storage', { operation, size, duration });
    };

    // RAG system hooks
    this.hooks.onRagVectorQuery = (query: any, latency: number, results: number) => {
      this.ragMetrics.vectorQueries++;
      this.ragMetrics.queryLatencies.push(latency);

      if (this.ragMetrics.queryLatencies.length > 100) {
        this.ragMetrics.queryLatencies.shift();
      }

      this.emit('rag:vector-query', { query, latency, results });
    };

    this.hooks.onRagEmbedding = (text: string, duration: number, dimensions: number) => {
      this.ragMetrics.embeddingOperations++;
      this.ragMetrics.embeddingLatencies.push(duration);

      if (this.ragMetrics.embeddingLatencies.length > 100) {
        this.ragMetrics.embeddingLatencies.shift();
      }

      this.emit('rag:embedding', { text: text.substring(0, 50), duration, dimensions });
    };

    this.hooks.onRagRetrieval = (query: string, chunks: number, relevance: number) => {
      this.ragMetrics.retrievalOperations++;
      this.ragMetrics.relevanceScores.push(relevance);

      if (this.ragMetrics.relevanceScores.length > 100) {
        this.ragMetrics.relevanceScores.shift();
      }

      this.emit('rag:retrieval', { query: query.substring(0, 100), chunks, relevance });
    };

    // Swarm coordination hooks
    this.hooks.onSwarmAgentSpawn = (agentId: string, type: string) => {
      this.swarmMetrics.agentSpawns++;
      this.emit('swarm:agent-spawn', { agentId, type });
    };

    this.hooks.onSwarmAgentTerminate = (agentId: string, reason: string) => {
      this.swarmMetrics.agentTerminations++;
      this.emit('swarm:agent-terminate', { agentId, reason });
    };

    this.hooks.onSwarmConsensus = (proposal: any, duration: number, result: boolean) => {
      this.swarmMetrics.consensusOperations++;
      this.swarmMetrics.consensusTimes.push(duration);

      if (this.swarmMetrics.consensusTimes.length > 100) {
        this.swarmMetrics.consensusTimes.shift();
      }

      this.emit('swarm:consensus', { proposal, duration, result });
    };

    this.hooks.onSwarmTaskAssign = (taskId: string, agentId: string) => {
      this.swarmMetrics.taskAssignments++;
      this.emit('swarm:task-assign', { taskId, agentId });
    };

    this.hooks.onSwarmTaskComplete = (taskId: string, duration: number, success: boolean) => {
      if (success) {
        this.swarmMetrics.taskCompletions++;
      } else {
        this.swarmMetrics.taskFailures++;
      }
      this.emit('swarm:task-complete', { taskId, duration, success });
    };

    // MCP tool hooks
    this.hooks.onMcpToolInvoke = (toolName: string, parameters: any) => {
      const count = this.mcpMetrics.toolInvocations.get(toolName) || 0;
      this.mcpMetrics.toolInvocations.set(toolName, count + 1);
      this.emit('mcp:tool-invoke', { toolName, parameters });
    };

    this.hooks.onMcpToolComplete = (
      toolName: string,
      duration: number,
      success: boolean,
      error?: string
    ) => {
      if (success) {
        const count = this.mcpMetrics.toolSuccesses.get(toolName) || 0;
        this.mcpMetrics.toolSuccesses.set(toolName, count + 1);
      } else if (error) {
        const errors = this.mcpMetrics.toolErrors.get(toolName) || [];
        errors.push(error);
        this.mcpMetrics.toolErrors.set(toolName, errors.slice(-10)); // Keep last 10 errors
      }

      const latencies = this.mcpMetrics.toolLatencies.get(toolName) || [];
      latencies.push(duration);
      this.mcpMetrics.toolLatencies.set(toolName, latencies.slice(-100)); // Keep last 100

      this.emit('mcp:tool-complete', { toolName, duration, success, error });
    };

    this.hooks.onMcpToolTimeout = (toolName: string, duration: number) => {
      this.mcpMetrics.timeoutCount++;
      this.emit('mcp:tool-timeout', { toolName, duration });
    };
  }

  /**
   * Start the monitoring system
   */
  public async start(): Promise<void> {
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
    } catch (error) {
      this.log('error', 'Failed to start system integration:', error);
      throw error;
    }
  }

  /**
   * Stop the monitoring system
   */
  public async stop(): Promise<void> {
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
    } catch (error) {
      this.log('error', 'Error stopping system integration:', error);
      throw error;
    }
  }

  /**
   * Handle collected metrics
   */
  private handleMetricsCollected(metrics: CompositeMetrics): void {
    // Enhance metrics with integration data
    const enhancedMetrics = this.enhanceMetrics(metrics);

    // Update dashboard
    this.dashboardServer.updateMetrics(enhancedMetrics);

    // Generate performance insights
    const insights = this.performanceAnalyzer.analyzeMetrics(enhancedMetrics);
    this.emit('metrics:enhanced', enhancedMetrics);
  }

  /**
   * Handle generated insights
   */
  private handleInsightsGenerated(insights: PerformanceInsights): void {
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
   * Handle completed optimizations
   */
  private handleOptimizationCompleted(result: OptimizationResult): void {
    this.log(
      'info',
      `Optimization completed: ${result.actionId} (${result.success ? 'success' : 'failed'})`
    );

    if (result.success) {
      const impact = result.impact.performance * 100;
      this.log('info', `Performance improvement: ${impact.toFixed(1)}%`);
    }

    this.dashboardServer.updateOptimizations([result]);
    this.emit('optimization:processed', result);
  }

  /**
   * Enhance metrics with integration data
   */
  private enhanceMetrics(metrics: CompositeMetrics): CompositeMetrics {
    // Enhance FACT metrics
    if (this.factMetrics.queryTimes.length > 0) {
      const avgQueryTime =
        this.factMetrics.queryTimes.reduce((a, b) => a + b, 0) / this.factMetrics.queryTimes.length;
      const hitRate =
        this.factMetrics.cacheHits / (this.factMetrics.cacheHits + this.factMetrics.cacheMisses);
      const errorRate = this.factMetrics.errorCount / this.factMetrics.totalQueries;

      metrics.fact = {
        ...metrics.fact,
        cache: {
          ...metrics.fact.cache,
          hitRate: isNaN(hitRate) ? metrics.fact.cache.hitRate : hitRate,
          totalRequests: this.factMetrics.cacheHits + this.factMetrics.cacheMisses,
        },
        queries: {
          ...metrics.fact.queries,
          averageQueryTime: avgQueryTime,
          totalQueries: this.factMetrics.totalQueries,
          errorRate: isNaN(errorRate) ? metrics.fact.queries.errorRate : errorRate,
        },
      };
    }

    // Enhance RAG metrics
    if (this.ragMetrics.queryLatencies.length > 0) {
      const avgQueryLatency =
        this.ragMetrics.queryLatencies.reduce((a, b) => a + b, 0) /
        this.ragMetrics.queryLatencies.length;
      const avgEmbeddingLatency =
        this.ragMetrics.embeddingLatencies.length > 0
          ? this.ragMetrics.embeddingLatencies.reduce((a, b) => a + b, 0) /
            this.ragMetrics.embeddingLatencies.length
          : metrics.rag.embedding.embeddingLatency;
      const avgRelevance =
        this.ragMetrics.relevanceScores.length > 0
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
      const avgConsensusTime =
        this.swarmMetrics.consensusTimes.reduce((a, b) => a + b, 0) /
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
    const mcpTools: any = {};
    for (const [toolName, invocations] of this.mcpMetrics.toolInvocations) {
      const successes = this.mcpMetrics.toolSuccesses.get(toolName) || 0;
      const latencies = this.mcpMetrics.toolLatencies.get(toolName) || [];
      const errors = this.mcpMetrics.toolErrors.get(toolName) || [];
      const avgLatency =
        latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      const successRate = invocations > 0 ? successes / invocations : 0;

      const errorTypes: any = {};
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

    const totalInvocations = Array.from(this.mcpMetrics.toolInvocations.values()).reduce(
      (a, b) => a + b,
      0
    );
    const totalSuccesses = Array.from(this.mcpMetrics.toolSuccesses.values()).reduce(
      (a, b) => a + b,
      0
    );
    const overallSuccessRate = totalInvocations > 0 ? totalSuccesses / totalInvocations : 0;
    const allLatencies = Array.from(this.mcpMetrics.toolLatencies.values()).flat();
    const avgResponseTime =
      allLatencies.length > 0 ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length : 0;

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
   * Generate alerts based on insights
   */
  private generateAlerts(insights: PerformanceInsights): void {
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
      this.dashboardServer.addAlert(
        'error',
        `System health critical: ${insights.healthScore.toFixed(1)}%`
      );
    } else if (insights.healthScore < 70) {
      this.dashboardServer.addAlert(
        'warning',
        `System health low: ${insights.healthScore.toFixed(1)}%`
      );
    }

    // Bottlenecks with high impact
    const highImpactBottlenecks = insights.bottlenecks.filter((b) => b.impact > 0.7);
    for (const bottleneck of highImpactBottlenecks) {
      this.dashboardServer.addAlert(
        'warning',
        `Performance bottleneck: ${bottleneck.component} ${bottleneck.metric}`
      );
    }
  }

  /**
   * Get system hooks for external integration
   */
  public getSystemHooks(): SystemHooks {
    return { ...this.hooks };
  }

  /**
   * Get current system status
   */
  public getSystemStatus(): {
    isRunning: boolean;
    components: {
      metricsCollector: boolean;
      performanceAnalyzer: boolean;
      optimizationEngine: boolean;
      dashboardServer: boolean;
    };
    statistics: {
      totalMetricsCollected: number;
      totalInsightsGenerated: number;
      totalOptimizationsRun: number;
      dashboardClients: number;
    };
  } {
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
   * Reset integration metrics
   */
  public resetMetrics(): void {
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
   * Logging utility
   */
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]): void {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const configLevels = { error: 0, warn: 1, info: 2, debug: 3 };

    if (levels[level] <= configLevels[this.config.logLevel]) {
      console[level](`[SystemIntegration] ${message}`, ...args);
    }
  }
}
