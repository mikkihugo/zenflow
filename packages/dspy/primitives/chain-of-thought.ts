/**
 * @fileoverview DSPy Chain of Thought Primitive
 * 
 * Chain of Thought (CoT) primitive that encourages step-by-step reasoning
 * in language model predictions. Extends the base Predictor with reasoning capabilities.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import { Predictor, type Signature } from './predictor.js';
import { PredictionResult } from './prediction.js';
import type { Example } from '../interfaces/types.js';

/**
 * Chain of Thought configuration
 */
export interface ChainOfThoughtConfig {
  /** Custom reasoning field name (default: 'rationale') */
  reasoning_field?: string;
  /** Whether to include reasoning in final output */
  include_reasoning?: boolean;
  /** Reasoning instruction template */
  reasoning_instruction?: string;
  /** Whether to use explicit reasoning prompts */
  explicit_reasoning?: boolean;
}

/**
 * Default Chain of Thought configuration
 */
const DEFAULT_COT_CONFIG: Required<ChainOfThoughtConfig> = {
  reasoning_field: 'rationale',
  include_reasoning: true,
  reasoning_instruction: 'Let\'s think step by step.',
  explicit_reasoning: true
};

/**
 * Chain of Thought Predictor
 * 
 * Extends the base Predictor to include step-by-step reasoning capabilities.
 * Automatically adds a reasoning field to the signature and prompts the model
 * to think through the problem before providing the final answer.
 * 
 * @example
 * ```typescript
 * const signature: Signature = {
 *   inputs: { question: "string" },
 *   outputs: { answer: "string" },
 *   instruction: "Answer the math question."
 * };
 * 
 * const cot = new ChainOfThought(signature);
 * cot.set_lm(languageModel);
 * 
 * const result = await cot.forward({ 
 *   question: "If a train travels 60 miles in 2 hours, what is its speed?" 
 * });
 * 
 * console.log(result.rationale); // "To find speed, I need to divide distance by time..."
 * console.log(result.answer);    // "30 miles per hour"
 * ```
 */
export class ChainOfThought extends Predictor {
  private config: Required<ChainOfThoughtConfig>;
  private originalSignature: Signature;

  constructor(signature: Signature, config: ChainOfThoughtConfig = {}) {
    // Store original signature before modification
    const originalSignature = { ...signature };
    
    // Create enhanced signature with reasoning field
    const enhancedSignature = ChainOfThought.enhanceSignature(signature, config);
    
    super(enhancedSignature);
    
    this.config = { ...DEFAULT_COT_CONFIG, ...config };
    this.originalSignature = originalSignature;

    // Add CoT-specific parameters
    this.addParameter('reasoning_field', this.config.reasoning_field, true, { type: 'cot' });
    this.addParameter('include_reasoning', this.config.include_reasoning, true, { type: 'cot' });
  }

  /**
   * Enhanced forward method with chain of thought reasoning
   * 
   * @param inputs - Input values
   * @returns Prediction with reasoning
   */
  async forward(inputs: Record<string, any>): Promise<PredictionResult> {
    // Use the parent's async forward method for actual LM calls
    const result = await this.aforward(inputs);
    
    // Post-process result if needed
    if (!this.config.include_reasoning && result.has(this.config.reasoning_field)) {
      // Remove reasoning from output if not wanted in final result
      const reasoning = result.get(this.config.reasoning_field);
      result[this.config.reasoning_field] = undefined;
      delete result[this.config.reasoning_field];
      
      // Store reasoning in metadata instead
      result.updateMetadata({ reasoning });
    }

    return result;
  }

  /**
   * Format prompt with chain of thought structure
   * 
   * @param inputs - Input values
   * @returns Formatted CoT prompt
   */
  formatPrompt(inputs: Record<string, any>): string {
    let prompt = '';

    // Add explicit reasoning instruction if enabled
    if (this.config.explicit_reasoning) {
      const instruction = this.instructions || this.originalSignature.instruction || '';
      prompt += `${instruction}\n\n${this.config.reasoning_instruction}\n\n`;
    } else if (this.instructions) {
      prompt += `${this.instructions}\n\n`;
    }

    // Add demonstrations with reasoning
    if (this.demos.length > 0) {
      prompt += 'Examples:\n';
      for (const demo of this.demos) {
        prompt += this.formatCoTExample(demo) + '\n\n';
      }
    }

    // Add current input
    prompt += this.formatInputs(inputs);

    // Add structured output format with reasoning first
    prompt += `\n${this.config.reasoning_field}: `;

    return prompt;
  }

  /**
   * Parse response with chain of thought structure
   * 
   * @param response - Raw LM response
   * @param inputs - Original inputs
   * @returns Parsed CoT result
   */
  parseResponse(response: string, inputs: Record<string, any>): PredictionResult {
    const result = new PredictionResult();
    result.raw_response = response;

    // Try to parse structured response
    const lines = response.split('\n').filter(line => line.trim());
    let currentField = this.config.reasoning_field;
    let currentContent = '';

    for (const line of lines) {
      // Check if line starts a new field
      const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
      if (fieldMatch) {
        // Save previous field
        if (currentContent.trim()) {
          result.set(currentField, currentContent.trim());
        }
        
        // Start new field
        currentField = fieldMatch[1];
        currentContent = fieldMatch[2];
      } else {
        // Continue current field
        currentContent += (currentContent ? ' ' : '') + line.trim();
      }
    }

    // Save last field
    if (currentContent.trim()) {
      result.set(currentField, currentContent.trim());
    }

    // If we only got reasoning but no final answer, try to extract it
    if (result.has(this.config.reasoning_field)) {
      const originalOutputs = Object.keys(this.originalSignature.outputs);
      
      for (const outputField of originalOutputs) {
        if (!result.has(outputField)) {
          // Try to extract answer from reasoning
          const reasoning = result.get(this.config.reasoning_field);
          const extracted = this.extractAnswerFromReasoning(reasoning, outputField);
          if (extracted) {
            result.set(outputField, extracted);
          }
        }
      }
    }

    // Ensure all original output fields are present
    const originalOutputs = Object.keys(this.originalSignature.outputs);
    for (const field of originalOutputs) {
      if (!result.has(field)) {
        result.set(field, '');
      }
    }

    return result;
  }

