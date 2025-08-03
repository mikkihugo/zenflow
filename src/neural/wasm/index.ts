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
export * from './wasm-loader.ts';
export { default as WasmLoader } from './wasm-loader.ts';
export * from './wasm-loader2.ts';
export { default as WasmLoader2 } from './wasm-loader2.ts';
export * from './wasm-memory-optimizer.ts';
export { default as WasmMemoryOptimizer } from './wasm-memory-optimizer.ts';
export * from './wasm-types.ts';

// FACT WASM Core (cognitive processing - consolidated from src/wasm/)
// Located in fact-core/ subdirectory to avoid naming conflicts
// Note: FACT exports will be added when needed
