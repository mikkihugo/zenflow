/**
 * Collective Intelligence Coordinator
 * Neural center of swarm intelligence orchestrating collective decision-making and.
 * Shared intelligence through ML-driven coordination patterns.
 *
 * Architecture: Distributed knowledge sharing with consensus-driven validation
 * - Shared Memory Management: Coordinate distributed knowledge across swarm agents
 * - Knowledge Aggregation: Synthesize insights from multiple specialized agents
 * - Collective Decision-Making: Implement consensus algorithms and multi-criteria analysis
 * - Cross-Agent Learning: Facilitate transfer learning and federated learning patterns
 * - Emergent Intelligence Detection: Identify and amplify collective intelligence emergence.
 */
/**
 * @file Collective-intelligence coordination system.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { WASMPerformanceMetrics } from '../neural/types/wasm-types.ts';
export type PerformanceMetrics = WASMPerformanceMetrics;
export interface ValidationConfig {
    validationType: ValidationType;
    threshold: number;
    requirePeerReview: boolean;
    evidenceRequirement: number;
    consensusThreshold: number;
}
export interface PrivacyConfig {
    enabled: boolean;
    differentialPrivacy: boolean;
    noiseLevel: number;
    anonymization: boolean;
    encryptionLevel: 'basic' | 'advanced' | 'enterprise';
}
export interface TransferLearningConfig {
    enabled: boolean;
    sourceModels: string[];
    adaptationStrategy: 'fine-tuning' | 'feature-extraction' | 'domain-adaptation';
    transferMetrics: string[];
}
export interface ForgettingCurveConfig {
    enabled: boolean;
    decayRate: number;
    retentionThreshold: number;
    consolidationPeriod: number;
}
export interface ImportanceWeightingConfig {
    algorithm: 'frequency-based' | 'recency-based' | 'relevance-based' | 'hybrid';
    weights: Record<string, number>;
    dynamicAdjustment: boolean;
}
export interface LongTermStorageConfig {
    enabled: boolean;
    compressionLevel: number;
    archivingStrategy: 'time-based' | 'importance-based' | 'hybrid';
    retentionPeriod: number;
}
export interface ContextSharingMechanism {
    type: 'push' | 'pull' | 'hybrid';
    frequency: number;
    filteringRules: string[];
    privacyLevel: 'low' | 'medium' | 'high';
}
export interface ContributionMetrics {
    qualityScore: number;
    relevanceScore: number;
    originalityScore: number;
    impactScore: number;
    timelinessScore: number;
}
export interface ReliabilityMetrics {
    historyScore: number;
    consistencyScore: number;
    accuracyScore: number;
    responseTime: number;
    availability: number;
}
export interface ResourceProfile {
    computingPower: number;
    memoryCapacity: number;
    storageCapacity: number;
    networkBandwidth: number;
    availability: number;
}
export interface SubProblem {
    id: string;
    description: string;
    complexity: number;
    dependencies: string[];
    estimatedTime: number;
    requiredResources: ResourceProfile;
}
export interface ProblemDependency {
    id: string;
    sourceSubproblem: string;
    targetSubproblem: string;
    dependencyType: 'sequential' | 'parallel' | 'conditional';
    strength: number;
}
export interface ComplexityMetrics {
    computationalComplexity: number;
    dataComplexity: number;
    algorithmicComplexity: number;
    interactionComplexity: number;
    overallComplexity: number;
}
export interface PartialSolution {
    id: string;
    subproblemId: string;
    solution: any;
    confidence: number;
    quality: number;
    completeness: number;
    validationStatus: 'pending' | 'validated' | 'rejected';
}
export interface IntegrationPlan {
    strategy: 'sequential' | 'parallel' | 'hierarchical' | 'iterative';
    steps: IntegrationStep[];
    validationCheckpoints: ValidationCheckpoint[];
    rollbackPlan: RollbackStep[];
}
export interface IntegrationStep {
    id: string;
    description: string;
    dependencies: string[];
    estimatedTime: number;
    riskLevel: 'low' | 'medium' | 'high';
}
export interface ValidationCheckpoint {
    id: string;
    stepId: string;
    criteria: ValidationCriteria[];
    requiredConsensus: number;
}
export interface ValidationCriteria {
    name: string;
    description: string;
    weight: number;
    threshold: number;
}
export interface RollbackStep {
    stepId: string;
    action: string;
    conditions: string[];
    impact: 'low' | 'medium' | 'high';
}
export interface QualityAssuranceConfig {
    enabled: boolean;
    checkpoints: ValidationCheckpoint[];
    metrics: QualityMetricDefinition[];
    thresholds: QualityThresholds;
}
export interface QualityThresholds {
    minimum: number;
    target: number;
    excellent: number;
}
export interface VotingMechanism {
    type: 'simple-majority' | 'weighted-majority' | 'ranked-choice' | 'consensus';
    weights: Record<string, number>;
    threshold: number;
    anonymity: boolean;
}
export interface ConflictResolutionMechanism {
    strategy: 'mediation' | 'arbitration' | 'voting' | 'expert-panel';
    timeout: number;
    escalationPaths: string[];
    fallbackMechanism: string;
}
export interface ConvergenceCriteria {
    maxIterations: number;
    consensusThreshold: number;
    stabilityWindow: number;
    minimumParticipants: number;
}
export interface DecisionHistory {
    id: string;
    timestamp: Date;
    decision: any;
    participants: string[];
    consensus: number;
    confidence: number;
    outcome?: any;
}
export interface CrossDomainTransferSystem {
    enabled: boolean;
    transferMechanisms: TransferMechanism[];
    domainMapping: Record<string, string[]>;
    adaptationStrategies: string[];
}
export interface TransferMechanism {
    type: 'direct' | 'analogical' | 'meta-learning';
    sourceDomain: string;
    targetDomain: string;
    effectiveness: number;
}
export interface CollectiveMemoryManager {
    storageTypes: string[];
    indexingStrategy: string;
    retrievalAlgorithms: string[];
    consolidationRules: ConsolidationRule[];
}
export interface ConsolidationRule {
    trigger: string;
    action: string;
    parameters: Record<string, any>;
}
export interface DiscoveryMechanism {
    type: 'active' | 'passive' | 'hybrid';
    algorithms: string[];
    updateFrequency: number;
    confidenceThreshold: number;
}
export interface ExpertiseEvolutionTracker {
    trackingMetrics: string[];
    updateFrequency: number;
    adaptationRules: AdaptationRule[];
}
export interface AdaptationRule {
    condition: string;
    action: string;
    parameters: Record<string, any>;
}
export interface CompetencyMappingSystem {
    mappingAlgorithms: string[];
    competencyModel: CompetencyModel;
    validationRules: ValidationRule[];
}
export interface CompetencyModel {
    domains: string[];
    skills: string[];
    levels: string[];
    relationships: CompetencyRelationship[];
}
export interface CompetencyRelationship {
    source: string;
    target: string;
    type: 'prerequisite' | 'complementary' | 'conflicting';
    strength: number;
}
export interface ValidationRule {
    condition: string;
    action: string;
    parameters: Record<string, any>;
}
export interface DomainExpertise {
    domain: string;
    level: number;
    experience: number;
    certifications: string[];
    lastValidated: Date;
}
export interface SkillProfile {
    skill: string;
    proficiency: number;
    experience: number;
    lastUsed: Date;
    validationStatus: 'validated' | 'pending' | 'expired';
}
export interface ExperienceProfile {
    totalExperience: number;
    domainExperience: Record<string, number>;
    projectHistory: ProjectExperience[];
    learningRate: number;
}
export interface ProjectExperience {
    projectId: string;
    domain: string;
    duration: number;
    role: string;
    outcome: 'success' | 'partial' | 'failure';
    skillsUsed: string[];
}
export interface ReputationScore {
    overall: number;
    domainSpecific: Record<string, number>;
    trend: 'increasing' | 'stable' | 'decreasing';
    lastUpdated: Date;
    factors: ReputationFactor[];
}
export interface ReputationFactor {
    factor: string;
    weight: number;
    score: number;
    trend: 'up' | 'down' | 'stable';
}
export interface AvailabilityProfile {
    currentLoad: number;
    maxCapacity: number;
    schedule: TimeSlot[];
    preferences: AvailabilityPreferences;
}
export interface TimeSlot {
    start: Date;
    end: Date;
    type: 'available' | 'busy' | 'preferred';
    priority: number;
}
export interface AvailabilityPreferences {
    preferredHours: string[];
    timezone: string;
    flexibilityLevel: 'low' | 'medium' | 'high';
    notificationPreferences: NotificationPreferences;
}
export interface NotificationPreferences {
    urgent: boolean;
    regular: boolean;
    methods: string[];
    frequency: string;
}
export interface CollaborationPreferences {
    communicationStyle: string;
    workingStyle: string;
    preferredRoles: string[];
    conflictResolution: string;
    feedbackPreferences: FeedbackPreferences;
}
export interface FeedbackPreferences {
    frequency: 'immediate' | 'regular' | 'milestone';
    style: 'direct' | 'diplomatic' | 'collaborative';
    methods: string[];
}
export interface RoutingEntry {
    destination: string;
    metric: number;
    nextHop: string;
    timestamp: Date;
    validity: number;
}
export interface RoutingStrategy {
    algorithm: string;
    parameters: Record<string, any>;
    updateFrequency: number;
    fallbackStrategy?: string;
}
export interface LoadBalancingConfig {
    algorithm: 'round-robin' | 'weighted' | 'least-connections' | 'adaptive';
    weights: Record<string, number>;
    healthChecks: boolean;
    failoverStrategy: string;
}
export interface QoSConfig {
    priorities: string[];
    bandwidthAllocation: Record<string, number>;
    latencyThresholds: Record<string, number>;
    guarantees: QoSGuarantee[];
}
export interface QoSGuarantee {
    service: string;
    metric: string;
    threshold: number;
    penalty: string;
}
export interface AdaptiveRoutingConfig {
    enabled: boolean;
    adaptationTriggers: string[];
    learningRate: number;
    historyWindow: number;
}
export interface EmergencePattern {
    pattern: string;
    frequency: number;
    contexts: string[];
    emergenceLevel: number;
    stability: number;
}
export interface EmergenceDetectionAlgorithm {
    name: string;
    parameters: Record<string, any>;
    sensitivity: number;
    confidence: number;
}
export interface SpecializationTracker {
    trackingMetrics: string[];
    specializationIndex: Record<string, number>;
    evolutionHistory: SpecializationHistory[];
}
export interface SpecializationHistory {
    timestamp: Date;
    specialization: string;
    level: number;
    context: string;
}
export interface AdaptationMechanism {
    type: string;
    triggers: string[];
    actions: string[];
    effectiveness: number;
}
export interface FeedbackLoop {
    id: string;
    source: string;
    target: string;
    type: 'positive' | 'negative' | 'neutral';
    strength: number;
    delay: number;
}
export interface TemporalKnowledgeManager {
    versioningStrategy: string;
    retentionPolicies: RetentionPolicy[];
    timelineTracking: boolean;
    historicalAnalysis: boolean;
}
export interface RetentionPolicy {
    condition: string;
    action: string;
    duration: number;
}
export interface PeerReviewSystem {
    enabled: boolean;
    reviewerSelection: ReviewerSelectionStrategy;
    reviewCriteria: ReviewCriteria[];
    consensusThreshold: number;
}
export interface ReviewerSelectionStrategy {
    method: 'random' | 'expertise-based' | 'reputation-based' | 'hybrid';
    count: number;
    exclusionRules: string[];
}
export interface ReviewCriteria {
    name: string;
    weight: number;
    scale: string;
    description: string;
}
export interface ReputationModel {
    components: ReputationComponent[];
    aggregationFunction: string;
    decayFunction: string;
    bootstrapValue: number;
}
export interface ReputationComponent {
    name: string;
    weight: number;
    source: string;
    updateFrequency: string;
}
export interface ScoringAlgorithm {
    name: string;
    parameters: Record<string, any>;
    inputTypes: string[];
    outputRange: [number, number];
}
export interface ConsensusWeightingConfig {
    weightingFunction: string;
    parameters: Record<string, any>;
    normalization: boolean;
    updateFrequency: string;
}
export interface DecayFunction {
    type: 'exponential' | 'linear' | 'logarithmic' | 'custom';
    parameters: Record<string, any>;
    halfLife?: number;
}
export interface BootstrappingConfig {
    initialValue: number;
    rampUpPeriod: number;
    validationThreshold: number;
    trustSources: string[];
}
export interface ValidatorConfig {
    type: string;
    parameters: Record<string, any>;
    weight: number;
    fallbackValidator?: string;
}
export interface ValidationThresholds {
    acceptance: number;
    rejection: number;
    review: number;
    confidence: number;
}
export interface EvidenceRequirements {
    minimumSources: number;
    sourceTypes: string[];
    qualityThreshold: number;
    consensusLevel: number;
}
export interface CrossValidationConfig {
    enabled: boolean;
    foldCount: number;
    stratification: boolean;
    randomSeed: number;
}
export interface QualityMetricDefinition {
    name: string;
    description: string;
    weight: number;
    scale: string;
    aggregationMethod: string;
}
export interface AssessmentProtocol {
    name: string;
    steps: AssessmentStep[];
    frequency: string;
    triggers: string[];
}
export interface AssessmentStep {
    name: string;
    description: string;
    method: string;
    criteria: string[];
}
export interface MonitoringConfig {
    enabled: boolean;
    metrics: string[];
    frequency: number;
    alertThresholds: Record<string, number>;
}
export interface ImprovementMechanism {
    type: string;
    triggers: string[];
    actions: string[];
    effectiveness: number;
}
export interface BenchmarkingConfig {
    enabled: boolean;
    benchmarks: Benchmark[];
    frequency: string;
    reportGeneration: boolean;
}
export interface Benchmark {
    name: string;
    description: string;
    metric: string;
    target: number;
    industry?: string;
}
export interface PriorityManagementConfig {
    priorityLevels: string[];
    escalationRules: EscalationRule[];
    resourceAllocation: Record<string, number>;
}
export interface EscalationRule {
    condition: string;
    action: string;
    timeThreshold: number;
}
export interface EvictionPolicyType {
    algorithm: 'LRU' | 'LFU' | 'FIFO' | 'random' | 'adaptive';
    parameters: Record<string, any>;
}
export interface ReplicationStrategyType {
    strategy: 'synchronous' | 'asynchronous' | 'hybrid';
    replicationFactor: number;
    consistency: 'strong' | 'eventual' | 'weak';
}
export interface ConsistencyModel {
    type: 'strong' | 'eventual' | 'weak' | 'causal';
    guarantees: string[];
    tradeoffs: string[];
}
export interface PrefetchingConfig {
    enabled: boolean;
    algorithms: string[];
    aggressiveness: 'low' | 'medium' | 'high';
    cacheSize: number;
}
export interface CompressionAlgorithm {
    name: string;
    ratio: number;
    speed: 'fast' | 'medium' | 'slow';
    quality: 'low' | 'medium' | 'high';
}
export interface DeltaEncodingConfig {
    enabled: boolean;
    windowSize: number;
    threshold: number;
}
export interface BatchingStrategy {
    enabled: boolean;
    batchSize: number;
    timeout: number;
    priority: boolean;
}
export interface AdaptiveStreamingConfig {
    enabled: boolean;
    qualityLevels: string[];
    adaptationAlgorithm: string;
    bufferSize: number;
}
export interface PriorityQueuingConfig {
    enabled: boolean;
    priorityLevels: number;
    schedulingAlgorithm: string;
    weightings: Record<string, number>;
}
export interface KnowledgeEntry {
    id: string;
    content: any;
    timestamp: Date;
    source: string;
    quality: number;
}
export interface ConsensusState {
    id: string;
    status: 'pending' | 'converging' | 'converged' | 'failed';
    participants: string[];
    currentConsensus: number;
}
export interface CollectiveLearningModel {
    id: string;
    type: string;
    parameters: any;
    performance: PerformanceMetrics;
}
export interface ValidatedKnowledge {
    knowledge: any;
    quality: number;
    consensus: number;
    isValid: boolean;
}
export interface SynthesizedKnowledge {
    sections: any[];
    crossTypePatterns: any[];
    metaInsights: any[];
    overallConfidence: number;
    synthesisTimestamp: number;
}
export interface KnowledgeGraphUpdate {
    update: any;
    analytics: any;
    gaps: any[];
    recommendations: any[];
    timestamp: number;
}
export interface TaskDefinition {
    id: string;
    description: string;
    requirements: any[];
    priority: number;
    estimatedTime: number;
}
export interface CollaborativeSolvingConfig {
    enabled: boolean;
    maxParticipants: number;
    timeLimit: number;
}
export interface IntelligenceCoordinationConfig {
    enabled: boolean;
    routingStrategy: string;
    loadBalancing: boolean;
}
export interface QualityManagementConfig {
    enabled: boolean;
    validationThreshold: number;
    reviewProcess: boolean;
}
/**
 * Knowledge Exchange Protocols.
 *
 * @example
 */
