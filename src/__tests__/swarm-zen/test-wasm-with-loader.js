/**
 * Test WASM with actual loader
 */

import loader from '../wasm/wasm-bindings-loader.mjs';

async function testWithLoader() {
  try {
    await loader.initialize();
    const exports = Object.keys(loader).filter(
      (key) => typeof loader[key] === 'function'
    );
    exports.forEach((_exp) => {});
  } catch (error) {
    console.error('❌ Loader initialization failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWithLoader();
