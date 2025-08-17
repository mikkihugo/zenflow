/**
 * @fileoverview Test Utilities for Claude Code Zen
 * 
 * Common test helpers, custom matchers, and utility functions
 * used across the test suite.
 */

/**
 * Domain-specific custom matchers for Vitest/Jest
 */
export const domainMatchers = {
  /**
   * Test if a value is a deterministic random sequence
   */
  toBeDeterministic(received, expected) {
    const pass = JSON.stringify(received) === JSON.stringify(expected);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected sequences not to be deterministic`
          : `Expected deterministic sequences to match. Received: ${JSON.stringify(received)}, Expected: ${JSON.stringify(expected)}`
    };
  },

  /**
   * Test if a probability distribution sums to approximately 1
   */
  toSumToOne(received, precision = 10) {
    const sum = received.reduce((acc, val) => acc + val, 0);
    const pass = Math.abs(sum - 1.0) < Math.pow(10, -precision);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected distribution not to sum to 1`
          : `Expected distribution to sum to 1, but got ${sum} (precision: ${precision})`
    };
  },

  /**
   * Test if all values in array are positive
   */
  toBeAllPositive(received) {
    const pass = received.every(val => val > 0);
    const negativeValues = received.filter(val => val <= 0);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected some values to be non-positive`
          : `Expected all values to be positive, but found: ${negativeValues}`
    };
  },

  /**
   * Test if array contains unique elements
   */
  toContainUniqueElements(received) {
    const uniqueSet = new Set(received);
    const pass = uniqueSet.size === received.length;
    return {
      pass,
      message: () => 
        pass 
          ? `Expected array to contain duplicate elements`
          : `Expected array to contain unique elements, but found duplicates. Length: ${received.length}, Unique: ${uniqueSet.size}`
    };
  }
};

/**
 * Generate test data for DSPy algorithms
 */
export function generateTestData(size = 100) {
  return {
    scores: Array.from({ length: size }, (_, i) => Math.random() * 10),
    weights: Array.from({ length: size }, () => Math.random()),
    indices: Array.from({ length: size }, (_, i) => i),
    examples: Array.from({ length: size }, (_, i) => ({
      id: i,
      input: `test_input_${i}`,
      output: `test_output_${i}`,
      score: Math.random()
    }))
  };
}

/**
 * Helper for testing statistical properties
 */
export function testStatisticalProperties(samples, expectedMean, expectedStd, tolerance = 0.1) {
  const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
  const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
  const std = Math.sqrt(variance);
  
  return {
    mean,
    std,
    meanWithinTolerance: Math.abs(mean - expectedMean) <= tolerance,
    stdWithinTolerance: Math.abs(std - expectedStd) <= tolerance
  };
}

/**
 * Create a mock RNG for deterministic testing
 */
export function createMockRNG(sequence = [0.1, 0.2, 0.3, 0.4, 0.5]) {
  let index = 0;
  return {
    random: () => {
      const value = sequence[index % sequence.length];
      index++;
      return value;
    },
    reset: () => { index = 0; },
    setSequence: (newSequence) => { 
      sequence = newSequence; 
      index = 0; 
    }
  };
}

/**
 * Async test helpers
 */
export async function waitFor(condition, timeout = 1000, interval = 10) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Memory usage helpers for performance testing
 */
export function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage();
  }
  return null;
}

/**
 * Timer utilities for performance benchmarking
 */
export class PerformanceTimer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
    return this;
  }

  stop() {
    this.endTime = performance.now();
    return this;
  }

  getDuration() {
    if (this.startTime === null || this.endTime === null) {
      throw new Error('Timer must be started and stopped');
    }
    return this.endTime - this.startTime;
  }
}

/**
 * DSPy-specific test utilities
 */
export const dspyHelpers = {
  /**
   * Create a test Example object
   */
  createExample(data = {}) {
    return {
      question: data.question || 'What is the capital of France?',
      answer: data.answer || 'Paris',
      context: data.context || 'Geography question',
      score: data.score || 1.0,
      ...data
    };
  },

  /**
   * Create test metric function
   */
  createMetric(name = 'test_metric') {
    return {
      name,
      evaluate: (example, prediction) => {
        return prediction.answer === example.answer ? 1.0 : 0.0;
      }
    };
  },

  /**
   * Generate training/validation splits
   */
  createDataSplit(examples, trainRatio = 0.8) {
    const shuffled = [...examples].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * trainRatio);
    return {
      train: shuffled.slice(0, splitIndex),
      validation: shuffled.slice(splitIndex)
    };
  }
};