export interface KnowledgeExchangeProtocol {
    id: string;
    version: string;
    participants: string[];
    knowledgeTypes: KnowledgeType[];
    exchangePattern: ExchangePattern;
    conflictResolution: ConflictResolutionStrategy;
    validation: ValidationConfig;
    encryption: boolean;
    compression: boolean;
}
export interface KnowledgePacket {
    id: string;
    sourceAgentId: string;
    targetAgentIds: string[] | 'broadcast';
    knowledgeType: KnowledgeType;
    payload: KnowledgePayload;
    metadata: KnowledgeMetadata;
    signature: string;
    timestamp: number;
    ttl: number;
}
export interface KnowledgePayload {
    facts: Array<{
        statement: string;
        confidence: number;
        sources: string[];
        evidence: Evidence[];
        domain: string;
        timestamp: number;
    }>;
    patterns: Array<{
        pattern: string;
        occurrences: number;
        contexts: string[];
        confidence: number;
        generalizable: boolean;
    }>;
    insights: Array<{
        insight: string;
        derivation: string[];
        applicability: string[];
        confidence: number;
        impact: number;
    }>;
    models: Array<{
        modelId: string;
        parameters: any;
        performance: PerformanceMetrics;
        transferability: number;
        domain: string;
    }>;
}
export interface Evidence {
    type: 'empirical' | 'logical' | 'testimonial' | 'statistical';
    content: string;
    strength: number;
    source: string;
    timestamp: number;
}
export interface KnowledgeMetadata {
    quality: QualityMetrics;
    relevance: RelevanceMetrics;
    novelty: number;
    complexity: number;
    uncertainty: number;
    dependencies: string[];
    derivationPath: string[];
    tags: string[];
}
export interface QualityMetrics {
    accuracy: number;
    completeness: number;
    consistency: number;
    timeliness: number;
    reliability: number;
    verifiability: number;
}
export interface RelevanceMetrics {
    domainRelevance: Record<string, number>;
    taskRelevance: Record<string, number>;
    temporalRelevance: number;
    spatialRelevance: number;
    contextualRelevance: number;
}
export type KnowledgeType = 'factual' | 'procedural' | 'conceptual' | 'experiential' | 'meta-cognitive' | 'pattern' | 'model' | 'insight';
export type ExchangePattern = 'broadcast' | 'multicast' | 'unicast' | 'mesh' | 'hierarchical' | 'gossip';
export type ConflictResolutionStrategy = 'consensus' | 'majority-vote' | 'weighted-average' | 'expert-override' | 'evidence-based' | 'temporal-latest';
/**
 * Distributed Learning Systems.
 *
 * @example
 */
