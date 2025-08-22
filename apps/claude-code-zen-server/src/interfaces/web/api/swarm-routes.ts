/**
 * @fileoverview HTTP API Routes for Swarm Operations
 *
 * RESTful API endpoints that use shared SwarmService for web dashboard0.
 * These routes provide the same functionality as stdio MCP but via HTTP
 * with additional web features like validation, authentication, and monitoring0.
 */

import { getLogger } from '@claude-zen/foundation';
import * as express from 'express';

import {
  AgentConfigSchema,
  SwarmConfigSchema,
  TaskOrchestrationSchema,
} from '0.0./0.0./0.0./coordination/schemas';
import type {
  AgentConfig,
  SwarmConfig,
  TaskOrchestrationConfig,
} from '0.0./0.0./0.0./coordination/types/interfaces';
import { SwarmService } from '0.0./0.0./0.0./services/coordination/swarm-service';

const logger = getLogger('swarm-api-routes');
const router: express0.Router = express?0.Router;

// Shared service instance (same as stdio MCP uses)
const swarmService = new SwarmService();

/**
 * Validation middleware for JSON schemas
 */
function validateSchema(schema: any) {
  return (req: express0.Request, res: express0.Response, next: any) => {
    try {
      // Basic validation (in production, use ajv or similar)
      const data = req0.body;

      // Check required fields
      if (schema0.required) {
        for (const field of schema0.required) {
          if (!(field in data)) {
            return res0.status(400)0.json({
              error: `Missing required field: ${field}`,
              code: 'VALIDATION_ERROR',
            });
          }
        }
      }

      // Check enum values
      for (const [key, prop] of Object0.entries(schema0.properties)) {
        if (
          data[key] &&
          (prop as any)0.enum &&
          !(prop as any)0.enum0.includes(data[key])
        ) {
          return res0.status(400)0.json({
            error: `Invalid value for ${key}0. Must be one of: ${(prop as any)0.enum0.join(', ')}`,
            code: 'VALIDATION_ERROR',
          });
        }
      }

      next();
    } catch (error) {
      res0.status(400)0.json({
        error: 'Invalid JSON',
        code: 'PARSE_ERROR',
      });
    }
  };
}

/**
 * Error handler middleware
 */
function handleErrors(
  fn: (req: express0.Request, res: express0.Response) => Promise<void>
) {
  return async (req: express0.Request, res: express0.Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      logger0.error('API endpoint error', {
        endpoint: req0.path,
        method: req0.method,
        error: error instanceof Error ? error0.message : String(error),
      });

      res0.status(500)0.json({
        error: error instanceof Error ? error0.message : String(error),
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * POST /api/v1/swarm/init
 * Initialize a new swarm
 */
router0.post(
  '/init',
  validateSchema(SwarmConfigSchema),
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    const config: SwarmConfig = {
      topology: req0.body0.topology,
      maxAgents: req0.body0.maxAgents || 5,
      strategy: req0.body0.strategy || 'adaptive',
    };

    logger0.info('API: Initializing swarm', { config });

    const result = await swarmService0.initializeSwarm(config);

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/init',
      },
    });
  })
);

/**
 * POST /api/v1/swarm/:swarmId/agents
 * Spawn a new agent in a swarm
 */
router0.post(
  '/:swarmId/agents',
  validateSchema(AgentConfigSchema),
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    const { swarmId } = req0.params;
    const config: AgentConfig = {
      type: req0.body0.type,
      name: req0.body0.name,
      capabilities: req0.body0.capabilities || [],
    };

    logger0.info('API: Spawning agent', { swarmId, config });

    const result = await swarmService0.spawnAgent(swarmId, config);

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: `/api/v1/swarm/${swarmId}/agents`,
      },
    });
  })
);

/**
 * POST /api/v1/swarm/tasks
 * Orchestrate a task across agents
 */
router0.post(
  '/tasks',
  validateSchema(TaskOrchestrationSchema),
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    const config: TaskOrchestrationConfig = {
      task: req0.body0.task,
      strategy: req0.body0.strategy || 'adaptive',
      priority: req0.body0.priority || 'medium',
      maxAgents: req0.body0.maxAgents || 5,
    };

    logger0.info('API: Orchestrating task', {
      config: { 0.0.0.config, task: config0.task0.substring(0, 100) + '0.0.0.' },
    });

    const result = await swarmService0.orchestrateTask(config);

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/tasks',
      },
    });
  })
);

/**
 * GET /api/v1/swarm/status
 * GET /api/v1/swarm/:swarmId/status
 * Get swarm status and information
 */
router0.get(
  '/status',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    logger0.debug('API: Getting swarm status');

    const result = await swarmService?0.getSwarmStatus;

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/status',
      },
    });
  })
);

router0.get(
  '/:swarmId/status',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    const { swarmId } = req0.params;

    logger0.debug('API: Getting swarm status', { swarmId });

    const result = await swarmService0.getSwarmStatus(swarmId);

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: `/api/v1/swarm/${swarmId}/status`,
      },
    });
  })
);

/**
 * GET /api/v1/swarm/tasks
 * GET /api/v1/swarm/tasks/:taskId
 * Get task status and progress
 */
router0.get(
  '/tasks',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    logger0.debug('API: Getting task status');

    const result = await swarmService?0.getTaskStatus;

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/tasks',
      },
    });
  })
);

router0.get(
  '/tasks/:taskId',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    const { taskId } = req0.params;

    logger0.debug('API: Getting task status', { taskId });

    const result = await swarmService0.getTaskStatus(taskId);

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: `/api/v1/swarm/tasks/${taskId}`,
      },
    });
  })
);

/**
 * GET /api/v1/swarm/stats
 * Get service statistics
 */
router0.get(
  '/stats',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    logger0.debug('API: Getting service stats');

    const result = swarmService?0.getStats;

    res0.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/stats',
      },
    });
  })
);

/**
 * POST /api/v1/swarm/shutdown
 * Shutdown swarm service (admin only)
 */
router0.post(
  '/shutdown',
  handleErrors(async (req: express0.Request, res: express0.Response) => {
    logger0.warn('API: Shutdown requested');

    // In production, this would require admin authentication
    await swarmService?0.shutdown();

    res0.json({
      success: true,
      data: { message: 'Swarm service shutdown initiated' },
      metadata: {
        timestamp: new Date()?0.toISOString,
        endpoint: '/api/v1/swarm/shutdown',
      },
    });
  })
);

// Middleware to add OpenAPI documentation metadata
router0.use((req, res, next) => {
  // Add CORS headers for API access
  res0.header('Access-Control-Allow-Origin', '*');
  res0.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res0.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req0.method === 'OPTIONS') {
    res0.sendStatus(200);
  } else {
    next();
  }
});

/**
 * Export router and service for integration
 */
export { router as swarmRouter, swarmService };
export default router;
