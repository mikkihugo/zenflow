#!/usr/bin/env node

/**
 * 🚀 UNIFIED CLAUDE FLOW SERVER
 * Single server combining API + MCP + WebSocket on configurable port (default 3000)
 * 
 * Features:
 * - REST API endpoints from ClaudeZenServer
 * - MCP protocol endpoints
 * - WebSocket support with AG-UI
 * - Neural engine integration
 * - Single configurable port
 * - CLI interface integration
 * 
 * Usage:
 *   node src/unified-server.ts                    # Default port 3000
 *   node src/unified-server.ts --port 4000        # Custom port
 *   npm start -- --port 5000                     # Via npm script
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Import existing components
import { ClaudeZenServer } from './api/claude-zen-server.js';
import { ClaudeFlowMCPServer } from './mcp/mcp-server.js';
import { 
  CLAUDE_ZEN_SCHEMA, 
  generateWorkflowRoutes, 
  generateOpenAPISpec 
} from './api/claude-zen-schema.js';
import { integrateAGUIWithWebSocket } from './api/agui-websocket-middleware.js';
import { NeuralEngine } from './neural/neural-engine.js';

// Import types
import {
  UnifiedServer,
  ServerConfig,
  ServerStatus,
  ServerMetrics,
  ServerHealth,
  ServerEvents,
  ComponentStatus,
  TypedRequest,
  TypedResponse,
  RouteDefinition,
  MiddlewareDefinition,
  WebSocketClient,
  WebSocketMessage,
  MCPToolDefinition,
  ValidationResult,
  UserContext,
  SessionContext
} from './types/server.js';
import { SystemStatus, HealthCheck, ResourceUsage, JSONObject, JSONValue } from './types/core.js';
import { MCPServer } from './types/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Unified Claude Flow Server Configuration
 */
interface UnifiedServerOptions {
  port?: number;
  host?: string;
  enableAPI?: boolean;
  enableMCP?: boolean;
  enableWebSocket?: boolean;
  enableNeural?: boolean;
  [key: string]: any;
}

/**
 * Server Metrics Interface
 */
interface ServerMetricsData {
  requests: number;
  errors: number;
  apiRequests: number;
  mcpRequests: number;
  wsConnections: number;
  uptime: number;
}

/**
 * Unified Claude Flow Server
 * Combines all services on a single configurable port
 */
export class UnifiedClaudeFlowServer extends EventEmitter implements Partial<UnifiedServer> {
  private readonly _config: UnifiedServerOptions;
  private readonly _app: Application;
  private _server: HTTPServer | null = null;
  private _wss: WebSocketServer | null = null;
  private _isRunning: boolean = false;
  
  // Component instances
  private _claudeZenServer: ClaudeZenServer | null = null;
  private _mcpServer: ClaudeFlowMCPServer | null = null;
  private _neuralEngine: NeuralEngine | null = null;
  private _aguiMiddleware: any = null;
  
  // Metrics
  private _metrics: ServerMetricsData = {
    requests: 0,
    errors: 0,
    apiRequests: 0,
    mcpRequests: 0,
    wsConnections: 0,
    uptime: Date.now()
  };

  // Connected WebSocket clients
  private _wsClients: Map<string, WebSocketClient> = new Map();

  constructor(options: UnifiedServerOptions = {}) {
    super();
    
    // Parse CLI arguments for port configuration
    const cliPort = this.parsePortFromArgs();
    
    this._config = {
      port: cliPort || options.port || Number(process.env.CLAUDE_FLOW_PORT) || Number(process.env.PORT) || 3000,
      host: options.host || process.env.CLAUDE_FLOW_HOST || '0.0.0.0',
      enableAPI: options.enableAPI !== false,
      enableMCP: options.enableMCP !== false,
      enableWebSocket: options.enableWebSocket !== false,
      enableNeural: options.enableNeural !== false,
      ...options
    };
    
    this._app = express();
    
    console.log(`🚀 Initializing Unified Claude Flow Server on port ${this._config.port}`);
  }

