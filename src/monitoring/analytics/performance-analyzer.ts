/**
 * Performance Analytics Engine
 * Real-time trend analysis, anomaly detection, and predictive modeling
 */

import { EventEmitter } from 'node:events';
import type { CompositeMetrics } from '../core/metrics-collector';

export interface AnomalyDetection {
  timestamp: number;
  metric: string;
  value: number;
  expectedValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
}

export interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  confidence: number;
  prediction: {
    nextValue: number;
    timeframe: number;
  };
}

export interface BottleneckAnalysis {
  component: 'system' | 'fact' | 'rag' | 'swarm' | 'mcp';
  metric: string;
  impact: number;
  rootCause: string;
  recommendations: string[];
}

export interface PerformanceInsights {
  timestamp: number;
  anomalies: AnomalyDetection[];
  trends: TrendAnalysis[];
  bottlenecks: BottleneckAnalysis[];
  healthScore: number;
  predictions: {
    capacityUtilization: number;
    timeToCapacity: number;
    resourceExhaustion: string[];
  };
}

export class PerformanceAnalyzer extends EventEmitter {
  private metricsHistory: CompositeMetrics[] = [];
  private baselineMetrics: Map<string, number> = new Map();
  private anomalyThresholds: Map<string, { min: number; max: number }> = new Map();
  private isAnalyzing = false;

  constructor() {
    super();
    this.initializeBaselines();
    this.initializeThresholds();
  }

  /**
   * Initialize baseline metrics for comparison
   */
  private initializeBaselines(): void {
    this.baselineMetrics.set('cpu_usage', 50);
    this.baselineMetrics.set('memory_percentage', 60);
    this.baselineMetrics.set('fact_cache_hit_rate', 0.85);
    this.baselineMetrics.set('rag_query_latency', 20);
    this.baselineMetrics.set('swarm_consensus_time', 200);
    this.baselineMetrics.set('mcp_success_rate', 0.9);
  }

  /**
   * Initialize anomaly detection thresholds
   */
  private initializeThresholds(): void {
    this.anomalyThresholds.set('cpu_usage', { min: 10, max: 85 });
    this.anomalyThresholds.set('memory_percentage', { min: 20, max: 90 });
    this.anomalyThresholds.set('fact_cache_hit_rate', { min: 0.7, max: 1.0 });
    this.anomalyThresholds.set('rag_query_latency', { min: 1, max: 100 });
    this.anomalyThresholds.set('swarm_consensus_time', { min: 50, max: 1000 });
    this.anomalyThresholds.set('mcp_success_rate', { min: 0.5, max: 1.0 });
  }

  /**
   * Start performance analysis
   */
  public startAnalysis(): void {
    this.isAnalyzing = true;
    this.emit('analysis:started');
  }

  /**
   * Stop performance analysis
   */
  public stopAnalysis(): void {
    this.isAnalyzing = false;
    this.emit('analysis:stopped');
  }

  /**
   * Analyze new metrics
   *
   * @param metrics
   */
  public analyzeMetrics(metrics: CompositeMetrics): PerformanceInsights {
    if (!this.isAnalyzing) {
      throw new Error('Performance analyzer is not running');
    }

    this.metricsHistory.push(metrics);
    this.maintainHistorySize();

    const insights: PerformanceInsights = {
      timestamp: metrics.system.timestamp,
      anomalies: this.detectAnomalies(metrics),
      trends: this.analyzeTrends(),
      bottlenecks: this.identifyBottlenecks(metrics),
      healthScore: this.calculateHealthScore(metrics),
      predictions: this.generatePredictions(),
    };

    this.emit('insights:generated', insights);
    return insights;
  }

  /**
   * Detect anomalies in current metrics
   *
   * @param metrics
   */
  private detectAnomalies(metrics: CompositeMetrics): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // System anomalies
    this.checkAnomaly(anomalies, 'cpu_usage', metrics.system.cpu.usage, 'System CPU usage');
    this.checkAnomaly(
      anomalies,
      'memory_percentage',
      metrics.system.memory.percentage,
      'System memory usage'
    );