export interface DistributedLearningConfig {
    aggregationStrategy: AggregationStrategy;
    federatedConfig: FederatedLearningConfig;
    modelSyncFrequency: number;
    convergenceThreshold: number;
    participantSelection: ParticipantSelectionStrategy;
    privacyPreservation: PrivacyConfig;
    experienceSharing: ExperienceSharingConfig;
}
export interface FederatedLearningConfig {
    rounds: number;
    clientFraction: number;
    localEpochs: number;
    learningRate: number;
    aggregationWeights: Record<string, number>;
    differentialPrivacy: boolean;
    secureAggregation: boolean;
}
export interface ExperienceSharingConfig {
    experienceTypes: ExperienceType[];
    aggregationWindow: number;
    patternDetection: PatternDetectionConfig;
    transferLearning: TransferLearningConfig;
    memoryConsolidation: MemoryConsolidationConfig;
}
export interface PatternDetectionConfig {
    minOccurrences: number;
    confidenceThreshold: number;
    supportThreshold: number;
    algorithms: PatternAlgorithm[];
    realTimeDetection: boolean;
}
export interface MemoryConsolidationConfig {
    consolidationTriggers: ConsolidationTrigger[];
    forgettingCurve: ForgettingCurveConfig;
    importanceWeighting: ImportanceWeightingConfig;
    longTermStorage: LongTermStorageConfig;
}
export type AggregationStrategy = 'federated-averaging' | 'weighted-aggregation' | 'median-aggregation' | 'byzantine-resilient' | 'adaptive-aggregation';
export type ParticipantSelectionStrategy = 'random' | 'performance-based' | 'diversity-based' | 'resource-aware' | 'expertise-based';
export type ExperienceType = 'success-patterns' | 'failure-patterns' | 'optimization-insights' | 'performance-benchmarks' | 'error-recoveries';
export type PatternAlgorithm = 'frequent-itemsets' | 'sequential-patterns' | 'association-rules' | 'clustering' | 'classification';
export type ConsolidationTrigger = 'time-based' | 'frequency-based' | 'importance-based' | 'storage-pressure' | 'performance-degradation';
/**
 * Collaborative Problem-Solving.
 *
 * @example
 */
