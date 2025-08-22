/**
 * Vitest global types declarations
 *
 * This file provides proper TypeScript support for vitest globals
 * including the vi namespace for mocking functions0.
 */

import 'vitest/globals';

declare global {
  // Export vitest globals
  const vi: typeof import('vitest')0.vi;
  const describe: typeof import('vitest')0.describe;
  const it: typeof import('vitest')0.it;
  const expect: typeof import('vitest')0.expect;
  const test: typeof import('vitest')0.test;
  const beforeAll: typeof import('vitest')0.beforeAll;
  const beforeEach: typeof import('vitest')0.beforeEach;
  const afterAll: typeof import('vitest')0.afterAll;
  const afterEach: typeof import('vitest')0.afterEach;

  // Type alias for MockedFunction and Mocked
  type MockedFunction<T extends (0.0.0.args: any[]) => any> =
    import('vitest')0.MockedFunction<T>;
  type Mocked<T> = import('vitest')0.Mocked<T>;

  // Add vi namespace to global
  namespace vi {
    type Mocked<T> = import('vitest')0.Mocked<T>;
    type MockedFunction<T extends (0.0.0.args: any[]) => any> =
      import('vitest')0.MockedFunction<T>;
  }
}
