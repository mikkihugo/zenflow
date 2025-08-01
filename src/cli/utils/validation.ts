/**
 * Validation Utilities
 *
 * Provides input validation functions with comprehensive error handling and type safety.
 * Supports common validation patterns and custom validation rules.
 */

import type { ValidationError, ValidationResult, ValidationWarning } from '../types/index';
import { directoryExists, fileExists } from './file-system';

/**
 * Validation rule function type
 */
export type ValidatorFunction<T = any> = (value: T) => ValidationResult | Promise<ValidationResult>;

/**
 * Validation rule configuration
 */
export interface ValidationRule<T = any> {
  /** Rule name */
  name: string;

  /** Validation function */
  validator: ValidatorFunction<T>;

  /** Error message template */
  message?: string;

  /** Whether this rule is required */
  required?: boolean;

  /** Rule priority (higher numbers run first) */
  priority?: number;
}

/**
 * Validation context with metadata
 */
export interface ValidationContext {
  /** Field path being validated */
  path: string;

  /** Parent object being validated */
  parent?: any;

  /** Root object being validated */
  root?: any;

  /** Additional context data */
  metadata?: Record<string, any>;
}

/**
 * Create a validation error
 */
function createValidationError(
  message: string,
  code: string,
  path?: string,
  expected?: any,
  actual?: any
): ValidationError {
  return {
    message,
    code,
    path,
    expected,
    actual,
  };
}

/**
 * Create a validation warning
 */
function createValidationWarning(
  message: string,
  code: string,
  path?: string,
  suggestion?: string
): ValidationWarning {
  return {
    message,
    code,
    path,
    suggestion,
  };
}

/**
 * Create a successful validation result
 */
function createSuccessResult(): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Create a failed validation result
 */
function createFailureResult(
  errors: ValidationError[],
  warnings: ValidationWarning[] = []
): ValidationResult {
  return {
    valid: false,
    errors,
    warnings,
  };
}

/**
 * Validate that a value is required (not null, undefined, or empty)
 */
export function validateRequired(value: any, fieldName: string = 'Value'): ValidationResult {
  if (value === null || value === undefined) {
    return createFailureResult([
      createValidationError(
        `${fieldName} is required`,
        'REQUIRED',
        fieldName.toLowerCase(),
        'non-null value',
        value
      ),
    ]);
  }

  if (typeof value === 'string' && value.trim() === '') {
    return createFailureResult([
      createValidationError(
        `${fieldName} cannot be empty`,
        'EMPTY_STRING',
        fieldName.toLowerCase(),
        'non-empty string',
        value
      ),
    ]);
  }

  if (Array.isArray(value) && value.length === 0) {
    return createFailureResult([
      createValidationError(
        `${fieldName} cannot be empty`,
        'EMPTY_ARRAY',
        fieldName.toLowerCase(),
        'non-empty array',
        value
      ),
    ]);
  }

  return createSuccessResult();
}

/**
 * Validate that a value is a string with optional constraints
 */