export interface CollaborativeProblemSolver {
    problemId: string;
    participants: CollaborativeParticipant[];
    problemDecomposition: ProblemDecomposition;
    solutionSynthesis: SolutionSynthesis;
    consensusBuilding: ConsensusBuilding;
    contextSharing: ContextSharingMechanism;
}
export interface CollaborativeParticipant {
    agentId: string;
    expertise: ExpertiseProfile;
    contribution: ContributionMetrics;
    reliability: ReliabilityMetrics;
    availableResources: ResourceProfile;
}
export interface ProblemDecomposition {
    strategy: DecompositionStrategy;
    subproblems: SubProblem[];
    dependencies: ProblemDependency[];
    complexity: ComplexityMetrics;
    parallelizable: boolean;
}
export interface SolutionSynthesis {
    synthesisStrategy: SynthesisStrategy;
    partialSolutions: PartialSolution[];
    integrationPlan: IntegrationPlan;
    qualityAssurance: QualityAssuranceConfig;
    validation: ValidationProtocol;
}
export interface ConsensusBuilding {
    consensusAlgorithm: ConsensusAlgorithm;
    votingMechanism: VotingMechanism;
    conflictResolution: ConflictResolutionMechanism;
    convergenceCriteria: ConvergenceCriteria;
    decisionHistory: DecisionHistory[];
}
export type DecompositionStrategy = 'hierarchical' | 'functional' | 'temporal' | 'resource-based' | 'expertise-based' | 'complexity-based';
export type SynthesisStrategy = 'incremental' | 'parallel-merge' | 'weighted-combination' | 'evolutionary' | 'neural-synthesis';
export type ConsensusAlgorithm = 'raft' | 'pbft' | 'tendermint' | 'delegated-proof' | 'liquid-democracy';
/**
 * Intelligence Coordination.
 *
 * @example
 */
