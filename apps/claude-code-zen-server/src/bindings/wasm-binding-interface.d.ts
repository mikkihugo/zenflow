/**
 * @file Wasm-binding-interface implementation.
 */
import type { NeuralConfig, NeuralNetworkInterface, WasmNeuralBinding } from '../coordination/types/interfaces';
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
 * Singleton WASM Binding Provider Instance.
 *
 * Pre-instantiated singleton that provides consistent access to WASM binding
 * capabilities across the entire system. This instance handles WASM module
 * loading, neural network creation, and capability detection with automatic
 * fallback when WASM is not available.
 *
 * The singleton pattern ensures that all parts of the system use the same
 * WASM binding instance, preventing multiple initialization overhead and
 * maintaining consistent state.
 *
 * @example
 * ```typescript
 * import wasmBinding js;
 *
 * // Check WASM availability
 * if (wasmBinding.isWasmAvailable()) {
 *   const network = await wasmBinding.createNeuralNetwork(config);
 *   const prediction = await network.predict(inputData);
 * }
 *
 * // Get system capabilities
 * const capabilities = wasmBinding.getWasmCapabilities();
 * console.log('Available features:', capabilities);
 * ```
 *
 * @const wasmBindingProvider
 * @see {@link WasmBindingProvider} - Implementation class
 * @see {@link WasmBindingInterface} - Interface definition
 * @since 1.0.0-alpha.43
 */
declare const wasmBindingProvider: WasmBindingProvider;
/**
 * Default WASM Binding Provider Export.
 *
 * Exports the singleton WASM binding instance for use throughout the system.
 * This is the primary way to access WASM-based neural network capabilities
 * and binding utilities.
 *
 * @default wasmBindingProvider
 * @see {@link wasmBindingProvider} - Singleton instance
 * @since 1.0.0-alpha.43
 */
export default wasmBindingProvider;
//# sourceMappingURL=wasm-binding-interface.d.ts.map