/**
 * @fileoverview Enhanced DSPy Signature System with Field Validation and Constraints
 * 
 * Comprehensive signature system for DSPy predictors with advanced validation,
 * constraints, type checking, and field specification capabilities. Extends the
 * basic signature interface with rich validation rules and runtime checks.
 * 
 * Key Features:
 * - Field-level validation with custom validators
 * - Type constraints and format specifications
 * - Value range and enumeration constraints
 * - Dependencies between fields
 * - Auto-generation of validation prompts
 * - Runtime validation with descriptive error messages
 * - Schema export for documentation and tooling
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.46
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Example } from '../interfaces/types.js';

/**
 * Field validation function type
 */
export type FieldValidator<T = any> = (value: T, context?: ValidationContext) => ValidationResult;

/**
 * Validation context for cross-field validation
 */
export interface ValidationContext {
  /** All field values being validated */
  allValues: Record<string, any>;
  /** Field being validated */
  fieldName: string;
  /** Signature being validated against */
  signature: EnhancedSignature;
  /** Whether this is input or output validation */
  validationType: 'input' | 'output';
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Warnings (non-blocking) */
  warnings?: string[];
  /** Normalized/coerced value */
  normalizedValue?: any;
}

/**
 * Field constraint specifications
 */
export interface FieldConstraints {
  /** Minimum value (for numbers) or length (for strings/arrays) */
  min?: number;
  /** Maximum value (for numbers) or length (for strings/arrays) */
  max?: number;
  /** Exact length (for strings/arrays) */
  length?: number;
  /** Regular expression pattern (for strings) */
  pattern?: RegExp | string;
  /** Allowed values (enumeration) */
  enum?: any[];
  /** Custom validation functions */
  validators?: FieldValidator[];
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  default?: any;
  /** Format specification (email, url, date, etc.) */
  format?: string;
  /** Dependencies on other fields */
  dependencies?: string[];
  /** Conditional requirements */
  requiredIf?: (context: ValidationContext) => boolean;
}

/**
 * Enhanced field specification
 */
export interface FieldSpec {
  /** Field type */
  type: string;
  /** Human-readable description */
  description?: string;
  /** Field constraints */
  constraints?: FieldConstraints;
  /** Examples of valid values */
  examples?: any[];
  /** Field metadata */
  metadata?: Record<string, any>;
}

/**
 * Enhanced signature with validation capabilities
 */
export interface EnhancedSignature {
  /** Input field specifications */
  inputs: Record<string, FieldSpec>;
  /** Output field specifications */
  outputs: Record<string, FieldSpec>;
  /** Optional instruction template */
  instruction?: string;
  /** Optional format specification */
  format?: string;
  /** Signature metadata */
  metadata?: {
    /** Signature name/title */
    name?: string;
    /** Signature description */
    description?: string;
    /** Version information */
    version?: string;
    /** Tags for categorization */
    tags?: string[];
    /** Performance hints */
    performance?: {
      /** Expected latency in ms */
      expectedLatency?: number;
      /** Computational complexity */
      complexity?: string;
    };
  };
  /** Global validation rules */
  globalValidators?: FieldValidator[];
}

/**
 * Validation error with detailed information
 */
export class SignatureValidationError extends Error {
  public fieldName: string;
  public validationType: 'input' | 'output';
  public details: ValidationResult;

  constructor(
    fieldName: string,
    validationType: 'input' | 'output',
    details: ValidationResult
  ) {
    super(`Validation failed for ${validationType} field '${fieldName}': ${details.error}`);
    this.fieldName = fieldName;
    this.validationType = validationType;
    this.details = details;
    this.name = 'SignatureValidationError';
  }
}

/**
 * Built-in field validators
 */
export const BuiltInValidators = {
  /**
   * Email format validator
   */
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(value),
      error: emailRegex.test(value) ? undefined : 'Must be a valid email address'
    };
  },

  /**
   * URL format validator
   */
  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Must be a valid URL' };
    }
  },

  /**
   * Date format validator (ISO 8601)
   */
  date: (value: string): ValidationResult => {
    const date = new Date(value);
    return {
      valid: !isNaN(date.getTime()),
      error: isNaN(date.getTime()) ? 'Must be a valid date' : undefined,
      normalizedValue: date.toISOString()
    };
  },

  /**
   * JSON format validator
   */
  json: (value: string): ValidationResult => {
    try {
      const parsed = JSON.parse(value);
      return { valid: true, normalizedValue: parsed };
    } catch {
      return { valid: false, error: 'Must be valid JSON' };
    }
  },

  /**
   * Positive number validator
   */
  positiveNumber: (value: number): ValidationResult => {
    return {
      valid: typeof value === 'number' && value > 0,
      error: typeof value === 'number' && value > 0 ? undefined : 'Must be a positive number'
    };
  },

  /**
   * Non-empty string validator
   */
  nonEmpty: (value: string): ValidationResult => {
    return {
      valid: typeof value === 'string' && value.trim().length > 0,
      error: typeof value === 'string' && value.trim().length > 0 ? undefined : 'Must not be empty'
    };
  }
};

