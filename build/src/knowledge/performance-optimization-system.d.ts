/**
 * Performance Optimization System for Cross-Agent Knowledge Sharing.
 * Implements intelligent caching, bandwidth optimization, and priority management.
 *
 * Architecture: Multi-layer optimization with adaptive resource management
 * - Intelligent Caching: Multi-tier caching with prediction and prefetching
 * - Bandwidth Optimization: Compression, delta encoding, and adaptive streaming
 * - Priority Management: Dynamic priority queuing and resource allocation
 * - Load Balancing: Intelligent distribution of knowledge requests
 * - Real-time Monitoring: Performance tracking and adaptive optimization.
 */
/**
 * @file Performance-optimization-system implementation.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { SystemHealth } from '../types/shared-types.ts';
export type HealthStatus = SystemHealth;
export interface ConsistencyManager {
    ensureConsistency(entries: CacheEntry[]): Promise<void>;
}
export interface CacheIndexing {
    index: Map<string, string>;
    searchIndex(query: string): string[];
}
export interface CacheMetrics {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    size: number;
}
export interface CacheConfiguration {
    maxSize: number;
    ttl: number;
    evictionPolicy: string;
    replication: boolean;
}
export interface LocalCacheStorage {
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
}
export interface DistributedCacheStorage {
    nodes: string[];
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
}
export interface PersistentCacheStorage {
    persist(key: string, value: any): Promise<void>;
    load(key: string): Promise<any>;
}
export interface HierarchicalCacheStorage {
    levels: CacheLevel[];
    store(key: string, value: any, level: number): Promise<void>;
    retrieve(key: string): Promise<any>;
}
export interface CacheLevel {
    name: string;
    capacity: number;
    speed: number;
}
export interface AccessPattern {
    frequency: number;
    recency: number;
    locality: number;
    temporality: string;
}
export interface CacheQuality {
    freshness: number;
    accuracy: number;
    completeness: number;
    reliability: number;
}
export interface CacheDependency {
    type: string;
    target: string;
    strength: number;
}
export type CachePriority = 'low' | 'medium' | 'high' | 'critical';
export type CacheType = 'local' | 'distributed' | 'persistent' | 'hierarchical';
export interface PolicySelector {
    selectPolicy(context: string): EvictionPolicyType;
}
export interface AdaptiveEvictionEngine {
    adapt(metrics: CacheMetrics): void;
}
export interface EvictionPerformanceTracker {
    trackPerformance(policy: EvictionPolicyType): number;
}
export interface EvictionPolicy {
    name: string;
    algorithm: string;
    parameters: Record<string, any>;
}
export interface ReplicationStrategy {
    type: string;
    replicas: number;
    consistency: string;
}
export type ConsistencyLevel = 'eventual' | 'strong' | 'weak';
export interface ConflictResolutionStrategy {
    type: string;
    resolution: string;
    priority: number;
}
export interface SynchronizationProtocol {
    name: string;
    frequency: number;
    method: string;
}
export interface ReplicationHealthMonitor {
    checkHealth(replicas: string[]): boolean;
}
export interface PredictionModel {
    name: string;
    accuracy: number;
    predict(pattern: AccessPattern): number;
}
export interface PrefetchingStrategy {
    name: string;
    trigger: string;
    scope: string;
}
export interface WorkloadAnalyzer {
    analyzeWorkload(requests: any[]): WorkloadProfile;
}
export interface WorkloadProfile {
    patterns: AccessPattern[];
    peak_times: number[];
    resource_usage: Record<string, number>;
}
export interface PrefetchScheduler {
    schedule(items: string[]): void;
}
export interface CostBenefitAnalyzer {
    analyze(operation: string): CostBenefit;
}
export interface CostBenefit {
    cost: number;
    benefit: number;
    ratio: number;
}
export interface AdaptiveCompressionEngine {
    adapt(data: any): Promise<any>;
    getCompressionRatio(): number;
}
export interface CompressionPerformance {
    ratio: number;
    speed: number;
    quality: number;
}
export interface BatchingPerformanceTracker {
    trackPerformance(batchSize: number): number;
}
export interface StreamAdaptationEngine {
    adapt(conditions: any): Promise<void>;
}
export interface StreamQualityManager {
    manageQuality(stream: any): void;
}
export interface BufferingStrategy {
    buffer(data: any): any[];
}
export interface FlowControlManager {
    control(flow: any): void;
}
export interface PriorityCalculator {
    calculate(request: any): number;
}
export interface QueueManager {
    manage(queue: any[]): void;
}
export interface FairnessController {
    ensureFairness(requests: any[]): void;
}
export interface QueuePerformanceMonitor {
    monitor(queue: any[]): any;
}
export interface FairnessEnforcementSystem {
    enforce(requests: any[]): void;
}
export interface WeightingScheme {
    weight(factor: any): number;
}
export interface PriorityAlgorithm {
    calculate(factors: any[]): number;
}
export interface AdaptivePrioritizationEngine {
    adapt(context: any): void;
}
export interface ContextualPrioritizationSystem {
    prioritize(context: any): number;
}
export interface PriorityAdjustmentEngine {
    adjust(priority: number, context: any): number;
}
export interface TemporalPrioritizationSystem {
    prioritizeByTime(requests: any[]): any[];
}
export interface LoadBasedPrioritizationEngine {
    prioritizeByLoad(requests: any[]): any[];
}
export interface UserFeedbackIntegrator {
    integrate(feedback: any): void;
}
export interface EmergencyPrioritizationHandler {
    handle(emergency: any): void;
}
export interface UtilizationOptimizer {
    optimize(utilization: number): void;
}
export interface CapacityPlanningEngine {
    plan(capacity: any): any;
}
export interface ElasticScalingManager {
    scale(metrics: any): void;
}
export interface ServiceClass {
    name: string;
    priority: number;
    resources: any;
}
export interface SLAManager {
    manage(sla: any): void;
}
export interface PerformanceGuarantee {
    guarantee: string;
    threshold: number;
}
export interface ViolationDetectionSystem {
    detect(metrics: any): boolean;
}
export interface RemedialActionEngine {
    execute(violation: any): void;
}
export interface AdaptiveBalancingEngine {
    balance(load: any[]): any[];
}
export interface LoadBalancerMetrics {
    distribution: Record<string, number>;
    utilization: number;
}
export interface LoadBalancerConfig {
    algorithm: string;
    nodes: string[];
}
export interface BalancingApplicability {
    applicable(context: any): boolean;
}
export interface BalancingPerformance {
    efficiency: number;
    latency: number;
}
export interface AdaptabilityConfig {
    enabled: boolean;
    threshold: number;
}
export interface HealthChecker {
    check(node: string): boolean;
}
export interface HealthCheckProtocol {
    protocol: string;
    interval: number;
}
export interface FailureDetectionSystem {
    detect(node: string): boolean;
}
export interface RecoveryManager {
    recover(node: string): Promise<void>;
}
export interface HealthAlertingSystem {
    alert(message: string): void;
}
export interface TrafficShapingPolicy {
    shape(traffic: any): any;
}
export interface RateLimitingSystem {
    limit(request: any): boolean;
}
export interface CongestionControlSystem {
    control(congestion: any): void;
}
export interface AdaptiveShapingEngine {
    shape(traffic: any): any;
}
export interface FlowClassificationSystem {
    classify(flow: any): string;
}
export interface DashboardSystem {
    display(data: any): void;
}
export interface MetricsAggregationRule {
    aggregate(metrics: any[]): any;
}
export interface SamplingStrategy {
    sample(data: any[]): any[];
}
export interface MetricsStorageSystem {
    store(metrics: any): Promise<void>;
}
export interface RetentionPolicy {
    shouldRetain(metric: any): boolean;
}
export interface AnalyticsModel {
    analyze(data: any): any;
}
export interface TrendAnalysisEngine {
    analyze(data: any[]): any;
}
export interface PatternRecognitionSystem {
    recognize(data: any[]): string[];
}
export interface PredictiveAnalyticsEngine {
    predict(data: any): any;
}
export interface ReportGenerationSystem {
    generate(data: any): any;
}
export interface BaselineManager {
    manage(baseline: any): void;
}
export interface ThresholdManager {
    manage(threshold: any): void;
}
export interface CorrelationAnalysisEngine {
    analyze(data: any[]): any;
}
export interface RootCauseAnalysisSystem {
    analyze(issue: any): string;
}
export interface AlertRule {
    condition: string;
    action: string;
}
export interface NotificationChannel {
    send(message: string): Promise<void>;
}
export interface EscalationPolicy {
    escalate(alert: any): void;
}
export interface AlertCorrelationEngine {
    correlate(alerts: any[]): any[];
}
export interface SuppressionRule {
    suppress(alert: any): boolean;
}
/**
 * Intelligent Caching System.
 *
 * @example
 */
