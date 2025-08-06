/**
 * Assertion Helpers - Enhanced Testing Assertions
 *
 * Custom assertions for both London and Classical TDD approaches
 */

import { expect } from '@jest/globals';
import type { AssertionOptions, PerformanceMetrics } from './types';

export class AssertionHelpers {
  private options: AssertionOptions;

  constructor(options: AssertionOptions = {}) {
    this.options = {
      precision: 2,
      tolerance: 0.05,
      messages: {},
      retry: {
        attempts: 3,
        delay: 100,
        backoff: 'linear',
      },
      ...options,
    };
  }

  /**
   * Assert that a value is approximately equal (for floating point comparisons)
   *
   * @param actual
   * @param expected
   * @param precision
   */
  toBeApproximately(actual: number, expected: number, precision?: number): void {
    const actualPrecision = precision ?? this.options.precision!;
    const _message =
      this.options.messages?.approximately ||
      `Expected ${actual} to be approximately ${expected} within ${actualPrecision} decimal places`;

    expect(actual).toBeCloseTo(expected, actualPrecision);
  }

  /**
   * Assert performance characteristics
   *
   * @param metrics
   * @param thresholds
   */
  toMeetPerformanceThreshold(
    metrics: PerformanceMetrics,
    thresholds: Partial<PerformanceMetrics>
  ): void {
    if (thresholds.executionTime !== undefined) {
      const _message = `Execution time ${metrics.executionTime}ms exceeded threshold ${thresholds.executionTime}ms`;
      expect(metrics.executionTime).toBeLessThanOrEqual(thresholds.executionTime);
    }

    if (thresholds.memoryUsage?.heap !== undefined) {
      const _message = `Heap usage ${metrics.memoryUsage.heap} exceeded threshold ${thresholds.memoryUsage.heap}`;
      expect(metrics.memoryUsage.heap).toBeLessThanOrEqual(thresholds.memoryUsage.heap);
    }

    if (thresholds.memoryUsage?.total !== undefined) {
      const _message = `Total memory ${metrics.memoryUsage.total} exceeded threshold ${thresholds.memoryUsage.total}`;
      expect(metrics.memoryUsage.total).toBeLessThanOrEqual(thresholds.memoryUsage.total);
    }

    if (thresholds.throughput !== undefined) {
      const _message = `Throughput ${metrics.throughput} below threshold ${thresholds.throughput}`;
      expect(metrics.throughput).toBeGreaterThanOrEqual(thresholds.throughput);
    }
  }

  /**
   * Assert that a promise resolves within a time limit
   *
   * @param promise
   * @param timeoutMs
   */
  async toResolveWithin<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Promise did not resolve within ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Assert that a function eventually becomes true (with retries)
   *
   * @param predicate
   * @param options
   * @param options.timeout
   * @param options.interval
   */
  async toEventuallyBeTrue(
    predicate: () => boolean | Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> {
    const timeout = options.timeout || 5000;
    const interval = options.interval || 100;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await predicate();
        if (result) {
          return;
        }
      } catch (_error) {
        // Continue trying
      }

      await this.sleep(interval);
    }

