/**
 * Classical TDD (Detroit School) - Neural Network Training Tests
 *
 * Focus: Test actual results and mathematical correctness
 * No mocks - verify real computations
 */

import { describe, expect, it } from '@jest/globals';

// Example neural network implementation (would be imported from actual code)
class NeuralNetwork {
  private weights: number[][][];
  private biases: number[][];

  constructor(private layers: number[]) {
    this.initializeWeights();
  }

  private initializeWeights() {
    this.weights = [];
    this.biases = [];

    for (let i = 1; i < this.layers.length; i++) {
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < this.layers[i]; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < this.layers[i - 1]; k++) {
          // Xavier initialization
          const limit = Math.sqrt(6 / (this.layers[i - 1] + this.layers[i]));
          neuronWeights.push((Math.random() * 2 - 1) * limit);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(0);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private sigmoidDerivative(x: number): number {
    return x * (1 - x);
  }

  predict(inputs: number[]): number[] {
    let activation = inputs;

    for (let i = 0; i < this.weights.length; i++) {
      const newActivation: number[] = [];

      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i]?.[j];
        for (let k = 0; k < activation.length; k++) {
          sum += activation[k] * this.weights[i]?.[j]?.[k];
        }
        newActivation.push(this.sigmoid(sum));
      }

      activation = newActivation;
    }

    return activation;
  }

  train(
    data: Array<{ input: number[]; output: number[] }>,
    options: { epochs: number; learningRate?: number }
  ) {
    const learningRate = options?.learningRate || 0.5;
    let finalError = 0;

    for (let epoch = 0; epoch < options?.epochs; epoch++) {
      let epochError = 0;

      for (const sample of data) {
        // Forward pass
        const activations: number[][] = [sample.input];
        let activation = sample.input;

        for (let i = 0; i < this.weights.length; i++) {
          const newActivation: number[] = [];

          for (let j = 0; j < this.weights[i].length; j++) {
            let sum = this.biases[i]?.[j];
            for (let k = 0; k < activation.length; k++) {
              sum += activation[k] * this.weights[i]?.[j]?.[k];
            }
            newActivation.push(this.sigmoid(sum));
          }

          activation = newActivation;
          activations.push(activation);
        }

        // Calculate error
        const output = activations[activations.length - 1];
        const errors: number[][] = [];
        let error = output.map((o, i) => sample.output[i] - o);
        errors.unshift(error);

        epochError += error.reduce((sum, e) => sum + Math.abs(e), 0) / error.length;

        // Backpropagation
        for (let i = this.weights.length - 1; i > 0; i--) {
          const newError: number[] = [];

          for (let j = 0; j < this.weights[i - 1].length; j++) {
            let sum = 0;
            for (let k = 0; k < this.weights[i].length; k++) {
              sum += error[k] * this.weights[i]?.[k]?.[j];
            }
            newError.push(sum);
          }

          error = newError;
          errors.unshift(error);
        }

        // Update weights and biases
        for (let i = 0; i < this.weights.length; i++) {
          for (let j = 0; j < this.weights[i].length; j++) {
            const delta = errors[i + 1]?.[j] * this.sigmoidDerivative(activations[i + 1]?.[j]);

            for (let k = 0; k < this.weights[i]?.[j].length; k++) {
              this.weights[i]?.[j][k] += learningRate * delta * activations[i]?.[k];
            }

            this.biases[i][j] += learningRate * delta;
          }
        }
      }

      finalError = epochError / data.length;
    }

    return { finalError };
  }
}

