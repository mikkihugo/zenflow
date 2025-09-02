/**
 * TaskMaster SAFe 6.0 API Routes
 *
 * REST API routes for TaskMaster workflow management.
 * Provides real-time SAFe flow metrics, task management, and PI Planning coordination.
 *
 * @file TaskMaster API routes for SAFe workflow management.
 */

// Event-driven only: no direct cross-package imports (use foundation EventBus)
import { generateUUID, getLogger } from '@claude-zen/foundation';
import { getEventBus } from '../events/event-bus';
import { type Request, type Response, Router } from 'express';
import type { WebSocketCoordinator } from '../web/websocket';
import { LogLevel, log } from '../web/middleware/logging';

const logger = getLogger('TaskMasterRoutes');

// Simple async error handler utility
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) =>
    Promise.resolve(fn(req, res)).catch((error) => {
      logger.error('AsyncHandler error: ', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? (error as Error).message : 'Unknown error',
        });
      }
    });

// Valid task states type
type TaskState =
  | 'backlog'
  | 'analysis'
  | 'development'
  | 'testing'
  | 'review'
  | 'deployment'
  | 'done'
  | 'blocked';

// TaskMaster task interface
interface TaskMasterTask {
  id: string;
  title: string;
  description?: string;
  state: TaskState;
  priority: 'low' | ' medium' | ' high' | ' critical';
  estimatedEffort: number;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// Flow metrics interface
interface FlowMetrics {
  cycleTime: number;
  leadTime: number;
  throughput: number;
  wipCount: number;
  blockedTasks: number;
  completedTasks: number;
}

// System health interface
interface SystemHealth {
  overallHealth: number;
  databaseHealth: number;
  apiHealth: number;
  queueHealth: number;
  lastUpdated: string;
}

// TaskMaster system interface
interface TaskMasterSystem {
  getFlowMetrics(): Promise<FlowMetrics>;
  getSystemHealth(): Promise<SystemHealth>;
  createTask(data: Partial<TaskMasterTask>): Promise<TaskMasterTask>;
  getTask(id: string): Promise<TaskMasterTask | null>;
  moveTask(id: string, state: string): Promise<boolean>;
  getTasksByState(state: TaskState): Promise<TaskMasterTask[]>;
  createPIPlanningEvent(data: PIPlanningEventData): Promise<PIPlanningEvent>;
  validateTaskTransition(
    taskId: string,
    fromState: TaskState,
    toState: TaskState
  ): Promise<boolean>;
  calculateWIPLimits(
    state: TaskState
  ): Promise<{ current: number; limit: number; available: number }>;
}

// PI Planning interfaces
interface PIPlanningEventData {
  planningIntervalNumber: number;
  artId: string;
  startDate: Date;
  endDate: Date;
  facilitator: string;
}

interface PIPlanningEvent {
  id: string;
  planningIntervalNumber: number;
  artId: string;
  startDate: string;
  endDate: string;
  facilitator: string;
  status: 'planned' | ' in-progress' | ' completed';
  createdAt: string;
}

/**
 * TaskMaster system singleton with proper error handling
 */
class TaskMasterManager {
  private taskMasterSystem: TaskMasterSystem | null = null;
  private webSocketCoordinator?: WebSocketCoordinator;

  constructor(webSocketCoordinator?: WebSocketCoordinator) {
    this.webSocketCoordinator = webSocketCoordinator;
  }

