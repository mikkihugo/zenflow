/**
 * @fileoverview Advanced Database Coordination System
 * Provides multi-engine database coordination with intelligent routing and optimization
 */

import { EventEmitter } from 'node:events';

export interface DatabaseEngine {
  id: string;
  type: 'vector' | 'graph' | 'document' | 'relational' | 'timeseries';
  interface: any; // Database interface
  capabilities: string[];
  status: 'active' | 'degraded' | 'maintenance' | 'failed';
  lastHealthCheck: number;
  performance: {
    averageLatency: number;
    throughput: number;
    errorRate: number;
    capacity: number;
    utilization: number;
  };
  config: Record<string, any>;
}

export interface DatabaseQuery {
  id: string;
  type: 'read' | 'write' | 'aggregate' | 'search' | 'update' | 'delete';
  operation: string;
  parameters: Record<string, any>;
  requirements: {
    consistency: 'eventual' | 'strong' | 'weak';
    timeout: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    capabilities?: string[];
  };
  routing: {
    preferredEngines?: string[];
    excludeEngines?: string[];
    loadBalancing: 'round_robin' | 'least_loaded' | 'capability_based' | 'performance_based';
  };
  timestamp: number;
  sessionId?: string;
}

export interface QueryExecution {
  queryId: string;
  engineId: string;
  status: 'queued' | 'executing' | 'completed' | 'failed' | 'timeout';
  startTime: number;
  endTime?: number;
  duration?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface CoordinationStrategy {
  name: string;
  description: string;
  applicable: (query: DatabaseQuery, engines: Map<string, DatabaseEngine>) => boolean;
  route: (query: DatabaseQuery, engines: Map<string, DatabaseEngine>) => string[];
  optimize: (execution: QueryExecution, engines: Map<string, DatabaseEngine>) => Promise<void>;
}

/**
 * Advanced Database Coordinator
 * Manages multi-engine database operations with intelligent routing and optimization
 */
export class DatabaseCoordinator extends EventEmitter {
  private engines = new Map<string, DatabaseEngine>();
  private strategies = new Map<string, CoordinationStrategy>();
  private activeQueries = new Map<string, QueryExecution>();
  private queryHistory: QueryExecution[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.registerDefaultStrategies();
    this.startHealthMonitoring();
  }

  /**
   * Register a database engine
   */
  async registerEngine(engine: DatabaseEngine): Promise<void> {
    // Initialize performance metrics if not provided
    if (!engine.performance) {
      engine.performance = {
        averageLatency: 0,
        throughput: 0,
        errorRate: 0,
        capacity: 1000,
        utilization: 0,
      };
    }

    this.engines.set(engine.id, engine);
    this.emit('engineRegistered', { engineId: engine.id, engine });

    // Perform initial health check
    await this.checkEngineHealth(engine.id);
  }

  /**
   * Unregister a database engine
   */
  async unregisterEngine(engineId: string): Promise<void> {
    const engine = this.engines.get(engineId);
    if (!engine) return;

    // Cancel any active queries on this engine
    for (const [queryId, execution] of this.activeQueries) {
      if (execution.engineId === engineId && execution.status === 'executing') {
        execution.status = 'failed';
        execution.error = 'Engine unregistered during execution';
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
        this.emit('queryFailed', execution);
      }
    }

    this.engines.delete(engineId);
    this.emit('engineUnregistered', { engineId });
  }

  /**
   * Execute a database query with intelligent routing
   */
  async executeQuery(query: DatabaseQuery): Promise<QueryExecution> {
    this.emit('queryReceived', query);

    const execution: QueryExecution = {
      queryId: query.id,
      engineId: '',
      status: 'queued',
      startTime: Date.now(),
    };

    try {
      // Find optimal engine for the query
      const optimalEngine = await this.routeQuery(query);
      if (!optimalEngine) {
        throw new Error('No suitable engine found for query');
      }

      execution.engineId = optimalEngine;
      execution.status = 'executing';
      this.activeQueries.set(query.id, execution);
      this.emit('queryStarted', execution);

      // Execute the query on the selected engine
      const result = await this.executeOnEngine(query, optimalEngine);

      execution.status = 'completed';
      execution.result = result;
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;

      this.emit('queryCompleted', execution);

      // Update engine performance metrics
      await this.updateEngineMetrics(optimalEngine, execution);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = Date.now();
      execution.duration = execution.endTime ? execution.endTime - execution.startTime : 0;

      this.emit('queryFailed', execution);
    } finally {
      this.activeQueries.delete(query.id);
      this.queryHistory.push(execution);

      // Limit history size
      if (this.queryHistory.length > 10000) {
        this.queryHistory = this.queryHistory.slice(-8000);
      }
    }

    return execution;
  }

