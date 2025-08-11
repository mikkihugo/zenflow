/**
 * Distributed Learning System for Claude-Zen.
 * Implements federated learning, cross-agent experience sharing, and collective model improvement.
 *
 * Architecture: Multi-agent collaborative learning with privacy preservation
 * - Federated Learning: Decentralized model training across agents
 * - Experience Aggregation: Collective experience consolidation and pattern detection
 * - Model Synchronization: Intelligent model parameter sharing and version control
 * - Transfer Learning: Cross-domain knowledge transfer between specialized agents
 * - Collective Memory: Shared learning experiences and meta-learning patterns.
 */
/**
 * @file Distributed-learning-system implementation.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
export interface PerformanceMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    executionTime: number;
    memoryUsage: number;
    throughput: number;
    latency: number;
    errorRate: number;
    successRate: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface ConvergenceMetrics {
    convergenceScore: number;
    stabilityIndex: number;
    consensusLevel: number;
    iterationsToConverge: number;
    convergenceRate: number;
    threshold: number;
}
export interface ParticipationRecord {
    roundId: string;
    participationScore: number;
    contributionQuality: number;
    responseTime: number;
    reliability: number;
    timestamp: Date;
}
export interface ContributionMetrics {
    dataContributed: number;
    modelUpdatesProvided: number;
    accuracyImprovement: number;
    computationContributed: number;
    qualityScore: number;
}
export interface ModelArchitecture {
    type: string;
    layers: LayerConfig[];
    inputShape: number[];
    outputShape: number[];
    parameterCount: number;
    activationFunctions: string[];
}
export interface LayerConfig {
    type: string;
    units?: number;
    activation?: string;
    dropoutRate?: number;
    regularization?: RegularizationConfig;
}
export interface ModelMetadata {
    version: string;
    createdBy: string;
    trainingData: string;
    hyperparameters: Record<string, any>;
    performance: PerformanceMetrics;
    tags: string[];
    description?: string;
}
export interface OptimizerState {
    type: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
    learningRate: number;
    momentum?: number;
    beta1?: number;
    beta2?: number;
    epsilon?: number;
    decay?: number;
}
export interface RegularizationConfig {
    l1?: number;
    l2?: number;
    dropout?: number;
    batchNormalization?: boolean;
    earlyStoppingPatience?: number;
}
export interface GradientUpdate {
    layerGradients: Float32Array[];
    gradientNorm: number;
    clippingThreshold?: number;
    noiseMultiplier?: number;
    batchSize: number;
}
export interface TrainingMetrics {
    epochs: number;
    batchSize: number;
    learningRate: number;
    loss: number;
    accuracy: number;
    validationLoss?: number;
    validationAccuracy?: number;
    trainingTime: number;
}
export interface NormalizationConfig {
    method: 'batch' | 'layer' | 'instance' | 'group';
    momentum?: number;
    epsilon?: number;
    affine?: boolean;
}
export interface CompressionMetadata {
    algorithm: 'gzip' | 'lz4' | 'quantization' | 'pruning';
    compressionRatio: number;
    originalSize: number;
    compressedSize: number;
}
export interface EncryptionMetadata {
    algorithm: 'aes' | 'homomorphic' | 'multiparty';
    keySize: number;
    encryptionTime: number;
    privacyBudget?: number;
}
export interface AggregationQualityMetrics {
    participantCount: number;
    dataQualityScore: number;
    consistencyScore: number;
    diversityIndex: number;
    robustnessScore: number;
}
export interface ByzantineResistanceMetrics {
    detectedAttacks: number;
    filteredUpdates: number;
    robustnessScore: number;
    consensusReached: boolean;
}
export interface KnowledgeExtractionEngine {
    extractPatterns(experiences: AgentExperience[]): Promise<ExperiencePattern[]>;
    generateInsights(patterns: ExperiencePattern[]): Promise<CollectiveInsight[]>;
    validateKnowledge(knowledge: any): Promise<ValidationResult>;
}
export interface ExperienceContext {
    taskType: string;
    domain: string;
    complexity: number;
    environment: Record<string, any>;
    constraints: string[];
    objectives: string[];
}
export interface Action {
    id: string;
    type: string;
    parameters: Record<string, any>;
    timestamp: Date;
    duration: number;
    result: any;
}
export interface Outcome {
    success: boolean;
    value: any;
    error?: string;
    metrics: PerformanceMetrics;
    confidence: number;
}
export interface LearningMetrics {
    improvementRate: number;
    adaptationSpeed: number;
    transferEfficiency: number;
    retentionRate: number;
    generalizationScore: number;
}
export interface PatternCondition {
    field: string;
    operator: 'equals' | 'greater' | 'less' | 'contains' | 'matches';
    value: any;
    confidence: number;
}
export interface OutcomeDistribution {
    successRate: number;
    failureRate: number;
    averageValue: number;
    variance: number;
    distribution: Record<string, number>;
}
export interface ConsolidationRule {
    id: string;
    condition: PatternCondition[];
    action: 'merge' | 'keep' | 'discard' | 'transform';
    priority: number;
    parameters: Record<string, any>;
}
export interface MemoryPressureConfig {
    maxMemorySize: number;
    warningThreshold: number;
    criticalThreshold: number;
    evictionStrategy: 'lru' | 'lfu' | 'importance' | 'age';
}
export interface ForgettingCurveConfig {
    decayRate: number;
    halfLife: number;
    minimumRetention: number;
    reinforcementFactor: number;
}
export interface ImportanceWeightingConfig {
    recencyWeight: number;
    frequencyWeight: number;
    impactWeight: number;
    noveltyWeight: number;
}
export interface ConflictResolutionStrategy {
    method: 'consensus' | 'majority' | 'expert' | 'latest' | 'merge';
    threshold: number;
    fallbackStrategy: string;
    timeout: number;
}
export interface PatternAlgorithm {
    name: string;
    type: 'sequential' | 'association' | 'clustering' | 'anomaly';
    parameters: Record<string, any>;
    minSupport: number;
    minConfidence: number;
}
export interface DetectionThresholds {
    similarity: number;
    frequency: number;
    significance: number;
    novelty: number;
}
export interface BatchProcessingConfig {
    batchSize: number;
    maxBatchTime: number;
    parallelBatches: number;
    bufferSize: number;
}
export interface AnomalyDetectionConfig {
    threshold: number;
    algorithm: 'isolation-forest' | 'one-class-svm' | 'dbscan';
    sensitivityLevel: number;
}
export interface DistributionStrategy {
    type: 'broadcast' | 'gossip' | 'hierarchical' | 'selective';
    fanout: number;
    reliability: number;
    latencyOptimized: boolean;
}
export interface ConsistencyManager {
    level: 'eventual' | 'strong' | 'weak';
    conflictResolution: ConflictResolutionStrategy;
    timeoutMs: number;
}
export interface ModelBranch {
    branchId: string;
    parentVersion: string;
    metadata: ModelMetadata;
    divergenceScore: number;
    mergeable: boolean;
}
export interface MergeRecord {
    mergeId: string;
    sourceBranches: string[];
    targetBranch: string;
    strategy: 'three-way' | 'fast-forward' | 'recursive';
    conflicts: ConflictInfo[];
    timestamp: Date;
}
export interface ConflictInfo {
    path: string;
    type: 'parameter' | 'architecture' | 'metadata';
    resolution: 'auto' | 'manual';
    confidence: number;
}
export interface VersioningStrategy {
    scheme: 'semantic' | 'timestamp' | 'hash' | 'incremental';
    autoTag: boolean;
    retentionPolicy: RetentionPolicy;
}
export interface RetentionPolicy {
    maxVersions: number;
    maxAge: number;
    keepMajorVersions: boolean;
}
export interface RollbackConfig {
    enableRollback: boolean;
    maxRollbackDepth: number;
    autoRollbackOnFailure: boolean;
    validationRequired: boolean;
}
export interface ModelChangeset {
    added: string[];
    modified: string[];
    removed: string[];
    parameterDiff: ParameterDiff;
    architectureChanges: ArchitectureChange[];
}
export interface ParameterDiff {
    layerChanges: LayerDiff[];
    totalParameters: number;
    significantChanges: number;
}
export interface LayerDiff {
    layerId: string;
    changeType: 'added' | 'removed' | 'modified';
    parameterDelta: Float32Array;
    significance: number;
}
export interface ArchitectureChange {
    type: 'layer-added' | 'layer-removed' | 'layer-modified' | 'connection-changed';
    layer: string;
    details: Record<string, any>;
}
export interface VersionMetadata {
    author: string;
    message: string;
    tags: string[];
    buildInfo: BuildInfo;
    testResults?: TestResult[];
}
export interface BuildInfo {
    buildId: string;
    timestamp: Date;
    environment: string;
    dependencies: Record<string, string>;
}
export interface TestResult {
    testId: string;
    passed: boolean;
    score: number;
    duration: number;
    details?: Record<string, any>;
}
export interface BandwidthConfig {
    maxBandwidth: number;
    priorityChannels: number;
    compressionEnabled: boolean;
    adaptiveThrottling: boolean;
}
export interface PriorityConfig {
    levels: PriorityLevel[];
    defaultPriority: string;
    escalationRules: EscalationRule[];
}
export interface PriorityLevel {
    name: string;
    weight: number;
    maxConcurrency: number;
    timeout: number;
}
export interface EscalationRule {
    condition: string;
    newPriority: string;
    delay: number;
}
export interface ErrorHandlingConfig {
    retryAttempts: number;
    retryDelay: number;
    fallbackStrategies: FallbackStrategy[];
    errorThresholds: ErrorThreshold[];
}
export interface ErrorThreshold {
    errorType: string;
    threshold: number;
    action: 'retry' | 'fallback' | 'abort' | 'escalate';
}
export interface ConsensusConfig {
    algorithm: 'raft' | 'pbft' | 'proof-of-stake';
    minParticipants: number;
    consensusThreshold: number;
    timeout: number;
}
export interface FallbackStrategy {
    name: string;
    type: 'cache' | 'default' | 'previous' | 'consensus';
    parameters: Record<string, any>;
    confidence: number;
}
export interface TaskTransferEngine {
    identifyTransferTasks(domain: string): Promise<TransferTask[]>;
    assessTransferability(source: string, target: string): Promise<TransferabilityScore>;
    executeTransfer(task: TransferTask): Promise<TransferResult>;
}
export interface MetaLearningEngine {
    learnTransferPatterns(transfers: TransferResult[]): Promise<MetaPattern[]>;
    predictTransferSuccess(task: TransferTask): Promise<SuccessPrediction>;
    optimizeTransferStrategy(pattern: MetaPattern): Promise<OptimizedStrategy>;
}
export interface TransferTask {
    id: string;
    sourceDomain: string;
    targetDomain: string;
    transferType: TransferMethod;
    priority: number;
    estimatedEffort: number;
}
export interface TransferabilityScore {
    score: number;
    confidence: number;
    factors: TransferFactor[];
    recommendations: string[];
}
export interface TransferFactor {
    name: string;
    impact: number;
    description: string;
}
export interface TransferResult {
    taskId: string;
    success: boolean;
    performanceGain: number;
    transferTime: number;
    lessonsLearned: string[];
}
export interface MetaPattern {
    pattern: string;
    successRate: number;
    applicableDomains: string[];
    conditions: PatternCondition[];
}
export interface SuccessPrediction {
    probability: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
}
export interface OptimizedStrategy {
    strategy: string;
    parameters: Record<string, any>;
    expectedImprovement: number;
    confidence: number;
}
export interface TransferEvaluationSystem {
    evaluateTransfer(result: TransferResult): Promise<EvaluationScore>;
    benchmarkPerformance(domain: string): Promise<BenchmarkResult>;
    generateReport(evaluations: EvaluationScore[]): Promise<EvaluationReport>;
}
export interface EvaluationScore {
    transferId: string;
    overallScore: number;
    dimensions: ScoreDimension[];
    recommendations: string[];
}
export interface ScoreDimension {
    name: string;
    score: number;
    weight: number;
    explanation: string;
}
export interface BenchmarkResult {
    domain: string;
    baselinePerformance: PerformanceMetrics;
    benchmarkTasks: BenchmarkTask[];
    timestamp: Date;
}
export interface BenchmarkTask {
    taskId: string;
    performance: PerformanceMetrics;
    difficulty: number;
    category: string;
}
export interface EvaluationReport {
    summary: ReportSummary;
    detailed: DetailedAnalysis[];
    recommendations: string[];
    timestamp: Date;
}
export interface ReportSummary {
    totalTransfers: number;
    successRate: number;
    averageGain: number;
    topPerformingDomains: string[];
}
export interface DetailedAnalysis {
    domain: string;
    transferCount: number;
    successRate: number;
    averageGain: number;
    keyFactors: TransferFactor[];
}
export interface TransferPath {
    from: string;
    to: string;
    weight: number;
    hops: string[];
    confidence: number;
}
export interface SimilarityMatrix {
    domains: string[];
    similarities: number[][];
    algorithm: string;
    lastUpdated: Date;
}
export interface TransferabilityMatrix {
    domains: string[];
    transferabilities: number[][];
    basedOn: string[];
    confidence: number;
}
export interface DomainCharacteristics {
    taskTypes: string[];
    dataDistribution: DataDistribution;
    complexityMetrics: ComplexityMetrics;
    resourceRequirements: ResourceRequirements;
}
export interface DataDistribution {
    type: 'continuous' | 'categorical' | 'mixed';
    dimensions: number;
    sparsity: number;
    noise: number;
}
export interface ComplexityMetrics {
    computational: number;
    temporal: number;
    spatial: number;
    conceptual: number;
}
export interface ResourceRequirements {
    memory: number;
    compute: number;
    storage: number;
    network: number;
}
export interface TransferRecord {
    transferId: string;
    timestamp: Date;
    result: TransferResult;
    metadata: Record<string, any>;
}
export interface DomainPerformance {
    accuracy: number;
    efficiency: number;
    robustness: number;
    adaptability: number;
    lastEvaluated: Date;
}
export interface TransferSuccessMetrics {
    totalAttempts: number;
    successfulTransfers: number;
    averageGain: number;
    bestGain: number;
    worstLoss: number;
}
export interface FeatureAlignmentConfig {
    method: 'linear' | 'nonlinear' | 'adversarial';
    dimensionality: number;
    regularization: RegularizationConfig;
}
export interface DistributionMatchingConfig {
    technique: 'mmd' | 'wasserstein' | 'kl-divergence';
    tolerance: number;
    maxIterations: number;
}
export interface AdversarialTrainingConfig {
    discriminatorLayers: number[];
    learningRate: number;
    balanceWeight: number;
    maxEpochs: number;
}
export interface GradualAdaptationConfig {
    stages: AdaptationStage[];
    transitionStrategy: 'smooth' | 'discrete';
    validationRequired: boolean;
}
export interface AdaptationStage {
    name: string;
    duration: number;
    adaptationRate: number;
    validationMetrics: string[];
}
export interface MemoryRetrievalSystem {
    retrieve(query: MemoryQuery): Promise<MemoryResult[]>;
    index(memories: CollectiveMemory[]): Promise<void>;
    search(query: string, limit: number): Promise<SearchResult[]>;
}
export interface MemoryQuery {
    keywords: string[];
    timeRange?: TimeRange;
    memoryTypes?: MemoryType[];
    minScore?: number;
    context?: Record<string, any>;
}
export interface TimeRange {
    start: Date;
    end: Date;
}
export interface MemoryResult {
    memory: CollectiveMemory;
    score: number;
    relevance: number;
    context: Record<string, any>;
}
export interface SearchResult {
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
}
export interface ForgettingMechanism {
    shouldForget(memory: CollectiveMemory): boolean;
    decayMemory(memory: CollectiveMemory): CollectiveMemory;
    purgeOldMemories(): Promise<number>;
}
export interface EpisodicMemorySystem {
    storeEpisode(episode: MemoryEpisode): Promise<void>;
    retrieveEpisodes(context: ExperienceContext): Promise<MemoryEpisode[]>;
    linkEpisodes(episodes: MemoryEpisode[]): Promise<EpisodeGraph>;
}
export interface MemoryEpisode {
    id: string;
    context: ExperienceContext;
    events: MemoryEvent[];
    outcome: Outcome;
    timestamp: Date;
}
export interface MemoryEvent {
    id: string;
    type: string;
    data: any;
    timestamp: Date;
    significance: number;
}
export interface EpisodeGraph {
    episodes: MemoryEpisode[];
    connections: EpisodeConnection[];
    clusters: EpisodeCluster[];
}
export interface EpisodeConnection {
    from: string;
    to: string;
    strength: number;
    type: 'causal' | 'temporal' | 'similarity';
}
export interface EpisodeCluster {
    id: string;
    episodes: string[];
    centroid: ExperienceContext;
    coherence: number;
}
export interface SemanticMemorySystem {
    storeConcept(concept: MemoryConcept): Promise<void>;
    retrieveConcepts(query: string): Promise<MemoryConcept[]>;
    buildKnowledgeGraph(): Promise<KnowledgeGraph>;
}
export interface MemoryConcept {
    id: string;
    name: string;
    definition: string;
    properties: ConceptProperty[];
    relations: ConceptRelation[];
}
export interface ConceptProperty {
    name: string;
    value: any;
    confidence: number;
}
export interface ConceptRelation {
    target: string;
    type: 'is-a' | 'part-of' | 'related-to' | 'causes' | 'enables';
    strength: number;
}
export interface KnowledgeGraph {
    concepts: MemoryConcept[];
    relations: GraphRelation[];
    metrics: GraphMetrics;
}
export interface GraphRelation {
    source: string;
    target: string;
    type: string;
    weight: number;
    evidence: string[];
}
export interface GraphMetrics {
    nodeCount: number;
    edgeCount: number;
    density: number;
    clustering: number;
    centralityScores: Record<string, number>;
}
export interface MemoryGraph {
    nodes: MemoryNode[];
    edges: MemoryEdge[];
    clusters: MemoryCluster[];
    metrics: GraphMetrics;
}
export interface MemoryNode {
    id: string;
    memory: CollectiveMemory;
    importance: number;
    connections: number;
}
export interface MemoryEdge {
    from: string;
    to: string;
    weight: number;
    type: 'association' | 'causal' | 'temporal' | 'similarity';
}
export interface MemoryCluster {
    id: string;
    nodes: string[];
    cohesion: number;
    topic: string;
}
export interface AccessPattern {
    pattern: string;
    frequency: number;
    recency: Date;
    context: Record<string, any>;
    performance: AccessPerformance;
}
export interface AccessPerformance {
    averageTime: number;
    cacheHitRate: number;
    errorRate: number;
    concurrency: number;
}
export interface MemoryHierarchy {
    levels: HierarchyLevel[];
    promotionRules: PromotionRule[];
    demotionRules: DemotionRule[];
}
export interface HierarchyLevel {
    name: string;
    capacity: number;
    accessTime: number;
    cost: number;
    evictionPolicy: string;
}
export interface PromotionRule {
    trigger: 'access-frequency' | 'access-recency' | 'importance' | 'performance';
    threshold: number;
    targetLevel: string;
}
export interface DemotionRule {
    trigger: 'inactivity' | 'low-importance' | 'capacity-pressure';
    threshold: number;
    targetLevel: string;
}
export interface MemoryDistributionStrategy {
    algorithm: 'consistent-hash' | 'round-robin' | 'weighted' | 'locality-aware';
    replicationFactor: number;
    balancingEnabled: boolean;
    migrationPolicy: MigrationPolicy;
}
export interface MigrationPolicy {
    trigger: 'load-imbalance' | 'capacity-threshold' | 'performance-degradation';
    threshold: number;
    batchSize: number;
    maxConcurrent: number;
}
export interface MemoryContent {
    data: any;
    encoding: 'json' | 'binary' | 'compressed' | 'encrypted';
    checksum: string;
    size: number;
}
export interface MemoryMetadata {
    created: Date;
    updated: Date;
    accessed: Date;
    version: string;
    tags: string[];
    importance: number;
    quality: number;
}
export interface AccessibilityConfig {
    readPermissions: Permission[];
    writePermissions: Permission[];
    shareLevel: 'private' | 'team' | 'public';
    expirationDate?: Date;
}
export interface Permission {
    entity: string;
    entityType: 'agent' | 'group' | 'role';
    level: 'read' | 'write' | 'admin';
}
export interface PersistenceConfig {
    durable: boolean;
    backupFrequency: number;
    retentionPeriod: number;
    compressionEnabled: boolean;
}
export interface MemoryAssociation {
    target: string;
    type: 'semantic' | 'temporal' | 'causal' | 'contextual';
    strength: number;
    bidirectional: boolean;
}
export interface ConsolidationAlgorithm {
    name: string;
    type: 'statistical' | 'rule-based' | 'ml-based' | 'hybrid';
    parameters: Record<string, any>;
    confidence: number;
}
export interface ImportanceScoringSystem {
    scoringFunction: ScoringFunction;
    weights: ImportanceWeights;
    normalizationMethod: 'linear' | 'logarithmic' | 'sigmoid';
}
export interface ScoringFunction {
    name: string;
    formula: string;
    parameters: Record<string, number>;
}
export interface ImportanceWeights {
    recency: number;
    frequency: number;
    impact: number;
    novelty: number;
    connectivity: number;
}
export interface MemoryConflictResolver {
    resolutionStrategy: ConflictResolutionStrategy;
    confidence: number;
    fallbackAction: 'keep-all' | 'merge' | 'newest-wins' | 'manual-review';
}
export interface MemoryQualityAssurance {
    qualityChecks: QualityCheck[];
    minQualityScore: number;
    autoRepair: boolean;
    quarantineEnabled: boolean;
}
export interface QualityCheck {
    name: string;
    type: 'consistency' | 'completeness' | 'accuracy' | 'timeliness';
    threshold: number;
    weight: number;
}
export interface FederatedLearningConfig {
    maxParticipants: number;
    minParticipants: number;
    roundTimeout: number;
    aggregationMethod: AggregationMethod;
    privacyLevel: PrivacyLevel;
    convergenceThreshold: number;
}
export interface ExperienceSharingConfig {
    maxExperiencesPerRound: number;
    patternDetectionThreshold: number;
    consolidationFrequency: number;
    sharingStrategy: 'broadcast' | 'selective' | 'hierarchical';
}
export interface ModelSyncConfig {
    syncFrequency: number;
    conflictResolution: ConflictResolutionStrategy;
    versionControl: boolean;
    compressionEnabled: boolean;
}
export interface TransferLearningConfig {
    domainSimilarityThreshold: number;
    transferMethods: TransferMethod[];
    evaluationMetrics: string[];
    adaptationStrategies: AdaptationStrategy[];
}
export interface CollectiveMemoryConfig {
    maxMemorySize: number;
    consolidationFrequency: number;
    forgettingEnabled: boolean;
    distributionStrategy: MemoryDistributionStrategy;
}
export interface PrivacyConfig {
    encryptionEnabled: boolean;
    differentialPrivacy: boolean;
    privacyBudget: number;
    noiseMultiplier: number;
}
export interface CollectiveInsight {
    id: string;
    type: string;
    description: string;
    confidence: number;
    applicability: string[];
    evidence: string[];
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score?: number;
}
export interface TransferKnowledge {
    id: string;
    sourceDomain: string;
    targetDomains: string[];
    knowledge: any;
    transferability: number;
    lastUpdated: Date;
}
/**
 * Federated Learning Implementation.
 *
 * @example
 */
