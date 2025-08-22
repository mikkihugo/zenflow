/**
 * Coordination API v1 Routes.
 *
 * REST API routes for coordination domain.
 * Moved from coordination/api.ts to unified API layer.
 * Following Google API Design Guide standards.
 *
 * @file Coordination domain API routes.
 */

import { type Request, type Response, Router } from 'express';

import { CoordinationAPI } from './../../../coordination/api';
import { asyncHandler } from './middleware/errors';
import { LogLevel, log } from './middleware/logging';

/**
 * Create coordination routes.
 * All coordination endpoints under /api/v1/coordination.
 */
export const createCoordinationRoutes = (): Router => {
  const router = Router();

  // ===== AGENT MANAGEMENT =====

  /**
   * GET /api/v1/coordination/agents.
   * List all agents with filtering and pagination.
   */
  router.get(
    '/agents',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Listing agents', req, {
        query: req.query,
      });

      const result = await CoordinationAPI.agents.listAgents({
        status: req.query.status as any,
        type: req.query.type as any,
        limit: req.query.limit
          ? Number.parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? Number.parseInt(req.query.offset as string)
          : undefined,
      });

      res.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/agents.
   * Create new agent.
   */
  router.post(
    '/agents',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Creating new agent', req, {
        agentType: req.body.type,
        capabilities: req.body.capabilities?.length,
      });

      const result = await CoordinationAPI.agents.createAgent(req.body);

      log(LogLevel.INFO, 'Agent created successfully', req, {
        agentId: result?.id,
        agentType: result?.type,
      });

      res.status(201).json(result);
    })
  );

  /**
   * GET /api/v1/coordination/agents/:agentId.
   * Get specific agent by ID.
   */
  router.get(
    '/agents/:agentId',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req.params.agentId;

      log(LogLevel.DEBUG, 'Getting agent details', req, {
        agentId,
      });

      const result = await CoordinationAPI.agents.getAgent(agentId);
      res.json(result);
    })
  );

  /**
   * DELETE /api/v1/coordination/agents/:agentId.
   * Remove agent from system.
   */
  router.delete(
    '/agents/:agentId',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req.params.agentId;

      log(LogLevel.INFO, 'Removing agent', req, {
        agentId,
      });

      await CoordinationAPI.agents.removeAgent(agentId);

      log(LogLevel.INFO, 'Agent removed successfully', req, {
        agentId,
      });

      res.status(204)?.send()
    })
  );

  // ===== TASK MANAGEMENT =====

  /**
   * POST /api/v1/coordination/tasks.
   * Create new task.
   */
  router.post(
    '/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Creating new task', req, {
        taskType: req.body.type,
        priority: req.body.priority,
      });

      const result = await CoordinationAPI.tasks.createTask(req.body);

      log(LogLevel.INFO, 'Task created successfully', req, {
        taskId: result?.id,
        taskType: result?.type,
      });

      res.status(201).json(result);
    })
  );

  /**
   * GET /api/v1/coordination/tasks/:taskId.
   * Get task status and details.
   */
  router.get(
    '/tasks/:taskId',
    asyncHandler(async (req: Request, res: Response) => {
      const taskId = req.params.taskId;

      log(LogLevel.DEBUG, 'Getting task details', req, {
        taskId,
      });

      const result = await CoordinationAPI.tasks.getTask(taskId);
      res.json(result);
    })
  );

  // ===== SWARM MANAGEMENT =====

  /**
   * GET /api/v1/coordination/swarm/config.
   * Get current swarm configuration.
   */
  router.get(
    '/swarm/config',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting swarm configuration', req);

      const result = await CoordinationAPI.swarm?.getConfig()
      res.json(result);
    })
  );

  /**
   * PUT /api/v1/coordination/swarm/config.
   * Update swarm configuration.
   */
  router.put(
    '/swarm/config',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Updating swarm configuration', req, {
        configKeys: Object.keys(req.body),
      });

      const result = await CoordinationAPI.swarm.updateConfig(req.body);

      log(LogLevel.INFO, 'Swarm configuration updated', req, {
        topology: result?.topology,
        maxAgents: result?.maxAgents,
      });

      res.json(result);
    })
  );

  // ===== HEALTH & METRICS =====

  /**
   * GET /api/v1/coordination/health.
   * Get coordination system health.
   */
  router.get(
    '/health',
    asyncHandler(async (_req: Request, res: Response) => {
      const result = await CoordinationAPI.health?.getHealth()

      // Set appropriate HTTP status based on health
      const statusCode = result?.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(result);
    })
  );

  /**
   * GET /api/v1/coordination/metrics.
   * Get performance metrics.
   */
  router.get(
    '/metrics',
    asyncHandler(async (req: Request, res: Response) => {
      const timeRange = req.query.timeRange as' | ''1h'' | ''24h'' | ''7d'' | ''30d'' | 'undefined;

      log(LogLevel.DEBUG,'Getting coordination metrics', req, {
        timeRange: timeRange || 'default',
      });

      const result = await CoordinationAPI.health.getMetrics(timeRange);
      res.json(result);
    })
  );

  // ===== ADVANCED COORDINATION ENDPOINTS =====

  /**
   * POST /api/v1/coordination/swarm/initialize.
   * Initialize new swarm with specified topology.
   */
  router.post(
    '/swarm/initialize',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Initializing swarm', req, {
        topology: req.body.topology,
        maxAgents: req.body.maxAgents,
      });

      // This would integrate with the swarm initialization logic
      // For now, return a placeholder response
      const result = {
        swarmId: `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        topology: req.body.topology || 'mesh',
        maxAgents: req.body.maxAgents || 10,
        status:'initializing',
        created: new Date()?.toISOString,
      };

      log(LogLevel.INFO, 'Swarm initialization started', req, {
        swarmId: result?.swarmId,
        topology: result?.topology,
      });

      res.status(202).json(result);
    })
  );

  /**
   * GET /api/v1/coordination/agents/:agentId/tasks.
   * Get tasks assigned to specific agent.
   */
  router.get(
    '/agents/:agentId/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req.params.agentId;

      log(LogLevel.DEBUG, 'Getting agent tasks', req, {
        agentId,
        status: req.query.status,
      });

      // Placeholder - would integrate with actual task management
      const result = {
        agentId,
        tasks: [],
        total: 0,
        activeCount: 0,
        completedCount: 0,
      };

      res.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/tasks/:taskId/assign.
   * Assign task to specific agent.
   */
  router.post(
    '/tasks/:taskId/assign',
    asyncHandler(async (req: Request, res: Response) => {
      const taskId = req.params.taskId;
      const agentId = req.body.agentId;

      log(LogLevel.INFO, 'Assigning task to agent', req, {
        taskId,
        agentId,
      });

      // Placeholder - would integrate with actual task assignment logic
      const result = {
        taskId,
        agentId,
        status: 'assigned',
        assignedAt: new Date()?.toISOString,
      };

      log(LogLevel.INFO, 'Task assigned successfully', req, {
        taskId,
        agentId,
      });

      res.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/agents/:agentId/heartbeat.
   * Update agent heartbeat.
   */
  router.post(
    '/agents/:agentId/heartbeat',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req.params.agentId;

      // Placeholder - would update agent heartbeat
      log(LogLevel.DEBUG, 'Agent heartbeat received', req, {
        agentId,
        workload: req.body.workload,
        status: req.body.status,
      });

      const result = {
        agentId,
        acknowledged: true,
        timestamp: new Date()?.toISOString,
        nextHeartbeat: new Date(Date.now() + 30000)?.toISOString, // 30 seconds
      };

      res.json(result);
    })
  );

  return router;
};

/**
 * Default export for the coordination routes.
 */
export default createCoordinationRoutes;
