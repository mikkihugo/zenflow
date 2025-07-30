/**
 * ruv-FANN Node.js bindings with automatic WASM fallback
 */

import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let nativeBinding = null;
let wasmModule = null;
let useWasm = false;

/**
 * Try to load native N-API binding first, fall back to WASM
 */
async function loadBinding() {
  // Try to load native binding first
  try {
    const { platform, arch } = process;
    const bindingPath = join(
      __dirname,
      '..',
      '..',
      'native',
      `ruv-fann-node-bindings.${platform}-${arch}.node`
    );
    nativeBinding = require(bindingPath);
    console.warn('✓ ruv-FANN native bindings loaded');
  } catch (e) {
    console.warn(`Failed to load native bindings: ${e.message}. Falling back to WASM.`);
    try {
      const wasmPath = join(__dirname, 'fallback', 'ruv_fann_wasm.js');
      const wasmLoader = await import(wasmPath);
      wasmModule = await wasmLoader.default(); // Initialize WASM
      useWasm = true;
      console.warn('✓ ruv-FANN WASM fallback loaded');
    } catch (wasmError) {
      console.error('FATAL: Failed to load ruv-FANN WASM fallback.', wasmError);
      throw wasmError;
    }
  }
}

/**
 * Neural Network class wrapper
 */
export class NeuralNetwork {
  private _impl: any;

  constructor(layers: number[]) {
    if (useWasm) {
      this._impl = new wasmModule.NeuralNetwork(layers);
    } else {
      this._impl = new nativeBinding.NeuralNetwork(layers);
    }
  }

  run(input): any {
    return this._impl.run(input);
  }

  trainOn(input, target): any {
    return this._impl.trainOn(input, target);
  }

  getInfo() {
    return this._impl.getInfo();
  }

  save(filename): any {
    return this._impl.save(filename);
  }

  static load(filename): any {
    const network = new NeuralNetwork([1]); // Temporary
    if (useWasm) {
      network._impl = wasmModule.NeuralNetwork.load(filename);
    } else {
      network._impl = nativeBinding.NeuralNetwork.load(filename);
    }
    return network;
  }
}

/**
 * Network trainer wrapper
 */
export class NetworkTrainer {
  private _impl: any;

  constructor(network) {
    if (useWasm) {
      this._impl = new wasmModule.NetworkTrainer(network._impl);
    } else {
      this._impl = new nativeBinding.NetworkTrainer(network._impl);
    }
  }

  async train(trainingInputs, trainingOutputs, config): any {
    return this._impl.train(trainingInputs, trainingOutputs, config);
  }
}

/**
 * Utility functions
 */
export function getVersion() {
  if (useWasm) {
    return wasmModule.getVersion();
  } else {
    return nativeBinding.getVersion();
  }
}

export function isGpuAvailable() {
  if (useWasm) {
    return wasmModule.isGpuAvailable();
  } else {
    return nativeBinding.isGpuAvailable();
  }
}

export function getActivationFunctions() {
  if (useWasm) {
    return wasmModule.getActivationFunctions();
  } else {
    return nativeBinding.getActivationFunctions();
  }
}

/**
 * WASM fallback interface
 */
export const wasmFallback = {
  async init() {
    await loadBinding();
  },

  createNetwork(layers): any {
    if (!wasmModule) {
      throw new Error('WASM module not loaded');
    }
    return new wasmModule.NeuralNetwork(layers);
  },

  isAvailable() {
    return !!wasmModule;
  },
};

/**
 * Get current backend information
 */
export function getBackendInfo() {
  return { backend: useWasm ? 'wasm' : 'native' };
}

// Auto-load bindings on import
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  loadBinding().catch(console.error);
}
