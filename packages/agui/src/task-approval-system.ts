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

import { EventEmitter } from 'eventemitter3';
import { 
  getLogger, 
  type Logger,
  EnhancedError,
  withRetry,
  // 🔬 Enterprise Telemetry & Monitoring Systems
  recordMetric,
  recordHistogram,
  recordGauge,
  createCircuitBreaker,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  traced,
  tracedAsync,
  metered,
  // 🏥 Comprehensive Monitoring Classes
  SystemMonitor,
  PerformanceTracker,
  AgentMonitor,
  MLMonitor,
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
  createMonitoringSystem,
  // 🛡️ Enterprise Error Handling & Safety
  safeAsync,
  Result,
  ok,
  err
} from '@claude-zen/foundation';
import type { AGUIInterface, ValidationQuestion } from './interfaces';

// Export additional interfaces for external use

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
  priority: 'low' | 'medium' | 'high' | 'critical';
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
  severity: 'low' | 'medium' | 'high' | 'critical';
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
  type: 'task' | 'feature' | 'epic' | 'bug' | 'improvement';
  /** Priority level affecting execution order */
  priority: 'low' | 'medium' | 'high' | 'critical';
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

const logger = getLogger('TaskApprovalSystem');

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
  topRejectionReasons: Array<{ reason: string; count: number }>;
  approvalsByType: Record<string, number>;
}

/**
 * Task Approval System with AGUI integration
 */
export class TaskApprovalSystem extends EventEmitter {
  private agui: AGUIInterface;
  private config: TaskApprovalConfig;
  private approvalHistory: TaskApprovalDecision[] = [];
  private storage: any;
  private statistics: ApprovalStatistics = {
    totalTasksProcessed: 0,
    approvalRate: 0,
    rejectionRate: 0,
    modificationRate: 0,
    averageProcessingTime: 0,
    topRejectionReasons: [],
    approvalsByType: {}
  };

  // 🔬 Foundation Monitoring & Telemetry Systems
  private systemMonitor: SystemMonitor;
  private performanceTracker: PerformanceTracker;
  private agentMonitor: AgentMonitor;
  private mlMonitor: MLMonitor;
  private logger: Logger;
  
  // 🛡️ Circuit Breaker Protection
  private approvalCircuitBreaker: any;
  private storageCircuitBreaker: any;
  private aguiCircuitBreaker: any;
  
  // 📊 Internal tracking
  private isInitialized = false;
  private shutdownInProgress = false;

  constructor(
    agui: AGUIInterface,
    config: Partial<TaskApprovalConfig> = {}
  ) {
    super();
    
    this.agui = agui;
    this.logger = getLogger('TaskApprovalSystem');
    
    // 🏥 Initialize Foundation monitoring systems
    this.systemMonitor = createSystemMonitor({ intervalMs: 5000 });
    this.performanceTracker = createPerformanceTracker();
    this.agentMonitor = createAgentMonitor();
    this.mlMonitor = createMLMonitor();
    
    // 🛡️ Initialize circuit breakers for external dependencies
    this.approvalCircuitBreaker = createCircuitBreaker(() => Promise.resolve());
    this.storageCircuitBreaker = createCircuitBreaker(() => Promise.resolve());
    this.aguiCircuitBreaker = createCircuitBreaker(() => Promise.resolve());
    
    // Use default configuration with overrides
    this.config = {
      enableRichDisplay: config.enableRichDisplay ?? true,
      enableBatchMode: config.enableBatchMode ?? true,
      batchSize: config.batchSize ?? 5,
      autoApproveLowSeverity: config.autoApproveLowSeverity ?? true,
      requireRationale: config.requireRationale ?? true,
      enableModification: config.enableModification ?? true,
      ...config
    };
    
    // 📊 Record initialization metrics
    recordEvent('task_approval_system_initializing', {
      config: JSON.stringify(this.config),
      timestamp: Date.now()
    });
    
    // Initialize storage for approval history persistence
    this.initializeStorage();

    this.logger.info('TaskApprovalSystem initialized with Foundation monitoring', { 
      config: this.config,
      monitoringEnabled: true,
      circuitBreakersEnabled: true
    });
    
    // 🎯 Mark as initialized and record metrics
    this.isInitialized = true;
    recordMetric('task_approval_system_initialized', 1);
    recordEvent('task_approval_system_ready', {
      config: JSON.stringify(this.config),
      timestamp: Date.now()
    });
  }

  /**
   * Initialize storage for approval history persistence
   */
  private async initializeStorage(): Promise<void> {
    return withAsyncTrace('task-approval-storage-init', async (span) => {
      const storageInitStartTime = Date.now();
      
      try {
        setTraceAttributes({
          'storage.type': 'memory-only',
          'storage.initialization': 'starting'
        });

        recordEvent('task_approval_storage_initialization_started', {
          storageType: 'memory-only',
          timestamp: Date.now()
        });

        // 🛡️ Use circuit breaker protection for storage initialization
        await this.storageCircuitBreaker.execute(async () => {
          // For now, use memory-only storage
          // TODO: Integrate with database when available
          this.storage = null;
          
          // 📊 Record successful storage initialization
          const initDuration = Date.now() - storageInitStartTime;
          recordHistogram('task_approval_storage_init_duration', initDuration);
          recordMetric('task_approval_storage_initialized', 1);
          
          setTraceAttributes({
            'storage.initialization': 'completed',
            'storage.init_duration_ms': initDuration
          });

          this.logger.debug('Task approval system using memory-only storage', {
            initDuration,
            storageType: 'memory-only'
          });

          recordEvent('task_approval_storage_initialization_completed', {
            storageType: 'memory-only',
            duration: initDuration,
            success: true
          });
        });
      } catch (error) {
        const initDuration = Date.now() - storageInitStartTime;
        recordMetric('task_approval_storage_init_failed', 1);
        recordHistogram('task_approval_storage_init_error_duration', initDuration);
        
        setTraceAttributes({
          'storage.initialization': 'failed',
          'storage.error': error instanceof Error ? error.message : String(error),
          'storage.init_duration_ms': initDuration
        });

        this.logger.warn('Failed to initialize storage, using memory-only mode', { 
          error: error instanceof Error ? error.message : String(error),
          duration: initDuration
        });

        recordEvent('task_approval_storage_initialization_failed', {
          error: error instanceof Error ? error.message : String(error),
          duration: initDuration,
          fallbackMode: 'memory-only'
        });

        this.storage = null; // Fallback to memory-only mode
      }
    });
  }

