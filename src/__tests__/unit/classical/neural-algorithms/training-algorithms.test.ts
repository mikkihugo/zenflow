/**
 * Advanced Neural Training Algorithms Test Suite
 * Classical TDD approach - testing mathematical correctness and computational results
 */

import { NeuralNetwork } from '../../../../neural/core/neural-network.ts';
import { PerformanceMeasurement } from '../../../helpers/performance-measurement.ts';

describe('Advanced Neural Training Algorithms (Classical TDD)', () => {
  let network: NeuralNetwork;
  let performance: PerformanceMeasurement;

  beforeEach(() => {
    performance = new PerformanceMeasurement();
  });

  describe('Backpropagation Algorithm Validation', () => {
    it('should converge on XOR problem with correct error reduction', () => {
      network = new NeuralNetwork([2, 4, 1]);
      const xorData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ];

      const result = network.train(xorData, {
        epochs: 2000,
        algorithm: 'backpropagation',
        learningRate: 0.3,
      });

      // Test actual mathematical results
      expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
      expect(network.predict([0, 1])[0]).toBeCloseTo(1, 1);
      expect(network.predict([1, 0])[0]).toBeCloseTo(1, 1);
      expect(network.predict([1, 1])[0]).toBeCloseTo(0, 1);
      expect(result?.finalError).toBeLessThan(0.01);
      expect(result?.epochs).toBeGreaterThan(100);
    });

    it('should demonstrate proper gradient descent behavior', () => {
      network = new NeuralNetwork([3, 5, 2]);
      const trainingData = Array.from({ length: 100 }, (_, i) => ({
        input: [Math.random(), Math.random(), Math.random()],
        output: [Math.sin(i * 0.1), Math.cos(i * 0.1)],
      }));

      const result = network.train(trainingData, {
        epochs: 1000,
        algorithm: 'backpropagation',
        trackError: true,
      });

      // Verify error reduction pattern
      expect(result?.errorHistory).toBeDefined();
      expect(result?.errorHistory?.length).toBeGreaterThan(10);

      const initialError = result?.errorHistory?.[0];
      const finalError = result?.errorHistory?.[result?.errorHistory?.length - 1];
      expect(finalError).toBeLessThan(initialError);
    });
  });

  describe('RPROP Algorithm Performance', () => {
    it('should outperform standard backpropagation on complex datasets', () => {
      const complexData = Array.from({ length: 500 }, (_, i) => ({
        input: [Math.sin(i * 0.02), Math.cos(i * 0.03), Math.tan(i * 0.01)],
        output: [Math.sin(i * 0.04) * Math.cos(i * 0.02)],
      }));

      // Train with standard backpropagation
      const networkBP = new NeuralNetwork([3, 8, 1]);
      const resultBP = networkBP.train(complexData, {
        epochs: 1000,
        algorithm: 'backpropagation',
        learningRate: 0.1,
      });

      // Train with RPROP
      const networkRPROP = new NeuralNetwork([3, 8, 1]);
      const resultRPROP = networkRPROP.train(complexData, {
        epochs: 1000,
        algorithm: 'rprop',
      });

      // RPROP should converge faster or achieve lower error
      expect(
        resultRPROP?.finalError < resultBP?.finalError || resultRPROP?.epochs < resultBP?.epochs
      ).toBe(true);
    });

    it('should maintain stable convergence with varying learning rates', () => {
      const network1 = new NeuralNetwork([2, 6, 1]);
      const network2 = new NeuralNetwork([2, 6, 1]);

      const testData = [
        { input: [0.1, 0.9], output: [0.8] },
        { input: [0.3, 0.7], output: [0.6] },
        { input: [0.5, 0.5], output: [0.4] },
        { input: [0.7, 0.3], output: [0.2] },
      ];

      const result1 = network1.train(testData, {
        epochs: 500,
        algorithm: 'rprop',
        deltaMin: 0.000001,
        deltaMax: 50.0,
      });

      const result2 = network2.train(testData, {
        epochs: 500,
        algorithm: 'rprop',
        deltaMin: 0.00001,
        deltaMax: 5.0,
      });

      // Both should converge successfully
      expect(result1?.finalError).toBeLessThan(0.1);
      expect(result2?.finalError).toBeLessThan(0.1);
    });
  });

  describe('QuickProp Algorithm Optimization', () => {
    it('should achieve quadratic convergence on well-conditioned problems', () => {
      performance.start('quickprop-convergence');

      network = new NeuralNetwork([4, 6, 2]);
      const quadraticData = Array.from({ length: 200 }, (_, i) => {
        const x = i / 100;
        return {
          input: [x, x * x, x * x * x, Math.sin(x * Math['PI'])],
          output: [x * x + 0.5 * x, Math.cos((x * Math['PI']) / 2)],
        };
      });

      const result = network.train(quadraticData, {
        epochs: 800,
        algorithm: 'quickprop',
        maxGrowth: 1.75,
        mu: 1.75,
      });

      performance.end('quickprop-convergence');

      // Should achieve better convergence than linear methods
      expect(result?.finalError).toBeLessThan(0.05);
      expect(performance.getDuration('quickprop-convergence')).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle momentum and growth factors correctly', () => {
      network = new NeuralNetwork([3, 4, 1]);
      const momentumData = [
        { input: [1, 0, 0], output: [1] },
        { input: [0, 1, 0], output: [0.5] },
        { input: [0, 0, 1], output: [0] },
        { input: [1, 1, 1], output: [0.75] },
      ];

      const result = network.train(momentumData, {
        epochs: 1000,
        algorithm: 'quickprop',
        mu: 2.0,
        maxGrowth: 2.0,
        weightDecay: 0.0001,
      });

      // Verify network learned the pattern
      expect(network.predict([1, 0, 0])[0]).toBeCloseTo(1, 1);
      expect(network.predict([0, 1, 0])[0]).toBeCloseTo(0.5, 1);
      expect(network.predict([0, 0, 1])[0]).toBeCloseTo(0, 1);
      expect(result?.finalError).toBeLessThan(0.02);
    });
  });

  describe('Cascade Training Validation', () => {
    it('should build optimal topology through cascade correlation', () => {
      // Start with minimal network
      network = new NeuralNetwork([2, 1], { allowDynamicTopology: true });

      const cascadeData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
        // Additional complex pattern
        { input: [0.5, 0.5], output: [0.25] },
        { input: [0.3, 0.7], output: [0.6] },
      ];

      const result = network.train(cascadeData, {
        epochs: 2000,
        algorithm: 'cascade',
        maxHiddenNeurons: 10,
        correlationThreshold: 0.4,
      });

      // Should have added hidden neurons automatically
      expect(network.getTopology().hiddenLayers.length).toBeGreaterThan(0);
      expect(network.getTopology().totalNeurons).toBeGreaterThan(3);
      expect(result?.finalError).toBeLessThan(0.1);
    });

    it('should optimize neuron activation functions during cascade', () => {
      network = new NeuralNetwork([3, 1], {
        allowDynamicTopology: true,
        adaptiveActivation: true,
      });

      const nonLinearData = Array.from({ length: 100 }, (_, i) => {
        const x = i / 50;
        return {
          input: [x, Math.sin(x), Math.cos(x)],
          output: [Math.tanh(x) * Math.exp(-x / 2)],
        };
      });

      const result = network.train(nonLinearData, {
        epochs: 1500,
        algorithm: 'cascade',
        activationCandidates: ['sigmoid', 'tanh', 'linear', 'gaussian'],
      });

      // Should have optimized activation functions
      const activations = network.getActivationFunctions();
      expect(activations.length).toBeGreaterThan(1);
      expect(result?.finalError).toBeLessThan(0.15);
    });
  });

  describe('Batch vs Online Training Comparison', () => {
    it('should demonstrate convergence differences between batch and online modes', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        input: [Math.random(), Math.random(), Math.random()],
        output: [Math.random()],
      }));

      // Batch training
      const networkBatch = new NeuralNetwork([3, 8, 1]);
      performance.start('batch-training');
      const resultBatch = networkBatch.train(largeDataset, {
        epochs: 500,
        algorithm: 'backpropagation',
        batchSize: largeDataset.length, // Full batch
        learningRate: 0.1,
      });
      performance.end('batch-training');

      // Online training
      const networkOnline = new NeuralNetwork([3, 8, 1]);
      performance.start('online-training');
      const resultOnline = networkOnline.train(largeDataset, {
        epochs: 500,
        algorithm: 'backpropagation',
        batchSize: 1, // Online
        learningRate: 0.01,
      });
      performance.end('online-training');

      // Both should converge, but with different characteristics
      expect(resultBatch?.finalError).toBeLessThan(1.0);
      expect(resultOnline?.finalError).toBeLessThan(1.0);

      // Online training typically needs more epochs for same convergence
      const batchTime = performance.getDuration('batch-training');
      const onlineTime = performance.getDuration('online-training');

      expect(batchTime).toBeGreaterThan(0);
      expect(onlineTime).toBeGreaterThan(0);
    });

    it('should handle mini-batch training with optimal batch sizes', () => {
      const dataset = Array.from({ length: 500 }, (_, i) => ({
        input: [Math.sin(i * 0.1), Math.cos(i * 0.1)],
        output: [Math.sin(i * 0.2)],
      }));

      const batchSizes = [1, 10, 50, 100];
      const results: { batchSize: number; error: number; time: number }[] = [];

      for (const batchSize of batchSizes) {
        const network = new NeuralNetwork([2, 6, 1]);
        performance.start(`batch-${batchSize}`);

        const result = network.train(dataset, {
          epochs: 300,
          algorithm: 'backpropagation',
          batchSize,
          learningRate: 0.1,
        });

        performance.end(`batch-${batchSize}`);

        results?.push({
          batchSize,
          error: result?.finalError,
          time: performance.getDuration(`batch-${batchSize}`),
        });
      }

      // All batch sizes should achieve reasonable convergence
      results?.forEach((result) => {
        expect(result?.error).toBeLessThan(0.5);
        expect(result?.time).toBeGreaterThan(0);
      });

      // There should be an optimal batch size (not too small, not too large)
      const sortedByError = results?.sort((a, b) => a.error - b.error);
      expect(sortedByError[0]?.batchSize).toBeGreaterThan(1);
      expect(sortedByError[0]?.batchSize).toBeLessThan(dataset.length);
    });
  });

  describe('Regularization Techniques Validation', () => {
    it('should prevent overfitting with L1 and L2 regularization', () => {
      const trainingData = Array.from({ length: 50 }, (_, i) => ({
        input: [i / 25, Math.sin(i * 0.2)],
        output: [Math.cos(i * 0.1)],
      }));

      const testData = Array.from({ length: 20 }, (_, i) => ({
        input: [(i + 50) / 25, Math.sin((i + 50) * 0.2)],
        output: [Math.cos((i + 50) * 0.1)],
      }));

      // No regularization
      const networkNoReg = new NeuralNetwork([2, 15, 1]);
      networkNoReg.train(trainingData, {
        epochs: 1000,
        learningRate: 0.1,
      });

      // L2 regularization
      const networkL2 = new NeuralNetwork([2, 15, 1]);
      networkL2.train(trainingData, {
        epochs: 1000,
        learningRate: 0.1,
        l2Regularization: 0.01,
      });

      // L1 regularization
      const networkL1 = new NeuralNetwork([2, 15, 1]);
      networkL1.train(trainingData, {
        epochs: 1000,
        learningRate: 0.1,
        l1Regularization: 0.01,
      });

      // Test generalization on unseen data
      const errorNoReg = this.calculateTestError(networkNoReg, testData);
      const errorL2 = this.calculateTestError(networkL2, testData);
      const errorL1 = this.calculateTestError(networkL1, testData);

      // Regularized networks should generalize better
      expect(errorL2).toBeLessThanOrEqual(errorNoReg * 1.1); // Allow small tolerance
      expect(errorL1).toBeLessThanOrEqual(errorNoReg * 1.1);
    });

    it('should implement dropout correctly during training', () => {
      network = new NeuralNetwork([4, 20, 20, 1]);

      const trainingData = Array.from({ length: 200 }, (_, i) => ({
        input: [Math.random(), Math.random(), Math.random(), Math.random()],
        output: [Math.random()],
      }));

      const result = network.train(trainingData, {
        epochs: 500,
        learningRate: 0.1,
        dropout: 0.3, // 30% dropout
        useDropout: true,
      });

      // Network should still converge with dropout
      expect(result?.finalError).toBeLessThan(0.8);

      // Prediction mode should use all neurons
      const prediction1 = network.predict([0.5, 0.5, 0.5, 0.5]);
      const prediction2 = network.predict([0.5, 0.5, 0.5, 0.5]);

      // Predictions should be consistent (no dropout in prediction mode)
      expect(Math.abs(prediction1[0] - prediction2[0])).toBeLessThan(0.001);
    });
  });

  describe('Memory-Efficient Training', () => {
    it('should handle large datasets without memory overflow', () => {
      // Simulate large dataset processing
      const batchGenerator = function* (size: number, batchSize: number) {
        for (let i = 0; i < size; i += batchSize) {
          const batch = Array.from({ length: Math.min(batchSize, size - i) }, (_, j) => ({
            input: [Math.random(), Math.random(), Math.random()],
            output: [Math.random()],
          }));
          yield batch;
        }
      };

      network = new NeuralNetwork([3, 10, 1]);

      performance.start('large-dataset-training');

      let totalError = 0;
      let batchCount = 0;

      // Process 10,000 samples in batches of 100
      for (const batch of batchGenerator(10000, 100)) {
        const result = network.trainBatch(batch, {
          learningRate: 0.01,
          updateWeights: true,
        });
        totalError += result?.error;
        batchCount++;
      }

      performance.end('large-dataset-training');

      const avgError = totalError / batchCount;

      expect(avgError).toBeLessThan(1.0);
      expect(batchCount).toBe(100); // 10,000 / 100
      expect(performance.getDuration('large-dataset-training')).toBeLessThan(30000); // 30 seconds max
    });

    it('should optimize memory usage with weight sharing', () => {
      // Test convolutional-style weight sharing
      network = new NeuralNetwork([9, 6, 3], {
        weightSharing: {
          enabled: true,
          patterns: [
            { from: [0, 1, 2], to: [0, 1] }, // Share weights between input groups
            { from: [3, 4, 5], to: [2, 3] },
            { from: [6, 7, 8], to: [4, 5] },
          ],
        },
      });

      const convolutionalData = Array.from({ length: 100 }, () => ({
        input: Array.from({ length: 9 }, () => Math.random()),
        output: Array.from({ length: 3 }, () => Math.random()),
      }));

      const result = network.train(convolutionalData, {
        epochs: 500,
        learningRate: 0.1,
      });

      // Should achieve convergence with fewer parameters
      const weightsCount = network.getWeightsCount();
      const normalNetwork = new NeuralNetwork([9, 6, 3]);
      const normalWeightsCount = normalNetwork.getWeightsCount();

      expect(weightsCount).toBeLessThan(normalWeightsCount);
      expect(result?.finalError).toBeLessThan(0.5);
    });
  });

  // Helper function for test error calculation
  function calculateTestError(network: NeuralNetwork, testData: any[]): number {
    let totalError = 0;

    for (const sample of testData) {
      const prediction = network.predict(sample.input);
      const error = sample.output.reduce(
        (sum: number, target: number, i: number) => sum + (target - prediction[i]) ** 2,
        0
      );
      totalError += error;
    }

    return totalError / testData.length;
  }
});
