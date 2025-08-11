// Legacy compatibility shim - delegates to unified neural/wasm implementation
// TODO: Remove after all tests & code paths migrated to import from 'src/neural/wasm'
// Legacy shim now routes to compatibility layer (wasm-compat)
// Deprecated: use NeuralWasmGateway from 'src/neural/wasm/gateway'

// Export for CommonJS compatibility
const {
  WasmModuleLoader,
  WasmMemoryOptimizer,
} = require('./neural/wasm/wasm-compat.ts');

module.exports = {
  WasmModuleLoader,
  WasmMemoryOptimizer,
};

// ESM named exports
module.exports.WasmModuleLoader = WasmModuleLoader;
module.exports.WasmMemoryOptimizer = WasmMemoryOptimizer;
