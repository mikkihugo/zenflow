/**
 * @fileoverview Simple Foundation Test
 * 
 * Basic test to verify gold standard testing setup works.
 */

import { describe, it, expect } from 'vitest';
import { getLogger } from '../../src/logging';

describe('Foundation Gold Standard Tests', () => {
  it('should be able to import core utilities', () => {
    const logger = getLogger('test');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should have proper test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have access to test utilities', () => {
    // Test that global testUtils are available
    expect(globalThis.testUtils).toBeDefined();
    expect(typeof globalThis.testUtils.createTestId).toBe('function');
  });
});