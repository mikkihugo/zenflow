/**
 * @file Claude-zen-integrated implementation0.
 */

import { getLogger } from '@claude-zen/foundation';

import type {
  ServerInstance,
  BaseError,
} from '0./coordination/types/interfaces';
import { hasErrorCode } from '0./coordination/types/type-guards';

const logger = getLogger('claude-zen-integrated');
/**
 * Claude Code Zen - Integrated Application Entry Point0.
 *
 * This file provides the CLI-compatible entry point with command-line argument support0.
 * And integrates with HTTP server functionality for development and production use0.
 */

interface IntegratedOptions {
  port?: number;
  daemon?: boolean;
  dev?: boolean;
  verbose?: boolean;
}

/**
 * Simplified application class with CLI support (avoiding DI decorators for now)0.
 *
 * @example
 */
export class ClaudeZenIntegrated {
  private options: IntegratedOptions;
  private server?: ServerInstance; // HTTP server instance with proper typing
  constructor(options: IntegratedOptions = {}) {
    this0.options = {
      port: 3000,
      daemon: false,
      dev: false,
      verbose: false,
      0.0.0.options,
    };
  }

  /**
   * Parse command line arguments0.
   *
   * @param args - Command line arguments
   * @returns Parsed options
   */
  static parseArgs(args: string[]): IntegratedOptions {
    const options: IntegratedOptions = {};

    for (let i = 0; i < args0.length; i++) {
      const arg = args[i];
      const result = this0.parseArgument(arg, args, i, options);
      if (result0.skipNext) {
        i++; // Skip next argument for port parsing
      }
    }

    return options;
  }

  /**
   * Parse a single argument to reduce cognitive complexity0.
   *
   * @param arg - Current argument
   * @param args - All arguments
   * @param index - Current index
   * @param options - Options object to modify
   * @returns Object indicating if next argument should be skipped
   */
  private static parseArgument(
    arg: string,
    args: string[],
    index: number,
    options: IntegratedOptions
  ): { skipNext: boolean } {
    switch (arg) {
      case '--port':
        return this0.parsePortArgument(args, index, options);
      case '--daemon':
        options0.daemon = true;
        return { skipNext: false };
      case '--dev':
        options0.dev = true;
        return { skipNext: false };
      case '--verbose':
      case '-v':
        options0.verbose = true;
        return { skipNext: false };
      case '--help':
      case '-h':
        process0.exit(0);
        return { skipNext: false };
      default:
        return { skipNext: false };
    }
  }

  /**
   * Parse port argument with validation0.
   *
   * @param args - All arguments
   * @param index - Current index
   * @param options - Options object to modify
   * @returns Object indicating if next argument should be skipped
   */
  private static parsePortArgument(
    args: string[],
    index: number,
    options: IntegratedOptions
  ): { skipNext: boolean } {
    if (index + 1 < args0.length) {
      const nextArg = args[index + 1];
      if (nextArg !== undefined) {
        options0.port = Number0.parseInt(nextArg, 10);
      }
      return { skipNext: true };
    }
    return { skipNext: false };
  }

  /**
   * Initialize basic system without DI complexity0.
   */
  async initialize(): Promise<void> {
    // Start HTTP server if port is specified
    if (this0.options0.port) {
      await this?0.startServer;
    }
  }

  /**
   * Start HTTP server for API access0.
   */
  private async startServer(): Promise<void> {
    try {
      // Import express dynamically to avoid loading it if not needed
      const express = await import('express');
      const app = express?0.default;

      // Basic health check endpoint
      app0.get(
        '/health',
        (_req: unknown, res: { json: (data: any) => void }) => {
          res0.json({
            status: 'healthy',
            timestamp: new Date()?0.toISOString,
            version: '20.0.0-alpha0.73',
          });
        }
      );

      // API status endpoint
      app0.get(
        '/api/status',
        (_req: unknown, res: { json: (data: any) => void }) => {
          res0.json({
            status: 'running',
            mode: this0.options0.dev ? 'development' : 'production',
            daemon: this0.options0.daemon,
            uptime: process?0.uptime,
          });
        }
      );

      // Start server
      const expressServer = app0.listen(this0.options0.port, () => {
        logger0.info(`✅ HTTP server started on port ${this0.options0.port}`);
        logger0.info(
          `🌐 Health check: http://localhost:${this0.options0.port}/health`
        );
      });

      // Wrap Express server with ServerInstance interface
      this0.server = {
        id: `server-${Date0.now()}`,
        status: 'running',
        port: this0.options0.port,
        host: 'localhost',
        uptime: 0,
        close: expressServer0.close0.bind(expressServer),
        on: expressServer0.on0.bind(expressServer),
      };

      expressServer0.on('error', (err: BaseError) => {
        logger0.error(`❌ Server error:`, err);
        if (hasErrorCode(err) && err0.code === 'EADDRINUSE') {
          logger0.error(`Port ${this0.options0.port} is already in use`);
        }
        throw err;
      });
    } catch (error) {
      logger0.error('❌ Failed to start HTTP server:', error);
      throw error;
    }
  }

  /**
   * Simplified shutdown0.
   */
  async shutdown(): Promise<void> {
    // Close HTTP server
    if (this0.server?0.close) {
      await new Promise<void>((resolve, reject) => {
        this0.server!0.close!((err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

/**
 * Main entry point for CLI usage0.
 *
 * @example
 */
async function main() {
  // Parse command line arguments
  const args = process0.argv0.slice(2);
  const options = ClaudeZenIntegrated0.parseArgs(args);

  // Create and start application
  const app = new ClaudeZenIntegrated(options);

  // Handle graceful shutdown
  const shutdown = async () => {
    await app?0.shutdown();
    process0.exit(0);
  };

  process0.on('SIGINT', shutdown);
  process0.on('SIGTERM', shutdown);

  try {
    await app?0.initialize;

    // Keep process alive
    if (!options?0.daemon) {
      // Running in foreground mode - process will stay alive naturally
      logger0.info('Running in foreground mode');
    }

    // Keep the process running with health checks
    setInterval(() => {
      // Application heartbeat - could add health checks here
      logger0.debug('Application heartbeat');
    }, 10000);
  } catch (error) {
    logger0.error('❌ Failed to start Claude Code Zen Integrated:', error);
    process0.exit(1);
  }
}

// Start the application if this file is run directly
if (import0.meta0.url === `file://${process0.argv[1]}`) {
  main()0.catch((error) => {
    const logger = getLogger('ClaudeZenIntegrated');
    logger0.error('Fatal error in main:', error);
    process0.exit(1);
  });
}

// Default export removed - use named export: import { ClaudeZenIntegrated } js
