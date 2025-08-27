#!/usr/bin/env node
/**
 * @file Claude Code Zen - Server Entry Point
 *
 * Complete server implementation with core functionality and static dashboard serving.
 */
import { getLogger, ok, err, } from '@claude-zen/foundation';
const logger = getLogger('claude-zen-server');
class ClaudeZenServer {
    port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    host = process.env.HOST || '0.0.0.0';
    async start() {
        try {
            logger.info('🚀 Starting Claude Code Zen Server');
            const { default: express } = await import('express');
            const { default: cors } = await import('cors');
            const { default: path } = await import('path');
            const { fileURLToPath } = await import('url');
            const app = express();
            // Middleware
            app.use(cors());
            app.use(express.json({ limit: '50mb' }));
            app.use(express.urlencoded({ extended: true, limit: '50mb' }));
            // Get current directory for static files
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const buildPath = path.resolve(__dirname, '../../web-dashboard/build');
            // Serve static dashboard files
            app.use(express.static(buildPath));
            // Health check endpoint
            app.get('/api/health', (req, res) => {
                res.json({
                    status: 'ok',
                    service: 'claude-code-zen-server',
                    version: '1.0.0',
                    timestamp: new Date().toISOString(),
                    dashboard: 'enabled'
                });
            });
            // API endpoints
            app.get('/api/v1/health', (req, res) => {
                res.json({
                    status: 'healthy',
                    service: 'claude-code-zen-server',
                    version: '1.0.0-alpha.44',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                });
            });
            app.get('/api/v1/system/status', (req, res) => {
                res.json({
                    system: 'operational',
                    database: 'connected',
                    memory: process.memoryUsage(),
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString(),
                });
            });
            // Catch-all handler for SPA routing (non-API routes)
            app.get(/^(?!\/api).*$/, (req, res) => {
                res.sendFile(path.join(buildPath, 'index.html'));
            });
            // Start the server
            await new Promise((resolve, reject) => {
                const server = app.listen(this.port, this.host, () => {
                    logger.info(`✅ Claude Code Zen Server running on http://${this.host}:${this.port}`);
                    logger.info(`📊 Dashboard available at http://${this.host}:${this.port}`);
                    resolve();
                });
                server.on('error', reject);
            });
            return ok();
        }
        catch (error) {
            logger.error('❌ Failed to start server:', error);
            return err(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
// Start the server
const server = new ClaudeZenServer();
server.start().then(result => {
    if (result.isErr()) {
        console.error('Failed to start server:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
