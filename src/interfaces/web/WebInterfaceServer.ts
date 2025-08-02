/**
 * Web Interface Server - Main web dashboard server
 *
 * Refactored Google-standard web interface that coordinates between
 * focused modules for WebSocket, API routes, and daemon management.
 */

import express, { type Express } from 'express';
import { existsSync } from 'fs';
import { createServer, type Server as HTTPServer } from 'http';
import { dirname, join } from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { createLogger } from '../../utils/logger.js';
import { ApiRouteHandler } from './ApiRouteHandler.js';
import { DaemonProcessManager } from './DaemonProcessManager.js';
import { WebSocketCoordinator } from './WebSocketCoordinator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface WebConfig {
  port?: number;
  host?: string;
  daemon?: boolean;
  staticDir?: string;
  apiPrefix?: string;
  cors?: boolean;
  auth?: {
    enabled: boolean;
    secret?: string;
  };
  theme?: 'dark' | 'light';
  realTime?: boolean;
}

/**
 * Main web interface server coordinating all web functionality
 */
export class WebInterfaceServer {
  private logger = createLogger('WebServer');
  private config: Required<WebConfig>;
  private app: Express;
  private server: HTTPServer;
  private io: SocketIOServer;
  private webSocketCoordinator: WebSocketCoordinator;
  private apiRouteHandler: ApiRouteHandler;
  private daemonManager: DaemonProcessManager;

  constructor(config: WebConfig = {}) {
    this.config = {
      port: 3000, // Changed from 3456 to 3000 as per requirement
      host: '0.0.0.0',
      daemon: false,
      staticDir: join(__dirname, '../../../web/dist'),
      apiPrefix: '/api',
      cors: true,
      auth: { enabled: false },
      theme: 'dark',
      realTime: true,
      ...config,
    };

    this.initializeServer();
  }

  /**
   * Initialize server components
   */
  private initializeServer(): void {
    // Create Express app and HTTP server
    this.app = express();
    this.server = createServer(this.app);

    // Create Socket.IO server
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Initialize coordinators
    this.webSocketCoordinator = new WebSocketCoordinator(this.io, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      realTime: this.config.realTime,
    });

    this.apiRouteHandler = new ApiRouteHandler(this.app, this.webSocketCoordinator, {
      prefix: this.config.apiPrefix,
      enableCors: this.config.cors,
    });

    this.daemonManager = new DaemonProcessManager({
      pidFile: join(process.cwd(), '.claude-zen-web.pid'),
      logFile: join(process.cwd(), '.claude-zen-web.log'),
      errorFile: join(process.cwd(), '.claude-zen-web.error'),
    });

