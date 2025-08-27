/**
 * @fileoverview Continuous Improvement Service
 *
 * Service for automated kaizen cycles and continuous improvement loops.
 * Handles improvement tracking, kaizen automation, and feedback loop management.
 *
 * SINGLE RESPONSIBILITY: Continuous improvement automation and kaizen cycles
 * FOCUSES ON: Kaizen automation, improvement tracking, feedback loops
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Continuous improvement configuration
 */
export interface ContinuousImprovementConfig {
    readonly improvementId: string;
    readonly valueStreamId: string;
    readonly kaizenConfig: KaizenConfig;
    readonly automationLevel: AutomationLevel;
    readonly feedbackLoops: FeedbackLoopConfig[];
    readonly improvementObjectives: ImprovementObjective[];
    readonly measurementFramework: MeasurementFramework;
}
/**
 * Kaizen configuration
 */
export interface KaizenConfig {
    readonly cycleLength: number;
    readonly frequency: KaizenFrequency;
    readonly participantRoles: string[];
    readonly facilitationMode: FacilitationMode;
    readonly improvementTypes: ImprovementType[];
    readonly successCriteria: KaizenSuccessCriteria[];
}
/**
 * Kaizen frequency
 */
export declare enum KaizenFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly"
}
/**
 * Facilitation mode
 */
export declare enum FacilitationMode {
    FULLY_AUTOMATED = "fully_automated",
    HUMAN_GUIDED = "human_guided",
    HYBRID = "hybrid"
}
/**
 * Improvement type
 */
export declare enum ImprovementType {
    PROCESS = "process",
    TECHNOLOGY = "technology",
    SKILLS = "skills",
    ORGANIZATION = "organization",
    CULTURE = "culture",
    MEASUREMENT = "measurement"
}
/**
 * Kaizen success criteria
 */
