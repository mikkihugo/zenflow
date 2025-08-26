/**
 * @file Task Predictor - Core Monitoring Primitives
 *
 * Simplified task prediction interfaces and basic implementations for agent monitoring.
 * Business logic and complex prediction algorithms should be implemented in the main app.
 */

// Simple logger placeholder
const getLogger = (name: string) => ({
  info: (msg: string, meta?: unknown) =>
    console.log(`[INFO:${name}] ${msg}`, meta || ''),
  debug: (msg: string, meta?: unknown) =>
    console.log(`[DEBUG:${name}] ${msg}`, meta || ''),
  warn: (msg: string, meta?: unknown) =>
    console.warn(`[WARN:${name}] ${msg}`, meta || ''),
  error: (msg: string, meta?: unknown) =>
    console.error(`[ERROR:${name}] ${msg}`, meta || ''),
});
import type { AgentId, PredictionRequest } from './types';

const logger = getLogger('agent-monitoring-task-predictor');

/**
 * Basic task prediction result
 */
export interface TaskPrediction {
  agentId: string;
  taskType: string;
  predictedDuration: number;
  confidence: number;
  factors: PredictionFactor[];
  lastUpdated: Date;
  metadata?: {
    sampleSize: number;
    algorithm: string;
    trendDirection: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Factors affecting prediction accuracy
 */
export interface PredictionFactor {
  name: string;
  impact: number;
  confidence: number;
  description: string;
}

/**
 * Task completion record
 */
export interface TaskCompletionRecord {
  agentId: AgentId;
  taskType: string;
  duration: number;
  success: boolean;
  timestamp: number;
  complexity?: number;
  quality?: number;
  resourceUsage?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Basic task predictor configuration
 */
export interface TaskPredictorConfig {
  historyWindowSize: number;
  confidenceThreshold: number;
  minSamplesRequired: number;
  maxPredictionTime: number;
}

/**
 * Default configuration for Task Predictor
 */
export const DEFAULT_TASK_PREDICTOR_CONFIG: TaskPredictorConfig = {
  historyWindowSize: 50,
  confidenceThreshold: 0.7,
  minSamplesRequired: 3,
  maxPredictionTime: 300000, // 5 minutes
};

/**
 * Basic Task Predictor Interface
 *
 * Core monitoring primitive for task duration prediction.
 * Complex business logic should be implemented in the main application.
 */
export interface TaskPredictor {
  recordTaskCompletion(
    agentId: AgentId,
    taskType: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, unknown>
  ): void;

  predictTaskDuration(
    agentId: AgentId,
    taskType: string,
    contextFactors?: Record<string, unknown>
  ): TaskPrediction;

  clearCache(olderThanMs?: number): void;
}

/**
 * Simple Task Predictor Implementation
 *
 * Basic implementation for core monitoring.
 * Production applications should implement more sophisticated algorithms.
 */
export class SimpleTaskPredictor implements TaskPredictor {
  private taskHistory: Map<string, TaskCompletionRecord[]> = new Map();
  private config: TaskPredictorConfig;

  constructor(config?: Partial<TaskPredictorConfig>) {
    this.config = { ...DEFAULT_TASK_PREDICTOR_CONFIG, ...config };
    logger.info('SimpleTaskPredictor initialized', { config: this.config });
  }

  /**
   * Record a task completion for future predictions
   */
  recordTaskCompletion(
    agentId: AgentId,
    taskType: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, unknown>
  ): void {
    const key = `${agentId.id}-${taskType}`;

    const record: TaskCompletionRecord = {
      agentId,
      taskType,
      duration,
      success,
      timestamp: Date.now(),
      complexity: metadata?.complexity as number,
      quality: metadata?.quality as number,
      resourceUsage: metadata?.resourceUsage as number,
      metadata,
    };

    // Add to history
    if (!this.taskHistory.has(key)) {
      this.taskHistory.set(key, []);
    }

    const history = this.taskHistory.get(key)!;
    history.push(record);

    // Keep only recent history
    if (history.length > this.config.historyWindowSize) {
      history.shift();
    }

    logger.debug('Task completion recorded', {
      agentId: agentId.id,
      taskType,
      duration,
      success,
    });
  }

  /**
   * Predict task duration using simple moving average
   */
  predictTaskDuration(
    agentId: AgentId,
    taskType: string,
    _contextFactors?: Record<string, unknown>
  ): TaskPrediction {
    const key = `${agentId.id}-${taskType}`;
    const history = this.taskHistory.get(key) || [];

    if (history.length < this.config.minSamplesRequired) {
      return this.createFallbackPrediction(agentId.id, taskType);
    }

    // Simple moving average calculation
    const recentHistory = history.slice(-this.config.historyWindowSize);
    const durations = recentHistory.map((r) => r.duration);
    const averageDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Simple confidence based on data consistency
    const variance = this.calculateVariance(durations);
    const mean = this.calculateMean(durations);
    const cv = Math.sqrt(variance) / mean; // coefficient of variation
    const confidence = Math.max(0.1, Math.min(0.95, 1 - cv));

    const prediction: TaskPrediction = {
      agentId: agentId.id,
      taskType,
      predictedDuration: Math.round(averageDuration),
      confidence,
      factors: [
        {
          name: 'Historical Average',
          impact: 1.0,
          confidence,
          description: `Based on ${recentHistory.length} recent completions`,
        },
      ],
      lastUpdated: new Date(),
      metadata: {
        sampleSize: recentHistory.length,
        algorithm: 'simple_average',
        trendDirection: this.calculateTrendDirection(durations),
      },
    };

    logger.debug('Task duration predicted', {
      agentId: agentId.id,
      taskType,
      predictedDuration: prediction.predictedDuration,
      confidence: prediction.confidence,
    });

    return prediction;
  }

  /**
   * Generic predict method (wrapper for predictTaskDuration)
   */
  async predict(request: PredictionRequest): Promise<TaskPrediction> {
    // Convert string agentId to AgentId object and use default task type
    const agentId: AgentId = {
      id: request.agentId || 'unknown',
      swarmId: request.swarmId || 'default',
      type: 'coordinator',
      instance: 1,
    };
    return await this.predictTaskDuration(
      agentId,
      'general-task',
      request.context
    );
  }

  /**
   * Update learning from task completion records
   */
  updateLearning(records: TaskCompletionRecord[]): void {
    for (const record of records) {
      this.recordTaskCompletion(
        record.agentId,
        record.taskType,
        record.duration,
        record.success,
        record.metadata
      );
    }
    logger.info(`Updated learning with ${records.length} records`);
  }

  /**
   * Clear prediction cache and historical data
   */
  clearCache(olderThanMs?: number): void {
    if (olderThanMs) {
      const cutoff = Date.now() - olderThanMs;

      // Clear old history
      for (const [key, history] of this.taskHistory.entries()) {
        const filtered = history.filter((record) => record.timestamp > cutoff);
        if (filtered.length === 0) {
          this.taskHistory.delete(key);
        } else {
          this.taskHistory.set(key, filtered);
        }
      }
    } else {
      this.taskHistory.clear();
    }

    logger.info('Prediction cache cleared', { olderThanMs });
  }

  /**
   * Create fallback prediction when insufficient data is available
   */
  private createFallbackPrediction(
    agentId: string,
    taskType: string
  ): TaskPrediction {
    return {
      agentId,
      taskType,
      predictedDuration: this.config.maxPredictionTime / 2, // Conservative estimate
      confidence: 0.3, // Low confidence
      factors: [
        {
          name: 'Fallback Prediction',
          impact: 1.0,
          confidence: 0.3,
          description: 'Insufficient historical data for reliable prediction',
        },
      ],
      lastUpdated: new Date(),
      metadata: {
        sampleSize: 0,
        algorithm: 'fallback',
        trendDirection: 'stable',
      },
    };
  }

  /**
   * Calculate performance trend direction
   */
  private calculateTrendDirection(
    durations: number[]
  ): 'improving' | 'stable' | 'declining' {
    if (durations.length < 3) return 'stable';

    const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
    const secondHalf = durations.slice(Math.floor(durations.length / 2));

    const firstAvg = this.calculateMean(firstHalf);
    const secondAvg = this.calculateMean(secondHalf);

    const improvement = (firstAvg - secondAvg) / firstAvg;

    if (improvement > 0.1) return 'improving'; // Times getting shorter = improving
    if (improvement < -0.1) return 'declining'; // Times getting longer = declining
    return 'stable';
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = this.calculateMean(numbers);
    const squaredDiffs = numbers.map((n) => (n - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  /**
   * Calculate mean of an array of numbers
   */
  private calculateMean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

/**
 * Factory function to create Task Predictor with default configuration
 */
export function createTaskPredictor(
  config?: Partial<TaskPredictorConfig>
): TaskPredictor {
  return new SimpleTaskPredictor(config);
}

/**
 * Utility function to validate prediction confidence
 */
export function isHighConfidencePrediction(
  prediction: TaskPrediction,
  threshold = 0.8
): boolean {
  return prediction.confidence >= threshold;
}

/**
 * Utility function to get prediction summary
 */
export function getPredictionSummary(prediction: TaskPrediction): string {
  const duration = (prediction.predictedDuration / 1000).toFixed(1);
  const confidence = (prediction.confidence * 100).toFixed(0);
  return `${duration}s (${confidence}% confidence)`;
}
