/**
 * @fileoverview DSPy Adapter Interface - Production Grade
 *
 * Core adapter interface for formatting data for different use cases.
 * 100% compatible with Stanford DSPy's adapter system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';
import type { PredictorSignature } from './types';
/**
 * Base adapter interface for data formatting
 */
export interface Adapter {
  /**
   * Format data for fine-tuning
   */
  formatFinetuneData(data: FinetuneDataInput): FinetuneDataOutput;
  /**
   * Format data for inference
   */
  formatInferenceData?(data: InferenceDataInput): InferenceDataOutput;
  /**
   * Format data for evaluation
   */
  formatEvaluationData?(data: EvaluationDataInput): EvaluationDataOutput;
  /**
   * Get adapter configuration
   */
  getConfig?(): Record<string, any>;
}
/**
 * Input data for fine-tuning formatting
 */
export interface FinetuneDataInput {
  /** Predictor signature */
  signature: PredictorSignature;
  /** Demonstration examples */
  demos: Example[];
  /** Input data */
  inputs: Record<string, any>;
  /** Output data */
  outputs: Prediction|Record<string, any>;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
/**
 * Output data from fine-tuning formatting
 */
export interface FinetuneDataOutput {
  /** Formatted messages for training */
  messages: Array<{
    role:'system|user|assistant';
    content: string;
    metadata?: Record<string, any>;
  }>;
  /** Additional formatting metadata */
  metadata?: Record<string, any>;
}
/**
 * Input data for inference formatting
 */
export interface InferenceDataInput {
  /** Predictor signature */
  signature: PredictorSignature;
  /** Demonstration examples */
  demos?: Example[];
  /** Input data */
  inputs: Record<string, any>;
  /** Additional context */
  context?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
/**
 * Output data from inference formatting
 */
export interface InferenceDataOutput {
  /** Formatted prompt */
  prompt: string;
  /** Additional formatting metadata */
  metadata?: Record<string, any>;
}
/**
 * Input data for evaluation formatting
 */
export interface EvaluationDataInput {
  /** Example to evaluate */
  example: Example;
  /** Prediction to evaluate */
  prediction: Prediction;
  /** Additional context */
  context?: Record<string, any>;
}
/**
 * Output data from evaluation formatting
 */
export interface EvaluationDataOutput {
  /** Formatted evaluation data */
  data: Record<string, any>;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
/**
 * Base adapter class with common functionality
 */
export declare abstract class BaseAdapter implements Adapter {
  protected config: Record<string, any>;
  constructor(config?: Record<string, any>);
  abstract formatFinetuneData(data: FinetuneDataInput): FinetuneDataOutput;
  /**
   * Get adapter configuration
   */
  getConfig(): Record<string, any>;
  /**
   * Format demonstration examples into text
   */
  protected formatDemos(
    demos: Example[],
    signature: PredictorSignature
  ): string;
  /**
   * Extract input fields from example based on signature
   */
  protected extractInputs(
    example: Example,
    signature: PredictorSignature
  ): Record<string, any>;
  /**
   * Extract output fields from example based on signature
   */
  protected extractOutputs(
    example: Example,
    signature: PredictorSignature
  ): Record<string, any>;
  /**
   * Format a single example (input/output pair)
   */
  protected formatExample(
    inputs: Record<string, any>,
    outputs: Record<string, any>
  ): string;
  /**
   * Create system message from signature instructions
   */
  protected createSystemMessage(signature: PredictorSignature): string;
  /**
   * Validate adapter input data
   */
  protected validateInput(data: any, requiredFields: string[]): void;
}
export default Adapter;
//# sourceMappingURL=adapter.d.ts.map
