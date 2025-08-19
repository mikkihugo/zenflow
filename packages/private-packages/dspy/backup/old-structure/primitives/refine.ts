/**
 * @fileoverview Refine DSPy Module
 * 
 * Implementation of iterative refinement that runs a module multiple times
 * with different temperatures and automatically generates feedback to improve
 * future predictions. Based on Stanford DSPy's Refine implementation.
 * 
 * Key Features:
 * - Multiple attempt execution with temperature variation
 * - Automatic feedback generation for underperforming modules
 * - Reward function-based selection with threshold
 * - Module introspection and advice generation
 * - Hint injection for subsequent attempts
 * - Configurable failure tolerance
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import { Predictor } from './predictor.js';
import type { Signature } from './signature.js';
import type { PredictionResult } from './predictor.js';
import type { TraceStep } from '../interfaces/types.js';

/**
 * Reward function type for Refine
 */
export type RefineRewardFunction = (
  inputs: Record<string, any>,
  prediction: PredictionResult
) => number;

/**
 * Configuration for Refine module
 */
export interface RefineConfig {
  /** Number of attempts to make (default: 3) */
  N?: number;
  /** Reward function to evaluate predictions */
  rewardFn: RefineRewardFunction;
  /** Threshold for early stopping */
  threshold: number;
  /** Maximum allowed failures before giving up (default: N) */
  failCount?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom temperature schedule */
  temperatureSchedule?: number[];
  /** Enable feedback generation (default: true) */
  enableFeedback?: boolean;
}

/**
 * Result from Refine execution
 */
export interface RefineResult extends PredictionResult {
  /** Best reward achieved */
  bestReward: number;
  /** Number of attempts made */
  attemptsCount: number;
  /** All rewards from attempts */
  allRewards: number[];
  /** Temperature used for best result */
  bestTemperature: number;
  /** Feedback generated (if any) */
  feedback?: Record<string, string>;
  /** Full trajectory of execution */
  fullTrajectory: TraceStep[];
}

/**
 * Signature for feedback generation
 */
const OFFER_FEEDBACK_SIGNATURE: Signature = {
  inputs: {
    program_code: 'string',
    modules_defn: 'string', 
    program_inputs: 'string',
    program_trajectory: 'string',
    program_outputs: 'string',
    reward_code: 'string',
    target_threshold: 'number',
    reward_value: 'number',
    module_names: 'array'
  },
  outputs: {
    discussion: 'string',
    advice: 'object'
  },
  instruction: `In the discussion, assign blame to each module that contributed to the final reward being below the threshold, if any. Then, prescribe concrete advice of how the module should act on its future input when we retry the process, if it were to receive the same or similar inputs. If a module is not to blame, the advice should be N/A.
The module will not see its own history, so it needs to rely on entirely concrete and actionable advice from you to avoid the same mistake on the same or similar inputs.`
};

/**
 * Refine Module - Iterative Refinement with Feedback
 * 
 * Runs a module multiple times with different temperatures and automatically
 * generates feedback to improve future predictions.
 * 
 * Algorithm:
 * 1. Generate temperature schedule
 * 2. For each temperature:
 *    - Create module copy with new temperature
 *    - Execute with optional feedback hints
 *    - Evaluate with reward function
 *    - Track best result
 *    - Generate feedback if below threshold
 *    - Early stop if threshold reached
 * 3. Return best prediction with feedback
 * 
 * @example
 * ```typescript
 * import { Refine, ChainOfThought } from './primitives';
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
 * // Create Refine wrapper
 * const refine = new Refine(qa, {
 *   N: 3,
 *   rewardFn: oneWordReward,
 *   threshold: 1.0
 * });
 * 
 * const result = await refine.forward({ question: "What is the capital of Belgium?" });
 * console.log(result.answer);       // "Brussels"
 * console.log(result.bestReward);   // 1.0
 * console.log(result.feedback);     // Feedback for improvement
 * ```
 */
export class Refine extends BaseModule {
  private module: BaseModule;
  private rewardFn: RefineRewardFunction;
  private threshold: number;
  private N: number;
  private failCount: number;
  private verbose: boolean;
  private temperatureSchedule?: number[];
  private enableFeedback: boolean;
  private feedbackPredictor: Predictor;
  private moduleCode: string;
  private rewardFnCode: string;

