/**
 * @fileoverview DSPy Prediction Primitive
 * 
 * Core prediction primitive implementation for DSPy system.
 * Provides structured prediction results with metadata and tracing support.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

/**
 * Prediction interface for DSPy system
 * 
 * Represents the output of a predictor with metadata and tracing information.
 */
export interface Prediction {
  /** Prediction outputs mapped by field name */
  [key: string]: any;
  
  /** Raw language model response (if available) */
  raw_response?: string;
  
  /** Confidence score (0-1) if available */
  confidence?: number;
  
  /** Metadata about the prediction */
  metadata?: {
    /** Timestamp when prediction was made */
    timestamp?: number;
    /** Model used for prediction */
    model?: string;
    /** Temperature used */
    temperature?: number;
    /** Number of tokens in prompt */
    prompt_tokens?: number;
    /** Number of tokens in completion */
    completion_tokens?: number;
    /** Total tokens used */
    total_tokens?: number;
    /** Latency in milliseconds */
    latency_ms?: number;
  };
}

/**
 * Prediction implementation
 * 
 * Concrete implementation of the Prediction interface with utility methods
 * for accessing and manipulating prediction data.
 */
export class PredictionResult implements Prediction {
  [key: string]: any;
  
  public raw_response?: string;
  public confidence?: number;
  public metadata?: Prediction['metadata'];

  constructor(data: Record<string, any> = {}) {
    Object.assign(this, data);
  }

  /**
   * Get all prediction outputs (excluding metadata fields)
   * 
   * @returns Record of output field names to values
   */
  outputs(): Record<string, any> {
    const { raw_response, confidence, metadata, ...outputs } = this;
    return outputs;
  }

  /**
   * Get a specific output field value
   * 
   * @param field - Output field name
   * @returns Field value or undefined if not present
   */
  get(field: string): any {
    return this[field];
  }

  /**
   * Set a specific output field value
   * 
   * @param field - Output field name
   * @param value - Value to set
   */
  set(field: string, value: any): void {
    this[field] = value;
  }

  /**
   * Check if prediction has a specific output field
   * 
   * @param field - Output field name
   * @returns True if field exists
   */
  has(field: string): boolean {
    return field in this && 
           field !== 'raw_response' && 
           field !== 'confidence' && 
           field !== 'metadata';
  }

  /**
   * Get list of output field names
   * 
   * @returns Array of output field names
   */
  fields(): string[] {
    return Object.keys(this.outputs());
  }

  /**
   * Convert prediction to JSON string
   * 
   * @returns JSON representation
   */
  toJSON(): string {
    return JSON.stringify({
      outputs: this.outputs(),
      raw_response: this.raw_response,
      confidence: this.confidence,
      metadata: this.metadata
    });
  }

  /**
   * Create a copy of the prediction
   * 
   * @returns New prediction instance with same data
   */
  copy(): PredictionResult {
    return new PredictionResult({
      ...this.outputs(),
      raw_response: this.raw_response,
      confidence: this.confidence,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }

  /**
   * Merge another prediction into this one
   * 
   * @param other - Other prediction to merge
   * @returns This prediction (for chaining)
   */
  merge(other: Prediction): this {
    Object.assign(this, other);
    return this;
  }

  /**
   * Update metadata
   * 
   * @param updates - Metadata updates
   * @returns This prediction (for chaining)
   */
  updateMetadata(updates: Partial<Prediction['metadata']>): this {
    this.metadata = { ...this.metadata, ...updates };
    return this;
  }

  /**
   * Get total tokens used (if available)
   * 
   * @returns Total token count or 0
   */
  getTotalTokens(): number {
    return this.metadata?.total_tokens || 0;
  }

  /**
   * Get prediction latency (if available)
   * 
   * @returns Latency in milliseconds or 0
   */
  getLatency(): number {
    return this.metadata?.latency_ms || 0;
  }

  /**
   * Check if prediction is valid (has at least one output field)
   * 
   * @returns True if prediction has outputs
   */
  isValid(): boolean {
    return this.fields().length > 0;
  }

  /**
   * Get a string representation of the prediction
   * 
   * @returns Human-readable string
   */
  toString(): string {
    const outputs = this.outputs();
    const fields = Object.keys(outputs);
    
    if (fields.length === 1) {
      return String(outputs[fields[0]]);
    }
    
    return fields.map(field => `${field}: ${outputs[field]}`).join(', ');
  }
}

/**
 * Create a new prediction result
 * 
 * @param data - Initial prediction data
 * @returns New prediction instance
 */
export function createPrediction(data: Record<string, any> = {}): PredictionResult {
  return new PredictionResult(data);
}

/**
 * Check if an object is a valid prediction
 * 
 * @param obj - Object to check
 * @returns True if object is a prediction
 */
export function isPrediction(obj: any): obj is Prediction {
  return obj && typeof obj === 'object' && 
         (obj instanceof PredictionResult || 'raw_response' in obj || 'confidence' in obj);
}

/**
 * Convert prediction to standardized format
 * 
 * @param pred - Prediction to standardize
 * @returns Standardized prediction
 */
export function standardizePrediction(pred: any): PredictionResult {
  if (pred instanceof PredictionResult) {
    return pred;
  }
  
  if (isPrediction(pred)) {
    return new PredictionResult(pred);
  }
  
  // Convert simple values to predictions
  if (typeof pred === 'string' || typeof pred === 'number' || typeof pred === 'boolean') {
    return new PredictionResult({ output: pred });
  }
  
  return new PredictionResult(pred);
}