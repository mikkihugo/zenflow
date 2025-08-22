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
import { TypedEventBase } from '@claude-zen/foundation';
import type { AGUIInterface } from './interfaces';
/**
 * Base document entity representing any document processed by the system.
 *
 * Serves as the foundation for all document types (tasks, features, epics) with
 * common properties required for document management, auditing, and lifecycle tracking.
 * All specialized document entities must extend this base interface.
 *
 * @interface BaseDocumentEntity
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const document: BaseDocumentEntity = {
 *   id: 'doc-123',
 *   type: 'task',
 *   title: 'Implement user authentication',
 *   content: 'Add JWT-based authentication system...',
 *   status: 'pending',
 *   created_at: new Date(),
 *   updated_at: new Date()
 * };
 * ```
 */
export interface BaseDocumentEntity {
  /** Unique identifier for the document */
  id: string;
  /** Document type classifier (task, feature, epic, etc.) */
  type: string;
  /** Human-readable document title */
  title: string;
  /** Full document content or description */
  content: string;
  /** Current document status (pending, approved, rejected, etc.) */
  status: string;
  /** Timestamp when the document was created */
  created_at: Date;
  /** Timestamp when the document was last updated */
  updated_at: Date;
}
/**
 * Task document entity extending base document with task-specific properties.
 *
 * Represents actionable work items that can be assigned to swarm agents for execution.
 * Includes priority level, time estimation, and acceptance criteria for clear task definition
 * and validation. Used by the task approval system to generate executable swarm tasks.
 *
 * @interface TaskDocumentEntity
 * @extends BaseDocumentEntity
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const task: TaskDocumentEntity = {
 *   id: 'task-456',
 *   type: 'task',
 *   title: 'Fix authentication bug',
 *   content: 'Users cannot login after password reset',
 *   status: 'pending',
 *   priority: 'high',
 *   estimatedHours: 4,
 *   acceptanceCriteria: [
 *     'Users can login after password reset',
 *     'All existing auth tests pass',
 *     'No regression in normal login flow'
 *   ],
 *   created_at: new Date(),
 *   updated_at: new Date()
 * };
 * ```
 */