    this.setupMiddleware();
    this.setupStaticRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS middleware
    if (this.config.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-Id'
        );

        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // JSON middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session middleware (basic)
    this.app.use((req, res, next) => {
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId) {
        (req as any).sessionId = sessionId;
      }
      next();
    });

    this.logger.debug('Middleware configured');
  }

  /**
   * Setup static file serving
   */
  private setupStaticRoutes(): void {
    // Serve static files if build directory exists
    if (existsSync(this.config.staticDir)) {
      this.logger.info(`Serving static files from: ${this.config.staticDir}`);
      this.app.use(express.static(this.config.staticDir));
    } else {
      // Serve inline HTML if no build exists
      this.app.get('/', (req, res) => {
        res.send(this.generateInlineHTML());
      });
      this.logger.warn('No static build found, serving inline HTML');
    }

    // Unified port structure - different endpoints on port 3000
    this.app.get('/web', (req, res) => {
      if (existsSync(this.config.staticDir)) {
        res.sendFile('index.html', { root: this.config.staticDir });
      } else {
        res.send(this.generateInlineHTML());
      }
    });

    this.app.get('/mcp', (req, res) => {
      res.json({
        protocol: 'http',
        version: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: true,
          },
          resources: {
            subscribe: true,
            listChanged: true,
          },
        },
        serverInfo: {
          name: 'claude-code-flow-mcp-server',
          version: '2.0.0-alpha.73',
        },
        endpoints: {
          health: '/api/health',
          tools: '/api/tools',
          status: '/api/status',
        },
      });
    });
  }

  /**
   * Start the web interface server
   */
  async start(): Promise<void> {
    try {
      if (this.config.daemon) {
        await this.startDaemon();
      } else {
        await this.startServer();
      }
    } catch (error) {
      this.logger.error('Failed to start web interface:', error);
      throw error;
    }
  }

  /**
   * Start server in normal mode
   */
  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, this.config.host, () => {
        const address = `http://${this.config.host}:${this.config.port}`;

        this.logger.info(`🌐 Web Interface started`);
        this.logger.info(`📊 Dashboard: ${address}`);
        this.logger.info(`🔗 API: ${address}${this.config.apiPrefix}`);
        this.logger.info(
          `⚡ WebSocket: Real-time updates ${this.config.realTime ? 'enabled' : 'disabled'}`
        );

        console.log(`
      🌐 Claude Flow Unified Interface Server`);
        console.log(`=========================================`);
        console.log(`🚀 Base URL: ${address}`);
        console.log(`📊 Web Dashboard: ${address}/web`);
        console.log(`🔗 API Endpoints: ${address}${this.config.apiPrefix}/*`);
        console.log(`📡 MCP Protocol: ${address}/mcp`);
        console.log(`⚡ WebSocket: ${this.config.realTime ? 'Enabled' : 'Disabled'}`);
        console.log(`🎨 Theme: ${this.config.theme}`);
        console.log(`
      ✅ Unified server ready - All interfaces on port ${this.config.port}`);
        console.log(`Press Ctrl+C to stop\n`);

        resolve();
      });

      this.server.on('error', (error) => {
        this.logger.error('Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Start server in daemon mode
   */
  private async startDaemon(): Promise<void> {
    const processInfo = await this.daemonManager.startDaemon(process.execPath, [
      process.argv[1],
      ...process.argv.slice(2).filter((arg) => arg !== '--daemon'),
    ]);

    console.log(`🚀 Unified Interface daemon started`);
    console.log(`📊 PID: ${processInfo.pid}`);
    console.log(`🌐 Base URL: http://${this.config.host}:${this.config.port}`);
    console.log(`📊 Dashboard: http://${this.config.host}:${this.config.port}/web`);
    console.log(`🔗 API: http://${this.config.host}:${this.config.port}/api`);
    console.log(`📁 Logs: Run 'claude-zen web logs' to view logs`);
    console.log(`⏹️  Stop: Run 'claude-zen web stop' to stop daemon`);
  }

  /**
   * Stop the web interface server
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping web interface...');

    if (this.config.daemon) {
      await this.daemonManager.stopDaemon();
    } else {
      this.server.close();
      this.io.close();
    }

    this.logger.info('Web interface stopped');
  }

  /**
   * Get server status
   */
  async getStatus(): Promise<{
    running: boolean;
    mode: 'daemon' | 'server';
    port: number;
    uptime?: number;
    connections?: number;
    daemon?: any;
  }> {
    const baseStatus = {
      running: this.server.listening,
      mode: this.config.daemon ? ('daemon' as const) : ('server' as const),
      port: this.config.port,
    };

    if (this.config.daemon) {
      const daemonStatus = await this.daemonManager.getDaemonStatus();
      return {
        ...baseStatus,
        daemon: daemonStatus,
      };
    }

    const stats = this.webSocketCoordinator.getStats();
    return {
      ...baseStatus,
      uptime: process.uptime() * 1000,
      connections: stats.totalSessions,
    };
  }

  /**
   * Generate inline HTML for development
   */
  private generateInlineHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Flow Web Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Seguro UI', Arial, sans-serif;
            background: #1a1a1a; color: #ffffff; padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title { font-size: 2.5rem; margin-bottom: 1rem; color: #4FC3F7; }
        .subtitle { font-size: 1.2rem; color: #B0BEC5; }
        .card { background: #2d2d2d; border-radius: 8px; padding: 2rem; margin-bottom: 2rem; }
        .status { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .status-dot { width: 12px; height: 12px; border-radius: 50%; background: #4CAF50; }
        .endpoints { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .endpoint { background: #3d3d3d; padding: 1.5rem; border-radius: 6px; }
        .endpoint h3 { color: #4FC3F7; margin-bottom: 0.5rem; }
        .endpoint code { background: #4d4d4d; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.9rem; }
        .footer { text-align: center; margin-top: 3rem; color: #666; }
        a { color: #4FC3F7; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🌐 Claude Flow Web Dashboard</h1>
            <p class="subtitle">Advanced AI-driven development coordination platform</p>
        </div>

        <div class="card">
            <div class="status">
                <div class="status-dot"></div>
                <h2>System Status: Operational</h2>
            </div>
            <p>Web interface is running and ready for connections.</p>
            <p><strong>Port:</strong> ${this.config.port} | <strong>Mode:</strong> ${this.config.daemon ? 'Daemon' : 'Server'} | <strong>Version:</strong> 2.0.0-alpha.73</p>
        </div>

        <div class="card">
            <h2 style="margin-bottom: 1.5rem;">🔗 Available Endpoints</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <h3>📊 System Status</h3>
                    <p>Get comprehensive system health and metrics</p>
                    <code>GET ${this.config.apiPrefix}/status</code>
                </div>
                <div class="endpoint">
                    <h3>🐝 Swarm Management</h3>
                    <p>Create and manage AI agent swarms</p>
                    <code>GET/POST ${this.config.apiPrefix}/swarms</code>
                </div>
                <div class="endpoint">
                    <h3>📋 Task Operations</h3>
                    <p>Coordinate and monitor tasks</p>
                    <code>GET/POST ${this.config.apiPrefix}/tasks</code>
                </div>
                <div class="endpoint">
                    <h3>📚 Document Management</h3>
                    <p>Document-driven development workflow</p>
                    <code>GET ${this.config.apiPrefix}/documents</code>
                </div>
                <div class="endpoint">
                    <h3>⚡ Command Execution</h3>
                    <p>Execute commands via web API</p>
                    <code>POST ${this.config.apiPrefix}/execute</code>
                </div>
                <div class="endpoint">
                    <h3>⚙️ Settings</h3>
                    <p>Manage user preferences and configuration</p>
                    <code>GET/POST ${this.config.apiPrefix}/settings</code>
                </div>
            </div>
        </div>

        <div class="card">
            <h2 style="margin-bottom: 1rem;">⚡ Real-time Features</h2>
            <p>WebSocket connection established for live updates:</p>
            <ul style="margin-left: 2rem; margin-top: 1rem;">
                <li>System status monitoring</li>
                <li>Task progress tracking</li>
                <li>Swarm activity notifications</li>
                <li>Performance metrics streaming</li>
            </ul>
        </div>

        <div class="footer">
            <p>🚀 <a href="https://github.com/ruvnet/claude-code-flow">Claude Code Flow</a> | 
               📖 <a href="${this.config.apiPrefix}/health">API Health</a> | 
               🔧 Built with ❤️ for AI-driven development</p>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        socket.on('connect', () => console.log('✅ WebSocket connected'));
        socket.on('statusUpdate', (data) => console.log('📊 Status update:', data));
        socket.on('swarm:created', (data) => console.log('🐝 Swarm created:', data));
        socket.on('task:created', (data) => console.log('📋 Task created:', data));
    </script>
</body>
</html>`;
  }
}

export default WebInterfaceServer;
