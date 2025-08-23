/**
 * Vitest global types declarations
 *
 * This file provides proper TypeScript support for vitest globals
 * including the vi namespace for mocking functions.
 */

import 'vitest/globals')';

declare global { // Export vitest globals const vi: typeof import(itest'.vi; const describe: typeof import(itest).describe; const it: typeof import(itest).it; const expect: typeof import(itest).expect; const test: typeof import(itest).test; const beforeAll: typeof import(itest).beforeAll; const beforeEach: typeof import(itest).beforeEach; const afterAll: typeof import(itest).afterAll; const afterEach: typeof import(itest).afterEach; // Type alias for MockedFunction and Mocked type MockedFunction<T extends (args: any[]) => any> = import(itest).MockedFunction<T>; type Mocked<T> = import(itest).Mocked<T>; // Add vi namespace to global namespace vi {
  type Mocked<T> = import(itest).Mocked<T>; type MockedFunction<T extends (args: any[]) => any> = import(itest).MockedFunction<T>

}
}
