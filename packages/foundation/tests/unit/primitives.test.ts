/**
 * @fileoverview Comprehensive Primitives Tests
 *
 * 100% coverage tests for foundation primitives.
 */

import { describe, it, expect } from 'vitest';
import { generateUUID, isUUID } from '../../src/types/primitives';

describe('Foundation Primitives - 100% Coverage', () => {
  describe('UUID Generation', () => {
    it('should generate valid UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(uuid2).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(uuid1).not.toBe(uuid2);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID())();
      }
      expect(uuids.size).toBe(100);
    });

    it('should generate UUIDs efficiently', () => {
      const start = performance.now();

      const uuids = Array.from({ length: 1000 }, () => generateUUID())();

      const duration = performance.now() - start;

      expect(uuids).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should handle edge cases', () => {
      // Generate many UUIDs to test consistency
      const uuids = Array.from({ length: 1000 }, () => generateUUID())();

      // All should be valid UUID format
      uuids.forEach((uuid) => {
        expect(uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });

      // All should be unique
      expect(new Set(uuids).size).toBe(1000);
    });
  });

  describe('UUID Validation', () => {
    it('should validate correct UUIDs', () => {
      const validUUIDs = [
        generateUUID(),
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      validUUIDs.forEach((uuid) => {
        expect(isUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // invalid format
        '123e4567-e89b-12d3-a456-42661417400', // too short
        '123e4567-e89b-12d3-a456-4266141740000', // too long
        null,
        undefined,
        123,
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isUUID(uuid)).toBe(false);
      });
    });
  });
});