export interface IntelligentCachingSystem {
    cacheTypes: Map<string, CacheManager>;
    evictionPolicies: EvictionPolicyManager;
    replicationStrategy: ReplicationManager;
    consistencyManager: ConsistencyManager;
    prefetchingEngine: PrefetchingEngine;
}
export interface CacheManager {
    cacheType: CacheType;
    storage: CacheStorage;
    indexing: CacheIndexing;
    metrics: CacheMetrics;
    configuration: CacheConfiguration;
}
export interface CacheStorage {
    localCache: LocalCacheStorage;
    distributedCache: DistributedCacheStorage;
    persistentCache: PersistentCacheStorage;
    hierarchicalCache: HierarchicalCacheStorage;
}
export interface CacheEntry {
    key: string;
    value: any;
    metadata: CacheEntryMetadata;
    accessPattern: AccessPattern;
    quality: CacheQuality;
    dependencies: CacheDependency[];
}
export interface CacheEntryMetadata {
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    size: number;
    ttl: number;
    priority: CachePriority;
    tags: string[];
    version: string;
}
export interface EvictionPolicyManager {
    policies: Map<string, EvictionPolicyType>;
    policySelection: PolicySelector;
    adaptiveEviction: AdaptiveEvictionEngine;
    performanceTracker: EvictionPerformanceTracker;
}
export interface ReplicationManager {
    replicationStrategy: ReplicationStrategyType;
    consistencyLevel: AdvancedConsistencyLevel;
    conflictResolution: ConflictResolutionStrategy;
    syncProtocol: SynchronizationProtocol;
    healthMonitoring: ReplicationHealthMonitor;
}
export interface PrefetchingEngine {
    predictionModels: PredictionModel[];
    prefetchingStrategies: PrefetchingStrategy[];
    workloadAnalyzer: WorkloadAnalyzer;
    prefetchScheduler: PrefetchScheduler;
    costBenefitAnalyzer: CostBenefitAnalyzer;
}
export type KnowledgeCacheType = 'knowledge-facts' | 'pattern-cache' | 'model-cache' | 'insight-cache' | 'routing-cache' | 'validation-cache' | 'reputation-cache';
export type EvictionPolicyType = 'lru' | 'lfu' | 'ttl' | 'quality-based' | 'access-pattern-based' | 'cost-benefit-based' | 'predictive-eviction';
export type ReplicationStrategyType = 'master-slave' | 'master-master' | 'consistent-hashing' | 'gossip-based' | 'hierarchical' | 'adaptive';
export type AdvancedConsistencyLevel = 'eventual' | 'strong' | 'causal' | 'session' | 'bounded-staleness' | 'monotonic';
/**
 * Bandwidth Optimization System.
 *
 * @example
 */
