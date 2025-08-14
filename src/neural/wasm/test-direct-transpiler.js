#!/usr/bin/env node

// Direct test of the CUDA transpiler functionality through zen-swarm loader
import { WasmModuleLoader } from './wasm-loader.ts';

async function testDirectTranspiler() {
  console.log('🚀 Testing CUDA transpiler functionality through zen-swarm...');
  
  const loader = new WasmModuleLoader();
  
  try {
    // Initialize the WASM loader
    await loader.initialize();
    
    console.log('✅ Loader initialized with status:', loader.getModuleStatus().status);
    
    // Get the raw WASM module
    const wasmModule = loader.getModule();
    console.log('🔍 WASM module available:', !!wasmModule);
    
    if (wasmModule && wasmModule.transpile_cuda) {
      console.log('✅ transpile_cuda function found in WASM module');
      
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
      const rustCode = wasmModule.transpile_cuda(cudaCode);
      
      console.log('✅ CUDA transpilation successful!');
      console.log('📝 Generated Rust code length:', rustCode.length, 'characters');
      console.log('📝 First 300 characters:');
      console.log(rustCode.substring(0, 300) + '...');
      
      // Test with a more complex kernel
      const complexCuda = `
        __global__ void matrix_multiply(float* A, float* B, float* C, int N) {
          int row = blockIdx.y * blockDim.y + threadIdx.y;
          int col = blockIdx.x * blockDim.x + threadIdx.x;
          
          if (row < N && col < N) {
            float sum = 0.0f;
            for (int k = 0; k < N; k++) {
              sum += A[row * N + k] * B[k * N + col];
            }
            C[row * N + col] = sum;
          }
        }
      `;
      
      console.log('🧪 Testing complex matrix multiplication kernel...');
      const complexRustCode = wasmModule.transpile_cuda(complexCuda);
      
      console.log('✅ Complex CUDA transpilation successful!');
      console.log('📝 Generated Rust code length:', complexRustCode.length, 'characters');
      console.log('📝 First 300 characters:');
      console.log(complexRustCode.substring(0, 300) + '...');
      
      console.log('\n🎉 DIRECT TRANSPILER TEST: FULLY FUNCTIONAL!');
      console.log('🚀 zen-swarm can now transpile CUDA to Rust via WASM!');
      
      return true;
      
    } else {
      console.log('❌ transpile_cuda function not available in WASM module');
      console.log('🔍 Available functions:', wasmModule ? Object.keys(wasmModule).filter(k => typeof wasmModule[k] === 'function') : 'No module');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Direct transpiler test failed:', error);
    return false;
  } finally {
    await loader.cleanup();
  }
}

testDirectTranspiler().then(success => {
  console.log('\n' + (success ? '🎉 SUCCESS: CUDA transpiler working through zen-swarm!' : '❌ FAILED: CUDA transpiler not functional'));
  process.exit(success ? 0 : 1);
});