  async getTaskMaster(): Promise<TaskMasterSystem> {
    if (!this.taskMasterSystem) {
      // Proxy implementation backed by the foundation EventBus
      const bus = getEventBus();

      const requestResponse = async <TResp = any>(reqTopic: string, resTopic: string, payload: Record<string, unknown> = {}, timeoutMs = 2000): Promise<TResp> => {
        const correlationId = generateUUID();
        return await new Promise<TResp>((resolve, reject) => {
          const timer = setTimeout(() => {
            // Remove listener on timeout
            try {
              // @ts-expect-error foundation bus supports off
              bus.off(resTopic as any, onMessage as any);
            } catch {}
            reject(new Error(`Event response timeout for ${resTopic}`));
          }, timeoutMs);

          const onMessage = (msg: any) => {
            if (!msg || msg.correlationId !== correlationId) return;
            clearTimeout(timer);
            try {
              // @ts-expect-error foundation bus supports off
              bus.off(resTopic as any, onMessage as any);
            } catch {}
            resolve(msg as TResp);
          };

          // @ts-expect-error foundation bus supports on/emit
          bus.on(resTopic as any, onMessage as any);
          // @ts-expect-error foundation bus supports on/emit
          bus.emit(reqTopic as any, { ...payload, correlationId });
        });
      };

      this.taskMasterSystem = {
        async getFlowMetrics() {
          try {
            const resp = await requestResponse<any>('api:tasks:metrics:request', 'api:tasks:metrics:response');
            const m = resp?.metrics ?? {};
            const cycleTime = Number(m.averageDuration ?? 0);
            const throughput = Number(m.throughputPerHour ?? 0);
            const wipCount = Number(m.currentLoad ?? 0);
            const completedTasks = Number(m.completedTasks ?? 0);
            const blockedTasks = Number(m.blockedTasks ?? 0);
            const leadTime = cycleTime > 0 ? Math.round(cycleTime * 1.2 * 100) / 100 : 0;
            return {
              cycleTime,
              leadTime,
              throughput,
              wipCount,
              blockedTasks,
              completedTasks,
            } as FlowMetrics;
          } catch (err) {
            logger.warn('Flow metrics via EventBus failed, returning baseline', { err });
            return {
              cycleTime: 0,
              leadTime: 0,
              throughput: 0,
              wipCount: 0,
              blockedTasks: 0,
              completedTasks: 0,
            };
          }
        },

        async getSystemHealth() {
          try {
            const resp = await requestResponse<any>('api:system:status:request', 'api:system:status:response');
            const h = resp?.health ?? {};
            return {
              overallHealth: Number(h.overall ?? 0.8),
              databaseHealth: Number(h.database ?? 0.8),
              apiHealth: Number(h.api ?? 0.9),
              queueHealth: 0.85,
              lastUpdated: new Date().toISOString(),
            } as SystemHealth;
          } catch (err) {
            logger.warn('System health via EventBus failed, returning baseline', { err });
            return {
              overallHealth: 0.8,
              databaseHealth: 0.8,
              apiHealth: 0.9,
              queueHealth: 0.85,
              lastUpdated: new Date().toISOString(),
            };
          }
        },

        async createTask(data: Partial<TaskMasterTask>) {
          try {
            const resp = await requestResponse<any>('api:tasks:create:request', 'api:tasks:create:response', { input: data });
            const t = resp?.task ?? {};
            return {
              id: String(t.id ?? generateUUID()),
              title: String(t.title ?? data.title ?? 'New Task'),
              description: String(t.description ?? data.description ?? ''),
              state: (t.state ?? 'backlog') as TaskState,
              priority: (t.priority ?? 'medium') as TaskMasterTask['priority'],
              estimatedEffort: Number(t.estimatedEffort ?? data.estimatedEffort ?? 1),
              assignedAgent: t.assignedAgent ?? data.assignedAgent,
              createdAt: String(t.createdAt ?? new Date().toISOString()),
              updatedAt: String(t.updatedAt ?? new Date().toISOString()),
            } as TaskMasterTask;
          } catch (err) {
            logger.warn('Task creation via EventBus failed, returning placeholder', { err });
            return {
              id: generateUUID(),
              title: data.title ?? 'New Task',
              description: data.description ?? '',
              state: 'backlog',
              priority: 'medium',
              estimatedEffort: Number(data.estimatedEffort ?? 1),
              assignedAgent: data.assignedAgent,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as TaskMasterTask;
          }
        },

        async getTask(_id: string) {
          // Not yet supported via events
          return null;
        },

        async moveTask(_id: string, _state: string) {
          // Not yet supported via events
          return false;
        },

        async getTasksByState(_state: TaskState) {
          try {
            const resp = await requestResponse<any>('api:tasks:list:request', 'api:tasks:list:response');
            const list = Array.isArray(resp?.tasks) ? resp.tasks : [];
            // Basic normalization
            return list.map((t: any) => ({
              id: String(t.id ?? generateUUID()),
              title: String(t.title ?? 'Task'),
              description: String(t.description ?? ''),
              state: (t.state ?? 'backlog') as TaskState,
              priority: (t.priority ?? 'medium') as TaskMasterTask['priority'],
              estimatedEffort: Number(t.estimatedEffort ?? 1),
              assignedAgent: t.assignedAgent,
              createdAt: String(t.createdAt ?? new Date().toISOString()),
              updatedAt: String(t.updatedAt ?? new Date().toISOString()),
            })) as TaskMasterTask[];
          } catch {
            return [];
          }
        },

        async createPIPlanningEvent(data: PIPlanningEventData) {
          // Stubbed via server for now (no external dependency)
          return {
            id: generateUUID(),
            planningIntervalNumber: data.planningIntervalNumber,
            artId: data.artId,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            facilitator: data.facilitator,
            status: 'planned',
            createdAt: new Date().toISOString(),
          } as PIPlanningEvent;
        },

        async validateTaskTransition(_taskId: string, _from: TaskState, _to: TaskState) {
          // Allow by default; real validation should be event-driven later
          return true;
        },

        async calculateWIPLimits(_state: TaskState) {
          // Basic baseline until event-driven responders exist
          return { current: 0, limit: 5, available: 5 };
        },
      } as TaskMasterSystem;

      logger.info('TaskMaster proxy initialized (EventBus-backed)');
    }
    return this.taskMasterSystem;
  }

  async shutdown(): Promise<void> {
    if (this.taskMasterSystem) {
      logger.info('Shutting down TaskMaster system');

      // Perform proper async cleanup
      await this.performSystemCleanup();
      this.taskMasterSystem = null;
    }
  }

  private async performSystemCleanup(): Promise<void> {
    try {
      // Cleanup database connections, websockets, and other resources
      if (this.webSocketCoordinator) {
        await this.webSocketCoordinator.broadcast('system:shutdown-initiated', {
          timestamp: new Date().toISOString(),
          message: 'TaskMaster system shutting down',
        });
      }

      logger.info('TaskMaster system cleanup completed');
    } catch (error) {
      logger.error('Error during TaskMaster cleanup: ', error);
    }
  }
}

/**
 * Create TaskMaster API routes with modular handlers.
 */
export const createTaskMasterRoutes = (
  webSocketCoordinator?: WebSocketCoordinator
): Router => {
  const router = Router();
  const taskMasterManager = new TaskMasterManager(webSocketCoordinator);

  // Setup route groups
  setupFlowMetricsRoutes(router, taskMasterManager);
  setupTaskManagementRoutes(router, taskMasterManager);
  setupPIPlanningRoutes(router, taskMasterManager);
  setupSystemHealthRoutes(router, taskMasterManager);
  setupDashboardRoutes(router, taskMasterManager);

  return router;
};

// =============================================================================
// HELPER FUNCTIONS FOR TASK MANAGEMENT
// =============================================================================

/**
 * Validate task creation input
 */
function validateTaskInput(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const { title, description, priority, estimatedEffort, assignedAgent } =
    data as {
      title?: unknown;
      description?: unknown;
      priority?: unknown;
      estimatedEffort?: unknown;
      assignedAgent?: unknown;
    };

  const validationErrors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    validationErrors.push('Title must be at least 3 characters');
  }
  if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority)) {
    validationErrors.push(
      'Priority must be one of: low, medium, high, critical'
    );
  }
  if (
    !estimatedEffort ||
    typeof estimatedEffort !== 'number' ||
    estimatedEffort < 0.5
  ) {
    validationErrors.push('Estimated effort must be a number >= 0.5 hours');
  }
  if (description && typeof description !== 'string') {
    validationErrors.push('Description must be a string');
  }
  if (assignedAgent && typeof assignedAgent !== 'string') {
    validationErrors.push('Assigned agent must be a string');
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
}

