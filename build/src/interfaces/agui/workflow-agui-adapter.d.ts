/**
 * @file Workflow AGUI Adapter - Phase 1, Task 1.3 - AGUI Workflow Gates
 *
 * Extends TerminalAGUI with workflow-aware prompts, decision logging, and
 * gate timeout/escalation handling. Integrates with WorkflowGateRequest
 * and type-safe event system for comprehensive workflow orchestration.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven TerminalAGUI interface for consistency
 * - Integrates with WorkflowGateRequest from Phase 1, Task 1.2
 * - Uses type-safe event system for gate lifecycle events
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and audit trail
 */
import type { GateEscalationLevel, WorkflowContext, WorkflowGateRequest } from '../../coordination/workflows/workflow-gate-request.ts';
import { type TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import { TerminalAGUI, type ValidationQuestion } from './agui-adapter.ts';
/**
 * Workflow decision audit record
 */
export interface WorkflowDecisionAudit {
    readonly gateId: string;
    readonly workflowId: string;
    readonly stepName: string;
    readonly timestamp: Date;
    readonly decision: string;
    readonly decisionMaker: string;
    readonly rationale?: string;
    readonly escalationLevel: GateEscalationLevel;
    readonly processingTime: number;
    readonly context: WorkflowContext;
    readonly correlationId: string;
}
/**
 * Workflow prompt context for enhanced user experience
 */
export interface WorkflowPromptContext {
    readonly gateRequest: WorkflowGateRequest;
    readonly workflowHistory: WorkflowDecisionAudit[];
    readonly stakeholders: string[];
    readonly businessImpact: string;
    readonly dependencies?: string[];
    readonly deadline?: Date;
    readonly escalationInfo?: {
        currentLevel: GateEscalationLevel;
        nextLevel?: GateEscalationLevel;
        timeRemaining?: number;
    };
}
/**
 * Timeout and escalation configuration
 */
export interface TimeoutConfig {
    readonly initialTimeout: number;
    readonly escalationTimeouts: number[];
    readonly maxTotalTimeout: number;
    readonly enableAutoEscalation: boolean;
    readonly notifyOnTimeout: boolean;
}
/**
 * Workflow AGUI Adapter configuration
 */
export interface WorkflowAGUIConfig {
    readonly enableRichPrompts: boolean;
    readonly enableDecisionLogging: boolean;
    readonly enableTimeoutHandling: boolean;
    readonly enableEscalationManagement: boolean;
    readonly auditRetentionDays: number;
    readonly maxAuditRecords: number;
    readonly timeoutConfig: TimeoutConfig;
}
/**
 * Workflow-aware AGUI adapter extending TerminalAGUI with enhanced capabilities
 * for workflow orchestration, decision logging, and escalation handling.
 */
export declare class WorkflowAGUIAdapter extends TerminalAGUI {
    private readonly logger;
    private readonly domainValidator;
    private readonly eventBus;
    private readonly config;
    private readonly decisionAuditLog;
    private readonly activeGates;
    constructor(eventBus: TypeSafeEventBus, config?: Partial<WorkflowAGUIConfig>);
    /**
     * Enhanced askQuestion method with workflow-specific capabilities
     */
    askQuestion(question: ValidationQuestion): Promise<string>;
    /**
     * Process a workflow gate request with full workflow context
     */
    processWorkflowGate(gateRequest: WorkflowGateRequest, correlationId?: string): Promise<string>;
    /**
     * Enhanced batch question processing with workflow awareness
     */
    askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
    /**
     * Display enhanced workflow prompt with rich context
     */
    private displayWorkflowPrompt;
    /**
     * Display escalation chain information
     */
    private displayEscalationInfo;
    /**
     * Register an active gate for timeout and escalation management
     */
    private registerActiveGate;
    /**
     * Setup escalation timers for a gate
     */
    private setupEscalationTimers;
    /**
     * Handle gate timeout
     */
    private handleGateTimeout;
    /**
     * Handle escalation to a specific level
     */
    private handleEscalation;
    /**
     * Cleanup active gate tracking
     */
    private cleanupActiveGate;
    /**
     * Log workflow decision to audit trail
     */
    private logWorkflowDecision;
    /**
     * Get workflow decision history for a specific workflow
     */
    getWorkflowDecisionHistory(workflowId: string): WorkflowDecisionAudit[];
    /**
     * Get all decision audit records
     */
    getAllDecisionAudits(): WorkflowDecisionAudit[];
    /**
     * Export audit trail for compliance/analysis
     */
    exportAuditTrail(format?: 'json' | 'csv'): string;
    /**
     * Check if a validation question is a workflow gate request
     */
    private isWorkflowGateRequest;
    /**
     * Validate workflow gate request
     */
    private validateWorkflowGateRequest;
    /**
     * Get workflow input with enhanced handling
     */
    private getWorkflowInput;
    /**
     * Process workflow response with validation
     */
    private processWorkflowResponse;
    /**
     * Process approval-specific responses
     */
    private processApprovalResponse;
    /**
     * Process checkpoint-specific responses
     */
    private processCheckpointResponse;
    /**
     * Process decision-specific responses
     */
    private processDecisionResponse;
    /**
     * Process emergency-specific responses
     */
    private processEmergencyResponse;
    /**
     * Extract rationale from response
     */
    private extractRationale;
    /**
     * Interpret response as boolean (approved/rejected)
     */
    private interpretResponse;
    /**
     * Cleanup old audit records based on retention policy
     */
    private cleanupOldAuditRecords;
    /**
     * Export audit trail as CSV
     */
    private exportAuditTrailAsCsv;
    /**
     * Emit gate opened event
     */
    private emitGateOpenedEvent;
    /**
     * Emit gate closed event
     */
    private emitGateClosedEvent;
    /**
     * Shutdown the workflow AGUI adapter gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Get adapter statistics
     */
    getStatistics(): {
        totalDecisionAudits: number;
        activeGates: number;
        config: WorkflowAGUIConfig;
        lastAuditCleanup: Date;
    };
}
/**
 * Create a workflow AGUI adapter with default configuration
 */
export declare function createWorkflowAGUIAdapter(eventBus: TypeSafeEventBus, config?: Partial<WorkflowAGUIConfig>): WorkflowAGUIAdapter;
/**
 * Create a workflow AGUI adapter optimized for production use
 */
export declare function createProductionWorkflowAGUIAdapter(eventBus: TypeSafeEventBus): WorkflowAGUIAdapter;
/**
 * Create a workflow AGUI adapter for testing/development
 */
export declare function createTestWorkflowAGUIAdapter(eventBus: TypeSafeEventBus): WorkflowAGUIAdapter;
export default WorkflowAGUIAdapter;
export type { WorkflowDecisionAudit, WorkflowPromptContext, TimeoutConfig, WorkflowAGUIConfig };
//# sourceMappingURL=workflow-agui-adapter.d.ts.map