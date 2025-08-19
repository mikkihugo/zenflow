/**
 * Performance Tuning Strategy - AI-Driven Performance Optimization
 * 
 * Provides intelligent performance tuning with machine learning-based recommendations,
 * automated parameter adjustment, and continuous optimization feedback loops.
 */

import { EventEmitter } from 'eventemitter3';
import { 
  getLogger, 
  recordMetric, 
  withRetry,
  TelemetryManager,
  withTrace 
} from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import type { 
  PerformanceConfig, 
  TuningAction, 
  TuningRecommendation,
  StrategyMetrics 
} from './types';

interface PerformanceSnapshot {
  timestamp: number;
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  cpuUsage: number;
  activeConnections: number;
  queueSize: number;
}

interface TuningParameter {
  name: string;
  currentValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  impact: number;
  lastAdjusted: number;
}

interface TuningResult {
  action: TuningAction;
  parameters: Record<string, unknown>;
  beforeSnapshot: PerformanceSnapshot;
  afterSnapshot?: PerformanceSnapshot;
  improvement: number;
  success: boolean;
  timestamp: number;
}

export class PerformanceTuningStrategy extends EventEmitter {
  private logger: Logger;
  private config: PerformanceConfig;
  private telemetry: TelemetryManager;
  private snapshots: PerformanceSnapshot[] = [];
  private tuningParameters = new Map<string, TuningParameter>();
  private tuningHistory: TuningResult[] = [];
  private tuningTimer?: NodeJS.Timeout;
  private metrics: StrategyMetrics['performance'];
  private initialized = false;
  private stabilityCounter = 0;
  private lastTuningTime = 0;

