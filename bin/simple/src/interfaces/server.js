import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import { config } from '../config/index.js';
import { createAppLogger, createExpressErrorLoggingMiddleware, createExpressLoggingMiddleware, initializeLogging, logServerEvent, } from '../utils/logging-config.js';
const logger = createAppLogger();
export class UnifiedClaudeZenServer {
    app;
    server = null;
    io;
    config;
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.config = this.buildServerConfig();
    }
    buildServerConfig() {
        const systemConfig = config.getAll();
        const defaultConfig = {
            port: 3000,
            host: 'localhost',
            features: {
                mcp: true,
                api: true,
                dashboard: true,
                monitoring: true,
                websocket: true,
            },
            middleware: {
                logging: true,
                helmet: true,
                compression: true,
                cors: true,
                rateLimit: true,
            },
        };
        if (!systemConfig) {
            return defaultConfig;
        }
        return {
            port: systemConfig.interfaces?.web?.port ||
                systemConfig.interfaces?.mcp?.http?.port ||
                defaultConfig.port,
            host: systemConfig.interfaces?.web?.host ||
                systemConfig.interfaces?.mcp?.http?.host ||
                defaultConfig.host,
            features: {
                mcp: true,
                api: true,
                dashboard: true,
                monitoring: systemConfig.core?.performance?.enableMetrics !== false,
                websocket: true,
            },
            middleware: {
                logging: systemConfig.core?.logger?.console !== false,
                helmet: systemConfig.core?.security?.enableSandbox !== false,
                compression: systemConfig.interfaces?.web?.enableCompression !== false,
                cors: systemConfig.interfaces?.mcp?.http?.enableCors !== false,
                rateLimit: !systemConfig.environment?.allowUnsafeOperations,
            },
        };
    }
    async initialize() {
        if (this.config.middleware.logging) {
            await initializeLogging();
            logServerEvent(logger, 'initializing', {
                port: this.config.port,
                features: this.config.features,
            });
        }
        if (this.config.middleware.helmet) {
            this.app.use(helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'", "'unsafe-inline'"],
                        imgSrc: ["'self'", 'data:', 'https:'],
                    },
                },
            }));
        }
        if (this.config.middleware.compression) {
            this.app.use(compression());
        }
        if (this.config.middleware.cors) {
            this.app.use(cors({
                origin: this.getAllowedOrigins(),
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
            }));
        }
        if (this.config.middleware.rateLimit) {
            this.app.use(rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 1000,
                message: 'Too many requests from this IP',
                standardHeaders: true,
                legacyHeaders: false,
            }));
        }
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        if (this.config.middleware.logging) {
            this.app.use(createExpressLoggingMiddleware());
        }
        const staticPath = path.join(process.cwd(), 'public');
        this.app.use('/static', express.static(staticPath));
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                server: 'unified-claude-zen-server',
                features: this.config.features,
                uptime: process.uptime(),
            });
        });
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Claude-Zen Unified Server',
                version: '1.0.0',
                description: 'Consolidated Express server for all Claude-Zen services',
                endpoints: {
                    health: '/health',
                    ...(this.config.features.mcp && { mcp: '/mcp' }),
                    ...(this.config.features.api && { api: '/api/v1' }),
                    ...(this.config.features.dashboard && { dashboard: '/dashboard' }),
                    ...(this.config.features.monitoring && { monitoring: '/monitoring' }),
                },
                features: this.config.features,
            });
        });
        await this.setupRoutes();
        if (this.config.features.websocket && this.io) {
            this.setupWebSocket();
        }
        if (this.config.middleware.logging) {
            this.app.use(createExpressErrorLoggingMiddleware());
        }
        this.app.use((err, req, res, next) => {
            logger.error('Unhandled server error', {
                error: err.message,
                stack: err.stack,
                url: req.url,
                method: req.method,
            });
            res.status(err.status || 500).json({
                error: 'Internal server error',
                message: process.env['NODE_ENV'] === 'production'
                    ? 'Something went wrong'
                    : err.message,
                timestamp: new Date().toISOString(),
            });
        });
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not found',
                message: `Route ${req.originalUrl} not found`,
                availableEndpoints: Object.keys(this.config.features).filter((f) => this.config.features[f]),
            });
        });
    }
    async setupRoutes() {
        if (this.config.features.mcp) {
            this.app.use('/mcp', (req, res, next) => {
                res.json({
                    service: 'MCP Protocol',
                    status: 'active',
                    message: 'MCP routes will be migrated here from http-mcp-server.ts',
                });
            });
        }
        if (this.config.features.api) {
            this.app.use('/api/v1', (req, res, next) => {
                res.json({
                    service: 'REST API',
                    status: 'active',
                    message: 'API routes will be migrated here from api/http/server.ts',
                });
            });
        }
        if (this.config.features.dashboard) {
            this.app.use('/dashboard', (req, res, next) => {
                res.json({
                    service: 'Web Dashboard',
                    status: 'active',
                    message: 'Dashboard routes will be migrated here from web-interface-server.ts',
                });
            });
        }
        if (this.config.features.monitoring) {
            this.app.use('/monitoring', (req, res, next) => {
                res.json({
                    service: 'Monitoring Dashboard',
                    status: 'active',
                    message: 'Monitoring routes will be migrated here from dashboard-server.ts',
                });
            });
        }
    }
    setupWebSocket() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            logger.info('WebSocket client connected', {
                socketId: socket.id,
                clientIP: socket.handshake.address,
            });
            socket.on('join-service', (service) => {
                socket.join(`service:${service}`);
                logger.debug('Client joined service namespace', {
                    socketId: socket.id,
                    service,
                });
            });
            socket.on('disconnect', (reason) => {
                logger.info('WebSocket client disconnected', {
                    socketId: socket.id,
                    reason,
                });
            });
        });
    }
    getAllowedOrigins() {
        return [
            'http://localhost:3000',
            'http://localhost:3456',
            'http://127.0.0.1:3000',
            'https://claude.ai',
        ];
    }
    async start() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, () => {
                logServerEvent(logger, 'started', {
                    port: this.config.port,
                    host: this.config.host,
                    features: this.config.features,
                    pid: process.pid,
                });
                console.log(`🚀 Unified Claude-Zen Server started:`);
                console.log(`   📍 Address: http://${this.config.host}:${this.config.port}`);
                console.log(`   🔧 Features: ${Object.keys(this.config.features)
                    .filter((f) => this.config.features[f])
                    .join(', ')}`);
                console.log(`   💡 Health: http://${this.config.host}:${this.config.port}/health`);
                resolve();
            }).on('error', (err) => {
                logger.error('Server failed to start', {
                    error: err.message,
                    stack: err.stack,
                });
                reject(err);
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            logServerEvent(logger, 'stopping', { port: this.config.port });
            this.server.close(() => {
                logServerEvent(logger, 'stopped', { port: this.config.port });
                console.log('🛑 Unified Claude-Zen Server stopped');
                resolve();
            });
        });
    }
    getApp() {
        return this.app;
    }
    getServer() {
        return this.server;
    }
    getSocketIO() {
        return this.io;
    }
}
export const unifiedServer = new UnifiedClaudeZenServer();
export { UnifiedClaudeZenServer as HTTPMCPServer };
export { UnifiedClaudeZenServer as WebInterfaceServer };
export { UnifiedClaudeZenServer as APIServer };
export { UnifiedClaudeZenServer as DashboardServer };
export default UnifiedClaudeZenServer;
//# sourceMappingURL=server.js.map