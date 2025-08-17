/**
 * @fileoverview Avatar Optimizer - Tool-using agent optimization framework
 * 
 * Complete implementation of Stanford's AvatarOptimizer for tool-using agents.
 * Optimizes agent instructions based on performance feedback from positive and negative examples.
 * Based on Stanford's avatar_optimizer.py - sophisticated multi-threaded evaluation and feedback.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { BaseModule } from '../primitives/module.js';
import { Prediction } from '../primitives/prediction.js';
import type { Example, LanguageModel } from '../interfaces/types.js';
import { ChainOfThought } from '../primitives/chain-of-thought.js';
import { Predict } from '../primitives/predict.js';

/**
 * Evaluation result with actions
 */
export interface EvalResult {
  example: Record<string, any>;
  score: number;
  actions?: any[] | null;
}

/**
 * Action output from Avatar execution
 */
export interface ActionOutput {
  action: string;
  input: any;
  output: any;
  success: boolean;
}

/**
 * Avatar actor interface
 */
export interface AvatarActor extends BaseModule {
  signature: {
    instructions: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
  tools: any[];
}

/**
 * Avatar module interface
 */
export interface AvatarModule extends BaseModule {
  actor: AvatarActor;
  actor_clone: AvatarActor;
  tools: any[];
}

/**
 * Comparator signature for analyzing positive vs negative examples
 */
const ComparatorSignature = {
  name: "Comparator",
  description: `After executing the given actions on user inputs using the given instruction, some inputs have yielded good results, while others have not. I'll provide you the inputs along with their corresponding evaluation metrics:

Task:
(1) Firstly, identify and contrast the patterns of inputs that have achieved good results with those that have not.
(2) Then, review the computational logic for any inconsistencies in the previous actions.
(3) Lastly, specify the modification in tools used that can lead to improved performance on the negative inputs.`,
  inputs: {
    instruction: {
      type: "string",
      description: "Instruction for the actor to execute the task"
    },
    actions: {
      type: "array",
      description: "Actions actor can take to complete the task"
    },
    pos_input_with_metrics: {
      type: "array",
      description: "Positive inputs along with their score on a evaluation metric and actions taken"
    },
    neg_input_with_metrics: {
      type: "array", 
      description: "Negative inputs along with their score on a evaluation metric and actions taken"
    }
  },
  outputs: {
    feedback: {
      type: "string",
      description: "Feedback for the actor to improve the performance of negative inputs"
    }
  }
};

/**
 * Feedback-based instruction generation signature
 */
const FeedbackBasedInstructionSignature = {
  name: "FeedbackBasedInstruction",
  description: `There is a task that needs to be completed for which one can use multiple tools to achieve the desired outcome. A group's performance was evaluated on a dataset of inputs, the inputs that did well are positive inputs, and the inputs that did not do well are negative inputs.

You received feedback on how they can better use the tools to improve your performance on the negative inputs. You have been provided with the previous instruction, that they followed to use tools to complete the task, and the feedback on your performance.

Your task is to incorporate the feedback and generate a detailed instruction for the group to follow to improve their performance on the task.

Make sure that the new instruction talks about how to use the tools effectively and should be no more than 3 paragraphs long. The previous instruction contains general guidelines that you must retain in the new instruction.`,
  inputs: {
    previous_instruction: {
      type: "string", 
      description: "Previous instruction for the actor to execute the task"
    },
    feedback: {
      type: "string",
      description: "Feedback for the actor to improve the performance of negative inputs"
    }
  },
  outputs: {
    new_instruction: {
      type: "string",
      description: "New instruction for the actor to execute the task"
    }
  }
};

/**
 * Avatar optimizer configuration
 */
export interface AvatarOptimizerConfig {
  /** Evaluation metric function */
  metric: (example: Example, prediction: any) => number;
  /** Maximum optimization iterations */
  max_iters?: number;
  /** Lower bound for negative examples */
  lower_bound?: number;
  /** Upper bound for positive examples */ 
  upper_bound?: number;
  /** Maximum positive examples to use */
  max_positive_inputs?: number;
  /** Maximum negative examples to use */
  max_negative_inputs?: number;
  /** Optimization direction */
  optimize_for?: 'max' | 'min';
  /** Number of threads for evaluation */
  num_threads?: number;
}

/**
 * AvatarOptimizer for tool-using agent optimization
 * 
 * Optimizes agent instructions by analyzing performance patterns
 * between positive and negative examples through feedback generation.
 */
export class AvatarOptimizer {
  private static readonly DEFAULT_MAX_EXAMPLES = 10;
  
