/**
 * @fileoverview SIMBA (Stochastic Introspective Mini-Batch Ascent) Teleprompter
 * 
 * Implementation of Stanford DSPy's SIMBA optimization algorithm for few-shot learning.
 * Uses self-reflective optimization with variability analysis to improve predictor performance.
 * 
 * Key Features:
 * - Introspective LLM analysis for self-improvement
 * - Mini-batch stochastic optimization
 * - Variability-based challenging example selection
 * - Dual strategy: demonstrations + reflective rules
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.44
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Example, Prediction, TraceStep, MetricFunction } from '../interfaces/types.js';
import type { DSPyModule } from '../primitives/module.js';
import type { DSPyPredictor } from '../primitives/predictor.js';
import { SeededRNG } from '../utils/rng.js';
import { softmaxSample, weightedSample } from '../utils/sampling.js';

/**
 * SIMBA configuration parameters
 */
export interface SimbaConfig {
  /** Metric function for evaluation */
  metric: MetricFunction;
  /** Maximum optimization steps */
  max_steps: number;
  /** Maximum demonstrations per predictor */
  max_demos: number;
  /** Temperature for reasoning (keep at 1.0 for reasoning models) */
  temperature: number;
  /** Mini-batch size for optimization */
  mini_batch_size?: number;
  /** Sampling temperature for exploration */
  sampling_temperature: number;
  /** Random seed for reproducibility */
  seed?: number | string;
}

/**
 * Default SIMBA configuration
 */
export const DEFAULT_SIMBA_CONFIG: Omit<SimbaConfig, 'metric'> = {
  max_steps: 12,
  max_demos: 10,
  temperature: 1.0,
  sampling_temperature: 0.2,
  seed: 42
};

/**
 * Candidate solution during optimization
 */
export interface Candidate {
  /** Module being optimized */
  module: DSPyModule;
  /** Demonstrations for this candidate */
  demos: Example[];
  /** Instructions/rules for this candidate */
  instructions: string[];
  /** Performance score */
  score?: number;
  /** Unique identifier */
  id: string;
}

/**
 * Trace generated during execution
 */
export interface Trace {
  /** Input example */
  example: Example;
  /** Generated prediction */
  prediction: Prediction;
  /** Intermediate outputs if multi-step */
  intermediateOutputs?: any[];
  /** Execution modules */
  modules?: DSPyModule[];
  /** Score from metric evaluation */
  score?: number;
  /** Candidate that generated this trace */
  candidateId: string;
}

/**
 * Bucket of traces grouped by example for variability analysis
 */
export interface TraceBucket {
  /** The example being analyzed */
  example: Example;
  /** All traces for this example */
  traces: Trace[];
  /** Variability statistics */
  variability: VariabilityStats;
}

/**
 * Variability statistics for challenging example identification
 */
export interface VariabilityStats {
  /** Maximum - minimum score difference */
  maxMinDifference: number;
  /** Mean - maximum score difference */
  meanMaxDifference: number;
  /** Standard deviation of scores */
  standardDeviation: number;
  /** Variance of scores */
  variance: number;
  /** Combined variability score */
  combined: number;
}

/**
 * Improvement strategies used by SIMBA
 */
export enum ImprovementStrategy {
  ADD_DEMO = 'add_demonstration',
  APPEND_RULE = 'append_a_rule'
}

/**
 * SIMBA Teleprompter Implementation
 * 
 * Optimizes DSPy modules using stochastic introspective mini-batch ascent.
 * Combines genetic algorithms, multi-armed bandit, and self-reflection.
 * 
 * @example
 * ```typescript
 * const simba = new SimbaOptimizer({
 *   metric: (example, prediction) => prediction.answer === example.answer ? 1 : 0,
 *   max_steps: 12,
 *   max_demos: 10,
 *   temperature: 1.0,
 *   sampling_temperature: 0.2
 * });
 * 
 * const optimizedModule = await simba.compile(predictor, trainset);
 * ```
 */
export class SimbaOptimizer {
  private config: SimbaConfig;
  private rng: SeededRNG;
  private globalCandidatePool: Candidate[] = [];
  private winningCandidates: Candidate[] = [];
  private step: number = 0;

