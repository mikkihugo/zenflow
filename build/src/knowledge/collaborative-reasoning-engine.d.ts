/**
 * Collaborative Reasoning Engine for Claude-Zen.
 * Implements multi-agent collaborative problem-solving with distributed reasoning.
 *
 * Architecture: Collective intelligence through collaborative reasoning
 * - Multi-Agent Problem Decomposition: Break complex problems into solvable components
 * - Distributed Reasoning: Coordinate reasoning across specialized agents
 * - Consensus Building: Build consensus through structured dialogue and voting
 * - Solution Synthesis: Combine partial solutions into comprehensive answers
 * - Context Sharing: Maintain shared reasoning context across agent interactions.
 */
/**
 * @file Collaborative-reasoning processing engine.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
export interface DependencyMapper {
    mapDependencies(problem: Problem): ProblemDependency[];
}
export interface ParallelizationEngine {
    identifyParallelizable(subproblems: SubProblem[]): SubProblem[][];
}
export interface WorkloadBalancer {
    balanceWorkload(agents: string[], subproblems: SubProblem[]): Map<string, SubProblem[]>;
}
export interface ApplicabilityCondition {
    type: string;
    condition: string;
    threshold?: number;
}
export interface QualityMetric {
    name: string;
    weight: number;
    threshold: number;
}
export interface PerformanceCharacteristics {
    timeComplexity: string;
    spaceComplexity: string;
    parallelizability: number;
}
export interface ExecutionPlan {
    steps: ExecutionStep[];
    dependencies: string[];
    estimatedTime: number;
}
export interface ExecutionStep {
    id: string;
    description: string;
    agentId?: string;
    dependencies: string[];
    estimated_duration: number;
}
export interface ResourceRequirements {
    computeUnits: number;
    memoryMB: number;
    agents: number;
    timeMinutes: number;
}
export interface QualityAssuranceConfig {
    validationRules: string[];
    reviewRequired: boolean;
    confidenceThreshold: number;
}
export interface ComplexityMetrics {
    computational: number;
    cognitive: number;
    temporal: number;
    uncertainty: number;
}
export interface ProblemRequirements {
    skills: string[];
    domain: string;
    accuracy: number;
    timeConstraint?: number;
}
export interface ProblemConstraint {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface OutputSpecification {
    format: string;
    schema?: string;
    validation: string[];
}
export interface DependencyResolution {
    strategy: string;
    priority: number;
    alternatives: string[];
}
export interface ComplexityMetric {
    name: string;
    calculator: string;
    threshold: number;
}
export interface ComplexityAnalysisAlgorithm {
    name: string;
    type: string;
    parameters: Record<string, any>;
}
export interface ScalabilityPredictor {
    predictScalability(problem: Problem): number;
}
export interface ResourceEstimator {
    estimateResources(problem: Problem): ResourceRequirements;
}
export interface Problem {
    id: string;
    description: string;
    type: ProblemType;
    complexity: ComplexityMetrics;
    constraints: ProblemConstraint[];
    requirements: ProblemRequirements;
}
/**
 * Problem Decomposition System.
 *
 * @example
 */
