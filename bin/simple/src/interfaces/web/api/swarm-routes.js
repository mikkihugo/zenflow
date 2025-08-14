import * as express from 'express';
import { getLogger } from '../../../config/logging-config.js';
import { SwarmService } from '../../../services/coordination/swarm-service.js';
import { AgentConfigSchema, SwarmConfigSchema, TaskOrchestrationSchema, } from '../../../types/swarm-types.js';
const logger = getLogger('swarm-api-routes');
const router = express.Router();
const swarmService = new SwarmService();
function validateSchema(schema) {
    return (req, res, next) => {
        try {
            const data = req.body;
            if (schema.required) {
                for (const field of schema.required) {
                    if (!(field in data)) {
                        return res.status(400).json({
                            error: `Missing required field: ${field}`,
                            code: 'VALIDATION_ERROR',
                        });
                    }
                }
            }
            for (const [key, prop] of Object.entries(schema.properties)) {
                if (data[key] &&
                    prop.enum &&
                    !prop.enum.includes(data[key])) {
                    return res.status(400).json({
                        error: `Invalid value for ${key}. Must be one of: ${prop.enum.join(', ')}`,
                        code: 'VALIDATION_ERROR',
                    });
                }
            }
            next();
        }
        catch (error) {
            res.status(400).json({
                error: 'Invalid JSON',
                code: 'PARSE_ERROR',
            });
        }
    };
}
function handleErrors(fn) {
    return async (req, res) => {
        try {
            await fn(req, res);
        }
        catch (error) {
            logger.error('API endpoint error', {
                endpoint: req.path,
                method: req.method,
                error: error instanceof Error ? error.message : String(error),
            });
            res.status(500).json({
                error: error instanceof Error ? error.message : String(error),
                code: 'INTERNAL_ERROR',
            });
        }
    };
}
router.post('/init', validateSchema(SwarmConfigSchema), handleErrors(async (req, res) => {
    const config = {
        topology: req.body.topology,
        maxAgents: req.body.maxAgents || 5,
        strategy: req.body.strategy || 'adaptive',
    };
    logger.info('API: Initializing swarm', { config });
    const result = await swarmService.initializeSwarm(config);
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/init',
        },
    });
}));
router.post('/:swarmId/agents', validateSchema(AgentConfigSchema), handleErrors(async (req, res) => {
    const { swarmId } = req.params;
    const config = {
        type: req.body.type,
        name: req.body.name,
        capabilities: req.body.capabilities || [],
    };
    logger.info('API: Spawning agent', { swarmId, config });
    const result = await swarmService.spawnAgent(swarmId, config);
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: `/api/v1/swarm/${swarmId}/agents`,
        },
    });
}));
router.post('/tasks', validateSchema(TaskOrchestrationSchema), handleErrors(async (req, res) => {
    const config = {
        task: req.body.task,
        strategy: req.body.strategy || 'adaptive',
        priority: req.body.priority || 'medium',
        maxAgents: req.body.maxAgents || 5,
    };
    logger.info('API: Orchestrating task', {
        config: { ...config, task: config.task.substring(0, 100) + '...' },
    });
    const result = await swarmService.orchestrateTask(config);
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/tasks',
        },
    });
}));
router.get('/status', handleErrors(async (req, res) => {
    logger.debug('API: Getting swarm status');
    const result = await swarmService.getSwarmStatus();
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/status',
        },
    });
}));
router.get('/:swarmId/status', handleErrors(async (req, res) => {
    const { swarmId } = req.params;
    logger.debug('API: Getting swarm status', { swarmId });
    const result = await swarmService.getSwarmStatus(swarmId);
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: `/api/v1/swarm/${swarmId}/status`,
        },
    });
}));
router.get('/tasks', handleErrors(async (req, res) => {
    logger.debug('API: Getting task status');
    const result = await swarmService.getTaskStatus();
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/tasks',
        },
    });
}));
router.get('/tasks/:taskId', handleErrors(async (req, res) => {
    const { taskId } = req.params;
    logger.debug('API: Getting task status', { taskId });
    const result = await swarmService.getTaskStatus(taskId);
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: `/api/v1/swarm/tasks/${taskId}`,
        },
    });
}));
router.get('/stats', handleErrors(async (req, res) => {
    logger.debug('API: Getting service stats');
    const result = swarmService.getStats();
    res.json({
        success: true,
        data: result,
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/stats',
        },
    });
}));
router.post('/shutdown', handleErrors(async (req, res) => {
    logger.warn('API: Shutdown requested');
    await swarmService.shutdown();
    res.json({
        success: true,
        data: { message: 'Swarm service shutdown initiated' },
        metadata: {
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/swarm/shutdown',
        },
    });
}));
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
export { router as swarmRouter, swarmService };
export default router;
//# sourceMappingURL=swarm-routes.js.map