  constructor(config: PerformanceConfig) {
    super();
    this.config = config;
    this.logger = getLogger('PerformanceTuningStrategy');
    this.telemetry = new TelemetryManager({
      serviceName: 'performance-tuning',
      enableTracing: true,
      enableMetrics: true
    });
    this.initializeMetrics();
    this.initializeTuningParameters();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await withTrace('performance-tuning-init', async () => {
        await this.telemetry.initialize();
        
        // Start performance monitoring
        if (this.config.enabled && this.config.tuning.autoTune) {
          this.startPerformanceMonitoring();
        }

        this.initialized = true;
        this.logger.info('Performance tuning strategy initialized', {
          autoTune: this.config.tuning.autoTune,
          interval: this.config.tuning.interval
        });
        recordMetric('performance_tuning_initialized', 1);
      });

    } catch (error) {
      this.logger.error('Failed to initialize performance tuning strategy:', error);
      throw error;
    }
  }

  async tune(): Promise<TuningRecommendation[]> {
    if (!this.config.enabled) {
      return [];
    }

    return withTrace('performance-tuning-cycle', async (span) => {
      span?.setAttributes({
        'tuning.auto': this.config.tuning.autoTune,
        'tuning.snapshots': this.snapshots.length
      });

      try {
        // Take performance snapshot
        const currentSnapshot = await this.takePerformanceSnapshot();
        this.snapshots.push(currentSnapshot);
        this.trimSnapshots();

        // Analyze performance trends
        const analysis = this.analyzePerformanceTrends();
        
        // Generate tuning recommendations
        const recommendations = await this.generateTuningRecommendations(analysis, currentSnapshot);
        
        // Apply automatic tuning if enabled
        if (this.config.tuning.autoTune && this.canPerformTuning()) {
          await this.applyTuning(recommendations.slice(0, 3)); // Apply top 3 recommendations
        }

        this.emit('tuningAnalysisCompleted', {
          snapshot: currentSnapshot,
          analysis,
          recommendations
        });

        recordMetric('performance_tuning_analysis_completed', 1, {
          recommendationsCount: recommendations.length
        });

        return recommendations;

      } catch (error) {
        this.logger.error('Performance tuning cycle failed:', error);
        recordMetric('performance_tuning_cycle_failed', 1);
        throw error;
      }
    });
  }

  private initializeMetrics(): void {
    this.metrics = {
      tuningActions: 0,
      performanceImprovements: 0,
      regressions: 0,
      stabilityScore: 100
    };
  }

  private initializeTuningParameters(): void {
    // Cache size parameter
    this.tuningParameters.set('cacheSize', {
      name: 'cacheSize',
      currentValue: 1000,
      minValue: 100,
      maxValue: 10000,
      step: 100,
      impact: 0.3,
      lastAdjusted: 0
    });

    // Cache TTL parameter
    this.tuningParameters.set('cacheTtl', {
      name: 'cacheTtl',
      currentValue: 300000, // 5 minutes
      minValue: 60000,      // 1 minute
      maxValue: 3600000,    // 1 hour
      step: 60000,
      impact: 0.2,
      lastAdjusted: 0
    });

    // Connection pool size
    this.tuningParameters.set('connectionPoolSize', {
      name: 'connectionPoolSize',
      currentValue: 10,
      minValue: 5,
      maxValue: 100,
      step: 5,
      impact: 0.25,
      lastAdjusted: 0
    });

    // Batch size
    this.tuningParameters.set('batchSize', {
      name: 'batchSize',
      currentValue: 50,
      minValue: 10,
      maxValue: 500,
      step: 10,
      impact: 0.15,
      lastAdjusted: 0
    });

    // Compression level
    this.tuningParameters.set('compressionLevel', {
      name: 'compressionLevel',
      currentValue: 6,
      minValue: 1,
      maxValue: 9,
      step: 1,
      impact: 0.1,
      lastAdjusted: 0
    });
  }

  private async takePerformanceSnapshot(): Promise<PerformanceSnapshot> {
    // In a real implementation, these would come from actual system monitoring
    return {
      timestamp: Date.now(),
      responseTime: await this.measureResponseTime(),
      throughput: await this.measureThroughput(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cacheHitRate: await this.measureCacheHitRate(),
      errorRate: await this.measureErrorRate(),
      cpuUsage: await this.measureCpuUsage(),
      activeConnections: await this.measureActiveConnections(),
      queueSize: await this.measureQueueSize()
    };
  }

  private async measureResponseTime(): Promise<number> {
    // Mock implementation
    return Math.random() * 100 + 10; // 10-110ms
  }

  private async measureThroughput(): Promise<number> {
    // Mock implementation - requests per second
    return Math.random() * 2000 + 500; // 500-2500 rps
  }

  private async measureCacheHitRate(): Promise<number> {
    // Mock implementation
    return Math.random() * 0.4 + 0.6; // 60-100%
  }

  private async measureErrorRate(): Promise<number> {
    // Mock implementation
    return Math.random() * 0.05; // 0-5%
  }

  private async measureCpuUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 0.7 + 0.1; // 10-80%
  }

  private async measureActiveConnections(): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 50 + 10); // 10-60 connections
  }

  private async measureQueueSize(): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 20); // 0-20 queued requests
  }

  private trimSnapshots(): void {
    // Keep last 100 snapshots (about 3+ hours if taken every 2 minutes)
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }
  }

  private analyzePerformanceTrends(): {
    responseTimeTrend: 'improving' | 'stable' | 'degrading';
    throughputTrend: 'improving' | 'stable' | 'degrading';
    memoryTrend: 'improving' | 'stable' | 'degrading';
    overallHealth: number;
    bottlenecks: string[];
  } {
    if (this.snapshots.length < 2) {
      return {
        responseTimeTrend: 'stable',
        throughputTrend: 'stable',
        memoryTrend: 'stable',
        overallHealth: 100,
        bottlenecks: []
      };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
    const older = this.snapshots.slice(-20, -10); // Previous 10 snapshots

    const recentAvgResponseTime = this.average(recent.map(s => s.responseTime));
    const olderAvgResponseTime = this.average(older.map(s => s.responseTime));
    const responseTimeTrend = this.getTrend(recentAvgResponseTime, olderAvgResponseTime, false);

    const recentAvgThroughput = this.average(recent.map(s => s.throughput));
    const olderAvgThroughput = this.average(older.map(s => s.throughput));
    const throughputTrend = this.getTrend(recentAvgThroughput, olderAvgThroughput, true);

    const recentAvgMemory = this.average(recent.map(s => s.memoryUsage));
    const olderAvgMemory = this.average(older.map(s => s.memoryUsage));
    const memoryTrend = this.getTrend(recentAvgMemory, olderAvgMemory, false);

    // Calculate overall health score
    let health = 100;
    const latestSnapshot = recent[recent.length - 1];

    if (latestSnapshot.responseTime > this.config.targets.responseTime) {
      health -= 25;
    }
    if (latestSnapshot.throughput < this.config.targets.throughput) {
      health -= 20;
    }
    if (latestSnapshot.cacheHitRate < this.config.targets.cacheEfficiency) {
      health -= 15;
    }
    if (latestSnapshot.errorRate > 0.01) { // 1%
      health -= 30;
    }
    if (latestSnapshot.memoryUsage > 1000) { // 1GB
      health -= 10;
    }

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    if (recentAvgResponseTime > this.config.targets.responseTime * 1.5) {
      bottlenecks.push('High response time');
    }
    if (latestSnapshot.queueSize > 10) {
      bottlenecks.push('High queue size');
    }
    if (latestSnapshot.cpuUsage > 0.8) {
      bottlenecks.push('High CPU usage');
    }
    if (latestSnapshot.memoryUsage > this.config.targets.memoryEfficiency * 1000) {
      bottlenecks.push('High memory usage');
    }

    return {
      responseTimeTrend,
      throughputTrend,
      memoryTrend,
      overallHealth: Math.max(0, health),
      bottlenecks
    };
  }

  private getTrend(recent: number, older: number, higherIsBetter: boolean): 'improving' | 'stable' | 'degrading' {
    if (older === 0) return 'stable';
    
    const change = (recent - older) / older;
    const threshold = 0.05; // 5% change threshold

    if (Math.abs(change) < threshold) {
      return 'stable';
    }

    if (higherIsBetter) {
      return change > 0 ? 'improving' : 'degrading';
    } else {
      return change < 0 ? 'improving' : 'degrading';
    }
  }

  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private async generateTuningRecommendations(
    analysis: any, 
    snapshot: PerformanceSnapshot
  ): Promise<TuningRecommendation[]> {
    const recommendations: TuningRecommendation[] = [];

    // Response time optimization
    if (analysis.responseTimeTrend === 'degrading' || snapshot.responseTime > this.config.targets.responseTime) {
      if (this.config.actions.adjustCacheSize) {
        recommendations.push({
          action: 'increase_cache_size',
          priority: 'high',
          impact: {
            performance: 0.3,
            memory: -0.2,
            complexity: 0.1
          },
          description: 'Increase cache size to improve response time',
          parameters: {
            currentSize: this.tuningParameters.get('cacheSize')?.currentValue,
            newSize: Math.min(
              (this.tuningParameters.get('cacheSize')?.currentValue || 1000) * 1.2,
              this.tuningParameters.get('cacheSize')?.maxValue || 10000
            )
          },
          estimatedImprovement: {
            responseTime: -0.15, // 15% improvement
            throughput: 0.1,     // 10% improvement
            memoryUsage: 0.2     // 20% increase
          }
        });
      }

      if (this.config.actions.enableCompression) {
        recommendations.push({
          action: 'enable_compression',
          priority: 'medium',
          impact: {
            performance: 0.2,
            memory: 0.1,
            complexity: 0.15
          },
          description: 'Enable compression to reduce payload size',
          parameters: {
            compressionLevel: 6,
            enabled: true
          },
          estimatedImprovement: {
            responseTime: -0.1,
            throughput: 0.05,
            memoryUsage: -0.05
          }
        });
      }
    }

    // Throughput optimization
    if (analysis.throughputTrend === 'degrading' || snapshot.throughput < this.config.targets.throughput) {
      if (this.config.actions.balanceLoad) {
        recommendations.push({
          action: 'rebalance_load',
          priority: 'high',
          impact: {
            performance: 0.25,
            memory: 0.05,
            complexity: 0.2
          },
          description: 'Rebalance load distribution to improve throughput',
          parameters: {
            algorithm: 'resource-aware',
            enableAdaptive: true
          },
          estimatedImprovement: {
            responseTime: -0.1,
            throughput: 0.2,
            memoryUsage: 0.05
          }
        });
      }

      if (this.config.actions.tunePrefetching) {
        recommendations.push({
          action: 'adjust_prefetching',
          priority: 'medium',
          impact: {
            performance: 0.15,
            memory: -0.1,
            complexity: 0.1
          },
          description: 'Optimize prefetching strategy',
          parameters: {
            enabled: true,
            lookahead: 3,
            threshold: 0.8
          },
          estimatedImprovement: {
            responseTime: -0.05,
            throughput: 0.15,
            memoryUsage: 0.1
          }
        });
      }
    }

    // Memory optimization
    if (analysis.memoryTrend === 'degrading' || snapshot.memoryUsage > this.config.targets.memoryEfficiency * 1000) {
      recommendations.push({
        action: 'increase_cleanup_frequency',
        priority: 'medium',
        impact: {
          performance: -0.05,
          memory: 0.3,
          complexity: 0.05
        },
        description: 'Increase cleanup frequency to reduce memory usage',
        parameters: {
          interval: 30000, // 30 seconds
          threshold: 0.8
        },
        estimatedImprovement: {
          responseTime: 0.02,
          throughput: -0.05,
          memoryUsage: -0.25
        }
      });
    }

    // Cache efficiency optimization
    if (snapshot.cacheHitRate < this.config.targets.cacheEfficiency) {
      recommendations.push({
        action: 'optimize_ttl',
        priority: 'medium',
        impact: {
          performance: 0.2,
          memory: -0.1,
          complexity: 0.1
        },
        description: 'Optimize TTL settings for better cache efficiency',
        parameters: {
          ttl: this.calculateOptimalTtl(snapshot),
          adaptive: true
        },
        estimatedImprovement: {
          responseTime: -0.1,
          throughput: 0.05,
          memoryUsage: 0.05
        }
      });
    }

    // Sort by priority and expected impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.impact.performance - a.impact.performance;
    });
  }

  private calculateOptimalTtl(snapshot: PerformanceSnapshot): number {
    // Simple heuristic: adjust TTL based on cache hit rate
    const currentTtl = this.tuningParameters.get('cacheTtl')?.currentValue || 300000;
    
    if (snapshot.cacheHitRate < 0.7) {
      // Low hit rate, increase TTL
      return Math.min(currentTtl * 1.5, 3600000);
    } else if (snapshot.cacheHitRate > 0.95) {
      // Very high hit rate, might be able to decrease TTL
      return Math.max(currentTtl * 0.8, 60000);
    }
    
    return currentTtl;
  }

  private canPerformTuning(): boolean {
    const now = Date.now();
    const minInterval = this.config.tuning.interval;
    
    // Respect minimum tuning frequency
    if (now - this.lastTuningTime < minInterval) {
      return false;
    }

    // Check stability - don't tune if system is unstable
    if (this.stabilityCounter < this.config.tuning.stabilityThreshold) {
      return false;
    }

    return true;
  }

  private async applyTuning(recommendations: TuningRecommendation[]): Promise<void> {
    for (const recommendation of recommendations) {
      try {
        const beforeSnapshot = this.snapshots[this.snapshots.length - 1];
        
        const success = await this.applyTuningAction(recommendation);
        
        if (success) {
          // Wait a bit for the change to take effect
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
          
          const afterSnapshot = await this.takePerformanceSnapshot();
          const improvement = this.calculateImprovement(beforeSnapshot, afterSnapshot);
          
          const result: TuningResult = {
            action: recommendation.action,
            parameters: recommendation.parameters,
            beforeSnapshot,
            afterSnapshot,
            improvement,
            success: true,
            timestamp: Date.now()
          };
          
          this.tuningHistory.push(result);
          this.updateMetrics(result);
          
          this.emit('tuningApplied', { recommendation, result });
          recordMetric('performance_tuning_applied', 1, {
            action: recommendation.action,
            improvement
          });

          this.lastTuningTime = Date.now();
          
          this.logger.info(`Applied tuning: ${recommendation.action}`, {
            improvement,
            parameters: recommendation.parameters
          });
        }

      } catch (error) {
        this.logger.error(`Failed to apply tuning: ${recommendation.action}`, error);
        recordMetric('performance_tuning_failed', 1, {
          action: recommendation.action
        });
      }
    }
  }

  private async applyTuningAction(recommendation: TuningRecommendation): Promise<boolean> {
    // Mock implementation - in real scenario, would apply actual configuration changes
    switch (recommendation.action) {
      case 'increase_cache_size':
        const newSize = recommendation.parameters.newSize as number;
        this.updateTuningParameter('cacheSize', newSize);
        break;
        
      case 'enable_compression':
        this.updateTuningParameter('compressionLevel', 6);
        break;
        
      case 'rebalance_load':
        // Would trigger load balancer reconfiguration
        break;
        
      case 'adjust_prefetching':
        // Would update prefetching parameters
        break;
        
      case 'increase_cleanup_frequency':
        // Would update cleanup interval
        break;
        
      case 'optimize_ttl':
        const newTtl = recommendation.parameters.ttl as number;
        this.updateTuningParameter('cacheTtl', newTtl);
        break;
    }

    // Simulate success/failure
    return Math.random() > 0.1; // 90% success rate
  }

  private updateTuningParameter(name: string, value: number): void {
    const param = this.tuningParameters.get(name);
    if (param) {
      param.currentValue = Math.max(param.minValue, Math.min(param.maxValue, value));
      param.lastAdjusted = Date.now();
    }
  }

  private calculateImprovement(before: PerformanceSnapshot, after: PerformanceSnapshot): number {
    let improvement = 0;
    let factors = 0;

    // Response time improvement (lower is better)
    if (before.responseTime > 0) {
      improvement += (before.responseTime - after.responseTime) / before.responseTime;
      factors++;
    }

    // Throughput improvement (higher is better)
    if (before.throughput > 0) {
      improvement += (after.throughput - before.throughput) / before.throughput;
      factors++;
    }

    // Cache hit rate improvement (higher is better)
    if (before.cacheHitRate > 0) {
      improvement += (after.cacheHitRate - before.cacheHitRate) / before.cacheHitRate;
      factors++;
    }

    return factors > 0 ? improvement / factors : 0;
  }

  private updateMetrics(result: TuningResult): void {
    this.metrics.tuningActions++;
    
    if (result.improvement > 0.05) { // 5% improvement threshold
      this.metrics.performanceImprovements++;
      this.stabilityCounter = Math.min(this.stabilityCounter + 2, 10);
    } else if (result.improvement < -0.05) { // 5% regression threshold
      this.metrics.regressions++;
      this.stabilityCounter = Math.max(this.stabilityCounter - 3, 0);
    } else {
      // Neutral result
      this.stabilityCounter = Math.max(this.stabilityCounter - 1, 0);
    }

    // Update stability score
    this.metrics.stabilityScore = (this.stabilityCounter / 10) * 100;
  }

  private startPerformanceMonitoring(): void {
    this.tuningTimer = setInterval(async () => {
      try {
        await this.tune();
      } catch (error) {
        this.logger.error('Performance tuning monitoring cycle failed:', error);
      }
    }, this.config.tuning.interval);
  }

  // Public methods

  getMetrics(): StrategyMetrics['performance'] {
    return { ...this.metrics };
  }

  getTuningHistory(limit = 50): TuningResult[] {
    return this.tuningHistory.slice(-limit);
  }

  getPerformanceSnapshots(limit = 100): PerformanceSnapshot[] {
    return this.snapshots.slice(-limit);
  }

  getTuningParameters(): Map<string, TuningParameter> {
    return new Map(this.tuningParameters);
  }

  async forceOptimization(): Promise<TuningRecommendation[]> {
    this.logger.info('Force optimization requested');
    return this.tune();
  }

  updateTuningParameter(name: string, value: number): boolean {
    const param = this.tuningParameters.get(name);
    if (!param) return false;

    if (value < param.minValue || value > param.maxValue) {
      return false;
    }

    param.currentValue = value;
    param.lastAdjusted = Date.now();
    
    this.logger.info(`Tuning parameter updated: ${name} = ${value}`);
    return true;
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring if interval changed
    if (newConfig.tuning?.interval !== undefined) {
      if (this.tuningTimer) {
        clearInterval(this.tuningTimer);
      }
      if (this.config.enabled && this.config.tuning.autoTune) {
        this.startPerformanceMonitoring();
      }
    }

    this.logger.info('Performance tuning configuration updated', newConfig);
  }

  async shutdown(): Promise<void> {
    if (this.tuningTimer) {
      clearInterval(this.tuningTimer);
    }

    this.snapshots = [];
    this.tuningHistory = [];
    this.initialized = false;
    
    this.logger.info('Performance tuning strategy shut down');
  }
}