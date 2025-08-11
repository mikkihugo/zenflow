/**
 * Vitest global types declarations
 *
 * This file provides proper TypeScript support for vitest globals
 * including the vi namespace for mocking functions.
 */

import 'vitest/globals';

declare global {
  // Export vitest globals
  const vi: typeof import('vitest').vi;
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const expect: typeof import('vitest').expect;
  const test: typeof import('vitest').test;
  const beforeAll: typeof import('vitest').beforeAll;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterAll: typeof import('vitest').afterAll;
  const afterEach: typeof import('vitest').afterEach;

  // Type alias for MockedFunction and Mocked
  type MockedFunction<T extends (...args: any[]) => any> = import('vitest').MockedFunction<T>;
  type Mocked<T> = import('vitest').Mocked<T>;
  
  // Add vi namespace to global
  namespace vi {
    type Mocked<T> = import('vitest').Mocked<T>;
    type MockedFunction<T extends (...args: any[]) => any> = import('vitest').MockedFunction<T>;
  }
}

export {};
