/**
 * Hybrid TDD Test Utilities
 *
 * @file Utilities that support both London and Classical TDD approaches
 */

import { vi, expect, type MockedFunction } from 'vitest';

export interface HybridTestConfig {
  approach: 'london' | 'classical' | 'hybrid';
  mockingStrategy: 'minimal' | 'moderate' | 'extensive';
  performanceThresholds: {
    execution: number;
    memory: number;
  };
  domainContext:
    | 'coordination'
    | 'neural'
    | 'interfaces'
    | 'database'
    | 'utils';
}

export class HybridTestUtility {
  private config: HybridTestConfig;

  constructor(config: HybridTestConfig) {
    this.config = config;
  }

  /**
   * Determines test approach based on domain context
   */
  getRecommendedApproach(): 'london' | 'classical' {
    const londonDomains = ['coordination', 'interfaces'];
    const classicalDomains = ['neural', 'database'];

    if (londonDomains.includes(this.config.domainContext)) {
      return 'london';
    }
    if (classicalDomains.includes(this.config.domainContext)) {
      return 'classical';
    }

    return this.config.approach === 'hybrid' ? 'london' : this.config.approach;
  }

  /**
   * Creates appropriate mocks based on domain and approach
   *
   * @param dependencies
   */
  createDomainMocks(dependencies: string[]): Record<string, any> {
    const approach = this.getRecommendedApproach();
    const mocks: Record<string, MockedFunction<any>> = {};

    for (const dep of dependencies) {
      if (this.shouldMock(dep, approach)) {
        mocks[dep] = this.createMockForDependency(dep, approach);
      }
    }

    return mocks;
  }

  private shouldMock(
    dependency: string,
    approach: 'london' | 'classical'
  ): boolean {
    const alwaysMock = ['http', 'file', 'network', 'external'];
    const neverMock = ['math', 'pure', 'algorithm'];

    if (alwaysMock.some((type) => dependency.includes(type))) return true;
    if (neverMock.some((type) => dependency.includes(type))) return false;

    return approach === 'london';
  }

  private createMockForDependency(
    dependency: string,
    approach: 'london' | 'classical'
  ): MockedFunction<any> {
    const mock = vi.fn();

    if (approach === 'london') {
      // London: Focus on interaction verification
      mock.mockName(`mock_${dependency}`);
      mock.mockImplementation((...args) => {
        return { called: true, args, timestamp: Date.now() };
      });
    } else {
      // Classical: Provide realistic behavior
      mock.mockImplementation(this.getRealisticBehavior(dependency));
    }

    return mock;
  }

  private getRealisticBehavior(
    dependency: string
  ): (...args: unknown[]) => any {
    const behaviors: Record<string, (...args: unknown[]) => any> = {
      database: () => ({ success: true, data: [] }),
      logger: () => undefined,
      validator: (_input: unknown) => ({ valid: true, errors: [] }),
      transformer: (data: unknown) => data,
      calculator: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return typeof a === 'number' && typeof b === 'number' ? a + b : 0;
      },
    };

    const key = Object.keys(behaviors).find((k) => dependency.includes(k));
    return key ? behaviors[key] : () => ({ result: 'mock' }) as any;
  }

  /**
   * Creates test assertions appropriate for the approach
   */
  createDomainAssertions() {
    const approach = this.getRecommendedApproach();

    if (approach === 'london') {
      return new LondonAssertions();
    }
    return new ClassicalAssertions();
  }

  /**
   * Validates test performance against domain thresholds
   *
   * @param metrics
   * @param metrics.execution
   * @param metrics.memory
   */
  validatePerformance(metrics: { execution: number; memory: number }): boolean {
    return (
      metrics.execution <= this.config.performanceThresholds.execution &&
      metrics.memory <= this.config.performanceThresholds.memory
    );
  }
}

