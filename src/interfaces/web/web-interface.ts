/**
 * Web Interface - Browser-based Dashboard
 *
 * Modern web dashboard with WebSocket updates, RESTful API, and responsive design
 * Supports both standalone and daemon modes
 */

import express, { type Express, Request, Response } from 'express';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { createServer, type Server as HTTPServer } from 'http';
import { dirname, join } from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { createLogger } from '../../utils/logger.js';

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

interface WebSession {
  id: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  preferences: {
    theme: 'dark' | 'light';
    refreshInterval: number;
    notifications: boolean;
  };
}

export class WebInterface {
  private logger = createLogger('Web');
  private config: WebConfig;
  private app: Express;
  private server: HTTPServer;
  private io: SocketIOServer;
  private sessions = new Map<string, WebSession>();
  private pid?: number;

  constructor(config: WebConfig = {}) {
    this.config = {
      port: 3456,
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

    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Start the web interface
   */
  async run(): Promise<void> {
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
   * Start as a background daemon
   */
  private async startDaemon(): Promise<void> {
    this.logger.info('Starting web interface in daemon mode');

    // Save PID for process management
    this.pid = process.pid;
    const pidFile = '.hive-mind/claude-zen.pid';
    await mkdir(dirname(pidFile), { recursive: true });
    await writeFile(pidFile, this.pid.toString());

    // Start server
    await this.startServer();

    // Keep process alive
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  /**
   * Start the HTTP server
   */
  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, this.config.host, () => {
        const url = `http://${this.config.host === '0.0.0.0' ? 'localhost' : this.config.host}:${this.config.port}`;

        this.logger.info(`🌐 Web interface running at ${url}`);

        if (!this.config.daemon) {
          console.log(`\n🚀 Claude Code Zen Web Dashboard`);
          console.log(`   Access at: ${url}`);
          console.log(`   Press Ctrl+C to stop\n`);
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
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS
    if (this.config.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization'
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

    // Session management
    this.app.use((req, res, next) => {
      const sessionId = (req.headers['x-session-id'] as string) || this.generateSessionId();
      req.sessionId = sessionId;

      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          id: sessionId,
          createdAt: new Date(),
          lastActivity: new Date(),
          preferences: {
            theme: this.config.theme!,
            refreshInterval: 5000,
            notifications: true,
          },
        });
      } else {
        const session = this.sessions.get(sessionId)!;
        session.lastActivity = new Date();
      }

      next();
    });

    // Static files (serve React build)
    if (existsSync(this.config.staticDir!)) {
      this.app.use(express.static(this.config.staticDir!));
    } else {
      // Serve inline HTML if no build exists
      this.app.get('/', (req, res) => {
        res.send(this.generateInlineHTML());
      });
    }
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    const api = this.config.apiPrefix!;

    // Health check
    this.app.get(`${api}/health`, (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0-alpha.73',
        uptime: process.uptime(),
      });
    });

    // System status
    this.app.get(`${api}/status`, async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get system status' });
      }
    });

    // Swarm management
    this.app.get(`${api}/swarms`, async (req, res) => {
      try {
        const swarms = await this.getSwarms();
        res.json(swarms);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get swarms' });
      }
    });

    this.app.post(`${api}/swarms`, async (req, res) => {
      try {
        const swarm = await this.createSwarm(req.body);
        this.broadcast('swarm:created', swarm);
        res.json(swarm);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create swarm' });
      }
    });

    // Task management
    this.app.get(`${api}/tasks`, async (req, res) => {
      try {
        const tasks = await this.getTasks();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get tasks' });
      }
    });

    this.app.post(`${api}/tasks`, async (req, res) => {
      try {
        const task = await this.createTask(req.body);
        this.broadcast('task:created', task);
        res.json(task);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
      }
    });

    // Document management
    this.app.get(`${api}/documents`, async (req, res) => {
      try {
        const documents = await this.getDocuments();
        res.json(documents);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get documents' });
      }
    });

    // Command execution
    this.app.post(`${api}/execute`, async (req, res) => {
      try {
        const { command, args } = req.body;
        const result = await this.executeCommand(command, args);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Command execution failed' });
      }
    });

    // Settings management
    this.app.get(`${api}/settings`, (req, res) => {
      const session = this.sessions.get(req.sessionId!);
      res.json({
        session: session?.preferences,
        system: {
          theme: this.config.theme,
          realTime: this.config.realTime,
        },
      });
    });

