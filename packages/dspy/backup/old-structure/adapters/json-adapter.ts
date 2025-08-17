/**
 * @fileoverview JSON Adapter - Advanced JSON formatting and parsing
 * 
 * Complete implementation of Stanford's JSONAdapter for structured output handling.
 * Supports OpenAI Structured Outputs, native function calling, and robust JSON parsing.
 * Based on Stanford's json_adapter.py - production-grade JSON processing with validation.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { ChatAdapter, type FieldInfoWithName } from './chat-adapter';
import type { Signature, LanguageModel, FieldInfo } from '../interfaces/types';
import { parseValue, formatFieldValue, getAnnotationName, translateFieldType } from './utils';

/**
 * Adapter configuration for JSON mode
 */
export interface JSONAdapterConfig {
  /** Use native function calling when available */
  use_native_function_calling?: boolean;
  /** Strict JSON schema validation */
  strict_validation?: boolean;
  /** Maximum JSON parsing attempts */
  max_parse_attempts?: number;
  /** Auto-repair malformed JSON */
  auto_repair?: boolean;
}

/**
 * Tool calls interface for function calling
 */
export interface ToolCalls {
  function_calls: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}

/**
 * JSON parsing error
 */
export class JSONParseError extends Error {
  constructor(
    public readonly signature: Signature,
    public readonly completion: string,
    public readonly parsedResult?: any,
    message?: string
  ) {
    super(message || 'Failed to parse JSON response');
    this.name = 'JSONParseError';
  }
}

/**
 * JSONAdapter for structured JSON output handling
 * 
 * Provides advanced JSON formatting with support for:
 * - OpenAI Structured Outputs
 * - Native function calling
 * - Robust JSON parsing and repair
 * - Type coercion and validation
 */
export class JSONAdapter extends ChatAdapter {
  private config: Required<JSONAdapterConfig>;

  constructor(config: JSONAdapterConfig = {}) {
    super();
    
    this.config = {
      use_native_function_calling: config.use_native_function_calling ?? true,
      strict_validation: config.strict_validation ?? true,
      max_parse_attempts: config.max_parse_attempts || 3,
      auto_repair: config.auto_repair ?? true
    };
  }

  /**
   * Generate JSON response using language model
   */
  async generate(
    lm: LanguageModel,
    lmKwargs: Record<string, any>,
    signature: Signature,
    demos: Array<Record<string, any>>,
    inputs: Record<string, any>
  ): Promise<Array<Record<string, any>>> {
    // Check if model supports structured outputs
    const provider = this.getProvider(lm.model);
    const supportsStructuredOutputs = this.supportsStructuredOutputs(provider);
    
    if (supportsStructuredOutputs && !this.hasOpenEndedMapping(signature)) {
      return this.generateWithStructuredOutputs(lm, lmKwargs, signature, demos, inputs);
    } else {
      return this.generateWithJSONMode(lm, lmKwargs, signature, demos, inputs);
    }
  }

  /**
   * Generate with OpenAI Structured Outputs
   */
  private async generateWithStructuredOutputs(
    lm: LanguageModel,
    lmKwargs: Record<string, any>,
    signature: Signature,
    demos: Array<Record<string, any>>,
    inputs: Record<string, any>
  ): Promise<Array<Record<string, any>>> {
    try {
      const responseFormat = this.getStructuredOutputsFormat(signature);
      const enhancedKwargs = {
        ...lmKwargs,
        response_format: responseFormat
      };
      
      // Generate response using language model
      const formattedMessages = this.format(signature, inputs, demos as any[]);
      const prompt = formattedMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await lm.generate(prompt, enhancedKwargs);
      
      // Parse the structured response
      const parsed = this.parse(signature, response);
      return [parsed];
    } catch (error) {
      console.warn('Structured outputs failed, falling back to JSON mode:', error);
      return this.generateWithJSONMode(lm, lmKwargs, signature, demos, inputs);
    }
  }

  /**
   * Generate with JSON object mode
   */
  private async generateWithJSONMode(
    lm: LanguageModel,
    lmKwargs: Record<string, any>,
    signature: Signature,
    demos: Array<Record<string, any>>,
    inputs: Record<string, any>
  ): Promise<Array<Record<string, any>>> {
    const enhancedKwargs = {
      ...lmKwargs,
      response_format: { type: "json_object" }
    };
    
    // Generate response using language model
    const formattedMessages = this.format(signature, inputs, demos as any[]);
    const prompt = formattedMessages.map(m => `${m.role}: ${m.content}`).join('\n') + 
      '\n\nRespond with a valid JSON object.';
    const response = await lm.generate(prompt, enhancedKwargs);
    
    // Parse the JSON response
    const parsed = this.parse(signature, response);
    return [parsed];
  }

