/**
 * @fileoverview DSPy Retrieve Primitive
 * 
 * Core Retrieve primitive for information retrieval in DSPy programs.
 * Supports various retrieval backends and similarity search capabilities.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import type { Signature } from './predictor.js';
import { PredictionResult } from './prediction.js';

/**
 * Document interface for retrieval
 */
export interface Document {
  /** Unique document identifier */
  id: string;
  /** Document content/text */
  content: string;
  /** Document title (optional) */
  title?: string;
  /** Document metadata */
  metadata?: Record<string, any>;
  /** Relevance score (0-1) */
  score?: number;
}

/**
 * Retrieval backend interface
 */
export interface RetrieverBackend {
  /** Backend name */
  name: string;
  /** Search for documents */
  search(query: string, k?: number): Promise<Document[]>;
  /** Add documents to the backend */
  add?(documents: Document[]): Promise<void>;
  /** Get document by ID */
  get?(id: string): Promise<Document | null>;
  /** Check if backend is ready */
  isReady?(): boolean;
}

/**
 * In-memory retrieval backend using simple text matching
 */
export class InMemoryRetriever implements RetrieverBackend {
  public name = 'in-memory';
  private documents: Document[] = [];

  constructor(documents: Document[] = []) {
    this.documents = documents;
  }

  async search(query: string, k: number = 5): Promise<Document[]> {
    const queryLower = query.toLowerCase();
    
    // Simple text similarity scoring
    const scored = this.documents.map(doc => ({
      ...doc,
      score: this.calculateSimilarity(queryLower, doc.content.toLowerCase())
    }));

    // Sort by score descending and take top k
    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, k);
  }

  async add(documents: Document[]): Promise<void> {
    this.documents.push(...documents);
  }

  async get(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  isReady(): boolean {
    return true;
  }

  private calculateSimilarity(query: string, content: string): number {
    const queryTerms = query.split(/\s+/);
    const contentTerms = content.split(/\s+/);
    
    let matches = 0;
    for (const term of queryTerms) {
      if (contentTerms.some(contentTerm => contentTerm.includes(term))) {
        matches++;
      }
    }
    
    return queryTerms.length > 0 ? matches / queryTerms.length : 0;
  }
}

/**
 * Vector-based retrieval backend (placeholder for actual vector search)
 */
export class VectorRetriever implements RetrieverBackend {
  public name = 'vector';
  private documents: Document[] = [];
  private embeddings: Map<string, number[]> = new Map();

  constructor(documents: Document[] = []) {
    this.documents = documents;
  }