  /**
   * Format a CoT example with reasoning
   * 
   * @param example - Example to format
   * @returns Formatted CoT example
   */
  private formatCoTExample(example: Example): string {
    let formatted = '';

    // Format inputs
    const inputs = example.inputs();
    for (const [key, value] of Object.entries(inputs.data)) {
      if (key in this.originalSignature.inputs) {
        formatted += `${key}: ${value}\n`;
      }
    }

    // Add reasoning if present in example
    const labels = example.labels();
    if (this.config.reasoning_field in labels.data) {
      formatted += `${this.config.reasoning_field}: ${labels.data[this.config.reasoning_field]}\n`;
    }

    // Add original outputs
    for (const [key, value] of Object.entries(labels.data)) {
      if (key in this.originalSignature.outputs) {
        formatted += `${key}: ${value}\n`;
      }
    }

    return formatted.trim();
  }

  /**
   * Extract answer from reasoning text
   * 
   * @param reasoning - Reasoning text
   * @param field - Output field to extract
   * @returns Extracted answer or null
   */
  private extractAnswerFromReasoning(reasoning: string, field: string): string | null {
    // Try various patterns to extract the final answer
    const patterns = [
      new RegExp(`(?:therefore|thus|so|answer is|${field} is):?\\s*(.+?)(?:\\.|$)`, 'i'),
      new RegExp(`(?:final answer|conclusion):?\\s*(.+?)(?:\\.|$)`, 'i'),
      /(?:the answer is|answer:)\s*(.+?)(?:\.|$)/i,
      /(?:^|\.)([^.]+)\.?$/  // Last sentence
    ];

    for (const pattern of patterns) {
      const match = reasoning.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Add a CoT demonstration with reasoning
   * 
   * @param inputs - Input values
   * @param reasoning - Step-by-step reasoning
   * @param outputs - Output values
   */
  addCoTDemo(
    inputs: Record<string, any>, 
    reasoning: string, 
    outputs: Record<string, any>
  ): void {
    // Create example with reasoning included
    const exampleData = {
      ...inputs,
      [this.config.reasoning_field]: reasoning,
      ...outputs
    };

    // Create Example object (simplified for now)
    const example = {
      inputs: () => ({ data: inputs }),
      labels: () => ({ data: { [this.config.reasoning_field]: reasoning, ...outputs } })
    } as Example;

    this.addDemo(example);
  }

  /**
   * Create deep copy of CoT predictor
   * 
   * @returns Deep copy
   */
  deepcopy(): ChainOfThought {
    const copy = new ChainOfThought(this.originalSignature, this.config);
    
    // Copy predictor properties
    copy.demos = [...this.demos];
    copy.instructions = this.instructions;
    copy.set_lm(this._lm);
    
    // Reset state
    copy.history = [];
    copy._compiled = false;

    return copy;
  }

  /**
   * Get original signature (without reasoning field)
   * 
   * @returns Original signature
   */
  getOriginalSignature(): Signature {
    return { ...this.originalSignature };
  }

  /**
   * Get reasoning field name
   * 
   * @returns Reasoning field name
   */
  getReasoningField(): string {
    return this.config.reasoning_field;
  }

  /**
   * Update CoT configuration
   * 
   * @param updates - Configuration updates
   */
  updateConfig(updates: Partial<ChainOfThoughtConfig>): void {
    this.config = { ...this.config, ...updates };
    this.updateParameter('reasoning_field', this.config.reasoning_field);
    this.updateParameter('include_reasoning', this.config.include_reasoning);
  }

  /**
   * Enhance signature with reasoning field
   * 
   * @param signature - Original signature
   * @param config - CoT configuration
   * @returns Enhanced signature
   */
  private static enhanceSignature(
    signature: Signature, 
    config: ChainOfThoughtConfig = {}
  ): Signature {
    const reasoningField = config.reasoning_field || DEFAULT_COT_CONFIG.reasoning_field;
    
    return {
      ...signature,
      outputs: {
        [reasoningField]: 'string',
        ...signature.outputs
      },
      instruction: signature.instruction || 'Think step by step to solve this problem.'
    };
  }
}

/**
 * Create a Chain of Thought predictor
 * 
 * @param signature - Predictor signature
 * @param config - CoT configuration
 * @returns Configured ChainOfThought instance
 */
export function createChainOfThought(
  signature: Signature, 
  config: ChainOfThoughtConfig = {}
): ChainOfThought {
  return new ChainOfThought(signature, config);
}

/**
 * Create a Chain of Thought predictor with custom reasoning field
 * 
 * @param signature - Predictor signature
 * @param reasoningField - Custom reasoning field name
 * @returns Configured ChainOfThought instance
 */
export function createChainOfThoughtWithField(
  signature: Signature, 
  reasoningField: string
): ChainOfThought {
  return new ChainOfThought(signature, { reasoning_field: reasoningField });
}