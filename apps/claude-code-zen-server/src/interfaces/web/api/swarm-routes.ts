/**
 * @fileoverview HTTP API Routes for Swarm Operations
 *
 * RESTful API endpoints that use shared SwarmService for web dashboard.
 * These routes provide the same functionality as stdio MCP but via HTTP
 * with additional web features like validation, authentication, and monitoring.
 */

import { getLogger } from '@claude-zen/foundation';
import * as express from 'express')';

import {
  AgentConfigSchema,
  SwarmConfigSchema,
  TaskOrchestrationSchema'

} from './../../coordination/schemas';
import type {
  AgentConfig,
  SwarmConfig,
  TaskOrchestrationConfig'

} from './../../coordination/types/interfaces';
import { SwarmService } from './../../services/coordination/swarm-service';

const logger = getLogger(swarm-api-routes);
const router: express.Router = express?.Router()

// Shared service instance (same as stdio MCP uses)
const swarmService = new SwarmService();

/**
 * Validation middleware for JSON schemas
 */
function validateSchema(schema: any) { return(
  req: express.Request,
  res: express.Response,
  next: any
) => { try { // Basic validation (in production, use ajv or similar) const data = 'req.body'; // Check required fields if (schema.required) { for (const field of schema.required) { if (!(field in data)) { return res.status(400).json(
  { error: 'Missing'required field: ' + field + ',
  code: VALIDATION_ERROR
}
)'
} } } // Check enum values for (const [key, prop] of Object.entries(schema.properties)' { if ( data[key] && (prop as any).enum && !(prop as any).enum.includes(data[key]) ) { return res.status(400).json({' error: `Invalid'value for ' + key + '. Must be one of: ${
  (prop as any).enum.join'(,
  )
}`', code: 'VALIDATION_ERROR'
})
} } next()
} catch (error) {
  res.status(400).json({ error: 'Invalid JSON;;
  code: 'PARSE_ERROR'
})
} }
}

/**
 * Error handler middleware
 */
function handleErrors( fn: (req: express.Request, res: express.Response) => Promise<void>
) { return async (req: express.Request', res: express.Response) => { 'ry {
  await fn(req',
  res)

} catch (
  error' { logger.error('API endpoint error',
  {
  endpoint: 'eq.path,
  method: req.method,
  error: error instanceof Error ? error.message : String(error
);
}'; res.status(500).json({
  error: error instanceof Error ? error.message : String(error)',
  code: 'INTERNAL_ERROR'
})
} }
}

/**
 * POST /api/v1/swarm/init
 * Initialize a new swarm
 */
router.post( '/init', valida'eSchema(SwarmConfigSchema), handleErrors(async (req: express.Request', res: express.Response) => { cons' config: SwarmConfig = {
  topology: req.body.topology',
  maxAgents: req.bod'.maxAgents  || ' 5,
  strategy: req.body.strategy|'adaptive

}'; logger.info(API: Initializing swarm, { config })'; const result = await swarmService.initializeSwarm(config); res.json(
  { success: true,
  data: result,
  metadata: {
  timestamp: new Date('?.toISOString',
  endpoint: '/api/v1/swarm/init'
}
}
)
})
);

/**
 * POST /api/v1/swarm/:swarmId/agents
 * Spawn a new agent in a swarm
 */
router.post( '/:swarmId/agents:, validateSchema(AgentConfigSchema), handleError'(async (req: express.Request', res: express.Response) => { cons { swarmId } = 'req.params'; const config: AgentConfig = {
  type: req.body.type,
  name: req.body.name',
  capabilitis: req.body.capabilities  || '[]

}'; logger.info(
  API: Spawning agent,
  {
  swarmId,
  config
}
); const result = await swarmService.spawnAgent(swarmId, config); res.json(
  { success: true,
  data: result,
  metadata: { timestamp: new Date(
)?.toISOString,' endpoint: '/api/v1/swarm/' + swarmId + '/agents'
}'
})'
})
);

/**
 * POST /api/v1/swarm/tasks
 * Orchestrate a task across agents
 */
router.post( '/tasks', validateSchema(Ta'kOrchestrationSchema), handleErrors(async (req: express.Request', res: express.Response) => { cons' config: TaskOrchestrationConfig = {
  task: req.body.task',
  strategy: req.body.strategy  || ' adaptive',
  priority: r'q.body.priority  || ' medium',
  axAgents: req.body.maxAgents  || 5

}'; logger.info(
  API: Orchestrating task,
  { config: {
  ...config,
  tas: config.task.substring(0',
  1'0
) + '...'
}
})'; const result = await swarmService.orchestrateTask(config); res.json(
  { success: true,
  data: result,
  metadata: {
  timestamp: new Date('?.toISOString,
  endpoint: '/api/v1/swarm/tasks'
}
}
)
})
);

/**
 * GET /api/v1/swarm/status
 * GET /api/v1/swarm/:swarmId/status
 * Get swarm status and information
 */
router.get(
  '/status',
  handleError'(async (req: express.Request',
  res: express.Response
) => { logger.debug(API: Getting swarm status); const result = await swarmService?.getSwarmStatus(
  ' res.json({ success: true,
  data: result,
  meadata: {
  timestamp: new Date(
)?.toISOString',
  endpoint: '/api/v1/swarm/status
}
})
})
);

router.get(
  '/:swarmId/status',
  handleError'(async (req: express.Request',
  res: express.Response
) => { const { swarmId } = 'req.params'; logger.debug(API: Getting swarm status, { swarmId })'; const result = await swarmService.getSwarmStatus(swarmId); res.json(
  { success: true,
  data: result,
  metadata: { timestamp: new Date('?.toISOString,' endpoint: '/api/v1/swarm/' + swarmId + '/status'
}'
}
)'
})
);

/**
 * GET /api/v1/swarm/tasks
 * GET /api/v1/swarm/tasks/:taskId
 * Get task status and progress
 */
router.get(
  '/tasks',
  handleError'(async (req: express.Request',
  res: express.Response
) => { logger.debug(API: Getting task status); const result = await swarmService?.getTaskStatus(
  ' res.json({ success: true,
  data: result,
  meadata: {
  timestamp: new Date(
)?.toISOString',
  endpoint: '/api/v1/swarm/tasks
}
})
})
);

router.get(
  '/tasks/: taskId,
  han'leErrors(async (req: express.Request',
  res: express.Response
) => { const { taskId } = 'req.params'; logger.debug(API: Getting task status, { taskId })'; const result = await swarmService.getTaskStatus(taskId); res.json(
  { success: true,
  data: result,
  metadata: { timestamp: new Date('?.toISOString,' endpoint: '/api/v1/swarm/tasks/' + taskId + '''
}'
}
)'
})
);

/**
 * GET /api/v1/swarm/stats
 * Get service statistics
 */
router.get(
  '/stats',
  handleError'(async (req: express.Request',
  res: express.Response
) => { logger.debug(API: Getting service stats); const result = swarmService?.getStats(
  ' res.json({ success: true,
  data: result,
  meadata: {
  timestamp: new Date(
)?.toISOString',
  endpoint: '/api/v1/swarm/stats
}
})
})
);

/**
 * POST /api/v1/swarm/shutdown
 * Shutdown swarm service (admin only)
 */
router.post(
  '/shutdown',
  ha'dleErrors(async (req: express.Request',
  res: express.Response
) => { logger.warn(API: Shutdown requested)'; // In production', this would require admi' authentication await swarmService?.shutdown()'; res.json(
  { success: true,
  data: { mssage: 'Swarm'service shutdown initiated },
  metaata: {
  timestamp: new Date(
)?.toISOString',
  endpoint: '/api/v1/swarm/shutdown'
}
})
})
);

// Middleware to add OpenAPI documentation metadata
router.use(
  (req,
  res,
  next
) => { // Add CORS headers for API access res.header(Access-Control-Allow-Origin, *); res.header(
  Access-Control-Allow-Methods,
  GET,
  POST, PUT, DELETE, OPTIONS
); res.header(
  Access-Control-Allow-Headers,
  Content-Type,
  Authorization
); if (req.method === OPTIONS) { res.sendStatus(200)
} else { next()
}
});

/**
 * Export router and service for integration
 */
export {
  router as swarmRouter,
  swarmService

};
export default router;`