  /**
   * Get server configuration
   */
  get config(): any {
    return { ...this._config };
  }

  /**
   * Get HTTP server instance
   */
  get httpServer(): HTTPServer | null {
    return this._server;
  }

  /**
   * Get WebSocket server instance
   */
  get wsServer(): WebSocketServer | null {
    return this._wss;
  }

  /**
   * Get MCP server instance
   */
  get mcpServer(): ClaudeFlowMCPServer | null {
    return this._mcpServer;
  }

  /**
   * Get current server status
   */
  get status(): SystemStatus {
    if (!this._isRunning) return 'offline';
    
    const hasErrors = this._metrics.errors > 0;
    const componentsHealthy = this.checkComponentsHealth();
    
    if (hasErrors || !componentsHealthy) return 'degraded';
    return 'healthy';
  }

  /**
   * Get current metrics
   */
  get metrics(): any {
    return { ...this._metrics };
  }

  /**
   * Parse port from command line arguments
   */
  private parsePortFromArgs(): number | null {
    const args = process.argv.slice(2);
    const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
    
    if (portIndex !== -1 && args[portIndex + 1]) {
      const port = parseInt(args[portIndex + 1], 10);
      if (!isNaN(port) && port > 0 && port < 65536) {
        console.log(`📡 Using CLI port: ${port}`);
        return port;
      }
    }
    
    return null;
  }

  /**
   * Initialize all server components
   */
  async initialize(): Promise<void> {
    console.log('⚙️ Initializing server components...');
    
    try {
      // Setup basic middleware
      this.setupMiddleware();
      
      // Initialize neural engine first (if enabled)
      if (this._config.enableNeural) {
        await this.initializeNeuralEngine();
      }
      
      // Initialize MCP server (if enabled)
      if (this._config.enableMCP) {
        await this.initializeMCPServer();
      }
      
      // Initialize API routes (if enabled)
      if (this._config.enableAPI) {
        await this.initializeAPIRoutes();
      }
      
      // Setup unified routes
      this.setupUnifiedRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      console.log('✅ All components initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize server components:', error);
      throw error;
    }
  }

  /**
   * Setup basic middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this._app.use(helmet({
      contentSecurityPolicy: false, // Disable for dev and Swagger UI
      crossOriginEmbedderPolicy: false
    }));
    
    // CORS configuration
    this._app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      credentials: true
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: { error: 'Too many requests, please try again later.' }
    });
    this._app.use(limiter);
    
    // Body parsing
    this._app.use(express.json({ limit: '50mb' }));
    this._app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Request logging and metrics
    this._app.use((req: Request, res: Response, next: NextFunction) => {
      this._metrics.requests++;
      
      // Track request types
      if (req.path.startsWith('/mcp')) {
        this._metrics.mcpRequests++;
      } else if (req.path.startsWith('/api')) {
        this._metrics.apiRequests++;
      }
      
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Initialize neural engine
   */
  private async initializeNeuralEngine(): Promise<void> {
    try {
      this._neuralEngine = new NeuralEngine();
      await this._neuralEngine.initialize();
      console.log(`🧠 Neural engine initialized with ${(this._neuralEngine as any).models?.size || 0} models`);
    } catch (error) {
      console.warn(`⚠️ Neural engine initialization failed: ${(error as Error).message}`);
      this._neuralEngine = null;
    }
  }

  /**
   * Initialize MCP server and routes
   */
  private async initializeMCPServer(): Promise<void> {
    try {
      this._mcpServer = new ClaudeFlowMCPServer({
        enableGitTools: true,
        enableAllTools: true,
        httpMode: true
      });
      
      // MCP server auto-initializes, just set it up
      console.log('🔧 MCP server configured');
      
      // Add MCP routes to unified server
      this.setupMCPRoutes();
      
      console.log(`🔧 MCP server initialized with ${(this._mcpServer as any).toolsRegistry?.getToolCount() || 0} tools`);
      
    } catch (error) {
      console.warn(`⚠️ MCP server initialization failed: ${(error as Error).message}`);
      this._mcpServer = null;
    }
  }

