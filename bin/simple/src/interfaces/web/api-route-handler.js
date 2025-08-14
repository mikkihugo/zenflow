import { getLogger } from '../../config/logging-config.ts';
export class ApiRouteHandler {
    app;
    webSocket;
    config;
    logger = getLogger('ApiRoutes');
    constructor(app, webSocket, config) {
        this.app = app;
        this.webSocket = webSocket;
        this.config = config;
        this.setupRoutes();
    }
    setupRoutes() {
        const api = this.config.prefix;
        this.app.get(`${api}/health`, this.handleHealth.bind(this));
        this.app.get(`${api}/status`, this.handleSystemStatus.bind(this));
        this.app.get(`${api}/swarms`, this.handleGetSwarms.bind(this));
        this.app.post(`${api}/swarms`, this.handleCreateSwarm.bind(this));
        this.app.get(`${api}/tasks`, this.handleGetTasks.bind(this));
        this.app.post(`${api}/tasks`, this.handleCreateTask.bind(this));
        this.app.get(`${api}/documents`, this.handleGetDocuments.bind(this));
        this.app.post(`${api}/execute`, this.handleExecuteCommand.bind(this));
        this.app.get(`${api}/settings`, this.handleGetSettings.bind(this));
        this.app.post(`${api}/settings`, this.handleUpdateSettings.bind(this));
        this.logger.info(`API routes initialized with prefix: ${api}`);
    }
    handleHealth(_req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0-alpha.73',
            uptime: process.uptime(),
        });
    }
    async handleSystemStatus(_req, res) {
        try {
            const status = await this.getSystemStatus();
            res.json(status);
        }
        catch (error) {
            this.logger.error('Failed to get system status:', error);
            res.status(500).json({ error: 'Failed to get system status' });
        }
    }
    async handleGetSwarms(_req, res) {
        try {
            const swarms = await this.getSwarms();
            res.json(swarms);
        }
        catch (error) {
            this.logger.error('Failed to get swarms:', error);
            res.status(500).json({ error: 'Failed to get swarms' });
        }
    }
    async handleCreateSwarm(req, res) {
        try {
            const swarm = await this.createSwarm(req.body);
            this.webSocket.broadcast('swarm:created', swarm);
            res.json(swarm);
        }
        catch (error) {
            this.logger.error('Failed to create swarm:', error);
            res.status(500).json({ error: 'Failed to create swarm' });
        }
    }
    async handleGetTasks(_req, res) {
        try {
            const tasks = await this.getTasks();
            res.json(tasks);
        }
        catch (error) {
            this.logger.error('Failed to get tasks:', error);
            res.status(500).json({ error: 'Failed to get tasks' });
        }
    }
    async handleCreateTask(req, res) {
        try {
            const task = await this.createTask(req.body);
            this.webSocket.broadcast('task:created', task);
            res.json(task);
        }
        catch (error) {
            this.logger.error('Failed to create task:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
    async handleGetDocuments(_req, res) {
        try {
            const documents = await this.getDocuments();
            res.json(documents);
        }
        catch (error) {
            this.logger.error('Failed to get documents:', error);
            res.status(500).json({ error: 'Failed to get documents' });
        }
    }
    async handleExecuteCommand(req, res) {
        try {
            const { command, args = [] } = req.body;
            if (!command) {
                res.status(400).json({ error: 'Command is required' });
                return;
            }
            const result = await this.executeCommand(command, args);
            res.json(result);
        }
        catch (error) {
            this.logger.error('Command execution failed:', error);
            res.status(500).json({ error: 'Command execution failed' });
        }
    }
    handleGetSettings(req, res) {
        const sessionId = req.headers['x-session-id'];
        const session = this.webSocket.getSession(sessionId);
        res.json({
            theme: session?.preferences?.theme || 'dark',
            refreshInterval: session?.preferences?.refreshInterval || 3000,
            notifications: session?.preferences?.notifications ?? true,
        });
    }
    handleUpdateSettings(req, res) {
        const sessionId = req.headers['x-session-id'];
        const success = this.webSocket.updateSessionPreferences(sessionId, req.body);
        if (success) {
            res.json({ success: true });
        }
        else {
            res.status(400).json({ error: 'Failed to update settings' });
        }
    }
    async getSystemStatus() {
        return {
            status: 'healthy',
            version: '2.0.0-alpha.73',
            uptime: process.uptime() * 1000,
            components: {
                mcp: { status: 'ready', port: 3000 },
                swarm: { status: 'ready', agents: 0 },
                memory: { status: 'ready', usage: process.memoryUsage() },
                terminal: { status: 'ready', mode: 'none', active: false },
            },
            environment: {
                node: process.version,
                platform: process.platform,
                arch: process.arch,
                pid: process.pid,
            },
        };
    }
    async getSwarms() {
        return [
            {
                id: 'swarm-1',
                name: 'Document Processing',
                status: 'active',
                agents: 4,
                topology: 'mesh',
                uptime: 3600000,
                created: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'swarm-2',
                name: 'Feature Development',
                status: 'inactive',
                agents: 0,
                topology: 'hierarchical',
                uptime: 0,
                created: new Date(Date.now() - 7200000).toISOString(),
            },
        ];
    }
    async createSwarm(config) {
        const swarm = {
            id: `swarm-${Date.now()}`,
            name: config?.name || 'New Swarm',
            status: 'active',
            agents: config?.agents || 4,
            topology: config?.topology || 'mesh',
            uptime: 0,
            created: new Date().toISOString(),
        };
        this.logger.info(`Created swarm: ${swarm.id}`, swarm);
        return swarm;
    }
    async getTasks() {
        return [
            {
                id: 'task-1',
                description: 'Process documentation workflow',
                status: 'in_progress',
                progress: 65,
                assignedAgents: ['coordinator-1', 'worker-1'],
                priority: 'high',
                created: new Date(Date.now() - 300000).toISOString(),
                estimated: 600000,
            },
            {
                id: 'task-2',
                description: 'Optimize neural network training',
                status: 'completed',
                progress: 100,
                assignedAgents: ['worker-2'],
                priority: 'medium',
                created: new Date(Date.now() - 600000).toISOString(),
                completed: new Date(Date.now() - 60000).toISOString(),
            },
        ];
    }
    async createTask(config) {
        const task = {
            id: `task-${Date.now()}`,
            description: config?.description || 'New Task',
            status: 'pending',
            progress: 0,
            assignedAgents: config?.assignedAgents || [],
            priority: config?.priority || 'medium',
            created: new Date().toISOString(),
        };
        this.logger.info(`Created task: ${task.id}`, task);
        return task;
    }
    async getDocuments() {
        return [
            {
                id: 'doc-1',
                title: 'Product Vision',
                type: 'vision',
                path: 'docs/01-vision/product-vision.md',
                status: 'active',
                lastModified: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'doc-2',
                title: 'Authentication ADR',
                type: 'adr',
                path: 'docs/02-adrs/authentication-decision.md',
                status: 'draft',
                lastModified: new Date(Date.now() - 1800000).toISOString(),
            },
        ];
    }
    async executeCommand(command, args) {
        this.logger.info(`Executing command: ${command}`, { args });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            success: true,
            command,
            args,
            output: `Command '${command}' executed successfully`,
            timestamp: new Date().toISOString(),
        };
    }
}
export default ApiRouteHandler;
//# sourceMappingURL=api-route-handler.js.map