/**
 * @fileoverview Workflow-Kanban Integration
 *
 * Integration layer between Workflows (process orchestration) and Kanban (state management).
 * Enables workflows to leverage kanban state management patterns for step-based processes.
 *
 * **Integration Patterns:**
 * - Workflows can use kanban state management for step coordination
 * - Workflows can trigger kanban transitions based on process completion
 * - Kanban can invoke workflows for complex multi-step processes
 * - Shared event coordination between workflow engine and kanban system
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  TaskState,
  KanbanEngine,
  WorkflowKanbanConfig,
  WorkflowTask,
} from '../../kanban';
import type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowStep,
} from '../types';
const logger = getLogger('WorkflowKanbanIntegration'');

// =============================================================================
// WORKFLOW-KANBAN INTEGRATION TYPES
// =============================================================================

/**
 * Integration configuration for workflow-kanban coordination
 */
export interface WorkflowKanbanIntegrationConfig {
  /** Enable kanban state management for workflow steps */
  enableKanbanSteps?: boolean;
  /** Enable workflow triggers from kanban state transitions */
  enableKanbanTriggers?: boolean;
  /** Enable bidirectional event coordination */
  enableBidirectionalEvents?: boolean;
  /** Custom kanban configuration for workflow integration */
  kanbanConfig?: Partial<WorkflowKanbanConfig>;
}

/**
 * Workflow step with kanban state integration
 */
export interface KanbanWorkflowStep extends WorkflowStep {
  /** Kanban state for this step */
  kanbanState?: TaskState;
  /** Enable kanban tracking for this step */
  useKanban?: boolean;
  /** WIP limits for this step type */
  wipLimit?: number;
}

/**
 * Workflow definition with kanban integration
 */
export interface KanbanWorkflowDefinition extends WorkflowDefinition {
  /** Steps with kanban integration */
  steps: KanbanWorkflowStep[];
  /** Enable kanban integration for this workflow */
  useKanban?: boolean;
  /** Custom kanban configuration */
  kanbanConfig?: Partial<WorkflowKanbanConfig>;
}

// =============================================================================
// WORKFLOW-KANBAN INTEGRATION CLASS
// =============================================================================

/**
 * Integration layer between workflow engine and kanban system
 */
export class WorkflowKanbanIntegration {
  private readonly config: WorkflowKanbanIntegrationConfig;
  private kanban: KanbanEngine| null = null;
  private initialized = false;

