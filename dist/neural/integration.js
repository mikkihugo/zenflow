/**
 * Integration module for ruv-FANN bindings with claude-zen
 */

import { 
  NeuralNetwork, 
  NetworkTrainer, 
  getVersion, 
  isGpuAvailable, 
  getActivationFunctions,
  getBackendInfo,
  init 
} from '../bindings/index.js';

/**
 * Claude Zen Neural Service - integrates ruv-FANN with the claude-zen ecosystem
 */
export class ClaudeZenNeuralService {
  constructor() {
    this.initialized = false;
    this.networks = new Map();
    this.trainers = new Map();
  }

  /**
   * Initialize the neural service
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await init();
      const backendInfo = getBackendInfo();
      console.log(`🧠 Claude Zen Neural Service initialized with ${backendInfo.backend} backend`);
      console.log(`   Version: ${backendInfo.version}`);
      console.log(`   GPU Available: ${backendInfo.gpuAvailable}`);
      
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Neural Service: ${error.message}`);
    }
  }

  /**
   * Create a new neural network and register it with the service
   */
  async createNetwork(id, layers, options = {}) {
    await this.initialize();

    if (this.networks.has(id)) {
      throw new Error(`Network with id '${id}' already exists`);
    }

    const network = new NeuralNetwork(layers);
    this.networks.set(id, {
      network,
      metadata: {
        id,
        layers,
        created: new Date(),
        ...options
      }
    });

    return network;
  }

  /**
   * Get a registered network by ID
   */
  getNetwork(id) {
    const entry = this.networks.get(id);
    return entry ? entry.network : null;
  }

  /**
   * Create a trainer for a network
   */
  createTrainer(networkId) {
    const entry = this.networks.get(networkId);
    if (!entry) {
      throw new Error(`Network '${networkId}' not found`);
    }

    const trainer = new NetworkTrainer(entry.network);
    this.trainers.set(networkId, trainer);
    return trainer;
  }

  /**
   * Train a network with provided data
   */
  async trainNetwork(networkId, trainingData, config = {}) {
    let trainer = this.trainers.get(networkId);
    if (!trainer) {
      trainer = this.createTrainer(networkId);
    }

    const defaultConfig = {
      learning_rate: 0.1,
      max_epochs: 1000,
      desired_error: 0.01,
      algorithm: 'backpropagation'
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    return await trainer.train(
      trainingData.inputs,
      trainingData.outputs,
      finalConfig
    );
  }

  /**
   * Run prediction on a network
   */
  predict(networkId, input) {
    const entry = this.networks.get(networkId);
    if (!entry) {
      throw new Error(`Network '${networkId}' not found`);
    }

    return entry.network.run(input);
  }

  /**
   * Save a network to file
   */
  saveNetwork(networkId, filename) {
    const entry = this.networks.get(networkId);
    if (!entry) {
      throw new Error(`Network '${networkId}' not found`);
    }

    entry.network.save(filename);
  }

  /**
   * Load a network from file
   */
  async loadNetwork(id, filename) {
    await this.initialize();

    const network = NeuralNetwork.load(filename);
    this.networks.set(id, {
      network,
      metadata: {
        id,
        loaded: new Date(),
        filename
      }
    });

    return network;
  }

  /**
   * Get service status and statistics
   */
  getStatus() {
    return {
      initialized: this.initialized,
      backend: this.initialized ? getBackendInfo() : null,
      networks: Array.from(this.networks.entries()).map(([id, entry]) => ({
        id,
        ...entry.metadata
      })),
      trainers: Array.from(this.trainers.keys())
    };
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.networks.clear();
    this.trainers.clear();
    this.initialized = false;
  }
}

/**
 * Default instance for easy access
 */
export const neuralService = new ClaudeZenNeuralService();

/**
 * Convenience functions for direct access
 */
export async function initializeNeuralService() {
  return await neuralService.initialize();
}

export async function createNeuralNetwork(id, layers, options) {
  return await neuralService.createNetwork(id, layers, options);
}

export function getNeuralNetwork(id) {
  return neuralService.getNetwork(id);
}

export async function trainNeuralNetwork(networkId, trainingData, config) {
  return await neuralService.trainNetwork(networkId, trainingData, config);
}

export function predictWithNetwork(networkId, input) {
  return neuralService.predict(networkId, input);
}

export function getNeuralServiceStatus() {
  return neuralService.getStatus();
}

// Export the direct bindings as well for advanced use
export {
  NeuralNetwork,
  NetworkTrainer,
  getVersion as getNeuralVersion,
  isGpuAvailable as isNeuralGpuAvailable,
  getActivationFunctions as getNeuralActivationFunctions,
  getBackendInfo as getNeuralBackendInfo
};