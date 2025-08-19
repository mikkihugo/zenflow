/**
 * @fileoverview KNN (K-Nearest Neighbors) DSPy Module
 * 
 * Implementation of k-nearest neighbors retrieval for finding similar examples
 * from a training set. Based on Stanford DSPy's KNN implementation.
 * 
 * Key Features:
 * - Vector-based similarity search using embeddings
 * - Configurable k parameter for number of neighbors
 * - Efficient cosine similarity computation
 * - Support for any embedding model
 * - Training set caching and optimization
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import type { Example } from './example.js';

/**
 * Embedder interface for vectorization
 */
export interface Embedder {
  /** Embed a list of texts into vectors */
  embed(texts: string[]): Promise<number[][]>;
  /** Synchronous embedding (if supported) */
  embedSync?(texts: string[]): number[][];
}

/**
 * Configuration for KNN module
 */
export interface KNNConfig {
  /** Number of nearest neighbors to retrieve */
  k: number;
  /** Training set examples to search through */
  trainset: Example[];
  /** Embedder for vectorization */
  vectorizer: Embedder;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom similarity function (default: cosine) */
  similarityFn?: (a: number[], b: number[]) => number;
}

/**
 * KNN result with similarity scores
 */
export interface KNNResult {
  /** Retrieved nearest neighbor examples */
  examples: Example[];
  /** Similarity scores for each example */
  scores: number[];
  /** Original query that was used for retrieval */
  query: Record<string, any>;
}

/**
 * KNN Module - K-Nearest Neighbors Retrieval
 * 
 * A k-nearest neighbors retriever that finds similar examples from a training set
 * using vector embeddings and cosine similarity.
 * 
 * Algorithm:
 * 1. Pre-compute embeddings for all training examples
 * 2. For each query:
 *    - Embed the query using the same vectorizer
 *    - Compute similarity scores with all training vectors
 *    - Return top k most similar examples
 * 
 * @example
 * ```typescript
 * import { KNN, createInMemoryEmbedder } from './primitives';
 * 
 * // Create training examples
 * const trainset = [
 *   { input: "What is the capital of France?", output: "Paris" },
 *   { input: "What is the capital of Germany?", output: "Berlin" },
 *   { input: "What is the capital of Italy?", output: "Rome" }
 * ];
 * 
 * // Create embedder (in practice, use a real embedding model)
 * const embedder = createInMemoryEmbedder();
 * 
 * // Initialize KNN
 * const knn = new KNN({
 *   k: 2,
 *   trainset,
 *   vectorizer: embedder
 * });
 * 
 * // Find similar examples
 * const result = await knn.forward({ input: "What is the capital of Spain?" });
 * console.log(result.examples); // Top 2 most similar examples
 * console.log(result.scores);   // Similarity scores
 * ```
 */
export class KNN extends BaseModule {
  private k: number;
  private trainset: Example[];
  private vectorizer: Embedder;
  private verbose: boolean;
  private similarityFn: (a: number[], b: number[]) => number;
  private trainsetVectors: number[][] | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize KNN module
   * 
   * @param config - Configuration options
   */
  constructor(config: KNNConfig) {
    super();

    this.k = config.k;
    this.trainset = config.trainset;
    this.vectorizer = config.vectorizer;
    this.verbose = config.verbose || false;
    this.similarityFn = config.similarityFn || this.cosineSimilarity;

    // Add parameters
    this.addParameter('k', this.k, true);
    this.addParameter('trainset', this.trainset, false);
    this.addParameter('vectorizer', this.vectorizer, false);

    // Initialize vectors asynchronously
    this.initializeVectors();
  }

  /**
   * Forward pass - find k nearest neighbors
   * 
   * @param inputs - Query inputs to find similar examples for
   * @returns KNN result with examples and scores
   */
  async forward(inputs: Record<string, any>): Promise<KNNResult> {
    // Ensure vectors are initialized
    await this.ensureInitialized();

    if (!this.trainsetVectors) {
      throw new Error('KNN: Training set vectors not initialized');
    }

    if (this.verbose) {
      console.log(`🔍 KNN: Finding ${this.k} nearest neighbors for query`);
      console.log(`📋 Query: ${JSON.stringify(inputs)}`);
    }

    // Convert query to vector representation
    const queryText = this.exampleToText(inputs);
    const queryVector = await this.vectorizer.embed([queryText]);

    if (!queryVector || queryVector.length === 0) {
      throw new Error('KNN: Failed to embed query');
    }

    const queryVec = queryVector[0];

    // Compute similarity scores
    const scores: number[] = [];
    for (let i = 0; i < this.trainsetVectors.length; i++) {
      const score = this.similarityFn(queryVec, this.trainsetVectors[i]);
      scores.push(score);
    }

    // Get top k indices
    const indexedScores = scores.map((score, index) => ({ score, index }));
    indexedScores.sort((a, b) => b.score - a.score); // Sort by score descending
    
    const topK = indexedScores.slice(0, this.k);
    const nearestExamples = topK.map(item => this.trainset[item.index]);
    const nearestScores = topK.map(item => item.score);

    if (this.verbose) {
      console.log(`✅ KNN: Found ${nearestExamples.length} neighbors`);
      console.log(`📊 Scores: [${nearestScores.map(s => s.toFixed(3)).join(', ')}]`);
    }

    return {
      examples: nearestExamples,
      scores: nearestScores,
      query: inputs
    };
  }

