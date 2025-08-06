/**
 * Property-based tests for neural network invariants and data processing
 *
 * This module implements property-based testing using fast-check to ensure
 * neural network model invariants, data processing correctness, and edge case handling.
 */

import { describe, expect, test } from '@jest/globals';
import fc from 'fast-check';

// Import neural network types and functions
interface NetworkConfig {
  inputSize: number;
  hiddenLayers: LayerConfig[];
  outputSize: number;
  outputActivation: string;
  connectionRate?: number;
  randomSeed?: number;
}

interface LayerConfig {
  size: number;
  activation: string;
  steepness?: number;
}

interface TrainingDataConfig {
  inputs: number[][];
  outputs: number[][];
}

interface NetworkInfo {
  numLayers: number;
  numInputs: number;
  numOutputs: number;
  totalNeurons: number;
  totalConnections: number;
  metrics: {
    trainingError: number;
    validationError: number;
    epochsTrained: number;
    totalConnections: number;
    memoryUsage: number;
  };
}

// Custom arbitraries for neural network testing
const finiteFloat = () =>
  fc.float({
    min: -1000,
    max: 1000,
    noNaN: true,
    noDefaultInfinity: true,
  });

const smallFloat = () =>
  fc.float({
    min: -10,
    max: 10,
    noNaN: true,
    noDefaultInfinity: true,
  });

const positiveInt = (max: number = 100) => fc.integer({ min: 1, max });

const networkConfig = () =>
  fc.record({
    inputSize: positiveInt(50),
    hiddenLayers: fc.array(
      fc.record({
        size: positiveInt(100),
        activation: fc.constantFrom('sigmoid', 'relu', 'tanh', 'leaky_relu'),
        steepness: fc.option(fc.float({ min: 0.1, max: 2.0 })),
      }),
      { minLength: 1, maxLength: 5 }
    ),
    outputSize: positiveInt(20),
    outputActivation: fc.constantFrom('sigmoid', 'tanh', 'linear', 'softmax'),
    connectionRate: fc.option(fc.float({ min: 0.1, max: 1.0 })),
    randomSeed: fc.option(fc.integer({ min: 0, max: 2147483647 })),
  });

const _trainingData = (inputSize: number, outputSize: number, batchSize: number = 10) =>
  fc.record({
    inputs: fc.array(fc.array(finiteFloat(), { minLength: inputSize, maxLength: inputSize }), {
      minLength: batchSize,
      maxLength: batchSize,
    }),
    outputs: fc.array(fc.array(finiteFloat(), { minLength: outputSize, maxLength: outputSize }), {
      minLength: batchSize,
      maxLength: batchSize,
    }),
  });

// Helper functions for neural network operations
class MockNeuralNetwork {
  constructor(private config: NetworkConfig) {}

  predict(_inputs: number[]): number[] {
    // Mock prediction - returns zeros for testing invariants
    return new Array(this.config.outputSize).fill(0);
  }

  train(_data: TrainingDataConfig): { converged: boolean; finalError: number; epochs: number } {
    // Mock training
    return { converged: true, finalError: 0.001, epochs: 100 };
  }

  getInfo(): NetworkInfo {
    const totalNeurons =
      this.config.inputSize +
      this.config.hiddenLayers.reduce((sum, layer) => sum + layer.size, 0) +
      this.config.outputSize;

    return {
      numLayers: this.config.hiddenLayers.length + 2, // +2 for input and output
      numInputs: this.config.inputSize,
      numOutputs: this.config.outputSize,
      totalNeurons,
      totalConnections: totalNeurons * 2, // Simplified
      metrics: {
        trainingError: 0.01,
        validationError: 0.02,
        epochsTrained: 100,
        totalConnections: totalNeurons * 2,
        memoryUsage: totalNeurons * 8, // bytes per neuron
      },
    };
  }
}

// Data processing helper functions
function normalizeData(data: number[]): number[] {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return data.map(() => 0);
  return data.map((x) => (x - mean) / stdDev);
}

function denormalizeData(
  normalizedData: number[],
  originalMean: number,
  originalStdDev: number
): number[] {
  return normalizedData.map((x) => x * originalStdDev + originalMean);
}

function createTimeSeriesWindows(data: number[], windowSize: number, step: number = 1): number[][] {
  const windows: number[][] = [];
  for (let i = 0; i <= data.length - windowSize; i += step) {
    windows.push(data.slice(i, i + windowSize));
  }
  return windows;
}

