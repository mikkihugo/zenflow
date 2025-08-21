/**
 * @file Claude-zen-integrated implementation.
 */

import { getLogger } from '@claude-zen/foundation'
import type { ServerInstance, BaseError } from './coordination/types/interfaces';
import { hasErrorCode } from './coordination/types/type-guards';

const logger = getLogger('claude-zen-integrated');
/**
 * Claude Code Zen - Integrated Application Entry Point.
 *
 * This file provides the CLI-compatible entry point with command-line argument support.
 * And integrates with HTTP server functionality for development and production use.
 */

interface IntegratedOptions {
  port?: number;
  daemon?: boolean;
  dev?: boolean;
  verbose?: boolean;
}

/**
 * Simplified application class with CLI support (avoiding DI decorators for now).
 *
 * @example
 */
export class ClaudeZenIntegrated {
  private options: IntegratedOptions;
  private server?: ServerInstance; // HTTP server instance with proper typing
  constructor(options: IntegratedOptions = {}) {
    this.options = {
      port: 3000,
      daemon: false,
      dev: false,
      verbose: false,
      ...options,
    };
  }

  /**
   * Parse command line arguments.
   *
   * @param args
   */
  static parseArgs(args: string[]): IntegratedOptions {
    const options: IntegratedOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--port' && i + 1 < args.length) {
        const nextArg = args[i + 1];
        if (nextArg !== undefined && options) {
          options.port = Number.parseInt(nextArg, 10);
        }
        i++; // Skip next argument
      } else if (arg === '--daemon') {
        if (options) options.daemon = true;
      } else if (arg === '--dev') {
        if (options) options.dev = true;
      } else if (arg === '--verbose' || arg === '-v') {
        if (options) options.verbose = true;
      } else if (arg === '--help' || arg === '-h') {
        process.exit(0);
      }
    }

    return options;
  }

  /**
   * Initialize basic system without DI complexity.
   */
  async initialize(): Promise<void> {
    // Start HTTP server if port is specified
    if (this.options.port) {
      await this.startServer();
    }
  }

  /**
   * Start HTTP server for API access.
   */
  private async startServer(): Promise<void> {
    try {
      // Import express dynamically to avoid loading it if not needed
      const express = await import('express');
      const app = express.default();

      // Basic health check endpoint
      app.get(
        '/health',
        (_req: unknown, res: { json: (data: unknown) => void }) => {
          res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0-alpha.73',
          });
        }
      );

      // API status endpoint
      app.get(
        '/api/status',
        (_req: unknown, res: { json: (data: unknown) => void }) => {
          res.json({
            status: 'running',
            mode: this.options.dev ? 'development' : 'production',
            daemon: this.options.daemon,
            uptime: process.uptime(),
          });
        }
      );

      // Start server
      const expressServer = app.listen(this.options.port, () => {
        logger.info(`✅ HTTP server started on port ${this.options.port}`);
        logger.info(
          `🌐 Health check: http://localhost:${this.options.port}/health`
        );
      });

      // Wrap Express server with ServerInstance interface
      this.server = {
        id: `server-${Date.now()}`,
        status: 'running',
        port: this.options.port,
        host: 'localhost',
        uptime: 0,
        close: expressServer.close.bind(expressServer),
        on: expressServer.on.bind(expressServer)
      };

      expressServer.on('error', (err: BaseError) => {
        logger.error(`❌ Server error:`, err);
        if (hasErrorCode(err) && err.code === 'EADDRINUSE') {
          logger.error(`Port ${this.options.port} is already in use`);
        }
        throw err;
      });
    } catch (error) {
      logger.error('❌ Failed to start HTTP server:', error);
      throw error;
    }
  }

  /**
   * Simplified shutdown.
   */
  async shutdown(): Promise<void> {
    // Close HTTP server
    if (this.server?.close) {
      await new Promise<void>((resolve, reject) => {
        this.server!.close!((err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

/**
 * Main entry point for CLI usage.
 *
 * @example
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = ClaudeZenIntegrated.parseArgs(args);

  // Create and start application
  const app = new ClaudeZenIntegrated(options);

  // Handle graceful shutdown
  const shutdown = async () => {
    await app.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await app.initialize();

    // Keep process alive
    if (!options?.daemon) {
      // Running in foreground mode - process will stay alive naturally
      logger.info('Running in foreground mode');
    }

    // Keep the process running with health checks
    setInterval(() => {
      // Application heartbeat - could add health checks here
      logger.debug('Application heartbeat');
    }, 10000);
  } catch (error) {
    logger.error('❌ Failed to start Claude Code Zen Integrated:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    const logger = getLogger('ClaudeZenIntegrated');
    logger.error('Fatal error in main:', error);
    process.exit(1);
  });
}

// Default export removed - use named export: import { ClaudeZenIntegrated } js
