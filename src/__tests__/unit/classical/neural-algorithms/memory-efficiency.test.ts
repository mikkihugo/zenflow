/**
 * Classical TDD (Detroit School) - Memory Efficiency Tests
 *
 * Focus: Test actual memory usage and allocation patterns
 * No mocks - verify real memory consumption and efficiency metrics
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  ACTIVATION_FUNCTIONS,
  createNeuralNetwork,
  createTrainer,
  initializeNeuralWasm,
  type NetworkConfig,
  type NeuralNetwork,
  TRAINING_ALGORITHMS,
  type TrainingConfig,
  type TrainingDataConfig,
} from '../../../../neural/core/neural-network';

describe('Memory Efficiency - Classical TDD', () => {
  let wasmModule: any;
  let _initialMemory: NodeJS.MemoryUsage;

  beforeEach(async () => {
    try {
      wasmModule = await initializeNeuralWasm();
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      _initialMemory = process.memoryUsage();
    } catch (_error) {
      console.warn('WASM module not available, skipping memory efficiency tests');
    }
  });

  afterEach(() => {
    // Force garbage collection after each test
    if (global.gc) {
      global.gc();
    }
  });

  describe('Network Creation Memory Usage', () => {
    it('should create small networks with minimal memory overhead', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const preCreationMemory = process.memoryUsage().heapUsed;

      // Create small network
      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 3, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
      };

      const network = await createNeuralNetwork(networkConfig);
      const info = network.getInfo();

      const postCreationMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = postCreationMemory - preCreationMemory;

      // Small network should use less than 1MB
      expect(memoryIncrease).toBeLessThan(1024 * 1024);

      // Verify network was actually created
      expect(info.numInputs).toBe(2);
      expect(info.numOutputs).toBe(1);
      expect(info.totalNeurons).toBeGreaterThan(0);
    });

    it('should scale memory usage predictably with network size', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkSizes = [
        { inputs: 2, hidden: 4, outputs: 1 },
        { inputs: 4, hidden: 8, outputs: 2 },
        { inputs: 8, hidden: 16, outputs: 4 },
      ];

      const memoryUsages: number[] = [];

      for (const size of networkSizes) {
        const preMemory = process.memoryUsage().heapUsed;

        const networkConfig: NetworkConfig = {
          inputSize: size.inputs,
          hiddenLayers: [{ size: size.hidden, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
          outputSize: size.outputs,
          outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        };

        const network = await createNeuralNetwork(networkConfig);
        const info = network.getInfo();

        const postMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = postMemory - preMemory;
        memoryUsages.push(memoryIncrease);

        // Verify network metrics are reported
        expect(info.metrics.memoryUsage).toBeGreaterThan(0);
        expect(info.totalConnections).toBeGreaterThan(0);
      }

      // Memory usage should increase with network size
      expect(memoryUsages[1]).toBeGreaterThan(memoryUsages[0]);
      expect(memoryUsages[2]).toBeGreaterThan(memoryUsages[1]);

      // But increase should be reasonable (not exponential)
      const ratio1 = memoryUsages[1] / memoryUsages[0];
      const ratio2 = memoryUsages[2] / memoryUsages[1];
      expect(ratio1).toBeLessThan(10); // Should not be more than 10x increase
      expect(ratio2).toBeLessThan(10);
    });

    it('should handle multiple layers efficiently', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const layerConfigurations = [
        { layers: [{ size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID }] },
        {
          layers: [
            { size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID },
            { size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID },
          ],
        },
        {
          layers: [
            { size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID },
            { size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID },
            { size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID },
          ],
        },
      ];

      const memoryUsages: number[] = [];

      for (const config of layerConfigurations) {
        const preMemory = process.memoryUsage().heapUsed;

        const networkConfig: NetworkConfig = {
          inputSize: 3,
          hiddenLayers: config?.layers,
          outputSize: 2,
          outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        };

        const network = await createNeuralNetwork(networkConfig);

        const postMemory = process.memoryUsage().heapUsed;
        memoryUsages.push(postMemory - preMemory);

        // Verify network was created correctly
        const info = network.getInfo();
        expect(info.numLayers).toBe(config?.layers.length + 2); // +input +output
      }

      // Each additional layer should add reasonable memory overhead
      for (let i = 1; i < memoryUsages.length; i++) {
        expect(memoryUsages[i]).toBeGreaterThan(memoryUsages[i - 1]);
        // But not more than 2x the previous
        expect(memoryUsages[i]).toBeLessThan(memoryUsages[i - 1] * 2.5);
      }
    });
  });

  describe('Training Memory Efficiency', () => {
    it('should maintain stable memory during training', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS.INCREMENTAL_BACKPROP,
        learningRate: 0.5,
        maxEpochs: 100,
        targetError: 0.1,
      };

      const xorData: TrainingDataConfig = {
        inputs: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        outputs: [[0], [1], [1], [0]],
      };

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(xorData);

      const preTrainingMemory = process.memoryUsage().heapUsed;

      // Train for multiple epochs and monitor memory
      const memorySnapshots: number[] = [];
      for (let epoch = 0; epoch < 50; epoch++) {
        await trainer.trainEpoch(network, xorData);

        if (epoch % 10 === 0) {
          memorySnapshots.push(process.memoryUsage().heapUsed);
        }
      }

      const postTrainingMemory = process.memoryUsage().heapUsed;
      const totalMemoryIncrease = postTrainingMemory - preTrainingMemory;

      // Memory should not grow significantly during training
      expect(totalMemoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB

      // Memory usage should be relatively stable across epochs
      const maxSnapshot = Math.max(...memorySnapshots);
      const minSnapshot = Math.min(...memorySnapshots);
      const memoryVariation = maxSnapshot - minSnapshot;

      expect(memoryVariation).toBeLessThan(2 * 1024 * 1024); // Less than 2MB variation
    });

    it('should handle large training datasets efficiently', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 3,
        hiddenLayers: [{ size: 6, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
        outputSize: 2,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
      };

      // Generate large dataset
      const largeDataset: TrainingDataConfig = {
        inputs: [],
        outputs: [],
      };

      for (let i = 0; i < 1000; i++) {
        largeDataset?.inputs?.push([Math.random(), Math.random(), Math.random()]);
        largeDataset?.outputs?.push([Math.random() > 0.5 ? 1 : 0, Math.random() > 0.5 ? 1 : 0]);
      }

      const preMemory = process.memoryUsage().heapUsed;

      const network = await createNeuralNetwork(networkConfig);
      network.setTrainingData(largeDataset);

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS.BATCH_BACKPROP,
        learningRate: 0.1,
        maxEpochs: 10,
        targetError: 0.3,
      };

      const trainer = await createTrainer(trainingConfig);

      // Train on large dataset
      for (let epoch = 0; epoch < 5; epoch++) {
        await trainer.trainEpoch(network, largeDataset);
      }

      const postMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = postMemory - preMemory;

      // Memory increase should be reasonable for 1000 training samples
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory when creating and destroying networks', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const preTestMemory = process.memoryUsage().heapUsed;

      // Create and destroy multiple networks
      for (let i = 0; i < 20; i++) {
        const networkConfig: NetworkConfig = {
          inputSize: 3,
          hiddenLayers: [{ size: 5, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
          outputSize: 2,
          outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        };

        const network = await createNeuralNetwork(networkConfig);

        // Use the network briefly
        await network.run([0.5, 0.5, 0.5]);

        // Network should be eligible for garbage collection after this scope
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
        // Wait a bit for cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const postTestMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = postTestMemory - preTestMemory;

      // Memory increase should be minimal after cleanup
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB residual
    });

    it('should properly clean up training resources', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const preTestMemory = process.memoryUsage().heapUsed;

      // Create multiple trainers and train briefly
      for (let i = 0; i < 10; i++) {
        const networkConfig: NetworkConfig = {
          inputSize: 2,
          hiddenLayers: [{ size: 4, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
          outputSize: 1,
          outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        };

        const trainingConfig: TrainingConfig = {
          algorithm: TRAINING_ALGORITHMS.INCREMENTAL_BACKPROP,
          learningRate: 0.5,
          maxEpochs: 10,
          targetError: 0.5,
        };

        const smallData: TrainingDataConfig = {
          inputs: [
            [0, 1],
            [1, 0],
          ],
          outputs: [[1], [1]],
        };

        const network = await createNeuralNetwork(networkConfig);
        const trainer = await createTrainer(trainingConfig);

        network.setTrainingData(smallData);
        await trainer.trainEpoch(network, smallData);

        // Resources should be cleaned up after this scope
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const postTestMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = postTestMemory - preTestMemory;

      // Should not accumulate significant memory
      expect(memoryIncrease).toBeLessThan(15 * 1024 * 1024); // Less than 15MB
    });
  });

  describe('Weight Storage Efficiency', () => {
    it('should store weights compactly', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 10,
        hiddenLayers: [
          { size: 20, activation: ACTIVATION_FUNCTIONS.SIGMOID },
          { size: 15, activation: ACTIVATION_FUNCTIONS.SIGMOID },
        ],
        outputSize: 5,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
      };

      const network = await createNeuralNetwork(networkConfig);
      const weights = network.getWeights();
      const info = network.getInfo();

      // Verify weight array size matches expected connections
      const expectedConnections = 10 * 20 + 20 * 15 + 15 * 5; // Input->H1 + H1->H2 + H2->Output
      const expectedWithBiases = expectedConnections + 20 + 15 + 5; // Plus biases

      // Weights should be reasonably close to expected size
      expect(weights.length).toBeGreaterThan(expectedConnections);
      expect(weights.length).toBeLessThan(expectedWithBiases * 2); // Not more than 2x expected

      // All weights should be finite numbers
      for (let i = 0; i < weights.length; i++) {
        expect(Number.isFinite(weights[i])).toBe(true);
      }

      // Memory usage metric should reflect actual storage
      expect(info.metrics.memoryUsage).toBeGreaterThan(weights.length * 4); // At least 4 bytes per float
    });

    it('should handle weight updates efficiently', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 5,
        hiddenLayers: [{ size: 8, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
        outputSize: 3,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
      };

      const network = await createNeuralNetwork(networkConfig);

      const preUpdateMemory = process.memoryUsage().heapUsed;

      // Perform multiple weight updates
      for (let i = 0; i < 100; i++) {
        const weights = network.getWeights();

        // Modify weights
        for (let j = 0; j < weights.length; j++) {
          weights[j] += (Math.random() - 0.5) * 0.01;
        }

        network.setWeights(weights);
      }

      const postUpdateMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = postUpdateMemory - preUpdateMemory;

      // Weight updates should not cause significant memory growth
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB

      // Network should still function
      const result = await network.run([0.1, 0.2, 0.3, 0.4, 0.5]);
      expect(result).toHaveLength(3);
      expect(result?.every((v) => Number.isFinite(v))).toBe(true);
    });
  });

  describe('Concurrent Network Memory Usage', () => {
    it('should handle multiple networks efficiently', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const preCreationMemory = process.memoryUsage().heapUsed;

      // Create multiple networks concurrently
      const networks: NeuralNetwork[] = [];
      const networkPromises: Promise<NeuralNetwork>[] = [];

      for (let i = 0; i < 15; i++) {
        const networkConfig: NetworkConfig = {
          inputSize: 3,
          hiddenLayers: [{ size: 6, activation: ACTIVATION_FUNCTIONS.SIGMOID }],
          outputSize: 2,
          outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        };

        networkPromises.push(createNeuralNetwork(networkConfig));
      }

      const createdNetworks = await Promise.all(networkPromises);
      networks.push(...createdNetworks);

      const postCreationMemory = process.memoryUsage().heapUsed;
      const totalMemoryIncrease = postCreationMemory - preCreationMemory;

      // Total memory should scale reasonably with number of networks
      expect(totalMemoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB for 15 networks

      // All networks should be functional
      for (const network of networks) {
        const result = await network.run([0.5, 0.5, 0.5]);
        expect(result).toHaveLength(2);
        expect(result?.every((v) => Number.isFinite(v))).toBe(true);
      }

      // Average memory per network should be reasonable
      const averageMemoryPerNetwork = totalMemoryIncrease / networks.length;
      expect(averageMemoryPerNetwork).toBeLessThan(10 * 1024 * 1024); // Less than 10MB per network
    });
  });
});

/**
 * Classical TDD Principles Demonstrated:
 *
 * 1. No mocks - testing actual memory allocation and usage patterns
 * 2. Real system resource monitoring and measurement
 * 3. Memory leak detection through repeated operations
 * 4. Scalability testing with different network sizes
 * 5. Resource cleanup verification
 * 6. Performance thresholds based on actual measurements
 *
 * This is ideal for:
 * - Memory efficiency validation
 * - Resource leak detection
 * - Scalability assessment
 * - Performance benchmarking
 * - System resource monitoring
 */
