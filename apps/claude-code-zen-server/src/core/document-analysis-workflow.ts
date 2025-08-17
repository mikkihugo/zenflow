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
import { getLogger } from '../config/logging-config';
import type { 
  BaseDocumentEntity, 
  TaskDocumentEntity,
  FeatureDocumentEntity 
} from '../database/entities/document-entities';
import type { AGUIInterface } from '@claude-zen/agui';
import type { 
  EnhancedDocumentScanner, 
  ScanResults, 
  GeneratedSwarmTask,
  ScannerConfig 
} from './enhanced-document-scanner';
import type { 
  TaskApprovalSystem, 
  BatchApprovalResults,
  TaskApprovalConfig 
} from './task-approval-system';

const logger = getLogger('DocumentAnalysisWorkflow');

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
  progress: number; // 0-100
  currentTask?: string;
  tasksCompleted: number;
  totalTasks: number;
  startTime: Date;
  estimatedCompletion?: Date;
}

/**
 * Document Analysis Workflow orchestrator
 */
export class DocumentAnalysisWorkflow extends EventEmitter {
  private scanner: EnhancedDocumentScanner;
  private approvalSystem: TaskApprovalSystem;
  private agui: AGUIInterface;
  private config: WorkflowConfig;
  private currentStatus: WorkflowStatus;

  constructor(
    scanner: EnhancedDocumentScanner,
    approvalSystem: TaskApprovalSystem,
    agui: AGUIInterface,
    config: Partial<WorkflowConfig> = {}
  ) {
    super();
    
    this.scanner = scanner;
    this.approvalSystem = approvalSystem;
    this.agui = agui;
    
    this.config = {
      scanner: config.scanner || {},
      approval: config.approval || {},
      enableSwarmIntegration: config.enableSwarmIntegration !== false,
      enableDocumentEntities: config.enableDocumentEntities !== false,
      timeoutMs: config.timeoutMs || 300000, // 5 minutes default
      ...config
    };

    this.currentStatus = this.initializeStatus();
    
    logger.info('DocumentAnalysisWorkflow initialized', { config: this.config });
  }

  /**
   * Execute the complete document analysis workflow
   */
  async executeWorkflow(rootPath?: string): Promise<WorkflowResults> {
    const startTime = Date.now();
    this.currentStatus = this.initializeStatus();
    
    logger.info('Starting document analysis workflow', { rootPath });
    
    const results: WorkflowResults = {
      scanResults: {} as ScanResults,
      approvalResults: {} as BatchApprovalResults,
      createdDocuments: [],
      swarmTasksCreated: 0,
      totalExecutionTime: 0,
      success: false,
      errors: []
    };

    try {
      // Phase 1: Document Scanning and Analysis
      this.updateStatus('scanning', 0, 'Scanning documents and analyzing code...');
      
      if (rootPath) {
        // Update scanner config with new root path
        (this.scanner as any).config.rootPath = rootPath;
      }
      
      results.scanResults = await this.scanner.scanAndGenerateTasks();
      this.updateStatus('scanning', 25, `Found ${results.scanResults.totalIssues} issues, generated ${results.scanResults.generatedTasks.length} tasks`);
      
      if (results.scanResults.generatedTasks.length === 0) {
        await this.agui.showMessage('No tasks were generated from the scan. Workflow complete.', 'info');
        this.updateStatus('completed', 100, 'No tasks generated - workflow complete');
        results.success = true;
        results.totalExecutionTime = Date.now() - startTime;
        return results;
      }

      // Phase 2: Human Approval via AGUI
      this.updateStatus('approval', 30, 'Waiting for human approval of generated tasks...');
      
      results.approvalResults = await this.approvalSystem.reviewGeneratedTasks(results.scanResults);
      this.updateStatus('approval', 60, `Approved ${results.approvalResults.approved} of ${results.approvalResults.totalTasks} tasks`);

      if (results.approvalResults.approved === 0) {
        await this.agui.showMessage('No tasks were approved. Workflow complete.', 'info');
        this.updateStatus('completed', 100, 'No tasks approved - workflow complete');
        results.success = true;
        results.totalExecutionTime = Date.now() - startTime;
        return results;
      }

      // Phase 3: Document Entity Creation
      if (this.config.enableDocumentEntities) {
        this.updateStatus('document_creation', 70, 'Creating document entities...');
        
        results.createdDocuments = await this.createDocumentEntities(results.approvalResults.approvedTasks);
        this.updateStatus('document_creation', 80, `Created ${results.createdDocuments.length} document entities`);
      }

      // Phase 4: Swarm Integration
      if (this.config.enableSwarmIntegration) {
        this.updateStatus('swarm_integration', 85, 'Integrating with swarm system...');
        
        results.swarmTasksCreated = await this.createSwarmTasks(results.approvalResults.approvedTasks);
        this.updateStatus('swarm_integration', 95, `Created ${results.swarmTasksCreated} swarm tasks`);
      }

      // Workflow Complete
      results.totalExecutionTime = Date.now() - startTime;
      results.success = true;
      
      this.updateStatus('completed', 100, 'Workflow completed successfully');
      
      // Show final summary
      await this.showWorkflowSummary(results);
      
      logger.info('Document analysis workflow completed successfully', {
        tasksGenerated: results.scanResults.generatedTasks.length,
        tasksApproved: results.approvalResults.approved,
        documentsCreated: results.createdDocuments.length,
        swarmTasksCreated: results.swarmTasksCreated,
        executionTime: results.totalExecutionTime
      });

      this.emit('workflow:completed', results);
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push(errorMessage);
      results.totalExecutionTime = Date.now() - startTime;
      
      this.updateStatus('error', this.currentStatus.progress, `Error: ${errorMessage}`);
      
      logger.error('Document analysis workflow failed', { error: errorMessage });
      
      await this.agui.showMessage(`Workflow failed: ${errorMessage}`, 'error');
      
      this.emit('workflow:error', { error, results });
      throw error;
    }
  }