  private config: Required<AvatarOptimizerConfig>;
  private comparator: any;
  private feedbackInstruction: any;

  constructor(config: AvatarOptimizerConfig) {
    if (!config.metric) {
      throw new Error("`metric` argument cannot be None. Please provide a metric function.");
    }

    this.config = {
      metric: config.metric,
      max_iters: config.max_iters || 10,
      lower_bound: config.lower_bound || 0,
      upper_bound: config.upper_bound || 1,
      max_positive_inputs: config.max_positive_inputs || AvatarOptimizer.DEFAULT_MAX_EXAMPLES,
      max_negative_inputs: config.max_negative_inputs || AvatarOptimizer.DEFAULT_MAX_EXAMPLES,
      optimize_for: config.optimize_for || 'max',
      num_threads: config.num_threads || 4
    };

    // Initialize predictors for feedback generation
    this.comparator = new ChainOfThought(ComparatorSignature);
    this.feedbackInstruction = new Predict(FeedbackBasedInstructionSignature);
  }

  /**
   * Compile Avatar module with optimized instructions
   */
  async compile(student: AvatarModule, trainset: Example[]): Promise<AvatarModule> {
    console.log("🤖 Starting Avatar optimization...");
    
    let bestActor = this.deepCopyActor(student);
    let bestScore = this.config.optimize_for === 'max' ? -999 : 999;

    for (let i = 0; i < this.config.max_iters; i++) {
      console.log("=".repeat(20));
      console.log(`Iteration ${i + 1}/${this.config.max_iters}`);

      // Get positive and negative evaluation results
      const { score, posInputs, negInputs } = await this.getPosNegResults(bestActor, trainset);
      
      console.log(`Positive examples: ${posInputs.length}`);
      console.log(`Negative examples: ${negInputs.length}`);
      console.log(`Sampling ${this.config.max_positive_inputs} positive examples and ${this.config.max_negative_inputs} negative examples`);

      // Sample examples if too many
      const sampledPosInputs = posInputs.length > this.config.max_positive_inputs
        ? this.sampleArray(posInputs, this.config.max_positive_inputs)
        : posInputs;
        
      const sampledNegInputs = negInputs.length > this.config.max_negative_inputs
        ? this.sampleArray(negInputs, this.config.max_negative_inputs)
        : negInputs;

      // Generate feedback using comparator
      const feedback = await this.comparator.forward({
        instruction: bestActor.actor.signature.instructions,
        actions: bestActor.tools.map(tool => String(tool)),
        pos_input_with_metrics: sampledPosInputs,
        neg_input_with_metrics: sampledNegInputs
      });

      // Generate new instruction based on feedback
      const newInstructionResult = await this.feedbackInstruction.forward({
        previous_instruction: bestActor.actor.signature.instructions,
        feedback: feedback.feedback
      });

      const newInstruction = newInstructionResult.new_instruction;
      console.log(`Generated new instruction: ${newInstruction}`);

      // Update best actor if score improved
      const shouldUpdate = (this.config.optimize_for === 'max' && bestScore < score) ||
                          (this.config.optimize_for === 'min' && bestScore > score);
      
      if (shouldUpdate) {
        bestActor.actor.signature = {
          ...bestActor.actor.signature,
          instructions: newInstruction
        };
        bestActor.actor_clone = this.deepCopyActor(bestActor).actor;
        bestScore = score;
      }
    }

    console.log(`Best Actor optimized with score: ${bestScore}`);
    return bestActor;
  }

  /**
   * Get positive and negative evaluation results
   */
  private async getPosNegResults(
    actor: AvatarModule,
    trainset: Example[]
  ): Promise<{
    score: number;
    posInputs: EvalResult[];
    negInputs: EvalResult[];
  }> {
    const posInputs: EvalResult[] = [];
    const negInputs: EvalResult[] = [];

    const { avgScore, results } = await this.threadSafeEvaluator(trainset, actor, true);
    console.log(`Average Score: ${avgScore}`);

    for (const { example, prediction, score } of results) {
      const evalResult: EvalResult = {
        example: example.inputs,
        score,
        actions: prediction?.actions || null
      };

      if (score >= this.config.upper_bound) {
        posInputs.push(evalResult);
      } else if (score <= this.config.lower_bound) {
        negInputs.push(evalResult);
      }
    }

    if (posInputs.length === 0) {
      throw new Error("No positive examples found, try lowering the upper_bound or providing more training data");
    }
    if (negInputs.length === 0) {
      throw new Error("No negative examples found, try raising the lower_bound or providing more training data");
    }

    return { score: avgScore, posInputs, negInputs };
  }

