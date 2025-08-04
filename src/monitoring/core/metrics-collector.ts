/**
 * Real-Time Metrics Collection System
 * Comprehensive system-wide performance monitoring
 */

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as process from 'node:process';

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  io: {
    readBytes: number;
    writeBytes: number;
    readOps: number;
    writeOps: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connectionsActive: number;
  };
}

export interface FactMetrics {
  timestamp: number;
  cache: {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    averageResponseTime: number;
  };
  storage: {
    documentsStored: number;
    storageSize: number;
    compressionRatio: number;
    indexingTime: number;
  };
  queries: {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    errorRate: number;
  };
}

export interface RagMetrics {
  timestamp: number;
  vectors: {
    totalVectors: number;
    dimensionality: number;
    indexSize: number;
    queryLatency: number;
  };
  retrieval: {
    averageRetrievalTime: number;
    retrievalAccuracy: number;
    contextRelevance: number;
    chunkUtilization: number;
  };
  embedding: {
    embeddingLatency: number;
    batchSize: number;
    throughput: number;
    errorRate: number;
  };
}

export interface SwarmMetrics {
  timestamp: number;
  agents: {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    failedAgents: number;
  };
  coordination: {
    messagesSent: number;
    messagesReceived: number;
    averageLatency: number;
    consensusTime: number;
  };
  tasks: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
  };
  load: {
    averageLoad: number;
    loadVariance: number;
    hotspots: number;
    balancingEfficiency: number;
  };
}

export interface McpToolMetrics {
  timestamp: number;
  tools: {
    [toolName: string]: {
      invocations: number;
      successRate: number;
      averageLatency: number;
      errorTypes: { [errorType: string]: number };
    };
  };
  performance: {
    totalInvocations: number;
    overallSuccessRate: number;
    averageResponseTime: number;
    timeoutRate: number;
  };
}

export interface CompositeMetrics {
  system: SystemMetrics;
  fact: FactMetrics;
  rag: RagMetrics;
  swarm: SwarmMetrics;
  mcp: McpToolMetrics;
}

export class MetricsCollector extends EventEmitter {
  private isCollecting = false;
  private collectionInterval = 1000; // 1 second
  private intervalId: NodeJS.Timeout | null = null;
  private metricsHistory: CompositeMetrics[] = [];
  private maxHistorySize = 3600; // 1 hour at 1s intervals
  private lastIoStats: any = null;

  constructor(
    options: {
      collectionInterval?: number;
      maxHistorySize?: number;
    } = {},
  ) {
    super();
    this.collectionInterval = options.collectionInterval || 1000;
    this.maxHistorySize = options.maxHistorySize || 3600;
  }