/**
 * Enhanced signature validator and processor
 */
export class SignatureValidator {
  private signature: EnhancedSignature;

  constructor(signature: EnhancedSignature) {
    this.signature = signature;
  }

  /**
   * Validate input values against signature
   * 
   * @param inputs - Input values to validate
   * @returns Validation result with normalized values
   */
  validateInputs(inputs: Record<string, any>): {
    valid: boolean;
    normalizedInputs: Record<string, any>;
    errors: SignatureValidationError[];
    warnings: string[];
  } {
    return this.validateFields(inputs, this.signature.inputs, 'input');
  }

  /**
   * Validate output values against signature
   * 
   * @param outputs - Output values to validate
   * @returns Validation result with normalized values
   */
  validateOutputs(outputs: Record<string, any>): {
    valid: boolean;
    normalizedOutputs: Record<string, any>;
    errors: SignatureValidationError[];
    warnings: string[];
  } {
    return this.validateFields(outputs, this.signature.outputs, 'output');
  }

  /**
   * Validate fields against specifications
   */
  private validateFields(
    values: Record<string, any>,
    fieldSpecs: Record<string, FieldSpec>,
    validationType: 'input' | 'output'
  ): {
    valid: boolean;
    normalizedInputs?: Record<string, any>;
    normalizedOutputs?: Record<string, any>;
    errors: SignatureValidationError[];
    warnings: string[];
  } {
    const errors: SignatureValidationError[] = [];
    const warnings: string[] = [];
    const normalized: Record<string, any> = { ...values };

    // Check required fields
    for (const [fieldName, spec] of Object.entries(fieldSpecs)) {
      const constraints = spec.constraints || {};
      const value = values[fieldName];
      const hasValue = value !== undefined && value !== null;

      // Check if field is required
      const isRequired = constraints.required ?? true;
      const isConditionallyRequired = constraints.requiredIf ? 
        constraints.requiredIf({
          allValues: values,
          fieldName,
          signature: this.signature,
          validationType
        }) : false;

      if ((isRequired || isConditionallyRequired) && !hasValue) {
        errors.push(new SignatureValidationError(
          fieldName,
          validationType,
          { valid: false, error: 'Field is required' }
        ));
        continue;
      }

      // Apply default value if missing
      if (!hasValue && constraints.default !== undefined) {
        normalized[fieldName] = constraints.default;
        continue;
      }

      // Skip validation if no value and not required
      if (!hasValue) {
        continue;
      }

      // Validate field
      const validationResult = this.validateField(fieldName, value, spec, {
        allValues: values,
        fieldName,
        signature: this.signature,
        validationType
      });

      if (!validationResult.valid) {
        errors.push(new SignatureValidationError(fieldName, validationType, validationResult));
      } else {
        // Use normalized value if provided
        if (validationResult.normalizedValue !== undefined) {
          normalized[fieldName] = validationResult.normalizedValue;
        }
        
        // Add warnings
        if (validationResult.warnings) {
          warnings.push(...validationResult.warnings.map(w => `${fieldName}: ${w}`));
        }
      }
    }

    // Check for extra fields
    for (const fieldName of Object.keys(values)) {
      if (!(fieldName in fieldSpecs)) {
        warnings.push(`Extra field provided: ${fieldName}`);
      }
    }

    // Run global validators
    if (this.signature.globalValidators) {
      for (const validator of this.signature.globalValidators) {
        const result = validator(normalized, {
          allValues: normalized,
          fieldName: '*',
          signature: this.signature,
          validationType
        });

        if (!result.valid) {
          errors.push(new SignatureValidationError('*', validationType, result));
        }
      }
    }

    const resultKey = validationType === 'input' ? 'normalizedInputs' : 'normalizedOutputs';
    return {
      valid: errors.length === 0,
      [resultKey]: normalized,
      errors,
      warnings
    };
  }

