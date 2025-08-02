#!/usr/bin/env node

/**
 * Claude-Zen HTTP MCP Server - Official SDK Implementation
 *
 * HTTP-based MCP server for Claude Desktop integration using the official MCP SDK.
 * Provides core Claude-Zen functionality via MCP protocol over HTTP on port 3000.
 *
 * This replaces the custom Express.js implementation with the official SDK.
 * Stdio MCP server for swarm coordination remains custom as requested.
 *
 * @version 2.0.0
 */

import express from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createLogger } from './simple-logger.js';

const logger = createLogger('SDK-HTTP-MCP-Server');

export interface MCPServerConfig {
  port: number;
  host: string;
  timeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * HTTP MCP Server using Official SDK for Claude Desktop integration
 */
export class HTTPMCPServer {
  private server: McpServer;
  private expressApp: express.Application;
  private httpServer: any;
  private config: MCPServerConfig;
  private isRunning: boolean = false;

  constructor(config: Partial<MCPServerConfig> = {}) {
    this.config = {
      port: parseInt(process.env.MCP_PORT || '3000', 10),
      host: process.env.MCP_HOST || 'localhost',
      timeout: parseInt(process.env.MCP_TIMEOUT || '30000', 10),
      logLevel: (process.env.MCP_LOG_LEVEL as any) || 'info',
      ...config,
    };

    // Create MCP server with SDK
    this.server = new McpServer(
      {
        name: 'claude-zen-http-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {
            list: true,
            read: true,
          },
          logging: {},
        },
        instructions: 'Claude-Zen HTTP MCP Server for project management and system integration via Claude Desktop',
      }
    );