  /**
   * Start metrics collection
   */
  public startCollection(): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.collectionInterval);

    this.emit('collection:started');
  }

  /**
   * Stop metrics collection
   */
  public stopCollection(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('collection:stopped');
  }

  /**
   * Collect comprehensive metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: CompositeMetrics = {
        system: await this.collectSystemMetrics(),
        fact: await this.collectFactMetrics(),
        rag: await this.collectRagMetrics(),
        swarm: await this.collectSwarmMetrics(),
        mcp: await this.collectMcpToolMetrics(),
      };

      this.addToHistory(metrics);
      this.emit('metrics:collected', metrics);
    } catch (error) {
      this.emit('metrics:error', error);
    }
  }

  /**
   * Collect system performance metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU usage calculation (simplified)
    const cpuUsage = await this.getCpuUsage();

    // I/O stats (platform-specific)
    const ioStats = await this.getIoStats();

    // Network stats (simplified)
    const networkStats = await this.getNetworkStats();

    return {
      timestamp: Date.now(),
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
      },
      io: ioStats,
      network: networkStats,
    };
  }

  /**
   * Collect FACT system metrics
   */
  private async collectFactMetrics(): Promise<FactMetrics> {
    // Integration point with FACT system
    // This would connect to actual FACT monitoring hooks

    return {
      timestamp: Date.now(),
      cache: {
        hitRate: this.getRandomMetric(0.8, 0.95), // Mock data
        missRate: this.getRandomMetric(0.05, 0.2),
        totalRequests: Math.floor(Math.random() * 1000) + 500,
        averageResponseTime: this.getRandomMetric(10, 50),
      },
      storage: {
        documentsStored: Math.floor(Math.random() * 10000) + 5000,
        storageSize: Math.floor(Math.random() * 1000000) + 500000,
        compressionRatio: this.getRandomMetric(0.3, 0.7),
        indexingTime: this.getRandomMetric(100, 500),
      },
      queries: {
        totalQueries: Math.floor(Math.random() * 500) + 200,
        averageQueryTime: this.getRandomMetric(20, 100),
        slowQueries: Math.floor(Math.random() * 10),
        errorRate: this.getRandomMetric(0.01, 0.05),
      },
    };
  }

  /**
   * Collect RAG system metrics
   */
  private async collectRagMetrics(): Promise<RagMetrics> {
    // Integration point with RAG system
    // This would connect to actual RAG monitoring hooks

    return {
      timestamp: Date.now(),
      vectors: {
        totalVectors: Math.floor(Math.random() * 100000) + 50000,
        dimensionality: 768, // Common embedding dimension
        indexSize: Math.floor(Math.random() * 5000000) + 1000000,
        queryLatency: this.getRandomMetric(5, 25),
      },
      retrieval: {
        averageRetrievalTime: this.getRandomMetric(15, 60),
        retrievalAccuracy: this.getRandomMetric(0.85, 0.95),
        contextRelevance: this.getRandomMetric(0.8, 0.9),
        chunkUtilization: this.getRandomMetric(0.6, 0.85),
      },
      embedding: {
        embeddingLatency: this.getRandomMetric(50, 200),
        batchSize: Math.floor(Math.random() * 32) + 8,
        throughput: this.getRandomMetric(100, 500),
        errorRate: this.getRandomMetric(0.005, 0.02),
      },
    };
  }

  /**
   * Collect swarm coordination metrics
   */
  private async collectSwarmMetrics(): Promise<SwarmMetrics> {
    // Integration point with swarm system
    // This would connect to actual swarm monitoring hooks

    return {
      timestamp: Date.now(),
      agents: {
        totalAgents: Math.floor(Math.random() * 20) + 5,
        activeAgents: Math.floor(Math.random() * 15) + 3,
        idleAgents: Math.floor(Math.random() * 5) + 1,
        failedAgents: Math.floor(Math.random() * 2),
      },
      coordination: {
        messagesSent: Math.floor(Math.random() * 1000) + 100,
        messagesReceived: Math.floor(Math.random() * 1000) + 100,
        averageLatency: this.getRandomMetric(5, 20),
        consensusTime: this.getRandomMetric(100, 500),
      },
      tasks: {
        totalTasks: Math.floor(Math.random() * 100) + 20,
        completedTasks: Math.floor(Math.random() * 80) + 15,
        failedTasks: Math.floor(Math.random() * 5),
        averageTaskTime: this.getRandomMetric(1000, 5000),
      },
      load: {
        averageLoad: this.getRandomMetric(0.3, 0.8),
        loadVariance: this.getRandomMetric(0.1, 0.3),
        hotspots: Math.floor(Math.random() * 3),
        balancingEfficiency: this.getRandomMetric(0.8, 0.95),
      },
    };
  }

  /**
   * Collect MCP tool metrics
   */
  private async collectMcpToolMetrics(): Promise<McpToolMetrics> {
    // Integration point with MCP system
    // This would connect to actual MCP monitoring hooks

    const tools = {
      swarm_init: {
        invocations: Math.floor(Math.random() * 50) + 10,
        successRate: this.getRandomMetric(0.9, 0.99),
        averageLatency: this.getRandomMetric(100, 500),
        errorTypes: {
          timeout: Math.floor(Math.random() * 3),
          validation: Math.floor(Math.random() * 2),
          execution: Math.floor(Math.random() * 1),
        },
      },
      agent_spawn: {
        invocations: Math.floor(Math.random() * 100) + 20,
        successRate: this.getRandomMetric(0.85, 0.95),
        averageLatency: this.getRandomMetric(200, 800),
        errorTypes: {
          resource_exhaustion: Math.floor(Math.random() * 5),
          spawn_failure: Math.floor(Math.random() * 3),
        },
      },
      task_orchestrate: {
        invocations: Math.floor(Math.random() * 200) + 50,
        successRate: this.getRandomMetric(0.8, 0.9),
        averageLatency: this.getRandomMetric(500, 2000),
        errorTypes: {
          coordination_failure: Math.floor(Math.random() * 10),
          task_timeout: Math.floor(Math.random() * 8),
        },
      },
    };

    return {
      timestamp: Date.now(),
      tools,
      performance: {
        totalInvocations: Object.values(tools).reduce((sum, tool) => sum + tool.invocations, 0),
        overallSuccessRate:
          Object.values(tools).reduce((sum, tool) => sum + tool.successRate, 0) /
          Object.keys(tools).length,
        averageResponseTime:
          Object.values(tools).reduce((sum, tool) => sum + tool.averageLatency, 0) /
          Object.keys(tools).length,
        timeoutRate: this.getRandomMetric(0.02, 0.08),
      },
    };
  }

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const percentage = (totalUsage / 1000000) * 100; // Convert microseconds to percentage
        resolve(Math.min(100, percentage));
      }, 100);
    });
  }

  /**
   * Get I/O statistics (simplified)
   */
  private async getIoStats(): Promise<any> {
    // This would read from /proc/diskstats on Linux or similar on other platforms
    // For now, return mock data
    const current = {
      readBytes: Math.floor(Math.random() * 1000000),
      writeBytes: Math.floor(Math.random() * 500000),
      readOps: Math.floor(Math.random() * 1000),
      writeOps: Math.floor(Math.random() * 500),
    };

    if (this.lastIoStats) {
      return {
        readBytes: Math.max(0, current.readBytes - this.lastIoStats.readBytes),
        writeBytes: Math.max(0, current.writeBytes - this.lastIoStats.writeBytes),
        readOps: Math.max(0, current.readOps - this.lastIoStats.readOps),
        writeOps: Math.max(0, current.writeOps - this.lastIoStats.writeOps),
      };
    }

    this.lastIoStats = current;
    return current;
  }

  /**
   * Get network statistics (simplified)
   */
  private async getNetworkStats(): Promise<any> {
    // This would read from /proc/net/dev on Linux or similar on other platforms
    // For now, return mock data
    return {
      bytesIn: Math.floor(Math.random() * 100000),
      bytesOut: Math.floor(Math.random() * 50000),
      connectionsActive: Math.floor(Math.random() * 50) + 10,
    };
  }

  /**
   * Add metrics to history with size limit
   */
  private addToHistory(metrics: CompositeMetrics): void {
    this.metricsHistory.push(metrics);

    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Get metrics history
   */
  public getHistory(timeRange?: { start: number; end: number }): CompositeMetrics[] {
    if (!timeRange) {
      return [...this.metricsHistory];
    }

    return this.metricsHistory.filter(
      (metrics) =>
        metrics.system.timestamp >= timeRange.start && metrics.system.timestamp <= timeRange.end,
    );
  }

  /**
   * Get latest metrics
   */
  public getLatestMetrics(): CompositeMetrics | null {
    return this.metricsHistory.length > 0
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : null;
  }

  /**
   * Generate random metric value within range
   */
  private getRandomMetric(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Export metrics to file
   */
  public async exportMetrics(filePath: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    const data = this.getHistory();

    if (format === 'json') {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } else if (format === 'csv') {
      const csv = this.convertToCsv(data);
      await fs.writeFile(filePath, csv);
    }
  }

  /**
   * Convert metrics to CSV format
   */
  private convertToCsv(data: CompositeMetrics[]): string {
    if (data.length === 0) return '';

    const headers = [
      'timestamp',
      'cpu_usage',
      'memory_percentage',
      'fact_cache_hit_rate',
      'rag_query_latency',
      'swarm_active_agents',
      'mcp_success_rate',
    ];

    const rows = data.map((metrics) => [
      metrics.system.timestamp,
      metrics.system.cpu.usage,
      metrics.system.memory.percentage,
      metrics.fact.cache.hitRate,
      metrics.rag.vectors.queryLatency,
      metrics.swarm.agents.activeAgents,
      metrics.mcp.performance.overallSuccessRate,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
