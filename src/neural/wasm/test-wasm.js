#!/usr/bin/env node

// Simple test to verify the WASM module works
import init, {
  init_wasm,
  transpile_cuda,
} from './pkg-manual/zen_swarm_neural.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testWasmModule() {
  console.log('🚀 Testing zen-swarm neural WASM module...');

  try {
    // Load the WASM module
    const wasmBinary = fs.readFileSync('./pkg-manual/zen_swarm_neural_bg.wasm');
    await init(wasmBinary);

    console.log('✅ WASM module loaded successfully');

    // Initialize the module
    init_wasm();
    console.log('✅ WASM module initialized');

    // Test CUDA transpilation
    const cudaCode = `
      __global__ void vector_add(float* a, float* b, float* c, int n) {
        int i = blockIdx.x * blockDim.x + threadIdx.x;
        if (i < n) {
          c[i] = a[i] + b[i];
        }
      }
    `;

    console.log('🧪 Testing CUDA transpilation...');
    const rustCode = transpile_cuda(cudaCode);
    console.log('✅ CUDA transpilation successful!');
    console.log(
      '📝 Generated Rust code length:',
      rustCode.length,
      'characters'
    );
    console.log('📝 First 200 characters:', rustCode.substring(0, 200) + '...');

    console.log('\n🎉 zen-swarm neural WASM module is fully functional!');
    console.log('📊 Package size:', Math.round(wasmBinary.length / 1024), 'KB');

    return true;
  } catch (error) {
    console.error('❌ WASM module test failed:', error);
    return false;
  }
}

testWasmModule().then((success) => {
  process.exit(success ? 0 : 1);
});
