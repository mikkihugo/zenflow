# @zen-ai/gpu-acceleration

GPU acceleration toolkit providing **CUDA-to-Rust transpilation**, **WebGPU backends**, and **WASM acceleration** for high-performance computing.

## 🎯 Features

- **🔄 CUDA Transpiler**: Convert CUDA kernels to Rust code
- **🎮 WebGPU Backend**: Browser and native GPU acceleration
- **🌐 WASM Support**: WebAssembly compilation for web deployment
- **⚡ High Performance**: Zero-cost abstractions with Rust
- **🛡️ Memory Safety**: Rust ownership model for GPU operations

## 📦 Components

### CUDA-Rust Transpiler
- **Parser**: CUDA code analysis and AST generation
- **Transpiler**: CUDA-to-Rust code generation  
- **Runtime**: GPU operation abstractions
- **Memory Management**: Safe GPU memory operations

### WebGPU Backend
- **Compute Shaders**: WGSL shader generation
- **Buffer Management**: Efficient GPU buffer pools
- **Pipeline Optimization**: Cached compute pipelines
- **Resource Management**: Autonomous GPU resource allocation

### WASM Integration
- **Bindings**: WebAssembly-compatible GPU operations
- **Memory Bridge**: Efficient host-WASM memory transfer
- **Performance Monitoring**: Runtime profiling and optimization

## 🚀 Quick Start

```typescript
import { CudaTranspiler, WebGPUBackend } from '@zen-ai/gpu-acceleration';

// Transpile CUDA kernel to Rust
const transpiler = new CudaTranspiler();
const rustCode = await transpiler.transpile(`
  __global__ void vectorAdd(float* a, float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) c[idx] = a[idx] + b[idx];
  }
`);

// Use WebGPU backend for execution
const backend = new WebGPUBackend();
await backend.initialize();

const result = await backend.execute(kernelCode, {
  a: inputArrayA,
  b: inputArrayB,
  size: arrayLength
});
```

## 🏗️ Architecture

### Transpilation Pipeline
1. **Lexical Analysis**: CUDA tokenization
2. **Parsing**: AST generation with nom parser
3. **Analysis**: Type inference and dependency tracking
4. **Generation**: Rust code emission with WebGPU support

### Runtime System
- **Device Management**: GPU device abstraction
- **Memory Pools**: Efficient buffer allocation
- **Kernel Execution**: Async compute pipeline management
- **Error Handling**: Comprehensive error reporting

## 📈 Performance

- **Native Performance**: Zero-overhead Rust abstractions
- **Memory Efficiency**: Smart buffer pooling and reuse
- **Parallel Execution**: Multi-GPU and multi-core support  
- **Browser Support**: WebGPU acceleration in browsers

## 🎯 Use Cases

- **Neural Network Acceleration**: GPU-accelerated training/inference
- **Scientific Computing**: High-performance numerical computations
- **Graphics Processing**: Custom compute shaders and effects
- **Web Applications**: Client-side GPU acceleration via WASM

## 🔗 Integration

Part of the **@zen-ai** ecosystem:
- Used by `@claude-zen/brain` for neural acceleration
- Integrates with `@zen-ai/neural-forecasting` for model training
- Compatible with `@zen-ai/shared` infrastructure

---

**Note**: This package contains the extracted GPU acceleration capabilities from the brain package for dedicated high-performance computing.