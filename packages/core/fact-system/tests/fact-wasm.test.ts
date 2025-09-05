// Test for Rust WASM integration with TypeScript

import { describe, it, expect } from 'vitest';
import { initWasm, factSum } from '../src/typescript/wasm-loader';

describe('fact_sum WASM integration', () => {
  it('sums an array of numbers via WASM', async () => {
    await initWasm();
    const result = factSum([2, 3, 5]);
    expect(result).toBe(10);
  });
});