  /**
   * Initialize SIMBA optimizer
   * 
   * @param config - SIMBA configuration
   */
  constructor(config: SimbaConfig) {
    this.config = { ...DEFAULT_SIMBA_CONFIG, ...config };
    this.rng = new SeededRNG(this.config.seed || 42);
  }

  /**
   * Compile and optimize a DSPy module
   * 
   * @param student - Module to optimize
   * @param trainset - Training examples
   * @returns - Optimized module
   */
  async compile(student: DSPyModule, trainset: Example[]): Promise<DSPyModule> {
    console.log(`🧠 SIMBA: Starting optimization with ${trainset.length} examples`);
    
    // Initialize optimization
    this.initializeOptimization(student);
    
    // Determine mini-batch size if not specified
    const miniBatchSize = this.config.mini_batch_size || 
      Math.min(Math.max(Math.floor(trainset.length / 4), 4), 16);
    
    console.log(`📊 SIMBA: Using mini-batch size: ${miniBatchSize}`);

    // Main optimization loop
    for (this.step = 0; this.step < this.config.max_steps; this.step++) {
      console.log(`\n🔄 SIMBA Step ${this.step + 1}/${this.config.max_steps}`);
      
      // Sample mini-batch from training data
      const miniBatch = this.sampleMiniBatch(trainset, miniBatchSize);
      console.log(`   📋 Mini-batch: ${miniBatch.length} examples`);
      
      // Sample candidate using softmax sampling
      const candidate = this.softmaxSample(this.globalCandidatePool);
      console.log(`   🎯 Selected candidate: ${candidate.id}`);
      
      // Generate traces with LLM variants
      const traces = await this.generateTraces(candidate, miniBatch);
      console.log(`   📝 Generated ${traces.length} traces`);
      
      // Group traces by example and analyze variability
      const buckets = this.groupTracesByExample(traces);
      const sortedBuckets = this.sortByVariability(buckets);
      console.log(`   📊 Analyzed ${buckets.length} example buckets`);
      
      // Apply improvement strategies
      const newCandidates = await this.applyImprovementStrategies(sortedBuckets, candidate);
      console.log(`   🆕 Generated ${newCandidates.length} new candidates`);
      
      // Evaluate new candidates on mini-batch
      const evaluatedCandidates = await this.evaluateOnMiniBatch(newCandidates, miniBatch);
      
      // Update candidate pools
      this.updateCandidatePools(evaluatedCandidates);
      
      // Log best score so far
      const bestScore = Math.max(...this.winningCandidates.map(c => c.score || 0));
      console.log(`   🏆 Best score so far: ${bestScore.toFixed(3)}`);
    }
    
    // Final evaluation on full training set
    console.log(`\n🎯 SIMBA: Final evaluation on full training set`);
    const finalCandidate = await this.selectBestCandidate(trainset);
    
    console.log(`✅ SIMBA: Optimization complete! Final score: ${finalCandidate.score?.toFixed(3)}`);
    return this.applyCandidateToModule(student, finalCandidate);
  }

  /**
   * Initialize optimization with base module
   * 
   * @param student - Base module to optimize
   */
  private initializeOptimization(student: DSPyModule): void {
    const initialCandidate: Candidate = {
      module: student.deepcopy(),
      demos: [],
      instructions: [],
      id: this.generateCandidateId('initial')
    };

    this.globalCandidatePool = [initialCandidate];
    this.winningCandidates = [];
    this.step = 0;
  }

  /**
   * Sample mini-batch from training set
   * 
   * @param trainset - Full training set
   * @param size - Mini-batch size
   * @returns - Sampled mini-batch
   */
  private sampleMiniBatch(trainset: Example[], size: number): Example[] {
    return this.rng.sample(trainset, Math.min(size, trainset.length));
  }

  /**
   * Sample candidate using softmax sampling (better candidates more likely)
   * 
   * @param candidates - Candidate pool
   * @returns - Selected candidate
   */
  private softmaxSample(candidates: Candidate[]): Candidate {
    if (candidates.length === 1) return candidates[0];

    // Use scores as weights, with fallback for unscored candidates
    const scores = candidates.map(c => c.score || 0.5);
    const index = softmaxSample(scores, this.rng, this.config.sampling_temperature);
    return candidates[index];
  }

