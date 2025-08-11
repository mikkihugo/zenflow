/**
 * Performance and Load Testing Framework
 * 
 * Comprehensive performance testing for the multi-level workflow system
 * including stress testing, load testing, and performance validation.
 */

import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { createLogger } from '../../core/logger.ts';
import { createAdaptiveOptimizer } from '../../config/memory-optimization.ts';
import { handleWorkflowToolCall } from '../../interfaces/mcp/workflow-tools.ts';
import { handleKanbanCommand } from '../../interfaces/cli/commands/kanban.ts';

const logger = createLogger('performance-test');

describe('Performance and Load Testing Suite', () => {
  let testStartTime: number;
  let memoryOptimizer: any;
  const performanceResults: any[] = [];

  beforeAll(async () => {
    testStartTime = Date.now();
    memoryOptimizer = createAdaptiveOptimizer();
    logger.info('🚀 Starting performance and load testing suite...');
  });

  afterAll(async () => {
    const totalDuration = Date.now() - testStartTime;
    logger.info(`🏁 Performance testing completed in ${totalDuration}ms`);
    
    if (performanceResults.length > 0) {
      const summary = calculatePerformanceSummary(performanceResults);
      logger.info('📊 Performance Summary:', summary);
    }
  });

  describe('System Performance Under Load', () => {
    test('should handle concurrent workflow initialization requests', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();
      
      logger.info(`🔄 Testing ${concurrentRequests} concurrent workflow initializations...`);
      
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        handleWorkflowToolCall('workflow_initialize', {
          repoPath: `./test-concurrent-${i}`,
          topology: 'hierarchical',
          mlLevel: 'enterprise',
          conservative: false
        })
      );
      
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      // Validate results
      const successfulResults = results.filter(r => r.status === 'fulfilled' && !r.value.isError);
      expect(successfulResults.length).toBeGreaterThanOrEqual(concurrentRequests * 0.8); // 80% success rate minimum
      
      // Performance assertions
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      const avgLatency = duration / concurrentRequests;
      expect(avgLatency).toBeLessThan(1000); // Average latency under 1 second
      
      performanceResults.push({
        test: 'concurrent_workflow_init',
        concurrency: concurrentRequests,
        duration,
        avgLatency,
        successRate: (successfulResults.length / concurrentRequests) * 100
      });
      
      logger.info(`✅ Concurrent initialization: ${duration}ms total, ${avgLatency.toFixed(0)}ms avg latency`);
    }, 15000);

    test('should handle high-frequency monitoring requests', async () => {
      const requestCount = 50;
      const startTime = Date.now();
      
      logger.info(`📊 Testing ${requestCount} high-frequency monitoring requests...`);
      
      // Fire monitoring requests rapidly
      const promises = Array.from({ length: requestCount }, () =>
        handleWorkflowToolCall('workflow_monitor', {
          detailed: false,
          includeRecommendations: true
        })
      );
      
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      const successfulResults = results.filter(r => r.status === 'fulfilled' && !r.value.isError);
      expect(successfulResults.length).toBeGreaterThanOrEqual(requestCount * 0.9); // 90% success rate
      
      const throughput = requestCount / (duration / 1000); // requests per second
      expect(throughput).toBeGreaterThan(10); // Minimum 10 RPS
      
      performanceResults.push({
        test: 'high_frequency_monitoring',
        requestCount,
        duration,
        throughput: throughput.toFixed(2),
        successRate: (successfulResults.length / requestCount) * 100
      });
      
      logger.info(`✅ High-frequency monitoring: ${throughput.toFixed(2)} RPS, ${duration}ms total`);
    }, 20000);

    test('should handle stress testing with resource exhaustion scenarios', async () => {
      logger.info('🔥 Running stress test with resource exhaustion...');
      
      const stressStartTime = Date.now();
      
      // Simulate high resource usage
      memoryOptimizer.recordPerformance({
        memoryUtilization: 0.95,
        cpuUtilization: 0.90,
        throughput: 5,
        errorRate: 0.1,
        activeStreams: 150,
        avgResponseTime: 800
      });
      
      // Test system resilience under stress
      const stressResult = await handleWorkflowToolCall('workflow_test', {
        testType: 'stress',
        duration: 30
      });
      
      expect(stressResult.isError).toBe(false);
      const stressData = JSON.parse(stressResult.content[0].text);
      expect(stressData.success).toBe(true);
      
      // System should still provide recommendations under stress
      const monitorResult = await handleWorkflowToolCall('workflow_monitor', {
        detailed: true
      });
      
      expect(monitorResult.isError).toBe(false);
      
      const stressDuration = Date.now() - stressStartTime;
      performanceResults.push({
        test: 'stress_testing',
        duration: stressDuration,
        systemUnderStress: true,
        memoryUtilization: '95%',
        cpuUtilization: '90%'
      });
      
      logger.info(`✅ Stress testing completed: System remained operational under extreme load`);
    }, 45000);
  });

  describe('Advanced Kanban Flow Performance', () => {
    test('should handle rapid component monitoring requests', async () => {
      const monitoringCycles = 20;
      const startTime = Date.now();
      
      logger.info(`🎯 Testing ${monitoringCycles} rapid Kanban Flow monitoring cycles...`);
      
      // Mock console to capture output
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        // Set mock argv for consistency
        process.argv = ['node', 'kanban', 'monitor'];
        
        const promises = Array.from({ length: monitoringCycles }, () =>
          handleKanbanCommand(['monitor'])
        );
        
        await Promise.allSettled(promises);
        const duration = Date.now() - startTime;
        
        // Verify component status was checked multiple times
        const componentChecks = consoleLogs.filter(log => 
          log.includes('Flow Manager') || log.includes('✅ ACTIVE')
        ).length;
        
        expect(componentChecks).toBeGreaterThan(monitoringCycles * 0.5); // At least half should show components
        
        const cycleTime = duration / monitoringCycles;
        expect(cycleTime).toBeLessThan(500); // Each cycle under 500ms
        
        performanceResults.push({
          test: 'kanban_monitoring_performance',
          cycles: monitoringCycles,
          duration,
          avgCycleTime: cycleTime.toFixed(2),
          componentChecks
        });
        
        logger.info(`✅ Kanban monitoring: ${cycleTime.toFixed(0)}ms avg cycle time`);
        
      } finally {
        console.log = originalLog;
      }
    }, 30000);

    test('should handle comprehensive component testing under load', async () => {
      logger.info('🧪 Running comprehensive Kanban Flow component testing under load...');
      
      const testStartTime = Date.now();
      
      // Mock console for output capture
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        process.argv = ['node', 'kanban', 'test', '--all'];
        
        // Run multiple test cycles to simulate load
        const testCycles = 5;
        const promises = Array.from({ length: testCycles }, () =>
          handleKanbanCommand(['test', '--all'])
        );
        
        await Promise.allSettled(promises);
        const duration = Date.now() - testStartTime;
        
        // Verify all components were tested
        const componentsToTest = [
          'Testing Flow Manager',
          'Testing Bottleneck Detection Engine',
          'Testing Advanced Metrics Tracker',
          'Testing Dynamic Resource Manager',
          'Testing Flow Integration Manager'
        ];
        
        const componentTestCounts = componentsToTest.map(component =>
          consoleLogs.filter(log => log.includes(component)).length
        );
        
        // Each component should have been tested in each cycle
        componentTestCounts.forEach(count => {
          expect(count).toBeGreaterThanOrEqual(testCycles * 0.8); // Allow some margin
        });
        
        performanceResults.push({
          test: 'kanban_component_load_testing',
          testCycles,
          duration,
          avgTestCycleTime: (duration / testCycles).toFixed(2),
          componentTestCounts
        });
        
        logger.info(`✅ Component load testing: ${testCycles} cycles in ${duration}ms`);
        
      } finally {
        console.log = originalLog;
      }
    }, 40000);
  });

  describe('Memory and Resource Management Performance', () => {
    test('should optimize memory allocation under varying load patterns', async () => {
      logger.info('🧠 Testing memory optimization under varying load patterns...');
      
      const loadPatterns = [
        { memoryUtilization: 0.3, cpuUtilization: 0.2, throughput: 20 },
        { memoryUtilization: 0.6, cpuUtilization: 0.5, throughput: 35 },
        { memoryUtilization: 0.8, cpuUtilization: 0.7, throughput: 50 },
        { memoryUtilization: 0.4, cpuUtilization: 0.3, throughput: 25 },
      ];
      
      const optimizationResults: any[] = [];
      
      for (let i = 0; i < loadPatterns.length; i++) {
        const pattern = loadPatterns[i];
        const patternStartTime = Date.now();
        
        // Record performance for this pattern
        memoryOptimizer.recordPerformance({
          ...pattern,
          errorRate: 0.01,
          activeStreams: 30 + (i * 10),
          avgResponseTime: 150 + (i * 50)
        });
        
        // Get optimization recommendations
        const optimization = memoryOptimizer.optimizeAllocation();
        expect(optimization).toBeDefined();
        expect(typeof optimization.canOptimize).toBe('boolean');
        expect(typeof optimization.potentialGains).toBe('number');
        
        const patternDuration = Date.now() - patternStartTime;
        optimizationResults.push({
          pattern: i + 1,
          memoryUtilization: pattern.memoryUtilization,
          canOptimize: optimization.canOptimize,
          potentialGains: optimization.potentialGains,
          optimizationTime: patternDuration
        });
        
        // Brief pause between patterns
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Verify optimization is working across patterns
      const optimizablePatterns = optimizationResults.filter(r => r.canOptimize);
      if (optimizablePatterns.length > 0) {
        const avgGains = optimizablePatterns.reduce((sum, r) => sum + r.potentialGains, 0) / optimizablePatterns.length;
        expect(avgGains).toBeGreaterThan(0);
      }
      
      performanceResults.push({
        test: 'memory_optimization_patterns',
        patterns: loadPatterns.length,
        optimizationResults,
        avgOptimizationTime: (optimizationResults.reduce((sum, r) => sum + r.optimizationTime, 0) / optimizationResults.length).toFixed(2)
      });
      
      logger.info(`✅ Memory optimization: Tested ${loadPatterns.length} load patterns successfully`);
    }, 25000);

    test('should handle scaling operations under concurrent load', async () => {
      logger.info('📈 Testing scaling operations under concurrent load...');
      
      const scalingOperations = [
        { direction: 'up', amount: 20 },
        { direction: 'down', amount: 15 },
        { direction: 'up', amount: 30 },
        { direction: 'down', amount: 25 }
      ];
      
      const scalingStartTime = Date.now();
      
      // Execute scaling operations concurrently
      const scalingPromises = scalingOperations.map(async (op, index) => {
        // Add slight delay to stagger operations
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        const opStartTime = Date.now();
        const result = await handleWorkflowToolCall('workflow_scale', {
          direction: op.direction,
          amount: op.amount,
          force: false
        });
        
        const opDuration = Date.now() - opStartTime;
        
        return {
          operation: op,
          result: !result.isError,
          duration: opDuration
        };
      });
      
      const scalingResults = await Promise.allSettled(scalingPromises);
      const totalScalingDuration = Date.now() - scalingStartTime;
      
      const successfulScaling = scalingResults.filter(r => 
        r.status === 'fulfilled' && r.value.result
      );
      
      expect(successfulScaling.length).toBeGreaterThanOrEqual(scalingOperations.length * 0.75); // 75% success rate
      
      performanceResults.push({
        test: 'concurrent_scaling_operations',
        operations: scalingOperations.length,
        totalDuration: totalScalingDuration,
        successfulOperations: successfulScaling.length,
        successRate: ((successfulScaling.length / scalingOperations.length) * 100).toFixed(1)
      });
      
      logger.info(`✅ Scaling operations: ${successfulScaling.length}/${scalingOperations.length} successful in ${totalScalingDuration}ms`);
    }, 30000);
  });

  describe('End-to-End Performance Validation', () => {
    test('should maintain performance SLAs under mixed workload', async () => {
      logger.info('🎯 Running end-to-end performance validation with mixed workload...');
      
      const e2eStartTime = Date.now();
      
      // Mixed workload simulation
      const mixedOperations = [
        () => handleWorkflowToolCall('workflow_initialize', { repoPath: './e2e-mixed-1', topology: 'mesh' }),
        () => handleWorkflowToolCall('workflow_monitor', { detailed: true }),
        () => handleWorkflowToolCall('workflow_test', { testType: 'performance', duration: 10 }),
        () => handleWorkflowToolCall('system_info', { includeRecommendations: true }),
        () => handleWorkflowToolCall('workflow_scale', { direction: 'up', amount: 10 })
      ];
      
      // Execute mixed operations multiple times
      const iterations = 3;
      const allResults: any[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const iterationStartTime = Date.now();
        
        const iterationPromises = mixedOperations.map(async (operation, opIndex) => {
          const opStartTime = Date.now();
          try {
            const result = await operation();
            const opDuration = Date.now() - opStartTime;
            return {
              operationIndex: opIndex,
              success: !result.isError,
              duration: opDuration,
              iteration: i + 1
            };
          } catch (error) {
            const opDuration = Date.now() - opStartTime;
            return {
              operationIndex: opIndex,
              success: false,
              duration: opDuration,
              error: error instanceof Error ? error.message : String(error),
              iteration: i + 1
            };
          }
        });
        
        const iterationResults = await Promise.all(iterationPromises);
        const iterationDuration = Date.now() - iterationStartTime;
        
        allResults.push({
          iteration: i + 1,
          duration: iterationDuration,
          results: iterationResults
        });
        
        // Brief pause between iterations
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const totalE2EDuration = Date.now() - e2eStartTime;
      
      // Performance SLA validation
      const avgIterationTime = allResults.reduce((sum, iter) => sum + iter.duration, 0) / allResults.length;
      const totalSuccessfulOps = allResults.reduce((sum, iter) => 
        sum + iter.results.filter((r: any) => r.success).length, 0
      );
      const totalOperations = iterations * mixedOperations.length;
      const overallSuccessRate = (totalSuccessfulOps / totalOperations) * 100;
      
      // SLA assertions
      expect(avgIterationTime).toBeLessThan(15000); // Average iteration under 15 seconds
      expect(overallSuccessRate).toBeGreaterThan(85); // 85% success rate minimum
      expect(totalE2EDuration).toBeLessThan(60000); // Total test under 1 minute
      
      performanceResults.push({
        test: 'e2e_mixed_workload_performance',
        iterations,
        totalDuration: totalE2EDuration,
        avgIterationTime: avgIterationTime.toFixed(0),
        overallSuccessRate: overallSuccessRate.toFixed(1),
        totalOperations,
        successfulOperations: totalSuccessfulOps
      });
      
      logger.info(`✅ E2E Performance: ${overallSuccessRate.toFixed(1)}% success rate, ${avgIterationTime.toFixed(0)}ms avg iteration`);
    }, 75000);
  });
});

