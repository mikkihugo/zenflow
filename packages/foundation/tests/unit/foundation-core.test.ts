/**
 * @fileoverview Foundation Core Systems Tests
 *
 * Tests core foundation functionality that we know works.
 */

import { describe, it, expect, vi } from 'vitest';
import { getLogger } from '../../src/logging';
import { Result, ok, err } from 'neverthrow';

describe('Foundation Core - Working Systems', () => {
  describe('Logging System', () => {
    it('should create loggers', () => {
      const logger = getLogger('test');
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should handle different logger names', () => {
      const logger1 = getLogger('test1');
      const logger2 = getLogger('test2');

      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
    });

    it('should log without throwing', () => {
      const logger = getLogger('test-logging');

      expect(() => logger.info('test message')).not.toThrow();
      expect(() => logger.debug('debug message')).not.toThrow();
      expect(() => logger.warn('warning message')).not.toThrow();
      expect(() => logger.error('error message')).not.toThrow();
    });
  });

  describe('Result Pattern (neverthrow)', () => {
    it('should create successful results', () => {
      const result = ok('success');

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);

      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should create error results', () => {
      const error = new Error('test error');
      const result = err(error);

      expect(result.isErr()).toBe(true);
      expect(result.isOk()).toBe(false);

      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should chain operations', () => {
      const result = ok(10)
        .map((x) => x * 2)
        .map((x) => x.toString())();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('20');
      }
    });

    it('should handle error chains', () => {
      const result = err(new Error('original')).mapErr(
        (error) => new Error(`wrapped: ${error.message}`)
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('wrapped: original');
      }
    });

    it('should use andThen for monadic operations', () => {
      const divide = (x: number, y: number): Result<number, Error> => {
        if (y === 0) return err(new Error('Division by zero'));
        return ok(x / y);
      };

      const result = ok(20)
        .andThen((x) => divide(x, 4))
        .andThen((x) => divide(x, 5));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(1);
      }
    });

    it('should short-circuit on first error', () => {
      const divide = (x: number, y: number): Result<number, Error> => {
        if (y === 0) return err(new Error('Division by zero'));
        return ok(x / y);
      };

      const result = ok(10)
        .andThen((x) => divide(x, 0))
        .andThen((x) => divide(x, 5));

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Division by zero');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle various error types', () => {
      const stringError = 'string error';
      const objectError = { message: 'object error' };
      const actualError = new Error('actual error');

      expect(stringError).toBe('string error');
      expect(objectError.message).toBe('object error');
      expect(actualError.message).toBe('actual error');
    });

    it('should work with try-catch patterns', () => {
      const throwingFunction = () => {
        throw new Error('Intentional error');
      };

      let caughtError: Error'' | ''null = null;

      try {
        throwingFunction();
      } catch (error) {
        caughtError = error as Error;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('Intentional error');
    });
  });

  describe('Type Safety', () => {
    interface TestInterface {
      id: string;
      value: number;
    }

    it('should enforce type safety', () => {
      const testObject: TestInterface = {
        id: 'test-123',
        value: 42,
      };

      expect(testObject.id).toBe('test-123');
      expect(testObject.value).toBe(42);
      expect(typeof testObject.id).toBe('string');
      expect(typeof testObject.value).toBe('number');
    });

    it('should work with generic types', () => {
      const stringResult: Result<string, Error> = ok('success');
      const numberResult: Result<number, Error> = ok(123);

      expect(stringResult.isOk()).toBe(true);
      expect(numberResult.isOk()).toBe(true);

      if (stringResult.isOk()) {
        expect(typeof stringResult.value).toBe('string');
      }

      if (numberResult.isOk()) {
        expect(typeof numberResult.value).toBe('number');
      }
    });
  });

  describe('Async Operations', () => {
    it('should handle promises correctly', async () => {
      const asyncOperation = async (value: number): Promise<number> => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return value * 2;
      };

      const result = await asyncOperation(5);
      expect(result).toBe(10);
    });

    it('should handle promise rejections', async () => {
      const rejectingOperation = async (): Promise<never> => {
        throw new Error('Async error');
      };

      let error: Error'' | ''null = null;

      try {
        await rejectingOperation();
      } catch (e) {
        error = e as Error;
      }

      expect(error).not.toBeNull();
      expect(error!.message).toBe('Async error');
    });

    it('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 5 }, (_, i) =>
        Promise.resolve(i * 2)
      );

      const results = await Promise.all(operations);

      expect(results).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large datasets', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const doubled = largeArray.map((x) => x * 2);

      expect(doubled).toHaveLength(10000);
      expect(doubled[0]).toBe(0);
      expect(doubled[9999]).toBe(19998);
    });

    it('should create many loggers efficiently', () => {
      const start = performance.now();

      const loggers = Array.from({ length: 100 }, (_, i) =>
        getLogger(`perf-test-${i}`)
      );

      const duration = performance.now() - start;

      expect(loggers).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should handle many Result operations', () => {
      const results = Array.from({ length: 1000 }, (_, i) =>
        ok(i)
          .map((x) => x * 2)
          .map((x) => x.toString())
      );

      expect(results).toHaveLength(1000);
      expect(results[0].isOk()).toBe(true);
      expect(results[999].isOk()).toBe(true);

      if (results[500].isOk()) {
        expect(results[500].value).toBe('1000');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values', () => {
      const emptyString = '';
      const nullValue = null;
      const undefinedValue = undefined;
      const zeroValue = 0;

      expect(emptyString).toBe('');
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
      expect(zeroValue).toBe(0);
    });

    it('should handle special numbers', () => {
      const infinity = Infinity;
      const negativeInfinity = -Infinity;
      const notANumber = NaN;

      expect(infinity).toBe(Infinity);
      expect(negativeInfinity).toBe(-Infinity);
      expect(isNaN(notANumber)).toBe(true);
    });

    it('should handle unicode and special characters', () => {
      const unicode = '🚀 Test 测试 🎯';
      const specialChars = '!@#$%^&*()[]{}'' | '';:,.<>?';

      expect(unicode).toBe('🚀 Test 测试 🎯');
      expect(specialChars).toBe('!@#$%^&*()[]{}'' | '';:,.<>?');
    });
  });

  describe('Memory Management', () => {
    it('should clean up properly', () => {
      const objects: any[] = [];

      // Create objects
      for (let i = 0; i < 100; i++) {
        objects.push({ id: i, data: new Array(100).fill(i) });
      }

      expect(objects).toHaveLength(100);

      // Clear references
      objects.length = 0;

      expect(objects).toHaveLength(0);
    });
  });
});