export interface BandwidthOptimizationSystem {
    compressionEngine: CompressionEngine;
    deltaEncoding: DeltaEncodingSystem;
    batchingStrategy: BatchingStrategyManager;
    adaptiveStreaming: AdaptiveStreamingEngine;
    priorityQueuing: PriorityQueuingSystem;
}
export interface CompressionEngine {
    algorithms: Map<string, CompressionAlgorithm>;
    algorithmSelection: AlgorithmSelector;
    adaptiveCompression: AdaptiveCompressionEngine;
    performanceOptimizer: CompressionOptimizer;
}
export interface CompressionAlgorithm {
    algorithmName: string;
    compressionType: CompressionType;
    configuration: CompressionConfig;
    performance: CompressionPerformance;
    applicability: CompressionApplicability;
}
export interface DeltaEncodingSystem {
    deltaComputation: DeltaComputationEngine;
    diffStrategies: DiffStrategy[];
    changeDetection: ChangeDetectionSystem;
    reconstructionEngine: ReconstructionEngine;
    versionManagement: DeltaVersionManager;
}
export interface BatchingStrategyManager {
    batchingStrategies: Map<string, BatchingStrategy>;
    batchOptimizer: BatchOptimizer;
    aggregationRules: AggregationRule[];
    batchScheduler: BatchScheduler;
    performanceTracker: BatchingPerformanceTracker;
}
export interface AdaptiveStreamingEngine {
    streamingProtocols: StreamingProtocol[];
    adaptationEngine: StreamAdaptationEngine;
    qualityManagement: StreamQualityManager;
    bufferingStrategy: BufferingStrategy;
    flowControl: FlowControlManager;
}
export interface PriorityQueuingSystem {
    priorityQueues: Map<string, PriorityQueue>;
    priorityCalculator: PriorityCalculator;
    queueManagement: QueueManager;
    fairnessController: FairnessController;
    performanceMonitor: QueuePerformanceMonitor;
}
export type CompressionType = 'lossless' | 'lossy' | 'hybrid' | 'semantic' | 'structure-aware' | 'context-aware';
export type DiffStrategy = 'line-based' | 'word-based' | 'character-based' | 'structural' | 'semantic' | 'binary';
export type StreamingProtocol = 'http2-push' | 'websocket' | 'grpc-streaming' | 'custom-udp' | 'adaptive-http' | 'p2p-streaming';
/**
 * Priority Management System.
 *
 * @example
 */
