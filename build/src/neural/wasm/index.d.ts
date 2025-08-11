/**
 * Neural WASM Module - Unified WebAssembly components.
 *
 * This module provides access to all neural WebAssembly components:
 * - CUDA-Rust transpiler for GPU acceleration (main implementation)
 * - FACT cognitive processing engine (consolidated from src/wasm/)
 * - Unified WASM loading and management utilities.
 */
/**
 * @file Wasm module exports.
 */
export * from './binaries/wasm-bindings-loader.mjs';
export * from './wasm-compat.ts';
export { default as WasmLoader } from './wasm-loader.ts';
export * from './wasm-memory-optimizer.ts';
export { default as WasmMemoryOptimizer } from './wasm-memory-optimizer.ts';
export * from './wasm-types';
export * from './wasm-neural-accelerator.ts';
export * from './gateway.ts';
export { default as NeuralWasmGateway } from './gateway.ts';
//# sourceMappingURL=index.d.ts.map