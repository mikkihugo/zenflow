/**
 * Integration module for ruv-FANN bindings with claude-zen
 */

import {
  getActivationFunctions,
  getBackendInfo,
  getVersion,
  init,
  isGpuAvailable,
  NetworkTrainer,
  NeuralNetwork,
} from '../bindings/index.js';
import type { JSONObject } from '../types/core.js';

/**
 * Network metadata interface
 */
export interface NetworkMetadata {id = false
private
networks = new Map()
private
trainers = new Map() // NetworkTrainer from bindings

/**
 * Initialize the neural service
 */
async;
initialize();
: Promise<void>
{
  if (this.initialized) return;

  try {
      await init();
      const backendInfo = getBackendInfo();
      console.warn(`🧠 Claude Zen Neural Service initialized with ${backendInfo.backend} backend`);
      console.warn(`Version = true;
    } catch (error) {

    if (this.networks.has(id)) {
      throw new Error(`Network with id '${id}' already exists`);
    }

  const network = new NeuralNetwork(layers);
  this.networks.set(id, {
      network,metadata = this.networks.get(id);
  return entry ? entry.network = this.networks.get(networkId);
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
async;
trainNetwork((networkId = {}));
: Promise<any>
{
  let trainer = this.trainers.get(networkId);
  if (!trainer) {
    trainer = this.createTrainer(networkId);
  }

  const _defaultConfig = {learning_rate = { ..._defaultConfig, ...config };

  return await trainer.train(
      trainingData.inputs,
      trainingData.outputs,
      finalConfig
    );
}

/**
 * Run prediction on a network
 */
predict(networkId = this.networks.get(networkId);
if (!entry) {
  throw new Error(`Network '${networkId}' not found`);
}

return entry.network.run(input);
}

  /**
   * Save a network to file
   */
  saveNetwork(networkId = this.networks.get(networkId)
if (!entry) {
  throw new Error(`Network '${networkId}' not found`);
}

entry.network.save(filename);
}

  /**
   * Load a network from file
   */
  async loadNetwork(id = NeuralNetwork.load(filename)
this.networks.set(id,
{
  network,metadata = > ({
        id,
        ...entry.metadata
      })
  ),trainers = false
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

export async function createNeuralNetwork(
  id: string,
  layers: number[],
  options?: JSONObject
): Promise<any> {
  return await neuralService.createNetwork(id, layers, options);
}

export function getNeuralNetwork(id: string): any | null {
  return neuralService.getNetwork(id);
}

export async function trainNeuralNetwork(
  networkId: string,
  trainingData: TrainingData,
  config?: TrainingConfig
): Promise<any> {
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
  getBackendInfo as getNeuralBackendInfo,
};
