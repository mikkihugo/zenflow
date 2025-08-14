export class WasmModuleLoader {
    loaded = false;
    module = null;
    async load() {
        if (this.loaded)
            return;
        this.loaded = true;
        this.module = { exports: {} };
    }
    async loadModule() {
        await this.load();
    }
    isLoaded() {
        return this.loaded;
    }
    async initialize() {
        await this.load();
    }
    getModule() {
        return this.module;
    }
    async cleanup() {
        this.loaded = false;
        this.module = null;
    }
    getTotalMemoryUsage() {
        return 0;
    }
    getModuleStatus() {
        return {
            loaded: this.loaded,
            memoryUsage: 0,
            status: this.loaded ? 'ready' : 'unloaded',
        };
    }
}
export default WasmModuleLoader;
//# sourceMappingURL=wasm-loader.js.map