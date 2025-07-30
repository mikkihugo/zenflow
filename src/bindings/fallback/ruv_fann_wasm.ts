/**
 * WASM fallback implementation for ruv-FANN
 * Uses existing ruv-swarm WASM infrastructure when native bindings are not available
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let wasmModule = null;
let initialized = false;

/**
 * Initialize WASM module
 */
async function initWasm() {
  if (initialized) return;

  try {
    // Try to use existing ruv-swarm WASM infrastructure
    const wasmPath = join(__dirname, '../../ruv-FANN/ruv-swarm/npm/wasm/ruv_swarm_wasm.js');
    const wasmLoader = await import(wasmPath).catch(() => null);

    if (wasmLoader) {
      wasmModule = await wasmLoader.default();
      initialized = true;
      return;
    }
  } catch (_error) {
    console.warn('Failed to load ruv-swarm WASM, creating a simple fallback.');
    wasmModule = createSimpleFallback();
  }
  initialized = true;
}

/**
 * Create a simple fallback implementation for basic neural network operations
 */
function createSimpleFallback() {
  return {
    NeuralNetwork: class {
      layers: number[];
      weights: any[];
      biases: any[];

      constructor(layers: number[]) {
        if (layers.some((size) => size < 1)) {
          throw new Error('All layers must have at least 1 neuron');
        }
        this.layers = layers;
        this.weights = this._initializeWeights(layers);
        this.biases = this._initializeBiases(layers);
      }

      _initializeWeights(layers): any {
        const weights = [];
        for (let i = 0; i < layers.length - 1; i++) {
          const layerWeights = [];
          for (let j = 0; j < layers[i]; j++) {
            const neuronWeights = [];
            for (let k = 0; k < layers[i + 1]; k++) {
              neuronWeights.push(Math.random() * 2 - 1); // Random weights between -1 and 1
            }
            layerWeights.push(neuronWeights);
          }
          weights.push(layerWeights);
        }
        return weights;
      }

      _initializeBiases(layers): any {
        const biases = [];
        for (let i = 1; i < layers.length; i++) {
          const layerBiases = [];
          for (let j = 0; j < layers[i]; j++) {
            layerBiases.push(Math.random() * 2 - 1);
          }
          biases.push(layerBiases);
        }
        return biases;
      }

      _sigmoid(x): any {
        return 1 / (1 + Math.exp(-x));
      }

      run(input): any {
        if (input.length !== this.layers[0]) {
          throw new Error(
            `Input size ${input.length} doesn't match network input size ${this.layers[0]}`
          );
        }

        let output = [...input];

        for (let layer = 0; layer < this.weights.length; layer++) {
          const newOutput = [];
          for (let neuron = 0; neuron < this.weights[layer][0].length; neuron++) {
            let sum = this.biases[layer][neuron];
            for (let input_idx = 0; input_idx < output.length; input_idx++) {
              sum += output[input_idx] * this.weights[layer][input_idx][neuron];
            }
            newOutput.push(this._sigmoid(sum));
          }
          output = newOutput;
        }

        return output;
      }

      trainOn(input, target): any {
        // Simple gradient descent implementation
        const learningRate = 0.1;
        const output = this.run(input);

        // Calculate error
        let error = 0;
        for (let i = 0; i < output.length; i++) {
          error += (target[i] - output[i]) ** 2;
        }
        error /= output.length;

        // Simple weight adjustment (placeholder - real implementation would need backpropagation)
        const adjustmentFactor = error * learningRate;
        for (let layer = 0; layer < this.weights.length; layer++) {
          for (let i = 0; i < this.weights[layer].length; i++) {
            for (let j = 0; j < this.weights[layer][i].length; j++) {
              this.weights[layer][i][j] += (Math.random() - 0.5) * adjustmentFactor;
            }
          }
        }

        return error;
      }

      getInfo() {
        return JSON.stringify({ num_layers: this.layers.length });
      }
    },

    NetworkTrainer: class {
      network: any;

      constructor(network) {
        this.network = network;
      }

      async train(trainingInputs, trainingOutputs, config): any {
        if (trainingInputs.length !== trainingOutputs.length) {
          throw new Error('Input and output data must have same length');
        }

        let totalError = 0;
        const maxEpochs = config.max_epochs || 1000;
        const desiredError = config.desired_error || 0.01;

        for (let epoch = 0; epoch < maxEpochs; epoch++) {
          totalError = 0;

          for (let i = 0; i < trainingInputs.length; i++) {
            const error = this.network.trainOn(trainingInputs[i], trainingOutputs[i]);
            totalError += error;
          }

          totalError /= trainingInputs.length;

          if (totalError < desiredError) {
            console.warn(`Training completed at epoch ${epoch} with error ${totalError}`);
            break;
          }
        }

        return totalError;
      }
    },

    getVersion() {
      return '0.1.0-wasm-fallback';
    },

    isGpuAvailable() {
      return false; // WASM fallback doesn't support GPU
    },

    getActivationFunctions() {
      return ['sigmoid']; // Simplified list for fallback
    },
  };
}

/**
 * Default export function that initializes and returns the WASM module
 */
export default async function () {
  await initWasm();
  return wasmModule;
}

// Export individual classes for direct use
export async function getNeuralNetwork() {
  await initWasm();
  return wasmModule.NeuralNetwork;
}

export async function getNetworkTrainer() {
  await initWasm();
  return wasmModule.NetworkTrainer;
}

export async function getVersion() {
  await initWasm();
  return wasmModule.getVersion();
}

export async function isGpuAvailable() {
  await initWasm();
  return wasmModule.isGpuAvailable();
}

export async function getActivationFunctions() {
  await initWasm();
  return wasmModule.getActivationFunctions();
}