  /**
   * Thread-safe evaluator with parallel processing
   */
  private async threadSafeEvaluator(
    devset: Example[],
    actor: AvatarModule,
    returnOutputs: boolean = false
  ): Promise<{
    avgScore: number;
    results: Array<{ example: Example; prediction: any; score: number }>;
  }> {
    const totalExamples = devset.length;
    const results: Array<{ example: Example; prediction: any; score: number }> = [];
    let totalScore = 0;

    // Process examples in parallel batches
    const batchSize = Math.max(1, Math.floor(totalExamples / this.config.num_threads));
    const batches: Example[][] = [];
    
    for (let i = 0; i < totalExamples; i += batchSize) {
      batches.push(devset.slice(i, i + batchSize));
    }

    // Process batches in parallel
    const batchPromises = batches.map(batch => this.processBatch(batch, actor));
    const batchResults = await Promise.all(batchPromises);

    // Combine results
    for (const batchResult of batchResults) {
      for (const result of batchResult) {
        totalScore += result.score;
        if (returnOutputs) {
          results.push(result);
        }
      }
    }

    const avgScore = totalScore / totalExamples;
    return { avgScore, results };
  }

  /**
   * Process a batch of examples
   */
  private async processBatch(
    batch: Example[],
    actor: AvatarModule
  ): Promise<Array<{ example: Example; prediction: any; score: number }>> {
    const results: Array<{ example: Example; prediction: any; score: number }> = [];

    for (const example of batch) {
      const result = await this.processExample(actor, example, true);
      results.push(result);
    }

    return results;
  }

  /**
   * Process single example
   */
  private async processExample(
    actor: AvatarModule,
    example: Example,
    returnOutputs: boolean
  ): Promise<{ example: Example; prediction: any; score: number }> {
    try {
      // Create isolated copy of actor
      const actorCopy = this.deepCopyActor(actor);
      
      // Execute actor on example inputs
      const prediction = await actorCopy.forward(example.inputs);
      
      // Evaluate with metric
      const score = this.config.metric(example, prediction);
      
      return { example, prediction, score };
    } catch (error) {
      console.error("Error processing example:", error);
      
      return {
        example,
        prediction: null,
        score: 0
      };
    }
  }

  /**
   * Sample array randomly
   */
  private sampleArray<T>(array: T[], n: number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  /**
   * Deep copy actor module
   */
  private deepCopyActor(actor: AvatarModule): AvatarModule {
    return JSON.parse(JSON.stringify(actor));
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<AvatarOptimizerConfig> {
    return { ...this.config };
  }
}

/**
 * Factory function for creating AvatarOptimizer
 */
export function createAvatarOptimizer(config: AvatarOptimizerConfig): AvatarOptimizer {
  return new AvatarOptimizer(config);
}

/**
 * Default AvatarOptimizer configuration
 */
export const DEFAULT_AVATAR_OPTIMIZER_CONFIG: Partial<AvatarOptimizerConfig> = {
  max_iters: 10,
  lower_bound: 0,
  upper_bound: 1,
  max_positive_inputs: 10,
  max_negative_inputs: 10,
  optimize_for: 'max',
  num_threads: 4
};

/**
 * AvatarOptimizer factory for common patterns
 */
export const AvatarOptimizerFactory = {
  /**
   * Create fast Avatar optimizer
   */
  fast(metric: (example: Example, prediction: any) => number): AvatarOptimizer {
    return new AvatarOptimizer({
      metric,
      max_iters: 5,
      num_threads: 2,
      max_positive_inputs: 5,
      max_negative_inputs: 5
    });
  },

  /**
   * Create balanced Avatar optimizer
   */
  balanced(metric: (example: Example, prediction: any) => number): AvatarOptimizer {
    return new AvatarOptimizer({
      metric,
      max_iters: 10,
      num_threads: 4,
      max_positive_inputs: 10,
      max_negative_inputs: 10
    });
  },

  /**
   * Create thorough Avatar optimizer
   */
  thorough(metric: (example: Example, prediction: any) => number): AvatarOptimizer {
    return new AvatarOptimizer({
      metric,
      max_iters: 20,
      num_threads: 8,
      max_positive_inputs: 20,
      max_negative_inputs: 20
    });
  },

  /**
   * Create research-grade Avatar optimizer
   */
  research(metric: (example: Example, prediction: any) => number): AvatarOptimizer {
    return new AvatarOptimizer({
      metric,
      max_iters: 50,
      num_threads: 16,
      max_positive_inputs: 50,
      max_negative_inputs: 50,
      lower_bound: 0.1,
      upper_bound: 0.9
    });
  }
};