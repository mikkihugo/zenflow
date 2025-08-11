/**
 * @file Workflow Gate Request - Phase 1, Task 1.2 - AGUI Workflow Gates
 *
 * Extends existing ValidationQuestion interface for workflow orchestration gates.
 * Provides type-safe workflow context, escalation chains, and integration with
 * the existing AGUI system and type-safe event system.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven ValidationQuestion interface from progressive-confidence-builder
 * - Integrates with type-safe event system (HumanValidationRequestedEvent, AGUIGateOpenedEvent)
 * - Provides workflow-specific context and decision escalation chains
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and monitoring
 */
import { EventEmitter } from 'events';
import type { ValidationQuestion } from '../../coordination/discovery/progressive-confidence-builder.ts';
import { type TypeSchema } from '../../core/domain-boundary-validator.ts';
import { type TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter.ts';
/**
 * Workflow context for gate decision points
 */
export interface WorkflowContext {
    /** Unique workflow identifier */
    readonly workflowId: string;
    /** Current step name within the workflow */
    readonly stepName: string;
    /** Business impact level of this decision */
    readonly businessImpact: 'low' | 'medium' | 'high' | 'critical';
    /** Scope of the decision being made */
    readonly decisionScope: 'task' | 'feature' | 'epic' | 'prd' | 'portfolio';
    /** List of stakeholders who should be involved in decision */
    readonly stakeholders: string[];
    /** Optional deadline for decision completion */
    readonly deadline?: Date;
    /** Dependencies that this decision affects */
    readonly dependencies?: WorkflowDependency[];
    /** Estimated cost/effort impact of different decision outcomes */
    readonly impactEstimates?: ImpactEstimate[];
    /** Historical decisions in this workflow for context */
    readonly previousDecisions?: WorkflowDecisionRecord[];
    /** Risk factors associated with this decision */
    readonly riskFactors?: RiskFactor[];
}
/**
 * Workflow dependency that may be affected by gate decisions
 */
export interface WorkflowDependency {
    /** Unique dependency identifier */
    readonly id: string;
    /** Dependency type */
    readonly type: 'blocking' | 'blocked_by' | 'related' | 'impacts' | 'impacted_by';
    /** Reference to dependent workflow/task/resource */
    readonly reference: string;
    /** Criticality of this dependency */
    readonly criticality: 'low' | 'medium' | 'high' | 'critical';
    /** Optional description of the dependency relationship */
    readonly description?: string;
}
/**
 * Impact estimate for different decision outcomes
 */
export interface ImpactEstimate {
    /** Decision outcome being estimated */
    readonly outcome: string;
    /** Time impact (in hours) */
    readonly timeImpact: number;
    /** Resource cost impact */
    readonly costImpact: number;
    /** Quality/risk impact score (0-1) */
    readonly qualityImpact: number;
    /** Confidence in this estimate (0-1) */
    readonly confidence: number;
}
/**
 * Risk factor associated with a workflow gate decision
 */
export interface RiskFactor {
    /** Unique risk identifier */
    readonly id: string;
    /** Risk category */
    readonly category: 'technical' | 'business' | 'compliance' | 'security' | 'operational';
    /** Risk severity */
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    /** Probability of risk occurring (0-1) */
    readonly probability: number;
    /** Risk description */
    readonly description: string;
    /** Mitigation strategies available */
    readonly mitigation?: string[];
}
/**
 * Record of a previous workflow decision for context
 */
export interface WorkflowDecisionRecord {
    /** When the decision was made */
    readonly timestamp: Date;
    /** Who made the decision */
    readonly decisionMaker: string;
    /** Step where decision was made */
    readonly stepName: string;
    /** Decision that was made */
    readonly decision: string;
    /** Rationale provided */
    readonly rationale?: string;
    /** Outcome/result of the decision */
    readonly outcome?: string;
}
/**
 * Escalation level for workflow gates
 */
export declare enum GateEscalationLevel {
    NONE = 0,// No escalation needed
    TEAM_LEAD = 1,// Escalate to team lead
    MANAGER = 2,// Escalate to manager
    DIRECTOR = 3,// Escalate to director
    EXECUTIVE = 4,// Escalate to executive level
    BOARD = 5
}
/**
 * Escalation trigger conditions
 */
export interface EscalationTrigger {
    /** Condition type */
    readonly type: 'timeout' | 'business_impact' | 'cost_threshold' | 'risk_level' | 'stakeholder_conflict';
    /** Threshold value for triggering escalation */
    readonly threshold: number | string;
    /** Time delay before escalating (in milliseconds) */
    readonly delay?: number;
    /** Whether to skip levels based on urgency */
    readonly skipLevels?: boolean;
}
/**
 * Escalation chain configuration
 */
export interface EscalationChain {
    /** Chain identifier */
    readonly id: string;
    /** Ordered list of escalation levels */
    readonly levels: EscalationLevel[];
    /** Conditions that trigger escalation */
    readonly triggers: EscalationTrigger[];
    /** Maximum escalation level allowed */
    readonly maxLevel: GateEscalationLevel;
    /** Whether to notify all levels when escalating */
    readonly notifyAllLevels?: boolean;
}
/**
 * Individual escalation level configuration
 */
export interface EscalationLevel {
    /** Level in the escalation chain */
    readonly level: GateEscalationLevel;
    /** Approvers at this level */
    readonly approvers: string[];
    /** Required number of approvals at this level */
    readonly requiredApprovals?: number;
    /** Time limit for decision at this level */
    readonly timeLimit?: number;
    /** Special permissions or context at this level */
    readonly permissions?: string[];
    /** Notification configuration */
    readonly notifications?: NotificationConfig;
}
/**
 * Notification configuration for escalations
 */
export interface NotificationConfig {
    /** Notification channels to use */
    readonly channels: ('email' | 'slack' | 'teams' | 'webhook' | 'sms')[];
    /** Notification priority */
    readonly priority: 'low' | 'normal' | 'high' | 'urgent';
    /** Follow-up notification intervals */
    readonly followUpIntervals?: number[];
    /** Custom notification templates */
    readonly templates?: Record<string, string>;
}
/**
 * Approval chain result
 */
export interface ApprovalChainResult {
    /** Whether the chain completed successfully */
    readonly completed: boolean;
    /** Final approval status */
    readonly approved: boolean;
    /** Level at which decision was made */
    readonly decisionLevel: GateEscalationLevel;
    /** Who made the final decision */
    readonly decisionMaker: string;
    /** Time taken for the approval process */
    readonly processingTime: number;
    /** All approvals collected during the process */
    readonly approvals: ApprovalRecord[];
    /** Any escalations that occurred */
    readonly escalations: EscalationRecord[];
}
/**
 * Individual approval record
 */
export interface ApprovalRecord {
    /** Who provided the approval */
    readonly approver: string;
    /** When the approval was given */
    readonly timestamp: Date;
    /** Approval decision */
    readonly decision: 'approve' | 'reject' | 'delegate' | 'escalate';
    /** Comments or rationale */
    readonly comments?: string;
    /** Escalation level of the approver */
    readonly level: GateEscalationLevel;
    /** Time taken to make decision */
    readonly responseTime: number;
}
/**
 * Escalation record
 */
export interface EscalationRecord {
    /** When the escalation occurred */
    readonly timestamp: Date;
    /** Why escalation was triggered */
    readonly reason: string;
    /** From which level to which level */
    readonly fromLevel: GateEscalationLevel;
    readonly toLevel: GateEscalationLevel;
    /** Who triggered the escalation */
    readonly triggeredBy?: string;
    /** Escalation trigger that fired */
    readonly trigger: EscalationTrigger;
}
/**
 * Workflow gate request extending ValidationQuestion with workflow-specific context.
 * Maintains full compatibility with existing AGUI validation system while adding
 * workflow orchestration capabilities.
 */
export interface WorkflowGateRequest extends ValidationQuestion {
    /** Workflow-specific context information */
    readonly workflowContext: WorkflowContext;
    /** Escalation chain configuration for this gate */
    readonly escalationChain?: EscalationChain;
    /** Gate type for categorization and handling */
    readonly gateType: 'approval' | 'checkpoint' | 'review' | 'decision' | 'escalation' | 'emergency';
    /** Required approval level for this gate */
    readonly requiredApprovalLevel?: GateEscalationLevel;
    /** Timeout configuration */
    readonly timeoutConfig?: {
        /** Initial timeout before escalation (ms) */
        readonly initialTimeout: number;
        /** Escalation timeout intervals (ms) */
        readonly escalationTimeouts: number[];
        /** Maximum total time allowed (ms) */
        readonly maxTotalTimeout: number;
    };
    /** Integration configuration with existing systems */
    readonly integrationConfig?: {
        /** Event bus correlation ID */
        readonly correlationId?: string;
        /** AGUI interface to use */
        readonly aguiInterface?: string;
        /** Domain validation requirements */
        readonly domainValidation?: boolean;
        /** Performance monitoring */
        readonly enableMetrics?: boolean;
    };
    /** Conditional logic for dynamic gate behavior */
    readonly conditionalLogic?: {
        /** Conditions that must be met before presenting gate */
        readonly prerequisites?: GateCondition[];
        /** Dynamic options based on context */
        readonly dynamicOptions?: (context: WorkflowContext) => string[];
        /** Auto-approval conditions */
        readonly autoApprovalConditions?: GateCondition[];
    };
}
/**
 * Gate condition for conditional logic
 */
export interface GateCondition {
    /** Condition identifier */
    readonly id: string;
    /** Condition type */
    readonly type: 'workflow_state' | 'user_role' | 'time_constraint' | 'dependency' | 'risk_threshold' | 'custom';
    /** Condition operator */
    readonly operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches' | 'exists';
    /** Value to compare against */
    readonly value: any;
    /** Field or property to evaluate */
    readonly field: string;
    /** Whether this condition is required or optional */
    readonly required?: boolean;
}
/**
 * TypeSchema for WorkflowGateRequest runtime validation
 */
export declare const WorkflowGateRequestSchema: TypeSchema<WorkflowGateRequest>;
/**
 * Workflow Gate Request Processor
 *
 * Handles workflow gate requests with full integration to existing systems:
 * - ValidationQuestion compatibility for existing AGUI system
 * - Type-safe event system integration for HumanValidationRequestedEvent and AGUIGateOpenedEvent
 * - Domain boundary validation for cross-domain operations
 * - Escalation chain processing and approval workflows
 * - Performance monitoring and analytics
 */
export declare class WorkflowGateRequestProcessor extends EventEmitter {
    private readonly eventBus;
    private readonly aguiInterface;
    private readonly config;
    private readonly logger;
    private readonly domainValidator;
    private readonly pendingGates;
    private readonly escalationTimers;
    private gateCounter;
    constructor(eventBus: TypeSafeEventBus, aguiInterface: AGUIInterface, config?: WorkflowGateProcessorConfig);
    /**
     * Process a workflow gate request with full validation and escalation support
     */
    processWorkflowGate(gateRequest: WorkflowGateRequest, options?: {
        skipValidation?: boolean;
        timeout?: number;
        escalationOverride?: EscalationChain;
    }): Promise<WorkflowGateResult>;
    /**
     * Create a workflow gate request from basic parameters
     */
    createWorkflowGateRequest(workflowId: string, stepName: string, gateType: WorkflowGateRequest['gateType'], question: string, context: any, workflowContext: Partial<WorkflowContext>, options?: {
        priority?: ValidationQuestion['priority'];
        expectedImpact?: number;
        escalationChain?: EscalationChain;
        timeoutConfig?: WorkflowGateRequest['timeoutConfig'];
        integrationConfig?: WorkflowGateRequest['integrationConfig'];
    }): WorkflowGateRequest;
    /**
     * Get status of all pending gates
     */
    getPendingGates(): Map<string, PendingGateRequest>;
    /**
     * Cancel a pending gate request
     */
    cancelGate(gateId: string, reason: string): Promise<boolean>;
    private validateGateRequest;
    private checkPrerequisites;
    private checkAutoApproval;
    private evaluateCondition;
    private getFieldValue;
    private createDefaultEscalationChain;
    private requestHumanValidation;
    private processEscalationChain;
    private simulateApprovalAtLevel;
    private emitGateOpenedEvent;
    private emitGateClosedEvent;
    private initializeEventHandlers;
    private setEscalationTimer;
    private clearEscalationTimers;
    private cleanup;
    private interpretResponse;
    private mapPriorityToEventPriority;
}
/**
 * Configuration for WorkflowGateRequestProcessor
 */
export interface WorkflowGateProcessorConfig {
    enableMetrics?: boolean;
    enableDomainValidation?: boolean;
    defaultTimeout?: number;
    maxEscalationLevel?: GateEscalationLevel;
    enableAutoApproval?: boolean;
}
/**
 * Pending gate request tracking
 */
interface PendingGateRequest {
    gateRequest: WorkflowGateRequest;
    escalationChain: EscalationChain;
    correlationId: string;
    startTime: Date;
    currentLevel: GateEscalationLevel;
    approvals: ApprovalRecord[];
    escalations: EscalationRecord[];
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
}
/**
 * Workflow gate processing result
 */
export interface WorkflowGateResult {
    success: boolean;
    gateId: string;
    approved: boolean;
    processingTime: number;
    escalationLevel: GateEscalationLevel;
    decisionMaker?: string;
    error?: Error;
    autoApproved?: boolean;
    approvalChain?: ApprovalChainResult;
    correlationId: string;
}
/**
 * Create a simple approval gate
 */
export declare function createApprovalGate(workflowId: string, stepName: string, question: string, stakeholders: string[], options?: {
    businessImpact?: WorkflowContext['businessImpact'];
    deadline?: Date;
    priority?: ValidationQuestion['priority'];
}): WorkflowGateRequest;
/**
 * Create a checkpoint gate for workflow progress validation
 */
export declare function createCheckpointGate(workflowId: string, stepName: string, checkpointData: any, options?: {
    autoApprovalThreshold?: number;
    businessImpact?: WorkflowContext['businessImpact'];
}): WorkflowGateRequest;
/**
 * Create an emergency gate for critical decisions
 */
export declare function createEmergencyGate(workflowId: string, stepName: string, emergencyContext: any, stakeholders: string[]): WorkflowGateRequest;
export default WorkflowGateRequestProcessor;
export type { WorkflowContext, WorkflowDependency, ImpactEstimate, RiskFactor, WorkflowDecisionRecord, EscalationChain, EscalationLevel, EscalationTrigger, EscalationRecord, ApprovalRecord, ApprovalChainResult, GateCondition, WorkflowGateRequest, WorkflowGateResult, WorkflowGateProcessorConfig, NotificationConfig, };
//# sourceMappingURL=workflow-gate-request.d.ts.map