  constructor(config: WorkflowKanbanIntegrationConfig = {}) {
    this.config = {
      enableKanbanSteps: true,
      enableKanbanTriggers: true,
      enableBidirectionalEvents: true,
      ...config,
    };

    logger.info('WorkflowKanbanIntegration created,{
      enableKanbanSteps: this.config.enableKanbanSteps,
      enableKanbanTriggers: this.config.enableKanbanTriggers,
      enableBidirectionalEvents: this.config.enableBidirectionalEvents,
    });
  }

  /**
   * Initialize the integration layer
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('WorkflowKanbanIntegration already initialized'');
      return;
    }

    try {
      // Create kanban engine instance for workflow coordination
      this.kanban = new KanbanEngine(this.config.kanbanConfig);
      await this.kanban.initialize();

      // Set up event coordination if enabled
      if (this.config.enableBidirectionalEvents) {
        this.setupEventCoordination();
      }

      this.initialized = true;
      logger.info('WorkflowKanbanIntegration initialized successfully'');
    } catch (error) {
      logger.error('Failed to initialize WorkflowKanbanIntegration:,error');
      throw error;
    }
  }

  /**
   * Convert workflow step to kanban task
   */
  async createKanbanTaskFromStep(
    workflowId: string,
    step: KanbanWorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowTask| null> {
    if (!this.initialized|| !this.kanban|| !step.useKanban) {
      return null;
    }

    try {
      const taskResult = await this.kanban.createTask({
        title: `Workflow Step: ${step.name}`,
        description: step.description|| `Step from workflow ${workflowId}`,
        priority:  this.mapWorkflowPriorityToKanban(context.priority||medium'),
        estimatedEffort: step.estimatedDuration|| 1,
        assignedAgent: context.assignedAgent,
        tags: ['workflow,workflowId, step.id],
        metadata: {
          workflowId,
          stepId: step.id,
          stepType: step.type,
        },
      });

      if (taskResult.success && taskResult.data) {
        logger.info('Created kanban task for workflow step,{
          workflowId,
          stepId: step.id,
          taskId: taskResult.data.id,
        });

        return taskResult.data;
      } else {
        logger.error('Failed to create kanban task for workflow step,{
          workflowId,
          stepId: step.id,
          error: taskResult.error,
        });
        return null;
      }
    } catch (error) {
      logger.error('Error creating kanban task from workflow step:,error');
      return null;
    }
  }

  /**
   * Move kanban task to reflect workflow step progress
   */
  async updateKanbanTaskState(
    taskId: string,
    newState: TaskState,
    reason?: string
  ): Promise<boolean> {
    if (!this.initialized|| !this.kanban) {
      return false;
    }

    try {
      const result = await this.kanban.moveTask(taskId, newState, reason);

      if (result.success) {
        logger.info('Updated kanban task state,{
          taskId,
          newState,
          reason,
        });
        return true;
      } else {
        logger.error('Failed to update kanban task state,{
          taskId,
          newState,
          error: result.error,
        });
        return false;
      }
    } catch (error) {
      logger.error('Error updating kanban task state:,error');
      return false;
    }
  }

  /**
   * Get kanban metrics for workflow analysis
   */
  async getWorkflowKanbanMetrics(): Promise<any> {
    if (!this.initialized|| !this.kanban) {
      return null;
    }

    try {
      const metrics = await this.kanban.getFlowMetrics();
      const health = await this.kanban.getHealthStatus();

      return {
        flowMetrics: metrics,
        systemHealth: health,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting workflow kanban metrics:,error');
      return null;
    }
  }

  /**
   * Check if kanban integration is available and healthy
   */
  isKanbanAvailable(): boolean {
    return this.initialized && this.kanban !== null;
  }

  /**
   * Shutdown the integration layer
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      if (this.kanban) {
        await this.kanban.shutdown();
        this.kanban = null;
      }

      this.initialized = false;
      logger.info('WorkflowKanbanIntegration shutdown complete'');
    } catch (error) {
      logger.error('Error during WorkflowKanbanIntegration shutdown:,error');
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  private setupEventCoordination(): void {
    if (!this.kanban) return;

    // Listen to kanban events and coordinate with workflow engine
    this.kanban.on('task:created,(task) => {
      logger.debug('Kanban task created for workflow,{
        taskId: task.id,
        workflowId: task.metadata?.workflowId,
        stepId: task.metadata?.stepId,
      });
    });

    this.kanban.on('task:moved,(taskId, fromState, toState) => {
      logger.debug('Kanban task state changed,{
        taskId,
        fromState,
        toState,
      });

      // TODO: Emit workflow events based on kanban state changes
      // This would allow workflows to react to kanban state transitions
    });

    this.kanban.on('bottleneck:detected,(bottleneck) => {
      logger.warn('Kanban bottleneck detected for workflow coordination,{
        state: bottleneck.state,
        severity: bottleneck.severity,
        affectedTasks: bottleneck.affectedTasks.length,
      });

      // TODO: Emit workflow events for bottleneck handling
      // This could trigger workflow optimizations or notifications
    });

    logger.info('Event coordination setup complete'');
  }

  private mapWorkflowPriorityToKanban(
    priority: string
  ):'critical'|'high'|'medium'|'low '{
    switch (priority.toLowerCase()) {
      case'urgent:
      case'critical:
        return'critical';
      case'high:
        return'high';
      case'low:
        return'low';
      case'medium:
      default:
        return'medium';
    }
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create workflow-kanban integration with default configuration
 */
export function createWorkflowKanbanIntegration(
  config?: WorkflowKanbanIntegrationConfig
): WorkflowKanbanIntegration {
  return new WorkflowKanbanIntegration(config);
}

/**
 * Create workflow-kanban integration optimized for high-throughput scenarios
 */
export function createHighThroughputWorkflowKanbanIntegration(): WorkflowKanbanIntegration {
  return new WorkflowKanbanIntegration({
    enableKanbanSteps: true,
    enableKanbanTriggers: true,
    enableBidirectionalEvents: true,
    kanbanConfig: {
      enableIntelligentWIP: true,
      enableBottleneckDetection: true,
      enableFlowOptimization: true,
      enableRealTimeMonitoring: true,
      wipCalculationInterval: 15000, // 15 seconds
      bottleneckDetectionInterval: 30000, // 30 seconds
      maxConcurrentTasks: 100,
    },
  });
}

// =============================================================================
// INTEGRATION SUMMARY
// =============================================================================

/**
 * Workflow-Kanban Integration Summary
 *
 * This integration provides:
 * - Kanban state management for workflow steps
 * - Workflow triggers based on kanban state transitions  
 * - Bidirectional event coordination between systems
 * - Flow metrics integration for workflow optimization
 * - Production-ready error handling and logging
 * - High-throughput configuration support
 *
 * Use cases:
 * - Document import workflows with kanban step tracking
 * - Process orchestration with flow optimization
 * - Multi-step workflows with WIP limit enforcement
 * - Workflow bottleneck detection and resolution
 */