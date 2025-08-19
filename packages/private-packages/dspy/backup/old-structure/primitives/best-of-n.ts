/**
 * @fileoverview BestOfN DSPy Module
 * 
 * Implementation of Best-of-N selection pattern that runs a module multiple times
 * with different temperatures and selects the best result based on a reward function.
 * Based on Stanford DSPy's BestOfN implementation.
 * 
 * Key Features:
 * - Multiple attempt execution with temperature variation
 * - Reward function-based selection
 * - Early stopping on threshold achievement
 * - Configurable failure tolerance
 * - Automatic temperature scheduling
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import type { PredictionResult } from './predictor.js';
import type { TraceStep } from '../interfaces/types.js';

/**
 * Reward function type for BestOfN
 */
export type RewardFunction = (
  inputs: Record<string, any>,
  prediction: PredictionResult
) => number;

/**
 * Configuration for BestOfN module
 */
export interface BestOfNConfig {
  /** Number of attempts to make (default: 3) */
  N?: number;
  /** Reward function to evaluate predictions */
  rewardFn: RewardFunction;
  /** Threshold for early stopping */
  threshold: number;
  /** Maximum allowed failures before giving up (default: N) */
  failCount?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom temperature schedule */
  temperatureSchedule?: number[];
}

/**
 * Result from BestOfN execution
 */
export interface BestOfNResult extends PredictionResult {
  /** Best reward achieved */
  bestReward: number;
  /** Number of attempts made */
  attemptsCount: number;
  /** All rewards from attempts */
  allRewards: number[];
  /** Temperature used for best result */
  bestTemperature: number;
}

/**
 * BestOfN Module
 * 
 * Runs a module multiple times with different temperatures and returns the
 * prediction with the highest reward score, or the first prediction that
 * exceeds the threshold.
 * 
 * Algorithm:
 * 1. Generate temperature schedule
 * 2. For each temperature:
 *    - Create module copy with new temperature
 *    - Execute and get prediction
 *    - Evaluate with reward function
 *    - Track best result
 *    - Early stop if threshold reached
 * 3. Return best prediction
 * 
 * @example
 * ```typescript
 * import { BestOfN, ChainOfThought } from './primitives';
 * 
 * // Create base module
 * const qa = new ChainOfThought({
 *   inputs: { question: 'string' },
 *   outputs: { answer: 'string' }
 * });
 * 
 * // Define reward function for one-word answers
 * const oneWordReward = (inputs: any, pred: any) => {
 *   return pred.answer.split(' ').length === 1 ? 1.0 : 0.0;
 * };
 * 
 * // Create BestOfN wrapper
 * const bestOfN = new BestOfN(qa, {
 *   N: 3,
 *   rewardFn: oneWordReward,
 *   threshold: 1.0
 * });
 * 
 * const result = await bestOfN.forward({ question: "What is the capital of Belgium?" });
 * console.log(result.answer); // "Brussels"
 * console.log(result.bestReward); // 1.0
 * ```
 */
export class BestOfN extends BaseModule {
  private module: BaseModule;
  private rewardFn: RewardFunction;
  private threshold: number;
  private N: number;
  private failCount: number;
  private verbose: boolean;
  private temperatureSchedule?: number[];

  /**
   * Initialize BestOfN module
   * 
   * @param module - Base module to execute multiple times
   * @param config - Configuration options
   */
  constructor(module: BaseModule, config: BestOfNConfig) {
    super();

    this.module = module;
    this.rewardFn = config.rewardFn;
    this.threshold = config.threshold;
    this.N = config.N || 3;
    this.failCount = config.failCount || this.N;
    this.verbose = config.verbose || false;
    this.temperatureSchedule = config.temperatureSchedule;

    // Add parameters
    this.addParameter('module', this.module, false);
    this.addParameter('N', this.N, true);
    this.addParameter('threshold', this.threshold, true);
    this.addParameter('failCount', this.failCount, true);
  }

