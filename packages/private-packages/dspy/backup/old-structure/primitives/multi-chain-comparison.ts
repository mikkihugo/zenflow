/**
 * @fileoverview MultiChainComparison DSPy Module
 * 
 * Advanced multi-chain reasoning module that compares multiple reasoning attempts
 * and synthesizes them into a final, more accurate response. Based on Stanford DSPy's
 * MultiChainComparison implementation.
 * 
 * Key Features:
 * - Collects multiple reasoning attempts from different chains
 * - Compares and contrasts different approaches
 * - Synthesizes a holistic, corrected final answer
 * - Configurable number of comparison chains
 * - Temperature control for diversity
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { BaseModule } from './module.js';
import { Predictor } from './predictor.js';
import type { Signature, EnhancedSignature } from './signature.js';
import type { PredictionResult } from './predictor.js';

/**
 * Configuration for MultiChainComparison
 */
export interface MultiChainComparisonConfig {
  /** Number of reasoning chains to compare (default: 3) */
  M?: number;
  /** Temperature for diversity in comparison (default: 0.7) */
  temperature?: number;
  /** Additional configuration passed to the predictor */
  [key: string]: any;
}

/**
 * Individual completion/reasoning attempt
 */
export interface ReasoningCompletion {
  /** Reasoning rationale or explanation */
  rationale?: string;
  /** Alternative field name for rationale */
  reasoning?: string;
  /** The final answer/output */
  [key: string]: any;
}

/**
 * MultiChainComparison Module
 * 
 * Implements multi-chain reasoning comparison where multiple reasoning attempts
 * are collected, compared, and synthesized into a final corrected answer.
 * 
 * Algorithm:
 * 1. Takes M reasoning attempts as input
 * 2. Formats each attempt with rationale and prediction
 * 3. Uses a predictor to compare and synthesize all attempts
 * 4. Outputs a holistic, corrected reasoning and final answer
 * 
 * @example
 * ```typescript
 * const multiChain = new MultiChainComparison({
 *   inputs: { question: "string" },
 *   outputs: { answer: "string", rationale: "string" }
 * }, {
 *   M: 3,
 *   temperature: 0.7
 * });
 * 
 * const completions = [
 *   { rationale: "First approach...", answer: "Answer 1" },
 *   { rationale: "Second approach...", answer: "Answer 2" },
 *   { rationale: "Third approach...", answer: "Answer 3" }
 * ];
 * 
 * const result = await multiChain.forward(completions, { question: "What is 2+2?" });
 * console.log(result.answer); // Synthesized answer
 * console.log(result.rationale); // Corrected reasoning
 * ```
 */
export class MultiChainComparison extends BaseModule {
  private M: number;
  private temperature: number;
  private predict: Predictor;
  private lastKey: string;
  private signature: Signature | EnhancedSignature;

  /**
   * Initialize MultiChainComparison module
   * 
   * @param signature - Input/output signature for the task
   * @param config - Configuration options
   */
  constructor(
    signature: Signature | EnhancedSignature,
    config: MultiChainComparisonConfig = {}
  ) {
    super();

    this.M = config.M || 3;
    this.temperature = config.temperature || 0.7;
    
    // Ensure signature is properly structured
    this.signature = this.ensureSignature(signature);
    
    // Get the last output key (the main answer field)
    const outputKeys = Object.keys(this.signature.outputs);
    this.lastKey = outputKeys[outputKeys.length - 1];

    // Create enhanced signature for comparison
    const comparisonSignature = this.createComparisonSignature();
    
    // Create the predictor with enhanced signature
    this.predict = new Predictor(comparisonSignature);
    
    // Add parameters
    this.addParameter('M', this.M, false);
    this.addParameter('temperature', this.temperature, true);
    this.addParameter('predict', this.predict, false);
  }

  /**
   * Forward pass - compare multiple reasoning chains
   * 
   * @param completions - Array of reasoning completions to compare
   * @param kwargs - Additional input arguments
   * @returns Synthesized prediction result
   */
  async forward(
    completions: ReasoningCompletion[],
    kwargs: Record<string, any> = {}
  ): Promise<PredictionResult> {
    // Validate number of completions
    if (completions.length !== this.M) {
      throw new Error(
        `The number of attempts (${completions.length}) doesn't match the expected number M (${this.M}). ` +
        `Please set the correct value for M when initializing MultiChainComparison.`
      );
    }

    // Format reasoning attempts for comparison
    const attempts = this.formatAttempts(completions);
    
    // Prepare inputs for the comparison predictor
    const comparisonInputs: Record<string, any> = {
      ...kwargs
    };

    // Add each reasoning attempt as an input
    for (let idx = 0; idx < this.M; idx++) {
      comparisonInputs[`reasoning_attempt_${idx + 1}`] = attempts[idx];
    }

    // Perform the comparison and synthesis
    const result = await this.predict.aforward(comparisonInputs);
    
    return result;
  }

