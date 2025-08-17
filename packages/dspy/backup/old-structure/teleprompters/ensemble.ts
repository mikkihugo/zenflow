/**
 * @fileoverview DSPy Ensemble Teleprompter
 * 
 * Implementation of ensemble methods for combining multiple DSPy programs.
 * Based on Stanford's DSPy ensemble.py teleprompter.
 * 
 * @author Claude Code Zen Team  
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { BaseModule } from '../primitives/module.js';
import { Prediction } from '../primitives/prediction.js';
import { majority, weightedMajority, type AggregationFunction } from '../primitives/aggregation.js';
import type { Example } from '../interfaces/types.js';

/**
 * Reduce function type for aggregating ensemble outputs
 */
export type ReduceFunction = (outputs: Prediction[]) => Prediction;

/**
 * Configuration for Ensemble teleprompter
 */
export interface EnsembleConfig {
  /** Reduction function for combining outputs (default: majority voting) */
  reduce_fn?: ReduceFunction;
  /** Number of programs to sample for each prediction (default: all) */
  size?: number;
  /** Whether to use deterministic ensemble (not yet implemented) */
  deterministic?: boolean;
  /** Random seed for sampling */
  seed?: number;
}

/**
 * Ensemble result with individual program outputs
 */
export interface EnsembleResult extends Prediction {
  /** Individual outputs from each program */
  individual_outputs: Prediction[];
  /** Programs used in this ensemble */
  programs_used: number;
  /** Aggregation method used */
  aggregation_method: string;
}

/**
 * Ensemble teleprompter for combining multiple trained programs
 * 
 * Combines multiple DSPy programs into an ensemble that can achieve
 * better performance through diversity and aggregation.
 */
export class Ensemble {
  private reduce_fn: ReduceFunction;
  private size?: number;
  private deterministic: boolean;
  private seed?: number;

  constructor(config: EnsembleConfig = {}) {
    this.reduce_fn = config.reduce_fn || majority;
    this.size = config.size;
    this.deterministic = config.deterministic || false;
    this.seed = config.seed;

    if (this.deterministic) {
      throw new Error('TODO: Implement example hashing for deterministic ensemble.');
    }
  }

  /**
   * Compile multiple programs into an ensemble
   * 
   * @param programs - Array of trained DSPy programs
   * @returns EnsembledProgram that aggregates their outputs
   */
  compile(programs: BaseModule[]): EnsembledProgram {
    if (!Array.isArray(programs) || programs.length === 0) {
      throw new Error('Programs array cannot be empty');
    }

    return new EnsembledProgram(programs, {
      reduce_fn: this.reduce_fn,
      size: this.size,
      deterministic: this.deterministic,
      seed: this.seed
    });
  }

  /**
   * Create ensemble with weighted voting
   */
  static weighted(weights: number[], config: Omit<EnsembleConfig, 'reduce_fn'> = {}): Ensemble {
    const weightedReduceFn: ReduceFunction = (outputs: Prediction[]) => {
      if (outputs.length !== weights.length) {
        throw new Error('Number of outputs must match number of weights');
      }

      const weightedPredictions = outputs.map((prediction, index) => ({
        prediction,
        weight: weights[index]
      }));

      return weightedMajority(weightedPredictions);
    };

    return new Ensemble({
      ...config,
      reduce_fn: weightedReduceFn
    });
  }

  /**
   * Create ensemble with custom aggregation function
   */
  static custom(aggregationFn: AggregationFunction, config: Omit<EnsembleConfig, 'reduce_fn'> = {}): Ensemble {
    const customReduceFn: ReduceFunction = (outputs: Prediction[]) => {
      return aggregationFn(outputs);
    };

    return new Ensemble({
      ...config,
      reduce_fn: customReduceFn
    });
  }
}

/**
 * Ensembled program that combines multiple DSPy programs
 */
export class EnsembledProgram extends BaseModule {
  private programs: BaseModule[];
  private reduce_fn: ReduceFunction;
  private size?: number;
  private deterministic: boolean;
  private seed?: number;
  private rng: () => number;

  constructor(programs: BaseModule[], config: EnsembleConfig) {
    super();
    this.programs = programs;
    this.reduce_fn = config.reduce_fn || majority;
    this.size = config.size;
    this.deterministic = config.deterministic || false;
    this.seed = config.seed;

    // Initialize RNG for sampling
    if (this.seed !== undefined) {
      let seed = this.seed;
      this.rng = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    } else {
      this.rng = Math.random;
    }
  }