export interface IntelligenceCoordinator {
    expertiseDiscovery: ExpertiseDiscoveryEngine;
    knowledgeRouting: KnowledgeRoutingSystem;
    specializationEmergence: SpecializationEmergenceDetector;
    crossDomainTransfer: CrossDomainTransferSystem;
    collectiveMemory: CollectiveMemoryManager;
}
export interface ExpertiseDiscoveryEngine {
    expertiseProfiles: Map<string, ExpertiseProfile>;
    discoveryMechanisms: DiscoveryMechanism[];
    expertiseEvolution: ExpertiseEvolutionTracker;
    competencyMapping: CompetencyMappingSystem;
    reputationSystem: ReputationSystem;
}
export interface ExpertiseProfile {
    agentId: string;
    domains: DomainExpertise[];
    skills: SkillProfile[];
    experience: ExperienceProfile;
    reputation: ReputationScore;
    availability: AvailabilityProfile;
    preferences: CollaborationPreferences;
}
export interface KnowledgeRoutingSystem {
    routingTable: Map<string, RoutingEntry[]>;
    routingStrategies: RoutingStrategy[];
    loadBalancing: LoadBalancingConfig;
    qualityOfService: QoSConfig;
    adaptiveRouting: AdaptiveRoutingConfig;
}
export interface SpecializationEmergenceDetector {
    emergencePatterns: EmergencePattern[];
    detectionAlgorithms: EmergenceDetectionAlgorithm[];
    specialization: SpecializationTracker;
    adaptationMechanisms: AdaptationMechanism[];
    feedbackLoops: FeedbackLoop[];
}
/**
 * Knowledge Quality Management.
 *
 * @example
 */
