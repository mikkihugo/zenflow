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
import { EventEmitter } from 'node:events';
import type { WorkflowGatesManager } from '../coordination/orchestration/workflow-gates.ts';
import type { WorkflowGateRequest, WorkflowGateResult } from '../coordination/workflows/workflow-gate-request.ts';
import type { BaseDocumentEntity } from '../database/entities/product-entities.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import type { MemorySystemFactory } from '../memory/index.ts';
export interface WorkflowStep {
    readonly type: string;
    readonly name?: string;
    readonly params?: Record<string, unknown>;
    readonly timeout?: number;
    readonly retries?: number;
    readonly onError?: 'stop' | 'continue' | 'skip';
    readonly gateConfig?: {
        readonly enabled: boolean;
        readonly gateType?: 'approval' | 'checkpoint' | 'review' | 'decision';
        readonly businessImpact?: 'low' | 'medium' | 'high' | 'critical';
        readonly stakeholders?: string[];
        readonly autoApproval?: boolean;
    };
}
export interface WorkflowDefinition {
    readonly name: string;
    readonly description?: string;
    readonly version?: string;
    readonly steps: readonly WorkflowStep[];
}
export interface WorkflowContext {
    readonly [key: string]: unknown;
}
export interface WorkflowState {
    readonly id: string;
    readonly definition: WorkflowDefinition;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    readonly context: WorkflowContext;
    currentStep: number;
    readonly stepResults: Record<string, unknown>;
    readonly startTime: string;
    endTime?: string;
    error?: string;
    pendingGates?: Map<string, WorkflowGateRequest>;
    gateResults?: Map<string, WorkflowGateResult>;
    pausedForGate?: {
        stepIndex: number;
        gateId: string;
        pausedAt: string;
    };
}
export interface WorkflowEngineConfig {
    readonly maxConcurrentWorkflows?: number;
    readonly stepTimeout?: number;
    readonly persistWorkflows?: boolean;
    readonly persistencePath?: string;
    readonly retryAttempts?: number;
}
export interface DocumentContent {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly content: string;
    readonly metadata?: Record<string, unknown>;
}
export interface StepExecutionResult {
    readonly success: boolean;
    readonly output?: unknown;
    readonly error?: string;
    readonly duration?: number;
}
export interface WorkflowData {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly version?: string;
    readonly data: Record<string, unknown>;
}
/**
 * Unified workflow engine supporting both simple and advanced use cases.
 *
 * Features:
 * - Simple step-by-step workflows
 * - Document processing workflows
 * - Memory and database integration
 * - Event-driven architecture
 * - Configurable persistence
 */
export declare class WorkflowEngine extends EventEmitter {
    private readonly config;
    private readonly activeWorkflows;
    private readonly workflowDefinitions;
    private readonly stepHandlers;
    private isInitialized;
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
    cancelWorkflow(workflowId: string): Promise<boolean>;
    getWorkflowStatus(workflowId: string): WorkflowState | null;
    registerWorkflowDefinition(name: string, definition: WorkflowDefinition): Promise<void>;
    registerStepHandler(type: string, handler: StepHandler): void;
    registerDocumentWorkflows(): Promise<void>;
    processDocumentEvent(eventType: string, documentData: unknown): Promise<void>;
    convertEntityToDocumentContent(entity: BaseDocumentEntity): DocumentContent;
    getWorkflowData(workflowId: string): Promise<WorkflowData | null>;
    createWorkflowFromData(data: WorkflowData): Promise<string>;
    updateWorkflowData(workflowId: string, updates: Partial<WorkflowData>): Promise<void>;
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
     * Simulate gate decision for testing purposes
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
export {};
//# sourceMappingURL=workflow-engine.d.ts.map