/**
 * Neural WASM Module - Unified WebAssembly components
 *
 * This module provides access to all neural WebAssembly components:
 * - CUDA-Rust transpiler for GPU acceleration (main implementation)
 * - FACT cognitive processing engine (consolidated from src/wasm/)
 * - Unified WASM loading and management utilities
 */

// CUDA-Rust WASM (main neural WASM implementation)
export * from './binaries/wasm-bindings-loader.mjs';
export * from './wasm-loader';
export { default as WasmLoader } from './wasm-loader';
export * from './wasm-loader2';
export { default as WasmLoader2 } from './wasm-loader2';
export * from './wasm-memory-optimizer';
export { default as WasmMemoryOptimizer } from './wasm-memory-optimizer';
export * from './wasm-types';

// FACT WASM Core (cognitive processing - consolidated from src/wasm/)
// Located in fact-core/ subdirectory to avoid naming conflicts
// Note: FACT exports will be added when needed

// Additional WASM components
export * from './wasm-neural-accelerator';
// JS loaders are imported dynamically when needed to avoid circular dependencies
