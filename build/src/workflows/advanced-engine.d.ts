/**
 * @file Unified Workflow Engine - Database-Driven Architecture.
 * @file Unified Workflow Engine - Database-Driven Architecture.
 *
 * PURE DATABASE-DRIVEN workflow engine - NO FILE OPERATIONS
 * Handles Vision → PRDs → Epics → Features → Tasks → Code.
 * ADRs are independent architectural governance documents, not part of linear workflow.
 * Uses DocumentService for all document operations.
 */
import { EventEmitter } from 'node:events';
import type { BaseDocumentEntity } from '../database/entities/product-entities.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import type { StepExecutionResult, WorkflowContext, WorkflowData, WorkflowDefinition, WorkflowEngineConfig, WorkflowState } from './engine.ts';
export declare class WorkflowEngine extends EventEmitter {
    private memory;
    private documentService?;
    private activeWorkflows;
    private workflowDefinitions;
    private stepHandlers;
    private config;
    constructor(memory: any, // TODO: Replace with proper MemorySystem interface
    documentService?: DocumentManager, config?: Partial<WorkflowEngineConfig>);
    constructor(memory: any, config?: Partial<WorkflowEngineConfig>);
    initialize(): Promise<void>;
    /**
     * Register built-in step handlers.
     */
    private registerBuiltInHandlers;
    /**
     * Register document workflow definitions.
     */
    private registerDocumentWorkflows;
    /**
     * Register a custom step handler.
     *
     * @param type
     * @param handler
     */
    registerStepHandler(type: string, handler: (context: WorkflowContext, params: WorkflowData) => Promise<StepExecutionResult>): void;
    /**
     * Register a custom workflow definition.
     *
     * @param name
     * @param definition
     */
    registerWorkflowDefinition(name: string, definition: WorkflowDefinition): void;
    /**
     * Start a workflow.
     *
     * @param workflowName
     * @param context
     */
    startWorkflow(workflowName: string, context?: Partial<WorkflowContext>): Promise<{
        success: boolean;
        workflowId?: string;
        error?: string;
    }>;
    /**
     * Start workflow based on document entity event.
     *
     * @param event
     * @param document
     * @param context
     */
    processDocumentEvent(event: string, document: BaseDocumentEntity, context?: Partial<WorkflowContext>): Promise<string[]>;
    /**
     * Convert database entity to workflow document content.
     *
     * @param entity
     */
    private convertEntityToDocumentContent;
    /**
     * Execute a workflow.
     *
     * @param workflow
     */
    private executeWorkflow;
    /**
     * Execute a single workflow step.
     *
     * @param workflow
     * @param step
     * @param stepIndex
     */
    private executeWorkflowStep;
    /**
     * Built-in step handlers.
     *
     * @param context
     * @param _params
     */
    private handleExtractRequirements;
    private handleExtractProductRequirements;
    private handleGenerateADRs;
    private handleSaveDocuments;
    private handleAnalyzePRD;
    private handleDecomposeEpic;
    private handleAnalyzeFeature;
    private handleAnalyzeTask;
    private handleGeneratePRDs;
    private handleGenerateEpicDocs;
    private handleGenerateFeatureDocs;
    private handleGenerateTaskDocs;
    private handleGenerateCode;
    private handleGenerateTests;
    private handleGenerateDocs;
    private handleSaveImplementation;
    private handleDelay;
    private handleTransform;
    private handleCondition;
    private handleIdentifyDecisions;
    /**
     * Utility methods.
     *
     * @param context
     * @param expression
     */
    private evaluateCondition;
    private getContextValue;
    private saveWorkflow;
    private loadPersistedWorkflows;
    private startWorkflowMonitoring;
    private monitorWorkflows;
    /**
     * Public workflow management methods.
     */
    getActiveWorkflows(): Promise<WorkflowState[]>;
    getWorkflowHistory(limit?: number): Promise<WorkflowState[]>;
    getWorkflowMetrics(): Promise<any>;
    /**
     * Get workflow metrics (alias for getWorkflowMetrics).
     */
    getMetrics(): Promise<any>;
    pauseWorkflow(workflowId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    resumeWorkflow(workflowId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    cancelWorkflow(workflowId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Extract keywords from content for search indexing.
     *
     * @param content
     */
    private extractKeywords;
    /**
     * Shutdown the workflow engine gracefully.
     */
    shutdown(): Promise<void>;
    /**
     * Generate a simple checksum for content.
     *
     * @param content
     */
    private generateChecksum;
}
//# sourceMappingURL=advanced-engine.d.ts.map