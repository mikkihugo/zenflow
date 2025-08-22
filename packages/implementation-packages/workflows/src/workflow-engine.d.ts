/**
 * @fileoverview Unified Workflow Engine
 *
 * Single, clean workflow engine that combines simple and advanced capabilities.
 * Follows Google TypeScript style guide with max 500 lines and low complexity.
 *
 * Architecture:
 * - EventEmitter-based for real-time updates
 * - Supports both simple steps and document workflows
 * - Memory and database integration optional
 * - Clean separation of concerns with focused methods
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type { WorkflowGateRequest, WorkflowGateResult } from './workflow-base-types';
interface WorkflowGatesManager {
    processGate(request: WorkflowGateRequest): Promise<WorkflowGateResult>;
}
interface BaseDocumentEntity {
    id: string;
    content: string;
    metadata?: Record<string, any>;
    type: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    version?: string;
    status?: string;
}
interface DocumentManager {
    saveDocument(doc: any): Promise<void>;
    getDocument(id: string): Promise<any>;
}
interface MemorySystemFactory {
    createMemory(config: any): any;
}
import type { DocumentContent, WorkflowContext, WorkflowData, WorkflowDefinition, WorkflowEngineConfig, WorkflowState } from './workflow-base-types';
export type { DocumentContent, StepExecutionResult, WorkflowContext, WorkflowData, WorkflowDefinition, WorkflowEngineConfig, WorkflowState, WorkflowStep, } from './workflow-base-types';
/**
 * Unified workflow engine supporting both simple and advanced use cases.
 * Enhanced with comprehensive Foundation monitoring and telemetry.
 *
 * Features:
 * - Simple step-by-step workflows with distributed tracing
 * - Document processing workflows with performance monitoring
 * - Memory and database integration with observability
 * - Event-driven architecture with comprehensive telemetry
 * - Configurable persistence with circuit breaker protection
 * - Enterprise-grade monitoring and analytics
 * - Graceful error handling and recovery
 */
export declare class WorkflowEngine extends TypedEventBase {
    private readonly config;
    private readonly activeWorkflows;
    private readonly workflowDefinitions;
    private readonly stepHandlers;
    private isInitialized;
    private systemMonitor;
    private performanceTracker;
    private agentMonitor;
    private mlMonitor;
    private workflowExecutionCircuitBreaker;
    private stepExecutionCircuitBreaker;
    private documentProcessingCircuitBreaker;
    private workflowMetrics;
    private executionCache;
    private lastHealthCheck;
    private startupTime;
    readonly memory?: MemorySystemFactory;
    private readonly documentManager?;
    private readonly gatesManager?;
    constructor(config?: WorkflowEngineConfig, documentManager?: DocumentManager, memoryFactory?: MemorySystemFactory, gatesManager?: WorkflowGatesManager);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    startWorkflow(definitionOrName: string | WorkflowDefinition, context?: WorkflowContext): Promise<{
        success: boolean;
        workflowId?: string;
        error?: string;
    }>;
    cancelWorkflow(workflowId: string): boolean;
    getWorkflowStatus(workflowId: string): WorkflowState | null;
    registerWorkflowDefinition(name: string, definition: WorkflowDefinition): void;
    registerStepHandler(type: string, handler: StepHandler): void;
    registerDocumentWorkflows(): Promise<void>;
    processDocumentEvent(eventType: string, documentData: unknown): Promise<void>;
    convertEntityToDocumentContent(entity: BaseDocumentEntity): DocumentContent;
    getWorkflowData(workflowId: string): WorkflowData | null;
    createWorkflowFromData(data: WorkflowData): Promise<string>;
    updateWorkflowData(workflowId: string, updates: Partial<WorkflowData>): void;
    private executeWorkflowAsync;
    private executeStep;
    private registerDefaultStepHandlers;
    private resolveDefinition;
    private generateWorkflowId;
    private getWorkflowsForDocumentType;
    private ensureInitialized;
    private createTimeoutPromise;
    private getNestedValue;
    private applyTransformation;
    /**
     * Execute gate for workflow step
     */
    private executeGateForStep;
    /**
     * Production gate decision logic based on workflow context and business rules
     */
    private simulateGateDecision;
    /**
     * Resume workflow after gate approval
     */
    resumeWorkflowAfterGate(workflowId: string, gateId: string, approved: boolean): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get workflow gate status
     */
    getWorkflowGateStatus(workflowId: string): {
        hasPendingGates: boolean;
        pendingGates: WorkflowGateRequest[];
        gateResults: WorkflowGateResult[];
        pausedForGate?: {
            stepIndex: number;
            gateId: string;
            pausedAt: string;
        };
    };
}
type StepHandler = (context: WorkflowContext, params: Record<string, unknown>) => Promise<unknown>;
//# sourceMappingURL=workflow-engine.d.ts.map