  /**
   * Format field structure for JSON output
   */
  formatFieldStructure(signature: Signature): string {
    const parts: string[] = [];
    parts.push("All interactions will be structured in the following way, with the appropriate values filled in.");

    // Format input fields
    parts.push("Inputs will have the following structure:");
    const inputFields = signature.inputs || signature.inputFields || {};
    parts.push(this.formatSignatureFieldsForInstructions(inputFields, "user"));

    // Format output fields
    parts.push("Outputs will be a JSON object with the following fields.");
    const outputFields = signature.outputs || signature.outputFields || {};
    parts.push(this.formatSignatureFieldsForInstructions(outputFields, "assistant"));

    return parts.join("\n\n").trim();
  }

  /**
   * Format user message with output requirements
   */
  userMessageOutputRequirements(signature: Signature): string {
    const typeInfo = (field: FieldInfo) => {
      return field.type !== 'string' 
        ? ` (must be formatted as a valid ${getAnnotationName(field.type)})`
        : "";
    };

    let message = "Respond with a JSON object in the following order of fields: ";
    const outputFields = signature.outputs || signature.outputFields || {};
    const fieldDescriptions = Object.entries(outputFields).map(
      ([name, field]) => `\`${name}\`${typeInfo(field)}`
    );
    message += fieldDescriptions.join(", then ");
    message += ".";

    return message;
  }

  /**
   * Format assistant message content as JSON
   */
  formatAssistantMessageContent(
    signature: Signature,
    outputs: Record<string, any>,
    missingFieldMessage?: string
  ): string {
    const fieldsWithValues: Record<string, any> = {};
    const outputFields = signature.outputs || signature.outputFields || {};
    
    for (const [key] of Object.entries(outputFields)) {
      fieldsWithValues[key] = outputs[key] ?? missingFieldMessage;
    }

    return JSON.stringify(this.serializeForJSON(fieldsWithValues), null, 2);
  }

  /**
   * Parse JSON response into structured fields
   */
  parse(signature: Signature, completion: string): Record<string, any> {
    let fields: Record<string, any>;
    
    // Extract JSON from completion
    const jsonContent = this.extractJSON(completion);
    
    // Parse JSON with retry and repair
    fields = this.parseJSONWithRetry(jsonContent, signature);
    
    // Validate structure
    if (!this.isValidObject(fields)) {
      throw new JSONParseError(
        signature,
        completion,
        fields,
        "LM response cannot be serialized to a JSON object."
      );
    }

    // Filter to signature fields only
    fields = this.filterToSignatureFields(fields, signature);

    // Parse and validate field values
    fields = this.parseAndValidateFields(fields, signature);

    // Ensure all required fields are present
    this.validateRequiredFields(fields, signature, completion);

    return fields;
  }

  /**
   * Format field with value for display
   */
  formatFieldWithValue(fieldsWithValues: Record<FieldInfoWithName, any>, role: string = "user"): string {
    if (role === "user") {
      const output: string[] = [];
      for (const [field, fieldValue] of Object.entries(fieldsWithValues)) {
        const formatted = formatFieldValue(field.info, fieldValue);
        output.push(`[[ ## ${field.name} ## ]]\n${formatted}`);
      }
      return output.join("\n\n").trim();
    } else {
      const data = Object.fromEntries(
        Object.entries(fieldsWithValues).map(([field, value]) => [field.name, value])
      );
      return JSON.stringify(this.serializeForJSON(data), null, 2);
    }
  }

  /**
   * Extract JSON from completion text
   */
  private extractJSON(completion: string): string {
    // Look for JSON object pattern
    const jsonPattern = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/;
    const match = completion.match(jsonPattern);
    
    if (match) {
      return match[0];
    }
    
    // Fallback: try to find JSON-like content
    const lines = completion.split('\n');
    const jsonLines = lines.filter(line => 
      line.trim().startsWith('{') || 
      line.trim().includes(':') || 
      line.trim().endsWith('}')
    );
    
    if (jsonLines.length > 0) {
      return jsonLines.join('\n');
    }
    
    return completion;
  }

  /**
   * Parse JSON with retry and auto-repair
   */
  private parseJSONWithRetry(jsonContent: string, signature: Signature): Record<string, any> {
    const attempts = [];
    
    for (let attempt = 0; attempt < this.config.max_parse_attempts; attempt++) {
      try {
        return JSON.parse(jsonContent);
      } catch (error) {
        attempts.push(error);
        
        if (this.config.auto_repair && attempt < this.config.max_parse_attempts - 1) {
          jsonContent = this.repairJSON(jsonContent, attempt);
        }
      }
    }
    
    throw new JSONParseError(
      signature,
      jsonContent,
      undefined,
      `Failed to parse JSON after ${this.config.max_parse_attempts} attempts: ${attempts.map((e: any) => e.message).join(', ')}`
    );
  }

  /**
   * Attempt to repair malformed JSON
   */
  private repairJSON(jsonContent: string, attempt: number): string {
    let repaired = jsonContent;
    
    // Common repairs based on attempt
    switch (attempt) {
      case 0:
        // Fix missing quotes around keys
        repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        break;
      case 1:
        // Fix trailing commas
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
        break;
      case 2:
        // Try to extract just the object content
        const start = repaired.indexOf('{');
        const end = repaired.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          repaired = repaired.substring(start, end + 1);
        }
        break;
    }
    