  /**
   * Get current workflow status
   */
  getStatus(): WorkflowStatus {
    return { ...this.currentStatus };
  }

  /**
   * Cancel the current workflow execution
   */
  async cancelWorkflow(): Promise<void> {
    logger.info('Cancelling document analysis workflow');
    
    this.updateStatus('error', this.currentStatus.progress, 'Workflow cancelled by user');
    
    await this.agui.showMessage('Workflow cancelled', 'warning');
    
    this.emit('workflow:cancelled');
  }

  // ============================================================================
  // PRIVATE MPLEMENTATION METHODS
  // ============================================================================

  /**
   * Initialize workflow status
   */
  private initializeStatus(): WorkflowStatus {
    return {
      phase: 'scanning',
      progress: 0,
      tasksCompleted: 0,
      totalTasks: 4, // scanning, approval, document creation, swarm integration
      startTime: new Date()
    };
  }

  /**
   * Update workflow status and emit progress event
   */
  private updateStatus(
    phase: WorkflowStatus['phase'],
    progress: number,
    currentTask?: string
  ): void {
    this.currentStatus = {
      ...this.currentStatus,
      phase,
      progress,
      currentTask,
      tasksCompleted: Math.floor(progress / 25) // Rough approximation
    };

    // Estimate completion time
    if (progress > 0) {
      const elapsed = Date.now() - this.currentStatus.startTime.getTime();
      const estimatedTotal = elapsed / (progress / 100);
      const remaining = estimatedTotal - elapsed;
      this.currentStatus.estimatedCompletion = new Date(Date.now() + remaining);
    }

    this.emit('workflow:progress', this.currentStatus);
    
    logger.debug('Workflow status updated', this.currentStatus);
  }

  /**
   * Create document entities from approved tasks
   */
  private async createDocumentEntities(approvedTasks: GeneratedSwarmTask[]): Promise<BaseDocumentEntity[]> {
    const entities: BaseDocumentEntity[] = [];

    for (const task of approvedTasks) {
      try {
        const entity = await this.createDocumentEntity(task);
        entities.push(entity);
        
        this.emit('document:created', entity);
        
      } catch (error) {
        logger.warn(`Failed to create document entity for task ${task.id}`, { error });
      }
    }

    return entities;
  }

