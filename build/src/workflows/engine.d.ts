/**
 * @file Engine implementation.
 */
import type { BaseDocumentEntity } from '../database/entities/product-entities.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import type { MemorySystemFactory } from '../memory/index.ts';
/**
 * Workflow Engine
 * Sequential workflow processing engine migrated from plugins.
 * Removed plugin dependencies and simplified for direct use.
 */
import { EventEmitter } from 'node:events';
export interface WorkflowStep {
    type: string;
    name?: string;
    params?: Record<string, any>;
    retries?: number;
    timeout?: number;
    output?: string;
    onError?: 'stop' | 'continue' | 'skip';
}
export interface WorkflowDefinition {
    name: string;
    steps: WorkflowStep[];
    description?: string;
    version?: string;
}
export interface WorkflowContext {
    [key: string]: any;
}
export interface DocumentContent {
    id: string;
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
}
export interface StepExecutionResult {
    success: boolean;
    output?: any;
    error?: string;
    duration?: number;
}
export interface WorkflowData {
    id: string;
    name: string;
    description?: string;
    version?: string;
    data: Record<string, any>;
}
export interface WorkflowState {
    id: string;
    definition: WorkflowDefinition;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    context: WorkflowContext;
    currentStep: number;
    steps: WorkflowStep[];
    stepResults: Record<string, any>;
    completedSteps: Array<{
        index: number;
        step: WorkflowStep;
        result: any;
        duration: number;
        timestamp: string;
    }>;
    startTime: string;
    endTime?: string;
    pausedAt?: string;
    error?: string;
}
export interface WorkflowEngineConfig {
    maxConcurrentWorkflows?: number;
    persistWorkflows?: boolean;
    persistencePath?: string;
    stepTimeout?: number;
    retryDelay?: number;
    enableVisualization?: boolean;
}
export declare class WorkflowEngine extends EventEmitter {
    private config;
    private activeWorkflows;
    private workflowMetrics;
    private workflowDefinitions;
    private stepHandlers;
    private isInitialized;
    memory?: MemorySystemFactory;
    private documentManager?;
    private documentWorkflows;
    constructor(config?: WorkflowEngineConfig, documentManager?: DocumentManager, memoryFactory?: MemorySystemFactory);
    initialize(): Promise<void>;
    private registerBuiltInHandlers;
    registerStepHandler(type: string, handler: (context: WorkflowContext, params: any) => Promise<any>): void;
    executeStep(step: WorkflowStep, context: WorkflowContext): Promise<any>;
    private evaluateCondition;
    private getContextValue;
    private applyTransformation;
    private loadPersistedWorkflows;
    private saveWorkflow;
    registerWorkflowDefinition(name: string, definition: WorkflowDefinition): Promise<void>;
    startWorkflow(workflowDefinitionOrName: string | WorkflowDefinition, context?: WorkflowContext): Promise<{
        success: boolean;
        workflowId?: string;
        error?: string;
    }>;
    private executeWorkflow;
    getWorkflowStatus(workflowId: string): Promise<any>;
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
    getActiveWorkflows(): Promise<any[]>;
    getWorkflowHistory(limit?: number): Promise<WorkflowState[]>;
    getWorkflowMetrics(): Promise<any>;
    generateWorkflowVisualization(workflow: WorkflowState): string | null;
    cleanup(): Promise<void>;
    /**
     * Register document workflows for automated processing.
     */
    registerDocumentWorkflows(): Promise<void>;
    /**
     * Process document event to trigger appropriate workflows.
     */
    processDocumentEvent(eventType: string, documentData: any): Promise<void>;
    /**
     * Convert entity to document content.
     */
    convertEntityToDocumentContent(entity: BaseDocumentEntity): DocumentContent;
    /**
     * Get workflow data by ID.
     */
    getWorkflowData(workflowId: string): Promise<WorkflowData | null>;
    /**
     * Create workflow from data.
     */
    createWorkflowFromData(data: WorkflowData): Promise<string>;
    /**
     * Update workflow data.
     */
    updateWorkflowData(workflowId: string, updates: Partial<WorkflowData>): Promise<void>;
    /**
     * Enhanced shutdown with cleanup.
     */
    shutdown(): Promise<void>;
}
export default WorkflowEngine;
//# sourceMappingURL=engine.d.ts.map