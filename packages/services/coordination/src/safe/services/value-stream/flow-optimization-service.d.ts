/**
 * @fileoverview Flow Optimization Service
 *
 * Service for AI-powered flow optimization recommendations.
 * Handles optimization strategy generation, flow analysis, and recommendation scoring.
 *
 * SINGLE RESPONSIBILITY: AI-powered flow optimization and recommendations
 * FOCUSES ON: Optimization strategies, AI analysis, recommendation generation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Flow optimization configuration
 */
export interface FlowOptimizationConfig {
    readonly optimizationId: string;
    readonly valueStreamId: string;
    readonly aiModel: AIModelConfig;
    readonly optimizationScope: OptimizationScope;
    readonly constraints: OptimizationConstraints;
    readonly objectives: OptimizationObjectives;
    readonly preferences: OptimizationPreferences;
}
/**
 * AI model configuration
 */
export interface AIModelConfig {
    readonly modelType: neural_network | genetic_algorithm | reinforcement_learning | 'hybrid;;
    readonly learningRate: number;
    readonly trainingData: TrainingDataConfig;
    readonly validationThreshold: number;
    readonly confidence: AIConfidenceLevel;
}
/**
 * Training data configuration
 */
export interface TrainingDataConfig {
    readonly historicalDataMonths: number;
    readonly includeSeasonality: boolean;
    readonly includeExternalFactors: boolean;
    readonly dataQualityThreshold: number;
    readonly minimumSampleSize: number;
}
/**
 * AI confidence levels
 */
export declare enum AIConfidenceLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
/**
 * Optimization scope
 */
export interface OptimizationScope {
    readonly includeStages: string[];
    readonly excludeStages: string[];
    readonly focusAreas: FocusArea[];
    readonly optimizationHorizon: number;
    readonly granularity: 'stage' | 'team' | 'individual';
}
/**
 * Focus areas for optimization
 */
export declare enum FocusArea {
    CYCLE_TIME = "cycle_time",
    THROUGHPUT = "throughput",
    QUALITY = "quality",
    COST = "cost",
    PREDICTABILITY = "predictability",
    CUSTOMER_SATISFACTION = "customer_satisfaction"
}
/**
 * Optimization constraints
 */
export interface OptimizationConstraints {
    readonly budgetConstraint: BudgetConstraint;
    readonly timeConstraint: TimeConstraint;
    readonly resourceConstraint: ResourceConstraint;
    readonly qualityConstraint: QualityConstraint;
    readonly complianceConstraints: ComplianceConstraint[];
}
/**
 * Budget constraint
 */
export interface BudgetConstraint {
    readonly maxBudget: number;
    readonly currency: string;
    readonly budgetAllocation: BudgetAllocation[];
    readonly roi: ROIRequirement;
}
/**
 * Budget allocation
 */
export interface BudgetAllocation {
    readonly category: 'people|technology|process|training;;
    readonly percentage: number;
    readonly maxAmount: number;
}
/**
 * ROI requirement
 */
export interface ROIRequirement {
    readonly minimumROI: number;
    readonly timeToROI: number;
    readonly calculation: net_present_value | internal_rate_return | 'payback_period;;
}
/**
 * Time constraint
 */
export interface TimeConstraint {
    readonly maxImplementationTime: number;
    readonly urgencyLevel: UrgencyLevel;
    readonly milestones: Milestone[];
    readonly dependencies: string[];
}
/**
 * Urgency levels
 */
export declare enum UrgencyLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Milestone
 */
export interface Milestone {
    readonly milestoneId: string;
    readonly name: string;
    readonly targetDate: Date;
    readonly deliverables: string[];
    readonly dependencies: string[];
}
/**
 * Resource constraint
 */
export interface ResourceConstraint {
    readonly availableCapacity: number;
    readonly skillConstraints: SkillConstraint[];
    readonly toolConstraints: ToolConstraint[];
    readonly infrastructureConstraints: string[];
}
/**
 * Skill constraint
 */
export interface SkillConstraint {
    readonly skill: string;
    readonly requiredLevel: 'beginner|intermediate|advanced|expert;;
    readonly availableCapacity: number;
    readonly trainingOptions: TrainingOption[];
}
/**
 * Training option
 */