    // FACT anomalies
    this.checkAnomaly(
      anomalies,
      'fact_cache_hit_rate',
      metrics.fact.cache.hitRate,
      'FACT cache hit rate'
    );
    this.checkAnomaly(
      anomalies,
      'fact_query_time',
      metrics.fact.queries.averageQueryTime,
      'FACT query time'
    );

    // RAG anomalies
    this.checkAnomaly(
      anomalies,
      'rag_query_latency',
      metrics.rag.vectors.queryLatency,
      'RAG query latency'
    );
    this.checkAnomaly(
      anomalies,
      'rag_retrieval_time',
      metrics.rag.retrieval.averageRetrievalTime,
      'RAG retrieval time'
    );

    // Swarm anomalies
    this.checkAnomaly(
      anomalies,
      'swarm_consensus_time',
      metrics.swarm.coordination.consensusTime,
      'Swarm consensus time'
    );
    this.checkAnomaly(
      anomalies,
      'swarm_task_time',
      metrics.swarm.tasks.averageTaskTime,
      'Swarm task time'
    );

    // MCP anomalies
    this.checkAnomaly(
      anomalies,
      'mcp_success_rate',
      metrics.mcp.performance.overallSuccessRate,
      'MCP success rate'
    );
    this.checkAnomaly(
      anomalies,
      'mcp_response_time',
      metrics.mcp.performance.averageResponseTime,
      'MCP response time'
    );