  /**
   * Route query to optimal engine
   */
  private async routeQuery(query: DatabaseQuery): Promise<string | null> {
    const availableEngines = Array.from(this.engines.entries())
      .filter(([, engine]) => engine.status === 'active')
      .filter(([, engine]) => this.engineSupportsQuery(engine, query));

    if (availableEngines.length === 0) {
      return null;
    }

    // Apply routing strategies
    for (const strategy of this.strategies.values()) {
      if (strategy.applicable(query, this.engines)) {
        const routedEngines = strategy.route(query, this.engines);
        const validEngine = routedEngines.find((engineId) =>
          availableEngines.some(([id]) => id === engineId)
        );
        if (validEngine) {
          return validEngine;
        }
      }
    }

    // Fallback to load balancing
    return this.selectByLoadBalancing(query, availableEngines);
  }

  /**
   * Check if engine supports the query
   */
  private engineSupportsQuery(engine: DatabaseEngine, query: DatabaseQuery): boolean {
    // Check excluded engines
    if (query.routing.excludeEngines?.includes(engine.id)) {
      return false;
    }

    // Check preferred engines
    if (query.routing.preferredEngines?.length > 0) {
      return query.routing.preferredEngines.includes(engine.id);
    }

    // Check capability requirements
    if (query.requirements.capabilities?.length > 0) {
      return query.requirements.capabilities.every((cap) => engine.capabilities.includes(cap));
    }

    return true;
  }

  /**
   * Select engine by load balancing strategy
   */
  private selectByLoadBalancing(
    query: DatabaseQuery,
    engines: Array<[string, DatabaseEngine]>
  ): string {
    switch (query.routing.loadBalancing) {
      case 'round_robin':
        return this.selectRoundRobin(engines);

      case 'least_loaded':
        return this.selectLeastLoaded(engines);

      case 'performance_based':
        return this.selectByPerformance(engines);

      case 'capability_based':
      default:
        return this.selectByCapability(query, engines);
    }
  }

  /**
   * Round robin engine selection
   */
  private selectRoundRobin(engines: Array<[string, DatabaseEngine]>): string {
    // Simple round robin based on query count
    const engineCounts = engines.map(([id]) => {
      const recentQueries = this.queryHistory.filter(
        (q) => q.engineId === id && Date.now() - q.startTime < 60000
      ).length;
      return { id, count: recentQueries };
    });

    engineCounts.sort((a, b) => a.count - b.count);
    return engineCounts[0].id;
  }

  /**
   * Select least loaded engine
   */
  private selectLeastLoaded(engines: Array<[string, DatabaseEngine]>): string {
    return engines.sort(
      ([, a], [, b]) => a.performance.utilization - b.performance.utilization
    )[0][0];
  }