export interface FederatedLearningRound {
    roundId: string;
    participants: FederatedParticipant[];
    globalModel: ModelSnapshot;
    localUpdates: LocalModelUpdate[];
    aggregationResult: AggregationResult;
    convergenceMetrics: ConvergenceMetrics;
    round: number;
    timestamp: number;
}
export interface FederatedParticipant {
    agentId: string;
    localModel: ModelSnapshot;
    dataSize: number;
    computationCapacity: number;
    networkBandwidth: number;
    privacyLevel: PrivacyLevel;
    participationHistory: ParticipationRecord[];
    contribution: ContributionMetrics;
}
export interface ModelSnapshot {
    modelId: string;
    version: string;
    parameters: ModelParameters;
    architecture: ModelArchitecture;
    metadata: ModelMetadata;
    checksum: string;
    timestamp: number;
}
export interface ModelParameters {
    weights: Float32Array[];
    biases: Float32Array[];
    hyperparameters: Record<string, number>;
    optimizerState: OptimizerState;
    regularization: RegularizationConfig;
}
export interface LocalModelUpdate {
    agentId: string;
    parameterDelta: ParameterDelta;
    gradients: GradientUpdate;
    trainingMetrics: TrainingMetrics;
    dataContribution: number;
    computationTime: number;
    privacyBudget: number;
}
export interface ParameterDelta {
    weightDeltas: Float32Array[];
    biasDeltas: Float32Array[];
    normalization: NormalizationConfig;
    compression: CompressionMetadata;
    encryption: EncryptionMetadata;
}
export interface AggregationResult {
    aggregatedModel: ModelSnapshot;
    aggregationMethod: AggregationMethod;
    participantWeights: Record<string, number>;
    convergenceScore: number;
    qualityMetrics: AggregationQualityMetrics;
    byzantineResistance: ByzantineResistanceMetrics;
}
export type AggregationMethod = 'federated-averaging' | 'weighted-aggregation' | 'median-aggregation' | 'krum' | 'trimmed-mean' | 'byzantine-resilient';
export type PrivacyLevel = 'none' | 'differential-privacy' | 'homomorphic-encryption' | 'secure-multiparty' | 'zero-knowledge';
/**
 * Experience Aggregation System.
 *
 * @example
 */