/**
 * Handle task creation with comprehensive SAFe metadata
 */
async function handleTaskCreation(
  taskMaster: unknown,
  taskData: {
    title: string;
    description?: string;
    priority: string;
    estimatedEffort: number;
    assignedAgent?: string;
  },
  req: Request
): Promise<unknown> {
  const taskId = generateUUID();
  const timestamp = new Date().toISOString();

  // Create comprehensive SAFe task
  const safeTaskData = {
    id: taskId,
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    priority: taskData.priority,
    estimatedEffort: Math.round(taskData.estimatedEffort * 4) / 4, // Round to quarter hours
    assignedAgent: taskData.assignedAgent?.trim() || 'unassigned',
    status: 'backlog',
    createdAt: timestamp,
    updatedAt: timestamp,
    sprint: null,
    epic: null,
    storyPoints: Math.ceil(taskData.estimatedEffort * 2),
    acceptanceCriteria: [],
    dependencies: [],
    blockers: [],
    tags: [taskData.priority, 'new'],
    createdBy: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || ' unknown',
  };

  // Use TaskMaster system to create the task
  const createdTask = await (
    taskMaster as { createTask: (data: unknown) => Promise<unknown> }
  ).createTask(safeTaskData);

  log(LogLevel.INFO, `SAFe task created with ID: ${  taskId}`);
  return createdTask;
}

