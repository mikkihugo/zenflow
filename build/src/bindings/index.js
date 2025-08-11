/**
 * Bindings Module - Barrel Export.
 *
 * Central export point for Rust/WASM bindings and native integrations.
 */
// TypeScript definitions for Rust bindings - types will be inferred from implementations
// Bindings utilities
/**
 * @file Bindings module exports.
 */
export const BindingsUtils = {
    /**
     * Check if native bindings are available.
     */
    isNativeAvailable: () => {
        try {
            // Try to load native module
            require('./build/Release/native');
            return true;
        }
        catch {
            return false;
        }
    },
    /**
     * Get binding type based on availability.
     */
    getBindingType: () => {
        if (BindingsUtils.isNativeAvailable()) {
            return 'native';
        }
        // Check for WASM availability
        if (typeof WebAssembly !== 'undefined') {
            return 'wasm';
        }
        return 'fallback';
    },
    /**
     * Load appropriate binding.
     */
    loadBinding: async () => {
        const bindingType = BindingsUtils.getBindingType();
        switch (bindingType) {
            case 'native':
                return require('./build/Release/native');
            case 'wasm': {
                // Load WASM bindings through proper abstraction (fixed isolation violation)
                // Instead of direct import, use dynamic loading with proper interface
                const wasmModule = await import('./wasm-binding-interface.ts');
                return wasmModule.default;
            }
            default:
                throw new Error('No bindings available');
        }
    },
};
// Binding factory
export class BindingFactory {
    static instance = null;
    /**
     * Get singleton binding instance.
     */
    static async getInstance() {
        if (!BindingFactory.instance) {
            BindingFactory.instance = await BindingsUtils.loadBinding();
        }
        return BindingFactory.instance;
    }
    /**
     * Clear cached instance.
     */
    static clearInstance() {
        BindingFactory.instance = null;
    }
}
// Default export
export default BindingsUtils;