    throw new Error(`Predicate did not become true within ${timeout}ms`);
  }

  /**
   * Assert array contains elements in any order
   *
   * @param actual
   * @param expected
   */
  toContainElementsInAnyOrder<T>(actual: T[], expected: T[]): void {
    expect(actual).toHaveLength(expected.length);

    for (const element of expected) {
      expect(actual).toContain(element);
    }
  }

  /**
   * Assert deep equality with custom comparison
   *
   * @param actual
   * @param expected
   * @param customComparator
   */
  toDeepEqualWith<T>(
    actual: T,
    expected: T,
    customComparator?: (a: any, b: any, path: string) => boolean
  ): void {
    if (customComparator) {
      const isEqual = this.deepEqualWithCustom(actual, expected, customComparator);
      expect(isEqual).toBe(true);
    } else {
      expect(actual).toEqual(expected);
    }
  }

  /**
   * Assert that an object matches a partial structure
   *
   * @param actual
   * @param expected
   */
  toMatchPartialStructure<T>(actual: T, expected: Partial<T>): void {
    expect(actual).toMatchObject(expected);
  }

  /**
   * Assert that a string matches a pattern (with custom error message)
   *
   * @param actual
   * @param pattern
   * @param customMessage
   */
  toMatchPattern(actual: string, pattern: RegExp, customMessage?: string): void {
    const _message = customMessage || `Expected "${actual}" to match pattern ${pattern}`;
    expect(actual).toMatch(pattern);
  }

  /**
   * Assert that an error has specific properties
   *
   * @param actual
   * @param expectedProperties
   * @param expectedProperties.message
   * @param expectedProperties.code
   * @param expectedProperties.type
   */
  toBeErrorWithProperties(
    actual: Error,
    expectedProperties: { message?: string; code?: string | number; type?: string }
  ): void {
    expect(actual).toBeInstanceOf(Error);

    if (expectedProperties.message) {
      expect(actual.message).toBe(expectedProperties.message);
    }

    if (expectedProperties.code) {
      expect((actual as any).code).toBe(expectedProperties.code);
    }

    if (expectedProperties.type) {
      expect(actual.constructor.name).toBe(expectedProperties.type);
    }
  }

  /**
   * Assert that an async operation throws with specific error
   *
   * @param operation
   * @param expectedError
   */
  async toThrowAsyncError<T>(
    operation: () => Promise<T>,
    expectedError?: string | RegExp | Error
  ): Promise<void> {
    try {
      await operation();
      throw new Error('Expected operation to throw, but it succeeded');
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string') {
          expect((error as Error).message).toBe(expectedError);
        } else if (expectedError instanceof RegExp) {
          expect((error as Error).message).toMatch(expectedError);
        } else if (expectedError instanceof Error) {
          expect(error).toEqual(expectedError);
        }
      }
    }
  }

  /**
   * Assert HTTP response characteristics
   *
   * @param response
   * @param expectedStatus
   * @param expectedHeaders
   */
  toBeHttpResponse(
    response: any,
    expectedStatus: number,
    expectedHeaders?: Record<string, string>
  ): void {
    expect(response.status).toBe(expectedStatus);

    if (expectedHeaders) {
      Object.entries(expectedHeaders).forEach(([header, value]) => {
        expect(response.headers[header.toLowerCase()]).toBe(value);
      });
    }
  }

  /**
   * Assert neural network training convergence
   *
   * @param trainingResults
   * @param targetError
   * @param maxEpochs
   */
  toConvergeToTarget(
    trainingResults: { epoch: number; error: number }[],
    targetError: number,
    maxEpochs?: number
  ): void {
    const finalResult = trainingResults[trainingResults.length - 1];

    if (maxEpochs) {
      expect(finalResult.epoch).toBeLessThanOrEqual(maxEpochs);
    }

    expect(finalResult.error).toBeLessThan(targetError);

    // Check that error generally decreases over time
    const errorReductions = trainingResults
      .slice(1)
      .filter((result, index) => result.error < trainingResults[index].error);

    const reductionRatio = errorReductions.length / (trainingResults.length - 1);
    expect(reductionRatio).toBeGreaterThan(0.7); // 70% of epochs should show improvement
  }

  /**
   * Assert swarm coordination patterns
   *
   * @param swarmMetrics
   * @param expectedPatterns
   * @param expectedPatterns.agentCount
   * @param expectedPatterns.topology
   * @param expectedPatterns.efficiency
   * @param expectedPatterns.completion
   */
  toHaveSwarmCoordination(
    swarmMetrics: any,
    expectedPatterns: {
      agentCount?: number;
      topology?: string;
      efficiency?: number;
      completion?: number;
    }
  ): void {
    if (expectedPatterns.agentCount !== undefined) {
      expect(swarmMetrics.activeAgents).toBe(expectedPatterns.agentCount);
    }

    if (expectedPatterns.topology) {
      expect(swarmMetrics.topology).toBe(expectedPatterns.topology);
    }

    if (expectedPatterns.efficiency !== undefined) {
      expect(swarmMetrics.efficiency).toBeGreaterThanOrEqual(expectedPatterns.efficiency);
    }

    if (expectedPatterns.completion !== undefined) {
      expect(swarmMetrics.completionRate).toBeGreaterThanOrEqual(expectedPatterns.completion);
    }
  }

  /**
   * London School: Assert interaction sequence
   *
   * @param mock
   * @param expectedSequence
   */
  toHaveInteractionSequence(mock: any, expectedSequence: { method: string; args?: any[] }[]): void {
    const interactions = mock.__interactions || [];

    expect(interactions).toHaveLength(expectedSequence.length);

    expectedSequence.forEach((expected, index) => {
      const interaction = interactions[index];
      expect(interaction.method).toBe(expected.method);

      if (expected.args) {
        expect(interaction.args).toEqual(expected.args);
      }
    });
  }

  /**
   * Classical School: Assert mathematical properties
   *
   * @param values
   * @param property
   */
  toSatisfyMathematicalProperty(
    values: number[],
    property: 'monotonic-increasing' | 'monotonic-decreasing' | 'convex' | 'concave'
  ): void {
    switch (property) {
      case 'monotonic-increasing':
        for (let i = 1; i < values.length; i++) {
          expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
        }
        break;

      case 'monotonic-decreasing':
        for (let i = 1; i < values.length; i++) {
          expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
        }
        break;

      case 'convex':
        // Check second derivative > 0 (simplified)
        for (let i = 2; i < values.length; i++) {
          const secondDerivative = values[i] - 2 * values[i - 1] + values[i - 2];
          expect(secondDerivative).toBeGreaterThanOrEqual(0);
        }
        break;

      case 'concave':
        // Check second derivative < 0 (simplified)
        for (let i = 2; i < values.length; i++) {
          const secondDerivative = values[i] - 2 * values[i - 1] + values[i - 2];
          expect(secondDerivative).toBeLessThanOrEqual(0);
        }
        break;
    }
  }

  private deepEqualWithCustom(
    a: any,
    b: any,
    customComparator: (a: any, b: any, path: string) => boolean,
    path: string = ''
  ): boolean {
    if (customComparator(a, b, path)) {
      return true;
    }

    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqualWithCustom(a[key], b[key], customComparator, `${path}.${key}`)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Global assertion helpers instance
export const assertionHelpers = new AssertionHelpers();

// Convenience functions for common assertions
export function expectApproximately(actual: number, expected: number, precision?: number): void {
  assertionHelpers.toBeApproximately(actual, expected, precision);
}

export function expectPerformance(
  metrics: PerformanceMetrics,
  thresholds: Partial<PerformanceMetrics>
): void {
  assertionHelpers.toMeetPerformanceThreshold(metrics, thresholds);
}

export async function expectEventually(
  predicate: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  return assertionHelpers.toEventuallyBeTrue(predicate, options);
}

export function expectInteractionSequence(
  mock: any,
  sequence: { method: string; args?: any[] }[]
): void {
  assertionHelpers.toHaveInteractionSequence(mock, sequence);
}
