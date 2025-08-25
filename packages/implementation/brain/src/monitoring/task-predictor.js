/**
 * @file Task Predictor - Core Monitoring Primitives
 *
 * Simplified task prediction interfaces and basic implementations for agent monitoring.
 * Business logic and complex prediction algorithms should be implemented in the main app.
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('agent-monitoring-task-predictor');
/**
 * Default configuration for Task Predictor
 */
export const DEFAULT_TASK_PREDICTOR_CONFIG = {
  historyWindowSize: 50,
  confidenceThreshold: 0.7,
  minSamplesRequired: 3,
  maxPredictionTime: 300000, // 5 minutes
};
/**
 * Simple Task Predictor Implementation
 *
 * Basic implementation for core monitoring.
 * Production applications should implement more sophisticated algorithms.
 */
export class SimpleTaskPredictor {
  taskHistory = new Map();
  config;
  constructor(config) {
    this.config = { ...DEFAULT_TASK_PREDICTOR_CONFIG, ...config };
    logger.info('SimpleTaskPredictor initialized', { config: this.config });
  }
  /**
   * Record a task completion for future predictions
   */
  recordTaskCompletion(agentId, taskType, duration, success, metadata) {
    const key = `${agentId.id}-${taskType}`;
    const record = {
      agentId,
      taskType,
      duration,
      success,
      timestamp: Date.now(),
      complexity: metadata?.complexity,
      quality: metadata?.quality,
      resourceUsage: metadata?.resourceUsage,
      metadata,
    };
    // Add to history
    if (!this.taskHistory.has(key)) {
      this.taskHistory.set(key, []);
    }
    const history = this.taskHistory.get(key);
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
  predictTaskDuration(agentId, taskType, contextFactors) {
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
    // Apply context factors to adjust prediction
    let adjustedDuration = averageDuration;
    const contextAdjustmentFactors = [];
    if (contextFactors?.complexity) {
      const complexityFactor = contextFactors.complexity;
      adjustedDuration *= complexityFactor;
      contextAdjustmentFactors.push({
        name: 'Complexity Factor',
        impact: complexityFactor,
        confidence: 0.8,
        description: `Task complexity adjustment: ${complexityFactor}x`,
      });
    }
    if (contextFactors?.urgency) {
      const urgencyFactor = contextFactors.urgency;
      adjustedDuration *= 1 / urgencyFactor; // Higher urgency = faster execution
      contextAdjustmentFactors.push({
        name: 'Urgency Factor',
        impact: urgencyFactor,
        confidence: 0.7,
        description: `Urgency-based time pressure: ${urgencyFactor}x`,
      });
    }
    if (contextFactors?.resourceLoad) {
      const resourceFactor = contextFactors.resourceLoad;
      adjustedDuration *= 1 + resourceFactor * 0.5; // Resource contention slows down
      contextAdjustmentFactors.push({
        name: 'Resource Load Factor',
        impact: resourceFactor,
        confidence: 0.6,
        description: `Resource contention impact: ${resourceFactor}x`,
      });
    }
    // Simple confidence based on data consistency
    const variance = this.calculateVariance(durations);
    const mean = this.calculateMean(durations);
    const cv = Math.sqrt(variance) / mean; // coefficient of variation
    const confidence = Math.max(0.1, Math.min(0.95, 1 - cv));
    const prediction = {
      agentId: agentId.id,
      taskType,
      predictedDuration: Math.round(adjustedDuration),
      confidence,
      factors: [
        {
          name: 'Historical Average',
          impact: 1.0,
          confidence: confidence,
          description: `Based on ${recentHistory.length} recent completions`,
        },
        ...contextAdjustmentFactors,
      ],
      lastUpdated: new Date(),
      metadata: {
        sampleSize: recentHistory.length,
        algorithm:
          contextAdjustmentFactors.length > 0
            ? 'context_adjusted_average'
            : 'simple_average',
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
   * Clear prediction cache and historical data
   */
  clearCache(olderThanMs) {
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
  createFallbackPrediction(agentId, taskType) {
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
  calculateTrendDirection(durations) {
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
  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = this.calculateMean(numbers);
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return this.calculateMean(squaredDiffs);
  }
  /**
   * Calculate mean of an array of numbers
   */
  calculateMean(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}
/**
 * Factory function to create Task Predictor with default configuration
 */
export function createTaskPredictor(config) {
  return new SimpleTaskPredictor(config);
}
/**
 * Utility function to validate prediction confidence
 */
export function isHighConfidencePrediction(prediction, threshold = 0.8) {
  return prediction.confidence >= threshold;
}
/**
 * Utility function to get prediction summary
 */
export function getPredictionSummary(prediction) {
  const duration = (prediction.predictedDuration / 1000).toFixed(1);
  const confidence = (prediction.confidence * 100).toFixed(0);
  return `${duration}s (${confidence}% confidence)`;
}
//# sourceMappingURL=task-predictor.js.map