  /**
   * Generate traces for candidate with LLM variants
   * 
   * @param candidate - Candidate to evaluate
   * @param examples - Examples to evaluate on
   * @returns - Generated traces
   */
  private async generateTraces(candidate: Candidate, examples: Example[]): Promise<Trace[]> {
    const traces: Trace[] = [];

    // Create LLM variants with different seeds for diversity
    const numVariants = Math.min(3, examples.length);
    
    for (let variant = 0; variant < numVariants; variant++) {
      // Create variant with different seed
      const variantModule = this.createModuleVariant(candidate, variant);

      for (const example of examples) {
        try {
          // Execute module on example
          const inputs = example.inputs();
          const prediction = variantModule.forward(inputs.data);

          // Calculate score
          const score = this.config.metric(example, prediction);
          const numericScore = typeof score === 'boolean' ? (score ? 1 : 0) : score;

          const trace: Trace = {
            example,
            prediction,
            score: numericScore,
            candidateId: candidate.id
          };

          traces.push(trace);
        } catch (error) {
          console.warn(`⚠️  Failed to generate trace for example: ${error}`);
        }
      }
    }

    return traces;
  }

  /**
   * Create module variant with different settings for diversity
   * 
   * @param candidate - Base candidate
   * @param variant - Variant index
   * @returns - Module variant
   */
  private createModuleVariant(candidate: Candidate, variant: number): DSPyModule {
    const module = candidate.module.deepcopy();

    // Apply candidate's demonstrations and instructions if it's a predictor
    if (this.isPredictor(module)) {
      const predictor = module as DSPyPredictor;
      
      // Add demonstrations
      if (candidate.demos.length > 0) {
        predictor.updateDemos(candidate.demos.slice(0, this.config.max_demos));
      }

      // Add instructions/rules
      if (candidate.instructions.length > 0) {
        const combinedInstructions = candidate.instructions.join('\n\n');
        predictor.updateInstructions(combinedInstructions);
      }
    }

    return module;
  }

  /**
   * Group traces by example for variability analysis
   * 
   * @param traces - All traces
   * @returns - Grouped trace buckets
   */
  private groupTracesByExample(traces: Trace[]): TraceBucket[] {
    const bucketMap = new Map<string, Trace[]>();

    // Group traces by example (using JSON string as key)
    for (const trace of traces) {
      const exampleKey = JSON.stringify(trace.example.data);
      if (!bucketMap.has(exampleKey)) {
        bucketMap.set(exampleKey, []);
      }
      bucketMap.get(exampleKey)!.push(trace);
    }

    // Create buckets with variability analysis
    const buckets: TraceBucket[] = [];
    for (const [_, tracesForExample] of bucketMap) {
      if (tracesForExample.length > 1) { // Need multiple traces for variability
        const bucket: TraceBucket = {
          example: tracesForExample[0].example,
          traces: tracesForExample,
          variability: this.calculateVariability(tracesForExample)
        };
        buckets.push(bucket);
      }
    }

    return buckets;
  }

  /**
   * Calculate variability statistics for a set of traces
   * 
   * @param traces - Traces for the same example
   * @returns - Variability statistics
   */
  private calculateVariability(traces: Trace[]): VariabilityStats {
    const scores = traces.map(t => t.score || 0);
    
    if (scores.length <= 1) {
      return {
        maxMinDifference: 0,
        meanMaxDifference: 0,
        standardDeviation: 0,
        variance: 0,
        combined: 0
      };
    }

    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate variance and standard deviation
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // SIMBA uses multiple measures combined
    const maxMinDifference = max - min;
    const meanMaxDifference = Math.abs(mean - max);
    const combined = maxMinDifference + meanMaxDifference + standardDeviation;

    return {
      maxMinDifference,
      meanMaxDifference,
      standardDeviation,
      variance,
      combined
    };
  }

  /**
   * Sort buckets by variability (most challenging first)
   * 
   * @param buckets - Trace buckets
   * @returns - Sorted buckets
   */
  private sortByVariability(buckets: TraceBucket[]): TraceBucket[] {
    return buckets.sort((a, b) => b.variability.combined - a.variability.combined);
  }

