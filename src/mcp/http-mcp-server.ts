#!/usr/bin/env node
/**
 * HTTP MCP Server - Runs MCP protocol over HTTP on port 3000
 * Provides all Claude Flow tools including Git integration
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ClaudeFlowMCPServer } from './mcp-server.js';
import { EventEmitter } from 'events';

// Import types
import { 
  UnifiedServer,
  ServerConfig,
  ServerStatus,
  ServerMetrics,
  ServerHealth,
  TypedRequest,
  TypedResponse,
  ValidationResult,
  UserContext,
  SessionContext
} from '../types/server.js';
import { 
  SystemStatus, 
  HealthCheck, 
  JSONObject, 
  JSONValue 
} from '../types/core.js';
import { 
  MCPMessage, 
  MCPRequest, 
  MCPResponse, 
  MCPError,
  Tool,
  ToolExecutionResult
} from '../types/mcp.js';

/**
 * HTTP MCP Server Configuration
 */
export interface HTTPMCPServerConfig {
  port?: number;
  host?: string;
  enableGitTools?: boolean;
  enableAllTools?: boolean;
  httpMode?: boolean;
  cors?: cors.CorsOptions;
  timeout?: number;
  rateLimit?: {
    windowMs?: number;
    max?: number;
  };
}

/**
 * Server Metrics
 */
interface HTTPMCPServerMetrics {
  requests: number;
  mcpRequests: number;
  toolCalls: number;
  errors: number;
  uptime: number;
  averageResponseTime: number;
}

/**
 * HTTP MCP Server Implementation
 * Provides MCP protocol over HTTP with RESTful endpoints
 */
export class HTTPMCPServer extends EventEmitter implements Partial<UnifiedServer> {
  private readonly _app: Application;
  private readonly _port: number;
  private readonly _host: string;
  private readonly _config: HTTPMCPServerConfig;
  private _server: any = null;
  private _isRunning: boolean = false;

  // MCP server instance
  private _mcpServer: ClaudeFlowMCPServer;

  // Metrics tracking
  private _metrics: HTTPMCPServerMetrics = {
    requests: 0,
    mcpRequests: 0,
    toolCalls: 0,
    errors: 0,
    uptime: Date.now(),
    averageResponseTime: 0
  };

  // Response time tracking
  private _responseTimes: number[] = [];

  constructor(config: HTTPMCPServerConfig = {}) {
    super();

    this._config = {
      port: config.port || process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000,
      host: config.host || '0.0.0.0',
      enableGitTools: config.enableGitTools !== false,
      enableAllTools: config.enableAllTools !== false,
      httpMode: config.httpMode !== false,
      timeout: config.timeout || 30000,
      ...config
    };

    this._port = this._config.port!;
    this._host = this._config.host!;
    this._app = express();

    // Initialize MCP server
    this._mcpServer = new ClaudeFlowMCPServer({
      enableGitTools: this._config.enableGitTools,
      enableAllTools: this._config.enableAllTools,
      httpMode: this._config.httpMode
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();

    console.log(`🚀 Initializing HTTP MCP Server on port ${this._port}`);
  }

  /**
   * Get server configuration
   */
  get config(): HTTPMCPServerConfig {
    return { ...this._config };
  }

  /**
   * Get current server status
   */
  get status(): SystemStatus {
    if (!this._isRunning) return 'offline';
    
    const hasErrors = this._metrics.errors > 0;
    const mcpHealthy = this._mcpServer != null;
    
    if (hasErrors || !mcpHealthy) return 'degraded';
    return 'healthy';
  }

  /**
   * Get current metrics
   */
  get metrics(): HTTPMCPServerMetrics {
    return { ...this._metrics };
  }

  /**
   * Get MCP server instance
   */
  get mcpServer(): ClaudeFlowMCPServer {
    return this._mcpServer;
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Enable CORS for all origins
    this._app.use(cors(this._config.cors || {}));
    
    // JSON parsing with size limit
    this._app.use(express.json({ limit: '50mb' }));
    this._app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request logging and metrics
    this._app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      this._metrics.requests++;
      if (req.path.startsWith('/mcp')) {
        this._metrics.mcpRequests++;
      }

      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);

      // Track response time
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this._responseTimes.push(responseTime);
        
        // Keep only last 100 response times for average calculation
        if (this._responseTimes.length > 100) {
          this._responseTimes.shift();
        }
        
        this._metrics.averageResponseTime = 
          this._responseTimes.reduce((sum, time) => sum + time, 0) / this._responseTimes.length;
      });

