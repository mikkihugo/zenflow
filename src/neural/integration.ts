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
import type { JSONObject } from '../types/core.js';

/**
 * Network metadata interface
 */
export interface NetworkMetadata {
  id: string;
  layers?: number[];
  created?: Date;
  loaded?: Date;
  filename?: string;
  [key: string]: any;
}

/**
 * Network entry interface
 */
export interface NetworkEntry {
  network: any; // NeuralNetwork from bindings
  metadata: NetworkMetadata;
}

/**
 * Training data interface
 */
export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

/**
 * Training configuration interface
 */
export interface TrainingConfig {
  learning_rate?: number;
  max_epochs?: number;
  desired_error?: number;
  algorithm?: string;
}

/**
 * Backend information interface
 */
export interface BackendInfo {
  backend: string;
  version: string;
  gpuAvailable: boolean;
}

/**
 * Service status interface
 */
export interface ServiceStatus {
  initialized: boolean;
  backend: BackendInfo | null;
  networks: Array<{ id: string } & NetworkMetadata>;
  trainers: string[];
}

/**
 * Claude Zen Neural Service - integrates ruv-FANN with the claude-zen ecosystem
 */
export class ClaudeZenNeuralService {
  private initialized: boolean = false;
  private networks: Map<string, NetworkEntry> = new Map();
  private trainers: Map<string, any> = new Map(); // NetworkTrainer from bindings

  /**
   * Initialize the neural service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await init();
      const backendInfo = getBackendInfo();
      console.log(`🧠 Claude Zen Neural Service initialized with ${backendInfo.backend} backend`);
      console.log(`   Version: ${backendInfo.version}`);
      console.log(`   GPU Available: ${backendInfo.gpuAvailable}`);
      
      this.initialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize Neural Service: ${errorMessage}`);
    }
  }

  /**
   * Create a new neural network and register it with the service
   */
  async createNetwork(id: string, layers: number[], options: JSONObject = {}): Promise<any> {
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
  getNetwork(id: string): any | null {
    const entry = this.networks.get(id);
    return entry ? entry.network : null;
  }

  /**
   * Create a trainer for a network
   */
  createTrainer(networkId: string): any {
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
  async trainNetwork(networkId: string, trainingData: TrainingData, config: TrainingConfig = {}): Promise<any> {
    let trainer = this.trainers.get(networkId);
    if (!trainer) {
      trainer = this.createTrainer(networkId);
    }

    const defaultConfig: Required<TrainingConfig> = {
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
  predict(networkId: string, input: number[]): number[] {
    const entry = this.networks.get(networkId);
    if (!entry) {
      throw new Error(`Network '${networkId}' not found`);
    }

    return entry.network.run(input);
  }

  /**
   * Save a network to file
   */
  saveNetwork(networkId: string, filename: string): void {
    const entry = this.networks.get(networkId);
    if (!entry) {
      throw new Error(`Network '${networkId}' not found`);
    }

    entry.network.save(filename);
  }

  /**
   * Load a network from file
   */
  async loadNetwork(id: string, filename: string): Promise<any> {
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
  getStatus(): ServiceStatus {
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
  dispose(): void {
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
export async function initializeNeuralService(): Promise<void> {
  return await neuralService.initialize();
}

export async function createNeuralNetwork(id: string, layers: number[], options?: JSONObject): Promise<any> {
  return await neuralService.createNetwork(id, layers, options);
}

export function getNeuralNetwork(id: string): any | null {
  return neuralService.getNetwork(id);
}

export async function trainNeuralNetwork(networkId: string, trainingData: TrainingData, config?: TrainingConfig): Promise<any> {
  return await neuralService.trainNetwork(networkId, trainingData, config);
}

export function predictWithNetwork(networkId: string, input: number[]): number[] {
  return neuralService.predict(networkId, input);
}

export function getNeuralServiceStatus(): ServiceStatus {
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