/**
 * Public interface for neural WASM operations.
 *
 * @example
 */
/**
 * @file Neural network: public-api.
 */
export interface NeuralWASM {
    initialize(): Promise<void>;
    createNetwork(layers: number[]): Promise<string>;
    train(networkId: string, data: number[][], labels: number[][]): Promise<WASMPerformanceMetrics>;
    predict(networkId: string, input: number[]): Promise<number[]>;
    freeNetwork(networkId: string): void;
}
/**
 * Factory function to create a public neural WASM interface.
 * This wraps the internal WASM modules with a limited public interface.
 *
 * @example
 */
export declare function createNeuralWASM(): Promise<NeuralWASM>;
//# sourceMappingURL=public-api.d.ts.map