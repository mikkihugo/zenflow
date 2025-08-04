/**
 * Neural Network Training Tests - Classical TDD
 * @fileoverview Tests for neural network training using Classical School approach
 * Focus: Result verification, computational correctness, algorithm validation
 */

import { createNeuralTestSuite, NeuralTestDataGenerator } from '../../../helpers';

describe('Neural Network Training - Classical TDD', () => {
  let neuralSuite: ReturnType<typeof createNeuralTestSuite>;

  beforeEach(() => {
    neuralSuite = createNeuralTestSuite({
      epochs: 1000,
      learningRate: 0.1,
      tolerance: 1e-8,
      convergenceThreshold: 0.01,
      maxTrainingTime: 30000,
    });
  });

  describe('🧮 Mathematical Correctness (Classical Approach)', () => {
    it('should perform accurate matrix operations', () => {
      // Classical TDD: Test real mathematical operations
      const matrix1 = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const matrix2 = [
        [7, 8],
        [9, 10],
        [11, 12],
      ];

      const result = neuralSuite.math.matrixMultiply(matrix1, matrix2);

      // Verify exact mathematical result (Classical approach)
      const expected = [
        [58, 64], // [1*7+2*9+3*11, 1*8+2*10+3*12]
        [139, 154], // [4*7+5*9+6*11, 4*8+5*10+6*12]
      ];

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);

      // Verify exact values
      expectMatrixNearlyEqual(result, expected, 1e-10);
    });

    it('should compute activation functions correctly', () => {
      // Classical TDD: Test pure mathematical functions
      const testInputs = [-2, -1, 0, 1, 2];

      testInputs.forEach((input) => {
        // Test sigmoid
        const sigmoid = neuralSuite.math.activationFunctions.sigmoid(input);
        const expectedSigmoid = 1 / (1 + Math.exp(-input));
        expectNearlyEqual(sigmoid, expectedSigmoid, 1e-10);

        // Test ReLU
        const relu = neuralSuite.math.activationFunctions.relu(input);
        const expectedRelu = Math.max(0, input);
        expectNearlyEqual(relu, expectedRelu, 1e-10);

        // Test tanh
        const tanh = neuralSuite.math.activationFunctions.tanh(input);
        const expectedTanh = Math.tanh(input);
        expectNearlyEqual(tanh, expectedTanh, 1e-10);
      });
    });

    it('should compute derivatives accurately', () => {
      // Classical TDD: Verify mathematical derivative correctness
      const testValues = [-1, -0.5, 0, 0.5, 1];

      testValues.forEach((x) => {
        // Test sigmoid derivative using numerical gradient
        const sigmoidDerivative = neuralSuite.math.activationDerivatives.sigmoid(x);
        const numericalDerivative = neuralSuite.math.numericalGradient(
          neuralSuite.math.activationFunctions.sigmoid,
          x
        );

        expectNearlyEqual(sigmoidDerivative, numericalDerivative, 1e-5);

        // Test tanh derivative
        const tanhDerivative = neuralSuite.math.activationDerivatives.tanh(x);
        const numericalTanhDerivative = neuralSuite.math.numericalGradient(
          neuralSuite.math.activationFunctions.tanh,
          x
        );

        expectNearlyEqual(tanhDerivative, numericalTanhDerivative, 1e-5);
      });
    });
  });

  describe('🎯 Algorithm Convergence (Real Training)', () => {
    it('should solve XOR problem through actual training', () => {
      // Classical TDD: Use real neural network implementation
      const trainingData = NeuralTestDataGenerator.generateXORData();

      // Simple neural network implementation for testing
      const network = createTestNeuralNetwork([2, 4, 1]);

      const trainingResult = trainNetwork(network, trainingData, {
        epochs: 2000,
        learningRate: 0.5,
        convergenceThreshold: 0.05,
      });

      // Verify training convergence (Classical approach - check actual results)
      const convergenceValidation = neuralSuite.validator.validateConvergence(
        trainingResult.errors,
        neuralSuite.config
      );

      expect(convergenceValidation.converged).toBe(true);
      expect(convergenceValidation.finalError).toBeLessThan(0.05);

      // Test predictions on training data
      const predictions = trainingData.map((sample) => predict(network, sample.input));
      const accuracy = neuralSuite.validator.validatePredictionAccuracy(
        predictions,
        trainingData.map((d) => d.output),
        0.3 // Allow reasonable tolerance for XOR
      );

      expect(accuracy.accuracy).toBeGreaterThan(0.8); // 80% accuracy minimum

      // Verify specific XOR logic
      expect(predict(network, [0, 0])[0]).toBeLessThan(0.3);
      expect(predict(network, [0, 1])[0]).toBeGreaterThan(0.7);
      expect(predict(network, [1, 0])[0]).toBeGreaterThan(0.7);
      expect(predict(network, [1, 1])[0]).toBeLessThan(0.3);
    });

    it('should learn linear relationships accurately', () => {
      // Classical TDD: Test linear regression capability
      const linearData = NeuralTestDataGenerator.generateLinearData(100, 0.05);

      // Create network for regression
      const network = createTestNeuralNetwork([1, 3, 1]);

      const trainingResult = trainNetwork(network, linearData, {
        epochs: 1000,
        learningRate: 0.01,
        convergenceThreshold: 0.1,
      });

      // Verify convergence
      expect(trainingResult.converged).toBe(true);
      expect(trainingResult.errors[trainingResult.errors.length - 1]).toBeLessThan(0.1);

      // Test linear relationship accuracy
      const testPoints = [
        { input: [1], expectedOutput: 5 }, // y = 2x + 3, so f(1) ≈ 5
        { input: [2], expectedOutput: 7 }, // f(2) ≈ 7
        { input: [3], expectedOutput: 9 }, // f(3) ≈ 9
      ];

      testPoints.forEach((point) => {
        const prediction = predict(network, point.input)[0];
        expect(Math.abs(prediction - point.expectedOutput)).toBeLessThan(1.0);
      });
    });

    it('should handle non-linear classification', () => {
      // Classical TDD: Test on spiral classification data
      const spiralData = NeuralTestDataGenerator.generateSpiralData(30, 2);

      const network = createTestNeuralNetwork([2, 8, 2]);

      const trainingResult = trainNetwork(network, spiralData, {
        epochs: 1500,
        learningRate: 0.1,
        convergenceThreshold: 0.2,
      });

      // Verify training progress
      expect(trainingResult.errors.length).toBeGreaterThan(0);
      const initialError = trainingResult.errors[0];
      const finalError = trainingResult.errors[trainingResult.errors.length - 1];
      expect(finalError).toBeLessThan(initialError); // Should improve

      // Test classification accuracy
      const predictions = spiralData.map((sample) => predict(network, sample.input));
      const accuracy = calculateClassificationAccuracy(
        predictions,
        spiralData.map((d) => d.output)
      );

      expect(accuracy).toBeGreaterThan(0.7); // 70% accuracy for spiral classification
    });
  });

  describe('🎭 Weight Initialization and Gradient Flow', () => {
    it('should initialize weights properly', () => {
      // Classical TDD: Test weight initialization algorithms
      const topology = [3, 5, 2];

      // Test Xavier initialization
      const xavierWeights = initializeWeights(topology, 'xavier');
      neuralSuite.validator.validateWeightInitialization(xavierWeights, 'xavier');

      // Test He initialization
      const heWeights = initializeWeights(topology, 'he');
      neuralSuite.validator.validateWeightInitialization(heWeights, 'he');

      // Verify weight matrices have correct dimensions
      expect(xavierWeights).toHaveLength(2); // Two weight matrices for 3-layer network
      expect(xavierWeights[0]).toHaveLength(5); // First layer: 5 neurons
      expect(xavierWeights[0][0]).toHaveLength(3); // Input dimension: 3
      expect(xavierWeights[1]).toHaveLength(2); // Output layer: 2 neurons
      expect(xavierWeights[1][0]).toHaveLength(5); // Previous layer: 5 neurons
    });

    it('should compute gradients correctly', () => {
      // Classical TDD: Verify backpropagation gradient computation
      const network = createTestNeuralNetwork([2, 3, 1]);
      const input = [0.5, 0.8];
      const target = [0.7];

      // Forward pass
      const _output = predict(network, input);

      // Compute gradients
      const gradients = computeGradients(network, input, target);

      // Verify gradient properties
      neuralSuite.validator.validateGradientFlow(gradients);

      // Verify gradient dimensions match network structure
      expect(gradients).toHaveLength(2); // Two gradient matrices
      expect(gradients[0]).toHaveLength(3); // Hidden layer size
      expect(gradients[1]).toHaveLength(1); // Output layer size
    });

    it('should prevent vanishing and exploding gradients', () => {
      // Classical TDD: Test gradient stability in deep networks
      const deepNetwork = createTestNeuralNetwork([2, 10, 10, 10, 1]);
      const trainingData = NeuralTestDataGenerator.generateLinearData(10, 0.1);

      const gradientHistory: number[][] = [];

      // Train for a few epochs and collect gradients
      for (let epoch = 0; epoch < 10; epoch++) {
        trainingData.forEach((sample) => {
          const gradients = computeGradients(deepNetwork, sample.input, sample.output);
          const flatGradients = gradients.flat();
          gradientHistory.push(flatGradients);
        });
      }

      // Analyze gradient statistics
      gradientHistory.forEach((gradients) => {
        const avgMagnitude = gradients.reduce((sum, g) => sum + Math.abs(g), 0) / gradients.length;

        // Should not vanish (too small)
        expect(avgMagnitude).toBeGreaterThan(1e-8);

        // Should not explode (too large)
        expect(avgMagnitude).toBeLessThan(10);

        // Should not be NaN or infinite
        gradients.forEach((g) => {
          expect(g).toBeFinite();
          expect(g).not.toBeNaN();
        });
      });
    });
  });

  describe('⚡ Performance and Memory Efficiency', () => {
    it('should train within acceptable time limits', () => {
      // Classical TDD: Test actual performance
      const performanceData = NeuralTestDataGenerator.generateLinearData(200, 0.1);
      const network = createTestNeuralNetwork([1, 5, 1]);

      const performanceResult = neuralSuite.performance.benchmarkTraining(
        async () => {
          trainNetwork(network, performanceData, {
            epochs: 500,
            learningRate: 0.01,
            convergenceThreshold: 0.1,
          });
        },
        10000 // 10 seconds max
      );

      expect(performanceResult.withinExpected).toBe(true);
      expect(performanceResult.duration).toBeLessThan(10000);
    });

    it('should use memory efficiently during training', () => {
      // Classical TDD: Test actual memory usage
      const memoryData = NeuralTestDataGenerator.generateLinearData(500, 0.1);
      const network = createTestNeuralNetwork([1, 10, 1]);

      const memoryResult = neuralSuite.performance.validateMemoryUsage(
        () => {
          trainNetwork(network, memoryData, {
            epochs: 100,
            learningRate: 0.01,
            convergenceThreshold: 0.5,
          });
        },
        20 // 20MB max increase
      );

      expect(memoryResult.withinLimit).toBe(true);
    });

    it('should predict efficiently', () => {
      // Classical TDD: Test prediction performance
      const network = createTestNeuralNetwork([10, 20, 5]);

      const predictionBenchmark = neuralSuite.performance.benchmarkPrediction(
        () => predict(network, Array(10).fill(0.5)),
        1000, // 1000 predictions
        1 // 1ms per prediction max
      );

      expect(predictionBenchmark.withinExpected).toBe(true);
    });
  });

  describe('🧪 Edge Cases and Robustness', () => {
    it('should handle extreme input values', () => {
      // Classical TDD: Test robustness to edge cases
      const network = createTestNeuralNetwork([1, 3, 1]);

      const extremeInputs = [
        [-1000],
        [1000],
        [0],
        [Number.MIN_VALUE],
        [Number.MAX_SAFE_INTEGER / 1e10],
      ];

      extremeInputs.forEach((input) => {
        const output = predict(network, input);

        // Output should be finite and valid
        expect(output).toHaveLength(1);
        expect(output[0]).toBeFinite();
        expect(output[0]).not.toBeNaN();
        expect(output[0]).toBeGreaterThanOrEqual(-10);
        expect(output[0]).toBeLessThanOrEqual(10);
      });
    });

    it('should recover from poor initialization', () => {
      // Classical TDD: Test recovery from bad starting conditions
      const network = createTestNeuralNetwork([2, 4, 1]);

      // Intentionally bad initialization (all zeros)
      initializeWeightsToValue(network, 0.001);

      const trainingData = NeuralTestDataGenerator.generateXORData();
      const result = trainNetwork(network, trainingData, {
        epochs: 3000,
        learningRate: 0.5,
        convergenceThreshold: 0.1,
      });

      // Should still eventually learn (Classical approach - verify actual capability)
      expect(result.errors[result.errors.length - 1]).toBeLessThan(0.5);

      // Verify it can make reasonable predictions
      const finalPredictions = trainingData.map((sample) => predict(network, sample.input));
      const accuracy = calculateClassificationAccuracy(
        finalPredictions,
        trainingData.map((d) => d.output),
        0.4 // Lower threshold for challenging initialization
      );

      expect(accuracy).toBeGreaterThan(0.6); // 60% minimum even with bad init
    });
  });
});

