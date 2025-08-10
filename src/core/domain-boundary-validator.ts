/**
 * @file Domain Boundary Validator - Critical Infrastructure for Phase 0
 * 
 * Implements comprehensive runtime type validation at domain boundaries,
 * contract enforcement for domain operations, and domain crossing monitoring.
 * 
 * This is the foundation system that all subsequent phases build upon.
 * 
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Type safety across domain boundaries
 * - Runtime contract validation 
 * - Performance optimized for production
 * - Comprehensive error handling and logging
 * - Integration with existing domain types system
 */

import { getLogger } from '../config/logging-config';
import type { Logger } from '../config/logging-config';
import type { Agent, Task } from '../coordination/types';
import type { WorkflowDefinition, WorkflowContext } from '../workflows/types';

// ============================================================================
// CORE TYPE SYSTEM - Foundation for all domain validation
// ============================================================================

/**
 * Schema definition for runtime type validation
 */
export interface TypeSchema<T = any> {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined' | 'function';
  required?: boolean;
  properties?: { [K in keyof T]?: TypeSchema<T[K]> };
  items?: TypeSchema;
  enum?: T[];
  validator?: (value: any) => boolean;
  transform?: (value: any) => T;
  description?: string;
}

/**
 * Result type for domain operations with comprehensive error handling
 */
export type Result<T = any, E = Error> = {
  success: true;
  data: T;
  metadata?: DomainMetadata;
} | {
  success: false;
  error: E;
  metadata?: DomainMetadata;
};

/**
 * Domain metadata for operation tracking and debugging
 */
export interface DomainMetadata {
  domainFrom?: Domain;
  domainTo?: Domain;
  operation: string;
  timestamp: Date;
  validationTime: number;
  crossingId: string;
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Performance metrics for optimization and monitoring
 */
export interface PerformanceMetrics {
  validationTimeMs: number;
  schemaComplexity: number;
  dataSize: number;
  cacheHit?: boolean;
  errorCount: number;
}

/**
 * Domain enumeration covering all system domains
 */
export enum Domain {
  COORDINATION = 'coordination',
  WORKFLOWS = 'workflows', 
  NEURAL = 'neural',
  DATABASE = 'database',
  MEMORY = 'memory',
  KNOWLEDGE = 'knowledge',
  OPTIMIZATION = 'optimization',
  INTERFACES = 'interfaces',
  CORE = 'core'
}

/**
 * Domain operation definition with contracts
 */
export interface DomainOperation {
  id: string;
  sourceDomain: Domain;
  targetDomain: Domain;
  operationType: 'read' | 'write' | 'execute' | 'transform' | 'validate';
  inputSchema: TypeSchema;
  outputSchema: TypeSchema;
  contractValidation: ContractRule[];
  metadata: {
    description: string;
    version: string;
    rateLimit?: number;
    timeout?: number;
    retryPolicy?: RetryPolicy;
  };
}

/**
 * Contract validation rules for domain operations
 */
export interface ContractRule {
  name: string;
  description: string;
  validator: (input: any, context: DomainContext) => Promise<boolean>;
  severity: 'error' | 'warning' | 'info';
  errorMessage: string;
}

/**
 * Domain context for validation operations
 */
export interface DomainContext {
  currentDomain: Domain;
  operation: string;
  timestamp: Date;
  requestId: string;
  metadata?: Record<string, any>;
}

/**
 * Retry policy for failed operations
 */
export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
}

// ============================================================================
// DOMAIN BOUNDARY INTERFACE - Core contract for all boundary validation
// ============================================================================

/**
 * Core domain boundary interface that all domains must implement
 */
export interface DomainBoundary {
  /**
   * Validate input data against a schema with runtime type checking
   */
  validateInput<T>(data: unknown, schema: TypeSchema<T>): T;

  /**
   * Enforce contract rules for domain operations
   */
  enforceContract(operation: DomainOperation): Promise<Result>;

  /**
   * Track domain crossings for architecture compliance monitoring
   */
  trackCrossings(from: Domain, to: Domain, operation: string): void;
}

// ============================================================================
// VALIDATION ERROR SYSTEM - Comprehensive error handling
// ============================================================================

