/**
 * Web API Routes - RESTful API endpoint definitions.
 *
 * Centralized API route definitions for the web dashboard.
 * Handles all HTTP API endpoints with proper error handling.
 */
/**
 * @file Interface implementation: web-api-routes.
 */

import type { Express, Request, Response } from 'express';
import { getLogger } from '../../config/logging-config';
import { getVersion } from '../../config/version';
import type { WebConfig } from './web-config';
import type { WebDataService } from './web-data-service';
import type { WebSessionManager } from './web-session-manager';

export class WebApiRoutes {
  private logger = getLogger('WebAPI');
  private config: WebConfig;
  private sessionManager: WebSessionManager;
  private dataService: WebDataService;

  constructor(
    config: WebConfig,
    sessionManager: WebSessionManager,
    dataService: WebDataService
  ) {
    this.config = config;
    this.sessionManager = sessionManager;
    this.dataService = dataService;
  }

  /**
   * Setup all API routes.
   *
   * @param app
   */
  setupRoutes(app: Express): void {
    const api = this.config.apiPrefix!;

    // Health check endpoint
    app.get(`${api}/health`, this.handleHealthCheck.bind(this));

    // System status endpoint
    app.get(`${api}/status`, this.handleSystemStatus.bind(this));

    // Swarm management endpoints
    app.get(`${api}/swarms`, this.handleGetSwarms.bind(this));
    app.post(`${api}/swarms`, this.handleCreateSwarm.bind(this));

    // MCP removed - Web-only interface

    // Task management endpoints
    app.get(`${api}/tasks`, this.handleGetTasks.bind(this));
    app.post(`${api}/tasks`, this.handleCreateTask.bind(this));

    // Document management endpoints
    app.get(`${api}/documents`, this.handleGetDocuments.bind(this));

    // Command execution endpoint
    app.post(`${api}/execute`, this.handleExecuteCommand.bind(this));

    // Settings management endpoints
    app.get(`${api}/settings`, this.handleGetSettings.bind(this));
    app.post(`${api}/settings`, this.handleUpdateSettings.bind(this));

    this.logger.info(`API routes registered with prefix: ${api}`);
  }

