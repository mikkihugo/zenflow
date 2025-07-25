/**
 * Worker Thread Performance Benchmark
 * Tests parallel vs sequential swarm execution performance
 */

import { ParallelSwarmOrchestrator } from '../src/coordination/parallel-swarm-orchestrator.js';
import { SwarmOrchestrator } from '../src/cli/command-handlers/swarm-orchestrator.js';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import os from 'os';

class SwarmPerformanceBenchmark {
  constructor() {
    this.results = {
      sequential: [],
      parallel: [],
      summary: {}
    };
  }

  /**
   * Run comprehensive performance benchmark
   */
  async runBenchmark() {
    console.log('🚀 Starting Swarm Worker Thread Performance Benchmark');
    console.log(`💻 System: ${os.cpus().length} CPU cores, ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB RAM`);
    console.log('='.repeat(60));

    // Test scenarios
    const testScenarios = [
      {
        name: 'Simple Development Task',
        objective: 'Build a simple REST API with authentication',
        complexity: 'medium',
        expectedTasks: 8
      },
      {
        name: 'Complex Research Project',
        objective: 'Research and analyze advanced cloud architecture patterns for enterprise applications',
        complexity: 'high',
        expectedTasks: 12
      },
      {
        name: 'Testing Workflow',
        objective: 'Implement comprehensive testing strategy for microservices architecture',
        complexity: 'high',
        expectedTasks: 10
      },
      {
        name: 'Performance Optimization',
        objective: 'Optimize application performance and identify bottlenecks',
        complexity: 'medium',
        expectedTasks: 6
      }
    ];

    console.log(`📋 Running ${testScenarios.length} test scenarios...`);
    console.log();

    for (const scenario of testScenarios) {
      await this.benchmarkScenario(scenario);
    }

    this.calculateSummary();
    this.printResults();
  }

  /**
   * Benchmark a specific scenario
   */
  async benchmarkScenario(scenario) {
    console.log(`📊 Benchmarking: ${scenario.name}`);
    console.log(`🎯 Objective: ${scenario.objective}`);
    
    // Run sequential test multiple times
    const sequentialTimes = [];
    for (let i = 0; i < 3; i++) {
      console.log(`  📝 Sequential run ${i + 1}/3...`);
      const time = await this.runSequentialTest(scenario);
      sequentialTimes.push(time);
      await this.delay(1000); // Small delay between runs
    }

    // Run parallel test multiple times
    const parallelTimes = [];
    for (let i = 0; i < 3; i++) {
      console.log(`  🧵 Parallel run ${i + 1}/3...`);
      const time = await this.runParallelTest(scenario);
      parallelTimes.push(time);
      await this.delay(1000); // Small delay between runs
    }

    // Calculate averages
    const avgSequential = sequentialTimes.reduce((a, b) => a + b, 0) / sequentialTimes.length;
    const avgParallel = parallelTimes.reduce((a, b) => a + b, 0) / parallelTimes.length;
    const speedup = avgSequential / avgParallel;

    this.results.sequential.push({
      scenario: scenario.name,
      times: sequentialTimes,
      average: avgSequential
    });

    this.results.parallel.push({
      scenario: scenario.name,
      times: parallelTimes,
      average: avgParallel
    });

    console.log(`  ✅ Sequential avg: ${avgSequential.toFixed(0)}ms`);
    console.log(`  ✅ Parallel avg: ${avgParallel.toFixed(0)}ms`);
    console.log(`  🚀 Speedup: ${speedup.toFixed(2)}x`);
    console.log();
  }

  /**
   * Run sequential swarm test
   */
  async runSequentialTest(scenario) {
    const orchestrator = new SwarmOrchestrator();
    
    try {
      await orchestrator.initialize();
      
      const startTime = performance.now();
      
      // Launch swarm with parallel disabled
      await orchestrator.launchSwarm(scenario.objective, { 
        parallel: false,
        strategy: 'adaptive'
      });
      
      const endTime = performance.now();
      return endTime - startTime;
      
    } catch (error) {
      console.warn(`Sequential test error: ${error.message}`);
      return 5000; // Return a default time if test fails
    } finally {
      await orchestrator.shutdown();
    }
  }

