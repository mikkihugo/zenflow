/**
 * 🚀 CLAUDE ZEN SERVER - Schema-Driven API
 * Unified API server with auto-generated routes from schema
 * Replaces hard-coded endpoints with maintainable schema approach
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import { 
  CLAUDE_ZEN_SCHEMA, 
  generateWorkflowRoutes, 
  generateOpenAPISpec 
} from './claude-zen-schema.js';
import { integrateAGUIWithWebSocket } from './agui-websocket-middleware.js';
import { NeuralEngine } from '../neural/neural-engine.js';

/**
 * Schema-driven API server with auto-generated endpoints
 * 
 * @description Claude Zen Server provides a unified API with routes auto-generated
 * from the schema definition. Supports REST endpoints, WebSocket connections, 
 * OpenAPI documentation, and real-time metrics.
 * 
 * @example
 * const server = new ClaudeZenServer({
 *   port: 3000,
 *   host: '0.0.0.0'
 * });
 * await server.start();
 * 
 * @since 2.0.0-alpha.70
 * @author Claude Zen Team
 */
export class ClaudeZenServer extends EventEmitter {
  /**
   * Create a new Claude Zen Server instance
   * 
   * @param {Object} options - Server configuration options
   * @param {number} [options.port=3000] - Server port number
   * @param {string} [options.host='0.0.0.0'] - Server host address
   * @param {Object} [options.schema] - Schema for route generation
   * @param {boolean} [options.enableWebSocket=true] - Enable WebSocket support
   * @param {boolean} [options.enableMetrics=true] - Enable metrics collection
   * @param {Object} [options.cors] - CORS configuration
   * @param {Object} [options.rateLimit] - Rate limiting configuration
   * 
   * @example
   * const server = new ClaudeZenServer({
   *   port: 8080,
   *   host: 'localhost',
   *   enableMetrics: true,
   *   cors: { origin: '*' },
   *   rateLimit: { windowMs: 60000, max: 100 }
   * });
   */
  constructor(options = {}) {
    super();
    this.port = options.port || process.env.PORT || 3000;
    this.host = options.host || process.env.HOST || '0.0.0.0';
    this.app = express();
    this.server = null;
    this.wss = null;
    this.isRunning = false;
    
    // Schema-driven configuration
    this.schema = CLAUDE_ZEN_SCHEMA;
    this.generatedRoutes = [];
    
    // Dynamic storage maps (schema-driven)
    this.initializeStorage();
    
    this.metrics = {
      requests: 0,
      errors: 0,
      uptime: Date.now()
    };
    
    // Initialize neural engine automatically
    this.neuralEngine = new NeuralEngine();
    this.initializeNeuralEngine();
    
    this.setupMiddleware();
    this.setupSchemaRoutes();
    this.setupAGUIIntegration();
    this.setupErrorHandling();
  }

  /**
   * Initialize storage based on schema definitions
   * 
   * @description Automatically creates storage maps for all schema entities
   * that define storage requirements. Each entity gets its own storage
   * with appropriate data structures and indexing.
   * 
   * @private
   * @returns {void}
   * 
   * @example
   * // Schema entity with storage
   * visions: {
   *   storage: 'visions',
   *   // ... other config
   * }
   * // Creates: this.storage.visions = new Map()
   */
  initializeStorage() {
    // Auto-create storage for all schema entries that define storage
    Object.entries(this.schema).forEach(([cmdName, cmdConfig]) => {
      if (cmdConfig.storage) {
        this[cmdConfig.storage] = new Map();
      }
    });
    
    // Initialize with foundational data based on schema hierarchy
    this.initializeFoundationalData();
  }

