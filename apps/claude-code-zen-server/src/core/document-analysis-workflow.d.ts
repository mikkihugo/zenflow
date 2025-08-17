/**
 * Document Analysis Workflow - Complete integration of scanning, approval, and swarm execution
 *
 * Orchestrates the full workflow:
 * 1. Enhanced document scanning and code analysis
 * 2. Human-in-the-loop task approval via AGUI
 * 3. Integration with document entity system
 * 4. Swarm task creation and execution
 *
 * @file Complete document analysis and task generation workflow.
 */
import { EventEmitter } from 'node:events';
import type { BaseDocumentEntity } from '../database/entities/document-entities';
import type { AGUIInterface } from '../interfaces/agui/agui-adapter';
import type { EnhancedDocumentScanner, ScanResults, ScannerConfig } from './enhanced-document-scanner';
import type { TaskApprovalSystem, BatchApprovalResults, TaskApprovalConfig } from './task-approval-system';
/**
 * Workflow configuration
 */
export interface WorkflowConfig {
    /** Scanner configuration */
    scanner: Partial<ScannerConfig>;
    /** Task approval configuration */
    approval: Partial<TaskApprovalConfig>;
    /** Enable automatic swarm task creation */
    enableSwarmIntegration: boolean;
    /** Enable document entity creation */
    enableDocumentEntities: boolean;
    /** Workflow timeout in milliseconds */
    timeoutMs: number;
}
/**
 * Workflow execution results
 */
export interface WorkflowResults {
    scanResults: ScanResults;
    approvalResults: BatchApprovalResults;
    createdDocuments: BaseDocumentEntity[];
    swarmTasksCreated: number;
    totalExecutionTime: number;
    success: boolean;
    errors: string[];
}
/**
 * Workflow execution status
 */
export interface WorkflowStatus {
    phase: 'scanning' | 'approval' | 'document_creation' | 'swarm_integration' | 'completed' | 'error';
    progress: number;
    currentTask?: string;
    tasksCompleted: number;
    totalTasks: number;
    startTime: Date;
    estimatedCompletion?: Date;
}
/**
 * Document Analysis Workflow orchestrator
 */
export declare class DocumentAnalysisWorkflow extends EventEmitter {
    private scanner;
    private approvalSystem;
    private agui;
    private config;
    private currentStatus;
    constructor(scanner: EnhancedDocumentScanner, approvalSystem: TaskApprovalSystem, agui: AGUIInterface, config?: Partial<WorkflowConfig>);
    /**
     * Execute the complete document analysis workflow
     */
    executeWorkflow(rootPath?: string): Promise<WorkflowResults>;
    /**
     * Get current workflow status
     */
    getStatus(): WorkflowStatus;
    /**
     * Cancel the current workflow execution
     */
    cancelWorkflow(): Promise<void>;
    /**
     * Initialize workflow status
     */
    private initializeStatus;
    /**
     * Update workflow status and emit progress event
     */
    private updateStatus;
    /**
     * Create document entities from approved tasks
     */
    private createDocumentEntities;
    /**
     * Create a single document entity from a swarm task
     */
    private createDocumentEntity;
    /**
     * Generate document content from task
     */
    private generateDocumentContent;
    /**
     * Generate checksum for task
     */
    private generateChecksum;
    /**
     * Map analysis pattern to task type
     */
    private mapToTaskType;
    /**
     * Extract component name from file path
     */
    private extractComponent;
    /**
     * Extract module name from file path
     */
    private extractModule;
    /**
     * Create swarm tasks from approved tasks
     */
    private createSwarmTasks;
    /**
     * Show workflow completion summary
     */
    private showWorkflowSummary;
}
/**
 * Create document analysis workflow with all dependencies
 */
export declare function createDocumentAnalysisWorkflow(scanner: EnhancedDocumentScanner, approvalSystem: TaskApprovalSystem, agui: AGUIInterface, config?: Partial<WorkflowConfig>): Promise<DocumentAnalysisWorkflow>;
/**
 * Factory function to create a complete workflow with default dependencies
 */
export declare function createCompleteWorkflow(rootPath: string, agui: AGUIInterface, config?: Partial<WorkflowConfig>): Promise<DocumentAnalysisWorkflow>;
//# sourceMappingURL=document-analysis-workflow.d.ts.map