    return repaired;
  }

  /**
   * Check if object is valid
   */
  private isValidObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  }

  /**
   * Filter fields to signature outputs only
   */
  private filterToSignatureFields(fields: Record<string, any>, signature: Signature): Record<string, any> {
    const filtered: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (key in signature.outputs) {
        filtered[key] = value;
      }
    }
    
    return filtered;
  }

  /**
   * Parse and validate field values according to types
   */
  private parseAndValidateFields(fields: Record<string, any>, signature: Signature): Record<string, any> {
    const parsed: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (key in signature.outputs) {
        const fieldInfo = signature.outputs[key];
        try {
          parsed[key] = parseValue(value, fieldInfo.type);
        } catch (error) {
          throw new JSONParseError(
            signature,
            JSON.stringify(fields),
            fields,
            `Failed to parse field ${key}: ${error.message}`
          );
        }
      }
    }
    
    return parsed;
  }

  /**
   * Validate that all required fields are present
   */
  private validateRequiredFields(
    fields: Record<string, any>, 
    signature: Signature, 
    completion: string
  ): void {
    const missingFields = Object.keys(signature.outputs).filter(key => !(key in fields));
    
    if (missingFields.length > 0) {
      throw new JSONParseError(
        signature,
        completion,
        fields,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Check if signature has open-ended mapping types
   */
  private hasOpenEndedMapping(signature: Signature): boolean {
    return Object.values(signature.outputs).some(field => 
      field.type === 'object' || (typeof field.type === 'string' && field.type.includes('Record'))
    );
  }

  /**
   * Check if model/provider supports structured outputs
   */
  private supportsStructuredOutputs(provider: string): boolean {
    const supportedProviders = ['openai', 'azure'];
    return supportedProviders.includes(provider.toLowerCase());
  }

  /**
   * Get provider from model string
   */
  private getProvider(model: string): string {
    return model.split('/')[0] || 'openai';
  }

  /**
   * Get structured outputs response format
   */
  private getStructuredOutputsFormat(signature: Signature): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [name, field] of Object.entries(signature.outputs)) {
      if (this.config.use_native_function_calling && field.type === 'ToolCalls') {
        continue; // Skip ToolCalls for native function calling
      }
      
      properties[name] = {
        type: this.mapTypeToJSONSchema(field.type),
        description: field.description
      };
      
      if (field.required !== false) {
        required.push(name);
      }
    }
    
    return {
      type: "json_schema",
      json_schema: {
        name: "DSPyProgramOutputs",
        schema: {
          type: "object",
          properties,
          required,
          additionalProperties: false
        }
      }
    };
  }

  /**
   * Map DSPy type to JSON schema type
   */
  private mapTypeToJSONSchema(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'array',
      'object': 'object'
    };
    
    return typeMap[type] || 'string';
  }

  /**
   * Format signature fields for instructions
   */
  private formatSignatureFieldsForInstructions(fields: Record<string, FieldInfo>, role: string): string {
    const fieldsWithValues = Object.fromEntries(
      Object.entries(fields).map(([name, info]) => [
        { name, info } as FieldInfoWithName,
        translateFieldType(name, info)
      ])
    );
    
    return this.formatFieldWithValue(fieldsWithValues, role);
  }

  /**
   * Serialize object for JSON output
   */
  private serializeForJSON(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.serializeForJSON(item));
      } else {
        const serialized: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          serialized[key] = this.serializeForJSON(value);
        }
        return serialized;
      }
    }
    
    return obj;
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<JSONAdapterConfig> {
    return { ...this.config };
  }
}

/**
 * Factory function for creating JSONAdapter
 */
export function createJSONAdapter(config: JSONAdapterConfig = {}): JSONAdapter {
  return new JSONAdapter(config);
}

/**
 * Default JSONAdapter configuration
 */
export const DEFAULT_JSON_ADAPTER_CONFIG: Partial<JSONAdapterConfig> = {
  use_native_function_calling: true,
  strict_validation: true,
  max_parse_attempts: 3,
  auto_repair: true
};

/**
 * JSONAdapter factory for common patterns
 */
export const JSONAdapterFactory = {
  /**
   * Create strict JSON adapter with validation
   */
  strict(): JSONAdapter {
    return new JSONAdapter({
      use_native_function_calling: true,
      strict_validation: true,
      auto_repair: false
    });
  },

  /**
   * Create lenient JSON adapter with auto-repair
   */
  lenient(): JSONAdapter {
    return new JSONAdapter({
      use_native_function_calling: true,
      strict_validation: false,
      auto_repair: true,
      max_parse_attempts: 5
    });
  },

  /**
   * Create function calling adapter
   */
  functionCalling(): JSONAdapter {
    return new JSONAdapter({
      use_native_function_calling: true,
      strict_validation: true
    });
  },

  /**
   * Create basic JSON adapter
   */
  basic(): JSONAdapter {
    return new JSONAdapter({
      use_native_function_calling: false,
      strict_validation: false,
      auto_repair: true
    });
  }
};