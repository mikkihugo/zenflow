import { getLogger } from '../../config/logging-config.ts';
export class WebApiRoutes {
    logger = getLogger('WebAPI');
    config;
    sessionManager;
    dataService;
    constructor(config, sessionManager, dataService) {
        this.config = config;
        this.sessionManager = sessionManager;
        this.dataService = dataService;
    }
    setupRoutes(app) {
        const api = this.config.apiPrefix;
        app.get(`${api}/health`, this.handleHealthCheck.bind(this));
        app.get(`${api}/status`, this.handleSystemStatus.bind(this));
        app.get(`${api}/swarms`, this.handleGetSwarms.bind(this));
        app.post(`${api}/swarms`, this.handleCreateSwarm.bind(this));
        app.get(`${api}/tasks`, this.handleGetTasks.bind(this));
        app.post(`${api}/tasks`, this.handleCreateTask.bind(this));
        app.get(`${api}/documents`, this.handleGetDocuments.bind(this));
        app.post(`${api}/execute`, this.handleExecuteCommand.bind(this));
        app.get(`${api}/settings`, this.handleGetSettings.bind(this));
        app.post(`${api}/settings`, this.handleUpdateSettings.bind(this));
        this.logger.info(`API routes registered with prefix: ${api}`);
    }
    handleHealthCheck(_req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0-alpha.73',
            uptime: process.uptime(),
        });
    }
    async handleSystemStatus(_req, res) {
        try {
            const status = await this.dataService.getSystemStatus();
            res.json(status);
        }
        catch (error) {
            this.logger.error('Failed to get system status:', error);
            res.status(500).json({ error: 'Failed to get system status' });
        }
    }
    async handleGetSwarms(_req, res) {
        try {
            const swarms = await this.dataService.getSwarms();
            res.json(swarms);
        }
        catch (error) {
            this.logger.error('Failed to get swarms:', error);
            res.status(500).json({ error: 'Failed to get swarms' });
        }
    }
    async handleCreateSwarm(req, res) {
        try {
            const swarm = await this.dataService.createSwarm(req.body);
            this.logger.info(`Created swarm: ${swarm.name}`);
            res.json(swarm);
        }
        catch (error) {
            this.logger.error('Failed to create swarm:', error);
            res.status(500).json({ error: 'Failed to create swarm' });
        }
    }
    async handleGetTasks(_req, res) {
        try {
            const tasks = await this.dataService.getTasks();
            res.json(tasks);
        }
        catch (error) {
            this.logger.error('Failed to get tasks:', error);
            res.status(500).json({ error: 'Failed to get tasks' });
        }
    }
    async handleCreateTask(req, res) {
        try {
            const task = await this.dataService.createTask(req.body);
            this.logger.info(`Created task: ${task.title}`);
            res.json(task);
        }
        catch (error) {
            this.logger.error('Failed to create task:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
    async handleGetDocuments(_req, res) {
        try {
            const documents = await this.dataService.getDocuments();
            res.json(documents);
        }
        catch (error) {
            this.logger.error('Failed to get documents:', error);
            res.status(500).json({ error: 'Failed to get documents' });
        }
    }
    async handleExecuteCommand(req, res) {
        try {
            const { command, args } = req.body;
            const result = await this.dataService.executeCommand(command, args);
            this.logger.info(`Executed command: ${command}`);
            res.json(result);
        }
        catch (error) {
            this.logger.error('Command execution failed:', error);
            res.status(500).json({ error: 'Command execution failed' });
        }
    }
    handleGetSettings(req, res) {
        const session = this.sessionManager.getSession(req.sessionId);
        res.json({
            session: session?.preferences,
            system: {
                theme: this.config.theme,
                realTime: this.config.realTime,
            },
        });
    }
    handleUpdateSettings(req, res) {
        const success = this.sessionManager.updateSessionPreferences(req.sessionId, req.body);
        if (success) {
            this.logger.debug(`Updated settings for session: ${req.sessionId}`);
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'Session not found' });
        }
    }
}
//# sourceMappingURL=web-api-routes.js.map