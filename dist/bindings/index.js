/**
 * ruv-FANN Node.js bindings with automatic WASM fallback
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    const bindingPath = join(__dirname, 'native', `ruv-fann-node-bindings.${platform}-${arch}.node`);
    nativeBinding = require(bindingPath);
    console.log('✓ ruv-FANN: Using native N-API bindings for optimal performance');
    return;
  } catch (error) {
    console.log('⚠ ruv-FANN: Native bindings not available, falling back to WASM');
    console.log('  Error:', error.message);
  }

  // Fall back to WASM
  try {
    const wasmPath = join(__dirname, 'fallback', 'ruv_fann_wasm.js');
    const wasmLoader = await import(wasmPath);
    wasmModule = await wasmLoader.default(); // Initialize WASM
    useWasm = true;
    console.log('✓ ruv-FANN: Using WASM fallback');
  } catch (error) {
    throw new Error(`Failed to load ruv-FANN: Neither native bindings nor WASM fallback available. ${error.message}`);
  }
}

/**
 * Neural Network wrapper that delegates to native or WASM implementation
 */
export class NeuralNetwork {
  constructor(layers) {
    if (!nativeBinding && !wasmModule) {
      throw new Error('ruv-FANN not initialized. Call loadBinding() first.');
    }

    if (useWasm) {
      this._impl = new wasmModule.NeuralNetwork(layers);
    } else {
      this._impl = new nativeBinding.NeuralNetwork(layers);
    }
  }

  run(input) {
    return this._impl.run(input);
  }

  trainOn(input, target) {
    return this._impl.trainOn(input, target);
  }

  getInfo() {
    return this._impl.getInfo();
  }

  save(filename) {
    return this._impl.save(filename);
  }

  static load(filename) {
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
  constructor(network) {
    if (useWasm) {
      this._impl = new wasmModule.NetworkTrainer(network._impl);
    } else {
      this._impl = new nativeBinding.NetworkTrainer(network._impl);
    }
  }

  async train(trainingInputs, trainingOutputs, config) {
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

  createNetwork(layers) {
    if (!wasmModule) {
      throw new Error('WASM module not loaded');
    }
    return new wasmModule.NeuralNetwork(layers);
  },

  isAvailable() {
    return !!wasmModule;
  }
};

/**
 * Get current backend information
 */
export function getBackendInfo() {
  return {
    backend: useWasm ? 'wasm' : 'native',
    version: getVersion(),
    gpuAvailable: isGpuAvailable(),
    activationFunctions: getActivationFunctions()
  };
}

/**
 * Initialize the module (call this before using any functions)
 */
export async function init() {
  await loadBinding();
}

// Auto-initialize if in Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  loadBinding().catch(console.error);
}