/**
 * Domain validation error with rich context
 */
export class DomainValidationError extends Error {
  public readonly code: string;
  public readonly domain: Domain;
  public readonly operation: string;
  public readonly validationPath: string[];
  public readonly actualValue: any;
  public readonly expectedType: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    domain: Domain,
    operation: string,
    validationPath: string[] = [],
    actualValue?: any,
    expectedType?: string
  ) {
    super(message);
    this.name = 'DomainValidationError';
    this.code = code;
    this.domain = domain;
    this.operation = operation;
    this.validationPath = validationPath;
    this.actualValue = actualValue;
    this.expectedType = expectedType || 'unknown';
    this.timestamp = new Date();
  }
}

/**
 * Contract violation error for operation enforcement
 */
export class ContractViolationError extends Error {
  public readonly contractRule: string;
  public readonly domain: Domain;
  public readonly operation: string;
  public readonly severity: 'error' | 'warning' | 'info';
  public readonly timestamp: Date;

  constructor(
    message: string,
    contractRule: string,
    domain: Domain,
    operation: string,
    severity: 'error' | 'warning' | 'info' = 'error'
  ) {
    super(message);
    this.name = 'ContractViolationError';
    this.contractRule = contractRule;
    this.domain = domain;
    this.operation = operation;
    this.severity = severity;
    this.timestamp = new Date();
  }
}

// ============================================================================
// DOMAIN BOUNDARY VALIDATOR IMPLEMENTATION - Production-grade validator
// ============================================================================

/**
 * Production-grade domain boundary validator with comprehensive features
 */
export class DomainBoundaryValidator implements DomainBoundary {
  private readonly logger: Logger;
  private readonly validationCache = new Map<string, any>();
  private readonly crossingLog: DomainCrossing[] = [];
  private readonly performanceMetrics = new Map<string, PerformanceMetrics>();

  // Performance optimization settings
  private readonly cacheEnabled: boolean = true;
  private readonly maxCacheSize: number = 1000;
  private readonly maxCrossingLogSize: number = 10000;

  constructor(
    private readonly domain: Domain,
    options: {
      cacheEnabled?: boolean;
      maxCacheSize?: number;
      maxCrossingLogSize?: number;
    } = {}
  ) {
    this.logger = getLogger(`domain-boundary-${domain}`);
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.maxCacheSize = options.maxCacheSize ?? 1000;
    this.maxCrossingLogSize = options.maxCrossingLogSize ?? 10000;

    this.logger.info(`Initialized domain boundary validator for ${domain}`, {
      cacheEnabled: this.cacheEnabled,
      maxCacheSize: this.maxCacheSize
    });
  }

  /**
   * Validate input data against schema with comprehensive runtime checking
   */
  public validateInput<T>(data: unknown, schema: TypeSchema<T>): T {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, schema);

    // Check cache first for performance
    if (this.cacheEnabled && this.validationCache.has(cacheKey)) {
      this.logger.debug('Cache hit for validation', { cacheKey });
      return this.validationCache.get(cacheKey);
    }

