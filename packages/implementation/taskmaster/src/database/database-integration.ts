/**
 * @fileoverview Database Integration - TaskMaster to Main App Connection
 *
 * Integrates existing database schemas with the TaskMaster workflow engine.
 * Uses existing migration schemas and connects to main app database system.
 */

import { getLogger } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import type { 
  WorkflowTask, 
  ApprovalGateInstance, 
  ApprovalRecord,
  TaskState,
  TaskPriority 
} from '../types/index';

const logger = getLogger('DatabaseIntegration');

// ============================================================================
// DATABASE INTEGRATION CLASS
// ============================================================================

export class TaskMasterDatabaseIntegration {
  private database: any;
  private initialized = false;

  constructor() {
    logger.info('TaskMaster Database Integration initialized');
  }

  /**
   * Initialize database connection using existing infrastructure facade
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Connecting to database via infrastructure facade...');
      
      const databaseSystem = await getDatabaseSystem();
      this.database = databaseSystem.createProvider('postgresql');
      
      // Verify migration schemas are applied
      await this.verifySchemas();
      
      this.initialized = true;
      logger.info('Database integration initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize database integration', error);
      throw error;
    }
  }

  /**
   * Verify that TaskMaster schemas are present (from migrations/)
   */
  private async verifySchemas(): Promise<void> {
    try {
      // Check if tasks table exists (from 001_create_tasks_table.ts)
      const tasksTableExists = await this.database.schema.hasTable('tasks');
      if (!tasksTableExists) {
        throw new Error('Tasks table not found - run migrations first');
      }

      // Check if approval_gates table exists 
      const approvalsTableExists = await this.database.schema.hasTable('approval_gates');
      if (!approvalsTableExists) {
        logger.warn('Approval gates table not found - will create during runtime');
      }

      logger.info('Database schemas verified successfully');
      
    } catch (error) {
      logger.error('Schema verification failed', error);
      throw error;
    }
  }

  /**
   * Save workflow task using existing schema
   */
  async saveTask(task: WorkflowTask): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.database('tasks').insert({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        state: task.state,
        complexity: this.mapComplexity(task.estimatedEffort),
        estimated_hours: task.estimatedEffort,
        actual_hours: task.actualEffort || 0,
        assignee_id: task.assignedAgent,
        created_by: task.createdBy || 'system',
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        due_date: task.dueDate,
        completed_at: task.completedAt,
        parent_task_id: task.parentTaskId,
        workflow_id: task.workflowId,
        tags: JSON.stringify(task.tags || []),
        dependencies: JSON.stringify(task.dependencies || []),
        custom_data: JSON.stringify(task.metadata || {})
      }).onConflict('id').merge();

