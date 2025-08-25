/**
 * TaskMaster SAFe 6.0 API Routes
 *
 * REST API routes for TaskMaster workflow management.
 * Provides real-time SAFe flow metrics, task management, and PI Planning coordination.
 *
 * @file TaskMaster API routes for SAFe workflow management.
 */

import { Router, type Request, type Response } from 'express';
import { getTaskMasterService } from '../taskmaster/taskmaster-service';
import { asyncHandler } from '../middleware/errors';
import { LogLevel, log } from '../middleware/logging';
import type { WebSocketCoordinator } from '../../infrastructure/websocket/socket.coordinator';

/**
 * Create TaskMaster API routes.
 * All TaskMaster endpoints under /api/v1/taskmaster.
 */
export const createTaskMasterRoutes = (webSocketCoordinator?: WebSocketCoordinator): Router => {
  const router = Router();
  
  // Connect WebSocket coordinator to TaskMaster service
  const taskMasterService = getTaskMasterService();
  if (webSocketCoordinator) {
    taskMasterService.setWebSocketCoordinator(webSocketCoordinator);
  }

  // ===== SAFE FLOW METRICS =====

  /**
   * GET /api/v1/taskmaster/metrics
   * Get real-time SAFe flow metrics
   */
  router.get(
    '/metrics',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting SAFe flow metrics', req);

      try {
        const taskMasterService = getTaskMasterService();
        const metrics = await taskMasterService.getFlowMetrics();
        const health = await taskMasterService.getSystemHealth();

        res.json({
          success: true,
          data: {
            ...metrics,
            systemHealth: health
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get flow metrics', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to get flow metrics',
          message: error.message
        });
      }
    })
  );

  // ===== TASK MANAGEMENT =====

  /**
   * POST /api/v1/taskmaster/tasks
   * Create a new SAFe workflow task
   */
  router.post(
    '/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Creating new SAFe task', req);

      try {
        const taskMasterService = getTaskMasterService();
        const { title, description, priority, estimatedEffort, assignedAgent } = req.body;

        if (!title || !priority || !estimatedEffort) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            required: ['title', 'priority', 'estimatedEffort']
          });
        }

        const task = await taskMasterService.createTask({
          title,
          description,
          priority,
          estimatedEffort,
          assignedAgent
        });

        res.status(201).json({
          success: true,
          data: task,
          message: 'Task created successfully'
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to create task', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to create task',
          message: error.message
        });
      }
    })
  );

  /**
   * GET /api/v1/taskmaster/tasks/:taskId
   * Get task by ID
   */
  router.get(
    '/tasks/:taskId',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting task by ID', req);

      try {
        const taskMasterService = getTaskMasterService();
        const { taskId } = req.params;

        const task = await taskMasterService.getTask(taskId);

        if (!task) {
          return res.status(404).json({
            success: false,
            error: 'Task not found',
            taskId
          });
        }

        res.json({
          success: true,
          data: task
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get task', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to get task',
          message: error.message
        });
      }
    })
  );

  /**
   * PUT /api/v1/taskmaster/tasks/:taskId/move
   * Move task through SAFe workflow states
   */
  router.put(
    '/tasks/:taskId/move',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Moving task through workflow', req);

      try {
        const taskMasterService = getTaskMasterService();
        const { taskId } = req.params;
        const { toState } = req.body;

        if (!toState) {
          return res.status(400).json({
            success: false,
            error: 'Missing required field: toState'
          });
        }

        const result = await taskMasterService.moveTask(taskId, toState);

        if (!result) {
          return res.status(400).json({
            success: false,
            error: 'Failed to move task - check WIP limits or task state'
          });
        }

        res.json({
          success: true,
          message: `Task moved to ${toState}`,
          data: { taskId, toState }
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to move task', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to move task',
          message: error.message
        });
      }
    })
  );

  /**
   * GET /api/v1/taskmaster/tasks/state/:state
   * Get tasks by workflow state
   */
  router.get(
    '/tasks/state/:state',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting tasks by state', req);

      try {
        const taskMasterService = getTaskMasterService();
        const { state } = req.params;

        const tasks = await taskMasterService.getTasksByState(state as any);

        res.json({
          success: true,
          data: {
            state,
            tasks,
            count: tasks.length
          }
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get tasks by state', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to get tasks by state',
          message: error.message
        });
      }
    })
  );

  // ===== PI PLANNING EVENTS =====

  /**
   * POST /api/v1/taskmaster/pi-planning
   * Create PI Planning event
   */
  router.post(
    '/pi-planning',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Creating PI Planning event', req);

      try {
        const taskMasterService = getTaskMasterService();
        const { planningIntervalNumber, artId, startDate, endDate, facilitator } = req.body;

        if (!planningIntervalNumber || !artId || !startDate || !endDate || !facilitator) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            required: ['planningIntervalNumber', 'artId', 'startDate', 'endDate', 'facilitator']
          });
        }

        const piEvent = await taskMasterService.createPIPlanningEvent({
          planningIntervalNumber,
          artId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          facilitator
        });

        res.status(201).json({
          success: true,
          data: piEvent,
          message: 'PI Planning event created successfully'
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to create PI Planning event', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to create PI Planning event',
          message: error.message
        });
      }
    })
  );

  // ===== SYSTEM HEALTH =====

  /**
   * GET /api/v1/taskmaster/health
   * Get TaskMaster system health status
   */
  router.get(
    '/health',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting TaskMaster health status', req);

      try {
        const taskMasterService = getTaskMasterService();
        const health = await taskMasterService.getSystemHealth();

        const status = health.overallHealth > 0.8 ? 'healthy' : 
                      health.overallHealth > 0.6 ? 'degraded' : 'unhealthy';

        res.json({
          success: true,
          data: {
            ...health,
            status,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get system health', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to get system health',
          message: error.message
        });
      }
    })
  );

  // ===== DASHBOARD DATA =====

  /**
   * GET /api/v1/taskmaster/dashboard
   * Get comprehensive dashboard data for web interface
   */
  router.get(
    '/dashboard',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting TaskMaster dashboard data', req);

      try {
        const taskMasterService = getTaskMasterService();
        const [metrics, health] = await Promise.all([
          taskMasterService.getFlowMetrics(),
          taskMasterService.getSystemHealth()
        ]);

        // Get tasks by state for dashboard visualization
        const states = ['backlog', 'analysis', 'development', 'testing', 'review', 'deployment', 'done', 'blocked'];
        const tasksByState = {};
        
        for (const state of states) {
          const tasks = await taskMasterService.getTasksByState(state as any);
          tasksByState[state] = tasks;
        }

        res.json({
          success: true,
          data: {
            metrics,
            health,
            tasksByState,
            states,
            timestamp: new Date().toISOString(),
            realTimeEnabled: true
          }
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get dashboard data', req, { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Failed to get dashboard data',
          message: error.message
        });
      }
    })
  );

  return router;
};