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
 *   node src/unified-server.js                    # Default port 3000
 *   node src/unified-server.js --port 4000        # Custom port
 *   npm start -- --port 5000                     # Via npm script
 */

import express from 'express';
import { createServer } from 'http';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Unified Claude Flow Server
 * Combines all services on a single configurable port
 */
export class UnifiedClaudeFlowServer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Parse CLI arguments for port configuration
    const cliPort = this.parsePortFromArgs();
    
    this.config = {
      port: cliPort || options.port || process.env.CLAUDE_FLOW_PORT || process.env.PORT || 3000,
      host: options.host || process.env.CLAUDE_FLOW_HOST || '0.0.0.0',
      enableAPI: options.enableAPI !== false,
      enableMCP: options.enableMCP !== false,
      enableWebSocket: options.enableWebSocket !== false,
      enableNeural: options.enableNeural !== false,
      ...options
    };
    
    this.app = express();
    this.server = null;
    this.wss = null;
    this.isRunning = false;
    
    // Component instances
    this.claudeZenServer = null;
    this.mcpServer = null;
    this.neuralEngine = null;
    this.aguiMiddleware = null;
    
    // Metrics
    this.metrics = {
      requests: 0,
      errors: 0,
      apiRequests: 0,
      mcpRequests: 0,
      wsConnections: 0,
      uptime: Date.now()
    };
    
    console.log(`🚀 Initializing Unified Claude Flow Server on port ${this.config.port}`);
  }
  
  /**
   * Parse port from command line arguments
   */
  parsePortFromArgs() {
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
  async initialize() {
    console.log('⚙️ Initializing server components...');
    
    try {
      // Setup basic middleware
      this.setupMiddleware();
      
      // Initialize neural engine first (if enabled)
      if (this.config.enableNeural) {
        await this.initializeNeuralEngine();
      }
      
      // Initialize MCP server (if enabled)
      if (this.config.enableMCP) {
        await this.initializeMCPServer();
      }
      
      // Initialize API routes (if enabled)
      if (this.config.enableAPI) {
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
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for dev and Swagger UI
      crossOriginEmbedderPolicy: false
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      credentials: true
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: { error: 'Too many requests, please try again later.' }
    });
    this.app.use(limiter);
    
    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Request logging and metrics
    this.app.use((req, res, next) => {
      this.metrics.requests++;
      
      // Track request types
      if (req.path.startsWith('/mcp')) {
        this.metrics.mcpRequests++;
      } else if (req.path.startsWith('/api')) {
        this.metrics.apiRequests++;
      }
      
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${req.method} ${req.path}`);
      next();
    });
  }
  
  /**
   * Initialize neural engine
   */
  async initializeNeuralEngine() {
    try {
      this.neuralEngine = new NeuralEngine();
      await this.neuralEngine.initialize();
      console.log(`🧠 Neural engine initialized with ${this.neuralEngine.models?.size || 0} models`);
    } catch (error) {
      console.warn(`⚠️ Neural engine initialization failed: ${error.message}`);
      this.neuralEngine = null;
    }
  }
  
  /**
   * Initialize MCP server and routes
   */
  async initializeMCPServer() {
    try {
      this.mcpServer = new ClaudeFlowMCPServer({
        enableGitTools: true,
        enableAllTools: true,
        httpMode: true
      });
      
      // MCP server auto-initializes, just set it up
      console.log('🔧 MCP server configured');
      
      // Add MCP routes to unified server
      this.setupMCPRoutes();
      
      console.log(`🔧 MCP server initialized with ${this.mcpServer.toolsRegistry?.getToolCount() || 0} tools`);
      
    } catch (error) {
      console.warn(`⚠️ MCP server initialization failed: ${error.message}`);
      this.mcpServer = null;
    }
  }
  
  /**
   * Setup MCP routes on unified server
   */
  setupMCPRoutes() {
    if (!this.mcpServer) return;
    
    // MCP health check
    this.app.get('/mcp/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        server: 'claude-flow-mcp-unified',
        tools: this.mcpServer.toolsRegistry?.getToolCount() || 0,
        uptime: process.uptime()
      });
    });
    
    // MCP initialize endpoint
    this.app.post('/mcp/initialize', async (req, res) => {
      try {
        const response = await this.mcpServer.handleMessage({
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
          error: { code: -32603, message: error.message }
        });
      }
    });
    
    // MCP tools/list endpoint
    this.app.post('/mcp/tools/list', async (req, res) => {
      try {
        const response = await this.mcpServer.handleMessage({
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
          error: { code: -32603, message: error.message }
        });
      }
    });
    
    // MCP tools/call endpoint
    this.app.post('/mcp/tools/call', async (req, res) => {
      try {
        const response = await this.mcpServer.handleMessage({
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
          error: { code: -32603, message: error.message }
        });
      }
    });
    
    // Unified MCP endpoint (handles all MCP methods)
    this.app.post('/mcp', async (req, res) => {
      try {
        const response = await this.mcpServer.handleMessage(req.body);
        res.json(response);
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: { code: -32603, message: error.message }
        });
      }
    });
    
    // List available tools (human-readable)
    this.app.get('/mcp/tools', async (req, res) => {
      const tools = await this.mcpServer.toolsRegistry?.getAllTools() || [];
      res.json({
        count: tools.length,
        tools: tools.map(t => ({
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
  async initializeAPIRoutes() {
    try {
      // Generate OpenAPI documentation
      const openApiSpec = generateOpenAPISpec(CLAUDE_ZEN_SCHEMA);
      
      // Swagger UI for API documentation
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
        customSiteTitle: 'Claude Flow Unified API Documentation',
        customCss: '.swagger-ui .topbar { display: none }'
      }));
      
      // Schema endpoint for introspection
      this.app.get('/api/schema', (req, res) => {
        const generatedRoutes = generateWorkflowRoutes(CLAUDE_ZEN_SCHEMA, this);
        res.json({
          success: true,
          schema: CLAUDE_ZEN_SCHEMA,
          routes: generatedRoutes,
          hierarchy: CLAUDE_ZEN_SCHEMA.__meta?.workflow_hierarchy
        });
      });
      
      // Auto-generate workflow routes from schema
      // Note: This creates temporary storage maps for demo purposes
      this.initializeTemporaryStorage();
      const generatedRoutes = generateWorkflowRoutes(CLAUDE_ZEN_SCHEMA, this);
      
      console.log(`✅ Generated ${generatedRoutes.length} API routes from schema`);
      
    } catch (error) {
      console.warn(`⚠️ API routes initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Initialize temporary storage for API routes
   */
  initializeTemporaryStorage() {
    // Auto-create storage maps for schema entries
    Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([cmdName, cmdConfig]) => {
      if (cmdConfig.storage) {
        this[cmdConfig.storage] = new Map();
      }
    });
    
    // Add some sample data
    if (this.visions) {
      this.visions.set('vision-001', {
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
  setupUnifiedRoutes() {
    // Root endpoint with server info
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Claude Flow Unified Server',
        version: '2.1.0',
        description: 'Unified server combining API + MCP + WebSocket on single port',
        port: this.config.port,
        components: {
          api: this.config.enableAPI,
          mcp: this.config.enableMCP && !!this.mcpServer,
          websocket: this.config.enableWebSocket,
          neural: this.config.enableNeural && !!this.neuralEngine
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
    this.app.get('/health', (req, res) => {
      const health = {
        status: 'ok',
        server: 'claude-flow-unified',
        port: this.config.port,
        uptime: (Date.now() - this.metrics.uptime) / 1000,
        timestamp: new Date().toISOString(),
        components: {
          api: this.config.enableAPI ? 'enabled' : 'disabled',
          mcp: this.mcpServer ? 'running' : (this.config.enableMCP ? 'failed' : 'disabled'),
          neural: this.neuralEngine ? 'running' : (this.config.enableNeural ? 'failed' : 'disabled'),
          websocket: this.config.enableWebSocket ? (this.wss ? 'running' : 'pending') : 'disabled'
        },
        metrics: this.getMetrics()
      };
      
      res.json(health);
    });
    
    // Configuration endpoint
    this.app.get('/config', (req, res) => {
      res.json({
        port: this.config.port,
        host: this.config.host,
        components: {
          api: this.config.enableAPI,
          mcp: this.config.enableMCP,
          websocket: this.config.enableWebSocket,
          neural: this.config.enableNeural
        },
        metrics: this.getMetrics()
      });
    });
  }
  
  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
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
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      this.metrics.errors++;
      
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
  setupWebSocket() {
    if (!this.config.enableWebSocket || this.wss) return;
    
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/ws'
    });
    
    // Initialize AG-UI middleware
    try {
      this.aguiMiddleware = integrateAGUIWithWebSocket(this.wss, {
        enableBroadcast: true,
        enableFiltering: true
      });
      
      console.log('🚀 WebSocket server initialized with AG-UI protocol support');
    } catch (error) {
      console.warn(`⚠️ AG-UI WebSocket integration failed: ${error.message}`);
    }
    
    // Setup connection handling
    this.wss.on('connection', (ws, request) => {
      this.metrics.wsConnections++;
      console.log(`🔗 New WebSocket connection (total: ${this.metrics.wsConnections})`);
      
      // Send welcome message
      if (this.aguiMiddleware) {
        const adapter = this.aguiMiddleware.getClientAdapter(ws);
        if (adapter) {
          setTimeout(() => {
            adapter.emitCustomEvent('welcome', {
              message: 'Connected to Claude Flow Unified Server',
              version: '2.1.0',
              components: Object.keys(this.getStatus().components).filter(k => this.getStatus().components[k]),
              timestamp: Date.now()
            });
          }, 100);
        }
      }
      
      ws.on('close', () => {
        this.metrics.wsConnections--;
        console.log(`🔗 WebSocket connection closed (remaining: ${this.metrics.wsConnections})`);
      });
      
      ws.on('error', (error) => {
        console.error('🔗 WebSocket error:', error);
      });
    });
  }
  
  /**
   * Start the unified server
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }
    
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);
      
      this.server.listen(this.config.port, this.config.host, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.isRunning = true;
        
        // Initialize WebSocket after HTTP server starts
        if (this.config.enableWebSocket) {
          this.setupWebSocket();
        }
        
        // Success logging
        console.log(`\n🚀 Claude Flow Unified Server running on port ${this.config.port}`);
        console.log(`   Host: ${this.config.host}`);
        console.log(`   URL: http://localhost:${this.config.port}/`);
        console.log(`\n📚 Available Endpoints:`);
        console.log(`   • API Documentation: http://localhost:${this.config.port}/docs`);
        console.log(`   • Health Check: http://localhost:${this.config.port}/health`);
        console.log(`   • Configuration: http://localhost:${this.config.port}/config`);
        
        if (this.mcpServer) {
          console.log(`   • MCP Tools: http://localhost:${this.config.port}/mcp/tools`);
          console.log(`   • MCP Endpoint: http://localhost:${this.config.port}/mcp`);
        }
        
        if (this.config.enableWebSocket) {
          console.log(`   • WebSocket: ws://localhost:${this.config.port}/ws`);
        }
        
        console.log(`\n✅ All components active and ready!`);
        
        this.emit('started', { port: this.config.port, host: this.config.host });
        resolve();
      });
      
      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.config.port} is already in use. Try: --port <other-port>`));
        } else {
          reject(err);
        }
      });
    });
  }
  
  /**
   * Stop the server
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('🛑 Shutting down Unified Claude Flow Server...');
    
    // Cleanup MCP server
    if (this.mcpServer) {
      await this.mcpServer.cleanup();
    }
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }
    
    return new Promise((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        console.log('✅ Server stopped successfully');
        this.emit('stopped');
        resolve();
      });
    });
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      apiRequests: this.metrics.apiRequests,
      mcpRequests: this.metrics.mcpRequests,
      wsConnections: this.metrics.wsConnections,
      uptime: (Date.now() - this.metrics.uptime) / 1000
    };
  }
  
  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      port: this.config.port,
      host: this.config.host,
      uptime: (Date.now() - this.metrics.uptime) / 1000,
      components: {
        api: this.config.enableAPI,
        mcp: !!this.mcpServer,
        neural: !!this.neuralEngine,
        websocket: !!this.wss
      },
      metrics: this.getMetrics()
    };
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