    this.app.post(`${api}/settings`, (req, res) => {
      const session = this.sessions.get(req.sessionId!);
      if (session) {
        session.preferences = { ...session.preferences, ...req.body };
        this.broadcast('settings:updated', session.preferences);
      }
      res.json({ success: true });
    });

    // Catch all for SPA
    this.app.get('*', (req, res) => {
      if (existsSync(join(this.config.staticDir!, 'index.html'))) {
        res.sendFile(join(this.config.staticDir!, 'index.html'));
      } else {
        res.send(this.generateInlineHTML());
      }
    });
  }

  /**
   * Setup WebSocket for real-time updates
   */
  private setupWebSocket(): void {
    if (!this.config.realTime) return;

    this.io.on('connection', (socket) => {
      this.logger.debug(`Client connected: ${socket.id}`);

      // Send initial data
      socket.emit('connected', {
        sessionId: socket.handshake.headers['x-session-id'] || socket.id,
        timestamp: new Date().toISOString(),
      });

      // Handle client events
      socket.on('subscribe', (channel: string) => {
        socket.join(channel);
        this.logger.debug(`Client ${socket.id} subscribed to ${channel}`);
      });

      socket.on('unsubscribe', (channel: string) => {
        socket.leave(channel);
        this.logger.debug(`Client ${socket.id} unsubscribed from ${channel}`);
      });

      socket.on('disconnect', () => {
        this.logger.debug(`Client disconnected: ${socket.id}`);
      });
    });

    // Start real-time data updates
    this.startDataBroadcast();
  }

  /**
   * Start broadcasting real-time data updates
   */
  private startDataBroadcast(): void {
    // System status updates every 5 seconds
    setInterval(async () => {
      try {
        const status = await this.getSystemStatus();
        this.broadcast('system:status', status);
      } catch (error) {
        this.logger.error('Failed to broadcast system status:', error);
      }
    }, 5000);

    // Task updates every 3 seconds
    setInterval(async () => {
      try {
        const tasks = await this.getTasks();
        this.broadcast('tasks:update', tasks);
      } catch (error) {
        this.logger.error('Failed to broadcast tasks:', error);
      }
    }, 3000);
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(event: string, data: any): void {
    if (this.config.realTime) {
      this.io.emit(event, {
        event,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Data service methods (mock implementations)
   */
  private async getSystemStatus(): Promise<any> {
    return {
      system: 'healthy',
      version: '2.0.0-alpha.73',
      swarms: { active: 2, total: 5 },
      tasks: { pending: 3, active: 1, completed: 12 },
      resources: {
        cpu: Math.floor(Math.random() * 100) + '%',
        memory: Math.floor(Math.random() * 100) + '%',
        disk: '23%',
      },
      uptime: Math.floor(process.uptime() / 60) + 'm',
    };
  }

  private async getSwarms(): Promise<any[]> {
    return [
      {
        id: 'swarm-1',
        name: 'Document Processing',
        status: 'active',
        agents: 4,
        tasks: 8,
        progress: Math.floor(Math.random() * 100),
      },
      {
        id: 'swarm-2',
        name: 'Feature Development',
        status: 'active',
        agents: 6,
        tasks: 12,
        progress: Math.floor(Math.random() * 100),
      },
    ];
  }

  private async getTasks(): Promise<any[]> {
    return [
      {
        id: 'task-1',
        title: 'Process PRD: User Authentication',
        status: 'active',
        assignedAgents: ['agent-1', 'agent-2'],
        progress: Math.floor(Math.random() * 100),
        eta: '15m',
      },
      {
        id: 'task-2',
        title: 'Generate ADR: Database Architecture',
        status: 'pending',
        assignedAgents: [],
        progress: 0,
        eta: '30m',
      },
    ];
  }

  private async getDocuments(): Promise<any[]> {
    return [
      {
        id: 'doc-1',
        type: 'prd',
        title: 'User Authentication System',
        status: 'active',
        lastModified: new Date().toISOString(),
      },
      {
        id: 'doc-2',
        type: 'adr',
        title: 'Database Architecture Decision',
        status: 'draft',
        lastModified: new Date().toISOString(),
      },
    ];
  }

  private async createSwarm(config: any): Promise<any> {
    const swarm = {
      id: `swarm-${Date.now()}`,
      name: config.name || 'New Swarm',
      status: 'initializing',
      agents: config.agents || 4,
      tasks: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.logger.info(`Created swarm: ${swarm.name}`);
    return swarm;
  }

  private async createTask(config: any): Promise<any> {
    const task = {
      id: `task-${Date.now()}`,
      title: config.title || 'New Task',
      status: 'pending',
      assignedAgents: [],
      progress: 0,
      eta: config.eta || '30m',
      createdAt: new Date().toISOString(),
    };

    this.logger.info(`Created task: ${task.title}`);
    return task;
  }

  private async executeCommand(command: string, args: any[]): Promise<any> {
    this.logger.info(`Executing command: ${command}`);

    // Mock command execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      command,
      args,
      output: `Command '${command}' executed successfully`,
      exitCode: 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate inline HTML when no build is available
   */
  private generateInlineHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Web Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${this.config.theme === 'light' ? '#ffffff' : '#0d1117'};
            color: ${this.config.theme === 'light' ? '#24292f' : '#f0f6fc'};
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #58a6ff; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: ${this.config.theme === 'light' ? '#f6f8fa' : '#21262d'}; 
            border-radius: 8px; 
            padding: 20px; 
            border: 1px solid ${this.config.theme === 'light' ? '#d0d7de' : '#30363d'};
        }
        .card h2 { color: #58a6ff; margin-bottom: 15px; }
        .status { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-healthy { background: #238636; }
        .status-active { background: #58a6ff; }
        .footer { text-align: center; margin-top: 40px; color: #7d8590; }
        .api-links { margin-top: 20px; }
        .api-links a { color: #58a6ff; text-decoration: none; }
        .api-links a:hover { text-decoration: underline; }
    </style>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Claude Code Zen</h1>
            <p>AI-Powered Development Toolkit - Web Dashboard</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>📊 System Status</h2>
                <div id="system-status">
                    <div class="status">
                        <span class="status-dot status-healthy"></span>
                        <span>System: Healthy</span>
                    </div>
                    <div class="status">
                        <span class="status-dot status-active"></span>
                        <span>Version: 2.0.0-alpha.73</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>🐝 Active Swarms</h2>
                <div id="swarms-status">
                    <div class="status">
                        <span class="status-dot status-active"></span>
                        <span>Document Processing (4 agents)</span>
                    </div>
                    <div class="status">
                        <span class="status-dot status-active"></span>
                        <span>Feature Development (6 agents)</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>✅ Recent Tasks</h2>
                <div id="tasks-status">
                    <div class="status">
                        <span class="status-dot status-active"></span>
                        <span>Process PRD: User Auth (75%)</span>
                    </div>
                    <div class="status">
                        <span class="status-dot status-healthy"></span>
                        <span>Generate ADR: Database (Pending)</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>🔗 API Endpoints</h2>
                <div class="api-links">
                    <p><a href="${this.config.apiPrefix}/health">Health Check</a></p>
                    <p><a href="${this.config.apiPrefix}/status">System Status</a></p>
                    <p><a href="${this.config.apiPrefix}/swarms">Swarms API</a></p>
                    <p><a href="${this.config.apiPrefix}/tasks">Tasks API</a></p>
                    <p><a href="${this.config.apiPrefix}/documents">Documents API</a></p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Real-time updates ${this.config.realTime ? 'enabled' : 'disabled'} via WebSocket</p>
            <p>Running on port ${this.config.port}</p>
        </div>
    </div>
    
    <script>
        ${
          this.config.realTime
            ? `
        const socket = io();
        
        socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        socket.on('system:status', (data) => {
            console.log('System status update:', data);
            // Update UI with real-time data
        });
        
        socket.on('tasks:update', (data) => {
            console.log('Tasks update:', data);
            // Update tasks display
        });
        `
            : ''
        }
        
        // Auto-refresh page data every 5 seconds if WebSocket is disabled
        ${
          !this.config.realTime
            ? `
        setInterval(() => {
            fetch('${this.config.apiPrefix}/status')
                .then(r => r.json())
                .then(data => console.log('Status:', data));
        }, 5000);
        `
            : ''
        }
    </script>
</body>
</html>`;
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info('Shutting down web interface...');

    this.io.close();
    this.server.close();

    // Cleanup PID file
    if (this.pid) {
      try {
        await writeFile('.hive-mind/claude-zen.pid', '');
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    process.exit(0);
  }

  /**
   * Get web interface capabilities
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

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}
