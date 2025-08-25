/**
 * @fileoverview TaskMaster Service - SAFe 6.0 Essentials Implementation
 *
 * Main TaskMaster service implementation in the claude-code-zen-server app.
 * Uses strategic facades to access underlying functionality from packages.
 */

import { getLogger } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getBrainSystem } from '@claude-zen/intelligence';
import { getSafeFramework } from '@claude-zen/enterprise';
import type { WebSocketCoordinator } from '../../infrastructure/websocket/socket.coordinator';

const logger = getLogger('TaskMasterService');

// ============================================================================
// TASKMASTER SERVICE TYPES
// ============================================================================

export interface TaskMasterTask {
  id: string;
  title: string;
  description?: string;
  state: 'backlog' | 'analysis' | 'development' | 'testing' | 'review' | 'deployment' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: number;
  actualEffort?: number;
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags?: string[];
  dependencies?: string[];
}

export interface PIPlanningEvent {
  id: string;
  planningIntervalNumber: number;
  artId: string;
  startDate: Date;
  endDate: Date;
  currentPhase: 'preparation' | 'day_one_morning' | 'day_one_afternoon' | 'day_two_morning' | 'day_two_afternoon' | 'completion';
  facilitator: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    capacity: number;
  }>;
}

export interface SafeFlowMetrics {
  totalTasks: number;
  tasksByState: Record<string, number>;
  averageCycleTime: number; // hours
  averageLeadTime: number; // hours
  throughput: number; // tasks per day
  wipEfficiency: number; // 0-1
  systemHealth: number; // 0-1
}

// ============================================================================
// TASKMASTER SERVICE IMPLEMENTATION
// ============================================================================

export class TaskMasterService {
  private database: any;
  private safeFramework: any;
  private brainSystem: any;
  private webSocketCoordinator: WebSocketCoordinator | null = null;
  private initialized = false;

  // Task management
  private tasks = new Map<string, TaskMasterTask>();
  private piEvents = new Map<string, PIPlanningEvent>();

  // WIP limits for SAFe workflow
  private wipLimits = {
    backlog: 50,
    analysis: 8,
    development: 12,
    testing: 10,
    review: 6,
    deployment: 4,
    blocked: 8
  };

  constructor() {
    logger.info('TaskMaster Service created');
  }

  /**
   * Set WebSocket coordinator for real-time events
   */
  setWebSocketCoordinator(coordinator: WebSocketCoordinator): void {
    this.webSocketCoordinator = coordinator;
    logger.info('WebSocket coordinator set for TaskMaster service');
  }