describe('Neural Network Training - Classical TDD', () => {
  describe('XOR Problem', () => {
    it('should learn XOR function with sufficient accuracy', () => {
      // Arrange
      const network = new NeuralNetwork([2, 4, 1]);
      const xorData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ];

      // Act
      const result = network.train(xorData, { epochs: 5000, learningRate: 0.5 });

      // Assert - Test actual results
      expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
      expect(network.predict([0, 1])[0]).toBeCloseTo(1, 1);
      expect(network.predict([1, 0])[0]).toBeCloseTo(1, 1);
      expect(network.predict([1, 1])[0]).toBeCloseTo(0, 1);
      expect(result?.finalError).toBeLessThan(0.1);
    });

    it('should converge faster with higher learning rate', () => {
      // Test algorithm behavior, not mocks
      const network1 = new NeuralNetwork([2, 4, 1]);
      const network2 = new NeuralNetwork([2, 4, 1]);
      const xorData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ];

      const result1 = network1.train(xorData, { epochs: 1000, learningRate: 0.1 });
      const result2 = network2.train(xorData, { epochs: 1000, learningRate: 0.8 });

      // Higher learning rate should achieve lower error in same epochs
      expect(result2?.finalError).toBeLessThan(result1?.finalError);
    });
  });

  describe('Linear Separability', () => {
    it('should learn AND function easily', () => {
      const network = new NeuralNetwork([2, 2, 1]);
      const andData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
      ];

      const result = network.train(andData, { epochs: 1000 });

      // AND is linearly separable, should converge quickly
      expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
      expect(network.predict([1, 1])[0]).toBeCloseTo(1, 1);
      expect(result?.finalError).toBeLessThan(0.05);
    });
  });

  describe('Multi-class Classification', () => {
    it('should classify 3 distinct patterns', () => {
      const network = new NeuralNetwork([2, 5, 3]);
      const patterns = [
        { input: [0.1, 0.1], output: [1, 0, 0] }, // Class A
        { input: [0.9, 0.1], output: [0, 1, 0] }, // Class B
        { input: [0.5, 0.9], output: [0, 0, 1] }, // Class C
      ];

      network.train(patterns, { epochs: 2000 });

      // Test classification accuracy
      const predictA = network.predict([0.1, 0.1]);
      const predictB = network.predict([0.9, 0.1]);
      const predictC = network.predict([0.5, 0.9]);

      // Class A should have highest activation in first output
      expect(predictA[0]).toBeGreaterThan(predictA[1]);
      expect(predictA[0]).toBeGreaterThan(predictA[2]);

      // Class B should have highest activation in second output
      expect(predictB[1]).toBeGreaterThan(predictB[0]);
      expect(predictB[1]).toBeGreaterThan(predictB[2]);

      // Class C should have highest activation in third output
      expect(predictC[2]).toBeGreaterThan(predictC[0]);
      expect(predictC[2]).toBeGreaterThan(predictC[1]);
    });
  });

  describe('Gradient Descent Properties', () => {
    it('should reduce error monotonically with sufficient small learning rate', () => {
      const network = new NeuralNetwork([2, 3, 1]);
      const data = [
        { input: [0.2, 0.3], output: [0.5] },
        { input: [0.4, 0.6], output: [0.8] },
        { input: [0.7, 0.2], output: [0.3] },
      ];

      const errors: number[] = [];

      // Track error over epochs
      for (let i = 0; i < 10; i++) {
        const result = network.train(data, { epochs: 100, learningRate: 0.1 });
        errors.push(result?.finalError);
      }

      // Error should generally decrease (allowing for small fluctuations)
      let decreasing = 0;
      for (let i = 1; i < errors.length; i++) {
        if (errors[i] <= errors[i - 1]) decreasing++;
      }

      expect(decreasing).toBeGreaterThan(errors.length * 0.7); // 70% should be decreasing
    });
  });
});

/**
 * Classical TDD Principles Demonstrated:
 *
 * 1. No mocks - testing actual neural network behavior
 * 2. Focus on mathematical correctness and convergence
 * 3. Test algorithm properties (gradient descent, separability)
 * 4. Verify computation results, not interactions
 * 5. Performance and accuracy are the key metrics
 *
 * This is ideal for:
 * - Neural network algorithms
 * - Mathematical computations
 * - Data transformations
 * - Performance-critical code
 */