export interface ExperienceAggregator {
    experiences: Map<string, AgentExperience>;
    patterns: Map<string, ExperiencePattern>;
    consolidation: ExperienceConsolidator;
    patternDetection: PatternDetectionEngine;
    knowledgeExtraction: KnowledgeExtractionEngine;
}
export interface AgentExperience {
    agentId: string;
    experienceType: ExperienceType;
    context: ExperienceContext;
    actions: Action[];
    outcomes: Outcome[];
    performance: PerformanceMetrics;
    learning: LearningMetrics;
    timestamp: number;
}
export interface ExperiencePattern {
    patternId: string;
    type: PatternType;
    occurrences: number;
    contexts: ExperienceContext[];
    conditions: PatternCondition[];
    outcomes: OutcomeDistribution;
    confidence: number;
    generalizability: number;
    transferability: number;
}
export interface ExperienceConsolidator {
    consolidationRules: ConsolidationRule[];
    memoryPressure: MemoryPressureConfig;
    forgettingCurve: ForgettingCurveConfig;
    importanceWeighting: ImportanceWeightingConfig;
    conflictResolution: ConflictResolutionStrategy;
}
export interface PatternDetectionEngine {
    algorithms: PatternAlgorithm[];
    detectionThresholds: DetectionThresholds;
    realTimeDetection: boolean;
    batchProcessing: BatchProcessingConfig;
    anomalyDetection: AnomalyDetectionConfig;
}
export type ExperienceType = 'task-execution' | 'problem-solving' | 'collaboration' | 'error-recovery' | 'optimization' | 'learning' | 'adaptation';
export type PatternType = 'sequential-pattern' | 'association-rule' | 'clustering-pattern' | 'causal-pattern' | 'temporal-pattern' | 'behavioral-pattern';
/**
 * Model Synchronization System.
 *
 * @example
 */