export interface PriorityManagementSystem {
    priorityCalculation: PriorityCalculationEngine;
    dynamicPrioritization: DynamicPrioritizationSystem;
    resourceAllocation: ResourceAllocationManager;
    qosManagement: QoSManager;
    fairnessEnforcement: FairnessEnforcementSystem;
}
export interface PriorityCalculationEngine {
    priorityFactors: PriorityFactor[];
    weightingSchemes: WeightingScheme[];
    calculationAlgorithms: PriorityAlgorithm[];
    adaptivePrioritization: AdaptivePrioritizationEngine;
    contextualPrioritization: ContextualPrioritizationSystem;
}
export interface DynamicPrioritizationSystem {
    priorityAdjustment: PriorityAdjustmentEngine;
    temporalPrioritization: TemporalPrioritizationSystem;
    loadBasedPrioritization: LoadBasedPrioritizationEngine;
    userFeedbackIntegration: UserFeedbackIntegrator;
    emergencyPrioritization: EmergencyPrioritizationHandler;
}
export interface ResourceAllocationManager {
    allocationStrategies: AllocationStrategy[];
    resourcePools: Map<string, ResourcePool>;
    utilizationOptimizer: UtilizationOptimizer;
    capacityPlanning: CapacityPlanningEngine;
    elasticScaling: ElasticScalingManager;
}
export interface QoSManager {
    serviceClasses: ServiceClass[];
    slaManagement: SLAManager;
    performanceGuarantees: PerformanceGuarantee[];
    violationDetection: ViolationDetectionSystem;
    remedialActions: RemedialActionEngine;
}
export type PriorityFactor = 'urgency' | 'importance' | 'agent-reputation' | 'knowledge-quality' | 'resource-cost' | 'deadline' | 'user-preference';
export type AllocationStrategy = 'proportional-share' | 'weighted-fair-queuing' | 'lottery-scheduling' | 'deficit-round-robin' | 'earliest-deadline-first' | 'rate-monotonic';
/**
 * Load Balancing System.
 *
 * @example
 */
