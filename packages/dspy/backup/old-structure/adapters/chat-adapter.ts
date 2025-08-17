/**
 * @fileoverview Chat Adapter for LLM Chat Format
 * 
 * Implementation of the Adapter interface for chat-based language models.
 * Formats data for OpenAI chat completions API and similar interfaces.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { Adapter } from '../interfaces/adapter';
import type { Signature } from '../interfaces/types';
import { Example } from '../primitives/example';
import type { Prediction } from '../interfaces/types';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Field info with name for adapter formatting
 */
export interface FieldInfoWithName {
  name: string;
  info: {
    type: string;
    description?: string;
    required?: boolean;
  };
}

/**
 * Chat adapter for formatting data for chat-based LLMs
 */
export class ChatAdapter implements Adapter {
  /**
   * Format input data for chat completion
   */
  format(
    signature: Signature,
    inputs: Record<string, any>,
    demos: Example[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system message with instruction
    if (signature.instructions) {
      messages.push({
        role: 'system',
        content: signature.instructions
      });
    }

    // Add demonstration examples
    for (const demo of demos) {
      const demoInputs = demo.inputs();
      const demoOutputs = demo.outputs();
      
      // Format demo as user message
      const inputText = this.formatInputs(demoInputs.data, signature);
      messages.push({
        role: 'user',
        content: inputText
      });

      // Format demo response as assistant message
      const outputText = this.formatOutputs(demoOutputs.data, signature);
      messages.push({
        role: 'assistant',
        content: outputText
      });
    }

    // Add current input as user message
    const inputText = this.formatInputs(inputs, signature);
    messages.push({
      role: 'user',
      content: inputText
    });

    return messages;
  }

  /**
   * Format data for fine-tuning
   */
  formatFinetuneData(
    signature: Signature,
    demos: Example[],
    inputs: Record<string, any>,
    outputs: Prediction | Record<string, any>
  ): Record<string, any> {
    const messages = this.format(signature, inputs, demos);
    
    // Add expected output as final assistant message
    const outputData = 'data' in outputs ? outputs['data'] : outputs;
    const outputText = this.formatOutputs(outputData, signature);
    messages.push({
      role: 'assistant',
      content: outputText
    });

    return { messages };
  }

  /**
   * Parse response from chat completion
   */
  parseResponse(
    response: string,
    signature: Signature
  ): Record<string, any> {
    // Simple parsing - extract fields based on signature outputs
    const result: Record<string, any> = {};
    
    // Get output fields from signature
    const outputFields = signature.outputs 
      ? Object.keys(signature.outputs) 
      : signature.outputFields 
        ? Object.keys(signature.outputFields)
        : [];
    
    if (outputFields.length === 1) {
      // Single output field - return response as that field
      result[outputFields[0]] = response.trim();
    } else if (outputFields.length > 1) {
      // Multi-field parsing would require more sophisticated logic
      // For now, assign the response to all fields
      for (const field of outputFields) {
        result[field] = response.trim();
      }
    } else {
      // No defined outputs, return as generic output
      result.output = response.trim();
    }

    return result;
  }

  /**
   * Format input fields for display
   */
  private formatInputs(inputs: Record<string, any>, signature: Signature): string {
    const parts: string[] = [];
    
    for (const [field, value] of Object.entries(inputs)) {
      if ((signature.inputs && signature.inputs[field]) || 
          (signature.inputFields && signature.inputFields[field])) {
        parts.push(`${field}: ${value}`);
      } else {
        // If no signature inputs defined, include all fields
        parts.push(`${field}: ${value}`);
      }
    }
    
    return parts.join('\n');
  }

  /**
   * Format output fields for display
   */
  private formatOutputs(outputs: Record<string, any>, signature: Signature): string {
    const parts: string[] = [];
    
    for (const [field, value] of Object.entries(outputs)) {
      if ((signature.outputs && signature.outputs[field]) || 
          (signature.outputFields && signature.outputFields[field])) {
        parts.push(`${field}: ${value}`);
      } else {
        // If no signature outputs defined, include all fields
        parts.push(`${field}: ${value}`);
      }
    }
    
    return parts.join('\n');
  }
}