export interface KnowledgeQualityManager {
    reputationSystem: ReputationSystem;
    validationProtocols: ValidationProtocol[];
    qualityAssurance: QualityAssuranceSystem;
    temporalManagement: TemporalKnowledgeManager;
    peerReviewSystem: PeerReviewSystem;
}
export interface ReputationSystem {
    reputationModel: ReputationModel;
    scoringAlgorithms: ScoringAlgorithm[];
    consensusWeighting: ConsensusWeightingConfig;
    decayFunctions: DecayFunction[];
    bootstrapping: BootstrappingConfig;
}
export interface ValidationProtocol {
    validationType: ValidationType;
    validators: ValidatorConfig[];
    thresholds: ValidationThresholds;
    evidenceRequirements: EvidenceRequirements;
    crossValidation: CrossValidationConfig;
}
export interface QualityAssuranceSystem {
    qualityMetrics: QualityMetricDefinition[];
    assessmentProtocols: AssessmentProtocol[];
    continuousMonitoring: MonitoringConfig;
    qualityImprovement: ImprovementMechanism[];
    benchmarking: BenchmarkingConfig;
}
export type ValidationType = 'logical-consistency' | 'empirical-verification' | 'peer-consensus' | 'expert-review' | 'automated-checking';
/**
 * Performance Optimization.
 *
 * @example
 */