      logger.debug(`Task saved: ${task.id}`);
      
    } catch (error) {
      logger.error('Failed to save task', error, { taskId: task.id });
      throw error;
    }
  }

  /**
   * Load workflow task from database
   */
  async loadTask(taskId: string): Promise<WorkflowTask | null> {
    this.ensureInitialized();
    
    try {
      const row = await this.database('tasks').where('id', taskId).first();
      if (!row) return null;

      return this.mapTaskFromDatabase(row);
      
    } catch (error) {
      logger.error('Failed to load task', error, { taskId });
      throw error;
    }
  }

  /**
   * Load tasks by state for workflow management
   */
  async loadTasksByState(state: TaskState): Promise<WorkflowTask[]> {
    this.ensureInitialized();
    
    try {
      const rows = await this.database('tasks').where('state', state);
      return rows.map((row: any) => this.mapTaskFromDatabase(row));
      
    } catch (error) {
      logger.error('Failed to load tasks by state', error, { state });
      throw error;
    }
  }

  /**
   * Save approval gate instance
   */
  async saveApprovalGate(gate: ApprovalGateInstance): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.database('approval_gates').insert({
        id: gate.id,
        requirement: JSON.stringify(gate.requirement),
        task_id: gate.taskId,
        state: gate.state,
        created_at: gate.createdAt,
        updated_at: gate.updatedAt,
        timeout_at: gate.timeoutAt,
        escalated_at: gate.escalatedAt,
        completed_at: gate.completedAt,
        metadata: JSON.stringify(gate.metadata)
      }).onConflict('id').merge();

      logger.debug(`Approval gate saved: ${gate.id}`);
      
    } catch (error) {
      logger.error('Failed to save approval gate', error, { gateId: gate.id });
      throw error;
    }
  }

  /**
   * Save approval record
   */
  async saveApprovalRecord(record: ApprovalRecord): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.database('approval_records').insert({
        id: record.id,
        gate_id: record.gateId,
        task_id: record.taskId,
        approver_id: record.approverId,
        decision: record.decision,
        reason: record.reason,
        timestamp: record.timestamp,
        metadata: JSON.stringify(record.metadata)
      });

      logger.debug(`Approval record saved: ${record.id}`);
      
    } catch (error) {
      logger.error('Failed to save approval record', error, { recordId: record.id });
      throw error;
    }
  }

  /**
   * Get flow metrics from database for real-time dashboard
   */
  async getFlowMetrics(): Promise<{
    totalTasks: number;
    tasksByState: Record<TaskState, number>;
    averageCycleTime: number;
    averageLeadTime: number;
    throughput: number;
  }> {
    this.ensureInitialized();
    
    try {
      // Total tasks
      const totalResult = await this.database('tasks').count('id as count').first();
      const totalTasks = parseInt(totalResult.count) || 0;

      // Tasks by state
      const stateResults = await this.database('tasks')
        .select('state')
        .count('id as count')
        .groupBy('state');
      
      const tasksByState: Record<string, number> = {};
      stateResults.forEach((row: any) => {
        tasksByState[row.state] = parseInt(row.count) || 0;
      });

      // Cycle time (started to completed)
      const cycleTimeResult = await this.database('tasks')
        .whereNotNull('started_at')
        .whereNotNull('completed_at')
        .select(this.database.raw('AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as avg_hours'))
        .first();
      
      const averageCycleTime = parseFloat(cycleTimeResult.avg_hours) || 0;

      // Lead time (created to completed)
      const leadTimeResult = await this.database('tasks')
        .whereNotNull('completed_at')
        .select(this.database.raw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours'))
        .first();
      
      const averageLeadTime = parseFloat(leadTimeResult.avg_hours) || 0;

      // Throughput (completed tasks per day, last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const throughputResult = await this.database('tasks')
        .where('completed_at', '>=', thirtyDaysAgo)
        .count('id as count')
        .first();
      
      const completedLast30Days = parseInt(throughputResult.count) || 0;
      const throughput = completedLast30Days / 30;

      return {
        totalTasks,
        tasksByState: tasksByState as Record<TaskState, number>,
        averageCycleTime,
        averageLeadTime,
        throughput
      };
      
    } catch (error) {
      logger.error('Failed to get flow metrics', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Database integration not initialized - call initialize() first');
    }
  }

  private mapTaskFromDatabase(row: any): WorkflowTask {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      state: row.state,
      priority: row.priority,
      assignedAgent: row.assignee_id,
      estimatedEffort: row.estimated_hours,
      actualEffort: row.actual_hours,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      dueDate: row.due_date,
      parentTaskId: row.parent_task_id,
      workflowId: row.workflow_id,
      tags: row.tags ? JSON.parse(row.tags) : [],
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
      metadata: row.custom_data ? JSON.parse(row.custom_data) : {}
    };
  }

  private mapComplexity(estimatedHours: number): 'trivial' | 'simple' | 'moderate' | 'complex' | 'epic' {
    if (estimatedHours <= 2) return 'trivial';
    if (estimatedHours <= 8) return 'simple';
    if (estimatedHours <= 24) return 'moderate';
    if (estimatedHours <= 80) return 'complex';
    return 'epic';
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let databaseIntegration: TaskMasterDatabaseIntegration | null = null;

export function getDatabaseIntegration(): TaskMasterDatabaseIntegration {
  if (!databaseIntegration) {
    databaseIntegration = new TaskMasterDatabaseIntegration();
  }
  return databaseIntegration;
}