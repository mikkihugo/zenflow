/**
 * ruv-FANN Node.js bindings with automatic WASM fallback;
 */

import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
const _require = createRequire(import.meta.url);

const _nativeBinding = null;
const _wasmModule = null;
const _useWasm = false;
/**
 * Try to load native N-API binding first, fall back to WASM;
 */
async function loadBinding(): unknown {
  // Try to load native binding first
  try {
    const { platform, arch } = process;
    const _bindingPath = join(;
      __dirname,
      '..',
      '..',
      'native',
      `ruv-fann-node-bindings.${platform}-${arch}.node`;
    );
    nativeBinding = require(bindingPath);
    console.warn('✓ ruv-FANN native bindings loaded');
  } catch (/* e */) {
    console.warn(`Failed to load native bindings: ${e.message}. Falling back to WASM.`);
    try {
      const _wasmPath = join(__dirname, 'fallback', 'ruv_fann_wasm.js');
// const _wasmLoader = awaitimport(wasmPath);
      wasmModule = await wasmLoader.default(); // Initialize WASM
      useWasm = true;
      console.warn('✓ ruv-FANN WASM fallback loaded');
    } catch (/* wasmError */) {
      console.error('FATAL: Failed to load ruv-FANN WASM fallback.', wasmError);
      throw wasmError;
    }
  }
}
/**
 * Neural Network class wrapper;
 */
export class NeuralNetwork {
  private _impl: unknown;

  constructor(layers: number[]) {
    if (useWasm) {
      this._impl = new wasmModule.NeuralNetwork(layers);
    } else {
      this._impl = new nativeBinding.NeuralNetwork(layers);
    }
  }

  run(input): unknown {
    return this._impl.run(input);
    //   // LINT: unreachable code removed}

  trainOn(input, target): unknown
    return this._impl.trainOn(input, target);
    //   // LINT: unreachable code removed}

  getInfo()
    return this._impl.getInfo();
    //   // LINT: unreachable code removed}

  save(filename): unknown
    return this._impl.save(filename);
    //   // LINT: unreachable code removed}

  static load(filename): unknown {
    const _network = new NeuralNetwork([1]); // Temporary
    if (useWasm) {
      network._impl = wasmModule.NeuralNetwork.load(filename);
    } else {
      network._impl = nativeBinding.NeuralNetwork.load(filename);
    }
    return network;
    //   // LINT: unreachable code removed}
}

/**
 * Network trainer wrapper;
 */;
export class NetworkTrainer {
  private _impl: unknown;

  constructor(network) {
    if (useWasm) {
      this._impl = new wasmModule.NetworkTrainer(network._impl);
    } else {
      this._impl = new nativeBinding.NetworkTrainer(network._impl);
    }
  }

  async train(trainingInputs, trainingOutputs, config): unknown {
    return this._impl.train(trainingInputs, trainingOutputs, config);
    //   // LINT: unreachable code removed}
}

/**
 * Utility functions;
 */;
export function getVersion(): unknown {
  if (useWasm) {
    return wasmModule.getVersion();
    //   // LINT: unreachable code removed} else {
    return nativeBinding.getVersion();
    //   // LINT: unreachable code removed}
}

export function _isGpuAvailable(): unknown {
  if (useWasm) {
    return wasmModule.isGpuAvailable();
    //   // LINT: unreachable code removed} else {
    return nativeBinding.isGpuAvailable();
    //   // LINT: unreachable code removed}
}

export function _getActivationFunctions(): unknown {
  if (useWasm) {
    return wasmModule.getActivationFunctions();
    //   // LINT: unreachable code removed} else {
    return nativeBinding.getActivationFunctions();
    //   // LINT: unreachable code removed}
}

/**
 * WASM fallback interface;
 */;
export const _wasmFallback = {
  async init() {
// await loadBinding();
  },
  createNetwork(layers): unknown
    if (!wasmModule) {
      throw new Error('WASM module not loaded');
    }
    return new wasmModule.NeuralNetwork(layers);
    //   // LINT: unreachable code removed},
  isAvailable()
    return !!wasmModule;

/**
 * Get current backend information;
 */;
export function _getBackendInfo(): unknown {
  return { backend: useWasm ? 'wasm' : 'native' };
}

// Auto-load bindings on import
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  loadBinding().catch(console.error);
}