export class LondonAssertions {
  /**
   * Verify interaction patterns
   *
   * @param mock
   * @param pattern
   * @param {...any} args
   */
  verifyInteractionPattern(
    mock: MockedFunction<any>,
    pattern: 'called' | 'not-called' | 'called-with' | 'called-times',
    ...args: unknown[]
  ) {
    switch (pattern) {
      case 'called':
        expect(mock).toHaveBeenCalled();
        break;
      case 'not-called':
        expect(mock).not.toHaveBeenCalled();
        break;
      case 'called-with':
        expect(mock).toHaveBeenCalledWith(...args);
        break;
      case 'called-times':
        expect(mock).toHaveBeenCalledTimes(args[0] as number);
        break;
    }
  }

  /**
   * Verify protocol compliance
   *
   * @param interactions
   * @param protocol
   */
  verifyProtocolCompliance(interactions: unknown[], protocol: string) {
    switch (protocol) {
      case 'mcp':
        interactions.forEach((interaction: any) => {
          expect(interaction).toHaveProperty('jsonrpc', '2.0');
          expect(interaction).toHaveProperty('id');
          expect(interaction).toHaveProperty('method');
        });
        break;
      case 'websocket':
        interactions.forEach((interaction: any) => {
          expect(interaction).toHaveProperty('type');
          expect(interaction).toHaveProperty('data');
        });
        break;
    }
  }

  /**
   * Verify coordination patterns
   *
   * @param mock
   * @param expectedPattern
   */
  verifyCoordinationPattern(
    mock: MockedFunction<any>,
    expectedPattern: 'broadcast' | 'request-response' | 'publish-subscribe'
  ) {
    const calls = mock.mock.calls;

    switch (expectedPattern) {
      case 'broadcast':
        expect(calls.some((call: any) => call[0]?.type === 'broadcast')).toBe(true);
        break;
      case 'request-response':
        expect(calls.some((call: any) => call[0]?.type === 'request')).toBe(true);
        break;
      case 'publish-subscribe':
        expect(calls.some((call: any) => call[0]?.type === 'publish')).toBe(true);
        break;
    }
  }
}

export class ClassicalAssertions {
  /**
   * Verify computational results
   *
   * @param actual
   * @param expected
   * @param tolerance
   */
  verifyComputation(
    actual: number | number[],
    expected: number | number[],
    tolerance: number = 1e-10
  ) {
    if (Array.isArray(actual) && Array.isArray(expected)) {
      expect(actual).toHaveLength(expected.length);
      actual.forEach((val, index) => {
        expect(Math.abs(val - expected[index])).toBeLessThanOrEqual(tolerance);
      });
    } else if (typeof actual === 'number' && typeof expected === 'number') {
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
    } else {
      throw new Error('Type mismatch in computation verification');
    }
  }

  /**
   * Verify algorithm convergence
   *
   * @param values
   * @param targetValue
   * @param tolerance
   */
  verifyConvergence(
    values: number[],
    targetValue: number,
    tolerance: number = 1e-6
  ) {
    const lastValue = values[values.length - 1];
    expect(Math.abs(lastValue - targetValue)).toBeLessThanOrEqual(tolerance);

    // Verify convergence trend
    const isConverging = values.slice(-5).every((val, index, arr) => {
      if (index === 0) return true;
      return (
        Math.abs(val - targetValue) <= Math.abs(arr[index - 1] - targetValue)
      );
    });

    expect(isConverging).toBe(true);
  }

  /**
   * Verify data transformation correctness
   *
   * @param input
   * @param output
   * @param transformationRules
   */
  verifyTransformation(
    input: unknown,
    output: unknown,
    transformationRules: Record<string, (input: unknown) => any>
  ) {
    for (const [_rule, transform] of Object.entries(transformationRules)) {
      const expected = transform(input);
      expect(output).toMatchObject(expected);
    }
  }

  /**
   * Verify state consistency
   *
   * @param state
   * @param invariants
   */
  verifyStateConsistency(
    state: unknown,
    invariants: Array<(state: unknown) => boolean>
  ) {
    invariants.forEach((invariant) => {
      expect(invariant(state)).toBe(true);
    });
  }
}

/**
 * Factory functions for hybrid testing
 *
 * @param domain
 * @param config
 */
