/**
 * Public interface for neural WASM operations.
 *
 * @example
 */
/**
 * @file Neural network: public-api.
 */
/**
 * Factory function to create a public neural WASM interface.
 * This wraps the internal WASM modules with a limited public interface.
 *
 * @example
 */
export async function createNeuralWASM() {
    // Dynamically import to avoid architecture violations
    const { WASMNeuralAccelerator } = await import('./wasm/wasm-neural-accelerator.ts');
    const accelerator = new WASMNeuralAccelerator({
        wasmPath: '/path/to/neural.wasm',
        memoryPages: 256,
        maxInstances: 1,
        enableSIMD: true,
        enableThreads: false,
        optimizationLevel: 'O2',
    });
    await accelerator.initialize();
    // Return limited public interface
    return {
        async initialize() {
            return accelerator.initialize();
        },
        async createNetwork(layers) {
            return accelerator.createNetwork(layers);
        },
        async train(networkId, data, labels) {
            return accelerator.train(networkId, data, labels);
        },
        async predict(networkId, input) {
            return accelerator.predictArray(networkId, input);
        },
        freeNetwork(networkId) {
            return accelerator.freeNetwork(networkId);
        },
    };
}
