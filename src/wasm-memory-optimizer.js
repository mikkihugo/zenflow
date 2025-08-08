// Legacy compatibility shim for wasm-memory-optimizer
// TODO: Remove after migration to 'src/neural/wasm/wasm-memory-optimizer'
// Legacy shim now routes to compatibility layer (wasm-compat)
// Deprecated: use NeuralWasmGateway.optimize()
module.exports = require('./neural/wasm/wasm-compat.ts');
