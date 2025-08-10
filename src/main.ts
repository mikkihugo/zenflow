#!/usr/bin/env node
/**
 * @file Unified Claude Code Zen entry point - handles all modes.
 */

import { parseArgs } from 'node:util';
import { createLogger } from './core/logger';

const logger = createLogger('Main');

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    mode: {
      type: 'string',
      default: 'core',
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
  core        Start core service (default)
  integrated  Start with web server
  tui         Terminal user interface  
  web         Web interface only
  mcp         MCP server mode
  swarm       MCP swarm server
  safety      AI safety monitoring
  
Options:
  --port      Port for web server (default: 3000)
  --help      Show this help

Examples:
  claude-zen                    # Core mode
  claude-zen integrated         # Web server mode
  claude-zen tui                # Terminal interface
  claude-zen mcp                # MCP server
`);
  process.exit(0);
}

// Determine mode from args or positional
const mode = args.mode || process.argv[2] || 'core';

async function main() {
  logger.info(`🚀 Starting Claude Code Zen in ${mode} mode`);

  try {
    switch (mode) {
      case 'core': {
        const { default: CoreApp } = await import('./claude-zen-core.js');
        await CoreApp();
        break;
      }

      case 'integrated':
      case 'server': {
        const { default: IntegratedApp } = await import('./claude-zen-integrated.js');
        await IntegratedApp({ port: parseInt(args.port || '3000') });
        break;
      }

      case 'tui':
      case 'terminal': {
        const { default: TUIApp } = await import(
          './interfaces/terminal/InteractiveTerminalApplication.js'
        );
        await TUIApp();
        break;
      }

      case 'web': {
        const { default: WebApp } = await import('./interfaces/web/web-interface.js');
        await WebApp({ port: parseInt(args.port || '3000') });
        break;
      }

      case 'mcp': {
        const { default: MCPServer } = await import('./interfaces/mcp/start-server.js');
        await MCPServer();
        break;
      }

      case 'swarm': {
        const { default: SwarmServer } = await import('./coordination/mcp/claude-zen-server.js');
        await SwarmServer();
        break;
      }

      case 'safety': {
        const { runSafetyMode } = await import('./coordination/ai-safety/safety-integration.js');
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

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('👋 Shutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