  async search(query: string, k: number = 5): Promise<Document[]> {
    // Placeholder implementation - in real system would use actual embeddings
    const queryEmbedding = this.simpleEmbedding(query);
    
    const scored = this.documents.map(doc => {
      const docEmbedding = this.embeddings.get(doc.id) || this.simpleEmbedding(doc.content);
      return {
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, docEmbedding)
      };
    });

    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, k);
  }

  async add(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      this.documents.push(doc);
      this.embeddings.set(doc.id, this.simpleEmbedding(doc.content));
    }
  }

  async get(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  isReady(): boolean {
    return true;
  }

  private simpleEmbedding(text: string): number[] {
    // Very simple character-based embedding for demo
    const chars = text.toLowerCase().replace(/\s+/g, '');
    const embedding = new Array(100).fill(0);
    
    for (let i = 0; i < chars.length; i++) {
      const charCode = chars.charCodeAt(i);
      embedding[charCode % 100] += 1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    return magnitudeA > 0 && magnitudeB > 0 ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }
}

/**
 * Retrieve configuration interface
 */
export interface RetrieveConfig {
  /** Number of documents to retrieve */
  k?: number;
  /** Retrieval backend */
  backend?: RetrieverBackend;
  /** Whether to include scores in output */
  include_scores?: boolean;
  /** Minimum relevance score threshold */
  min_score?: number;
}

/**
 * Retrieve module for DSPy
 * 
 * Performs information retrieval to augment language model context
 * with relevant documents or passages.
 * 
 * @example
 * ```typescript
 * const documents = [
 *   { id: '1', content: 'Paris is the capital of France.' },
 *   { id: '2', content: 'London is the capital of England.' }
 * ];
 * 
 * const retriever = new Retrieve(5, new InMemoryRetriever(documents));
 * const result = await retriever.forward({ query: 'What is the capital of France?' });
 * console.log(result.passages); // [{ content: 'Paris is the capital of France.', ... }]
 * ```
 */
export class Retrieve extends BaseModule {
  public signature: Signature;
  private config: Required<RetrieveConfig>;

  constructor(
    k: number = 5, 
    backend?: RetrieverBackend,
    config: RetrieveConfig = {}
  ) {
    super();
    
    this.config = {
      k,
      backend: backend || new InMemoryRetriever(),
      include_scores: false,
      min_score: 0,
      ...config
    };

    this.signature = {
      inputs: { query: 'string' },
      outputs: { passages: 'list[string]' },
      instruction: 'Retrieve relevant passages for the given query.'
    };

    // Add parameters
    this.addParameter('k', this.config.k, true, { type: 'retrieve' });
    this.addParameter('backend', this.config.backend.name, false, { type: 'retrieve' });
  }

  /**
   * Perform retrieval
   * 
   * @param inputs - Query inputs
   * @returns Retrieved passages
   */
  async forward(inputs: { query: string }): Promise<PredictionResult> {
    if (!inputs.query) {
      throw new Error('Query is required for retrieval');
    }

    if (!this.config.backend.isReady || !this.config.backend.isReady()) {
      throw new Error('Retrieval backend is not ready');
    }

    const documents = await this.config.backend.search(inputs.query, this.config.k);
    
    // Filter by minimum score if specified
    const filteredDocs = this.config.min_score > 0 
      ? documents.filter(doc => (doc.score || 0) >= this.config.min_score)
      : documents;

    const result = new PredictionResult({
      passages: filteredDocs.map(doc => doc.content),
      query: inputs.query
    });

    // Include additional information if requested
    if (this.config.include_scores) {
      result.set('scores', filteredDocs.map(doc => doc.score || 0));
      result.set('documents', filteredDocs);
    }

    // Update metadata
    result.updateMetadata({
      timestamp: Date.now(),
      retrieval_backend: this.config.backend.name,
      num_retrieved: filteredDocs.length,
      requested_k: this.config.k
    });

    return result;
  }

  /**
   * Add documents to the retrieval backend
   * 
   * @param documents - Documents to add
   */
  async addDocuments(documents: Document[]): Promise<void> {
    if (this.config.backend.add) {
      await this.config.backend.add(documents);
    } else {
      throw new Error('Backend does not support adding documents');
    }
  }

  /**
   * Get document by ID
   * 
   * @param id - Document ID
   * @returns Document or null
   */
  async getDocument(id: string): Promise<Document | null> {
    if (this.config.backend.get) {
      return await this.config.backend.get(id);
    }
    return null;
  }

  /**
   * Update retrieval configuration
   * 
   * @param updates - Configuration updates
   */
  updateConfig(updates: Partial<RetrieveConfig>): void {
    this.config = { ...this.config, ...updates };
    this.updateParameter('k', this.config.k);
  }

  /**
   * Set retrieval backend
   * 
   * @param backend - New backend
   */
  setBackend(backend: RetrieverBackend): void {
    this.config.backend = backend;
    this.updateParameter('backend', backend.name);
  }

  /**
   * Get current backend name
   * 
   * @returns Backend name
   */
  getBackendName(): string {
    return this.config.backend.name;
  }

  /**
   * Create deep copy of retriever
   * 
   * @returns Deep copy
   */
  deepcopy(): Retrieve {
    const copy = new Retrieve(this.config.k, this.config.backend, {
      include_scores: this.config.include_scores,
      min_score: this.config.min_score
    });
    
    // Copy base module properties
    this.copyBaseProperties(copy);
    
    return copy;
  }
}

/**
 * Create a simple in-memory retriever
 * 
 * @param documents - Documents to index
 * @param k - Number of results to return
 * @returns Configured Retrieve module
 */
export function createInMemoryRetriever(documents: Document[], k: number = 5): Retrieve {
  return new Retrieve(k, new InMemoryRetriever(documents));
}

/**
 * Create a vector-based retriever
 * 
 * @param documents - Documents to index
 * @param k - Number of results to return
 * @returns Configured Retrieve module
 */
export function createVectorRetriever(documents: Document[], k: number = 5): Retrieve {
  return new Retrieve(k, new VectorRetriever(documents));
}