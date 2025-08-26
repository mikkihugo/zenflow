import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should verify testing framework works', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic async operations', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });

  it('should handle object comparisons', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toEqual({ name: 'test', value: 42 });
  });
});
