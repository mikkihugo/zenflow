/**
 * Performance Tuning Strategy - AI-Driven Performance Optimization
 *
 * Provides intelligent performance tuning with machine learning-based recommendations,
 * automated parameter adjustment, and continuous optimization feedback loops.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type {
  PerformanceConfig,
  TuningAction,
  TuningRecommendation,
  StrategyMetrics,
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
export declare class PerformanceTuningStrategy extends TypedEventBase {
  private logger;
  private config;
  private telemetry;
  private snapshots;
  private tuningParameters;
  private tuningHistory;
  private tuningTimer?;
  private metrics;
  private initialized;
  private stabilityCounter;
  private lastTuningTime;
  constructor(config: PerformanceConfig);
  initialize(): Promise<void>;
  tune(): Promise<TuningRecommendation[]>;
  private initializeMetrics;
  private initializeTuningParameters;
  private takePerformanceSnapshot;
  private measureResponseTime;
  private measureThroughput;
  private measureCacheHitRate;
  private measureErrorRate;
  private measureCpuUsage;
  private measureActiveConnections;
  private measureQueueSize;
  private trimSnapshots;
  private analyzePerformanceTrends;
  private getTrend;
  private average;
  private generateTuningRecommendations;
  private calculateOptimalTtl;
  private canPerformTuning;
  private applyTuning;
  private applyTuningAction;
  private updateTuningParameter;
  private calculateImprovement;
  private updateMetrics;
  private startPerformanceMonitoring;
  getMetrics(): StrategyMetrics['performance'];
  getTuningHistory(limit?: number): TuningResult[];
  getPerformanceSnapshots(limit?: number): PerformanceSnapshot[];
  getTuningParameters(): Map<string, TuningParameter>;
  forceOptimization(): Promise<TuningRecommendation[]>;
  setTuningParameter(name: string, value: number): boolean;
  updateConfig(newConfig: Partial<PerformanceConfig>): void;
  shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=performance-tuning-strategy.d.ts.map
