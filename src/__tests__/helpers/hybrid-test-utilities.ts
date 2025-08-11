/**
 * Hybrid TDD Test Utilities
 *
 * @file Utilities that support both London and Classical TDD approaches
 */

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
  createDomainMocks(dependencies: string[]): Record<string, jest.Mock> {
    const approach = this.getRecommendedApproach();
    const mocks: Record<string, jest.Mock> = {};

    for (const dep of dependencies) {
      if (this.shouldMock(dep, approach)) {
        mocks[dep] = this.createMockForDependency(dep, approach);
      }
    }

    return mocks;
  }

  private shouldMock(
    dependency: string,
    approach: 'london' | 'classical',
  ): boolean {
    const alwaysMock = ['http', 'file', 'network', 'external'];
    const neverMock = ['math', 'pure', 'algorithm'];

    if (alwaysMock.some((type) => dependency.includes(type))) return true;
    if (neverMock.some((type) => dependency.includes(type))) return false;

    return approach === 'london';
  }

  private createMockForDependency(
    dependency: string,
    approach: 'london' | 'classical',
  ): jest.Mock {
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
    dependency: string,
  ): (...args: unknown[]) => any {
    const behaviors: Record<string, (...args: unknown[]) => any> = {
      database: () => ({ success: true, data: [] }),
      logger: () => undefined,
      validator: (_input: unknown) => ({ valid: true, errors: [] }),
      transformer: (data: unknown) => data,
      calculator: (a: number, b: number) => a + b,
    };

    const key = Object.keys(behaviors).find((k) => dependency.includes(k));
    return key ? behaviors[key] : () => ({ result: 'mock' });
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
    mock: jest.Mock,
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
        expect(mock).toHaveBeenCalledTimes(args[0]);
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
        interactions.forEach((interaction) => {
          expect(interaction).toHaveProperty('jsonrpc', '2.0');
          expect(interaction).toHaveProperty('id');
          expect(interaction).toHaveProperty('method');
        });
        break;
      case 'websocket':
        interactions.forEach((interaction) => {
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
    mock: jest.Mock,
    expectedPattern: 'broadcast' | 'request-response' | 'publish-subscribe',
  ) {
    const calls = mock.mock.calls;

    switch (expectedPattern) {
      case 'broadcast':
        expect(calls.some((call) => call[0]?.type === 'broadcast')).toBe(true);
        break;
      case 'request-response':
        expect(calls.some((call) => call[0]?.type === 'request')).toBe(true);
        break;
      case 'publish-subscribe':
        expect(calls.some((call) => call[0]?.type === 'publish')).toBe(true);
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
    tolerance: number = 1e-10,
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
    tolerance: number = 1e-6,
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
    input: any,
    output: any,
    transformationRules: Record<string, (input: unknown) => any>,
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
    state: any,
    invariants: Array<(state: unknown) => boolean>,
  ) {
    invariants.forEach((invariant, _index) => {
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
  config?: Partial<HybridTestConfig>,
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
      setup: () => jest.clearAllMocks(),
      test,
      assertions: () => {}, // Assertions within test
    });
    return this;
  }

  addClassicalScenario(name: string, test: () => Promise<void>) {
    this.scenarios.push({
      name,
      approach: 'classical',
      setup: () => jest.restoreAllMocks(),
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
