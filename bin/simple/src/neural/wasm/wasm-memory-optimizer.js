export class WasmMemoryOptimizer {
    optimized = false;
    async optimize() {
        if (this.optimized)
            return;
        this.optimized = true;
    }
    isOptimized() {
        return this.optimized;
    }
    reset() {
        this.optimized = false;
    }
}
export default WasmMemoryOptimizer;
//# sourceMappingURL=wasm-memory-optimizer.js.map