  /**
   * Forward pass - execute best-of-N selection
   * 
   * @param inputs - Input arguments for the module
   * @returns Best prediction result with metadata
   */
  async forward(inputs: Record<string, any>): Promise<BestOfNResult> {
    // Generate temperature schedule
    const temperatures = this.generateTemperatureSchedule();
    
    let bestPred: PredictionResult | null = null;
    let bestTrace: TraceStep[] = [];
    let bestReward = -Infinity;
    let bestTemperature = temperatures[0];
    let attemptsCount = 0;
    const allRewards: number[] = [];
    let remainingFailures = this.failCount;

    if (this.verbose) {
      console.log(`🎯 BestOfN: Starting ${this.N} attempts with threshold ${this.threshold}`);
      console.log(`🌡️ Temperature schedule: [${temperatures.map(t => t.toFixed(2)).join(', ')}]`);
    }

    for (let idx = 0; idx < temperatures.length; idx++) {
      const temperature = temperatures[idx];
      
      try {
        attemptsCount++;
        
        // Create module copy with new temperature
        const moduleCopy = this.module.deepcopy();
        if (moduleCopy._lm) {
          // Update temperature in language model
          (moduleCopy._lm as any).temperature = temperature;
        }

        // Execute module and capture trace
        const startTime = Date.now();
        const prediction = await moduleCopy.aforward(inputs);
        const endTime = Date.now();

        // Create trace entry
        const trace: TraceStep[] = [{
          predictor: moduleCopy,
          inputs,
          outputs: prediction,
          timestamp: startTime,
          latency: endTime - startTime
        }];

        // Evaluate with reward function
        const reward = this.rewardFn(inputs, prediction);
        allRewards.push(reward);

        if (this.verbose) {
          console.log(`🔄 Attempt ${idx + 1}/${this.N}: T=${temperature.toFixed(2)}, Reward=${reward.toFixed(3)}`);
        }

        // Update best if this is better
        if (reward > bestReward) {
          bestReward = reward;
          bestPred = prediction;
          bestTrace = trace;
          bestTemperature = temperature;

          if (this.verbose) {
            console.log(`⭐ New best! Reward: ${reward.toFixed(3)}`);
          }
        }

        // Early stopping if threshold reached
        if (reward >= this.threshold) {
          if (this.verbose) {
            console.log(`🎯 Threshold ${this.threshold} reached! Early stopping.`);
          }
          break;
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (this.verbose) {
          console.warn(`❌ Attempt ${idx + 1} failed with T=${temperature.toFixed(2)}: ${errorMsg}`);
        }

        remainingFailures--;
        allRewards.push(-Infinity);

        // Check if we've exceeded failure limit
        if (remainingFailures <= 0) {
          throw new Error(`BestOfN: Exceeded failure limit (${this.failCount} failures)`);
        }
      }
    }

    if (!bestPred) {
      throw new Error('BestOfN: No successful predictions obtained');
    }

    if (this.verbose) {
      console.log(`✅ BestOfN completed: ${attemptsCount} attempts, best reward: ${bestReward.toFixed(3)}`);
    }

    // Update trace history
    this.history.push(...bestTrace);

    // Return enhanced result
    return {
      ...bestPred,
      bestReward,
      attemptsCount,
      allRewards,
      bestTemperature
    };
  }

  /**
   * Synchronous forward pass
   */
  forwardSync(inputs: Record<string, any>): BestOfNResult {
    // Note: This is a simplified sync version
    throw new Error('Synchronous BestOfN execution not supported due to async nature of module execution');
  }

  /**
   * Generate temperature schedule for attempts
   */
  private generateTemperatureSchedule(): number[] {
    if (this.temperatureSchedule) {
      return this.temperatureSchedule.slice(0, this.N);
    }

    const temperatures: number[] = [];
    
    // Start with current LM temperature if available
    const currentTemp = this._lm ? (this._lm as any).temperature || 0.7 : 0.7;
    temperatures.push(currentTemp);

    // Generate ascending temperature schedule
    for (let i = 0; i < this.N - 1; i++) {
      const temp = 0.5 + (i * 0.5) / this.N;
      temperatures.push(temp);
    }

    // Remove duplicates and limit to N
    const uniqueTemps = Array.from(new Set(temperatures.map(t => Math.round(t * 100) / 100)));
    return uniqueTemps.slice(0, this.N);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<BestOfNConfig>): void {
    if (updates.N !== undefined) {
      this.N = updates.N;
      this.updateParameter('N', this.N);
    }
    
    if (updates.threshold !== undefined) {
      this.threshold = updates.threshold;
      this.updateParameter('threshold', this.threshold);
    }
    
    if (updates.failCount !== undefined) {
      this.failCount = updates.failCount;
      this.updateParameter('failCount', this.failCount);
    }
    
    if (updates.rewardFn !== undefined) {
      this.rewardFn = updates.rewardFn;
    }
    
    if (updates.verbose !== undefined) {
      this.verbose = updates.verbose;
    }

    if (updates.temperatureSchedule !== undefined) {
      this.temperatureSchedule = updates.temperatureSchedule;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): BestOfNConfig {
    return {
      N: this.N,
      rewardFn: this.rewardFn,
      threshold: this.threshold,
      failCount: this.failCount,
      verbose: this.verbose,
      temperatureSchedule: this.temperatureSchedule
    };
  }

  /**
   * Create deep copy
   */
  deepcopy(): BestOfN {
    const copy = new BestOfN(this.module.deepcopy(), {
      N: this.N,
      rewardFn: this.rewardFn,
      threshold: this.threshold,
      failCount: this.failCount,
      verbose: this.verbose,
      temperatureSchedule: this.temperatureSchedule ? [...this.temperatureSchedule] : undefined
    });
    
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Common reward functions for BestOfN
 */
export const RewardFunctions = {
  /**
   * Reward for one-word answers
   */
  oneWordAnswer: (inputs: any, pred: any): number => {
    const answer = pred.answer || '';
    return answer.split(/\s+/).filter(w => w.length > 0).length === 1 ? 1.0 : 0.0;
  },

  /**
   * Reward for short answers (under N words)
   */
  shortAnswer: (maxWords: number) => (inputs: any, pred: any): number => {
    const answer = pred.answer || '';
    const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
    return wordCount <= maxWords ? 1.0 : Math.max(0, 1.0 - (wordCount - maxWords) * 0.1);
  },

  /**
   * Reward for numeric answers
   */
  numericAnswer: (inputs: any, pred: any): number => {
    const answer = pred.answer || '';
    const isNumeric = /^-?\d*\.?\d+$/.test(answer.trim());
    return isNumeric ? 1.0 : 0.0;
  },

  /**
   * Reward for answers containing specific keywords
   */
  containsKeywords: (keywords: string[]) => (inputs: any, pred: any): number => {
    const answer = (pred.answer || '').toLowerCase();
    const matches = keywords.filter(keyword => 
      answer.includes(keyword.toLowerCase())
    ).length;
    return matches / keywords.length;
  },

  /**
   * Reward for answers with specific length range
   */
  lengthRange: (minLength: number, maxLength: number) => (inputs: any, pred: any): number => {
    const answer = pred.answer || '';
    const length = answer.length;
    
    if (length >= minLength && length <= maxLength) {
      return 1.0;
    } else if (length < minLength) {
      return Math.max(0, length / minLength);
    } else {
      return Math.max(0, 1.0 - (length - maxLength) / maxLength);
    }
  },

  /**
   * Reward based on confidence (if available)
   */
  confidence: (inputs: any, pred: any): number => {
    return pred.confidence || 0.5;
  }
};

/**
 * Factory function to create BestOfN module
 */
export function createBestOfN(
  module: BaseModule,
  config: BestOfNConfig
): BestOfN {
  return new BestOfN(module, config);
}

/**
 * Default export
 */
export default BestOfN;