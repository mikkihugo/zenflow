/**
 * Knowledge Quality Management System for Claude-Zen.
 * Implements reputation-based validation, quality assurance, and peer review systems.
 *
 * Architecture: Multi-layered quality assurance with consensus-driven validation
 * - Reputation System: Track agent credibility and knowledge contribution quality
 * - Validation Protocols: Multi-stage knowledge validation and verification
 * - Quality Assurance: Continuous monitoring and improvement of knowledge quality
 * - Temporal Management: Handle knowledge decay, updates, and versioning
 * - Peer Review: Structured peer review and consensus building processes.
 */
/**
 * @file Knowledge-quality-management implementation.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
export type BootstrappingConfig = any;
export type ReputationParameters = any;
export type ReputationComponent = any;
export type ReputationAggregation = any;
export type NormalizationConfig = any;
export type ComponentScore = any;
export type ScoreTrend = any;
export type AlgorithmWeights = any;
export type AlgorithmParameters = any;
export type AlgorithmPerformance = any;
export type ScoringApplicability = any;
export type ConsensusThreshold = any;
export type DecisionRule = any;
export type TieBreakingRule = any;
export type AdaptiveWeightingConfig = any;
export type DecayParameters = any;
export type ValidationCapability = any;
export type ValidatorReliability = any;
export type ValidationSpecialization = any;
export type ValidatorPerformance = any;
export type QualityMetrics = any;
export type QualityDimension = any;
export type QualityThreshold = any;
export type QualityTrend = any;
export type ConsensusParameters = any;
export type VotingMechanism = any;
export type DisputeResolution = any;
export type ConvergenceAnalysis = any;
export type TimebasedDecay = any;
export type ContentDecay = any;
export type UsageBasedDecay = any;
export type DynamicDecay = any;
export type PeerReviewProtocol = any;
export type ReviewAssignment = any;
export type ReviewCriteria = any;
export type ReviewAggregation = any;
export type ReviewQuality = any;
export type ReviewStandards = any;
export type EvidenceType = 'empirical' | 'logical' | 'statistical' | 'peer-reviewed' | 'expert-opinion';
export type SourceReliabilityRequirement = 'low' | 'medium' | 'high' | 'critical';
export type CrossReferencingConfig = any;
export type ValidatorSelectionStrategy = 'random' | 'expertise-based' | 'reputation-weighted' | 'availability';
export type DisagreementResolutionStrategy = 'majority-vote' | 'expert-mediation' | 'consensus-building';
export type ConsensusConfiguration = any;
export type ValidationEvidence = any;
export type ValidationIssue = any;
export type ValidationRecommendation = any;
export type MeasurementMethod = 'automatic' | 'manual' | 'hybrid' | 'statistical';
export type AggregationMethod = 'average' | 'weighted' | 'median' | 'consensus';
export type InterpretationRules = any;
export type QualityBenchmark = any;
export type AssessmentScope = 'individual' | 'aggregate' | 'comparative' | 'temporal';
export type AssessmentFrequency = 'continuous' | 'daily' | 'weekly' | 'monthly' | 'on-demand';
export type AssessmentCriteria = any;
export type ScoringRubric = any;
export type MonitoringScope = 'system-wide' | 'domain-specific' | 'agent-specific' | 'content-type';
export type AlertCondition = any;
export type DashboardConfig = any;
export type ReportingConfig = any;
export type ImprovementTrigger = any;
export type ImprovementAction = any;
export type ImprovementEvaluation = any;
export type BenchmarkType = 'internal' | 'external' | 'industry-standard' | 'historical';
export type ComparisonBaseline = any;
export type PerformanceStandard = any;
export type BenchmarkReportFormat = 'json' | 'csv' | 'pdf' | 'dashboard';
export type TemporalQueryEngine = any;
export type KnowledgeVersion = any;
export type VersionHistory = any;
export type VersionConflictResolver = any;
export type BranchManager = any;
export type TimeSeriesValidator = any;
export type CausalityChecker = any;
export type TemporalConsistencyMaintainer = any;
export type InvalidationDetector = any;
export type DecayModel = any;
export type FreshnessCriteria = any;
export type DecayPredictor = any;
export type RefreshStrategy = any;
export type RetentionPolicy = any;
export type PropagationGraph = any;
export type UpdateStrategy = any;
export type DependencyTracker = any;
export type ImpactAnalyzer = any;
export type CascadingUpdateManager = any;
export type ReviewQualityAssurance = any;
export type IncentiveSystem = any;
export type ReviewPhase = any;
export type ReviewWorkflow = any;
export type ReviewQualityControl = any;
export type ReviewerSelectionCriteria = any;
export type ReviewerMatchingAlgorithm = any;
export type AvailabilityTracker = any;
export type ReviewerLoadBalancer = any;
export type ConflictOfInterestDetector = any;
export type WorkflowTemplate = any;
export type ReviewStateManager = any;
export type ProgressTracker = any;
export type DeadlineManager = any;
export type EscalationProcedure = any;
export type ReviewComment = any;
export type ReviewQualityAssessment = any;
export type QualityHistoryRecord = any;
export type ReputationConfig = any;
export type ValidationConfig = any;
export type QualityAssuranceConfig = any;
export type TemporalManagementConfig = any;
export type PeerReviewConfig = any;
export type ReputationModelType = 'basic' | 'weighted' | 'hierarchical' | 'consensus' | 'adaptive';
export type ScoringAlgorithmType = 'linear' | 'logarithmic' | 'exponential' | 'sigmoid' | 'custom';
export type WeightingStrategy = 'equal' | 'reputation-based' | 'expertise-based' | 'adaptive' | 'consensus';
export type DecayFunctionType = 'exponential' | 'linear' | 'logarithmic' | 'step' | 'custom';
export type QualityDimensionType = 'accuracy' | 'completeness' | 'relevance' | 'timeliness' | 'consistency';
export type AssuranceLevel = 'basic' | 'standard' | 'enhanced' | 'critical' | 'maximum';
export type ConsensusType = 'simple-majority' | 'weighted-majority' | 'unanimous' | 'threshold' | 'adaptive';
export type ReviewType = 'peer' | 'expert' | 'automated' | 'hybrid' | 'crowdsourced';
/**
 * Reputation System.
 *
 * @example
 */