  /**
   * Initialize foundational data following proper workflow hierarchy
   */
  initializeFoundationalData() {
    // Level 1: ADRs (Foundation) - Must come first
    const foundationalAdrs = [
      {
        id: 'adr-001',
        title: 'Use Elixir/OTP for High Concurrency Services',
        status: 'accepted',
        decision: 'Critical services will use Elixir/OTP for 1M+ concurrent operations',
        context: 'JavaScript services limited to 10K concurrent operations, need 100x improvement',
        consequences: 'Massive performance gains but requires team training on functional programming',
        alternatives: ['Node.js clustering', 'Go services', 'Rust services'],
        implementation_notes: 'Use Nix for environment management, PM2 for process orchestration',
        created: '2025-01-10T00:00:00Z',
        updated: new Date().toISOString(),
        author: 'system-architect',
        affects: ['all-services'],
        rationale: 'Actor model provides natural concurrency with fault tolerance'
      },
      {
        id: 'adr-002', 
        title: 'Schema-Driven API Development',
        status: 'accepted',
        decision: 'Use unified schema to auto-generate CLI/TUI/Web interfaces',
        context: 'Manual endpoint creation leads to inconsistencies and maintenance burden',
        consequences: 'Consistent interfaces across all access methods, easier maintenance',
        alternatives: ['Manual endpoint creation', 'Code generation tools', 'GraphQL'],
        implementation_notes: 'Single source schema generates Express routes, CLI commands, and TUI interfaces',
        created: '2025-01-25T00:00:00Z',
        updated: new Date().toISOString(),
        author: 'api-architect',
        affects: ['api-server', 'cli-tools', 'web-interface'],
        rationale: 'DRY principle applied to interface generation'
      }
    ];

    // Level 2: Roadmaps (Strategic)
    const strategicRoadmaps = [
      {
        id: 'roadmap-001',
        title: 'High-Performance Architecture Migration',
        description: 'Migrate from JavaScript to Elixir/OTP for critical services',
        status: 'active',
        timeline: 'medium',
        adr_references: ['adr-001'],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        author: 'technical-lead'
      }
    ];

    // Level 5: PRDs (Extended User Stories with Specs)
    const detailedPrds = [
      {
        id: 'prd-001',
        title: 'Schema-Driven API Endpoints',
        user_story: 'As a developer, I want API endpoints to be auto-generated from a schema so that I can maintain consistency across interfaces',
        business_value: 'Reduces development time and eliminates interface inconsistencies',
        status: 'approved',
        version: '2.1.0',
        roadmap_id: 'roadmap-001',
        stakeholders: ['backend-team', 'frontend-team', 'api-users'],
        functional_requirements: [
          'Must auto-generate Express routes from schema definitions',
          'Must support query parameter validation based on schema',
          'Must provide consistent error responses across all endpoints'
        ],
        non_functional_requirements: [
          'Route generation time: < 100ms on server startup',
          'Schema validation overhead: < 10ms per request',
          'Support for 1000+ concurrent requests'
        ],
        acceptance_criteria: [
          'GIVEN a schema definition WHEN server starts THEN all routes are auto-generated',
          'GIVEN invalid query parameters WHEN request made THEN validation error returned',
          'GIVEN schema changes WHEN server restarts THEN routes updated automatically'
        ],
        created: '2025-01-25T00:00:00Z',
        updated: new Date().toISOString(),
        author: 'product-manager'
      }
    ];

    // Level 0: Strategic Visions (High-level direction)
    const strategicVisions = [
      {
        id: 'vision-001',
        title: 'AI-Powered Customer Service Platform',
        description: 'Build an intelligent customer service system with multi-language support and predictive analytics',
        status: 'approved',
        priority: 'high',
        expected_roi: '$2.5M',
        category: 'AI/ML',
        created_at: '2025-01-15T00:00:00Z',
        updated_at: new Date().toISOString(),
        phases: [
          { name: 'Research & Analysis', status: 'completed', progress: 100, duration: '2 weeks' },
          { name: 'System Design', status: 'in_progress', progress: 65, duration: '3 weeks' },
          { name: 'Core Development', status: 'pending', progress: 0, duration: '8 weeks' },
          { name: 'Testing & QA', status: 'pending', progress: 0, duration: '3 weeks' },
          { name: 'Deployment', status: 'pending', progress: 0, duration: '1 week' }
        ],
        success_metrics: ['Customer satisfaction +40%', 'Response time <30s', 'Multi-language support'],
        stakeholders: ['Customer Success', 'Engineering', 'Product']
      },
      {
        id: 'vision-002',
        title: 'Blockchain Supply Chain Tracker',
        description: 'Transparent supply chain tracking using blockchain technology for end-to-end visibility',
        status: 'pending',
        priority: 'medium',
        expected_roi: '$1.8M',
        category: 'Blockchain',
        created_at: '2025-01-20T00:00:00Z',
        updated_at: new Date().toISOString(),
        phases: [
          { name: 'Market Research', status: 'in_progress', progress: 40, duration: '3 weeks' },
          { name: 'Technical Specification', status: 'pending', progress: 0, duration: '2 weeks' },
          { name: 'Blockchain Integration', status: 'pending', progress: 0, duration: '6 weeks' },
          { name: 'UI Development', status: 'pending', progress: 0, duration: '4 weeks' },
          { name: 'Go Live', status: 'pending', progress: 0, duration: '1 week' }
        ],
        success_metrics: ['100% supply chain visibility', 'Fraud reduction 90%', 'Compliance automation'],
        stakeholders: ['Supply Chain', 'Legal', 'Engineering']
      },
      {
        id: 'vision-003',
        title: 'Neural Network Code Optimizer',
        description: 'AI system that automatically optimizes code performance using neural networks and static analysis',
        status: 'approved',
        priority: 'high',
        expected_roi: '$3.2M',
        category: 'AI/ML',
        created_at: '2025-01-25T00:00:00Z',
        updated_at: new Date().toISOString(),
        phases: [
          { name: 'Algorithm Research', status: 'completed', progress: 100, duration: '4 weeks' },
          { name: 'Neural Model Training', status: 'completed', progress: 100, duration: '6 weeks' },
          { name: 'Integration Development', status: 'in_progress', progress: 80, duration: '5 weeks' },
          { name: 'Performance Testing', status: 'pending', progress: 0, duration: '2 weeks' },
          { name: 'Production Release', status: 'pending', progress: 0, duration: '1 week' }
        ],
        success_metrics: ['Performance improvement 300%', 'Bug reduction 50%', 'Developer productivity +25%'],
        stakeholders: ['Engineering', 'DevOps', 'CTO Office']
      }
    ];

    // Store in appropriate storage maps
    strategicVisions.forEach(vision => this.visions.set(vision.id, vision));
    foundationalAdrs.forEach(adr => this.adrs.set(adr.id, adr));
    strategicRoadmaps.forEach(roadmap => this.roadmaps.set(roadmap.id, roadmap));
    detailedPrds.forEach(prd => this.prds.set(prd.id, prd));
  }

