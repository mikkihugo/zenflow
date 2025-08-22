/**
 * @file Web Dashboard Server with Svelte Proxy
 *
 * HTTP server that proxies Svelte dashboard and provides API endpoints.
 */

import { createServer, type Server } from 'node:http');

import { getLogger } from '@claude-zen/foundation');
import LLMStatsService from '@claude-zen/intelligence');
import { createTerminus } from '@godaddy/terminus');
import express from 'express');
import { createProxyMiddleware } from 'http-proxy-middleware');
import { Server as SocketIOServer } from 'socket.io');

import('/web-api-routes');
import('/web-config');

interface WebDashboardConfig {
  port: number;
  host?: string;
}

export class WebDashboardServer {
  private server: Server;
  private io: SocketIOServer;
  private readonly logger = getLogger('WebDashboardServer');
  private llmStatsService: LLMStatsService;
  private svelteProxy: any;
  private app: express.Application;
  private apiRoutes: WebApiRoutes;

  constructor(private config: WebDashboardConfig) {
    // Enhanced initialization with comprehensive logging and monitoring
    const initializationMetrics = {
      startTime: Date.now(),
      phase: 'starting' as
        | 'starting'
        | 'services'
        | 'proxy'
        | 'api'
        | 'complete',
      servicesInitialized: 0,
      totalServices: 4, // LLMStats, SvelteProxy, APIRoutes, WebSocket
      memoryUsage: process?.memoryUsage,
      config: this.config,
    };

    console.log('🔵 WebDashboardServer constructor started');
    this.logger.info('Starting WebDashboardServer initialization', {
      config: this.config,
      timestamp: new Date()?.toISOString,
      processId: process.pid,
      nodeVersion: process.version,
      memoryUsage: initializationMetrics.memoryUsage,
    });

    console.log('🏗️ Creating WebDashboardServer with real API routes...');
    this.logger.info('Creating WebDashboardServer with real API routes', {
      phase: initializationMetrics.phase,
      servicesPlanned: initializationMetrics.totalServices,
    });

    console.log('📊 Initializing LLM Stats Service...');
    // Initialize LLM Stats Service
    this.llmStatsService = new LLMStatsService();
    console.log('✅ LLM Stats Service created successfully');

    console.log('🎯 Setting up Svelte proxy...');
    // Create proxy middleware for Svelte dev server (corrected port)
    this.svelteProxy = createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying for HMR
      logLevel: 'warn',
    });
    console.log('✅ Svelte proxy configured successfully');

    console.log('🔗 Setting up Express app with real API routes...');
    // Create Express app
    this.app = express();
    this.app.use(express?.json);
    this.app.use(express.urlencoded({ extended: true }));

    // Create mock session manager and data service for API routes
    const mockSessionManager = {
      getSession: () => ({
        preferences: {
          theme: 'dark',
          refreshInterval: 5000,
          notifications: true,
        },
      }),
      updateSessionPreferences: () => true,
    };

    const mockDataService = {
      getSystemStatus: async () => ({ status: 'ok', uptime: process?.uptime }),
      getSwarms: async () => ({ swarms: [] }),
      createSwarm: async (data: any) => ({ ...data, id: Date.now() }),
      getTasks: async () => ({ tasks: [] }),
      createTask: async (data: any) => ({ ...data, id: Date.now() }),
      getDocuments: async () => ({ documents: [] }),
      executeCommand: async (cmd: string, args: any) => ({
        command: cmd,
        args,
        success: true,
      }),
    };

    // Initialize API routes with web config
    const webConfig = createWebConfig({
      port: this.config.port,
      host: this.config.host,
      apiPrefix: '/api',
    });

    this.apiRoutes = new WebApiRoutes(
      webConfig,
      mockSessionManager as any,
      mockDataService as any
    );

    // Setup all API routes BEFORE the Svelte proxy
    console.log('🛠️ Setting up API routes...');
    this.apiRoutes.setupRoutes(this.app);
    console.log('✅ Real API routes configured successfully');

    // Debug: Log all registered routes
    console.log('📋 Registered API routes:');
    this.app._router?.stack?.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(
          ', '
        )?.toUpperCase()
        console.log(`  ${methods} ${layer.route.path}`);
      }
    });

    // Add fallback route for non-API requests - simple response for now
    this.app.use('*', (req, res, next) => {
      // Only proxy non-API routes to Svelte - API routes are already handled above
      if (!req.originalUrl.startsWith('/api/')) {
        // Temporarily disable Svelte proxy to debug startup
        res.json({
          message: 'Claude Code Zen API Server',
          path: req.originalUrl,
          timestamp: new Date()?.toISOString,
        });
      } else {
        // API routes that reach here weren't handled - return 404
        res.status(404).json({ error: 'API endpoint not found' });
      }
    });

    console.log('🌐 Creating HTTP server...');
    this.server = createServer(this.app);
    console.log('✅ HTTP server created successfully');

    console.log('🔌 Initializing Socket.O...');
    // Initialize Socket.O
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET, POST'],
      },
    });
    console.log('✅ Socket.O initialized successfully');

    console.log('🔗 Setting up WebSocket...');
    this.setupWebSocket;
    console.log('✅ WebSocket setup completed');

    console.log('✅ WebDashboardServer constructor completed');
  }

  async start(): Promise<void> {
    this.logger.info(
      `🚀 Starting server on ${this.config.host || 'localhost'}:${this.config.port}...`
    );

    // Setup terminus for graceful shutdown
    const shutdownSignals = ['SIGTERM, SIGINT', 'SIGUSR2'];

    createTerminus(this.server, {
      signals: shutdownSignals,
      timeout: 30000, // 30 seconds
      healthChecks: {
        '/health': this.createHealthCheck,
        '/api/health': this.createHealthCheck,
      },
      onSignal: this.createShutdownHandler,
      onShutdown: this.createFinalShutdownHandler,
      logger: (msg, err) => {
        if (err) {
          this.logger.error('🔄 Terminus:', msg, err);
        } else {
          this.logger.info('🔄 Terminus:', msg);
        }
      },
    });

    return new Promise((resolve, reject) => {
      this.server.on('error', (error) => {
        this.logger.error('❌ Server error:', error);
        reject(error);
      });

      this.logger.info('📡 Calling server?.listen...');

      // Add timeout to detect hanging
      const timeoutId = setTimeout(() => {
        this.logger.error(
          '⏰ Server listen timeout - callback not executed after 5 seconds'
        );
        reject(new Error('Server listen timeout'));
      }, 5000);

      this.server.listen(
        this.config.port,
        this.config.host || 'localhost',
        () => {
          clearTimeout(timeoutId);
          this.logger.info(
            `🌐 Web dashboard server started on http://${this.config.host || 'localhost'}:${this.config.port}`
          );
          this.logger.info(
            '🛡️ Graceful shutdown enabled via @godaddy/terminus'
          );
          this.logger.info('✅ Server listen callback executed');
          resolve();
        }
      );

      this.logger.info('📡 server?.listen called, waiting for callback...');
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('🛑 Web dashboard server stopped');
        resolve();
      });
    });
  }

  /**
   * Create health check function for terminus
   */
  private createHealthCheck() {
    return async () => {
      // Check if server is responsive
      if (!this.server.listening) {
        throw new Error('Server not listening');
      }

      // Check Socket.O
      if (!this.io) {
        throw new Error('Socket.O not initialized');
      }

      return {
        status: 'healthy',
        uptime: process?.uptime,
        timestamp: new Date()?.toISOString,
        server: 'listening',
        socketio: 'connected',
        memory: process?.memoryUsage,
      };
    };
  }

  /**
   * Create shutdown signal handler for terminus
   */
  private createShutdownHandler() {
    return async () => {
      this.logger.info('🔄 Graceful shutdown initiated...');

      // Close Socket.O connections
      if (this.io) {
        this.logger.info('🔌 Closing Socket.O connections...');
        this.io?.close()
      }

      // Stop LLM stats service if needed
      if (this.llmStatsService) {
        this.logger.info('📊 Stopping LLM stats service...');
        // Add any cleanup for LLM stats service if needed
      }

      this.logger.info('✅ Graceful shutdown preparations complete');
    };
  }

  /**
   * Create final shutdown handler for terminus
   */
  private createFinalShutdownHandler() {
    return async () => {
      this.logger.info('🏁 Final shutdown cleanup...');
      this.logger.info('✅ Server shutdown complete');
    };
  }

  private populateTestData(): void {
    this.logger.info('Populating LLM statistics with test data');

    // Mock some LLM calls
    const mockRequests = [
      {
        task: 'typescript-error-analysis',
        prompt: 'Analyze TypeScript compilation errors in the codebase',
        requiresFileOperations: true,
      },
      {
        task: 'code-review',
        prompt: 'Review the implementation of neural network components',
        requiresFileOperations: false,
      },
      {
        task: 'documentation',
        prompt: 'Generate API documentation for the swarm coordination system',
        requiresFileOperations: true,
      },
      {
        task: 'domain-analysis',
        prompt: 'Analyze the domain boundaries in the coordination system',
        requiresFileOperations: true,
      },
      {
        task: 'refactoring',
        prompt: 'Suggest refactoring improvements for better maintainability',
        requiresFileOperations: false,
      },
    ];

    const mockResults = [
      {
        success: true,
        provider: 'claude-code' as const,
        executionTime: 1250,
        result: 'Analysis completed successfully',
      },
      {
        success: true,
        provider: 'gemini' as const,
        executionTime: 890,
        result: 'Code review completed',
      },
      {
        success: false,
        provider: 'github-models' as const,
        executionTime: 2100,
        error: 'Rate limit exceeded',
      },
      {
        success: true,
        provider: 'claude-code' as const,
        executionTime: 1850,
        result: 'Domain analysis completed',
      },
      {
        success: true,
        provider: 'gemini-direct' as const,
        executionTime: 720,
        result: 'Refactoring suggestions provided',
      },
    ];

    const mockRoutingInfo = [
      {
        originalPreference: 'claude-code',
        fallbackCount: 0,
        routingReason: 'Primary provider selection',
      },
      {
        originalPreference: 'claude-code',
        fallbackCount: 1,
        routingReason: 'Fallback to secondary provider',
      },
      {
        originalPreference: 'gemini',
        fallbackCount: 2,
        routingReason: 'Multiple fallbacks due to rate limits',
      },
      {
        originalPreference: 'claude-code',
        fallbackCount: 0,
        routingReason: 'Primary provider available',
      },
      {
        originalPreference: 'gemini',
        fallbackCount: 0,
        routingReason: 'Direct provider selection',
      },
    ];

    // Record the mock calls
    for (let i = 0; i < mockRequests.length; i++) {
      this.llmStatsService.recordCall(
        mockRequests[i],
        mockResults[i],
        mockRoutingInfo[i],
        {
          requestType: 'analyze',
          tokenUsage: {
            inputTokens: Math.floor(Math.random() * 1000) + 500,
            outputTokens: Math.floor(Math.random() * 500) + 200,
          },
          sessionId: 'test-session-' + Date.now(),
        }
      );
    }

    this.logger.info('Test data populated successfully');
  }

  private handleLogsRequest(url: string, req: any, res: any): void {
    try {
      // Parse query parameters
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '');
      const params = new URLSearchParams(queryString);

      const level = params.get('level');
      const source = params.get('source');
      const limit = parseInt(params.get('limit) || 100');
      const search = params.get('search');

      // Get logs from the logging system
      import('claude-zen/foundation');
        .then(({ getLogEntries }) => {
          let logs = getLogEntries();

          // Apply filters
          if (level && level !== 'all') {
            logs = logs.filter((entry: any) => entry.level === level);
          }

          if (source && source !== 'all') {
            logs = logs.filter((entry: any) => entry.component === source);
          }

          if (search && search?.trim) {
            const searchTerm = search?.toLowerCase()
            logs = logs.filter(
              (entry: any) =>
                entry.message?.toLowerCase.includes(searchTerm) ||
                entry.component?.toLowerCase.includes(searchTerm)
            );
          }

          // Sort by timestamp (newest first)
          logs.sort((a: any, b: any) => {
            const dateA = new Date(a.timestamp || 0)?.getTime()
            const dateB = new Date(b.timestamp || 0)?.getTime()
            return dateB - dateA;
          });

          // Apply limit
          if (limit > 0) {
            logs = logs.slice(0, limit);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              logs,
              total: logs.length,
              timestamp: new Date()?.toISOString,
            })
          );
        })
        .catch((error) => {
          this.logger.error('Failed to get logs:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to retrieve logs' }));
        });
    } catch (error) {
      this.logger.error('Logs request error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      this.logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('subscribe', (channel: string) => {
        socket.join(channel);
        this.logger.debug(`Client ${socket.id} subscribed to ${channel}`);

        // Send initial logs data if subscribing to logs channel
        if (channel === 'logs') {
          import('claude-zen/foundation');
            .then(({ getLogEntries }) => {
              const logs = getLogEntries();
              socket.emit('logs:initial', {
                data: logs,
                timestamp: new Date()?.toISOString,
              });
            })
            .catch((error) => {
              this.logger.error('Failed to send initial logs:', error);
            });
        }
      });

      socket.on('disconnect', (reason) => {
        this.logger.info(
          `WebSocket client disconnected: ${socket.id}, reason: ${reason}`
        );
      });
    });

    // Set up log broadcaster for real-time updates
    import('claude-zen/foundation');
      .then(({ setLogBroadcaster }) => {
        setLogBroadcaster((event: string, data: any) => {
          this.io.to('logs').emit(event, {
            data,
            timestamp: new Date()?.toISOString,
          });
        });
        this.logger.debug('Log broadcaster configured for real-time updates');
      })
      .catch((error) => {
        this.logger.warn('Failed to setup log broadcaster:', error);
      });

    // Send periodic updates
    setInterval(() => {
      this.io.to('system).emit(system:status', {
        timestamp: new Date()?.toISOString,
        data: {
          uptime: Math.floor(process?.uptime),
          memory: process?.memoryUsage,
          status: 'healthy',
        },
      });
    }, 5000);
  }

  getSocketIO() {
    return this.io;
  }

  private handleWorkspaceRequest(url: string, req: any, res: any): void {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin, *');
    res.setHeader('Access-Control-Allow-Methods, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers, Content-Type');

    const { readdir, stat, readFile } = require('fs/promises');
    const { resolve, join } = require('path');

    if (
      url === '/api/workspace/files' ||
      url.startsWith('/api/workspace/files?');
    ) {
      this.handleWorkspaceFilesRequest(
        url,
        req,
        res,
        readdir,
        stat,
        resolve,
        join
      );
      return;
    }

    if (
      url === '/api/workspace/files/content' ||
      url.startsWith('/api/workspace/files/content?');
    ) {
      this.handleWorkspaceFileContentRequest(
        url,
        req,
        res,
        readFile,
        stat,
        resolve,
        join
      );
      return;
    }

    // API 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Workspace API endpoint not found' }));
  }

  private async handleWorkspaceFilesRequest(
    url: string,
    req: any,
    res: any,
    readdir: any,
    stat: any,
    resolve: any,
    join: any
  ): Promise<void> {
    try {
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '');
      const params = new URLSearchParams(queryString);
      const path = params.get('path) || ');

      // Base directory - use current working directory
      const baseDir = process?.cwd()
      const targetPath = path ? join(baseDir, path) : baseDir;

      // Resolve the path to prevent directory traversal attacks
      const resolvedPath = resolve(targetPath);

      // Basic security check - ensure we're within the base directory
      if (!resolvedPath.startsWith(resolve(baseDir))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access denied' }));
        return;
      }

      const items = await readdir(resolvedPath);
      const files = [];

      for (const item of items) {
        // Skip hidden files and node_modules for better UX
        if (item.startsWith(".') || item === 'node_modules') {
          continue;
        }

        try {
          const itemPath = join(resolvedPath, item);
          const stats = await stat(itemPath);

          files.push({
            name: item,
            path: path ? `${path}/${item}` : item,
            type: stats?.isDirectory ? 'directory : file',
            size: stats?.isFile ? stats.size : undefined,
            modified: stats.mtime?.toISOString,
          });
        } catch (itemError) {
          // Skip items we can't stat
          console.warn(`Skipping item ${item}:`, itemError);
        }
      }

      // Sort directories first, then files
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          files,
          currentPath: path,
          parentPath: path ? path.split('/).slice(0, -1).join(/') : null,
        })
      );
    } catch (error) {
      console.error('Workspace files API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async handleWorkspaceFileContentRequest(
    url: string,
    req: any,
    res: any,
    readFile: any,
    stat: any,
    resolve: any,
    join: any
  ): Promise<void> {
    try {
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '');
      const params = new URLSearchParams(queryString);
      const path = params.get('path');

      if (!path) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path parameter is required' }));
        return;
      }

      // Base directory - use current working directory
      const baseDir = process?.cwd()
      const targetPath = join(baseDir, path);

      // Resolve the path to prevent directory traversal attacks
      const resolvedPath = resolve(targetPath);

      // Basic security check - ensure we're within the base directory
      if (!resolvedPath.startsWith(resolve(baseDir))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access denied' }));
        return;
      }

      // Check if file exists and is readable
      const stats = await stat(resolvedPath);

      if (stats?.isDirectory) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is a directory, not a file' }));
        return;
      }

      // Check file size (limit to 1MB for safety)
      const maxSize = 1024 * 1024; // 1MB
      if (stats.size > maxSize) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'File too large to display',
            size: stats.size,
            maxSize,
          })
        );
        return;
      }

      // Read file content
      const content = await readFile(resolvedPath, 'utf8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          content,
          size: stats.size,
          modified: stats.mtime?.toISOString,
          path,
          encoding: 'utf8',
        })
      );
    } catch (error: any) {
      console.error('File read error:', error);

      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      } else if (error.code === 'EACCES') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Permission denied' }));
      } else if (error.code === 'EISDIR') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is a directory' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read file' }));
      }
    }
  }

  static getCapabilities() {
    return {
      webDashboard: true,
      healthCheck: true,
      basicRouting: true,
      webSocket: true,
      workspace: true,
    };
  }
}
