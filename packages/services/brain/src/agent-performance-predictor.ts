import { getLogger as _getLogger } from '@claude-zen/foundation';
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

import { getLogger as _getLogger } from '@claude-zen/foundation';
import { mean, standardDeviation, sum} from 'simple-statistics';
import regression from 'regression';

const logger = getLogger('AgentPerformancePredictor');

// Simple weighted moving average function
function wma(_data:number[], weights?:number[]): number[] {
  if (data.length === 0) return [];
  if (!weights || weights.length !== data.length) {
    // Default exponential weights
    weights = data.map((_, i) => Math.exp(i / data.length));
}
  
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / weightSum);
  
  return data.map((_, i) => {
    const windowData = data.slice(0, i + 1);
    const windowWeights = normalizedWeights.slice(0, i + 1);
    return windowData.reduce((sum, val, idx) => sum + val * windowWeights[idx], 0);
});
}

export interface AgentPerformanceData {
  readonly agentId:string;
  readonly timestamp:number;
  readonly taskType:string;
  readonly complexity:number; // 0-1 scale
  readonly completionTime:number; // milliseconds
  readonly successRate:number; // 0-1 scale
  readonly errorRate:number; // 0-1 scale
  readonly cpuUsage:number; // 0-1 scale
  readonly memoryUsage:number; // 0-1 scale
  readonly concurrentTasks:number;
}

export interface PerformancePrediction {
  readonly agentId:string;
  readonly predictedCompletionTime:number;
  readonly predictedSuccessRate:number;
  readonly predictedScore?:number; // Overall predicted performance score
  readonly confidence:number;
  readonly loadForecast:number; // Expected load in next time window
  readonly recommendedTaskCount:number;
  readonly performanceTrend:'improving' | ' stable' | ' declining';
  readonly riskFactors:string[];
}

export interface PerformanceInsights {
  readonly topPerformers:string[];
  readonly underPerformers:string[];
  readonly capacityUtilization:number;
  readonly predictedBottlenecks:string[];
  readonly optimizationSuggestions:string[];
}

/**
 * Agent Performance Prediction System
 *
 * Analyzes historical performance data to predict future agent behavior
 * and optimize task distribution across the swarm.
 */
export class AgentPerformancePredictor {
  private performanceHistory:Map<string, AgentPerformanceData[]> = new Map();
  private initialized = false;
  private readonly maxHistorySize = 1000;

  constructor() {
    logger.info('Agent Performance Predictor created');
}

  /**
   * Initialize the prediction system
   */
  async initialize():Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Initializing Agent Performance Prediction System...');

      // Initialize prediction models and historical data loading
      await this.loadHistoricalData();
      await this.initializePredictionModels();
      await this.setupPerformanceMonitoring();

      this.initialized = true;
      logger.info('Agent Performance Predictor initialized successfully');
} catch (error) {
      logger.error(
        'Failed to initialize Agent Performance Predictor: ',
        error
      );
      throw error;
}
}

  /**
   * Record agent performance data
   */
  async recordPerformance(_data:AgentPerformanceData): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
}

    try {
      // Get or create performance history for agent
      let history = this.performanceHistory.get(data.agentId)||[];

      // Add new data point
      history.push(data);

      // Maintain history size limit
      if (history.length > this.maxHistorySize) {
        history = history.slice(-this.maxHistorySize);
}

      this.performanceHistory.set(data.agentId, history);

      // Update performance trends
      await this.updatePerformanceTrends(data.agentId, history);

      logger.debug(
        `Performance recorded for agent ${data.agentId}:success rate ${data.successRate.toFixed(2)}"Fixed unterminated template" `Performance prediction for ${agentId}:${predictedSuccessRate.toFixed(2)} success rate, ${predictedCompletionTime.toFixed(0)}ms completion time"Fixed unterminated template" `Performance prediction failed for agent ${agentId}:"Fixed unterminated template"(`Updating performance data for agent ${data.agentId}"Fixed unterminated template"(`Performance data updated for agent ${data.agentId}"Fixed unterminated template" `Failed to update performance data for agent ${data.agentId}:"Fixed unterminated template"(`Error forecasting load for agent ${agentId}:"Fixed unterminated template"(`High error rate:${(avgErrorRate * 100).toFixed(1)}%"Fixed unterminated template"(`High CPU usage:${(avgCpuUsage * 100).toFixed(1)}%"Fixed unterminated template" `High memory usage:${(avgMemoryUsage * 100).toFixed(1)}%"Fixed unterminated template"(`Updated performance trends for agent ${agentId}"Fixed unterminated template"(`Failed to update performance trends for ${agentId}:"Fixed unterminated template"(`Persisted performance trends for agent ${agentId}:"Fixed unterminated template"(`Failed to persist performance trends for ${agentId}:"Fixed unterminated template"(`Predicted ${bottlenecks.length} potential bottlenecks"Fixed unterminated template")"Fixed unterminated template"(`high memory usage (${(metrics.avgMemoryUsage * 100).toFixed(1)}%${trend})"Fixed unterminated template"(`elevated error rate (${(metrics.avgErrorRate * 100).toFixed(1)}%${volatility})"Fixed unterminated template"(`slow response times (avg:${(metrics.avgCompletionTime / 1000).toFixed(1)}s)"Fixed unterminated template"(`Agent ${  agentId  } (high resource usage/errors)"Fixed unterminated template"(`Failed to load realtime metrics for ${  agentId  }:"Fixed unterminated template"(`Failed to apply ML forecast for ${  agentId  }:"Fixed unterminated template"(`Performance snapshot logged for agent ${agentId}"Fixed unterminated template"(`Failed to log performance snapshot for agent ${  agentId  }:"Fixed unterminated template"(`Agent profile calculated for ${agentId}"Fixed unterminated template"(`Failed to get agent performance profile for ${  agentId  }:"Fixed unterminated template"(`Baseline calculated for agent ${agentId}"Fixed unterminated template"(`Failed to calculate baseline for agent ${  agentId  }:"Fixed unterminated template"(`Risk score calculated for agent ${  agentId  }: ${  confidenceAdjustedRisk.toFixed(3)}"Fixed unterminated template"(`Failed to calculate risk score for agent ${  agentId  }:"Fixed unterminated template"(`Critical performance event for agent ${agentId}"Fixed unterminated template"(`Failed to log critical performance event for agent ${  agentId  }:"Fixed unterminated template"(`Current risk score: ${  eventData.riskScore.toFixed(2)  } - monitor closely"Fixed unterminated template"(`Creating TaskMaster incident for agent ${  agentId  }, _event: ${  eventType}"Fixed unterminated template" `Critical performance _event: ${eventType} for agent ${agentId}"Fixed unterminated template"(`Failed to trigger automated remediation for agent ${  agentId  }:"Fixed unterminated template"(`Performance remediation logged for agent ${agentId}"Fixed unterminated template"(`Failed to log performance remediation for agent ${  agentId  }:"Fixed unterminated template"