/**
 * Calculate performance summary from test results
 */
function calculatePerformanceSummary(results: any[]) {
  const summary = {
    totalTests: results.length,
    averageDuration: 0,
    throughputTests: results.filter(r => r.throughput).length,
    concurrencyTests: results.filter(r => r.concurrency || r.cycles).length,
    successRates: [] as number[],
    performanceMetrics: {} as any
  };
  
  // Calculate averages
  const durationsMs = results.map(r => r.duration).filter(d => typeof d === 'number');
  if (durationsMs.length > 0) {
    summary.averageDuration = Math.round(durationsMs.reduce((sum, d) => sum + d, 0) / durationsMs.length);
  }
  
  // Collect success rates
  results.forEach(r => {
    if (typeof r.successRate === 'number') {
      summary.successRates.push(r.successRate);
    } else if (typeof r.successRate === 'string') {
      const rate = parseFloat(r.successRate);
      if (!isNaN(rate)) summary.successRates.push(rate);
    }
  });
  
  // Performance insights
  const throughputResults = results.filter(r => r.throughput);
  if (throughputResults.length > 0) {
    const throughputs = throughputResults.map(r => parseFloat(r.throughput));
    summary.performanceMetrics.maxThroughput = Math.max(...throughputs).toFixed(2) + ' RPS';
  }
  
  const concurrencyResults = results.filter(r => r.concurrency);
  if (concurrencyResults.length > 0) {
    const maxConcurrency = Math.max(...concurrencyResults.map(r => r.concurrency));
    summary.performanceMetrics.maxConcurrency = maxConcurrency;
  }
  
  if (summary.successRates.length > 0) {
    const avgSuccessRate = summary.successRates.reduce((sum, rate) => sum + rate, 0) / summary.successRates.length;
    summary.performanceMetrics.averageSuccessRate = avgSuccessRate.toFixed(1) + '%';
  }
  
  return summary;
}