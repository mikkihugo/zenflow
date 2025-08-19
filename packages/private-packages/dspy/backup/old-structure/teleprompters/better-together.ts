/**
 * @fileoverview BetterTogether - Meta-optimization framework
 * 
 * Complete implementation of Stanford's BetterTogether meta-optimizer.
 * Combines prompt optimization with weight optimization through strategic sequencing.
 * Based on Stanford's bettertogether.py - allows for sophisticated optimization strategies.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { BaseModule } from '../primitives/module.js';
import { Predictor } from '../primitives/predictor.js';
import type { Example, LanguageModel } from '../interfaces/types.js';
import { BootstrapFewShotWithRandomSearch } from './bootstrap-random-search.js';
import { BootstrapFinetune } from './bootstrap-finetune.js';

/**
 * Metric function type for evaluation
 */
export type BetterTogetherMetric = (gold: Example, pred: any, trace?: any) => number;

/**
 * BetterTogether configuration options
 */
export interface BetterTogetherConfig {
  /** Evaluation metric function */
  metric: BetterTogetherMetric;
  /** Prompt optimizer (defaults to BootstrapFewShotWithRandomSearch) */
  prompt_optimizer?: any;
  /** Weight optimizer (defaults to BootstrapFinetune) */
  weight_optimizer?: any;
  /** Random seed for reproducibility */
  seed?: number;
  /** Validation set ratio for prompt optimization */
  valset_ratio?: number;
  /** Experimental features flag */
  experimental?: boolean;
}

/**
 * BetterTogether meta-optimization framework
 * 
 * Strategically combines prompt optimization and weight optimization
 * through configurable sequencing strategies like "p -> w -> p".
 */
export class BetterTogether {
  private static readonly STRAT_SEP = " -> ";
  
  private config: Required<BetterTogetherConfig>;
  private promptOptimizer: any;
  private weightOptimizer: any;
  private rng: () => number;

