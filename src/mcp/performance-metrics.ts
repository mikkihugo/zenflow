/** MCP Performance Metrics System */
/** Advanced monitoring and optimization for Model Context Protocol operations */

import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';

interface MCPMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
  tools: {
    executions: number;
    averageExecutionTime: number;
    successRate: number;
    mostUsed: string[];
    errorRate: number;
  };
  memory: {
    totalOperations: number;
    cacheHitRate: number;
    averageResponseSize: number;
    memoryUsage: number;
  };
  coordination: {
    swarmOperations: number;
    agentSpawns: number;
    taskOrchestrations: number;
    coordinationOverhead: number;
  };
  neural: {
    predictions: number;
    trainings: number;
    accuracy: number;
    searchOperations: number;
    averageSearchTime: number;
  };
}

interface PerformanceEntry {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export class MCPPerformanceMetrics extends EventEmitter {
  private metrics: MCPMetrics;
  private entries: PerformanceEntry[] = [];
  private latencyBuffer: number[] = [];
  private readonly maxBufferSize = 10000;
  private startTime: number;
  private toolUsage = new Map<string, number>();
  private coordinationTimes: number[] = [];

  constructor() {
    super();
    
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0
      },
      tools: {
        executions: 0,
        averageExecutionTime: 0,
        successRate: 0,
        mostUsed: [],
        errorRate: 0
      },
      memory: {
        totalOperations: 0,
        cacheHitRate: 0,
        averageResponseSize: 0,
        memoryUsage: 0
      },
      coordination: {
        swarmOperations: 0,
        agentSpawns: 0,
        taskOrchestrations: 0,
        coordinationOverhead: 0
      },
      neural: {
        predictions: 0,
        trainings: 0,
        accuracy: 0,
        searchOperations: 0,
        averageSearchTime: 0
      }
    };
  }

  /** Record an MCP request */
  recordRequest(duration: number, success: boolean, metadata?: Record<string, any>): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation: 'mcp_request',
      duration,
      success,
      metadata
    };

    this.entries.push(entry);
    this.latencyBuffer.push(duration);

    // Maintain buffer size
    if (this.latencyBuffer.length > this.maxBufferSize) {
      this.latencyBuffer.shift();
    }

    // Update metrics
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    this.updateLatencyMetrics();
    this.emit('requestRecorded', entry);
  }

  /** Record tool execution */
  recordToolExecution(
    toolName: string, 
    duration: number, 
    success: boolean, 
    metadata?: Record<string, any>
  ): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation: `tool_${toolName}`,
      duration,
      success,
      metadata: { toolName, ...metadata }
    };

    this.entries.push(entry);
    
    // Update tool usage tracking
    this.toolUsage.set(toolName, (this.toolUsage.get(toolName) || 0) + 1);
    
    // Update tool metrics
    this.metrics.tools.executions++;
    const currentAvg = this.metrics.tools.averageExecutionTime;
    const count = this.metrics.tools.executions;
    this.metrics.tools.averageExecutionTime = 
      (currentAvg * (count - 1) + duration) / count;

    if (success) {
      this.metrics.tools.successRate = 
        (this.metrics.tools.successful + 1) / this.metrics.tools.executions;
    } else {
      this.metrics.tools.errorRate = 
        (this.metrics.tools.failed + 1) / this.metrics.tools.executions;
    }

    this.updateMostUsedTools();
    this.emit('toolExecutionRecorded', entry);
  }

  /** Record memory operation */
  recordMemoryOperation(
    operation: 'read' | 'write' | 'cache_hit' | 'cache_miss',
    duration: number,
    responseSize?: number
  ): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation: `memory_${operation}`,
      duration,
      success: true,
      metadata: { responseSize }
    };

    this.entries.push(entry);
    this.metrics.memory.totalOperations++;

    if (operation === 'cache_hit' || operation === 'cache_miss') {
      const cacheHits = this.entries.filter(e => 
        e.operation === 'memory_cache_hit'
      ).length;
      const totalCacheOps = this.entries.filter(e => 
        e.operation.includes('cache_')
      ).length;
      
      this.metrics.memory.cacheHitRate = cacheHits / totalCacheOps;
    }

    if (responseSize) {
      const totalSizes = this.entries
        .filter(e => e.metadata?.responseSize)
        .reduce((sum, e) => sum + (e.metadata?.responseSize || 0), 0);
      const sizeCount = this.entries.filter(e => e.metadata?.responseSize).length;
      
      this.metrics.memory.averageResponseSize = totalSizes / sizeCount;
    }

    this.emit('memoryOperationRecorded', entry);
  }

  /** Record coordination operation */
  recordCoordinationOperation(
    operation: 'swarm_init' | 'agent_spawn' | 'task_orchestrate',
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation: `coordination_${operation}`,
      duration,
      success,
      metadata
    };

    this.entries.push(entry);
    this.coordinationTimes.push(duration);

    switch (operation) {
      case 'swarm_init':
        this.metrics.coordination.swarmOperations++;
        break;
      case 'agent_spawn':
        this.metrics.coordination.agentSpawns++;
        break;
      case 'task_orchestrate':
        this.metrics.coordination.taskOrchestrations++;
        break;
    }

    // Calculate coordination overhead
    const avgCoordination = this.coordinationTimes.reduce((a, b) => a + b, 0) / 
      this.coordinationTimes.length;
    this.metrics.coordination.coordinationOverhead = avgCoordination;

    this.emit('coordinationOperationRecorded', entry);
  }

  /** Record neural operation */
  recordNeuralOperation(
    operation: 'prediction' | 'training' | 'search',
    duration: number,
    success: boolean,
    accuracy?: number,
    metadata?: Record<string, any>
  ): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operation: `neural_${operation}`,
      duration,
      success,
      metadata: { accuracy, ...metadata }
    };

    this.entries.push(entry);

    switch (operation) {
      case 'prediction':
        this.metrics.neural.predictions++;
        if (accuracy !== undefined) {
          const totalAccuracy = this.metrics.neural.accuracy * 
            (this.metrics.neural.predictions - 1);
          this.metrics.neural.accuracy = 
            (totalAccuracy + accuracy) / this.metrics.neural.predictions;
        }
        break;
      case 'training':
        this.metrics.neural.trainings++;
        break;
      case 'search':
        this.metrics.neural.searchOperations++;
        const currentAvg = this.metrics.neural.averageSearchTime;
        const count = this.metrics.neural.searchOperations;
        this.metrics.neural.averageSearchTime = 
          (currentAvg * (count - 1) + duration) / count;
        break;
    }

    this.emit('neuralOperationRecorded', entry);
  }

  /** Get current metrics snapshot */
  getMetrics(): MCPMetrics {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  /** Get performance summary */
  getPerformanceSummary(): {
    uptime: number;
    totalOperations: number;
    averageLatency: number;
    successRate: number;
    topBottlenecks: Array<{ operation: string; averageTime: number; count: number }>;
  } {
    const uptime = Date.now() - this.startTime;
    const totalOperations = this.entries.length;
    const successfulOps = this.entries.filter(e => e.success).length;
    const successRate = totalOperations > 0 ? successfulOps / totalOperations : 0;
    
    const averageLatency = this.latencyBuffer.length > 0 ?
      this.latencyBuffer.reduce((a, b) => a + b, 0) / this.latencyBuffer.length : 0;

    // Calculate bottlenecks
    const operationStats = new Map<string, { total: number; count: number }>();
    
    for (const entry of this.entries) {
      const current = operationStats.get(entry.operation) || { total: 0, count: 0 };
      current.total += entry.duration;
      current.count++;
      operationStats.set(entry.operation, current);
    }

    const topBottlenecks = Array.from(operationStats.entries())
      .map(([operation, stats]) => ({
        operation,
        averageTime: stats.total / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    return {
      uptime,
      totalOperations,
      averageLatency,
      successRate,
      topBottlenecks
    };
  }

  /** Get optimization recommendations */
  getOptimizationRecommendations(): Array<{
    category: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: Array<{
      category: string;
      issue: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Check latency issues
    if (this.metrics.requests.averageLatency > 1000) {
      recommendations.push({
        category: 'Performance',
        issue: 'High average request latency',
        recommendation: 'Consider implementing request caching or optimizing tool execution',
        priority: 'high'
      });
    }

    // Check error rates
    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    if (errorRate > 0.05) {
      recommendations.push({
        category: 'Reliability',
        issue: 'High error rate detected',
        recommendation: 'Review error logs and implement better error handling',
        priority: 'high'
      });
    }

    // Check memory efficiency
    if (this.metrics.memory.cacheHitRate < 0.7) {
      recommendations.push({
        category: 'Memory',
        issue: 'Low cache hit rate',
        recommendation: 'Optimize caching strategy or increase cache size',
        priority: 'medium'
      });
    }

    // Check coordination overhead
    if (this.metrics.coordination.coordinationOverhead > 500) {
      recommendations.push({
        category: 'Coordination',
        issue: 'High coordination overhead',
        recommendation: 'Consider batch operations or optimize agent communication',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /** Update latency percentiles */
  private updateLatencyMetrics(): void {
    if (this.latencyBuffer.length === 0) return;

    const sorted = [...this.latencyBuffer].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.requests.averageLatency = 
      sorted.reduce((a, b) => a + b, 0) / len;
    
    this.metrics.requests.p95Latency = 
      sorted[Math.floor(len * 0.95)] || 0;
    
    this.metrics.requests.p99Latency = 
      sorted[Math.floor(len * 0.99)] || 0;
  }

  /** Update most used tools */
  private updateMostUsedTools(): void {
    const sortedTools = Array.from(this.toolUsage.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tool]) => tool);
    
    this.metrics.tools.mostUsed = sortedTools;
  }

  /** Export metrics to JSON */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      summary: this.getPerformanceSummary(),
      recommendations: this.getOptimizationRecommendations()
    }, null, 2);
  }

  /** Reset all metrics */
  reset(): void {
    this.entries = [];
    this.latencyBuffer = [];
    this.coordinationTimes = [];
    this.toolUsage.clear();
    this.startTime = Date.now();
    
    // Reset metrics to initial state
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0
      },
      tools: {
        executions: 0,
        averageExecutionTime: 0,
        successRate: 0,
        mostUsed: [],
        errorRate: 0
      },
      memory: {
        totalOperations: 0,
        cacheHitRate: 0,
        averageResponseSize: 0,
        memoryUsage: 0
      },
      coordination: {
        swarmOperations: 0,
        agentSpawns: 0,
        taskOrchestrations: 0,
        coordinationOverhead: 0
      },
      neural: {
        predictions: 0,
        trainings: 0,
        accuracy: 0,
        searchOperations: 0,
        averageSearchTime: 0
      }
    };

    this.emit('metricsReset');
  }
}

export default MCPPerformanceMetrics;