  /**
   * Synchronous forward pass
   */
  forwardSync(inputs: Record<string, any>): KNNResult {
    throw new Error('Synchronous KNN execution not supported due to async embedding');
  }

  /**
   * Initialize training set vectors
   */
  private async initializeVectors(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.verbose) {
      console.log(`🚀 KNN: Initializing vectors for ${this.trainset.length} training examples`);
    }

    try {
      // Convert all training examples to text
      const trainTexts = this.trainset.map(example => this.exampleToText(example));
      
      // Embed all training examples
      this.trainsetVectors = await this.vectorizer.embed(trainTexts);

      // Validate vectors
      if (!this.trainsetVectors || this.trainsetVectors.length !== this.trainset.length) {
        throw new Error(`Expected ${this.trainset.length} vectors, got ${this.trainsetVectors?.length || 0}`);
      }

      this.isInitialized = true;

      if (this.verbose) {
        console.log(`✅ KNN: Initialized ${this.trainsetVectors.length} vectors`);
        const vectorDim = this.trainsetVectors[0]?.length || 0;
        console.log(`📐 Vector dimensions: ${vectorDim}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ KNN: Failed to initialize vectors: ${errorMsg}`);
      throw new Error(`KNN initialization failed: ${errorMsg}`);
    }
  }

  /**
   * Ensure vectors are initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeVectors();
    }
  }

  /**
   * Convert example to text representation for embedding
   */
  private exampleToText(example: Record<string, any>): string {
    // Extract input fields only (similar to Python implementation)
    const inputPairs: string[] = [];
    
    for (const [key, value] of Object.entries(example)) {
      // Skip metadata fields and focus on content
      if (key !== '_input_keys' && key !== '_output_keys' && value !== undefined) {
        inputPairs.push(`${key}: ${String(value)}`);
      }
    }

    return inputPairs.join(' | ');
  }

  /**
   * Cosine similarity function
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Update k parameter
   */
  updateK(newK: number): void {
    this.k = newK;
    this.updateParameter('k', this.k);
  }

  /**
   * Add examples to training set
   */
  async addExamples(examples: Example[]): Promise<void> {
    this.trainset.push(...examples);
    this.updateParameter('trainset', this.trainset);
    
    // Re-initialize vectors with new examples
    this.isInitialized = false;
    await this.initializeVectors();
  }

  /**
   * Get training set size
   */
  getTrainsetSize(): number {
    return this.trainset.length;
  }

  /**
   * Get current k value
   */
  getK(): number {
    return this.k;
  }

  /**
   * Check if KNN is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.trainsetVectors !== null;
  }

  /**
   * Create deep copy
   */
  deepcopy(): KNN {
    const copy = new KNN({
      k: this.k,
      trainset: [...this.trainset],
      vectorizer: this.vectorizer,
      verbose: this.verbose,
      similarityFn: this.similarityFn
    });
    
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Simple in-memory embedder for testing (uses random vectors)
 */
export class SimpleEmbedder implements Embedder {
  private cache = new Map<string, number[]>();
  private dimensions: number;

  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.embedText(text));
  }

  embedSync(texts: string[]): number[][] {
    return texts.map(text => this.embedText(text));
  }

  private embedText(text: string): number[] {
    // Simple deterministic "embedding" based on text content
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // Create pseudo-embedding based on text characteristics
    const vector = new Array(this.dimensions);
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Use hash to seed deterministic random values
    for (let i = 0; i < this.dimensions; i++) {
      hash = ((hash * 1103515245) + 12345) & 0x7fffffff;
      vector[i] = (hash / 0x7fffffff) * 2 - 1; // Range [-1, 1]
    }

    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    this.cache.set(text, vector);
    return vector;
  }
}

/**
 * Factory function to create KNN module
 */
export function createKNN(config: KNNConfig): KNN {
  return new KNN(config);
}

/**
 * Factory function to create simple embedder for testing
 */
export function createSimpleEmbedder(dimensions?: number): SimpleEmbedder {
  return new SimpleEmbedder(dimensions);
}

/**
 * Common similarity functions
 */
export const SimilarityFunctions = {
  /**
   * Cosine similarity (default)
   */
  cosine: (a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    return normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
  },

  /**
   * Euclidean distance (converted to similarity)
   */
  euclidean: (a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }

    let sumSquaredDiff = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sumSquaredDiff += diff * diff;
    }

    const distance = Math.sqrt(sumSquaredDiff);
    return 1 / (1 + distance); // Convert distance to similarity
  },

  /**
   * Dot product similarity
   */
  dotProduct: (a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }

    let dotProduct = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
    }

    return dotProduct;
  }
};

/**
 * Default export
 */
export default KNN;