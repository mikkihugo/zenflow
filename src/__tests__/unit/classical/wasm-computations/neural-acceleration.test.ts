/**
 * WASM Neural Acceleration Test Suite
 * Classical TDD approach - testing actual computation results and performance
 */

import { NeuralNetworkManager } from '../../../../neural/core/neural-network-manager.ts';
import { WasmNeuralAccelerator } from '../../../../neural/wasm/wasm-neural-accelerator';
import { NeuralTestDataGenerator, NeuralNetworkValidator, NeuralPerformanceTester, NeuralMathHelpers } from '../../../helpers/neural-test-helpers';
import { PerformanceMeasurement } from '../../../helpers/performance-measurement';

describe('WASM Neural Acceleration (Classical TDD)', () => {
  let wasmAccelerator: WasmNeuralAccelerator;
  let neuralManager: NeuralNetworkManager;
  let performance: PerformanceMeasurement;
  let testHelpers: NeuralTestDataGenerator;

  const WASM_PERFORMANCE_TARGETS = {
    matrixMultiplication: 10, // 10ms for 1000x1000 matrix
    convolution: 50, // 50ms for 224x224 image
    activation: 5, // 5ms for 10000 neurons
    backpropagation: 100, // 100ms for medium network
    memoryEfficiency: 0.9, // 90% memory efficiency vs native
  };

  beforeAll(async () => {
    performance = new PerformanceMeasurement();
    testHelpers = new NeuralTestDataGenerator();

    // Initialize WASM module
    wasmAccelerator = new WasmNeuralAccelerator();
    await wasmAccelerator.initialize();

    neuralManager = new NeuralNetworkManager({
      accelerator: wasmAccelerator,
      enableOptimizations: true,
    });
  });

  afterAll(async () => {
    await wasmAccelerator.cleanup();
  });

  describe('Matrix Operations Acceleration', () => {
    it('should accelerate large matrix multiplication operations', async () => {
      const matrixSizes = [100, 500, 1000, 2000];

      for (const size of matrixSizes) {
        const matrixA = NeuralMathHelpers.generateMatrix(size, size, 'random');
        const matrixB = NeuralMathHelpers.generateMatrix(size, size, 'random');

        // Native JavaScript implementation
        performance.start(`js-matrix-mult-${size}`);
        const jsResult = NeuralMathHelpers.matrixMultiply(matrixA, matrixB);
        performance.end(`js-matrix-mult-${size}`);

        // WASM accelerated implementation
        performance.start(`wasm-matrix-mult-${size}`);
        const wasmResult = await wasmAccelerator.multiplyMatrices(matrixA, matrixB);
        performance.end(`wasm-matrix-mult-${size}`);

        // Verify mathematical correctness
        const tolerance = 1e-10;
        expect(testHelpers.matricesEqual(jsResult, wasmResult, tolerance)).toBe(true);

        const jsTime = performance.getDuration(`js-matrix-mult-${size}`);
        const wasmTime = performance.getDuration(`wasm-matrix-mult-${size}`);

        // WASM should be significantly faster
        const speedup = jsTime / wasmTime;
        expect(speedup).toBeGreaterThan(2); // At least 2x speedup

        // Large matrices should meet performance targets
        if (size >= 1000) {
          expect(wasmTime).toBeLessThan(
            WASM_PERFORMANCE_TARGETS.matrixMultiplication * (size / 1000)
          );
        }
      }
    });

    it('should optimize memory layout for matrix operations', async () => {
      const size = 1000;
      const matrices = Array.from({ length: 5 }, () =>
        testHelpers.generateRandomMatrix(size, size)
      );

      const initialMemory = await wasmAccelerator.getMemoryUsage();

      performance.start('batch-matrix-operations');

      // Perform batch operations to test memory efficiency
      const results = [];
      for (let i = 0; i < matrices.length - 1; i++) {
        const result = await wasmAccelerator.multiplyMatrices(matrices[i], matrices[i + 1]);
        results.push(result);
      }

      performance.end('batch-matrix-operations');

      const finalMemory = await wasmAccelerator.getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory usage should be reasonable
      const expectedMemory = size * size * 4 * matrices.length; // 4 bytes per float
      const memoryEfficiency = expectedMemory / memoryIncrease;

      expect(memoryEfficiency).toBeGreaterThan(WASM_PERFORMANCE_TARGETS.memoryEfficiency);

      const totalTime = performance.getDuration('batch-matrix-operations');
      expect(totalTime).toBeLessThan(5000); // 5 seconds for batch operations
    });

    it('should handle sparse matrix operations efficiently', async () => {
      const size = 2000;
      const sparsity = 0.95; // 95% zeros

      const sparseMatrix = testHelpers.generateSparseMatrix(size, size, sparsity);
      const denseVector = testHelpers.generateRandomVector(size);

      performance.start('sparse-matrix-vector-mult');

      const result = await wasmAccelerator.multiplyMatrixVector(sparseMatrix, denseVector, {
        sparse: true,
      });

      performance.end('sparse-matrix-vector-mult');

      expect(result.length).toBe(size);

      // Verify mathematical correctness with reference implementation
      const referenceResult = testHelpers.multiplyMatrixVectorJS(sparseMatrix, denseVector);
      expect(testHelpers.vectorsEqual(result, referenceResult, 1e-10)).toBe(true);

      const sparseTime = performance.getDuration('sparse-matrix-vector-mult');

      // Sparse operations should be much faster than dense
      expect(sparseTime).toBeLessThan(50); // 50ms for large sparse operation
    });
  });

  describe('Neural Network Forward Pass Acceleration', () => {
    it('should accelerate feed-forward neural network computations', async () => {
      const networkConfig = {
        layers: [784, 256, 128, 10], // MNIST-like network
        activation: 'relu',
        outputActivation: 'softmax',
      };

      const network = await neuralManager.createNetwork(networkConfig);
      const batchSize = 100;
      const inputBatch = testHelpers.generateRandomBatch(batchSize, 784);

      // JavaScript implementation
      performance.start('js-forward-pass');
      const jsOutputs = [];
      for (const input of inputBatch) {
        const output = await network.forwardPassJS(input);
        jsOutputs.push(output);
      }
      performance.end('js-forward-pass');

      // WASM accelerated implementation
      performance.start('wasm-forward-pass');
      const wasmOutputs = await wasmAccelerator.forwardPassBatch(
        network.getWeights(),
        inputBatch,
        networkConfig
      );
      performance.end('wasm-forward-pass');

      // Verify outputs match
      expect(jsOutputs.length).toBe(wasmOutputs.length);
      for (let i = 0; i < jsOutputs.length; i++) {
        expect(testHelpers.vectorsEqual(jsOutputs[i], wasmOutputs[i], 1e-6)).toBe(true);
      }

      const jsTime = performance.getDuration('js-forward-pass');
      const wasmTime = performance.getDuration('wasm-forward-pass');

      const speedup = jsTime / wasmTime;
      expect(speedup).toBeGreaterThan(5); // At least 5x speedup for batch processing
    });

    it('should optimize activation function computations', async () => {
      const activationFunctions = ['sigmoid', 'tanh', 'relu', 'leaky_relu', 'swish'];
      const vectorSize = 10000;
      const inputVector = testHelpers.generateRandomVector(vectorSize, -5, 5);

      for (const activation of activationFunctions) {
        // JavaScript implementation
        performance.start(`js-${activation}`);
        const jsResult = testHelpers.applyActivationJS(inputVector, activation);
        performance.end(`js-${activation}`);

        // WASM implementation
        performance.start(`wasm-${activation}`);
        const wasmResult = await wasmAccelerator.applyActivation(inputVector, activation);
        performance.end(`wasm-${activation}`);

        // Verify mathematical correctness
        expect(testHelpers.vectorsEqual(jsResult, wasmResult, 1e-10)).toBe(true);

        const jsTime = performance.getDuration(`js-${activation}`);
        const wasmTime = performance.getDuration(`wasm-${activation}`);

        // WASM should be faster
        const speedup = jsTime / wasmTime;
        expect(speedup).toBeGreaterThan(1.5);

        // Should meet performance targets
        expect(wasmTime).toBeLessThan(WASM_PERFORMANCE_TARGETS.activation);
      }
    });

    it('should handle convolutional layer computations efficiently', async () => {
      const convConfig = {
        inputShape: [224, 224, 3], // RGB image
        kernelSize: [3, 3],
        filters: 32,
        stride: 1,
        padding: 'same',
      };

      const inputImage = testHelpers.generateRandomTensor(convConfig.inputShape);
      const kernels = testHelpers.generateConvKernels(
        convConfig.kernelSize,
        convConfig.inputShape[2],
        convConfig.filters
      );

      performance.start('wasm-convolution');

      const convResult = await wasmAccelerator.convolve2D(inputImage, kernels, convConfig);

      performance.end('wasm-convolution');

      // Verify output shape
      const expectedShape = testHelpers.calculateConvOutputShape(
        convConfig.inputShape,
        convConfig.kernelSize,
        convConfig.stride,
        convConfig.padding
      );
      expectedShape[2] = convConfig.filters;

      expect(convResult.shape).toEqual(expectedShape);

      const convTime = performance.getDuration('wasm-convolution');
      expect(convTime).toBeLessThan(WASM_PERFORMANCE_TARGETS.convolution);

      // Verify mathematical correctness with reference implementation
      const referenceResult = testHelpers.convolve2DReference(inputImage, kernels, convConfig);

      expect(testHelpers.tensorsEqual(convResult, referenceResult, 1e-6)).toBe(true);
    });
  });

  describe('Neural Network Training Acceleration', () => {
    it('should accelerate backpropagation computations', async () => {
      const networkConfig = {
        layers: [100, 50, 25, 1],
        activation: 'relu',
        outputActivation: 'linear',
      };

      const network = await neuralManager.createNetwork(networkConfig);
      const trainingData = testHelpers.generateTrainingData(500, 100, 1);

      // JavaScript backpropagation
      performance.start('js-backpropagation');

      let jsGradients = null;
      for (const sample of trainingData.slice(0, 10)) {
        // Small subset for comparison
        const output = await network.forwardPassJS(sample.input);
        const loss = testHelpers.calculateLoss(output, sample.target);
        jsGradients = await network.backpropagationJS(loss);
      }

      performance.end('js-backpropagation');

      // WASM accelerated backpropagation
      performance.start('wasm-backpropagation');

      const wasmGradients = await wasmAccelerator.computeGradientsBatch(
        network.getWeights(),
        trainingData.slice(0, 10),
        networkConfig
      );

      performance.end('wasm-backpropagation');

      // Verify gradients match
      expect(testHelpers.gradientsEqual(jsGradients, wasmGradients, 1e-8)).toBe(true);

      const jsTime = performance.getDuration('js-backpropagation');
      const wasmTime = performance.getDuration('wasm-backpropagation');

      const speedup = jsTime / wasmTime;
      expect(speedup).toBeGreaterThan(3);
      expect(wasmTime).toBeLessThan(WASM_PERFORMANCE_TARGETS.backpropagation);
    });

    it('should optimize weight update operations', async () => {
      const weightSizes = [1000, 5000, 10000, 50000];

      for (const size of weightSizes) {
        const weights = testHelpers.generateRandomVector(size);
        const gradients = testHelpers.generateRandomVector(size, -0.1, 0.1);
        const learningRate = 0.01;
        const momentum = 0.9;
        const previousMomentum = testHelpers.generateRandomVector(size, -0.01, 0.01);

        // JavaScript weight update
        performance.start(`js-weight-update-${size}`);
        const jsUpdatedWeights = testHelpers.updateWeightsWithMomentumJS(
          weights,
          gradients,
          learningRate,
          momentum,
          previousMomentum
        );
        performance.end(`js-weight-update-${size}`);

        // WASM weight update
        performance.start(`wasm-weight-update-${size}`);
        const wasmUpdatedWeights = await wasmAccelerator.updateWeightsWithMomentum(
          weights,
          gradients,
          learningRate,
          momentum,
          previousMomentum
        );
        performance.end(`wasm-weight-update-${size}`);

        // Verify updates match
        expect(testHelpers.vectorsEqual(jsUpdatedWeights, wasmUpdatedWeights, 1e-12)).toBe(true);

        const jsTime = performance.getDuration(`js-weight-update-${size}`);
        const wasmTime = performance.getDuration(`wasm-weight-update-${size}`);

        const speedup = jsTime / wasmTime;
        expect(speedup).toBeGreaterThan(2);
      }
    });

    it('should handle batch normalization efficiently', async () => {
      const batchSizes = [32, 64, 128, 256];
      const featureSize = 512;

      for (const batchSize of batchSizes) {
        const batch = testHelpers.generateRandomBatch(batchSize, featureSize);
        const gamma = testHelpers.generateRandomVector(featureSize, 0.5, 1.5);
        const beta = testHelpers.generateRandomVector(featureSize, -0.5, 0.5);
        const epsilon = 1e-8;

        performance.start(`wasm-batch-norm-${batchSize}`);

        const normalizedBatch = await wasmAccelerator.batchNormalize(batch, gamma, beta, epsilon);

        performance.end(`wasm-batch-norm-${batchSize}`);

        // Verify batch normalization properties
        const batchMean = testHelpers.calculateBatchMean(normalizedBatch);
        const batchVariance = testHelpers.calculateBatchVariance(normalizedBatch, batchMean);

        // Mean should be close to beta, variance should be close to gamma^2
        expect(testHelpers.vectorsEqual(batchMean, beta, 1e-6)).toBe(true);

        const normTime = performance.getDuration(`wasm-batch-norm-${batchSize}`);
        expect(normTime).toBeLessThan(20); // 20ms max for batch normalization
      }
    });
  });

  describe('Memory Management and Optimization', () => {
    it('should efficiently manage WASM memory allocation', async () => {
      const initialMemory = await wasmAccelerator.getMemoryUsage();
      const allocatedBuffers: any[] = [];

      // Allocate multiple large buffers
      for (let i = 0; i < 10; i++) {
        const size = 1000000; // 1M floats
        const buffer = await wasmAccelerator.allocateBuffer(size * 4); // 4 bytes per float
        allocatedBuffers.push(buffer);

        const currentMemory = await wasmAccelerator.getMemoryUsage();
        expect(currentMemory).toBeGreaterThan(initialMemory);
      }

      // Free all buffers
      for (const buffer of allocatedBuffers) {
        await wasmAccelerator.freeBuffer(buffer);
      }

      // Force garbage collection
      await wasmAccelerator.collectGarbage();

      const finalMemory = await wasmAccelerator.getMemoryUsage();

      // Memory should be mostly reclaimed
      const memoryLeakage = finalMemory - initialMemory;
      expect(memoryLeakage).toBeLessThan(1024 * 1024); // Less than 1MB leakage
    });

    it('should optimize data transfer between JS and WASM', async () => {
      const dataSizes = [1000, 10000, 100000, 1000000];

      for (const size of dataSizes) {
        const jsData = testHelpers.generateRandomVector(size);

        // Measure transfer to WASM
        performance.start(`transfer-to-wasm-${size}`);
        const wasmBuffer = await wasmAccelerator.transferToWasm(jsData);
        performance.end(`transfer-to-wasm-${size}`);

        // Measure transfer back to JS
        performance.start(`transfer-to-js-${size}`);
        const retrievedData = await wasmAccelerator.transferFromWasm(wasmBuffer);
        performance.end(`transfer-to-js-${size}`);

        // Verify data integrity
        expect(testHelpers.vectorsEqual(jsData, retrievedData, 1e-15)).toBe(true);

        const toWasmTime = performance.getDuration(`transfer-to-wasm-${size}`);
        const fromWasmTime = performance.getDuration(`transfer-to-js-${size}`);

        // Transfer should be fast (< 1ms per 1000 elements)
        expect(toWasmTime).toBeLessThan(size / 1000);
        expect(fromWasmTime).toBeLessThan(size / 1000);

        await wasmAccelerator.freeBuffer(wasmBuffer);
      }
    });

    it('should handle memory pressure gracefully', async () => {
      const initialMemory = await wasmAccelerator.getMemoryUsage();
      let peakMemory = initialMemory;
      let memoryPressureDetected = false;

      // Allocate increasingly large amounts of memory
      const allocations: any[] = [];

      try {
        for (let i = 1; i <= 100; i++) {
          const allocationSize = i * 1024 * 1024; // i MB

          performance.start(`memory-pressure-alloc-${i}`);

          const buffer = await wasmAccelerator.allocateBuffer(allocationSize);
          allocations.push(buffer);

          performance.end(`memory-pressure-alloc-${i}`);

          const currentMemory = await wasmAccelerator.getMemoryUsage();
          peakMemory = Math.max(peakMemory, currentMemory);

          // Check if memory pressure is detected
          const memoryPressure = await wasmAccelerator.getMemoryPressure();
          if (memoryPressure > 0.8) {
            memoryPressureDetected = true;
            break;
          }
        }
      } catch (error) {
        // Out of memory is expected at some point
        expect(error.message).toContain('memory');
      }

      // Clean up allocations
      for (const buffer of allocations) {
        try {
          await wasmAccelerator.freeBuffer(buffer);
        } catch (error) {
          // Some buffers might be invalid due to memory pressure
        }
      }

      await wasmAccelerator.collectGarbage();

      const finalMemory = await wasmAccelerator.getMemoryUsage();

      // Should detect memory pressure before complete failure
      expect(memoryPressureDetected).toBe(true);

      // Should successfully clean up most memory
      const memoryReclaimed = peakMemory - finalMemory;
      expect(memoryReclaimed).toBeGreaterThan(peakMemory * 0.8);
    });
  });

  describe('SIMD Optimization', () => {
    it('should leverage SIMD instructions for vector operations', async () => {
      const vectorSizes = [128, 512, 2048, 8192]; // SIMD-friendly sizes

      for (const size of vectorSizes) {
        const vectorA = testHelpers.generateRandomVector(size);
        const vectorB = testHelpers.generateRandomVector(size);

        // Test various SIMD operations
        const operations = [
          { name: 'add', op: (a: number[], b: number[]) => a.map((x, i) => x + b[i]) },
          { name: 'multiply', op: (a: number[], b: number[]) => a.map((x, i) => x * b[i]) },
          { name: 'subtract', op: (a: number[], b: number[]) => a.map((x, i) => x - b[i]) },
          {
            name: 'divide',
            op: (a: number[], b: number[]) => a.map((x, i) => x / (b[i] || 1e-10)),
          },
        ];

        for (const operation of operations) {
          // JavaScript implementation
          performance.start(`js-${operation.name}-${size}`);
          const jsResult = operation.op(vectorA, vectorB);
          performance.end(`js-${operation.name}-${size}`);

          // SIMD-optimized WASM implementation
          performance.start(`simd-${operation.name}-${size}`);
          const simdResult = await wasmAccelerator.vectorOperation(
            vectorA,
            vectorB,
            operation.name,
            { useSIMD: true }
          );
          performance.end(`simd-${operation.name}-${size}`);

          // Verify results match
          expect(testHelpers.vectorsEqual(jsResult, simdResult, 1e-12)).toBe(true);

          const jsTime = performance.getDuration(`js-${operation.name}-${size}`);
          const simdTime = performance.getDuration(`simd-${operation.name}-${size}`);

          // SIMD should provide significant speedup for large vectors
          if (size >= 512) {
            const speedup = jsTime / simdTime;
            expect(speedup).toBeGreaterThan(2);
          }
        }
      }
    });

    it('should optimize reduction operations with SIMD', async () => {
      const vectorSize = 4096; // SIMD-friendly size
      const testVector = testHelpers.generateRandomVector(vectorSize);

      const reductions = [
        { name: 'sum', expected: testVector.reduce((a, b) => a + b, 0) },
        { name: 'max', expected: Math.max(...testVector) },
        { name: 'min', expected: Math.min(...testVector) },
        { name: 'mean', expected: testVector.reduce((a, b) => a + b, 0) / testVector.length },
      ];

      for (const reduction of reductions) {
        performance.start(`simd-${reduction.name}`);

        const result = await wasmAccelerator.vectorReduction(testVector, reduction.name, {
          useSIMD: true,
        });

        performance.end(`simd-${reduction.name}`);

        // Verify mathematical correctness
        expect(Math.abs(result - reduction.expected)).toBeLessThan(1e-10);

        const reductionTime = performance.getDuration(`simd-${reduction.name}`);
        expect(reductionTime).toBeLessThan(5); // 5ms max for SIMD reduction
      }
    });
  });

  describe('WebGPU Integration', () => {
    it('should offload computation to GPU when available', async () => {
      const hasWebGPU = await wasmAccelerator.hasWebGPUSupport();

      if (!hasWebGPU) {
        console.log('WebGPU not available, skipping GPU tests');
        return;
      }

      const matrixSize = 2048;
      const matrixA = testHelpers.generateRandomMatrix(matrixSize, matrixSize);
      const matrixB = testHelpers.generateRandomMatrix(matrixSize, matrixSize);

      // CPU-only computation
      performance.start('cpu-matrix-multiply');
      const cpuResult = await wasmAccelerator.multiplyMatrices(matrixA, matrixB, { useGPU: false });
      performance.end('cpu-matrix-multiply');

      // GPU-accelerated computation
      performance.start('gpu-matrix-multiply');
      const gpuResult = await wasmAccelerator.multiplyMatrices(matrixA, matrixB, { useGPU: true });
      performance.end('gpu-matrix-multiply');

      // Verify results match
      expect(testHelpers.matricesEqual(cpuResult, gpuResult, 1e-6)).toBe(true);

      const cpuTime = performance.getDuration('cpu-matrix-multiply');
      const gpuTime = performance.getDuration('gpu-matrix-multiply');

      // GPU should provide speedup for large matrices
      const speedup = cpuTime / gpuTime;
      expect(speedup).toBeGreaterThan(1.5);
    });

    it('should handle GPU memory management efficiently', async () => {
      const hasWebGPU = await wasmAccelerator.hasWebGPUSupport();

      if (!hasWebGPU) {
        return;
      }

      const initialGPUMemory = await wasmAccelerator.getGPUMemoryUsage();
      const buffers: any[] = [];

      // Allocate GPU buffers
      for (let i = 0; i < 10; i++) {
        const size = 1024 * 1024; // 1MB each
        const buffer = await wasmAccelerator.allocateGPUBuffer(size);
        buffers.push(buffer);
      }

      const peakGPUMemory = await wasmAccelerator.getGPUMemoryUsage();
      expect(peakGPUMemory).toBeGreaterThan(initialGPUMemory);

      // Free GPU buffers
      for (const buffer of buffers) {
        await wasmAccelerator.freeGPUBuffer(buffer);
      }

      const finalGPUMemory = await wasmAccelerator.getGPUMemoryUsage();

      // GPU memory should be reclaimed
      const memoryLeakage = finalGPUMemory - initialGPUMemory;
      expect(memoryLeakage).toBeLessThan(1024 * 1024); // Less than 1MB leakage
    });
  });
});
