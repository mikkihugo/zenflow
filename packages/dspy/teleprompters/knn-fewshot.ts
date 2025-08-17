/**
 * @fileoverview KNNFewShot Teleprompter
 * 
 * Implementation of K-Nearest Neighbors few-shot selection teleprompter.
 * Combines KNN similarity search with few-shot learning for optimal demonstration selection.
 * Based on Stanford's KNNFewShot teleprompter.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { BaseModule } from '../primitives/module.js';
import { Prediction } from '../primitives/prediction.js';
import { KNN, type Embedder, SimpleEmbedder, SimilarityFunctions } from '../primitives/knn.js';
import type { Example } from '../interfaces/types.js';

/**
 * Configuration for KNNFewShot teleprompter
 */
export interface KNNFewShotConfig {
  /** Number of nearest neighbors to retrieve */
  k?: number;
  /** Embedder for vectorizing examples */
  embedder?: Embedder;
  /** Similarity function for distance calculation */
  similarity_fn?: (a: number[], b: number[]) => number;
  /** Field to use for text embedding */
  text_field?: string;
  /** Whether to include label information in similarity */
  include_labels?: boolean;
  /** Minimum similarity threshold */
  min_similarity?: number;
  /** Maximum examples to consider */
  max_examples?: number;
  /** Random seed for reproducible selection */
  seed?: number;
  /** Verbose logging */
  verbose?: boolean;
}

/**
 * Result from KNNFewShot compilation
 */
export interface KNNFewShotResult {
  /** Optimized program */
  program: BaseModule;
  /** Selected demonstrations */
  demonstrations: Example[];
  /** Similarity scores for selected demos */
  similarity_scores: number[];
  /** Total examples considered */
  total_examples: number;
  /** KNN search statistics */
  search_stats: {
    average_similarity: number;
    min_similarity: number;
    max_similarity: number;
    diversity_score: number;
  };
}

/**
 * KNNFewShot teleprompter for similarity-based demonstration selection
 * 
 * Uses K-Nearest Neighbors to find the most similar training examples
 * for each validation instance, optimizing few-shot performance.
 */
export class KNNFewShot {
  private config: Required<KNNFewShotConfig>;
  private knn: KNN;
  private rng: () => number;