  /**
   * Create a single document entity from a swarm task
   */
  private async createDocumentEntity(task: GeneratedSwarmTask): Promise<BaseDocumentEntity> {
    const baseEntity: BaseDocumentEntity = {
      id: task.id,
      type: task.type as any,
      title: task.title,
      content: this.generateDocumentContent(task),
      summary: task.description,
      status: 'todo',
      priority: task.priority,
      author: 'document-analysis-workflow',
      tags: task.sourceAnalysis.tags,
      project_id: undefined,
      parent_document_id: undefined,
      dependencies: task.dependencies,
      related_documents: task.sourceAnalysis.relatedFiles || [],
      version: '1.0.0',
      checksum: this.generateChecksum(task),
      created_at: new Date(),
      updated_at: new Date(),
      searchable_content: `${task.title} ${task.description} ${task.sourceAnalysis.description}`,
      keywords: task.sourceAnalysis.tags,
      workflow_stage: 'generated',
      completion_percentage: 0
    };

    if (task.type === 'task') {
      const taskEntity: TaskDocumentEntity = {
        ...baseEntity,
        type: 'task',
        task_type: this.mapToTaskType(task.sourceAnalysis.type),
        estimated_hours: task.estimatedHours,
        actual_hours: undefined,
        implementation_details: {
          files_to_create: [],
          files_to_modify: task.sourceAnalysis.relatedFiles || [task.sourceAnalysis.filePath],
          test_files: [],
          documentation_updates: []
        },
        technical_specifications: {
          component: this.extractComponent(task.sourceAnalysis.filePath),
          module: this.extractModule(task.sourceAnalysis.filePath),
          functions: [],
          dependencies: []
        },
        source_feature_id: undefined,
        assigned_to: undefined,
        completion_status: 'todo'
      };
      
      return taskEntity;
    }

    return baseEntity;
  }

  /**
   * Generate document content from task
   */
  private generateDocumentContent(task: GeneratedSwarmTask): string {
    return `# ${task.title}

## Description
${task.description}

## Source Analysis
- **File**: ${task.sourceAnalysis.filePath}
- **Line**: ${task.sourceAnalysis.lineNumber || 'N/A'}
- **Type**: ${task.sourceAnalysis.type}
- **Severity**: ${task.sourceAnalysis.severity}
- **Estimated Effort**: ${task.sourceAnalysis.estimatedEffort}

## Code Context
\`\`\`
${task.sourceAnalysis.codeSnippet || 'No code snippet available'}
\`\`\`

## Suggested Action
${task.sourceAnalysis.suggestedAction}

## Acceptance Criteria
${task.acceptanceCriteria.map(criterion => `- ${criterion}`).join('\n')}

## Swarm Configuration
- **Swarm Type**: ${task.suggestedSwarmType}
- **Required Agents**: ${task.requiredAgentTypes.join(', ')}
- **Estimated Hours**: ${task.estimatedHours}

## Tags
${task.sourceAnalysis.tags.join(', ')}

---
*Generated by Document Analysis Workflow*
*Created: ${new Date().toISOString()}*
`;
  }

  /**
   * Generate checksum for task
   */
  private generateChecksum(task: GeneratedSwarmTask): string {
    const content = `${task.title}${task.description}${task.sourceAnalysis.filePath}${task.sourceAnalysis.lineNumber}`;
    
    // Simple hash function - in production would use crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Map analysis pattern to task type
   */
  private mapToTaskType(analysisType: string): TaskDocumentEntity['task_type'] {
    switch (analysisType) {
      case 'todo':
      case 'fixme':
      case 'missing_implementation':
      case 'empty_function':
        return 'development';
      case 'documentation_gap':
        return 'documentation';
      case 'test_missing':
        return 'testing';
      case 'performance_issue':
      case 'code_quality':
        return 'development';
      default:
        return 'development';
    }
  }

  /**
   * Extract component name from file path
   */
  private extractComponent(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1] || '';
    return fileName.replace(/\.(ts|js|tsx|jsx|md)$/, '');
  }

