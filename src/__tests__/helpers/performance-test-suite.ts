/**
 * Performance Test Suite
 *
 * @file Comprehensive performance testing utilities for both London and Classical TDD
 */

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  operations: {
    total: number;
    successful: number;
    failed: number;
    opsPerSecond: number;
  };
  latency: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface PerformanceThresholds {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  minOpsPerSecond: number;
  maxLatencyP99: number;
  maxErrorRate: number;
}

export class PerformanceProfiler {
  private startTime: number = 0;
  private endTime: number = 0;
  private startMemory: NodeJS.MemoryUsage | null = null;
  private endMemory: NodeJS.MemoryUsage | null = null;
  private startCpu: NodeJS.CpuUsage | null = null;
  private endCpu: NodeJS.CpuUsage | null = null;
  private operations: Array<{ success: boolean; duration: number }> = [];
  private latencies: number[] = [];

  /**
   * Start performance measurement
   */
  start(): void {
    if (global.gc) {
      global.gc();
    }

    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
    this.startCpu = process.cpuUsage();
    this.operations = [];
    this.latencies = [];
  }

  /**
   * Record an operation
   *
   * @param success
   * @param duration
   */
  recordOperation(success: boolean, duration: number): void {
    this.operations.push({ success, duration });
    this.latencies.push(duration);
  }

  /**
   * Stop performance measurement and return metrics
   */
  stop(): PerformanceMetrics {
    this.endTime = performance.now();

    if (global.gc) {
      global.gc();
    }

    this.endMemory = process.memoryUsage();
    this.endCpu = process.cpuUsage(this.startCpu || undefined);

    return this.calculateMetrics();
  }

  private calculateMetrics(): PerformanceMetrics {
    const executionTime = this.endTime - this.startTime;
    const successful = this.operations.filter((op) => op.success).length;
    const failed = this.operations.length - successful;
    const opsPerSecond = this.operations.length / (executionTime / 1000);

    // Calculate latency percentiles
    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const latency = {
      min: sortedLatencies.length > 0 ? sortedLatencies[0] : 0,
      max: sortedLatencies.length > 0 ? sortedLatencies[sortedLatencies.length - 1] : 0,
      avg:
        sortedLatencies.length > 0
          ? sortedLatencies.reduce((sum, lat) => sum + lat, 0) / sortedLatencies.length
          : 0,
      p50: this.percentile(sortedLatencies, 50),
      p95: this.percentile(sortedLatencies, 95),
      p99: this.percentile(sortedLatencies, 99),
    };

    return {
      executionTime,
      memoryUsage: {
        heapUsed: (this.endMemory?.heapUsed || 0) - (this.startMemory?.heapUsed || 0),
        heapTotal: (this.endMemory?.heapTotal || 0) - (this.startMemory?.heapTotal || 0),
        rss: (this.endMemory?.rss || 0) - (this.startMemory?.rss || 0),
        external: (this.endMemory?.external || 0) - (this.startMemory?.external || 0),
      },
      cpuUsage: {
        user: this.endCpu?.user || 0,
        system: this.endCpu?.system || 0,
      },
      operations: {
        total: this.operations.length,
        successful,
        failed,
        opsPerSecond,
      },
      latency,
    };
  }

  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedArray[lower];
    }

    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }
}

export class LoadTestRunner {
  /**
   * Run load test with specified configuration
   *
   * @param testFunction
   * @param config
   * @param config.duration
   * @param config.concurrency
   * @param config.rampUpTime
   * @param config.targetRPS
   */
  static async runLoadTest(
    testFunction: () => Promise<void>,
    config: {
      duration: number; // milliseconds
      concurrency: number;
      rampUpTime?: number;
      targetRPS?: number;
    }
  ): Promise<PerformanceMetrics> {
    const profiler = new PerformanceProfiler();
    profiler.start();

    const promises: Promise<void>[] = [];
    const rampUpTime = config.rampUpTime || 0;
    const rampUpDelay = rampUpTime / config.concurrency;

    for (let i = 0; i < config.concurrency; i++) {
      const startDelay = i * rampUpDelay;

      const workerPromise = LoadTestRunner.runWorker(
        testFunction,
        config.duration - startDelay,
        startDelay,
        config.targetRPS,
        profiler
      );

      promises.push(workerPromise);
    }

    await Promise.all(promises);
    return profiler.stop();
  }

