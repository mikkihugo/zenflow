/**
 * API Route Handler - RESTful API endpoints.
 *
 * Handles all REST API routes for the web dashboard including system status,
 * swarm management, task operations, and command execution.
 */
/**
 * @file Interface implementation: api-route-handler.
 */

import type { Express, Request, Response } from 'express';
import { getLogger } from '../../config/logging-config.ts';
import type { WebSocketCoordinator } from './web-socket-coordinator.ts';

export interface ApiConfig {
  prefix: string;
  enableCors?: boolean;
}

export interface SystemStatus {
  status: string;
  version: string;
  uptime: number;
  components: {
    mcp: { status: string; port: number };
    swarm: { status: string; agents: number };
    memory: { status: string; usage: any };
    terminal: { status: string; mode: string; active: boolean };
  };
  environment: {
    node: string;
    platform: string;
    arch: string;
    pid: number;
  };
}

/**
 * Handles RESTful API routes for web interface.
 *
 * @example
 */
export class ApiRouteHandler {
  private logger = getLogger('ApiRoutes');

  constructor(
    private app: Express,
    private webSocket: WebSocketCoordinator,
    private config: ApiConfig
  ) {
    this.setupRoutes();
  }

  /**
   * Setup all API routes.
   */
  private setupRoutes(): void {
    const api = this.config.prefix;

    // Health check endpoint
    this.app.get(`${api}/health`, this.handleHealth.bind(this));

    // System status endpoint
    this.app.get(`${api}/status`, this.handleSystemStatus.bind(this));

    // Swarm management endpoints
    this.app.get(`${api}/swarms`, this.handleGetSwarms.bind(this));
    this.app.post(`${api}/swarms`, this.handleCreateSwarm.bind(this));

    // Task management endpoints
    this.app.get(`${api}/tasks`, this.handleGetTasks.bind(this));
    this.app.post(`${api}/tasks`, this.handleCreateTask.bind(this));

    // Document management endpoints
    this.app.get(`${api}/documents`, this.handleGetDocuments.bind(this));

    // Command execution endpoint
    this.app.post(`${api}/execute`, this.handleExecuteCommand.bind(this));

    // Settings management endpoints
    this.app.get(`${api}/settings`, this.handleGetSettings.bind(this));
    this.app.post(`${api}/settings`, this.handleUpdateSettings.bind(this));

    this.logger.info(`API routes initialized with prefix: ${api}`);
  }

  /**
   * Health check handler.
   *
   * @param _req
   * @param res
   */
  private handleHealth(_req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0-alpha.73',
      uptime: process.uptime(),
    });
  }

  /**
   * System status handler.
   *
   * @param _req
   * @param res
   */
  private async handleSystemStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.getSystemStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Failed to get system status:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  }

  /**
   * Get swarms handler.
   *
   * @param _req
   * @param res
   */
  private async handleGetSwarms(_req: Request, res: Response): Promise<void> {
    try {
      const swarms = await this.getSwarms();
      res.json(swarms);
    } catch (error) {
      this.logger.error('Failed to get swarms:', error);
      res.status(500).json({ error: 'Failed to get swarms' });
    }
  }

  /**
   * Create swarm handler.
   *
   * @param req
   * @param res
   */
  private async handleCreateSwarm(req: Request, res: Response): Promise<void> {
    try {
      const swarm = await this.createSwarm(req.body);
      this.webSocket.broadcast('swarm:created', swarm);
      res.json(swarm);
    } catch (error) {
      this.logger.error('Failed to create swarm:', error);
      res.status(500).json({ error: 'Failed to create swarm' });
    }
  }

  /**
   * Get tasks handler.
   *
   * @param _req
   * @param res
   */
  private async handleGetTasks(_req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.getTasks();
      res.json(tasks);
    } catch (error) {
      this.logger.error('Failed to get tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  /**
   * Create task handler.
   *
   * @param req
   * @param res
   */
  private async handleCreateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.createTask(req.body);
      this.webSocket.broadcast('task:created', task);
      res.json(task);
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Get documents handler.
   *
   * @param _req
   * @param res
   */
  private async handleGetDocuments(_req: Request, res: Response): Promise<void> {
    try {
      const documents = await this.getDocuments();
      res.json(documents);
    } catch (error) {
      this.logger.error('Failed to get documents:', error);
      res.status(500).json({ error: 'Failed to get documents' });
    }
  }

  /**
   * Execute command handler.
   *
   * @param req
   * @param res
   */
  private async handleExecuteCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command, args = [] } = req.body;
      if (!command) {
        res.status(400).json({ error: 'Command is required' });
        return;
      }

      const result = await this.executeCommand(command, args);
      res.json(result);
    } catch (error) {
      this.logger.error('Command execution failed:', error);
      res.status(500).json({ error: 'Command execution failed' });
    }
  }

  /**
   * Get settings handler.
   *
   * @param req
   * @param res
   */
  private handleGetSettings(req: Request, res: Response): void {
    const sessionId = req.headers['x-session-id'] as string;
    const session = this.webSocket.getSession(sessionId);

    res.json({
      theme: session?.preferences?.theme || 'dark',
      refreshInterval: session?.preferences?.refreshInterval || 3000,
      notifications: session?.preferences?.notifications ?? true,
    });
  }

  /**
   * Update settings handler.
   *
   * @param req
   * @param res
   */
  private handleUpdateSettings(req: Request, res: Response): void {
    const sessionId = req.headers['x-session-id'] as string;
    const success = this.webSocket.updateSessionPreferences(sessionId, req.body);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to update settings' });
    }
  }

  /**
   * Get comprehensive system status.
   */
  private async getSystemStatus(): Promise<SystemStatus> {
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

  /**
   * Get available swarms.
   */
  private async getSwarms(): Promise<any[]> {
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

  /**
   * Create a new swarm.
   *
   * @param config
   */
  private async createSwarm(config: any): Promise<any> {
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

  /**
   * Get available tasks.
   */
  private async getTasks(): Promise<any[]> {
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

  /**
   * Create a new task.
   *
   * @param config
   */
  private async createTask(config: any): Promise<any> {
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

  /**
   * Get available documents.
   */
  private async getDocuments(): Promise<any[]> {
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

  /**
   * Execute a command.
   *
   * @param command
   * @param args
   */
  private async executeCommand(command: string, args: string[]): Promise<any> {
    this.logger.info(`Executing command: ${command}`, { args });

    // Mock command execution for demo purposes
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
