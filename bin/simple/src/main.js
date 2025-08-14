#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { configure } from '@logtape/logtape';
import { getLogger } from './config/logging-config.js';
import { createClaudeZenDIContainer, initializeDIServices, shutdownDIContainer, } from './core/di-container.js';
import { ProcessLifecycleManager } from './core/process-lifecycle.js';
let logger;
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
const mode = process.argv[2] || args.mode || 'web';
async function checkIfRunning() {
    try {
        const response = await fetch('http://localhost:3000/health');
        return response.ok;
    }
    catch {
        return false;
    }
}
async function main() {
    await configure({
        sinks: {
            console: { type: 'console' },
        },
        loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
    });
    logger = getLogger('Main');
    if (mode !== 'swarm') {
        const isRunning = await checkIfRunning();
        if (isRunning) {
            logger.info('📡 Claude-zen is already running - attaching TUI interface...');
            const { main } = await import('./interfaces/terminal/main.ts');
            await main();
            return;
        }
    }
    logger.info(`🚀 Starting Claude Code Zen in ${mode} mode`);
    const container = createClaudeZenDIContainer();
    await initializeDIServices(container);
    const lifecycleManager = new ProcessLifecycleManager({
        onShutdown: async () => {
            logger.info('🧹 Shutting down DI container...');
            await shutdownDIContainer(container);
        },
        onError: async (error) => {
            logger.error('💥 Application error:', error);
            await shutdownDIContainer(container);
        },
    });
    try {
        switch (mode) {
            case 'web': {
                logger.info('🚀 Starting web interface...');
                logger.info('🌐 Web interface + AI orchestration + HTTP MCP + Safety monitoring');
                const { WebInterface } = await import('./interfaces/web/web-interface.js');
                const webApp = new WebInterface({
                    port: Number.parseInt(args.port || '3000'),
                    container,
                });
                await webApp.run();
                logger.info(`✅ Web interface running at http://localhost:${args.port || '3000'}`);
                await new Promise(() => { });
                break;
            }
            case 'tui': {
                logger.info('🖥️ Starting TUI interface...');
                const { main } = await import('./interfaces/terminal/main.js');
                await main();
                break;
            }
            case 'swarm': {
                logger.info('🐝 Starting stdio MCP swarm server...');
                logger.info('🐝 Swarm server mode - stdio MCP interface');
                process.stdin.resume();
                break;
            }
            default: {
                logger.info('🚀 Starting full claude-zen system...');
                logger.info('🌐 Web interface + AI orchestration + HTTP MCP + Safety monitoring');
                const { WebInterface } = await import('./interfaces/web/web-interface.js');
                const webApp = new WebInterface({
                    port: Number.parseInt(args.port || '3000'),
                    container,
                });
                await webApp.run();
                logger.info(`✅ Full system running - Web interface: http://localhost:${args.port || '3000'}`);
                logger.info('🖥️ Launching TUI interface...');
                const { main } = await import('./interfaces/terminal/main.js');
                await main();
                break;
            }
        }
    }
    catch (error) {
        logger.error('💥 Application error:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map