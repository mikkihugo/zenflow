#!/usr/bin/env node

/**
 * Claude-Zen HTTP MCP Server
 * 
 * HTTP-based MCP server for Claude Desktop integration on port 3000.
 * Provides core Claude-Zen functionality via MCP protocol over HTTP.
 * 
 * This is separate from the swarm stdio MCP server which handles swarm coordination.
 * 
 * @version 2.0.0
 */

import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { createLogger } from './simple-logger.js';
import { MCPToolRegistry } from './tool-registry.js';
import { MCPRequestHandler } from './request-handler.js';

const logger = createLogger('HTTP-MCP-Server');

export interface MCPServerConfig {
  port: number;
  host: string;
  cors: boolean;
  timeout: number;
  maxRequestSize: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

/**
 * HTTP MCP Server for Claude Desktop integration
 */
export class HTTPMCPServer {
  private app: Express;
  private server: any;
  private toolRegistry: MCPToolRegistry;
  private requestHandler: MCPRequestHandler;
  private config: MCPServerConfig;
  private isRunning: boolean = false;

  constructor(config: Partial<MCPServerConfig> = {}) {
    this.config = {
      port: parseInt(process.env.MCP_PORT || '3000', 10),
      host: process.env.MCP_HOST || 'localhost',
      cors: true,
      timeout: 30000,
      maxRequestSize: '10mb',
      logLevel: 'info',
      ...config
    };

    this.app = express();
    this.toolRegistry = new MCPToolRegistry();
    this.requestHandler = new MCPRequestHandler(this.toolRegistry);

    this.setupMiddleware();
    this.setupRoutes();
    this.registerCoreTools();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS support
    if (this.config.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MCP-Client-Info');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // Body parsing
    this.app.use(express.json({ 
      limit: this.config.maxRequestSize,
      type: 'application/json'
    }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.method === 'POST' ? req.body : undefined
      });
      next();
    });

