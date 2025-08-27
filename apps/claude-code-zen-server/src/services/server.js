/**
 * @fileoverview Unified Server Interface for Claude Code Zen
 *
 * This file provides the main server interface that unifies all server implementations
 * across the claude-code-zen platform. It uses the 3-tier architecture with strategic
 * facade pattern to provide a stable interface regardless of underlying implementation.
 *
 * Architecture:
 * - Tier 1: Strategic facades from @claude-zen packages
 * - Unified interface for web API server, coordination server, and database backends
 * - Event-driven coordination with comprehensive type safety
 * - Multi-database support (SQLite, LanceDB, Kuzu graph)
 *
 * @author Claude Code Zen Team
 * @version 2.1.0
 * @since 1.0.0
 */
import { createContainer, EventEmitter, generateUUID, getLogger, safeAsync, withTimeout, } from '@claude-zen/foundation';
const logger = getLogger('server-interface');
/**
 * Default Server Configuration
 */
export const DEFAULT_SERVER_CONFIG = {
    port: 3000,
    host: '0.0.0.0',
    environment: 'development',
    timeout: 30000,
    maxConnections: 1000,
    enableMetrics: true,
    enableEvents: true,
    database: {
        type: 'sqlite',
        path: './data/server.db',
    },
    security: {
        enableCors: true,
        enableHelmet: true,
        rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // requests per window
        },
    },
};
/**
 * Main Server Implementation
 *
 * This implementation uses the strategic facade pattern to delegate to appropriate
 * implementation packages while providing a stable interface. It includes graceful
 * fallbacks and lazy loading of implementation packages.
 */