  /**
   * Health check endpoint.
   *
   * @param _req
   * @param res
   */
  private handleHealthCheck(_req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: getVersion(),
      uptime: process.uptime(),
    });
  }

  /**
   * System status endpoint.
   *
   * @param _req
   * @param res
   */
  private async handleSystemStatus(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      const status = await this.dataService.getSystemStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Failed to get system status:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  }

  /**
   * Get swarms endpoint.
   *
   * @param _req
   * @param res
   */
  private async handleGetSwarms(_req: Request, res: Response): Promise<void> {
    try {
      const swarms = await this.dataService.getSwarms();
      res.json(swarms);
    } catch (error) {
      this.logger.error('Failed to get swarms:', error);
      res.status(500).json({ error: 'Failed to get swarms' });
    }
  }

  /**
   * Create swarm endpoint.
   *
   * @param req
   * @param res
   */
  private async handleCreateSwarm(req: Request, res: Response): Promise<void> {
    try {
      const swarm = await this.dataService.createSwarm(req.body);
      this.logger.info(`Created swarm: ${swarm.name}`);
      res.json(swarm);
    } catch (error) {
      this.logger.error('Failed to create swarm:', error);
      res.status(500).json({ error: 'Failed to create swarm' });
    }
  }

  /**
   * Get tasks endpoint.
   *
   * @param _req
   * @param res
   */
  private async handleGetTasks(_req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.dataService.getTasks();
      res.json(tasks);
    } catch (error) {
      this.logger.error('Failed to get tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  /**
   * Create task endpoint.
   *
   * @param req
   * @param res
   */
  private async handleCreateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.dataService.createTask(req.body);
      this.logger.info(`Created task: ${task.title}`);
      res.json(task);
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Get documents endpoint.
   *
   * @param _req
   * @param res
   */
  private async handleGetDocuments(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      const documents = await this.dataService.getDocuments();
      res.json(documents);
    } catch (error) {
      this.logger.error('Failed to get documents:', error);
      res.status(500).json({ error: 'Failed to get documents' });
    }
  }

  /**
   * Execute command endpoint.
   *
   * @param req
   * @param res
   */
  private async handleExecuteCommand(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { command, args } = req.body;
      const result = await this.dataService.executeCommand(command, args);
      this.logger.info(`Executed command: ${command}`);
      res.json(result);
    } catch (error) {
      this.logger.error('Command execution failed:', error);
      res.status(500).json({ error: 'Command execution failed' });
    }
  }

  /**
   * Get settings endpoint.
   *
   * @param req
   * @param res
   */
  private handleGetSettings(req: Request, res: Response): void {
    const session = this.sessionManager.getSession(req.sessionId!);
    res.json({
      session: session?.preferences,
      system: {
        theme: this.config.theme,
        realTime: this.config.realTime,
      },
    });
  }

  /**
   * Update settings endpoint.
   *
   * @param req
   * @param res
   */
  private handleUpdateSettings(req: Request, res: Response): void {
    const success = this.sessionManager.updateSessionPreferences(
      req.sessionId!,
      req.body
    );

    if (success) {
      this.logger.debug(`Updated settings for session: ${req.sessionId}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  }

  /**
   * Handle MCP requests from Claude Desktop.
   */
  private async handleMcpRequest(req: Request, res: Response): Promise<void> {
    try {
      this.logger.debug('MCP request received:', req.body);

      // Handle MCP protocol requests
      const { method, params } = req.body;
      
      if (method === 'tools/call') {
        const { name, arguments: args } = params;
        
        // Import SwarmService and tools
        const { SwarmService } = await import('../../services/coordination/swarm-service.ts');
        const { createSimpleSwarmTools } = await import('../mcp/simple-swarm-tools.ts');
        const { createDocumentWorkflowTools } = await import('../mcp/document-workflow-tools.ts');
        
        const swarmService = new SwarmService();
        const allTools = [
          ...createSimpleSwarmTools(swarmService),
          ...createDocumentWorkflowTools(swarmService)
        ];
        
        // Find the requested tool
        const tool = allTools.find(t => t.name.replace('mcp__claude-zen__', '') === name);
        
        if (!tool) {
          return res.status(404).json({
            error: { message: `Tool not found: ${name}` }
          });
        }
        
        // Execute the tool
        const result = await tool.handler(args);
        
        res.json({
          content: result.content,
          isError: result.isError || false
        });
        
      } else {
        res.status(400).json({ 
          error: { message: `Unknown MCP method: ${method}` }
        });
      }
      
    } catch (error) {
      this.logger.error('MCP request failed:', error);
      res.status(500).json({
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      });
    }
  }

  /**
   * Get available MCP tools list.
   */
  private async handleMcpTools(req: Request, res: Response): Promise<void> {
    try {
      // Import tools
      const { SwarmService } = await import('../../services/coordination/swarm-service.ts');
      const { createSimpleSwarmTools } = await import('../mcp/simple-swarm-tools.ts');
      const { createDocumentWorkflowTools } = await import('../mcp/document-workflow-tools.ts');
      
      const swarmService = new SwarmService();
      const allTools = [
        ...createSimpleSwarmTools(swarmService),
        ...createDocumentWorkflowTools(swarmService)
      ];
      
      const tools = allTools.map(tool => ({
        name: tool.name.replace('mcp__claude-zen__', ''),
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
      
      res.json({
        tools,
        server: {
          name: 'claude-code-zen',
          version: '2.0.0'
        }
      });
      
    } catch (error) {
      this.logger.error('MCP tools list failed:', error);
      res.status(500).json({
        error: { message: 'Failed to get tools list' }
      });
    }
  }

  /**
   * Handle MCP CORS preflight requests.
   */
  private handleMcpOptions(req: Request, res: Response): void {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  }
}