export interface KaizenSuccessCriteria {
    readonly criteriaId: string;
    readonly name: string;
    readonly description: string;
    readonly measurement: string;
    readonly target: number;
    readonly threshold: number;
    readonly weight: number;
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
 * Feedback loop configuration
 */
export interface FeedbackLoopConfig {
    readonly loopId: string;
    readonly name: string;
    readonly type: FeedbackLoopType;
    readonly frequency: LoopFrequency;
    readonly participants: FeedbackParticipant[];
    readonly dataSource: DataSource;
    readonly actionTriggers: ActionTrigger[];
    readonly closureConditions: ClosureCondition[];
}
/**
 * Feedback loop type
 */
export declare enum FeedbackLoopType {
    METRICS_BASED = "metrics_based",
    OBSERVATION_BASED = "observation_based",
    SURVEY_BASED = "survey_based",
    EVENT_DRIVEN = "event_driven",
    HYBRID = "hybrid"
}
/**
 * Loop frequency
 */
export declare enum LoopFrequency {
    REAL_TIME = "real_time",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
/**
 * Feedback participant
 */
export interface FeedbackParticipant {
    readonly participantId: string;
    readonly role: string;
    readonly responsibility: ParticipantResponsibility;
    readonly authority: AuthorityLevel;
    readonly availability: ParticipantAvailability;
}
/**
 * Participant responsibility
 */
export declare enum ParticipantResponsibility {
    DATA_PROVIDER = "data_provider",
    ANALYZER = "analyzer",
    DECISION_MAKER = "decision_maker",
    IMPLEMENTER = "implementer",
    VALIDATOR = "validator"
}
/**
 * Authority level
 */
export declare enum AuthorityLevel {
    OBSERVER = "observer",
    ADVISOR = "advisor",
    APPROVER = "approver",
    EXECUTOR = "executor"
}
/**
 * Participant availability
 */
export interface ParticipantAvailability {
    readonly schedule: AvailabilitySchedule[];
    readonly capacity: number;
    readonly urgencyResponse: UrgencyResponse;
}
/**
 * Availability schedule
 */
export interface AvailabilitySchedule {
    readonly dayOfWeek: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly timezone: string;
}
/**
 * Urgency response
 */
export interface UrgencyResponse {
    readonly normal: number;
    readonly high: number;
    readonly critical: number;
}
/**
 * Data source
 */
export interface DataSource {
    readonly sourceId: string;
    readonly name: string;
    readonly type: DataSourceType;
    readonly connection: DataConnection;
    readonly metrics: DataMetric[];
    readonly quality: DataQuality;
}
/**
 * Data source type
 */
export declare enum DataSourceType {
    DATABASE = "database",
    API = "api",
    FILE = "file",
    STREAM = "stream",
    MANUAL = "manual",
    SENSOR = "sensor"
}
/**
 * Data connection
 */
export interface DataConnection {
    readonly connectionString: string;
    readonly authentication: AuthenticationConfig;
    readonly refreshRate: number;
    readonly timeout: number;
}
/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
    readonly type: 'none|basic|token|oauth|certificate;;
    readonly credentials: Record<string, any>;
}
/**
 * Data metric
 */
export interface DataMetric {
    readonly metricId: string;
    readonly name: string;
    readonly query: string;
    readonly aggregation: AggregationType;
    readonly unit: string;
    readonly threshold: MetricThreshold;
}
/**
 * Aggregation type
 */
export declare enum AggregationType {
    SUM = "sum",
    AVERAGE = "average",
    COUNT = "count",
    MAX = "max",
    MIN = "min",
    MEDIAN = "median",
    PERCENTILE = "percentile"
}
/**
 * Metric threshold
 */
export interface MetricThreshold {
    readonly warning: number;
    readonly critical: number;
    readonly target: number;
    readonly acceptable: Range;
}
/**
 * Range
 */
export interface Range {
    readonly min: number;
    readonly max: number;
}
/**
 * Data quality
 */
export interface DataQuality {
    readonly completeness: number;
    readonly accuracy: number;
    readonly timeliness: number;
    readonly consistency: number;
    readonly validity: number;
}
/**
 * Action trigger
 */
export interface ActionTrigger {
    readonly triggerId: string;
    readonly condition: TriggerCondition;
    readonly action: TriggerAction;
    readonly priority: TriggerPriority;
    readonly cooldown: number;
}
/**
 * Trigger condition
 */
export interface TriggerCondition {
    readonly type: 'threshold|pattern|anomaly|change|time;;
    readonly parameters: Record<string, any>;
    readonly evaluation: ConditionEvaluation;
}
/**
 * Condition evaluation
 */
export interface ConditionEvaluation {
    readonly operator: 'gt|lt|eq|ne|between|contains;;
    readonly value: any;
    readonly duration: number;
    readonly confidence: number;
}
/**
 * Trigger action
 */
export interface TriggerAction {
    readonly actionType: ActionType;
    readonly parameters: ActionParameters;
    readonly assignee: string;
    readonly deadline: number;
}
/**
 * Action type
 */
export declare enum ActionType {
    NOTIFICATION = "notification",
    ESCALATION = "escalation",
    AUTOMATION = "automation",
    INVESTIGATION = "investigation",
    IMPROVEMENT = "improvement"
}
/**
 * Action parameters
 */
export interface ActionParameters {
    readonly [key: string]: any;
    readonly description?: string;
    readonly urgency?: 'low|medium|high|critical;;
    readonly category?: string;
}
/**
 * Trigger priority
 */
export declare enum TriggerPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Closure condition
 */
export interface ClosureCondition {
    readonly conditionId: string;
    readonly description: string;
    readonly criteria: ClosureCriteria;
    readonly validation: ValidationMethod;
    readonly approval: ApprovalRequirement;
}
/**
 * Closure criteria
 */
export interface ClosureCriteria {
    readonly type: 'metric|time|approval|combination;;
    readonly requirements: CriteriaRequirement[];
    readonly operator: 'and|or;;
}
/**
 * Criteria requirement
 */
export interface CriteriaRequirement {
    readonly requirementId: string;
    readonly description: string;
    readonly measurement: string;
    readonly target: number;
    readonly tolerance: number;
}
/**
 * Validation method
 */
export interface ValidationMethod {
    readonly method: 'automated' | 'manual' | 'hybrid';
    readonly validator: string;
    readonly evidence: EvidenceRequirement[];
}
/**
 * Evidence requirement
 */
export interface EvidenceRequirement {
    readonly evidenceType: 'data|document|observation|test;;
    readonly description: string;
    readonly required: boolean;
}
/**
 * Approval requirement
 */
export interface ApprovalRequirement {
    readonly required: boolean;
    readonly approvers: string[];
    readonly threshold: 'any' | 'majority' | 'all';
    readonly timeout: number;
}
/**
 * Improvement objective
 */
export interface ImprovementObjective {
    readonly objectiveId: string;
    readonly name: string;
    readonly description: string;
    readonly category: ObjectiveCategory;
    readonly currentState: ObjectiveState;
    readonly targetState: ObjectiveState;
    readonly timeline: ObjectiveTimeline;
    readonly dependencies: string[];
}
/**
 * Objective category
 */
export declare enum ObjectiveCategory {
    EFFICIENCY = "efficiency",
    QUALITY = "quality",
    SPEED = "speed",
    COST = "cost",
    SATISFACTION = "satisfaction",
    INNOVATION = "innovation"
}
/**
 * Objective state
 */
export interface ObjectiveState {
    readonly metrics: StateMetric[];
    readonly description: string;
    readonly evidence: string[];
    readonly timestamp: Date;
}
/**
 * State metric
 */
export interface StateMetric {
    readonly metricName: string;
    readonly value: number;
    readonly unit: string;
    readonly measurement: string;
    readonly confidence: number;
}
/**
 * Objective timeline
 */
export interface ObjectiveTimeline {
    readonly startDate: Date;
    readonly targetDate: Date;
    readonly milestones: ObjectiveMilestone[];
    readonly checkpoints: Checkpoint[];
}
/**
 * Objective milestone
 */
export interface ObjectiveMilestone {
    readonly milestoneId: string;
    readonly name: string;
    readonly date: Date;
    readonly deliverables: string[];
    readonly criteria: string[];
}
/**
 * Checkpoint
 */
export interface Checkpoint {
    readonly checkpointId: string;
    readonly date: Date;
    readonly purpose: CheckpointPurpose;
    readonly participants: string[];
    readonly agenda: string[];
}
/**
 * Checkpoint purpose
 */
export declare enum CheckpointPurpose {
    PROGRESS_REVIEW = "progress_review",
    COURSE_CORRECTION = "course_correction",
    STAKEHOLDER_UPDATE = "stakeholder_update",
    RISK_ASSESSMENT = "risk_assessment"
}
/**
 * Measurement framework
 */
export interface MeasurementFramework {
    readonly frameworkId: string;
    readonly name: string;
    readonly approach: MeasurementApproach;
    readonly kpis: KPI[];
    readonly reporting: ReportingConfig;
    readonly governance: MeasurementGovernance;
}
/**
 * Measurement approach
 */
export declare enum MeasurementApproach {
    OKR = "okr",
    BALANCED_SCORECARD = "balanced_scorecard",
    LEAN_METRICS = "lean_metrics",
    CUSTOM = "custom"
}
/**
 * KPI
 */
export interface KPI {
    readonly kpiId: string;
    readonly name: string;
    readonly definition: string;
    readonly calculation: string;
    readonly target: number;
    readonly frequency: MeasurementFrequency;
    readonly ownership: KPIOwnership;
}
/**
 * Measurement frequency
 */
export declare enum MeasurementFrequency {
    REAL_TIME = "real_time",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly"
}
/**
 * KPI ownership
 */
export interface KPIOwnership {
    readonly owner: string;
    readonly accountable: string[];
    readonly responsible: string[];
    readonly consulted: string[];
    readonly informed: string[];
}
/**
 * Reporting configuration
 */
export interface ReportingConfig {
    readonly frequency: ReportingFrequency;
    readonly format: ReportFormat[];
    readonly audience: ReportingAudience[];
    readonly distribution: DistributionChannel[];
}
/**
 * Reporting frequency
 */
export declare enum ReportingFrequency {
    REAL_TIME = "real_time",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUALLY = "annually"
}
/**
 * Report format
 */
export declare enum ReportFormat {
    DASHBOARD = "dashboard",
    EMAIL = "email",
    PDF = "pdf",
    PRESENTATION = "presentation",
    API = "api"
}
/**
 * Reporting audience
 */
export interface ReportingAudience {
    readonly audienceId: string;
    readonly name: string;
    readonly role: string;
    readonly informationNeeds: InformationNeed[];
    readonly preferences: AudiencePreferences;
}
/**
 * Information need
 */
export interface InformationNeed {
    readonly needId: string;
    readonly category: 'strategic' | 'tactical' | 'operational';
    readonly description: string;
    readonly urgency: 'low' | 'medium' | 'high';
    readonly frequency: string;
}
/**
 * Audience preferences
 */
export interface AudiencePreferences {
    readonly format: ReportFormat[];
    readonly frequency: ReportingFrequency;
    readonly detail: 'summary' | 'detailed' | 'comprehensive';
    readonly delivery: DeliveryMethod[];
}
/**
 * Delivery method
 */
export declare enum DeliveryMethod {
    EMAIL = "email",
    SLACK = "slack",
    TEAMS = "teams",
    DASHBOARD = "dashboard",
    API = "api"
}
/**
 * Distribution channel
 */
export interface DistributionChannel {
    readonly channelId: string;
    readonly type: DeliveryMethod;
    readonly configuration: ChannelConfiguration;
    readonly schedule: DistributionSchedule;
}
/**
 * Channel configuration
 */
export interface ChannelConfiguration {
    readonly endpoint: string;
    readonly authentication: AuthenticationConfig;
    readonly formatting: FormattingOptions;
}
/**
 * Formatting options
 */
export interface FormattingOptions {
    readonly template: string;
    readonly styling: Record<string, any>;
    readonly customizations: Record<string, any>;
}
/**
 * Distribution schedule
 */
export interface DistributionSchedule {
    readonly frequency: ReportingFrequency;
    readonly timeOfDay: string;
    readonly timezone: string;
    readonly exceptions: ScheduleException[];
}
/**
 * Schedule exception
 */
export interface ScheduleException {
    readonly exceptionId: string;
    readonly date: Date;
    readonly reason: string;
    readonly alternative: string;
}
/**
 * Measurement governance
 */
export interface MeasurementGovernance {
    readonly reviewCycle: number;
    readonly approvalProcess: ApprovalProcess;
    readonly changeControl: ChangeControl;
    readonly qualityAssurance: QualityAssurance;
}
/**
 * Approval process
 */
export interface ApprovalProcess {
    readonly steps: ApprovalStep[];
    readonly escalation: EscalationRule[];
    readonly timeout: number;
}
/**
 * Approval step
 */
export interface ApprovalStep {
    readonly stepId: string;
    readonly name: string;
    readonly approvers: string[];
    readonly criteria: string[];
    readonly timeout: number;
}
/**
 * Escalation rule
 */
export interface EscalationRule {
    readonly ruleId: string;
    readonly trigger: string;
    readonly escalateTo: string[];
    readonly timeout: number;
}
/**
 * Change control
 */
export interface ChangeControl {
    readonly process: ChangeProcess;
    readonly documentation: DocumentationRequirement[];
    readonly approval: ApprovalRequirement;
}
/**
 * Change process
 */
export declare enum ChangeProcess {
    LIGHTWEIGHT = "lightweight",
    STANDARD = "standard",
    COMPREHENSIVE = "comprehensive"
}
/**
 * Documentation requirement
 */
export interface DocumentationRequirement {
    readonly documentType: string;
    readonly template: string;
    readonly required: boolean;
    readonly approval: boolean;
}
/**
 * Quality assurance
 */
export interface QualityAssurance {
    readonly validation: ValidationRule[];
    readonly testing: TestingRequirement[];
    readonly monitoring: MonitoringRequirement[];
}
/**
 * Validation rule
 */
export interface ValidationRule {
    readonly ruleId: string;
    readonly description: string;
    readonly condition: string;
    readonly severity: 'warning|error;;
    readonly action: string;
}
/**
 * Testing requirement
 */
export interface TestingRequirement {
    readonly testType: string;
    readonly frequency: string;
    readonly coverage: number;
    readonly automation: boolean;
}
/**
 * Monitoring requirement
 */
export interface MonitoringRequirement {
    readonly metric: string;
    readonly threshold: MetricThreshold;
    readonly alerting: AlertingConfig;
    readonly frequency: MeasurementFrequency;
}
/**
 * Alerting configuration
 */
export interface AlertingConfig {
    readonly enabled: boolean;
    readonly channels: string[];
    readonly severity: 'info|warning|error|critical;;
    readonly escalation: EscalationRule[];
}
/**
 * Automated kaizen cycle result
 */
export interface AutomatedKaizenCycle {
    readonly cycleId: string;
    readonly valueStreamId: string;
    readonly timestamp: Date;
    readonly cycleNumber: number;
    readonly participantsCount: number;
    readonly improvementsIdentified: ImprovementItem[];
    readonly improvementsImplemented: ImprovementImplementation[];
    readonly cycleMetrics: CycleMetrics;
    readonly nextCycleDate: Date;
    readonly learnings: CycleLearning[];
}
/**
 * Improvement item
 */
export interface ImprovementItem {
    readonly itemId: string;
    readonly title: string;
    readonly description: string;
    readonly category: ImprovementCategory;
    readonly priority: ImprovementPriority;
    readonly effort: EstimatedEffort;
    readonly impact: EstimatedImpact;
    readonly feasibility: FeasibilityAssessment;
    readonly proposedBy: string;
    readonly supportLevel: number;
}
/**
 * Improvement category
 */
export declare enum ImprovementCategory {
    WASTE_ELIMINATION = "waste_elimination",
    PROCESS_STREAMLINING = "process_streamlining",
    AUTOMATION = "automation",
    SKILL_DEVELOPMENT = "skill_development",
    QUALITY_IMPROVEMENT = "quality_improvement",
    COMMUNICATION = "communication"
}
/**
 * Improvement priority
 */
export declare enum ImprovementPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Estimated effort
 */
export interface EstimatedEffort {
    readonly timeHours: number;
    readonly resources: ResourceRequirement[];
    readonly complexity: EffortComplexity;
    readonly dependencies: string[];
}
/**
 * Resource requirement
 */
export interface ResourceRequirement {
    readonly resourceType: 'people|technology|budget|time;;
    readonly quantity: number;
    readonly duration: number;
    readonly skills: string[];
}
/**
 * Effort complexity
 */
export declare enum EffortComplexity {
    SIMPLE = "simple",
    MODERATE = "moderate",
    COMPLEX = "complex",
    VERY_COMPLEX = "very_complex"
}
/**
 * Estimated impact
 */
export interface EstimatedImpact {
    readonly cycleTimeReduction: number;
    readonly qualityImprovement: number;
    readonly costSavings: number;
    readonly satisfactionIncrease: number;
    readonly confidence: number;
}
/**
 * Feasibility assessment
 */
export interface FeasibilityAssessment {
    readonly technical: FeasibilityLevel;
    readonly organizational: FeasibilityLevel;
    readonly financial: FeasibilityLevel;
    readonly timeline: FeasibilityLevel;
    readonly overall: FeasibilityLevel;
    readonly constraints: string[];
}
/**
 * Feasibility level
 */
export declare enum FeasibilityLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    BLOCKED = "blocked"
}
/**
 * Improvement implementation
 */
