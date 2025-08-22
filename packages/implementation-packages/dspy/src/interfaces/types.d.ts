/**
 * @fileoverview DSPy Types - Production Grade
 *
 * Core type definitions for DSPy teleprompters and modules.
 * 100% compatible with Stanford DSPy type system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';
import type { DSPyModule } from '../primitives/module';
/**
 * Metric function type for evaluating predictions
 */
export type MetricFunction = (
  example: Example,
  prediction: Prediction,
  trace?: any[]
) => number'' | ''boolean;
/**
 * Teleprompter compile options
 */
export interface CompileOptions {
  /** Training examples */
  trainset?: Example[];
  /** Validation examples */
  valset?: Example[];
  /** Teacher module(s) */
  teacher?: DSPyModule'' | ''DSPyModule[]'' | ''null;
  /** Number of trials/iterations */
  num_trials?: number;
  /** Maximum number of examples to use */
  max_examples?: number;
  /** Random seed */
  seed?: number;
  /** Additional options */
  [key: string]: any;
}
/**
 * Predictor signature interface
 */
export interface PredictorSignature {
  /** Instructions for the predictor */
  instructions?: string;
  /** Input field specifications */
  inputs?: Record<string, FieldSpec>;
  /** Output field specifications */
  outputs?: Record<string, FieldSpec>;
  /** Additional signature metadata */
  metadata?: Record<string, any>;
}
/**
 * Field specification for predictor inputs/outputs
 */
export interface FieldSpec {
  /** Field description */
  description?: string;
  /** Field type */
  type?: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  default?: any;
  /** Validation rules */
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    enum?: any[];
  };
}
/**
 * Predictor interface
 */
export interface Predictor {
  /** Predictor name/identifier */
  name?: string;
  /** Predictor signature */
  signature: PredictorSignature;
  /** Language model instance */
  lm?: any;
  /** Demonstration examples */
  demos?: Example[];
  /** Predictor metadata */
  metadata?: Record<string, any>;
  /** Forward function */
  forward?(example: Example): Promise<Prediction>;
  /** Reset function */
  reset?(): void;
  /** Deep copy function */
  deepcopy?(): Predictor;
}
/**
 * Training data interface
 */
export interface TrainingData {
  /** Training examples */
  examples: Example[];
  /** Data format (chat, completion, etc.) */
  format?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
/**
 * Evaluation result interface
 */
export interface EvaluationResult {
  /** Metric score */
  score: number;
  /** Individual example results */
  examples?: Array<{
    example: Example;
    prediction: Prediction;
    score: number;
    metadata?: Record<string, any>;
  }>;
  /** Evaluation metadata */
  metadata?: Record<string, any>;
}
/**
 * Optimization candidate interface
 */
export interface OptimizationCandidate {
  /** Candidate identifier */
  id: string;
  /** Program/module instance */
  program: DSPyModule;
  /** Candidate score */
  score?: number;
  /** Additional metrics */
  metrics?: Record<string, number>;
  /** Candidate metadata */
  metadata?: Record<string, any>;
}
/**
 * Hyperparameter interface
 */
export interface Hyperparameter {
  /** Parameter name */
  name: string;
  /** Parameter value */
  value: any;
  /** Parameter type */
  type:'number | string' | 'boolean' | 'array' | 'object';
  /** Valid range/options */
  range?: {
    min?: number;
    max?: number;
    step?: number;
    options?: any[];
  };
}
/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Maximum number of trials */
  max_trials?: number;
  /** Optimization timeout (ms) */
  timeout?: number;
  /** Early stopping criteria */
  early_stopping?: {
    patience?: number;
    min_improvement?: number;
  };
  /** Hyperparameter search space */
  search_space?: Hyperparameter[];
  /** Optimization strategy */
  strategy?: 'random | grid' | 'bayesian''' | '''genetic';
}
/**
 * Model configuration interface
 */
export interface ModelConfig {
  /** Model name/identifier */
  model: string;
  /** Model parameters */
  parameters?: Record<string, any>;
  /** API configuration */
  api?: {
    endpoint?: string;
    headers?: Record<string, string>;
    timeout?: number;
  };
  /** Rate limiting */
  rate_limit?: {
    requests_per_minute?: number;
    requests_per_hour?: number;
  };
}
/**
 * Cache interface for optimization results
 */
export interface CacheEntry {
  /** Cache key */
  key: string;
  /** Cached value */
  value: any;
  /** Creation timestamp */
  created_at: number;
  /** Expiration timestamp */
  expires_at?: number;
  /** Cache metadata */
  metadata?: Record<string, any>;
}
/**
 * Progress callback type for long-running operations
 */
export type ProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  metadata?: Record<string, any>;
}) => void;
/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
/**
 * Error types for DSPy operations
 */
export declare class DSPyError extends Error {
  readonly code: string;
  readonly metadata?: Record<string, any>;
  constructor(message: string, code?: string, metadata?: Record<string, any>);
}
export declare class ValidationError extends DSPyError {
  constructor(message: string, metadata?: Record<string, any>);
}
export declare class OptimizationError extends DSPyError {
  constructor(message: string, metadata?: Record<string, any>);
}
export declare class ModelError extends DSPyError {
  constructor(message: string, metadata?: Record<string, any>);
}
/**
 * Utility type for making properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Utility type for making properties required
 */
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
/**
 * Deep partial utility type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
declare const _default: {
  DSPyError: typeof DSPyError;
  ValidationError: typeof ValidationError;
  OptimizationError: typeof OptimizationError;
  ModelError: typeof ModelError;
};
export default _default;
//# sourceMappingURL=types.d.ts.map