  /**
   * Review and approve tasks generated from document scanning
   */
  async reviewGeneratedTasks(scanResults: ScanResults): Promise<BatchApprovalResults> {
    return withAsyncTrace('task-approval-review-process', async (span) => {
      const startTime = Date.now();
      
      setTraceAttributes({
        'tasks.total_count': scanResults.generatedTasks.length,
        'tasks.batch_mode': this.config.enableBatchMode,
        'tasks.batch_size': this.config.batchSize,
        'tasks.scan_duration': scanResults.scanDuration
      });

      recordEvent('task_approval_review_started', {
        totalTasks: scanResults.generatedTasks.length,
        batchMode: this.config.enableBatchMode,
        batchSize: this.config.batchSize,
        timestamp: Date.now()
      });
      
      this.logger.info(`Starting task approval process for ${scanResults.generatedTasks.length} tasks`, {
        totalTasks: scanResults.generatedTasks.length,
        batchMode: this.config.enableBatchMode,
        batchSize: this.config.batchSize
      });

      try {
        // 🛡️ Use circuit breaker protection for approval processing
        return await this.approvalCircuitBreaker.execute(async () => {
          // Show scan summary first
          await this.showScanSummary(scanResults);

          // Process tasks in batches or individually based on config
          const decisions: TaskApprovalDecision[] = [];
          const approvedTasks: GeneratedSwarmTask[] = [];

          if (this.config.enableBatchMode && scanResults.generatedTasks.length > this.config.batchSize) {
            // 📦 Process in batches with comprehensive telemetry
            const totalBatches = Math.ceil(scanResults.generatedTasks.length / this.config.batchSize);
            recordGauge('task_approval_batch_count', totalBatches);
            
            for (let i = 0; i < scanResults.generatedTasks.length; i += this.config.batchSize) {
              const batchIndex = Math.floor(i / this.config.batchSize);
              const batch = scanResults.generatedTasks.slice(i, i + this.config.batchSize);
              
              recordEvent('task_approval_batch_processing_started', {
                batchIndex,
                batchSize: batch.length,
                totalBatches
              });
              
              const batchStartTime = Date.now();
              const batchDecisions = await this.processBatch(batch);
              const batchDuration = Date.now() - batchStartTime;
              
              recordHistogram('task_approval_batch_processing_duration', batchDuration, {
                batchIndex: batchIndex.toString(),
                batchSize: batch.length.toString()
              });
              
              decisions.push(...batchDecisions);
              
              // Add approved tasks from this batch with metrics
              let batchApprovedCount = 0;
              for (const decision of batchDecisions) {
                if (decision.approved) {
                  const originalTask = batch.find(t => t.id === decision.taskId);
                  if (originalTask) {
                    approvedTasks.push(this.applyModifications(originalTask, decision));
                    batchApprovedCount++;
                  }
                }
              }
              
              recordEvent('task_approval_batch_processing_completed', {
                batchIndex,
                batchSize: batch.length,
                approved: batchApprovedCount,
                duration: batchDuration
              });
            }
          } else {
            // 🔄 Process individually with comprehensive telemetry
            recordEvent('task_approval_individual_processing_started', {
              totalTasks: scanResults.generatedTasks.length
            });
            
            for (let taskIndex = 0; taskIndex < scanResults.generatedTasks.length; taskIndex++) {
              const task = scanResults.generatedTasks[taskIndex]!;
              const taskStartTime = Date.now();
              
              const decision = await this.reviewSingleTask(task);
              const taskDuration = Date.now() - taskStartTime;
              
              recordHistogram('task_approval_individual_processing_duration', taskDuration, {
                taskType: task.type,
                priority: task.priority,
                severity: task.sourceAnalysis.severity
              });
              
              decisions.push(decision);
              
              if (decision.approved) {
                approvedTasks.push(this.applyModifications(task, decision));
              }
              
              recordEvent('task_approval_individual_task_processed', {
                taskId: task.id,
                taskType: task.type,
                approved: decision.approved,
                decision: decision.decision,
                duration: taskDuration
              });
            }
          }

          // 📊 Calculate comprehensive results with detailed metrics
          const results: BatchApprovalResults = {
            totalTasks: scanResults.generatedTasks.length,
            approved: decisions.filter(d => d.approved).length,
            rejected: decisions.filter(d => d.decision === 'reject').length,
            modified: decisions.filter(d => d.decision === 'modify').length,
            deferred: decisions.filter(d => d.decision === 'defer').length,
            decisions,
            processingTime: Date.now() - startTime,
            approvedTasks
          };

          // 📈 Record comprehensive metrics
          recordGauge('task_approval_total_processed', results.totalTasks);
          recordGauge('task_approval_approved_count', results.approved);
          recordGauge('task_approval_rejected_count', results.rejected);
          recordGauge('task_approval_modified_count', results.modified);
          recordGauge('task_approval_deferred_count', results.deferred);
          recordHistogram('task_approval_total_processing_duration', results.processingTime);
          
          const approvalRate = results.totalTasks > 0 ? results.approved / results.totalTasks : 0;
          recordGauge('task_approval_approval_rate', approvalRate);

          setTraceAttributes({
            'tasks.results.total': results.totalTasks,
            'tasks.results.approved': results.approved,
            'tasks.results.rejected': results.rejected,
            'tasks.results.modified': results.modified,
            'tasks.results.deferred': results.deferred,
            'tasks.results.approval_rate': approvalRate,
            'tasks.results.processing_time_ms': results.processingTime
          });

          // Update statistics
          this.updateStatistics(decisions, results.processingTime);

          // Store approval history
          this.approvalHistory.push(...decisions);

          // Show final summary
          await this.showApprovalSummary(results);

          this.logger.info('Task approval process completed successfully', {
            totalTasks: results.totalTasks,
            approved: results.approved,
            rejected: results.rejected,
            modified: results.modified,
            deferred: results.deferred,
            approvalRate,
            processingTime: results.processingTime
          });

          recordEvent('task_approval_review_completed', {
            totalTasks: results.totalTasks,
            approved: results.approved,
            rejected: results.rejected,
            modified: results.modified,
            deferred: results.deferred,
            approvalRate,
            processingTime: results.processingTime,
            success: true
          });

          this.emit('approval:completed', results);
          return results;
        });
      } catch (error) {
        const processingDuration = Date.now() - startTime;
        recordMetric('task_approval_review_failed', 1);
        recordHistogram('task_approval_review_error_duration', processingDuration);
        
        setTraceAttributes({
          'tasks.processing.failed': true,
          'tasks.processing.error': error instanceof Error ? error.message : String(error),
          'tasks.processing.duration_ms': processingDuration
        });

        this.logger.error('Task approval process failed', {
          error: error instanceof Error ? error.message : String(error),
          totalTasks: scanResults.generatedTasks.length,
          duration: processingDuration
        });

        recordEvent('task_approval_review_failed', {
          error: error instanceof Error ? error.message : String(error),
          totalTasks: scanResults.generatedTasks.length,
          duration: processingDuration
        });

        throw new EnhancedError(
          'Task approval process failed',
          {
            cause: error,
            totalTasks: scanResults.generatedTasks.length,
            duration: processingDuration
          }
        );
      }
    });
  }