export interface ReputationSystem {
    reputationModel: ReputationModel;
    scoringAlgorithms: ScoringAlgorithm[];
    consensusWeighting: ConsensusWeightingConfig;
    decayFunctions: DecayFunction[];
    bootstrapping: BootstrappingConfig;
}
export interface ReputationModel {
    modelType: AdvancedReputationModelType;
    parameters: ReputationParameters;
    components: ReputationComponent[];
    aggregation: ReputationAggregation;
    normalization: NormalizationConfig;
}
export interface ReputationScore {
    agentId: string;
    overallScore: number;
    componentScores: ComponentScore[];
    confidence: number;
    lastUpdated: number;
    trend: ScoreTrend;
    rank: number;
    percentile: number;
}
export interface ScoringAlgorithm {
    algorithmName: string;
    algorithmType: QualityScoringAlgorithmType;
    weights: AlgorithmWeights;
    parameters: AlgorithmParameters;
    performance: AlgorithmPerformance;
    applicability: ScoringApplicability;
}
export interface ConsensusWeightingConfig {
    weightingStrategy: QualityWeightingStrategy;
    thresholds: ConsensusThreshold[];
    decisionRules: DecisionRule[];
    tieBreaking: TieBreakingRule[];
    adaptiveWeighting: AdaptiveWeightingConfig;
}
export interface DecayFunction {
    functionType: AdvancedDecayFunctionType;
    parameters: DecayParameters;
    applicableComponents: string[];
    minimumRetention: number;
    maxDecayRate: number;
}
export type AdvancedReputationModelType = 'pagerank-based' | 'eigentrust' | 'beta-reputation' | 'dirichlet-reputation' | 'subjective-logic' | 'hybrid-model';
export type QualityScoringAlgorithmType = 'accuracy-based' | 'consistency-based' | 'timeliness-based' | 'completeness-based' | 'peer-rating' | 'usage-based' | 'citation-based';
export type QualityWeightingStrategy = 'equal-weighting' | 'reputation-weighted' | 'expertise-weighted' | 'confidence-weighted' | 'dynamic-weighting' | 'machine-learned';
export type AdvancedDecayFunctionType = 'exponential-decay' | 'linear-decay' | 'logarithmic-decay' | 'stepped-decay' | 'adaptive-decay';
/**
 * Validation Protocols.
 *
 * @example
 */