  /**
   * Initialize Refine module
   * 
   * @param module - Base module to refine
   * @param config - Configuration options
   */
  constructor(module: BaseModule, config: RefineConfig) {
    super();

    this.module = module;
    this.rewardFn = config.rewardFn;
    this.threshold = config.threshold;
    this.N = config.N || 3;
    this.failCount = config.failCount || this.N;
    this.verbose = config.verbose || false;
    this.temperatureSchedule = config.temperatureSchedule;
    this.enableFeedback = config.enableFeedback ?? true;

    // Create feedback predictor
    this.feedbackPredictor = new Predictor(OFFER_FEEDBACK_SIGNATURE);

    // Extract module and reward function code (simplified for TypeScript)
    this.moduleCode = this.extractModuleCode(module);
    this.rewardFnCode = this.extractRewardFnCode(config.rewardFn);

    // Add parameters
    this.addParameter('module', this.module, false);
    this.addParameter('N', this.N, true);
    this.addParameter('threshold', this.threshold, true);
    this.addParameter('failCount', this.failCount, true);
    this.addParameter('enableFeedback', this.enableFeedback, true);
  }

  /**
   * Forward pass - execute iterative refinement
   * 
   * @param inputs - Input arguments for the module
   * @returns Refine result with best prediction and feedback
   */
  async forward(inputs: Record<string, any>): Promise<RefineResult> {
    // Generate temperature schedule
    const temperatures = this.generateTemperatureSchedule();
    
    let bestPred: PredictionResult | null = null;
    let bestTrace: TraceStep[] = [];
    let bestReward = -Infinity;
    let bestTemperature = temperatures[0];
    let attemptsCount = 0;
    const allRewards: number[] = [];
    let remainingFailures = this.failCount;
    const fullTrajectory: TraceStep[] = [];
    let advice: Record<string, string> | null = null;

    if (this.verbose) {
      console.log(`🔄 Refine: Starting ${this.N} refinement attempts with threshold ${this.threshold}`);
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

        // Prepare inputs with optional advice
        let enhancedInputs = { ...inputs };
        if (advice && this.enableFeedback) {
          // Add hints to inputs (simplified implementation)
          enhancedInputs = {
            ...inputs,
            hint_: this.formatAdviceHints(advice)
          };

          if (this.verbose) {
            console.log(`💡 Applying feedback hints for attempt ${idx + 1}`);
          }
        }

        // Execute module and capture trace
        const startTime = Date.now();
        const prediction = await moduleCopy.aforward(enhancedInputs);
        const endTime = Date.now();

        // Create trace entry
        const trace: TraceStep[] = [{
          predictor: moduleCopy,
          inputs: enhancedInputs,
          outputs: prediction,
          timestamp: startTime,
          latency: endTime - startTime
        }];

        fullTrajectory.push(...trace);

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

        // Generate feedback if below threshold and not the last attempt
        if (idx < temperatures.length - 1 && this.enableFeedback) {
          try {
            advice = await this.generateFeedback(
              moduleCopy,
              inputs,
              prediction,
              reward,
              trace
            );

            if (this.verbose && advice) {
              console.log(`🤔 Generated feedback for next attempt`);
            }
          } catch (feedbackError) {
            if (this.verbose) {
              console.warn(`⚠️ Failed to generate feedback: ${feedbackError instanceof Error ? feedbackError.message : feedbackError}`);
            }
          }
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
          throw new Error(`Refine: Exceeded failure limit (${this.failCount} failures)`);
        }
      }
    }

    if (!bestPred) {
      throw new Error('Refine: No successful predictions obtained');
    }

    if (this.verbose) {
      console.log(`✅ Refine completed: ${attemptsCount} attempts, best reward: ${bestReward.toFixed(3)}`);
    }

    // Update trace history
    this.history.push(...bestTrace);

