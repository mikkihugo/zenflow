import { describe, expect, it } from 'vitest';
import { getLogger, ok, err, withRetry } from '@claude-zen/foundation';

describe('Real Package Integration', () => {
  it('should use real @claude-zen/foundation logger', () => {
    const logger = getLogger('test');
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should use real @claude-zen/foundation Result types', () => {
    const success = ok('test value');
    const failure = err('test error');

    expect(success.isOk()).toBe(true);
    expect(success.isErr()).toBe(false);
    expect(success.value).toBe('test value');

    expect(failure.isOk()).toBe(false);
    expect(failure.isErr()).toBe(true);
    expect(failure.error).toBe('test error');
  });

  it('should use real @claude-zen/foundation withRetry', async () => {
    let callCount = 0;
    const testFn = async () => {
      callCount++;
      return 'success';
    };

    const result = await withRetry(testFn, { maxRetries: 3 });
    expect(result.isOk()).toBe(true);
    expect(result.value).toBe('success');
    expect(callCount).toBe(1);
  });
});