export interface ProblemDecomposer {
    decompositionStrategies: DecompositionStrategy[];
    complexityAnalyzer: ComplexityAnalyzer;
    dependencyMapper: DependencyMapper;
    parallelizationEngine: ParallelizationEngine;
    workloadBalancer: WorkloadBalancer;
    on(event: string, handler: Function): void;
    shutdown(): Promise<void>;
}
export interface DecompositionStrategy {
    name: string;
    applicability: ApplicabilityCondition[];
    decompositionAlgorithm: DecompositionAlgorithm;
    qualityMetrics: QualityMetric[];
    performance: PerformanceCharacteristics;
}
export interface ProblemDecomposition {
    decompositionId: string;
    originalProblem: Problem;
    strategy: DecompositionStrategy;
    subproblems: SubProblem[];
    dependencies: ProblemDependency[];
    executionPlan: ExecutionPlan;
    resourceRequirements: ResourceRequirements;
    qualityAssurance: QualityAssuranceConfig;
}
export interface SubProblem {
    subproblemId: string;
    parentProblem: string;
    description: string;
    type: ProblemType;
    complexity: ComplexityMetrics;
    requirements: ProblemRequirements;
    constraints: ProblemConstraint[];
    expectedOutput: OutputSpecification;
    assignedAgent: string | null;
    status: SubProblemStatus;
}
export interface ProblemDependency {
    dependencyId: string;
    source: string;
    target: string;
    dependencyType: DependencyType;
    strength: number;
    criticality: number;
    resolution: DependencyResolution;
}
export interface ComplexityAnalyzer {
    complexityMetrics: ComplexityMetric[];
    analysisAlgorithms: ComplexityAnalysisAlgorithm[];
    scalabilityPredictor: ScalabilityPredictor;
    resourceEstimator: ResourceEstimator;
}
export type DecompositionAlgorithm = 'hierarchical-decomposition' | 'functional-decomposition' | 'data-flow-decomposition' | 'temporal-decomposition' | 'constraint-based-decomposition' | 'recursive-decomposition';
export type ProblemType = 'analytical' | 'creative' | 'optimization' | 'classification' | 'prediction' | 'design' | 'planning';
export type SubProblemStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
export interface ReasoningContextManager {
    createContext(taskId: string): ReasoningContext;
    updateContext(taskId: string, updates: Partial<ReasoningContext>): void;
}
export interface ReasoningSpecialization {
    domain: string;
    methods: string[];
    confidence: number;
}
export interface CoordinationProtocol {
    name: string;
    type: string;
    rules: string[];
}
export interface ReasoningLoadBalancer {
    balanceLoad(tasks: ReasoningTask[]): Map<string, ReasoningTask[]>;
}
export interface ReasoningQualityController {
    assessQuality(reasoning: ReasoningTask): number;
    validateConclusions(conclusions: Conclusion[]): boolean;
}
export interface ReasoningContext {
    domain: string;
    constraints: string[];
    assumptions: string[];
    knowledge: string[];
}
export interface Inference {
    id: string;
    rule: string;
    premises: string[];
    conclusion: string;
    confidence: number;
}
export interface Conclusion {
    id: string;
    statement: string;
    confidence: number;
    evidence: string[];
    reasoning: string;
}
export interface AttackRelation {
    attacker: string;
    target: string;
    strength: number;
}
export interface SupportRelation {
    supporter: string;
    target: string;
    strength: number;
}
export interface ArgumentExtension {
    type: string;
    arguments: string[];
    confidence: number;
}
export interface EvaluationCriteria {
    relevance: number;
    credibility: number;
    consistency: number;
}
export interface DialecticalTree {
    root: string;
    nodes: Map<string, TreeNode>;
    relationships: string[];
}
export interface TreeNode {
    id: string;
    type: string;
    content: string;
    children: string[];
}
export interface Claim {
    statement: string;
    type: string;
    confidence: number;
}
export interface Premise {
    statement: string;
    support: number;
    source: string;
}
export interface Evidence {
    type: string;
    content: string;
    credibility: number;
    source: string;
}
export interface ReasoningChain {
    steps: string[];
    method: string;
    validity: number;
}
export interface InferenceRule {
    name: string;
    pattern: string;
    confidence: number;
}
export interface LogicalKnowledgeBase {
    facts: string[];
    rules: InferenceRule[];
    axioms: string[];
}
export interface ProofSystem {
    type: string;
    rules: string[];
    validators: string[];
}
export interface ConsistencyChecker {
    checkConsistency(knowledge: LogicalKnowledgeBase): boolean;
}
export interface CompletenessVerifier {
    verifyCompleteness(system: ProofSystem): boolean;
}
export interface BayesianNetwork {
    nodes: string[];
    edges: string[];
    probabilities: Map<string, number>;
}
export interface MarkovModel {
    states: string[];
    transitions: Map<string, Map<string, number>>;
}
export interface UncertaintyQuantifier {
    quantifyUncertainty(evidence: Evidence[]): number;
}
export interface ProbabilisticInferenceEngine {
    network: BayesianNetwork;
    models: MarkovModel[];
    quantifier: UncertaintyQuantifier;
}
export type DependencyType = 'data-dependency' | 'control-dependency' | 'resource-dependency' | 'temporal-dependency' | 'logical-dependency';
export interface BeliefRevisionSystem {
    reviseBeliefs(newEvidence: Evidence[]): void;
}
/**
 * Distributed Reasoning System.
 *
 * @example
 */
