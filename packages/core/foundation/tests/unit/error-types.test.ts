/**
 * @fileoverview Error Types Tests (Simple)
 */

import { describe, expect, it } from 'vitest';

describe('Error Types', () => {
  it('should have error type definitions', async () => {
    const errorTypes = await import(
      '../../src/error-handling/errors/error.types'
    );
    expect(errorTypes).toBeDefined();
  });

  it('should have base errors', async () => {
    const baseErrors = await import(
      '../../src/error-handling/errors/base.errors'
    );
    expect(baseErrors).toBeDefined();
  });
});