export interface LoadBalancingSystem {
    loadBalancers: Map<string, LoadBalancer>;
    balancingStrategies: BalancingStrategy[];
    healthChecking: HealthCheckingSystem;
    trafficShaping: TrafficShapingEngine;
    adaptiveBalancing: AdaptiveBalancingEngine;
}
export interface LoadBalancer {
    balancerType: LoadBalancerType;
    algorithm: LoadBalancingAlgorithm;
    healthStatus: HealthStatus;
    performanceMetrics: LoadBalancerMetrics;
    configuration: LoadBalancerConfig;
}
export interface BalancingStrategy {
    strategyName: string;
    algorithm: LoadBalancingAlgorithm;
    applicability: BalancingApplicability;
    performance: BalancingPerformance;
    adaptability: AdaptabilityConfig;
}
export interface HealthCheckingSystem {
    healthCheckers: Map<string, HealthChecker>;
    checkingProtocols: HealthCheckProtocol[];
    failureDetection: FailureDetectionSystem;
    recoveryManagement: RecoveryManager;
    alertingSystem: HealthAlertingSystem;
}
export interface TrafficShapingEngine {
    shapingPolicies: TrafficShapingPolicy[];
    rateLimiting: RateLimitingSystem;
    congestionControl: CongestionControlSystem;
    adaptiveShaping: AdaptiveShapingEngine;
    flowClassification: FlowClassificationSystem;
}
export type LoadBalancerType = 'layer4' | 'layer7' | 'dns-based' | 'content-based' | 'geographic' | 'application-aware';
export type LoadBalancingAlgorithm = 'round-robin' | 'weighted-round-robin' | 'least-connections' | 'least-response-time' | 'resource-based' | 'hash-based' | 'geographic-proximity';
/**
 * Real-time Monitoring System.
 *
 * @example
 */
export interface RealTimeMonitoringSystem {
    metricsCollection: MetricsCollectionEngine;
    performanceAnalytics: PerformanceAnalyticsEngine;
    anomalyDetection: AnomalyDetectionSystem;
    alertingSystem: AlertingSystem;
    dashboardSystem: DashboardSystem;
}
export interface MetricsCollectionEngine {
    collectors: Map<string, MetricsCollector>;
    aggregationRules: MetricsAggregationRule[];
    samplingStrategies: SamplingStrategy[];
    storageSystem: MetricsStorageSystem;
    retentionPolicies: RetentionPolicy[];
}
export interface PerformanceAnalyticsEngine {
    analyticsModels: AnalyticsModel[];
    trendAnalysis: TrendAnalysisEngine;
    patternRecognition: PatternRecognitionSystem;
    predictiveAnalytics: PredictiveAnalyticsEngine;
    reportGeneration: ReportGenerationSystem;
}
export interface AnomalyDetectionSystem {
    detectionAlgorithms: AnomalyDetectionAlgorithm[];
    baselineManagement: BaselineManager;
    thresholdManagement: ThresholdManager;
    correlationAnalysis: CorrelationAnalysisEngine;
    rootCauseAnalysis: RootCauseAnalysisSystem;
}
export interface AlertingSystem {
    alertRules: AlertRule[];
    notificationChannels: NotificationChannel[];
    escalationPolicies: EscalationPolicy[];
    alertCorrelation: AlertCorrelationEngine;
    suppressionRules: SuppressionRule[];
}
export type MetricsType = 'latency' | 'throughput' | 'error-rate' | 'resource-utilization' | 'cache-hit-ratio' | 'bandwidth-usage' | 'queue-depth';
export type AnomalyDetectionAlgorithm = 'statistical-threshold' | 'machine-learning' | 'time-series-analysis' | 'clustering-based' | 'ensemble-methods' | 'neural-networks';
/**
 * Main Performance Optimization System.
 *
 * @example
 */
