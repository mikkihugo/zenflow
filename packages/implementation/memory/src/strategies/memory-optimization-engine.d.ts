/**
 * Memory Optimization Engine - AI-Driven Performance Optimization
 *
 * Provides intelligent memory optimization with real-time performance monitoring,
 * automated tuning, and predictive optimization strategies.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type { OptimizationConfig, OptimizationMetrics } from './types';
interface OptimizationSample {
  timestamp: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  cacheHitRate: number;
  errorRate: number;
  cpuUsage: number;
}
interface OptimizationAction {
  id: string;
  type: 'memory|cache|performance|configuration';
  action: string;
  parameters: Record<string, unknown>;
  expectedImpact: number;
  appliedAt: number;
  result?: {
    success: boolean;
    actualImpact: number;
    measuredAt: number;
  };
}
export declare class MemoryOptimizationEngine extends TypedEventBase {
  private logger;
  private config;
  private telemetry;
  private metrics;
  private samples;
  private appliedActions;
  private optimizationTimer?;
  private initialized;
  private baselineMetrics?;
  constructor(config: OptimizationConfig);
  initialize(): Promise<void>;
  optimize(): Promise<OptimizationMetrics>;
  private initializeMetrics;
  private collectBaselineMetrics;
  private collectPerformanceSample;
  private measureAverageResponseTime;
  private measureThroughput;
  private measureCacheHitRate;
  private measureErrorRate;
  private measureCpuUsage;
  private trimSamples;
  private analyzePerformanceTrends;
  private getTrend;
  private average;
  private generateOptimizationRecommendations;
  private applyOptimizations;
  private getMaxOptimizations;
  private applyOptimization;
  private updateOptimizationMetrics;
  private updateHealthScore;
  private startOptimizationMonitoring;
  getMetrics(): OptimizationMetrics;
  getOptimizationHistory(): OptimizationAction[];
  getPerformanceSamples(limit?: number): OptimizationSample[];
  forceOptimization(): Promise<OptimizationMetrics>;
  updateConfig(newConfig: Partial<OptimizationConfig>): void;
  shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=memory-optimization-engine.d.ts.map
