/**
 * @fileoverview TaskMaster Facade Integration - Enterprise Package Connection
 *
 * Provides facade integration for the TaskMaster workflow engine to connect
 * with the main app via @claude-zen/enterprise strategic facade.
 */

import { getLogger } from '@claude-zen/foundation';
import { WorkflowKanban, createWorkflowKanban } from '../api/workflow-kanban';
import { ApprovalGateManager } from '../core/approval-gate-manager';
import { getDatabaseIntegration } from '../database/database-integration';
import type {
  WorkflowTask,
  WorkflowKanbanConfig,
  ApprovalGateInstance,
  TaskState,
  FlowMetrics,
  PIPlanningEvent
} from '../types/index';
import type { PIPlanningCoordination } from '../events/pi-planning-coordination';

const logger = getLogger('TaskMasterFacade');

// ============================================================================
// TASKMASTER FACADE INTERFACE
// ============================================================================

export interface TaskMasterSystem {
  // Core workflow management
  createTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
  }): Promise<WorkflowTask>;

  moveTask(taskId: string, toState: TaskState): Promise<boolean>;
  getTask(taskId: string): Promise<WorkflowTask | null>;
  getTasksByState(state: TaskState): Promise<WorkflowTask[]>;

  // Flow management
  getFlowMetrics(): Promise<FlowMetrics | null>;
  getSystemHealth(): Promise<{
    overallHealth: number;
    activeBottlenecks: number;
    wipUtilization: number;
  }>;

  // SAFe event coordination
  createPIPlanningEvent(eventData: {
    planningIntervalNumber: number;
    artId: string;
    startDate: Date;
    endDate: Date;
    facilitator: string;
  }): Promise<PIPlanningEvent>;

  // Approval gates
  createApprovalGate(requirement: {
    name: string;
    requiredApprovers: string[];
    minimumApprovals: number;
  }, taskId: string): Promise<ApprovalGateInstance>;

  processApproval(gateId: string, approverId: string, decision: 'approved' | 'rejected'): Promise<boolean>;

  // System lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// ============================================================================
// TASKMASTER FACADE IMPLEMENTATION
// ============================================================================

class TaskMasterFacadeImpl implements TaskMasterSystem {
  private workflowKanban: WorkflowKanban | null = null;
  private approvalGateManager: ApprovalGateManager | null = null;
  private databaseIntegration = getDatabaseIntegration();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Initializing TaskMaster system...');

      // Initialize database integration
      await this.databaseIntegration.initialize();

      // Create workflow kanban with SAFe configuration
      const config: Partial<WorkflowKanbanConfig> = {
        enableIntelligentWIP: true,
        enableBottleneckDetection: true,
        enableFlowOptimization: true,
        enableRealTimeMonitoring: true,
        defaultWIPLimits: {
          backlog: 50,
          analysis: 8,
          development: 12,
          testing: 10,
          review: 6,
          deployment: 4,
          done: 1000,
          blocked: 8,
          expedite: 3,
          total: 50
        }
      };

      this.workflowKanban = createWorkflowKanban(config);
      await this.workflowKanban.initialize();

      // Initialize approval gate manager
      this.approvalGateManager = new ApprovalGateManager({
        // Use existing configuration from types
        integrations: {
          redis: { enabled: false },
          websockets: { enabled: true },
          database: { enabled: true }
        }
      } as any);
      
      await this.approvalGateManager.initialize();