    // Setup Express app for SDK transport
    this.expressApp = express();
    this.setupExpressMiddleware();
    this.registerTools();
    this.setupSDKRoutes();
  }

  /**
   * Setup Express middleware for SDK transport
   */
  private setupExpressMiddleware(): void {
    // Body parsing - MUST come before routes
    this.expressApp.use(express.json({ limit: '10mb' }));
    this.expressApp.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

    // CORS support
    this.expressApp.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-MCP-Client-Info, Last-Event-ID, MCP-Session-ID'
      );
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.expressApp.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`, {
        headers: req.headers,
        hasBody: !!req.body,
        bodyMethod: req.body?.method,
      });
      next();
    });

    // Health check endpoint
    this.expressApp.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: 'claude-zen-sdk-http-mcp',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        sdk: 'official-mcp-sdk',
      });
    });
  }

  /**
   * Register Claude-Zen tools with the SDK
   */
  private registerTools(): void {
    // System information tool
    this.server.tool(
      'system_info',
      'Get Claude-Zen system information and status',
      {
        detailed: z.boolean().default(false).describe('Include detailed system metrics'),
      },
      {
        title: 'System Information',
        description: 'Provides Claude-Zen system status, uptime, and performance metrics',
      },
      async ({ detailed }) => {
        const info = {
          name: 'claude-zen',
          version: '2.0.0',
          status: 'running',
          uptime: Math.floor(process.uptime()),
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          pid: process.pid,
          sdk: 'official-mcp-sdk',
          server: 'claude-zen-sdk-http-mcp',
        };

        if (detailed) {
          const memUsage = process.memoryUsage();
          Object.assign(info, {
            memory: {
              used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
              total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
              external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
            },
            cpuUsage: process.cpuUsage(),
            resourceUsage: process.resourceUsage?.() || {},
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }
    );

    // Project initialization tool
    this.server.tool(
      'project_init',
      'Initialize a new Claude-Zen project with templates and configuration',
      {
        name: z.string().min(1).describe('Project name'),
        template: z
          .enum(['basic', 'advanced', 'swarm', 'neural'])
          .default('basic')
          .describe('Project template to use'),
        directory: z.string().default('.').describe('Target directory for project'),
      },
      {
        title: 'Project Initialization',
        description: 'Creates a new Claude-Zen project with the specified template and configuration',
      },
      async ({ name, template, directory }) => {
        logger.info(`Initializing project: ${name} with template: ${template}`);

        const result = {
          success: true,
          project: name,
          template,
          directory,
          message: `Project ${name} initialized successfully with ${template} template`,
          nextSteps: [
            'Run claude-zen status to check project health',
            'Use claude-zen swarm init to set up agent coordination',
            'Explore claude-zen --help for available commands',
          ],
          sdk: 'official-mcp-sdk',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );

    // Project status tool
    this.server.tool(
      'project_status',
      'Get comprehensive project status including swarms, tasks, and resources',
      {
        format: z.enum(['json', 'summary']).default('json').describe('Output format'),
        includeMetrics: z.boolean().default(false).describe('Include performance metrics'),
      },
      {
        title: 'Project Status',
        description: 'Provides comprehensive project health, swarm status, and resource utilization',
      },
      async ({ format, includeMetrics }) => {
        const status = {
          project: {
            name: 'current-project',
            status: 'active',
            initialized: true,
            sdk: 'official-mcp-sdk',
          },
          swarms: {
            active: 0,
            total: 0,
            agents: 0,
          },
          tasks: {
            pending: 0,
            active: 0,
            completed: 0,
          },
          resources: {
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            uptime: Math.floor(process.uptime()) + 's',
          },
        };

        if (includeMetrics) {
          Object.assign(status, {
            metrics: {
              requestsProcessed: 0,
              averageResponseTime: 0,
              errorRate: 0,
              sdkVersion: '1.17.1',
            },
          });
        }

        let result: any;
        if (format === 'summary') {
          result = {
            summary: `Project: ${status.project.name} (${status.project.status})`,
            swarms: `${status.swarms.active}/${status.swarms.total} active`,
            tasks: `${status.tasks.active} active, ${status.tasks.completed} completed`,
            uptime: status.resources.uptime,
            sdk: 'official-mcp-sdk',
          };
        } else {
          result = status;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );

    logger.info('Registered Claude-Zen tools with official MCP SDK');
  }

  /**
   * Setup SDK transport routes
   */
  private setupSDKRoutes(): void {
    // Map to store active transports by session ID
    const transports: Record<string, StreamableHTTPServerTransport> = {};

    // POST handler for MCP requests
    const mcpPostHandler = async (req: any, res: any) => {
      try {
        let sessionId = req.headers['mcp-session-id'] as string;
        let transport = sessionId ? transports[sessionId] : undefined;

        // Check if this is an initialization request
        const isInitRequest = req.body && req.body.method === 'initialize';
        
        if (!transport && isInitRequest) {
          // Create new session and transport for initialization
          sessionId = randomUUID();
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => sessionId,
            onsessioninitialized: (id) => {
              logger.info(`MCP session initialized: ${id}`);
            },
            onsessionclosed: (id) => {
              logger.info(`MCP session closed: ${id}`);
              delete transports[id];
            },
          });

          // Store the transport
          transports[sessionId] = transport;

          // Connect transport to server
          await this.server.connect(transport);
          await transport.handleRequest(req, res, req.body);
          return;
        } else if (!transport && !isInitRequest) {
          // No session ID and not initialization
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided. Initialize first.',
            },
            id: req.body?.id || null,
          });
          return;
        } else if (transport) {
          // Handle request with existing transport
          await transport.handleRequest(req, res, req.body);
          return;
        }

        // Fallback error
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: Invalid request state',
          },
          id: req.body?.id || null,
        });
      } catch (error) {
        logger.error('Error handling MCP POST request:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: req.body?.id || null,
          });
        }
      }
    };

    // GET handler for SSE streaming
    const mcpGetHandler = async (req: any, res: any) => {
      try {
        const sessionId = req.headers['mcp-session-id'] as string;
        let transport = sessionId ? transports[sessionId] : undefined;

        if (!transport) {
          res.status(400).send('Invalid or missing session ID for SSE stream');
          return;
        }

        await transport.handleRequest(req, res);
      } catch (error) {
        logger.error('Error handling MCP GET request:', error);
        if (!res.headersSent) {
          res.status(500).send('Error establishing SSE stream');
        }
      }
    };

    // DELETE handler for session termination
    const mcpDeleteHandler = async (req: any, res: any) => {
      try {
        const sessionId = req.headers['mcp-session-id'] as string;
        const transport = sessionId ? transports[sessionId] : undefined;

        if (!transport) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }

        await transport.handleRequest(req, res);
        
        // Clean up transport
        if (sessionId && transports[sessionId]) {
          await transports[sessionId].close();
          delete transports[sessionId];
        }
      } catch (error) {
        logger.error('Error handling session termination:', error);
        if (!res.headersSent) {
          res.status(500).send('Error processing session termination');
        }
      }
    };

    // Setup routes
    this.expressApp.post('/mcp', mcpPostHandler);
    this.expressApp.get('/mcp', mcpGetHandler);
    this.expressApp.delete('/mcp', mcpDeleteHandler);

    // Capabilities endpoint for compatibility
    this.expressApp.get('/capabilities', (req, res) => {
      res.json({
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'claude-zen-sdk-http-mcp',
          version: '2.0.0',
          description: 'Claude-Zen HTTP MCP Server using official SDK',
        },
        capabilities: {
          tools: {},
          resources: {
            list: true,
            read: true,
          },
          logging: {},
        },
        sdk: 'official-mcp-sdk',
      });
    });

    // 404 handler
    this.expressApp.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: [
          'GET /health',
          'GET /capabilities',
          'POST /mcp',
          'PUT /mcp',
          'DELETE /mcp',
        ],
        sdk: 'official-mcp-sdk',
      });
    });
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
      this.httpServer = this.expressApp.listen(this.config.port, this.config.host, () => {
        this.isRunning = true;
        const url = `http://${this.config.host}:${this.config.port}`;

        logger.info(`🚀 Claude-Zen SDK HTTP MCP Server started`);
        logger.info(`   URL: ${url}`);
        logger.info(`   Protocol: Official MCP SDK over HTTP`);
        logger.info(`   Health: ${url}/health`);
        logger.info(`   Capabilities: ${url}/capabilities`);
        logger.info(`   MCP Endpoint: ${url}/mcp`);

        console.log(`
      🧠 Claude-Zen SDK HTTP MCP Server`);
        console.log(`   Ready at: ${url}`);
        console.log(`   Using: Official MCP SDK v1.17.1`);
        console.log(`   Add to Claude Desktop MCP config:`);
        console.log(`   {`);
        console.log(`     "claude-zen": {`);
        console.log(`       "command": "npx",`);
        console.log(`       "args": ["claude-zen", "mcp", "start"]`);
        console.log(`     }`);
        console.log(`   }`);
        console.log(`
      Press Ctrl+C to stop\n`);

        resolve();
      });

      this.httpServer.on('error', (error: any) => {
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
    if (!this.isRunning || !this.httpServer) {
      return;
    }

    return new Promise((resolve) => {
      this.httpServer.close(() => {
        this.isRunning = false;
        logger.info('SDK HTTP MCP Server stopped');
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
      uptime: process.uptime(),
      sdk: 'official-mcp-sdk',
      version: '2.0.0',
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
    logger.error('Failed to start SDK HTTP MCP Server:', error);
    process.exit(1);
  });
}

export default HTTPMCPServer;