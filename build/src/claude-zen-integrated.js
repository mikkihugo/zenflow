/**
 * @file Claude-zen-integrated implementation.
 */
import { getLogger } from './config/logging-config.ts';
const logger = getLogger('claude-zen-integrated');
/**
 * Simplified application class with CLI support (avoiding DI decorators for now).
 *
 * @example
 */
export class ClaudeZenIntegrated {
    options;
    server; // HTTP server instance.
    constructor(options = {}) {
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
    static parseArgs(args) {
        const options = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--port' && i + 1 < args.length) {
                const nextArg = args[i + 1];
                if (nextArg !== undefined && options) {
                    options.port = parseInt(nextArg, 10);
                }
                i++; // Skip next argument
            }
            else if (arg === '--daemon') {
                if (options)
                    options.daemon = true;
            }
            else if (arg === '--dev') {
                if (options)
                    options.dev = true;
            }
            else if (arg === '--verbose' || arg === '-v') {
                if (options)
                    options.verbose = true;
            }
            else if (arg === '--help' || arg === '-h') {
                process.exit(0);
            }
        }
        return options;
    }
    /**
     * Initialize basic system without DI complexity.
     */
    async initialize() {
        // Start HTTP server if port is specified
        if (this.options.port) {
            await this.startServer();
        }
    }
    /**
     * Start HTTP server for API access.
     */
    async startServer() {
        try {
            // Import express dynamically to avoid loading it if not needed
            const express = await import('express');
            const app = express.default();
            // Basic health check endpoint
            app.get('/health', (_req, res) => {
                res.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-alpha.73',
                });
            });
            // API status endpoint
            app.get('/api/status', (_req, res) => {
                res.json({
                    status: 'running',
                    mode: this.options.dev ? 'development' : 'production',
                    daemon: this.options.daemon,
                    uptime: process.uptime(),
                });
            });
            // Start server
            this.server = app.listen(this.options.port, () => { });
        }
        catch (error) {
            logger.error('❌ Failed to start HTTP server:', error);
            throw error;
        }
    }
    /**
     * Simplified shutdown.
     */
    async shutdown() {
        // Close HTTP server
        if (this.server) {
            await new Promise((resolve, reject) => {
                this.server?.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
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
        }
        // Keep the process running
        setInterval(() => {
            // Application heartbeat - could add health checks here
        }, 10000);
    }
    catch (error) {
        logger.error('❌ Failed to start Claude Code Zen Integrated:', error);
        process.exit(1);
    }
}
// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
export default ClaudeZenIntegrated;