  /**
   * Validate a single field
   */
  private validateField(
    fieldName: string,
    value: any,
    spec: FieldSpec,
    context: ValidationContext
  ): ValidationResult {
    const constraints = spec.constraints || {};
    const warnings: string[] = [];
    let normalizedValue = value;

    // Type validation
    const typeResult = this.validateType(value, spec.type);
    if (!typeResult.valid) {
      return typeResult;
    }

    // Constraint validation
    if (constraints.min !== undefined) {
      if (typeof value === 'number' && value < constraints.min) {
        return { valid: false, error: `Must be at least ${constraints.min}` };
      }
      if (typeof value === 'string' && value.length < constraints.min) {
        return { valid: false, error: `Must be at least ${constraints.min} characters` };
      }
      if (Array.isArray(value) && value.length < constraints.min) {
        return { valid: false, error: `Must have at least ${constraints.min} items` };
      }
    }

    if (constraints.max !== undefined) {
      if (typeof value === 'number' && value > constraints.max) {
        return { valid: false, error: `Must be at most ${constraints.max}` };
      }
      if (typeof value === 'string' && value.length > constraints.max) {
        return { valid: false, error: `Must be at most ${constraints.max} characters` };
      }
      if (Array.isArray(value) && value.length > constraints.max) {
        return { valid: false, error: `Must have at most ${constraints.max} items` };
      }
    }

    if (constraints.length !== undefined) {
      if (typeof value === 'string' && value.length !== constraints.length) {
        return { valid: false, error: `Must be exactly ${constraints.length} characters` };
      }
      if (Array.isArray(value) && value.length !== constraints.length) {
        return { valid: false, error: `Must have exactly ${constraints.length} items` };
      }
    }

    // Pattern validation
    if (constraints.pattern && typeof value === 'string') {
      const regex = typeof constraints.pattern === 'string' 
        ? new RegExp(constraints.pattern) 
        : constraints.pattern;
      if (!regex.test(value)) {
        return { valid: false, error: `Must match pattern: ${constraints.pattern}` };
      }
    }

    // Enumeration validation
    if (constraints.enum && !constraints.enum.includes(value)) {
      return { 
        valid: false, 
        error: `Must be one of: ${constraints.enum.join(', ')}` 
      };
    }

    // Format validation
    if (constraints.format) {
      const formatValidator = BuiltInValidators[constraints.format as keyof typeof BuiltInValidators];
      if (formatValidator) {
        const formatResult = formatValidator(value);
        if (!formatResult.valid) {
          return formatResult;
        }
        if (formatResult.normalizedValue !== undefined) {
          normalizedValue = formatResult.normalizedValue;
        }
      }
    }

    // Custom validators
    if (constraints.validators) {
      for (const validator of constraints.validators) {
        const result = validator(value, context);
        if (!result.valid) {
          return result;
        }
        if (result.normalizedValue !== undefined) {
          normalizedValue = result.normalizedValue;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      valid: true,
      normalizedValue: normalizedValue !== value ? normalizedValue : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate value type
   */
  private validateType(value: any, expectedType: string): ValidationResult {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    // Handle special types
    if (expectedType === 'string' && typeof value === 'string') {
      return { valid: true };
    }
    if (expectedType === 'number' && typeof value === 'number') {
      return { valid: true };
    }
    if (expectedType === 'boolean' && typeof value === 'boolean') {
      return { valid: true };
    }
    if (expectedType === 'array' && Array.isArray(value)) {
      return { valid: true };
    }
    if (expectedType === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      return { valid: true };
    }
    
    // Handle generic/any type
    if (expectedType === 'any') {
      return { valid: true };
    }

    // Handle array types like "array[string]"
    const arrayMatch = expectedType.match(/^array\[(.+)\]$/);
    if (arrayMatch && Array.isArray(value)) {
      const elementType = arrayMatch[1];
      for (let i = 0; i < value.length; i++) {
        const elementResult = this.validateType(value[i], elementType);
        if (!elementResult.valid) {
          return {
            valid: false,
            error: `Array element at index ${i}: expected ${elementType}, got ${typeof value[i]}`
          };
        }
      }
      return { valid: true };
    }

    return {
      valid: false,
      error: `Expected ${expectedType}, got ${actualType}`
    };
  }

  /**
   * Generate validation prompt additions for LM guidance
   */
  generateValidationPrompt(): string {
    let prompt = '';
    
    // Add input constraints
    const inputConstraints = this.getFieldConstraintsDescription(this.signature.inputs);
    if (inputConstraints) {
      prompt += `Input Requirements:\n${inputConstraints}\n\n`;
    }

    // Add output constraints
    const outputConstraints = this.getFieldConstraintsDescription(this.signature.outputs);
    if (outputConstraints) {
      prompt += `Output Requirements:\n${outputConstraints}\n\n`;
    }

    return prompt;
  }

  /**
   * Get human-readable description of field constraints
   */
  private getFieldConstraintsDescription(fieldSpecs: Record<string, FieldSpec>): string {
    const descriptions: string[] = [];

    for (const [fieldName, spec] of Object.entries(fieldSpecs)) {
      const constraints = spec.constraints || {};
      const parts: string[] = [];

      parts.push(`${fieldName} (${spec.type})`);
      
      if (spec.description) {
        parts.push(`- ${spec.description}`);
      }

      if (constraints.required ?? true) {
        parts.push('- Required');
      }

      if (constraints.min !== undefined) {
        if (spec.type === 'string') {
          parts.push(`- Minimum ${constraints.min} characters`);
        } else if (spec.type === 'number') {
          parts.push(`- Minimum value: ${constraints.min}`);
        }
      }

      if (constraints.max !== undefined) {
        if (spec.type === 'string') {
          parts.push(`- Maximum ${constraints.max} characters`);
        } else if (spec.type === 'number') {
          parts.push(`- Maximum value: ${constraints.max}`);
        }
      }

      if (constraints.enum) {
        parts.push(`- Must be one of: ${constraints.enum.join(', ')}`);
      }

      if (constraints.format) {
        parts.push(`- Format: ${constraints.format}`);
      }

      if (spec.examples && spec.examples.length > 0) {
        parts.push(`- Examples: ${spec.examples.slice(0, 3).join(', ')}`);
      }

      descriptions.push(parts.join('\n'));
    }

    return descriptions.join('\n\n');
  }

  /**
   * Export signature as JSON schema
   */
  exportSchema(): object {
    return {
      type: 'object',
      properties: {
        inputs: this.fieldSpecsToJsonSchema(this.signature.inputs),
        outputs: this.fieldSpecsToJsonSchema(this.signature.outputs)
      },
      required: ['inputs', 'outputs'],
      metadata: this.signature.metadata
    };
  }

  /**
   * Convert field specs to JSON schema format
   */
  private fieldSpecsToJsonSchema(fieldSpecs: Record<string, FieldSpec>): object {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [fieldName, spec] of Object.entries(fieldSpecs)) {
      const constraints = spec.constraints || {};
      
      properties[fieldName] = {
        type: this.mapTypeToJsonSchema(spec.type),
        description: spec.description
      };

      if (constraints.min !== undefined) {
        properties[fieldName].minimum = constraints.min;
      }
      if (constraints.max !== undefined) {
        properties[fieldName].maximum = constraints.max;
      }
      if (constraints.pattern) {
        properties[fieldName].pattern = constraints.pattern.toString();
      }
      if (constraints.enum) {
        properties[fieldName].enum = constraints.enum;
      }
      if (spec.examples) {
        properties[fieldName].examples = spec.examples;
      }

      if (constraints.required ?? true) {
        required.push(fieldName);
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  /**
   * Map DSPy types to JSON schema types
   */
  private mapTypeToJsonSchema(dspyType: string): string {
    switch (dspyType) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'array';
      case 'object': return 'object';
      default: return 'string'; // Default fallback
    }
  }
}

/**
 * Create an enhanced signature with validation
 * 
 * @param config - Signature configuration
 * @returns Enhanced signature instance
 */
export function createEnhancedSignature(config: {
  inputs: Record<string, string | FieldSpec>;
  outputs: Record<string, string | FieldSpec>;
  instruction?: string;
  format?: string;
  metadata?: EnhancedSignature['metadata'];
  globalValidators?: FieldValidator[];
}): EnhancedSignature {
  // Convert simple string types to FieldSpec
  const inputs: Record<string, FieldSpec> = {};
  const outputs: Record<string, FieldSpec> = {};

  for (const [key, value] of Object.entries(config.inputs)) {
    inputs[key] = typeof value === 'string' ? { type: value } : value;
  }

  for (const [key, value] of Object.entries(config.outputs)) {
    outputs[key] = typeof value === 'string' ? { type: value } : value;
  }

  return {
    inputs,
    outputs,
    instruction: config.instruction,
    format: config.format,
    metadata: config.metadata,
    globalValidators: config.globalValidators
  };
}

/**
 * Convert enhanced signature to basic signature for backward compatibility
 * 
 * @param enhancedSignature - Enhanced signature to convert
 * @returns Basic signature
 */
export function toBasicSignature(enhancedSignature: EnhancedSignature): {
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  instruction?: string;
  format?: string;
} {
  const inputs: Record<string, string> = {};
  const outputs: Record<string, string> = {};

  for (const [key, spec] of Object.entries(enhancedSignature.inputs)) {
    inputs[key] = spec.type;
  }

  for (const [key, spec] of Object.entries(enhancedSignature.outputs)) {
    outputs[key] = spec.type;
  }

  return {
    inputs,
    outputs,
    instruction: enhancedSignature.instruction,
    format: enhancedSignature.format
  };
}