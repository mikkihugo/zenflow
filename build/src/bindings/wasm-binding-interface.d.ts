/**
 * @file Wasm-binding-interface implementation.
 */
import type { NeuralConfig, NeuralNetworkInterface, WasmNeuralBinding } from '../core/interfaces/base-interfaces.ts';
/**
 * WASM binding interface contract.
 * Defines what bindings can expect from WASM modules.
 *
 * @example
 */
export interface WasmBindingInterface extends WasmNeuralBinding {
    loadWasm(): Promise<WebAssembly.Module | Record<string, unknown>>;
    isWasmAvailable(): boolean;
    getWasmCapabilities(): string[];
    createNeuralNetwork(config: NeuralConfig): Promise<NeuralNetworkInterface>;
}
/**
 * WASM binding provider.
 * Implements the interface by delegating to actual WASM modules.
 *
 * @example
 */
declare class WasmBindingProvider implements WasmBindingInterface {
    private wasmModule;
    loadWasm(): Promise<WebAssembly.Module | Record<string, unknown>>;
    isWasmAvailable(): boolean;
    getWasmCapabilities(): string[];
    createNeuralNetwork(config: NeuralConfig): Promise<NeuralNetworkInterface>;
}
/**
 * Singleton instance for consistent binding access.
 */
declare const wasmBindingProvider: WasmBindingProvider;
export default wasmBindingProvider;
//# sourceMappingURL=wasm-binding-interface.d.ts.map