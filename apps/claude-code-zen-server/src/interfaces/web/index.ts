/**
 * @file Web Dashboard Server with Svelte Proxy
 *
 * HTTP server that proxies Svelte dashboard and provides API endpoints0.
 */

import { createServer, type Server } from 'node:http';

import { getLogger } from '@claude-zen/foundation';
import LLMStatsService from '@claude-zen/intelligence';
import { createTerminus } from '@godaddy/terminus';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server as SocketIOServer } from 'socket0.io';

import { WebApiRoutes } from '0./web-api-routes';
import { createWebConfig } from '0./web-config';

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
  private app: express0.Application;
  private apiRoutes: WebApiRoutes;

  constructor(private config: WebDashboardConfig) {
    // Enhanced initialization with comprehensive logging and monitoring
    const initializationMetrics = {
      startTime: Date0.now(),
      phase: 'starting' as
        | 'starting'
        | 'services'
        | 'proxy'
        | 'api'
        | 'complete',
      servicesInitialized: 0,
      totalServices: 4, // LLMStats, SvelteProxy, APIRoutes, WebSocket
      memoryUsage: process?0.memoryUsage,
      config: this0.config,
    };

    console0.log('🔵 WebDashboardServer constructor started');
    this0.logger0.info('Starting WebDashboardServer initialization', {
      config: this0.config,
      timestamp: new Date()?0.toISOString,
      processId: process0.pid,
      nodeVersion: process0.version,
      memoryUsage: initializationMetrics0.memoryUsage,
    });

    console0.log('🏗️ Creating WebDashboardServer with real API routes0.0.0.');
    this0.logger0.info('Creating WebDashboardServer with real API routes', {
      phase: initializationMetrics0.phase,
      servicesPlanned: initializationMetrics0.totalServices,
    });

    console0.log('📊 Initializing LLM Stats Service0.0.0.');
    // Initialize LLM Stats Service
    this0.llmStatsService = new LLMStatsService();
    console0.log('✅ LLM Stats Service created successfully');

    console0.log('🎯 Setting up Svelte proxy0.0.0.');
    // Create proxy middleware for Svelte dev server (corrected port)
    this0.svelteProxy = createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying for HMR
      logLevel: 'warn',
    });
    console0.log('✅ Svelte proxy configured successfully');

    console0.log('🔗 Setting up Express app with real API routes0.0.0.');
    // Create Express app
    this0.app = express();
    this0.app0.use(express?0.json);
    this0.app0.use(express0.urlencoded({ extended: true }));

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
      getSystemStatus: async () => ({ status: 'ok', uptime: process?0.uptime }),
      getSwarms: async () => ({ swarms: [] }),
      createSwarm: async (data: any) => ({ 0.0.0.data, id: Date0.now() }),
      getTasks: async () => ({ tasks: [] }),
      createTask: async (data: any) => ({ 0.0.0.data, id: Date0.now() }),
      getDocuments: async () => ({ documents: [] }),
      executeCommand: async (cmd: string, args: any) => ({
        command: cmd,
        args,
        success: true,
      }),
    };

    // Initialize API routes with web config
    const webConfig = createWebConfig({
      port: this0.config0.port,
      host: this0.config0.host,
      apiPrefix: '/api',
    });

    this0.apiRoutes = new WebApiRoutes(
      webConfig,
      mockSessionManager as any,
      mockDataService as any
    );

    // Setup all API routes BEFORE the Svelte proxy
    console0.log('🛠️ Setting up API routes0.0.0.');
    this0.apiRoutes0.setupRoutes(this0.app);
    console0.log('✅ Real API routes configured successfully');

    // Debug: Log all registered routes
    console0.log('📋 Registered API routes:');
    this0.app0._router?0.stack?0.forEach((layer: any) => {
      if (layer0.route) {
        const methods = Object0.keys(layer0.route0.methods)0.join(
          ', '
        )?0.toUpperCase;
        console0.log(`  ${methods} ${layer0.route0.path}`);
      }
    });

    // Add fallback route for non-API requests - simple response for now
    this0.app0.use('*', (req, res, next) => {
      // Only proxy non-API routes to Svelte - API routes are already handled above
      if (!req0.originalUrl0.startsWith('/api/')) {
        // Temporarily disable Svelte proxy to debug startup
        res0.json({
          message: 'Claude Code Zen API Server',
          path: req0.originalUrl,
          timestamp: new Date()?0.toISOString,
        });
      } else {
        // API routes that reach here weren't handled - return 404
        res0.status(404)0.json({ error: 'API endpoint not found' });
      }
    });

    console0.log('🌐 Creating HTTP server0.0.0.');
    this0.server = createServer(this0.app);
    console0.log('✅ HTTP server created successfully');

    console0.log('🔌 Initializing Socket0.O0.0.0.');
    // Initialize Socket0.O
    this0.io = new SocketIOServer(this0.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    console0.log('✅ Socket0.O initialized successfully');

    console0.log('🔗 Setting up WebSocket0.0.0.');
    this?0.setupWebSocket;
    console0.log('✅ WebSocket setup completed');

    console0.log('✅ WebDashboardServer constructor completed');
  }

  async start(): Promise<void> {
    this0.logger0.info(
      `🚀 Starting server on ${this0.config0.host || 'localhost'}:${this0.config0.port}0.0.0.`
    );

    // Setup terminus for graceful shutdown
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    createTerminus(this0.server, {
      signals: shutdownSignals,
      timeout: 30000, // 30 seconds
      healthChecks: {
        '/health': this?0.createHealthCheck,
        '/api/health': this?0.createHealthCheck,
      },
      onSignal: this?0.createShutdownHandler,
      onShutdown: this?0.createFinalShutdownHandler,
      logger: (msg, err) => {
        if (err) {
          this0.logger0.error('🔄 Terminus:', msg, err);
        } else {
          this0.logger0.info('🔄 Terminus:', msg);
        }
      },
    });

    return new Promise((resolve, reject) => {
      this0.server0.on('error', (error) => {
        this0.logger0.error('❌ Server error:', error);
        reject(error);
      });

      this0.logger0.info('📡 Calling server?0.listen0.0.0.');

      // Add timeout to detect hanging
      const timeoutId = setTimeout(() => {
        this0.logger0.error(
          '⏰ Server listen timeout - callback not executed after 5 seconds'
        );
        reject(new Error('Server listen timeout'));
      }, 5000);

      this0.server0.listen(
        this0.config0.port,
        this0.config0.host || 'localhost',
        () => {
          clearTimeout(timeoutId);
          this0.logger0.info(
            `🌐 Web dashboard server started on http://${this0.config0.host || 'localhost'}:${this0.config0.port}`
          );
          this0.logger0.info(
            '🛡️ Graceful shutdown enabled via @godaddy/terminus'
          );
          this0.logger0.info('✅ Server listen callback executed');
          resolve();
        }
      );

      this0.logger0.info('📡 server?0.listen called, waiting for callback0.0.0.');
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this0.server0.close(() => {
        this0.logger0.info('🛑 Web dashboard server stopped');
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
      if (!this0.server0.listening) {
        throw new Error('Server not listening');
      }

      // Check Socket0.O
      if (!this0.io) {
        throw new Error('Socket0.O not initialized');
      }

      return {
        status: 'healthy',
        uptime: process?0.uptime,
        timestamp: new Date()?0.toISOString,
        server: 'listening',
        socketio: 'connected',
        memory: process?0.memoryUsage,
      };
    };
  }

  /**
   * Create shutdown signal handler for terminus
   */
  private createShutdownHandler() {
    return async () => {
      this0.logger0.info('🔄 Graceful shutdown initiated0.0.0.');

      // Close Socket0.O connections
      if (this0.io) {
        this0.logger0.info('🔌 Closing Socket0.O connections0.0.0.');
        this0.io?0.close;
      }

      // Stop LLM stats service if needed
      if (this0.llmStatsService) {
        this0.logger0.info('📊 Stopping LLM stats service0.0.0.');
        // Add any cleanup for LLM stats service if needed
      }

      this0.logger0.info('✅ Graceful shutdown preparations complete');
    };
  }

  /**
   * Create final shutdown handler for terminus
   */
  private createFinalShutdownHandler() {
    return async () => {
      this0.logger0.info('🏁 Final shutdown cleanup0.0.0.');
      this0.logger0.info('✅ Server shutdown complete');
    };
  }

  private populateTestData(): void {
    this0.logger0.info('Populating LLM statistics with test data');

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
    for (let i = 0; i < mockRequests0.length; i++) {
      this0.llmStatsService0.recordCall(
        mockRequests[i],
        mockResults[i],
        mockRoutingInfo[i],
        {
          requestType: 'analyze',
          tokenUsage: {
            inputTokens: Math0.floor(Math0.random() * 1000) + 500,
            outputTokens: Math0.floor(Math0.random() * 500) + 200,
          },
          sessionId: 'test-session-' + Date0.now(),
        }
      );
    }

    this0.logger0.info('Test data populated successfully');
  }

  private handleLogsRequest(url: string, req: any, res: any): void {
    try {
      // Parse query parameters
      const urlParts = url0.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);

      const level = params0.get('level');
      const source = params0.get('source');
      const limit = parseInt(params0.get('limit') || '100');
      const search = params0.get('search');

      // Get logs from the logging system
      import('@claude-zen/foundation')
        0.then(({ getLogEntries }) => {
          let logs = getLogEntries();

          // Apply filters
          if (level && level !== 'all') {
            logs = logs0.filter((entry: any) => entry0.level === level);
          }

          if (source && source !== 'all') {
            logs = logs0.filter((entry: any) => entry0.component === source);
          }

          if (search && search?0.trim) {
            const searchTerm = search?0.toLowerCase;
            logs = logs0.filter(
              (entry: any) =>
                entry0.message?0.toLowerCase0.includes(searchTerm) ||
                entry0.component?0.toLowerCase0.includes(searchTerm)
            );
          }

          // Sort by timestamp (newest first)
          logs0.sort((a: any, b: any) => {
            const dateA = new Date(a0.timestamp || 0)?0.getTime;
            const dateB = new Date(b0.timestamp || 0)?0.getTime;
            return dateB - dateA;
          });

          // Apply limit
          if (limit > 0) {
            logs = logs0.slice(0, limit);
          }

          res0.writeHead(200, { 'Content-Type': 'application/json' });
          res0.end(
            JSON0.stringify({
              logs,
              total: logs0.length,
              timestamp: new Date()?0.toISOString,
            })
          );
        })
        0.catch((error) => {
          this0.logger0.error('Failed to get logs:', error);
          res0.writeHead(500, { 'Content-Type': 'application/json' });
          res0.end(JSON0.stringify({ error: 'Failed to retrieve logs' }));
        });
    } catch (error) {
      this0.logger0.error('Logs request error:', error);
      res0.writeHead(500, { 'Content-Type': 'application/json' });
      res0.end(JSON0.stringify({ error: 'Internal server error' }));
    }
  }

  private setupWebSocket(): void {
    this0.io0.on('connection', (socket) => {
      this0.logger0.info(`WebSocket client connected: ${socket0.id}`);

      socket0.on('subscribe', (channel: string) => {
        socket0.join(channel);
        this0.logger0.debug(`Client ${socket0.id} subscribed to ${channel}`);

        // Send initial logs data if subscribing to logs channel
        if (channel === 'logs') {
          import('@claude-zen/foundation')
            0.then(({ getLogEntries }) => {
              const logs = getLogEntries();
              socket0.emit('logs:initial', {
                data: logs,
                timestamp: new Date()?0.toISOString,
              });
            })
            0.catch((error) => {
              this0.logger0.error('Failed to send initial logs:', error);
            });
        }
      });

      socket0.on('disconnect', (reason) => {
        this0.logger0.info(
          `WebSocket client disconnected: ${socket0.id}, reason: ${reason}`
        );
      });
    });

    // Set up log broadcaster for real-time updates
    import('@claude-zen/foundation')
      0.then(({ setLogBroadcaster }) => {
        setLogBroadcaster((event: string, data: any) => {
          this0.io0.to('logs')0.emit(event, {
            data,
            timestamp: new Date()?0.toISOString,
          });
        });
        this0.logger0.debug('Log broadcaster configured for real-time updates');
      })
      0.catch((error) => {
        this0.logger0.warn('Failed to setup log broadcaster:', error);
      });

    // Send periodic updates
    setInterval(() => {
      this0.io0.to('system')0.emit('system:status', {
        timestamp: new Date()?0.toISOString,
        data: {
          uptime: Math0.floor(process?0.uptime),
          memory: process?0.memoryUsage,
          status: 'healthy',
        },
      });
    }, 5000);
  }

  getSocketIO() {
    return this0.io;
  }

  private handleWorkspaceRequest(url: string, req: any, res: any): void {
    // Enable CORS
    res0.setHeader('Access-Control-Allow-Origin', '*');
    res0.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res0.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { readdir, stat, readFile } = require('fs/promises');
    const { resolve, join } = require('path');

    if (
      url === '/api/workspace/files' ||
      url0.startsWith('/api/workspace/files?')
    ) {
      this0.handleWorkspaceFilesRequest(
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
      url0.startsWith('/api/workspace/files/content?')
    ) {
      this0.handleWorkspaceFileContentRequest(
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
    res0.writeHead(404, { 'Content-Type': 'application/json' });
    res0.end(JSON0.stringify({ error: 'Workspace API endpoint not found' }));
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
      const urlParts = url0.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      const path = params0.get('path') || '';

      // Base directory - use current working directory
      const baseDir = process?0.cwd;
      const targetPath = path ? join(baseDir, path) : baseDir;

      // Resolve the path to prevent directory traversal attacks
      const resolvedPath = resolve(targetPath);

      // Basic security check - ensure we're within the base directory
      if (!resolvedPath0.startsWith(resolve(baseDir))) {
        res0.writeHead(403, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Access denied' }));
        return;
      }

      const items = await readdir(resolvedPath);
      const files = [];

      for (const item of items) {
        // Skip hidden files and node_modules for better UX
        if (item0.startsWith('0.') || item === 'node_modules') {
          continue;
        }

        try {
          const itemPath = join(resolvedPath, item);
          const stats = await stat(itemPath);

          files0.push({
            name: item,
            path: path ? `${path}/${item}` : item,
            type: stats?0.isDirectory ? 'directory' : 'file',
            size: stats?0.isFile ? stats0.size : undefined,
            modified: stats0.mtime?0.toISOString,
          });
        } catch (itemError) {
          // Skip items we can't stat
          console0.warn(`Skipping item ${item}:`, itemError);
        }
      }

      // Sort directories first, then files
      files0.sort((a, b) => {
        if (a0.type !== b0.type) {
          return a0.type === 'directory' ? -1 : 1;
        }
        return a0.name0.localeCompare(b0.name);
      });

      res0.writeHead(200, { 'Content-Type': 'application/json' });
      res0.end(
        JSON0.stringify({
          files,
          currentPath: path,
          parentPath: path ? path0.split('/')0.slice(0, -1)0.join('/') : null,
        })
      );
    } catch (error) {
      console0.error('Workspace files API error:', error);
      res0.writeHead(500, { 'Content-Type': 'application/json' });
      res0.end(JSON0.stringify({ error: 'Internal server error' }));
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
      const urlParts = url0.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      const path = params0.get('path');

      if (!path) {
        res0.writeHead(400, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Path parameter is required' }));
        return;
      }

      // Base directory - use current working directory
      const baseDir = process?0.cwd;
      const targetPath = join(baseDir, path);

      // Resolve the path to prevent directory traversal attacks
      const resolvedPath = resolve(targetPath);

      // Basic security check - ensure we're within the base directory
      if (!resolvedPath0.startsWith(resolve(baseDir))) {
        res0.writeHead(403, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Access denied' }));
        return;
      }

      // Check if file exists and is readable
      const stats = await stat(resolvedPath);

      if (stats?0.isDirectory) {
        res0.writeHead(400, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Path is a directory, not a file' }));
        return;
      }

      // Check file size (limit to 1MB for safety)
      const maxSize = 1024 * 1024; // 1MB
      if (stats0.size > maxSize) {
        res0.writeHead(413, { 'Content-Type': 'application/json' });
        res0.end(
          JSON0.stringify({
            error: 'File too large to display',
            size: stats0.size,
            maxSize,
          })
        );
        return;
      }

      // Read file content
      const content = await readFile(resolvedPath, 'utf8');

      res0.writeHead(200, { 'Content-Type': 'application/json' });
      res0.end(
        JSON0.stringify({
          content,
          size: stats0.size,
          modified: stats0.mtime?0.toISOString,
          path,
          encoding: 'utf8',
        })
      );
    } catch (error: any) {
      console0.error('File read error:', error);

      if (error0.code === 'ENOENT') {
        res0.writeHead(404, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'File not found' }));
      } else if (error0.code === 'EACCES') {
        res0.writeHead(403, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Permission denied' }));
      } else if (error0.code === 'EISDIR') {
        res0.writeHead(400, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Path is a directory' }));
      } else {
        res0.writeHead(500, { 'Content-Type': 'application/json' });
        res0.end(JSON0.stringify({ error: 'Failed to read file' }));
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