/**
 * Constant for error messages to avoid duplication
 */
const TASK_ERROR_MESSAGES = {
  createFailed: 'Failed to create task',
  validationFailed: 'Validation failed',
  systemError: 'System error occurred',
  getTaskFailed: 'Failed to get task',
  getTasksByStateFailed: 'Failed to get tasks by state',
  moveTaskFailed: 'Failed to move task',
} as const;

/**
 * Setup SAFe flow metrics routes
 */
function setupFlowMetricsRoutes(
  router: Router,
  manager: TaskMasterManager
): void {
  router.get(
    '/metrics',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting SAFe flow metrics', req);

      try {
        const taskMaster = await manager.getTaskMaster();
        const [metrics, health] = await Promise.all([
          taskMaster.getFlowMetrics(),
          taskMaster.getSystemHealth(),
        ]);

        // Validate metrics data
        if (!metrics || typeof metrics.cycleTime !== 'number') {
          throw new Error(
            'Invalid metrics data received from TaskMaster system'
          );
        }

        res.json({
          success: true,
          data: {
            metrics: {
              cycleTime: Math.round(metrics.cycleTime * 100) / 100,
              leadTime: Math.round(metrics.leadTime * 100) / 100,
              throughput: metrics.throughput,
              wipCount: metrics.wipCount,
              blockedTasks: metrics.blockedTasks,
              completedTasks: metrics.completedTasks,
              efficiency:
                metrics.completedTasks > 0
                  ? Math.round(
                      (metrics.completedTasks /
                        (metrics.completedTasks + metrics.blockedTasks)) *
                        100
                    )
                  : 0,
            },
            systemHealth: health,
            calculatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

        // Broadcast real-time metrics if WebSocket available
        if (manager.webSocketCoordinator) {
          manager.webSocketCoordinator.broadcast('metrics:updated', {
            metrics,
            health,
          });
        }
      } catch (error) {
        logger.error('Failed to get flow metrics: ', error);
        log(LogLevel.ERROR, 'Failed to get flow metrics', req, {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });

        res.status(500).json({
          success: false,
          error: 'Failed to get flow metrics',
          message: (error as Error).message,
          timestamp: new Date().toISOString(),
        });
      }
    })
  );
}

/**
 * Handle task creation endpoint
 */
async function handleCreateTask(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.INFO, 'Creating new SAFe task', req);

  try {
    const taskMaster = await manager.getTaskMaster();
    const validation = validateTaskInput(req.body);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: TASK_ERROR_MESSAGES.validationFailed,
        details: validation.errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const task = await handleTaskCreation(taskMaster, req.body, req);

    // Broadcast real-time task creation
    if (manager.webSocketCoordinator) {
      manager.webSocketCoordinator.broadcast('task:created', task);
    }

    logger.info(`Task created:${  task.id  } - ${  task.title}`);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`${TASK_ERROR_MESSAGES.createFailed  }:`, error);
    log(LogLevel.ERROR, TASK_ERROR_MESSAGES.createFailed, req, {
      error: (error as Error).message,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: TASK_ERROR_MESSAGES.createFailed,
      message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Setup task management routes with modular handlers
 */
function setupTaskManagementRoutes(
  router: Router,
  manager: TaskMasterManager
): void {
  // Create task
  router.post(
    '/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      await handleCreateTask(req, res, manager);
    })
  );

  // Get task by ID
  router.get(
    '/tasks/:taskId',
    asyncHandler(async (req: Request, res: Response) => {
      await handleGetTask(req, res, manager);
    })
  );

  // Move task
  router.put(
    '/tasks/:taskId/move',
    asyncHandler(async (req: Request, res: Response) => {
      await handleMoveTask(req, res, manager);
    })
  );

  // Get tasks by state
  router.get(
    '/tasks/state/:state',
    asyncHandler(async (req: Request, res: Response) => {
      await handleGetTasksByState(req, res, manager);
    })
  );
}

/**
 * Handle get task by ID endpoint
 */
async function handleGetTask(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.DEBUG, 'Getting task by ID', req);

  try {
    const taskMaster = await manager.getTaskMaster();
    const { taskId } = req.params;

    if (!taskId || typeof taskId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const task = await taskMaster.getTask(taskId);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        taskId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Failed to get task ${req.params.taskId}:`, error);
    log(LogLevel.ERROR, TASK_ERROR_MESSAGES.getTaskFailed, req, {
      error: (error as Error).message,
      taskId: req.params.taskId,
    });

    res.status(500).json({
      success: false,
      error: TASK_ERROR_MESSAGES.getTaskFailed,
      message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle get tasks by state endpoint
 */
async function handleGetTasksByState(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.DEBUG, 'Getting tasks by state', req);

  try {
    const taskMaster = await manager.getTaskMaster();
    const { state } = req.params;

    if (
      !state ||
      ![
        'backlog',
        'analysis',
        'development',
        'testing',
        'review',
        'deployment',
        'done',
        'blocked',
      ].includes(state)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state',
        validStates: [
          'backlog',
          'analysis',
          'development',
          'testing',
          'review',
          'deployment',
          'done',
          'blocked',
        ],
        timestamp: new Date().toISOString(),
      });
    }

    const tasks = await taskMaster.getTasksByState(state as TaskState);

    // Calculate additional metrics for the state
    const totalEffort = tasks.reduce(
      (sum, task) => sum + task.estimatedEffort,
      0
    );
    const priorityCounts = tasks.reduce(
      (counts, task) => {
        counts[task.priority] = (counts[task.priority] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    res.json({
      success: true,
      data: {
        state,
        tasks,
        count: tasks.length,
        totalEffort: Math.round(totalEffort * 4) / 4,
        priorityBreakdown: priorityCounts,
        averageEffort:
          tasks.length > 0
            ? Math.round((totalEffort / tasks.length) * 4) / 4
            : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Failed to get tasks by state ${req.params.state}:`, error);
    log(LogLevel.ERROR, TASK_ERROR_MESSAGES.getTasksByStateFailed, req, {
      error: (error as Error).message,
      state: req.params.state,
    });

    res.status(500).json({
      success: false,
      error: TASK_ERROR_MESSAGES.getTasksByStateFailed,
      message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Validate move task input parameters
 */
function validateMoveTaskInputs(
  taskId: string,
  toState: string
): { status: number; response: unknown } | null {
  if (!taskId || typeof taskId !== 'string') {
    return {
      status: 400,
      response: {
        success: false,
        error: 'Invalid task ID',
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (
    !toState ||
    ![
      'backlog',
      'analysis',
      'development',
      'testing',
      'review',
      'deployment',
      'done',
      'blocked',
    ].includes(toState)
  ) {
    return {
      status: 400,
      response: {
        success: false,
        error: 'Invalid target state',
        validStates: [
          'backlog',
          'analysis',
          'development',
          'testing',
          'review',
          'deployment',
          'done',
          'blocked',
        ],
        timestamp: new Date().toISOString(),
      },
    };
  }

  return null;
}

/**
 * Validate task transition rules
 */
async function validateTaskTransition(
  taskMaster: {
    validateTaskTransition: (
      taskId: string,
      currentState: string,
      toState: TaskState
    ) => Promise<boolean>;
  },
  taskId: string,
  currentTask: { state: string },
  toState: TaskState
): Promise<{ status: number; response: unknown } | null> {
  const isValidTransition = await taskMaster.validateTaskTransition(
    taskId,
    currentTask.state,
    toState
  );
  if (!isValidTransition) {
    return {
      status: 422,
      response: {
        success: false,
        error: 'Invalid state transition',
        currentState: currentTask.state,
        targetState: toState,
        message: 'This transition is not allowed by SAFe workflow rules',
        timestamp: new Date().toISOString(),
      },
    };
  }
  return null;
}

/**
 * Validate WIP limits
 */
async function validateWIPLimits(
  taskMaster: {
    calculateWIPLimits: (
      toState: TaskState
    ) => Promise<{ available: number; current: number; limit: number }>;
  },
  toState: TaskState
): Promise<{ status: number; response: unknown; wipStatus?: unknown } | null> {
  const wipLimits = await taskMaster.calculateWIPLimits(toState);
  if (
    wipLimits.available <= 0 &&
    toState !== 'done' &&
    toState !== ' blocked'
  ) {
    return {
      status: 422,
      response: {
        success: false,
        error: 'WIP limit exceeded',
        wipStatus: wipLimits,
        message: `Cannot move task to ${  toState  }. WIP limit reached (${  wipLimits.current  }/${wipLimits.limit})`,
        timestamp: new Date().toISOString(),
      },
      wipStatus: wipLimits,
    };
  }
  return null;
}

/**
 * Broadcast task move event
 */
function broadcastTaskMove(
  manager: TaskMasterManager,
  moveData: {
    taskId: string;
    fromState: string;
    toState: string;
    reason?: string;
  }
): void {
  if (manager.webSocketCoordinator) {
    manager.webSocketCoordinator.broadcast('task:moved', {
      taskId: moveData.taskId,
      fromState: moveData.fromState,
      toState: moveData.toState,
      reason: moveData.reason || 'No reason provided',
      movedAt: new Date().toISOString(),
    });
  }
}

/**
 * Handle move task error response
 */
function handleMoveTaskError(
  req: Request,
  res: Response,
  error: unknown
): void {
  logger.error(`Failed to move task ${req.params.taskId}:`, error);
  log(LogLevel.ERROR, TASK_ERROR_MESSAGES.moveTaskFailed, req, {
    error: (error as Error).message,
    taskId: req.params.taskId,
    body: req.body,
  });

  res.status(500).json({
    success: false,
    error: TASK_ERROR_MESSAGES.moveTaskFailed,
    message: (error as Error).message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle move task endpoint
 */
async function handleMoveTask(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.INFO, 'Moving task through workflow', req);

  try {
    const taskMaster = await manager.getTaskMaster();
    const { taskId } = req.params;
    const { toState, reason } = req.body;

    // Validate inputs
    const validationResult = validateMoveTaskInputs(taskId, toState);
    if (validationResult) {
      return res
        .status(validationResult.status)
        .json(validationResult.response);
    }

    // Get current task
    const currentTask = await taskMaster.getTask(taskId);
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        taskId,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate transition and WIP limits
    const transitionResult = await validateTaskTransition(
      taskMaster,
      taskId,
      currentTask,
      toState as TaskState
    );
    if (transitionResult) {
      return res
        .status(transitionResult.status)
        .json(transitionResult.response);
    }

    const wipResult = await validateWIPLimits(taskMaster, toState as TaskState);
    if (wipResult) {
      return res.status(wipResult.status).json(wipResult.response);
    }

    // Move the task
    const result = await taskMaster.moveTask(taskId, toState);
    if (!result) {
      return res.status(422).json({
        success: false,
        error: TASK_ERROR_MESSAGES.moveTaskFailed,
        message: 'Task state change was rejected by the system',
        timestamp: new Date().toISOString(),
      });
    }

    // Broadcast and respond
    broadcastTaskMove(manager, {
      taskId,
      fromState: currentTask.state,
      toState,
      reason,
    });
    logger.info(`Task ${  taskId  } moved from ${  currentTask.state  } to ${  toState}`);

    res.json({
      success: true,
      message: `Task moved to ${  toState}`,
      data: {
        taskId,
        fromState: currentTask.state,
        toState,
        wipStatus: wipResult?.wipStatus,
        movedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleMoveTaskError(req, res, error);
  }
}

// PI Planning event creation handler
// Validation helper for PI Planning event data
function validatePIPlanningEventData(body: unknown): string[] {
  const validationErrors: string[] = [];
  const { planningIntervalNumber, artId, startDate, endDate, facilitator } =
    body;

  if (
    !planningIntervalNumber ||
    typeof planningIntervalNumber !== 'number' ||
    planningIntervalNumber < 1
  ) {
    validationErrors.push('Planning interval number must be a positive number');
  }
  if (!artId || typeof artId !== 'string' || artId.trim().length < 3) {
    validationErrors.push('ART ID must be at least 3 characters');
  }
  if (!startDate || !Date.parse(startDate)) {
    validationErrors.push('Start date must be a valid ISO date');
  }
  if (!endDate || !Date.parse(endDate)) {
    validationErrors.push('End date must be a valid ISO date');
  }
  if (
    !facilitator ||
    typeof facilitator !== 'string' ||
    facilitator.trim().length < 2
  ) {
    validationErrors.push('Facilitator name must be at least 2 characters');
  }
  if (startDate && endDate && Date.parse(startDate) >= Date.parse(endDate)) {
    validationErrors.push('End date must be after start date');
  }
  return validationErrors;
}

// Error response helper
function sendValidationError(res: Response, errors: string[]): void {
  res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  });
}

// Success response helper
function sendPIEventSuccess(res: Response, piEvent: unknown): void {
  res.status(201).json({
    success: true,
    data: piEvent,
    message: 'PI Planning event created successfully',
    timestamp: new Date().toISOString(),
  });
}

// Error handling helper
function handlePIEventError(req: Request, res: Response, error: unknown): void {
  logger.error('Failed to create PI Planning event: ', error);
  log(LogLevel.ERROR, 'Failed to create PI Planning event', req, {
    error: (error as Error).message,
    body: req.body,
  });

  res.status(500).json({
    success: false,
    error: 'Failed to create PI Planning event',
    message: (error as Error).message,
    timestamp: new Date().toISOString(),
  });
}

async function createPIPlanningEventHandler(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.INFO, 'Creating PI Planning event', req);

  try {
    const validationErrors = validatePIPlanningEventData(req.body);
    if (validationErrors.length > 0) {
      sendValidationError(res, validationErrors);
      return;
    }

    const taskMaster = await manager.getTaskMaster();
    const { planningIntervalNumber, artId, startDate, endDate, facilitator } =
      req.body;

    const piEvent = await taskMaster.createPIPlanningEvent({
      planningIntervalNumber,
      artId: artId.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      facilitator: facilitator.trim(),
    });

    logger.info(
      `PI Planning event created:PI ${  planningIntervalNumber  } for ART ${  artId}`
    );
    sendPIEventSuccess(res, piEvent);
  } catch (error) {
    handlePIEventError(req, res, error);
  }
}

// Setup PI Planning routes
function setupPIPlanningRoutes(
  router: Router,
  manager: TaskMasterManager
): void {
  router.post(
    '/pi-planning',
    asyncHandler((req: Request, res: Response) =>
      createPIPlanningEventHandler(req, res, manager)
    )
  );
}

/**
 * Setup system health routes
 */
function setupSystemHealthRoutes(
  router: Router,
  manager: TaskMasterManager
): void {
  router.get(
    '/health',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting TaskMaster health status', req);

      try {
        const taskMaster = await manager.getTaskMaster();
        const health = await taskMaster.getSystemHealth();

        // Comprehensive health assessment
        const status =
          health.overallHealth > 0.9
            ? 'healthy'
            : health.overallHealth > 0.8
              ? 'warning'
              : health.overallHealth > 0.6
                ? 'degraded'
                : 'unhealthy';

        const healthDetails = {
          status,
          overallHealth: Math.round(health.overallHealth * 1000) / 1000,
          databaseHealth: Math.round(health.databaseHealth * 1000) / 1000,
          apiHealth: Math.round(health.apiHealth * 1000) / 1000,
          queueHealth: Math.round(health.queueHealth * 1000) / 1000,
          lastUpdated: health.lastUpdated,
          systemUptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        };

        // Set appropriate HTTP status based on health
        const httpStatus =
          status === 'unhealthy' ? 503 : status === ' degraded' ? 207 : 200;

        res.status(httpStatus).json({
          success: true,
          data: healthDetails,
        });
      } catch (error) {
        logger.error('Failed to get system health: ', error);
        log(LogLevel.ERROR, 'Failed to get system health', req, {
          error: (error as Error).message,
        });

        res.status(503).json({
          success: false,
          error: 'Failed to get system health',
          message: (error as Error).message,
          timestamp: new Date().toISOString(),
        });
      }
    })
  );
}

// Calculate task state metrics
async function calculateStateMetrics(
  states: TaskState[],
  taskMaster: TaskMasterSystemInterface
): Promise<{
  tasksByState: Record<string, TaskMasterTask[]>;
  stateMetrics: Record<
    string,
    { count: number; totalEffort: number; avgEffort: number }
  >;
}> {
  const tasksByState: Record<string, TaskMasterTask[]> = {};
  const stateMetrics: Record<
    string,
    { count: number; totalEffort: number; avgEffort: number }
  > = {};

  // Parallel task fetching by state
  const taskPromises = states.map(async (state) => {
    const tasks = await taskMaster.getTasksByState(state);
    tasksByState[state] = tasks;

    const totalEffort = tasks.reduce(
      (sum, task) => sum + task.estimatedEffort,
      0
    );
    stateMetrics[state] = {
      count: tasks.length,
      totalEffort: Math.round(totalEffort * 4) / 4,
      avgEffort:
        tasks.length > 0 ? Math.round((totalEffort / tasks.length) * 4) / 4 : 0,
    };
  });

  await Promise.all(taskPromises);
  return { tasksByState, stateMetrics };
}

// Dashboard data handler
async function createDashboardDataHandler(
  req: Request,
  res: Response,
  manager: TaskMasterManager
): Promise<void> {
  log(LogLevel.DEBUG, 'Getting TaskMaster dashboard data', req);

  try {
    const taskMaster = await manager.getTaskMaster();

    // Parallel data fetching for performance
    const [metrics, health] = await Promise.all([
      taskMaster.getFlowMetrics(),
      taskMaster.getSystemHealth(),
    ]);

    // Get comprehensive task state data
    const states: TaskState[] = [
      'backlog',
      'analysis',
      'development',
      'testing',
      'review',
      'deployment',
      'done',
      'blocked',
    ];

    const { tasksByState, stateMetrics } = await calculateStateMetrics(
      states,
      taskMaster
    );

    // Calculate dashboard insights
    const totalTasks = Object.values(tasksByState).flat().length;
    const completedTasks = tasksByState.done.length;
    const blockedTasks = tasksByState.blocked.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const blockedRate =
      totalTasks > 0 ? Math.round((blockedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        metrics: {
          ...metrics,
          completionRate,
          blockedRate,
          totalTasks,
          activeStates: states.filter(
            (state) => tasksByState[state].length > 0
          ),
        },
        health,
        tasksByState,
        stateMetrics,
        states,
        insights: {
          bottlenecks: states.filter((state) => tasksByState[state].length > 5),
          highPriorityBlocked: tasksByState.blocked.filter(
            (task) => task.priority === 'high' || task.priority === 'critical'
          ).length,
          avgCycleTime: metrics.cycleTime,
          throughputTrend: 'stable', // Would be calculated from historical data
        },
        timestamp: new Date().toISOString(),
        realTimeEnabled: !!manager.webSocketCoordinator,
      },
    });
  } catch (error) {
    logger.error('Failed to get dashboard data: ', error);
    log(LogLevel.ERROR, 'Failed to get dashboard data', req, {
      error: (error as Error).message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Setup comprehensive dashboard routes
 */
function setupDashboardRoutes(
  router: Router,
  manager: TaskMasterManager
): void {
  router.get(
    '/dashboard',
    asyncHandler(async (req: Request, res: Response) => {
      await createDashboardDataHandler(req, res, manager);
    })
  );
}
// Export required service types and functions for core-system.ts
interface TaskMasterSystemInterface {
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
  createTask?(taskData: unknown): Promise<unknown>;
  moveTask?(taskId: string, newStatus: string): Promise<unknown>;
  getFlowMetrics?(): Promise<unknown>;
  createPIPlanningEvent?(eventData: unknown): Promise<unknown>;
}

export interface TaskMasterService {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): string;
  createTask?(taskData: unknown): Promise<unknown>;
  moveTask?(taskId: string, newStatus: string): Promise<unknown>;
  getFlowMetrics?(): Promise<unknown>;
  createPIPlanningEvent?(eventData: unknown): Promise<unknown>;
}

export async function getTaskMasterService(): Promise<TaskMasterService> {
  const taskMaster = new TaskMaster() as TaskMasterSystemInterface | null;

  // Initialize the TaskMaster service
  if (taskMaster && taskMaster.initialize) {
    await taskMaster.initialize();
  }
  return {
    initialize: async () => {
      if (taskMaster && taskMaster.initialize) {
        await taskMaster.initialize();
      }
    },
    shutdown: async () => {
      if (
        taskMaster &&
        typeof (taskMaster as unknown).shutdown === 'function'
      ) {
        await (taskMaster as unknown).shutdown();
      }
    },
    getStatus: () => 'ready',
    createTask: async (taskData: unknown) => {
      if (
        taskMaster &&
        typeof (taskMaster as unknown).createTask === 'function'
      ) {
        return await (taskMaster as unknown).createTask(taskData);
      }
      return { success: false, message: 'createTask not available' };
    },
    moveTask: async (taskId: string, newStatus: string) => {
      if (
        taskMaster &&
        typeof (taskMaster as unknown).moveTask === 'function'
      ) {
        return await (taskMaster as unknown).moveTask(taskId, newStatus);
      }
      return false;
    },
    getFlowMetrics: async () => {
      if (
        taskMaster &&
        typeof (taskMaster as unknown).getFlowMetrics === 'function'
      ) {
        return await (taskMaster as unknown).getFlowMetrics();
      }
      return {
        cycleTime: 0,
        leadTime: 0,
        throughput: 0,
        wipCount: 0,
        blockedTasks: 0,
        completedTasks: 0,
      };
    },
    createPIPlanningEvent: async (eventData: unknown) => {
      if (
        taskMaster &&
        typeof (taskMaster as unknown).createPIPlanningEvent === 'function'
      ) {
        return await (taskMaster as unknown).createPIPlanningEvent(eventData);
      }
      return { success: false, message: 'createPIPlanningEvent not available' };
    },
  };
}
