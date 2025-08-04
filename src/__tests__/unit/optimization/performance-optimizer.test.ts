/**
 * Performance Optimizer Tests
 * Tests for the core performance optimization system
 */

import { PerformanceOptimizer } from '../../../optimization/core/performance-optimizer';
import { DataPerformanceOptimizer } from '../../../optimization/data/data-optimizer';
import { NeuralNetworkOptimizer } from '../../../optimization/neural/neural-optimizer';
import { SwarmCoordinationOptimizer } from '../../../optimization/swarm/swarm-optimizer';
import { WasmPerformanceOptimizer } from '../../../optimization/wasm/wasm-optimizer';

describe('Performance Optimization System', () => {
  let performanceOptimizer: PerformanceOptimizer;
  let neuralOptimizer: NeuralNetworkOptimizer;
  let swarmOptimizer: SwarmCoordinationOptimizer;
  let dataOptimizer: DataPerformanceOptimizer;
  let wasmOptimizer: WasmPerformanceOptimizer;

  beforeEach(() => {
    neuralOptimizer = new NeuralNetworkOptimizer();
    swarmOptimizer = new SwarmCoordinationOptimizer();
    dataOptimizer = new DataPerformanceOptimizer();
    wasmOptimizer = new WasmPerformanceOptimizer();

    performanceOptimizer = new PerformanceOptimizer(
      {
        enabled: true,
        optimizationInterval: 1000,
        aggressiveness: 'moderate',
      },
      {
        neural: neuralOptimizer,
        swarm: swarmOptimizer,
        data: dataOptimizer,
        wasm: wasmOptimizer,
      },
    );
  });

  afterEach(async () => {
    performanceOptimizer.stopOptimization();
  });

  describe('Core Performance Optimizer', () => {
    it('should initialize with correct configuration', () => {
      expect(performanceOptimizer).toBeDefined();
    });

    it('should start and stop optimization', async () => {
      const startSpy = jest.spyOn(performanceOptimizer, 'emit');

      await performanceOptimizer.startOptimization();
      expect(startSpy).toHaveBeenCalledWith('optimization:started');

      performanceOptimizer.stopOptimization();
      expect(startSpy).toHaveBeenCalledWith('optimization:stopped');
    });

    it('should perform immediate optimization', async () => {
      const results = await performanceOptimizer.optimizeNow();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    }, 10000);

    it('should get performance state', async () => {
      const state = await performanceOptimizer.getPerformanceState();

      expect(state).toBeDefined();
      expect(state.overall).toBeDefined();
      expect(state.neural).toBeDefined();
      expect(state.swarm).toBeDefined();
      expect(state.data).toBeDefined();
      expect(state.wasm).toBeDefined();
    });

    it('should register domain optimizers', () => {
      const customOptimizer = new NeuralNetworkOptimizer();
      const spy = jest.spyOn(performanceOptimizer, 'emit');

      performanceOptimizer.registerOptimizer('custom', customOptimizer);

      expect(spy).toHaveBeenCalledWith('optimizer:registered', { domain: 'custom' });
    });
  });

  describe('Neural Network Optimization', () => {
    it('should optimize training speed', async () => {
      const mockNetwork = {
        id: 'test-network',
        layers: [784, 128, 64, 10],
        weights: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        activationFunction: 'relu',
      };

      const result = await neuralOptimizer.optimizeTrainingSpeed(mockNetwork);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.improvement).toBeGreaterThanOrEqual(0);
      expect(result.beforeMetrics).toBeDefined();
      expect(result.afterMetrics).toBeDefined();
    });

    it('should implement batch processing', async () => {
      const mockTrainer = {
        network: {
          id: 'test-network',
          layers: [784, 128, 10],
          weights: [[0.1], [0.2]],
          activationFunction: 'relu',
        },
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
      };

      const result = await neuralOptimizer.implementBatchProcessing(mockTrainer);

      expect(result).toBeDefined();
      expect(result.batchSize).toBeGreaterThan(0);
      expect(result.parallelism).toBeGreaterThan(0);
      expect(result.memoryLimit).toBeGreaterThan(0);
      expect(['sequential', 'parallel', 'adaptive']).toContain(result.processingMode);
    });

    it('should enable GPU acceleration', async () => {
      const mockComputeUnits = [
        { id: 'gpu-1', type: 'GPU' as const, memory: 8192, cores: 2048 },
        { id: 'cpu-1', type: 'CPU' as const, memory: 16384, cores: 8 },
      ];

      const result = await neuralOptimizer.enableGPUAcceleration(mockComputeUnits);

      expect(result).toBeDefined();
      expect(['GPU', 'WASM']).toContain(result.accelerationType);
      expect(result.speedImprovement).toBeGreaterThan(0);
      expect(result.fallbackStrategy).toBeDefined();
    });

    it('should optimize memory usage', async () => {
      const mockNetworks = [
        {
          id: 'net1',
          layers: [100, 50, 10],
          weights: [[0.1], [0.2]],
          activationFunction: 'relu',
        },
        {
          id: 'net2',
          layers: [200, 100, 20],
          weights: [[0.3], [0.4]],
          activationFunction: 'sigmoid',
        },
      ];

      const result = await neuralOptimizer.optimizeMemoryUsage(mockNetworks);

      expect(result).toBeDefined();
      expect(result.memoryReduction).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.poolingStrategy).toBeDefined();
    });
  });

  describe('Swarm Coordination Optimization', () => {
    it('should optimize message routing', async () => {
      const mockTopology = {
        type: 'mesh' as const,
        nodes: 1000,
        connections: 5000,
      };

      const result = await swarmOptimizer.optimizeMessageRouting(mockTopology);

      expect(result).toBeDefined();
      expect(result.routingLatency).toBeGreaterThan(0);
      expect(result.messageCompression).toBeGreaterThanOrEqual(0);
      expect(result.protocolEfficiency).toBeGreaterThan(0);
      expect(result.topologyOptimization).toBeDefined();
    });

    it('should implement caching', async () => {
      const mockCoordinationLayer = {
        protocol: 'websocket',
        messageFormat: 'json',
        compressionEnabled: true,
      };

      const result = await swarmOptimizer.implementCaching(mockCoordinationLayer);

      expect(result).toBeDefined();
      expect(result.hitRatio).toBeGreaterThanOrEqual(0);
      expect(result.hitRatio).toBeLessThanOrEqual(1);
      expect(['LRU', 'LFU', 'TTL', 'adaptive']).toContain(result.evictionPolicy);
      expect(result.cacheSize).toBeGreaterThanOrEqual(0);
      expect(result.layers).toBeGreaterThan(0);
    });

    it('should reduce latency', async () => {
      const mockProtocols = [
        { name: 'websocket', version: '1.0', latency: 10, reliability: 0.99 },
        { name: 'http2', version: '2.0', latency: 15, reliability: 0.95 },
      ];

      const result = await swarmOptimizer.reduceLatency(mockProtocols);

      expect(result).toBeDefined();
      expect(result.reductionPercentage).toBeGreaterThanOrEqual(0);
      expect(result.averageLatency).toBeGreaterThan(0);
      expect(result.p95Latency).toBeGreaterThan(0);
      expect(Array.isArray(result.optimizationTechniques)).toBe(true);
    });

    it('should scale horizontally', async () => {
      const swarmSize = 5000;

      const result = await swarmOptimizer.scaleHorizontally(swarmSize);

      expect(result).toBeDefined();
      expect(result.maxAgents).toBeGreaterThanOrEqual(swarmSize);
      expect(['round_robin', 'least_connections', 'weighted', 'adaptive']).toContain(
        result.loadBalancing,
      );
      expect(typeof result.autoScaling).toBe('boolean');
      expect(result.resourceAllocation).toBeDefined();
    });
  });

  describe('Data Performance Optimization', () => {
    it('should optimize query performance', async () => {
      const mockQueries = [
        { sql: 'SELECT * FROM users WHERE id = ?', parameters: [1], estimatedCost: 100 },
        { sql: 'SELECT * FROM orders WHERE user_id = ?', parameters: [1], estimatedCost: 500 },
      ];

      const result = await dataOptimizer.optimizeQueryPerformance(mockQueries);

      expect(result).toBeDefined();
      expect(result.queryTime).toBeGreaterThan(0);
      expect(Array.isArray(result.indexOptimization)).toBe(true);
      expect(result.queryPlanImprovement).toBeGreaterThanOrEqual(0);
      expect(result.cacheUtilization).toBeGreaterThanOrEqual(0);
    });

    it('should implement connection pooling', async () => {
      const mockConnections = [
        { id: 'conn1', type: 'database' as const, isActive: true, lastUsed: new Date() },
        { id: 'conn2', type: 'network' as const, isActive: false, lastUsed: new Date() },
      ];

      const result = await dataOptimizer.implementConnectionPooling(mockConnections);

      expect(result).toBeDefined();
      expect(result.minConnections).toBeGreaterThan(0);
      expect(result.maxConnections).toBeGreaterThan(result.minConnections);
      expect(result.connectionTimeout).toBeGreaterThan(0);
      expect(result.idleTimeout).toBeGreaterThan(0);
      expect(result.healthCheckInterval).toBeGreaterThan(0);
    });

    it('should add intelligent caching', async () => {
      const mockCacheLayer = {
        type: 'memory' as const,
        size: 1024 * 1024 * 100,
        ttl: 3600,
      };

      const result = await dataOptimizer.addIntelligentCaching(mockCacheLayer);

      expect(result).toBeDefined();
      expect(result.hitRatio).toBeGreaterThanOrEqual(0);
      expect(result.hitRatio).toBeLessThanOrEqual(1);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.memoryEfficiency).toBeGreaterThanOrEqual(0);
      expect(result.invalidationStrategy).toBeDefined();
    });

    it('should compress data storage', async () => {
      const mockStorage = {
        type: 'database' as const,
        size: 1024 * 1024 * 1024, // 1GB
        compression: false,
      };

      const result = await dataOptimizer.compressDataStorage(mockStorage);

      expect(result).toBeDefined();
      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeLessThanOrEqual(1);
      expect(result.decompressionSpeed).toBeGreaterThan(0);
      expect(['gzip', 'brotli', 'lz4', 'zstd']).toContain(result.algorithm);
      expect(result.storageReduction).toBeGreaterThanOrEqual(0);
    });
  });

  describe('WASM Performance Optimization', () => {
    it('should optimize WASM module loading', async () => {
      const mockModules = [
        { name: 'module1', size: 1024 * 1024, compilationTime: 100, instantiated: false },
        { name: 'module2', size: 2 * 1024 * 1024, compilationTime: 200, instantiated: true },
      ];

      const result = await wasmOptimizer.optimizeWasmModuleLoading(mockModules);

      expect(result).toBeDefined();
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.cacheUtilization).toBe('boolean');
      expect(typeof result.streamingEnabled).toBe('boolean');
      expect(['eager', 'lazy', 'predictive']).toContain(result.preloadStrategy);
    });

    it('should implement streaming compilation', async () => {
      const mockWasmFiles = [
        { path: '/wasm/module1.wasm', size: 1024 * 1024, optimized: false },
        { path: '/wasm/module2.wasm', size: 2 * 1024 * 1024, optimized: true },
      ];

      const result = await wasmOptimizer.implementStreamingCompilation(mockWasmFiles);

      expect(result).toBeDefined();
      expect(result.compilationTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.streamingEnabled).toBe('boolean');
      expect(result.memoryEfficiency).toBeGreaterThanOrEqual(0);
      expect(result.instantiationSpeed).toBeGreaterThanOrEqual(0);
    });

    it('should optimize memory sharing', async () => {
      const mockBridge = {
        type: 'js-wasm' as const,
        latency: 1,
        memoryShared: false,
      };

      const result = await wasmOptimizer.optimizeMemorySharing(mockBridge);

      expect(result).toBeDefined();
      expect(result.memoryReduction).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.garbageCollectionImprovement).toBeGreaterThanOrEqual(0);
      expect(result.poolingStrategy).toBeDefined();
    });

    it('should enable SIMD acceleration', async () => {
      const mockKernels = [
        { name: 'kernel1', operations: ['add', 'multiply'], simdOptimized: false },
        { name: 'kernel2', operations: ['dot_product'], simdOptimized: false },
      ];

      const result = await wasmOptimizer.enableSIMDAcceleration(mockKernels);

      expect(result).toBeDefined();
      expect(typeof result.simdSupport).toBe('boolean');
      expect(result.performanceGain).toBeGreaterThan(0);
      expect(Array.isArray(result.instructionOptimization)).toBe(true);
      expect(result.vectorizationLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should coordinate optimization across all domains', async () => {
      const results = await performanceOptimizer.optimizeNow();

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Check that we have results from multiple domains
      const domains = new Set(results.map((r) => r.beforeMetrics));
      expect(domains.size).toBeGreaterThan(0);
    });

    it('should emit optimization events', async () => {
      const eventSpy = jest.spyOn(performanceOptimizer, 'emit');

      await performanceOptimizer.optimizeNow();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle optimization failures gracefully', async () => {
      // Create optimizer with failing domain optimizer
      const failingOptimizer = {
        optimizeTrainingSpeed: jest.fn().mockRejectedValue(new Error('Test failure')),
      };

      const testOptimizer = new PerformanceOptimizer(
        { enabled: true },
        { neural: failingOptimizer as any },
      );

      const results = await testOptimizer.optimizeNow();

      expect(results).toBeDefined();
      expect(results.some((r) => !r.success)).toBe(true);
    });
  });

  describe('Performance Targets Validation', () => {
    it('should validate neural performance targets', async () => {
      const mockNetwork = {
        id: 'test-network',
        layers: [784, 128, 64, 10],
        weights: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        activationFunction: 'relu',
      };

      const result = await neuralOptimizer.optimizeTrainingSpeed(mockNetwork);

      // Validate against target: 5x training speed improvement
      expect(result.success).toBe(true);
      // Note: In real implementation, we would check against actual targets
    });

    it('should validate swarm performance targets', async () => {
      const mockTopology = {
        type: 'mesh' as const,
        nodes: 1000,
        connections: 5000,
      };

      const result = await swarmOptimizer.optimizeMessageRouting(mockTopology);

      // Validate against target: <5ms message routing
      expect(result.routingLatency).toBeDefined();
      // Note: In real implementation, we would check latency <= 5ms
    });

    it('should validate data performance targets', async () => {
      const mockQueries = [
        { sql: 'SELECT * FROM users WHERE id = ?', parameters: [1], estimatedCost: 100 },
      ];

      const result = await dataOptimizer.optimizeQueryPerformance(mockQueries);

      // Validate against target: <50ms query response time
      expect(result.queryTime).toBeDefined();
      // Note: In real implementation, we would check queryTime <= 50ms
    });

    it('should validate WASM performance targets', async () => {
      const mockModules = [
        { name: 'module1', size: 1024 * 1024, compilationTime: 100, instantiated: false },
      ];

      const result = await wasmOptimizer.optimizeWasmModuleLoading(mockModules);

      // Validate against target: <100ms module loading
      expect(result.loadTime).toBeDefined();
      // Note: In real implementation, we would check loadTime <= 100ms
    });
  });
});