export interface ModelSynchronizer {
    versionControl: ModelVersionControl;
    synchronizationProtocol: SynchronizationProtocol;
    conflictResolution: ModelConflictResolver;
    distributionStrategy: DistributionStrategy;
    consistencyManager: ConsistencyManager;
}
export interface ModelVersionControl {
    versions: Map<string, ModelVersion>;
    branches: Map<string, ModelBranch>;
    mergeHistory: MergeRecord[];
    versioningStrategy: VersioningStrategy;
    rollbackCapability: RollbackConfig;
}
export interface ModelVersion {
    versionId: string;
    parentVersion: string | null;
    model: ModelSnapshot;
    changes: ModelChangeset;
    author: string;
    timestamp: number;
    metadata: VersionMetadata;
}
export interface SynchronizationProtocol {
    protocol: SyncProtocol;
    frequency: number;
    triggers: SyncTrigger[];
    bandwidth: BandwidthConfig;
    priority: PriorityConfig;
    errorHandling: ErrorHandlingConfig;
}
export interface ModelConflictResolver {
    resolutionStrategies: ConflictResolutionStrategy[];
    automaticResolution: boolean;
    manualReviewThreshold: number;
    consensusRequirement: ConsensusConfig;
    fallbackStrategy: FallbackStrategy;
}
export type SyncProtocol = 'push-pull' | 'gossip' | 'blockchain' | 'consensus' | 'hierarchical' | 'peer-to-peer';
export type SyncTrigger = 'time-based' | 'performance-threshold' | 'data-availability' | 'convergence-metric' | 'manual-trigger';
/**
 * Transfer Learning System.
 *
 * @example
 */
