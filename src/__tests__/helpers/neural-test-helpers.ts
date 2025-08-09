/**
 * Neural Network Test Helpers
 *
 * @file Specialized helpers for testing neural network components (Classical TDD)
 */

export interface NeuralTestData {
  input: number[];
  output: number[];
  metadata?: {
    label?: string;
    category?: string;
    weight?: number;
  };
}

export interface TrainingTestConfig {
  epochs: number;
  learningRate: number;
  tolerance: number;
  convergenceThreshold: number;
  maxTrainingTime: number;
}

export class NeuralTestDataGenerator {
  /**
   * Generate random vector for testing
   *
   * @param size
   * @param min
   * @param max
   */
  generateRandomVector(size: number, min: number = -1, max: number = 1): number[] {
    return Array.from({ length: size }, () => Math.random() * (max - min) + min);
  }

  /**
   * Generate random batch for testing
   *
   * @param batchSize
   * @param featureSize
   * @param min
   * @param max
   */
  generateRandomBatch(
    batchSize: number,
    featureSize: number,
    min: number = -1,
    max: number = 1
  ): number[][] {
    return Array.from({ length: batchSize }, () =>
      this.generateRandomVector(featureSize, min, max)
    );
  }

  /**
   * Check if two vectors are equal within tolerance
   *
   * @param a
   * @param b
   * @param tolerance
   */
  vectorsEqual(a: number[], b: number[], tolerance: number = 1e-6): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > tolerance) return false;
    }
    return true;
  }

  /**
   * Generate XOR training data
   */
  static generateXORData(): NeuralTestData[] {
    return [
      { input: [0, 0], output: [0], metadata: { label: 'XOR_00' } },
      { input: [0, 1], output: [1], metadata: { label: 'XOR_01' } },
      { input: [1, 0], output: [1], metadata: { label: 'XOR_10' } },
      { input: [1, 1], output: [0], metadata: { label: 'XOR_11' } },
    ];
  }

  /**
   * Generate linear regression data
   *
   * @param samples
   * @param noise
   */
  static generateLinearData(samples: number, noise: number = 0.1): NeuralTestData[] {
    const data: NeuralTestData[] = [];
    for (let i = 0; i < samples; i++) {
      const x = Math.random() * 10;
      const y = 2 * x + 3 + (Math.random() - 0.5) * noise;
      data?.push({
        input: [x],
        output: [y],
        metadata: { label: `linear_${i}` },
      });
    }
    return data;
  }

  /**
   * Generate polynomial regression data
   *
   * @param samples
   * @param degree
   * @param noise
   */
  static generatePolynomialData(
    samples: number,
    degree: number = 2,
    noise: number = 0.1
  ): NeuralTestData[] {
    const data: NeuralTestData[] = [];
    const coefficients = Array.from({ length: degree + 1 }, () => Math.random() * 2 - 1);

    for (let i = 0; i < samples; i++) {
      const x = Math.random() * 4 - 2; // Range [-2, 2]
      let y = 0;
      for (let d = 0; d <= degree; d++) {
        y += coefficients[d] * x ** d;
      }
      y += (Math.random() - 0.5) * noise;

      data?.push({
        input: [x],
        output: [y],
        metadata: { label: `poly_${i}`, category: `degree_${degree}` },
      });
    }
    return data;
  }

  /**
   * Generate classification data (spiral pattern)
   *
   * @param samplesPerClass
   * @param classes
   */
  static generateSpiralData(samplesPerClass: number = 50, classes: number = 2): NeuralTestData[] {
    const data: NeuralTestData[] = [];

    for (let classIndex = 0; classIndex < classes; classIndex++) {
      for (let i = 0; i < samplesPerClass; i++) {
        const t = i / samplesPerClass;
        const r = t * 3 + Math.random() * 0.1;
        const angle = classIndex * Math.PI + t * Math.PI * 2 + Math.random() * 0.2;

        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const output = Array(classes).fill(0);
        output[classIndex] = 1;

        data?.push({
          input: [x, y],
          output,
          metadata: { label: `spiral_class_${classIndex}_${i}`, category: `class_${classIndex}` },
        });
      }
    }

    return NeuralTestDataGenerator?.shuffleArray(data);
  }

  /**
   * Generate time series data
   *
   * @param length
   * @param frequency
   * @param noise
   */
  static generateTimeSeriesData(
    length: number,
    frequency: number = 1,
    noise: number = 0.1
  ): NeuralTestData[] {
    const data: NeuralTestData[] = [];

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const value = Math.sin(2 * Math.PI * frequency * t) + (Math.random() - 0.5) * noise;
      const nextValue =
        Math.sin(2 * Math.PI * frequency * (t + 1 / length)) + (Math.random() - 0.5) * noise;

      data?.push({
        input: [value],
        output: [nextValue],
        metadata: { label: `timeseries_${i}`, category: 'temporal' },
      });
    }

    return data;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export class NeuralNetworkValidator {
  /**
   * Validate network topology
   *
   * @param topology
   */
  static validateTopology(topology: number[]): void {
    expect(topology.length).toBeGreaterThan(1);
    topology.forEach((layerSize) => {
      expect(layerSize).toBeGreaterThan(0);
      expect(Number.isInteger(layerSize)).toBe(true);
    });
  }

  /**
   * Validate training convergence
   *
   * @param errors
   * @param config
   */
  static validateConvergence(
    errors: number[],
    config: TrainingTestConfig
  ): { converged: boolean; finalError: number; epochs: number } {
    const finalError = errors[errors.length - 1];
    const converged = finalError < config?.convergenceThreshold;

    expect(errors.length).toBeGreaterThan(0);
    expect(Number.isFinite(finalError)).toBe(true);
    expect(finalError).toBeGreaterThanOrEqual(0);

    if (converged) {
      expect(finalError).toBeLessThan(config?.convergenceThreshold);
    }

    return {
      converged,
      finalError,
      epochs: errors.length,
    };
  }

  /**
   * Validate prediction accuracy
   *
   * @param predictions
   * @param expected
   * @param tolerance
   */
  static validatePredictionAccuracy(
    predictions: number[][],
    expected: number[][],
    tolerance: number = 1e-6
  ): { accuracy: number; errors: number[] } {
    expect(predictions).toHaveLength(expected.length);

    const errors: number[] = [];
    let correctPredictions = 0;

    for (let i = 0; i < predictions.length; i++) {
      expect(predictions[i]).toHaveLength(expected[i].length);

      const error = NeuralNetworkValidator.calculateMSE(predictions[i], expected[i]);
      errors.push(error);

      if (error < tolerance) {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / predictions.length;

    return { accuracy, errors };
  }

  /**
   * Validate weight initialization
   *
   * @param weights
   * @param method
   */
  static validateWeightInitialization(
    weights: number[][],
    method: 'xavier' | 'he' | 'random'
  ): void {
    const flatWeights = weights.flat();
    const mean = flatWeights.reduce((sum, w) => sum + w, 0) / flatWeights.length;
    const variance = flatWeights.reduce((sum, w) => sum + (w - mean) ** 2, 0) / flatWeights.length;

    // Weights should be finite
    flatWeights.forEach((weight) => {
      expect(Number.isFinite(weight)).toBe(true);
      expect(weight).not.toBeNaN();
    });

    // Check initialization properties
    switch (method) {
      case 'xavier':
        expect(Math.abs(mean)).toBeLessThan(0.1);
        expect(variance).toBeLessThan(1.0);
        break;
      case 'he':
        expect(Math.abs(mean)).toBeLessThan(0.1);
        expect(variance).toBeLessThan(2.0);
        break;
      case 'random':
        expect(variance).toBeGreaterThan(0);
        break;
    }
  }

  /**
   * Validate gradient flow
   *
   * @param gradients
   */
  static validateGradientFlow(gradients: number[][]): void {
    const flatGradients = gradients.flat();

    // Gradients should be finite
    flatGradients.forEach((gradient) => {
      expect(Number.isFinite(gradient)).toBe(true);
      expect(gradient).not.toBeNaN();
    });

    // Check for vanishing gradients
    const avgGradientMagnitude =
      flatGradients.reduce((sum, g) => sum + Math.abs(g), 0) / flatGradients.length;
    expect(avgGradientMagnitude).toBeGreaterThan(1e-10);

    // Check for exploding gradients
    expect(avgGradientMagnitude).toBeLessThan(100);
  }

  private static calculateMSE(predicted: number[], actual: number[]): number {
    const mse =
      predicted.reduce((sum, pred, index) => {
        return sum + (pred - actual[index]) ** 2;
      }, 0) / predicted.length;
    return mse;
  }
}

export class NeuralPerformanceTester {
  /**
   * Benchmark training speed
   *
   * @param trainingFunction
   * @param expectedMaxTime
   */
  static async benchmarkTraining(
    trainingFunction: () => Promise<void>,
    expectedMaxTime: number
  ): Promise<{ duration: number; withinExpected: boolean }> {
    const start = Date.now();
    await trainingFunction();
    const duration = Date.now() - start;

    const withinExpected = duration <= expectedMaxTime;
    expect(duration).toBeLessThanOrEqual(expectedMaxTime);

    return { duration, withinExpected };
  }

  /**
   * Benchmark prediction speed
   *
   * @param predictionFunction
   * @param iterations
   * @param expectedMaxTimePerPrediction
   */
  static benchmarkPrediction(
    predictionFunction: () => number[],
    iterations: number,
    expectedMaxTimePerPrediction: number
  ): { avgTime: number; totalTime: number; withinExpected: boolean } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      predictionFunction();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;

    const withinExpected = avgTime <= expectedMaxTimePerPrediction;
    expect(avgTime).toBeLessThanOrEqual(expectedMaxTimePerPrediction);

    return { avgTime, totalTime, withinExpected };
  }

  /**
   * Memory usage validation
   *
   * @param networkFunction
   * @param maxMemoryIncreaseMB
   */
  static validateMemoryUsage(
    networkFunction: () => void,
    maxMemoryIncreaseMB: number
  ): { memoryIncrease: number; withinLimit: boolean } {
    if (!global.gc) {
      console.warn('Garbage collection not available, skipping memory test');
      return { memoryIncrease: 0, withinLimit: true };
    }

    global.gc();
    const startMemory = process.memoryUsage().heapUsed;

    networkFunction();

    global.gc();
    const endMemory = process.memoryUsage().heapUsed;

    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // Convert to MB
    const withinLimit = memoryIncrease <= maxMemoryIncreaseMB;

    expect(memoryIncrease).toBeLessThanOrEqual(maxMemoryIncreaseMB);

    return { memoryIncrease, withinLimit };
  }
}

export class NeuralMathHelpers {
  /**
   * Generate test matrices for linear algebra operations
   *
   * @param rows
   * @param cols
   * @param fillType
   */
  static generateMatrix(
    rows: number,
    cols: number,
    fillType: 'random' | 'zeros' | 'ones' | 'identity' = 'random'
  ): number[][] {
    const matrix: number[][] = [];

    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        switch (fillType) {
          case 'random':
            matrix[i]?.[j] = Math.random() * 2 - 1; // Range [-1, 1]
            break;
          case 'zeros':
            matrix[i]?.[j] = 0;
            break;
          case 'ones':
            matrix[i]?.[j] = 1;
            break;
          case 'identity':
            matrix[i]?.[j] = i === j ? 1 : 0;
            break;
        }
      }
    }

    return matrix;
  }

  /**
   * Matrix multiplication for validation
   *
   * @param a
   * @param b
   */
  static matrixMultiply(a: number[][], b: number[][]): number[][] {
    expect(a[0]).toHaveLength(b.length);

    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result?.[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        result?.[i]?.[j] = 0;
        for (let k = 0; k < b.length; k++) {
          result?.[i]?.[j] += a[i]?.[k] * b[k]?.[j];
        }
      }
    }

    return result;
  }

  /**
   * Activation function implementations for testing
   */
  static activationFunctions = {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    relu: (x: number) => Math.max(0, x),
    tanh: (x: number) => Math.tanh(x),
    leakyRelu: (x: number, alpha: number = 0.01) => (x > 0 ? x : alpha * x),
  };

  /**
   * Derivative implementations for gradient testing
   */
  static activationDerivatives = {
    sigmoid: (x: number) => {
      const s = NeuralMathHelpers.activationFunctions.sigmoid(x);
      return s * (1 - s);
    },
    relu: (x: number) => (x > 0 ? 1 : 0),
    tanh: (x: number) => 1 - Math.tanh(x) ** 2,
    leakyRelu: (x: number, alpha: number = 0.01) => (x > 0 ? 1 : alpha),
  };

  /**
   * Numerical gradient calculation for testing
   *
   * @param f
   * @param x
   * @param h
   */
  static numericalGradient(f: (x: number) => number, x: number, h: number = 1e-5): number {
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  /**
   * Compare matrices with tolerance
   *
   * @param a
   * @param b
   * @param tolerance
   */
  static compareMatrices(a: number[][], b: number[][], tolerance: number = 1e-10): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (a[i].length !== b[i].length) return false;
      for (let j = 0; j < a[i].length; j++) {
        if (Math.abs(a[i]?.[j] - b[i]?.[j]) > tolerance) return false;
      }
    }

    return true;
  }
}

/**
 * Factory function for neural test setup
 *
 * @param config
 */
export function createNeuralTestSuite(config?: Partial<TrainingTestConfig>) {
  const defaultConfig: TrainingTestConfig = {
    epochs: 1000,
    learningRate: 0.01,
    tolerance: 1e-6,
    convergenceThreshold: 0.01,
    maxTrainingTime: 30000,
  };

  return {
    config: { ...defaultConfig, ...config },
    dataGenerator: NeuralTestDataGenerator,
    validator: NeuralNetworkValidator,
    performance: NeuralPerformanceTester,
    math: NeuralMathHelpers,
  };
}