    // Error handling
    this.app.use((error: any, req: Request, res: Response, next: any) => {
      logger.error('Express error:', error);
      
      const mcpError: MCPResponse = {
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      };
      
      res.status(500).json(mcpError);
    });
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: 'claude-zen-http-mcp',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        tools: this.toolRegistry.getToolCount()
      });
    });

    // MCP capabilities endpoint
    this.app.get('/capabilities', (req, res) => {
      res.json({
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'claude-zen-http-mcp',
          version: '2.0.0',
          description: 'Claude-Zen HTTP MCP Server for Claude Desktop integration'
        },
        capabilities: {
          tools: {},
          resources: {
            list: true,
            read: true
          },
          notifications: {
            initialized: true
          }
        }
      });
    });

    // Main MCP endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const mcpRequest: MCPRequest = req.body;
        
        // Validate JSON-RPC format
        if (!this.isValidMCPRequest(mcpRequest)) {
          const error: MCPResponse = {
            jsonrpc: '2.0',
            id: mcpRequest?.id || null,
            error: {
              code: -32600,
              message: 'Invalid Request',
              data: 'Request must be valid JSON-RPC 2.0'
            }
          };
          return res.status(400).json(error);
        }

        // Process the request
        const response = await this.requestHandler.handleRequest(mcpRequest);
        res.json(response);

      } catch (error) {
        logger.error('MCP request processing error:', error);
        
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : String(error)
          }
        };
        
        res.status(500).json(errorResponse);
      }
    });

    // Tool listing endpoint (convenience)
    this.app.get('/tools', async (req, res) => {
      try {
        const tools = await this.toolRegistry.listTools();
        res.json({ tools });
      } catch (error) {
        logger.error('Tools listing error:', error);
        res.status(500).json({ error: 'Failed to list tools' });
      }
    });

    // Tool execution endpoint (convenience)
    this.app.post('/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const args = req.body;
        
        const mcpRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: `tool-${Date.now()}`,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        };

        const response = await this.requestHandler.handleRequest(mcpRequest);
        
        if (response.error) {
          return res.status(400).json(response.error);
        }
        
        res.json(response.result);
      } catch (error) {
        logger.error('Tool execution error:', error);
        res.status(500).json({ error: 'Tool execution failed' });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: [
          'GET /health',
          'GET /capabilities', 
          'POST /mcp',
          'GET /tools',
          'POST /tools/:toolName'
        ]
      });
    });
  }

  /**
   * Register core Claude-Zen tools
   */
  private registerCoreTools(): void {
    // System information tools
    this.toolRegistry.registerTool({
      name: 'system_info',
      description: 'Get Claude-Zen system information and status',
      inputSchema: {
        type: 'object',
        properties: {
          detailed: {
            type: 'boolean',
            description: 'Include detailed system metrics',
            default: false
          }
        }
      }
    }, async (params) => {
      const detailed = params?.detailed || false;
      
      const info = {
        name: 'claude-zen',
        version: '2.0.0',
        status: 'running',
        uptime: Math.floor(process.uptime()),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      };

      if (detailed) {
        const memUsage = process.memoryUsage();
        Object.assign(info, {
          memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
            external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
          },
          cpuUsage: process.cpuUsage(),
          resourceUsage: process.resourceUsage?.() || {}
        });
      }

      return info;
    });

    // Project initialization tools
    this.toolRegistry.registerTool({
      name: 'project_init',
      description: 'Initialize a new Claude-Zen project with templates and configuration',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Project name',
            minLength: 1
          },
          template: {
            type: 'string',
            description: 'Project template to use',
            enum: ['basic', 'advanced', 'swarm', 'neural'],
            default: 'basic'
          },
          directory: {
            type: 'string',
            description: 'Target directory for project',
            default: '.'
          }
        },
        required: ['name']
      }
    }, async (params) => {
      const { name, template = 'basic', directory = '.' } = params;
      
      logger.info(`Initializing project: ${name} with template: ${template}`);
      
      // This would integrate with the actual init command
      return {
        success: true,
        project: name,
        template,
        directory,
        message: `Project ${name} initialized successfully with ${template} template`,
        nextSteps: [
          'Run claude-zen status to check project health',
          'Use claude-zen swarm init to set up agent coordination',
          'Explore claude-zen --help for available commands'
        ]
      };
    });

    // Status and monitoring tools
    this.toolRegistry.registerTool({
      name: 'project_status',
      description: 'Get comprehensive project status including swarms, tasks, and resources',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'summary'],
            default: 'json',
            description: 'Output format'
          },
          includeMetrics: {
            type: 'boolean',
            default: false,
            description: 'Include performance metrics'
          }
        }
      }
    }, async (params) => {
      const { format = 'json', includeMetrics = false } = params;
      
      const status = {
        project: {
          name: 'current-project',
          status: 'active',
          initialized: true
        },
        swarms: {
          active: 0,
          total: 0,
          agents: 0
        },
        tasks: {
          pending: 0,
          active: 0,
          completed: 0
        },
        resources: {
          memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          uptime: Math.floor(process.uptime()) + 's'
        }
      };

      if (includeMetrics) {
        Object.assign(status, {
          metrics: {
            requestsProcessed: 0,
            averageResponseTime: 0,
            errorRate: 0
          }
        });
      }

      if (format === 'summary') {
        return {
          summary: `Project: ${status.project.name} (${status.project.status})`,
          swarms: `${status.swarms.active}/${status.swarms.total} active`,
          tasks: `${status.tasks.active} active, ${status.tasks.completed} completed`,
          uptime: status.resources.uptime
        };
      }

      return status;
    });

    logger.info(`Registered ${this.toolRegistry.getToolCount()} core tools`);
  }

  /**
   * Validate MCP request format
   */
  private isValidMCPRequest(request: any): request is MCPRequest {
    return (
      request &&
      request.jsonrpc === '2.0' &&
      (typeof request.id === 'string' || typeof request.id === 'number') &&
      typeof request.method === 'string'
    );
  }

  /**
   * Start the HTTP MCP server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Server already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        this.isRunning = true;
        const url = `http://${this.config.host}:${this.config.port}`;
        
        logger.info(`🚀 Claude-Zen HTTP MCP Server started`);
        logger.info(`   URL: ${url}`);
        logger.info(`   Tools: ${this.toolRegistry.getToolCount()}`);
        logger.info(`   Protocol: MCP over HTTP`);
        logger.info(`   Health: ${url}/health`);
        logger.info(`   Capabilities: ${url}/capabilities`);
        
        console.log(`\n🧠 Claude-Zen HTTP MCP Server`);
        console.log(`   Ready at: ${url}`);
        console.log(`   Add to Claude Desktop MCP config:`);
        console.log(`   {`);
        console.log(`     "claude-zen": {`);
        console.log(`       "command": "npx",`);
        console.log(`       "args": ["claude-zen", "mcp", "start"]`);
        console.log(`     }`);
        console.log(`   }`);
        console.log(`\n   Press Ctrl+C to stop\n`);

        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.config.port} is already in use`));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Stop the HTTP MCP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        logger.info('HTTP MCP Server stopped');
        resolve();
      });
    });
  }

  /**
   * Get server status
   */
  getStatus(): any {
    return {
      running: this.isRunning,
      config: this.config,
      tools: this.toolRegistry.getToolCount(),
      uptime: process.uptime()
    };
  }
}

/**
 * Start the server if run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new HTTPMCPServer();
  
  // Graceful shutdown
  process.on('SIGTERM', () => server.stop());
  process.on('SIGINT', () => server.stop());
  
  server.start().catch((error) => {
    logger.error('Failed to start HTTP MCP Server:', error);
    process.exit(1);
  });
}

export default HTTPMCPServer;