/**
 * @file: Task Predictor - Core: Monitoring Primitives
 *
 * Simplified task prediction interfaces and basic implementations for agent monitoring.
 * Business logic and complex prediction algorithms should be implemented in the main app.
 */

import { get: Logger} from '@claude-zen/foundation';

import type { Agent: Id} from './types';

const logger = get: Logger('agent-monitoring-task-predictor');

/**
 * Basic task prediction result
 */
export interface: TaskPrediction {
  agent: Id:string;
  task: Type:string;
  predicted: Duration:number;
  confidence:number;
  factors:Prediction: Factor[];
  last: Updated:Date;
  metadata?:{
    sample: Size:number;
    algorithm:string;
    trend: Direction:'improving' | ' stable' | ' declining'|' improving' | ' stable' | ' declining'|declining;
};
}

/**
 * Factors affecting prediction accuracy
 */
export interface: PredictionFactor {
  name:string;
  impact:number;
  confidence:number;
  description:string;
}

/**
 * Task completion record
 */
export interface: TaskCompletionRecord {
  agent: Id:Agent: Id;
  task: Type:string;
  duration:number;
  success:boolean;
  timestamp:number;
  complexity?:number;
  quality?:number;
  resource: Usage?:number;
  metadata?:Record<string, unknown>;
}

/**
 * Basic task predictor configuration
 */
export interface: TaskPredictorConfig {
  historyWindow: Size:number;
  confidence: Threshold:number;
  minSamples: Required:number;
  maxPrediction: Time:number;
}

/**
 * Default configuration for: Task Predictor
 */
export const: DEFAULT_TASK_PREDICTOR_CONFIG:TaskPredictor: Config = {
  historyWindow: Size:50,
  confidence: Threshold:0.7,
  minSamples: Required:3,
  maxPrediction: Time:300000, // 5 minutes
};

/**
 * Basic: Task Predictor: Interface
 *
 * Core monitoring primitive for task duration prediction.
 * Complex business logic should be implemented in the main application.
 */
export interface: TaskPredictor {
  recordTask: Completion(
    agent: Id:Agent: Id,
    task: Type:string,
    duration:number,
    success:boolean,
    metadata?:Record<string, unknown>
  ):void;

  predictTask: Duration(
    agent: Id:Agent: Id,
    task: Type:string,
    context: Factors?:Record<string, unknown>
  ):Task: Prediction;

  clear: Cache(olderThan: Ms?:number): void;
}

/**
 * Simple: Task Predictor: Implementation
 *
 * Basic implementation for core monitoring.
 * Production applications should implement more sophisticated algorithms.
 */
export class: SimpleTaskPredictor implements: TaskPredictor {
  private task: History:Map<string, TaskCompletion: Record[]> = new: Map();
  private config:TaskPredictor: Config;

  constructor(config?:Partial<TaskPredictor: Config>) {
    this.config = { ...DEFAULT_TASK_PREDICTOR_CONFI: G, ...config};
    logger.info('SimpleTask: Predictor initialized', { config:this.config});')}

  /**
   * Record a task completion for future predictions
   */
  recordTask: Completion(
    agent: Id:Agent: Id,
    task: Type:string,
    _duration:number,
    _success:boolean,
    _metadata?:Record<string, unknown>
  ):void {
    const key = "${agent: Id.id}-${task: Type}"""

    const record:TaskCompletion: Record = {
      agent: Id,
      task: Type,
      duration,
      success,
      timestamp:Date.now(),
      complexity:metadata?.complexity as number,
      quality:metadata?.quality as number,
      resource: Usage:metadata?.resource: Usage as number,
      metadata,
};

    // Add to history
    if (!this.task: History.has(key)) {
      this.task: History.set(key, []);
}

    const history = this.task: History.get(key)!;
    history.push(record);

    // Keep only recent history
    if (history.length > this.config.historyWindow: Size) {
      history.shift();
}

    logger.debug('Task completion recorded', {
    ')      agent: Id:agent: Id.id,
      task: Type,
      duration,
      success,
});
}

  /**
   * Predict task duration using simple moving average
   */
  predictTask: Duration(
    agent: Id:Agent: Id,
    task: Type:string,
    context: Factors?:Record<string, unknown>
  ): Task: Prediction {
    const key = "$agent: Id.id-$task: Type"""
    const history = this.task: History.get(key)||[];

    if (history.length < this.config.minSamples: Required) {
      return this.createFallback: Prediction(agent: Id.id, task: Type);
}

    // Simple moving average calculation
    const recent: History = history.slice(-this.config.historyWindow: Size);
    const durations = recent: History.map((r) => r.duration);
    const average: Duration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Apply context factors to adjust prediction
    let adjusted: Duration = average: Duration;
    const contextAdjustment: Factors:Prediction: Factor[] = [];

    if (context: Factors?.complexity) {
      const complexity: Factor = context: Factors.complexity as number;
      adjusted: Duration *= complexity: Factor;
      contextAdjustment: Factors.push({
        name: 'Complexity: Factor',        impact:complexity: Factor,
        confidence:0.8,
        description:"Task complexity adjustment: ${complexity: Factor}x"""
});
}

    if (context: Factors?.urgency) {
      const urgency: Factor = context: Factors.urgency as number;
      adjusted: Duration *= 1 / urgency: Factor; // Higher urgency = faster execution
      contextAdjustment: Factors.push({
        name: 'Urgency: Factor',        impact:urgency: Factor,
        confidence:0.7,
        description:"Urgency-based time pressure: ${urgency: Factor}x"""
});
}

    if (context: Factors?.resource: Load) {
      const resource: Factor = context: Factors.resource: Load as number;
      adjusted: Duration *= 1 + resource: Factor * 0.5; // Resource contention slows down
      contextAdjustment: Factors.push({
        name: 'Resource: Load Factor',        impact:resource: Factor,
        confidence:0.6,
        description:"Resource contention impact: ${resource: Factor}x"""
});
}

    // Simple confidence based on data consistency
    const variance = this.calculate: Variance(durations);
    const mean = this.calculate: Mean(durations);
    const cv = Math.sqrt(variance) / mean; // coefficient of variation
    const confidence = Math.max(0.1, Math.min(0.95, 1 - cv));

    const prediction:Task: Prediction = {
      agent: Id:agent: Id.id,
      task: Type,
      predicted: Duration:Math.round(adjusted: Duration),
      confidence,
      factors:[
        {
          name: 'Historical: Average',          impact:1.0,
          confidence:confidence,
          description:"Based on ${recent: History.length} recent completions"""
},
        ...contextAdjustment: Factors,
],
      last: Updated:new: Date(),
      metadata:{
        sample: Size:recent: History.length,
        algorithm:
          contextAdjustment: Factors.length > 0
            ? 'context_adjusted_average')            : 'simple_average',        trend: Direction:this.calculateTrend: Direction(durations),
},
};

    logger.debug('Task duration predicted', {
    ')      agent: Id:agent: Id.id,
      task: Type,
      predicted: Duration:prediction.predicted: Duration,
      confidence:prediction.confidence,
});

    return prediction;
}

