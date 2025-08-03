#!/usr/bin/env node

/**
 * Performance Optimization Demo
 * Demonstrates the comprehensive performance optimization capabilities
 */

import {
  PerformanceOptimizer,
  NeuralNetworkOptimizer,
  SwarmCoordinationOptimizer,
  DataPerformanceOptimizer,
  WasmPerformanceOptimizer,
  PerformanceBenchmarkSuite,
  OptimizationMonitor,
} from '../src/optimization/index.js';

async function runOptimizationDemo() {
  console.log('🚀 Claude-Zen Performance Optimization Demo\n');

  // Initialize all optimizers
  console.log('📊 Initializing Performance Optimizers...');
  const neuralOptimizer = new NeuralNetworkOptimizer({
    enableGPUAcceleration: true,
    preferredBatchSize: 64,
    memoryThreshold: 0.8,
  });

  const swarmOptimizer = new SwarmCoordinationOptimizer({
    maxAgents: 10000,
    targetLatency: 5,
    cacheEnabled: true,
    routingAlgorithm: 'adaptive',
  });

  const dataOptimizer = new DataPerformanceOptimizer({
    enableQueryOptimization: true,
    enableConnectionPooling: true,
    enableIntelligentCaching: true,
    maxConnections: 100,
  });

  const wasmOptimizer = new WasmPerformanceOptimizer({
    enableStreaming: true,
    enableSIMD: true,
    enableMemorySharing: true,
    optimizationLevel: 'O2',
  });

  // Initialize core performance optimizer
  const performanceOptimizer = new PerformanceOptimizer(
    {
      enabled: true,
      optimizationInterval: 30000, // 30 seconds
      aggressiveness: 'moderate',
      targetMetrics: {
        latency: 50,
        throughput: 10000,
        memoryUsage: 0.8,
        cpuUsage: 0.7,
      },
    },
    {
      neural: neuralOptimizer,
      swarm: swarmOptimizer,
      data: dataOptimizer,
      wasm: wasmOptimizer,
    }
  );

  // Initialize monitoring
  const monitor = new OptimizationMonitor({
    enabled: true,
    monitoringInterval: 5000,
    alertThresholds: {
      latency: 100,
      throughput: 1000,
      memoryUsage: 0.9,
      cpuUsage: 0.8,
      errorRate: 0.01,
    },
  });

  console.log('✅ All optimizers initialized\n');

  // Demo 1: Neural Network Optimization
  console.log('🧠 Demo 1: Neural Network Performance Optimization');
  console.log('=' .repeat(60));
  
  const mockNetwork = {
    id: 'demo-network',
    layers: [784, 256, 128, 64, 10],
    weights: Array(5).fill(0).map(() => Array(100).fill(0).map(() => Math.random())),
    activationFunction: 'relu',
  };

  console.log('Optimizing neural network training speed...');
  const neuralResult = await neuralOptimizer.optimizeTrainingSpeed(mockNetwork);
  console.log(`✅ Training speed optimization: ${(neuralResult.improvement * 100).toFixed(1)}% improvement`);
  console.log(`   Execution time: ${neuralResult.executionTime}ms`);
  
  console.log('Implementing batch processing...');
  const batchResult = await neuralOptimizer.implementBatchProcessing({
    network: mockNetwork,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
  });
  console.log(`✅ Optimal batch size: ${batchResult.batchSize}, Parallelism: ${batchResult.parallelism}`);
  console.log(`   Processing mode: ${batchResult.processingMode}\n`);

  // Demo 2: Swarm Coordination Optimization
  console.log('🐝 Demo 2: Swarm Coordination Performance Optimization');
  console.log('=' .repeat(60));
  
  const mockTopology = {
    type: 'mesh' as const,
    nodes: 5000,
    connections: 25000,
  };

  console.log('Optimizing message routing...');
  const routingResult = await swarmOptimizer.optimizeMessageRouting(mockTopology);
  console.log(`✅ Message routing latency: ${routingResult.routingLatency.toFixed(1)}ms`);
  console.log(`   Message compression: ${(routingResult.messageCompression * 100).toFixed(1)}%`);
  
  console.log('Implementing coordination caching...');
  const cacheResult = await swarmOptimizer.implementCaching({
    protocol: 'websocket',
    messageFormat: 'json',
    compressionEnabled: true,
  });
  console.log(`✅ Cache hit ratio: ${(cacheResult.hitRatio * 100).toFixed(1)}%`);
  console.log(`   Cache layers: ${cacheResult.layers}, Eviction policy: ${cacheResult.evictionPolicy}\n`);

  // Demo 3: Data Performance Optimization
  console.log('🗄️  Demo 3: Database & Memory Performance Optimization');
  console.log('=' .repeat(60));
  
  const mockQueries = [
    { sql: 'SELECT * FROM users WHERE active = ? ORDER BY created_at DESC LIMIT 100', parameters: [true], estimatedCost: 500 },
    { sql: 'SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = ?', parameters: [123, 'completed'], estimatedCost: 200 },
    { sql: 'UPDATE user_stats SET last_login = ? WHERE user_id = ?', parameters: [new Date(), 123], estimatedCost: 50 },
  ];

  console.log('Optimizing query performance...');
  const queryResult = await dataOptimizer.optimizeQueryPerformance(mockQueries);
  console.log(`✅ Average query time: ${queryResult.queryTime.toFixed(1)}ms`);
  console.log(`   Index optimizations: ${queryResult.indexOptimization.length}`);
  console.log(`   Cache utilization: ${(queryResult.cacheUtilization * 100).toFixed(1)}%`);
  
  console.log('Implementing connection pooling...');
  const poolResult = await dataOptimizer.implementConnectionPooling([
    { id: 'conn1', type: 'database', isActive: true, lastUsed: new Date() },
    { id: 'conn2', type: 'database', isActive: false, lastUsed: new Date() },
  ]);
  console.log(`✅ Connection pool: ${poolResult.minConnections}-${poolResult.maxConnections} connections`);
  console.log(`   Health check interval: ${poolResult.healthCheckInterval / 1000}s\n`);

  // Demo 4: WASM Performance Optimization
  console.log('⚡ Demo 4: WASM Integration Performance Optimization');
  console.log('=' .repeat(60));
  
  const mockModules = [
    { name: 'neural-compute', size: 2 * 1024 * 1024, compilationTime: 150, instantiated: false },
    { name: 'vector-ops', size: 1024 * 1024, compilationTime: 80, instantiated: false },
    { name: 'matrix-math', size: 3 * 1024 * 1024, compilationTime: 200, instantiated: true },
  ];

  console.log('Optimizing WASM module loading...');
  const loadingResult = await wasmOptimizer.optimizeWasmModuleLoading(mockModules);
  console.log(`✅ Module load time: ${loadingResult.loadTime.toFixed(1)}ms`);
  console.log(`   Streaming enabled: ${loadingResult.streamingEnabled}`);
  console.log(`   Preload strategy: ${loadingResult.preloadStrategy}`);
  
  console.log('Enabling SIMD acceleration...');
  const simdResult = await wasmOptimizer.enableSIMDAcceleration([
    { name: 'vector-add', operations: ['add', 'multiply'], simdOptimized: false },
    { name: 'matrix-mult', operations: ['dot_product', 'matrix_multiply'], simdOptimized: false },
  ]);
  console.log(`✅ SIMD support: ${simdResult.simdSupport}`);
  console.log(`   Performance gain: ${simdResult.performanceGain.toFixed(1)}x`);
  console.log(`   Vectorization level: ${simdResult.vectorizationLevel}\n`);

  // Demo 5: Comprehensive System Optimization
  console.log('🎯 Demo 5: Comprehensive System Performance Optimization');
  console.log('=' .repeat(60));
  
  console.log('Running system-wide performance optimization...');
  const systemResults = await performanceOptimizer.optimizeNow();
  
  console.log(`✅ Optimization completed: ${systemResults.length} optimizations performed`);
  const successfulOptimizations = systemResults.filter(r => r.success);
  const averageImprovement = successfulOptimizations.reduce((sum, r) => sum + r.improvement, 0) / successfulOptimizations.length;
  
  console.log(`   Successful optimizations: ${successfulOptimizations.length}/${systemResults.length}`);
  console.log(`   Average improvement: ${(averageImprovement * 100).toFixed(1)}%`);
  
  const systemState = await performanceOptimizer.getPerformanceState();
  console.log(`   System latency: ${systemState.overall.latency.toFixed(1)}ms`);
  console.log(`   System throughput: ${systemState.overall.throughput.toFixed(0)} req/sec`);
  console.log(`   Memory usage: ${(systemState.overall.memoryUsage * 100).toFixed(1)}%`);
  console.log(`   CPU usage: ${(systemState.overall.cpuUsage * 100).toFixed(1)}%\n`);

  // Demo 6: Performance Benchmarking
  console.log('📈 Demo 6: Performance Benchmarking Suite');
  console.log('=' .repeat(60));
  
  const benchmarkSuite = new PerformanceBenchmarkSuite({
    neural: neuralOptimizer,
    swarm: swarmOptimizer,
    data: dataOptimizer,
    wasm: wasmOptimizer,
  });

  console.log('Running comprehensive performance benchmarks...');
  const benchmarkResults = await benchmarkSuite.runBenchmarks();
  
  console.log(`✅ Benchmark completed: ${benchmarkResults.overall.totalTests} tests`);
  console.log(`   Passed: ${benchmarkResults.overall.passed}, Failed: ${benchmarkResults.overall.failed}`);
  console.log(`   Targets met: ${benchmarkResults.overall.targetsMet}/${benchmarkResults.overall.totalTests}`);
  console.log(`   Average improvement: ${(benchmarkResults.overall.averageImprovement * 100).toFixed(1)}%`);
  console.log(`   Execution time: ${(benchmarkResults.executionTime / 1000).toFixed(1)}s\n`);

  // Demo 7: Real-time Monitoring
  console.log('📊 Demo 7: Real-time Performance Monitoring');
  console.log('=' .repeat(60));
  
  console.log('Starting performance monitoring...');
  monitor.startMonitoring();

  // Simulate some performance data
  monitor.recordMetrics('neural', {
    latency: 45,
    throughput: 800,
    memoryUsage: 0.75,
    cpuUsage: 0.65,
    errorRate: 0.002,
    timestamp: new Date(),
  });

  monitor.recordMetrics('swarm', {
    latency: 8,
    throughput: 5000,
    memoryUsage: 0.45,
    cpuUsage: 0.35,
    errorRate: 0.001,
    timestamp: new Date(),
  });

  const dashboard = monitor.getDashboard();
  console.log(`✅ Monitoring active - Current system health: ${dashboard.systemHealth.overall}`);
  console.log(`   Active alerts: ${dashboard.alerts.length}`);
  console.log(`   Optimization recommendations: ${dashboard.recommendations.length}`);
  
  if (dashboard.recommendations.length > 0) {
    console.log('   Top recommendation:', dashboard.recommendations[0].description);
  }

  // Wait a moment then stop monitoring
  setTimeout(() => {
    monitor.stopMonitoring();
    console.log('   Monitoring stopped\n');
  }, 2000);

  // Summary
  console.log('🎉 Performance Optimization Demo Complete!');
  console.log('=' .repeat(60));
  console.log('✅ All optimization systems successfully demonstrated:');
  console.log('   • Neural network training and inference optimization');
  console.log('   • Swarm coordination message routing and caching');
  console.log('   • Database query performance and connection pooling');
  console.log('   • WASM module loading and SIMD acceleration');
  console.log('   • System-wide performance coordination');
  console.log('   • Comprehensive performance benchmarking');
  console.log('   • Real-time performance monitoring and alerting');
  console.log('\n🚀 Claude-Zen is now optimized for maximum performance!');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runOptimizationDemo().catch(console.error);
}

export { runOptimizationDemo };