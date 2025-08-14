#!/usr/bin/env node
import { getLogger } from '../../config/logging-config.ts';
import { HTTPMCPServer } from './http-mcp-server.ts';
const logger = getLogger('MCP-Starter');
function parseArgs() {
    const config = {};
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--port':
            case '-p': {
                const port = Number.parseInt(args[++i], 10);
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
                const level = args[++i];
                if (!['debug', 'info', 'warn', 'error'].includes(level)) {
                    throw new Error(`Invalid log level: ${level}`);
                }
                config.logLevel = level;
                break;
            }
            case '--timeout':
            case '-t': {
                const timeout = Number.parseInt(args[++i], 10);
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
function printUsage() { }
function setupGracefulShutdown(server) {
    let shutdownInProgress = false;
    const shutdown = async (signal) => {
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
        }
        catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception:', error);
        shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled rejection at:', promise, 'reason:', reason);
        shutdown('unhandledRejection');
    });
}
function validateConfig(config) {
    if (config?.port && (config?.port < 1 || config?.port > 65535)) {
        throw new Error(`Invalid port: ${config?.port} (must be 1-65535)`);
    }
    if (config?.host && config?.host.length === 0) {
        throw new Error('Host cannot be empty');
    }
    if (config?.timeout && config?.timeout < 1000) {
        throw new Error(`Invalid timeout: ${config?.timeout}ms (minimum 1000ms)`);
    }
}
async function main() {
    try {
        const config = parseArgs();
        validateConfig(config);
        logger.info('Starting Claude-Zen SDK HTTP MCP Server...', { config });
        const centralConfig = config.get();
        const server = new HTTPMCPServer({
            port: config?.port ||
                Number.parseInt(process.env['CLAUDE_MCP_PORT'] ||
                    process.env['MCP_PORT'] ||
                    String(centralConfig?.interfaces?.mcp?.http?.port), 10),
            host: config?.host ||
                process.env['CLAUDE_MCP_HOST'] ||
                process.env['MCP_HOST'] ||
                centralConfig?.interfaces?.mcp?.http?.host,
            logLevel: config?.logLevel ||
                process.env['CLAUDE_LOG_LEVEL'] ||
                process.env['MCP_LOG_LEVEL'] ||
                centralConfig?.core?.logger?.level,
            timeout: config?.timeout ||
                Number.parseInt(process.env['CLAUDE_MCP_TIMEOUT'] ||
                    process.env['MCP_TIMEOUT'] ||
                    String(centralConfig?.interfaces?.mcp?.http?.timeout), 10),
        });
        setupGracefulShutdown(server);
        await server.start();
        const status = server.getStatus();
        logger.info('SDK server started successfully', {
            port: status.config.port,
            host: status.config.host,
            pid: process.pid,
            sdk: status.sdk,
        });
        process.stdin.resume();
    }
    catch (error) {
        logger.error('Raw startup error:', error);
        logger.error('Failed to start SDK server:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            code: error?.code,
        });
        if (error instanceof Error) {
            if (error.message.includes('EADDRINUSE')) {
                logger.error('Port is already in use. Try a different port with --port option.');
            }
            else if (error.message.includes('EACCES')) {
                logger.error('Permission denied. Try running with sudo or use a port > 1024.');
            }
        }
        process.exit(1);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        logger.error('SDK startup failed:', error);
        process.exit(1);
    });
}
export { main as startHTTPMCPServer };
//# sourceMappingURL=start-server.js.map