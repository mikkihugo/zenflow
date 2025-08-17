/**
 * @fileoverview XML Adapter - XML-based output formatting and parsing
 * 
 * Complete implementation of Stanford's XMLAdapter for structured XML output handling.
 * Provides XML tag-based output formatting with robust parsing and validation.
 * Based on Stanford's xml_adapter.py - production-grade XML processing with field validation.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

import { ChatAdapter, type FieldInfoWithName } from './chat-adapter.js';
import type { Signature, FieldInfo } from '../interfaces/types.js';
import { parseValue, formatFieldValue } from './utils.js';

/**
 * XML parsing error
 */
export class XMLParseError extends Error {
  constructor(
    public readonly signature: Signature,
    public readonly completion: string,
    public readonly parsedResult?: Record<string, any>,
    message?: string
  ) {
    super(message || 'Failed to parse XML response');
    this.name = 'XMLParseError';
  }
}

/**
 * XMLAdapter for structured XML output handling
 * 
 * Provides XML tag-based formatting with support for:
 * - Nested XML structure parsing
 * - Field validation and type coercion
 * - Robust error handling
 * - Custom field formatters
 */
export class XMLAdapter extends ChatAdapter {
  private fieldPattern: RegExp;

  constructor() {
    super();
    
    // Regex pattern to match XML fields: <name>content</name>
    this.fieldPattern = /^<(?<name>\w+)>(?<content>.*?)<\/\1>$/gms;
  }

  /**
   * Format field with value in XML format
   */
  formatFieldWithValue(fieldsWithValues: Record<FieldInfoWithName, any>): string {
    const output: string[] = [];
    
    for (const [field, fieldValue] of Object.entries(fieldsWithValues)) {
      const formatted = formatFieldValue(field.info, fieldValue);
      output.push(`<${field.name}>\n${formatted}\n</${field.name}>`);
    }
    
    return output.join('\n\n').trim();
  }

  /**
   * Generate user message with XML output requirements
   */
  userMessageOutputRequirements(signature: Signature): string {
    const outputFields = Object.keys(signature.outputs);
    let message = "Respond with the corresponding output fields wrapped in XML tags";
    
    if (outputFields.length > 0) {
      const fieldTags = outputFields.map(field => `\`<${field}>\``);
      message += ", then " + fieldTags.join(", then ");
    }
    
    message += ", and then end with the `<completed>` tag.";
    return message;
  }

  /**
   * Parse XML response into structured fields
   */
  parse(signature: Signature, completion: string): Record<string, any> {
    const fields: Record<string, any> = {};
    
    // Find all XML field matches in the completion
    const matches = [...completion.matchAll(this.fieldPattern)];
    
    for (const match of matches) {
      const name = match.groups?.name;
      const content = match.groups?.content?.trim();
      
      if (name && content !== undefined && name in signature.outputs && !(name in fields)) {
        fields[name] = content;
      }
    }
    
    // Parse and validate field values according to types
    for (const [key, value] of Object.entries(fields)) {
      if (key in signature.outputs) {
        const fieldInfo = signature.outputs[key];
        try {
          fields[key] = this.parseFieldValue(fieldInfo, value, completion, signature);
        } catch (error) {
          throw new XMLParseError(
            signature,
            completion,
            fields,
            `Failed to parse field ${key}: ${error.message}`
          );
        }
      }
    }
    
    // Validate that all required output fields are present
    const expectedFields = new Set(Object.keys(signature.outputs));
    const actualFields = new Set(Object.keys(fields));
    
    if (!this.setsEqual(expectedFields, actualFields)) {
      const missing = [...expectedFields].filter(f => !actualFields.has(f));
      const extra = [...actualFields].filter(f => !expectedFields.has(f));
      
      let errorMessage = 'Field mismatch in XML response';
      if (missing.length > 0) {
        errorMessage += ` - Missing fields: ${missing.join(', ')}`;
      }
      if (extra.length > 0) {
        errorMessage += ` - Extra fields: ${extra.join(', ')}`;
      }
      
      throw new XMLParseError(
        signature,
        completion,
        fields,
        errorMessage
      );
    }
    
    return fields;
  }

  /**
   * Parse and validate field value according to type
   */
  private parseFieldValue(
    fieldInfo: FieldInfo,
    raw: string,
    completion: string,
    signature: Signature
  ): any {
    try {
      return parseValue(raw, fieldInfo.type);
    } catch (error) {
      throw new XMLParseError(
        signature,
        completion,
        undefined,
        `Failed to parse field ${fieldInfo} with value ${raw}: ${error.message}`
      );
    }
  }