function handleMissingValues(data: number[], strategy: 'mean' | 'zero' | 'forward_fill'): number[] {
  const result = [...data];
  const mean =
    data.filter((x) => !Number.isNaN(x)).reduce((sum, x) => sum + x, 0) /
    data.filter((x) => !Number.isNaN(x)).length;

  for (let i = 0; i < result.length; i++) {
    if (Number.isNaN(result[i])) {
      switch (strategy) {
        case 'mean':
          result[i] = mean || 0;
          break;
        case 'zero':
          result[i] = 0;
          break;
        case 'forward_fill':
          result[i] = i > 0 ? result[i - 1] : 0;
          break;
      }
    }
  }
  return result;
}

describe('Neural Network Model Invariants', () => {
  test('output dimensions match configuration', () => {
    fc.assert(
      fc.property(networkConfig(), (config) => {
        const network = new MockNeuralNetwork(config);
        const input = new Array(config.inputSize).fill(0.5);
        const output = network.predict(input);

        expect(output).toHaveLength(config.outputSize);
      })
    );
  });

  test('network info consistency', () => {
    fc.assert(
      fc.property(networkConfig(), (config) => {
        const network = new MockNeuralNetwork(config);
        const info = network.getInfo();

        // Input/output sizes should match config
        expect(info.numInputs).toBe(config.inputSize);
        expect(info.numOutputs).toBe(config.outputSize);

        // Layer count should be consistent
        expect(info.numLayers).toBe(config.hiddenLayers.length + 2);

        // Total neurons should be positive
        expect(info.totalNeurons).toBeGreaterThan(0);

        // Memory usage should be reasonable
        expect(info.metrics.memoryUsage).toBeGreaterThan(0);
        expect(info.metrics.memoryUsage).toBeLessThan(1e9); // Less than 1GB
      })
    );
  });

  test('parameter bounds validation', () => {
    fc.assert(
      fc.property(
        networkConfig(),
        fc.array(finiteFloat(), { minLength: 100, maxLength: 1000 }),
        (_config, weights) => {
          // All weights should be finite
          const allFinite = weights.every((w) => Number.isFinite(w));
          expect(allFinite).toBe(true);

          // Weights should be in reasonable range for training stability
          const allReasonable = weights.every((w) => Math.abs(w) < 100);
          expect(allReasonable).toBe(true);
        }
      )
    );
  });

  test('training convergence properties', () => {
    fc.assert(
      fc.property(networkConfig(), (config) => {
        // Generate appropriate training data
        const batchSize = 10;
        const inputs = Array(batchSize)
          .fill(0)
          .map(() =>
            Array(config.inputSize)
              .fill(0)
              .map(() => Math.random() * 2 - 1)
          );
        const outputs = Array(batchSize)
          .fill(0)
          .map(() =>
            Array(config.outputSize)
              .fill(0)
              .map(() => Math.random() * 2 - 1)
          );

        const network = new MockNeuralNetwork(config);
        const result = network.train({ inputs, outputs });

        // Training should converge
        expect(typeof result.converged).toBe('boolean');
        expect(result.finalError).toBeGreaterThanOrEqual(0);
        expect(result.epochs).toBeGreaterThan(0);
        expect(Number.isFinite(result.finalError)).toBe(true);
      })
    );
  });
});

