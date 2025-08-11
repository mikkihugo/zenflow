/**
 * Performance Optimization Interfaces.
 * Core interfaces for all performance optimization components.
 */
/**
 * @file Interface implementation: optimization-interfaces.
 */
export interface NeuralOptimizer {
    optimizeTrainingSpeed(network: NeuralNetwork): Promise<OptimizationResult>;
    implementBatchProcessing(trainer: NetworkTrainer): Promise<BatchConfig>;
    enableGPUAcceleration(computeUnits: ComputeUnit[]): Promise<AccelerationResult>;
    optimizeMemoryUsage(networks: NeuralNetwork[]): Promise<MemoryOptimization>;
}
export interface SwarmOptimizer {
    optimizeMessageRouting(topology: SwarmTopology): Promise<RoutingOptimization>;
    implementCaching(coordinationLayer: CoordinationLayer): Promise<CacheStrategy>;
    reduceLatency(communicationProtocols: Protocol[]): Promise<LatencyReduction>;
    scaleHorizontally(swarmSize: number): Promise<ScalingStrategy>;
}
export interface DataOptimizer {
    optimizeQueryPerformance(queries: DatabaseQuery[]): Promise<QueryOptimization>;
    implementConnectionPooling(connections: Connection[]): Promise<PoolConfig>;
    addIntelligentCaching(cacheLayer: CacheLayer): Promise<CacheOptimization>;
    compressDataStorage(storage: StorageLayer): Promise<CompressionResult>;
}
export interface WasmOptimizer {
    optimizeWasmModuleLoading(modules: WasmModule[]): Promise<LoadingOptimization>;
    implementStreamingCompilation(wasmFiles: WasmFile[]): Promise<StreamingResult>;
    optimizeMemorySharing(jsWasmBridge: Bridge): Promise<MemoryOptimization>;
    enableSIMDAcceleration(computeKernels: Kernel[]): Promise<SIMDResult>;
}
export interface OptimizationResult {
    success: boolean;
    improvement: number;
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
    utilizationAnalysis?: any;
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
export declare const NEURAL_PERFORMANCE_TARGETS: {
    readonly trainingSpeedImprovement: 5;
    readonly memoryReduction: 0.6;
    readonly inferenceLatency: 10;
    readonly batchThroughput: 10000;
};
export declare const SWARM_PERFORMANCE_TARGETS: {
    readonly messageLatency: 5;
    readonly coordinationOverhead: 0.05;
    readonly scalability: 10000;
    readonly faultTolerance: 0.999;
};
export declare const DATA_PERFORMANCE_TARGETS: {
    readonly queryResponseTime: 50;
    readonly cacheHitRatio: 0.95;
    readonly compressionRatio: 0.7;
    readonly connectionEfficiency: 0.98;
};
export declare const WASM_PERFORMANCE_TARGETS: {
    readonly moduleLoadTime: 100;
    readonly executionSpeedImprovement: 10;
    readonly memoryOverhead: 0.1;
    readonly interopLatency: 1;
};
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
//# sourceMappingURL=optimization-interfaces.d.ts.map