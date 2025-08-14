import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-api-http-server');
import cors from 'cors';
import { randomBytes } from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { getCORSOrigins } from '../../../config/defaults.ts';
let compression = null;
let OpenApiValidator = null;
let swaggerJsdoc = null;
let swaggerUi = null;
try {
    compression = require('compression');
}
catch (_e) {
    logger.warn('compression package not available - performance middleware disabled');
}
try {
    ({ OpenApiValidator } = require('express-openapi-validator'));
}
catch (_e) {
    logger.warn('express-openapi-validator package not available - request validation disabled');
}
try {
    swaggerJsdoc = require('swagger-jsdoc');
    swaggerUi = require('swagger-ui-express');
}
catch (_e) {
    logger.warn('swagger packages not available - API documentation disabled');
}
import { config as getConfig } from '../../../config/index.js';
import { authMiddleware } from './middleware/auth.ts';
import { errorHandler } from './middleware/errors.ts';
import { requestLogger } from './middleware/logging.ts';
import { createCoordinationRoutes } from './v1/coordination.ts';
import { createDatabaseRoutes } from './v1/database.ts';
import { createMemoryRoutes } from './v1/memory.ts';
import { createNeuralRoutes } from './v1/neural.ts';
export const DEFAULT_API_CONFIG = (() => {
    const centralConfig = getConfig().getAll();
    return {
        port: centralConfig?.interfaces?.web?.port,
        host: centralConfig?.interfaces?.web?.host,
        environment: centralConfig?.environment?.isProduction
            ? 'production'
            : centralConfig?.environment?.isDevelopment
                ? 'development'
                : 'test',
        enableSwagger: centralConfig?.environment?.enableDebugEndpoints,
        enableValidation: centralConfig?.environment?.strictValidation,
        enableRateLimit: true,
        rateLimitWindowMs: 15 * 60 * 1000,
        rateLimitMaxRequests: 100,
        corsOrigins: centralConfig?.interfaces?.web?.corsOrigins,
    };
})();
const swaggerOptions = (() => {
    const centralConfig = getConfig().getAll();
    return {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Claude Code Flow API',
                version: '1.0.0',
                description: 'Unified API for coordination, neural networks, memory, and database operations',
                contact: {
                    name: 'Claude Code Flow Team',
                    url: 'https://github.com/claude-zen-flow',
                },
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT',
                },
            },
            servers: [
                {
                    url: 'http://localhost:3456',
                    description: 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                    ApiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-API-Key',
                    },
                },
            },
            security: [
                {
                    BearerAuth: [],
                },
                {
                    ApiKeyAuth: [],
                },
            ],
        },
        apis: [
            './src/coordination/api.ts',
            './src/neural/api.ts',
            './src/interfaces/api/http/v1/*.ts',
            './src/interfaces/api/http/schemas/*.ts',
        ],
    };
})();
export class APIServer {
    app;
    config;
    server;
    constructor(config = {}) {
        this.config = {
            ...DEFAULT_API_CONFIG,
            ...config,
            corsOrigins: config?.corsOrigins || getCORSOrigins(),
        };
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.app.use((_req, res, next) => {
            res.locals['nonce'] = randomBytes(16).toString('hex');
            next();
        });
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                },
            },
        }));
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        }));
        if (compression) {
            this.app.use(compression());
        }
        if (this.config.enableRateLimit) {
            const limiter = rateLimit({
                windowMs: this.config.rateLimitWindowMs,
                max: this.config.rateLimitMaxRequests,
                message: {
                    error: 'Too many requests',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil(this.config.rateLimitWindowMs / 1000),
                },
                standardHeaders: true,
                legacyHeaders: false,
            });
            this.app.use('/api/', limiter);
        }
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(requestLogger);
        this.app.use('/api/v1/', authMiddleware);
    }
    setupRoutes() {
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                uptime: process.uptime(),
                environment: this.config.environment,
            });
        });
        this.app.get('/api', (_req, res) => {
            res.json({
                name: 'Claude Code Flow API',
                version: '1.0.0',
                documentation: '/docs',
                endpoints: {
                    coordination: '/api/v1/coordination',
                    neural: '/api/v1/neural',
                    memory: '/api/v1/memory',
                    database: '/api/v1/database',
                    health: '/api/v1/health',
                },
            });
        });
        if (this.config.enableSwagger && swaggerJsdoc && swaggerUi) {
            const specs = swaggerJsdoc(swaggerOptions);
            this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
                explorer: true,
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'Claude Code Flow API Documentation',
                swaggerOptions: {
                    requestInterceptor: (req) => {
                        req.headers['X-Content-Security-Policy-Nonce'] = document
                            .querySelector('meta[name="csp-nonce"]')
                            ?.getAttribute('content');
                        return req;
                    },
                },
            }));
            this.app.get('/openapi.json', (_req, res) => {
                res.json(specs);
            });
        }
        if (this.config.enableValidation && OpenApiValidator && swaggerJsdoc) {
            const validator = new OpenApiValidator({
                apiSpec: swaggerJsdoc(swaggerOptions),
                validateRequests: true,
                validateResponses: false,
                ignorePaths: /.*\/docs.*/,
            });
            this.app.use(validator.middleware());
        }
        this.setupCoordinationRoutes();
        this.setupNeuralRoutes();
        this.setupMemoryRoutes();
        this.setupDatabaseRoutes();
        this.setupSystemRoutes();
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                code: 'ENDPOINT_NOT_FOUND',
                message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
                availableEndpoints: '/api',
            });
        });
    }
    setupCoordinationRoutes() {
        this.app.use('/api/v1/coordination', createCoordinationRoutes());
    }
    setupNeuralRoutes() {
        this.app.use('/api/v1/neural', createNeuralRoutes());
    }
    setupMemoryRoutes() {
        this.app.use('/api/v1/memory', createMemoryRoutes());
    }
    setupDatabaseRoutes() {
        this.app.use('/api/v1/database', createDatabaseRoutes());
    }
    setupSystemRoutes() {
        const router = express.Router();
        router.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    coordination: 'healthy',
                    neural: 'healthy',
                    memory: 'not_implemented',
                    database: 'not_implemented',
                },
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0',
            });
        });
        router.get('/metrics', (_req, res) => {
            res.json({
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                version: process.version,
                platform: process.platform,
                architecture: process.arch,
            });
        });
        this.app.use('/api/v1/system', router);
    }
    setupErrorHandling() {
        this.app.use(errorHandler);
    }
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.port, this.config.host, () => {
                    resolve();
                });
                this.server.on('error', (error) => {
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    getApp() {
        return this.app;
    }
    getConfig() {
        return { ...this.config };
    }
}
export const createAPIServer = async (config) => {
    const server = new APIServer(config);
    await server.start();
    return server;
};
if (require.main === module) {
    const server = new APIServer();
    const shutdown = async (_signal) => {
        try {
            await server.stop();
            process.exit(0);
        }
        catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    server.start().catch((error) => {
        logger.error('Failed to start API server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map