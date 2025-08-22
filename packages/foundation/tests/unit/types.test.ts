/**
 * @fileoverview Foundation Types - Test Suite
 *
 * Tests for the foundation type system to ensure proper functionality,
 * type safety, and utility function correctness.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  UUID,
  Timestamp,
  Priority,
  Status,
  Timestamped,
  Paginated,
  Result,
  ValidationError,
  Entity,
} from '../../src/types/index';

import {
  PriorityEnum,
  StatusEnum,
  LogLevelEnum,
  isUUID,
  isTimestamp,
  generateUUID,
  now,
  createPaginated,
  createSuccess,
  createError,
  isSuccess,
  isError,
  createValidationError,
  isValidationError,
} from '../../src/types/index';

describe('Foundation Types', () => {
  describe('Primitives', () => {
    describe('UUID', () => {
      it('should generate valid UUIDs', () => {
        const uuid = generateUUID();
        expect(isUUID(uuid)).toBe(true);
        expect(uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });

      it('should validate UUIDs correctly', () => {
        expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        expect(isUUID('not-a-uuid')).toBe(false);
        expect(isUUID('')).toBe(false);
        expect(isUUID(null)).toBe(false);
      });
    });

    describe('Timestamp', () => {
      it('should create valid timestamps', () => {
        const timestamp = now();
        expect(isTimestamp(timestamp)).toBe(true);
        expect(typeof timestamp).toBe('number');
        expect(timestamp).toBeGreaterThan(0);
      });

      it('should validate timestamps correctly', () => {
        const validTimestamp = Date.now();
        expect(isTimestamp(validTimestamp)).toBe(true);
        expect(isTimestamp(-1)).toBe(false);
        expect(isTimestamp('not-a-timestamp')).toBe(false);
        expect(isTimestamp(null)).toBe(false);
      });
    });

    describe('Enums', () => {
      it('should have correct Priority enum values', () => {
        expect(PriorityEnum.LOW).toBe('low');
        expect(PriorityEnum.MEDIUM).toBe('medium');
        expect(PriorityEnum.HIGH).toBe('high');
        expect(PriorityEnum.CRITICAL).toBe('critical');
        expect(PriorityEnum.URGENT).toBe('urgent');
      });

      it('should have correct Status enum values', () => {
        expect(StatusEnum.PENDING).toBe('pending');
        expect(StatusEnum.IN_PROGRESS).toBe('in_progress');
        expect(StatusEnum.COMPLETED).toBe('completed');
        expect(StatusEnum.FAILED).toBe('failed');
        expect(StatusEnum.CANCELLED).toBe('cancelled');
      });
    });
  });

  describe('Patterns', () => {
    describe('Timestamped', () => {
      it('should work with interfaces extending Timestamped', () => {
        interface TestEntity extends Timestamped {
          id: string;
          name: string;
        }

        const entity: TestEntity = {
          id: '123',
          name: 'test',
          createdAt: now(),
          updatedAt: now(),
        };

        expect(isTimestamp(entity.createdAt)).toBe(true);
        expect(isTimestamp(entity.updatedAt)).toBe(true);
      });
    });

    describe('Entity', () => {
      it('should combine all standard patterns', () => {
        const entity: Entity = {
          id: generateUUID(),
          name: 'Test Entity',
          displayName: 'Test Display Name',
          description: 'Test description',
          createdAt: now(),
          updatedAt: now(),
          version: 1,
          isActive: true,
        };

        expect(isUUID(entity.id)).toBe(true);
        expect(entity.name).toBe('Test Entity');
        expect(entity.version).toBe(1);
        expect(entity.isActive).toBe(true);
      });
    });

    describe('Pagination', () => {
      it('should create paginated results correctly', () => {
        const items = [1, 2, 3, 4, 5];
        const paginated = createPaginated(items, 2, 3, 20);

        expect(paginated.items).toEqual(items);
        expect(paginated.pagination.currentPage).toBe(2);
        expect(paginated.pagination.pageSize).toBe(3);
        expect(paginated.pagination.totalItems).toBe(20);
        expect(paginated.pagination.totalPages).toBe(7);
        expect(paginated.pagination.hasNextPage).toBe(true);
        expect(paginated.pagination.hasPreviousPage).toBe(true);
      });

      it('should handle edge cases for pagination', () => {
        // First page
        const firstPage = createPaginated([1, 2, 3], 1, 3, 10);
        expect(firstPage.pagination.hasPreviousPage).toBe(false);
        expect(firstPage.pagination.hasNextPage).toBe(true);

        // Last page
        const lastPage = createPaginated([10], 4, 3, 10);
        expect(lastPage.pagination.hasPreviousPage).toBe(true);
        expect(lastPage.pagination.hasNextPage).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    describe('Result Pattern', () => {
      it('should create successful results', () => {
        const result = createSuccess('test data');
        expect(isSuccess(result)).toBe(true);
        expect(isError(result)).toBe(false);

        if (isSuccess(result)) {
          expect(result.data).toBe('test data');
        }
      });

      it('should create error results', () => {
        const error = createValidationError('Test error');
        const result = createError(error);

        expect(isError(result)).toBe(true);
        expect(isSuccess(result)).toBe(false);

        if (isError(result)) {
          expect(result.error.message).toBe('Test error');
          expect(result.error.type).toBe('ValidationError');
        }
      });
    });

    describe('ValidationError', () => {
      it('should create validation errors with proper structure', () => {
        const error = createValidationError('Invalid input', {
          field: 'email',
          rule: 'format',
          expected: 'valid email',
          actual: 'invalid-email',
        });

        expect(isValidationError(error)).toBe(true);
        expect(error.type).toBe('ValidationError');
        expect(error.code).toBe('VALIDATION_FAILED');
        expect(error.message).toBe('Invalid input');
        expect(error.field).toBe('email');
        expect(error.rule).toBe('format');
        expect(error.retryable).toBe(false);
      });

      it('should validate error types correctly', () => {
        const validationError = createValidationError('Test');
        const regularError = new Error('Regular error');

        expect(isValidationError(validationError)).toBe(true);
        expect(isValidationError(regularError)).toBe(false);
        expect(isValidationError(null)).toBe(false);
        expect(isValidationError('string')).toBe(false);
      });
    });
  });

  describe('Type Composition', () => {
    it('should allow composing foundation types', () => {
      interface User extends Timestamped {
        id: UUID;
        email: string;
        priority: Priority;
        status: Status;
      }

      type UserList = Paginated<User>;
      type UserResult = Result<User, ValidationError>;

      const user: User = {
        id: generateUUID(),
        email: 'test@example.com',
        priority: PriorityEnum.HIGH,
        status: StatusEnum.PENDING,
        createdAt: now(),
        updatedAt: now(),
      };

      const userList: UserList = createPaginated([user], 1, 10, 1);
      const userResult: UserResult = createSuccess(user);

      expect(isUUID(user.id)).toBe(true);
      expect(user.priority).toBe('high');
      expect(user.status).toBe('pending');
      expect(userList.items).toHaveLength(1);
      expect(isSuccess(userResult)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should provide compile-time type safety', () => {
      // This test verifies that TypeScript compilation succeeds
      // with proper type constraints

      interface TestInterface extends Timestamped {
        id: UUID;
        name: string;
      }

      function processEntity(
        entity: TestInterface
      ): Result<string, ValidationError> {
        if (!entity.name) {
          return createError(createValidationError('Name is required'));
        }
        return createSuccess(`Processed: ${entity.name}`);
      }

      const entity: TestInterface = {
        id: generateUUID(),
        name: 'Test Entity',
        createdAt: now(),
        updatedAt: now(),
      };

      const result = processEntity(entity);
      expect(isSuccess(result)).toBe(true);
    });
  });
});
