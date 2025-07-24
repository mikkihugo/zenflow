/**
 * Comprehensive Input Validation System
 * Prevents injection attacks, validates data types, and sanitizes input
 */

import { CliError } from './cli-error.js';

export class InputValidator {
  constructor() {
    // Common validation patterns
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      nanoid: /^[a-zA-Z0-9_-]{8,21}$/,
      slug: /^[a-z0-9-]+$/,
      semver: /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/,
      projectId: /^[a-zA-Z0-9_-]+$/,
      fileName: /^[^<>:"/\\|?*\x00-\x1f]+$/,
      sqlSafe: /^[a-zA-Z0-9_-\s]+$/
    };

    // Dangerous patterns that should be rejected
    this.dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /'.*?'.*?[;<>&|]/gi,
      /".*?".*?[;<>&|]/gi,
      /\$\(.*?\)/gi,
      /`.*?`/gi
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /('|(\\'))|(;|--|\/\*|\*\/)/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi,
      /\b(or|and)\s+\d+\s*=\s*\d+/gi,
      /\b(or|and)\s+['"]\w+['"]s*=\s*['"]\w+['"]/gi
    ];
  }

  /**
   * Validate and sanitize string input
   */
  validateString(value, options = {}) {
    const {
      required = false,
      minLength = 0,
      maxLength = 10000,
      pattern = null,
      allowEmpty = !required,
      sanitize = true,
      fieldName = 'value'
    } = options;

    // Type check
    if (typeof value !== 'string') {
      if (required) {
        throw new CliError(`${fieldName} must be a string`, 'VALIDATION_ERROR');
      }
      return allowEmpty ? '' : null;
    }

    // Empty check
    if (!value.trim() && required) {
      throw new CliError(`${fieldName} is required`, 'VALIDATION_ERROR');
    }

    // Length validation
    if (value.length < minLength) {
      throw new CliError(`${fieldName} must be at least ${minLength} characters`, 'VALIDATION_ERROR');
    }

    if (value.length > maxLength) {
      throw new CliError(`${fieldName} must not exceed ${maxLength} characters`, 'VALIDATION_ERROR');
    }

    // Pattern validation
    if (pattern && !pattern.test(value)) {
      throw new CliError(`${fieldName} format is invalid`, 'VALIDATION_ERROR');
    }

    // Security validation
    if (this.containsDangerousContent(value)) {
      throw new CliError(`${fieldName} contains potentially dangerous content`, 'SECURITY_ERROR');
    }

    if (this.containsSqlInjection(value)) {
      throw new CliError(`${fieldName} contains potential SQL injection`, 'SECURITY_ERROR');
    }

    // Sanitization
    return sanitize ? this.sanitizeString(value) : value;
  }

  /**
   * Validate number input
   */
  validateNumber(value, options = {}) {
    const {
      required = false,
      min = -Infinity,
      max = Infinity,
      integer = false,
      fieldName = 'value'
    } = options;

    // Convert if string
    if (typeof value === 'string') {
      const parsed = integer ? parseInt(value, 10) : parseFloat(value);
      if (isNaN(parsed)) {
        if (required) {
          throw new CliError(`${fieldName} must be a valid number`, 'VALIDATION_ERROR');
        }
        return null;
      }
      value = parsed;
    }

    // Type check
    if (typeof value !== 'number') {
      if (required) {
        throw new CliError(`${fieldName} must be a number`, 'VALIDATION_ERROR');
      }
      return null;
    }

    // Range validation
    if (value < min) {
      throw new CliError(`${fieldName} must be at least ${min}`, 'VALIDATION_ERROR');
    }

    if (value > max) {
      throw new CliError(`${fieldName} must not exceed ${max}`, 'VALIDATION_ERROR');
    }

    // Integer validation
    if (integer && !Number.isInteger(value)) {
      throw new CliError(`${fieldName} must be an integer`, 'VALIDATION_ERROR');
    }

    return value;
  }

  /**
   * Validate boolean input
   */
  validateBoolean(value, options = {}) {
    const { required = false, fieldName = 'value' } = options;

    // Convert string representations
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) {
        return true;
      }
      if (['false', '0', 'no', 'off'].includes(lower)) {
        return false;
      }
    }

    // Type check
    if (typeof value !== 'boolean') {
      if (required) {
        throw new CliError(`${fieldName} must be a boolean`, 'VALIDATION_ERROR');
      }
      return null;
    }

    return value;
  }

  /**
   * Validate array input
   */
  validateArray(value, options = {}) {
    const {
      required = false,
      minItems = 0,
      maxItems = 1000,
      itemValidator = null,
      fieldName = 'value'
    } = options;

    // Type check
    if (!Array.isArray(value)) {
      if (required) {
        throw new CliError(`${fieldName} must be an array`, 'VALIDATION_ERROR');
      }
      return null;
    }

    // Length validation
    if (value.length < minItems) {
      throw new CliError(`${fieldName} must have at least ${minItems} items`, 'VALIDATION_ERROR');
    }

    if (value.length > maxItems) {
      throw new CliError(`${fieldName} must not exceed ${maxItems} items`, 'VALIDATION_ERROR');
    }

    // Item validation
    if (itemValidator) {
      return value.map((item, index) => {
        try {
          return itemValidator(item, { fieldName: `${fieldName}[${index}]` });
        } catch (error) {
          throw new CliError(`${fieldName}[${index}]: ${error.message}`, 'VALIDATION_ERROR');
        }
      });
    }

    return value;
  }

  /**
   * Validate object input
   */
  validateObject(value, schema = {}, options = {}) {
    const { required = false, fieldName = 'value' } = options;

    // Type check
    if (typeof value !== 'object' || value === null) {
      if (required) {
        throw new CliError(`${fieldName} must be an object`, 'VALIDATION_ERROR');
      }
      return null;
    }

    const result = {};

    // Validate each field in schema
    for (const [key, validator] of Object.entries(schema)) {
      try {
        const fieldValue = value[key];
        result[key] = validator(fieldValue, { fieldName: `${fieldName}.${key}` });
      } catch (error) {
        throw new CliError(`${fieldName}.${key}: ${error.message}`, 'VALIDATION_ERROR');
      }
    }

    return result;
  }

  /**
   * Check for dangerous content
   */
  containsDangerousContent(value) {
    return this.dangerousPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for SQL injection patterns
   */
  containsSqlInjection(value) {
    return this.sqlInjectionPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Sanitize string input
   */
  sanitizeString(value) {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\x00/g, '') // Remove null bytes
      .trim();
  }

  /**
   * Validate document data
   */
  validateDocumentData(data) {
    return this.validateObject(data, {
      documentType: (value) => this.validateString(value, {
        required: true,
        pattern: this.patterns.slug,
        maxLength: 50,
        fieldName: 'documentType'
      }),
      title: (value) => this.validateString(value, {
        required: true,
        minLength: 1,
        maxLength: 200,
        fieldName: 'title'
      }),
      content: (value) => this.validateString(value, {
        required: true,
        minLength: 1,
        maxLength: 100000,
        fieldName: 'content'
      }),
      metadata: (value) => value || {},
      authorId: (value) => this.validateString(value, {
        required: false,
        pattern: this.patterns.nanoid,
        fieldName: 'authorId'
      }),
      relevanceKeywords: (value) => this.validateArray(value || [], {
        required: false,
        maxItems: 20,
        itemValidator: (item) => this.validateString(item, {
          maxLength: 50,
          pattern: this.patterns.slug
        }),
        fieldName: 'relevanceKeywords'
      })
    }, { fieldName: 'document' });
  }

  /**
   * Validate decision data
   */
  validateDecisionData(data) {
    return this.validateObject(data, {
      objective: (value) => this.validateString(value, {
        required: true,
        minLength: 5,
        maxLength: 500,
        fieldName: 'objective'
      }),
      consensusResult: (value) => value, // Can be any object
      confidenceScore: (value) => this.validateNumber(value, {
        required: true,
        min: 0,
        max: 1,
        fieldName: 'confidenceScore'
      }),
      supportingQueens: (value) => this.validateArray(value, {
        required: true,
        minItems: 1,
        maxItems: 10,
        itemValidator: (item) => this.validateString(item, {
          pattern: this.patterns.slug,
          maxLength: 50
        }),
        fieldName: 'supportingQueens'
      }),
      dissentingQueens: (value) => this.validateArray(value || [], {
        required: false,
        maxItems: 10,
        itemValidator: (item) => this.validateString(item, {
          pattern: this.patterns.slug,
          maxLength: 50
        }),
        fieldName: 'dissentingQueens'
      }),
      reasoning: (value) => this.validateString(value, {
        required: true,
        minLength: 10,
        maxLength: 5000,
        fieldName: 'reasoning'
      }),
      documentReferences: (value) => this.validateArray(value || [], {
        required: false,
        maxItems: 50,
        fieldName: 'documentReferences'
      })
    }, { fieldName: 'decision' });
  }

  /**
   * Validate query parameters
   */
  validateQueryParams(params) {
    return this.validateObject(params, {
      query: (value) => this.validateString(value || '', {
        required: false,
        maxLength: 1000,
        fieldName: 'query'
      }),
      documentType: (value) => this.validateString(value || '', {
        required: false,
        pattern: this.patterns.slug,
        maxLength: 50,
        fieldName: 'documentType'
      }),
      status: (value) => this.validateString(value || '', {
        required: false,
        pattern: this.patterns.slug,
        maxLength: 50,
        fieldName: 'status'
      }),
      limit: (value) => this.validateNumber(value || 50, {
        required: false,
        integer: true,
        min: 1,
        max: 1000,
        fieldName: 'limit'
      })
    }, { fieldName: 'queryParams' });
  }

  /**
   * Validate project ID
   */
  validateProjectId(projectId) {
    return this.validateString(projectId, {
      required: true,
      pattern: this.patterns.projectId,
      minLength: 1,
      maxLength: 100,
      fieldName: 'projectId'
    });
  }

  /**
   * Validate file path
   */
  validateFilePath(filePath) {
    const validated = this.validateString(filePath, {
      required: true,
      pattern: this.patterns.fileName,
      maxLength: 500,
      fieldName: 'filePath'
    });

    // Additional path traversal protection
    if (validated.includes('..') || validated.includes('//')) {
      throw new CliError('File path contains invalid sequences', 'SECURITY_ERROR');
    }

    return validated;
  }
}

// Export singleton instance
export const inputValidator = new InputValidator();