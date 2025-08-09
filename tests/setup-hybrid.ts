/**
/// <reference types="./global-types" />
 * Hybrid TDD Setup - Comprehensive Testing Configuration
 *
 * @file Implements the 70% London TDD / 30% Classical TDD hybrid approach
 *
 * Domain Distribution:
 * - Coordination: London TDD (mockist) - 70%
 * - Interfaces: London TDD (mockist) - 70%
 * - Neural: Classical TDD (Detroit) - 30%
 * - Memory: Hybrid approach based on operation type
 */

import 'jest-extended';
// Explicit import for ESM environment to ensure jest global is available
import { jest } from '@jest/globals';

/**
 * Hybrid TDD Configuration
 *
 * @example
 */
interface HybridTDDConfig {
  domain: 'coordination' | 'interfaces' | 'neural' | 'memory' | 'hybrid';
  testStyle: 'london' | 'classical' | 'hybrid';
  mockingStrategy: 'aggressive' | 'minimal' | 'selective';
  performanceThresholds: {
    coordinationLatency: number;
    neuralComputation: number;
    memoryAccess: number;
  };
}

const HYBRID_CONFIG: HybridTDDConfig = {
  domain: 'hybrid',
  testStyle: 'hybrid',
  mockingStrategy: 'selective',
  performanceThresholds: {
    coordinationLatency: 100, // ms
    neuralComputation: 1000, // ms for WASM operations
    memoryAccess: 50, // ms
  },
};

// Domain-specific test setup
beforeEach(() => {
  // Common setup for all domains
  jest.clearAllMocks();

  // Setup based on test file path
  const testPath = expect.getState().testPath || '';

  if (testPath.includes('/coordination/')) {
    setupLondonTDD();
  } else if (testPath.includes('/interfaces/')) {
    setupLondonTDD();
  } else if (testPath.includes('/neural/')) {
    setupClassicalTDD();
  } else if (testPath.includes('/memory/')) {
    setupHybridTDD();
  } else {
    setupHybridTDD(); // Default to hybrid
  }
});

afterEach(() => {
  // Cleanup based on test type
  const testPath = expect.getState().testPath || '';

  if (testPath.includes('/neural/')) {
    cleanupClassicalResources();
  }

  jest.clearAllMocks();
});

/**
 * London TDD Setup (Coordination & Interfaces domains)
 * Focus: Interactions, protocols, communication patterns
 */
function setupLondonTDD() {
  // Mock timers for deterministic coordination testing
  jest.useFakeTimers();

  // Setup interaction spies
  createInteractionSpy = (name: string) => {
    return jest.fn().mockName(name);
  };

  // Mock factory for complex coordination objects
  createCoordinationMock = <T>(defaults: Partial<T> = {}) => {
    return (overrides: Partial<T> = {}): T =>
      ({
        ...defaults,
        ...overrides,
      }) as T;
  };
}

/**
 * Classical TDD Setup (Neural domain)
 * Focus: Algorithms, computations, mathematical operations
 */
function setupClassicalTDD() {
  // Performance monitoring for neural computations
  globalThis.testStartTime = Date.now();

  if (typeof globalThis.gc === 'function') {
    try {
      globalThis.gc?.();
    } catch {
      /* ignore */
    }
    globalThis.testStartMemory = process.memoryUsage();
  }

  // Neural-specific test data generators
  /**
   * Generates test data for neural network training
   *
   * @param config - Configuration for data generation
   * @returns Array of training data points
   */
  generateNeuralTestData = (config: NeuralTestConfig): NeuralTestData[] => {
    switch (config.type) {
      case 'xor':
        return [
          { input: [0, 0], output: [0] },
          { input: [0, 1], output: [1] },
          { input: [1, 0], output: [1] },
          { input: [1, 1], output: [0] },
        ];
      case 'linear':
        return Array.from({ length: config.samples || 100 }, (_, _i) => {
          const x = Math.random() * 10;
          const y = 2 * x + 3 + (Math.random() - 0.5) * (config.noise || 0.1);
          return { input: [x], output: [y] };
        });
      default:
        return [];
    }
  };

  // Mathematical precision helpers
  /**
   * Asserts that two numbers are nearly equal within tolerance
   *
   * @param actual - Actual value
   * @param expected - Expected value
   * @param tolerance - Allowed difference (default: 1e-10)
   */
  expectNearlyEqual = (
    actual: number,
    expected: number,
    tolerance: number = 1e-10
  ) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };
}

/**
 * Hybrid TDD Setup (Memory domain & cross-domain operations)
 * Combines both approaches based on operation type
 */