export interface PerformanceOptimizationConfig {
    cachingStrategy: CachingStrategy;
    bandwidthOptimization: BandwidthOptimizationConfig;
    priorityManagement: PriorityManagementConfig;
    loadBalancing: LoadBalancingConfig;
    monitoring: MonitoringConfig;
}
export interface CachingStrategy {
    cacheTypes: CacheType[];
    evictionPolicies: EvictionPolicyType[];
    replicationStrategy: ReplicationStrategyType;
    consistency: ConsistencyModel;
    prefetching: PrefetchingConfig;
}
export interface BandwidthOptimizationConfig {
    compressionAlgorithms: CompressionAlgorithm[];
    deltaEncoding: DeltaEncodingConfig;
    batchingStrategy: BatchingStrategy;
    adaptiveStreaming: AdaptiveStreamingConfig;
    priorityQueuing: PriorityQueuingConfig;
}
export type CacheType = 'knowledge-facts' | 'pattern-cache' | 'model-cache' | 'insight-cache' | 'routing-cache';
/**
 * Main Collective Intelligence Coordinator Class.
 *
 * @example
 */
export declare class CollectiveIntelligenceCoordinator extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private knowledgeExchange;
    private distributedLearning;
    private collaborativeSolver;
    private intelligenceCoordination;
    private qualityManagement;
    private performanceOptimization;
    private activeProtocols;
    private knowledgeBase;
    private agentProfiles;
    private consensusStates;
    private learningModels;
    constructor(config: CollectiveIntelligenceConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize all coordination systems.
     */
    private initializeSystems;
    /**
     * Set up cross-system integrations.
     */
    private setupIntegrations;
    private storeKnowledge;
    private extractKnowledgeFromSolution;
    private applyOptimizationToSystems;
    private validateThroughConsensus;
    private detectEmergentIntelligence;
    private generateAlternatives;
    private collectPreferences;
    private reachConsensus;
    private optimizeDecision;
    private validateDecision;
    private analyzeTasks;
    private assessAgentCapabilities;
    private performOptimalMatching;
    private assignTask;
    private initiateWorkStealingCoordination;
    private setupProgressMonitoring;
    private calculateLoadBalance;
    private estimateCompletionTime;
    private detectCrossTypePatterns;
    private generateMetaInsights;
    private calculateOverallConfidence;
    private extractEntities;
    private extractRelationships;
    private extractConcepts;
    private performGraphUpdate;
    private computeGraphAnalytics;
    private detectKnowledgeGaps;
    private generateRecommendations;
    private calculateCollectiveIQ;
    private calculateKnowledgeVelocity;
    private calculateConsensusEfficiency;
    private calculateLearningRate;
    private calculateEmergenceIndex;
    /**
     * Coordinate knowledge aggregation from multiple agents.
     *
     * @param contributions
     */
    aggregateKnowledge(contributions: AgentContribution[]): Promise<AggregatedKnowledge>;
    /**
     * Coordinate collective decision making.
     *
     * @param decisionContext
     */
    coordinateDecision(decisionContext: DecisionContext): Promise<CollectiveDecision>;
    /**
     * Distribute work using intelligent load balancing.
     *
     * @param tasks
     */
    distributeWork(tasks: TaskDefinition[]): Promise<WorkDistributionResult>;
    /**
     * Weight agent contributions based on expertise and reputation.
     *
     * @param contributions
     */
    private weightContributions;
    /**
     * Synthesize knowledge from weighted contributions.
     *
     * @param weightedContributions
     */
    private synthesizeKnowledge;
    /**
     * Update knowledge graph with validated knowledge.
     *
     * @param validatedKnowledge
     */
    private updateKnowledgeGraph;
    /**
     * Get comprehensive coordination metrics.
     */
    getCoordinationMetrics(): Promise<CollectiveIntelligenceMetrics>;
    /**
     * Shutdown coordination system gracefully.
     */
    shutdown(): Promise<void>;
    private calculateExpertiseWeight;
    private calculateReputationWeight;
    private calculateQualityWeight;
    private groupContributionsByType;
    private selectSynthesisAlgorithm;
}
/**
 * Configuration interfaces.
 *
 * @example
 */
