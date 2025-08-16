// Legacy compatibility shim - delegates to unified brain/wasm implementation
// TODO: Remove after all tests & code paths migrated to import from '@claude-zen/brain/wasm'
// Legacy shim now routes to compatibility layer (wasm-compat)
// Deprecated: use NeuralWasmGateway from '@claude-zen/brain/wasm/gateway'

// Export for CommonJS compatibility
const {
  WasmModuleLoader,
  WasmMemoryOptimizer,
} = require('../packages/brain/wasm/wasm-compat.ts');

module.exports = {
  WasmModuleLoader,
  WasmMemoryOptimizer,
};

// ESM named exports
module.exports.WasmModuleLoader = WasmModuleLoader;
module.exports.WasmMemoryOptimizer = WasmMemoryOptimizer;