  /**
   * Setup middleware with security and performance optimizations
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for Swagger UI
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.schema.__meta?.autoGenerate?.rateLimit?.windowMs || 15 * 60 * 1000,
      max: this.schema.__meta?.autoGenerate?.rateLimit?.max || 1000,
      message: { error: 'Too many requests, please try again later.' }
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging and metrics
    this.app.use((req, res, next) => {
      this.metrics.requests++;
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes auto-generated from schema
   */
  setupSchemaRoutes() {
    // Generate OpenAPI documentation
    const openApiSpec = generateOpenAPISpec(this.schema);
    
    // Swagger UI for API documentation
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Claude Zen API Documentation',
      customCss: '.swagger-ui .topbar { display: none }'
    }));

    // Schema endpoint for introspection
    this.app.get('/api/schema', (req, res) => {
      res.json({
        success: true,
        schema: this.schema,
        routes: this.generatedRoutes,
        hierarchy: this.schema.__meta?.workflow_hierarchy
      });
    });

    // Auto-generate workflow routes from schema
    this.generatedRoutes = generateWorkflowRoutes(this.schema, this);

    // Health endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: (Date.now() - this.metrics.uptime) / 1000,
        version: this.schema.__meta?.apiVersion || '2.1.0',
        timestamp: new Date().toISOString(),
        routes_generated: this.generatedRoutes.length
      });
    });

    // Root endpoint with API info
    this.app.get('/', (req, res) => {
      res.json({
        name: this.schema.__meta?.title || 'Claude Zen API',
        version: this.schema.__meta?.apiVersion || '2.1.0',
        description: this.schema.__meta?.description,
        schema_driven: true,
        endpoints: {
          docs: '/docs',
          schema: '/api/schema',
          health: '/health'
        },
        workflow_hierarchy: this.schema.__meta?.workflow_hierarchy,
        generated_routes: this.generatedRoutes.length
      });
    });

    console.log(`✅ Auto-generated ${this.generatedRoutes.length} routes from schema`);
    this.generatedRoutes.forEach(route => {
      console.log(`   ${route.method} ${route.endpoint} -> ${route.command}`);
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler (must be after all routes)  
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not available`,
        available_endpoints: this.generatedRoutes.map(r => `${r.method} ${r.endpoint}`),
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
   * Start the server
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, this.host, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.isRunning = true;
        
        // Initialize WebSocket with AG-UI after HTTP server starts
        this.setupWebSocketWithAGUI();
        
        console.log('🚀 Singularity Alpha API server running on port ' + this.port);
        console.log('📖 API documentation: http://localhost:' + this.port + '/docs');
        console.log('🔗 WebSocket endpoint: ws://localhost:' + this.port + '/ws');
        console.log('🌟 AG-UI protocol: http://localhost:' + this.port + '/agui/status');
        console.log('✅ Server started successfully');

        this.emit('started', { port: this.port, host: this.host });
        resolve();
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.port} is already in use`));
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

    return new Promise((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        this.emit('stopped');
        resolve();
      });
    });
  }

  /**
   * Setup AG-UI protocol integration
   */
  setupAGUIIntegration() {
    // AG-UI will be initialized when WebSocket server starts
    this.aguiMiddleware = null;
    
    // Add AG-UI status endpoint
    this.app.get('/agui/status', (req, res) => {
      if (this.aguiMiddleware) {
        res.json({
          enabled: true,
          stats: this.aguiMiddleware.getStats(),
          adapters: {
            global: this.aguiMiddleware.getGlobalAdapter().getStats()
          }
        });
      } else {
        res.json({
          enabled: false,
          message: 'AG-UI middleware not initialized'
        });
      }
    });
    
    // Add AG-UI events endpoint for testing
    this.app.post('/agui/emit', (req, res) => {
      if (!this.aguiMiddleware) {
        return res.status(400).json({ error: 'AG-UI not initialized' });
      }
      
      const { type, data } = req.body;
      const globalAdapter = this.aguiMiddleware.getGlobalAdapter();
      
      try {
        switch (type) {
          case 'text_message':
            globalAdapter.startTextMessage();
            globalAdapter.addTextContent(data.content || 'Test message');
            globalAdapter.endTextMessage();
            break;
            
          case 'tool_call':
            const toolCallId = globalAdapter.startToolCall(data.name || 'test_tool');
            globalAdapter.addToolCallArgs(JSON.stringify(data.args || {}));
            globalAdapter.endToolCall(toolCallId);
            globalAdapter.emitToolCallResult(data.result || 'Test result', toolCallId);
            break;
            
          case 'queen_action':
            globalAdapter.emitQueenEvent(data.queenId || 'queen-1', data.action || 'test', data.data || {});
            break;
            
          case 'hive_mind':
            globalAdapter.emitHiveMindEvent(data.action || 'test', data.data || {});
            break;
            
          default:
            globalAdapter.emitCustomEvent(type, data);
        }
        
        res.json({ success: true, message: 'AG-UI event emitted' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Initialize WebSocket server with AG-UI integration
   */
  setupWebSocketWithAGUI() {
    if (this.wss) return; // Already initialized
    
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/ws'
    });
    
    // Initialize AG-UI middleware
    this.aguiMiddleware = integrateAGUIWithWebSocket(this.wss, {
      enableBroadcast: true,
      enableFiltering: true
    });
    
    // Setup connection handling
    this.wss.on('connection', (ws, request) => {
      console.log('🔗 New WebSocket connection established');
      
      // Send welcome message via AG-UI
      const adapter = this.aguiMiddleware.getClientAdapter(ws);
      if (adapter) {
        setTimeout(() => {
          adapter.emitCustomEvent('welcome', {
            message: 'Connected to Claude Code Zen with AG-UI support',
            serverVersion: this.getStatus().schema_version,
            timestamp: Date.now()
          });
        }, 100);
      }
      
      // Handle client disconnect
      ws.on('close', () => {
        console.log('🔗 WebSocket connection closed');
      });
      
      ws.on('error', (error) => {
        console.error('🔗 WebSocket error:', error);
      });
    });
    
    console.log('🚀 WebSocket server initialized with AG-UI protocol support');
  }

  /**
   * Initialize neural engine automatically
   */
  async initializeNeuralEngine() {
    try {
      await this.neuralEngine.initialize();
      console.log(`🧠 API Server: Neural engine initialized with ${this.neuralEngine.models.size} models`);
    } catch (error) {
      console.warn(`⚠️ API Server: Neural engine unavailable: ${error.message}`);
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      port: this.port,
      uptime: (Date.now() - this.metrics.uptime) / 1000,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      generated_routes: this.generatedRoutes.length,
      schema_version: this.schema.__meta?.apiVersion,
      neural_engine: this.neuralEngine ? {
        initialized: this.neuralEngine.isInitialized,
        models: this.neuralEngine.models.size,
        cache_size: this.neuralEngine.cache.size
      } : null
    };
  }
}

// Export singleton instance
export const claudeZenServer = new ClaudeZenServer();
export default claudeZenServer;