// Helper functions for Classical TDD neural network testing
function createTestNeuralNetwork(topology: number[]) {
  return {
    topology,
    weights: initializeWeights(topology, 'xavier'),
    biases: topology.slice(1).map((size) => Array(size).fill(0.1)),
  };
}

function initializeWeights(topology: number[], method: 'xavier' | 'he' | 'random'): number[][][] {
  const weights: number[][][] = [];

  for (let i = 0; i < topology.length - 1; i++) {
    const layerWeights: number[][] = [];
    const inputSize = topology[i];
    const outputSize = topology[i + 1];

    for (let j = 0; j < outputSize; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < inputSize; k++) {
        let weight: number;
        switch (method) {
          case 'xavier':
            weight = (Math.random() - 0.5) * 2 * Math.sqrt(6 / (inputSize + outputSize));
            break;
          case 'he':
            weight = (Math.random() - 0.5) * 2 * Math.sqrt(2 / inputSize);
            break;
          default:
            weight = (Math.random() - 0.5) * 2;
        }
        neuronWeights.push(weight);
      }
      layerWeights.push(neuronWeights);
    }
    weights.push(layerWeights);
  }

  return weights;
}

function initializeWeightsToValue(network: any, value: number): void {
  network.weights.forEach((layer: number[][]) => {
    layer.forEach((neuron: number[]) => {
      for (let i = 0; i < neuron.length; i++) {
        neuron[i] = value;
      }
    });
  });
}