export interface TrainingOption {
    readonly trainingId: string;
    readonly name: string;
    readonly duration: number;
    readonly cost: number;
    readonly effectiveness: number;
}
/**
 * Tool constraint
 */
export interface ToolConstraint {
    readonly toolName: string;
    readonly licenseLimit: number;
    readonly cost: number;
    readonly alternatives: ToolAlternative[];
}
/**
 * Tool alternative
 */
export interface ToolAlternative {
    readonly name: string;
    readonly cost: number;
    readonly capabilities: string[];
    readonly compatibility: number;
}
/**
 * Quality constraint
 */
export interface QualityConstraint {
    readonly minimumQuality: number;
    readonly qualityMetrics: QualityMetric[];
    readonly testingRequirements: TestingRequirement[];
    readonly acceptanceCriteria: string[];
}
/**
 * Quality metric
 */
export interface QualityMetric {
    readonly metricName: string;
    readonly target: number;
    readonly threshold: number;
    readonly measurement: string;
}
/**
 * Testing requirement
 */
export interface TestingRequirement {
    readonly testType: 'unit|integration|system|acceptance;;
    readonly coverage: number;
    readonly automated: boolean;
    readonly duration: number;
}
/**
 * Compliance constraint
 */
export interface ComplianceConstraint {
    readonly framework: string;
    readonly requirements: string[];
    readonly auditTrail: boolean;
    readonly documentation: string[];
}
/**
 * Optimization objectives
 */
export interface OptimizationObjectives {
    readonly primaryObjective: OptimizationObjective;
    readonly secondaryObjectives: OptimizationObjective[];
    readonly weights: ObjectiveWeight[];
    readonly successCriteria: SuccessCriteria[];
}
/**
 * Optimization objective
 */
export interface OptimizationObjective {
    readonly objectiveId: string;
    readonly name: string;
    readonly description: string;
    readonly targetValue: number;
    readonly currentValue: number;
    readonly improvement: number;
    readonly measurement: string;
    readonly priority: ObjectivePriority;
}
/**
 * Objective priority
 */
export declare enum ObjectivePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Objective weight
 */
export interface ObjectiveWeight {
    readonly objectiveId: string;
    readonly weight: number;
    readonly rationale: string;
}
/**
 * Success criteria
 */
export interface SuccessCriteria {
    readonly criteriaId: string;
    readonly description: string;
    readonly measurement: string;
    readonly target: number;
    readonly threshold: number;
    readonly timeframe: number;
}
/**
 * Optimization preferences
 */
export interface OptimizationPreferences {
    readonly riskTolerance: RiskTolerance;
    readonly changeManagement: ChangeManagementPreference;
    readonly automationLevel: AutomationLevel;
    readonly monitoringRequirements: MonitoringRequirement[];
}
/**
 * Risk tolerance
 */
export declare enum RiskTolerance {
    CONSERVATIVE = "conservative",
    MODERATE = "moderate",
    AGGRESSIVE = "aggressive"
}
/**
 * Change management preference
 */
export interface ChangeManagementPreference {
    readonly approach: 'big_bang|phased|pilot|gradual;;
    readonly stakeholderInvolvement: StakeholderInvolvement[];
    readonly communicationPlan: CommunicationPlan;
    readonly trainingRequirements: TrainingRequirement[];
}
/**
 * Stakeholder involvement
 */
export interface StakeholderInvolvement {
    readonly stakeholder: string;
    readonly role: string;
    readonly involvement: inform | consult | involve | collaborate | 'empower;;
    readonly frequency: 'daily|weekly|monthly|milestone;;
}
/**
 * Communication plan
 */
export interface CommunicationPlan {
    readonly channels: CommunicationChannel[];
    readonly frequency: string;
    readonly content: string[];
    readonly feedback: FeedbackMechanism[];
}
/**
 * Communication channel
 */
export interface CommunicationChannel {
    readonly channelType: 'email|slack|teams|meeting|dashboard;;
    readonly audience: string[];
    readonly purpose: string;
    readonly frequency: string;
}
/**
 * Feedback mechanism
 */