  /**
   * Synchronous forward pass
   */
  forwardSync(
    completions: ReasoningCompletion[],
    kwargs: Record<string, any> = {}
  ): PredictionResult {
    // Validate number of completions
    if (completions.length !== this.M) {
      throw new Error(
        `The number of attempts (${completions.length}) doesn't match the expected number M (${this.M}). ` +
        `Please set the correct value for M when initializing MultiChainComparison.`
      );
    }

    // Format reasoning attempts for comparison
    const attempts = this.formatAttempts(completions);
    
    // Prepare inputs for the comparison predictor
    const comparisonInputs: Record<string, any> = {
      ...kwargs
    };

    // Add each reasoning attempt as an input
    for (let idx = 0; idx < this.M; idx++) {
      comparisonInputs[`reasoning_attempt_${idx + 1}`] = attempts[idx];
    }

    // Perform the comparison and synthesis
    const result = this.predict.forward(comparisonInputs);
    
    return result;
  }

  /**
   * Format reasoning attempts for comparison input
   */
  private formatAttempts(completions: ReasoningCompletion[]): string[] {
    const attempts: string[] = [];

    for (const completion of completions) {
      // Extract rationale (try multiple possible field names)
      const rationale = (completion.rationale || completion.reasoning || '')
        .trim()
        .split('\n')[0]
        .trim();

      // Extract the main answer
      const answer = String(completion[this.lastKey] || '')
        .trim()
        .split('\n')[0]
        .trim();

      // Format as a student attempt
      const formattedAttempt = `«I'm trying to ${rationale} I'm not sure but my prediction is ${answer}»`;
      attempts.push(formattedAttempt);
    }

    return attempts;
  }

  /**
   * Create comparison signature with reasoning attempt inputs
   */
  private createComparisonSignature(): Signature {
    const inputs: Record<string, string> = { ...this.signature.inputs };
    const outputs: Record<string, string> = { ...this.signature.outputs };

    // Add reasoning attempt inputs
    for (let idx = 0; idx < this.M; idx++) {
      inputs[`reasoning_attempt_${idx + 1}`] = 'string';
    }

    // Prepend rationale to outputs (corrected reasoning)
    const newOutputs: Record<string, string> = {
      rationale: 'string',
      ...outputs
    };

    return {
      inputs,
      outputs: newOutputs,
      instruction: this.createComparisonInstruction(),
      format: this.signature.format
    };
  }

  /**
   * Create instruction for comparison predictor
   */
  private createComparisonInstruction(): string {
    const baseInstruction = this.signature.instruction || '';
    
    const comparisonInstruction = 
      `You will be shown ${this.M} different reasoning attempts for the same problem. ` +
      `Compare and contrast these approaches, identify their strengths and weaknesses, ` +
      `and provide a holistic, corrected reasoning along with the most accurate answer.\n\n` +
      `${baseInstruction}`;

    return comparisonInstruction;
  }

  /**
   * Ensure signature is properly formatted
   */
  private ensureSignature(signature: Signature | EnhancedSignature): Signature {
    // Convert enhanced signature to basic signature if needed
    if (this.isEnhancedSignature(signature)) {
      const basicInputs: Record<string, string> = {};
      const basicOutputs: Record<string, string> = {};

      for (const [key, spec] of Object.entries(signature.inputs)) {
        basicInputs[key] = spec.type;
      }

      for (const [key, spec] of Object.entries(signature.outputs)) {
        basicOutputs[key] = spec.type;
      }

      return {
        inputs: basicInputs,
        outputs: basicOutputs,
        instruction: signature.instruction,
        format: signature.format
      };
    }

    return signature as Signature;
  }

  /**
   * Check if signature is enhanced
   */
  private isEnhancedSignature(signature: any): signature is EnhancedSignature {
    return signature && 
           typeof signature === 'object' &&
           signature.inputs &&
           signature.outputs &&
           Object.values(signature.inputs).some((field: any) => 
             typeof field === 'object' && 'type' in field
           );
  }

  /**
   * Update the number of comparison chains
   */
  updateM(newM: number): void {
    this.M = newM;
    this.updateParameter('M', this.M);
    
    // Recreate predictor with new signature
    const comparisonSignature = this.createComparisonSignature();
    this.predict = new Predictor(comparisonSignature);
    this.updateParameter('predict', this.predict);
  }

  /**
   * Update temperature
   */
  updateTemperature(newTemperature: number): void {
    this.temperature = newTemperature;
    this.updateParameter('temperature', this.temperature);
  }

  /**
   * Get current configuration
   */
  getConfig(): MultiChainComparisonConfig {
    return {
      M: this.M,
      temperature: this.temperature
    };
  }

  /**
   * Create deep copy
   */
  deepcopy(): MultiChainComparison {
    const copy = new MultiChainComparison(this.signature, {
      M: this.M,
      temperature: this.temperature
    });
    
    // Copy language model if set
    if (this._lm) {
      copy.set_lm(this._lm);
    }
    
    return copy;
  }
}

/**
 * Factory function to create MultiChainComparison
 */
export function createMultiChainComparison(
  signature: Signature | EnhancedSignature,
  config: MultiChainComparisonConfig = {}
): MultiChainComparison {
  return new MultiChainComparison(signature, config);
}

/**
 * Default export
 */
export default MultiChainComparison;