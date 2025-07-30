
 * @fileoverview Performance benchmark for MCP stdio optimizations;
/** Compares performance before and after optimizations;

import { MCPErrorHandler  } from './src/mcp/core/error-handler.js';
import { PerformanceMetrics  } from './src/mcp/core/performance-metrics.js';
import { StdioOptimizer  } from './src/mcp/core/stdio-optimizer.js';

/** Benchmark stdio optimization performance;

class StdioBenchmark {
  constructor() {
    this.results = {
      baseline: {} }
// }

/** Run complete benchmark suite;

async;
runBenchmark();
// {
  console.warn(' MCP Stdio Optimization Benchmark\n');
  // Baseline performance(simulated single message processing)
  console.warn(' Running baseline performance test...');
  this.results.baseline = // await this.runBaselineTest();
  // Optimized performance(with batching and error handling)
  console.warn(' Running optimized performance test...');
  this.results.optimized = // await this.runOptimizedTest();
  // Display results
  this.displayResults();
// }

/** Simulate baseline(non-optimized) message processing;

async;
runBaselineTest();
// {
  const _messageCount = 1000;
  const _messages = this.generateTestMessages(messageCount);
  const _startTime = Date.now();
  const _processedCount = 0;
  const _errorCount = 0;
  // Simulate individual message processing(no batching)
  for(const _message of messages) {
    try {
        // Simulate processing time
  // // await this.delay(Math.random() * 2); // Simulate 5% error rate
        if(Math.random() < 0.05) {
          throw new Error('Simulated processing error'); //         }
        processedCount++;
      } catch(/* _error */) {
        errorCount++;
        // No retry logic in baseline
      //       }
  //   }
  const _endTime = Date.now();
  const _totalTime = endTime - startTime;
  // return {
      messageCount,
  // processedCount, // LINT: unreachable code removed
  errorCount,
  totalTime,
  throughput: (processedCount / totalTime) *
    1000, // messages per second
    errorRate;
  : errorCount / messageCount,
  avgLatency: totalTime / messageCount
// }
// }

/** Test optimized message processing with batching and error handling;

// async runOptimizedTest() { }

  const _messageCount = 1000;
  const _messages = this.generateTestMessages(messageCount);
  // Initialize optimized components
  const _stdioOptimizer = new StdioOptimizer({ batchSize,
  batchTimeout,
  retryAttempts
  })
const _errorHandler = new MCPErrorHandler({ maxRetries,
retryDelay
  })
const _performanceMetrics = new PerformanceMetrics({ enableLogging
  })
const _startTime = Date.now();
const _processedCount = 0;
const _errorCount = 0;
const _batchCount = 0;
// Setup batch processing
stdioOptimizer.on('batch', async(batch) => {
      batchCount++;
  for(const item of batch) {
        const _requestId = `req-${item.message.id}`; performanceMetrics.recordRequestStart(requestId); try {
          // Use error handler with retry logic
  // // await errorHandler.executeWithRetry(async() {=> {
            // Simulate processing time
  // await this.delay(Math.random() * 2);
            // Simulate 5% error rate(same )
            if(Math.random() < 0.05) {
              throw new Error('Simulated processing error');
            //             }
            // return { success };
    //   // LINT: unreachable code removed});
          processedCount++;
          performanceMetrics.recordRequestEnd(requestId, true);
        } catch(error) {
          errorCount++;
          performanceMetrics.recordRequestEnd(requestId, false, { error });
        //         }
      //       }
    });
    // Process messages in batches
    const _batches = this.createBatches(messages, 20);
  for(const batch of batches) {
      stdioOptimizer.queueMessages(batch); // Small delay to allow batch processing
  // // await this.delay(5); 
    //     }
    // Wait for any remaining processing
  // // await this.delay(100) {;
    const _endTime = Date.now();
    const _totalTime = endTime - startTime;
    // Get detailed metrics
    const _metrics = performanceMetrics.getMetrics();
    const _errorStats = errorHandler.getErrorStats();
    // return {
      messageCount,
    // processedCount, // LINT: unreachable code removed
      errorCount,
      batchCount,
      totalTime,
      throughput: (processedCount / totalTime) * 1000,
      errorRate: errorCount / messageCount,
      avgLatency: totalTime / messageCount,
      batchSize,
      retryAttempts: errorStats.totalErrors - errorStats.permanentFailures,
      circuitBreakerTrips: errorStats.circuitBreakerTrips,
      performanceMetrics };
// }

/** Generate test messages;

generateTestMessages(count)
// {
  const _messages = [];
  for(let i = 0; i < count; i++) {
    messages.push({
        message: {
          jsonrpc: '2.0',
    method: 'test_method',
    id: `test-${i}`,
    data: `test data ${i}`
// }

  receivedAt: Date.now() {}
})
// }
// return messages;
//   // LINT: unreachable code removed}

/** Create batches from messages;

createBatches(messages, batchSize);
// {
    const _batches = [];
  for(let i = 0; i < messages.length; i += batchSize) {
      batches.push(messages.slice(i, i + batchSize));
    //     }
    // return batches;
    //   // LINT: unreachable code removed}

/** Display benchmark results;

  displayResults() {
    const _baseline = this.results.baseline;
    const _optimized = this.results.optimized;
    console.warn(`\n${'='.repeat(60)}`);
    console.warn(' PERFORMANCE BENCHMARK RESULTS');
    console.warn('='.repeat(60));
    // Throughput comparison
    const _throughputImprovement =;
      ((optimized.throughput - baseline.throughput) / baseline.throughput) * 100;
    console.warn(`\n THROUGHPUT);`
    console.warn(`  Baseline:  ${baseline.throughput.toFixed(2)} messages
    console.warn(`  Optimized: ${optimized.throughput.toFixed(2)} messages
    console.warn(;)
      `  Improvement: \${throughputImprovement > 0 ? '+' }${throughputImprovement.toFixed(1)}%`;
    );
    // Latency comparison
    const _latencyImprovement =;
      ((baseline.avgLatency - optimized.avgLatency) / baseline.avgLatency) * 100;
    console.warn(`\n LATENCY);`
    console.warn(`  Baseline:  ${baseline.avgLatency.toFixed(2)}ms avg`);
    console.warn(`  Optimized: ${optimized.avgLatency.toFixed(2)}ms avg`);
    console.warn(;)
      `  Improvement: \${latencyImprovement > 0 ? '+' }${latencyImprovement.toFixed(1)}%`;
    );
    // Error handling comparison
    console.warn(`\n ERROR HANDLING);`
    console.warn(;)
      `  Baseline errors:  ${baseline.errorCount}/${baseline.messageCount} (${(baseline.errorRate * 100).toFixed(1)}%)`;
    );
    console.warn(;)
      `  Optimized errors: ${optimized.errorCount}/${optimized.messageCount} (${(optimized.errorRate * 100).toFixed(1)}%)`;
    );
    console.warn(`  Retry attempts);`
    console.warn(`  Circuit breaker);`
    // Processing efficiency
    console.warn(`\n PROCESSING EFFICIENCY);`
    console.warn(`  Baseline);`
    console.warn(;)
      `  Optimized: ${optimized.batchCount} batches(avg ${(optimized.messageCount / optimized.batchCount).toFixed(1)} msgs/batch)`;
    );
    // Time comparison
    const _timeImprovement = ((baseline.totalTime - optimized.totalTime) / baseline.totalTime) * 100;
    console.warn(`\n TOTAL PROCESSING TIME);`
    console.warn(`  Baseline);`
    console.warn(`  Optimized);`
    console.warn(`  Improvement: \${timeImprovement > 0 ? '+' }${timeImprovement.toFixed(1)}%`);
    // Success rates
    const _baselineSuccessRate = (baseline.processedCount / baseline.messageCount) * 100;
    const _optimizedSuccessRate = (optimized.processedCount / optimized.messageCount) * 100;
    console.warn(`\n SUCCESS RATES);`
    console.warn(;)
      `  Baseline:  ${baselineSuccessRate.toFixed(1)}% (${baseline.processedCount}
    );
    console.warn(;)
      `  Optimized: ${optimizedSuccessRate.toFixed(1)}% (${optimized.processedCount}
    );
    // Summary
    console.warn(`\n OPTIMIZATION SUMMARY);`
  if(throughputImprovement > 0) {
      console.warn(`   ${throughputImprovement.toFixed(1)}% throughput increase`);
    //     }
  if(latencyImprovement > 0) {
      console.warn(`   ${latencyImprovement.toFixed(1)}% latency reduction`);
    //     }
  if(optimized.retryAttempts > 0) {
      console.warn(`   ${optimized.retryAttempts} automatic error recoveries`);
    //     }
    console.warn(`   Batch processing with ${optimized.batchSize} message batches`);
    console.warn(`   Circuit breaker protection enabled`);
    console.warn(`   Performance metrics and monitoring`);
    console.warn(`\n${'='.repeat(60)}`);
  //   }

/** Utility delay function;

  delay(ms)
    return new Promise((resolve) => setTimeout(resolve, ms));
// Run benchmark if this file is executed directly
  if(import.meta.url === `file) {`
  const _benchmark = new StdioBenchmark();
  benchmark.runBenchmark().catch(console.error);
// }
// export { StdioBenchmark };