export interface FeedbackMechanism {
    readonly mechanismType: 'survey|interview|observation|metrics;;
    readonly frequency: string;
    readonly participants: string[];
    readonly purpose: string;
}
/**
 * Training requirement
 */
export interface TrainingRequirement {
    readonly trainingType: string;
    readonly audience: string[];
    readonly duration: number;
    readonly delivery: 'classroom|online|hands_on|hybrid;;
    readonly timing: 'before' | 'during' | 'after';
}
/**
 * Automation level
 */
export declare enum AutomationLevel {
    MANUAL = "manual",
    SEMI_AUTOMATED = "semi_automated",
    FULLY_AUTOMATED = "fully_automated"
}
/**
 * Monitoring requirement
 */
export interface MonitoringRequirement {
    readonly metricName: string;
    readonly frequency: 'real_time|hourly|daily|weekly;;
    readonly alertThreshold: number;
    readonly dashboard: boolean;
    readonly reporting: ReportingRequirement;
}
/**
 * Reporting requirement
 */
export interface ReportingRequirement {
    readonly frequency: 'daily|weekly|monthly|quarterly;;
    readonly audience: string[];
    readonly format: 'dashboard|report|email|presentation;;
    readonly content: string[];
}
/**
 * AI optimization recommendations result
 */
export interface AIOptimizationRecommendations {
    readonly recommendationId: string;
    readonly valueStreamId: string;
    readonly timestamp: Date;
    readonly aiModel: string;
    readonly confidence: number;
    readonly recommendations: FlowOptimizationRecommendation[];
    readonly alternativeStrategies: OptimizationStrategy[];
    readonly implementationRoadmap: ImplementationRoadmap;
    readonly expectedOutcomes: ExpectedOutcome[];
    readonly riskAssessment: RiskAssessment;
}
/**
 * Flow optimization recommendation
 */
export interface FlowOptimizationRecommendation {
    readonly recommendationId: string;
    readonly title: string;
    readonly description: string;
    readonly category: RecommendationCategory;
    readonly priority: RecommendationPriority;
    readonly stage: string;
    readonly expectedImpact: ExpectedImpact;
    readonly implementation: ImplementationDetails;
    readonly risks: Risk[];
    readonly dependencies: string[];
    readonly successMetrics: SuccessMetric[];
}
/**
 * Recommendation category
 */
export declare enum RecommendationCategory {
    PROCESS_OPTIMIZATION = "process_optimization",
    RESOURCE_ALLOCATION = "resource_allocation",
    AUTOMATION = "automation",
    TOOLING = "tooling",
    TRAINING = "training",
    ORGANIZATIONAL = "organizational"
}
/**
 * Recommendation priority
 */
export declare enum RecommendationPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Expected impact
 */
export interface ExpectedImpact {
    readonly cycleTimeReduction: number;
    readonly throughputIncrease: number;
    readonly qualityImprovement: number;
    readonly costReduction: number;
    readonly timeToRealize: number;
    readonly confidence: number;
}
/**
 * Implementation details
 */
export interface ImplementationDetails {
    readonly effort: ImplementationEffort;
    readonly timeline: ImplementationTimeline;
    readonly resources: RequiredResource[];
    readonly prerequisites: string[];
    readonly steps: ImplementationStep[];
}
/**
 * Implementation effort
 */
export declare enum ImplementationEffort {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
/**
 * Implementation timeline
 */
export interface ImplementationTimeline {
    readonly estimatedDuration: number;
    readonly phases: ImplementationPhase[];
    readonly milestones: ImplementationMilestone[];
    readonly criticalPath: string[];
}
/**
 * Implementation phase
 */
export interface ImplementationPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly duration: number;
    readonly objectives: string[];
    readonly deliverables: string[];
    readonly resources: string[];
}
/**
 * Implementation milestone
 */
export interface ImplementationMilestone {
    readonly milestoneId: string;
    readonly name: string;
    readonly date: Date;
    readonly criteria: string[];
    readonly dependencies: string[];
}
/**
 * Required resource
 */