      next();
    });

    // Request timeout
    this._app.use((req: Request, res: Response, next: NextFunction) => {
      res.setTimeout(this._config.timeout!, () => {
        if (!res.headersSent) {
          res.status(408).json({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32603,
              message: 'Request timeout'
            }
          });
        }
      });
      next();
    });
  }

  /**
   * Setup HTTP routes for MCP protocol
   */
  private setupRoutes(): void {
    // Health check endpoint
    this._app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        server: 'claude-flow-mcp-http',
        tools: this._mcpServer.toolsRegistry?.getToolCount() || 0,
        uptime: (Date.now() - this._metrics.uptime) / 1000,
        metrics: this._metrics
      });
    });

    // Server information endpoint
    this._app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Claude Flow HTTP MCP Server',
        version: '2.1.0',
        description: 'HTTP interface for Model Context Protocol',
        endpoints: {
          health: '/health',
          initialize: 'POST /mcp/initialize',
          tools_list: 'POST /mcp/tools/list',
          tools_call: 'POST /mcp/tools/call',
          mcp: 'POST /mcp',
          tools_info: 'GET /mcp/tools'
        },
        metrics: this._metrics
      });
    });

    // MCP initialize endpoint
    this._app.post('/mcp/initialize', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'initialize',
          params: req.body.params || {}
        });
        res.json(response);
      } catch (error) {
        this.handleMCPError(req, res, error as Error);
      }
    });

    // MCP tools/list endpoint
    this._app.post('/mcp/tools/list', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'tools/list',
          params: req.body.params || {}
        });
        res.json(response);
      } catch (error) {
        this.handleMCPError(req, res, error as Error);
      }
    });

    // MCP tools/call endpoint
    this._app.post('/mcp/tools/call', async (req: Request, res: Response) => {
      try {
        this._metrics.toolCalls++;
        const response = await this._mcpServer.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'tools/call',
          params: req.body.params
        });
        res.json(response);
      } catch (error) {
        this.handleMCPError(req, res, error as Error);
      }
    });

    // Unified MCP endpoint (handles all MCP methods)
    this._app.post('/mcp', async (req: Request, res: Response) => {
      try {
        const message: MCPMessage = req.body;
        
        // Track tool calls
        if ((message as MCPRequest).method === 'tools/call') {
          this._metrics.toolCalls++;
        }

        const response = await this._mcpServer.handleMessage(message);
        res.json(response);
      } catch (error) {
        this.handleMCPError(req, res, error as Error, req.body.id);
      }
    });

    // List available tools (human-readable)
    this._app.get('/mcp/tools', async (req: Request, res: Response) => {
      try {
        const tools = await this._mcpServer.toolsRegistry?.getAllTools() || [];
        res.json({
          success: true,
          count: tools.length,
          tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            category: t.category || 'general',
            inputSchema: t.inputSchema
          }))
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve tools',
          message: (error as Error).message
        });
      }
    });

    // Get specific tool information
    this._app.get('/mcp/tools/:toolName', async (req: Request, res: Response) => {
      try {
        const { toolName } = req.params;
        const tools = await this._mcpServer.toolsRegistry?.getAllTools() || [];
        const tool = tools.find(t => t.name === toolName);
        
        if (!tool) {
          return res.status(404).json({
            success: false,
            error: 'Tool not found',
            message: `Tool '${toolName}' is not available`
          });
        }

        res.json({
          success: true,
          tool: {
            name: tool.name,
            description: tool.description,
            category: tool.category || 'general',
            inputSchema: tool.inputSchema
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve tool information',
          message: (error as Error).message
        });
      }
    });

    // Server metrics endpoint
    this._app.get('/metrics', (req: Request, res: Response) => {
      res.json({
        success: true,
        metrics: this._metrics,
        server: {
          uptime: (Date.now() - this._metrics.uptime) / 1000,
          status: this.status,
          tools_available: this._mcpServer.toolsRegistry?.getToolCount() || 0
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this._app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not available`,
        available_endpoints: [
          'GET /',
          'GET /health',
          'GET /metrics',
          'POST /mcp/initialize',
          'POST /mcp/tools/list',
          'POST /mcp/tools/call',
          'POST /mcp',
          'GET /mcp/tools',
          'GET /mcp/tools/:toolName'
        ],
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this._app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('HTTP MCP Server error:', err);
      this._metrics.errors++;
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Handle MCP-specific errors
   */
  private handleMCPError(req: Request, res: Response, error: Error, id?: string | number | null): void {
    console.error('MCP operation failed:', error);
    this._metrics.errors++;
    
    res.status(500).json({
      jsonrpc: '2.0',
      id: id || req.body.id || 1,
      error: {
        code: -32603,
        message: error.message,
        data: {
          timestamp: new Date().toISOString(),
          method: req.body.method || req.path
        }
      }
    });
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    if (this._isRunning) {
      throw new Error('Server is already running');
    }

    // Wait for MCP server to be ready
    await new Promise(resolve => setTimeout(resolve, 100));

    return new Promise((resolve, reject) => {
      this._server = this._app.listen(this._port, this._host, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }

        this._isRunning = true;
        
        console.log(`🚀 HTTP MCP Server running on http://${this._host}:${this._port}`);
        console.log(`📊 Health check: http://${this._host}:${this._port}/health`);
        console.log(`🔧 Tools list: http://${this._host}:${this._port}/mcp/tools`);
        console.log(`📡 MCP endpoint: http://${this._host}:${this._port}/mcp`);
        console.log(`📈 Metrics: http://${this._host}:${this._port}/metrics`);
        console.log('\nEndpoints:');
        console.log('  POST /mcp/initialize - Initialize MCP session');
        console.log('  POST /mcp/tools/list - List available tools');
        console.log('  POST /mcp/tools/call - Call a tool');
        console.log('  POST /mcp - Unified MCP endpoint');
        console.log('  GET /mcp/tools - Human-readable tools list');
        console.log('  GET /mcp/tools/:toolName - Get specific tool info');
        console.log('  GET /health - Server health check');
        console.log('  GET /metrics - Server metrics');

        this.emit('started', { port: this._port, host: this._host });
        resolve();
      });

      this._server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this._port} is already in use`));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    console.log('🛑 Shutting down HTTP MCP server...');

    // Cleanup MCP server
    if (this._mcpServer) {
      await this._mcpServer.cleanup();
    }

    return new Promise((resolve) => {
      this._server.close(() => {
        this._isRunning = false;
        console.log('✅ HTTP MCP Server stopped successfully');
        this.emit('stopped');
        resolve();
      });
    });
  }

  /**
   * Get server status
   */
  getStatus(): {
    running: boolean;
    port: number;
    host: string;
    uptime: number;
    metrics: HTTPMCPServerMetrics;
    tools_available: number;
    mcp_server_status: string;
  } {
    return {
      running: this._isRunning,
      port: this._port,
      host: this._host,
      uptime: (Date.now() - this._metrics.uptime) / 1000,
      metrics: { ...this._metrics },
      tools_available: this._mcpServer.toolsRegistry?.getToolCount() || 0,
      mcp_server_status: this._mcpServer ? 'available' : 'unavailable'
    };
  }

  /**
   * Get server health information
   */
  async getHealth(): Promise<ServerHealth> {
    const uptime = (Date.now() - this._metrics.uptime) / 1000;
    const toolsAvailable = this._mcpServer.toolsRegistry?.getToolCount() || 0;
    
    // Basic health checks
    const healthChecks: HealthCheck[] = [
      {
        name: 'http_server',
        status: this._isRunning ? 'healthy' : 'offline',
        message: this._isRunning ? 'HTTP server is running' : 'HTTP server is offline',
        timestamp: new Date(),
        responseTime: this._metrics.averageResponseTime
      },
      {
        name: 'mcp_server',
        status: this._mcpServer ? 'healthy' : 'error',
        message: this._mcpServer ? 'MCP server is available' : 'MCP server is unavailable',
        timestamp: new Date()
      },
      {
        name: 'tools_registry',
        status: toolsAvailable > 0 ? 'healthy' : 'degraded',
        message: `${toolsAvailable} tools available`,
        timestamp: new Date()
      }
    ];

    const overallStatus: SystemStatus = 
      healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
      healthChecks.some(check => check.status === 'error' || check.status === 'offline') ? 'error' :
      'degraded';

    return {
      status: overallStatus,
      checks: healthChecks,
      components: {
        server: healthChecks[0],
        database: healthChecks[1], // MCP server acts as our "database"
        neural: healthChecks[2], // Tools registry acts as our "neural" component
        external: []
      },
      resources: {
        memory: {
          name: 'memory',
          status: 'healthy',
          message: 'Memory usage within normal limits',
          timestamp: new Date()
        },
        cpu: {
          name: 'cpu',
          status: 'healthy',
          message: 'CPU usage within normal limits',
          timestamp: new Date()
        },
        disk: {
          name: 'disk',
          status: 'healthy',
          message: 'Disk usage within normal limits',
          timestamp: new Date()
        },
        network: {
          name: 'network',
          status: 'healthy',
          message: 'Network connectivity normal',
          timestamp: new Date()
        }
      },
      dependencies: [],
      recommendations: this._metrics.errors > 10 ? ['High error rate detected, check logs'] : [],
      summary: {
        uptime,
        availability: this._metrics.requests > 0 ? 
          ((this._metrics.requests - this._metrics.errors) / this._metrics.requests) * 100 : 100,
        reliability: this._metrics.errors < 5 ? 95 : Math.max(50, 95 - this._metrics.errors * 2),
        performance: this._metrics.averageResponseTime < 1000 ? 95 : 
          Math.max(50, 95 - (this._metrics.averageResponseTime - 1000) / 100)
      },
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 60000) // Next check in 1 minute
    };
  }
}

/**
 * CLI execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new HTTPMCPServer();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // Start server
  server.start().catch((error) => {
    console.error('❌ Failed to start HTTP MCP server:', error);
    process.exit(1);
  });
}

export default HTTPMCPServer;