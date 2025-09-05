// TypeScript loader for the Rust WASM module
// Usage: import { initWasm, fact_sum } from './wasm-loader';

let wasm: typeof import('./fact_tools_wasm');

export async function initWasm() {
  // @ts-ignore
  wasm = await import('./fact_tools_wasm');
  if (wasm && wasm.default) {
    await wasm.default();
  }
}

export function factSum(numbers: number[]): number {
  if (!wasm) throw new Error('WASM not initialized. Call initWasm() first.');
  return wasm.fact_sum(numbers);
}