export interface TransferLearningEngine {
    knowledgeMap: KnowledgeTransferMap;
    domainAdaptation: DomainAdaptationEngine;
    taskTransfer: TaskTransferEngine;
    metaLearning: MetaLearningEngine;
    transferEvaluation: TransferEvaluationSystem;
}
export interface KnowledgeTransferMap {
    domains: Map<string, DomainNode>;
    relationships: TransferRelationship[];
    transferPaths: TransferPath[];
    similarity: SimilarityMatrix;
    transferability: TransferabilityMatrix;
}
export interface DomainNode {
    domainId: string;
    characteristics: DomainCharacteristics;
    models: ModelSnapshot[];
    expertAgents: string[];
    transferHistory: TransferRecord[];
    performance: DomainPerformance;
}
export interface TransferRelationship {
    sourceDomain: string;
    targetDomain: string;
    similarity: number;
    transferability: number;
    transferMethods: TransferMethod[];
    successHistory: TransferSuccessMetrics;
}
export interface DomainAdaptationEngine {
    adaptationStrategies: AdaptationStrategy[];
    featureAlignment: FeatureAlignmentConfig;
    distributionMatching: DistributionMatchingConfig;
    adversarialTraining: AdversarialTrainingConfig;
    gradualAdaptation: GradualAdaptationConfig;
}
export type TransferMethod = 'fine-tuning' | 'feature-extraction' | 'multi-task-learning' | 'domain-adaptation' | 'meta-learning' | 'progressive-networks';
export type AdaptationStrategy = 'domain-adversarial' | 'coral' | 'maximum-mean-discrepancy' | 'wasserstein-distance' | 'gradual-domain-adaptation';
/**
 * Collective Memory Management.
 *
 * @example
 */
