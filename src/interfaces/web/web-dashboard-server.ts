/**
 * Web Dashboard Server - Express.js HTTP server setup
 *
 * Handles Express server initialization, middleware, and core HTTP functionality.
 * Separated from business logic for better maintainability.
 */

import { existsSync } from 'node:fs';
import { createServer, type Server as HTTPServer } from 'node:http';
import express, { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createLogger } from '../../utils/logger';
import type { WebConfig } from './web-config';

export class WebDashboardServer {
  private logger = createLogger('WebServer');
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
   * Get Express app instance
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Get HTTP server instance
   */
  getServer(): HTTPServer {
    return this.server;
  }

  /**
   * Get Socket.IO instance
   */
  getSocketIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware(): void {
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

    // Static files (serve React build)
    if (existsSync(this.config.staticDir!)) {
      this.app.use(express.static(this.config.staticDir!));
    }
  }

  /**
   * Start the HTTP server
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
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    this.io.close();
    this.server.close();
    this.logger.info('Web dashboard server stopped');
  }

  /**
   * Get server capabilities
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