    return anomalies;
  }

  /**
   * Check for anomaly in a specific metric
   *
   * @param anomalies
   * @param metricName
   * @param value
   * @param description
   */
  private checkAnomaly(
    anomalies: AnomalyDetection[],
    metricName: string,
    value: number,
    description: string
  ): void {
    const threshold = this.anomalyThresholds.get(metricName);
    if (!threshold) return;

    const baseline = this.baselineMetrics.get(metricName) || value;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let confidence = 0;

    if (value < threshold.min || value > threshold.max) {
      const deviation = Math.abs(value - baseline) / baseline;

      if (deviation > 0.5) {
        severity = 'critical';
        confidence = 0.9;
      } else if (deviation > 0.3) {
        severity = 'high';
        confidence = 0.8;
      } else if (deviation > 0.2) {
        severity = 'medium';
        confidence = 0.7;
      } else {
        severity = 'low';
        confidence = 0.6;
      }

      anomalies.push({
        timestamp: Date.now(),
        metric: metricName,
        value,
        expectedValue: baseline,
        severity,
        confidence,
        description: `${description} is ${value < threshold.min ? 'below' : 'above'} normal range`,
      });
    }
  }

  /**
   * Analyze trends in metrics over time
   */
  private analyzeTrends(): TrendAnalysis[] {
    if (this.metricsHistory.length < 10) {
      return []; // Need sufficient data for trend analysis
    }

    const trends: TrendAnalysis[] = [];
    const recentMetrics = this.metricsHistory.slice(-10);

    // Analyze CPU usage trend
    trends.push(
      this.analyzeTrend(
        'cpu_usage',
        recentMetrics.map((m) => m.system.cpu.usage)
      )
    );

    // Analyze memory usage trend
    trends.push(
      this.analyzeTrend(
        'memory_percentage',
        recentMetrics.map((m) => m.system.memory.percentage)
      )
    );

    // Analyze FACT cache hit rate trend
    trends.push(
      this.analyzeTrend(
        'fact_cache_hit_rate',
        recentMetrics.map((m) => m.fact.cache.hitRate)
      )
    );

    // Analyze RAG query latency trend
    trends.push(
      this.analyzeTrend(
        'rag_query_latency',
        recentMetrics.map((m) => m.rag.vectors.queryLatency)
      )
    );

    // Analyze swarm performance trend
    trends.push(
      this.analyzeTrend(
        'swarm_active_agents',
        recentMetrics.map((m) => m.swarm.agents.activeAgents)
      )
    );

    return trends;
  }

  /**
   * Analyze trend for a specific metric
   *
   * @param metricName
   * @param values
   */
  private analyzeTrend(metricName: string, values: number[]): TrendAnalysis {
    if (values.length < 3) {
      return {
        metric: metricName,
        direction: 'stable',
        rate: 0,
        confidence: 0,
        prediction: { nextValue: values[values.length - 1] || 0, timeframe: 0 },
      };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determine direction and confidence
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const confidence = Math.min(0.9, Math.abs(slope) * 10); // Simplified confidence calculation

    if (Math.abs(slope) > 0.1) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    // Predict next value
    const nextValue = slope * n + intercept;

    return {
      metric: metricName,
      direction,
      rate: slope,
      confidence,
      prediction: {
        nextValue,
        timeframe: 1000, // 1 second (next collection interval)
      },
    };
  }

  /**
   * Identify performance bottlenecks
   *
   * @param metrics
   */
  private identifyBottlenecks(metrics: CompositeMetrics): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = [];

    // System bottlenecks
    if (metrics.system.cpu.usage > 80) {
      bottlenecks.push({
        component: 'system',
        metric: 'cpu_usage',
        impact: 0.8,
        rootCause: 'High CPU utilization detected',
        recommendations: [
          'Consider scaling horizontally',
          'Optimize CPU-intensive operations',
          'Implement CPU throttling',
        ],
      });
    }

    if (metrics.system.memory.percentage > 85) {
      bottlenecks.push({
        component: 'system',
        metric: 'memory_usage',
        impact: 0.9,
        rootCause: 'High memory utilization detected',
        recommendations: [
          'Implement garbage collection optimization',
          'Reduce memory footprint',
          'Consider memory scaling',
        ],
      });
    }

    // FACT bottlenecks
    if (metrics.fact.cache.hitRate < 0.7) {
      bottlenecks.push({
        component: 'fact',
        metric: 'cache_hit_rate',
        impact: 0.6,
        rootCause: 'Low cache hit rate reducing performance',
        recommendations: [
          'Increase cache size',
          'Optimize cache eviction policy',
          'Implement cache warming',
        ],
      });
    }

    // RAG bottlenecks
    if (metrics.rag.vectors.queryLatency > 50) {
      bottlenecks.push({
        component: 'rag',
        metric: 'query_latency',
        impact: 0.7,
        rootCause: 'High vector query latency',
        recommendations: [
          'Optimize vector index',
          'Implement query caching',
          'Consider dimensionality reduction',
        ],
      });
    }

    // Swarm bottlenecks
    if (metrics.swarm.coordination.consensusTime > 500) {
      bottlenecks.push({
        component: 'swarm',
        metric: 'consensus_time',
        impact: 0.5,
        rootCause: 'Slow consensus mechanism',
        recommendations: [
          'Optimize consensus algorithm',
          'Reduce network latency',
          'Implement fast consensus paths',
        ],
      });
    }

    // MCP bottlenecks
    if (metrics.mcp.performance.overallSuccessRate < 0.8) {
      bottlenecks.push({
        component: 'mcp',
        metric: 'success_rate',
        impact: 0.8,
        rootCause: 'High MCP tool failure rate',
        recommendations: [
          'Improve error handling',
          'Implement retry mechanisms',
          'Optimize tool implementations',
        ],
      });
    }

    return bottlenecks;
  }

  /**
   * Calculate overall system health score
   *
   * @param metrics
   */
  private calculateHealthScore(metrics: CompositeMetrics): number {
    const weights = {
      system: 0.25,
      fact: 0.2,
      rag: 0.2,
      swarm: 0.2,
      mcp: 0.15,
    };

    // System health (0-100)
    const systemHealth =
      Math.max(0, 100 - metrics.system.cpu.usage) *
      Math.max(0, (100 - metrics.system.memory.percentage) / 100);

    // FACT health (0-100)
    const factHealth =
      metrics.fact.cache.hitRate * 100 * Math.max(0, 1 - metrics.fact.queries.errorRate);

    // RAG health (0-100)
    const ragHealth =
      Math.max(0, 100 - metrics.rag.vectors.queryLatency) *
      metrics.rag.retrieval.retrievalAccuracy *
      100;

    // Swarm health (0-100)
    const swarmHealth =
      (metrics.swarm.agents.activeAgents / metrics.swarm.agents.totalAgents) *
      100 *
      metrics.swarm.load.balancingEfficiency;

    // MCP health (0-100)
    const mcpHealth = metrics.mcp.performance.overallSuccessRate * 100;

    const overallHealth =
      systemHealth * weights.system +
      factHealth * weights.fact +
      ragHealth * weights.rag +
      swarmHealth * weights.swarm +
      mcpHealth * weights.mcp;

    return Math.max(0, Math.min(100, overallHealth));
  }

  /**
   * Generate predictive insights
   */
  private generatePredictions(): {
    capacityUtilization: number;
    timeToCapacity: number;
    resourceExhaustion: string[];
  } {
    if (this.metricsHistory.length < 5) {
      return {
        capacityUtilization: 0,
        timeToCapacity: Infinity,
        resourceExhaustion: [],
      };
    }

    const recentMetrics = this.metricsHistory.slice(-5);
    const resourceExhaustion: string[] = [];

    // CPU capacity prediction
    const cpuTrend = this.analyzeTrend(
      'cpu_usage',
      recentMetrics.map((m) => m.system.cpu.usage)
    );
    if (cpuTrend.direction === 'increasing' && cpuTrend.rate > 0) {
      const timeToCapacity =
        (90 - recentMetrics[recentMetrics.length - 1].system.cpu.usage) / cpuTrend.rate;
      if (timeToCapacity < 300) {
        // 5 minutes
        resourceExhaustion.push('CPU');
      }
    }

    // Memory capacity prediction
    const memoryTrend = this.analyzeTrend(
      'memory_percentage',
      recentMetrics.map((m) => m.system.memory.percentage)
    );
    if (memoryTrend.direction === 'increasing' && memoryTrend.rate > 0) {
      const timeToCapacity =
        (90 - recentMetrics[recentMetrics.length - 1].system.memory.percentage) / memoryTrend.rate;
      if (timeToCapacity < 600) {
        // 10 minutes
        resourceExhaustion.push('Memory');
      }
    }

    const latestMetrics = recentMetrics[recentMetrics.length - 1];
    const capacityUtilization = Math.max(
      latestMetrics.system.cpu.usage,
      latestMetrics.system.memory.percentage
    );

    return {
      capacityUtilization,
      timeToCapacity: resourceExhaustion.length > 0 ? 300 : Infinity,
      resourceExhaustion,
    };
  }

  /**
   * Maintain metrics history size
   *
   * @param maxSize
   */
  private maintainHistorySize(maxSize = 1000): void {
    if (this.metricsHistory.length > maxSize) {
      this.metricsHistory.splice(0, this.metricsHistory.length - maxSize);
    }
  }

  /**
   * Get historical performance insights
   *
   * @param timeRange
   * @param timeRange.start
   * @param timeRange.end
   */
  public getHistoricalInsights(timeRange?: { start: number; end: number }): PerformanceInsights[] {
    const relevantMetrics = timeRange
      ? this.metricsHistory.filter(
          (m) => m.system.timestamp >= timeRange.start && m.system.timestamp <= timeRange.end
        )
      : this.metricsHistory;

    return relevantMetrics.map((metrics) => this.analyzeMetrics(metrics));
  }

  /**
   * Update baselines based on historical data
   */
  public updateBaselines(): void {
    if (this.metricsHistory.length < 100) return;

    const recentMetrics = this.metricsHistory.slice(-100);

    // Update CPU baseline
    const avgCpu =
      recentMetrics.reduce((sum, m) => sum + m.system.cpu.usage, 0) / recentMetrics.length;
    this.baselineMetrics.set('cpu_usage', avgCpu);

    // Update memory baseline
    const avgMemory =
      recentMetrics.reduce((sum, m) => sum + m.system.memory.percentage, 0) / recentMetrics.length;
    this.baselineMetrics.set('memory_percentage', avgMemory);

    // Update other baselines similarly...

    this.emit('baselines:updated');
  }
}