export interface CollectiveMemoryManager {
    sharedMemory: SharedMemorySpace;
    memoryConsolidation: MemoryConsolidationEngine;
    retrieval: MemoryRetrievalSystem;
    forgetting: ForgettingMechanism;
    episodicMemory: EpisodicMemorySystem;
    semanticMemory: SemanticMemorySystem;
}
export interface SharedMemorySpace {
    memories: Map<string, CollectiveMemory>;
    memoryGraph: MemoryGraph;
    accessPatterns: AccessPattern[];
    memoryHierarchy: MemoryHierarchy;
    distributionStrategy: MemoryDistributionStrategy;
}
export interface CollectiveMemory {
    memoryId: string;
    type: MemoryType;
    content: MemoryContent;
    metadata: MemoryMetadata;
    accessibility: AccessibilityConfig;
    persistence: PersistenceConfig;
    associations: MemoryAssociation[];
}
export interface MemoryConsolidationEngine {
    consolidationTriggers: ConsolidationTrigger[];
    consolidationAlgorithms: ConsolidationAlgorithm[];
    importanceScoring: ImportanceScoringSystem;
    conflictResolution: MemoryConflictResolver;
    qualityAssurance: MemoryQualityAssurance;
}
export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'meta-cognitive' | 'experiential' | 'contextual';
export type ConsolidationTrigger = 'time-based' | 'access-frequency' | 'importance-threshold' | 'memory-pressure' | 'pattern-emergence';
/**
 * Main Distributed Learning System.
 *
 * @example
 */