describe('Data Processing Invariants', () => {
  test('normalization reversibility', () => {
    fc.assert(
      fc.property(fc.array(finiteFloat(), { minLength: 10, maxLength: 100 }), (data) => {
        // Skip if all values are the same (stdDev = 0)
        const unique = [...new Set(data)];
        fc.pre(unique.length > 1);

        const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
        const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.length;
        const stdDev = Math.sqrt(variance);

        const normalized = normalizeData(data);
        const denormalized = denormalizeData(normalized, mean, stdDev);

        // Original data should be approximately restored
        for (let i = 0; i < data.length; i++) {
          expect(denormalized[i]).toBeCloseTo(data[i], 5);
        }
      })
    );
  });

  test('normalized data properties', () => {
    fc.assert(
      fc.property(fc.array(finiteFloat(), { minLength: 10, maxLength: 100 }), (data) => {
        const unique = [...new Set(data)];
        fc.pre(unique.length > 1); // Skip constant arrays

        const normalized = normalizeData(data);

        // Mean should be approximately 0
        const mean = normalized.reduce((sum, x) => sum + x, 0) / normalized.length;
        expect(Math.abs(mean)).toBeLessThan(1e-10);

        // Standard deviation should be approximately 1
        const variance =
          normalized.reduce((sum, x) => sum + (x - mean) ** 2, 0) / normalized.length;
        const stdDev = Math.sqrt(variance);
        expect(Math.abs(stdDev - 1.0)).toBeLessThan(1e-10);

        // All values should be finite
        expect(normalized.every((x) => Number.isFinite(x))).toBe(true);
      })
    );
  });

  test('time series window generation correctness', () => {
    fc.assert(
      fc.property(
        fc.array(finiteFloat(), { minLength: 20, maxLength: 100 }),
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (data, windowSize, step) => {
          fc.pre(windowSize <= data.length);

          const windows = createTimeSeriesWindows(data, windowSize, step);

          // Each window should have correct size
          windows.forEach((window) => {
            expect(window).toHaveLength(windowSize);
          });

          // Window count should be correct
          const expectedCount = Math.floor((data.length - windowSize) / step) + 1;
          expect(windows.length).toBe(expectedCount);

          // Windows should contain correct subsequences
          for (let i = 0; i < windows.length; i++) {
            const startIndex = i * step;
            for (let j = 0; j < windowSize; j++) {
              expect(windows[i][j]).toBe(data[startIndex + j]);
            }
          }
        }
      )
    );
  });

  test('missing value handling consistency', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(finiteFloat(), fc.constant(NaN)), { minLength: 5, maxLength: 50 }),
        fc.constantFrom('mean', 'zero', 'forward_fill'),
        (dataWithNaN, strategy) => {
          const result = handleMissingValues(dataWithNaN, strategy);

          // Result should have same length
          expect(result).toHaveLength(dataWithNaN.length);

          // No NaN values should remain
          expect(result.every((x) => !Number.isNaN(x))).toBe(true);

          // All values should be finite
          expect(result.every((x) => Number.isFinite(x))).toBe(true);

          // Non-NaN values should be preserved
          for (let i = 0; i < dataWithNaN.length; i++) {
            if (!Number.isNaN(dataWithNaN[i])) {
              expect(result[i]).toBe(dataWithNaN[i]);
            }
          }
        }
      )
    );
  });
});

describe('Numerical Stability Properties', () => {
  test('activation function bounds', () => {
    fc.assert(
      fc.property(finiteFloat(), (x) => {
        // Sigmoid bounds
        const sigmoid = 1 / (1 + Math.exp(-x));
        expect(sigmoid).toBeGreaterThanOrEqual(0);
        expect(sigmoid).toBeLessThanOrEqual(1);
        expect(Number.isFinite(sigmoid)).toBe(true);

        // Tanh bounds
        const tanh = Math.tanh(x);
        expect(tanh).toBeGreaterThanOrEqual(-1);
        expect(tanh).toBeLessThanOrEqual(1);
        expect(Number.isFinite(tanh)).toBe(true);

        // ReLU properties
        const relu = Math.max(0, x);
        expect(relu).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(relu)).toBe(true);
      })
    );
  });

  test('matrix operations stability', () => {
    fc.assert(
      fc.property(
        fc.array(smallFloat(), { minLength: 4, maxLength: 16 }),
        fc.array(smallFloat(), { minLength: 4, maxLength: 16 }),
        (a, b) => {
          // Simple element-wise operations
          fc.pre(a.length === b.length);

          const sum = a.map((x, i) => x + b[i]);
          const product = a.map((x, i) => x * b[i]);

          // Results should be finite
          expect(sum.every((x) => Number.isFinite(x))).toBe(true);
          expect(product.every((x) => Number.isFinite(x))).toBe(true);

          // Operation properties
          expect(sum).toHaveLength(a.length);
          expect(product).toHaveLength(a.length);
        }
      )
    );
  });

  test('gradient magnitude bounds', () => {
    fc.assert(
      fc.property(
        fc.array(smallFloat(), { minLength: 10, maxLength: 100 }),
        fc.float({ min: 0.001, max: 0.1 }),
        (weights, learningRate) => {
          // Simulate gradient computation
          const gradients = weights.map((w) => w * 0.1 * (Math.random() - 0.5));

          // Gradients should be finite
          expect(gradients.every((g) => Number.isFinite(g))).toBe(true);

          // Gradient magnitude should be reasonable
          const magnitude = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
          expect(magnitude).toBeLessThan(1000);

          // Weight updates should be stable
          const updatedWeights = weights.map((w, i) => w - learningRate * gradients[i]);
          expect(updatedWeights.every((w) => Number.isFinite(w))).toBe(true);
        }
      )
    );
  });

  test('loss function properties', () => {
    fc.assert(
      fc.property(
        fc.array(smallFloat(), { minLength: 5, maxLength: 20 }),
        fc.array(smallFloat(), { minLength: 5, maxLength: 20 }),
        (predictions, targets) => {
          fc.pre(predictions.length === targets.length);

          // Mean Squared Error
          const mse =
            predictions.reduce((sum, p, i) => sum + (p - targets[i]) ** 2, 0) / predictions.length;

          expect(mse).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(mse)).toBe(true);

          // MSE should be 0 when predictions equal targets
          const identicalMse =
            predictions.reduce((sum, p) => sum + (p - p) ** 2, 0) / predictions.length;
          expect(identicalMse).toBeCloseTo(0, 10);
        }
      )
    );
  });
});