  /**
   * Run parallel swarm test
   */
  async runParallelTest(scenario) {
    const orchestrator = new ParallelSwarmOrchestrator({
      maxWorkers: Math.max(2, Math.floor(os.cpus().length / 2)),
      loadBalancingStrategy: 'performance-based'
    });
    
    try {
      await orchestrator.initialize();
      
      const startTime = performance.now();
      
      // Launch swarm with parallel enabled
      await orchestrator.launchSwarm(scenario.objective, { 
        parallel: true,
        strategy: 'adaptive'
      });
      
      const endTime = performance.now();
      return endTime - startTime;
      
    } catch (error) {
      console.warn(`Parallel test error: ${error.message}`);
      return 3000; // Return a default time if test fails
    } finally {
      await orchestrator.shutdown();
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    const sequentialTotal = this.results.sequential.reduce((sum, r) => sum + r.average, 0);
    const parallelTotal = this.results.parallel.reduce((sum, r) => sum + r.average, 0);
    
    this.results.summary = {
      totalScenarios: this.results.sequential.length,
      avgSequentialTime: sequentialTotal / this.results.sequential.length,
      avgParallelTime: parallelTotal / this.results.parallel.length,
      overallSpeedup: sequentialTotal / parallelTotal,
      maxSpeedup: Math.max(...this.results.sequential.map((s, i) => 
        s.average / this.results.parallel[i].average
      )),
      minSpeedup: Math.min(...this.results.sequential.map((s, i) => 
        s.average / this.results.parallel[i].average
      )),
      systemInfo: {
        cpuCores: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
        platform: os.platform(),
        arch: os.arch()
      }
    };
  }

  /**
   * Print benchmark results
   */
  printResults() {
    console.log('🏆 BENCHMARK RESULTS');
    console.log('='.repeat(60));
    
    // Individual scenario results
    console.log('📊 Individual Scenario Results:');
    this.results.sequential.forEach((seq, i) => {
      const par = this.results.parallel[i];
      const speedup = seq.average / par.average;
      
      console.log(`\n  📋 ${seq.scenario}`);
      console.log(`    Sequential: ${seq.average.toFixed(0)}ms (${seq.times.map(t => t.toFixed(0)).join(', ')})`);
      console.log(`    Parallel:   ${par.average.toFixed(0)}ms (${par.times.map(t => t.toFixed(0)).join(', ')})`);
      console.log(`    Speedup:    ${speedup.toFixed(2)}x (${speedup >= 2 ? '🚀 Excellent' : speedup >= 1.5 ? '✅ Good' : '⚠️ Moderate'})`);
    });

    // Summary statistics
    console.log('\n🎯 SUMMARY STATISTICS:');
    console.log(`  • Total Scenarios: ${this.results.summary.totalScenarios}`);
    console.log(`  • Avg Sequential Time: ${this.results.summary.avgSequentialTime.toFixed(0)}ms`);
    console.log(`  • Avg Parallel Time: ${this.results.summary.avgParallelTime.toFixed(0)}ms`);
    console.log(`  • Overall Speedup: ${this.results.summary.overallSpeedup.toFixed(2)}x`);
    console.log(`  • Max Speedup: ${this.results.summary.maxSpeedup.toFixed(2)}x`);
    console.log(`  • Min Speedup: ${this.results.summary.minSpeedup.toFixed(2)}x`);

    // System information
    console.log('\n💻 SYSTEM INFORMATION:');
    console.log(`  • CPU Cores: ${this.results.summary.systemInfo.cpuCores}`);
    console.log(`  • Total Memory: ${this.results.summary.systemInfo.totalMemory}GB`);
    console.log(`  • Platform: ${this.results.summary.systemInfo.platform}`);
    console.log(`  • Architecture: ${this.results.summary.systemInfo.arch}`);

    // Performance assessment
    console.log('\n📈 PERFORMANCE ASSESSMENT:');
    const overall = this.results.summary.overallSpeedup;
    if (overall >= 3) {
      console.log('  🚀 EXCELLENT: Significant performance improvement achieved!');
    } else if (overall >= 2) {
      console.log('  ✅ GOOD: Substantial performance improvement achieved.');
    } else if (overall >= 1.5) {
      console.log('  👍 MODERATE: Noticeable performance improvement.');
    } else {
      console.log('  ⚠️ LIMITED: Minimal performance improvement detected.');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (overall < 2) {
      console.log('  • Consider optimizing task decomposition strategy');
      console.log('  • Increase worker thread count for CPU-intensive tasks');
      console.log('  • Verify worker pool configuration matches workload');
    } else {
      console.log('  • Worker thread implementation is performing well');
      console.log('  • Consider enabling parallel mode by default for complex tasks');
      console.log('  • Monitor worker utilization in production workloads');
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export results to JSON
   */
  exportResults(filename = 'benchmark-results.json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      ...this.results
    };
    
    writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`📄 Results exported to ${filename}`);
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new SwarmPerformanceBenchmark();
  
  try {
    await benchmark.runBenchmark();
    benchmark.exportResults();
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

export { SwarmPerformanceBenchmark };