  /**
   * Select by performance metrics
   */
  private selectByPerformance(engines: Array<[string, DatabaseEngine]>): string {
    // Score based on latency and throughput
    const scored = engines.map(([id, engine]) => {
      const latencyScore = Math.max(0, 100 - engine.performance.averageLatency);
      const throughputScore = Math.min(100, engine.performance.throughput);
      const errorScore = Math.max(0, 100 - engine.performance.errorRate * 100);
      const totalScore = (latencyScore + throughputScore + errorScore) / 3;
      return { id, score: totalScore };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].id;
  }

  /**
   * Select by capability match
   */
  private selectByCapability(
    query: DatabaseQuery,
    engines: Array<[string, DatabaseEngine]>
  ): string {
    // Score based on capability match
    const scored = engines.map(([id, engine]) => {
      let score = 0;

      // Type-specific scoring
      if (query.operation.includes('vector') && engine.type === 'vector') score += 50;
      if (query.operation.includes('graph') && engine.type === 'graph') score += 50;
      if (query.operation.includes('search') && engine.capabilities.includes('search')) score += 30;
      if (query.operation.includes('aggregate') && engine.capabilities.includes('analytics'))
        score += 30;

      return { id, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].id;
  }

  /**
   * Execute query on specific engine
   */
  private async executeOnEngine(query: DatabaseQuery, engineId: string): Promise<any> {
    const engine = this.engines.get(engineId);
    if (!engine) {
      throw new Error(`Engine not found: ${engineId}`);
    }

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), query.requirements.timeout)
    );

    // Execute based on engine type and operation
    const queryPromise = this.dispatchToEngine(engine, query);

    return Promise.race([queryPromise, timeout]);
  }

  /**
   * Dispatch query to appropriate engine method
   */
  private async dispatchToEngine(engine: DatabaseEngine, query: DatabaseQuery): Promise<any> {
    const { interface: engineInterface } = engine;
    const { operation, parameters } = query;

    // Vector database operations
    if (engine.type === 'vector') {
      switch (operation) {
        case 'vector_search':
          return await engineInterface.search?.(parameters.vector, parameters.options);
        case 'vector_insert':
          return await engineInterface.add?.(parameters.documents);
        case 'vector_update':
          return await engineInterface.update?.(parameters.id, parameters.data);
        case 'vector_delete':
          return await engineInterface.delete?.(parameters.filter);
        default:
          throw new Error(`Unsupported vector operation: ${operation}`);
      }
    }

    // Graph database operations
    if (engine.type === 'graph') {
      switch (operation) {
        case 'graph_query':
          return await engineInterface.query?.(parameters.cypher);
        case 'graph_traverse':
          return await engineInterface.traverse?.(parameters.startNode, parameters.direction);
        case 'graph_create_node':
          return await engineInterface.createNode?.(parameters.labels, parameters.properties);
        case 'graph_create_edge':
          return await engineInterface.createEdge?.(
            parameters.from,
            parameters.to,
            parameters.type
          );
        default:
          throw new Error(`Unsupported graph operation: ${operation}`);
      }
    }

    // Document database operations
    if (engine.type === 'document') {
      switch (operation) {
        case 'document_find':
          return await engineInterface.find?.(parameters.collection, parameters.filter);
        case 'document_insert':
          return await engineInterface.insert?.(parameters.collection, parameters.document);
        case 'document_update':
          return await engineInterface.update?.(
            parameters.collection,
            parameters.filter,
            parameters.update
          );
        case 'document_delete':
          return await engineInterface.delete?.(parameters.collection, parameters.filter);
        default:
          throw new Error(`Unsupported document operation: ${operation}`);
      }
    }

    // Generic fallback
    if (typeof engineInterface[operation] === 'function') {
      return await engineInterface[operation](parameters);
    }

    throw new Error(`Unsupported operation: ${operation} for engine type: ${engine.type}`);
  }

  /**
   * Update engine performance metrics
   */
  private async updateEngineMetrics(engineId: string, execution: QueryExecution): Promise<void> {
    const engine = this.engines.get(engineId);
    if (!engine || !execution.duration) return;

    const performance = engine.performance;

    // Update average latency (exponential moving average)
    const alpha = 0.1;
    performance.averageLatency =
      performance.averageLatency * (1 - alpha) + execution.duration * alpha;

    // Update error rate
    const recentQueries = this.queryHistory.filter(
      (q) => q.engineId === engineId && Date.now() - q.startTime < 300000 // Last 5 minutes
    );
    const errorCount = recentQueries.filter((q) => q.status === 'failed').length;
    performance.errorRate = recentQueries.length > 0 ? errorCount / recentQueries.length : 0;

    // Update throughput (queries per second)
    const queryCount = recentQueries.length;
    performance.throughput = queryCount / 300; // Queries per second over 5 minutes

    // Update utilization
    const activeQueries = Array.from(this.activeQueries.values()).filter(
      (q) => q.engineId === engineId
    ).length;
    performance.utilization = Math.min(1.0, activeQueries / 10); // Assume max 10 concurrent queries

    this.emit('engineMetricsUpdated', { engineId, performance });
  }