    try {
      const result = this.performValidation(data, schema, []);
      const validationTime = Date.now() - startTime;

      // Cache successful validation
      if (this.cacheEnabled) {
        this.updateCache(cacheKey, result);
      }

      // Track performance metrics
      this.updatePerformanceMetrics(schema.description || 'unknown', {
        validationTimeMs: validationTime,
        schemaComplexity: this.calculateSchemaComplexity(schema),
        dataSize: this.estimateDataSize(data),
        cacheHit: false,
        errorCount: 0
      });

      this.logger.debug('Validation successful', {
        domain: this.domain,
        validationTime,
        schemaType: schema.type
      });

      return result;

    } catch (error) {
      const validationTime = Date.now() - startTime;
      
      // Track failed validation metrics
      this.updatePerformanceMetrics(schema.description || 'unknown', {
        validationTimeMs: validationTime,
        schemaComplexity: this.calculateSchemaComplexity(schema),
        dataSize: this.estimateDataSize(data),
        cacheHit: false,
        errorCount: 1
      });

      this.logger.error('Validation failed', {
        domain: this.domain,
        error: error instanceof Error ? error.message : String(error),
        validationTime,
        dataType: typeof data
      });

      throw error;
    }
  }

  /**
   * Enforce contract rules for domain operations
   */
  public async enforceContract(operation: DomainOperation): Promise<Result> {
    const startTime = Date.now();
    const crossingId = this.generateCrossingId();

    this.logger.info('Enforcing contract', {
      operationId: operation.id,
      sourceDomain: operation.sourceDomain,
      targetDomain: operation.targetDomain,
      crossingId
    });

    try {
      // Create domain context for validation
      const context: DomainContext = {
        currentDomain: this.domain,
        operation: operation.id,
        timestamp: new Date(),
        requestId: crossingId,
        metadata: operation.metadata
      };

      // Validate all contract rules
      const violations: ContractViolationError[] = [];
      
      for (const rule of operation.contractValidation) {
        try {
          const isValid = await rule.validator(operation, context);
          
          if (!isValid) {
            const violation = new ContractViolationError(
              rule.errorMessage,
              rule.name,
              operation.sourceDomain,
              operation.id,
              rule.severity
            );
            violations.push(violation);

            this.logger.warn('Contract rule violation', {
              rule: rule.name,
              severity: rule.severity,
              operation: operation.id
            });
          }
        } catch (error) {
          const violation = new ContractViolationError(
            `Contract rule execution failed: ${error instanceof Error ? error.message : String(error)}`,
            rule.name,
            operation.sourceDomain,
            operation.id,
            'error'
          );
          violations.push(violation);
        }
      }

      // Check for blocking errors
      const errorViolations = violations.filter(v => v.severity === 'error');
      
      if (errorViolations.length > 0) {
        return {
          success: false,
          error: errorViolations[0],
          metadata: {
            domainFrom: operation.sourceDomain,
            domainTo: operation.targetDomain,
            operation: operation.id,
            timestamp: new Date(),
            validationTime: Date.now() - startTime,
            crossingId,
            performanceMetrics: {
              validationTimeMs: Date.now() - startTime,
              schemaComplexity: operation.contractValidation.length,
              dataSize: JSON.stringify(operation).length,
              errorCount: errorViolations.length
            }
          }
        };
      }

      // Log warnings for non-blocking violations
      const warnings = violations.filter(v => v.severity === 'warning');
      if (warnings.length > 0) {
        this.logger.warn('Contract warnings detected', {
          warningCount: warnings.length,
          operation: operation.id
        });
      }

      return {
        success: true,
        data: operation,
        metadata: {
          domainFrom: operation.sourceDomain,
          domainTo: operation.targetDomain,
          operation: operation.id,
          timestamp: new Date(),
          validationTime: Date.now() - startTime,
          crossingId,
          performanceMetrics: {
            validationTimeMs: Date.now() - startTime,
            schemaComplexity: operation.contractValidation.length,
            dataSize: JSON.stringify(operation).length,
            errorCount: 0
          }
        }
      };

    } catch (error) {
      this.logger.error('Contract enforcement failed', {
        operationId: operation.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          domainFrom: operation.sourceDomain,
          domainTo: operation.targetDomain,
          operation: operation.id,
          timestamp: new Date(),
          validationTime: Date.now() - startTime,
          crossingId
        }
      };
    }
  }

  /**
   * Track domain crossings for architecture compliance monitoring
   */
  public trackCrossings(from: Domain, to: Domain, operation: string): void {
    const crossing: DomainCrossing = {
      id: this.generateCrossingId(),
      fromDomain: from,
      toDomain: to,
      operation,
      timestamp: new Date(),
      currentDomain: this.domain
    };

    this.crossingLog.push(crossing);

    // Maintain log size limit for performance
    if (this.crossingLog.length > this.maxCrossingLogSize) {
      this.crossingLog.splice(0, this.crossingLog.length - this.maxCrossingLogSize);
    }

    this.logger.debug('Domain crossing tracked', {
      crossingId: crossing.id,
      from,
      to,
      operation,
      totalCrossings: this.crossingLog.length
    });
  }

  // ============================================================================
  // PUBLIC API EXTENSIONS - Additional functionality for comprehensive validation
  // ============================================================================

  /**
   * Get performance metrics for optimization
   */
  public getPerformanceMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  /**
   * Get domain crossing history for compliance analysis
   */
  public getDomainCrossings(limit?: number): DomainCrossing[] {
    const crossings = [...this.crossingLog];
    if (limit && limit > 0) {
      return crossings.slice(-limit);
    }
    return crossings;
  }

  /**
   * Clear caches and reset metrics (for testing/maintenance)
   */
  public reset(): void {
    this.validationCache.clear();
    this.crossingLog.length = 0;
    this.performanceMetrics.clear();
    this.logger.info('Domain boundary validator reset', {
      domain: this.domain
    });
  }

  /**
   * Get validation statistics
   */
  public getStatistics(): ValidationStatistics {
    const totalValidations = Array.from(this.performanceMetrics.values())
      .reduce((sum, metrics) => sum + (metrics.errorCount >= 0 ? 1 : 0), 0);
    
    const totalErrors = Array.from(this.performanceMetrics.values())
      .reduce((sum, metrics) => sum + metrics.errorCount, 0);
    
    const avgValidationTime = Array.from(this.performanceMetrics.values())
      .reduce((sum, metrics) => sum + metrics.validationTimeMs, 0) / Math.max(1, this.performanceMetrics.size);

    return {
      domain: this.domain,
      totalValidations,
      totalErrors,
      errorRate: totalValidations > 0 ? (totalErrors / totalValidations) : 0,
      averageValidationTime: avgValidationTime,
      cacheSize: this.validationCache.size,
      crossingCount: this.crossingLog.length,
      lastResetTime: new Date()
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION - Internal validation logic
  // ============================================================================

  private performValidation<T>(data: unknown, schema: TypeSchema<T>, path: string[]): T {
    // Handle null/undefined values
    if (data === null || data === undefined) {
      if (schema.type === 'null' || schema.type === 'undefined') {
        return data as T;
      }
      if (!schema.required) {
        return data as T;
      }
      throw new DomainValidationError(
        `Required value is ${data}`,
        'REQUIRED_VALUE_MISSING',
        this.domain,
        'validation',
        path,
        data,
        schema.type
      );
    }

    // Type-specific validation
    switch (schema.type) {
      case 'string':
        if (typeof data !== 'string') {
          throw new DomainValidationError(
            `Expected string, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'string'
          );
        }
        break;

      case 'number':
        if (typeof data !== 'number' || isNaN(data)) {
          throw new DomainValidationError(
            `Expected number, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'number'
          );
        }
        break;

      case 'boolean':
        if (typeof data !== 'boolean') {
          throw new DomainValidationError(
            `Expected boolean, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'boolean'
          );
        }
        break;

      case 'object':
        if (typeof data !== 'object' || Array.isArray(data)) {
          throw new DomainValidationError(
            `Expected object, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'object'
          );
        }
        
        // Validate object properties
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (propSchema) {
              const propData = (data as any)[key];
              this.performValidation(propData, propSchema, [...path, key]);
            }
          }
        }
        break;

      case 'array':
        if (!Array.isArray(data)) {
          throw new DomainValidationError(
            `Expected array, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'array'
          );
        }
        
        // Validate array items
        if (schema.items) {
          data.forEach((item, index) => {
            this.performValidation(item, schema.items!, [...path, index.toString()]);
          });
        }
        break;

      case 'function':
        if (typeof data !== 'function') {
          throw new DomainValidationError(
            `Expected function, got ${typeof data}`,
            'TYPE_MISMATCH',
            this.domain,
            'validation',
            path,
            data,
            'function'
          );
        }
        break;
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data as T)) {
      throw new DomainValidationError(
        `Value not in allowed enum values`,
        'ENUM_VIOLATION',
        this.domain,
        'validation',
        path,
        data,
        `enum: ${schema.enum.join(', ')}`
      );
    }

    // Custom validator
    if (schema.validator && !schema.validator(data)) {
      throw new DomainValidationError(
        `Custom validation failed`,
        'CUSTOM_VALIDATION_FAILED',
        this.domain,
        'validation',
        path,
        data,
        'custom validator'
      );
    }

    // Transform data if transformer provided
    if (schema.transform) {
      return schema.transform(data);
    }

    return data as T;
  }

  private generateCacheKey(data: unknown, schema: TypeSchema): string {
    // Create a deterministic cache key
    const dataStr = this.safeStringify(data);
    const schemaStr = this.safeStringify(schema);
    const dataHash = this.simpleHash(dataStr);
    const schemaHash = this.simpleHash(schemaStr);
    return `${dataHash}-${schemaHash}`;
  }

  private generateCrossingId(): string {
    return `crossing-${this.domain}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private simpleHash(str: string): string {
    if (!str || str.length === 0) return '0';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private safeStringify(obj: unknown): string {
    try {
      return JSON.stringify(obj, this.getCircularReplacer()) || 'null';
    } catch {
      return 'stringify-error';
    }
  }

  private getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }

  private calculateSchemaComplexity(schema: TypeSchema): number {
    let complexity = 1;
    
    if (schema.properties) {
      complexity += Object.keys(schema.properties).length;
      for (const propSchema of Object.values(schema.properties)) {
        if (propSchema) {
          complexity += this.calculateSchemaComplexity(propSchema);
        }
      }
    }
    
    if (schema.items) {
      complexity += this.calculateSchemaComplexity(schema.items);
    }
    
    if (schema.validator) complexity += 2;
    if (schema.transform) complexity += 2;
    if (schema.enum) complexity += schema.enum.length;
    
    return complexity;
  }

  private estimateDataSize(data: unknown): number {
    try {
      return this.safeStringify(data).length;
    } catch {
      return 0;
    }
  }

  private updateCache(key: string, value: any): void {
    // Implement LRU cache behavior
    if (this.validationCache.size >= this.maxCacheSize) {
      const firstKey = this.validationCache.keys().next().value;
      if (firstKey) {
        this.validationCache.delete(firstKey);
      }
    }
    this.validationCache.set(key, value);
  }

  private updatePerformanceMetrics(operation: string, metrics: PerformanceMetrics): void {
    const existing = this.performanceMetrics.get(operation);
    if (existing) {
      // Aggregate metrics
      const aggregated: PerformanceMetrics = {
        validationTimeMs: (existing.validationTimeMs + metrics.validationTimeMs) / 2,
        schemaComplexity: Math.max(existing.schemaComplexity, metrics.schemaComplexity),
        dataSize: Math.max(existing.dataSize, metrics.dataSize),
        errorCount: existing.errorCount + metrics.errorCount
      };
      this.performanceMetrics.set(operation, aggregated);
    } else {
      this.performanceMetrics.set(operation, metrics);
    }
  }
}

// ============================================================================
// SUPPORTING TYPES AND INTERFACES
// ============================================================================

/**
 * Domain crossing record for compliance tracking
 */
export interface DomainCrossing {
  id: string;
  fromDomain: Domain;
  toDomain: Domain;
  operation: string;
  timestamp: Date;
  currentDomain: Domain;
}

/**
 * Validation statistics for monitoring and optimization
 */
export interface ValidationStatistics {
  domain: Domain;
  totalValidations: number;
  totalErrors: number;
  errorRate: number;
  averageValidationTime: number;
  cacheSize: number;
  crossingCount: number;
  lastResetTime: Date;
}

// ============================================================================
// FACTORY AND REGISTRY - Centralized validator management
// ============================================================================

/**
 * Domain boundary validator factory and registry
 */
class DomainBoundaryValidatorRegistry {
  private static instance: DomainBoundaryValidatorRegistry;
  private readonly validators = new Map<Domain, DomainBoundaryValidator>();
  private readonly logger = getLogger('domain-boundary-registry');

  private constructor() {}

  public static getInstance(): DomainBoundaryValidatorRegistry {
    if (!DomainBoundaryValidatorRegistry.instance) {
      DomainBoundaryValidatorRegistry.instance = new DomainBoundaryValidatorRegistry();
    }
    return DomainBoundaryValidatorRegistry.instance;
  }

  /**
   * Get or create validator for a domain
   */
  public getValidator(domain: Domain): DomainBoundaryValidator {
    if (!this.validators.has(domain)) {
      const validator = new DomainBoundaryValidator(domain);
      this.validators.set(domain, validator);
      this.logger.info('Created new domain validator', { domain });
    }
    return this.validators.get(domain)!;
  }

  /**
   * Get all validators for system-wide operations
   */
  public getAllValidators(): Map<Domain, DomainBoundaryValidator> {
    return new Map(this.validators);
  }

  /**
   * Reset all validators (for testing/maintenance)
   */
  public resetAll(): void {
    for (const validator of this.validators.values()) {
      validator.reset();
    }
    this.logger.info('Reset all domain validators');
  }

  /**
   * Get system-wide validation statistics
   */
  public getSystemStatistics(): SystemValidationStatistics {
    const stats: SystemValidationStatistics = {
      totalDomains: this.validators.size,
      domainStatistics: new Map(),
      systemTotalValidations: 0,
      systemTotalErrors: 0,
      systemErrorRate: 0,
      systemAverageValidationTime: 0
    };

    let totalValidations = 0;
    let totalErrors = 0;
    let totalValidationTime = 0;

    for (const [domain, validator] of this.validators) {
      const domainStats = validator.getStatistics();
      stats.domainStatistics.set(domain, domainStats);
      
      totalValidations += domainStats.totalValidations;
      totalErrors += domainStats.totalErrors;
      totalValidationTime += domainStats.averageValidationTime * domainStats.totalValidations;
    }

    stats.systemTotalValidations = totalValidations;
    stats.systemTotalErrors = totalErrors;
    stats.systemErrorRate = totalValidations > 0 ? (totalErrors / totalValidations) : 0;
    stats.systemAverageValidationTime = totalValidations > 0 ? (totalValidationTime / totalValidations) : 0;

    return stats;
  }
}

/**
 * System-wide validation statistics
 */
export interface SystemValidationStatistics {
  totalDomains: number;
  domainStatistics: Map<Domain, ValidationStatistics>;
  systemTotalValidations: number;
  systemTotalErrors: number;
  systemErrorRate: number;
  systemAverageValidationTime: number;
}

// ============================================================================
// COMMON SCHEMA DEFINITIONS - Reusable schemas for domain types
// ============================================================================

/**
 * Common schema definitions for existing domain types
 */
export const CommonSchemas = {
  /**
   * Agent schema for coordination domain
   */
  Agent: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      capabilities: { 
        type: 'array', 
        required: true,
        items: { type: 'string' }
      },
      status: { 
        type: 'string', 
        required: true,
        enum: ['idle', 'busy']
      }
    }
  } as TypeSchema<Agent>,

  /**
   * Task schema for coordination domain
   */
  Task: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      description: { type: 'string', required: true },
      strategy: { 
        type: 'string', 
        required: true,
        enum: ['parallel', 'sequential', 'adaptive', 'consensus']
      },
      dependencies: { 
        type: 'array', 
        required: true,
        items: { type: 'string' }
      },
      requiredCapabilities: { 
        type: 'array', 
        required: true,
        items: { type: 'string' }
      },
      maxAgents: { type: 'number', required: true },
      requireConsensus: { type: 'boolean', required: true }
    }
  } as TypeSchema<Task>,

  /**
   * WorkflowDefinition schema for workflows domain
   */
  WorkflowDefinition: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      version: { type: 'string', required: true }
      // Additional properties would be defined based on the actual WorkflowDefinition interface
    }
  } as TypeSchema<Pick<WorkflowDefinition, 'id' | 'name' | 'version'>>
} as const;

// ============================================================================
// EXPORTS - Public API
// ============================================================================

// Export the singleton registry
export const domainValidatorRegistry = DomainBoundaryValidatorRegistry.getInstance();

// Convenience function for getting domain validators
export function getDomainValidator(domain: Domain): DomainBoundaryValidator {
  return domainValidatorRegistry.getValidator(domain);
}

// Convenience function for cross-domain validation
export function validateCrossDomain<T>(
  data: unknown,
  schema: TypeSchema<T>,
  fromDomain: Domain,
  toDomain: Domain,
  operation: string
): T {
  const validator = getDomainValidator(fromDomain);
  validator.trackCrossings(fromDomain, toDomain, operation);
  return validator.validateInput(data, schema);
}

export default DomainBoundaryValidator;