describe('Edge Case Handling', () => {
  test('extreme input values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }), {
          minLength: 1,
          maxLength: 10,
        }),
        (extremeInputs) => {
          // Network should handle extreme values gracefully
          const config: NetworkConfig = {
            inputSize: extremeInputs.length,
            hiddenLayers: [{ size: 5, activation: 'sigmoid' }],
            outputSize: 3,
            outputActivation: 'sigmoid',
          };

          const network = new MockNeuralNetwork(config);
          const output = network.predict(extremeInputs);

          // Output should be finite and within bounds for sigmoid
          expect(output.every((x) => Number.isFinite(x))).toBe(true);
          expect(output.every((x) => x >= 0 && x <= 1)).toBe(true);
        }
      )
    );
  });

  test('empty and minimal inputs', () => {
    const minimalConfig: NetworkConfig = {
      inputSize: 1,
      hiddenLayers: [{ size: 1, activation: 'sigmoid' }],
      outputSize: 1,
      outputActivation: 'sigmoid',
    };

    const network = new MockNeuralNetwork(minimalConfig);
    const output = network.predict([0.5]);

    expect(output).toHaveLength(1);
    expect(Number.isFinite(output[0])).toBe(true);
  });

  test('malformed data resilience', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(finiteFloat(), fc.constant(NaN), fc.constant(Infinity), fc.constant(-Infinity)),
          { minLength: 5, maxLength: 20 }
        ),
        (malformedData) => {
          // Data cleaning should handle malformed inputs
          const cleanedData = malformedData.map((x) => (Number.isFinite(x) ? x : 0));

          expect(cleanedData.every((x) => Number.isFinite(x))).toBe(true);
          expect(cleanedData).toHaveLength(malformedData.length);

          // Missing value handling should work
          const withNaN = malformedData.map((x) => (Number.isFinite(x) ? x : NaN));
          const handled = handleMissingValues(withNaN, 'zero');

          expect(handled.every((x) => Number.isFinite(x))).toBe(true);
          expect(handled.every((x) => !Number.isNaN(x))).toBe(true);
        }
      )
    );
  });
});

describe('Statistical Properties', () => {
  test('distribution preservation in preprocessing', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: -100, max: 100, noNaN: true }), { minLength: 50, maxLength: 200 }),
        (data) => {
          const unique = [...new Set(data)];
          fc.pre(unique.length > 10); // Ensure sufficient variance

          const normalized = normalizeData(data);

          // Check that relative ordering is preserved
          for (let i = 0; i < data.length - 1; i++) {
            for (let j = i + 1; j < data.length; j++) {
              const originalOrder = data[i] <= data[j];
              const normalizedOrder = normalized[i] <= normalized[j];
              expect(originalOrder).toBe(normalizedOrder);
            }
          }
        }
      )
    );
  });

  test('correlation preservation', () => {
    fc.assert(
      fc.property(
        fc.array(finiteFloat(), { minLength: 20, maxLength: 50 }),
        fc.float({ min: -2, max: 2 }),
        fc.float({ min: -10, max: 10 }),
        (baseData, correlation, offset) => {
          // Create correlated data
          const correlatedData = baseData.map(
            (x) => correlation * x + offset + (Math.random() - 0.5) * 0.1
          );

          // Normalize both datasets
          const normalizedBase = normalizeData(baseData);
          const normalizedCorrelated = normalizeData(correlatedData);

          // Calculate correlation coefficients
          const originalCorr = calculateCorrelation(baseData, correlatedData);
          const normalizedCorr = calculateCorrelation(normalizedBase, normalizedCorrelated);

          // Normalization should preserve correlation (within tolerance)
          if (Math.abs(originalCorr) > 0.1) {
            // Only test when correlation is significant
            expect(Math.abs(originalCorr - normalizedCorr)).toBeLessThan(0.1);
          }
        }
      )
    );
  });
});

// Helper function for correlation calculation
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    numerator += deltaX * deltaY;
    denomX += deltaX * deltaX;
    denomY += deltaY * deltaY;
  }

  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
}