  private static async runWorker(
    testFunction: () => Promise<void>,
    duration: number,
    startDelay: number,
    targetRPS?: number,
    profiler?: PerformanceProfiler
  ): Promise<void> {
    if (startDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, startDelay));
    }

    const startTime = Date.now();
    const endTime = startTime + duration;
    const targetInterval = targetRPS ? 1000 / targetRPS : 0;

    while (Date.now() < endTime) {
      const operationStart = performance.now();

      try {
        await testFunction();
        const operationEnd = performance.now();
        const operationDuration = operationEnd - operationStart;

        profiler?.recordOperation(true, operationDuration);

        if (targetInterval > 0) {
          const sleepTime = Math.max(0, targetInterval - operationDuration);
          if (sleepTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, sleepTime));
          }
        }
      } catch (_error) {
        const operationEnd = performance.now();
        const operationDuration = operationEnd - operationStart;
        profiler?.recordOperation(false, operationDuration);
      }
    }
  }
}

export class PerformanceValidator {
  /**
   * Validate performance metrics against thresholds
   *
   * @param metrics
   * @param thresholds
   */
  static validateMetrics(
    metrics: PerformanceMetrics,
    thresholds: PerformanceThresholds
  ): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    if (metrics.executionTime > thresholds.maxExecutionTime) {
      violations.push(
        `Execution time ${metrics.executionTime}ms exceeds threshold ${thresholds.maxExecutionTime}ms`
      );
    }

    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > thresholds.maxMemoryUsage) {
      violations.push(
        `Memory usage ${memoryUsageMB.toFixed(2)}MB exceeds threshold ${thresholds.maxMemoryUsage}MB`
      );
    }

    if (metrics.operations.opsPerSecond < thresholds.minOpsPerSecond) {
      violations.push(
        `Operations per second ${metrics.operations.opsPerSecond.toFixed(2)} below threshold ${thresholds.minOpsPerSecond}`
      );
    }

    if (metrics.latency.p99 > thresholds.maxLatencyP99) {
      violations.push(
        `P99 latency ${metrics.latency.p99.toFixed(2)}ms exceeds threshold ${thresholds.maxLatencyP99}ms`
      );
    }

    const errorRate =
      metrics.operations.total > 0 ? metrics.operations.failed / metrics.operations.total : 0;
    if (errorRate > thresholds.maxErrorRate) {
      violations.push(
        `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(thresholds.maxErrorRate * 100).toFixed(2)}%`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate performance report
   *
   * @param metrics
   * @param testName
   */
  static generateReport(metrics: PerformanceMetrics, testName: string): string {
    return `
Performance Report: ${testName}
=================================

Execution Metrics:
- Total execution time: ${metrics.executionTime.toFixed(2)}ms
- Operations: ${metrics.operations.total} (${metrics.operations.successful} successful, ${metrics.operations.failed} failed)
- Operations per second: ${metrics.operations.opsPerSecond.toFixed(2)}
- Error rate: ${((metrics.operations.failed / metrics.operations.total) * 100).toFixed(2)}%

Latency Metrics:
- Min: ${metrics.latency.min.toFixed(2)}ms
- Max: ${metrics.latency.max.toFixed(2)}ms
- Average: ${metrics.latency.avg.toFixed(2)}ms
- P50: ${metrics.latency.p50.toFixed(2)}ms
- P95: ${metrics.latency.p95.toFixed(2)}ms
- P99: ${metrics.latency.p99.toFixed(2)}ms

Memory Metrics:
- Heap used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB
- Heap total: ${(metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB
- RSS: ${(metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB

CPU Metrics:
- User CPU time: ${(metrics.cpuUsage.user / 1000).toFixed(2)}ms
- System CPU time: ${(metrics.cpuUsage.system / 1000).toFixed(2)}ms
`;
  }
}

export class BenchmarkSuite {
  private benchmarks: Map<string, () => Promise<void>> = new Map();
  private results: Map<string, PerformanceMetrics> = new Map();

  /**
   * Add a benchmark test
   *
   * @param name
   * @param testFunction
   */
  addBenchmark(name: string, testFunction: () => Promise<void>): this {
    this.benchmarks.set(name, testFunction);
    return this;
  }

  /**
   * Run all benchmarks
   */
  async runAll(): Promise<Map<string, PerformanceMetrics>> {
    for (const [name, testFunction] of this.benchmarks) {
      const profiler = new PerformanceProfiler();
      profiler.start();

      const operationStart = performance.now();
      try {
        await testFunction();
        const operationEnd = performance.now();
        profiler.recordOperation(true, operationEnd - operationStart);
      } catch (error) {
        const operationEnd = performance.now();
        profiler.recordOperation(false, operationEnd - operationStart);
        console.error(`Benchmark ${name} failed:`, error);
      }

      const metrics = profiler.stop();
      this.results.set(name, metrics);
    }

    return new Map(this.results);
  }

  /**
   * Compare benchmark results
   *
   * @param baselineName
   * @param testName
   */
  compare(
    baselineName: string,
    testName: string
  ): {
    executionTimeDiff: number;
    memoryDiff: number;
    opsDiff: number;
    report: string;
  } {
    const baseline = this.results.get(baselineName);
    const test = this.results.get(testName);

    if (!baseline || !test) {
      throw new Error('Benchmark results not found for comparison');
    }

    const executionTimeDiff =
      ((test.executionTime - baseline.executionTime) / baseline.executionTime) * 100;
    const memoryDiff =
      ((test.memoryUsage.heapUsed - baseline.memoryUsage.heapUsed) /
        baseline.memoryUsage.heapUsed) *
      100;
    const opsDiff =
      ((test.operations.opsPerSecond - baseline.operations.opsPerSecond) /
        baseline.operations.opsPerSecond) *
      100;

    const report = `
Benchmark Comparison: ${testName} vs ${baselineName}
================================================

Execution Time: ${executionTimeDiff > 0 ? '+' : ''}${executionTimeDiff.toFixed(2)}% (${test.executionTime.toFixed(2)}ms vs ${baseline.executionTime.toFixed(2)}ms)
Memory Usage: ${memoryDiff > 0 ? '+' : ''}${memoryDiff.toFixed(2)}% (${(test.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB vs ${(baseline.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB)
Operations/sec: ${opsDiff > 0 ? '+' : ''}${opsDiff.toFixed(2)}% (${test.operations.opsPerSecond.toFixed(2)} vs ${baseline.operations.opsPerSecond.toFixed(2)})

${executionTimeDiff < -5 ? '✅ Performance improved' : executionTimeDiff > 5 ? '❌ Performance degraded' : '➖ Performance unchanged'}
`;

    return {
      executionTimeDiff,
      memoryDiff,
      opsDiff,
      report,
    };
  }

  /**
   * Get results for a specific benchmark
   *
   * @param name
   */
  getResults(name: string): PerformanceMetrics | undefined {
    return this.results.get(name);
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results.clear();
  }
}

/**
 * Domain-specific performance test factories
 *
 * @example
 */
export class DomainPerformanceTests {
  /**
   * Create coordination performance test
   */
  static createCoordinationPerformanceTest() {
    return {
      thresholds: {
        maxExecutionTime: 1000, // 1 second
        maxMemoryUsage: 10, // 10MB
        minOpsPerSecond: 100,
        maxLatencyP99: 100, // 100ms
        maxErrorRate: 0.01, // 1%
      },
      loadTestConfig: {
        duration: 5000, // 5 seconds
        concurrency: 10,
        rampUpTime: 1000,
        targetRPS: 50,
      },
    };
  }

  /**
   * Create neural network performance test
   */
  static createNeuralPerformanceTest() {
    return {
      thresholds: {
        maxExecutionTime: 30000, // 30 seconds for training
        maxMemoryUsage: 100, // 100MB
        minOpsPerSecond: 10,
        maxLatencyP99: 1000, // 1 second
        maxErrorRate: 0.05, // 5%
      },
      loadTestConfig: {
        duration: 10000, // 10 seconds
        concurrency: 2, // Lower concurrency for compute-intensive tasks
        rampUpTime: 2000,
        targetRPS: 5,
      },
    };
  }

  /**
   * Create interface performance test
   */
  static createInterfacePerformanceTest() {
    return {
      thresholds: {
        maxExecutionTime: 300, // 300ms
        maxMemoryUsage: 5, // 5MB
        minOpsPerSecond: 200,
        maxLatencyP99: 50, // 50ms
        maxErrorRate: 0.001, // 0.1%
      },
      loadTestConfig: {
        duration: 3000, // 3 seconds
        concurrency: 20,
        rampUpTime: 500,
        targetRPS: 100,
      },
    };
  }

  /**
   * Create database performance test
   */
  static createDatabasePerformanceTest() {
    return {
      thresholds: {
        maxExecutionTime: 2000, // 2 seconds
        maxMemoryUsage: 20, // 20MB
        minOpsPerSecond: 50,
        maxLatencyP99: 200, // 200ms
        maxErrorRate: 0.02, // 2%
      },
      loadTestConfig: {
        duration: 5000, // 5 seconds
        concurrency: 5,
        rampUpTime: 1000,
        targetRPS: 25,
      },
    };
  }
}

/**
 * Factory functions
 */
export function createPerformanceProfiler(): PerformanceProfiler {
  return new PerformanceProfiler();
}

export function createBenchmarkSuite(): BenchmarkSuite {
  return new BenchmarkSuite();
}

export function createLoadTester() {
  return LoadTestRunner;
}

export function createPerformanceValidator() {
  return PerformanceValidator;
}