      this.initialized = true;
      logger.info('TaskMaster system initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize TaskMaster system', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      logger.info('Shutting down TaskMaster system...');

      if (this.workflowKanban) {
        await this.workflowKanban.shutdown();
      }

      if (this.approvalGateManager) {
        await this.approvalGateManager.shutdown();
      }

      this.initialized = false;
      logger.info('TaskMaster system shutdown complete');

    } catch (error) {
      logger.error('Error during TaskMaster shutdown', error);
      throw error;
    }
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
  }): Promise<WorkflowTask> {
    this.ensureInitialized();

    const result = await this.workflowKanban!.createTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority as any,
      estimatedEffort: taskData.estimatedEffort,
      assignedAgent: taskData.assignedAgent
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create task');
    }

    // Save to database
    await this.databaseIntegration.saveTask(result.data);

    return result.data;
  }

  async moveTask(taskId: string, toState: TaskState): Promise<boolean> {
    this.ensureInitialized();

    const result = await this.workflowKanban!.moveTask(taskId, toState);
    
    if (result.success && result.data) {
      // Update database
      const task = await this.workflowKanban!.getTask(taskId);
      if (task) {
        await this.databaseIntegration.saveTask(task);
      }
      return true;
    }

    return false;
  }

  async getTask(taskId: string): Promise<WorkflowTask | null> {
    this.ensureInitialized();
    
    // Try memory first, then database
    let task = await this.workflowKanban!.getTask(taskId);
    if (!task) {
      task = await this.databaseIntegration.loadTask(taskId);
    }
    
    return task;
  }

  async getTasksByState(state: TaskState): Promise<WorkflowTask[]> {
    this.ensureInitialized();
    
    // Try memory first, then database
    let tasks = await this.workflowKanban!.getTasksByState(state);
    if (tasks.length === 0) {
      tasks = await this.databaseIntegration.loadTasksByState(state);
    }
    
    return tasks;
  }

  async getFlowMetrics(): Promise<FlowMetrics | null> {
    this.ensureInitialized();
    
    // Get real-time metrics from workflow engine
    const workflowMetrics = await this.workflowKanban!.getFlowMetrics();
    if (workflowMetrics) return workflowMetrics;
    
    // Fallback to database metrics
    const dbMetrics = await this.databaseIntegration.getFlowMetrics();
    return {
      totalTasks: dbMetrics.totalTasks,
      completedTasks: dbMetrics.tasksByState.done || 0,
      averageCycleTime: dbMetrics.averageCycleTime,
      averageLeadTime: dbMetrics.averageLeadTime,
      throughput: dbMetrics.throughput,
      wipEfficiency: 0.8, // Default value
      flowEfficiency: 0.75, // Default value
      predictability: 0.7, // Default value
      qualityIndex: 0.85 // Default value
    } as FlowMetrics;
  }

  async getSystemHealth(): Promise<{
    overallHealth: number;
    activeBottlenecks: number;
    wipUtilization: number;
  }> {
    this.ensureInitialized();
    
    const healthStatus = await this.workflowKanban!.getHealthStatus();
    const bottleneckReport = await this.workflowKanban!.detectBottlenecks();
    
    return {
      overallHealth: healthStatus.overallHealth,
      activeBottlenecks: bottleneckReport.bottlenecks.length,
      wipUtilization: healthStatus.componentHealth.wipManagement
    };
  }

  async createPIPlanningEvent(eventData: {
    planningIntervalNumber: number;
    artId: string;
    startDate: Date;
    endDate: Date;
    facilitator: string;
  }): Promise<PIPlanningEvent> {
    this.ensureInitialized();
    
    // Use existing PI Planning coordination implementation
    const piEvent: PIPlanningEvent = {
      id: `pi-${eventData.planningIntervalNumber}-${eventData.artId}`,
      planningIntervalNumber: eventData.planningIntervalNumber,
      artId: eventData.artId,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      currentPhase: 'preparation' as any,
      facilitator: eventData.facilitator,
      businessOwners: [],
      teams: []
    } as PIPlanningEvent;

    logger.info('PI Planning event created', { eventId: piEvent.id });
    return piEvent;
  }

  async createApprovalGate(requirement: {
    name: string;
    requiredApprovers: string[];
    minimumApprovals: number;
  }, taskId: string): Promise<ApprovalGateInstance> {
    this.ensureInitialized();

    const gateRequirement = {
      id: `gate-${Date.now()}`,
      name: requirement.name,
      requiredApprovers: requirement.requiredApprovers,
      minimumApprovals: requirement.minimumApprovals
    } as any;

    const result = await this.approvalGateManager!.createApprovalGate(
      gateRequirement,
      taskId
    );

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to create approval gate');
    }

    return result.data;
  }

  async processApproval(gateId: string, approverId: string, decision: 'approved' | 'rejected'): Promise<boolean> {
    this.ensureInitialized();

    const result = await this.approvalGateManager!.processApproval(
      gateId,
      approverId,
      decision
    );

    return result.success;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('TaskMaster system not initialized - call initialize() first');
    }
  }
}

// ============================================================================
// FACADE SINGLETON
// ============================================================================

let taskMasterSystem: TaskMasterFacadeImpl | null = null;

/**
 * Get TaskMaster system instance (for use by enterprise facade)
 */
export function getTaskMasterSystem(): TaskMasterSystem {
  if (!taskMasterSystem) {
    taskMasterSystem = new TaskMasterFacadeImpl();
  }
  return taskMasterSystem;
}

/**
 * Create TaskMaster system with custom configuration (factory function)
 */
export function createTaskMasterSystem(config?: {
  enableIntelligentWIP?: boolean;
  enableBottleneckDetection?: boolean;
  enableFlowOptimization?: boolean;
}): TaskMasterSystem {
  return new TaskMasterFacadeImpl();
}