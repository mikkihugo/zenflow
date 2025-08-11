/**
 * Bindings Module - Barrel Export.
 *
 * Central export point for Rust/WASM bindings and native integrations.
 */
/**
 * @file Bindings module exports.
 */
export declare const BindingsUtils: {
    /**
     * Check if native bindings are available.
     */
    isNativeAvailable: () => boolean;
    /**
     * Get binding type based on availability.
     */
    getBindingType: () => "native" | "wasm" | "fallback";
    /**
     * Load appropriate binding.
     */
    loadBinding: () => Promise<any>;
};
export declare class BindingFactory {
    private static instance;
    /**
     * Get singleton binding instance.
     */
    static getInstance(): Promise<unknown>;
    /**
     * Clear cached instance.
     */
    static clearInstance(): void;
}
export default BindingsUtils;
//# sourceMappingURL=index.d.ts.map