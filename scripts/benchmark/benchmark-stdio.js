/**
 * @fileoverview Performance benchmark for MCP stdio optimizations
 * Compares performance before and after optimizations
 */

import { MCPErrorHandler } from './src/mcp/core/error-handler.js';
import { PerformanceMetrics } from './src/mcp/core/performance-metrics.js';
import { StdioOptimizer } from './src/mcp/core/stdio-optimizer.js';

/**
 * Benchmark stdio optimization performance
 */
class StdioBenchmark {
  constructor() {
    this.results = {
      baseline: {},
      optimized: {},
    };
  }

  /**
   * Run complete benchmark suite
   */
  async runBenchmark() {
    console.warn('🚀 MCP Stdio Optimization Benchmark\n');

    // Baseline performance (simulated single message processing)
    console.warn('📊 Running baseline performance test...');
    this.results.baseline = await this.runBaselineTest();

    // Optimized performance (with batching and error handling)
    console.warn('📊 Running optimized performance test...');
    this.results.optimized = await this.runOptimizedTest();

    // Display results
    this.displayResults();
  }

  /**
   * Simulate baseline (non-optimized) message processing
   */
  async runBaselineTest() {
    const messageCount = 1000;
    const messages = this.generateTestMessages(messageCount);

    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    // Simulate individual message processing (no batching)
    for (const _message of messages) {
      try {
        // Simulate processing time
        await this.delay(Math.random() * 2);

        // Simulate 5% error rate
        if (Math.random() < 0.05) {
          throw new Error('Simulated processing error');
        }

        processedCount++;
      } catch (_error) {
        errorCount++;
        // No retry logic in baseline
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    return {
      messageCount,
      processedCount,
      errorCount,
      totalTime,
      throughput: (processedCount / totalTime) * 1000, // messages per second
      errorRate: errorCount / messageCount,
      avgLatency: totalTime / messageCount,
    };
  }

  /**
   * Test optimized message processing with batching and error handling
   */
  async runOptimizedTest() {
    const messageCount = 1000;
    const messages = this.generateTestMessages(messageCount);

    // Initialize optimized components
    const stdioOptimizer = new StdioOptimizer({
      batchSize: 20,
      batchTimeout: 30,
      retryAttempts: 2,
    });

    const errorHandler = new MCPErrorHandler({
      maxRetries: 2,
      retryDelay: 10,
    });

    const performanceMetrics = new PerformanceMetrics({
      enableLogging: false,
    });

    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;
    let batchCount = 0;

    // Setup batch processing
    stdioOptimizer.on('batch', async (batch) => {
      batchCount++;

      for (const item of batch) {
        const requestId = `req-${item.message.id}`;
        performanceMetrics.recordRequestStart(requestId);

        try {
          // Use error handler with retry logic
          await errorHandler.executeWithRetry(async () => {
            // Simulate processing time
            await this.delay(Math.random() * 2);

            // Simulate 5% error rate (same as baseline)
            if (Math.random() < 0.05) {
              throw new Error('Simulated processing error');
            }

            return { success: true };
          });

          processedCount++;
          performanceMetrics.recordRequestEnd(requestId, true);
        } catch (error) {
          errorCount++;
          performanceMetrics.recordRequestEnd(requestId, false, { error });
        }
      }
    });

    // Process messages in batches
    const batches = this.createBatches(messages, 20);
    for (const batch of batches) {
      stdioOptimizer.queueMessages(batch);
      // Small delay to allow batch processing
      await this.delay(5);
    }

    // Wait for any remaining processing
    await this.delay(100);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Get detailed metrics
    const metrics = performanceMetrics.getMetrics();
    const errorStats = errorHandler.getErrorStats();

    return {
      messageCount,
      processedCount,
      errorCount,
      batchCount,
      totalTime,
      throughput: (processedCount / totalTime) * 1000,
      errorRate: errorCount / messageCount,
      avgLatency: totalTime / messageCount,
      batchSize: 20,
      retryAttempts: errorStats.totalErrors - errorStats.permanentFailures,
      circuitBreakerTrips: errorStats.circuitBreakerTrips,
      performanceMetrics: metrics,
    };
  }

  /**
   * Generate test messages
   */
  generateTestMessages(count) {
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push({
        message: {
          jsonrpc: '2.0',
          method: 'test_method',
          id: `test-${i}`,
          params: { data: `test data ${i}` },
        },
        receivedAt: Date.now(),
      });
    }
    return messages;
  }

  /**
   * Create batches from messages
   */
  createBatches(messages, batchSize) {
    const batches = [];
    for (let i = 0; i < messages.length; i += batchSize) {
      batches.push(messages.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Display benchmark results
   */
  displayResults() {
    const baseline = this.results.baseline;
    const optimized = this.results.optimized;

    console.warn(`\n${'='.repeat(60)}`);
    console.warn('📈 PERFORMANCE BENCHMARK RESULTS');
    console.warn('='.repeat(60));

    // Throughput comparison
    const throughputImprovement =
      ((optimized.throughput - baseline.throughput) / baseline.throughput) * 100;
    console.warn(`\n🚀 THROUGHPUT:`);
    console.warn(`  Baseline:  ${baseline.throughput.toFixed(2)} messages/sec`);
    console.warn(`  Optimized: ${optimized.throughput.toFixed(2)} messages/sec`);
    console.warn(
      `  Improvement: ${throughputImprovement > 0 ? '+' : ''}${throughputImprovement.toFixed(1)}%`
    );

    // Latency comparison
    const latencyImprovement =
      ((baseline.avgLatency - optimized.avgLatency) / baseline.avgLatency) * 100;
    console.warn(`\n⚡ LATENCY:`);
    console.warn(`  Baseline:  ${baseline.avgLatency.toFixed(2)}ms avg`);
    console.warn(`  Optimized: ${optimized.avgLatency.toFixed(2)}ms avg`);
    console.warn(
      `  Improvement: ${latencyImprovement > 0 ? '+' : ''}${latencyImprovement.toFixed(1)}%`
    );

    // Error handling comparison
    console.warn(`\n🛡️ ERROR HANDLING:`);
    console.warn(
      `  Baseline errors:  ${baseline.errorCount}/${baseline.messageCount} (${(baseline.errorRate * 100).toFixed(1)}%)`
    );
    console.warn(
      `  Optimized errors: ${optimized.errorCount}/${optimized.messageCount} (${(optimized.errorRate * 100).toFixed(1)}%)`
    );
    console.warn(`  Retry attempts:   ${optimized.retryAttempts || 0}`);
    console.warn(`  Circuit breaker:  ${optimized.circuitBreakerTrips || 0} trips`);

    // Processing efficiency
    console.warn(`\n📦 PROCESSING EFFICIENCY:`);
    console.warn(`  Baseline:  Individual message processing`);
    console.warn(
      `  Optimized: ${optimized.batchCount} batches (avg ${(optimized.messageCount / optimized.batchCount).toFixed(1)} msgs/batch)`
    );

    // Time comparison
    const timeImprovement = ((baseline.totalTime - optimized.totalTime) / baseline.totalTime) * 100;
    console.warn(`\n⏱️ TOTAL PROCESSING TIME:`);
    console.warn(`  Baseline:  ${baseline.totalTime}ms`);
    console.warn(`  Optimized: ${optimized.totalTime}ms`);
    console.warn(`  Improvement: ${timeImprovement > 0 ? '+' : ''}${timeImprovement.toFixed(1)}%`);

    // Success rates
    const baselineSuccessRate = (baseline.processedCount / baseline.messageCount) * 100;
    const optimizedSuccessRate = (optimized.processedCount / optimized.messageCount) * 100;

    console.warn(`\n✅ SUCCESS RATES:`);
    console.warn(
      `  Baseline:  ${baselineSuccessRate.toFixed(1)}% (${baseline.processedCount}/${baseline.messageCount})`
    );
    console.warn(
      `  Optimized: ${optimizedSuccessRate.toFixed(1)}% (${optimized.processedCount}/${optimized.messageCount})`
    );

    // Summary
    console.warn(`\n🎯 OPTIMIZATION SUMMARY:`);
    if (throughputImprovement > 0) {
      console.warn(`  ✅ ${throughputImprovement.toFixed(1)}% throughput increase`);
    }
    if (latencyImprovement > 0) {
      console.warn(`  ✅ ${latencyImprovement.toFixed(1)}% latency reduction`);
    }
    if (optimized.retryAttempts > 0) {
      console.warn(`  ✅ ${optimized.retryAttempts} automatic error recoveries`);
    }
    console.warn(`  ✅ Batch processing with ${optimized.batchSize} message batches`);
    console.warn(`  ✅ Circuit breaker protection enabled`);
    console.warn(`  ✅ Performance metrics and monitoring`);

    console.warn(`\n${'='.repeat(60)}`);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run benchmark if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new StdioBenchmark();
  benchmark.runBenchmark().catch(console.error);
}

export { StdioBenchmark };
