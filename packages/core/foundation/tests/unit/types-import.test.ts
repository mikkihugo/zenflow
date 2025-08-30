/**
 * @fileoverview Foundation Types - Import Test
 *
 * Tests that foundation types can be imported correctly using the
 * package's export paths and that all expected exports are available.
 */

import { describe, expect, it } from 'vitest';

describe('Foundation Types Import Tests', () => {
  it('should import types from package export path', async () => {
    // Test importing from local types module (simulating package export)
    const typesModule = await import('../../src/types/index.js');

    // Verify type utility functions exist
    expect(typeof typesModule.generateUUID).toBe('function');
    expect(typeof typesModule.now).toBe('function');
    expect(typeof typesModule.isUUID).toBe('function');
    expect(typeof typesModule.isTimestamp).toBe('function');

    // Verify enum exports exist
    expect(typesModule.PriorityEnum).toBeDefined();
    expect(typesModule.StatusEnum).toBeDefined();
    expect(typesModule.LogLevelEnum).toBeDefined();
    expect(typesModule.EnvironmentEnum).toBeDefined();

    // Verify error utility functions exist
    expect(typeof typesModule.createValidationError).toBe('function');
    expect(typeof typesModule.createSuccess).toBe('function');
    expect(typeof typesModule.createError).toBe('function');
    expect(typeof typesModule.isSuccess).toBe('function');
    expect(typeof typesModule.isError).toBe('function');

    // Verify pattern utility functions exist
    expect(typeof typesModule.createPaginated).toBe('function');
    expect(typeof typesModule.createPaginationMetadata).toBe('function');
  });

  it('should generate valid UUIDs and timestamps', async () => {
    const { generateUUID, now, isUUID, isTimestamp } = await import(
      '../../src/types/index.js'
    );

    const uuid = generateUUID();
    const timestamp = now();

    expect(isUUID(uuid)).toBe(true);
    expect(isTimestamp(timestamp)).toBe(true);
  });

  it('should work with Result pattern', async () => {
    const {
      createSuccess,
      createError,
      createValidationError,
      isSuccess,
      isError,
    } = await import('../../src/types/index.js');

    // Test success result
    const successResult = createSuccess('test data');
    expect(isSuccess(successResult)).toBe(true);
    expect(isError(successResult)).toBe(false);

    // Test error result
    const error = createValidationError('Test validation error');
    const errorResult = createError(error);
    expect(isError(errorResult)).toBe(true);
    expect(isSuccess(errorResult)).toBe(false);
  });

  it('should work with pagination utilities', async () => {
    const { createPaginated, createPaginationMetadata } = await import(
      '../../src/types/index.js'
    );

    const items = [1, 2, 3, 4, 5];
    const pagination = createPaginationMetadata(2, 5, 20);
    const paginatedResult = createPaginated(items, 2, 5, 20);

    expect(pagination.currentPage).toBe(2);
    expect(pagination.pageSize).toBe(5);
    expect(pagination.totalPages).toBe(4);
    expect(pagination.totalItems).toBe(20);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.hasPreviousPage).toBe(true);

    expect(paginatedResult.items).toEqual(items);
    expect(paginatedResult.pagination).toEqual(pagination);
  });

  it('should provide enum values correctly', async () => {
    const { PriorityEnum, StatusEnum, LogLevelEnum, EnvironmentEnum } =
      await import('../../src/types/index.js');

    // Test Priority enum
    expect(PriorityEnum.LOW).toBe('low');
    expect(PriorityEnum.MEDIUM).toBe('medium');
    expect(PriorityEnum.HIGH).toBe('high');
    expect(PriorityEnum.CRITICAL).toBe('critical');
    expect(PriorityEnum.URGENT).toBe('urgent');

    // Test Status enum
    expect(StatusEnum.PENDING).toBe('pending');
    expect(StatusEnum.IN_PROGRESS).toBe('in_progress');
    expect(StatusEnum.COMPLETED).toBe('completed');
    expect(StatusEnum.FAILED).toBe('failed');

    // Test LogLevel enum
    expect(LogLevelEnum.DEBUG).toBe('debug');
    expect(LogLevelEnum.INFO).toBe('info');
    expect(LogLevelEnum.WARNING).toBe('warning');
    expect(LogLevelEnum.ERROR).toBe('error');

    // Test Environment enum
    expect(EnvironmentEnum.DEVELOPMENT).toBe('development');
    expect(EnvironmentEnum.PRODUCTION).toBe('production');
    expect(EnvironmentEnum.TESTING).toBe('testing');
  });

  it('should handle type guards correctly', async () => {
    const {
      isUUID,
      isTimestamp,
      isValidationError,
      isEmail,
      isPrimitive,
      isNonEmptyArray,
      generateUUID,
      now,
      createValidationError,
    } = await import('../../src/types/index.js');

    // Test UUID validation
    const validUUID = generateUUID();
    expect(isUUID(validUUID)).toBe(true);
    expect(isUUID('not-a-uuid')).toBe(false);

    // Test timestamp validation
    const validTimestamp = now();
    expect(isTimestamp(validTimestamp)).toBe(true);
    expect(isTimestamp('not-a-timestamp')).toBe(false);

    // Test validation error
    const validationError = createValidationError('Test error');
    expect(isValidationError(validationError)).toBe(true);
    expect(isValidationError(new Error('Regular error'))).toBe(false);

    // Test email validation
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);

    // Test primitive check
    expect(isPrimitive('string')).toBe(true);
    expect(isPrimitive(123)).toBe(true);
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(null)).toBe(true);
    expect(isPrimitive({})).toBe(false);

    // Test non-empty array
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
    expect(isNonEmptyArray([])).toBe(false);
  });
});