export interface DistributedReasoningEngine {
    reasoningCoordinator: ReasoningCoordinator;
    argumentationFramework: ArgumentationFramework;
    logicalInference: LogicalInferenceEngine;
    probabilisticReasoning: ProbabilisticReasoningEngine;
    contextManager: ReasoningContextManager;
    on(event: string, handler: Function): void;
    assignReasoningTasks(subproblems: SubProblem[]): Promise<void>;
    shutdown(): Promise<void>;
}
export interface ReasoningCoordinator {
    activeReasoningTasks: Map<string, ReasoningTask>;
    agentSpecializations: Map<string, ReasoningSpecialization>;
    coordinationProtocols: CoordinationProtocol[];
    loadBalancing: ReasoningLoadBalancer;
    qualityControl: ReasoningQualityController;
}
export interface ReasoningTask {
    taskId: string;
    problem: SubProblem;
    reasoningType: ReasoningType;
    assignedAgents: string[];
    context: ReasoningContext;
    arguments: Argument[];
    inferences: Inference[];
    conclusions: Conclusion[];
    confidence: number;
    status: ReasoningStatus;
}
export interface ArgumentationFramework {
    arguments: Map<string, Argument>;
    attacks: AttackRelation[];
    supports: SupportRelation[];
    extensions: ArgumentExtension[];
    evaluationCriteria: EvaluationCriteria;
    dialecticalTree: DialecticalTree;
}
export interface Argument {
    argumentId: string;
    claim: Claim;
    premises: Premise[];
    evidence: Evidence[];
    reasoning: ReasoningChain;
    strength: number;
    credibility: number;
    author: string;
    timestamp: number;
}
export interface LogicalInferenceEngine {
    inferenceRules: InferenceRule[];
    knowledgeBase: LogicalKnowledgeBase;
    proofSystem: ProofSystem;
    consistencyChecker: ConsistencyChecker;
    completenessVerifier: CompletenessVerifier;
}
export interface ProbabilisticReasoningEngine {
    bayesianNetworks: Map<string, BayesianNetwork>;
    markovModels: Map<string, MarkovModel>;
    uncertaintyQuantification: UncertaintyQuantifier;
    probabilisticInference: ProbabilisticInferenceEngine;
    beliefRevision: BeliefRevisionSystem;
}
export type ReasoningType = 'deductive' | 'inductive' | 'abductive' | 'analogical' | 'causal' | 'probabilistic' | 'fuzzy' | 'temporal';
export type ReasoningStatus = 'initializing' | 'collecting-premises' | 'generating-arguments' | 'evaluating-evidence' | 'building-inferences' | 'reaching-conclusions' | 'completed' | 'inconclusive';
/**
 * Consensus Building System.
 *
 * @example
 */
