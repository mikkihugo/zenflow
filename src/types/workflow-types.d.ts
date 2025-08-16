/**
 * @fileoverview MOVED: Workflow Types - Now in Workflows Domain
 *
 * This file provides compatibility by re-exporting from the workflows domain.
 * All workflow types have been consolidated in /workflows/ for clean architecture.
 *
 * MIGRATION PATH:
 * - OLD: import {WorkflowStep} from '../types/workflow-types';
 * - NEW: import {WorkflowStep} from '../workflows/types';
 *
 * This compatibility layer will be removed in a future version.
 */
import type { WorkflowDefinition as BaseWorkflowDefinition, WorkflowEngineConfig as BaseWorkflowEngineConfig, WorkflowStep as BaseWorkflowStep } from '../workflows/workflow-engine';
export type WorkflowStep = BaseWorkflowStep & {
    dependencies?: string[];
    triggers?: Array<{
        event: string;
        condition?: string;
    }>;
};
export type WorkflowDefinition = BaseWorkflowDefinition & {
    documentTypes?: string[];
    triggers?: Array<{
        event: string;
        condition?: string;
    }>;
};
export type WorkflowEngineConfig = BaseWorkflowEngineConfig & {
    workspaceRoot?: string;
    templatesPath?: string;
    outputPath?: string;
    defaultTimeout?: number;
    enableMetrics?: boolean;
    enablePersistence?: boolean;
    storageBackend?: {
        type: string;
        config: unknown;
    };
};
export interface WorkflowContext {
    workspaceId: string;
    workspacePath?: string;
    userId?: string;
    sessionId: string;
    documents: Record<string, DocumentContent>;
    currentDocument?: DocumentContent;
    variables: Record<string, unknown>;
    environment: {
        type: string;
        nodeVersion: string;
        workflowVersion: string;
        features: string[];
        limits: {
            maxSteps: number;
            maxDuration: number;
            maxMemory: number;
            maxFileSize: number;
            maxConcurrency: number;
        };
    };
    permissions: {
        canReadDocuments: boolean;
        canWriteDocuments: boolean;
        canDeleteDocuments: boolean;
        canExecuteSteps: string[];
        canAccessResources: string[];
    };
    [key: string]: unknown;
}
export interface WorkflowState {
    id: string;
    definition: WorkflowDefinition;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    context: WorkflowContext;
    currentStepIndex: number;
    steps: Array<{
        step: WorkflowStep;
        status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
        attempts: number;
    }>;
    stepResults: Record<string, StepExecutionResult | any>;
    completedSteps: Array<{
        index: number;
        step: WorkflowStep;
        result: unknown;
        duration: number;
        timestamp: string;
    }>;
    startTime: Date;
    endTime?: string;
    pausedAt?: string;
    error?: string;
    progress: {
        percentage: number;
        completedSteps: number;
        totalSteps: number;
    };
    metrics: {
        totalDuration: number;
        avgStepDuration: number;
        successRate: number;
        retryRate: number;
        resourceUsage: {
            cpuTime: number;
            memoryPeak: number;
            diskIo: number;
            networkRequests: number;
        };
        throughput: number;
    };
}
export interface DocumentContent {
    id: string;
    type: string;
    title: string;
    content: string;
    metadata?: {
        author?: string;
        tags?: string[];
        status?: string;
        priority?: string;
        dependencies?: string[];
        relatedDocuments?: string[];
        checksum?: string;
    };
    created: Date;
    updated: Date;
    version: string;
}
export interface StepExecutionResult {
    success: boolean;
    data?: unknown;
    error?: string;
    warnings?: string[];
    metadata?: Record<string, unknown>;
}
export type WorkflowData = Record<string, unknown>;
export type DocumentType = 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';
export interface ExecutionPlan {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
    timestamp: Date;
}
//# sourceMappingURL=workflow-types.d.ts.map