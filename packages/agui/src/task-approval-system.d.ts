/**
 * Task Approval System - Human-in-the-loop approval for generated swarm tasks
 *
 * Integrates with existing AGUI system to provide human approval workflow
 * for tasks generated from document scanning and code analysis.
 *
 * Uses the existing WorkflowAGUIAdapter and document entity system
 * for consistent user experience and audit trail.
 *
 * @file Task approval system with AGUI integration.
 */
import { EventEmitter } from 'node:events';
import type { AGUIInterface } from './interfaces';
export interface BaseDocumentEntity {
    id: string;
    type: string;
    title: string;
    content: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}
export interface TaskDocumentEntity extends BaseDocumentEntity {
    type: 'task';
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
    acceptanceCriteria: string[];
}
export interface FeatureDocumentEntity extends BaseDocumentEntity {
    type: 'feature';
    epic_id?: string;
    requirements: string[];
}
export interface EpicDocumentEntity extends BaseDocumentEntity {
    type: 'epic';
    features: string[];
    objectives: string[];
}
export interface CodeAnalysisResult {
    filePath: string;
    lineNumber?: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    codeSnippet?: string;
    tags: string[];
}
export interface GeneratedSwarmTask {
    id: string;
    title: string;
    description: string;
    type: 'task' | 'feature' | 'epic' | 'bug' | 'improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
    suggestedSwarmType: string;
    requiredAgentTypes: string[];
    acceptanceCriteria: string[];
    sourceAnalysis: CodeAnalysisResult;
}
export interface ScanResults {
    scannedFiles: number;
    totalIssues: number;
    generatedTasks: GeneratedSwarmTask[];
    scanDuration: number;
    severityCounts: Record<string, number>;
    patternCounts: Record<string, number>;
}
export interface ApprovalRequest {
    taskId: string;
    task: GeneratedSwarmTask;
    requestedBy: string;
    timestamp: Date;
}
export interface ApprovalWorkflowConfig {
    enableBatchApproval: boolean;
    autoApproveThreshold: number;
    requireExplicitRejection: boolean;
}
/**
 * Approval decision for a generated task
 */
export interface TaskApprovalDecision {
    taskId: string;
    approved: boolean;
    decision: 'approve' | 'reject' | 'modify' | 'defer';
    modifications?: {
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        estimatedHours?: number;
        requiredAgentTypes?: string[];
        acceptanceCriteria?: string[];
    };
    rationale: string;
    decisionMaker: string;
    timestamp: Date;
    correlationId: string;
}
/**
 * Batch approval results
 */
export interface BatchApprovalResults {
    totalTasks: number;
    approved: number;
    rejected: number;
    modified: number;
    deferred: number;
    decisions: TaskApprovalDecision[];
    processingTime: number;
    approvedTasks: GeneratedSwarmTask[];
}
/**
 * Task approval configuration
 */
export interface TaskApprovalConfig {
    /** Enable rich task display with analysis context */
    enableRichDisplay: boolean;
    /** Enable batch approval mode */
    enableBatchMode: boolean;
    /** Maximum tasks to show per batch */
    batchSize: number;
    /** Auto-approve low-severity tasks */
    autoApproveLowSeverity: boolean;
    /** Require rationale for rejections */
    requireRationale: boolean;
    /** Enable task modification workflow */
    enableModification: boolean;
}
/**
 * Task approval statistics
 */
export interface ApprovalStatistics {
    totalTasksProcessed: number;
    approvalRate: number;
    rejectionRate: number;
    modificationRate: number;
    averageProcessingTime: number;
    topRejectionReasons: Array<{
        reason: string;
        count: number;
    }>;
    approvalsByType: Record<string, number>;
}
/**
 * Task Approval System with AGUI integration
 */
export declare class TaskApprovalSystem extends EventEmitter {
    private agui;
    private config;
    private approvalHistory;
    private storage;
    private statistics;
    constructor(agui: AGUIInterface, config?: Partial<TaskApprovalConfig>);
    /**
     * Initialize storage for approval history persistence
     */
    private initializeStorage;
    /**
     * Review and approve tasks generated from document scanning
     */
    reviewGeneratedTasks(scanResults: ScanResults): Promise<BatchApprovalResults>;
    /**
     * Review a single task for approval
     */
    reviewSingleTask(task: GeneratedSwarmTask): Promise<TaskApprovalDecision>;
    /**
     * Process a batch of tasks for approval
     */
    private processBatch;
    /**
     * Show scan summary to user
     */
    private showScanSummary;
    /**
     * Display detailed task information
     */
    private displayTaskDetails;
    /**
     * Show batch summary
     */
    private showBatchSummary;
    /**
     * Show final approval summary
     */
    private showApprovalSummary;
    /**
     * Create validation question for task review
     */
    private createTaskReviewQuestion;
    /**
     * Parse user response to approval question
     */
    private parseApprovalResponse;
    /**
     * Extract rationale from response
     */
    private extractRationale;
    /**
     * Ask for rationale for decision
     */
    private askForRationale;
    /**
     * Get modifications for a task
     */
    private getTaskModifications;
    /**
     * Ask for new value for a field
     */
    private askForNewValue;
    /**
     * Apply modifications to a task
     */
    private applyModifications;
    /**
     * Approve all tasks in a batch
     */
    private approveAllTasks;
    /**
     * Reject all tasks in a batch
     */
    private rejectAllTasks;
    /**
     * Apply bulk modifications to all tasks
     */
    private applyBulkModifications;
    /**
     * Get bulk modifications for batch processing
     */
    private getBulkModifications;
    /**
     * Update approval statistics
     */
    private updateStatistics;
    /**
     * Get approval statistics
     */
    getStatistics(): ApprovalStatistics;
    /**
     * Get approval history
     */
    getApprovalHistory(): TaskApprovalDecision[];
    /**
     * Export approval decisions for audit
     */
    exportDecisions(format?: 'json' | 'csv'): string;
}
/**
 * Create task approval system with AGUI integration
 */
export declare function createTaskApprovalSystem(agui: AGUIInterface, config?: Partial<TaskApprovalConfig>): TaskApprovalSystem;
//# sourceMappingURL=task-approval-system.d.ts.map