  /**
   * Check if two sets are equal
   */
  private setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) {
      return false;
    }
    
    for (const item of set1) {
      if (!set2.has(item)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Format signature fields for XML instructions
   */
  formatSignatureFieldsForInstructions(fields: Record<string, FieldInfo>): string {
    const fieldsWithValues = Object.fromEntries(
      Object.entries(fields).map(([name, info]) => [
        { name, info } as FieldInfoWithName,
        `[${info.type}]`
      ])
    );
    
    return this.formatFieldWithValue(fieldsWithValues);
  }

  /**
   * Format field structure for XML output
   */
  formatFieldStructure(signature: Signature): string {
    const parts: string[] = [];
    parts.push("All interactions will be structured in the following way, with the appropriate values filled in.");

    // Format input fields
    parts.push("Inputs will have the following structure:");
    parts.push(this.formatSignatureFieldsForInstructions(signature.inputs));

    // Format output fields
    parts.push("Outputs will be wrapped in XML tags as follows:");
    parts.push(this.formatSignatureFieldsForInstructions(signature.outputs));

    return parts.join("\n\n").trim();
  }

  /**
   * Format assistant message content as XML
   */
  formatAssistantMessageContent(
    signature: Signature,
    outputs: Record<string, any>,
    missingFieldMessage?: string
  ): string {
    const xmlElements: string[] = [];
    
    for (const [key, field] of Object.entries(signature.outputs)) {
      const value = outputs[key] ?? missingFieldMessage ?? '[missing]';
      const formatted = formatFieldValue(field, value);
      xmlElements.push(`<${key}>\n${formatted}\n</${key}>`);
    }
    
    xmlElements.push('<completed>');
    
    return xmlElements.join('\n\n');
  }

  /**
   * Extract XML content from completion text
   */
  extractXMLContent(completion: string): Record<string, string> {
    const content: Record<string, string> = {};
    const matches = [...completion.matchAll(this.fieldPattern)];
    
    for (const match of matches) {
      const name = match.groups?.name;
      const value = match.groups?.content?.trim();
      
      if (name && value !== undefined) {
        content[name] = value;
      }
    }
    
    return content;
  }

  /**
   * Validate XML structure
   */
  validateXMLStructure(completion: string, signature: Signature): boolean {
    const extractedFields = this.extractXMLContent(completion);
    const expectedFields = Object.keys(signature.outputs);
    
    return expectedFields.every(field => field in extractedFields);
  }

  /**
   * Clean XML content (remove extra whitespace, normalize structure)
   */
  cleanXMLContent(xmlContent: string): string {
    return xmlContent
      .replace(/^\s+|\s+$/gm, '') // Remove leading/trailing whitespace from each line
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  /**
   * Get field pattern regex
   */
  getFieldPattern(): RegExp {
    return this.fieldPattern;
  }
}

/**
 * Factory function for creating XMLAdapter
 */
export function createXMLAdapter(): XMLAdapter {
  return new XMLAdapter();
}

/**
 * XMLAdapter factory for common patterns
 */
export const XMLAdapterFactory = {
  /**
   * Create standard XML adapter
   */
  standard(): XMLAdapter {
    return new XMLAdapter();
  },

  /**
   * Create XML adapter with custom validation
   */
  withValidation(): XMLAdapter {
    const adapter = new XMLAdapter();
    
    // Override parse method to add extra validation
    const originalParse = adapter.parse.bind(adapter);
    adapter.parse = function(signature: Signature, completion: string): Record<string, any> {
      // Validate XML structure first
      if (!this.validateXMLStructure(completion, signature)) {
        throw new XMLParseError(
          signature,
          completion,
          undefined,
          'Invalid XML structure - missing required fields'
        );
      }
      
      return originalParse(signature, completion);
    };
    
    return adapter;
  },

  /**
   * Create XML adapter with content cleaning
   */
  withCleaning(): XMLAdapter {
    const adapter = new XMLAdapter();
    
    // Override parse method to clean content
    const originalParse = adapter.parse.bind(adapter);
    adapter.parse = function(signature: Signature, completion: string): Record<string, any> {
      const cleanedCompletion = this.cleanXMLContent(completion);
      return originalParse(signature, cleanedCompletion);
    };
    
    return adapter;
  },

  /**
   * Create robust XML adapter with all features
   */
  robust(): XMLAdapter {
    const adapter = XMLAdapterFactory.withValidation();
    
    // Add content cleaning
    const originalParse = adapter.parse.bind(adapter);
    adapter.parse = function(signature: Signature, completion: string): Record<string, any> {
      const cleanedCompletion = this.cleanXMLContent(completion);
      return originalParse(signature, cleanedCompletion);
    };
    
    return adapter;
  }
};