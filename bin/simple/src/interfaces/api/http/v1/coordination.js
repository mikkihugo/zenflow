import { Router } from 'express';
import { CoordinationAPI } from '../../../../coordination/api.ts';
import { asyncHandler } from '../middleware/errors.ts';
import { LogLevel, log } from '../middleware/logging.ts';
export const createCoordinationRoutes = () => {
    const router = Router();
    router.get('/agents', asyncHandler(async (req, res) => {
        log(LogLevel.DEBUG, 'Listing agents', req, {
            query: req.query,
        });
        const result = await CoordinationAPI.agents.listAgents({
            status: req.query.status,
            type: req.query.type,
            limit: req.query.limit
                ? Number.parseInt(req.query.limit)
                : undefined,
            offset: req.query.offset
                ? Number.parseInt(req.query.offset)
                : undefined,
        });
        res.json(result);
    }));
    router.post('/agents', asyncHandler(async (req, res) => {
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
    }));
    router.get('/agents/:agentId', asyncHandler(async (req, res) => {
        const agentId = req.params.agentId;
        log(LogLevel.DEBUG, 'Getting agent details', req, {
            agentId,
        });
        const result = await CoordinationAPI.agents.getAgent(agentId);
        res.json(result);
    }));
    router.delete('/agents/:agentId', asyncHandler(async (req, res) => {
        const agentId = req.params.agentId;
        log(LogLevel.INFO, 'Removing agent', req, {
            agentId,
        });
        await CoordinationAPI.agents.removeAgent(agentId);
        log(LogLevel.INFO, 'Agent removed successfully', req, {
            agentId,
        });
        res.status(204).send();
    }));
    router.post('/tasks', asyncHandler(async (req, res) => {
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
    }));
    router.get('/tasks/:taskId', asyncHandler(async (req, res) => {
        const taskId = req.params.taskId;
        log(LogLevel.DEBUG, 'Getting task details', req, {
            taskId,
        });
        const result = await CoordinationAPI.tasks.getTask(taskId);
        res.json(result);
    }));
    router.get('/swarm/config', asyncHandler(async (req, res) => {
        log(LogLevel.DEBUG, 'Getting swarm configuration', req);
        const result = await CoordinationAPI.swarm.getConfig();
        res.json(result);
    }));
    router.put('/swarm/config', asyncHandler(async (req, res) => {
        log(LogLevel.INFO, 'Updating swarm configuration', req, {
            configKeys: Object.keys(req.body),
        });
        const result = await CoordinationAPI.swarm.updateConfig(req.body);
        log(LogLevel.INFO, 'Swarm configuration updated', req, {
            topology: result?.topology,
            maxAgents: result?.maxAgents,
        });
        res.json(result);
    }));
    router.get('/health', asyncHandler(async (_req, res) => {
        const result = await CoordinationAPI.health.getHealth();
        const statusCode = result?.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(result);
    }));
    router.get('/metrics', asyncHandler(async (req, res) => {
        const timeRange = req.query.timeRange;
        log(LogLevel.DEBUG, 'Getting coordination metrics', req, {
            timeRange: timeRange || 'default',
        });
        const result = await CoordinationAPI.health.getMetrics(timeRange);
        res.json(result);
    }));
    router.post('/swarm/initialize', asyncHandler(async (req, res) => {
        log(LogLevel.INFO, 'Initializing swarm', req, {
            topology: req.body.topology,
            maxAgents: req.body.maxAgents,
        });
        const result = {
            swarmId: `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            topology: req.body.topology || 'mesh',
            maxAgents: req.body.maxAgents || 10,
            status: 'initializing',
            created: new Date().toISOString(),
        };
        log(LogLevel.INFO, 'Swarm initialization started', req, {
            swarmId: result?.swarmId,
            topology: result?.topology,
        });
        res.status(202).json(result);
    }));
    router.get('/agents/:agentId/tasks', asyncHandler(async (req, res) => {
        const agentId = req.params.agentId;
        log(LogLevel.DEBUG, 'Getting agent tasks', req, {
            agentId,
            status: req.query.status,
        });
        const result = {
            agentId,
            tasks: [],
            total: 0,
            activeCount: 0,
            completedCount: 0,
        };
        res.json(result);
    }));
    router.post('/tasks/:taskId/assign', asyncHandler(async (req, res) => {
        const taskId = req.params.taskId;
        const agentId = req.body.agentId;
        log(LogLevel.INFO, 'Assigning task to agent', req, {
            taskId,
            agentId,
        });
        const result = {
            taskId,
            agentId,
            status: 'assigned',
            assignedAt: new Date().toISOString(),
        };
        log(LogLevel.INFO, 'Task assigned successfully', req, {
            taskId,
            agentId,
        });
        res.json(result);
    }));
    router.post('/agents/:agentId/heartbeat', asyncHandler(async (req, res) => {
        const agentId = req.params.agentId;
        log(LogLevel.DEBUG, 'Agent heartbeat received', req, {
            agentId,
            workload: req.body.workload,
            status: req.body.status,
        });
        const result = {
            agentId,
            acknowledged: true,
            timestamp: new Date().toISOString(),
            nextHeartbeat: new Date(Date.now() + 30000).toISOString(),
        };
        res.json(result);
    }));
    return router;
};
export default createCoordinationRoutes;
//# sourceMappingURL=coordination.js.map