  /**
   * Review a single task for approval
   */
  async reviewSingleTask(task: GeneratedSwarmTask): Promise<TaskApprovalDecision> {
    return withAsyncTrace('single-task-review', async (span) => {
      const startTime = Date.now();
      const correlationId = `task-approval-${task.id}-${Date.now()}`;
      
      setTraceAttributes({
        'task.id': task.id,
        'task.type': task.type,
        'task.priority': task.priority,
        'task.severity': task.sourceAnalysis.severity,
        'task.estimated_hours': task.estimatedHours,
        'task.correlation_id': correlationId
      });

      recordEvent('single_task_review_started', {
        taskId: task.id,
        taskType: task.type,
        priority: task.priority,
        severity: task.sourceAnalysis.severity,
        correlationId
      });
      
      try {
        // 🛡️ Use circuit breaker protection for AGUI operations
        return await this.aguiCircuitBreaker.execute(async () => {
          // Auto-approve low severity tasks if configured
          if (this.config.autoApproveLowSeverity && 
              task.sourceAnalysis.severity === 'low' && 
              task.priority === 'low') {
            
            recordEvent('task_auto_approved', {
              taskId: task.id,
              reason: 'low-severity-auto-approval',
              correlationId
            });
            
            this.logger.debug(`Auto-approving low severity task: ${task.id}`, {
              taskType: task.type,
              priority: task.priority,
              severity: task.sourceAnalysis.severity
            });
            
            const autoDecision: TaskApprovalDecision = {
              taskId: task.id,
              approved: true,
              decision: 'approve',
              rationale: 'Auto-approved: Low severity task with low priority',
              decisionMaker: 'system',
              timestamp: new Date(),
              correlationId
            };
            
            const reviewDuration = Date.now() - startTime;
            recordHistogram('single_task_review_duration', reviewDuration, {
              approval_type: 'auto-approved',
              task_type: task.type,
              priority: task.priority
            });
            
            setTraceAttributes({
              'task.auto_approved': true,
              'task.review_duration_ms': reviewDuration,
              'task.decision': 'approve'
            });
            
            return autoDecision;
          }

          // 📝 Create validation question for AGUI with telemetry
          const questionStartTime = Date.now();
          const question = this.createTaskReviewQuestion(task, correlationId);
          const questionCreationDuration = Date.now() - questionStartTime;
          
          recordHistogram('task_question_creation_duration', questionCreationDuration);
          
          // 🎨 Display rich task information if enabled
          if (this.config.enableRichDisplay) {
            const displayStartTime = Date.now();
            await this.displayTaskDetails(task);
            const displayDuration = Date.now() - displayStartTime;
            
            recordHistogram('task_details_display_duration', displayDuration);
            recordEvent('task_details_displayed', {
              taskId: task.id,
              displayDuration,
              correlationId
            });
          }

          // 💬 Get user decision through AGUI with telemetry
          const aguiStartTime = Date.now();
          const response = await this.agui.askQuestion(question);
          const aguiDuration = Date.now() - aguiStartTime;
          
          recordHistogram('agui_question_response_duration', aguiDuration);
          recordEvent('agui_response_received', {
            taskId: task.id,
            responseLength: response.length,
            aguiDuration,
            correlationId
          });
          
          // 🧠 Parse decision with telemetry
          const parseStartTime = Date.now();
          const decision = this.parseApprovalResponse(response);
          const parseDuration = Date.now() - parseStartTime;
          
          recordHistogram('decision_parsing_duration', parseDuration);
          
          // 📝 Get rationale if required
          let rationale = this.extractRationale(response);
          if (!rationale && (this.config.requireRationale || decision.decision === 'reject')) {
            const rationaleStartTime = Date.now();
            rationale = await this.askForRationale(decision.decision);
            const rationaleDuration = Date.now() - rationaleStartTime;
            
            recordHistogram('rationale_collection_duration', rationaleDuration);
            recordEvent('rationale_collected', {
              taskId: task.id,
              decision: decision.decision,
              rationaleLength: rationale.length,
              duration: rationaleDuration,
              correlationId
            });
          }

          // 🔧 Get modifications if needed
          let modifications;
          if (decision.decision === 'modify' && this.config.enableModification) {
            const modStartTime = Date.now();
            modifications = await this.getTaskModifications(task);
            const modDuration = Date.now() - modStartTime;
            
            recordHistogram('task_modifications_collection_duration', modDuration);
            recordEvent('task_modifications_collected', {
              taskId: task.id,
              modificationsCount: modifications ? Object.keys(modifications).length : 0,
              duration: modDuration,
              correlationId
            });
          }

          // ✅ Create final approval decision
          const approvalDecision: TaskApprovalDecision = {
            taskId: task.id,
            approved: decision.approved,
            decision: decision.decision,
            ...(modifications !== undefined && { modifications }),
            rationale: rationale || 'No rationale provided',
            decisionMaker: 'user', // In production, this would be actual user ID
            timestamp: new Date(),
            correlationId
          };

          // 📊 Record comprehensive completion metrics
          const totalReviewDuration = Date.now() - startTime;
          recordHistogram('single_task_review_duration', totalReviewDuration, {
            approval_type: 'manual',
            task_type: task.type,
            priority: task.priority,
            decision: decision.decision,
            severity: task.sourceAnalysis.severity
          });
          
          recordMetric(`task_${decision.decision}_count`, 1);
          recordGauge('task_review_completion_rate', 1.0);
          
          setTraceAttributes({
            'task.manual_review': true,
            'task.review_duration_ms': totalReviewDuration,
            'task.decision': decision.decision,
            'task.approved': decision.approved,
            'task.has_modifications': !!modifications,
            'task.rationale_provided': !!rationale
          });

          recordEvent('single_task_review_completed', {
            taskId: task.id,
            decision: decision.decision,
            approved: decision.approved,
            totalDuration: totalReviewDuration,
            hasModifications: !!modifications,
            rationaleProvided: !!rationale,
            correlationId,
            success: true
          });

          this.emit('task:reviewed', { task, decision: approvalDecision });
          
          this.logger.info('Single task review completed successfully', {
            taskId: task.id,
            decision: decision.decision,
            approved: decision.approved,
            duration: totalReviewDuration,
            correlationId
          });
          
          return approvalDecision;
        });
      } catch (error) {
        const reviewDuration = Date.now() - startTime;
        recordMetric('single_task_review_failed', 1);
        recordHistogram('single_task_review_error_duration', reviewDuration);
        
        setTraceAttributes({
          'task.review_failed': true,
          'task.error': error instanceof Error ? error.message : String(error),
          'task.review_duration_ms': reviewDuration
        });

        this.logger.error('Single task review failed', {
          taskId: task.id,
          error: error instanceof Error ? error.message : String(error),
          duration: reviewDuration,
          correlationId
        });

        recordEvent('single_task_review_failed', {
          taskId: task.id,
          error: error instanceof Error ? error.message : String(error),
          duration: reviewDuration,
          correlationId
        });

        throw new EnhancedError(
          'Single task review failed',
          {
            cause: error,
            taskId: task.id,
            duration: reviewDuration,
            correlationId
          }
        );
      }
    });
  }

