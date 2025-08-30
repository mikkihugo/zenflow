/**
 * @fileoverview Comprehensive Type Utilities Tests
 *
 * 100% coverage tests for foundation type utilities and guards.
 */

import { describe, expect, it } from 'vitest';
import {
  brand,
  dateFromTimestamp,
  Environment,
  generateUUID,
  isEmail,
  isISODateString,
  isNonEmptyArray,
  isoStringFromTimestamp,
  isPrimitive,
  isTimestamp,
  isUUID,
  LogLevel,
  now,
  Priority,
  Status,
  timestampFromDate,
  unbrand,
} from '../../src/types/primitives';

describe('Foundation Type Utilities - 100% Coverage', () => {
  describe('Branding Functions', () => {
    it('should brand and unbrand values', () => {
      const original = 'test-value';
      const branded = brand<string, 'Test'>(original);
      const unbranded = unbrand(branded);

      expect(branded).toBe(original);
      expect(unbranded).toBe(original);
      expect(unbranded).toBe('test-value');
    });

    it('should handle different types for branding', () => {
      const stringValue = brand<string, 'TestString'>('hello');
      const numberValue = brand<number, 'TestNumber'>(42);
      const booleanValue = brand<boolean, 'TestBoolean'>(true);

      expect(unbrand(stringValue)).toBe('hello');
      expect(unbrand(numberValue)).toBe(42);
      expect(unbrand(booleanValue)).toBe(true);
    });
  });

  describe('Timestamp Functions', () => {
    it('should create current timestamp', () => {
      const timestamp = now();
      const currentTime = Date.now();

      expect(typeof unbrand(timestamp)).toBe('number');
      expect(unbrand(timestamp)).toBeCloseTo(currentTime, -2); // Within 100ms
    });

    it('should create timestamp from date', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const timestamp = timestampFromDate(date);

      expect(unbrand(timestamp)).toBe(date.getTime());
    });

    it('should convert timestamp to date', () => {
      const originalDate = new Date('2023-06-15T12:30:45.123Z');
      const timestamp = timestampFromDate(originalDate);
      const convertedDate = dateFromTimestamp(timestamp);

      expect(convertedDate.getTime()).toBe(originalDate.getTime());
      expect(convertedDate.toISOString()).toBe(originalDate.toISOString());
    });

    it('should create ISO string from timestamp', () => {
      const date = new Date('2023-12-25T15:45:30.500Z');
      const timestamp = timestampFromDate(date);
      const isoString = isoStringFromTimestamp(timestamp);

      expect(unbrand(isoString)).toBe(date.toISOString());
    });
  });

  describe('Type Guards', () => {
    describe('isTimestamp', () => {
      it('should validate correct timestamps', () => {
        const validTimestamps = [
          Date.now(),
          1672531200000, // Jan 1, 2023Date.now(),
        ];

        for (const ts of validTimestamps) {
          expect(isTimestamp(ts)).toBe(true);
        }
      });

      it('should reject invalid timestamps', () => {
        const invalidTimestamps = [
          'not-a-number',
          -1, // negative
          1.5, // not integer
          0, // zero
          Date.now() + 1000 * 60 * 60 * 24 * 500, // too far in future
          null,
          undefined,
        ];

        for (const ts of invalidTimestamps) {
          expect(isTimestamp(ts)).toBe(false);
        }
      });
    });

    describe('isISODateString', () => {
      it('should validate correct ISO date strings', () => {
        const validDates = [
          '2023-01-01T00:00:00.000Z',
          '2023-12-31T23:59:59.999Z',
          '2023-06-15T12:30:45Z',
          new Date().toISOString(),
        ];

        for (const date of validDates) {
          expect(isISODateString(date)).toBe(true);
        }
      });

      it('should reject invalid ISO date strings', () => {
        const invalidDates = [
          'not-a-date',
          '2023-01-01',
          '2023-13-01T00:00:00.000Z', // invalid month
          '2023-01-32T00:00:00.000Z', // invalid day
          '2023-01-01T25:00:00.000Z', // invalid hour
          '',
          null,
          undefined,
          123,
        ];

        for (const date of invalidDates) {
          expect(isISODateString(date)).toBe(false);
        }
      });
    });

    describe('isEmail', () => {
      it('should validate correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'first+last@subdomain.example.org',
          'valid@123.456.789.012', // IP addresses
        ];

        for (const email of validEmails) {
          expect(isEmail(email)).toBe(true);
        }
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'not-an-email',
          '@domain.com',
          'user@',
          'user.domain.com',
          'user @domain.com', // space
          '',
          null,
          undefined,
          123,
        ];

        for (const email of invalidEmails) {
          expect(isEmail(email)).toBe(false);
        }
      });
    });

    describe('isNonEmptyArray', () => {
      it('should validate non-empty arrays', () => {
        const nonEmptyArrays = [
          [1],
          [1, 2, 3],
          ['a', 'b'],
          [null],
          [undefined],
        ];

        for (const arr of nonEmptyArrays) {
          expect(isNonEmptyArray(arr)).toBe(true);
        }
      });

      it('should reject empty arrays', () => {
        const emptyArrays = [[]];

        for (const arr of emptyArrays) {
          expect(isNonEmptyArray(arr)).toBe(false);
        }
      });
    });

    describe('isPrimitive', () => {
      it('should validate primitive values', () => {
        const primitives = [
          'string',
          42,
          true,
          false,
          null,
          undefined,
          Symbol('test'),
          BigInt(123),
        ];

        for (const primitive of primitives) {
          expect(isPrimitive(primitive)).toBe(true);
        }
      });

      it('should reject non-primitive values', () => {
        const nonPrimitives = [{}, [], () => {}, new Date(), /regex/];

        for (const nonPrimitive of nonPrimitives) {
          expect(isPrimitive(nonPrimitive)).toBe(false);
        }
      });
    });
  });

  describe('Enums', () => {
    describe('Priority', () => {
      it('should have all priority levels', () => {
        expect(Priority.LOW).toBe('low');
        expect(Priority.MEDIUM).toBe('medium');
        expect(Priority.HIGH).toBe('high');
        expect(Priority.CRITICAL).toBe('critical');
        expect(Priority.URGENT).toBe('urgent');
      });

      it('should have consistent enum values', () => {
        const values = Object.values(Priority);
        const expectedValues = ['low', 'medium', 'high', 'critical', 'urgent'];
        for (const value of expectedValues) {
          expect(values).toContain(value);
        }
        expect(values).toHaveLength(5);
      });
    });

    describe('Status', () => {
      it('should have all status types', () => {
        expect(Status.PENDING).toBe('pending');
        expect(Status.IN_PROGRESS).toBe('in_progress');
        expect(Status.COMPLETED).toBe('completed');
        expect(Status.FAILED).toBe('failed');
        expect(Status.CANCELLED).toBe('cancelled');
        expect(Status.PAUSED).toBe('paused');
        expect(Status.SKIPPED).toBe('skipped');
      });

      it('should have consistent enum values', () => {
        const values = Object.values(Status);
        expect(values).toHaveLength(7);
        expect(values).toContain('pending');
        expect(values).toContain('in_progress');
        expect(values).toContain('completed');
      });
    });

    describe('LogLevel', () => {
      it('should have all log levels', () => {
        expect(LogLevel.EMERGENCY).toBe('emergency');
        expect(LogLevel.ALERT).toBe('alert');
        expect(LogLevel.CRITICAL).toBe('critical');
        expect(LogLevel.ERROR).toBe('error');
        expect(LogLevel.WARNING).toBe('warning');
        expect(LogLevel.NOTICE).toBe('notice');
        expect(LogLevel.INFO).toBe('info');
        expect(LogLevel.DEBUG).toBe('debug');
      });

      it('should have consistent enum values', () => {
        const values = Object.values(LogLevel);
        expect(values).toHaveLength(8);
        expect(values).toContain('emergency');
        expect(values).toContain('debug');
      });
    });

    describe('Environment', () => {
      it('should have all environment types', () => {
        expect(Environment.DEVELOPMENT).toBe('development');
        expect(Environment.TESTING).toBe('testing');
        expect(Environment.STAGING).toBe('staging');
        expect(Environment.PRODUCTION).toBe('production');
        expect(Environment.LOCAL).toBe('local');
      });

      it('should have consistent enum values', () => {
        const values = Object.values(Environment);
        expect(values).toHaveLength(5);
        expect(values).toContain('development');
        expect(values).toContain('production');
      });
    });
  });

  describe('Performance', () => {
    it('should handle many type guard operations efficiently', () => {
      const start = performance.now();

      const testData = Array.from({ length: 1000 }, (_, i) => ({
        email: `user${i}@example.com`,
        timestamp: Date.now() + i,
        uuid: generateUUID(),
        array: [i],
        primitive: i,
      }));

      for (const data of testData) {
        expect(isEmail(data.email)).toBe(true);
        expect(isTimestamp(data.timestamp)).toBe(true);
        expect(isUUID(data.uuid)).toBe(true);
        expect(isNonEmptyArray(data.array)).toBe(true);
        expect(isPrimitive(data.primitive)).toBe(true);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should handle branding/unbranding efficiently', () => {
      const start = performance.now();

      const values = Array.from({ length: 1000 }, (_, i) => `value-${i}`);

      const branded = values.map((val) => brand<string, 'Test'>(val));
      const unbranded = branded.map((val) => unbrand(val));

      expect(unbranded).toEqual(values);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge case timestamps', () => {
      const edgeCases = [
        1, // minimum valid timestamp
        Date.now(), // current time
        Date.now() + 1000 * 60 * 60 * 24 * 364, // almost 1 year in future
      ];

      for (const ts of edgeCases) {
        expect(isTimestamp(ts)).toBe(true);
      }
    });

    it('should handle edge case emails', () => {
      const edgeEmails = [
        'a@b.co', // minimal valid email
        'very.long.email.address.with.many.dots@very.long.domain.name.with.many.dots.example.com',
        '123@456.789', // numeric
      ];

      for (const email of edgeEmails) {
        expect(isEmail(email)).toBe(true);
      }
    });

    it('should handle special characters in UUIDs', () => {
      // Test the boundaries of UUID validation
      const uuid = generateUUID();
      expect(isUUID(uuid)).toBe(true);
      expect(isUUID(uuid.toUpperCase())).toBe(true); // case insensitive
      expect(isUUID(uuid.toLowerCase())).toBe(true);
    });
  });
});
