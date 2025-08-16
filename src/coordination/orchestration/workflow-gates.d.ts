/**
 * @file Workflow Gates System - Phase 1, Task 2.1
 *
 * Define workflow gate types and triggers for human-in-the-loop orchestration.
 * Provides comprehensive gate management with persistence, state tracking, and metrics.
 *
 * MPLEMENTATION:
 * - Strategic, Architectural, Quality, Business, and Ethical gates
 * - Event-driven gate triggers with condition evaluation
 * - Gate persistence and state management with SQLite backend
 * - Pending gates queue with priority handling
 * - Gate resolution tracking and comprehensive metrics
 * - Integration with existing WorkflowGateRequest system
 * - Memory-efficient single-focused implementation
 */
import { EventEmitter } from 'events';
import { type TypeSafeEventBus } from '../../core/type-safe-event-system';
import type { WorkflowContext as BaseWorkflowContext } from '../../workflows/types';
import { GateEscalationLevel, type WorkflowGateRequest } from '../workflows/workflow-gate-request';
/**
 * Workflow Human Gate interface defining all gate types and their triggers
 */
export interface WorkflowHumanGate {
    /** Unique gate identifier */
    readonly id: string;
    /** Gate type categorization */
    readonly type: WorkflowHumanGateType;
    /** Gate subtype for specific categorization */
    readonly subtype: string;
    /** Human-readable gate title */
    readonly title: string;
    /** Detailed gate description */
    readonly description: string;
    /** Current gate status */
    status: WorkflowHumanGateStatus;
    /** Gate creation timestamp */
    readonly createdAt: Date;
    /** Gate update timestamp */
    updatedAt: Date;
    /** Workflow context this gate belongs to */
    readonly workflowContext: WorkflowGateContext;
    /** Gate-specific data and parameters */
    readonly gateData: WorkflowGateData;
    /** Trigger conditions for this gate */
    readonly triggers: GateTrigger[];
    /** Priority level for gate processing */
    readonly priority: WorkflowGatePriority;
    /** Required approvals and stakeholders */
    readonly approvalConfig: GateApprovalConfig;
    /** Timeout configuration */
    readonly timeoutConfig?: GateTimeoutConfig;
    /** Resolution data once gate is resolved */
    resolution?: GateResolution;
    /** Metrics and tracking data */
    metrics: GateMetrics;
    /** Associated WorkflowGateRequest for AGUI integration */
    workflowGateRequest?: WorkflowGateRequest;
}
/**
 * Workflow Human Gate Types - Five main categories
 */
export declare enum WorkflowHumanGateType {
    STRATEGIC = "strategic",// PRD approval, investment decisions
    ARCHITECTURAL = "architectural",// System design, tech choices
    QUALITY = "quality",// Security, performance, code review
    BUSINESS = "business",// Feature validation, metrics review
    ETHICAL = "ethical"
}
/**
 * Gate status enumeration
 */
export declare enum WorkflowHumanGateStatus {
    PENDING = "pending",
    TRIGGERED = "triggered",
    IN_REVIEW = "in_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    ESCALATED = "escalated"
}
/**
 * Gate priority levels
 */
export declare enum WorkflowGatePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
/**
 * Extended workflow context for gates
 */
export interface WorkflowGateContext extends BaseWorkflowContext {
    /** Gate-specific workflow ID */
    readonly gateWorkflowId: string;
    /** Phase or step name within workflow */
    readonly phaseName: string;
    /** Business domain affected */
    readonly businessDomain: string;
    /** Technical domain affected */
    readonly technicalDomain: string;
    /** Affected stakeholder groups */
    readonly stakeholderGroups: string[];
    /** Impact assessment data */
    readonly impactAssessment: ImpactAssessment;
    /** Historical context */
    readonly historicalContext?: HistoricalContext;
}
/**
 * Impact assessment for gate decisions
 */
export interface ImpactAssessment {
    /** Business impact score (0-1) */
    readonly businessImpact: number;
    /** Technical impact score (0-1) */
    readonly technicalImpact: number;
    /** Risk impact score (0-1) */
    readonly riskImpact: number;
    /** Resource impact (cost, time) */
    readonly resourceImpact: ResourceImpact;
    /** Compliance impact assessment */
    readonly complianceImpact: ComplianceImpact;
    /** User experience impact */
    readonly userExperienceImpact: number;
}
/**
 * Resource impact details
 */
