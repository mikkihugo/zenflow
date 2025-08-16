/**
 * @fileoverview Adapter Interface for DSPy Data Formatting
 * 
 * Core interface for data formatting adapters used in fine-tuning and training.
 * Adapters handle conversion between DSPy signatures and specific LM formats.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { Signature } from '../primitives/predictor';
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';

/**
 * Base adapter interface for formatting data
 */
export interface Adapter {
  /**
   * Format input data for prediction
   * @param signature - Predictor signature
   * @param inputs - Input data
   * @param demos - Demonstration examples
   * @returns Formatted input data
   */
  format(
    signature: Signature,
    inputs: Record<string, any>,
    demos?: Example[]
  ): any;

  /**
   * Format data for fine-tuning
   * @param signature - Predictor signature
   * @param demos - Demonstration examples
   * @param inputs - Input data
   * @param outputs - Expected outputs
   * @returns Formatted fine-tuning data
   */
  formatFinetuneData(
    signature: Signature,
    demos: Example[],
    inputs: Record<string, any>,
    outputs: Prediction | Record<string, any>
  ): Record<string, any>;

  /**
   * Parse response from LM
   * @param response - Raw LM response
   * @param signature - Predictor signature
   * @returns Parsed prediction object
   */
  parseResponse?(
    response: string,
    signature: Signature
  ): Prediction | Record<string, any>;
}