export interface ConsensusBuilder {
    consensusProtocols: ConsensusProtocol[];
    votingMechanisms: VotingMechanism[];
    dialogueManager: DialogueManager;
    conflictResolver: ConflictResolver;
    agreementTracker: AgreementTracker;
    on(event: string, handler: Function): void;
    initiateConsensus(results: any): Promise<void>;
    shutdown(): Promise<void>;
}
export interface ConsensusProtocol {
    name: string;
    applicability: ConsensusApplicability;
    phases: ConsensusPhase[];
    terminationCondition: TerminationCondition;
    qualityAssurance: ConsensusQualityAssurance;
}
export interface ConsensusPhase {
    name: string;
    participantRoles: ParticipantRole[];
    duration: PhaseDuration;
    successCriteria: SuccessCriteria;
    fallbackStrategy: FallbackStrategy;
}
export interface DialogueManager {
    activeDialogues: Map<string, Dialogue>;
    protocol: DialogueProtocol;
    turnTaking: TurnTakingSystem;
    messageValidation: MessageValidationSystem;
    contextManager: DialogueContextManager;
}
export interface VotingMechanism {
    eligibilityRules: EligibilityRule[];
    ballotDesign: BallotDesign;
    aggregationMethod: AggregationMethod;
    transparencyLevel: TransparencyLevel;
    auditMechanism: AuditMechanism;
}
export interface AgreementTracker {
    trackAgreement(dialogue: Dialogue): number;
}
export interface ConsensusApplicability {
    conditions: string[];
    threshold: number;
}
export interface TerminationCondition {
    type: string;
    threshold: number;
    timeout: number;
}
export interface ConsensusQualityAssurance {
    metrics: string[];
    validators: string[];
}
export interface ParticipantRole {
    name: string;
    permissions: string[];
    responsibilities: string[];
}
export interface PhaseDuration {
    min: number;
    max: number;
    adaptive: boolean;
}
export interface SuccessCriteria {
    agreement: number;
    participation: number;
    quality: number;
}
export interface FallbackStrategy {
    triggers: string[];
    actions: string[];
}
export interface Dialogue {
    id: string;
    participants: string[];
    messages: Message[];
    status: string;
}
export interface Message {
    id: string;
    author: string;
    content: string;
    timestamp: number;
    type: string;
}
export interface DialogueProtocol {
    rules: string[];
    format: string;
    constraints: string[];
}
export interface TurnTakingSystem {
    strategy: string;
    rules: string[];
}
export interface MessageValidationSystem {
    validators: string[];
    rules: string[];
}
export interface DialogueContextManager {
    manageContext(dialogue: Dialogue): void;
}
export interface EligibilityRule {
    type: string;
    criteria: string[];
}
export interface BallotDesign {
    type: string;
    options: string[];
}
export interface AggregationMethod {
    type: string;
    parameters: Record<string, any>;
}
export interface TransparencyLevel {
    level: string;
    visibility: string[];
}
export interface AuditMechanism {
    type: string;
    frequency: string;
}
export interface ConsensusProtocol {
    protocolName: string;
    applicability: ConsensusApplicability;
    phases: ConsensusPhase[];
    terminationConditions: TerminationCondition[];
    qualityAssurance: ConsensusQualityAssurance;
}
export interface ConsensusPhase {
    phaseName: string;
    activities: ConsensusActivity[];
    participants: ParticipantRole[];
    duration: PhaseDuration;
    successCriteria: SuccessCriteria;
    fallbackStrategies: FallbackStrategy[];
}
export interface DialogueManager {
    activeDialogues: Map<string, Dialogue>;
    dialogueProtocols: DialogueProtocol[];
    turnTaking: TurnTakingSystem;
    messageValidation: MessageValidationSystem;
    contextMaintenance: DialogueContextManager;
    protocol: DialogueProtocol;
}
export interface VotingMechanism {
    votingMethod: VotingMethod;
    eligibilityRules: EligibilityRule[];
    weightingScheme: WeightingScheme;
    aggregationFunction: AggregationFunction;
    outcomeInterpretation: OutcomeInterpretation;
}
export interface ConflictResolver {
    conflictDetection: ConflictDetectionSystem;
    mediationStrategies: MediationStrategy[];
    arbitrationProcedures: ArbitrationProcedure[];
    compromiseGeneration: CompromiseGenerator;
    resolutionTracking: ResolutionTracker;
}
export interface WeightingScheme {
    type: string;
    weights: Map<string, number>;
}
export interface AggregationFunction {
    method: string;
    parameters: Record<string, any>;
}
export interface OutcomeInterpretation {
    thresholds: Map<string, number>;
    rules: string[];
}
export interface ConflictDetectionSystem {
    detectConflicts(argumentList: Argument[]): string[];
}
export interface MediationStrategy {
    name: string;
    steps: string[];
    success_criteria: string[];
}
export interface ArbitrationProcedure {
    name: string;
    rules: string[];
    binding: boolean;
}
export interface CompromiseGenerator {
    generateCompromise(conflicts: string[]): string;
}
export interface ResolutionTracker {
    trackResolution(conflict: string, resolution: string): void;
}
export type VotingMethod = 'simple-majority' | 'weighted-voting' | 'ranked-choice' | 'approval-voting' | 'quadratic-voting' | 'liquid-democracy' | 'consensus-building';
export type ConsensusActivity = 'information-sharing' | 'position-presentation' | 'argument-exchange' | 'evidence-evaluation' | 'compromise-seeking' | 'decision-finalization';
/**
 * Solution Synthesis System.
 *
 * @example
 */
