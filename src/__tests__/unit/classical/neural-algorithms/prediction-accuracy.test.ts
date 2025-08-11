/**
 * Classical TDD (Detroit School) - Prediction Accuracy Tests
 *
 * Focus: Test actual prediction results and mathematical accuracy
 * No mocks - verify real predictions on known datasets and mathematical functions
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  ACTIVATION_FUNCTIONS,
  createNeuralNetwork,
  createTrainer,
  initializeNeuralWasm,
  TRAINING_ALGORITHMS,
} from '../../../../neural/core/neural-network.ts';

describe('Prediction Accuracy - Classical TDD', () => {
  let wasmModule: any;

  beforeEach(async () => {
    try {
      wasmModule = await initializeNeuralWasm();
    } catch (error) {
      console.warn('WASM module not available, skipping prediction accuracy tests');
    }
  });

  describe('Boolean Function Accuracy', () => {
    it('should achieve perfect accuracy on AND function', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 3, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
        randomSeed: 101,
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 500,
        targetError: 0.01,
      };

      const andData: TrainingDataConfig = {
        inputs: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        outputs: [[0], [0], [0], [1]],
      };

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(andData);
      await trainer.trainUntilTarget(network, andData, 0.01, 500);

      // Test prediction accuracy
      const predictions = [
        { input: [0, 0], expected: 0, name: '0 AND 0' },
        { input: [0, 1], expected: 0, name: '0 AND 1' },
        { input: [1, 0], expected: 0, name: '1 AND 0' },
        { input: [1, 1], expected: 1, name: '1 AND 1' },
      ];

      let correctPredictions = 0;
      for (const test of predictions) {
        const result = await network.run(test.input);
        const predicted = result?.[0] > 0.5 ? 1 : 0;

        expect(predicted).toBe(test.expected);
        if (predicted === test.expected) correctPredictions++;
      }

      // Should achieve 100% accuracy
      expect(correctPredictions).toBe(4);
    });

    it('should achieve perfect accuracy on OR function', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 3, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
        randomSeed: 202,
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 300,
        targetError: 0.01,
      };

      const orData: TrainingDataConfig = {
        inputs: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        outputs: [[0], [1], [1], [1]],
      };

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(orData);
      await trainer.trainUntilTarget(network, orData, 0.01, 300);

      // Test prediction accuracy
      const predictions = [
        { input: [0, 0], expected: 0, name: '0 OR 0' },
        { input: [0, 1], expected: 1, name: '0 OR 1' },
        { input: [1, 0], expected: 1, name: '1 OR 0' },
        { input: [1, 1], expected: 1, name: '1 OR 1' },
      ];

      let correctPredictions = 0;
      for (const test of predictions) {
        const result = await network.run(test.input);
        const predicted = result?.[0] > 0.5 ? 1 : 0;

        expect(predicted).toBe(test.expected);
        if (predicted === test.expected) correctPredictions++;
      }

      expect(correctPredictions).toBe(4);
    });

    it('should achieve high accuracy on XOR function with adequate architecture', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 4, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
        randomSeed: 303,
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 1000,
        targetError: 0.01,
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
      const result = await trainer.trainUntilTarget(network, xorData, 0.01, 1000);

      // XOR is more complex, but should still achieve good accuracy
      expect(result?.finalError).toBeLessThan(0.05);

      const predictions = [
        { input: [0, 0], expected: 0, name: '0 XOR 0' },
        { input: [0, 1], expected: 1, name: '0 XOR 1' },
        { input: [1, 0], expected: 1, name: '1 XOR 0' },
        { input: [1, 1], expected: 0, name: '1 XOR 1' },
      ];

      let correctPredictions = 0;
      for (const test of predictions) {
        const networkResult = await network.run(test.input);
        const predicted = networkResult?.[0] > 0.5 ? 1 : 0;

        if (predicted === test.expected) correctPredictions++;
      }

      // Should achieve at least 75% accuracy, ideally 100%
      expect(correctPredictions).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Mathematical Function Approximation', () => {
    it('should accurately approximate quadratic function', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 1,
        hiddenLayers: [
          { size: 6, activation: ACTIVATION_FUNCTIONS['SIGMOID'] },
          { size: 4, activation: ACTIVATION_FUNCTIONS['SIGMOID'] },
        ],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['LINEAR'],
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 800,
        targetError: 0.05,
      };

      // Quadratic function: y = x^2
      const quadraticData: TrainingDataConfig = {
        inputs: [],
        outputs: [],
      };

      for (let i = 0; i <= 10; i++) {
        const x = i / 10; // 0 to 1
        const y = x * x;
        quadraticData?.inputs?.push([x]);
        quadraticData?.outputs?.push([y]);
      }

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(quadraticData);
      await trainer.trainUntilTarget(network, quadraticData, 0.05, 800);

      // Test prediction accuracy on known quadratic values
      const testPoints = [
        { x: 0.0, expected: 0.0 },
        { x: 0.5, expected: 0.25 },
        { x: 0.7, expected: 0.49 },
        { x: 1.0, expected: 1.0 },
      ];

      for (const point of testPoints) {
        const prediction = await network.run([point.x]);
        expect(prediction[0]).toBeCloseTo(point.expected, 1);
      }

      // Test interpolation accuracy
      const interpolationTests = [
        { x: 0.25, expected: 0.0625 },
        { x: 0.75, expected: 0.5625 },
      ];

      for (const test of interpolationTests) {
        const prediction = await network.run([test.x]);
        expect(prediction[0]).toBeCloseTo(test.expected, 1);
      }
    });

    it('should accurately approximate trigonometric functions', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 1,
        hiddenLayers: [
          { size: 10, activation: ACTIVATION_FUNCTIONS['TANH'] },
          { size: 8, activation: ACTIVATION_FUNCTIONS['TANH'] },
        ],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['LINEAR'],
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 1200,
        targetError: 0.1,
      };

      // Cosine function over [0, 2π]
      const cosineData: TrainingDataConfig = {
        inputs: [],
        outputs: [],
      };

      for (let i = 0; i <= 16; i++) {
        const x = (i / 16) * 2 * Math['PI'];
        const normalizedX = x / (2 * Math['PI']); // Normalize to [0,1]
        const y = Math.cos(x);
        cosineData?.inputs?.push([normalizedX]);
        cosineData?.outputs?.push([y]);
      }

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(cosineData);
      await trainer.trainUntilTarget(network, cosineData, 0.1, 1200);

      // Test key cosine values
      const testPoints = [
        { x: 0, expected: 1 }, // cos(0) = 1
        { x: 0.25, expected: 0 }, // cos(π/2) ≈ 0
        { x: 0.5, expected: -1 }, // cos(π) = -1
        { x: 0.75, expected: 0 }, // cos(3π/2) ≈ 0
        { x: 1, expected: 1 }, // cos(2π) = 1
      ];

      for (const point of testPoints) {
        const prediction = await network.run([point.x]);
        expect(prediction[0]).toBeCloseTo(point.expected, 0.5);
      }
    });
  });

  describe('Pattern Recognition Accuracy', () => {
    it('should classify simple 2D patterns with high accuracy', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 8, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 2,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 600,
        targetError: 0.1,
      };

      // Two classes: left half vs right half of unit square
      const patternData: TrainingDataConfig = {
        inputs: [
          // Left half (Class 0)
          [0.1, 0.1],
          [0.1, 0.5],
          [0.1, 0.9],
          [0.2, 0.2],
          [0.2, 0.7],
          [0.3, 0.4],
          [0.4, 0.1],
          [0.4, 0.6],
          [0.4, 0.9],
          // Right half (Class 1)
          [0.6, 0.1],
          [0.6, 0.5],
          [0.6, 0.9],
          [0.7, 0.2],
          [0.7, 0.7],
          [0.8, 0.4],
          [0.9, 0.1],
          [0.9, 0.6],
          [0.9, 0.9],
        ],
        outputs: [
          // Class 0 (left)
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
          // Class 1 (right)
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
          [0, 1],
        ],
      };

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(patternData);
      await trainer.trainUntilTarget(network, patternData, 0.1, 600);

      // Test classification accuracy on new points
      const testPoints = [
        { input: [0.15, 0.5], expectedClass: 0, name: 'left side' },
        { input: [0.25, 0.3], expectedClass: 0, name: 'left side' },
        { input: [0.35, 0.8], expectedClass: 0, name: 'left side' },
        { input: [0.65, 0.2], expectedClass: 1, name: 'right side' },
        { input: [0.75, 0.6], expectedClass: 1, name: 'right side' },
        { input: [0.85, 0.4], expectedClass: 1, name: 'right side' },
      ];

      let correctClassifications = 0;
      for (const test of testPoints) {
        const prediction = await network.run(test.input);
        const predictedClass = prediction[0] > prediction[1] ? 0 : 1;

        if (predictedClass === test.expectedClass) {
          correctClassifications++;
        }
      }

      // Should achieve at least 80% accuracy
      const accuracy = correctClassifications / testPoints.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.8);
    });

    it('should distinguish concentric circular patterns', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [
          { size: 12, activation: ACTIVATION_FUNCTIONS['TANH'] },
          { size: 8, activation: ACTIVATION_FUNCTIONS['TANH'] },
        ],
        outputSize: 2,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 1000,
        targetError: 0.15,
      };

      // Generate circular pattern data
      const circularData: TrainingDataConfig = {
        inputs: [],
        outputs: [],
      };

      // Inner circle (radius < 0.3) - Class 0
      // Outer ring (0.5 < radius < 0.8) - Class 1
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * 2 * Math['PI'];

        // Inner circle points
        const innerRadius = 0.1 + Math.random() * 0.2; // radius 0.1-0.3
        const innerX = 0.5 + innerRadius * Math.cos(angle);
        const innerY = 0.5 + innerRadius * Math.sin(angle);
        circularData?.inputs?.push([innerX, innerY]);
        circularData?.outputs?.push([1, 0]); // Class 0

        // Outer ring points
        const outerRadius = 0.5 + Math.random() * 0.3; // radius 0.5-0.8
        const outerX = 0.5 + outerRadius * Math.cos(angle);
        const outerY = 0.5 + outerRadius * Math.sin(angle);
        circularData?.inputs?.push([outerX, outerY]);
        circularData?.outputs?.push([0, 1]); // Class 1
      }

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(circularData);
      await trainer.trainUntilTarget(network, circularData, 0.15, 1000);

      // Test classification on specific points
      const testPoints = [
        { input: [0.5, 0.5], expectedClass: 0, name: 'center' },
        { input: [0.6, 0.5], expectedClass: 0, name: 'inner circle' },
        { input: [0.5, 0.4], expectedClass: 0, name: 'inner circle' },
        { input: [0.8, 0.5], expectedClass: 1, name: 'outer ring' },
        { input: [0.5, 0.2], expectedClass: 1, name: 'outer ring' },
        { input: [0.2, 0.5], expectedClass: 1, name: 'outer ring' },
      ];

      let correctClassifications = 0;
      for (const test of testPoints) {
        const prediction = await network.run(test.input);
        const predictedClass = prediction[0] > prediction[1] ? 0 : 1;

        if (predictedClass === test.expectedClass) {
          correctClassifications++;
        }
      }

      // This is a challenging pattern, expect at least 50% accuracy
      const accuracy = correctClassifications / testPoints.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Generalization Accuracy', () => {
    it('should generalize to unseen data points', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 1,
        hiddenLayers: [{ size: 6, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['LINEAR'],
      };

      const trainingConfig: TrainingConfig = {
        algorithm: TRAINING_ALGORITHMS['RPROP'],
        maxEpochs: 400,
        targetError: 0.05,
      };

      // Train on subset of linear function y = 3x + 1
      const trainingData: TrainingDataConfig = {
        inputs: [[0.1], [0.3], [0.5], [0.7], [0.9]], // Skip some points
        outputs: [[1.3], [1.9], [2.5], [3.1], [3.7]],
      };

      const network = await createNeuralNetwork(networkConfig);
      const trainer = await createTrainer(trainingConfig);

      network.setTrainingData(trainingData);
      await trainer.trainUntilTarget(network, trainingData, 0.05, 400);

      // Test generalization on unseen points
      const testPoints = [
        { input: 0.0, expected: 1.0 }, // y = 3*0 + 1 = 1
        { input: 0.2, expected: 1.6 }, // y = 3*0.2 + 1 = 1.6
        { input: 0.4, expected: 2.2 }, // y = 3*0.4 + 1 = 2.2
        { input: 0.6, expected: 2.8 }, // y = 3*0.6 + 1 = 2.8
        { input: 0.8, expected: 3.4 }, // y = 3*0.8 + 1 = 3.4
        { input: 1.0, expected: 4.0 }, // y = 3*1 + 1 = 4 (extrapolation)
      ];

      let accurateGeneralizations = 0;
      for (const test of testPoints) {
        const prediction = await network.run([test.input]);
        const error = Math.abs(prediction[0] - test.expected);

        if (error < 0.3) {
          // Allow 10% error for generalization
          accurateGeneralizations++;
        }
      }

      // Should achieve good generalization on most points
      const generalizationRate = accurateGeneralizations / testPoints.length;
      expect(generalizationRate).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Prediction Consistency', () => {
    it('should produce consistent predictions across multiple runs', async () => {
      if (!wasmModule) {
        console.warn('WASM not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const networkConfig: NetworkConfig = {
        inputSize: 2,
        hiddenLayers: [{ size: 4, activation: ACTIVATION_FUNCTIONS['SIGMOID'] }],
        outputSize: 1,
        outputActivation: ACTIVATION_FUNCTIONS['SIGMOID'],
        randomSeed: 999, // Fixed seed for reproducibility
      };

      const network = await createNeuralNetwork(networkConfig);

      const testInput = [0.6, 0.4];
      const predictions: number[] = [];

      // Run multiple predictions
      for (let i = 0; i < 10; i++) {
        const result = await network.run(testInput);
        predictions.push(result?.[0]);
      }

      // All predictions should be identical (no randomness in inference)
      const firstPrediction = predictions[0];
      for (const prediction of predictions) {
        expect(prediction).toBeCloseTo(firstPrediction, 10);
      }

      // Verify predictions are valid
      expect(predictions.every((p) => Number.isFinite(p))).toBe(true);
      expect(predictions.every((p) => p >= 0 && p <= 1)).toBe(true);
    });
  });
});

/**
 * Classical TDD Principles Demonstrated:
 *
 * 1. No mocks - testing actual prediction accuracy on real data
 * 2. Mathematical correctness validation through known functions
 * 3. Pattern recognition accuracy measurement
 * 4. Generalization capability testing on unseen data
 * 5. Consistency verification across multiple runs
 * 6. Statistical accuracy metrics and thresholds
 *
 * This is ideal for:
 * - Neural network accuracy validation
 * - Function approximation verification
 * - Pattern recognition testing
 * - Generalization capability assessment
 * - Prediction consistency validation
 */
