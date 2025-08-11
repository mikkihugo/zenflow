#!/usr/bin/env node
/**
 * @file Unified Claude Code Zen entry point - handles all modes.
 */

import { parseArgs } from 'node:util';
import { configure } from '@logtape/logtape';
import { getLogger } from './config/logging-config.js';
import {
  createClaudeZenDIContainer,
  initializeDIServices,
  shutdownDIContainer,
} from './core/di-container.js';
import { ProcessLifecycleManager } from './core/process-lifecycle.js';
import type { DIContainer } from './di/index.js';

// Logger will be initialized after LogTape configuration
let logger: any;

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    mode: {
      type: 'string',
      default: 'web',
    },
    port: {
      type: 'string',
      default: '3000',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
  allowPositionals: true,
});

if (args.help) {
  console.log(`
Claude Code Zen - Unified AI Orchestration Platform

Usage: claude-zen [mode] [options]

Modes: (All modes include web server on port 3000 except swarm)
  web         Web interface only (default)
  core        Core service only
  integrated  Core service + web interface
  tui         Terminal user interface (experimental)
  mcp         HTTP MCP server (port 3000)
  swarm       Stdio MCP swarm server (no port)
  safety      AI safety monitoring
  
Options:
  --port      Port for web server (default: 3000)
  --help      Show this help

Examples:
  claude-zen                    # Web server on :3000 (default)
  claude-zen core               # Core + web server on :3000
  claude-zen integrated         # Integrated web mode on :3000
  claude-zen mcp                # MCP server
`);
  process.exit(0);
}

// Determine mode from positional args (more reliable than mode option)
const mode = process.argv[2] || args.mode || 'web';

async function main() {
  // Configure LogTape first, before any loggers are created
  await configure({
    sinks: {
      console: { type: 'console' },
    },
    loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
  });

  logger = getLogger('Main');
  logger.info(`🚀 Starting Claude Code Zen in ${mode} mode`);

  // Initialize DI container for all modes
  const container = createClaudeZenDIContainer();
  await initializeDIServices(container);

  // Setup process lifecycle management
  const lifecycleManager = new ProcessLifecycleManager({
    onShutdown: async () => {
      logger.info('🧹 Shutting down DI container...');
      await shutdownDIContainer(container);
    },
    onError: async (error: Error) => {
      logger.error('💥 Application error:', error);
      await shutdownDIContainer(container);
    },
  });

  try {
    switch (mode) {
      case 'core':
      case 'integrated':
      case 'server': {
        // Use WebInterface for all server modes - unified architecture
        logger.info('🌐 Starting web server with DI container integration...');
        const { WebInterface } = await import(
          './interfaces/web/web-interface.js'
        );
        const webApp = new WebInterface({
          port: Number.parseInt(args.port || '3000'),
          container,
        });

        await webApp.run();
        logger.info(
          `✅ Web server started - API/docs available at http://localhost:${args.port || '3000'}`,
        );
        break;
      }

      case 'tui':
      case 'terminal': {
        // Start web server first for TUI backend
        logger.info('🌐 Starting web backend for TUI...');
        const { WebInterface } = await import(
          './interfaces/web/web-interface.js'
        );
        const webApp = new WebInterface({
          port: Number.parseInt(args.port || '3000'),
          container,
        });

        // Start web server in background
        webApp.run().catch((err) => {
          logger.error('Web server failed to start:', err);
        });

        // Small delay to ensure web server starts
        await new Promise((resolve) => setTimeout(resolve, 1000));

        logger.info('🖥️  Starting Terminal User Interface...');

        // Try React/Ink TUI first, fallback to terminal browser
        try {
          const { launchTerminalInterface } = await import(
            './interfaces/terminal/index.ts'
          );
          if (launchTerminalInterface) {
            await launchTerminalInterface({
              mode: 'terminal',
              theme: 'dark',
              verbose: false,
              autoRefresh: true,
              refreshInterval: 3000,
            });
          } else {
            throw new Error('React TUI not available, using terminal browser');
          }
        } catch (error) {
          logger.info('React TUI unavailable, launching web mode instead...', {
            error: error.message,
          });

          // Fallback to web mode instead of terminal browser
          logger.info('📱 Starting web-only mode as TUI fallback...');
          const { WebInterface } = await import(
            './interfaces/web/web-interface.js'
          );
          const webApp = new WebInterface({
            port: Number.parseInt(args.port || '3000'),
            container,
          });

          await webApp.run();
          logger.info(
            `✅ Web server started - available at http://localhost:${args.port || '3000'}`,
          );

          // Keep process alive
          await new Promise(() => {}); // Never resolves
        }
        break;
      }

      case 'web': {
        // Use WebInterface with DI container
        logger.info('📱 Starting web-only mode with DI container...');
        const { WebInterface } = await import(
          './interfaces/web/web-interface.js'
        );
        const webApp = new WebInterface({
          port: Number.parseInt(args.port || '3000'),
          container,
        });

        await webApp.run();
        logger.info(
          `✅ Web server started - available at http://localhost:${args.port || '3000'}`,
        );

        // Keep process alive
        await new Promise(() => {}); // Never resolves
        break;
      }

      case 'mcp': {
        const MCPModule = await import('./interfaces/mcp/start-server.ts');
        const startServer = MCPModule.startHTTPMCPServer;
        await startServer();
        break;
      }

      case 'swarm': {
        // Use new stdio MCP server with shared services
        const { StdioMCPServer } = await import(
          './interfaces/mcp-stdio/swarm-server.ts'
        );
        const server = new StdioMCPServer();
        await server.start();
        break;
      }

      case 'safety': {
        const { runSafetyMode } = await import(
          './coordination/ai-safety/safety-integration.ts'
        );
        await runSafetyMode();
        break;
      }

      default:
        logger.error(`Unknown mode: ${mode}`);
        logger.info('Use --help for available modes');
        process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to start ${mode} mode:`, error);
    process.exit(1);
  }
}

// Note: Graceful shutdown is now handled by ProcessLifecycleManager
// This ensures consistent shutdown behavior across all modes

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
