import { getLogger } from './config/logging-config.js';
const logger = getLogger('claude-zen-integrated');
export class ClaudeZenIntegrated {
    options;
    server;
    constructor(options = {}) {
        this.options = {
            port: 3000,
            daemon: false,
            dev: false,
            verbose: false,
            ...options,
        };
    }
    static parseArgs(args) {
        const options = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--port' && i + 1 < args.length) {
                const nextArg = args[i + 1];
                if (nextArg !== undefined && options) {
                    options.port = Number.parseInt(nextArg, 10);
                }
                i++;
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
    async initialize() {
        if (this.options.port) {
            await this.startServer();
        }
    }
    async startServer() {
        try {
            const express = await import('express');
            const app = express.default();
            app.get('/health', (_req, res) => {
                res.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-alpha.73',
                });
            });
            app.get('/api/status', (_req, res) => {
                res.json({
                    status: 'running',
                    mode: this.options.dev ? 'development' : 'production',
                    daemon: this.options.daemon,
                    uptime: process.uptime(),
                });
            });
            this.server = app.listen(this.options.port, () => {
                logger.info(`✅ HTTP server started on port ${this.options.port}`);
                logger.info(`🌐 Health check: http://localhost:${this.options.port}/health`);
            });
            this.server.on('error', (err) => {
                logger.error(`❌ Server error:`, err);
                if (err.code === 'EADDRINUSE') {
                    logger.error(`Port ${this.options.port} is already in use`);
                }
                throw err;
            });
        }
        catch (error) {
            logger.error('❌ Failed to start HTTP server:', error);
            throw error;
        }
    }
    async shutdown() {
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
async function main() {
    const args = process.argv.slice(2);
    const options = ClaudeZenIntegrated.parseArgs(args);
    const app = new ClaudeZenIntegrated(options);
    const shutdown = async () => {
        await app.shutdown();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    try {
        await app.initialize();
        if (!options?.daemon) {
        }
        setInterval(() => {
        }, 10000);
    }
    catch (error) {
        logger.error('❌ Failed to start Claude Code Zen Integrated:', error);
        process.exit(1);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
//# sourceMappingURL=claude-zen-integrated.js.map