    // Return enhanced result
    return {
      ...bestPred,
      bestReward,
      attemptsCount,
      allRewards,
      bestTemperature,
      feedback: advice || undefined,
      fullTrajectory
    };
  }

  /**
   * Synchronous forward pass
   */
  forwardSync(inputs: Record<string, any>): RefineResult {
    throw new Error('Synchronous Refine execution not supported due to async nature of module execution and feedback generation');
  }

  /**
   * Generate feedback for improving performance
   */
  private async generateFeedback(
    module: BaseModule,
    inputs: Record<string, any>,
    outputs: PredictionResult,
    reward: number,
    trace: TraceStep[]
  ): Promise<Record<string, string> | null> {
    try {
      // Extract module information
      const moduleNames = this.extractModuleNames(module);
      const modulesDefn = this.inspectModules(module);
      
      // Format trajectory
      const trajectory = trace.map((step, index) => ({
        module_name: `module_${index}`,
        inputs: step.inputs,
        outputs: step.outputs
      }));

      // Prepare feedback inputs
      const feedbackInputs = {
        program_code: this.moduleCode,
        modules_defn: modulesDefn,
        program_inputs: JSON.stringify(inputs, null, 2),
        program_trajectory: JSON.stringify(trajectory, null, 2),
        program_outputs: JSON.stringify(outputs, null, 2),
        reward_code: this.rewardFnCode,
        target_threshold: this.threshold,
        reward_value: reward,
        module_names: moduleNames
      };

      // Generate feedback
      const feedbackResult = await this.feedbackPredictor.aforward(feedbackInputs);
      
      return feedbackResult.advice as Record<string, string>;

    } catch (error) {
      if (this.verbose) {
        console.warn(`⚠️ Feedback generation failed: ${error instanceof Error ? error.message : error}`);
      }
      return null;
    }
  }

  /**
   * Format advice hints for input
   */
  private formatAdviceHints(advice: Record<string, string>): string {
    const hints: string[] = [];
    
    for (const [moduleName, hint] of Object.entries(advice)) {
      if (hint && hint !== 'N/A') {
        hints.push(`${moduleName}: ${hint}`);
      }
    }

    return hints.length > 0 ? hints.join('\n') : 'No specific advice available.';
  }

  /**
   * Extract module names (simplified)
   */
  private extractModuleNames(module: BaseModule): string[] {
    // In a full implementation, this would extract actual module names
    return ['main_module'];
  }

  /**
   * Inspect modules for feedback generation
   */
  private inspectModules(module: BaseModule): string {
    const separator = '-'.repeat(80);
    const output: string[] = [separator];

    // Simplified module inspection
    output.push('Module main_module');
    output.push('\tInput Fields: Various input fields');
    output.push('\tOutput Fields: Various output fields');
    output.push('\tOriginal Instructions: Process inputs and generate outputs');
    output.push(separator);

    return output.join('\n');
  }

  /**
   * Extract module code (simplified for TypeScript)
   */
  private extractModuleCode(module: BaseModule): string {
    return `class ${module.constructor.name} extends BaseModule {
  // Module implementation
  async forward(inputs) {
    // Processing logic
    return results;
  }
}`;
  }

  /**
   * Extract reward function code (simplified)
   */
  private extractRewardFnCode(rewardFn: RefineRewardFunction): string {
    return `function rewardFn(inputs, prediction) {
  // Reward calculation logic
  return ${rewardFn.toString()};
}`;
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
  updateConfig(updates: Partial<RefineConfig>): void {
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
      this.rewardFnCode = this.extractRewardFnCode(updates.rewardFn);
    }
    
    if (updates.verbose !== undefined) {
      this.verbose = updates.verbose;
    }

    if (updates.temperatureSchedule !== undefined) {
      this.temperatureSchedule = updates.temperatureSchedule;
    }

    if (updates.enableFeedback !== undefined) {
      this.enableFeedback = updates.enableFeedback;
      this.updateParameter('enableFeedback', this.enableFeedback);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RefineConfig {
    return {
      N: this.N,
      rewardFn: this.rewardFn,
      threshold: this.threshold,
      failCount: this.failCount,
      verbose: this.verbose,
      temperatureSchedule: this.temperatureSchedule,
      enableFeedback: this.enableFeedback
    };
  }

  /**
   * Create deep copy
   */
  deepcopy(): Refine {
    const copy = new Refine(this.module.deepcopy(), {
      N: this.N,
      rewardFn: this.rewardFn,
      threshold: this.threshold,
      failCount: this.failCount,
      verbose: this.verbose,
      temperatureSchedule: this.temperatureSchedule ? [...this.temperatureSchedule] : undefined,
      enableFeedback: this.enableFeedback
    });
    
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Common reward functions for Refine
 */
export const RefineRewardFunctions = {
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
   * Reward based on answer length range
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
  },

  /**
   * Combined reward function
   */
  combined: (rewardFns: RefineRewardFunction[], weights?: number[]) => 
    (inputs: any, pred: any): number => {
      const scores = rewardFns.map(fn => fn(inputs, pred));
      const w = weights || new Array(rewardFns.length).fill(1);
      const weightedSum = scores.reduce((sum, score, i) => sum + score * w[i], 0);
      const totalWeight = w.reduce((sum, weight) => sum + weight, 0);
      return weightedSum / totalWeight;
    }
};

/**
 * Factory function to create Refine module
 */
export function createRefine(
  module: BaseModule,
  config: RefineConfig
): Refine {
  return new Refine(module, config);
}

/**
 * Default export
 */
export default Refine;