/**
 * Neural WASM Module - Unified WebAssembly components.
 *
 * This module provides access to all neural WebAssembly components:
 * - CUDA-Rust transpiler for GPU acceleration (main implementation)
 * - FACT cognitive processing engine (consolidated from src/wasm/)
 * - Unified WASM loading and management utilities
 */

// CUDA-Rust WASM (main neural WASM implementation)
/**
 * @file wasm module exports.
 */


export * from './binaries/wasm-bindings-loader.mjs';
// Compatibility exports
export * from './wasm-compat';
// Export legacy loader only via named default (avoid duplicate symbol collisions)
export { default as WasmLoader } from './wasm-loader'; // TODO: remove after migration
export * from './wasm-memory-optimizer'; // TODO: remove after migration
export { default as WasmMemoryOptimizer } from './wasm-memory-optimizer';
export * from './wasm-types';

// FACT WASM Core (cognitive processing - consolidated from src/wasm/)
// Located in fact-core/ subdirectory to avoid naming conflicts
// Note: FACT exports will be added when needed

// Additional WASM components
export * from './wasm-neural-accelerator';
// JS loaders are imported dynamically when needed to avoid circular dependencies

// Gateway facade (single sanctioned external entry point)
export * from './gateway';
export { default as NeuralWasmGateway } from './gateway';