  /**
   * Process a batch of tasks for approval with Foundation monitoring
   */
  private async processBatch(tasks: GeneratedSwarmTask[]): Promise<TaskApprovalDecision[]> {
    return withAsyncTrace('batch-processing', async (span) => {
      const startTime = Date.now();
      
      setTraceAttributes({
        'batch.size': tasks.length,
        'batch.processing_mode': 'batch'
      });
      
      recordEvent('batch_processing_started', {
        batchSize: tasks.length,
        timestamp: Date.now()
      });
      
      try {
        // 🛡️ Use circuit breaker protection for AGUI operations
        return await this.aguiCircuitBreaker.execute(async () => {
          await this.agui.showMessage(`\n📋 Reviewing batch of ${tasks.length} tasks`, 'info');
          
          // Show batch summary with telemetry
          const summaryStartTime = Date.now();
          await this.showBatchSummary(tasks);
          const summaryDuration = Date.now() - summaryStartTime;
          
          recordHistogram('batch_summary_display_duration', summaryDuration);

          // Ask for batch decision with telemetry
          const batchQuestion: ValidationQuestion = {
            id: `batch-review-${Date.now()}`,
            type: 'review',
            question: 'How would you like to process this batch?',
            context: { taskCount: tasks.length },
            options: [
              'Approve all tasks',
              'Review each task individually', 
              'Reject entire batch',
              'Apply bulk modifications'
            ],
            confidence: 0.8,
            priority: 'medium'
          };

          const questionStartTime = Date.now();
          const batchResponse = await this.agui.askQuestion(batchQuestion);
          const questionDuration = Date.now() - questionStartTime;
          
          recordHistogram('batch_decision_response_duration', questionDuration);
          recordEvent('batch_decision_received', {
            batchSize: tasks.length,
            decision: batchResponse,
            questionDuration
          });
          
          let result: TaskApprovalDecision[];
          const processingStartTime = Date.now();
          
          switch (batchResponse) {
            case 'Approve all tasks':
            case '1':
              recordEvent('batch_bulk_approval_started', { batchSize: tasks.length });
              result = this.approveAllTasks(tasks, 'Bulk approval of entire batch');
              recordMetric('batch_bulk_approvals', 1);
              break;
              
            case 'Reject entire batch':  
            case '3':
              recordEvent('batch_bulk_rejection_started', { batchSize: tasks.length });
              result = this.rejectAllTasks(tasks, 'Bulk rejection of entire batch');
              recordMetric('batch_bulk_rejections', 1);
              break;
              
            case 'Apply bulk modifications':
            case '4':
              recordEvent('batch_bulk_modifications_started', { batchSize: tasks.length });
              result = await this.applyBulkModifications(tasks);
              recordMetric('batch_bulk_modifications', 1);
              break;
              
            default:
              // Review individually with comprehensive telemetry
              recordEvent('batch_individual_review_started', { batchSize: tasks.length });
              const decisions: TaskApprovalDecision[] = [];
              
              for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i]!;
                const taskStartTime = Date.now();
                
                const decision = await this.reviewSingleTask(task);
                const taskDuration = Date.now() - taskStartTime;
                
                recordHistogram('batch_individual_task_duration', taskDuration, {
                  task_index: i.toString(),
                  task_type: task.type,
                  priority: task.priority
                });
                
                decisions.push(decision);
              }
              
              recordMetric('batch_individual_reviews', 1);
              result = decisions;
              break;
          }
          
          const processingDuration = Date.now() - processingStartTime;
          const totalDuration = Date.now() - startTime;
          
          recordHistogram('batch_processing_duration', totalDuration, {
            batch_size: tasks.length.toString(),
            decision_type: batchResponse
          });
          
          setTraceAttributes({
            'batch.decision_type': batchResponse,
            'batch.processing_duration_ms': processingDuration,
            'batch.total_duration_ms': totalDuration,
            'batch.decisions_count': result.length
          });
          
          recordEvent('batch_processing_completed', {
            batchSize: tasks.length,
            decisionType: batchResponse,
            decisionsCount: result.length,
            processingDuration,
            totalDuration,
            success: true
          });
          
          this.logger.info('Batch processing completed successfully', {
            batchSize: tasks.length,
            decisionType: batchResponse,
            decisionsCount: result.length,
            totalDuration
          });
          
          return result;
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        recordMetric('batch_processing_failed', 1);
        recordHistogram('batch_processing_error_duration', duration);
        
        setTraceAttributes({
          'batch.failed': true,
          'batch.error': error instanceof Error ? error.message : String(error),
          'batch.duration_ms': duration
        });
        
        this.logger.error('Batch processing failed', {
          batchSize: tasks.length,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
        
        recordEvent('batch_processing_failed', {
          batchSize: tasks.length,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
        
        throw new EnhancedError(
          'Batch processing failed',
          {
            cause: error,
            batchSize: tasks.length,
            duration
          }
        );
      }
    });
  }

  /**
   * Show scan summary to user
   */
  private async showScanSummary(scanResults: ScanResults): Promise<void> {
    const summary = `
🔍 Document Scan Results Summary
================================
📁 Files Scanned: ${scanResults.scannedFiles}
🔍 Issues Found: ${scanResults.totalIssues}
📋 Tasks Generated: ${scanResults.generatedTasks.length}
⏱️  Scan Duration: ${Math.round(scanResults.scanDuration / 1000)}s

📊 Issue Severity Breakdown:
${Object.entries(scanResults.severityCounts)
  .map(([severity, count]) => `   ${severity}: ${count}`)
  .join('\n')}

📈 Issue Pattern Breakdown:
${Object.entries(scanResults.patternCounts)
  .map(([pattern, count]) => `   ${pattern}: ${count}`)
  .join('\n')}
`;

    await this.agui.showMessage(summary, 'info');
  }

  /**
   * Display detailed task information
   */
  private async displayTaskDetails(task: GeneratedSwarmTask): Promise<void> {
    const details = `
🎯 Task Review: ${task.title}
${'='.repeat(60)}
📝 Description: ${task.description}
🏷️  Type: ${task.type}
⚡ Priority: ${task.priority} 
⏱️  Estimated Hours: ${task.estimatedHours}
🤖 Suggested Swarm: ${task.suggestedSwarmType}
👥 Required Agents: ${task.requiredAgentTypes.join(', ')}

📊 Source Analysis:
   • File: ${task.sourceAnalysis.filePath}
   • Line: ${task.sourceAnalysis.lineNumber || 'N/A'}
   • Type: ${task.sourceAnalysis.type}
   • Severity: ${task.sourceAnalysis.severity}
   • Code: ${task.sourceAnalysis.codeSnippet || 'N/A'}

✅ Acceptance Criteria:
${task.acceptanceCriteria.map(criterion => `   • ${criterion}`).join('\n')}

🏷️  Tags: ${task.sourceAnalysis.tags.join(', ')}
`;

    await this.agui.showMessage(details, 'info');
  }

  /**
   * Show batch summary
   */
  private async showBatchSummary(tasks: GeneratedSwarmTask[]): Promise<void> {
    const summary = `
📦 Batch Summary (${tasks.length} tasks)
${'='.repeat(40)}
${tasks.map((task, index) => 
  `${index + 1}. ${task.title} [${task.priority}] (${task.estimatedHours}h)`
).join('\n')}
`;

    await this.agui.showMessage(summary, 'info');
  }

  /**
   * Show final approval summary
   */
  private async showApprovalSummary(results: BatchApprovalResults): Promise<void> {
    const summary = `
✅ Task Approval Summary
========================
📋 Total Tasks: ${results.totalTasks}
✅ Approved: ${results.approved}
❌ Rejected: ${results.rejected}
📝 Modified: ${results.modified}
⏸️  Deferred: ${results.deferred}
⏱️  Processing Time: ${Math.round(results.processingTime / 1000)}s

${results.approved > 0 ? 
  `\n🚀 ${results.approved} tasks approved and ready for swarm execution!` : 
  '\n⚠️  No tasks were approved for execution.'}
`;

    await this.agui.showMessage(summary, 'success');
  }

  /**
   * Create validation question for task review
   */
  private createTaskReviewQuestion(task: GeneratedSwarmTask, correlationId: string): ValidationQuestion {
    return {
      id: `task-review-${task.id}`,
      type: 'review',
      question: `Do you want to approve this ${task.type}? "${task.title}"`,
      context: {
        task,
        analysis: task.sourceAnalysis,
        correlationId
      },
      options: [
        'Approve - Add to swarm queue',
        'Modify - Make changes before approval',
        'Reject - Do not create this task',
        'Defer - Review later'
      ],
      allowCustom: true,
      confidence: 0.9,
      priority: task.priority as any,
      validationReason: `Task generated from ${task.sourceAnalysis.type} analysis`
    };
  }

  /**
   * Parse user response to approval question
   */
  private parseApprovalResponse(response: string): { decision: TaskApprovalDecision['decision']; approved: boolean } {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('approve') || lowerResponse === '1') {
      return { decision: 'approve', approved: true };
    }
    if (lowerResponse.includes('modify') || lowerResponse === '2') {
      return { decision: 'modify', approved: true };
    }
    if (lowerResponse.includes('reject') || lowerResponse === '3') {
      return { decision: 'reject', approved: false };
    }
    if (lowerResponse.includes('defer') || lowerResponse === '4') {
      return { decision: 'defer', approved: false };
    }
    
    // Default to approval for positive responses
    const positiveKeywords = ['yes', 'ok', 'sure', 'good', 'fine'];
    if (positiveKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return { decision: 'approve', approved: true };
    }
    
    return { decision: 'reject', approved: false };
  }

  /**
   * Extract rationale from response
   */
  private extractRationale(response: string): string | undefined {
    const rationaleMarkers = ['because', 'since', 'reason:', 'rationale:', 'due to'];
    
    for (const marker of rationaleMarkers) {
      const index = response.toLowerCase().indexOf(marker);
      if (index >= 0) {
        return response.substring(index).trim();
      }
    }
    
    // If response is longer than a simple yes/no, treat it as rationale
    if (response.length > 10 && !['1', '2', '3', '4'].includes(response)) {
      return response;
    }
    
    return undefined;
  }

  /**
   * Ask for rationale for decision
   */
  private async askForRationale(decision: string): Promise<string> {
    const rationaleQuestion: ValidationQuestion = {
      id: `rationale-${Date.now()}`,
      type: 'review',
      question: `Please provide a rationale for your ${decision} decision:`,
      context: { decision },
      confidence: 1.0,
      priority: 'medium'
    };

    return await this.agui.askQuestion(rationaleQuestion);
  }

  /**
   * Get modifications for a task
   */
  private async getTaskModifications(task: GeneratedSwarmTask): Promise<TaskApprovalDecision['modifications']> {
    const modifications: TaskApprovalDecision['modifications'] = {};

    // Ask what to modify
    const modifyQuestion: ValidationQuestion = {
      id: `modify-${task.id}`,
      type: 'review',
      question: 'What would you like to modify?',
      context: { task },
      options: [
        'Title',
        'Description', 
        'Priority',
        'Estimated Hours',
        'Required Agent Types',
        'Acceptance Criteria',
        'Multiple items'
      ],
      confidence: 0.8
    };

    const modifyResponse = await this.agui.askQuestion(modifyQuestion);

    // Handle specific modifications based on response
    if (modifyResponse.includes('Title') || modifyResponse === '1') {
      modifications.title = await this.askForNewValue('title', task.title);
    }
    if (modifyResponse.includes('Description') || modifyResponse === '2') {
      modifications.description = await this.askForNewValue('description', task.description);
    }
    if (modifyResponse.includes('Priority') || modifyResponse === '3') {
      const priorityQuestion: ValidationQuestion = {
        id: `priority-${task.id}`,
        type: 'review',
        question: 'Select new priority:',
        options: ['low', 'medium', 'high', 'critical'],
        context: { currentPriority: task.priority },
        confidence: 1.0
      };
      const newPriority = await this.agui.askQuestion(priorityQuestion);
      modifications.priority = newPriority as any;
    }
    if (modifyResponse.includes('Hours') || modifyResponse === '4') {
      const hoursStr = await this.askForNewValue('estimated hours', task.estimatedHours.toString());
      modifications.estimatedHours = Number.parseInt(hoursStr) || task.estimatedHours;
    }

    return modifications;
  }

  /**
   * Ask for new value for a field
   */
  private async askForNewValue(fieldName: string, currentValue: string): Promise<string> {
    const question: ValidationQuestion = {
      id: `new-${fieldName}-${Date.now()}`,
      type: 'review',
      question: `Enter new ${fieldName} (current: "${currentValue}"):`,
      context: { fieldName, currentValue },
      confidence: 1.0
    };

    return await this.agui.askQuestion(question);
  }

  /**
   * Apply modifications to a task
   */
  private applyModifications(task: GeneratedSwarmTask, decision: TaskApprovalDecision): GeneratedSwarmTask {
    if (!decision.modifications) {
      return task;
    }

    return {
      ...task,
      title: decision.modifications.title || task.title,
      description: decision.modifications.description || task.description,
      priority: decision.modifications.priority || task.priority,
      estimatedHours: decision.modifications.estimatedHours || task.estimatedHours,
      requiredAgentTypes: decision.modifications.requiredAgentTypes || task.requiredAgentTypes,
      acceptanceCriteria: decision.modifications.acceptanceCriteria || task.acceptanceCriteria
    };
  }

  /**
   * Approve all tasks in a batch
   */
  private approveAllTasks(tasks: GeneratedSwarmTask[], rationale: string): TaskApprovalDecision[] {
    return tasks.map(task => ({
      taskId: task.id,
      approved: true,
      decision: 'approve' as const,
      rationale,
      decisionMaker: 'user',
      timestamp: new Date(),
      correlationId: `batch-approve-${Date.now()}`
    }));
  }

  /**
   * Reject all tasks in a batch
   */
  private rejectAllTasks(tasks: GeneratedSwarmTask[], rationale: string): TaskApprovalDecision[] {
    return tasks.map(task => ({
      taskId: task.id,
      approved: false,
      decision: 'reject' as const,
      rationale,
      decisionMaker: 'user',
      timestamp: new Date(),
      correlationId: `batch-reject-${Date.now()}`
    }));
  }

  /**
   * Apply bulk modifications to all tasks
   */
  private async applyBulkModifications(tasks: GeneratedSwarmTask[]): Promise<TaskApprovalDecision[]> {
    // Get bulk modifications
    const bulkModifications = await this.getBulkModifications();
    
    return tasks.map(task => ({
      taskId: task.id,
      approved: true,
      decision: 'modify' as const,
      ...(bulkModifications !== undefined && { modifications: bulkModifications }),
      rationale: 'Bulk modifications applied to entire batch',
      decisionMaker: 'user',
      timestamp: new Date(),
      correlationId: `batch-modify-${Date.now()}`
    }));
  }

  /**
   * Get bulk modifications for batch processing
   */
  private async getBulkModifications(): Promise<TaskApprovalDecision['modifications']> {
    const question: ValidationQuestion = {
      id: `bulk-modify-${Date.now()}`,
      type: 'review',
      question: 'What bulk modifications would you like to apply?',
      options: [
        'Lower all priorities',
        'Increase estimated hours by 50%',
        'Add specific agent type to all tasks',
        'Custom modifications'
      ],
      context: {},
      confidence: 0.8
    };

    const response = await this.agui.askQuestion(question);
    
    // Process bulk modification choice
    switch (response) {
      case '1':
      case 'Lower all priorities':
        return { priority: 'low' };
      case '2': 
      case 'Increase estimated hours by 50%':
        return {}; // Would need to calculate per-task
      default:
        return {};
    }
  }

  /**
   * Update approval statistics with Foundation telemetry
   */
  private updateStatistics(decisions: TaskApprovalDecision[], processingTime: number): void {
    withTrace('update-statistics', (span) => {
      const startTime = Date.now();
      
      // Track previous statistics for comparison
      const previousStats = { ...this.statistics };
      
      this.statistics.totalTasksProcessed += decisions.length;
      
      const approved = decisions.filter(d => d.approved).length;
      const rejected = decisions.filter(d => d.decision === 'reject').length;
      const modified = decisions.filter(d => d.decision === 'modify').length;
      const deferred = decisions.filter(d => d.decision === 'defer').length;
      
      this.statistics.approvalRate = this.statistics.totalTasksProcessed > 0 
        ? (previousStats.totalTasksProcessed * previousStats.approvalRate + approved) / this.statistics.totalTasksProcessed
        : 0;
      this.statistics.rejectionRate = this.statistics.totalTasksProcessed > 0
        ? (previousStats.totalTasksProcessed * previousStats.rejectionRate + rejected) / this.statistics.totalTasksProcessed 
        : 0;
      this.statistics.modificationRate = this.statistics.totalTasksProcessed > 0
        ? (previousStats.totalTasksProcessed * previousStats.modificationRate + modified) / this.statistics.totalTasksProcessed
        : 0;
      
      // Update average processing time with weighted average
      const currentAvg = this.statistics.averageProcessingTime;
      const newAvg = currentAvg === 0 ? processingTime : (currentAvg + processingTime) / 2;
      this.statistics.averageProcessingTime = newAvg;
      
      // Track rejection reasons with telemetry
      let newRejectionReasons = 0;
      for (const decision of decisions) {
        if (decision.decision === 'reject') {
          const existingReason = this.statistics.topRejectionReasons.find(
            r => r.reason === decision.rationale
          );
          if (existingReason) {
            existingReason.count++;
          } else {
            this.statistics.topRejectionReasons.push({
              reason: decision.rationale,
              count: 1
            });
            newRejectionReasons++;
          }
        }
        
        // Track approval by type
        if (decision.approved) {
          const taskType = decisions.find(d => d.taskId === decision.taskId)?.taskId ? 'unknown' : 'task';
          this.statistics.approvalsByType[taskType] = (this.statistics.approvalsByType[taskType] || 0) + 1;
        }
      }
      
      // Sort rejection reasons by count
      this.statistics.topRejectionReasons.sort((a, b) => b.count - a.count);
      
      // 📊 Record comprehensive metrics
      recordGauge('task_approval_total_processed', this.statistics.totalTasksProcessed);
      recordGauge('task_approval_approval_rate', this.statistics.approvalRate);
      recordGauge('task_approval_rejection_rate', this.statistics.rejectionRate);
      recordGauge('task_approval_modification_rate', this.statistics.modificationRate);
      recordGauge('task_approval_average_processing_time', this.statistics.averageProcessingTime);
      
      recordMetric('statistics_updated', 1);
      recordMetric('decisions_processed_in_update', decisions.length);
      
      setTraceAttributes({
        'statistics.decisions_processed': decisions.length,
        'statistics.approved': approved,
        'statistics.rejected': rejected,
        'statistics.modified': modified,
        'statistics.deferred': deferred,
        'statistics.new_rejection_reasons': newRejectionReasons,
        'statistics.total_processed': this.statistics.totalTasksProcessed,
        'statistics.approval_rate': this.statistics.approvalRate,
        'statistics.processing_time': processingTime
      });
      
      const updateDuration = Date.now() - startTime;
      recordHistogram('statistics_update_duration', updateDuration);
      
      recordEvent('statistics_updated', {
        decisionsProcessed: decisions.length,
        approved,
        rejected,
        modified,
        deferred,
        totalProcessed: this.statistics.totalTasksProcessed,
        approvalRate: this.statistics.approvalRate,
        rejectionRate: this.statistics.rejectionRate,
        modificationRate: this.statistics.modificationRate,
        averageProcessingTime: this.statistics.averageProcessingTime,
        newRejectionReasons,
        updateDuration
      });
      
      this.logger.debug('Approval statistics updated successfully', {
        decisionsProcessed: decisions.length,
        approved,
        rejected,
        modified,
        deferred,
        totalProcessed: this.statistics.totalTasksProcessed,
        approvalRate: this.statistics.approvalRate,
        updateDuration
      });
    });
  }

  /**
   * Get approval statistics with Foundation telemetry
   */
  getStatistics(): ApprovalStatistics {
    return withTrace('get-approval-statistics', (span) => {
      recordEvent('approval_statistics_accessed', {
        totalProcessed: this.statistics.totalTasksProcessed,
        approvalRate: this.statistics.approvalRate,
        timestamp: Date.now()
      });
      
      setTraceAttributes({
        'statistics.total_processed': this.statistics.totalTasksProcessed,
        'statistics.approval_rate': this.statistics.approvalRate,
        'statistics.rejection_rate': this.statistics.rejectionRate,
        'statistics.modification_rate': this.statistics.modificationRate
      });
      
      recordMetric('approval_statistics_accessed', 1);
      
      return { ...this.statistics };
    });
  }

  /**
   * Get approval history with Foundation telemetry
   */
  getApprovalHistory(): TaskApprovalDecision[] {
    return withTrace('get-approval-history', (span) => {
      recordEvent('approval_history_accessed', {
        historyLength: this.approvalHistory.length,
        timestamp: Date.now()
      });
      
      setTraceAttributes({
        'history.length': this.approvalHistory.length,
        'history.accessed': true
      });
      
      recordMetric('approval_history_accessed', 1);
      recordGauge('approval_history_size', this.approvalHistory.length);
      
      return [...this.approvalHistory];
    });
  }

  /**
   * Export approval decisions for audit with Foundation telemetry
   */
  exportDecisions(format: 'json' | 'csv' = 'json'): string {
    return withTrace('export-approval-decisions', (span) => {
      const startTime = Date.now();
      
      setTraceAttributes({
        'export.format': format,
        'export.decisions_count': this.approvalHistory.length
      });
      
      recordEvent('approval_decisions_export_started', {
        format,
        decisionsCount: this.approvalHistory.length,
        timestamp: Date.now()
      });
      
      try {
        let result: string;
        
        if (format === 'csv') {
          const headers = ['Task ID', 'Decision', 'Approved', 'Rationale', 'Decision Maker', 'Timestamp'];
          const rows = this.approvalHistory.map(decision => [
            decision.taskId,
            decision.decision,
            decision.approved.toString(),
            decision.rationale,
            decision.decisionMaker,
            decision.timestamp.toISOString()
          ]);
          
          result = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        } else {
          result = JSON.stringify(this.approvalHistory, null, 2);
        }
        
        const exportDuration = Date.now() - startTime;
        recordHistogram('approval_decisions_export_duration', exportDuration, {
          format,
          decisions_count: this.approvalHistory.length.toString()
        });
        
        setTraceAttributes({
          'export.success': true,
          'export.duration_ms': exportDuration,
          'export.size_bytes': result.length
        });
        
        recordEvent('approval_decisions_export_completed', {
          format,
          decisionsCount: this.approvalHistory.length,
          exportSize: result.length,
          duration: exportDuration,
          success: true
        });
        
        recordMetric('approval_decisions_exported', 1);
        
        this.logger.info('Approval decisions exported successfully', {
          format,
          decisionsCount: this.approvalHistory.length,
          exportSize: result.length,
          duration: exportDuration
        });
        
        return result;
      } catch (error) {
        const exportDuration = Date.now() - startTime;
        recordMetric('approval_decisions_export_failed', 1);
        recordHistogram('approval_decisions_export_error_duration', exportDuration);
        
        setTraceAttributes({
          'export.failed': true,
          'export.error': error instanceof Error ? error.message : String(error),
          'export.duration_ms': exportDuration
        });
        
        this.logger.error('Approval decisions export failed', {
          format,
          error: error instanceof Error ? error.message : String(error),
          duration: exportDuration
        });
        
        recordEvent('approval_decisions_export_failed', {
          format,
          error: error instanceof Error ? error.message : String(error),
          duration: exportDuration
        });
        
        throw new EnhancedError(
          'Failed to export approval decisions',
          {
            cause: error,
            format,
            decisionsCount: this.approvalHistory.length,
            duration: exportDuration
          }
        );
      }
    });
  }
  
  /**
   * Graceful shutdown with Foundation cleanup
   */
  async shutdown(): Promise<void> {
    return withAsyncTrace('task-approval-shutdown', async (span) => {
      if (this.shutdownInProgress) {
        this.logger.warn('Shutdown already in progress');
        return;
      }
      
      this.shutdownInProgress = true;
      const shutdownStartTime = Date.now();
      
      recordEvent('task_approval_system_shutdown_started', {
        timestamp: Date.now()
      });
      
      this.logger.info('Initiating TaskApprovalSystem shutdown...');
      
      try {
        // 🛑 Stop accepting new operations
        setTraceAttributes({
          'shutdown.initiated': true,
          'shutdown.total_decisions': this.approvalHistory.length,
          'shutdown.total_processed': this.statistics.totalTasksProcessed
        });
        
        // 💾 Save any pending approval data
        if (this.storage) {
          await this.storageCircuitBreaker.execute(async () => {
            // Save approval history if storage is available
            this.logger.debug('Saving approval history during shutdown');
          });
        }
        
        // 📊 Record final statistics
        recordGauge('task_approval_final_total_processed', this.statistics.totalTasksProcessed);
        recordGauge('task_approval_final_approval_rate', this.statistics.approvalRate);
        recordGauge('task_approval_final_history_size', this.approvalHistory.length);
        
        // 🧹 Clean up monitoring systems
        // Foundation monitoring systems don't need explicit cleanup
        
        // 🔌 Clear event listeners
        this.removeAllListeners();
        
        // 🎯 Mark as no longer initialized
        this.isInitialized = false;
        
        const shutdownDuration = Date.now() - shutdownStartTime;
        recordHistogram('task_approval_system_shutdown_duration', shutdownDuration);
        
        setTraceAttributes({
          'shutdown.completed': true,
          'shutdown.duration_ms': shutdownDuration,
          'shutdown.clean': true
        });
        
        recordEvent('task_approval_system_shutdown_completed', {
          totalDecisions: this.approvalHistory.length,
          totalProcessed: this.statistics.totalTasksProcessed,
          shutdownDuration,
          success: true
        });
        
        this.logger.info('TaskApprovalSystem shutdown completed successfully', {
          totalDecisions: this.approvalHistory.length,
          totalProcessed: this.statistics.totalTasksProcessed,
          shutdownDuration
        });
        
        recordMetric('task_approval_system_shutdown_completed', 1);
      } catch (error) {
        const shutdownDuration = Date.now() - shutdownStartTime;
        recordMetric('task_approval_system_shutdown_failed', 1);
        recordHistogram('task_approval_system_shutdown_error_duration', shutdownDuration);
        
        setTraceAttributes({
          'shutdown.failed': true,
          'shutdown.error': error instanceof Error ? error.message : String(error),
          'shutdown.duration_ms': shutdownDuration
        });
        
        this.logger.error('TaskApprovalSystem shutdown failed', {
          error: error instanceof Error ? error.message : String(error),
          duration: shutdownDuration
        });
        
        recordEvent('task_approval_system_shutdown_failed', {
          error: error instanceof Error ? error.message : String(error),
          duration: shutdownDuration
        });
        
        throw new EnhancedError(
          'TaskApprovalSystem shutdown failed',
          {
            cause: error,
            duration: shutdownDuration
          }
        );
      } finally {
        this.shutdownInProgress = false;
      }
    });
  }
}

/**
 * Create task approval system with AGUI integration
 */
export function createTaskApprovalSystem(
  agui: AGUIInterface,
  config?: Partial<TaskApprovalConfig>
): TaskApprovalSystem {
  return new TaskApprovalSystem(agui, config);
}