export interface ValidationProtocol {
    protocolName: string;
    validationType: ValidationType;
    validators: ValidatorConfig[];
    thresholds: ValidationThresholds;
    evidenceRequirements: EvidenceRequirements;
    crossValidation: CrossValidationConfig;
}
export interface ValidatorConfig {
    validatorId: string;
    validatorType: ValidatorType;
    capabilities: ValidationCapability[];
    reliability: ValidatorReliability;
    specialization: ValidationSpecialization;
    performance: ValidatorPerformance;
}
export interface ValidationThresholds {
    acceptanceThreshold: number;
    rejectionThreshold: number;
    uncertaintyThreshold: number;
    consensusThreshold: number;
    qualityThreshold: number;
    confidenceThreshold: number;
}
export interface EvidenceRequirements {
    minEvidenceCount: number;
    evidenceTypes: EvidenceType[];
    sourceReliability: SourceReliabilityRequirement[];
    verificationLevel: VerificationLevel;
    crossReferencingRequirement: CrossReferencingConfig;
}
export interface CrossValidationConfig {
    validatorSelection: ValidatorSelectionStrategy;
    minValidators: number;
    maxValidators: number;
    disagreementResolution: DisagreementResolutionStrategy;
    consensusBuilding: ConsensusConfiguration;
}
export interface ValidationResult {
    validationId: string;
    knowledgeItem: KnowledgeItem;
    validationType: ValidationType;
    validatorsUsed: string[];
    validationScores: ValidationScore[];
    overallScore: number;
    isValid: boolean;
    confidence: number;
    evidence: ValidationEvidence[];
    issues: ValidationIssue[];
    recommendations: ValidationRecommendation[];
    timestamp: number;
}
export type ValidationType = 'logical-consistency' | 'empirical-verification' | 'peer-consensus' | 'expert-review' | 'automated-checking' | 'cross-referencing' | 'statistical-validation' | 'comprehensive';
export type ValidatorType = 'human-expert' | 'ai-agent' | 'automated-system' | 'crowdsourced' | 'hybrid-validator';
export type VerificationLevel = 'basic' | 'standard' | 'rigorous' | 'comprehensive' | 'critical';
/**
 * Quality Assurance System.
 *
 * @example
 */
export interface QualityAssuranceSystem {
    qualityMetrics: QualityMetricDefinition[];
    assessmentProtocols: AssessmentProtocol[];
    continuousMonitoring: MonitoringConfig;
    qualityImprovement: ImprovementMechanism[];
    benchmarking: BenchmarkingConfig;
}
export interface QualityMetricDefinition {
    metricName: string;
    metricType: QualityMetricType;
    measurement: MeasurementMethod;
    aggregation: AggregationMethod;
    interpretation: InterpretationRules;
    benchmarks: QualityBenchmark[];
}
export interface AssessmentProtocol {
    protocolName: string;
    assessmentScope: AssessmentScope;
    assessmentMethod: AssessmentMethod;
    frequency: AssessmentFrequency;
    criteria: AssessmentCriteria[];
    scoring: ScoringRubric;
}
export interface MonitoringConfig {
    monitoringScope: MonitoringScope;
    monitoringFrequency: number;
    alertConditions: AlertCondition[];
    dashboards: DashboardConfig[];
    reporting: ReportingConfig;
}
export interface ImprovementMechanism {
    mechanismName: string;
    improvementType: ImprovementType;
    triggers: ImprovementTrigger[];
    actions: ImprovementAction[];
    evaluation: ImprovementEvaluation;
}
export interface BenchmarkingConfig {
    benchmarkTypes: BenchmarkType[];
    comparisonBaselines: ComparisonBaseline[];
    performanceStandards: PerformanceStandard[];
    benchmarkingFrequency: number;
    reportingFormat: BenchmarkReportFormat;
}
export type QualityMetricType = 'accuracy' | 'completeness' | 'consistency' | 'timeliness' | 'relevance' | 'reliability' | 'usability' | 'verifiability';
export type AssessmentMethod = 'automated-analysis' | 'expert-evaluation' | 'peer-review' | 'statistical-analysis' | 'comparative-analysis' | 'longitudinal-study';
export type ImprovementType = 'process-improvement' | 'quality-enhancement' | 'validation-strengthening' | 'efficiency-optimization' | 'coverage-expansion';
/**
 * Temporal Knowledge Management.
 *
 * @example
 */
