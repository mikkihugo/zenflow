#!/usr/bin/env node

/**
 * Minimal Web Server Bypass for Circular Dependency Issues
 *
 * This bypasses the circular dependency problems by creating a simple
 * Express server that doesn't import the complex DI container system.
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { BootstrapLogger } from './core/bootstrap-logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ServerOptions {
  port: number;
  host?: string;
}

class MinimalWebServer {
  private app: express.Application;
  private server: any;
  private port: number;
  private host: string;
  private logger: BootstrapLogger;

  constructor(options: ServerOptions) {
    this.port = options.port;
    this.host = options.host || 'localhost';
    this.logger = new BootstrapLogger('web-bypass');
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Enable CORS
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files (if web directory exists)
    this.app.use(express.static(join(__dirname, '../web')));
    this.app.use(express.static(join(__dirname, '../public')));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Claude Code Zen Web Server (Bypass Mode)',
        timestamp: new Date().toISOString(),
        version: '1.0.0-alpha.43',
        mode: 'bypass',
      });
    });

    // API status endpoint
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'running',
          mode: 'web-bypass',
          version: '1.0.0-alpha.43',
          features: [
            'basic-web-server',
            'health-checks',
            'static-file-serving',
            'cors-enabled',
          ],
          note: 'This is a minimal bypass server avoiding circular dependencies',
        },
      });
    });

    // Basic memory API (stub implementation)
    this.app.get('/api/memory/status', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'available',
          backend: 'bypass-mode',
          note: 'Memory system bypassed to avoid circular dependencies',
        },
      });
    });

    // Basic swarm API (stub implementation)
    this.app.get('/api/swarm/status', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'disabled',
          reason: 'Running in bypass mode',
          note: 'Full swarm features available in normal mode',
        },
      });
    });

    // Root endpoint - serve dashboard or basic info
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Claude Code Zen - Web Interface</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px; 
              margin: 0 auto; 
              padding: 2rem;
              background: #1a1a1a;
              color: #e0e0e0;
            }
            h1 { color: #00d4aa; }
            h2 { color: #00a8ff; }
            .status { 
              background: #2d3748; 
              padding: 1rem; 
              border-radius: 8px; 
              margin: 1rem 0;
              border-left: 4px solid #00d4aa;
            }
            .warning { 
              background: #744210; 
              border-left-color: #f6ad55;
            }
            .endpoint { 
              background: #1a202c; 
              padding: 0.5rem; 
              border-radius: 4px; 
              margin: 0.5rem 0;
              font-family: monospace;
            }
            a { color: #00a8ff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>🚀 Claude Code Zen - Web Interface</h1>
          
          <div class="status">
            <strong>Status:</strong> Running in Bypass Mode<br>
            <strong>Version:</strong> 1.0.0-alpha.43<br>
            <strong>Mode:</strong> Web Server (Circular Dependency Bypass)
          </div>

          <div class="status warning">
            <strong>⚠️ Notice:</strong> This server is running in bypass mode to avoid circular dependency issues. 
            Full functionality will be available once the dependency issues are resolved.
          </div>

          <h2>📡 Available Endpoints</h2>
          
          <h3>System</h3>
          <div class="endpoint"><a href="/health">GET /health</a> - Health check</div>
          <div class="endpoint"><a href="/api/status">GET /api/status</a> - API status</div>
          
          <h3>Memory (Stub)</h3>
          <div class="endpoint"><a href="/api/memory/status">GET /api/memory/status</a> - Memory system status</div>
          
          <h3>Swarm (Stub)</h3>
          <div class="endpoint"><a href="/api/swarm/status">GET /api/swarm/status</a> - Swarm system status</div>

          <h2>🔧 Development Notes</h2>
          <p>This bypass server was created to work around circular dependency issues in the main application. 
          The following systems are temporarily disabled:</p>
          <ul>
            <li>Full DI container integration</li>
            <li>Complex memory backend system</li>
            <li>Full swarm coordination</li>
            <li>Advanced neural features</li>
          </ul>

          <p>Once the circular dependencies are resolved, the full system will be available.</p>

          <hr style="margin: 2rem 0; border: none; border-top: 1px solid #4a5568;">
          <p style="text-align: center; color: #a0aec0; font-size: 0.9em;">
            Claude Code Zen v1.0.0-alpha.43 - Web Bypass Mode
          </p>
        </body>
        </html>
      `);
    });

    // Catch-all 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.path} not found`,
        availableEndpoints: [
          'GET /',
          'GET /health',
          'GET /api/status',
          'GET /api/memory/status',
          'GET /api/swarm/status',
        ],
      });
    });

    // Error handler
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        this.logger.error('Server error:', err);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while processing your request',
          timestamp: new Date().toISOString(),
        });
      }
    );
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, this.host, () => {
          this.logger.info(`🚀 Claude Code Zen Web Server (Bypass Mode)`);
          this.logger.info(`📍 Running at: http://${this.host}:${this.port}`);
          this.logger.info(
            `🏥 Health check: http://${this.host}:${this.port}/health`
          );
          this.logger.info(
            `📊 API status: http://${this.host}:${this.port}/api/status`
          );
          this.logger.warn(
            `⚠️  Note: Running in bypass mode to avoid circular dependencies`
          );
          this.logger.info(`✅ Server started successfully`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            this.logger.error(`❌ Port ${this.port} is already in use`);
            reject(new Error(`Port ${this.port} is already in use`));
          } else {
            this.logger.error('❌ Server error:', error);
            reject(error);
          }
        });
      } catch (error) {
        this.logger.error('❌ Failed to start server:', error);
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('✅ Server stopped successfully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.argv.includes('--port')
    ? Number.parseInt(process.argv[process.argv.indexOf('--port') + 1]) || 3000
    : 3000;

  const server = new MinimalWebServer({ port });

  const logger = new BootstrapLogger('web-bypass-cli');

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    logger.info('\n📦 Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('\n📦 Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // Start the server
  server.start().catch((error) => {
    logger.error('❌ Failed to start bypass server:', error);
    process.exit(1);
  });
}

export { MinimalWebServer };
export type { ServerOptions };