export declare class PerformanceOptimizationSystem extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private cachingSystem;
    private bandwidthOptimization;
    private priorityManagement;
    private loadBalancing;
    private monitoring;
    private cacheEntries;
    private performanceMetrics;
    private optimizationRules;
    private resourcePools;
    private activeOptimizations;
    constructor(config: PerformanceOptimizationConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize all optimization systems.
     */
    private initializeSystems;
    /**
     * Set up system integrations.
     */
    private setupIntegrations;
    /**
     * Optimize knowledge request processing.
     *
     * @param request
     */
    optimizeKnowledgeRequest(request: KnowledgeRequest): Promise<OptimizedKnowledgeResponse>;
    /**
     * Optimize knowledge sharing between agents.
     *
     * @param sharingRequest
     */
    optimizeKnowledgeSharing(sharingRequest: KnowledgeSharingRequest): Promise<KnowledgeSharingOptimization>;
    /**
     * Optimize cache performance dynamically.
     */
    optimizeCachePerformance(): Promise<CacheOptimizationResult>;
    /**
     * Get comprehensive performance metrics.
     */
    getMetrics(): Promise<PerformanceOptimizationMetrics>;
    /**
     * Shutdown optimization system gracefully.
     */
    shutdown(): Promise<void>;
    private checkIntelligentCache;
    private calculateRequestPriority;
    private selectProcessingStrategy;
    private getCompressionRatio;
    private getResourceUtilization;
    private getRequestPerformanceMetrics;
    private analyzeDistributionPatterns;
    private selectSharingStrategy;
    private optimizeContentForSharing;
    private optimizeRoutingAndBatching;
    private applyAdaptiveStreaming;
    private executeOptimizedSharing;
    private monitorSharingPerformance;
    private calculateBandwidthReduction;
    private calculateLatencyImprovement;
    private calculateThroughputIncrease;
    private calculateResourceEfficiency;
    private analyzeCachePerformance;
    private identifyCacheOptimizations;
    private applyCacheOptimization;
    private updateEvictionPolicies;
    private optimizePrefetchingStrategies;
    private optimizeReplicationStrategies;
    private calculateHitRateImprovement;
    private calculateLatencyReduction;
    private calculateMemoryEfficiency;
    private calculateNetworkReduction;
    private getCacheHitRate;
    private getCacheMissRate;
    private getCacheEvictionRate;
    private getCacheMemoryUtilization;
    private getCacheAverageLatency;
    private getAverageCompressionRatio;
    private getTotalBandwidthSavings;
    private getTransferEfficiency;
    private getStreamingUtilization;
    private getAverageResponseTime;
    private getPriorityDistribution;
    private getQoSViolations;
    private getFairnessIndex;
    private getLoadDistribution;
    private getHealthyNodeCount;
    private getAverageUtilization;
    private getFailoverRate;
    private getMetricsCollectionRate;
    private getAnomaliesDetected;
    private getAlertsGenerated;
    private getSystemHealth;
    private getAverageOptimizationGain;
    private getOverallResourceEfficiency;
    private getUserSatisfactionScore;
    private applyPerformanceOptimizations;
    private createOptimizedResponse;
    private applyBandwidthOptimization;
    private routeThroughLoadBalancer;
    private processWithMonitoring;
    private cacheProcessedResult;
    private applyPostProcessingOptimizations;
    private createIntelligentCachingSystem;
    private createBandwidthOptimizationSystem;
    private createPriorityManagementSystem;
    private createLoadBalancingSystem;
    private createRealTimeMonitoringSystem;
}
/**
 * Core interfaces for performance optimization system.
 *
 * @example
 */
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    unit: string;
}
export interface OptimizationRule {
    name: string;
    condition: string;
    action: string;
    priority: number;
}
export interface ActiveOptimization {
    id: string;
    type: string;
    startTime: number;
    status: 'running' | 'completed' | 'failed';
}
export interface ResourcePool {
    id: string;
    capacity: number;
    utilization: number;
    resources: any[];
}
export interface CachingConfig {
    maxSize: number;
    evictionPolicy: string;
    replication: boolean;
}
export interface BandwidthConfig {
    compressionEnabled: boolean;
    maxTransferSize: number;
}
export interface PriorityConfig {
    defaultPriority: string;
    maxQueue: number;
}
export interface LoadBalancingConfig {
    algorithm: string;
    healthCheck: boolean;
}
export interface MonitoringConfig {
    enabled: boolean;
    interval: number;
}
/**
 * Configuration and result interfaces.
 *
 * @example
 */