export interface TemporalKnowledgeManager {
    versionControl: KnowledgeVersionControl;
    temporalValidation: TemporalValidationSystem;
    knowledgeDecay: KnowledgeDecayManager;
    updatePropagation: UpdatePropagationSystem;
    temporalQueries: TemporalQueryEngine;
}
export interface KnowledgeVersionControl {
    versions: Map<string, KnowledgeVersion>;
    versionHistory: VersionHistory[];
    mergeStrategies: MergeStrategy[];
    conflictResolution: VersionConflictResolver;
    branchManagement: BranchManager;
}
export interface TemporalValidationSystem {
    temporalConstraints: TemporalConstraint[];
    timeSeriesValidation: TimeSeriesValidator;
    causalityChecking: CausalityChecker;
    consistencyMaintenance: TemporalConsistencyMaintainer;
    invalidationDetection: InvalidationDetector;
}
export interface KnowledgeDecayManager {
    decayModels: DecayModel[];
    freshnessCriteria: FreshnessCriteria[];
    decayPrediction: DecayPredictor;
    refreshStrategies: RefreshStrategy[];
    retentionPolicies: RetentionPolicy[];
}
export interface UpdatePropagationSystem {
    propagationGraph: PropagationGraph;
    updateStrategies: UpdateStrategy[];
    dependencyTracking: DependencyTracker;
    impactAnalysis: ImpactAnalyzer;
    cascadingUpdates: CascadingUpdateManager;
}
export type TemporalConstraint = 'before-constraint' | 'after-constraint' | 'during-constraint' | 'overlap-constraint' | 'sequence-constraint' | 'duration-constraint';
export type MergeStrategy = 'last-writer-wins' | 'first-writer-wins' | 'content-based-merge' | 'confidence-based-merge' | 'expert-mediated-merge' | 'automated-merge';
/**
 * Peer Review System.
 *
 * @example
 */
export interface PeerReviewSystem {
    reviewProcesses: ReviewProcess[];
    reviewerSelection: ReviewerSelectionSystem;
    reviewWorkflow: ReviewWorkflowManager;
    reviewQuality: ReviewQualityAssurance;
    reviewerIncentives: IncentiveSystem;
}
export interface ReviewProcess {
    processName: string;
    reviewType: ReviewProcessType;
    phases: ReviewPhase[];
    criteria: ReviewCriteria[];
    workflow: ReviewWorkflow;
    qualityControl: ReviewQualityControl;
}
export interface ReviewerSelectionSystem {
    selectionCriteria: ReviewerSelectionCriteria[];
    matchingAlgorithm: ReviewerMatchingAlgorithm;
    availabilityTracking: AvailabilityTracker;
    loadBalancing: ReviewerLoadBalancer;
    conflictOfInterest: ConflictOfInterestDetector;
}
export interface ReviewWorkflowManager {
    workflowTemplates: WorkflowTemplate[];
    stateManagement: ReviewStateManager;
    progressTracking: ProgressTracker;
    deadlineManagement: DeadlineManager;
    escalationProcedures: EscalationProcedure[];
}
export interface ReviewResult {
    reviewId: string;
    knowledgeItem: KnowledgeItem;
    reviewers: ReviewerAssignment[];
    reviewScores: ReviewScore[];
    overallScore: number;
    recommendation: ReviewRecommendation;
    comments: ReviewComment[];
    qualityAssessment: ReviewQualityAssessment;
    timestamp: number;
}
export type ReviewProcessType = 'single-blind' | 'double-blind' | 'open-review' | 'post-publication' | 'continuous-review' | 'collaborative-review';
export type ReviewRecommendation = 'accept' | 'accept-with-minor-revisions' | 'accept-with-major-revisions' | 'reject-and-resubmit' | 'reject' | 'require-additional-review';
/**
 * Main Knowledge Quality Management System.
 *
 * @example
 */