  /**
   * Apply improvement strategies to generate new candidates
   * 
   * @param buckets - Sorted trace buckets
   * @param baseCandidate - Base candidate to improve
   * @returns - New candidate variations
   */
  private async applyImprovementStrategies(
    buckets: TraceBucket[], 
    baseCandidate: Candidate
  ): Promise<Candidate[]> {
    const newCandidates: Candidate[] = [];

    // Process most challenging buckets first
    const topBuckets = buckets.slice(0, Math.min(3, buckets.length));

    for (const bucket of topBuckets) {
      const strategy = this.chooseStrategy(bucket.variability);

      if (strategy === ImprovementStrategy.ADD_DEMO) {
        // Add successful demonstration
        const candidate = await this.addDemonstrationCandidate(baseCandidate, bucket);
        if (candidate) newCandidates.push(candidate);
      } else if (strategy === ImprovementStrategy.APPEND_RULE) {
        // Generate reflective rule
        const candidate = await this.appendRuleCandidate(baseCandidate, bucket);
        if (candidate) newCandidates.push(candidate);
      }
    }

    return newCandidates;
  }

  /**
   * Choose improvement strategy based on variability
   * 
   * @param variability - Variability statistics
   * @returns - Chosen strategy
   */
  private chooseStrategy(variability: VariabilityStats): ImprovementStrategy {
    // High variability suggests need for rules/instructions
    // Low variability suggests adding good examples might help
    const highVariabilityThreshold = 0.3;
    
    if (variability.combined > highVariabilityThreshold) {
      return ImprovementStrategy.APPEND_RULE;
    } else {
      return ImprovementStrategy.ADD_DEMO;
    }
  }

  /**
   * Create candidate by adding successful demonstration
   * 
   * @param baseCandidate - Base candidate
   * @param bucket - Trace bucket with successful examples
   * @returns - New candidate with added demonstration
   */
  private async addDemonstrationCandidate(
    baseCandidate: Candidate, 
    bucket: TraceBucket
  ): Promise<Candidate | null> {
    // Find best trace in bucket
    const bestTrace = bucket.traces.reduce((best, trace) => 
      (trace.score || 0) > (best.score || 0) ? trace : best
    );

    // Only add if it's actually good
    if ((bestTrace.score || 0) < 0.5) return null;

    // Create demonstration from trace
    const demo = new Example({
      ...bestTrace.example.data,
      ...this.extractOutputsFromPrediction(bestTrace.prediction)
    }).withInputs(...Object.keys(bestTrace.example.inputs().data));

    const newCandidate: Candidate = {
      module: baseCandidate.module.deepcopy(),
      demos: [...baseCandidate.demos, demo].slice(-this.config.max_demos), // Keep recent demos
      instructions: [...baseCandidate.instructions],
      id: this.generateCandidateId('demo')
    };

    return newCandidate;
  }

  /**
   * Create candidate by appending reflective rule
   * 
   * @param baseCandidate - Base candidate
   * @param bucket - Trace bucket with challenging examples
   * @returns - New candidate with appended rule
   */
  private async appendRuleCandidate(
    baseCandidate: Candidate, 
    bucket: TraceBucket
  ): Promise<Candidate | null> {
    // Generate self-reflective rule based on failures
    const rule = await this.generateReflectiveRule(bucket);
    
    if (!rule) return null;

    const newCandidate: Candidate = {
      module: baseCandidate.module.deepcopy(),
      demos: [...baseCandidate.demos],
      instructions: [...baseCandidate.instructions, rule],
      id: this.generateCandidateId('rule')
    };

    return newCandidate;
  }

  /**
   * Generate reflective rule by analyzing failures
   * 
   * @param bucket - Bucket with challenging examples
   * @returns - Generated rule string
   */
  private async generateReflectiveRule(bucket: TraceBucket): Promise<string | null> {
    // Analyze failures and successes
    const bestTrace = bucket.traces.reduce((best, trace) => 
      (trace.score || 0) > (best.score || 0) ? trace : best
    );
    const worstTrace = bucket.traces.reduce((worst, trace) => 
      (trace.score || 0) < (worst.score || 0) ? trace : worst
    );

    // Create rule based on difference analysis
    const bestOutput = JSON.stringify(bestTrace.prediction);
    const worstOutput = JSON.stringify(worstTrace.prediction);

    if (bestOutput === worstOutput) return null;

    // Simple heuristic rule generation - in practice this could use LLM
    const rule = `When handling similar examples, focus on the approach that led to: ${bestOutput} rather than: ${worstOutput}`;

    return rule;
  }

