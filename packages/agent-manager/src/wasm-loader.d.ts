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
export declare function loadWasmNeural(): Promise<any>;
/**
 * Check if WASM neural acceleration is available.
 */
export declare function isWasmNeuralAvailable(): Promise<boolean>;
//# sourceMappingURL=wasm-loader.d.ts.map