  /**
   * Initialize TaskMaster service using strategic facades
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Initializing TaskMaster service with strategic facades...');

      // Initialize database via infrastructure facade
      const databaseSystem = await getDatabaseSystem();
      this.database = databaseSystem.createProvider('postgresql');

      // Initialize SAFe framework via enterprise facade
      this.safeFramework = await getSafeFramework();

      // Initialize brain system via intelligence facade
      this.brainSystem = await getBrainSystem();

      // Verify database schemas
      await this.verifySchemas();

      // Load existing tasks
      await this.loadExistingTasks();

      this.initialized = true;
      logger.info('TaskMaster service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize TaskMaster service', error);
      throw error;
    }
  }

  /**
   * Create a new SAFe workflow task
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
  }): Promise<TaskMasterTask> {
    this.ensureInitialized();

    const task: TaskMasterTask = {
      id: this.generateTaskId(),
      title: taskData.title,
      description: taskData.description,
      state: 'backlog',
      priority: taskData.priority,
      estimatedEffort: taskData.estimatedEffort,
      assignedAgent: taskData.assignedAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      dependencies: []
    };

    // Store in memory
    this.tasks.set(task.id, task);

    // Save to database
    await this.saveTaskToDatabase(task);

    // Emit WebSocket event for real-time updates
    this.emitTaskEvent('taskmaster:task_updated', {
      type: 'task_created',
      task,
      timestamp: new Date().toISOString()
    });

    logger.info(`Task created: ${task.id} - ${task.title}`);
    return task;
  }

  /**
   * Move task through SAFe workflow states with WIP limit checking
   */
  async moveTask(taskId: string, toState: TaskMasterTask['state']): Promise<boolean> {
    this.ensureInitialized();

    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`Task not found: ${taskId}`);
      return false;
    }

    // Check WIP limits
    const tasksInState = Array.from(this.tasks.values()).filter(t => t.state === toState);
    if (tasksInState.length >= this.wipLimits[toState as keyof typeof this.wipLimits]) {
      logger.warn(`WIP limit exceeded for ${toState}: ${tasksInState.length}/${this.wipLimits[toState as keyof typeof this.wipLimits]}`);
      return false;
    }

    const fromState = task.state;
    task.state = toState;
    task.updatedAt = new Date();

    // Set completion time if done
    if (toState === 'done') {
      task.completedAt = new Date();
    }

    // Update database
    await this.saveTaskToDatabase(task);

    // Emit WebSocket event for real-time updates
    this.emitTaskEvent('taskmaster:task_updated', {
      type: 'task_moved',
      task,
      fromState,
      toState,
      timestamp: new Date().toISOString()
    });

    // Emit metrics update event
    this.emitMetricsUpdate();

    logger.info(`Task moved: ${taskId} from ${fromState} to ${toState}`);
    return true;
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<TaskMasterTask | null> {
    this.ensureInitialized();
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get tasks by state
   */
  async getTasksByState(state: TaskMasterTask['state']): Promise<TaskMasterTask[]> {
    this.ensureInitialized();
    return Array.from(this.tasks.values()).filter(task => task.state === state);
  }

  /**
   * Create PI Planning event using SAFe framework
   */
  async createPIPlanningEvent(eventData: {
    planningIntervalNumber: number;
    artId: string;
    startDate: Date;
    endDate: Date;
    facilitator: string;
  }): Promise<PIPlanningEvent> {
    this.ensureInitialized();

    const piEvent: PIPlanningEvent = {
      id: `pi-${eventData.planningIntervalNumber}-${eventData.artId}`,
      planningIntervalNumber: eventData.planningIntervalNumber,
      artId: eventData.artId,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      currentPhase: 'preparation',
      facilitator: eventData.facilitator,
      teams: []
    };

    // Store PI event
    this.piEvents.set(piEvent.id, piEvent);

    // Use SAFe framework for PI Planning coordination
    if (this.safeFramework) {
      try {
        await this.safeFramework.initializePIPlanningEvent(piEvent);
      } catch (error) {
        logger.warn('SAFe framework PI Planning initialization failed', error);
      }
    }

    // Emit PI Planning event
    this.emitPIEvent('pi_planning_started', {
      piNumber: piEvent.planningIntervalNumber,
      artId: piEvent.artId,
      startDate: piEvent.startDate,
      endDate: piEvent.endDate,
      facilitator: piEvent.facilitator
    });

    logger.info(`PI Planning event created: ${piEvent.id}`);
    return piEvent;
  }

  /**
   * Get real-time SAFe flow metrics
   */
  async getFlowMetrics(): Promise<SafeFlowMetrics> {
    this.ensureInitialized();

    const allTasks = Array.from(this.tasks.values());
    const completedTasks = allTasks.filter(t => t.state === 'done');

    // Calculate metrics
    const tasksByState: Record<string, number> = {};
    for (const state of ['backlog', 'analysis', 'development', 'testing', 'review', 'deployment', 'done', 'blocked']) {
      tasksByState[state] = allTasks.filter(t => t.state === state).length;
    }

    // Calculate cycle time (from start to completion)
    const cycleTimes = completedTasks
      .filter(t => t.completedAt)
      .map(t => ((t.completedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60))); // hours

    const averageCycleTime = cycleTimes.length > 0 ? 
      cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;

    // Calculate lead time (same as cycle time for now)
    const averageLeadTime = averageCycleTime;

    // Calculate throughput (completed tasks per day, last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCompletions = completedTasks.filter(t => 
      t.completedAt && t.completedAt >= thirtyDaysAgo
    );
    const throughput = recentCompletions.length / 30;

    // Calculate WIP efficiency (active tasks / total WIP limit)
    const activeTasks = allTasks.filter(t => !['backlog', 'done', 'blocked'].includes(t.state)).length;
    const totalWipLimit = Object.values(this.wipLimits).reduce((a, b) => a + b, 0) - this.wipLimits.backlog - this.wipLimits.blocked;
    const wipEfficiency = totalWipLimit > 0 ? activeTasks / totalWipLimit : 0;

    // Calculate system health (based on blocked tasks ratio)
    const blockedTasks = tasksByState.blocked || 0;
    const systemHealth = allTasks.length > 0 ? Math.max(0, 1 - (blockedTasks / allTasks.length)) : 1;

    return {
      totalTasks: allTasks.length,
      tasksByState,
      averageCycleTime,
      averageLeadTime,
      throughput,
      wipEfficiency,
      systemHealth
    };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    overallHealth: number;
    activeBottlenecks: number;
    wipUtilization: number;
  }> {
    const metrics = await this.getFlowMetrics();
    
    // Detect bottlenecks (states with WIP limit utilization > 90%)
    let activeBottlenecks = 0;
    for (const [state, count] of Object.entries(metrics.tasksByState)) {
      if (state in this.wipLimits) {
        const limit = this.wipLimits[state as keyof typeof this.wipLimits];
        if (count / limit > 0.9) {
          activeBottlenecks++;
        }
      }
    }

    return {
      overallHealth: metrics.systemHealth,
      activeBottlenecks,
      wipUtilization: metrics.wipEfficiency
    };
  }

  /**
   * Shutdown TaskMaster service
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    logger.info('Shutting down TaskMaster service...');
    
    // Save final state to database
    for (const task of this.tasks.values()) {
      await this.saveTaskToDatabase(task);
    }

    this.initialized = false;
    logger.info('TaskMaster service shutdown complete');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('TaskMaster service not initialized');
    }
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async verifySchemas(): Promise<void> {
    try {
      const hasTasksTable = await this.database.schema.hasTable('tasks');
      if (!hasTasksTable) {
        logger.warn('Tasks table not found - will create basic structure');
        // In a real app, we'd run migrations here
      }
    } catch (error) {
      logger.warn('Schema verification failed', error);
    }
  }

  private async loadExistingTasks(): Promise<void> {
    try {
      if (!this.database.schema) return;
      
      const tasksFromDb = await this.database('tasks').select('*').limit(1000);
      
      for (const row of tasksFromDb) {
        const task: TaskMasterTask = {
          id: row.id,
          title: row.title,
          description: row.description,
          state: row.state,
          priority: row.priority,
          estimatedEffort: row.estimated_hours || 0,
          actualEffort: row.actual_hours,
          assignedAgent: row.assignee_id,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
          tags: row.tags ? JSON.parse(row.tags) : [],
          dependencies: row.dependencies ? JSON.parse(row.dependencies) : []
        };
        
        this.tasks.set(task.id, task);
      }

      logger.info(`Loaded ${this.tasks.size} tasks from database`);
    } catch (error) {
      logger.warn('Failed to load existing tasks', error);
    }
  }

  private async saveTaskToDatabase(task: TaskMasterTask): Promise<void> {
    try {
      if (!this.database.schema) return;

      await this.database('tasks').insert({
        id: task.id,
        title: task.title,
        description: task.description,
        state: task.state,
        priority: task.priority,
        estimated_hours: task.estimatedEffort,
        actual_hours: task.actualEffort,
        assignee_id: task.assignedAgent,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        completed_at: task.completedAt,
        tags: JSON.stringify(task.tags || []),
        dependencies: JSON.stringify(task.dependencies || []),
        custom_data: JSON.stringify({})
      }).onConflict('id').merge();

    } catch (error) {
      logger.error('Failed to save task to database', error, { taskId: task.id });
    }
  }

  /**
   * Emit task-related WebSocket events
   */
  private emitTaskEvent(event: string, data: any): void {
    if (this.webSocketCoordinator) {
      this.webSocketCoordinator.broadcast(event, data);
    }
  }

  /**
   * Emit metrics update events
   */
  private async emitMetricsUpdate(): Promise<void> {
    if (this.webSocketCoordinator) {
      try {
        const metrics = await this.getFlowMetrics();
        this.webSocketCoordinator.broadcast('taskmaster:metrics_updated', {
          type: 'metrics_updated',
          metrics,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.warn('Failed to emit metrics update', error);
      }
    }
  }

  /**
   * Emit PI Planning events
   */
  private emitPIEvent(eventType: string, data: any): void {
    if (this.webSocketCoordinator) {
      this.webSocketCoordinator.broadcast('taskmaster:pi_event', {
        type: eventType,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let taskMasterService: TaskMasterService | null = null;

export function getTaskMasterService(): TaskMasterService {
  if (!taskMasterService) {
    taskMasterService = new TaskMasterService();
  }
  return taskMasterService;
}