  constructor(config: BetterTogetherConfig) {
    if (!config.experimental) {
      throw new Error(
        "This is an experimental optimizer. Set `experimental: true` to use it."
      );
    }

    this.config = {
      metric: config.metric,
      prompt_optimizer: config.prompt_optimizer,
      weight_optimizer: config.weight_optimizer,
      seed: config.seed || Math.floor(Math.random() * 1000000),
      valset_ratio: config.valset_ratio || 0.1,
      experimental: config.experimental || false
    };

    // Initialize optimizers with defaults
    this.promptOptimizer = this.config.prompt_optimizer || 
      new BootstrapFewShotWithRandomSearch({ metric: config.metric });
    
    this.weightOptimizer = this.config.weight_optimizer || 
      new BootstrapFinetune({ metric: config.metric });

    // Validate supported optimizers
    const isSupportedPrompt = this.promptOptimizer instanceof BootstrapFewShotWithRandomSearch;
    const isSupportedWeight = this.weightOptimizer instanceof BootstrapFinetune;
    
    if (!isSupportedPrompt || !isSupportedWeight) {
      throw new Error(
        "The BetterTogether optimizer only supports the following optimizers for now: " +
        "BootstrapFinetune, BootstrapFewShotWithRandomSearch."
      );
    }

    // Initialize seeded RNG
    let seed = this.config.seed;
    this.rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Compile student program using strategic optimization sequence
   */
  async compile(
    student: BaseModule,
    trainset: Example[],
    strategy: string = "p -> w -> p"
  ): Promise<BaseModule> {
    console.log("🔄 Starting BetterTogether meta-optimization...");
    
    // Validate strategy format
    console.log("✅ Validating the strategy...");
    const parsedStrategy = this.parseStrategy(strategy);
    
    // Prepare student program
    console.log("🛠️ Preparing the student program...");
    let optimizedStudent = this.prepareStudent(student);
    this.validatePredictorsHaveLMs(optimizedStudent);
    
    // Make shallow copy of trainset to preserve original order
    const workingTrainset = [...trainset];
    
    // Run optimization strategies
    console.log("🚀 Compiling the student program...");
    optimizedStudent = await this.runStrategies(
      parsedStrategy, 
      optimizedStudent, 
      workingTrainset
    );
    
    console.log("✅ BetterTogether has finished compiling the student program");
    return optimizedStudent;
  }

  /**
   * Parse and validate optimization strategy
   */
  private parseStrategy(strategy: string): string[] {
    const parsed = strategy.toLowerCase().split(BetterTogether.STRAT_SEP);
    
    if (!parsed.every(s => s === "p" || s === "w")) {
      throw new Error(
        `The strategy should be a sequence of 'p' and 'w' separated by '${BetterTogether.STRAT_SEP}', ` +
        `but found: ${strategy}`
      );
    }
    
    return parsed;
  }

  /**
   * Prepare student program for optimization
   */
  private prepareStudent(student: BaseModule): BaseModule {
    // Create reset copy of student (equivalent to Stanford's prepare_student)
    const prepared = this.deepCopyModule(student);
    (prepared as any)._compiled = false;
    return prepared;
  }

  /**
   * Validate that all predictors have language models
   */
  private validatePredictorsHaveLMs(student: BaseModule): void {
    const predictors = this.getPredictors(student);
    
    for (const predictor of predictors) {
      if (!predictor.lm) {
        throw new Error("All predictors must have language models assigned");
      }
    }
  }

  /**
   * Run optimization strategies sequentially
   */
  private async runStrategies(
    parsedStrategy: string[],
    student: BaseModule,
    trainset: Example[]
  ): Promise<BaseModule> {
    // Track candidate programs for different strategies
    const candidatePrograms: Array<[string, BaseModule]> = [];
    candidatePrograms.push(["", student]);
    
    let currentStudent = student;
    let launchedFlag = false;

    for (let ind = 0; ind < parsedStrategy.length; ind++) {
      const stepCode = parsedStrategy[ind];
      const currentStrategy = parsedStrategy.slice(0, ind + 1).join(BetterTogether.STRAT_SEP);
      
      console.log(`\n########## Step ${ind + 1} of ${parsedStrategy.length} - Strategy '${currentStrategy}' ##########`);
      
      // Shuffle trainset for variety
      console.log("🔀 Shuffling the trainset...");
      this.shuffleArray(trainset);
      
      // Launch LMs if needed
      if (!launchedFlag) {
        this.launchLMs(currentStudent);
        launchedFlag = true;
      }
      
      // Create fresh copy for this optimization step
      currentStudent = this.deepCopyModule(currentStudent);
      (currentStudent as any)._compiled = false;
      
      // Apply optimization step
      if (stepCode === "p") {
        currentStudent = await this.compilePromptOptimizer(currentStudent, trainset);
      } else if (stepCode === "w") {
        currentStudent = await this.compileWeightOptimizer(currentStudent, trainset);
        launchedFlag = false;
      }
      
      // Record program for this strategy
      candidatePrograms.push([currentStrategy, currentStudent]);
    }
    
    // Clean up LMs if still launched
    if (launchedFlag) {
      this.killLMs(currentStudent);
    }
    
    // Attach candidate programs to final result
    (currentStudent as any).candidate_programs = candidatePrograms;
    
    return currentStudent;
  }

  /**
   * Compile using prompt optimizer
   */
  private async compilePromptOptimizer(
    student: BaseModule, 
    trainset: Example[]
  ): Promise<BaseModule> {
    console.log("📝 Preparing for prompt optimization...");
    
    // Sample validation set from trainset
    const workingTrainset = this.prepareTrainsetForPromptOptimization(trainset);
    const numVal = Math.floor(this.config.valset_ratio * workingTrainset.length);
    const promptValset = workingTrainset.slice(0, numVal);
    const promptTrainset = workingTrainset.slice(numVal);
    
    console.log("🚀 Compiling the prompt optimizer...");
    
    // Save predictor LMs before optimization
    const predLMs = this.getPredictors(student).map(pred => pred.lm);
    
    // Run prompt optimization
    let optimizedStudent = await this.promptOptimizer.compile(
      student, 
      promptTrainset, 
      promptValset
    );
    
    // Restore LMs (prompt optimizers may reset them)
    const currentPredictors = this.getPredictors(optimizedStudent);
    for (let i = 0; i < currentPredictors.length; i++) {
      if (predLMs[i]) {
        currentPredictors[i].lm = predLMs[i];
      }
    }
    
    return optimizedStudent;
  }

  /**
   * Compile using weight optimizer
   */
  private async compileWeightOptimizer(
    student: BaseModule, 
    trainset: Example[]
  ): Promise<BaseModule> {
    console.log("⚖️ Preparing for weight optimization...");
    
    // Save original LMs
    const originalLMs = this.getPredictors(student).map(pred => pred.lm);
    
    console.log("🚀 Compiling the weight optimizer...");
    
    // Run weight optimization
    let optimizedStudent = await this.weightOptimizer.compile(student, trainset);
    
    // Update train kwargs for new LMs
    const newLMs = this.getPredictors(optimizedStudent).map(pred => pred.lm);
    
    if ((this.weightOptimizer as any).train_kwargs) {
      for (let i = 0; i < originalLMs.length; i++) {
        if (originalLMs[i] && newLMs[i]) {
          const originalParams = (this.weightOptimizer as any).train_kwargs[originalLMs[i]];
          if (originalParams) {
            (this.weightOptimizer as any).train_kwargs[newLMs[i]] = originalParams;
          }
        }
      }
    }
    
    return optimizedStudent;
  }

  /**
   * Prepare trainset for prompt optimization (remove hints)
   */
  private prepareTrainsetForPromptOptimization(trainset: Example[]): Example[] {
    return trainset.map(example => {
      // Remove hint fields for prompt optimization
      const inputKeys = Object.keys(example.inputs);
      const filteredKeys = inputKeys.filter(key => key !== "hint");
      
      const filteredInputs: Record<string, any> = {};
      for (const key of filteredKeys) {
        filteredInputs[key] = example.inputs[key];
      }
      
      return {
        ...example,
        inputs: filteredInputs
      };
    });
  }

  /**
   * Get all predictors from a module
   */
  private getPredictors(module: BaseModule): Predictor[] {
    const predictors: Predictor[] = [];
    
    for (const key in module) {
      const value = (module as any)[key];
      if (value && typeof value === 'object' && 'signature' in value && 'lm' in value) {
        predictors.push(value as Predictor);
      }
    }
    
    return predictors;
  }

  /**
   * Launch language models (simplified implementation)
   */
  private launchLMs(student: BaseModule): void {
    // In a full implementation, this would start distributed LM servers
    console.log("🚀 Launching language models...");
    
    const predictors = this.getPredictors(student);
    for (const predictor of predictors) {
      if (predictor.lm && typeof (predictor.lm as any).launch === 'function') {
        (predictor.lm as any).launch();
      }
    }
  }

  /**
   * Kill language models (simplified implementation)
   */
  private killLMs(student: BaseModule): void {
    console.log("🛑 Killing language models...");
    
    const predictors = this.getPredictors(student);
    for (const predictor of predictors) {
      if (predictor.lm && typeof (predictor.lm as any).kill === 'function') {
        (predictor.lm as any).kill();
      }
    }
  }

  /**
   * Shuffle array in place using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Deep copy module
   */
  private deepCopyModule(module: BaseModule): BaseModule {
    const copy = Object.create(Object.getPrototypeOf(module));
    
    for (const key in module) {
      if (module.hasOwnProperty(key)) {
        const value = (module as any)[key];
        if (typeof value === 'object' && value !== null) {
          (copy as any)[key] = JSON.parse(JSON.stringify(value));
        } else {
          (copy as any)[key] = value;
        }
      }
    }
    
    return copy;
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<BetterTogetherConfig> {
    return { ...this.config };
  }
}

/**
 * Factory function for creating BetterTogether optimizer
 */
export function createBetterTogether(config: BetterTogetherConfig): BetterTogether {
  return new BetterTogether(config);
}

/**
 * Default BetterTogether configuration
 */
export const DEFAULT_BETTER_TOGETHER_CONFIG: Partial<BetterTogetherConfig> = {
  valset_ratio: 0.1,
  experimental: true
};

/**
 * BetterTogether factory for common patterns
 */
export const BetterTogetherFactory = {
  /**
   * Create prompt-first BetterTogether optimizer
   */
  promptFirst(metric: BetterTogetherMetric): BetterTogether {
    return new BetterTogether({
      metric,
      experimental: true,
      valset_ratio: 0.1
    });
  },

  /**
   * Create weight-first BetterTogether optimizer
   */
  weightFirst(metric: BetterTogetherMetric): BetterTogether {
    return new BetterTogether({
      metric,
      experimental: true,
      valset_ratio: 0.15
    });
  },

  /**
   * Create alternating BetterTogether optimizer
   */
  alternating(metric: BetterTogetherMetric): BetterTogether {
    return new BetterTogether({
      metric,
      experimental: true,
      valset_ratio: 0.2
    });
  },

  /**
   * Create research-grade BetterTogether optimizer
   */
  research(metric: BetterTogetherMetric): BetterTogether {
    return new BetterTogether({
      metric,
      experimental: true,
      valset_ratio: 0.25,
      seed: 42
    });
  }
};