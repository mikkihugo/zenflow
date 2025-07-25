/**
 * Worker Thread Basic Test
 * Simple validation test for worker thread functionality
 */

import { WorkerThreadPool } from '../src/coordination/workers/worker-pool.js';
import { performance } from 'perf_hooks';

async function testWorkerThreads() {
  console.log('🧪 Testing Worker Thread Implementation');
  console.log('=====================================');

  let pool = null;
  
  try {
    // Initialize worker pool
    console.log('📋 Initializing worker thread pool...');
    pool = new WorkerThreadPool({
      maxWorkers: 4,
      minWorkers: 2,
      loadBalancingStrategy: 'round-robin'
    });
    
    await pool.initialize();
    console.log('✅ Worker pool initialized');
    
    // Test 1: Simple task execution
    console.log('\n🔧 Test 1: Simple task execution');
    const startTime = performance.now();
    
    const result1 = await pool.executeTask({
      type: 'agent-spawn',
      data: {
        agentType: 'coder',
        agentConfig: { name: 'Test Agent' }
      }
    });
    
    const endTime = performance.now();
    console.log(`✅ Task completed in ${(endTime - startTime).toFixed(0)}ms`);
    console.log(`📊 Result: ${result1.success ? 'Success' : 'Failed'}`);
    
    // Test 2: Parallel task execution
    console.log('\n🔧 Test 2: Parallel task execution');
    const parallelStartTime = performance.now();
    
    const parallelTasks = [
      pool.executeTask({
        type: 'neural-analysis',
        data: { data: 'test-data', analysisType: 'pattern-recognition' }
      }),
      pool.executeTask({
        type: 'code-analysis',
        data: { codebase: 'test-codebase', analysisOptions: {} }
      }),
      pool.executeTask({
        type: 'research-task',
        data: { topic: 'test-topic', depth: 'basic' }
      })
    ];
    
    const parallelResults = await Promise.all(parallelTasks);
    const parallelEndTime = performance.now();
    
    console.log(`✅ All parallel tasks completed in ${(parallelEndTime - parallelStartTime).toFixed(0)}ms`);
    console.log(`📊 Results: ${parallelResults.filter(r => r.success).length}/${parallelResults.length} successful`);
    
    // Test 3: Pool status
    console.log('\n🔧 Test 3: Pool status');
    const status = pool.getStatus();
    console.log(`👥 Workers: ${status.workers.total} total, ${status.workers.idle} idle, ${status.workers.busy} busy`);
    console.log(`📋 Queue: ${status.queue.pending} pending tasks`);
    console.log(`📊 Metrics: ${status.metrics.tasksCompleted} completed, ${status.metrics.averageTaskTime.toFixed(0)}ms avg time`);
    
    // Test 4: Load balancing
    console.log('\n🔧 Test 4: Load balancing test');
    const loadTestTasks = Array.from({ length: 6 }, (_, i) =>
      pool.executeTask({
        type: 'testing-task',
        data: { testType: 'unit', target: `test-${i}` }
      })
    );
    
    const loadTestResults = await Promise.all(loadTestTasks);
    console.log(`✅ Load balancing test: ${loadTestResults.filter(r => r.success).length}/${loadTestResults.length} successful`);
    
    const finalStatus = pool.getStatus();
    console.log('📊 Final worker utilization:');
    Object.entries(finalStatus.metrics.workerStats).forEach(([workerId, stats]) => {
      console.log(`  • ${workerId}: ${stats.tasksCompleted} tasks, ${stats.averageTaskTime.toFixed(0)}ms avg`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.shutdown();
      console.log('🔄 Worker pool shut down');
    }
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await testWorkerThreads();
    console.log('\n✅ Worker thread test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Worker thread test failed:', error);
    process.exit(1);
  }
}

export { testWorkerThreads };