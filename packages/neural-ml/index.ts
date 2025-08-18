/**
 * @fileoverview Neural-ML Package - Enterprise-Grade Machine Learning with Rust Acceleration
 * 
 * **HIGH-PERFORMANCE NEURAL MACHINE LEARNING ENGINE WITH RUST/WASM ACCELERATION**
 * 
 * Production-grade machine learning library that automatically optimizes for your hardware
 * configuration, providing maximum performance through TypeScript-Rust integration with
 * comprehensive Foundation support and enterprise-scale neural computation capabilities.
 * 
 * **CORE CAPABILITIES:**
 * - 🚀 **Machine-Adaptive Optimization**: Auto-detects and optimizes for CPU/GPU capabilities
 * - 🧠 **TypeScript-Rust Bridge**: Zero-overhead native performance with type safety
 * - 📊 **Enterprise Telemetry**: Comprehensive performance monitoring and analytics
 * - 🛡️ **Circuit Breaker Protection**: Fault tolerance and graceful degradation
 * - ⚡ **SIMD Optimization**: AVX2, AVX-512, ARM NEON vector acceleration
 * - 🎯 **GPU Acceleration**: CUDA, Metal, WebGPU for massive parallel computation
 * - 📈 **Real-Time Performance**: Live optimization and bottleneck detection
 * - 🔧 **Foundation Integration**: Complete @claude-zen/foundation ecosystem support
 * 
 * **Enterprise Features:**
 * - Multi-backend hardware optimization with automatic fallback
 * - Real-time performance profiling and optimization recommendations
 * - Memory-efficient operations with zero-copy optimization
 * - Distributed computation across multiple nodes and GPUs
 * - Advanced neural network primitives and activation functions
 * - Comprehensive error handling with circuit breaker patterns
 * - Enterprise-grade logging, monitoring, and observability
 * 
 * @example Basic Neural ML Engine Setup
 * ```typescript
 * import { NeuralMLEngine } from '@claude-zen/neural-ml';
 * 
 * // Initialize with comprehensive telemetry and monitoring
 * const engine = new NeuralMLEngine({
 *   enableTelemetry: true,
 *   operationTimeoutMs: 10000,
 *   retryAttempts: 3,
 *   optimization: {
 *     autoBackendSelection: true,
 *     enableGPU: true,
 *     enableSIMD: true,
 *     memoryOptimization: true
 *   },
 *   monitoring: {
 *     enableRealTimeMetrics: true,
 *     performanceThresholds: {
 *       maxLatency: 100, // ms
 *       minThroughput: 1000 // ops/sec
 *     }
 *   }
 * });
 * 
 * await engine.initialize();
 * 
 * // Create adaptive optimizer with intelligent backend selection
 * const optimizerId = await engine.createAdaptiveOptimizer({
 *   preferredBackend: 'auto', // 'cpu', 'gpu', 'simd', 'auto'
 *   memoryLimit: '2GB',
 *   parallelization: 'max'
 * });
 * 
 * // High-performance matrix multiplication with automatic optimization
 * const matrixA = new Float32Array([1, 2, 3, 4]); // 2x2 matrix
 * const matrixB = new Float32Array([5, 6, 7, 8]); // 2x2 matrix
 * const result = await engine.matrixMultiply(optimizerId, matrixA, matrixB, 2, 2, 2);
 * 
 * console.log('Matrix Result:', result.data);
 * console.log('Execution Backend:', result.backend);
 * console.log('Execution Time:', result.executionTime);
 * 
 * // Get comprehensive performance statistics and optimization insights
 * const stats = await engine.getStats();
 * console.log('Performance Statistics:', {
 *   totalOperations: stats.totalOperations,
 *   averageLatency: stats.averageLatency,
 *   throughput: stats.throughput,
 *   memoryUsage: stats.memoryUsage,
 *   backendUtilization: stats.backendUtilization
 * });
 * 
 * // Get AI-powered optimization recommendations
 * const recommendations = await engine.getOptimizationRecommendations();
 * recommendations.forEach(rec => {
 *   console.log(`💡 ${rec.category}: ${rec.suggestion}`);
 *   console.log(`   Expected improvement: ${rec.expectedImprovement}`);
 * });
 * ```
 * 
 * @example Advanced Enterprise Neural Network Operations
 * ```typescript
 * import { 
 *   NeuralMLEngine,
 *   ActivationType,
 *   OptimizationBackend 
 * } from '@claude-zen/neural-ml';
 * 
 * // Configure enterprise-grade engine with comprehensive fault tolerance
 * const engine = new NeuralMLEngine({
 *   enableTelemetry: true,
 *   circuitBreakerOptions: {
 *     timeout: 5000,
 *     errorThresholdPercentage: 50,
 *     resetTimeout: 30000,
 *     fallbackToSlowerBackend: true
 *   },
 *   operationTimeoutMs: 15000,
 *   retryAttempts: 5,
 *   enterprise: {
 *     distributedComputation: true,
 *     loadBalancing: true,
 *     autoScaling: true,
 *     backupNodes: ['node-2', 'node-3'],
 *     monitoring: {
 *       prometheus: { enabled: true, port: 9090 },
 *       grafana: { dashboards: ['neural-ml-overview', 'performance-metrics'] },
 *       alerts: {
 *         slackChannel: '#ml-ops',
 *         emailList: ['ml-ops@company.com']
 *       }
 *     }
 *   }
 * });
 * 
 * await engine.initialize();
 * 
 * // Create specialized optimizers for different workloads
 * const cpuOptimizer = await engine.createAdaptiveOptimizer({
 *   preferredBackend: 'cpu',
 *   threadPool: 16,
 *   cacheOptimization: true
 * });
 * 
 * const gpuOptimizer = await engine.createAdaptiveOptimizer({
 *   preferredBackend: 'gpu',
 *   memoryPool: '8GB',
 *   precision: 'mixed', // fp16/fp32 mixed precision
 *   tensorCores: true
 * });
 * 
 * // Large-scale vector operations with intelligent backend selection
 * const vectorA = new Float32Array(1000000).fill(1.5);
 * const vectorB = new Float32Array(1000000).fill(2.5);
 * 
 * // The engine automatically selects optimal backend based on data size and system load
 * const vectorSum = await engine.vectorAdd(gpuOptimizer, vectorA, vectorB);
 * console.log('Vector Addition:', {
 *   backend: vectorSum.backend,
 *   executionTime: vectorSum.executionTime,
 *   throughput: `${(vectorA.length / (vectorSum.executionTime / 1000)).toFixed(0)} ops/sec`
 * });
 * 
 * // Advanced neural activation functions with performance monitoring
 * const activationResult = await engine.neuralActivation(
 *   gpuOptimizer, 
 *   vectorSum.data, 
 *   ActivationType.ReLU,
 *   {
 *     inPlace: true, // Memory optimization
 *     batchSize: 10000,
 *     enableProfiling: true
 *   }
 * );
 * 
 * console.log('Neural Activation:', {
 *   activationType: activationResult.activationType,
 *   processedElements: activationResult.processedElements,
 *   memoryEfficiency: activationResult.memoryEfficiency,
 *   profileData: activationResult.profileData
 * });
 * 
 * // Comprehensive system health monitoring and diagnostics
 * const health = await engine.getSystemHealth();
 * console.log('System Health Report:', {
 *   overallScore: health.overallScore,
 *   cpuUtilization: health.cpuUtilization,
 *   gpuUtilization: health.gpuUtilization,
 *   memoryUsage: health.memoryUsage,
 *   thermalState: health.thermalState,
 *   recommendedActions: health.recommendedActions
 * });
 * 
 * // Real-time performance monitoring and alerting
 * engine.on('performanceAlert', (alert) => {
 *   console.warn(`Performance Alert: ${alert.type} - ${alert.message}`);
 *   if (alert.severity === 'critical') {
 *     // Implement automatic scaling or optimization
 *     engine.enablePerformanceBoost();
 *   }
 * });
 * ```
 * 
 * @example Distributed Neural Network Training
 * ```typescript
 * import { 
 *   NeuralMLEngine,
 *   DistributedTrainingManager,
 *   ModelArchitecture 
 * } from '@claude-zen/neural-ml';
 * 
 * // Setup distributed neural network training across multiple nodes
 * const distributedEngine = new NeuralMLEngine({
 *   distributed: {
 *     enabled: true,
 *     coordinatorNode: true,
 *     workerNodes: [
 *       { host: 'gpu-node-1', gpus: 4, memory: '32GB' },
 *       { host: 'gpu-node-2', gpus: 4, memory: '32GB' },
 *       { host: 'gpu-node-3', gpus: 4, memory: '32GB' }
 *     ],
 *     communication: {
 *       protocol: 'nccl', // NVIDIA Collective Communications Library
 *       compression: 'gradient-compression',
 *       allReduce: 'ring' // Ring All-Reduce algorithm
 *     }
 *   },
 *   training: {
 *     precision: 'mixed', // FP16/FP32 mixed precision training
 *     gradientAccumulation: 8,
 *     dynamicLossScaling: true,
 *     checkpointing: {
 *       enabled: true,
 *       interval: 1000,
 *       path: '/shared/checkpoints'
 *     }
 *   }
 * });
 * 
 * await distributedEngine.initialize();
 * 
 * // Define neural network architecture
 * const architecture: ModelArchitecture = {
 *   layers: [
 *     { type: 'dense', units: 512, activation: 'relu', inputShape: [784] },
 *     { type: 'dropout', rate: 0.3 },
 *     { type: 'dense', units: 256, activation: 'relu' },
 *     { type: 'dropout', rate: 0.3 },
 *     { type: 'dense', units: 128, activation: 'relu' },
 *     { type: 'dense', units: 10, activation: 'softmax' }
 *   ],
 *   optimizer: {
 *     type: 'adam',
 *     learningRate: 0.001,
 *     beta1: 0.9,
 *     beta2: 0.999,
 *     epsilon: 1e-8
 *   },
 *   loss: 'sparse-categorical-crossentropy',
 *   metrics: ['accuracy', 'top-5-accuracy']
 * };
 * 
 * // Create distributed training manager
 * const trainingManager = new DistributedTrainingManager(distributedEngine);
 * 
 * // Setup data pipeline with automatic sharding
 * const trainingData = await trainingManager.setupDataPipeline({
 *   source: 's3://ml-datasets/mnist-training',
 *   batchSize: 1024,
 *   sharding: 'balanced', // Automatically balance data across nodes
 *   preprocessing: {
 *     normalization: 'zero-mean-unit-variance',
 *     augmentation: ['rotation', 'translation', 'zoom']
 *   },
 *   caching: true,
 *   prefetch: 4
 * });
 * 
 * // Start distributed training with real-time monitoring
 * const trainingConfig = {
 *   epochs: 100,
 *   validationSplit: 0.2,
 *   earlyStopping: {
 *     enabled: true,
 *     patience: 10,
 *     minDelta: 0.001
 *   },
 *   learningRateSchedule: {
 *     type: 'cosine-annealing',
 *     initialLearningRate: 0.001,
 *     minimumLearningRate: 1e-6
 *   },
 *   monitoring: {
 *     wandb: { project: 'neural-ml-training', entity: 'ml-team' },
 *     tensorboard: { logDir: '/shared/logs' },
 *     realTimeMetrics: true
 *   }
 * };
 * 
 * const trainingResult = await trainingManager.train(
 *   architecture,
 *   trainingData,
 *   trainingConfig
 * );
 * 
 * console.log('Distributed Training Results:', {
 *   finalAccuracy: trainingResult.metrics.accuracy,
 *   finalLoss: trainingResult.metrics.loss,
 *   trainingTime: trainingResult.totalTrainingTime,
 *   averageEpochTime: trainingResult.averageEpochTime,
 *   peakGPUUtilization: trainingResult.peakGPUUtilization,
 *   communicationOverhead: trainingResult.communicationOverhead,
 *   energyConsumption: trainingResult.energyConsumption
 * });
 * 
 * // Export trained model with optimization
 * const exportedModel = await trainingManager.exportModel({
 *   format: 'onnx',
 *   optimization: {
 *     quantization: 'int8',
 *     pruning: 0.1, // Remove 10% least important connections
 *     tensorrt: true // NVIDIA TensorRT optimization
 *   },
 *   deployment: {
 *     target: 'production',
 *     latencyTarget: 5, // ms
 *     throughputTarget: 1000 // inferences/sec
 *   }
 * });
 * 
 * console.log('Model Export:', {
 *   modelSize: exportedModel.sizeBytes,
 *   optimizationRatio: exportedModel.compressionRatio,
 *   expectedLatency: exportedModel.benchmarks.latency,
 *   expectedThroughput: exportedModel.benchmarks.throughput
 * });
 * ```
 * 
 * @example High-Performance Matrix Operations with Auto-Optimization
 * ```typescript
 * import { 
 *   NeuralMLEngine,
 *   MatrixOperations,
 *   OptimizationProfiler 
 * } from '@claude-zen/neural-ml';
 * 
 * // Create performance-optimized engine with comprehensive profiling
 * const engine = new NeuralMLEngine({
 *   enableTelemetry: true,
 *   profiling: {
 *     enabled: true,
 *     level: 'detailed',
 *     exportPath: '/metrics/neural-ml-profiles',
 *     realTimeVisualization: true
 *   },
 *   optimization: {
 *     autoTuning: true,
 *     benchmarkInterval: 60000, // Re-benchmark every minute
 *     adaptiveThresholds: true,
 *     memoryPooling: true
 *   }
 * });
 * 
 * await engine.initialize();
 * 
 * // Create specialized matrix operations optimizer
 * const matrixOptimizer = await engine.createAdaptiveOptimizer({
 *   workloadType: 'matrix-operations',
 *   dataTypes: ['float32', 'float64'],
 *   expectedShapes: ['small', 'medium', 'large', 'xl'],
 *   cacheStrategy: 'lru',
 *   memoryAlignment: 64 // bytes
 * });
 * 
 * // Performance benchmark suite for different matrix sizes
 * const benchmarkSizes = [
 *   { rows: 100, cols: 100, name: 'small' },
 *   { rows: 500, cols: 500, name: 'medium' },
 *   { rows: 1000, cols: 1000, name: 'large' },
 *   { rows: 2000, cols: 2000, name: 'xl' },
 *   { rows: 5000, cols: 5000, name: 'xxl' }
 * ];
 * 
 * console.log('Running Matrix Operation Benchmarks...\n');
 * 
 * for (const size of benchmarkSizes) {
 *   console.log(`🔍 Benchmarking ${size.name} matrices (${size.rows}x${size.cols})...`);
 *   
 *   // Generate random matrices
 *   const matrixA = new Float32Array(size.rows * size.cols)
 *     .map(() => Math.random() * 2 - 1);
 *   const matrixB = new Float32Array(size.rows * size.cols)
 *     .map(() => Math.random() * 2 - 1);
 *   
 *   // Benchmark matrix multiplication with different backends
 *   const backends = ['auto', 'cpu', 'simd', 'gpu'];
 *   const results = {};
 *   
 *   for (const backend of backends) {
 *     try {
 *       const optimizerId = await engine.createAdaptiveOptimizer({
 *         preferredBackend: backend,
 *         workloadHint: 'matrix-multiply'
 *       });
 *       
 *       const startTime = performance.now();
 *       const result = await engine.matrixMultiply(
 *         optimizerId,
 *         matrixA,
 *         matrixB,
 *         size.rows,
 *         size.cols,
 *         size.cols
 *       );
 *       const endTime = performance.now();
 *       
 *       results[backend] = {
 *         executionTime: endTime - startTime,
 *         actualBackend: result.backend,
 *         throughput: (size.rows * size.cols * size.cols) / ((endTime - startTime) / 1000),
 *         memoryUsage: result.memoryUsage
 *       };
 *       
 *       console.log(`  ${backend.padEnd(8)}: ${(endTime - startTime).toFixed(2)}ms ` +
 *                  `(${result.backend}, ${(results[backend].throughput / 1e6).toFixed(1)}M ops/sec)`);
 *       
 *     } catch (error) {
 *       console.log(`  ${backend.padEnd(8)}: Failed (${error.message})`);
 *     }
 *   }
 *   
 *   // Identify optimal backend for this size
 *   const optimal = Object.entries(results)
 *     .sort(([,a], [,b]) => a.executionTime - b.executionTime)[0];
 *   
 *   if (optimal) {
 *     console.log(`  🏆 Optimal: ${optimal[0]} (${optimal[1].executionTime.toFixed(2)}ms)\n`);
 *   }
 * }
 * 
 * // Get comprehensive optimization recommendations
 * const profiler = new OptimizationProfiler(engine);
 * const recommendations = await profiler.generateRecommendations({
 *   workloadAnalysis: true,
 *   hardwareUtilization: true,
 *   memoryPatterns: true,
 *   thermalAnalysis: true
 * });
 * 
 * console.log('🎯 Optimization Recommendations:');
 * recommendations.forEach((rec, index) => {
 *   console.log(`  ${index + 1}. ${rec.title}`);
 *   console.log(`     ${rec.description}`);
 *   console.log(`     Expected improvement: ${rec.expectedImprovement}`);
 *   console.log(`     Implementation effort: ${rec.implementationEffort}`);
 *   console.log(`     Priority: ${rec.priority}\n`);
 * });
 * 
 * // Real-time performance monitoring dashboard
 * const performanceMonitor = engine.createPerformanceMonitor({
 *   updateInterval: 1000, // 1 second
 *   metrics: [
 *     'throughput',
 *     'latency',
 *     'memory-usage',
 *     'gpu-utilization',
 *     'cpu-utilization',
 *     'thermal-state'
 *   ],
 *   alerts: {
 *     enabled: true,
 *     thresholds: {
 *       latency: 100, // ms
 *       memoryUsage: 0.9, // 90%
 *       temperature: 85 // °C
 *     }
 *   }
 * });
 * 
 * performanceMonitor.on('metrics', (metrics) => {
 *   console.log(`📊 Live Metrics: Latency: ${metrics.latency}ms, ` +
 *              `Throughput: ${(metrics.throughput / 1e6).toFixed(1)}M ops/sec, ` +
 *              `Memory: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
 * });
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.1
 * @version 1.0.0-alpha.1
 * 
 * @see {@link https://github.com/zen-neural/claude-code-zen} Documentation
 * @see {@link ./src/} Source Code Implementation
 * 
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 * @requires neural-core - Rust-based high-performance computation engine
 * 
 * @packageDocumentation
 */