export declare class DistributedLearningSystem extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private federatedLearning;
    private experienceAggregator;
    private modelSynchronizer;
    private transferLearning;
    private collectiveMemory;
    private activeLearningRounds;
    private globalModels;
    private agentExperiences;
    private detectedPatterns;
    private transferKnowledge;
    constructor(config: DistributedLearningConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize all learning components.
     */
    private initializeComponents;
    /**
     * Set up component integrations.
     */
    private setupIntegrations;
    /**
     * Coordinate federated learning round.
     *
     * @param participants
     * @param globalModel
     */
    coordinateFederatedLearning(participants: FederatedParticipant[], globalModel: ModelSnapshot): Promise<FederatedLearningRound>;
    /**
     * Aggregate collective experiences from agents.
     *
     * @param experiences
     */
    aggregateCollectiveExperience(experiences: AgentExperience[]): Promise<CollectiveExperienceAggregation>;
    /**
     * Synchronize models across agent swarm.
     *
     * @param models
     * @param synchronizationStrategy
     */
    synchronizeSwarmModels(models: ModelSnapshot[], synchronizationStrategy?: SyncProtocol): Promise<ModelSynchronizationResult>;
    /**
     * Facilitate cross-domain knowledge transfer.
     *
     * @param sourceDomain
     * @param targetDomain
     * @param transferMethod
     */
    facilitateKnowledgeTransfer(sourceDomain: string, targetDomain: string, transferMethod?: TransferMethod): Promise<KnowledgeTransferResult>;
    /**
     * Get comprehensive learning system metrics.
     */
    getMetrics(): Promise<DistributedLearningMetrics>;
    /**
     * Shutdown learning system gracefully.
     */
    shutdown(): Promise<void>;
    private distributeGlobalModel;
    private collectLocalUpdates;
    private aggregateModelUpdates;
    private validateAggregatedModel;
    private calculateConvergence;
    private groupExperiencesByContext;
    private detectExperiencePatterns;
    private extractCollectiveInsights;
    private consolidateExperiences;
    private updateTransferKnowledge;
    private getTransferUpdates;
    private analyzeModelCompatibility;
    private resolveModelConflicts;
    private createSynchronizedModels;
    private validateSynchronizedModels;
    private distributeSynchronizedModels;
    private analyzeDomainSimilarity;
    private selectTransferStrategy;
    private extractTransferableKnowledge;
    private adaptKnowledgeForDomain;
    private applyTransferredKnowledge;
    private evaluateTransferEffectiveness;
    private getTotalRounds;
    private getAverageConvergence;
    private getParticipationRate;
    private getModelQuality;
    private getTotalExperiences;
    private getExtractedInsights;
    private getConsolidationRate;
    private getConflictResolutionRate;
    private getSynchronizationLatency;
    private getDistributionEfficiency;
    private getTransferSuccessRate;
    private getDomainCoverage;
    private getAdaptationEfficiency;
    private getSharedMemoryCount;
    private getMemoryUtilization;
    private getRetrievalEfficiency;
    private getMemoryConsolidationRate;
}
/**
 * Configuration and result interfaces.
 *
 * @example
 */