export interface PerformanceOptimizationConfig {
    caching: CachingConfig;
    bandwidth: BandwidthConfig;
    priority: PriorityConfig;
    loadBalancing: LoadBalancingConfig;
    monitoring: MonitoringConfig;
}
export interface KnowledgeRequest {
    id: string;
    type: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    content: any;
    metadata: any;
}
export interface KnowledgeSharingRequest {
    sourceAgent: string;
    targetAgents: string[];
    knowledge: any;
    knowledgeSize: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface OptimizedKnowledgeResponse {
    requestId: string;
    response: any;
    optimizations: OptimizationMetrics;
    performanceMetrics: any;
    timestamp: number;
}
export interface KnowledgeSharingOptimization {
    optimizationId: string;
    originalRequest: KnowledgeSharingRequest;
    sharingStrategy: string;
    optimizations: SharingOptimizationMetrics;
    performanceMetrics: any;
    sharingResults: any;
    optimizationTime: number;
    timestamp: number;
}
export interface CacheOptimizationResult {
    optimizationId: string;
    originalMetrics: any;
    appliedOptimizations: number;
    evictionUpdates: number;
    prefetchingOptimizations: number;
    replicationOptimizations: number;
    performanceImprovement: PerformanceImprovement;
    optimizationTime: number;
    timestamp: number;
}
export interface PerformanceOptimizationMetrics {
    caching: any;
    bandwidth: any;
    priority: any;
    loadBalancing: any;
    monitoring: any;
    overall: any;
}
export interface OptimizationMetrics {
    cacheHit: boolean;
    compressionRatio: number;
    priorityLevel: string;
    processingTime: number;
    bandwidthSaved: number;
    resourceUtilization: number;
}
export interface SharingOptimizationMetrics {
    compressionAchieved: number;
    bandwidthReduction: number;
    latencyImprovement: number;
    throughputIncrease: number;
    resourceEfficiency: number;
}
export interface PerformanceImprovement {
    hitRateImprovement: number;
    latencyReduction: number;
    memoryEfficiency: number;
    networkReduction: number;
}
export interface CacheResult {
    hit: boolean;
    data: any;
}
export interface RequestPriority {
    level: string;
    score: number;
}
export interface ProcessingStrategy {
    name: string;
    config: any;
}
export interface CompressionConfig {
    algorithm: string;
    level: number;
    dictionary?: string;
}
export interface CompressionFormat {
    name: string;
    ratio: number;
    speed: number;
}
export interface CompressionApplicability {
    dataTypes: string[];
    sizeThreshold: number;
    conditions: string[];
}
export interface DeltaComputationEngine {
    computeDelta(oldData: any, newData: any): any;
}
export interface ChangeDetectionSystem {
    detectChanges(data: any): string[];
}
export interface ReconstructionEngine {
    reconstruct(base: any, delta: any): any;
}
export interface DeltaVersionManager {
    manageVersions(deltas: any[]): void;
}
export interface BatchingStrategy {
    shouldBatch(requests: any[]): boolean;
}
export interface BatchOptimizer {
    optimize(batch: any[]): any[];
}
export interface AggregationRule {
    canAggregate(items: any[]): boolean;
}
export interface BatchScheduler {
    schedule(batches: any[]): void;
}
export interface AdaptiveStreamingEngine {
    adaptStream(conditions: any): void;
}
export interface FlowControlSystem {
    controlFlow(stream: any): void;
}
export interface StreamingOptimizer {
    optimize(stream: any): any;
}
export interface NetworkConditionMonitor {
    monitor(): NetworkConditions;
}
export interface NetworkConditions {
    bandwidth: number;
    latency: number;
    packetLoss: number;
}
export interface QueueManagementSystem {
    manageQueue(queue: any[]): void;
}
export interface PriorityQueue {
    enqueue(item: any, priority: number): void;
    dequeue(): any;
}
export interface RequestScheduler {
    schedule(requests: any[]): void;
}
export interface QualityOfServiceEngine {
    enforceQoS(request: any): void;
}
export interface FairnessMechanism {
    ensureFairness(requests: any[]): void;
}
export interface LoadBalancingStrategy {
    balance(load: any[]): any[];
}
export interface HealthMonitor {
    checkHealth(nodes: string[]): boolean[];
}
export interface FailoverMechanism {
    failover(failedNode: string): void;
}
export interface ResourcePoolManager {
    managePool(resources: any[]): void;
}
export interface AutoScalingEngine {
    scale(metrics: any): void;
}
export interface MetricsCollector {
    collect(): any;
}
export interface AnomalyDetector {
    detect(metrics: any): string[];
}
export interface AlertManager {
    alert(message: string): void;
}
export interface PerformanceProfiler {
    profile(operation: string): any;
}
export interface AdaptiveOptimizationEngine {
    adapt(feedback: any): void;
}
export interface AlgorithmSelector {
    selectAlgorithm(context: string): string;
}
export interface CompressionOptimizer {
    optimize(config: CompressionConfig): Promise<CompressionConfig>;
}
export default PerformanceOptimizationSystem;
//# sourceMappingURL=performance-optimization-system.d.ts.map