export interface SolutionSynthesizer {
    synthesisStrategies: SynthesisStrategy[];
    integrationEngine: IntegrationEngine;
    qualityAssurance: SolutionQualityAssurance;
    validationFramework: ValidationFramework;
    optimizationEngine: SolutionOptimizationEngine;
    on(event: string, handler: Function): void;
    synthesizeSolution(consensus: any): Promise<void>;
    shutdown(): Promise<void>;
}
export interface SynthesisStrategy {
    strategyName: string;
    applicability: SynthesisApplicability;
    integrationMethod: IntegrationMethod;
    conflictResolution: SynthesisConflictResolution;
    qualityMetrics: SynthesisQualityMetric[];
}
export interface IntegrationEngine {
    partialSolutions: Map<string, PartialSolution>;
    integrationPatterns: IntegrationPattern[];
    dependencyResolver: IntegrationDependencyResolver;
    consistencyMaintainer: ConsistencyMaintainer;
    emergenceDetector: EmergenceDetector;
}
export interface PartialSolution {
    solutionId: string;
    subproblemId: string;
    solution: Solution;
    quality: SolutionQuality;
    dependencies: SolutionDependency[];
    constraints: SolutionConstraint[];
    author: string;
    timestamp: number;
}
export interface ValidationFramework {
    validationCriteria: ValidationCriterion[];
    testingSuite: TestCase[];
    performanceEvaluation: PerformanceEvaluator;
    robustnessAnalysis: RobustnessAnalyzer;
    usabilityAssessment: UsabilityAssessor;
}
export type IntegrationMethod = 'sequential-integration' | 'parallel-integration' | 'hierarchical-integration' | 'iterative-integration' | 'adaptive-integration' | 'evolutionary-integration';
/**
 * Context Sharing System.
 *
 * @example
 */
export interface ContextSharingManager {
    sharedContext: SharedReasoningContext;
    contextSynchronization: ContextSynchronizer;
    contextEvolution: ContextEvolutionTracker;
    contextAccess: ContextAccessController;
    contextPersistence: ContextPersistenceManager;
    on(event: string, handler: Function): void;
    updateSharedContext(solution: any): Promise<void>;
    shutdown(): Promise<void>;
}
export interface SharedReasoningContext {
    contextId: string;
    problem: Problem;
    participants: ContextParticipant[];
    sharedKnowledge: SharedKnowledge;
    assumptions: SharedAssumption[];
    constraints: SharedConstraint[];
    goals: SharedGoal[];
    progress: ContextProgress;
}
export interface ContextSynchronizer {
    synchronizationProtocol: SynchronizationProtocol;
    conflictDetection: ContextConflictDetector;
    mergeStrategies: ContextMergeStrategy[];
    versionControl: ContextVersionControl;
    distributionMechanism: ContextDistributionMechanism;
}
export interface SharedKnowledge {
    facts: SharedFact[];
    rules: SharedRule[];
    patterns: SharedPattern[];
    experiences: SharedExperience[];
    insights: SharedInsight[];
}
export interface ContextParticipant {
    agentId: string;
    role: ContextRole;
    permissions: ContextPermission[];
    contributions: ContextContribution[];
    accessHistory: ContextAccessRecord[];
}
export type ContextRole = 'problem-owner' | 'domain-expert' | 'reasoning-specialist' | 'quality-controller' | 'facilitator' | 'observer';
/**
 * Main Collaborative Reasoning Engine.
 *
 * @example
 */
