#!/usr/bin/env node

/**
 * Performance Optimization Demo
 * Demonstrates the comprehensive performance optimization capabilities
 */

import {
  DataPerformanceOptimizer,
  NeuralNetworkOptimizer,
  OptimizationMonitor,
  PerformanceBenchmarkSuite,
  PerformanceOptimizer,
  SwarmCoordinationOptimizer,
  WasmPerformanceOptimizer,
} from '../src/optimization/index.js';

async function runOptimizationDemo() {
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

  const mockNetwork = {
    id: 'demo-network',
    layers: [784, 256, 128, 64, 10],
    weights: Array(5)
      .fill(0)
      .map(() =>
        Array(100)
          .fill(0)
          .map(() => Math.random())
      ),
    activationFunction: 'relu',
  };
  const _neuralResult = await neuralOptimizer.optimizeTrainingSpeed(mockNetwork);

  const _batchResult = await neuralOptimizer.implementBatchProcessing({
    network: mockNetwork,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
  });

  const mockTopology = {
    type: 'mesh' as const,
    nodes: 5000,
    connections: 25000,
  };
  const _routingResult = await swarmOptimizer.optimizeMessageRouting(mockTopology);

  const _cacheResult = await swarmOptimizer.implementCaching({
    protocol: 'websocket',
    messageFormat: 'json',
    compressionEnabled: true,
  });

  const mockQueries = [
    {
      sql: 'SELECT * FROM users WHERE active = ? ORDER BY created_at DESC LIMIT 100',
      parameters: [true],
      estimatedCost: 500,
    },
    {
      sql: 'SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = ?',
      parameters: [123, 'completed'],
      estimatedCost: 200,
    },
    {
      sql: 'UPDATE user_stats SET last_login = ? WHERE user_id = ?',
      parameters: [new Date(), 123],
      estimatedCost: 50,
    },
  ];
  const _queryResult = await dataOptimizer.optimizeQueryPerformance(mockQueries);
  const _poolResult = await dataOptimizer.implementConnectionPooling([
    { id: 'conn1', type: 'database', isActive: true, lastUsed: new Date() },
    { id: 'conn2', type: 'database', isActive: false, lastUsed: new Date() },
  ]);

  const mockModules = [
    { name: 'neural-compute', size: 2 * 1024 * 1024, compilationTime: 150, instantiated: false },
    { name: 'vector-ops', size: 1024 * 1024, compilationTime: 80, instantiated: false },
    { name: 'matrix-math', size: 3 * 1024 * 1024, compilationTime: 200, instantiated: true },
  ];
  const _loadingResult = await wasmOptimizer.optimizeWasmModuleLoading(mockModules);
  const _simdResult = await wasmOptimizer.enableSIMDAcceleration([
    { name: 'vector-add', operations: ['add', 'multiply'], simdOptimized: false },
    { name: 'matrix-mult', operations: ['dot_product', 'matrix_multiply'], simdOptimized: false },
  ]);
  const systemResults = await performanceOptimizer.optimizeNow();
  const successfulOptimizations = systemResults.filter((r) => r.success);
  const _averageImprovement =
    successfulOptimizations.reduce((sum, r) => sum + r.improvement, 0) /
    successfulOptimizations.length;

  const _systemState = await performanceOptimizer.getPerformanceState();

  const benchmarkSuite = new PerformanceBenchmarkSuite({
    neural: neuralOptimizer,
    swarm: swarmOptimizer,
    data: dataOptimizer,
    wasm: wasmOptimizer,
  });
  const _benchmarkResults = await benchmarkSuite.runBenchmarks();
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

  if (dashboard.recommendations.length > 0) {
  }

  // Wait a moment then stop monitoring
  setTimeout(() => {
    monitor.stopMonitoring();
  }, 2000);
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runOptimizationDemo().catch(console.error);
}

export { runOptimizationDemo };