export declare class KnowledgeQualityManagementSystem extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private reputationSystem;
    private validationProtocols;
    private qualityAssurance;
    private temporalManager;
    private peerReviewSystem;
    private reputationScores;
    private validationResults;
    private qualityMetrics;
    private reviewResults;
    private qualityHistory;
    constructor(config: KnowledgeQualityConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize all quality management systems.
     */
    private initializeSystems;
    /**
     * Set up system integrations.
     */
    private setupIntegrations;
    /**
     * Validate knowledge item through comprehensive validation.
     *
     * @param knowledgeItem
     * @param validationType
     */
    validateKnowledge(knowledgeItem: KnowledgeItem, validationType?: ValidationType): Promise<ValidationResult>;
    /**
     * Manage reputation scores for knowledge contributors.
     *
     * @param agentId
     * @param contribution
     */
    updateReputationScore(agentId: string, contribution: ContributionRecord): Promise<ReputationScore>;
    /**
     * Conduct peer review process for knowledge items.
     *
     * @param knowledgeItem
     * @param reviewType
     */
    conductPeerReview(knowledgeItem: KnowledgeItem, reviewType?: ReviewProcessType): Promise<ReviewResult>;
    /**
     * Monitor and maintain knowledge quality continuously.
     */
    monitorKnowledgeQuality(): Promise<QualityMonitoringReport>;
    /**
     * Get comprehensive quality management metrics.
     */
    getMetrics(): Promise<KnowledgeQualityMetrics>;
    /**
     * Shutdown quality management system gracefully.
     */
    shutdown(): Promise<void>;
    private selectValidationProtocol;
    private selectValidators;
    private executeValidation;
    private aggregateValidationResults;
    private applyValidationDecision;
    private generateValidationEvidence;
    private updateValidationWeights;
    private updateReputationFromValidation;
    private updateQualityMetrics;
    private initializeReputationScore;
    private applyReputationAlgorithm;
    private aggregateReputationScores;
    private applyDecayFunctions;
    private normalizeReputationScore;
    private calculateScoreTrend;
    private updateGlobalRankings;
    private integrateReviewResults;
    private selectReviewProcess;
    private selectReviewers;
    private initializeReviewWorkflow;
    private executeReviewPhases;
    private aggregateReviewResults;
    private generateReviewRecommendation;
    private collectReviewComments;
    private assessReviewQuality;
    private updateReviewerReputations;
    private applyReviewOutcome;
    private collectQualityMetrics;
    private analyzeQualityTrends;
    private detectQualityIssues;
    private generateImprovementRecommendations;
    private applyAutomaticImprovements;
    private updateQualityBenchmarks;
    private getAverageReputation;
    private getReputationDistribution;
    private getTopPerformers;
    private getValidationSuccessRate;
    private getAverageValidationTime;
    private getValidationAccuracy;
    private getOverallQualityScore;
    private getQualityTrends;
    private getIssueResolutionRate;
    private getImprovementEffectiveness;
    private getAverageReviewTime;
    private getReviewerSatisfaction;
    private getAverageReviewQuality;
    private getKnowledgeFreshness;
    private getUpdateFrequency;
    private getDecayRate;
    private getRefreshEfficiency;
    private createMockReputationSystem;
    private createMockQualityAssuranceEngine;
    private createMockTemporalKnowledgeSystem;
    private createMockPeerReviewEngine;
}
/**
 * Configuration and result interfaces.
 *
 * @example
 */
export interface KnowledgeQualityConfig {
    reputation: ReputationConfig;
    validation: ValidationConfig;
    qualityAssurance: QualityAssuranceConfig;
    temporalManagement: TemporalManagementConfig;
    peerReview: PeerReviewConfig;
}
export interface KnowledgeItem {
    id: string;
    type: string;
    content: string;
    metadata: any;
    quality: number;
    timestamp: number;
}
export interface ContributionRecord {
    type: string;
    quality: number;
    timestamp: number;
    metadata: any;
}
export interface QualityMonitoringReport {
    reportId: string;
    currentMetrics: any;
    qualityTrends: any;
    identifiedIssues: number;
    improvementRecommendations: number;
    appliedImprovements: number;
    benchmarkUpdates: number;
    overallQualityScore: number;
    monitoringTime: number;
    timestamp: number;
}
export interface KnowledgeQualityMetrics {
    reputation: any;
    validation: any;
    qualityAssurance: any;
    peerReview: any;
    temporal: any;
}
export interface ReviewerAssignment {
    reviewerId: string;
    assignment: any;
}
export interface ValidationScore {
    validatorId: string;
    score: number;
    confidence: number;
    comments: string;
}
export interface ReviewScore {
    reviewerId: string;
    score: number;
    confidence: number;
    comments: string;
}
export default KnowledgeQualityManagementSystem;
//# sourceMappingURL=knowledge-quality-management.d.ts.map