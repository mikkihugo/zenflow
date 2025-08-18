/**
 * @fileoverview WASM Neural Loader - Dynamic optional loading of WASM modules
 *
 * This module provides safe, optional loading of WASM neural acceleration modules.
 * All imports are dynamic to avoid TypeScript compilation issues when WASM
 * modules are not available.
 */
/**
 * Dynamically try to load WASM neural module from various possible locations.
 *
 * @returns Promise resolving to WASM module or null if not available
 */
export async function loadWasmNeural() {
    const possiblePaths = [
        '../../bin/wasm/zen_swarm_neural.js',
        '../../wasm/zen_swarm_neural.js',
        '@claude-zen/wasm-neural'
    ];
    for (const path of possiblePaths) {
        try {
            // Use Function constructor to avoid static import analysis
            const dynamicImport = new Function('path', 'return import(path)');
            const wasmModule = await dynamicImport(path);
            if (wasmModule && typeof wasmModule.default === 'function') {
                return wasmModule;
            }
        }
        catch {
            // Try next path
            continue;
        }
    }
    return null;
}
/**
 * Check if WASM neural acceleration is available.
 */
export async function isWasmNeuralAvailable() {
    try {
        const wasmModule = await loadWasmNeural();
        return !!wasmModule;
    }
    catch {
        return false;
    }
}
