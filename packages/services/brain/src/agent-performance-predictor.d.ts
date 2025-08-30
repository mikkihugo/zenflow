/**
 * @fileoverview Agent Performance Prediction System
 *
 * Uses time series analysis and machine learning to predict agent performance,
 * helping with intelligent task routing and resource optimization.
 *
 * Features:
 * - Time series forecasting using moving averages
 * - Performance trend analysis
 * - Load prediction and capacity planning
 * - Real-time performance monitoring
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface AgentPerformanceData {
  readonly agentId: string;
  readonly timestamp: number;
  readonly taskType: string;
  readonly complexity: number;
  readonly completionTime: number;
  readonly successRate: number;
  readonly errorRate: number;
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly concurrentTasks: number;
}
export interface PerformancePrediction {
  readonly agentId: string;
  readonly predictedCompletionTime: number;
  readonly predictedSuccessRate: number;
  readonly predictedScore?: number;
  readonly confidence: number;
  readonly loadForecast: number;
  readonly recommendedTaskCount: number;
  readonly performanceTrend: 'improving' | ' stable' | ' declining';
  readonly riskFactors: string[];
}
export interface PerformanceInsights {
  readonly topPerformers: string[];
  readonly underPerformers: string[];
  readonly capacityUtilization: number;
  readonly predictedBottlenecks: string[];
  readonly optimizationSuggestions: string[];
}
/**
 * Agent Performance Prediction System
 *
 * Analyzes historical performance data to predict future agent behavior
 * and optimize task distribution across the swarm.
 */
export declare class AgentPerformancePredictor {
  private performanceHistory;
  private initialized;
  private readonly maxHistorySize;
  constructor();
  /**
   * Initialize the prediction system
   */
  initialize(): Promise<void>;
  /**
   * Record agent performance data
   */
  recordPerformance(data: AgentPerformanceData): Promise<void>;
  /**
   * Get system-wide performance insights
   */
  getPerformanceInsights(): Promise<PerformanceInsights>;
}
//# sourceMappingURL=agent-performance-predictor.d.ts.map