  /**
   * Forward pass through ensemble
   */
  async forward(inputs: Record<string, any>): Promise<EnsembleResult> {
    // Sample programs if size is specified
    let selectedPrograms = this.programs;
    if (this.size && this.size < this.programs.length) {
      selectedPrograms = this.samplePrograms(this.programs, this.size);
    }

    // Get outputs from all selected programs
    const outputs = await Promise.all(
      selectedPrograms.map(program => program.forward(inputs))
    );

    // Convert to Prediction objects if needed
    const predictions: Prediction[] = outputs.map((output, index) => {
      if (output && typeof output === 'object' && 'outputs' in output) {
        return output as Prediction;
      }
      
      // Convert raw output to Prediction
      return {
        id: `ensemble-${index}-${Date.now()}`,
        outputs: output as Record<string, any>,
        metadata: { program_index: index },
        trace: []
      };
    });

    // Aggregate results
    let aggregatedResult: Prediction;
    let aggregationMethod = 'custom';
    
    if (this.reduce_fn) {
      aggregatedResult = this.reduce_fn(predictions);
      aggregationMethod = aggregatedResult.metadata?.aggregation || 'custom';
    } else {
      // No reduction - return all outputs
      aggregatedResult = {
        id: `ensemble-no-reduce-${Date.now()}`,
        outputs: predictions.map(p => p.outputs),
        metadata: { no_reduction: true },
        trace: []
      };
      aggregationMethod = 'none';
    }

    return {
      ...aggregatedResult,
      individual_outputs: predictions,
      programs_used: selectedPrograms.length,
      aggregation_method: aggregationMethod,
      metadata: {
        ...aggregatedResult.metadata,
        ensemble: true,
        total_programs: this.programs.length,
        programs_used: selectedPrograms.length,
        aggregation_method: aggregationMethod
      }
    };
  }

  /**
   * Sample a subset of programs randomly
   */
  private samplePrograms(programs: BaseModule[], size: number): BaseModule[] {
    if (size >= programs.length) {
      return [...programs];
    }

    const indices = Array.from({ length: programs.length }, (_, i) => i);
    const selectedIndices: number[] = [];

    // Fisher-Yates shuffle with early termination
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(this.rng() * (indices.length - i)) + i;
      [indices[i], indices[randomIndex]] = [indices[randomIndex], indices[i]];
      selectedIndices.push(indices[i]);
    }

    return selectedIndices.map(index => programs[index]);
  }

  /**
   * Get ensemble statistics
   */
  getStats(): {
    total_programs: number;
    sample_size?: number;
    deterministic: boolean;
    has_reduce_fn: boolean;
  } {
    return {
      total_programs: this.programs.length,
      sample_size: this.size,
      deterministic: this.deterministic,
      has_reduce_fn: !!this.reduce_fn
    };
  }

  /**
   * Add programs to the ensemble
   */
  addPrograms(programs: BaseModule[]): void {
    this.programs.push(...programs);
  }

  /**
   * Remove programs from the ensemble
   */
  removePrograms(indices: number[]): void {
    const sortedIndices = [...indices].sort((a, b) => b - a);
    for (const index of sortedIndices) {
      if (index >= 0 && index < this.programs.length) {
        this.programs.splice(index, 1);
      }
    }
  }

  /**
   * Update the reduction function
   */
  setReduceFunction(reduce_fn: ReduceFunction): void {
    this.reduce_fn = reduce_fn;
  }

  /**
   * Update the sampling size
   */
  setSampleSize(size?: number): void {
    this.size = size;
  }
}

/**
 * Factory functions for common ensemble patterns
 */
export const EnsembleFactory = {
  /**
   * Create majority voting ensemble
   */
  majorityVoting(programs: BaseModule[], sampleSize?: number): EnsembledProgram {
    const ensemble = new Ensemble({
      reduce_fn: majority,
      size: sampleSize
    });
    return ensemble.compile(programs);
  },

  /**
   * Create weighted ensemble
   */
  weighted(programs: BaseModule[], weights: number[], sampleSize?: number): EnsembledProgram {
    const ensemble = Ensemble.weighted(weights, { size: sampleSize });
    return ensemble.compile(programs);
  },

  /**
   * Create consensus ensemble (requires high agreement)
   */
  consensus(programs: BaseModule[], threshold: number = 0.6, sampleSize?: number): EnsembledProgram {
    const consensusReduceFn: ReduceFunction = (outputs: Prediction[]) => {
      const majorityResult = majority(outputs);
      const agreement = (majorityResult.metadata?.majority_count || 0) / outputs.length;
      
      if (agreement >= threshold) {
        return {
          ...majorityResult,
          metadata: {
            ...majorityResult.metadata,
            consensus_reached: true,
            agreement_ratio: agreement
          }
        };
      }
      
      // No consensus - return uncertain result
      return {
        id: `no-consensus-${Date.now()}`,
        outputs: { result: 'UNCERTAIN', confidence: agreement },
        metadata: {
          consensus_reached: false,
          agreement_ratio: agreement,
          threshold: threshold
        },
        trace: []
      };
    };

    const ensemble = new Ensemble({
      reduce_fn: consensusReduceFn,
      size: sampleSize
    });
    return ensemble.compile(programs);
  },

  /**
   * Create diverse ensemble that maximizes program diversity
   */
  diverse(programs: BaseModule[], diversityMetric?: (p1: BaseModule, p2: BaseModule) => number): EnsembledProgram {
    // TODO: Implement diversity-based program selection
    // For now, just use random sampling
    const ensemble = new Ensemble({
      reduce_fn: majority,
      size: Math.min(programs.length, Math.ceil(programs.length * 0.7))
    });
    return ensemble.compile(programs);
  }
};

/**
 * Export factory function for backwards compatibility
 */
export function createEnsemble(programs: BaseModule[], config: EnsembleConfig = {}): EnsembledProgram {
  const ensemble = new Ensemble(config);
  return ensemble.compile(programs);
}