export interface ImprovementImplementation {
    readonly implementationId: string;
    readonly improvementId: string;
    readonly status: ImplementationStatus;
    readonly progress: number;
    readonly startDate: Date;
    readonly completionDate?: Date;
    readonly actualEffort: ActualEffort;
    readonly actualImpact: ActualImpact;
    readonly lessons: string[];
}
/**
 * Implementation status
 */
export declare enum ImplementationStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ON_HOLD = "on_hold",
    CANCELLED = "cancelled"
}
/**
 * Actual effort
 */
export interface ActualEffort {
    readonly timeHours: number;
    readonly resourcesUsed: ResourceUsage[];
    readonly complexityEncountered: EffortComplexity;
    readonly blockers: Blocker[];
}
/**
 * Resource usage
 */
export interface ResourceUsage {
    readonly resourceType: string;
    readonly quantity: number;
    readonly duration: number;
    readonly cost: number;
}
/**
 * Blocker
 */
export interface Blocker {
    readonly blockerId: string;
    readonly description: string;
    readonly category: BlockerCategory;
    readonly severity: BlockerSeverity;
    readonly resolution: string;
    readonly resolutionTime: number;
}
/**
 * Blocker category
 */
export declare enum BlockerCategory {
    TECHNICAL = "technical",
    ORGANIZATIONAL = "organizational",
    RESOURCE = "resource",
    DEPENDENCY = "dependency",
    POLICY = "policy"
}
/**
 * Blocker severity
 */
