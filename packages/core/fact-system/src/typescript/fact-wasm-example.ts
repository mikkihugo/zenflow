// Minimal usage example for the Rust WASM integration

import { initWasm, factSum } from './wasm-loader';

async function main() {
  await initWasm();
  const result = factSum([1, 2, 3, 4]);
  console.log('factSum([1,2,3,4]) =', result); // Should print 10
}

main();