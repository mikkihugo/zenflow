// Neural Rust Implementation - Export Hub
// High-performance Rust-based neural network implementations

// Re-export Rust compiled components
export * from './core/lib.js';

// Rust module exports
export const RustNeural = {
  // Core neural network functionality
  Network: 'rust_network',
  Neuron: 'rust_neuron',
  Layer: 'rust_layer',
  Activation: 'rust_activation',

  // Training algorithms
  Training: 'rust_training',

  // GPU acceleration
  WebGPU: 'rust_webgpu',

  // SIMD optimizations
  SIMD: 'rust_simd',

  // I/O operations
  IO: 'rust_io',
};