export interface ResourceImpact {
    /** Estimated time impact in hours */
    readonly timeHours: number;
    /** Estimated cost impact */
    readonly costImpact: number;
    /** Required team size */
    readonly teamSize: number;
    /** Resource criticality */
    readonly criticality: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Compliance impact assessment
 */
export interface ComplianceImpact {
    /** Regulatory requirements affected */
    readonly regulations: string[];
    /** Compliance risk level */
    readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
    /** Required compliance reviews */
    readonly requiredReviews: string[];
    /** Compliance deadlines */
    readonly deadlines: Date[];
}
/**
 * Historical context for decision making
 */
export interface HistoricalContext {
    /** Previous similar decisions */
    readonly previousDecisions: PreviousDecision[];
    /** Success patterns */
    readonly successPatterns: string[];
    /** Failure patterns */
    readonly failurePatterns: string[];
    /** Lessons learned */
    readonly lessonsLearned: string[];
}
/**
 * Previous decision record
 */
export interface PreviousDecision {
    /** Decision timestamp */
    readonly timestamp: Date;
    /** Decision context */
    readonly context: string;
    /** Decision outcome */
    readonly outcome: 'success' | 'failure' | 'partial';
    /** Impact realized */
    readonly impactRealized: number;
    /** Lessons from this decision */
    readonly lessons: string[];
}
/**
 * Gate-specific data container
 */
export interface WorkflowGateData {
    /** Raw data payload */
    readonly payload: Record<string, unknown>;
    /** Structured data for gate type */
    readonly structured: StructuredGateData;
    /** Attachments and references */
    readonly attachments: GateAttachment[];
    /** External references */
    readonly externalReferences: ExternalReference[];
}
/**
 * Structured data based on gate type
 */
export type StructuredGateData = StrategicGateData | ArchitecturalGateData | QualityGateData | BusinessGateData | EthicalGateData;
/**
 * Strategic gate data structure
 */
export interface StrategicGateData {
    readonly type: 'strategic';
    readonly prdData?: PRDData;
    readonly investmentData?: InvestmentData;
    readonly strategyData?: StrategyData;
}
/**
 * PRD-specific data
 */
export interface PRDData {
    readonly prdId: string;
    readonly title: string;
    readonly businessObjectives: string[];
    readonly userStories: string[];
    readonly acceptanceCriteria: string[];
    readonly estimatedEffort: number;
    readonly riskFactors: string[];
}
/**
 * Investment decision data
 */
export interface InvestmentData {
    readonly investmentAmount: number;
    readonly expectedRoi: number;
    readonly timeframe: number;
    readonly riskAssessment: string[];
    readonly alternatives: string[];
}
/**
 * Strategy data
 */
export interface StrategyData {
    readonly strategicGoals: string[];
    readonly keyMetrics: string[];
    readonly timeline: string;
    readonly dependencies: string[];
}
/**
 * Architectural gate data structure
 */
export interface ArchitecturalGateData {
    readonly type: 'architectural';
    readonly systemDesign?: SystemDesignData;
    readonly techChoice?: TechChoiceData;
    readonly integrationData?: IntegrationData;
}
/**
 * System design data
 */
export interface SystemDesignData {
    readonly designDocument: string;
    readonly components: string[];
    readonly integrationPoints: string[];
    readonly scalabilityConsiderations: string[];
    readonly securityConsiderations: string[];
}
/**
 * Technology choice data
 */
export interface TechChoiceData {
    readonly technology: string;
    readonly alternatives: string[];
    readonly rationale: string[];
    readonly tradeoffs: string[];
    readonly migrationPlan?: string;
}
/**
 * Integration data
 */
export interface IntegrationData {
    readonly systems: string[];
    readonly protocols: string[];
    readonly dataFlows: string[];
    readonly securityRequirements: string[];
}
/**
 * Quality gate data structure
 */
export interface QualityGateData {
    readonly type: 'quality';
    readonly securityData?: SecurityData;
    readonly performanceData?: PerformanceData;
    readonly codeReviewData?: CodeReviewData;
}
/**
 * Security review data
 */
export interface SecurityData {
    readonly vulnerabilities: SecurityVulnerability[];
    readonly complianceChecks: string[];
    readonly threatModel: string[];
    readonly mitigationStrategies: string[];
}
/**
 * Security vulnerability
 */
export interface SecurityVulnerability {
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly impact: string;
    readonly mitigation: string;
    readonly status: 'open' | 'fixed' | 'acknowledged';
}
/**
 * Performance data
 */
export interface PerformanceData {
    readonly metrics: PerformanceMetric[];
    readonly benchmarks: string[];
    readonly bottlenecks: string[];
    readonly optimizations: string[];
}
/**
 * Performance metric
 */
export interface PerformanceMetric {
    readonly name: string;
    readonly current: number;
    readonly target: number;
    readonly unit: string;
    readonly trend: 'improving' | 'stable' | 'degrading';
}
/**
 * Code review data
 */
export interface CodeReviewData {
    readonly pullRequests: string[];
    readonly codeQualityScore: number;
    readonly testCoverage: number;
    readonly issues: CodeIssue[];
}
/**
 * Code issue
 */
export interface CodeIssue {
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly type: string;
    readonly description: string;
    readonly location: string;
    readonly status: 'open' | 'fixed' | 'deferred';
}
/**
 * Business gate data structure
 */
export interface BusinessGateData {
    readonly type: 'business';
    readonly featureData?: FeatureValidationData;
    readonly metricsData?: MetricsReviewData;
    readonly marketData?: MarketAnalysisData;
}
/**
 * Feature validation data
 */
export interface FeatureValidationData {
    readonly featureId: string;
    readonly userFeedback: UserFeedback[];
    readonly usageMetrics: UsageMetric[];
    readonly businessValue: number;
    readonly competitorAnalysis: string[];
}
/**
 * User feedback
 */
export interface UserFeedback {
    readonly userId: string;
    readonly rating: number;
    readonly feedback: string;
    readonly timestamp: Date;
    readonly category: string;
}
/**
 * Usage metric
 */
export interface UsageMetric {
    readonly name: string;
    readonly value: number;
    readonly unit: string;
    readonly period: string;
    readonly trend: 'up' | 'down' | 'stable';
}
/**
 * Metrics review data
 */
export interface MetricsReviewData {
    readonly kpis: KPI[];
    readonly dashboards: string[];
    readonly alerts: string[];
    readonly insights: string[];
}
/**
 * Key Performance Indicator
 */
export interface KPI {
    readonly name: string;
    readonly current: number;
    readonly target: number;
    readonly unit: string;
    readonly status: 'on_track' | 'at_risk' | 'behind';
}
/**
 * Market analysis data
 */
export interface MarketAnalysisData {
    readonly marketSize: number;
    readonly competitors: string[];
    readonly opportunities: string[];
    readonly threats: string[];
    readonly positioning: string;
}
/**
 * Ethical gate data structure
 */
export interface EthicalGateData {
    readonly type: 'ethical';
    readonly aiBehaviorData?: AIBehaviorData;
    readonly dataUsageData?: DataUsageData;
    readonly biasAssessment?: BiasAssessmentData;
}
/**
 * AI behavior data
 */
export interface AIBehaviorData {
    readonly modelVersion: string;
    readonly behaviorTests: BehaviorTest[];
    readonly ethicalGuidelines: string[];
    readonly safetyMeasures: string[];
}
/**
 * Behavior test
 */
export interface BehaviorTest {
    readonly testName: string;
    readonly result: 'pass' | 'fail' | 'warning';
    readonly description: string;
    readonly recommendation: string;
}
/**
 * Data usage data
 */
export interface DataUsageData {
    readonly dataTypes: string[];
    readonly privacyCompliance: string[];
    readonly consentRequirements: string[];
    readonly retentionPolicies: string[];
}
/**
 * Bias assessment data
 */
export interface BiasAssessmentData {
    readonly biasTests: BiasTest[];
    readonly fairnessMetrics: FairnessMetric[];
    readonly mitigationStrategies: string[];
}
/**
 * Bias test
 */
export interface BiasTest {
    readonly testName: string;
    readonly biasScore: number;
    readonly threshold: number;
    readonly status: 'pass' | 'fail' | 'warning';
    readonly details: string;
}
/**
 * Fairness metric
 */
export interface FairnessMetric {
    readonly name: string;
    readonly score: number;
    readonly benchmark: number;
    readonly groups: string[];
    readonly status: 'fair' | 'biased' | 'unknown';
}
/**
 * Gate attachment
 */
export interface GateAttachment {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly url: string;
    readonly size: number;
    readonly checksum: string;
}
/**
 * External reference
 */
export interface ExternalReference {
    readonly type: 'document' | 'ticket' | 'pr' | 'issue' | 'wiki' | 'url';
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly description?: string;
}
/**
 * Gate trigger configuration
 */
export interface GateTrigger {
    /** Unique trigger identifier */
    readonly id: string;
    /** Event that triggers this gate */
    readonly event: GateTriggerEvent;
    /** Condition evaluation function */
    readonly condition: (context: WorkflowGateContext) => Promise<boolean> | boolean;
    /** Urgency level for triggered gate */
    readonly urgency: GateTriggerUrgency;
    /** Optional delay before triggering */
    readonly delay?: number;
    /** Whether trigger can be triggered multiple times */
    readonly repeatable?: boolean;
    /** Trigger metadata */
    readonly metadata: TriggerMetadata;
}
/**
 * Gate trigger events - Workflow phase completion events
 */
export type GateTriggerEvent = 'prd-generated' | 'epic-created' | 'feature-designed' | 'sparc-phase-complete' | 'architecture-defined' | 'security-scan-complete' | 'performance-test-complete' | 'code-review-requested' | 'user-feedback-received' | 'metrics-threshold-reached' | 'compliance-check-required' | 'ethical-review-triggered' | 'investment-decision-required' | 'release-candidate-ready' | 'incident-detected' | 'custom-event';
/**
 * Gate trigger urgency levels
 */
export declare enum GateTriggerUrgency {
    MMEDIATE = "immediate",// Trigger immediately
    WITHIN_HOUR = "within-hour",// Trigger within 1 hour
    WITHIN_DAY = "within-day",// Trigger within 24 hours
    NEXT_REVIEW = "next-review"
}
/**
 * Trigger metadata
 */
export interface TriggerMetadata {
    /** Trigger name */
    readonly name: string;
    /** Trigger description */
    readonly description: string;
    /** Associated workflow phases */
    readonly phases: string[];
    /** Required stakeholders */
    readonly stakeholders: string[];
    /** Trigger category */
    readonly category: string;
    /** Custom properties */
    readonly properties: Record<string, unknown>;
}
/**
 * Gate approval configuration
 */
export interface GateApprovalConfig {
    /** Required approvers */
    readonly approvers: string[];
    /** Required approvals count */
    readonly requiredApprovals: number;
    /** Approval timeout */
    readonly approvalTimeout?: number;
    /** Escalation chain */
    readonly escalationChain?: GateEscalationLevel[];
    /** Auto-approval conditions */
    readonly autoApprovalConditions?: AutoApprovalCondition[];
}
/**
 * Auto-approval condition
 */
export interface AutoApprovalCondition {
    readonly field: string;
    readonly operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    readonly value: unknown;
    readonly description: string;
}
/**
 * Gate timeout configuration
 */
export interface GateTimeoutConfig {
    /** Initial timeout in milliseconds */
    readonly initialTimeout: number;
    /** Warning timeout in milliseconds */
    readonly warningTimeout?: number;
    /** Action on timeout */
    readonly onTimeout: 'escalate' | 'auto_approve' | 'auto_reject' | 'extend';
    /** Timeout extensions allowed */
    readonly maxExtensions?: number;
}
/**
 * Gate resolution data
 */
export interface GateResolution {
    /** Resolution timestamp */
    readonly resolvedAt: Date;
    /** Resolution decision */
    readonly decision: 'approved' | 'rejected' | 'deferred';
    /** Who resolved the gate */
    readonly resolvedBy: string;
    /** Resolution rationale */
    readonly rationale?: string;
    /** Resolution data */
    readonly data?: Record<string, unknown>;
    /** Follow-up actions */
    readonly followUpActions?: string[];
    /** Impact of resolution */
    readonly impactAssessment?: ResolvedImpactAssessment;
}
/**
 * Resolved impact assessment
 */
export interface ResolvedImpactAssessment {
    /** Actual time taken */
    readonly actualTime: number;
    /** Actual cost */
    readonly actualCost: number;
    /** Quality impact */
    readonly qualityImpact: number;
    /** Business value delivered */
    readonly businessValue: number;
    /** Lessons learned */
    readonly lessonsLearned: string[];
}
/**
 * Gate metrics tracking
 */
export interface GateMetrics {
    /** Gate creation time */
    readonly createdAt: Date;
    /** Time to first trigger */
    timeToTrigger?: number;
    /** Time to resolution */
    timeToResolution?: number;
    /** Number of escalations */
    escalationCount: number;
    /** Number of modifications */
    modificationCount: number;
    /** Stakeholder interactions */
    readonly stakeholderInteractions: StakeholderInteraction[];
    /** Gate effectiveness score */
    effectivenessScore?: number;
    /** Performance metrics */
    readonly performance: GatePerformanceMetrics;
    /** Quality metrics */
    readonly quality: GateQualityMetrics;
}
/**
 * Stakeholder interaction tracking
 */
export interface StakeholderInteraction {
    readonly stakeholder: string;
    readonly action: 'viewed' | 'commented' | 'approved' | 'rejected' | 'escalated';
    readonly timestamp: Date;
    readonly duration?: number;
    readonly data?: Record<string, unknown>;
}
/**
 * Gate performance metrics
 */
export interface GatePerformanceMetrics {
    /** Average processing time */
    readonly avgProcessingTime: number;
    /** Success rate */
    readonly successRate: number;
    /** Escalation rate */
    readonly escalationRate: number;
    /** Timeout rate */
    readonly timeoutRate: number;
    /** Resource utilization */
    readonly resourceUtilization: number;
}
/**
 * Gate quality metrics
 */
export interface GateQualityMetrics {
    /** Decision accuracy */
    readonly decisionAccuracy: number;
    /** Stakeholder satisfaction */
    readonly stakeholderSatisfaction: number;
    /** Process efficiency */
    readonly processEfficiency: number;
    /** Outcome quality */
    readonly outcomeQuality: number;
    /** Compliance score */
    readonly complianceScore: number;
}
/**
 * Gate persistence manager with SQLite backend
 */
export declare class GatePersistenceManager {
    private readonly logger;
    private db;
    private readonly dbPath;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    private createTables;
    saveGate(gate: WorkflowHumanGate): Promise<void>;
    getGate(gateId: string): Promise<WorkflowHumanGate | null>;
    getGatesByStatus(status: WorkflowHumanGateStatus[]): Promise<WorkflowHumanGate[]>;
    getGatesByType(type: WorkflowHumanGateType): Promise<WorkflowHumanGate[]>;
    updateGateStatus(gateId: string, status: WorkflowHumanGateStatus, resolution?: GateResolution): Promise<void>;
    addToQueue(gateId: string, priority: number, urgency: GateTriggerUrgency, scheduledAt: Date): Promise<void>;
    getQueuedGates(limit?: number): Promise<Array<{
        gate: WorkflowHumanGate;
        queueItem: unknown;
    }>>;
    markQueueItemProcessed(queueItemId: number): Promise<void>;
    addHistoryEntry(gateId: string, action: string, actor: string, data?: unknown): Promise<void>;
    getGateHistory(gateId: string): Promise<any[]>;
    getMetrics(timeRange?: {
        from: Date;
        to: Date;
    }): Promise<GatePersistenceMetrics>;
    private deserializeGate;
    shutdown(): Promise<void>;
}
/**
 * Gate persistence metrics
 */
export interface GatePersistenceMetrics {
    readonly totalGates: number;
    readonly gatesByStatus: Record<string, number>;
    readonly gatesByType: Record<string, number>;
    readonly averageResolutionTime: number;
    readonly timeRange: {
        from: Date;
        to: Date;
    } | null;
}
/**
 * **Workflow Gates Manager** - High-performance orchestration system for human-in-the-loop workflow gates.
 *
 * This class provides enterprise-grade workflow gate management with direct SQLite persistence
 * for optimal performance in critical decision-making workflows. It orchestrates the complete
 * lifecycle of workflow gates including creation, persistence, evaluation, and resolution tracking.
 *
 * **Performance Architecture**: Uses direct SQLite access (bypassing DAO layer) for
 * performance-critical workflow state management and gate persistence operations.
 *
 * **Key Capabilities:**
 * - **Gate Lifecycle Management**: Complete CRUD operations for workflow gates
 * - **Event-Driven Triggers**: Automatic gate creation based on workflow events
 * - **Priority Queue Processing**: Intelligent gate prioritization and processing
 * - **Persistence & Recovery**: SQLite-backed gate state with automatic recovery
 * - **Real-time Monitoring**: Comprehensive metrics and gate analytics
 * - **Escalation Management**: Automatic escalation based on timeout and criticality
 *
 * **Database Architecture**:
 * - Direct SQLite usage for maximum performance (legitimate bypass of DAO layer)
 * - WAL mode for concurrent read access during gate evaluation
 * - Optimized schemas for fast gate lookup and status queries
 * - Transaction support for atomic gate state changes
 *
 * **Thread Safety**: This class is thread-safe for concurrent gate operations
 * using SQLite's built-in concurrency mechanisms and proper transaction handling.
 *
 * @example Basic Gate Management
 * ```typescript
 * const gateManager = new WorkflowGatesManager(eventBus, {
 *   persistence: { dbPath: './workflow-gates.db' },
 *   processing: { batchSize: 10, intervalMs: 1000 }
 * });
 *
 * await gateManager.initialize();
 *
 * // Gates are automatically created based on events
 * eventBus.emit('task-completed', { taskId: 'task123', requiresReview: true });
 *
 * // Monitor pending gates
 * const pendingGates = await gateManager.getPendingGates();
 * console.log(`${pendingGates.length} gates require attention`);
 * ```
 *
 * @example Advanced Gate Resolution
 * ```typescript
 * // Resolve gates with detailed tracking
 * const resolvedGate = await gateManager.resolveGate('gate-123', {
 *   decision: 'approved',
 *   resolver: 'john.doe',
 *   comments: 'Architecture review completed - approved with minor suggestions',
 *   attachments: ['review-notes.md']
 * });
 *
 * // Access gate metrics
 * const metrics = await gateManager.getMetrics();
 * console.log(`Average resolution time: ${metrics.averageResolutionTime}ms`);
 * ```
 *
 * @example Event-Driven Gate Creation
 * ```typescript
 * // Configure automatic gate triggers
 * gateManager.configureTrigger('code-quality-check', {
 *   gateType: 'quality',
 *   condition: (event) => event.coverageScore < 0.8,
 *   priority: 'high',
 *   escalationTimeout: 3600000 // 1 hour
 * });
 * ```
 *
 * @class WorkflowGatesManager
 * @extends {EventEmitter}
 *
 * @since 1.0.0
 * @version 1.2.0
 */
export declare class WorkflowGatesManager extends EventEmitter {
    private readonly logger;
    private readonly persistence;
    private readonly eventBus;
    private readonly gateFactories;
    private readonly triggerEvaluators;
    private queueProcessor;
    private isInitialized;
    private readonly config;
    constructor(eventBus: TypeSafeEventBus, config?: WorkflowGatesManagerConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createGate(type: WorkflowHumanGateType, subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options?: CreateGateOptions): Promise<WorkflowHumanGate>;
    updateGate(gateId: string, updates: Partial<WorkflowHumanGate>): Promise<void>;
    resolveGate(gateId: string, decision: 'approved' | 'rejected' | 'deferred', resolvedBy: string, rationale?: string, data?: Record<string, unknown>): Promise<void>;
    cancelGate(gateId: string, reason: string, cancelledBy: string): Promise<void>;
    addToQueue(gateId: string, priority: number, urgency: GateTriggerUrgency, scheduledAt?: Date): Promise<void>;
    getQueuedGates(): Promise<Array<{
        gate: WorkflowHumanGate;
        queueItem: unknown;
    }>>;
    getGate(gateId: string): Promise<WorkflowHumanGate | null>;
    getGatesByStatus(status: WorkflowHumanGateStatus[]): Promise<WorkflowHumanGate[]>;
    getGatesByType(type: WorkflowHumanGateType): Promise<WorkflowHumanGate[]>;
    getPendingGates(): Promise<WorkflowHumanGate[]>;
    getGateHistory(gateId: string): Promise<any[]>;
    getMetrics(timeRange?: {
        from: Date;
        to: Date;
    }): Promise<WorkflowGatesMetrics>;
    processTriggers(gate: WorkflowHumanGate): Promise<void>;
    triggerGate(gate: WorkflowHumanGate, trigger: GateTrigger): Promise<void>;
    createWorkflowGateRequest(gate: WorkflowHumanGate): Promise<WorkflowGateRequest>;
    private ensureInitialized;
    private registerGateFactories;
    private registerTriggerEvaluators;
    private startQueueProcessor;
    private processQueue;
    private processQueuedGate;
    private urgencyToPriority;
    private calculateScheduledTime;
    private mapImpactToLevel;
    private mapGatePriorityToValidationPriority;
}
/**
 * Base gate factory interface
 */
export interface GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
}
/**
 * Create gate options
 */
export interface CreateGateOptions {
    readonly title?: string;
    readonly description?: string;
    readonly priority?: WorkflowGatePriority;
    readonly approvers?: string[];
    readonly timeoutConfig?: GateTimeoutConfig;
    readonly triggers?: GateTrigger[];
}
/**
 * Strategic gate factory
 */
export declare class StrategicGateFactory implements GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
    private createDefaultStrategicTriggers;
    private createInitialMetrics;
}
/**
 * Architectural gate factory
 */