export interface RequiredResource {
    readonly resourceType: 'people|technology|budget|time;;
    readonly name: string;
    readonly quantity: number;
    readonly duration: number;
    readonly cost: number;
    readonly availability: ResourceAvailability;
}
/**
 * Resource availability
 */
export declare enum ResourceAvailability {
    AVAILABLE = "available",
    LIMITED = "limited",
    UNAVAILABLE = "unavailable",
    REQUIRES_APPROVAL = "requires_approval"
}
/**
 * Implementation step
 */
export interface ImplementationStep {
    readonly stepId: string;
    readonly name: string;
    readonly description: string;
    readonly duration: number;
    readonly dependencies: string[];
    readonly owner: string;
    readonly deliverables: string[];
}
/**
 * Risk
 */
export interface Risk {
    readonly riskId: string;
    readonly description: string;
    readonly category: RiskCategory;
    readonly probability: RiskProbability;
    readonly impact: RiskImpact;
    readonly mitigation: string[];
    readonly owner: string;
}
/**
 * Risk category
 */
export declare enum RiskCategory {
    TECHNICAL = "technical",
    ORGANIZATIONAL = "organizational",
    FINANCIAL = "financial",
    SCHEDULE = "schedule",
    QUALITY = "quality",
    EXTERNAL = "external"
}
/**
 * Risk probability
 */
export declare enum RiskProbability {
    VERY_LOW = "very_low",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
/**
 * Risk impact
 */
export declare enum RiskImpact {
    NEGLIGIBLE = "negligible",
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    SEVERE = "severe"
}
/**
 * Success metric
 */
export interface SuccessMetric {
    readonly metricId: string;
    readonly name: string;
    readonly description: string;
    readonly target: number;
    readonly current: number;
    readonly measurement: string;
    readonly frequency: string;
}
/**
 * Flow Optimization Service
 */
export declare class FlowOptimizationService {
    private readonly logger;
    private optimizationResults;
    private aiModels;
    constructor(logger: Logger);
    /**
     * Generate AI-powered optimization recommendations
     */
    generateAIOptimizationRecommendations(config: FlowOptimizationConfig, flowData: any, bottleneckAnalysis?: any): Promise<AIOptimizationRecommendations>;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(optimizationId: string): AIOptimizationRecommendations | undefined;
    /**
     * Score recommendation
     */
    scoreRecommendation(recommendation: FlowOptimizationRecommendation, _config: FlowOptimizationConfig): number;
    /**
     * Private helper methods
     */
    private initializeAIModels;
    private prepareTrainingData;
    private trainOptimizationModel;
    private generateAlternativeStrategies;
    return: any;
    roadmap: any;
}
interface OptimizationStrategy {
    readonly strategyId: string;
    readonly name: string;
    readonly description: string;
    readonly riskProfile: 'low' | 'medium' | 'high';
    readonly timeline: number;
    readonly expectedROI: number;
    readonly recommendations: FlowOptimizationRecommendation[];
}
interface ImplementationRoadmap {
    readonly roadmapId: string;
    readonly totalDuration: number;
    readonly phases: RoadmapPhase[];
    readonly dependencies: string[];
    readonly criticalPath: string[];
    readonly riskMitigation: string[];
}
interface RoadmapPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly duration: number;
    readonly recommendations: FlowOptimizationRecommendation[];
}
interface ExpectedOutcome {
    readonly outcomeId: string;
    readonly description: string;
    readonly category: string;
    readonly probability: number;
    readonly impact: 'low' | 'medium' | 'high';
    readonly timeframe: number;
    readonly metrics: PredictedMetric[];
}
interface PredictedMetric {
    readonly metricName: string;
    readonly currentValue: number;
    readonly predictedValue: number;
    readonly improvement: number;
    readonly confidence: number;
}
interface RiskAssessment {
    readonly assessmentId: string;
    readonly overallRisk: 'low' | 'medium' | 'high';
    readonly riskScore: number;
    readonly topRisks: Risk[];
    readonly mitigationPlan: MitigationPlan;
}
interface MitigationPlan {
    readonly planId: string;
    readonly actions: string[];
    readonly timeline: number;
    readonly owner: string;
}
export {};
//# sourceMappingURL=flow-optimization-service.d.ts.map