/**
 * Performance Optimization Interfaces
 * Core interfaces for all performance optimization components
 */

// Neural Network Performance Optimization Interface
export interface NeuralOptimizer {
  optimizeTrainingSpeed(network: NeuralNetwork): Promise<OptimizationResult>;
  implementBatchProcessing(trainer: NetworkTrainer): Promise<BatchConfig>;
  enableGPUAcceleration(computeUnits: ComputeUnit[]): Promise<AccelerationResult>;
  optimizeMemoryUsage(networks: NeuralNetwork[]): Promise<MemoryOptimization>;
}

// Swarm Coordination Optimization Interface
export interface SwarmOptimizer {
  optimizeMessageRouting(topology: SwarmTopology): Promise<RoutingOptimization>;
  implementCaching(coordinationLayer: CoordinationLayer): Promise<CacheStrategy>;
  reduceLatency(communicationProtocols: Protocol[]): Promise<LatencyReduction>;
  scaleHorizontally(swarmSize: number): Promise<ScalingStrategy>;
}

// Database & Memory Optimization Interface
export interface DataOptimizer {
  optimizeQueryPerformance(queries: DatabaseQuery[]): Promise<QueryOptimization>;
  implementConnectionPooling(connections: Connection[]): Promise<PoolConfig>;
  addIntelligentCaching(cacheLayer: CacheLayer): Promise<CacheOptimization>;
  compressDataStorage(storage: StorageLayer): Promise<CompressionResult>;
}

// WASM Integration Optimization Interface
export interface WasmOptimizer {
  optimizeWasmModuleLoading(modules: WasmModule[]): Promise<LoadingOptimization>;
  implementStreamingCompilation(wasmFiles: WasmFile[]): Promise<StreamingResult>;
  optimizeMemorySharing(jsWasmBridge: Bridge): Promise<MemoryOptimization>;
  enableSIMDAcceleration(computeKernels: Kernel[]): Promise<SIMDResult>;
}

// Common Types and Interfaces
export interface OptimizationResult {
  success: boolean;
  improvement: number; // Percentage improvement
  beforeMetrics: PerformanceMetrics;
  afterMetrics: PerformanceMetrics;
  executionTime: number;
  error?: string;
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  timestamp: Date;
}

export interface BatchConfig {
  batchSize: number;
  parallelism: number;
  memoryLimit: number;
  processingMode: 'sequential' | 'parallel' | 'adaptive';
}

export interface AccelerationResult {
  accelerationType: 'GPU' | 'WASM' | 'SIMD';
  speedImprovement: number;
  resourceUtilization: number;
  fallbackStrategy: string;
}

export interface MemoryOptimization {
  memoryReduction: number;
  compressionRatio: number;
  garbageCollectionImprovement: number;
  poolingStrategy: string;
}

export interface RoutingOptimization {
  routingLatency: number;
  messageCompression: number;
  protocolEfficiency: number;
  topologyOptimization: string;
}

export interface CacheStrategy {
  hitRatio: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'adaptive';
  cacheSize: number;
  layers: number;
}

export interface LatencyReduction {
  reductionPercentage: number;
  averageLatency: number;
  p95Latency: number;
  optimizationTechniques: string[];
}

export interface ScalingStrategy {
  maxAgents: number;
  loadBalancing: 'round-robin' | 'least-connections' | 'weighted' | 'adaptive';
  autoScaling: boolean;
  resourceAllocation: string;
}

export interface QueryOptimization {
  queryTime: number;
  indexOptimization: string[];
  queryPlanImprovement: number;
  cacheUtilization: number;
}

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  healthCheckInterval: number;
}

export interface CacheOptimization {
  hitRatio: number;
  responseTime: number;
  memoryEfficiency: number;
  invalidationStrategy: string;
}

export interface CompressionResult {
  compressionRatio: number;
  decompressionSpeed: number;
  algorithm: 'gzip' | 'brotli' | 'lz4' | 'zstd';
  storageReduction: number;
}

export interface LoadingOptimization {
  loadTime: number;
  cacheUtilization: boolean;
  streamingEnabled: boolean;
  preloadStrategy: string;
}

export interface StreamingResult {
  compilationTime: number;
  streamingEnabled: boolean;
  memoryEfficiency: number;
  instantiationSpeed: number;
}

export interface SIMDResult {
  simdSupport: boolean;
  performanceGain: number;
  instructionOptimization: string[];
  vectorizationLevel: number;
}

// Performance Target Constants
export const NEURAL_PERFORMANCE_TARGETS = {
  trainingSpeedImprovement: 5.0,    // 5x faster training
  memoryReduction: 0.6,             // 60% less memory usage
  inferenceLatency: 10,             // <10ms inference time
  batchThroughput: 10000            // 10K samples/second
} as const;

export const SWARM_PERFORMANCE_TARGETS = {
  messageLatency: 5,                // <5ms message routing
  coordinationOverhead: 0.05,       // <5% CPU for coordination
  scalability: 10000,               // Support 10K+ agents
  faultTolerance: 0.999            // 99.9% uptime
} as const;

export const DATA_PERFORMANCE_TARGETS = {
  queryResponseTime: 50,            // <50ms average query time
  cacheHitRatio: 0.95,             // 95% cache hit rate
  compressionRatio: 0.7,           // 70% storage reduction
  connectionEfficiency: 0.98       // 98% connection utilization
} as const;

export const WASM_PERFORMANCE_TARGETS = {
  moduleLoadTime: 100,              // <100ms module loading
  executionSpeedImprovement: 10.0,  // 10x faster than JS
  memoryOverhead: 0.1,             // <10% memory overhead
  interopLatency: 1                // <1ms JS-WASM calls
} as const;

// Generic Type Definitions for Cross-Domain Compatibility
export interface NeuralNetwork {
  id: string;
  layers: number[];
  weights: number[][];
  activationFunction: string;
}

export interface NetworkTrainer {
  network: NeuralNetwork;
  learningRate: number;
  batchSize: number;
  epochs: number;
}

export interface ComputeUnit {
  id: string;
  type: 'CPU' | 'GPU' | 'TPU';
  memory: number;
  cores: number;
}

export interface SwarmTopology {
  type: 'mesh' | 'hierarchical' | 'ring' | 'star';
  nodes: number;
  connections: number;
}

export interface CoordinationLayer {
  protocol: string;
  messageFormat: string;
  compressionEnabled: boolean;
}

export interface Protocol {
  name: string;
  version: string;
  latency: number;
  reliability: number;
}

export interface DatabaseQuery {
  sql: string;
  parameters: any[];
  estimatedCost: number;
}

export interface Connection {
  id: string;
  type: 'database' | 'network' | 'websocket';
  isActive: boolean;
  lastUsed: Date;
}

export interface CacheLayer {
  type: 'memory' | 'redis' | 'disk';
  size: number;
  ttl: number;
}

export interface StorageLayer {
  type: 'file' | 'database' | 'object';
  size: number;
  compression: boolean;
}

export interface WasmModule {
  name: string;
  size: number;
  compilationTime: number;
  instantiated: boolean;
}

export interface WasmFile {
  path: string;
  size: number;
  optimized: boolean;
}

export interface Bridge {
  type: 'js-wasm';
  latency: number;
  memoryShared: boolean;
}

export interface Kernel {
  name: string;
  operations: string[];
  simdOptimized: boolean;
}