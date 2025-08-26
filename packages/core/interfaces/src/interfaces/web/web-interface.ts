/**
 * @fileoverview Web Interface Implementation
 *
 * Implementation of web-based interface using Express.js or similar framework.
 * Provides REST API and web dashboard for Claude Code Zen system management.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { WebConfig } from './web-config';

export interface WebInterface {
  initialize(config: WebConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): {
    running: boolean;
    port: number;
    uptime: number;
    connections: number;
  };
  registerRoute(method: string, path: string, handler: Function): void;
  registerMiddleware(middleware: Function): void;
}

export class ExpressWebInterface
  extends TypedEventBase
  implements WebInterface
{
  private config: WebConfig;
  private app: any = null;

  async initialize(config: WebConfig): Promise<void> {
    this.config = config;

    try {
      // Dynamic import to avoid compile-time dependency
      const express = await this.loadExpress();
      this.app = express();

      // Configure middleware
      if (this.config.enableCors) {
        const cors = await this.loadCors();
        this.app.use(
          cors({
            origin: this.config.corsOrigins || ['*'],
          })
        );
      }

      if (this.config.enableCompression) {
        const compression = await this.loadCompression();
        this.app.use(compression())();
      }

      // JSON parsing
      this.app.use(
        express.json({ limit: this.config.maxRequestSize || '10mb'})'
      );
      this.app.use(
        express.urlencoded({
          extended: true,
          limit: this.config.maxRequestSize || '10mb',
        })
      );

      // Static files
      if (this.config.publicDir) {
        this.app.use(express.static(this.config.publicDir));
      }

      // Default routes
      this.setupDefaultRoutes();

      this.emit('initialized', {});'
    } catch (error) {
      console.error('Failed to initialize web interface:', error);'
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.app) {
      throw new Error('Web interface not initialized');'
    }

    return new Promise((_resolve, _reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        this.startTime = Date.now();
        console.log(
          `Web interface listening on http://${this.config.host}:${this.config.port}``
        );
        this.emit('started', {});'
        resolve();
      });

      this.server.on('error', (error: any) => {'
        console.error('Web server error:', error);'
        this.emit('error', error);'
        reject(error);
      });

      this.server.on('connection', () => {'
        this.connections++;
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server.close((error: any) => {
        if (error) {
          this.emit('error', error);'
          reject(error);
        } else {
          this.server = null;
          this.emit('stopped', {});'
          resolve();
        }
      });
    });
  }

  getStatus() {
    return {
      running: this.server !== null,
      port: this.config?.port || 0,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      connections: this.connections,
    };
  }

  registerRoute(method: string, path: string, handler: Function): void {
    if (!this.app) {
      throw new Error('Web interface not initialized');'
    }

    const normalizedMethod = method.toLowerCase();
    if (typeof this.app[normalizedMethod] === 'function') {'
      this.app[normalizedMethod](path, handler);
    } else {
      throw new Error(`HTTP method ${method} not supported`);`
    }
  }

  registerMiddleware(middleware: Function): void {
    if (!this.app) {
      throw new Error('Web interface not initialized');'
    }
    this.app.use(middleware);
  }

  private setupDefaultRoutes(): void {
    // Health check endpoint
    this.registerRoute('GET', '/health', (_req: any, _res: any) => {'
      res.json(
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: this.getStatus().uptime,
        version: '1.0.0',);
    });

    // Status endpoint
    this.registerRoute('GET', '/status', (_req: any, _res: any) => {'
      res.json(this.getStatus())();
    });
  }

  private async loadExpress() {
    try {
      return await import('express');'
    } catch (_error) {
      // Fallback for when express is not available
      return {
        default: () => ({
          use: () => {},
          listen: (port: number, host: string, _callback: Function) => {
            console.log(`Fallback server listening on http://${host}:${port}`);`
            callback();
            return {
              on: () => {},
              close: (cb: Function) => cb(),
            };
          },
          get: () => {},
          post: () => {},
          put: () => {},
          delete: () => {},
          static: () => () => {},
          json: () => () => {},
          urlencoded: () => () => {},
        }),
      };
    }
  }

  private async loadCors() {
    try {
      const corsModule = await import('cors');'
      return corsModule.default || corsModule;
    } catch (error) {
      return () => (_req: any, _res: any, next: Function) => next();
    }
  }

  private async loadCompression() {
    try {
      const compressionModule = await import('compression');'
      return compressionModule.default || compressionModule;
    } catch (error) {
      return () => (_req: any, _res: any, next: Function) => next();
    }
  }
}

export function createWebInterface(): WebInterface {
  return new ExpressWebInterface();
}