export declare enum BlockerSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    CRITICAL = "critical"
}
/**
 * Actual impact
 */
export interface ActualImpact {
    readonly measuredImprovements: MeasuredImprovement[];
    readonly unexpectedBenefits: string[];
    readonly unintendedConsequences: string[];
    readonly satisfaction: SatisfactionMeasurement;
}
/**
 * Measured improvement
 */
export interface MeasuredImprovement {
    readonly metric: string;
    readonly before: number;
    readonly after: number;
    readonly improvement: number;
    readonly confidence: number;
}
/**
 * Satisfaction measurement
 */
export interface SatisfactionMeasurement {
    readonly participants: number;
    readonly averageScore: number;
    readonly feedback: string[];
    readonly recommendations: string[];
}
/**
 * Cycle metrics
 */
export interface CycleMetrics {
    readonly participationRate: number;
    readonly improvementRate: number;
    readonly cycleTime: number;
    readonly satisfaction: number;
    readonly roi: number;
    readonly learningIndex: number;
}
/**
 * Cycle learning
 */
export interface CycleLearning {
    readonly learningId: string;
    readonly category: LearningCategory;
    readonly description: string;
    readonly application: string;
    readonly confidence: number;
    readonly source: string;
}
/**
 * Learning category
 */
export declare enum LearningCategory {
    PROCESS = "process",
    FACILITATION = "facilitation",
    ENGAGEMENT = "engagement",
    MEASUREMENT = "measurement",
    IMPLEMENTATION = "implementation"
}
/**
 * Continuous Improvement Service
 */
export declare class ContinuousImprovementService {
    constructor(logger: Logger);
    /**
     * Execute automated kaizen cycle
     */
    executeAutomatedKaizenCycle(_config: ContinuousImprovementConfig, _currentMetrics: any): Promise<AutomatedKaizenCycle>;
}
//# sourceMappingURL=continuous-improvement-service.d.ts.map