export class ClaudeZenServerImpl {
    id;
    config;
    serverStatus;
    serverMetrics;
    eventBus;
    serviceContainer;
    lifecycleHooks;
    adapters;
    constructor(config = {}) {
        this.id = generateUUID();
        this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
        this.serverStatus = {
            initialized: false,
            running: false,
            healthy: true,
            connections: 0,
            uptime: 0,
            lastError: null,
        };
        this.serverMetrics = {
            requests: 0,
            errors: 0,
            responseTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
        };
        this.eventBus = new EventEmitter();
        this.serviceContainer = null;
        this.lifecycleHooks = new Map();
        this.adapters = {};
        logger.info('Server instance created', {
            id: this.id,
            config: this.config,
        });
    }
    get status() {
        return { ...this.serverStatus };
    }
    get metrics() {
        return { ...this.serverMetrics };
    }
    initialize() {
        logger.info('Initializing server', { id: this.id });
        return safeAsync(async () => {
            // Execute pre-initialization hooks
            await this.executeLifecycleHooks('initialized');
            // Initialize service container
            Object.assign(this, {
                serviceContainer: await createContainer(`server-${this.id}`),
            });
            // Initialize strategic facades
            await this.initializeStrategicFacades();
            // Initialize adapters
            await this.initializeAdapters();
            // Update status
            this.serverStatus.initialized = true;
            // Emit initialization event
            await this.emit('server:initialized', {
                serverId: this.id,
                timestamp: Date.now(),
            });
            logger.info('Server initialized successfully', { id: this.id });
        });
    }
    async start() {
        if (!this.serverStatus.initialized) {
            const initResult = await this.initialize();
            if (initResult.isErr()) {
                return initResult;
            }
        }
        logger.info('Starting server', { id: this.id, port: this.config.port });
        return safeAsync(async () => {
            // Execute pre-start hooks
            await this.executeLifecycleHooks('running');
            // Start HTTP adapter if available
            if (this.adapters.http) {
                await this.adapters.http.start(this.config);
            }
            // Start WebSocket adapter if available
            if (this.adapters.websocket) {
                await this.adapters.websocket.start(this.config);
            }
            // Start event adapter if available
            if (this.adapters.event) {
                await this.adapters.event.start(this.config);
            }
            // Update status
            this.serverStatus.running = true;
            this.serverStatus.uptime = Date.now();
            // Emit start event
            await this.emit('server:started', {
                serverId: this.id,
                port: this.config.port,
                timestamp: Date.now(),
            });
            logger.info('Server started successfully', {
                id: this.id,
                port: this.config.port,
                host: this.config.host,
            });
        });
    }
    stop() {
        logger.info('Stopping server', { id: this.id });
        return safeAsync(async () => {
            // Execute pre-stop hooks
            await this.executeLifecycleHooks('running');
            // Stop adapters in reverse order
            if (this.adapters.event) {
                await this.adapters.event.stop();
            }
            if (this.adapters.websocket) {
                await this.adapters.websocket.stop();
            }
            if (this.adapters.http) {
                await this.adapters.http.stop();
            }
            // Update status
            this.serverStatus.running = false;
            // Emit stop event
            await this.emit('server:stopped', {
                serverId: this.id,
                timestamp: Date.now(),
            });
            logger.info('Server stopped successfully', { id: this.id });
        });
    }
    async restart() {
        logger.info('Restarting server', { id: this.id });
        const stopResult = await this.stop();
        if (stopResult.isErr()) {
            return stopResult;
        }
        // Wait a brief moment before restarting
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.start();
    }
    shutdown() {
        logger.info('Shutting down server', { id: this.id });
        return safeAsync(async () => {
            // Stop the server first
            const stopResult = await this.stop();
            if (stopResult.isErr()) {
                logger.error('Error during server stop in shutdown', stopResult.unwrapErr());
            }
            // Clean up resources
            if (this.adapters.database) {
                await this.adapters.database.disconnect();
            }
            // Clear service container
            if (this.serviceContainer) {
                this.serviceContainer.clear();
            }
            // Update status
            this.serverStatus.initialized = false;
            this.serverStatus.healthy = false;
            // Emit shutdown event
            await this.emit('server:shutdown', {
                serverId: this.id,
                timestamp: Date.now(),
            });
            logger.info('Server shutdown complete', { id: this.id });
        });
    }
    async getHealth() {
        const healthChecks = [];
        // Check server status
        healthChecks.push({
            name: 'server',
            status: this.serverStatus.running && this.serverStatus.healthy ? 'ok' : 'error',
            message: this.serverStatus.running
                ? 'Server is running'
                : 'Server is not running',
        });
        // Check adapters
        if (this.adapters.http) {
            try {
                const httpHealth = await this.adapters.http.getHealth();
                healthChecks.push({
                    name: 'http',
                    status: httpHealth.healthy ? 'ok' : 'error',
                    message: httpHealth.message,
                });
            }
            catch (error) {
                healthChecks.push({
                    name: 'http',
                    status: 'error',
                    message: `HTTP adapter health check failed: ${error}`,
                });
            }
        }
        if (this.adapters.database) {
            try {
                const dbHealth = await this.adapters.database.getHealth();
                healthChecks.push({
                    name: 'database',
                    status: dbHealth.healthy ? 'ok' : 'error',
                    message: dbHealth.message,
                });
            }
            catch (error) {
                healthChecks.push({
                    name: 'database',
                    status: 'error',
                    message: `Database adapter health check failed: ${error}`,
                });
            }
        }
        const hasErrors = healthChecks.some((check) => check.status === 'error');
        return {
            healthy: !hasErrors,
            timestamp: Date.now(),
            uptime: this.serverStatus.running
                ? Date.now() - this.serverStatus.uptime
                : 0,
            checks: healthChecks,
        };
    }
    getMetrics() {
        // Update memory and CPU usage
        if (typeof process !== 'undefined') {
            const memUsage = process.memoryUsage();
            this.serverMetrics.memoryUsage = memUsage.heapUsed;
            // Simple CPU usage approximation (not accurate, but functional)
            this.serverMetrics.cpuUsage = process.cpuUsage().user / 1000000; // Convert to seconds
        }
        return { ...this.serverMetrics };
    }
    getStatus() {
        return this.status;
    }
    handleRequest(context, handler) {
        const startTime = Date.now();
        this.serverMetrics.requests++;
        return safeAsync(async () => {
            // Add request timeout
            const result = await withTimeout(handler(context), this.config.timeout || 30000);
            // Update metrics
            this.serverMetrics.responseTime = Date.now() - startTime;
            // Emit request handled event
            await this.emit('request:handled', {
                requestId: context.id || generateUUID(),
                path: context.path,
                method: context.method,
                duration: this.serverMetrics.responseTime,
                timestamp: Date.now(),
            });
            return result;
        }).catch(async (error) => {
            // Update error metrics
            this.serverMetrics.errors++;
            this.serverStatus.lastError = error.message;
            // Emit error event
            await this.emit('request:error', {
                requestId: context.id || generateUUID(),
                path: context.path,
                method: context.method,
                error: error.message,
                timestamp: Date.now(),
            });
            throw error;
        });
    }
    on(event, handler) {
        this.eventBus.on(event, handler);
    }
    async emit(event, payload) {
        await this.eventBus.emit(event, payload);
    }
    registerHttpAdapter(adapter) {
        try {
            this.adapters.http = adapter;
            logger.info('HTTP adapter registered', { serverId: this.id });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: error };
        }
    }
    registerWebSocketAdapter(adapter) {
        try {
            this.adapters.websocket = adapter;
            logger.info('WebSocket adapter registered', { serverId: this.id });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: error };
        }
    }
    registerDatabaseAdapter(adapter) {
        try {
            this.adapters.database = adapter;
            logger.info('Database adapter registered', { serverId: this.id });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: error };
        }
    }
    registerEventAdapter(adapter) {
        try {
            this.adapters.event = adapter;
            logger.info('Event adapter registered', { serverId: this.id });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: error };
        }
    }
    addLifecycleHook(phase, hook) {
        const hooks = this.lifecycleHooks.get(phase) || [];
        hooks.push(hook);
        this.lifecycleHooks.set(phase, hooks);
        logger.debug('Lifecycle hook added', { serverId: this.id, phase });
    }
    removeLifecycleHook(phase, hook) {
        const hooks = this.lifecycleHooks.get(phase) || [];
        const index = hooks.indexOf(hook);
        if (index > -1) {
            hooks.splice(index, 1);
            this.lifecycleHooks.set(phase, hooks);
            logger.debug('Lifecycle hook removed', { serverId: this.id, phase });
        }
    }
    // Private methods
    async initializeStrategicFacades() {
        try {
            // Lazy load strategic facades as needed
            const { getDatabaseSystem } = await import('@claude-zen/infrastructure');
            const { getPerformanceTracker } = await import('@claude-zen/operations');
            // Register facades in service container
            this.serviceContainer.register('databaseSystem', () => getDatabaseSystem());
            this.serviceContainer.register('performanceTracker', () => getPerformanceTracker());
            logger.debug('Strategic facades initialized', { serverId: this.id });
        }
        catch (error) {
            logger.warn('Some strategic facades not available, using fallbacks', {
                serverId: this.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async initializeAdapters() {
        // Initialize default adapters if none provided
        if (!this.adapters.database && this.config.database) {
            try {
                // Try to load database adapter
                const { createDatabaseAdapter } = await import('./adapters/database-adapter');
                this.adapters.database = await createDatabaseAdapter(this.config.database);
                logger.debug('Default database adapter initialized', {
                    serverId: this.id,
                });
            }
            catch (error) {
                logger.warn('Database adapter initialization failed', {
                    serverId: this.id,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        if (!this.adapters.event && this.config.enableEvents) {
            try {
                // Try to load event adapter
                const { createEventAdapter } = await import('./adapters/event-adapter');
                this.adapters.event = await createEventAdapter(this.config);
                logger.debug('Default event adapter initialized', {
                    serverId: this.id,
                });
            }
            catch (error) {
                logger.warn('Event adapter initialization failed', {
                    serverId: this.id,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    async executeLifecycleHooks(phase) {
        const hooks = this.lifecycleHooks.get(phase);
        if (hooks) {
            for (const hook of hooks) {
                try {
                    await hook(this);
                }
                catch (error) {
                    logger.error('Lifecycle hook execution failed', {
                        serverId: this.id,
                        phase,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        }
    }
}
/**
 * Server Factory Implementation
 */
export class ClaudeZenServerFactory {
    async createWebApiServer(config = {}) {
        const webApiConfig = {
            ...config,
            port: config.port || 3000,
            environment: 'production',
            enableMetrics: true,
            enableEvents: true,
            security: {
                enableCors: true,
                enableHelmet: true,
                rateLimiting: {
                    windowMs: 15 * 60 * 1000,
                    max: 100,
                },
            },
        };
        const server = new ClaudeZenServerImpl(webApiConfig);
        // Register web-specific adapters
        try {
            const { createHttpAdapter } = await import('./adapters/http-adapter');
            const { createWebSocketAdapter } = await import('./adapters/websocket-adapter');
            await server.registerHttpAdapter(await createHttpAdapter(webApiConfig));
            await server.registerWebSocketAdapter(await createWebSocketAdapter(webApiConfig));
        }
        catch (error) {
            logger.warn('Some web adapters not available', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return server;
    }
    async createCoordinationServer(config = {}) {
        const coordinationConfig = {
            ...config,
            port: config.port || 3001,
            environment: 'development',
            enableMetrics: true,
            enableEvents: true,
            database: {
                type: 'sqlite',
                path: './data/coordination.db',
            },
        };
        const server = new ClaudeZenServerImpl(coordinationConfig);
        // Register coordination-specific adapters
        try {
            const { createEventAdapter } = await import('./adapters/event-adapter');
            await server.registerEventAdapter(await createEventAdapter(coordinationConfig));
        }
        catch (error) {
            logger.warn('Event adapter not available for coordination server', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return server;
    }
    createDevelopmentServer(config = {}) {
        const devConfig = {
            ...config,
            port: config.port || 3002,
            host: '127.0.0.1',
            environment: 'development',
            enableMetrics: false,
            timeout: 60000, // Longer timeout for development
        };
        return new ClaudeZenServerImpl(devConfig);
    }
    async createProductionServer(config = {}) {
        const prodConfig = {
            ...config,
            environment: 'production',
            enableMetrics: true,
            enableEvents: true,
            security: {
                enableCors: false, // Disable CORS for production
                enableHelmet: true,
                rateLimiting: {
                    windowMs: 5 * 60 * 1000, // Stricter rate limiting
                    max: 50,
                },
            },
        };
        const server = new ClaudeZenServerImpl(prodConfig);
        // Register all production adapters
        try {
            const { createHttpAdapter } = await import('./adapters/http-adapter');
            const { createDatabaseAdapter } = await import('./adapters/database-adapter');
            const { createEventAdapter } = await import('./adapters/event-adapter');
            await Promise.all([
                server.registerHttpAdapter(await createHttpAdapter(prodConfig)),
                server.registerDatabaseAdapter(await createDatabaseAdapter(prodConfig.database)),
                server.registerEventAdapter(await createEventAdapter(prodConfig)),
            ]);
        }
        catch (error) {
            logger.warn('Some production adapters not available', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return server;
    }
}
// Default factory instance
export const serverFactory = new ClaudeZenServerFactory();
// Convenience factory functions
export function createWebApiServer(config) {
    return serverFactory.createWebApiServer(config);
}
export function createCoordinationServer(config) {
    return serverFactory.createCoordinationServer(config);
}
export function createDevelopmentServer(config) {
    return serverFactory.createDevelopmentServer(config);
}
export function createProductionServer(config) {
    return serverFactory.createProductionServer(config);
}
// Legacy compatibility exports
export { ClaudeZenServerImpl as UnifiedClaudeZenServer };
export { ClaudeZenServerFactory as ServerFactory };