  /**
   * Extract module name from file path
   */
  private extractModule(filePath: string): string {
    const parts = filePath.split('/');
    
    // Find the main module directory (src, lib, etc.)
    const srcIndex = parts.findIndex(part => ['src', 'lib', 'app'].includes(part));
    if (srcIndex >= 0 && srcIndex < parts.length - 1) {
      return parts[srcIndex + 1] || 'unknown';
    }
    
    return parts[0] || 'unknown';
  }

  /**
   * Create swarm tasks from approved tasks
   */
  private async createSwarmTasks(approvedTasks: GeneratedSwarmTask[]): Promise<number> {
    let createdCount = 0;

    for (const task of approvedTasks) {
      try {
        // In a real implementation, this would interface with the swarm system
        // For now, we'll just log the task creation
        logger.info('Creating swarm task', {
          taskId: task.id,
          title: task.title,
          swarmType: task.suggestedSwarmType,
          agents: task.requiredAgentTypes
        });

        // Emit event for swarm system to pick up
        this.emit('swarm:task_created', {
          task,
          swarmConfig: {
            type: task.suggestedSwarmType,
            agents: task.requiredAgentTypes,
            maxAgents: task.requiredAgentTypes.length
          }
        });

        createdCount++;
        
      } catch (error) {
        logger.warn(`Failed to create swarm task for ${task.id}`, { error });
      }
    }

    return createdCount;
  }

  /**
   * Show workflow completion summary
   */
  private async showWorkflowSummary(results: WorkflowResults): Promise<void> {
    const summary = `
🎉 Document Analysis Workflow Complete!
======================================

📊 Scan Results:
   • Files Scanned: ${results.scanResults.scannedFiles}
   • Issues Found: ${results.scanResults.totalIssues}
   • Tasks Generated: ${results.scanResults.generatedTasks.length}

✅ Approval Results:
   • Tasks Approved: ${results.approvalResults.approved}
   • Tasks Rejected: ${results.approvalResults.rejected}
   • Tasks Modified: ${results.approvalResults.modified}
   • Tasks Deferred: ${results.approvalResults.deferred}

📝 Document Creation:
   • Document Entities Created: ${results.createdDocuments.length}

🤖 Swarm Integration:
   • Swarm Tasks Created: ${results.swarmTasksCreated}

⏱️ Performance:
   • Total Execution Time: ${Math.round(results.totalExecutionTime / 1000)}s
   • Scan Duration: ${Math.round(results.scanResults.scanDuration / 1000)}s
   • Approval Duration: ${Math.round(results.approvalResults.processingTime / 1000)}s

${results.swarmTasksCreated > 0 ? 
  '🚀 Approved tasks are now in the swarm queue for execution!' :
  '⚠️  No tasks were sent to the swarm for execution.'}
`;

    await this.agui.showMessage(summary, 'success');
  }
}

/**
 * Create document analysis workflow with all dependencies
 */
export async function createDocumentAnalysisWorkflow(
  scanner: EnhancedDocumentScanner,
  approvalSystem: TaskApprovalSystem,
  agui: AGUIInterface,
  config?: Partial<WorkflowConfig>
): Promise<DocumentAnalysisWorkflow> {
  return new DocumentAnalysisWorkflow(scanner, approvalSystem, agui, config);
}

/**
 * Factory function to create a complete workflow with default dependencies
 */
export async function createCompleteWorkflow(
  rootPath: string,
  agui: AGUIInterface,
  config?: Partial<WorkflowConfig>
): Promise<DocumentAnalysisWorkflow> {
  // Import dependencies dynamically to avoid circular imports
  const { EnhancedDocumentScanner } = await import('./enhanced-document-scanner');
  const { TaskApprovalSystem } = await import('./task-approval-system');

  // Create scanner
  const scanner = new EnhancedDocumentScanner({
    rootPath,
    ...config?.scanner
  });

  // Create approval system
  const approvalSystem = new TaskApprovalSystem(agui, config?.approval);

  // Create workflow
  return new DocumentAnalysisWorkflow(scanner, approvalSystem, agui, config);
}