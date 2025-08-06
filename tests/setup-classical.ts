/**
 * Classical TDD (Detroit) Test Setup
 *
 * @file Setup configuration for state-based testing
 * Focus: Algorithms, computations, mathematical operations, data transformations
 */

import 'jest-extended';

// Classical TDD focuses on real implementations and state verification
beforeEach(() => {
  // Minimal mocking - use real implementations when possible
  jest.restoreAllMocks();

  // Setup performance monitoring for algorithm testing
  setupPerformanceMonitoring();

  // Initialize test data generators
  initializeTestDataGenerators();
});

afterEach(() => {
  // Clean up any test state
  cleanupTestState();

  // Collect performance metrics
  collectPerformanceMetrics();
});

function setupPerformanceMonitoring() {
  // Track execution time for algorithm tests
  global.testStartTime = Date.now();

  // Setup memory usage monitoring
  if (global.gc) {
    global.gc();
    global.testStartMemory = process.memoryUsage();
  }
}

interface ExtendedMath extends Math {
  seedrandom?: (seed: string) => () => number;
}

function initializeTestDataGenerators() {
  // Seed random number generator for reproducible tests
  (Math as ExtendedMath).seedrandom = (seed: string) => {
    const seedNum = hashCode(seed);
    let x = Math.sin(seedNum) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  };
}

function cleanupTestState() {
  // Clean up any global state or resources
  if (global.testStartTime) {
    const executionTime = Date.now() - global.testStartTime;
    global.lastTestExecutionTime = executionTime;
  }
}

function collectPerformanceMetrics() {
  if (global.gc && global.testStartMemory) {
    global.gc();
    const endMemory = process.memoryUsage();
    global.lastTestMemoryDelta = {
      rss: endMemory.rss - global.testStartMemory.rss,
      heapUsed: endMemory.heapUsed - global.testStartMemory.heapUsed,
      heapTotal: endMemory.heapTotal - global.testStartMemory.heapTotal,
    };
  }
}

function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

interface ExtendedGlobal extends NodeJS.Global {
  generateTestMatrix(
    rows: number,
    cols: number,
    fillFn?: (i: number, j: number) => number
  ): number[][];
  generateTestVector(size: number, fillFn?: (i: number) => number): number[];
  generateXORData(): Array<{ input: number[]; output: number[] }>;
  generateLinearData(samples: number, noise?: number): Array<{ input: number[]; output: number[] }>;
  expectPerformance(fn: () => void, maxTimeMs: number): number;
  expectMemoryUsage(fn: () => void, maxMemoryMB: number): number | undefined;
  expectNearlyEqual(actual: number, expected: number, tolerance?: number): void;
  expectArrayNearlyEqual(actual: number[], expected: number[], tolerance?: number): void;
  expectMatrixNearlyEqual(actual: number[][], expected: number[][], tolerance?: number): void;
  gc?: () => void;
}

// Classical TDD helpers for algorithm testing
(global as unknown as ExtendedGlobal).generateTestMatrix = (
  rows: number,
  cols: number,
  fillFn?: (i: number, j: number) => number
) => {
  const matrix: number[][] = [];
  for (let i = 0; i < rows; i++) {
    matrix[i] = [];
    for (let j = 0; j < cols; j++) {
      matrix[i][j] = fillFn ? fillFn(i, j) : Math.random();
    }
  }
  return matrix;
};

(global as unknown as ExtendedGlobal).generateTestVector = (
  size: number,
  fillFn?: (i: number) => number
) => {
  const vector: number[] = [];
  for (let i = 0; i < size; i++) {
    vector[i] = fillFn ? fillFn(i) : Math.random();
  }
  return vector;
};

// Neural network test data generators
(global as unknown as ExtendedGlobal).generateXORData = () => [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
];

(global as unknown as ExtendedGlobal).generateLinearData = (
  samples: number,
  noise: number = 0.1
) => {
  const data = [];
  for (let i = 0; i < samples; i++) {
    const x = Math.random() * 10;
    const y = 2 * x + 3 + (Math.random() - 0.5) * noise;
    data.push({ input: [x], output: [y] });
  }
  return data;
};

// Performance assertion helpers
(global as unknown as ExtendedGlobal).expectPerformance = (fn: () => void, maxTimeMs: number) => {
  const start = Date.now();
  fn();
  const duration = Date.now() - start;
  expect(duration).toBeLessThanOrEqual(maxTimeMs);
  return duration;
};

(global as unknown as ExtendedGlobal).expectMemoryUsage = (fn: () => void, maxMemoryMB: number) => {
  if (!(global as unknown as ExtendedGlobal).gc) return; // Skip if garbage collection not available

  (global as unknown as ExtendedGlobal).gc();
  const startMemory = process.memoryUsage().heapUsed;
  fn();
  (global as unknown as ExtendedGlobal).gc();
  const endMemory = process.memoryUsage().heapUsed;
  const memoryUsedMB = (endMemory - startMemory) / 1024 / 1024;

  expect(memoryUsedMB).toBeLessThanOrEqual(maxMemoryMB);
  return memoryUsedMB;
};

// Mathematical precision helpers
(global as unknown as ExtendedGlobal).expectNearlyEqual = (
  actual: number,
  expected: number,
  tolerance: number = 1e-10
) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

(global as unknown as ExtendedGlobal).expectArrayNearlyEqual = (
  actual: number[],
  expected: number[],
  tolerance: number = 1e-10
) => {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i++) {
    (global as unknown as ExtendedGlobal).expectNearlyEqual(actual[i], expected[i], tolerance);
  }
};

(global as unknown as ExtendedGlobal).expectMatrixNearlyEqual = (
  actual: number[][],
  expected: number[][],
  tolerance: number = 1e-10
) => {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i++) {
    (global as unknown as ExtendedGlobal).expectArrayNearlyEqual(actual[i], expected[i], tolerance);
  }
};

declare global {
  namespace NodeJS {
    interface Global {
      testStartTime: number;
      testStartMemory: NodeJS.MemoryUsage;
      lastTestExecutionTime: number;
      lastTestMemoryDelta: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
      };
      gc?: () => void;

      generateTestMatrix(
        rows: number,
        cols: number,
        fillFn?: (i: number, j: number) => number
      ): number[][];
      generateTestVector(size: number, fillFn?: (i: number) => number): number[];
      generateXORData(): Array<{ input: number[]; output: number[] }>;
      generateLinearData(
        samples: number,
        noise?: number
      ): Array<{ input: number[]; output: number[] }>;
      expectPerformance(fn: () => void, maxTimeMs: number): number;
      expectMemoryUsage(fn: () => void, maxMemoryMB: number): number | undefined;
      expectNearlyEqual(actual: number, expected: number, tolerance?: number): void;
      expectArrayNearlyEqual(actual: number[], expected: number[], tolerance?: number): void;
      expectMatrixNearlyEqual(actual: number[][], expected: number[][], tolerance?: number): void;
    }
  }
}
