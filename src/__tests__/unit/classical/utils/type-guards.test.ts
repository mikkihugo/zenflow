/**
 * Type Guards Unit Tests
 *
 * Comprehensive test suite for union type safety guards
 * Following Classical TDD approach for algorithmic verification
 */

import {
  // Database type guards
  DatabaseResult,
  QuerySuccess,
  QueryError,
  isQuerySuccess,
  isQueryError,
  // Memory type guards
  MemoryResult,
  MemorySuccess,
  MemoryNotFound,
  MemoryError,
  isMemorySuccess,
  isMemoryNotFound,
  isMemoryError,
  // Neural type guards
  NeuralResult,
  TrainingResult,
  InferenceResult,
  NeuralError,
  isTrainingResult,
  isInferenceResult,
  isNeuralError,
  // API type guards
  APIResult,
  APISuccess,
  APIError,
  isAPISuccess,
  isAPIError,
  // WASM type guards
  WasmResult,
  WasmSuccess,
  WasmError,
  isWasmSuccess,
  isWasmError,
  // Coordination type guards
  CoordinationResult,
  CoordinationSuccess,
  CoordinationError,
  isCoordinationSuccess,
  isCoordinationError,
  // Generic type guards
  Result,
  Success,
  Failure,
  isSuccess,
  isFailure,
  // Utility functions
  extractData,
  extractErrorMessage,
  hasProperty,
  safePropertyAccess,
} from '../../../../utils/type-guards';