export function createHybridTestSetup(
  domain: string,
  config?: Partial<HybridTestConfig>
): HybridTestUtility {
  const defaultConfig: HybridTestConfig = {
    approach: 'hybrid',
    mockingStrategy: 'moderate',
    performanceThresholds: {
      execution: 1000, // ms
      memory: 10, // MB
    },
    domainContext: domain as any,
  };

  return new HybridTestUtility({ ...defaultConfig, ...config });
}

export function createCoordinationTestSetup(): HybridTestUtility {
  return createHybridTestSetup('coordination', {
    approach: 'london',
    mockingStrategy: 'extensive',
    performanceThresholds: {
      execution: 500,
      memory: 5,
    },
  });
}

export function createNeuralTestSetup(): HybridTestUtility {
  return createHybridTestSetup('neural', {
    approach: 'classical',
    mockingStrategy: 'minimal',
    performanceThresholds: {
      execution: 2000,
      memory: 50,
    },
  });
}

export function createInterfaceTestSetup(): HybridTestUtility {
  return createHybridTestSetup('interfaces', {
    approach: 'london',
    mockingStrategy: 'extensive',
    performanceThresholds: {
      execution: 300,
      memory: 3,
    },
  });
}

/**
 * Test scenario builders
 *
 * @example
 */
export class TestScenarioBuilder {
  private scenarios: Array<{
    name: string;
    approach: 'london' | 'classical';
    setup: () => void;
    test: () => Promise<void>;
    assertions: () => void;
  }> = [];

  addLondonScenario(name: string, test: () => Promise<void>) {
    this.scenarios.push({
      name,
      approach: 'london',
      setup: () => vi.clearAllMocks(),
      test,
      assertions: () => {}, // Assertions within test
    });
    return this;
  }

  addClassicalScenario(name: string, test: () => Promise<void>) {
    this.scenarios.push({
      name,
      approach: 'classical',
      setup: () => vi.restoreAllMocks(),
      test,
      assertions: () => {}, // Assertions within test
    });
    return this;
  }

  build() {
    return this.scenarios;
  }
}

export function createTestScenarios(): TestScenarioBuilder {
  return new TestScenarioBuilder();
}

/**
 * Advanced test utilities for complex scenarios
 */
export class AdvancedTestUtilities {
  private testData: Map<string, any> = new Map();
  private cleanupTasks: Array<() => Promise<void> | void> = [];

  /**
   * Store test data for later retrieval
   */
  storeTestData(key: string, data: any): void {
    this.testData.set(key, data);
  }

  /**
   * Retrieve stored test data
   */
  getTestData<T = any>(key: string): T | undefined {
    return this.testData.get(key);
  }

  /**
   * Register cleanup task
   */
  registerCleanup(task: () => Promise<void> | void): void {
    this.cleanupTasks.push(task);
  }

  /**
   * Execute all cleanup tasks
   */
  async executeCleanup(): Promise<void> {
    for (const task of this.cleanupTasks) {
      try {
        await task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    }
    this.cleanupTasks.length = 0;
    this.testData.clear();
  }

  /**
   * Create mock with enhanced capabilities
   */
  createEnhancedMock<T extends (...args: any[]) => any>(
    name: string,
    defaultReturn?: ReturnType<T>
  ): MockedFunction<T> {
    const mock = vi.fn() as MockedFunction<T>;
    mock.mockName(name);
    
    if (defaultReturn !== undefined) {
      mock.mockReturnValue(defaultReturn);
    }

    // Register for automatic cleanup
    this.registerCleanup(() => {
      mock.mockClear();
    });

    return mock;
  }

  /**
   * Create async mock with controllable timing
   */
  createAsyncMock<T = any>(
    resolveValue?: T,
    delay: number = 0
  ): MockedFunction<() => Promise<T>> {
    const mock = vi.fn().mockImplementation(async () => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return resolveValue;
    });

    this.registerCleanup(() => {
      mock.mockClear();
    });

    return mock;
  }

