#!/usr/bin/env node
/**
 * @file Interface implementation: start-server.
 */

/**
 * Start HTTP MCP Server - Official SDK Implementation.
 *
 * Startup script for the Claude-Zen HTTP MCP server using the official MCP SDK.
 * This replaces the custom Express.js implementation while maintaining all functionality.
 */

import { getConfig } from '../config';
import { DEFAULT_CONFIG } from '../config/defaults';
import { HTTPMCPServer } from './http-mcp-server';
import { createLogger } from './mcp-logger';

const logger = createLogger('MCP-Starter');

interface StartupConfig {
  port?: number;
  host?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number;
}

/**
 * Parse command line arguments.
 *
 * @example
 */
function parseArgs(): StartupConfig {
  const config: StartupConfig = {};

  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--port':
      case '-p': {
        const port = parseInt(args[++i], 10);
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`Invalid port: ${args[i]}`);
        }
        config.port = port;
        break;
      }

      case '--host':
      case '-h':
        config.host = args[++i];
        break;

      case '--log-level':
      case '-l': {
        const level = args[++i] as StartupConfig['logLevel'];
        if (!['debug', 'info', 'warn', 'error'].includes(level!)) {
          throw new Error(`Invalid log level: ${level}`);
        }
        config.logLevel = level;
        break;
      }

      case '--timeout':
      case '-t': {
        const timeout = parseInt(args[++i], 10);
        if (Number.isNaN(timeout) || timeout < 1000) {
          throw new Error(`Invalid timeout: ${args[i]} (minimum 1000ms)`);
        }
        config.timeout = timeout;
        break;
      }

      case '--help':
        printUsage();
        process.exit(0);
        break;

      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }

  return config;
}

/**
 * Print usage information.
 *
 * @example
 */
function printUsage(): void {}

/**
 * Setup graceful shutdown.
 *
 * @param server
 * @example
 */
function setupGracefulShutdown(server: HTTPMCPServer): void {
  let shutdownInProgress = false;

  const shutdown = async (signal: string) => {
    if (shutdownInProgress) {
      logger.warn('Shutdown already in progress...');
      return;
    }

    shutdownInProgress = true;
    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      await server.stop();
      logger.info('SDK server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle various shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

/**
 * Validate startup configuration.
 *
 * @param config
 * @example
 */
function validateConfig(config: StartupConfig): void {
  // Validate port
  if (config?.port && (config?.port < 1 || config?.port > 65535)) {
    throw new Error(`Invalid port: ${config?.port} (must be 1-65535)`);
  }

  // Validate host
  if (config?.host && config?.host.length === 0) {
    throw new Error('Host cannot be empty');
  }

  // Validate timeout
  if (config?.timeout && config?.timeout < 1000) {
    throw new Error(`Invalid timeout: ${config?.timeout}ms (minimum 1000ms)`);
  }
}

/**
 * Main startup function.
 *
 * @example
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const config = parseArgs();

    // Validate configuration
    validateConfig(config);

    logger.info('Starting Claude-Zen SDK HTTP MCP Server...', { config });

    // Get centralized configuration
    const centralConfig = getConfig();

    // Create and configure server using centralized config with environment overrides
    const server = new HTTPMCPServer({
      port:
        config?.port ||
        parseInt(
          process.env['CLAUDE_MCP_PORT'] ||
            process.env['MCP_PORT'] ||
            String(centralConfig?.interfaces?.mcp?.http?.port),
          10
        ),
      host:
        config?.host ||
        process.env['CLAUDE_MCP_HOST'] ||
        process.env['MCP_HOST'] ||
        centralConfig?.interfaces?.mcp?.http?.host,
      logLevel:
        config?.logLevel ||
        process.env['CLAUDE_LOG_LEVEL'] ||
        (process.env['MCP_LOG_LEVEL'] as any) ||
        centralConfig?.core?.logger?.level,
      timeout:
        config?.timeout ||
        parseInt(
          process.env['CLAUDE_MCP_TIMEOUT'] ||
            process.env['MCP_TIMEOUT'] ||
            String(centralConfig?.interfaces?.mcp?.http?.timeout),
          10
        ),
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    // Start the server
    await server.start();

    // Log success information
    const status = server.getStatus();
    logger.info('SDK server started successfully', {
      port: status.config.port,
      host: status.config.host,
      pid: process.pid,
      sdk: status.sdk,
    });

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    logger.error('Raw startup error:', error);
    logger.error('Failed to start SDK server:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
    });

    if (error instanceof Error) {
      if (error.message.includes('EADDRINUSE')) {
        logger.error('Port is already in use. Try a different port with --port option.');
      } else if (error.message.includes('EACCES')) {
        logger.error('Permission denied. Try running with sudo or use a port > 1024.');
      }
    }

    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('SDK startup failed:', error);
    process.exit(1);
  });
}

export { main as startHTTPMCPServer };
