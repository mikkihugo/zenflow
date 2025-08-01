#!/usr/bin/env node

/**
 * Start HTTP MCP Server
 *
 * Startup script for the Claude-Zen HTTP MCP server.
 * This is the main entry point for the port 3000 MCP server.
 */

import { HTTPMCPServer } from './http-mcp-server.js';
import { createLogger } from './simple-logger.js';

const logger = createLogger('MCP-Starter');

interface StartupConfig {
  port?: number;
  host?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number;
}

/**
 * Parse command line arguments
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
        if (isNaN(port) || port < 1 || port > 65535) {
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
        if (isNaN(timeout) || timeout < 1000) {
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
 * Print usage information
 */
function printUsage(): void {
  console.log(`
Claude-Zen HTTP MCP Server

Usage: npx tsx src/interfaces/mcp/start-server.ts [options]

Options:
  -p, --port <number>     Server port (default: 3000)
  -h, --host <string>     Server host (default: localhost)  
  -l, --log-level <level> Log level: debug, info, warn, error (default: info)
  -t, --timeout <ms>      Request timeout in milliseconds (default: 30000)
  --help                  Show this help message

Environment Variables:
  MCP_PORT               Server port
  MCP_HOST               Server host
  MCP_LOG_LEVEL          Log level
  MCP_TIMEOUT            Request timeout

Examples:
  npx tsx src/interfaces/mcp/start-server.ts
  npx tsx src/interfaces/mcp/start-server.ts --port 3001 --host 0.0.0.0
  MCP_PORT=3000 npx tsx src/interfaces/mcp/start-server.ts
`);
}

/**
 * Setup graceful shutdown
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
      logger.info('Server shutdown complete');
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
 * Validate startup configuration
 */
function validateConfig(config: StartupConfig): void {
  // Validate port
  if (config.port && (config.port < 1 || config.port > 65535)) {
    throw new Error(`Invalid port: ${config.port} (must be 1-65535)`);
  }

  // Validate host
  if (config.host && config.host.length === 0) {
    throw new Error('Host cannot be empty');
  }

  // Validate timeout
  if (config.timeout && config.timeout < 1000) {
    throw new Error(`Invalid timeout: ${config.timeout}ms (minimum 1000ms)`);
  }
}

/**
 * Main startup function
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const config = parseArgs();

    // Validate configuration
    validateConfig(config);

    logger.info('Starting Claude-Zen HTTP MCP Server...', { config });

    // Create and configure server
    const server = new HTTPMCPServer({
      port: config.port || parseInt(process.env.MCP_PORT || '3000', 10),
      host: config.host || process.env.MCP_HOST || 'localhost',
      logLevel: config.logLevel || (process.env.MCP_LOG_LEVEL as any) || 'info',
      timeout: config.timeout || parseInt(process.env.MCP_TIMEOUT || '30000', 10),
      cors: true,
      maxRequestSize: '10mb',
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    // Start the server
    await server.start();

    // Log success information
    const status = server.getStatus();
    logger.info('Server started successfully', {
      port: status.config.port,
      host: status.config.host,
      tools: status.tools,
      pid: process.pid,
    });

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error('Raw startup error:', error);
    logger.error('Failed to start server:', {
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
    console.error('Startup failed:', error);
    process.exit(1);
  });
}

export { main as startHTTPMCPServer };