export interface DistributedLearningConfig {
    federatedConfig: FederatedLearningConfig;
    experienceSharing: ExperienceSharingConfig;
    modelSync: ModelSyncConfig;
    transferLearning: TransferLearningConfig;
    collectiveMemory: CollectiveMemoryConfig;
    aggregationStrategy: AggregationMethod;
    privacyPreservation: PrivacyConfig;
}
export interface CollectiveExperienceAggregation {
    id: string;
    originalExperiences: number;
    detectedPatterns: number;
    extractedInsights: number;
    consolidatedMemories: number;
    transferKnowledgeUpdates: any;
    aggregationTime: number;
    timestamp: number;
}
export interface ModelSynchronizationResult {
    id: string;
    originalModels: number;
    resolvedConflicts: number;
    synchronizedModels: number;
    validationResults: any;
    distributionComplete: boolean;
    synchronizationTime: number;
    timestamp: number;
}
export interface KnowledgeTransferResult {
    id: string;
    sourceDomain: string;
    targetDomain: string;
    transferMethod: TransferMethod;
    transferStrategy: string;
    domainSimilarity: number;
    transferableItems: number;
    adaptedItems: number;
    applicationResults: any;
    evaluationResults: any;
    transferTime: number;
    timestamp: number;
}
export interface DistributedLearningMetrics {
    federatedLearning: any;
    experienceAggregation: any;
    modelSynchronization: any;
    transferLearning: any;
    collectiveMemory: any;
}
export default DistributedLearningSystem;
//# sourceMappingURL=distributed-learning-system.d.ts.map