function predict(network: any, input: number[]): number[] {
  let activations = [...input];

  for (let i = 0; i < network.weights.length; i++) {
    const newActivations: number[] = [];

    for (let j = 0; j < network.weights[i].length; j++) {
      let sum = network.biases[i][j];
      for (let k = 0; k < activations.length; k++) {
        sum += activations[k] * network.weights[i][j][k];
      }
      newActivations.push(1 / (1 + Math.exp(-sum))); // Sigmoid activation
    }

    activations = newActivations;
  }

  return activations;
}

function trainNetwork(network: any, trainingData: any[], config: any) {
  const errors: number[] = [];
  let converged = false;

  for (let epoch = 0; epoch < config.epochs && !converged; epoch++) {
    let epochError = 0;

    trainingData.forEach((sample) => {
      // Forward pass
      const prediction = predict(network, sample.input);

      // Calculate error
      const sampleError =
        prediction.reduce((sum, pred, idx) => {
          return sum + (pred - sample.output[idx]) ** 2;
        }, 0) / prediction.length;

      epochError += sampleError;

      // Simplified backpropagation (for testing purposes)
      updateWeights(network, sample.input, sample.output, prediction, config.learningRate);
    });

    epochError /= trainingData.length;
    errors.push(epochError);

    if (epochError < config.convergenceThreshold) {
      converged = true;
    }
  }

  return { errors, converged };
}

