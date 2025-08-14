export class WasmLoader2 {
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
export default WasmLoader2;