export interface TaskDocumentEntity extends BaseDocumentEntity {
  /** Type discriminator, always 'task' for task documents */
  type: 'task';
  /** Task priority level affecting swarm assignment and execution order */
  priority: 'low | medium' | 'high''' | '''critical';
  /** Estimated hours required to complete the task */
  estimatedHours: number;
  /** List of criteria that must be met for task completion */
  acceptanceCriteria: string[];
}
/**
 * Feature document entity representing a functional capability or enhancement.
 *
 * Represents a cohesive piece of functionality that delivers user value. Features can be
 * standalone or part of larger epics, and contain detailed requirements for implementation.
 * Used to organize related tasks and provide structure for feature development workflows.
 *
 * @interface FeatureDocumentEntity
 * @extends BaseDocumentEntity
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const feature: FeatureDocumentEntity = {
 *   id: 'feature-789',
 *   type: 'feature',
 *   title: 'User Profile Management',
 *   content: 'Allow users to manage their profile information',
 *   status: 'in_development',
 *   epic_id: 'epic-123',
 *   requirements: [
 *     'Users can edit personal information',
 *     'Profile changes are validated',
 *     'Avatar upload functionality'
 *   ],
 *   created_at: new Date(),
 *   updated_at: new Date()
 * };
 * ```
 */
export interface FeatureDocumentEntity extends BaseDocumentEntity {
  /** Type discriminator, always 'feature' for feature documents */
  type: 'feature';
  /** Optional reference to parent epic containing this feature */
  epic_id?: string;
  /** List of functional requirements for the feature */
  requirements: string[];
}
/**
 * Epic document entity representing a large-scale initiative or project theme.
 *
 * Represents a significant body of work spanning multiple features and sprints. Epics provide
 * high-level organization and strategic alignment for development efforts. Contains collections
 * of related features and defines strategic objectives for business value delivery.
 *
 * @interface EpicDocumentEntity
 * @extends BaseDocumentEntity
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const epic: EpicDocumentEntity = {
 *   id: 'epic-123',
 *   type: 'epic',
 *   title: 'User Authentication System',
 *   content: 'Complete overhaul of user authentication and authorization',
 *   status: 'planning',
 *   features: ['feature-789', 'feature-790', 'feature-791'],
 *   objectives: [
 *     'Improve system security',
 *     'Reduce authentication complexity',
 *     'Enable SSO integration'
 *   ],
 *   created_at: new Date(),
 *   updated_at: new Date()
 * };
 * ```
 */
export interface EpicDocumentEntity extends BaseDocumentEntity {
  /** Type discriminator, always 'epic' for epic documents */
  type: 'epic';
  /** Array of feature IDs that belong to this epic */
  features: string[];
  /** Strategic objectives and business goals for the epic */
  objectives: string[];
}
/**
 * Result of automated code analysis containing issue details and context.
 *
 * Represents findings from static code analysis, security scans, or quality checks.
 * Provides precise location information, severity assessment, and contextual details
 * needed for generating actionable swarm tasks. Used as source input for task generation.
 *
 * @interface CodeAnalysisResult
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const analysis: CodeAnalysisResult = {
 *   filePath: 'src/auth/login.ts',
 *   lineNumber: 42,
 *   type: 'security_vulnerability',
 *   severity: 'high',
 *   codeSnippet: 'const token = req.headers.authorization;',
 *   tags: ['security', 'authentication', 'jwt']
 * };
 * ```
 */
export interface CodeAnalysisResult {
  /** File path where the issue was detected */
  filePath: string;
  /** Specific line number of the issue (if applicable) */
  lineNumber?: number;
  /** Type or category of the analysis result */
  type: string;
  /** Severity level of the detected issue */
  severity: 'low | medium' | 'high''' | '''critical';
  /** Code snippet showing the problematic code (if applicable) */
  codeSnippet?: string;
  /** Categorization tags for filtering and organization */
  tags: string[];
}
/**
 * Generated swarm task ready for human approval and agent execution.
 *
 * Represents a complete task specification generated from code analysis results.
 * Contains all necessary information for swarm agent assignment and execution,
 * including priority, effort estimation, and detailed acceptance criteria.
 * Requires human approval before being added to the swarm execution queue.
 *
 * @interface GeneratedSwarmTask
 * @since 1.0.0
 *
 * @see {@link CodeAnalysisResult} - Source analysis that generated this task
 * @see {@link TaskApprovalDecision} - Approval workflow for this task
 *
 * @example
 * ```typescript
 * const swarmTask: GeneratedSwarmTask = {
 *   id: 'task-456',
 *   title: 'Fix SQL injection vulnerability',
 *   description: 'Replace direct SQL query with parameterized statement',
 *   type: 'bug',
 *   priority: 'critical',
 *   estimatedHours: 2,
 *   suggestedSwarmType: 'security',
 *   requiredAgentTypes: ['security-analyst', 'backend-developer'],
 *   acceptanceCriteria: [
 *     'SQL query uses parameterized statements',
 *     'Security tests pass',
 *     'No functionality regression'
 *   ],
 *   sourceAnalysis: { filePath: 'src/db/query.ts', severity: 'critical', ... }
 * };
 * ```
 */
export interface GeneratedSwarmTask {
  /** Unique identifier for the task */
  id: string;
  /** Human-readable task title */
  title: string;
  /** Detailed task description and context */
  description: string;
  /** Task classification for routing and prioritization */
  type: 'task | feature' | 'epic' | 'bug' | 'improvement';
  /** Priority level affecting execution order */
  priority: 'low | medium' | 'high''' | '''critical';
  /** Estimated hours required for completion */
  estimatedHours: number;
  /** Recommended swarm type for optimal task execution */
  suggestedSwarmType: string;
  /** List of agent types required for task completion */
  requiredAgentTypes: string[];
  /** Detailed criteria for validating task completion */
  acceptanceCriteria: string[];
  /** Original code analysis result that generated this task */
  sourceAnalysis: CodeAnalysisResult;
}
/**
 * Comprehensive results from automated document or code scanning process.
 *
 * Contains statistical summary and generated tasks from analyzing documents, code,
 * or other project artifacts. Provides metrics for scan performance and issue
 * categorization to help users understand the scope of work identified.
 * Used as input to the task approval workflow.
 *
 * @interface ScanResults
 * @since 1.0.0
 *
 * @see {@link GeneratedSwarmTask} - Individual tasks generated from scan
 *
 * @example
 * ```typescript
 * const scanResults: ScanResults = {
 *   scannedFiles: 127,
 *   totalIssues: 45,
 *   generatedTasks: [task1, task2, task3],
 *   scanDuration: 15000,
 *   severityCounts: { critical: 2, high: 8, medium: 20, low: 15 },
 *   patternCounts: { security: 10, performance: 15, maintainability: 20 }
 * };
 * ```
 */
export interface ScanResults {
  /** Total number of files processed during the scan */
  scannedFiles: number;
  /** Total number of issues identified across all files */
  totalIssues: number;
  /** Collection of tasks generated from the scan results */
  generatedTasks: GeneratedSwarmTask[];
  /** Time taken to complete the scan in milliseconds */
  scanDuration: number;
  /** Count of issues grouped by severity level */
  severityCounts: Record<string, number>;
  /** Count of issues grouped by pattern or category type */
  patternCounts: Record<string, number>;
}
/**
 * Request for human approval of a generated swarm task.
 *
 * Represents a formal request to review and approve a task before it enters
 * the swarm execution pipeline. Contains task details, requester information,
 * and timestamp for audit trail purposes. Used by the approval workflow system
 * to track pending approvals and maintain accountability.
 *
 * @interface ApprovalRequest
 * @since 1.0.0
 *
 * @see {@link GeneratedSwarmTask} - Task being requested for approval
 * @see {@link TaskApprovalDecision} - Response to this approval request
 *
 * @example
 * ```typescript
 * const approvalRequest: ApprovalRequest = {
 *   taskId: 'task-456',
 *   task: generatedSwarmTask,
 *   requestedBy: 'code-analysis-system',
 *   timestamp: new Date()
 * };
 * ```
 */
export interface ApprovalRequest {
  /** Unique identifier matching the task being approved */
  taskId: string;
  /** Complete task details for review */
  task: GeneratedSwarmTask;
  /** System or user that requested the approval */
  requestedBy: string;
  /** When the approval request was created */
  timestamp: Date;
}
/**
 * Configuration options for the task approval workflow behavior.
 *
 * Defines how the approval system handles batch processing, automatic approvals,
 * and rejection requirements. These settings control the workflow behavior and
 * can be tuned based on team preferences and risk tolerance for automated task generation.
 *
 * @interface ApprovalWorkflowConfig
 * @since 1.0.0
 *
 * @see {@link TaskApprovalConfig} - Extended configuration for the approval system
 *
 * @example
 * ```typescript
 * const workflowConfig: ApprovalWorkflowConfig = {
 *   enableBatchApproval: true,
 *   autoApproveThreshold: 0.8,
 *   requireExplicitRejection: false
 * };
 * ```
 */
export interface ApprovalWorkflowConfig {
  /** Whether to allow processing multiple tasks simultaneously */
  enableBatchApproval: boolean;
  /** Confidence threshold for automatic approval (0.0-1.0) */
  autoApproveThreshold: number;
  /** Whether rejections must include explicit rationale */
  requireExplicitRejection: boolean;
}
/**
 * Approval decision for a generated task
 */
export interface TaskApprovalDecision {
  taskId: string;
  approved: boolean;
  decision: 'approve | reject' | 'modify''' | '''defer';
  modifications?: {
    title?: string;
    description?: string;
    priority?: 'low | medium' | 'high''' | '''critical';
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
export declare class TaskApprovalSystem extends TypedEventBase {
  private agui;
  private config;
  private approvalHistory;
  private storage;
  private statistics;
  private systemMonitor;
  private performanceTracker;
  private agentMonitor;
  private mlMonitor;
  private logger;
  private approvalCircuitBreaker;
  private storageCircuitBreaker;
  private aguiCircuitBreaker;
  private isInitialized;
  private shutdownInProgress;
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
   * Process a batch of tasks for approval with Foundation monitoring
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
   * Update approval statistics with Foundation telemetry
   */
  private updateStatistics;
  /**
   * Get approval statistics with Foundation telemetry
   */
  getStatistics(): ApprovalStatistics;
  /**
   * Get approval history with Foundation telemetry
   */
  getApprovalHistory(): TaskApprovalDecision[];
  /**
   * Export approval decisions for audit with Foundation telemetry
   */
  exportDecisions(format?: 'json''' | '''csv'): string;
  /**
   * Graceful shutdown with Foundation cleanup
   */
  shutdown(): Promise<void>;
}
/**
 * Create task approval system with AGUI integration
 */
export declare function createTaskApprovalSystem(
  agui: AGUIInterface,
  config?: Partial<TaskApprovalConfig>
): TaskApprovalSystem;