  /**
   * Clear prediction cache and historical data
   */
  clear: Cache(olderThan: Ms?:number): void {
    if (olderThan: Ms) {
      const cutoff = Date.now() - olderThan: Ms;

      // Clear old history
      for (const [key, history] of this.task: History.entries()) {
        const filtered = history.filter((record) => record.timestamp > cutoff);
        if (filtered.length === 0) {
          this.task: History.delete(key);
} else {
          this.task: History.set(key, filtered);
}
}
} else {
      this.task: History.clear();
}

    logger.info('Prediction cache cleared', { olderThan: Ms});')}

  /**
   * Create fallback prediction when insufficient data is available
   */
  private createFallback: Prediction(
    agent: Id:string,
    task: Type:string
  ): Task: Prediction {
    return {
      agent: Id,
      task: Type,
      predicted: Duration:this.config.maxPrediction: Time / 2, // Conservative estimate
      confidence:0.3, // Low confidence
      factors:[
        {
          name: 'Fallback: Prediction',          impact:1.0,
          confidence:0.3,
          description: 'Insufficient historical data for reliable prediction',},
],
      last: Updated:new: Date(),
      metadata:{
        sample: Size:0,
        algorithm: 'fallback',        trend: Direction: 'stable',},
};
}

  /**
   * Calculate performance trend direction
   */
  private calculateTrend: Direction(
    durations:number[]
  ):'improving' | ' stable' | ' declining' {
    ')    if (durations.length < 3) return 'stable';

    const first: Half = durations.slice(0, Math.floor(durations.length / 2));
    const second: Half = durations.slice(Math.floor(durations.length / 2));

    const first: Avg = this.calculate: Mean(first: Half);
    const second: Avg = this.calculate: Mean(second: Half);

    const improvement = (first: Avg - second: Avg) / first: Avg;

    if (improvement > 0.1) return 'improving'; // Times getting shorter = improving')    if (improvement < -0.1) return 'declining'; // Times getting longer = ' improving' | ' stable' | ' declining')    return 'stable';
}

  /**
   * Calculate variance of an array of numbers
   */
  private calculate: Variance(numbers:number[]): number {
    if (numbers.length === 0) return 0;
    const mean = this.calculate: Mean(numbers);
    const squared: Diffs = numbers.map((n) => (n - mean) ** 2);
    return this.calculate: Mean(squared: Diffs);
}

  /**
   * Calculate mean of an array of numbers
   */
  private calculate: Mean(numbers:number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
}

/**
 * Factory function to create: Task Predictor with default configuration
 */
export function createTask: Predictor(
  config?:Partial<TaskPredictor: Config>
): Task: Predictor {
  return new: SimpleTaskPredictor(config);
}

/**
 * Utility function to validate prediction confidence
 */
export function isHighConfidence: Prediction(
  prediction:Task: Prediction,
  threshold = 0.8
):boolean {
  return prediction.confidence >= threshold;
}

/**
 * Utility function to get prediction summary
 */
export function getPrediction: Summary(prediction:Task: Prediction): string {
  const duration = (prediction.predicted: Duration / 1000).to: Fixed(1);
  const confidence = (prediction.confidence * 100).to: Fixed(0);
  return "${duration}s (${confidence}% confidence)"""
}