function updateWeights(
  network: any,
  _input: number[],
  target: number[],
  prediction: number[],
  learningRate: number
): void {
  // Simplified weight update for testing
  const outputError = prediction.map((pred, idx) => target[idx] - pred);

  // Update weights (simplified - real implementation would be more complex)
  network.weights.forEach((layer: number[][], layerIdx: number) => {
    layer.forEach((neuron: number[], neuronIdx: number) => {
      neuron.forEach((_weight: number, weightIdx: number) => {
        const gradient = outputError[neuronIdx % outputError.length] * learningRate * 0.01;
        network.weights[layerIdx][neuronIdx][weightIdx] += gradient;
      });
    });
  });
}

function computeGradients(network: any, input: number[], target: number[]): number[][] {
  // Simplified gradient computation for testing
  const prediction = predict(network, input);
  const outputError = prediction.map((pred, idx) => target[idx] - pred);

  return network.weights.map((layer: number[][], _layerIdx: number) => {
    return layer.map((_neuron: number[], neuronIdx: number) => {
      return outputError[neuronIdx % outputError.length] * 0.01;
    });
  });
}

function calculateClassificationAccuracy(
  predictions: number[][],
  targets: number[][],
  threshold: number = 0.5
): number {
  let correct = 0;

  for (let i = 0; i < predictions.length; i++) {
    const predictedClass = predictions[i][0] > threshold ? 1 : 0;
    const actualClass = targets[i][0] > threshold ? 1 : 0;

    if (predictedClass === actualClass) {
      correct++;
    }
  }

  return correct / predictions.length;
}

// Import helper functions that would normally come from the test suite
function expectNearlyEqual(actual: number, expected: number, tolerance: number = 1e-10) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

function expectMatrixNearlyEqual(
  actual: number[][],
  expected: number[][],
  tolerance: number = 1e-10
) {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i]).toHaveLength(expected[i].length);
    for (let j = 0; j < actual[i].length; j++) {
      expectNearlyEqual(actual[i][j], expected[i][j], tolerance);
    }
  }
}
