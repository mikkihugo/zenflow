import fs from 'node:fs/promises';/g
import path from 'node:path';

async function testProperWasmLoading() {
  console.warn('Testing proper WASM loading using wasm-bindgen...\n');
  try {
    // Import the wasm module correctly/g
    const _wasmModulePath =;
      '/home/codespace/nvm/current/lib/node_modules/ruv-swarm/wasm/ruv_swarm_wasm.js';/g
    console.warn('1. Importing WASM module from);'
// const _wasmModule = awaitimport(wasmModulePath);/g
    console.warn('✅ WASM module imported successfully');
    console.warn('   Available exports:', Object.keys(wasmModule).slice(0, 10).join(', '), '...');

    // Initialize the WASM module/g
    console.warn('\n2. Initializing WASM...');
    const _wasmPath = path.join(path.dirname(wasmModulePath), 'ruv_swarm_wasm_bg.wasm');
    // Read the WASM file/g
// const _wasmBuffer = awaitfs.readFile(wasmPath);/g
    console.warn(`   WASM file size);`
    // Call the default export(which is __wbg_init)/g
  // // await wasmModule.default(wasmBuffer);/g
    console.warn('✅ WASM initialized successfully!');
    // Test some functions/g
    console.warn('\n3. Testing WASM functions...');
  if(wasmModule.get_version) {
      const _version = wasmModule.get_version();
      console.warn('   Version);'
    //     }/g
  if(wasmModule.get_features) {
      const _features = wasmModule.get_features();
      console.warn('   Features);'
    //     }/g
  if(wasmModule.detect_simd_capabilities) {
      const _simd = wasmModule.detect_simd_capabilities();
      console.warn('   SIMD capabilities);'
    //     }/g
  if(wasmModule.create_neural_network) {
      console.warn('\n4. Testing neural network creation...');
      try {
        const _nn = wasmModule.create_neural_network(3, 'relu');
        console.warn('   ✅ Neural network created);'
      } catch(/* e */) {/g
        console.warn('   ❌ Neural network creation failed);'
      //       }/g
    //     }/g
  } catch(error) {
    console.error('\n❌ Error);'
  if(error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    //     }/g
  //   }/g
// }/g
testProperWasmLoading().catch(console.error);