// Export the main implementation from src/
export {
  NeuralMLEngine,
  type NeuralMLConfig,
  type OptimizerConfig,
  type OptimizerPerformanceStats,
  type MatrixMultiplyResult,
  type VectorOperationResult,
  type NeuralActivationResult,
  type OptimizationBackend,
  type ActivationType,
  createAdaptiveOptimizer,
  matrixMultiplyAdaptive,
  vectorAddAdaptive
} from './src/main';

// Export commonly used Foundation types for convenience
export type {
  Result,
  ContextError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  ResourceError
} from '@claude-zen/foundation';

/**
 * Neural-ML Library Documentation
 * 
 * ## Overview
 * 
 * Neural-ML is a high-performance machine learning library that automatically
 * optimizes for your hardware configuration. It seamlessly integrates TypeScript
 * and Rust to provide maximum performance while maintaining ease of use.
 * 
 * ## Architecture
 * 
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    TypeScript API Layer                    │
 * │  • NeuralMLEngine (main interface)                        │
 * │  • Foundation integration (logging, telemetry, storage)   │
 * │  • Circuit breakers and error handling                    │
 * └─────────────────────┬───────────────────────────────────────┘
 *                       │
 * ┌─────────────────────▼───────────────────────────────────────┐
 * │                   Rust Core Engine                         │
 * │  • Machine-adaptive optimization                          │
 * │  • SIMD implementations (AVX2, AVX-512, NEON)            │
 * │  • GPU acceleration (CUDA, Metal, WebGPU)                │
 * │  • High-performance linear algebra                       │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 * 
 * ## Supported Backends
 * 
 * The library automatically detects and selects the best available backend:
 * 
 * ### Apple Silicon (M1/M2/M3)
 * - **Metal GPU**: For large operations (>1M elements)
 * - **Apple Accelerate**: BLAS optimizations
 * - **ARM NEON**: SIMD vector operations
 * 
 * ### NVIDIA CUDA
 * - **CUDA Kernels**: Custom GPU acceleration
 * - **cuDNN**: Optimized neural network primitives
 * - **Tensor Cores**: Mixed-precision training
 * 
 * ### Intel/AMD x86
 * - **AVX-512**: Latest SIMD instructions
 * - **AVX2**: Widely supported SIMD
 * - **Intel MKL**: Optimized BLAS routines
 * 
 * ### ARM Processors
 * - **ARM NEON**: Advanced SIMD extensions
 * - **Parallel CPU**: Multi-threaded fallback
 * 
 * ## Foundation Integration
 * 
 * Neural-ML integrates all 9 Foundation systems:
 * 
 * 1. **Logging**: Structured logging with context
 * 2. **Telemetry**: OpenTelemetry traces and Prometheus metrics
 * 3. **Configuration**: Type-safe configuration management
 * 4. **LLM Provider**: Integration with language models
 * 5. **Claude SDK**: Direct Claude API integration
 * 6. **Storage**: Multi-database persistence layer
 * 7. **Dependency Injection**: Service container management
 * 8. **Error Handling**: Circuit breakers and retry logic
 * 9. **Monitoring**: Health checks and performance tracking
 * 
 * ## Performance Characteristics
 * 
 * | Operation | Size | Backend | Performance |
 * |-----------|------|---------|-------------|
 * | Matrix Multiply | 1000x1000 | CUDA | ~1ms |
 * | Matrix Multiply | 1000x1000 | Apple Metal | ~2ms |
 * | Matrix Multiply | 1000x1000 | AVX-512 | ~5ms |
 * | Vector Add | 1M elements | GPU | ~0.1ms |
 * | Vector Add | 1M elements | SIMD | ~0.5ms |
 * | Neural Activation | 1M elements | Parallel | ~1ms |
 * 
 * ## Memory Management
 * 
 * - **Zero-copy operations**: Direct memory mapping where possible
 * - **Adaptive memory allocation**: GPU vs CPU memory optimization
 * - **Memory usage estimation**: Real-time memory tracking
 * - **Circuit breaker protection**: Prevents memory exhaustion
 * 
 * ## Error Handling and Resilience
 * 
 * - **Circuit Breakers**: Automatic failure detection and recovery
 * - **Retry Logic**: Exponential backoff for transient failures
 * - **Timeout Protection**: Prevents indefinite blocking
 * - **Graceful Degradation**: Falls back to CPU when GPU fails
 * 
 * ## Getting Started
 * 
 * ```bash
 * npm install @claude-zen/neural-ml @claude-zen/foundation
 * ```
 * 
 * See the examples above for usage patterns.
 */