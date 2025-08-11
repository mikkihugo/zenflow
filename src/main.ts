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

Modes:
  web         Web interface only on port 3000 (no TUI)
  tui         Terminal interface only (no web)
  swarm       Stdio MCP swarm server only (no port, no web)
  (default)   Full system: Web + AI + TUI + HTTP MCP + Safety
  
Options:
  --port      Port for web server (default: 3000)
  --help      Show this help

Examples:
  claude-zen web                # Web interface only
  claude-zen tui                # Terminal interface only
  claude-zen                    # Full system: Web + AI + TUI + MCP + Safety
  claude-zen swarm              # Stdio swarm server only
`);
  process.exit(0);
}

// Determine mode from positional args (more reliable than mode option)  
const mode = process.argv[2] || args.mode || 'web';

async function checkIfRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  // Configure LogTape first, before any loggers are created
  await configure({
    sinks: {
      console: { type: 'console' },
    },
    loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
  });

  logger = getLogger('Main');

  // Check if another instance is already running (except for swarm mode)
  if (mode !== 'swarm') {
    const isRunning = await checkIfRunning();
    
    if (isRunning) {
      logger.info('📡 Claude-zen is already running - attaching TUI interface...');
      // Always launch TUI that connects to existing web server
      const { main } = await import('./interfaces/terminal/main.ts');
      await main();
      return;
    }
  }

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
      case 'web': {
        // Web mode: Web interface only (no TUI)
        logger.info('🚀 Starting web interface...');
        logger.info('🌐 Web interface + AI orchestration + HTTP MCP + Safety monitoring');
        
        // Start web server with full DI container
        const { WebInterface } = await import(
          './interfaces/web/web-interface.js'
        );
        const webApp = new WebInterface({
          port: Number.parseInt(args.port || '3000'),
          container,
        });

        await webApp.run();
        logger.info(
          `✅ Web interface running at http://localhost:${args.port || '3000'}`,
        );
        
        // Keep process alive
        await new Promise(() => {});
        break;
      }

      case 'tui': {
        // TUI mode: Terminal interface only (no web)
        logger.info('🖥️ Starting TUI interface...');
        const { main } = await import('./interfaces/terminal/main.js');
        await main();
        break;
      }

      case 'swarm': {
        // Swarm mode: Stdio MCP swarm server only (no web, no TUI)
        logger.info('🐝 Starting stdio MCP swarm server...');
        
        // TODO: Implement swarm stdio server
        logger.info('🐝 Swarm server mode - stdio MCP interface');
        
        // Keep process alive for stdio communication
        process.stdin.resume();
        break;
      }

      default: {
        // Default mode: Full system (Web + AI + TUI + MCP + Safety)
        logger.info('🚀 Starting full claude-zen system...');
        logger.info('🌐 Web interface + AI orchestration + HTTP MCP + Safety monitoring');
        
        // Start web server with full DI container
        const { WebInterface } = await import(
          './interfaces/web/web-interface.js'
        );
        const webApp = new WebInterface({
          port: Number.parseInt(args.port || '3000'),
          container,
        });

        await webApp.run();
        logger.info(
          `✅ Full system running - Web interface: http://localhost:${args.port || '3000'}`,
        );
        
        // Also start TUI interface
        logger.info('🖥️ Launching TUI interface...');
        const { main } = await import('./interfaces/terminal/main.js');
        await main();
        break;
      }
    }
  } catch (error) {
    logger.error('💥 Application error:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