export function validateString(
  value: any,
  options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push(
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  if (!options.allowEmpty && value.trim() === '') {
    errors.push(
      createValidationError(
        `${fieldName} cannot be empty`,
        'EMPTY_STRING',
        fieldName.toLowerCase(),
        'non-empty string',
        value
      )
    );
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    errors.push(
      createValidationError(
        `${fieldName} must be at least ${options.minLength} characters long`,
        'MIN_LENGTH',
        fieldName.toLowerCase(),
        `>= ${options.minLength} characters`,
        `${value.length} characters`
      )
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    errors.push(
      createValidationError(
        `${fieldName} must be at most ${options.maxLength} characters long`,
        'MAX_LENGTH',
        fieldName.toLowerCase(),
        `<= ${options.maxLength} characters`,
        `${value.length} characters`
      )
    );
  }

  if (options.pattern && !options.pattern.test(value)) {
    errors.push(
      createValidationError(
        `${fieldName} does not match the required pattern`,
        'PATTERN_MISMATCH',
        fieldName.toLowerCase(),
        options.pattern.toString(),
        value
      )
    );
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is a number with optional constraints
 */
export function validateNumber(
  value: any,
  options: {
    fieldName?: string;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(
      createValidationError(
        `${fieldName} must be a valid number`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'number',
        typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  if (options.integer && !Number.isInteger(value)) {
    errors.push(
      createValidationError(
        `${fieldName} must be an integer`,
        'NOT_INTEGER',
        fieldName.toLowerCase(),
        'integer',
        value
      )
    );
  }

  if (options.positive && value <= 0) {
    errors.push(
      createValidationError(
        `${fieldName} must be positive`,
        'NOT_POSITIVE',
        fieldName.toLowerCase(),
        '> 0',
        value
      )
    );
  }

  if (options.min !== undefined && value < options.min) {
    errors.push(
      createValidationError(
        `${fieldName} must be at least ${options.min}`,
        'MIN_VALUE',
        fieldName.toLowerCase(),
        `>= ${options.min}`,
        value
      )
    );
  }

  if (options.max !== undefined && value > options.max) {
    errors.push(
      createValidationError(
        `${fieldName} must be at most ${options.max}`,
        'MAX_VALUE',
        fieldName.toLowerCase(),
        `<= ${options.max}`,
        value
      )
    );
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: any, fieldName: string = 'Value'): ValidationResult {
  if (typeof value !== 'boolean') {
    return createFailureResult([
      createValidationError(
        `${fieldName} must be a boolean`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'boolean',
        typeof value
      ),
    ]);
  }

  return createSuccessResult();
}

/**
 * Validate that a value is an array with optional constraints
 */
export function validateArray(
  value: any,
  options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    itemValidator?: ValidatorFunction;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!Array.isArray(value)) {
    errors.push(
      createValidationError(
        `${fieldName} must be an array`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'array',
        typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    errors.push(
      createValidationError(
        `${fieldName} must have at least ${options.minLength} items`,
        'MIN_LENGTH',
        fieldName.toLowerCase(),
        `>= ${options.minLength} items`,
        `${value.length} items`
      )
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    errors.push(
      createValidationError(
        `${fieldName} must have at most ${options.maxLength} items`,
        'MAX_LENGTH',
        fieldName.toLowerCase(),
        `<= ${options.maxLength} items`,
        `${value.length} items`
      )
    );
  }

  // Validate array items if validator provided
  if (options.itemValidator) {
    for (let i = 0; i < value.length; i++) {
      const itemResult = options.itemValidator(value[i]);
      if (itemResult instanceof Promise) {
        warnings.push(
          createValidationWarning(
            'Async validation of array items is not supported in synchronous validation',
            'ASYNC_VALIDATION',
            `${fieldName.toLowerCase()}[${i}]`,
            'Use async validation for array items'
          )
        );
      } else {
        errors.push(
          ...itemResult.errors.map((error) => ({
            ...error,
            path: `${fieldName.toLowerCase()}[${i}]${error.path ? '.' + error.path : ''}`,
          }))
        );
        warnings.push(
          ...itemResult.warnings.map((warning) => ({
            ...warning,
            path: `${fieldName.toLowerCase()}[${i}]${warning.path ? '.' + warning.path : ''}`,
          }))
        );
      }
    }
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is an object with optional constraints
 */
export function validateObject(
  value: any,
  options: {
    fieldName?: string;
    allowNull?: boolean;
    requiredKeys?: string[];
    schema?: Record<string, ValidatorFunction>;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (value === null) {
    if (!options.allowNull) {
      errors.push(
        createValidationError(
          `${fieldName} cannot be null`,
          'NULL_VALUE',
          fieldName.toLowerCase(),
          'object',
          null
        )
      );
    }
    return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    errors.push(
      createValidationError(
        `${fieldName} must be an object`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'object',
        Array.isArray(value) ? 'array' : typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  // Check required keys
  if (options.requiredKeys) {
    for (const key of options.requiredKeys) {
      if (!(key in value)) {
        errors.push(
          createValidationError(
            `${fieldName} is missing required property "${key}"`,
            'MISSING_PROPERTY',
            `${fieldName.toLowerCase()}.${key}`,
            'present',
            'missing'
          )
        );
      }
    }
  }

  // Validate properties against schema
  if (options.schema) {
    for (const [key, validator] of Object.entries(options.schema)) {
      if (key in value) {
        const propertyResult = validator(value[key]);
        if (propertyResult instanceof Promise) {
          warnings.push(
            createValidationWarning(
              'Async validation of object properties is not supported in synchronous validation',
              'ASYNC_VALIDATION',
              `${fieldName.toLowerCase()}.${key}`,
              'Use async validation for object properties'
            )
          );
        } else {
          errors.push(
            ...propertyResult.errors.map((error) => ({
              ...error,
              path: `${fieldName.toLowerCase()}.${key}${error.path ? '.' + error.path : ''}`,
            }))
          );
          warnings.push(
            ...propertyResult.warnings.map((warning) => ({
              ...warning,
              path: `${fieldName.toLowerCase()}.${key}${warning.path ? '.' + warning.path : ''}`,
            }))
          );
        }
      }
    }
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is a valid URL
 */
export function validateUrl(
  value: any,
  options: {
    fieldName?: string;
    protocols?: string[];
    allowLocal?: boolean;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'URL';
  const protocols = options.protocols || ['http', 'https'];

  if (typeof value !== 'string') {
    return createFailureResult([
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      ),
    ]);
  }

  try {
    const url = new URL(value);

    if (!protocols.includes(url.protocol.slice(0, -1))) {
      return createFailureResult([
        createValidationError(
          `${fieldName} must use one of the following protocols: ${protocols.join(', ')}`,
          'INVALID_PROTOCOL',
          fieldName.toLowerCase(),
          protocols.join(' | '),
          url.protocol
        ),
      ]);
    }

    if (!options.allowLocal && (url.hostname === 'localhost' || url.hostname.startsWith('127.'))) {
      return createFailureResult([
        createValidationError(
          `${fieldName} cannot be a local URL`,
          'LOCAL_URL',
          fieldName.toLowerCase(),
          'non-local URL',
          url.hostname
        ),
      ]);
    }

    return createSuccessResult();
  } catch (error) {
    return createFailureResult([
      createValidationError(
        `${fieldName} is not a valid URL: ${(error as Error).message}`,
        'INVALID_URL',
        fieldName.toLowerCase(),
        'valid URL',
        value
      ),
    ]);
  }
}

/**
 * Validate that a value is a valid email address
 */
export function validateEmail(value: any, fieldName: string = 'Email'): ValidationResult {
  if (typeof value !== 'string') {
    return createFailureResult([
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      ),
    ]);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return createFailureResult([
      createValidationError(
        `${fieldName} is not a valid email address`,
        'INVALID_EMAIL',
        fieldName.toLowerCase(),
        'valid email format',
        value
      ),
    ]);
  }

  return createSuccessResult();
}

/**
 * Validate that a value is a valid file path
 */
export async function validateFilePath(
  value: any,
  options: {
    fieldName?: string;
    mustExist?: boolean;
    mustBeReadable?: boolean;
    mustBeWritable?: boolean;
    allowedExtensions?: string[];
  } = {}
): Promise<ValidationResult> {
  const fieldName = options.fieldName || 'File path';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push(
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  if (options.mustExist && !(await fileExists(value))) {
    errors.push(
      createValidationError(
        `${fieldName} does not exist: ${value}`,
        'FILE_NOT_FOUND',
        fieldName.toLowerCase(),
        'existing file',
        value
      )
    );
  }

  if (options.allowedExtensions) {
    const extension = value.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(
        createValidationError(
          `${fieldName} must have one of the following extensions: ${options.allowedExtensions.join(', ')}`,
          'INVALID_EXTENSION',
          fieldName.toLowerCase(),
          options.allowedExtensions.join(' | '),
          extension || 'none'
        )
      );
    }
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is a valid directory path
 */
export async function validateDirectoryPath(
  value: any,
  options: {
    fieldName?: string;
    mustExist?: boolean;
    mustBeWritable?: boolean;
  } = {}
): Promise<ValidationResult> {
  const fieldName = options.fieldName || 'Directory path';
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (typeof value !== 'string') {
    errors.push(
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      )
    );
    return createFailureResult(errors, warnings);
  }

  if (options.mustExist && !(await directoryExists(value))) {
    errors.push(
      createValidationError(
        `${fieldName} does not exist: ${value}`,
        'DIRECTORY_NOT_FOUND',
        fieldName.toLowerCase(),
        'existing directory',
        value
      )
    );
  }

  return errors.length > 0 ? createFailureResult(errors, warnings) : createSuccessResult();
}

/**
 * Validate that a value is a valid port number
 */
export function validatePort(value: any, fieldName: string = 'Port'): ValidationResult {
  const numberResult = validateNumber(value, {
    fieldName,
    min: 1,
    max: 65535,
    integer: true,
    positive: true,
  });

  if (!numberResult.valid) {
    return numberResult;
  }

  // Add warning for well-known ports
  const warnings: ValidationWarning[] = [];
  if (value < 1024) {
    warnings.push(
      createValidationWarning(
        `${fieldName} ${value} is a well-known port that may require elevated privileges`,
        'WELL_KNOWN_PORT',
        fieldName.toLowerCase(),
        'Consider using a port >= 1024 for user applications'
      )
    );
  }

  return {
    valid: true,
    errors: [],
    warnings,
  };
}

/**
 * Validate that a value is a valid semantic version
 */
export function validateVersion(value: any, fieldName: string = 'Version'): ValidationResult {
  if (typeof value !== 'string') {
    return createFailureResult([
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      ),
    ]);
  }

  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  if (!semverRegex.test(value)) {
    return createFailureResult([
      createValidationError(
        `${fieldName} is not a valid semantic version (e.g., 1.0.0)`,
        'INVALID_VERSION',
        fieldName.toLowerCase(),
        'semantic version format',
        value
      ),
    ]);
  }

  return createSuccessResult();
}

/**
 * Validate that a value is a valid UUID
 */
export function validateUuid(value: any, fieldName: string = 'UUID'): ValidationResult {
  if (typeof value !== 'string') {
    return createFailureResult([
      createValidationError(
        `${fieldName} must be a string`,
        'INVALID_TYPE',
        fieldName.toLowerCase(),
        'string',
        typeof value
      ),
    ]);
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    return createFailureResult([
      createValidationError(
        `${fieldName} is not a valid UUID`,
        'INVALID_UUID',
        fieldName.toLowerCase(),
        'UUID format',
        value
      ),
    ]);
  }

  return createSuccessResult();
}

/**
 * Check if a string is valid JSON
 */
export function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON with validation
 */
export function parseJson<T = any>(
  value: string,
  fieldName: string = 'JSON'
): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    const data = JSON.parse(value) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: createValidationError(
        `${fieldName} is not valid JSON: ${(error as Error).message}`,
        'INVALID_JSON',
        fieldName.toLowerCase(),
        'valid JSON',
        value
      ),
    };
  }
}

/**
 * Validate JSON against a schema (basic implementation)
 */
export function validateJsonSchema(
  value: any,
  schema: Record<string, ValidatorFunction>,
  fieldName: string = 'JSON'
): ValidationResult {
  return validateObject(value, {
    fieldName,
    schema,
  });
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Run multiple validators in sequence
 */
export async function runValidators(
  value: any,
  validators: ValidatorFunction[],
  context?: ValidationContext
): Promise<ValidationResult> {
  const results: ValidationResult[] = [];

  for (const validator of validators) {
    const result = await validator(value);
    results.push(result);

    // Stop on first error if context specifies it
    if (!result.valid && context?.metadata?.stopOnError) {
      break;
    }
  }

  return combineValidationResults(...results);
}