  /**
   * Create mock that throws after N calls
   */
  createFailingMock<T = any>(
    failAfter: number,
    error: Error | string = 'Mock failure'
  ): MockedFunction<() => T> {
    let callCount = 0;
    const mock = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount > failAfter) {
        throw typeof error === 'string' ? new Error(error) : error;
      }
      return undefined;
    });

    this.registerCleanup(() => {
      mock.mockClear();
      callCount = 0;
    });

    return mock;
  }

  /**
   * Create performance monitoring utilities
   */
  createPerformanceMonitor() {
    const metrics: Array<{name: string; duration: number; timestamp: number}> = [];
    
    return {
      time: async <T>(name: string, operation: () => Promise<T> | T): Promise<T> => {
        const start = performance.now();
        try {
          const result = await operation();
          const duration = performance.now() - start;
          metrics.push({ name, duration, timestamp: Date.now() });
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          metrics.push({ name: `${name} (failed)`, duration, timestamp: Date.now() });
          throw error;
        }
      },
      
      getMetrics: () => [...metrics],
      
      clearMetrics: () => {
        metrics.length = 0;
      },
      
      getAverageTime: (name: string) => {
        const matching = metrics.filter(m => m.name === name);
        return matching.length > 0 
          ? matching.reduce((sum, m) => sum + m.duration, 0) / matching.length
          : 0;
      }
    };
  }
}

/**
 * Factory for advanced test utilities
 */
export function createAdvancedTestUtilities(): AdvancedTestUtilities {
  return new AdvancedTestUtilities();
}

/**
 * Domain-specific test builders
 */
export class DomainTestBuilder {
  private domain: string;
  private utils: AdvancedTestUtilities;

  constructor(domain: string) {
    this.domain = domain;
    this.utils = new AdvancedTestUtilities();
  }

  /**
   * Create domain-specific mock based on common patterns
   */
  createDomainSpecificMock(type: string): MockedFunction<any> {
    const domainPatterns: Record<string, Record<string, any>> = {
      coordination: {
        agent: () => ({ id: 'test-agent', status: 'active' }),
        swarm: () => ({ agents: [], topology: 'mesh' }),
        message: () => ({ type: 'test', data: {} }),
      },
      neural: {
        network: () => ({ layers: [], weights: [] }),
        activation: (x: number) => Math.max(0, x), // ReLU
        optimizer: () => ({ learningRate: 0.001 }),
      },
      database: {
        query: () => ({ rows: [], count: 0 }),
        transaction: () => ({ commit: vi.fn(), rollback: vi.fn() }),
        connection: () => ({ connected: true }),
      },
      memory: {
        store: () => ({ size: 0, items: [] }),
        cache: () => ({ hit: false, value: null }),
        index: () => ({ entries: [], lastUpdate: Date.now() }),
      }
    };

    const pattern = domainPatterns[this.domain]?.[type];
    return this.utils.createEnhancedMock(
      `${this.domain}-${type}`,
      pattern ? pattern() : undefined
    );
  }

  /**
   * Setup domain-specific test environment
   */
  setupDomainEnvironment(): Record<string, any> {
    const environments: Record<string, any> = {
      coordination: {
        agents: new Map(),
        messageQueue: [],
        topology: 'mesh',
      },
      neural: {
        activationCache: new Map(),
        gradientHistory: [],
        modelWeights: {},
      },
      database: {
        connections: new Map(),
        transactionLog: [],
        queryCache: new Map(),
      },
      memory: {
        storage: new Map(),
        indices: new Map(),
        accessLog: [],
      }
    };

    const env = environments[this.domain] || {};
    
    // Register cleanup for the environment
    this.utils.registerCleanup(() => {
      Object.keys(env).forEach(key => {
        if (env[key] instanceof Map) {
          env[key].clear();
        } else if (Array.isArray(env[key])) {
          env[key].length = 0;
        }
      });
    });

    return env;
  }

  /**
   * Get utilities instance for manual cleanup
   */
  getUtils(): AdvancedTestUtilities {
    return this.utils;
  }
}

/**
 * Create domain-specific test builder
 */
export function createDomainTestBuilder(domain: string): DomainTestBuilder {
  return new DomainTestBuilder(domain);
}
