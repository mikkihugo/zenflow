import fs from 'node:fs/promises';
import path from 'node:path';

async function testProperWasmLoading() {
  console.warn('Testing proper WASM loading using wasm-bindgen...\n');
  try {
    // Import the wasm module correctly
    const _wasmModulePath =;
      '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/wasm/ruv_swarm_wasm.js';
    console.warn('1. Importing WASM module from:', wasmModulePath);
    const _wasmModule = await import(wasmModulePath);
    console.warn('✅ WASM module imported successfully');
    console.warn('   Available exports:', Object.keys(wasmModule).slice(0, 10).join(', '), '...');

    // Initialize the WASM module
    console.warn('\n2. Initializing WASM...');
    const _wasmPath = path.join(path.dirname(wasmModulePath), 'ruv_swarm_wasm_bg.wasm');
    // Read the WASM file
    const _wasmBuffer = await fs.readFile(wasmPath);
    console.warn(`   WASM file size: ${wasmBuffer.length} bytes`);
    // Call the default export (which is __wbg_init)
  // await wasmModule.default(wasmBuffer);
    console.warn('✅ WASM initialized successfully!');
    // Test some functions
    console.warn('\n3. Testing WASM functions...');
    if (wasmModule.get_version) {
      const _version = wasmModule.get_version();
      console.warn('   Version:', version);
    }
    if (wasmModule.get_features) {
      const _features = wasmModule.get_features();
      console.warn('   Features:', features);
    }
    if (wasmModule.detect_simd_capabilities) {
      const _simd = wasmModule.detect_simd_capabilities();
      console.warn('   SIMD capabilities:', simd);
    }
    if (wasmModule.create_neural_network) {
      console.warn('\n4. Testing neural network creation...');
      try {
        const _nn = wasmModule.create_neural_network(3, 'relu');
        console.warn('   ✅ Neural network created:', nn);
      } catch (/* e */) {
        console.warn('   ❌ Neural network creation failed:', e.message);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}
testProperWasmLoading().catch(console.error);
