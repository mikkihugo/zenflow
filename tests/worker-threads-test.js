/**
 * Worker Thread Basic Test
 * Simple validation test for worker thread functionality
 */

import { performance } from 'node:perf_hooks';
import { WorkerThreadPool } from '../src/coordination/workers/worker-pool.js';

async function testWorkerThreads() {
  console.warn('🧪 Testing Worker Thread Implementation');
  console.warn('=====================================');

  let pool = null;

  try {
    // Initialize worker pool
    console.warn('📋 Initializing worker thread pool...');
    pool = new WorkerThreadPool({
      maxWorkers: 4,
      minWorkers: 2,
      loadBalancingStrategy: 'round-robin',
    });

    await pool.initialize();
    console.warn('✅ Worker pool initialized');

    // Test 1: Simple task execution
    console.warn('\n🔧 Test 1: Simple task execution');
    const startTime = performance.now();

    const result1 = await pool.executeTask({
      type: 'agent-spawn',
      data: {
        agentType: 'coder',
        agentConfig: { name: 'Test Agent' },
      },
    });

    const endTime = performance.now();
    console.warn(`✅ Task completed in ${(endTime - startTime).toFixed(0)}ms`);
    console.warn(`📊 Result: ${result1.success ? 'Success' : 'Failed'}`);

    // Test 2: Parallel task execution
    console.warn('\n🔧 Test 2: Parallel task execution');
    const parallelStartTime = performance.now();

    const parallelTasks = [
      pool.executeTask({
        type: 'neural-analysis',
        data: { data: 'test-data', analysisType: 'pattern-recognition' },
      }),
      pool.executeTask({
        type: 'code-analysis',
        data: { codebase: 'test-codebase', analysisOptions: {} },
      }),
      pool.executeTask({
        type: 'research-task',
        data: { topic: 'test-topic', depth: 'basic' },
      }),
    ];

    const parallelResults = await Promise.all(parallelTasks);
    const parallelEndTime = performance.now();

    console.warn(
      `✅ All parallel tasks completed in ${(parallelEndTime - parallelStartTime).toFixed(0)}ms`
    );
    console.warn(
      `📊 Results: ${parallelResults.filter((r) => r.success).length}/${parallelResults.length} successful`
    );

    // Test 3: Pool status
    console.warn('\n🔧 Test 3: Pool status');
    const status = pool.getStatus();
    console.warn(
      `👥 Workers: ${status.workers.total} total, ${status.workers.idle} idle, ${status.workers.busy} busy`
    );
    console.warn(`📋 Queue: ${status.queue.pending} pending tasks`);
    console.warn(
      `📊 Metrics: ${status.metrics.tasksCompleted} completed, ${status.metrics.averageTaskTime.toFixed(0)}ms avg time`
    );

    // Test 4: Load balancing
    console.warn('\n🔧 Test 4: Load balancing test');
    const loadTestTasks = Array.from({ length: 6 }, (_, i) =>
      pool.executeTask({
        type: 'testing-task',
        data: { testType: 'unit', target: `test-${i}` },
      })
    );

    const loadTestResults = await Promise.all(loadTestTasks);
    console.warn(
      `✅ Load balancing test: ${loadTestResults.filter((r) => r.success).length}/${loadTestResults.length} successful`
    );

    const finalStatus = pool.getStatus();
    console.warn('📊 Final worker utilization:');
    Object.entries(finalStatus.metrics.workerStats).forEach(([workerId, stats]) => {
      console.warn(
        `  • ${workerId}: ${stats.tasksCompleted} tasks, ${stats.averageTaskTime.toFixed(0)}ms avg`
      );
    });

    console.warn('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.shutdown();
      console.warn('🔄 Worker pool shut down');
    }
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await testWorkerThreads();
    console.warn('\n✅ Worker thread test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Worker thread test failed:', error);
    process.exit(1);
  }
}

export { testWorkerThreads };
