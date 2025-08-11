/**
 * Comprehensive Performance Benchmarking Tests
 * Measures and validates performance targets across all components
 */

import os from 'node:os';
import { performance } from 'node:perf_hooks';
import v8 from 'node:v8';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ZenSwarm } from '../../src/index-enhanced.js';

// Performance targets based on documentation
const PERFORMANCE_TARGETS = {
  initialization: {
    minimal: 50, // ms
    standard: 200, // ms
    full: 500, // ms
  },
  agentCreation: {
    single: 5, // ms
    batch: 50, // ms for 10 agents
  },
  neuralInference: {
    small: 1, // ms (< 1000 params)
    medium: 5, // ms (1K-100K params)
    large: 50, // ms (> 100K params)
  },
  memoryOverhead: {
    perAgent: 1024, // KB
    perNetwork: 5120, // KB
  },
  throughput: {
    vectorOps: 1000, // million ops/sec
    matrixOps: 100, // million ops/sec
    messages: 10000, // messages/sec
  },
};

describe('Comprehensive Performance Benchmarks', () => {
  let ruvSwarm;
  let systemInfo;

  beforeAll(async () => {
    // Collect system information
    systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0].model,
      totalMemory: os.totalmem(),
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      heapStatistics: v8.getHeapStatistics(),
    };

    // Initialize ZenSwarm for benchmarking
    ruvSwarm = await ZenSwarm.initialize({
      loadingStrategy: 'full',
      enablePersistence: false,
      enableNeuralNetworks: true,
      enableForecasting: true,
      useSIMD: true,
      debug: false,
    });
  });

  afterAll(async () => {
    if (ruvSwarm) {
      await ruvSwarm.cleanup();
    }
  });

  describe('Initialization Benchmarks', () => {
    it('should benchmark minimal initialization', async () => {
      const runs = 10;
      const times = [];

      for (let i = 0; i < runs; i++) {
        const start = performance.now();
        const instance = await ZenSwarm.initialize({
          loadingStrategy: 'minimal',
          enablePersistence: false,
          enableNeuralNetworks: false,
          enableForecasting: false,
        });
        const time = performance.now() - start;
        times.push(time);
        await instance.cleanup();
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const _minTime = Math.min(...times);
      const _maxTime = Math.max(...times);
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.initialization.minimal);
    });

    it('should benchmark progressive loading', async () => {
      const start = performance.now();
      const instance = await ZenSwarm.initialize({
        loadingStrategy: 'progressive',
        enablePersistence: true,
        enableNeuralNetworks: true,
        enableForecasting: false,
      });

      const coreLoadTime = performance.now() - start;

      // Load additional modules
      const forecastingStart = performance.now();
      await instance.enableForecasting();
      const forecastingLoadTime = performance.now() - forecastingStart;

      expect(coreLoadTime).toBeLessThan(
        PERFORMANCE_TARGETS.initialization.standard,
      );
      expect(forecastingLoadTime).toBeLessThan(100);

      await instance.cleanup();
    });
  });

  describe('Agent Performance Benchmarks', () => {
    it('should benchmark single agent creation', async () => {
      const swarm = await ruvSwarm.createSwarm({
        name: 'benchmark-swarm',
        maxAgents: 100,
      });

      const runs = 100;
      const times = [];

      for (let i = 0; i < runs; i++) {
        const start = performance.now();
        const agent = await swarm.spawn({ type: 'researcher' });
        const time = performance.now() - start;
        times.push(time);
        await agent.remove();
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const _p95Time = times.sort((a, b) => a - b)[Math.floor(runs * 0.95)];
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.agentCreation.single);
    });

    it('should benchmark batch agent creation', async () => {
      const swarm = await ruvSwarm.createSwarm({
        name: 'batch-benchmark-swarm',
        maxAgents: 50,
      });

      const batchSizes = [10, 20, 50];
      const results = [];

      for (const batchSize of batchSizes) {
        const start = performance.now();
        const agents = await Promise.all(
          Array(batchSize)
            .fill(null)
            .map((_, i) =>
              swarm.spawn({ type: ['researcher', 'coder', 'analyst'][i % 3] }),
            ),
        );
        const time = performance.now() - start;

        results.push({
          batchSize,
          totalTime: time,
          perAgent: time / batchSize,
        });

        // Clean up
        await Promise.all(agents.map((a) => a.remove()));
      }
      results.forEach((_r) => {});

      expect(results[0].totalTime).toBeLessThan(
        PERFORMANCE_TARGETS.agentCreation.batch,
      );
    });

    it('should benchmark agent communication', async () => {
      const swarm = await ruvSwarm.createSwarm({
        name: 'comm-benchmark-swarm',
        topology: 'mesh',
      });

      const agents = await Promise.all(
        Array(10)
          .fill(null)
          .map(() => swarm.spawn({ type: 'researcher' })),
      );

      const messageCount = 1000;
      const start = performance.now();

      // Send messages between agents
      const promises = [];
      for (let i = 0; i < messageCount; i++) {
        const from = agents[i % agents.length];
        const to = agents[(i + 1) % agents.length];
        promises.push(from.sendMessage(to.id, { type: 'test', data: i }));
      }

      await Promise.all(promises);
      const duration = performance.now() - start;
      const throughput = messageCount / (duration / 1000);
      expect(throughput).toBeGreaterThan(
        PERFORMANCE_TARGETS.throughput.messages,
      );
    });
  });

  describe('Neural Network Performance Benchmarks', () => {
    it('should benchmark small network inference', async () => {
      const network = await ruvSwarm.neuralManager.createNetwork({
        type: 'mlp',
        layers: [
          { units: 10, activation: 'relu' },
          { units: 5, activation: 'softmax' },
        ],
      });

      const input = new Float32Array(10).fill(0.5);
      const runs = 1000;

      // Warm up
      for (let i = 0; i < 10; i++) {
        await network.predict(input);
      }

      const start = performance.now();
      for (let i = 0; i < runs; i++) {
        await network.predict(input);
      }
      const duration = performance.now() - start;
      const avgTime = duration / runs;
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.neuralInference.small);
    });

    it('should benchmark medium network inference', async () => {
      const network = await ruvSwarm.neuralManager.createNetwork({
        type: 'lstm',
        inputSize: 100,
        hiddenSize: 128,
        outputSize: 50,
        layers: 2,
      });

      const input = new Float32Array(100).fill(0.5);
      const runs = 100;

      // Warm up
      for (let i = 0; i < 5; i++) {
        await network.predict(input);
      }

      const start = performance.now();
      for (let i = 0; i < runs; i++) {
        await network.predict(input);
      }
      const duration = performance.now() - start;
      const avgTime = duration / runs;
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.neuralInference.medium);
    });

    it('should benchmark large network inference', async () => {
      const network = await ruvSwarm.neuralManager.createNetwork({
        type: 'transformer',
        inputSize: 512,
        hiddenSize: 512,
        numHeads: 8,
        numLayers: 6,
        outputSize: 512,
      });

      const input = new Float32Array(512).fill(0.5);
      const runs = 10;

      const start = performance.now();
      for (let i = 0; i < runs; i++) {
        await network.predict(input);
      }
      const duration = performance.now() - start;
      const avgTime = duration / runs;
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.neuralInference.large);
    });

    it('should benchmark batch inference', async () => {
      const network = await ruvSwarm.neuralManager.createNetwork({
        type: 'mlp',
        layers: [
          { units: 100, activation: 'relu' },
          { units: 50, activation: 'relu' },
          { units: 10, activation: 'softmax' },
        ],
      });

      const batchSizes = [1, 10, 32, 64];
      const results = [];

      for (const batchSize of batchSizes) {
        const inputs = Array(batchSize)
          .fill(null)
          .map(() => new Float32Array(100).fill(0.5));

        const start = performance.now();
        const _outputs = await network.predictBatch(inputs);
        const time = performance.now() - start;

        results.push({
          batchSize,
          totalTime: time,
          perSample: time / batchSize,
        });
      }
      results.forEach((_r) => {});

      // Batch processing should be more efficient
      expect(results[3].perSample).toBeLessThan(results[0].perSample * 0.5);
    });
  });

  describe('SIMD Performance Benchmarks', () => {
    it('should benchmark SIMD vs non-SIMD vector operations', async () => {
      const size = 1000000;
      const a = new Float32Array(size).map(() => Math.random());
      const b = new Float32Array(size).map(() => Math.random());

      // Non-SIMD benchmark
      const nonSimdStart = performance.now();
      const _nonSimdResult = await ruvSwarm.wasmLoader.vectorAddNonSIMD(a, b);
      const nonSimdTime = performance.now() - nonSimdStart;

      // SIMD benchmark
      const simdStart = performance.now();
      const _simdResult = await ruvSwarm.wasmLoader.vectorAddSIMD(a, b);
      const simdTime = performance.now() - simdStart;

      const speedup = nonSimdTime / simdTime;
      const _throughputNonSimd =
        (size * 4) / 1024 / 1024 / (nonSimdTime / 1000); // MB/s
      const _throughputSimd = (size * 4) / 1024 / 1024 / (simdTime / 1000); // MB/s

      if (ruvSwarm.features.simd) {
        expect(speedup).toBeGreaterThan(2);
      }
    });

    it('should benchmark SIMD matrix multiplication', async () => {
      const sizes = [100, 200, 500];
      const results = [];

      for (const size of sizes) {
        const a = new Float32Array(size * size).map(() => Math.random());
        const b = new Float32Array(size * size).map(() => Math.random());

        // SIMD matrix multiplication
        const start = performance.now();
        const _result = await ruvSwarm.wasmLoader.matrixMultiplySIMD(
          a,
          size,
          size,
          b,
          size,
          size,
        );
        const time = performance.now() - start;

        const gflops = (2 * size ** 3) / 1e9 / (time / 1000);

        results.push({ size, time, gflops });
      }
      results.forEach((_r) => {});

      // Should achieve reasonable GFLOPS
      expect(results[0].gflops).toBeGreaterThan(1);
    });
  });

  describe('Memory Performance Benchmarks', () => {
    it('should benchmark memory allocation performance', async () => {
      const sizes = [1024, 10240, 102400, 1048576]; // 1KB to 1MB
      const results = [];

      for (const size of sizes) {
        const iterations = Math.max(10, 10000 / size);

        const start = performance.now();
        const allocations = [];

        for (let i = 0; i < iterations; i++) {
          const ptr = await ruvSwarm.wasmLoader.allocate(size);
          allocations.push(ptr);
        }

        const allocTime = performance.now() - start;

        const deallocStart = performance.now();
        for (const ptr of allocations) {
          await ruvSwarm.wasmLoader.deallocate(ptr);
        }
        const deallocTime = performance.now() - deallocStart;

        results.push({
          size,
          iterations,
          allocPerOp: allocTime / iterations,
          deallocPerOp: deallocTime / iterations,
        });
      }
      results.forEach((_r) => {});

      // Small allocations should be fast
      expect(results[0].allocPerOp).toBeLessThan(0.1);
    });

    it('should benchmark memory transfer performance', async () => {
      const sizes = [1024, 10240, 102400, 1048576, 10485760]; // 1KB to 10MB
      const results = [];

      for (const size of sizes) {
        const data = new Float32Array(size / 4).fill(1.0);

        // JS to WASM
        const uploadStart = performance.now();
        const ptr = await ruvSwarm.wasmLoader.uploadData(data);
        const uploadTime = performance.now() - uploadStart;

        // WASM to JS
        const downloadStart = performance.now();
        const _result = await ruvSwarm.wasmLoader.downloadData(ptr, size / 4);
        const downloadTime = performance.now() - downloadStart;

        await ruvSwarm.wasmLoader.deallocate(ptr);

        const uploadThroughput = size / 1024 / 1024 / (uploadTime / 1000);
        const downloadThroughput = size / 1024 / 1024 / (downloadTime / 1000);

        results.push({
          size,
          uploadTime,
          downloadTime,
          uploadThroughput,
          downloadThroughput,
        });
      }
      results.forEach((_r) => {});

      // Should achieve good throughput for large transfers
      expect(results[4].uploadThroughput).toBeGreaterThan(100);
      expect(results[4].downloadThroughput).toBeGreaterThan(100);
    });

    it('should measure memory overhead', async () => {
      const initialMemory = await ruvSwarm.getMemoryUsage();

      // Create agents and measure memory
      const swarm = await ruvSwarm.createSwarm({ name: 'memory-test' });
      const agents = [];

      for (let i = 0; i < 10; i++) {
        agents.push(await swarm.spawn({ type: 'researcher' }));
      }

      const afterAgentsMemory = await ruvSwarm.getMemoryUsage();
      const agentMemoryOverhead =
        (afterAgentsMemory.total - initialMemory.total) / agents.length / 1024;

      // Create neural networks and measure memory
      const networks = [];

      for (let i = 0; i < 5; i++) {
        networks.push(
          await ruvSwarm.neuralManager.createNetwork({
            type: 'mlp',
            layers: [
              { units: 100, activation: 'relu' },
              { units: 50, activation: 'relu' },
              { units: 10, activation: 'softmax' },
            ],
          }),
        );
      }

      const afterNetworksMemory = await ruvSwarm.getMemoryUsage();
      const networkMemoryOverhead =
        (afterNetworksMemory.total - afterAgentsMemory.total) /
        networks.length /
        1024;

      expect(agentMemoryOverhead).toBeLessThan(
        PERFORMANCE_TARGETS.memoryOverhead.perAgent,
      );
      expect(networkMemoryOverhead).toBeLessThan(
        PERFORMANCE_TARGETS.memoryOverhead.perNetwork,
      );
    });
  });

  describe('Swarm Orchestration Performance', () => {
    it('should benchmark task orchestration scalability', async () => {
      const swarmSizes = [5, 10, 20];
      const results = [];

      for (const size of swarmSizes) {
        const swarm = await ruvSwarm.createSwarm({
          name: `scale-test-${size}`,
          maxAgents: size,
          topology: 'hierarchical',
        });

        // Spawn agents
        await Promise.all(
          Array(size)
            .fill(null)
            .map(() => swarm.spawn({ type: 'analyst' })),
        );

        // Create tasks
        const taskCount = size * 10;
        const tasks = Array(taskCount)
          .fill(null)
          .map((_, i) => ({
            id: `task-${i}`,
            type: 'compute',
            complexity: Math.random(),
          }));

        const start = performance.now();
        const _result = await swarm.orchestrate({
          tasks,
          strategy: 'parallel',
        });
        const duration = performance.now() - start;

        results.push({
          swarmSize: size,
          taskCount,
          duration,
          throughput: taskCount / (duration / 1000),
        });
      }
      results.forEach((_r) => {});

      // Throughput should scale with swarm size
      expect(results[2].throughput).toBeGreaterThan(results[0].throughput * 2);
    });

    it('should benchmark topology performance differences', async () => {
      const topologies = ['mesh', 'star', 'ring', 'hierarchical'];
      const results = [];

      for (const topology of topologies) {
        const swarm = await ruvSwarm.createSwarm({
          name: `topology-${topology}`,
          topology,
          maxAgents: 10,
        });

        // Spawn agents
        const _agents = await Promise.all(
          Array(10)
            .fill(null)
            .map(() => swarm.spawn({ type: 'researcher' })),
        );

        // Measure broadcast performance
        const broadcastStart = performance.now();
        await swarm.broadcast({ type: 'update', data: 'test' });
        const broadcastTime = performance.now() - broadcastStart;

        // Measure task distribution
        const tasks = Array(50)
          .fill(null)
          .map((_, i) => ({ id: i }));
        const orchestrateStart = performance.now();
        await swarm.orchestrate({ tasks, strategy: 'parallel' });
        const orchestrateTime = performance.now() - orchestrateStart;

        results.push({
          topology,
          broadcastTime,
          orchestrateTime,
          efficiency: tasks.length / orchestrateTime,
        });
      }
      results.forEach((_r) => {});

      // Different topologies should have different characteristics
      const meshResult = results.find((r) => r.topology === 'mesh');
      const starResult = results.find((r) => r.topology === 'star');

      // Star should have faster broadcast
      expect(starResult.broadcastTime).toBeLessThan(meshResult.broadcastTime);
    });
  });

  describe('End-to-End Performance Scenarios', () => {
    it('should benchmark complete ML pipeline performance', async () => {
      const pipelineStart = performance.now();
      const stages = {};

      // Stage 1: Data generation
      const dataStart = performance.now();
      const dataset = {
        inputs: Array(1000)
          .fill(null)
          .map(() => new Float32Array(50).map(() => Math.random())),
        targets: Array(1000)
          .fill(null)
          .map(() => {
            const target = new Float32Array(10).fill(0);
            target[Math.floor(Math.random() * 10)] = 1;
            return target;
          }),
      };
      stages.dataGeneration = performance.now() - dataStart;

      // Stage 2: Network creation
      const networkStart = performance.now();
      const network = await ruvSwarm.neuralManager.createNetwork({
        type: 'mlp',
        layers: [
          { units: 50, activation: 'relu' },
          { units: 100, activation: 'relu' },
          { units: 50, activation: 'relu' },
          { units: 10, activation: 'softmax' },
        ],
      });
      stages.networkCreation = performance.now() - networkStart;

      // Stage 3: Training
      const trainingStart = performance.now();
      await network.train(dataset, {
        epochs: 10,
        batchSize: 32,
        learningRate: 0.01,
      });
      stages.training = performance.now() - trainingStart;

      // Stage 4: Evaluation
      const evalStart = performance.now();
      let correct = 0;
      for (let i = 0; i < 100; i++) {
        const prediction = await network.predict(dataset.inputs[i]);
        const predictedClass = prediction.indexOf(Math.max(...prediction));
        const actualClass = dataset.targets[i].indexOf(1);
        if (predictedClass === actualClass) {
          correct++;
        }
      }
      stages.evaluation = performance.now() - evalStart;

      const totalTime = performance.now() - pipelineStart;
      Object.entries(stages).forEach(([_stage, _time]) => {});

      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(correct).toBeGreaterThan(50); // Better than random
    });

    it('should benchmark real-time processing scenario', async () => {
      const swarm = await ruvSwarm.createSwarm({
        name: 'realtime-swarm',
        topology: 'star',
        maxAgents: 5,
      });

      // Create processing pipeline
      const agents = {
        ingestion: await swarm.spawn({
          type: 'researcher',
          role: 'data-ingestion',
        }),
        preprocessing: await swarm.spawn({
          type: 'analyst',
          role: 'preprocessing',
        }),
        inference: await swarm.spawn({ type: 'coder', role: 'inference' }),
        postprocessing: await swarm.spawn({
          type: 'analyst',
          role: 'postprocessing',
        }),
        output: await swarm.spawn({ type: 'coordinator', role: 'output' }),
      };

      // Create neural network for inference
      const model = await ruvSwarm.neuralManager.createNetwork({
        type: 'lstm',
        inputSize: 20,
        hiddenSize: 50,
        outputSize: 5,
        layers: 1,
      });

      // Simulate real-time data stream
      const streamDuration = 5000; // 5 seconds
      const dataRate = 100; // Hz
      const latencies = [];
      let processed = 0;

      const startTime = performance.now();
      const interval = setInterval(async () => {
        const dataTimestamp = performance.now();

        // Process data through pipeline
        const data = new Float32Array(20).map(() => Math.random());

        const processedData = await agents.preprocessing.execute({
          task: 'preprocess',
          data,
        });

        const prediction = await model.predict(processedData.data || data);

        const _result = await agents.postprocessing.execute({
          task: 'postprocess',
          data: prediction,
        });

        const latency = performance.now() - dataTimestamp;
        latencies.push(latency);
        processed++;

        if (performance.now() - startTime > streamDuration) {
          clearInterval(interval);
        }
      }, 1000 / dataRate);

      // Wait for stream to complete
      await new Promise((resolve) => setTimeout(resolve, streamDuration + 100));

      const _avgLatency =
        latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[
        Math.floor(latencies.length * 0.95)
      ];
      const _p99Latency = latencies.sort((a, b) => a - b)[
        Math.floor(latencies.length * 0.99)
      ];
      const throughput = processed / (streamDuration / 1000);

      expect(throughput).toBeGreaterThan(dataRate * 0.95); // At least 95% of target rate
      expect(p95Latency).toBeLessThan(50); // P95 under 50ms
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate comprehensive performance report', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        system: systemInfo,
        benchmarks: {},
        summary: {},
      };

      // Save report to file
      const reportPath = path.join(process.cwd(), 'performance-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      expect(report).toBeDefined();
    });
  });
});