  constructor(config: KNNFewShotConfig = {}) {
    this.config = {
      k: config.k || 5,
      embedder: config.embedder || new SimpleEmbedder(),
      similarity_fn: config.similarity_fn || SimilarityFunctions.cosine,
      text_field: config.text_field || 'input',
      include_labels: config.include_labels ?? true,
      min_similarity: config.min_similarity || 0.1,
      max_examples: config.max_examples || 1000,
      seed: config.seed || Math.floor(Math.random() * 1000000),
      verbose: config.verbose ?? true
    };

    // Initialize KNN with configuration
    this.knn = new KNN({
      k: this.config.k,
      embedder: this.config.embedder,
      similarity_fn: this.config.similarity_fn,
      text_field: this.config.text_field
    });

    // Initialize seeded RNG
    let seed = this.config.seed;
    this.rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Compile program with KNN-selected few-shot demonstrations
   */
  async compile(
    program: BaseModule,
    trainset: Example[],
    valset: Example[] = []
  ): Promise<BaseModule> {
    const result = await this.optimize(program, trainset, valset);
    return result.program;
  }

  /**
   * Optimize program using KNN few-shot selection
   */
  async optimize(
    program: BaseModule,
    trainset: Example[],
    valset: Example[] = []
  ): Promise<KNNFewShotResult> {
    if (this.config.verbose) {
      console.log(`🔍 Starting KNNFewShot optimization with k=${this.config.k}...`);
    }

    // Limit trainset size if necessary
    const limitedTrainset = trainset.length > this.config.max_examples
      ? this.sampleExamples(trainset, this.config.max_examples)
      : trainset;

    // Fit KNN on training set
    await this.knn.fit(limitedTrainset);

    // If no validation set, use subset of training set
    const evalSet = valset.length > 0 ? valset : this.sampleExamples(limitedTrainset, Math.min(20, limitedTrainset.length));

    // Find optimal demonstrations through KNN search
    const { demonstrations, stats } = await this.selectOptimalDemonstrations(
      evalSet,
      limitedTrainset
    );

    // Create optimized program with selected demonstrations
    const optimizedProgram = await this.createProgramWithDemonstrations(program, demonstrations);

    if (this.config.verbose) {
      console.log(`✅ KNNFewShot completed! Selected ${demonstrations.length} demonstrations`);
      console.log(`📊 Similarity stats: avg=${stats.average_similarity.toFixed(3)}, diversity=${stats.diversity_score.toFixed(3)}`);
    }

    return {
      program: optimizedProgram,
      demonstrations,
      similarity_scores: await this.getSimilarityScores(demonstrations),
      total_examples: limitedTrainset.length,
      search_stats: stats
    };
  }

  /**
   * Select optimal demonstrations using KNN search
   */
  private async selectOptimalDemonstrations(
    evalSet: Example[],
    trainset: Example[]
  ): Promise<{
    demonstrations: Example[];
    stats: {
      average_similarity: number;
      min_similarity: number;
      max_similarity: number;
      diversity_score: number;
    };
  }> {
    const selectedDemos = new Set<Example>();
    const allSimilarities: number[] = [];

    // For each validation example, find similar training examples
    for (const evalExample of evalSet) {
      const result = await this.knn.forward({
        [this.config.text_field]: this.extractText(evalExample)
      });

      // Add examples that meet similarity threshold
      for (let i = 0; i < result.examples.length; i++) {
        const similarity = result.scores[i];
        if (similarity >= this.config.min_similarity) {
          selectedDemos.add(result.examples[i]);
          allSimilarities.push(similarity);
        }
      }
    }

    const demonstrations = Array.from(selectedDemos);
    
    // Calculate statistics
    const stats = {
      average_similarity: allSimilarities.length > 0 
        ? allSimilarities.reduce((sum, s) => sum + s, 0) / allSimilarities.length 
        : 0,
      min_similarity: allSimilarities.length > 0 ? Math.min(...allSimilarities) : 0,
      max_similarity: allSimilarities.length > 0 ? Math.max(...allSimilarities) : 0,
      diversity_score: this.calculateDiversityScore(demonstrations)
    };

    return { demonstrations, stats };
  }

  /**
   * Create program with selected demonstrations
   */
  private async createProgramWithDemonstrations(
    program: BaseModule,
    demonstrations: Example[]
  ): Promise<BaseModule> {
    // Create a copy of the program
    const optimizedProgram = Object.create(Object.getPrototypeOf(program));
    Object.assign(optimizedProgram, program);

    // Add KNN-selected demonstrations to program metadata
    if (!optimizedProgram.metadata) {
      optimizedProgram.metadata = {};
    }
    
    optimizedProgram.metadata.knn_demonstrations = demonstrations;
    optimizedProgram.metadata.selection_method = 'knn_fewshot';
    optimizedProgram.metadata.k = this.config.k;

    // Enhance forward method to use demonstrations
    const originalForward = optimizedProgram.forward.bind(optimizedProgram);
    optimizedProgram.forward = async (inputs: Record<string, any>) => {
      // Find most relevant demonstrations for this input
      const relevantDemos = await this.findRelevantDemonstrations(inputs, demonstrations);
      
      // Include demonstrations in context (implementation-specific)
      const enhancedInputs = {
        ...inputs,
        _demonstrations: relevantDemos,
        _context: this.formatDemonstrationsAsContext(relevantDemos)
      };

      return originalForward(enhancedInputs);
    };

    return optimizedProgram;
  }

  /**
   * Find most relevant demonstrations for given input
   */
  private async findRelevantDemonstrations(
    inputs: Record<string, any>,
    demonstrations: Example[]
  ): Promise<Example[]> {
    // Use KNN to find most similar demonstrations
    const queryText = this.extractText({ inputs, outputs: {} });
    
    // Temporarily fit KNN on demonstrations
    const tempKNN = new KNN({
      k: Math.min(this.config.k, demonstrations.length),
      embedder: this.config.embedder,
      similarity_fn: this.config.similarity_fn,
      text_field: this.config.text_field
    });
    
    await tempKNN.fit(demonstrations);
    const result = await tempKNN.forward({ [this.config.text_field]: queryText });
    
    return result.examples;
  }

  /**
   * Format demonstrations as context string
   */
  private formatDemonstrationsAsContext(demonstrations: Example[]): string {
    return demonstrations
      .map((demo, index) => {
        const input = this.extractText(demo);
        const output = demo.outputs ? Object.values(demo.outputs)[0] : '';
        return `Example ${index + 1}:\nInput: ${input}\nOutput: ${output}`;
      })
      .join('\n\n');
  }

  /**
   * Extract text from example for embedding
   */
  private extractText(example: Example): string {
    if (this.config.text_field in example.inputs) {
      return String(example.inputs[this.config.text_field]);
    }
    
    // Fallback to first string field
    for (const [key, value] of Object.entries(example.inputs)) {
      if (typeof value === 'string') {
        return value;
      }
    }
    
    return JSON.stringify(example.inputs);
  }

  /**
   * Get similarity scores for demonstrations
   */
  private async getSimilarityScores(demonstrations: Example[]): Promise<number[]> {
    // Calculate pairwise similarities within demonstration set
    const scores: number[] = [];
    
    for (let i = 0; i < demonstrations.length; i++) {
      const demo = demonstrations[i];
      const text = this.extractText(demo);
      const embedding = await this.config.embedder.embed([text]);
      
      // Calculate average similarity to other demonstrations
      let totalSim = 0;
      let count = 0;
      
      for (let j = 0; j < demonstrations.length; j++) {
        if (i !== j) {
          const otherText = this.extractText(demonstrations[j]);
          const otherEmbedding = await this.config.embedder.embed([otherText]);
          const similarity = this.config.similarity_fn(embedding[0], otherEmbedding[0]);
          totalSim += similarity;
          count++;
        }
      }
      
      scores.push(count > 0 ? totalSim / count : 1.0);
    }
    
    return scores;
  }

  /**
   * Calculate diversity score for demonstration set
   */
  private calculateDiversityScore(demonstrations: Example[]): number {
    if (demonstrations.length <= 1) return 1.0;
    
    // Simple diversity measure based on text length variance
    const lengths = demonstrations.map(demo => this.extractText(demo).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    // Normalize variance to [0, 1] scale
    return Math.min(1.0, variance / (avgLength * avgLength + 1));
  }

  /**
   * Sample examples randomly
   */
  private sampleExamples(examples: Example[], n: number): Example[] {
    if (examples.length <= n) return [...examples];
    
    const shuffled = [...examples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, n);
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<KNNFewShotConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<KNNFewShotConfig>): void {
    Object.assign(this.config, updates);
    
    // Update KNN configuration if relevant fields changed
    this.knn = new KNN({
      k: this.config.k,
      embedder: this.config.embedder,
      similarity_fn: this.config.similarity_fn,
      text_field: this.config.text_field
    });
  }
}

/**
 * Factory function for creating KNNFewShot teleprompter
 */
export function createKNNFewShot(config: KNNFewShotConfig = {}): KNNFewShot {
  return new KNNFewShot(config);
}

/**
 * Default KNNFewShot configuration
 */
export const DEFAULT_KNN_FEWSHOT_CONFIG: Partial<KNNFewShotConfig> = {
  k: 5,
  include_labels: true,
  min_similarity: 0.1,
  max_examples: 1000,
  verbose: true
};

/**
 * KNNFewShot factory for common patterns
 */
export const KNNFewShotFactory = {
  /**
   * Create fast KNN few-shot selector
   */
  fast(k: number = 3): KNNFewShot {
    return new KNNFewShot({
      k,
      max_examples: 500,
      min_similarity: 0.2,
      verbose: false
    });
  },

  /**
   * Create balanced KNN few-shot selector
   */
  balanced(k: number = 5): KNNFewShot {
    return new KNNFewShot({
      k,
      max_examples: 1000,
      min_similarity: 0.1,
      include_labels: true,
      verbose: true
    });
  },

  /**
   * Create thorough KNN few-shot selector
   */
  thorough(k: number = 8): KNNFewShot {
    return new KNNFewShot({
      k,
      max_examples: 2000,
      min_similarity: 0.05,
      include_labels: true,
      verbose: true
    });
  },

  /**
   * Create diversity-focused selector
   */
  diverse(k: number = 6): KNNFewShot {
    return new KNNFewShot({
      k,
      min_similarity: 0.0, // Allow more diverse examples
      include_labels: false,
      verbose: true
    });
  }
};