export declare class CollaborativeReasoningEngine extends EventEmitter {
    private logger;
    private eventBus;
    private config;
    private problemDecomposer;
    private distributedReasoning;
    private consensusBuilder;
    private solutionSynthesizer;
    private contextManager;
    private activeProblems;
    private decompositions;
    private reasoningTasks;
    private consensusProcesses;
    private sharedContexts;
    constructor(config: CollaborativeReasoningConfig, logger: ILogger, eventBus: IEventBus);
    /**
     * Initialize all reasoning systems.
     */
    private initializeSystems;
    /**
     * Set up system integrations.
     */
    private setupIntegrations;
    /**
     * Solve a complex problem collaboratively.
     *
     * @param problem
     * @param participants
     */
    solveCollaboratively(problem: Problem, participants: CollaborativeParticipant[]): Promise<CollaborativeSolution>;
    /**
     * Decompose complex problem into manageable subproblems.
     *
     * @param problem
     * @param participants
     */
    decomposeProblem(problem: Problem, participants: CollaborativeParticipant[]): Promise<ProblemDecomposition>;
    /**
     * Coordinate distributed reasoning across multiple agents.
     *
     * @param reasoningTasks
     * @param sharedContext
     */
    coordinateDistributedReasoning(reasoningTasks: ReasoningTask[], sharedContext: SharedReasoningContext): Promise<DistributedReasoningResult>;
    /**
     * Build consensus through structured dialogue and voting.
     *
     * @param reasoningResults
     * @param participants
     */
    buildConsensusOnResults(reasoningResults: DistributedReasoningResult, participants: CollaborativeParticipant[]): Promise<ConsensusResult>;
    /**
     * Synthesize partial solutions into comprehensive solution.
     *
     * @param consensusResults
     * @param decomposition
     */
    synthesizeComprehensiveSolution(consensusResults: ConsensusResult, decomposition: ProblemDecomposition): Promise<Solution>;
    /**
     * Get comprehensive reasoning engine metrics.
     */
    getMetrics(): Promise<CollaborativeReasoningMetrics>;
    /**
     * Shutdown reasoning engine gracefully.
     */
    shutdown(): Promise<void>;
    private initializeSharedContext;
    private assignReasoningTasks;
    private propagateContextUpdate;
    private validateAndOptimizeSolution;
    private getConsensusProcessCount;
    private calculateSolutionQuality;
    private calculateCollaborationMetrics;
    private storeSolutionForLearning;
    private analyzeProblemComplexity;
    private selectDecompositionStrategy;
    private applyDecompositionAlgorithm;
    private analyzeProblemDependencies;
    private createExecutionPlan;
    private calculateResourceRequirements;
    private createReasoningCoordinationPlan;
    private executeReasoningTask;
    private monitorReasoningProgress;
    private aggregateReasoningResults;
    private analyzeResultConflicts;
    private initializeConsensusProcess;
    private conductStructuredDialogue;
    private applyVotingMechanisms;
    private mediateRemainingConflicts;
    private combineConsensusResults;
    private calculateConsensusQuality;
    private calculateParticipantSatisfaction;
    private extractPartialSolutions;
    private selectSynthesisStrategy;
    private integratePartialSolutions;
    private resolveIntegrationConflicts;
    private optimizeSynthesizedSolution;
    private assessSolutionQuality;
    private assessSolutionCompleteness;
    private getAverageSubproblems;
    private getDecompositionEfficiency;
    private getComplexityReduction;
    private getReasoningAccuracy;
    private getParallelizationEfficiency;
    private getArgumentQuality;
    private getConsensusSuccessRate;
    private getAverageConsensusTime;
    private getOverallParticipantSatisfaction;
    private getSynthesizedSolutionCount;
    private getIntegrationSuccessRate;
    private getAverageSolutionQuality;
    private getAverageCompletenessScore;
    private getContextSynchronizationRate;
    private getKnowledgeShareEfficiency;
    private getContextEvolutionRate;
}
/**
 * Configuration and result interfaces.
 *
 * @example
 */
