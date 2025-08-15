/**
 * @file Domain Boundary Validator Tests
 *
 * Comprehensive test suite for the domain boundary validation system.
 * Tests all core functionality including type validation, contract enforcement,
 * domain crossing tracking, performance optimization, and error handling.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Agent, Task } from '../../coordination/types.ts';
import {
  CommonSchemas,
  type ContractRule,
  ContractViolationError,
  Domain,
  DomainBoundaryValidator,
  type DomainOperation,
  DomainValidationError,
  domainValidatorRegistry,
  getDomainValidator,
  Result,
  type TypeSchema,
  validateCrossDomain,
} from '../../core/domain-boundary-validator.ts';

describe('DomainBoundaryValidator', () => {
  let validator: DomainBoundaryValidator;

  beforeEach(() => {
    validator = new DomainBoundaryValidator(Domain.CORE);
  });

  afterEach(() => {
    validator.reset();
  });

  // ============================================================================
  // TYPE VALIDATION TESTS
  // ============================================================================

  describe('validateInput', () => {
    test('validates simple types correctly', () => {
      // String validation
      const stringSchema: TypeSchema<string> = {
        type: 'string',
        required: true,
      };
      expect(validator.validateInput('hello', stringSchema)).toBe('hello');

      // Number validation
      const numberSchema: TypeSchema<number> = {
        type: 'number',
        required: true,
      };
      expect(validator.validateInput(42, numberSchema)).toBe(42);

      // Boolean validation
      const booleanSchema: TypeSchema<boolean> = {
        type: 'boolean',
        required: true,
      };
      expect(validator.validateInput(true, booleanSchema)).toBe(true);
    });

    test('validates complex object types', () => {
      const objectSchema: TypeSchema = {
        type: 'object',
        required: true,
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true },
          active: { type: 'boolean', required: false },
        },
      };

      const validData = { name: 'John', age: 30, active: true };
      const result = validator.validateInput(validData, objectSchema);
      expect(result).toEqual(validData);
    });

    test('validates array types with item schemas', () => {
      const arraySchema: TypeSchema = {
        type: 'array',
        required: true,
        items: { type: 'string', required: true },
      };

      const validArray = ['item1', 'item2', 'item3'];
      const result = validator.validateInput(validArray, arraySchema);
      expect(result).toEqual(validArray);
    });

    test('validates enum values', () => {
      const enumSchema: TypeSchema<'idle' | 'busy'> = {
        type: 'string',
        required: true,
        enum: ['idle', 'busy'],
      };

      expect(validator.validateInput('idle', enumSchema)).toBe('idle');
      expect(validator.validateInput('busy', enumSchema)).toBe('busy');
    });

    test('throws DomainValidationError for invalid types', () => {
      const stringSchema: TypeSchema<string> = {
        type: 'string',
        required: true,
      };

      expect(() => {
        validator.validateInput(42, stringSchema);
      }).toThrow(DomainValidationError);
    });

    test('throws DomainValidationError for enum violations', () => {
      const enumSchema: TypeSchema<'valid'> = {
        type: 'string',
        required: true,
        enum: ['valid'],
      };

      expect(() => {
        validator.validateInput('invalid', enumSchema);
      }).toThrow(DomainValidationError);
    });

    test('handles optional fields correctly', () => {
      const optionalSchema: TypeSchema = {
        type: 'object',
        required: true,
        properties: {
          required: { type: 'string', required: true },
          optional: { type: 'string', required: false },
        },
      };

      const dataWithOptional = { required: 'test', optional: 'value' };
      const dataWithoutOptional = { required: 'test' };

      expect(validator.validateInput(dataWithOptional, optionalSchema)).toEqual(
        dataWithOptional
      );
      expect(
        validator.validateInput(dataWithoutOptional, optionalSchema)
      ).toEqual(dataWithoutOptional);
    });

    test('applies custom validators', () => {
      const customSchema: TypeSchema<string> = {
        type: 'string',
        required: true,
        validator: (value: unknown) =>
          typeof value === 'string' && value.length > 5,
      };

      expect(validator.validateInput('longstring', customSchema)).toBe(
        'longstring'
      );

      expect(() => {
        validator.validateInput('short', customSchema);
      }).toThrow(DomainValidationError);
    });

    test('applies transformations', () => {
      const transformSchema: TypeSchema<string> = {
        type: 'string',
        required: true,
        transform: (value: unknown) =>
          typeof value === 'string'
            ? value.toUpperCase()
            : String(value).toUpperCase(),
      };

      expect(validator.validateInput('hello', transformSchema)).toBe('HELLO');
    });

    test('validates nested objects recursively', () => {
      const nestedSchema: TypeSchema = {
        type: 'object',
        required: true,
        properties: {
          user: {
            type: 'object',
            required: true,
            properties: {
              name: { type: 'string', required: true },
              profile: {
                type: 'object',
                required: true,
                properties: {
                  email: { type: 'string', required: true },
                },
              },
            },
          },
        },
      };

      const validNestedData = {
        user: {
          name: 'John',
          profile: {
            email: 'john@example.com',
          },
        },
      };

      expect(validator.validateInput(validNestedData, nestedSchema)).toEqual(
        validNestedData
      );
    });
  });

  // ============================================================================
  // CONTRACT ENFORCEMENT TESTS
  // ============================================================================

  describe('enforceContract', () => {
    test('enforces contract rules successfully', async () => {
      const validRule: ContractRule = {
        name: 'test-rule',
        description: 'Always passes',
        validator: async () => true,
        severity: 'error',
        errorMessage: 'This should not appear',
      };

      const operation: DomainOperation = {
        id: 'test-operation',
        sourceDomain: Domain.CORE,
        targetDomain: Domain.COORDINATION,
        operationType: 'read',
        inputSchema: { type: 'string' },
        outputSchema: { type: 'string' },
        contractValidation: [validRule],
        metadata: {
          description: 'Test operation',
          version: '1.0.0',
        },
      };

      const result = await validator.enforceContract(operation);
      expect(result.success).toBe(true);
      expect(result.metadata?.operation).toBe('test-operation');
    });

    test('fails contract enforcement on rule violations', async () => {
      const invalidRule: ContractRule = {
        name: 'failing-rule',
        description: 'Always fails',
        validator: async () => false,
        severity: 'error',
        errorMessage: 'Contract rule failed',
      };

      const operation: DomainOperation = {
        id: 'test-operation',
        sourceDomain: Domain.CORE,
        targetDomain: Domain.COORDINATION,
        operationType: 'write',
        inputSchema: { type: 'string' },
        outputSchema: { type: 'string' },
        contractValidation: [invalidRule],
        metadata: {
          description: 'Test operation',
          version: '1.0.0',
        },
      };

      const result = await validator.enforceContract(operation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ContractViolationError);
        expect((result.error as ContractViolationError).contractRule).toBe(
          'failing-rule'
        );
      }
    });

    test('handles warnings without blocking operation', async () => {
      const warningRule: ContractRule = {
        name: 'warning-rule',
        description: 'Generates warning',
        validator: async () => false,
        severity: 'warning',
        errorMessage: 'This is a warning',
      };

      const operation: DomainOperation = {
        id: 'test-operation',
        sourceDomain: Domain.CORE,
        targetDomain: Domain.COORDINATION,
        operationType: 'read',
        inputSchema: { type: 'string' },
        outputSchema: { type: 'string' },
        contractValidation: [warningRule],
        metadata: {
          description: 'Test operation',
          version: '1.0.0',
        },
      };

      const result = await validator.enforceContract(operation);
      expect(result.success).toBe(true);
      // Operation should succeed despite warning
    });

    test('handles multiple contract rules', async () => {
      const rules: ContractRule[] = [
        {
          name: 'rule1',
          description: 'First rule',
          validator: async () => true,
          severity: 'error',
          errorMessage: 'Rule 1 failed',
        },
        {
          name: 'rule2',
          description: 'Second rule',
          validator: async () => true,
          severity: 'warning',
          errorMessage: 'Rule 2 warning',
        },
      ];

      const operation: DomainOperation = {
        id: 'multi-rule-operation',
        sourceDomain: Domain.CORE,
        targetDomain: Domain.WORKFLOWS,
        operationType: 'execute',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        contractValidation: rules,
        metadata: {
          description: 'Multi-rule operation',
          version: '1.0.0',
        },
      };

      const result = await validator.enforceContract(operation);
      expect(result.success).toBe(true);
    });

    test('handles contract rule execution errors', async () => {
      const errorRule: ContractRule = {
        name: 'error-rule',
        description: 'Throws error',
        validator: async () => {
          throw new Error('Rule execution failed');
        },
        severity: 'error',
        errorMessage: 'Rule failed',
      };

      const operation: DomainOperation = {
        id: 'error-operation',
        sourceDomain: Domain.CORE,
        targetDomain: Domain.MEMORY,
        operationType: 'write',
        inputSchema: { type: 'string' },
        outputSchema: { type: 'string' },
        contractValidation: [errorRule],
        metadata: {
          description: 'Error operation',
          version: '1.0.0',
        },
      };

      const result = await validator.enforceContract(operation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ContractViolationError);
      }
    });
  });

  // ============================================================================
  // DOMAIN CROSSING TRACKING TESTS
  // ============================================================================

  describe('trackCrossings', () => {
    test('tracks domain crossings correctly', () => {
      validator.trackCrossings(
        Domain.CORE,
        Domain.COORDINATION,
        'test-operation'
      );

      const crossings = validator.getDomainCrossings();
      expect(crossings).toHaveLength(1);
      expect(crossings[0]?.fromDomain).toBe(Domain.CORE);
      expect(crossings[0]?.toDomain).toBe(Domain.COORDINATION);
      expect(crossings[0]?.operation).toBe('test-operation');
      expect(crossings[0]?.currentDomain).toBe(Domain.CORE);
    });

    test('maintains crossing log size limit', () => {
      const smallValidator = new DomainBoundaryValidator(Domain.CORE, {
        maxCrossingLogSize: 5,
      });

      // Add more crossings than the limit
      for (let i = 0; i < 10; i++) {
        smallValidator.trackCrossings(
          Domain.CORE,
          Domain.COORDINATION,
          `operation-${i}`
        );
      }

      const crossings = smallValidator.getDomainCrossings();
      expect(crossings).toHaveLength(5);
      expect(crossings[0]?.operation).toBe('operation-5'); // Older entries should be removed
    });

    test('returns limited crossings when requested', () => {
      for (let i = 0; i < 5; i++) {
        validator.trackCrossings(
          Domain.CORE,
          Domain.COORDINATION,
          `operation-${i}`
        );
      }

      const limitedCrossings = validator.getDomainCrossings(3);
      expect(limitedCrossings).toHaveLength(3);
    });
  });

  // ============================================================================
  // PERFORMANCE AND CACHING TESTS
  // ============================================================================

  describe('performance and caching', () => {
    test('caches validation results for performance', () => {
      const schema: TypeSchema<string> = { type: 'string', required: true };
      const data = 'test-string';

      // First validation
      const result1 = validator.validateInput(data, schema);

      // Second validation should use cache
      const result2 = validator.validateInput(data, schema);

      expect(result1).toBe(result2);
      expect(result1).toBe(data);
    });

    test('tracks performance metrics', () => {
      const schema: TypeSchema<string> = {
        type: 'string',
        required: true,
        description: 'test-operation',
      };

      validator.validateInput('test', schema);

      const metrics = validator.getPerformanceMetrics();
      expect(metrics.has('test-operation')).toBe(true);

      const operationMetrics = metrics.get('test-operation')!;
      expect(operationMetrics.validationTimeMs).toBeGreaterThanOrEqual(0);
      expect(operationMetrics.errorCount).toBe(0);
    });

    test('provides validation statistics', () => {
      const schema: TypeSchema<string> = { type: 'string', required: true };

      validator.validateInput('test1', schema);
      validator.validateInput('test2', schema);
      validator.trackCrossings(Domain.CORE, Domain.COORDINATION, 'test-op');

      const stats = validator.getStatistics();
      expect(stats.domain).toBe(Domain.CORE);
      expect(stats.totalValidations).toBeGreaterThan(0);
      expect(stats.crossingCount).toBe(1);
    });

    test('respects cache size limits', () => {
      const smallCacheValidator = new DomainBoundaryValidator(Domain.CORE, {
        maxCacheSize: 2,
      });

      const schema: TypeSchema<string> = { type: 'string', required: true };

      // Fill cache beyond limit
      smallCacheValidator.validateInput('test1', schema);
      smallCacheValidator.validateInput('test2', schema);
      smallCacheValidator.validateInput('test3', schema); // Should evict oldest

      const stats = smallCacheValidator.getStatistics();
      expect(stats.cacheSize).toBeLessThanOrEqual(2);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('error handling', () => {
    test('DomainValidationError contains comprehensive context', () => {
      const schema: TypeSchema<string> = { type: 'string', required: true };

      try {
        validator.validateInput(42, schema);
        throw new Error('Expected DomainValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        const domainError = error as DomainValidationError;

        expect(domainError.domain).toBe(Domain.CORE);
        expect(domainError.operation).toBe('validation');
        expect(domainError.actualValue).toBe(42);
        expect(domainError.expectedType).toBe('string');
        expect(domainError.code).toBe('TYPE_MISMATCH');
        expect(domainError.timestamp).toBeInstanceOf(Date);
      }
    });

    test('ContractViolationError contains rule context', () => {
      const error = new ContractViolationError(
        'Test violation',
        'test-rule',
        Domain.CORE,
        'test-operation',
        'warning'
      );

      expect(error.contractRule).toBe('test-rule');
      expect(error.domain).toBe(Domain.CORE);
      expect(error.operation).toBe('test-operation');
      expect(error.severity).toBe('warning');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    test('handles validation path for nested objects', () => {
      const nestedSchema: TypeSchema = {
        type: 'object',
        required: true,
        properties: {
          nested: {
            type: 'object',
            required: true,
            properties: {
              value: { type: 'string', required: true },
            },
          },
        },
      };

      const invalidData = {
        nested: {
          value: 42, // Should be string
        },
      };

      try {
        validator.validateInput(invalidData, nestedSchema);
        throw new Error('Expected DomainValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        const domainError = error as DomainValidationError;
        expect(domainError.validationPath).toEqual(['nested', 'value']);
      }
    });
  });

  // ============================================================================
  // COMMON SCHEMAS TESTS
  // ============================================================================

  describe('CommonSchemas', () => {
    test('validates Agent objects correctly', () => {
      const validAgent: Agent = {
        id: 'agent-1',
        capabilities: {
          codeGeneration: true,
          codeReview: false,
          testing: true,
          documentation: false,
          research: false,
          analysis: false,
          webSearch: false,
          apiIntegration: false,
          fileSystem: true,
          terminalAccess: false,
          languages: ['typescript', 'javascript'],
          frameworks: ['node'],
          domains: ['testing'],
          tools: ['vitest'],
          maxConcurrentTasks: 5,
          maxMemoryUsage: 1024,
          maxExecutionTime: 30000,
          reliability: 0.95,
          speed: 0.8,
          quality: 0.9,
        },
        status: 'idle',
      };

      const result = validator.validateInput(validAgent, CommonSchemas.Agent);
      expect(result).toEqual(validAgent);
    });

    test('validates Task objects correctly', () => {
      const validTask: Task = {
        id: 'task-1',
        description: 'Test task',
        strategy: 'parallel',
        dependencies: [],
        requiredCapabilities: ['capability1'],
        maxAgents: 5,
        requireConsensus: false,
      };

      const result = validator.validateInput(validTask, CommonSchemas.Task);
      expect(result).toEqual(validTask);
    });

    test('rejects invalid Agent status', () => {
      const invalidAgent = {
        id: 'agent-1',
        capabilities: ['task1'],
        status: 'invalid-status',
      };

      expect(() => {
        validator.validateInput(invalidAgent, CommonSchemas.Agent);
      }).toThrow(DomainValidationError);
    });
  });

  // ============================================================================
  // REGISTRY TESTS
  // ============================================================================

  describe('DomainBoundaryValidatorRegistry', () => {
    afterEach(() => {
      domainValidatorRegistry.resetAll();
    });

    test('provides singleton validators for domains', () => {
      const validator1 = getDomainValidator(Domain.COORDINATION);
      const validator2 = getDomainValidator(Domain.COORDINATION);

      expect(validator1).toBe(validator2); // Should be same instance
    });

    test('provides different validators for different domains', () => {
      const coreValidator = getDomainValidator(Domain.CORE);
      const coordValidator = getDomainValidator(Domain.COORDINATION);

      expect(coreValidator).not.toBe(coordValidator);
    });

    test('provides system-wide statistics', () => {
      const coreValidator = getDomainValidator(Domain.CORE);
      const coordValidator = getDomainValidator(Domain.COORDINATION);

      // Perform some validations
      const schema: TypeSchema<string> = { type: 'string', required: true };
      coreValidator.validateInput('test', schema);
      coordValidator.validateInput('test', schema);

      const systemStats = domainValidatorRegistry.getSystemStatistics();
      expect(systemStats.totalDomains).toBeGreaterThanOrEqual(2);
      expect(systemStats.systemTotalValidations).toBeGreaterThanOrEqual(2);
    });

    test('resets all validators', () => {
      const validator1 = getDomainValidator(Domain.CORE);
      validator1.trackCrossings(Domain.CORE, Domain.COORDINATION, 'test');

      expect(validator1.getDomainCrossings()).toHaveLength(1);

      domainValidatorRegistry.resetAll();

      expect(validator1.getDomainCrossings()).toHaveLength(0);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('validateCrossDomain integration function', () => {
    test('validates cross-domain operations', () => {
      const schema: TypeSchema<string> = { type: 'string', required: true };
      const data = 'test-data';

      const result = validateCrossDomain(
        data,
        schema,
        Domain.CORE,
        Domain.COORDINATION,
        'cross-domain-test'
      );

      expect(result).toBe(data);

      // Verify crossing was tracked
      const coreValidator = getDomainValidator(Domain.CORE);
      const crossings = coreValidator.getDomainCrossings();
      expect(crossings).toHaveLength(1);
      expect(crossings[0]?.operation).toBe('cross-domain-test');
    });
  });

  describe('realistic integration scenarios', () => {
    test('coordination to workflows domain operation', async () => {
      const coordValidator = getDomainValidator(Domain.COORDINATION);

      // Define a realistic contract rule
      const workflowAccessRule: ContractRule = {
        name: 'workflow-access-validation',
        description: 'Validates that coordination domain can access workflows',
        validator: async (operation, context) => {
          return context.currentDomain === Domain.COORDINATION;
        },
        severity: 'error',
        errorMessage: 'Unauthorized workflow access',
      };

      const operation: DomainOperation = {
        id: 'coord-to-workflow',
        sourceDomain: Domain.COORDINATION,
        targetDomain: Domain.WORKFLOWS,
        operationType: 'execute',
        inputSchema: CommonSchemas.Task,
        outputSchema: {
          type: 'object',
          properties: { success: { type: 'boolean' } },
        },
        contractValidation: [workflowAccessRule],
        metadata: {
          description: 'Execute workflow from coordination',
          version: '1.0.0',
        },
      };

      const result = await coordValidator.enforceContract(operation);
      expect(result.success).toBe(true);
    });

    test('handles complex validation with multiple domains', () => {
      const complexSchema: TypeSchema = {
        type: 'object',
        required: true,
        properties: {
          agent: { type: 'object' },
          task: { type: 'object' },
          metadata: {
            type: 'object',
            properties: {
              timestamp: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
              },
            },
          },
        },
      };

      const complexData = {
        agent: {
          id: 'agent-1',
          capabilities: ['planning', 'execution'],
          status: 'busy',
        },
        task: {
          id: 'complex-task',
          description: 'Multi-domain task',
          strategy: 'adaptive',
          dependencies: [],
          requiredCapabilities: ['planning'],
          maxAgents: 1,
          requireConsensus: false,
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          priority: 'high',
        },
      };

      const result = validator.validateInput(complexData, complexSchema);
      expect(result).toEqual(complexData);
    });
  });

  // ============================================================================
  // EDGE CASES AND STRESS TESTS
  // ============================================================================

  describe('edge cases', () => {
    test('handles null and undefined values correctly', () => {
      const nullableSchema: TypeSchema = { type: 'null', required: false };
      const undefinedSchema: TypeSchema = {
        type: 'undefined',
        required: false,
      };

      expect(validator.validateInput(null, nullableSchema)).toBe(null);
      expect(validator.validateInput(undefined, undefinedSchema)).toBe(
        undefined
      );
    });

    test('handles empty arrays and objects', () => {
      const arraySchema: TypeSchema = {
        type: 'array',
        items: { type: 'string' },
      };
      const objectSchema: TypeSchema = {
        type: 'object',
        properties: {},
      };

      expect(validator.validateInput([], arraySchema)).toEqual([]);
      expect(validator.validateInput({}, objectSchema)).toEqual({});
    });

    test('handles circular references gracefully', () => {
      const circularObj: unknown = { name: 'test' };
      (circularObj as any).self = circularObj;

      const schema: TypeSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          // Don't validate the circular reference
        },
      };

      // Should not throw due to circular reference in data size estimation
      expect(() => {
        validator.validateInput(circularObj, schema);
      }).not.toThrow();
    });

    test('handles very large data sets', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      const arraySchema: TypeSchema = {
        type: 'array',
        items: { type: 'string' },
      };

      const result = validator.validateInput(largeArray, arraySchema);
      expect(result).toHaveLength(1000);
      expect(result[0]).toBe('item-0');
      expect(result[999]).toBe('item-999');
    });
  });
});