  /**
   * Perform health check on engine
   */
  private async checkEngineHealth(engineId: string): Promise<void> {
    const engine = this.engines.get(engineId);
    if (!engine) return;

    try {
      // Attempt a simple health check query
      const healthQuery: DatabaseQuery = {
        id: `health_${engineId}_${Date.now()}`,
        type: 'read',
        operation: 'health_check',
        parameters: {},
        requirements: { consistency: 'weak', timeout: 5000, priority: 'low' },
        routing: { loadBalancing: 'round_robin' },
        timestamp: Date.now(),
      };

      await this.executeOnEngine(healthQuery, engineId);

      if (engine.status !== 'active') {
        engine.status = 'active';
        this.emit('engineHealthy', { engineId });
      }
    } catch (error) {
      engine.status = 'degraded';
      this.emit('engineUnhealthy', { engineId, error: error.message });
    }

    engine.lastHealthCheck = Date.now();
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const engineId of this.engines.keys()) {
        await this.checkEngineHealth(engineId);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Register default coordination strategies
   */
  private registerDefaultStrategies(): void {
    // Vector search strategy
    this.strategies.set('vector_search', {
      name: 'vector_search',
      description: 'Route vector operations to vector databases',
      applicable: (query) => query.operation.includes('vector'),
      route: (query, engines) => {
        return Array.from(engines.entries())
          .filter(([, engine]) => engine.type === 'vector')
          .map(([id]) => id);
      },
      optimize: async () => {}, // No specific optimization
    });

    // Graph traversal strategy
    this.strategies.set('graph_traversal', {
      name: 'graph_traversal',
      description: 'Route graph operations to graph databases',
      applicable: (query) => query.operation.includes('graph'),
      route: (query, engines) => {
        return Array.from(engines.entries())
          .filter(([, engine]) => engine.type === 'graph')
          .map(([id]) => id);
      },
      optimize: async () => {}, // No specific optimization
    });

    // High priority strategy
    this.strategies.set('high_priority', {
      name: 'high_priority',
      description: 'Route high priority queries to fastest engines',
      applicable: (query) =>
        query.requirements.priority === 'critical' || query.requirements.priority === 'high',
      route: (query, engines) => {
        return Array.from(engines.entries())
          .filter(([, engine]) => engine.status === 'active')
          .sort(([, a], [, b]) => a.performance.averageLatency - b.performance.averageLatency)
          .slice(0, 3) // Top 3 fastest engines
          .map(([id]) => id);
      },
      optimize: async () => {}, // No specific optimization
    });
  }

  /**
   * Get coordination statistics
   */
  getStats() {
    const engines = Array.from(this.engines.values());
    const recentQueries = this.queryHistory.filter((q) => Date.now() - q.startTime < 300000);

    return {
      engines: {
        total: engines.length,
        active: engines.filter((e) => e.status === 'active').length,
        degraded: engines.filter((e) => e.status === 'degraded').length,
        failed: engines.filter((e) => e.status === 'failed').length,
        byType: engines.reduce(
          (acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      queries: {
        total: this.queryHistory.length,
        recent: recentQueries.length,
        active: this.activeQueries.size,
        successful: recentQueries.filter((q) => q.status === 'completed').length,
        failed: recentQueries.filter((q) => q.status === 'failed').length,
        averageLatency:
          recentQueries.length > 0
            ? recentQueries.reduce((sum, q) => sum + (q.duration || 0), 0) / recentQueries.length
            : 0,
      },
      strategies: this.strategies.size,
    };
  }

  /**
   * Shutdown coordinator
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Cancel active queries
    for (const execution of this.activeQueries.values()) {
      execution.status = 'failed';
      execution.error = 'Coordinator shutdown';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
    }

    this.activeQueries.clear();
    this.emit('shutdown');
  }
}
