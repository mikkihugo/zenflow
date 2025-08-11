/**
 * Web Dashboard Server - Express.js HTTP server setup.
 *
 * Handles Express server initialization, middleware, and core HTTP functionality.
 * Separated from business logic for better maintainability.
 */
/**
 * @file Interface implementation: web-dashboard-server.
 */

import { existsSync } from 'node:fs';
import { createServer, type Server as HTTPServer } from 'node:http';
import { join } from 'node:path';
import express, { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { getLogger } from '../../config/logging-config.ts';
import type { WebConfig } from './web-config.ts';

export class WebDashboardServer {
  private logger = getLogger('WebServer');
  private app: Express;
  private server: HTTPServer;
  private io: SocketIOServer;
  private config: WebConfig;

  constructor(config: WebConfig) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
  }

  /**
   * Get Express app instance.
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Get HTTP server instance.
   */
  getServer(): HTTPServer {
    return this.server;
  }

  /**
   * Get Socket.IO instance.
   */
  getSocketIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Setup Express middleware.
   */
  setupMiddleware(): void {
    // CORS
    if (this.config.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        );
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Static files (serve React build) - but exclude /docs route
    if (existsSync(this.config.staticDir!)) {
      this.app.use((req, res, next) => {
        // Skip static serving for our custom routes
        if (
          req.path === '/docs' ||
          req.path.startsWith('/tsdocs') ||
          req.path.startsWith('/api-docs')
        ) {
          return next();
        }
        express.static(this.config.staticDir!)(req, res, next);
      });
    }

    // Documentation routes (after static middleware so they take precedence)
    this.setupDocumentationRoutes();
  }

  /**
   * Setup documentation routes - serve built docs directly.
   */
  private setupDocumentationRoutes(): void {
    // Documentation hub at /docs with TypeDoc content
    const tsdocPath = join(process.cwd(), 'docs', 'api');
    if (existsSync(tsdocPath)) {
      // Serve TypeDoc at /docs/api/
      this.app.use('/docs/api', express.static(tsdocPath));

      // Documentation hub at /docs
      this.app.get('/docs', (req, res) => {
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Claude Code Zen Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .doc-section { margin: 30px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; }
        .doc-section h2 { color: #555; margin-top: 0; }
        .doc-section p { color: #666; line-height: 1.6; }
        .doc-link { display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .doc-link:hover { background: #0052a3; }
        .tsdoc { border-left: 4px solid #2196F3; }
        .api-doc { border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Claude Code Zen Documentation</h1>
        
        <div class="doc-section api-doc">
            <h2>🔧 REST API Documentation</h2>
            <p>Interactive API documentation for all REST endpoints. Test API calls and view request/response schemas.</p>
            <a href="/api-docs" class="doc-link">View API Documentation</a>
        </div>
        
        <div class="doc-section tsdoc">
            <h2>💻 TypeScript Code Documentation</h2>
            <p>Complete TypeDoc generated documentation covering all TypeScript types, interfaces, classes, and functions.</p>
            <a href="/docs/api/" class="doc-link">View Code Documentation</a>
        </div>
        
        <div class="doc-section">
            <h2>🔗 Quick Links</h2>
            <p>• <a href="/">Dashboard</a> - Main application interface</p>
            <p>• <a href="/websocket-test">WebSocket Test</a> - Test real-time connections</p>
            <p>• <a href="/health">Health Check</a> - System status</p>
        </div>
    </div>
</body>
</html>
        `);
      });

      this.logger.info('📚 Documentation hub available at /docs');
      this.logger.info('📚 TypeDoc documentation available at /docs/api/');
    }

    // Serve TypeScript documentation at /tsdoc (alias)
    if (existsSync(tsdocPath)) {
      this.app.use('/tsdoc', express.static(tsdocPath));
      this.logger.info('📚 TypeDoc documentation available at /tsdoc');
    }

    // API endpoint listing
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'Claude Code Zen API',
        version: '1.0.0-alpha.43',
        endpoints: {
          '/api/health': 'Health check',
          '/api/status': 'System status',
          '/api/swarms': 'Swarm management',
          '/api/tasks': 'Task management',
          '/api/documents': 'Document management',
          '/api/execute': 'Command execution',
          '/api/settings': 'Settings management',
        },
        documentation: {
          typescript: '/docs',
          api_swagger: '/api-docs',
        },
      });
    });

    // Setup Swagger UI
    this.setupSwaggerUI();

    // MCP HTTP endpoint (official MCP protocol)
    this.app.all('/mcp/*', (req, res) => {
      res.json({
        message: 'MCP HTTP endpoint',
        note: 'This would integrate with @modelcontextprotocol/sdk HTTP transport',
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          headers: req.headers,
        },
      });
    });

    // Legacy API docs endpoint
    this.app.get('/api-docs-legacy', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Claude Code Zen API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .endpoint { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: white; }
        .get { background: #28a745; }
        .post { background: #007bff; }
        .put { background: #ffc107; color: #000; }
        .delete { background: #dc3545; }
        .path { font-family: monospace; font-weight: bold; margin: 0 10px; }
        .description { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Claude Code Zen REST API</h1>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/health</span>
            <div class="description">System health check with status and capabilities</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/status</span>
            <div class="description">Detailed system status including swarms and agents</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/swarms</span>
            <div class="description">List all active swarms</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/swarms</span>
            <div class="description">Create new swarm with specified topology and agents</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/tasks</span>
            <div class="description">List all orchestrated tasks and their status</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/tasks</span>
            <div class="description">Create and orchestrate new task across swarm</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/execute</span>
            <div class="description">Execute command or script in coordinated environment</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/settings</span>
            <div class="description">Get current system settings and configuration</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/settings</span>
            <div class="description">Update system settings and configuration</div>
        </div>
        
        <p><strong>Note:</strong> This is a basic API documentation. For TypeScript code documentation, visit <a href="/docs">/docs</a></p>
    </div>
</body>
</html>
      `);
    });

    // Health endpoint (not prefixed)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        docs_available: existsSync(tsdocPath),
        websocket_available: true,
        mcp_integration: true,
      });
    });

    // WebSocket test page
    this.app.get('/websocket-test', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head><title>WebSocket Test</title></head>
<body>
<h1>WebSocket Connection Test</h1>
<div id="status">Connecting...</div>
<div id="messages"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
const status = document.getElementById('status');
const messages = document.getElementById('messages');

socket.on('connect', () => {
  status.innerHTML = '✅ Connected';
  messages.innerHTML += '<p>Connected to WebSocket</p>';
});

socket.on('disconnect', () => {
  status.innerHTML = '❌ Disconnected';
  messages.innerHTML += '<p>Disconnected from WebSocket</p>';
});

socket.emit('test', 'Hello from client');
</script>
</body>
</html>
      `);
    });

    // Legacy docs landing page (if needed)
    this.app.get('/docs-overview', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Claude-Zen Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .doc-section { margin: 30px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; }
        .doc-section h2 { color: #555; margin-top: 0; }
        .doc-section p { color: #666; line-height: 1.6; }
        .doc-link { display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .doc-link:hover { background: #0052a3; }
        .tsdoc { border-left: 4px solid #2196F3; }
        .api-doc { border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 Claude-Zen Documentation</h1>
        
        <div class="doc-section api-doc">
            <h2>📊 REST API Documentation</h2>
            <p>Interactive Swagger/OpenAPI documentation for all REST endpoints. Test API calls directly from your browser.</p>
            <a href="/api-docs" class="doc-link">View API Documentation</a>
        </div>
        
        <div class="doc-section tsdoc">
            <h2>📚 Code Documentation</h2>
            <p>TypeDoc generated documentation covering all TypeScript types, interfaces, classes, and functions.</p>
            <a href="/tsdocs" class="doc-link">View Code Documentation</a>
        </div>
        
        <div class="doc-section">
            <h2>🔗 Additional Resources</h2>
            <p>• <a href="/">Web Dashboard</a> - Main application interface</p>
            <p>• <a href="/health">Health Check</a> - System status endpoint</p>
            <p>• <a href="https://github.com/mikkihugo/claude-code-zen">GitHub Repository</a> - Source code and issues</p>
        </div>
    </div>
</body>
</html>
      `);
    });
  }

  /**
   * Start the HTTP server.
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, this.config.host, () => {
        const url = `http://${this.config.host === '0.0.0.0' ? 'localhost' : this.config.host}:${this.config.port}`;

        this.logger.info(`🌐 Web dashboard server running at ${url}`);

        if (!this.config.daemon) {
        }

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
   * Stop the HTTP server.
   */
  async stop(): Promise<void> {
    this.io.close();
    this.server.close();
    this.logger.info('Web dashboard server stopped');
  }

  /**
   * Setup Swagger UI for API documentation.
   */
  private setupSwaggerUI(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Claude Code Zen API',
          version: '1.0.0-alpha.43',
          description:
            'AI-driven development platform with swarm orchestration',
        },
        servers: [
          {
            url: `http://localhost:${this.config.port || 3000}`,
            description: 'Development server',
          },
        ],
        components: {
          schemas: {
            HealthResponse: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', format: 'date-time' },
                docs_available: { type: 'boolean' },
                websocket_available: { type: 'boolean' },
                mcp_integration: { type: 'boolean' },
              },
            },
          },
        },
      },
      apis: [], // No file-based API docs, using inline schemas
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    // Add manual paths to swagger spec
    swaggerSpec.paths = {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            200: {
              description: 'System health status',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
          },
        },
      },
      '/api': {
        get: {
          summary: 'API information',
          responses: {
            200: { description: 'API endpoint information' },
          },
        },
      },
      '/mcp/{path}': {
        all: {
          summary: 'MCP protocol endpoint',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'MCP protocol response' },
          },
        },
      },
    };

    // Serve Swagger UI at /api-docs
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Claude Code Zen API Documentation',
        customCss: `
        .swagger-ui .topbar { background-color: #2196F3; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
      `,
      }),
    );

    this.logger.info('📊 Swagger UI available at /api-docs');
  }

  /**
   * Get server capabilities.
   */
  static getCapabilities(): any {
    return {
      supportsRealTime: true,
      supportsWebSocket: true,
      supportsRESTAPI: true,
      supportsDaemon: true,
      supportsThemes: true,
      features: [
        'responsive-design',
        'real-time-updates',
        'rest-api',
        'websocket-updates',
        'session-management',
        'command-execution',
        'mobile-friendly',
      ],
    };
  }
}