export interface CollectiveIntelligenceConfig {
    knowledgeExchange: KnowledgeExchangeConfig;
    distributedLearning: DistributedLearningConfig;
    collaborativeSolving: CollaborativeSolvingConfig;
    intelligenceCoordination: IntelligenceCoordinationConfig;
    qualityManagement: QualityManagementConfig;
    performanceOptimization: PerformanceOptimizationConfig;
}
export interface KnowledgeExchangeConfig {
    protocols: KnowledgeExchangeProtocol[];
    defaultEncryption: boolean;
    defaultCompression: boolean;
    maxPacketSize: number;
    routingStrategy: RoutingStrategy;
    conflictResolution: ConflictResolutionStrategy;
}
export interface AgentContribution {
    agentId: string;
    domain: string;
    knowledge: any;
    confidence: number;
    timestamp: number;
}
export interface WeightedContribution extends AgentContribution {
    weight: number;
    weightBreakdown: {
        expertise: number;
        reputation: number;
        quality: number;
    };
}
export interface AggregatedKnowledge {
    id: string;
    originalContributions: number;
    synthesizedKnowledge: any;
    knowledgeGraph: any;
    emergentInsights: any;
    qualityScore: number;
    consensusScore: number;
    aggregationTime: number;
    timestamp: number;
}
export interface DecisionContext {
    id: string;
    participants: string[];
    consensusConfig: any;
    criteria: any;
}
export interface CollectiveDecision {
    id: string;
    decision: any;
    alternatives: number;
    participantCount: number;
    consensusScore: number;
    qualityScore: number;
    confidence: number;
    reasoning: any;
    decisionTime: number;
    timestamp: number;
}
export interface WorkDistributionResult {
    totalTasks: number;
    assignments: number;
    loadBalance: number;
    estimatedCompletion: number;
    distributionTime: number;
    monitoringConfig: any;
    timestamp: number;
}
export interface CollectiveIntelligenceMetrics {
    knowledgeExchange: any;
    distributedLearning: any;
    collaborativeSolving: any;
    intelligenceCoordination: any;
    qualityManagement: any;
    performanceOptimization: any;
    overall: {
        collectiveIQ: number;
        knowledgeVelocity: number;
        consensusEfficiency: number;
        learningRate: number;
        emergenceIndex: number;
    };
}
export default CollectiveIntelligenceCoordinator;
//# sourceMappingURL=collective-intelligence-coordinator.d.ts.map