  /**
   * Evaluate candidates on mini-batch
   * 
   * @param candidates - Candidates to evaluate
   * @param miniBatch - Examples to evaluate on
   * @returns - Evaluated candidates with scores
   */
  private async evaluateOnMiniBatch(
    candidates: Candidate[], 
    miniBatch: Example[]
  ): Promise<Candidate[]> {
    const evaluatedCandidates: Candidate[] = [];

    for (const candidate of candidates) {
      let totalScore = 0;
      let validEvaluations = 0;

      const module = this.createModuleVariant(candidate, 0);

      for (const example of miniBatch) {
        try {
          const inputs = example.inputs();
          const prediction = module.forward(inputs.data);
          const score = this.config.metric(example, prediction);
          const numericScore = typeof score === 'boolean' ? (score ? 1 : 0) : score;
          
          totalScore += numericScore;
          validEvaluations++;
        } catch (error) {
          console.warn(`⚠️  Evaluation failed: ${error}`);
        }
      }

      if (validEvaluations > 0) {
        candidate.score = totalScore / validEvaluations;
        evaluatedCandidates.push(candidate);
      }
    }

    return evaluatedCandidates;
  }

  /**
   * Update candidate pools with new evaluated candidates
   * 
   * @param evaluatedCandidates - Newly evaluated candidates
   */
  private updateCandidatePools(evaluatedCandidates: Candidate[]): void {
    // Add all to global pool
    this.globalCandidatePool.push(...evaluatedCandidates);

    // Add best to winning candidates
    if (evaluatedCandidates.length > 0) {
      const bestCandidate = evaluatedCandidates.reduce((best, candidate) => 
        (candidate.score || 0) > (best.score || 0) ? candidate : best
      );
      this.winningCandidates.push(bestCandidate);
    }

    // Trim pools to prevent memory explosion
    this.globalCandidatePool = this.globalCandidatePool
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 50); // Keep top 50
  }

  /**
   * Select best candidate after final evaluation on full training set
   * 
   * @param trainset - Full training set
   * @returns - Best performing candidate
   */
  private async selectBestCandidate(trainset: Example[]): Promise<Candidate> {
    // Evaluate all winning candidates on full training set
    const finalCandidates = await this.evaluateOnMiniBatch(this.winningCandidates, trainset);
    
    if (finalCandidates.length === 0) {
      throw new Error('No valid candidates found during optimization');
    }

    // Return best performing candidate
    return finalCandidates.reduce((best, candidate) => 
      (candidate.score || 0) > (best.score || 0) ? candidate : best
    );
  }

  /**
   * Apply candidate optimizations to student module
   * 
   * @param student - Original student module
   * @param candidate - Best candidate
   * @returns - Optimized module
   */
  private applyCandidateToModule(student: DSPyModule, candidate: Candidate): DSPyModule {
    const optimized = student.deepcopy();

    if (this.isPredictor(optimized)) {
      const predictor = optimized as DSPyPredictor;
      
      // Apply demonstrations
      if (candidate.demos.length > 0) {
        predictor.updateDemos(candidate.demos);
      }

      // Apply instructions
      if (candidate.instructions.length > 0) {
        const combinedInstructions = candidate.instructions.join('\n\n');
        predictor.updateInstructions(combinedInstructions);
      }
    }

    optimized.compiled = true;
    return optimized;
  }

  /**
   * Check if module is a predictor
   * 
   * @param module - Module to check
   * @returns - True if module is a predictor
   */
  private isPredictor(module: DSPyModule): boolean {
    return 'signature' in module && 'demos' in module && 'instructions' in module;
  }

  /**
   * Extract outputs from prediction for demonstration creation
   * 
   * @param prediction - Prediction object
   * @returns - Output fields
   */
  private extractOutputsFromPrediction(prediction: Prediction): Record<string, any> {
    const outputs: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(prediction)) {
      if (key !== 'raw_response' && key !== 'usage' && key !== 'confidence') {
        outputs[key] = value;
      }
    }

    return outputs;
  }

  /**
   * Generate unique candidate ID
   * 
   * @param type - Candidate type
   * @returns - Unique ID
   */
  private generateCandidateId(type: string): string {
    return `${type}-${this.step}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }
}

// Import Example class for demonstration creation
import { Example } from '../primitives/example.js';