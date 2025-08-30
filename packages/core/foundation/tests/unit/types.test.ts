/**
 * @fileoverview Types Tests
 */

import { describe, expect, it } from 'vitest';

describe('Foundation Types', () => {
  describe('Type System', () => {
    it('should provide type exports', async () => {
      const types = await import('../../src/types');

      expect(types).toBeDefined();
      const keys = Object.keys(types);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should provide primitives', async () => {
      const primitives = await import('../../src/types/primitives');

      expect(primitives).toBeDefined();
    });

    it('should provide patterns', async () => {
      const patterns = await import('../../src/types/patterns');

      expect(patterns).toBeDefined();
    });

    it('should provide error types', async () => {
      const errors = await import('../../src/types/errors');

      expect(errors).toBeDefined();
    });
  });

  describe('Type Guards', () => {
    it('should provide type guard exports', async () => {
      const guards = await import('../../src/types/guards');

      expect(guards).toBeDefined();
    });

    it('should provide type guard functions', async () => {
      const typeGuards = await import('../../src/types/guards/type.guards');

      expect(typeGuards).toBeDefined();
    });

    it('should have working type guards', async () => {
      const { isString, isNumber, isObject } = await import(
        '../../src/types/guards/type.guards'
      );

      if (isString && isNumber && isObject) {
        expect(typeof isString).toBe('function');
        expect(typeof isNumber).toBe('function');
        expect(typeof isObject).toBe('function');

        expect(isString('test')).toBe(true);
        expect(isString(123)).toBe(false);

        expect(isNumber(123)).toBe(true);
        expect(isNumber('test')).toBe(false);

        expect(isObject({})).toBe(true);
        expect(isObject('test')).toBe(false);
      }
    });
  });

  describe('Core Types', () => {
    it('should provide core patterns', async () => {
      const corePatterns = await import('../../src/types/core/patterns');

      expect(corePatterns).toBeDefined();
    });

    it('should provide core primitives', async () => {
      const corePrimitives = await import('../../src/types/primitives');

      expect(corePrimitives).toBeDefined();
    });
  });
});