function setupHybridTDD() {
  // Setup both London and Classical capabilities
  setupLondonTDD();
  setupClassicalTDD();

  // Hybrid-specific utilities
  testWithApproach = (
    approach: 'london' | 'classical',
    testFn: () => void | Promise<void>
  ) => {
    if (approach === 'london') {
      // Use mocks for external dependencies
      return testFn();
    } else {
      // Use real implementations
      return testFn();
    }
  };

  // Memory-specific test utilities
  createMemoryTestScenario = (type: 'sqlite' | 'lancedb' | 'json') => {
    switch (type) {
      case 'sqlite':
        return {
          backend: 'sqlite',
          connection: ':memory:',
          testData: { id: 1, data: 'test' },
        };
      case 'lancedb':
        return {
          backend: 'lancedb',
          table: 'test_vectors',
          testData: { id: 'vec-1', vector: [0.1, 0.2, 0.3] },
        };
      case 'json':
        return {
          backend: 'json',
          file: '/tmp/test.json',
          testData: { key: 'value' },
        };
      default:
        return {};
    }
  };
}

/**
 * Cleanup resources for Classical TDD tests
 */
function cleanupClassicalResources() {
  const g = (globalThis as any).gc;
  const startMem = (globalThis as any).testStartMemory as NodeJS.MemoryUsage | undefined;
  if (typeof g === 'function' && startMem) {
    try {
      g();
    } catch {
      /* ignore */
    }
    const endMemory = process.memoryUsage();
    (globalThis as any).lastTestMemoryDelta = {
      rss: endMemory.rss - startMem.rss,
      heapUsed: endMemory.heapUsed - startMem.heapUsed,
      heapTotal: endMemory.heapTotal - startMem.heapTotal,
    };
  }
}
/**
 * Performance assertion helpers for hybrid testing
 *
 * @param operation
 * @param actualTime
 */
(globalThis as any).expectPerformanceWithinThreshold = (
  operation: 'coordination' | 'neural' | 'memory',
  actualTime: number
) => {
  const threshold =
    HYBRID_CONFIG.performanceThresholds[
      operation === 'coordination'
        ? 'coordinationLatency'
        : operation === 'neural'
          ? 'neuralComputation'
          : 'memoryAccess'
    ];

  expect(actualTime).toBeLessThanOrEqual(threshold);
};
/**
 * DI Container test utilities
 */
(globalThis as any).createTestContainer = () => {
  const mockContainer = {
    register: jest.fn(),
    resolve: jest.fn(),
    createScope: jest.fn(),
    dispose: jest.fn(),
  };

  return mockContainer;
};
/**
 * SPARC methodology test utilities
 *
 * @param phase
 */
(globalThis as any).createSPARCTestScenario = (
  phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion'
) => {
  return {
    phase,
    input: `test-input-${phase}`,
    expectedOutput: `test-output-${phase}`,
    context: { swarmId: 'test-swarm', agentCount: 5 },
  };
};

/**
 * Memory test scenario configuration
 *
 * @example
 */
interface MemoryTestScenario {
  /** Memory backend type */
  type: 'sqlite' | 'lancedb' | 'json';
  /** Test configuration */
  config: unknown;
  /** Mock methods */
  mocks: Record<string, jest.Mock>;
}

/**
 * Test dependency injection container
 *
 * @example
 */
interface TestContainer {
  /** Register a service */
  register: jest.Mock;
  /** Resolve a service */
  resolve: jest.Mock;
  /** Dispose container */
  dispose: jest.Mock;
}

/**
 * SPARC test scenario
 *
 * @example
 */
interface SPARCTestScenario {
  /** SPARC phase */
  phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  /** Test input */
  input: string;
  /** Expected output */
  expectedOutput: string;
  /** Test context */
  context: Record<string, unknown>;
}

// Type declarations for global test utilities
declare global {
  /**
   * Neural test data configuration
   *
   * @example
   */
  interface NeuralTestConfig {
    /** Type of test data to generate */
    type: 'xor' | 'linear';
    /** Number of samples to generate */
    samples?: number;
    /** Noise level for linear data */
    noise?: number;
  }

  /**
   * Neural test data point
   *
   * @example
   */
  interface NeuralTestData {
    /** Input values */
    input: number[];
    /** Expected output values */
    output: number[];
  }

  namespace NodeJS {
    interface Global {
      // London TDD utilities
      createInteractionSpy(name: string): jest.Mock;
      createCoordinationMock<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;

      // Classical TDD utilities
      testStartTime: number;
      testStartMemory: NodeJS.MemoryUsage;
      lastTestMemoryDelta: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
      };
      generateNeuralTestData(config: NeuralTestConfig): NeuralTestData[];
      expectNearlyEqual(actual: number, expected: number, tolerance?: number): void;

      // Hybrid utilities
      testWithApproach(
        approach: 'london' | 'classical',
        testFn: () => void | Promise<void>
      ): void | Promise<void>;
      createMemoryTestScenario(type: 'sqlite' | 'lancedb' | 'json'): MemoryTestScenario;
      expectPerformanceWithinThreshold(
        operation: 'coordination' | 'neural' | 'memory',
        actualTime: number
      ): void;

      // DI testing utilities
      createTestContainer(): TestContainer;

      // SPARC testing utilities
      createSPARCTestScenario(
        phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion'
      ): SPARCTestScenario;

      // Global GC
      gc?: () => void;
    }
  }
}

export { HYBRID_CONFIG };
