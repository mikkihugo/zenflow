import { describe, expect, it } from 'vitest';

describe('Simple Jest Test', () => {
  it('should run basic assertion', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});
