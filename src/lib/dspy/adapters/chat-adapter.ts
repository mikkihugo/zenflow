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
import type { Signature } from '../primitives/predictor';
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
    if (signature.instruction) {
      messages.push({
        role: 'system',
        content: signature.instruction
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
    const outputData = 'data' in outputs ? outputs.data : outputs;
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
    
    for (const [field, type] of Object.entries(signature.outputs)) {
      // For now, just return the raw response for the primary output field
      if (Object.keys(signature.outputs).length === 1) {
        result[field] = response.trim();
      } else {
        // Multi-field parsing would require more sophisticated logic
        result[field] = response.trim();
      }
    }

    return result;
  }

  /**
   * Format input fields for display
   */
  private formatInputs(inputs: Record<string, any>, signature: Signature): string {
    const parts: string[] = [];
    
    for (const [field, value] of Object.entries(inputs)) {
      if (signature.inputs[field]) {
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
      if (signature.outputs[field]) {
        parts.push(`${field}: ${value}`);
      }
    }
    
    return parts.join('\n');
  }
}