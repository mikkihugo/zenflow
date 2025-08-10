#!/usr/bin/env node
/**
 * @file Unified Claude Code Zen entry point - handles all modes.
 */

import { parseArgs } from 'node:util';
import { getLogger } from './config/logging-config';

const logger = getLogger('Main');

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
        const { ClaudeZenCore } = await import('./claude-zen-core.js');
        const app = new ClaudeZenCore();
        await app.initialize();
        break;
      }

      case 'integrated':
      case 'server': {
        const { ClaudeZenIntegrated } = await import('./claude-zen-integrated.js');
        const app = new ClaudeZenIntegrated({ port: parseInt(args.port || '3000') });
        await app.initialize();
        break;
      }

      case 'tui':
      case 'terminal': {
        const TUIModule = await import(
          './interfaces/terminal/interactive-terminal-application.js'
        );
        // Handle both default and named exports
        const TUIApp = TUIModule.default || TUIModule.InteractiveTerminalApplication;
        if (typeof TUIApp === 'function') {
          await TUIApp({ flags: {}, onExit: (code) => process.exit(code) });
        } else {
          throw new Error('TUI application not found or not callable');
        }
        break;
      }

      case 'web': {
        const WebModule = await import('./interfaces/web/web-interface.js');
        const WebInterface = WebModule.WebInterface;
        const webApp = new WebInterface({ port: parseInt(args.port || '3000') });
        await webApp.run();
        break;
      }

      case 'mcp': {
        const MCPModule = await import('./interfaces/mcp/start-server.js');
        const startServer = MCPModule.startHTTPMCPServer;
        await startServer();
        break;
      }

      case 'swarm': {
        const SwarmModule = await import('./coordination/swarm/mcp/mcp-server.js');
        // Handle both default and named exports
        const SwarmServer = SwarmModule.default || SwarmModule.MCPServer;
        if (typeof SwarmServer === 'function') {
          const server = new SwarmServer();
          await server.start();
        } else {
          throw new Error('Swarm server not found or not callable');
        }
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