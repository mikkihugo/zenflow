export class WasmEnhancedLoader {
    initialized = false;
    async initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
    }
    isInitialized() {
        return this.initialized;
    }
}
export default WasmEnhancedLoader;
//# sourceMappingURL=wasm-enhanced-loader.js.map