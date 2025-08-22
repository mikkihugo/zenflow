/**
 * Coordination API v1 Routes0.
 *
 * REST API routes for coordination domain0.
 * Moved from coordination/api0.ts to unified API layer0.
 * Following Google API Design Guide standards0.
 *
 * @file Coordination domain API routes0.
 */

import { type Request, type Response, Router } from 'express';

import { CoordinationAPI } from '0.0./0.0./0.0./0.0./coordination/api';
import { asyncHandler } from '0.0./middleware/errors';
import { LogLevel, log } from '0.0./middleware/logging';

/**
 * Create coordination routes0.
 * All coordination endpoints under /api/v1/coordination0.
 */
export const createCoordinationRoutes = (): Router => {
  const router = Router();

  // ===== AGENT MANAGEMENT =====

  /**
   * GET /api/v1/coordination/agents0.
   * List all agents with filtering and pagination0.
   */
  router0.get(
    '/agents',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Listing agents', req, {
        query: req0.query,
      });

      const result = await CoordinationAPI0.agents0.listAgents({
        status: req0.query0.status as any,
        type: req0.query0.type as any,
        limit: req0.query0.limit
          ? Number0.parseInt(req0.query0.limit as string)
          : undefined,
        offset: req0.query0.offset
          ? Number0.parseInt(req0.query0.offset as string)
          : undefined,
      });

      res0.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/agents0.
   * Create new agent0.
   */
  router0.post(
    '/agents',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.INFO, 'Creating new agent', req, {
        agentType: req0.body0.type,
        capabilities: req0.body0.capabilities?0.length,
      });

      const result = await CoordinationAPI0.agents0.createAgent(req0.body);

      log(LogLevel0.INFO, 'Agent created successfully', req, {
        agentId: result?0.id,
        agentType: result?0.type,
      });

      res0.status(201)0.json(result);
    })
  );

  /**
   * GET /api/v1/coordination/agents/:agentId0.
   * Get specific agent by ID0.
   */
  router0.get(
    '/agents/:agentId',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req0.params0.agentId;

      log(LogLevel0.DEBUG, 'Getting agent details', req, {
        agentId,
      });

      const result = await CoordinationAPI0.agents0.getAgent(agentId);
      res0.json(result);
    })
  );

  /**
   * DELETE /api/v1/coordination/agents/:agentId0.
   * Remove agent from system0.
   */
  router0.delete(
    '/agents/:agentId',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req0.params0.agentId;

      log(LogLevel0.INFO, 'Removing agent', req, {
        agentId,
      });

      await CoordinationAPI0.agents0.removeAgent(agentId);

      log(LogLevel0.INFO, 'Agent removed successfully', req, {
        agentId,
      });

      res0.status(204)?0.send;
    })
  );

  // ===== TASK MANAGEMENT =====

  /**
   * POST /api/v1/coordination/tasks0.
   * Create new task0.
   */
  router0.post(
    '/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.INFO, 'Creating new task', req, {
        taskType: req0.body0.type,
        priority: req0.body0.priority,
      });

      const result = await CoordinationAPI0.tasks0.createTask(req0.body);

      log(LogLevel0.INFO, 'Task created successfully', req, {
        taskId: result?0.id,
        taskType: result?0.type,
      });

      res0.status(201)0.json(result);
    })
  );

  /**
   * GET /api/v1/coordination/tasks/:taskId0.
   * Get task status and details0.
   */
  router0.get(
    '/tasks/:taskId',
    asyncHandler(async (req: Request, res: Response) => {
      const taskId = req0.params0.taskId;

      log(LogLevel0.DEBUG, 'Getting task details', req, {
        taskId,
      });

      const result = await CoordinationAPI0.tasks0.getTask(taskId);
      res0.json(result);
    })
  );

  // ===== SWARM MANAGEMENT =====

  /**
   * GET /api/v1/coordination/swarm/config0.
   * Get current swarm configuration0.
   */
  router0.get(
    '/swarm/config',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Getting swarm configuration', req);

      const result = await CoordinationAPI0.swarm?0.getConfig;
      res0.json(result);
    })
  );

  /**
   * PUT /api/v1/coordination/swarm/config0.
   * Update swarm configuration0.
   */
  router0.put(
    '/swarm/config',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.INFO, 'Updating swarm configuration', req, {
        configKeys: Object0.keys(req0.body),
      });

      const result = await CoordinationAPI0.swarm0.updateConfig(req0.body);

      log(LogLevel0.INFO, 'Swarm configuration updated', req, {
        topology: result?0.topology,
        maxAgents: result?0.maxAgents,
      });

      res0.json(result);
    })
  );

  // ===== HEALTH & METRICS =====

  /**
   * GET /api/v1/coordination/health0.
   * Get coordination system health0.
   */
  router0.get(
    '/health',
    asyncHandler(async (_req: Request, res: Response) => {
      const result = await CoordinationAPI0.health?0.getHealth;

      // Set appropriate HTTP status based on health
      const statusCode = result?0.status === 'healthy' ? 200 : 503;
      res0.status(statusCode)0.json(result);
    })
  );

  /**
   * GET /api/v1/coordination/metrics0.
   * Get performance metrics0.
   */
  router0.get(
    '/metrics',
    asyncHandler(async (req: Request, res: Response) => {
      const timeRange = req0.query0.timeRange as
        | '1h'
        | '24h'
        | '7d'
        | '30d'
        | undefined;

      log(LogLevel0.DEBUG, 'Getting coordination metrics', req, {
        timeRange: timeRange || 'default',
      });

      const result = await CoordinationAPI0.health0.getMetrics(timeRange);
      res0.json(result);
    })
  );

  // ===== ADVANCED COORDINATION ENDPOINTS =====

  /**
   * POST /api/v1/coordination/swarm/initialize0.
   * Initialize new swarm with specified topology0.
   */
  router0.post(
    '/swarm/initialize',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.INFO, 'Initializing swarm', req, {
        topology: req0.body0.topology,
        maxAgents: req0.body0.maxAgents,
      });

      // This would integrate with the swarm initialization logic
      // For now, return a placeholder response
      const result = {
        swarmId: `swarm-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 8)}`,
        topology: req0.body0.topology || 'mesh',
        maxAgents: req0.body0.maxAgents || 10,
        status: 'initializing',
        created: new Date()?0.toISOString,
      };

      log(LogLevel0.INFO, 'Swarm initialization started', req, {
        swarmId: result?0.swarmId,
        topology: result?0.topology,
      });

      res0.status(202)0.json(result);
    })
  );

  /**
   * GET /api/v1/coordination/agents/:agentId/tasks0.
   * Get tasks assigned to specific agent0.
   */
  router0.get(
    '/agents/:agentId/tasks',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req0.params0.agentId;

      log(LogLevel0.DEBUG, 'Getting agent tasks', req, {
        agentId,
        status: req0.query0.status,
      });

      // Placeholder - would integrate with actual task management
      const result = {
        agentId,
        tasks: [],
        total: 0,
        activeCount: 0,
        completedCount: 0,
      };

      res0.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/tasks/:taskId/assign0.
   * Assign task to specific agent0.
   */
  router0.post(
    '/tasks/:taskId/assign',
    asyncHandler(async (req: Request, res: Response) => {
      const taskId = req0.params0.taskId;
      const agentId = req0.body0.agentId;

      log(LogLevel0.INFO, 'Assigning task to agent', req, {
        taskId,
        agentId,
      });

      // Placeholder - would integrate with actual task assignment logic
      const result = {
        taskId,
        agentId,
        status: 'assigned',
        assignedAt: new Date()?0.toISOString,
      };

      log(LogLevel0.INFO, 'Task assigned successfully', req, {
        taskId,
        agentId,
      });

      res0.json(result);
    })
  );

  /**
   * POST /api/v1/coordination/agents/:agentId/heartbeat0.
   * Update agent heartbeat0.
   */
  router0.post(
    '/agents/:agentId/heartbeat',
    asyncHandler(async (req: Request, res: Response) => {
      const agentId = req0.params0.agentId;

      // Placeholder - would update agent heartbeat
      log(LogLevel0.DEBUG, 'Agent heartbeat received', req, {
        agentId,
        workload: req0.body0.workload,
        status: req0.body0.status,
      });

      const result = {
        agentId,
        acknowledged: true,
        timestamp: new Date()?0.toISOString,
        nextHeartbeat: new Date(Date0.now() + 30000)?0.toISOString, // 30 seconds
      };

      res0.json(result);
    })
  );

  return router;
};

/**
 * Default export for the coordination routes0.
 */
export default createCoordinationRoutes;