export declare class ArchitecturalGateFactory implements GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
    private createDefaultArchitecturalTriggers;
    private createInitialMetrics;
}
/**
 * Quality gate factory
 */
export declare class QualityGateFactory implements GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
    private createDefaultQualityTriggers;
    private createInitialMetrics;
}
/**
 * Business gate factory
 */
export declare class BusinessGateFactory implements GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
    private createDefaultBusinessTriggers;
    private createInitialMetrics;
}
/**
 * Ethical gate factory
 */
export declare class EthicalGateFactory implements GateFactory {
    createGate(subtype: string, workflowContext: WorkflowGateContext, gateData: WorkflowGateData, options: CreateGateOptions): WorkflowHumanGate;
    private createDefaultEthicalTriggers;
    private createInitialMetrics;
}
/**
 * Workflow Gates Manager configuration
 */
export interface WorkflowGatesManagerConfig {
    readonly persistencePath?: string;
    readonly queueProcessingInterval?: number;
    readonly maxConcurrentGates?: number;
    readonly enableMetrics?: boolean;
}
/**
 * Workflow gates metrics
 */
export interface WorkflowGatesMetrics extends GatePersistenceMetrics {
    readonly queuedGatesCount: number;
    readonly activeGatesCount: number;
    readonly completedGatesCount: number;
}
export default WorkflowGatesManager;
export type { WorkflowHumanGate, WorkflowGateContext, WorkflowGateData, StructuredGateData, GateTrigger, GateResolution, GateMetrics, ImpactAssessment, CreateGateOptions, GateFactory, WorkflowGatesManagerConfig, WorkflowGatesMetrics, GatePersistenceMetrics, };
export { WorkflowHumanGateType, WorkflowHumanGateStatus, WorkflowGatePriority, GateTriggerUrgency, WorkflowGatesManager, GatePersistenceManager, StrategicGateFactory, ArchitecturalGateFactory, QualityGateFactory, BusinessGateFactory, EthicalGateFactory, };
//# sourceMappingURL=workflow-gates.d.ts.map