export interface CollaborativeReasoningConfig {
    decomposition: DecompositionConfig;
    reasoning: ReasoningConfig;
    consensus: ConsensusConfig;
    synthesis: SynthesisConfig;
    contextSharing: ContextSharingConfig;
}
export interface Problem {
    id: string;
    type: ProblemType;
    description: string;
    complexity: ComplexityMetrics;
    constraints: ProblemConstraint[];
    goals: ProblemGoal[];
    context: ProblemContext;
}
export interface CollaborativeSolution {
    problemId: string;
    originalProblem: Problem;
    participants: number;
    decomposition: ProblemDecomposition;
    reasoningTasks: number;
    consensusProcesses: number;
    synthesizedSolution: any;
    qualityMetrics: any;
    collaborationMetrics: any;
    solutionTime: number;
    timestamp: number;
}
export interface DistributedReasoningResult {
    resultId: string;
    originalTasks: number;
    completedTasks: number;
    aggregatedResults: any;
    conflictAnalysis: any;
    sharedContext: SharedReasoningContext;
    requiresConsensus: boolean;
    reasoningTime: number;
    timestamp: number;
}
export interface ConsensusResult {
    consensusId: string;
    originalConflicts: number;
    resolvedConflicts: number;
    consensusQuality: number;
    participantSatisfaction: number;
    consensusResults: any;
    consensusTime: number;
    timestamp: number;
}
export interface Solution {
    solutionId: string;
    originalProblem: Problem;
    partialSolutions: number;
    synthesisStrategy: string;
    integratedSolution: any;
    solutionQuality: any;
    completeness: any;
    synthesisTime: number;
    timestamp: number;
}
export interface CollaborativeReasoningMetrics {
    problemDecomposition: any;
    distributedReasoning: any;
    consensusBuilding: any;
    solutionSynthesis: any;
    contextSharing: any;
}
export interface SolutionQualityAssurance {
    qualityMetrics: string[];
    validators: string[];
    thresholds: Map<string, number>;
}
export interface SolutionOptimizationEngine {
    optimize(solution: Solution): Promise<Solution>;
}
export interface SynthesisApplicability {
    conditions: string[];
    threshold: number;
}
export interface SynthesisConflictResolution {
    strategy: string;
    priority: number;
}
export interface SynthesisQualityMetric {
    name: string;
    weight: number;
    threshold: number;
}
export interface IntegrationPattern {
    name: string;
    strategy: string;
    compatibility: string[];
}
export interface IntegrationDependencyResolver {
    resolveDependencies(dependencies: string[]): Promise<string[]>;
}
export interface ConsistencyMaintainer {
    maintainConsistency(solutions: Solution[]): Promise<Solution[]>;
}
export interface EmergenceDetector {
    detectEmergence(patterns: string[]): string[];
}
export interface Solution {
    id: string;
    content: string;
    quality: number;
    metadata: Record<string, any>;
}
export interface SolutionQuality {
    accuracy: number;
    completeness: number;
    efficiency: number;
    usability: number;
}
export interface SolutionDependency {
    type: string;
    target: string;
    strength: number;
}
export interface SolutionConstraint {
    type: string;
    description: string;
    enforcement: string;
}
export interface ValidationCriterion {
    name: string;
    type: string;
    threshold: number;
}
export interface TestCase {
    id: string;
    description: string;
    inputs: Record<string, any>;
    expectedOutputs: Record<string, any>;
}
export interface PerformanceEvaluator {
    evaluatePerformance(solution: Solution): Promise<number>;
}
export interface RobustnessAnalyzer {
    analyzeRobustness(solution: Solution): Promise<number>;
}
export interface UsabilityAssessor {
    assessUsability(solution: Solution): Promise<number>;
}
export interface ContextEvolutionTracker {
    trackEvolution(context: SharedReasoningContext): void;
}
export interface ContextAccessController {
    controlAccess(participant: ContextParticipant, action: string): boolean;
}
export interface ContextPersistenceManager {
    persist(context: SharedReasoningContext): Promise<void>;
}
export interface SharedAssumption {
    id: string;
    assumption: string;
    confidence: number;
    source: string;
}
export interface SharedConstraint {
    id: string;
    constraint: string;
    type: string;
    enforcement: string;
}
export interface SharedGoal {
    id: string;
    goal: string;
    priority: number;
    status: string;
}
export interface ContextProgress {
    completion: number;
    milestones: string[];
    blockers: string[];
}
export interface SynchronizationProtocol {
    name: string;
    rules: string[];
    frequency: number;
}
export interface ContextConflictDetector {
    detectConflicts(contexts: SharedReasoningContext[]): string[];
}
export interface ContextMergeStrategy {
    name: string;
    algorithm: string;
    precedence: string[];
}
export interface ContextVersionControl {
    createVersion(context: SharedReasoningContext): string;
    getVersion(versionId: string): SharedReasoningContext;
}
export interface ContextDistributionMechanism {
    distribute(context: SharedReasoningContext, participants: ContextParticipant[]): Promise<void>;
}
export interface SharedFact {
    id: string;
    fact: string;
    confidence: number;
    source: string;
}
export interface SharedRule {
    id: string;
    rule: string;
    applicability: string[];
    confidence: number;
}
export interface SharedPattern {
    id: string;
    pattern: string;
    frequency: number;
    context: string[];
}
export interface SharedExperience {
    id: string;
    description: string;
    outcome: string;
    lessons: string[];
}
export interface SharedInsight {
    id: string;
    insight: string;
    derivation: string;
    implications: string[];
}
export interface ContextPermission {
    type: string;
    scope: string;
    level: string;
}
export interface ContextContribution {
    id: string;
    type: string;
    content: string;
    timestamp: number;
}
export interface ContextAccessRecord {
    timestamp: number;
    action: string;
    resource: string;
}
export interface DecompositionConfig {
    qualityAssurance: QualityAssuranceConfig;
    strategies: string[];
    maxDepth: number;
}
export interface ReasoningConfig {
    methods: string[];
    timeouts: Map<string, number>;
    qualityThresholds: Map<string, number>;
}
export interface ConsensusConfig {
    protocols: string[];
    timeouts: Map<string, number>;
    qualityThresholds: Map<string, number>;
}
export interface SynthesisConfig {
    strategies: string[];
    optimizations: string[];
    qualityThresholds: Map<string, number>;
}
export interface ContextSharingConfig {
    synchronization: boolean;
    persistence: boolean;
    accessControl: boolean;
}
export interface ProblemGoal {
    id: string;
    description: string;
    priority: number;
    measurable: boolean;
}
export interface ProblemContext {
    domain: string;
    stakeholders: string[];
    constraints: string[];
    assumptions: string[];
}
export interface CollaborativeParticipant {
    id: string;
    role: string;
    expertise: string[];
    availability: number;
}
export interface ConsensusProcess {
    id: string;
    participants: string[];
    topic: string;
    status: string;
}
export declare class ProblemDecompositionSystem implements ProblemDecomposer {
    private config;
    private logger;
    private eventBus;
    decompositionStrategies: DecompositionStrategy[];
    complexityAnalyzer: ComplexityAnalyzer;
    dependencyMapper: DependencyMapper;
    parallelizationEngine: ParallelizationEngine;
    workloadBalancer: WorkloadBalancer;
    constructor(config: any, logger: ILogger, eventBus: IEventBus);
    on(_event: string, _handler: Function): void;
    shutdown(): Promise<void>;
}
export declare class DistributedReasoningSystem implements DistributedReasoningEngine {
    private config;
    private logger;
    private eventBus;
    reasoningCoordinator: ReasoningCoordinator;
    argumentationFramework: ArgumentationFramework;
    logicalInference: LogicalInferenceEngine;
    probabilisticReasoning: ProbabilisticReasoningEngine;
    contextManager: ReasoningContextManager;
    constructor(config: any, logger: ILogger, eventBus: IEventBus);
    on(_event: string, _handler: Function): void;
    assignReasoningTasks(_subproblems: SubProblem[]): Promise<void>;
    shutdown(): Promise<void>;
}
export declare class ConsensusBuilderSystem implements ConsensusBuilder {
    private config;
    private logger;
    private eventBus;
    consensusProtocols: ConsensusProtocol[];
    votingMechanisms: VotingMechanism[];
    dialogueManager: DialogueManager;
    conflictResolver: ConflictResolver;
    agreementTracker: AgreementTracker;
    constructor(config: any, logger: ILogger, eventBus: IEventBus);
    on(_event: string, _handler: Function): void;
    initiateConsensus(_results: any): Promise<void>;
    shutdown(): Promise<void>;
}
export declare class SolutionSynthesisSystem implements SolutionSynthesizer {
    private config;
    private logger;
    private eventBus;
    synthesisStrategies: SynthesisStrategy[];
    integrationEngine: IntegrationEngine;
    qualityAssurance: SolutionQualityAssurance;
    validationFramework: ValidationFramework;
    optimizationEngine: SolutionOptimizationEngine;
    constructor(config: any, logger: ILogger, eventBus: IEventBus);
    on(_event: string, _handler: Function): void;
    synthesizeSolution(_consensus: any): Promise<void>;
    shutdown(): Promise<void>;
}
export declare class ContextSharingSystem implements ContextSharingManager {
    private config;
    private logger;
    private eventBus;
    sharedContext: SharedReasoningContext;
    contextSynchronization: ContextSynchronizer;
    contextEvolution: ContextEvolutionTracker;
    contextAccess: ContextAccessController;
    contextPersistence: ContextPersistenceManager;
    constructor(config: any, logger: ILogger, eventBus: IEventBus);
    on(_event: string, _handler: Function): void;
    updateSharedContext(_solution: any): Promise<void>;
    shutdown(): Promise<void>;
}
export default CollaborativeReasoningEngine;
//# sourceMappingURL=collaborative-reasoning-engine.d.ts.map