describe('Type Guards - Classical TDD', () => {
  // ============================================
  // Database Result Type Guards Tests
  // ============================================

  describe('Database Result Type Guards', () => {
    it('should correctly identify successful query results', () => {
      const successResult: QuerySuccess<{ id: number; name: string }> = {
        success: true,
        data: { id: 1, name: 'Test' },
        rowCount: 1,
        executionTime: 50,
        fields: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'varchar', nullable: true },
        ],
      };

      expect(isQuerySuccess(successResult)).toBe(true);
      expect(isQueryError(successResult)).toBe(false);

      // Type narrowing verification
      if (isQuerySuccess(successResult)) {
        expect(successResult.data.id).toBe(1);
        expect(successResult.data.name).toBe('Test');
      }
    });

    it('should correctly identify query error results', () => {
      const errorResult: QueryError = {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: 'Table does not exist',
          details: { table: 'nonexistent' },
        },
        executionTime: 25,
      };

      expect(isQueryError(errorResult)).toBe(true);
      expect(isQuerySuccess(errorResult)).toBe(false);

      // Type narrowing verification
      if (isQueryError(errorResult)) {
        expect(errorResult.error.code).toBe('QUERY_FAILED');
        expect(errorResult.error.message).toBe('Table does not exist');
      }
    });

    it('should handle union type discrimination correctly', () => {
      const results: DatabaseResult[] = [
        {
          success: true,
          data: [{ id: 1 }],
          rowCount: 1,
          executionTime: 30,
        },
        {
          success: false,
          error: {
            code: 'CONNECTION_ERROR',
            message: 'Database connection failed',
          },
          executionTime: 100,
        },
      ];

      const successResults = results.filter(isQuerySuccess);
      const errorResults = results.filter(isQueryError);

      expect(successResults).toHaveLength(1);
      expect(errorResults).toHaveLength(1);
      expect(successResults[0].data).toEqual([{ id: 1 }]);
      expect(errorResults[0].error.code).toBe('CONNECTION_ERROR');
    });
  });

  // ============================================
  // Memory Result Type Guards Tests
  // ============================================

  describe('Memory Result Type Guards', () => {
    it('should correctly identify successful memory operations', () => {
      const successResult: MemorySuccess<string> = {
        found: true,
        data: 'cached_value',
        key: 'test_key',
        timestamp: new Date(),
        ttl: 3600,
        metadata: { source: 'cache' },
      };

      expect(isMemorySuccess(successResult)).toBe(true);
      expect(isMemoryNotFound(successResult)).toBe(false);
      expect(isMemoryError(successResult)).toBe(false);

      // Type narrowing verification
      if (isMemorySuccess(successResult)) {
        expect(successResult.data).toBe('cached_value');
        expect(successResult.key).toBe('test_key');
      }
    });

    it('should correctly identify memory not found results', () => {
      const notFoundResult: MemoryNotFound = {
        found: false,
        key: 'missing_key',
        reason: 'not_found',
      };

      expect(isMemoryNotFound(notFoundResult)).toBe(true);
      expect(isMemorySuccess(notFoundResult)).toBe(false);
      expect(isMemoryError(notFoundResult)).toBe(false);

      // Type narrowing verification
      if (isMemoryNotFound(notFoundResult)) {
        expect(notFoundResult.key).toBe('missing_key');
        expect(notFoundResult.reason).toBe('not_found');
      }
    });

    it('should correctly identify memory error results', () => {
      const errorResult: MemoryError = {
        found: false,
        error: {
          code: 'MEMORY_CORRUPTED',
          message: 'Memory store corrupted',
          key: 'corrupted_key',
        },
      };

      expect(isMemoryError(errorResult)).toBe(true);
      expect(isMemorySuccess(errorResult)).toBe(false);
      expect(isMemoryNotFound(errorResult)).toBe(false);

      // Type narrowing verification
      if (isMemoryError(errorResult)) {
        expect(errorResult.error.code).toBe('MEMORY_CORRUPTED');
        expect(errorResult.error.key).toBe('corrupted_key');
      }
    });
  });

  // ============================================
  // Neural Result Type Guards Tests
  // ============================================

  describe('Neural Result Type Guards', () => {
    it('should correctly identify training results', () => {
      const trainingResult: TrainingResult = {
        type: 'training',
        success: true,
        finalError: 0.001,
        epochsCompleted: 1000,
        duration: 5000,
        converged: true,
        accuracy: 0.99,
        validationError: 0.002,
      };

      expect(isTrainingResult(trainingResult)).toBe(true);
      expect(isInferenceResult(trainingResult)).toBe(false);
      expect(isNeuralError(trainingResult)).toBe(false);

      // Type narrowing verification
      if (isTrainingResult(trainingResult)) {
        expect(trainingResult.finalError).toBe(0.001);
        expect(trainingResult.converged).toBe(true);
      }
    });

    it('should correctly identify inference results', () => {
      const inferenceResult: InferenceResult = {
        type: 'inference',
        success: true,
        predictions: [0.1, 0.8, 0.1],
        confidence: [0.9, 0.95, 0.85],
        processingTime: 50,
      };

      expect(isInferenceResult(inferenceResult)).toBe(true);
      expect(isTrainingResult(inferenceResult)).toBe(false);
      expect(isNeuralError(inferenceResult)).toBe(false);

      // Type narrowing verification
      if (isInferenceResult(inferenceResult)) {
        expect(inferenceResult.predictions).toEqual([0.1, 0.8, 0.1]);
        expect(inferenceResult.processingTime).toBe(50);
      }
    });

    it('should correctly identify neural errors', () => {
      const neuralError: NeuralError = {
        type: 'error',
        success: false,
        error: {
          code: 'WASM_INITIALIZATION_FAILED',
          message: 'Failed to initialize WASM module',
          operation: 'initialization',
          details: { wasmPath: '/invalid/path' },
        },
      };

      expect(isNeuralError(neuralError)).toBe(true);
      expect(isTrainingResult(neuralError)).toBe(false);
      expect(isInferenceResult(neuralError)).toBe(false);

      // Type narrowing verification
      if (isNeuralError(neuralError)) {
        expect(neuralError.error.operation).toBe('initialization');
        expect(neuralError.error.code).toBe('WASM_INITIALIZATION_FAILED');
      }
    });
  });

  // ============================================
  // Utility Functions Tests
  // ============================================

  describe('Utility Functions', () => {
    it('should safely extract data from database results', () => {
      const successResult: QuerySuccess<{ id: number }> = {
        success: true,
        data: { id: 123 },
        rowCount: 1,
        executionTime: 25,
      };

      const errorResult: QueryError = {
        success: false,
        error: { code: 'ERROR', message: 'Failed' },
        executionTime: 10,
      };

      expect(extractData(successResult)).toEqual({ id: 123 });
      expect(extractData(errorResult)).toBeNull();
    });

    it('should safely extract error messages from various result types', () => {
      const databaseError: QueryError = {
        success: false,
        error: { code: 'DB_ERROR', message: 'Database error' },
        executionTime: 10,
      };

      const memoryError: MemoryError = {
        found: false,
        error: { code: 'MEM_ERROR', message: 'Memory error', key: 'test' },
      };

      const neuralError: NeuralError = {
        type: 'error',
        success: false,
        error: { code: 'NEURAL_ERROR', message: 'Neural error', operation: 'training' },
      };

      expect(extractErrorMessage(databaseError)).toBe('Database error');
      expect(extractErrorMessage(memoryError)).toBe('Memory error');
      expect(extractErrorMessage(neuralError)).toBe('Neural error');
    });

    it('should check property existence safely', () => {
      const obj = { name: 'test', value: 42 };
      const nullObj = null;
      const undefinedObj = undefined;

      expect(hasProperty(obj, 'name')).toBe(true);
      expect(hasProperty(obj, 'missing')).toBe(false);
      expect(hasProperty(nullObj, 'name')).toBe(false);
      expect(hasProperty(undefinedObj, 'name')).toBe(false);
    });

    it('should access properties safely', () => {
      const obj = { name: 'test', value: 42 };
      const nullObj = null;

      expect(safePropertyAccess(obj, 'name')).toBe('test');
      expect(safePropertyAccess(obj, 'value')).toBe(42);
      expect(safePropertyAccess(nullObj, 'name')).toBeUndefined();
      expect(safePropertyAccess(undefined, 'name')).toBeUndefined();
    });
  });
});