  /**
   * Setup MCP routes on unified server
   */
  private setupMCPRoutes(): void {
    if (!this._mcpServer) return;
    
    // MCP health check
    this._app.get('/mcp/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        server: 'claude-flow-mcp-unified',
        tools: (this._mcpServer as any)?.toolsRegistry?.getToolCount() || 0,
        uptime: process.uptime()
      });
    });
    
    // MCP initialize endpoint
    this._app.post('/mcp/initialize', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer!.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'initialize',
          params: req.body.params || {}
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          error: { code: -32603, message: (error as Error).message }
        });
      }
    });
    
    // MCP tools/list endpoint
    this._app.post('/mcp/tools/list', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer!.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'tools/list',
          params: req.body.params || {}
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          error: { code: -32603, message: (error as Error).message }
        });
      }
    });
    
    // MCP tools/call endpoint
    this._app.post('/mcp/tools/call', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer!.handleMessage({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: 'tools/call',
          params: req.body.params
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id || 1,
          error: { code: -32603, message: (error as Error).message }
        });
      }
    });
    
    // Unified MCP endpoint (handles all MCP methods)
    this._app.post('/mcp', async (req: Request, res: Response) => {
      try {
        const response = await this._mcpServer!.handleMessage(req.body);
        res.json(response);
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: { code: -32603, message: (error as Error).message }
        });
      }
    });
    
    // List available tools (human-readable)
    this._app.get('/mcp/tools', async (req: Request, res: Response) => {
      const tools = await (this._mcpServer as any)!.toolsRegistry?.getAllTools() || [];
      res.json({
        count: tools.length,
        tools: tools.map((t: any) => ({
          name: t.name,
          description: t.description,
          category: t.category || 'general'
        }))
      });
    });
  }

  /**
   * Initialize API routes from ClaudeZenServer
   */
  private async initializeAPIRoutes(): Promise<void> {
    try {
      // Generate OpenAPI documentation
      const openApiSpec = generateOpenAPISpec(CLAUDE_ZEN_SCHEMA);
      
      // Swagger UI for API documentation
      this._app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
        customSiteTitle: 'Claude Flow Unified API Documentation',
        customCss: '.swagger-ui .topbar { display: none }'
      }));
      
      // Schema endpoint for introspection
      this._app.get('/api/schema', (req: Request, res: Response) => {
        const generatedRoutes = generateWorkflowRoutes(CLAUDE_ZEN_SCHEMA, this);
        res.json({
          success: true,
          schema: CLAUDE_ZEN_SCHEMA,
          routes: generatedRoutes,
          hierarchy: (CLAUDE_ZEN_SCHEMA as any).__meta?.workflow_hierarchy
        });
      });
      
      // Auto-generate workflow routes from schema
      // Note: This creates temporary storage maps for demo purposes
      this.initializeTemporaryStorage();
      const generatedRoutes = generateWorkflowRoutes(CLAUDE_ZEN_SCHEMA, this);
      
      console.log(`✅ Generated ${generatedRoutes.length} API routes from schema`);
      
    } catch (error) {
      console.warn(`⚠️ API routes initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Initialize temporary storage for API routes
   */
  private initializeTemporaryStorage(): void {
    // Auto-create storage maps for schema entries
    Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([cmdName, cmdConfig]) => {
      if ((cmdConfig as any).storage) {
        (this as any)[(cmdConfig as any).storage] = new Map();
      }
    });
    
    // Add some sample data
    if ((this as any).visions) {
      (this as any).visions.set('vision-001', {
        id: 'vision-001',
        title: 'Unified Server Architecture',
        description: 'Single server combining all Claude Flow services',
        status: 'in_progress',
        priority: 'high'
      });
    }
  }

  /**
   * Setup unified routes
   */
  private setupUnifiedRoutes(): void {
    // Root endpoint with server info
    this._app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Claude Flow Unified Server',
        version: '2.1.0',
        description: 'Unified server combining API + MCP + WebSocket on single port',
        port: this._config.port,
        components: {
          api: this._config.enableAPI,
          mcp: this._config.enableMCP && !!this._mcpServer,
          websocket: this._config.enableWebSocket,
          neural: this._config.enableNeural && !!this._neuralEngine
        },
        endpoints: {
          docs: '/docs',
          schema: '/api/schema',
          health: '/health',
          mcp: '/mcp',
          'mcp-tools': '/mcp/tools'
        },
        metrics: this.getMetrics()
      });
    });
    
    // Unified health endpoint
    this._app.get('/health', (req: Request, res: Response) => {
      const health = {
        status: 'ok',
        server: 'claude-flow-unified',
        port: this._config.port,
        uptime: (Date.now() - this._metrics.uptime) / 1000,
        timestamp: new Date().toISOString(),
        components: {
          api: this._config.enableAPI ? 'enabled' : 'disabled',
          mcp: this._mcpServer ? 'running' : (this._config.enableMCP ? 'failed' : 'disabled'),
          neural: this._neuralEngine ? 'running' : (this._config.enableNeural ? 'failed' : 'disabled'),
          websocket: this._config.enableWebSocket ? (this._wss ? 'running' : 'pending') : 'disabled'
        },
        metrics: this.getMetrics()
      };
      
      res.json(health);
    });
    
    // Configuration endpoint
    this._app.get('/config', (req: Request, res: Response) => {
      res.json({
        port: this._config.port,
        host: this._config.host,
        components: {
          api: this._config.enableAPI,
          mcp: this._config.enableMCP,
          websocket: this._config.enableWebSocket,
          neural: this._config.enableNeural
        },
        metrics: this.getMetrics()
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
        available_endpoints: {
          root: 'GET /',
          health: 'GET /health',
          config: 'GET /config',
          docs: 'GET /docs',
          api_schema: 'GET /api/schema',
          mcp: 'POST /mcp',
          mcp_tools: 'GET /mcp/tools'
        },
        timestamp: new Date().toISOString()
      });
    });
    
    // Global error handler
    this._app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server error:', err);
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
   * Setup WebSocket server with AG-UI integration
   */
  private setupWebSocket(): void {
    if (!this._config.enableWebSocket || this._wss) return;
    
    this._wss = new WebSocketServer({ 
      server: this._server!,
      path: '/ws'
    });
    
    // Initialize AG-UI middleware
    try {
      this._aguiMiddleware = integrateAGUIWithWebSocket(this._wss, {
        enableBroadcast: true,
        enableFiltering: true
      });
      
      console.log('🚀 WebSocket server initialized with AG-UI protocol support');
    } catch (error) {
      console.warn(`⚠️ AG-UI WebSocket integration failed: ${(error as Error).message}`);
    }
    
    // Setup connection handling
    this._wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId();
      this._metrics.wsConnections++;
      
      const client: WebSocketClient = {
        id: clientId,
        socket: ws,
        metadata: {},
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: []
      };
      
      this._wsClients.set(clientId, client);
      
      console.log(`🔗 New WebSocket connection: ${clientId} (total: ${this._metrics.wsConnections})`);
      
      // Send welcome message
      if (this._aguiMiddleware) {
        const adapter = this._aguiMiddleware.getClientAdapter(ws);
        if (adapter) {
          setTimeout(() => {
            adapter.emitCustomEvent('welcome', {
              message: 'Connected to Claude Flow Unified Server',
              version: '2.1.0',
              components: Object.keys(this.getStatus().components).filter(k => {
                const status = this.getStatus().components;
                return status[k as keyof typeof status];
              }),
              timestamp: Date.now()
            });
          }, 100);
        }
      }
      
      ws.on('close', () => {
        this._wsClients.delete(clientId);
        this._metrics.wsConnections--;
        console.log(`🔗 WebSocket connection closed: ${clientId} (remaining: ${this._metrics.wsConnections})`);
      });
      
      ws.on('error', (error) => {
        console.error(`🔗 WebSocket error for ${clientId}:`, error);
      });
    });
  }

  /**
   * Start the unified server
   */
  async start(): Promise<void> {
    if (this._isRunning) {
      throw new Error('Server is already running');
    }
    
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this._server = createServer(this._app);
      
      this._server.listen(this._config.port, this._config.host as string, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        
        this._isRunning = true;
        
        // Initialize WebSocket after HTTP server starts
        if (this._config.enableWebSocket) {
          this.setupWebSocket();
        }
        
        // Success logging
        console.log(`\n🚀 Claude Flow Unified Server running on port ${this._config.port}`);
        console.log(`   Host: ${this._config.host}`);
        console.log(`   URL: http://localhost:${this._config.port}/`);
        console.log(`\n📚 Available Endpoints:`);
        console.log(`   • API Documentation: http://localhost:${this._config.port}/docs`);
        console.log(`   • Health Check: http://localhost:${this._config.port}/health`);
        console.log(`   • Configuration: http://localhost:${this._config.port}/config`);
        
        if (this._mcpServer) {
          console.log(`   • MCP Tools: http://localhost:${this._config.port}/mcp/tools`);
          console.log(`   • MCP Endpoint: http://localhost:${this._config.port}/mcp`);
        }
        
        if (this._config.enableWebSocket) {
          console.log(`   • WebSocket: ws://localhost:${this._config.port}/ws`);
        }
        
        console.log(`\n✅ All components active and ready!`);
        
        this.emit('started', { port: this._config.port, host: this._config.host });
        resolve();
      });
      
      this._server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this._config.port} is already in use. Try: --port <other-port>`));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }
    
    console.log('🛑 Shutting down Unified Claude Flow Server...');
    
    // Cleanup MCP server
    if (this._mcpServer) {
      await (this._mcpServer as any).cleanup?.();
    }
    
    // Close WebSocket server
    if (this._wss) {
      this._wss.close();
    }
    
    return new Promise((resolve) => {
      this._server!.close(() => {
        this._isRunning = false;
        console.log('✅ Server stopped successfully');
        this.emit('stopped');
        resolve();
      });
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): any {
    return {
      requests: this._metrics.requests,
      errors: this._metrics.errors,
      apiRequests: this._metrics.apiRequests,
      mcpRequests: this._metrics.mcpRequests,
      wsConnections: this._metrics.wsConnections,
      uptime: (Date.now() - this._metrics.uptime) / 1000
    };
  }

  /**
   * Get server status
   */
  getStatus(): any {
    return {
      running: this._isRunning,
      port: this._config.port,
      host: this._config.host,
      uptime: (Date.now() - this._metrics.uptime) / 1000,
      components: {
        api: this._config.enableAPI,
        mcp: !!this._mcpServer,
        neural: !!this._neuralEngine,
        websocket: !!this._wss
      },
      metrics: this.getMetrics()
    };
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  broadcast(event: string, data: JSONValue): void {
    if (!this._wss) return;
    
    const message: WebSocketMessage = {
      type: event,
      data,
      timestamp: new Date()
    };
    
    for (const client of this._wsClients.values()) {
      if (client.socket.readyState === client.socket.OPEN) {
        try {
          client.socket.send(JSON.stringify(message));
          client.lastActivity = new Date();
        } catch (error) {
          console.error(`Failed to send message to client ${client.id}:`, error);
        }
      }
    }
  }

  /**
   * Get connected WebSocket clients
   */
  getConnectedClients(): WebSocketClient[] {
    return Array.from(this._wsClients.values());
  }

  /**
   * Check components health
   */
  private checkComponentsHealth(): boolean {
    let healthy = true;
    
    if (this._config.enableMCP && !this._mcpServer) healthy = false;
    if (this._config.enableNeural && !this._neuralEngine) healthy = false;
    if (this._config.enableWebSocket && !this._wss) healthy = false;
    
    return healthy;
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * CLI execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new UnifiedClaudeFlowServer();
  
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
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export default UnifiedClaudeFlowServer;